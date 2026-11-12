// Mitingu leads service
//
// Receives demo requests from www.mitingu.com/personality, stores them in
// Postgres, emails the visitor a confirmation and Greg a notification (both via
// SendGrid), and serves a password-protected admin area at /admin.
//
// Environment variables
//   DATABASE_URL       Postgres connection string (required)
//   SENDGRID_API_KEY   SendGrid API key with "Mail Send" permission
//   ADMIN_EMAILS       Who can sign in to /admin, comma-separated
//                      (default: greg@mitingu.com,greg.wood@mitingu.com).
//                      Sign-in is by a 6-digit code emailed to that address.
//   SESSION_SECRET     Optional extra secret for hashing sign-in codes
//   FROM_EMAIL         Sender address (default: greg.wood@mitingu.com)
//   FROM_NAME          Sender name (default: Greg Wood, Mitingu)
//   NOTIFY_EMAIL       Where new-lead notifications go (default: greg@mitingu.com)
//   ALLOWED_ORIGINS    Comma-separated sites allowed to post (default: www.mitingu.com)
//   DATABASE_SSL       "true" to force SSL to Postgres (external connections)
//   ADMIN_HOST         Public host for the admin area, e.g. leads.mitingu.com. When set,
//                      admin pages on any other host redirect there.

import http from "node:http";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import pg from "pg";

const env = process.env;
const PORT = Number(env.PORT || 10000);
const ADMIN_EMAILS = (env.ADMIN_EMAILS || "greg@mitingu.com,greg.wood@mitingu.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const CODE_MINUTES = 10;
const CODE_ATTEMPTS = 5;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const FROM_EMAIL = env.FROM_EMAIL || "greg.wood@mitingu.com";
const FROM_NAME = env.FROM_NAME || "Greg Wood, Mitingu";
const NOTIFY_EMAIL = env.NOTIFY_EMAIL || "greg@mitingu.com";
const ADMIN_HOST = (env.ADMIN_HOST || "").trim().toLowerCase();
const ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS || "https://www.mitingu.com,https://mitingu.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const STATUSES = ["New", "Building demo", "Demo sent", "Follow-up booked", "Won", "Not now"];
export const EVENT_TYPES = [
  "Client dinner or reception",
  "Conference or summit",
  "Briefing or seminar",
  "Webinar or hybrid event",
  "Awards or gala",
  "Something else",
];
const EVENT_PHRASE = {
  "Client dinner or reception": "a sample client dinner",
  "Conference or summit": "a sample conference",
  "Briefing or seminar": "a sample briefing",
  "Webinar or hybrid event": "a sample webinar",
  "Awards or gala": "a sample awards evening",
  "Something else": "a sample event",
};

// ---------- Database ----------

const ssl =
  env.DATABASE_SSL === "true" || /\.render\.com/.test(env.DATABASE_URL || "")
    ? { rejectUnauthorized: false }
    : false;
const pool = new pg.Pool({ connectionString: env.DATABASE_URL, ssl, max: 5 });

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      organisation TEXT NOT NULL,
      website TEXT NOT NULL,
      event_type TEXT,
      event TEXT,
      notes TEXT,
      personality TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'New',
      internal_note TEXT,
      confirmation_sent_at TIMESTAMPTZ,
      confirmation_error TEXT,
      notified_at TIMESTAMPTZ,
      notify_error TEXT
    );
    CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
    CREATE TABLE IF NOT EXISTS admin_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      used_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS admin_codes_email_idx ON admin_codes (email, created_at DESC);
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
}

// ---------- Helpers ----------

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const firstName = (name) => String(name).trim().split(/\s+/)[0] || "there";

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    ...headers,
  });
  res.end(body);
}

function sendJson(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), { "Content-Type": "application/json; charset=utf-8", ...headers });
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error("Body too large"), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseBody(raw, contentType = "") {
  if (contentType.includes("application/json")) return JSON.parse(raw || "{}");
  return Object.fromEntries(new URLSearchParams(raw));
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
}

// Simple in-memory rate limit: 8 requests per IP per hour.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

// ---------- Validation ----------

export function validateLead(input) {
  const clean = (v, max) => String(v ?? "").trim().slice(0, max);
  const lead = {
    name: clean(input.name, 200),
    email: clean(input.email, 254),
    organisation: clean(input.organisation, 200),
    website: clean(input.website, 300),
    event_type: clean(input.event_type, 60),
    event: clean(input.event, 200),
    notes: clean(input.notes, 4000),
    personality: clean(input.personality, 60),
    source: clean(input.source, 200) || "personality",
  };
  if (!lead.name || !lead.email || !lead.organisation || !lead.website) {
    return { error: "Please add your name, work email, organisation and website so we can build your demo." };
  }
  if (!/^[^\s]+\.[^\s]{2,}$/.test(lead.website)) {
    return { error: "Please check your website address, for example yourcompany.co.uk." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { error: "That email address doesn't look quite right. Please check it." };
  }
  if (!EVENT_TYPES.includes(lead.event_type)) lead.event_type = "Something else";
  return { lead };
}

// ---------- Email ----------

export function confirmationEmail(lead) {
  const first = firstName(lead.name);
  const sample = EVENT_PHRASE[lead.event_type] || "a sample event";
  const personality = lead.personality ? lead.personality : "";
  const text = [
    `Hi ${first},`,
    "",
    `Thanks for asking for a demo event site. We'll build it in ${lead.organisation}'s branding, with ${sample} already set up, and email you the link shortly.`,
    "",
    "You'll be able to click through it the way your guests and your team would. There's nothing to install and no obligation.",
    ...(personality ? ["", `Your registration personality, for the record: ${personality}.`] : []),
    "",
    "If there's anything we should know before we build it, just reply to this email.",
    "",
    "Greg Wood",
    "Mitingu",
    "https://www.mitingu.com",
  ].join("\n");
  const html = `<!doctype html><html lang="en-GB"><body style="margin:0;padding:24px;background:#f5f7f2;font-family:Arial,Helvetica,sans-serif;color:#151716">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;line-height:1.6;font-size:16px">
<img src="https://www.mitingu.com/assets/email-logo.png" width="120" height="37" alt="Mitingu" style="display:block;border:0;outline:none;width:120px;height:auto;margin:0 0 28px;font-size:20px;font-weight:bold;color:#151716">
<p style="margin:0 0 16px">Hi ${esc(first)},</p>
<p style="margin:0 0 16px">Thanks for asking for a demo event site. We'll build it in ${esc(lead.organisation)}'s branding, with ${esc(sample)} already set up, and email you the link shortly.</p>
<p style="margin:0 0 16px">You'll be able to click through it the way your guests and your team would. There's nothing to install and no obligation.</p>
${personality ? `<p style="margin:0 0 16px">Your registration personality, for the record: <strong>${esc(personality)}</strong>.</p>` : ""}
<p style="margin:0 0 24px">If there's anything we should know before we build it, just reply to this email.</p>
<p style="margin:0">Greg Wood<br>Mitingu<br><a href="https://www.mitingu.com" style="color:#087b83">www.mitingu.com</a></p>
</div></body></html>`;
  return { subject: "Your Mitingu demo site is on its way", text, html };
}

export function notificationEmail(lead, adminUrl) {
  const rows = [
    ["Name", lead.name],
    ["Work email", lead.email],
    ["Organisation", lead.organisation],
    ["Website", lead.website],
    ["Event type", lead.event_type],
    ["Event name or date", lead.event],
    ["Anything we should know?", lead.notes],
    ["Personality", lead.personality],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n") + `\n\nAll leads: ${adminUrl}`;
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#151716">
<table style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5d6562;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v || "-")}</td></tr>`,
    )
    .join("")}</table>
<p><a href="${esc(adminUrl)}">Open all leads</a></p></body></html>`;
  return {
    subject: `Demo site request: ${lead.organisation} (${(lead.personality || "no type").replace(/^The /, "")})`,
    text,
    html,
  };
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!env.SENDGRID_API_KEY) throw new Error("SendGrid isn't set up yet (no SENDGRID_API_KEY)");
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      reply_to: { email: replyTo || FROM_EMAIL },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
      tracking_settings: { click_tracking: { enable: false }, open_tracking: { enable: false } },
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`SendGrid ${response.status}: ${detail.slice(0, 300)}`);
  }
}

async function sendConfirmation(lead) {
  try {
    await sendEmail({ to: lead.email, replyTo: FROM_EMAIL, ...confirmationEmail(lead) });
    await pool.query("UPDATE leads SET confirmation_sent_at = now(), confirmation_error = NULL WHERE id = $1", [lead.id]);
    return true;
  } catch (e) {
    console.error(`Confirmation email failed for lead ${lead.id}: ${e.message}`);
    await pool.query("UPDATE leads SET confirmation_error = $2 WHERE id = $1", [lead.id, e.message.slice(0, 500)]);
    return false;
  }
}

async function sendNotification(lead, adminUrl) {
  try {
    await sendEmail({ to: NOTIFY_EMAIL, replyTo: lead.email, ...notificationEmail(lead, adminUrl) });
    await pool.query("UPDATE leads SET notified_at = now(), notify_error = NULL WHERE id = $1", [lead.id]);
  } catch (e) {
    console.error(`Notification email failed for lead ${lead.id}: ${e.message}`);
    await pool.query("UPDATE leads SET notify_error = $2 WHERE id = $1", [lead.id, e.message.slice(0, 500)]);
  }
}

// ---------- Public API ----------

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
  }
  return { Vary: "Origin" };
}

async function handleDemoRequest(req, res) {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return send(res, 204, "", cors);
  if (req.method !== "POST") return sendJson(res, 405, { success: false, message: "Method not allowed" }, cors);
  if (req.headers.origin && !ALLOWED_ORIGINS.includes(req.headers.origin)) {
    return sendJson(res, 403, { success: false, message: "Not allowed" }, cors);
  }
  if (rateLimited(clientIp(req))) {
    return sendJson(res, 429, { success: false, message: "Too many requests. Please try again in a little while." }, cors);
  }
  let input;
  try {
    input = parseBody(await readBody(req), req.headers["content-type"]);
  } catch (e) {
    return sendJson(res, e.status || 400, { success: false, message: "We couldn't read that request." }, cors);
  }
  // Honeypot: real people never tick this hidden box. Pretend it worked.
  if (input.botcheck) return sendJson(res, 200, { success: true }, cors);

  const { lead, error } = validateLead(input);
  if (error) return sendJson(res, 400, { success: false, message: error }, cors);

  const { rows } = await pool.query(
    `INSERT INTO leads (name, email, organisation, website, event_type, event, notes, personality, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [lead.name, lead.email, lead.organisation, lead.website, lead.event_type, lead.event, lead.notes, lead.personality, lead.source],
  );
  const saved = rows[0];
  const adminUrl = `https://${ADMIN_HOST || req.headers.host}/admin`;
  // Respond as soon as the lead is safely stored; emails follow.
  sendJson(res, 200, { success: true, id: saved.id }, cors);
  await Promise.all([sendConfirmation(saved), sendNotification(saved, adminUrl)]);
}

// ---------- Admin ----------

const sha = (s) => createHash("sha256").update(String(s)).digest();
const tokenHash = (t) => createHash("sha256").update(String(t)).digest("hex");
const codeHash = (email, code) =>
  createHmac("sha256", env.SESSION_SECRET || env.SENDGRID_API_KEY || "mitingu-leads")
    .update(`${email}:${code}`)
    .digest("hex");

const SESSION_COOKIE = "mitingu_admin";
const PENDING_COOKIE = "mitingu_admin_pending";

function cookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]),
  );
}

function cookie(name, value, { maxAge, path = "/admin" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, "HttpOnly", "SameSite=Lax"];
  if (env.NODE_ENV !== "test") parts.push("Secure");
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

async function currentSession(req) {
  const token = cookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const { rows } = await pool.query("SELECT email FROM admin_sessions WHERE token_hash = $1 AND expires_at > now()", [tokenHash(token)]);
  return rows[0] || null;
}

// Sign-in attempts: at most 5 code emails per address and 10 per network address an hour.
const codeRequests = new Map();
function tooManyCodes(key, limit) {
  const now = Date.now();
  const recent = (codeRequests.get(key) || []).filter((t) => now - t < 3600_000);
  recent.push(now);
  codeRequests.set(key, recent);
  if (codeRequests.size > 5000) codeRequests.clear();
  return recent.length > limit;
}

function signInEmail(code) {
  const text = [
    `Your sign-in code for Mitingu leads is ${code}.`,
    "",
    `It works once and expires in ${CODE_MINUTES} minutes.`,
    "",
    "If you didn't try to sign in, you can ignore this email: nobody can get in without the code.",
  ].join("\n");
  const html = `<!doctype html><html lang="en-GB"><body style="margin:0;padding:24px;background:#f5f7f2;font-family:Arial,Helvetica,sans-serif;color:#151716">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;line-height:1.6;font-size:16px">
<img src="https://www.mitingu.com/assets/email-logo.png" width="120" height="37" alt="Mitingu" style="display:block;border:0;width:120px;height:auto;margin:0 0 24px;font-weight:bold">
<p style="margin:0 0 12px">Your sign-in code for Mitingu leads is:</p>
<p style="margin:0 0 20px;font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p>
<p style="margin:0 0 12px">It works once and expires in ${CODE_MINUTES} minutes.</p>
<p style="margin:0;color:#5d6562;font-size:14px">If you didn't try to sign in, you can ignore this email: nobody can get in without the code.</p>
</div></body></html>`;
  return { subject: `${code} is your Mitingu leads sign-in code`, text, html };
}

function sameOrigin(req) {
  const host = req.headers.host;
  const origin = req.headers.origin || req.headers.referer || "";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const adminHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src https://www.mitingu.com; form-action 'self'; frame-ancestors 'none'",
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

function websiteLink(site) {
  const href = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  return `<a href="${esc(href)}" rel="noopener noreferrer" target="_blank">${esc(site)}</a>`;
}

function adminPage(leads, counts, filter, flash, signedInAs) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [["All", total], ...STATUSES.map((s) => [s, counts[s] || 0])]
    .map(([label, n]) => {
      const href = label === "All" ? "/admin" : `/admin?status=${encodeURIComponent(label)}`;
      const on = (label === "All" && !filter) || label === filter;
      return `<a class="tab${on ? " on" : ""}" href="${href}"${on ? ' aria-current="page"' : ""}>${esc(label)}<span>${n}</span></a>`;
    })
    .join("");
  const statusClass = (s) => `s-${String(s).toLowerCase().replace(/[^a-z]+/g, "-")}`;
  const shortDate = (d) =>
    new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const rows = leads.length
    ? leads
        .map((l) => {
          const conf = l.confirmation_sent_at
            ? `<span class="ok">Confirmation sent ${esc(fmtDate(l.confirmation_sent_at))}</span>`
            : `<span class="warn">Confirmation not sent${l.confirmation_error ? ` (${esc(l.confirmation_error)})` : ""}</span>`;
          const meta = [(l.personality || "").replace(/^The /, ""), l.event_type, shortDate(l.created_at)].filter(Boolean).join(" · ");
          return `<details class="row">
  <summary data-meta="${esc(meta)}">
    <span class="c-who"><strong>${esc(l.organisation)}</strong><span>${esc(l.name)}</span></span>
    <span class="c-type">${esc((l.personality || "-").replace(/^The /, ""))}</span>
    <span class="c-event">${esc(l.event_type || "-")}</span>
    <span class="c-date">${esc(shortDate(l.created_at))}</span>
    <span class="c-status"><span class="pill ${statusClass(l.status)}">${esc(l.status)}</span></span>
    <span class="chev" aria-hidden="true"></span>
  </summary>
  <div class="detail">
    <div class="facts">
      <dl>
        <dt>Email</dt><dd><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></dd>
        <dt>Website</dt><dd>${websiteLink(l.website)}</dd>
        <dt>Event name or date</dt><dd>${esc(l.event || "-")}</dd>
        <dt>Received</dt><dd>${esc(fmtDate(l.created_at))}</dd>
        ${l.notes ? `<dt>Their notes</dt><dd>${esc(l.notes)}</dd>` : ""}
      </dl>
      <div class="mail">${conf}
        <form method="post" action="/admin/leads/${l.id}/resend"><button type="submit" class="link">${l.confirmation_sent_at ? "Resend" : "Send"}</button></form>
      </div>
    </div>
    <form method="post" action="/admin/leads/${l.id}" class="follow">
      <label>Status
        <select name="status">${STATUSES.map((s) => `<option${s === l.status ? " selected" : ""}>${esc(s)}</option>`).join("")}</select>
      </label>
      <label>Internal note
        <textarea name="internal_note" rows="3" maxlength="2000" placeholder="e.g. Demo link sent 12 Nov">${esc(l.internal_note || "")}</textarea>
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
</details>`;
        })
        .join("")
    : `<p class="empty">No demo requests${filter ? ` marked "${esc(filter)}"` : " yet"}.</p>`;

  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Demo requests | Mitingu leads</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f5f7f2;color:#151716;font:15px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:#087b83}
.bar{background:#fff;border-bottom:1px solid #e3e8e5}
.bar-in,.wrap{width:min(1120px,calc(100% - 32px));margin:0 auto}
.bar-in{display:flex;align-items:center;justify-content:space-between;gap:16px;height:60px}
.brand{display:flex;align-items:center;gap:10px;color:#151716;text-decoration:none;font-weight:700}
.brand img{height:22px;width:auto;display:block}.brand span{padding-left:10px;border-left:1px solid #d9e1dc;color:#5d6562;font-weight:600}
.who-am-i{display:flex;align-items:center;gap:12px;font-size:.85rem;color:#5d6562}.who-am-i form{margin:0}
.wrap{padding:28px 0 64px}
.head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
h1{margin:0;font-size:1.5rem;letter-spacing:-.01em}
.csv{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid #d9e1dc;border-radius:8px;background:#fff;color:#151716;text-decoration:none;font-weight:600;font-size:.85rem}
.csv:hover{border-color:#087b83;color:#087b83}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.tab{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;color:#3d4542;text-decoration:none;font-size:.85rem;font-weight:600}
.tab span{color:#8a938f;font-weight:500}.tab:hover{background:#eaefec}.tab.on{background:#151716;color:#fff}.tab.on span{color:#b8c2bd}
.flash{margin:0 0 14px;padding:9px 12px;border-radius:8px;background:#e6f1f0;color:#065f65;font-size:.9rem}
.list{background:#fff;border:1px solid #e3e8e5;border-radius:12px;overflow:hidden}
.cols,.row summary{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,1.5fr) minmax(0,1fr) 140px 20px;gap:16px;align-items:center;padding:0 18px}
.cols{height:38px;border-bottom:1px solid #e3e8e5;color:#7a837f;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.row{border-bottom:1px solid #eef1ef}.row:last-child{border-bottom:0}
.row summary{min-height:60px;cursor:pointer;list-style:none}.row summary::-webkit-details-marker{display:none}
.row summary:hover{background:#fafbf9}.row[open] summary{background:#fafbf9}
.c-who{display:flex;flex-direction:column;min-width:0}.c-who strong,.c-who span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.c-who span{color:#5d6562;font-size:.85rem}
.c-type,.c-event,.c-date{color:#3d4542;font-size:.88rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.c-date{color:#5d6562}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:.75rem;font-weight:700;white-space:nowrap}
.s-new{background:#fdecc8;color:#6b4500}.s-building-demo{background:#e6f1f0;color:#065f65}.s-demo-sent{background:#dcecff;color:#174a8b}
.s-follow-up-booked{background:#ece3fb;color:#4b2a85}.s-won{background:#d9f2df;color:#1e5b2c}.s-not-now{background:#eef1ef;color:#5d6562}
.chev{width:8px;height:8px;border-right:2px solid #8a938f;border-bottom:2px solid #8a938f;transform:rotate(-45deg);justify-self:end}
.row[open] .chev{transform:rotate(45deg)}
.detail{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:28px;padding:6px 18px 22px;background:#fafbf9}
dl{display:grid;grid-template-columns:140px minmax(0,1fr);gap:8px 14px;margin:0;font-size:.9rem}
dt{color:#7a837f;font-weight:600}dd{margin:0;word-break:break-word}
.mail{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px;font-size:.85rem}.mail form{margin:0}
.ok{color:#1e5b2c}.warn{color:#9a3412}
.follow{display:flex;flex-direction:column;gap:10px}
.follow label{display:flex;flex-direction:column;gap:5px;font-size:.78rem;font-weight:700;color:#5d6562}
select,textarea{font:inherit;font-size:.9rem;padding:8px 10px;border:1px solid #d9e1dc;border-radius:8px;background:#fff;color:#151716;width:100%}
textarea{resize:vertical}select:focus,textarea:focus{outline:3px solid rgba(8,123,131,.2);border-color:#087b83}
button{font:inherit;font-weight:700;font-size:.88rem;padding:8px 16px;border:0;border-radius:8px;background:#087b83;color:#fff;cursor:pointer;align-self:flex-start}
button:hover{background:#066a71}
button.link{background:none;color:#087b83;padding:0;text-decoration:underline;font-weight:600;font-size:inherit}
.empty{margin:0;padding:32px 18px;color:#5d6562;text-align:center}
@media (max-width:760px){
  .cols{display:none}
  .row summary{grid-template-columns:minmax(0,1fr) auto 14px;grid-template-areas:"who status chev" "meta meta meta";gap:4px 12px;padding:12px 16px}
  .c-who{grid-area:who}.c-status{grid-area:status}.chev{grid-area:chev}
  .c-type,.c-event,.c-date{grid-area:meta;display:none}
  .row summary::after{content:attr(data-meta);grid-area:meta;color:#5d6562;font-size:.82rem}
  .detail{grid-template-columns:1fr;gap:18px;padding:6px 16px 20px}
  dl{grid-template-columns:110px minmax(0,1fr)}
  .who-am-i span{display:none}.brand span{display:none}
}
</style></head><body>
<header class="bar"><div class="bar-in">
  <a class="brand" href="/admin"><img src="https://www.mitingu.com/assets/mitingu-logo.png" alt="Mitingu" width="72" height="22"><span>Leads</span></a>
  <div class="who-am-i"><span>${esc(signedInAs)}</span><form method="post" action="/admin/logout"><button type="submit" class="link">Sign out</button></form></div>
</div></header>
<main class="wrap">
  <div class="head"><h1>Demo requests</h1><a class="csv" href="/admin/leads.csv${filter ? `?status=${encodeURIComponent(filter)}` : ""}">Download CSV</a></div>
  ${flash ? `<p class="flash" role="status">${esc(flash)}</p>` : ""}
  <nav class="tabs" aria-label="Filter by status">${tabs}</nav>
  <div class="list">
    ${leads.length ? `<div class="cols" aria-hidden="true"><span>Organisation</span><span>Personality</span><span>Event type</span><span>Received</span><span>Status</span><span></span></div>` : ""}
    ${rows}
  </div>
</main>
</body></html>`;
}

function loginPage({ step = "email", message = "", error = "", email = "" } = {}) {
  const body =
    step === "code"
      ? `<h1>Check your email</h1>
<p class="lede">We've sent a 6-digit code to <strong>${esc(email)}</strong> if it's allowed to sign in. It expires in ${CODE_MINUTES} minutes.</p>
<form method="post" action="/admin/verify">
  <label for="code">Sign-in code</label>
  <input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" required autofocus>
  <label class="check"><input type="checkbox" name="remember" value="1"> Keep me signed in on this device for ${REMEMBER_DAYS} days</label>
  ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ""}
  <button type="submit">Sign in</button>
</form>
<form method="post" action="/admin/login" class="again"><input type="hidden" name="email" value="${esc(email)}"><button type="submit" class="link">Send a new code</button> · <a href="/admin/login">Use a different email</a></form>`
      : `<h1>Sign in to Mitingu leads</h1>
<p class="lede">Enter your email and we'll send you a one-time code.</p>
${message ? `<p class="note">${esc(message)}</p>` : ""}
<form method="post" action="/admin/login">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" required autofocus>
  ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ""}
  <button type="submit">Email me a code</button>
</form>`;
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Sign in | Mitingu leads</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f7f2;color:#151716;font:16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
.card{width:min(420px,100%);min-width:0;background:#fff;border:1px solid #d9e1dc;border-radius:14px;padding:32px}
h1{margin:0 0 6px;font-size:1.45rem;letter-spacing:-.01em}.lede{margin:0 0 20px;color:#5d6562}
form{display:flex;flex-direction:column;gap:10px}label{font-weight:700;font-size:.9rem}
input{font:inherit;padding:11px 12px;border:1px solid #d9e1dc;border-radius:8px;width:100%;min-width:0}input:focus{outline:3px solid rgba(8,123,131,.25);border-color:#087b83}
#code{font-size:1.5rem;letter-spacing:.3em;text-align:center}
.check{display:flex;gap:8px;align-items:center;font-weight:400;color:#5d6562}.check input{width:18px;height:18px;flex:none}
button{font:inherit;font-weight:700;padding:12px 16px;border:0;border-radius:8px;background:#087b83;color:#fff;cursor:pointer;margin-top:6px}
.again{display:block;margin-top:18px;font-size:.9rem;color:#5d6562}.again button{display:inline;margin:0}
button.link{background:none;color:#087b83;padding:0;text-decoration:underline;font-weight:600}a{color:#087b83}
.error{margin:0;color:#b42318;font-size:.92rem}.note{margin:0 0 14px;background:#e6f1f0;border-radius:8px;padding:10px 12px}
.logo{display:block;height:24px;width:auto;margin:0 0 22px}
</style></head><body><main class="card"><img class="logo" src="https://www.mitingu.com/assets/mitingu-logo.png" alt="Mitingu" width="78" height="24">${body}</main></body></html>`;
}

async function handleLogin(req, res, url) {
  const path = url.pathname;
  const html = (status, page, headers = {}) => send(res, status, page, { ...adminHeaders, ...headers });

  if (path === "/admin/login" && req.method === "GET") {
    const pending = cookies(req)[PENDING_COOKIE];
    if (url.searchParams.get("step") === "code" && pending) return html(200, loginPage({ step: "code", email: pending }));
    const message = url.searchParams.get("signed_out") ? "You've signed out." : url.searchParams.get("expired") ? "Please sign in again." : "";
    return html(200, loginPage({ message }));
  }
  if (req.method !== "POST") return send(res, 405, "Method not allowed");
  if (!sameOrigin(req)) return send(res, 403, "Blocked: this form must be sent from the sign-in page.");
  const form = parseBody(await readBody(req), req.headers["content-type"]);

  if (path === "/admin/login") {
    const email = String(form.email || "").trim().toLowerCase().slice(0, 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return html(400, loginPage({ error: "Please enter a valid email address.", email }));
    if (tooManyCodes(`ip:${clientIp(req)}`, 10) || tooManyCodes(`email:${email}`, 5)) {
      return html(429, loginPage({ error: "Too many codes requested. Please wait a while and try again.", email }));
    }
    if (ADMIN_EMAILS.includes(email)) {
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
      await pool.query("UPDATE admin_codes SET used_at = now() WHERE email = $1 AND used_at IS NULL", [email]);
      await pool.query(
        `INSERT INTO admin_codes (email, code_hash, expires_at) VALUES ($1, $2, now() + interval '${CODE_MINUTES} minutes')`,
        [email, codeHash(email, code)],
      );
      try {
        await sendEmail({ to: email, ...signInEmail(code) });
      } catch (e) {
        console.error(`Sign-in code email failed: ${e.message}`);
        return html(502, loginPage({ error: "We couldn't send the code just now. Please try again in a minute.", email }));
      }
    }
    // Same answer whether or not the address is allowed, so nobody can probe for valid emails.
    return send(res, 303, "", {
      Location: "/admin/login?step=code",
      "Set-Cookie": cookie(PENDING_COOKIE, email, { maxAge: CODE_MINUTES * 60 }),
    });
  }

  if (path === "/admin/verify") {
    const email = cookies(req)[PENDING_COOKIE];
    if (!email) return send(res, 303, "", { Location: "/admin/login?expired=1" });
    const code = String(form.code || "").replace(/\s+/g, "");
    const { rows } = await pool.query(
      "SELECT * FROM admin_codes WHERE email = $1 AND used_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1",
      [email],
    );
    const record = rows[0];
    const wrong = (msg) => html(401, loginPage({ step: "code", email, error: msg }));
    if (!record) return wrong("That code has expired. Send a new code and try again.");
    if (record.attempts >= CODE_ATTEMPTS) return wrong("Too many wrong attempts. Send a new code and try again.");
    const ok = /^\d{6}$/.test(code) && timingSafeEqual(Buffer.from(codeHash(email, code)), Buffer.from(record.code_hash));
    if (!ok) {
      await pool.query("UPDATE admin_codes SET attempts = attempts + 1 WHERE id = $1", [record.id]);
      const left = CODE_ATTEMPTS - record.attempts - 1;
      return wrong(left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong attempts. Send a new code and try again.");
    }
    await pool.query("UPDATE admin_codes SET used_at = now() WHERE id = $1", [record.id]);
    const token = randomBytes(32).toString("base64url");
    const remember = form.remember === "1";
    const seconds = remember ? REMEMBER_DAYS * 86400 : SESSION_HOURS * 3600;
    await pool.query(
      `INSERT INTO admin_sessions (token_hash, email, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))`,
      [tokenHash(token), email, seconds],
    );
    await pool.query("DELETE FROM admin_sessions WHERE expires_at < now()");
    await pool.query("DELETE FROM admin_codes WHERE created_at < now() - interval '1 day'");
    return send(res, 303, "", {
      Location: "/admin",
      "Set-Cookie": [
        cookie(SESSION_COOKIE, token, remember ? { maxAge: seconds } : {}),
        cookie(PENDING_COOKIE, "", { maxAge: 0 }),
      ],
    });
  }

  if (path === "/admin/logout") {
    const token = cookies(req)[SESSION_COOKIE];
    if (token) await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash(token)]);
    return send(res, 303, "", { Location: "/admin/login?signed_out=1", "Set-Cookie": cookie(SESSION_COOKIE, "", { maxAge: 0 }) });
  }
  return send(res, 404, "Not found");
}

function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

async function handleAdmin(req, res, url) {
  const path = url.pathname;
  if (["/admin/login", "/admin/verify", "/admin/logout"].includes(path)) return handleLogin(req, res, url);
  const session = await currentSession(req);
  if (!session) {
    if (req.method !== "GET") return send(res, 401, "Please sign in again.");
    return send(res, 303, "", { Location: "/admin/login" });
  }

  if (req.method === "POST") {
    if (!sameOrigin(req)) return send(res, 403, "Blocked: this form must be sent from the admin page.");
    const m = path.match(/^\/admin\/leads\/(\d+)(\/resend)?$/);
    if (!m) return send(res, 404, "Not found");
    const id = Number(m[1]);
    const back = (msg) => send(res, 303, "", { Location: `/admin?flash=${encodeURIComponent(msg)}` });
    if (m[2]) {
      const { rows } = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);
      if (!rows[0]) return send(res, 404, "Not found");
      const ok = await sendConfirmation(rows[0]);
      return back(ok ? `Confirmation sent to ${rows[0].email}.` : "The confirmation email couldn't be sent. See the note on the lead.");
    }
    const form = parseBody(await readBody(req), req.headers["content-type"]);
    const status = STATUSES.includes(form.status) ? form.status : "New";
    const note = String(form.internal_note || "").slice(0, 2000);
    await pool.query("UPDATE leads SET status = $2, internal_note = $3, updated_at = now() WHERE id = $1", [id, status, note]);
    return back("Saved.");
  }

  const filter = STATUSES.includes(url.searchParams.get("status")) ? url.searchParams.get("status") : "";
  const where = filter ? "WHERE status = $1" : "";
  const params = filter ? [filter] : [];

  if (path === "/admin/leads.csv") {
    const { rows } = await pool.query(`SELECT * FROM leads ${where} ORDER BY created_at DESC`, params);
    const cols = ["id", "created_at", "status", "name", "email", "organisation", "website", "event_type", "event", "notes", "personality", "internal_note", "confirmation_sent_at"];
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c] instanceof Date ? r[c].toISOString() : r[c])).join(","))].join("\r\n");
    return send(res, 200, "﻿" + csv, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mitingu-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    });
  }

  if (path === "/admin" || path === "/admin/") {
    const [{ rows }, countRes] = await Promise.all([
      pool.query(`SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT 500`, params),
      pool.query("SELECT status, count(*)::int AS n FROM leads GROUP BY status"),
    ]);
    const counts = Object.fromEntries(countRes.rows.map((r) => [r.status, r.n]));
    return send(res, 200, adminPage(rows, counts, filter, url.searchParams.get("flash"), session.email), adminHeaders);
  }
  return send(res, 404, "Not found");
}

// ---------- Server ----------

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname === "/healthz") {
      await pool.query("SELECT 1");
      return send(res, 200, "ok");
    }
    if (url.pathname === "/api/demo-requests") return await handleDemoRequest(req, res);
    const isAdminPath = url.pathname === "/" || url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    const host = String(req.headers.host || "").toLowerCase();
    if (isAdminPath && ADMIN_HOST && host !== ADMIN_HOST && req.method === "GET") {
      const target = url.pathname === "/" ? "/admin" : url.pathname + url.search;
      return send(res, 301, "", { Location: `https://${ADMIN_HOST}${target}` });
    }
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return await handleAdmin(req, res, url);
    if (url.pathname === "/") return send(res, 302, "", { Location: "/admin" });
    if (url.pathname === "/robots.txt") return send(res, 200, "User-agent: *\nDisallow: /\n");
    return send(res, 404, "Not found");
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      if (url.pathname.startsWith("/api/")) return sendJson(res, 500, { success: false, message: "Something went wrong." }, corsHeaders(req));
      return send(res, 500, "Something went wrong.");
    }
  }
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  await migrate();
  server.listen(PORT, () => console.log(`Mitingu leads service listening on ${PORT}`));
}

export { pool };
