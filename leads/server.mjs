// Mitingu leads service
//
// Receives demo requests from www.mitingu.com/personality, stores them in
// Postgres, emails the visitor a confirmation and Greg a notification (both via
// SendGrid), and serves a password-protected admin area at /admin.
//
// Environment variables
//   DATABASE_URL       Postgres connection string (required)
//   SENDGRID_API_KEY   SendGrid API key with "Mail Send" permission
//   ADMIN_PASSWORD     Password for /admin (username below)
//   ADMIN_USER         Username for /admin (default: greg)
//   FROM_EMAIL         Sender address (default: greg.wood@mitingu.com)
//   FROM_NAME          Sender name (default: Greg Wood, Mitingu)
//   NOTIFY_EMAIL       Where new-lead notifications go (default: greg@mitingu.com)
//   ALLOWED_ORIGINS    Comma-separated sites allowed to post (default: www.mitingu.com)
//   DATABASE_SSL       "true" to force SSL to Postgres (external connections)

import http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import pg from "pg";

const env = process.env;
const PORT = Number(env.PORT || 10000);
const ADMIN_USER = env.ADMIN_USER || "greg";
const FROM_EMAIL = env.FROM_EMAIL || "greg.wood@mitingu.com";
const FROM_NAME = env.FROM_NAME || "Greg Wood, Mitingu";
const NOTIFY_EMAIL = env.NOTIFY_EMAIL || "greg@mitingu.com";
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
  const adminUrl = `https://${req.headers.host}/admin`;
  // Respond as soon as the lead is safely stored; emails follow.
  sendJson(res, 200, { success: true, id: saved.id }, cors);
  await Promise.all([sendConfirmation(saved), sendNotification(saved, adminUrl)]);
}

// ---------- Admin ----------

const sha = (s) => createHash("sha256").update(String(s)).digest();

function authorised(req) {
  if (!env.ADMIN_PASSWORD) return false;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const [user, ...rest] = Buffer.from(header.slice(6), "base64").toString("utf8").split(":");
  const pass = rest.join(":");
  return timingSafeEqual(sha(user), sha(ADMIN_USER)) && timingSafeEqual(sha(pass), sha(env.ADMIN_PASSWORD));
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
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
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

function adminPage(leads, counts, filter, flash) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [["All", total], ...STATUSES.map((s) => [s, counts[s] || 0])]
    .map(([label, n]) => {
      const href = label === "All" ? "/admin" : `/admin?status=${encodeURIComponent(label)}`;
      const on = (label === "All" && !filter) || label === filter;
      return `<a class="tab${on ? " on" : ""}" href="${href}">${esc(label)} <span>${n}</span></a>`;
    })
    .join("");
  const cards = leads.length
    ? leads
        .map((l) => {
          const conf = l.confirmation_sent_at
            ? `<span class="ok">Confirmation sent ${esc(fmtDate(l.confirmation_sent_at))}</span>`
            : `<span class="warn">Confirmation not sent${l.confirmation_error ? `: ${esc(l.confirmation_error)}` : ""}</span>`;
          return `<article class="lead">
  <header>
    <div>
      <h2>${esc(l.organisation)}</h2>
      <p class="who">${esc(l.name)} · <a href="mailto:${esc(l.email)}">${esc(l.email)}</a> · ${websiteLink(l.website)}</p>
    </div>
    <span class="status s-${esc(l.status.toLowerCase().replace(/[^a-z]+/g, "-"))}">${esc(l.status)}</span>
  </header>
  <dl>
    <div><dt>Received</dt><dd>${esc(fmtDate(l.created_at))}</dd></div>
    <div><dt>Personality</dt><dd>${esc(l.personality || "-")}</dd></div>
    <div><dt>Event type</dt><dd>${esc(l.event_type || "-")}</dd></div>
    <div><dt>Event name or date</dt><dd>${esc(l.event || "-")}</dd></div>
  </dl>
  ${l.notes ? `<p class="notes"><strong>Their notes:</strong> ${esc(l.notes)}</p>` : ""}
  <p class="mail">${conf}</p>
  <form method="post" action="/admin/leads/${l.id}" class="edit">
    <label>Status
      <select name="status">${STATUSES.map((s) => `<option${s === l.status ? " selected" : ""}>${esc(s)}</option>`).join("")}</select>
    </label>
    <label class="grow">Internal note
      <input name="internal_note" value="${esc(l.internal_note || "")}" maxlength="2000" placeholder="e.g. Demo link sent 12 Nov">
    </label>
    <button type="submit">Save</button>
  </form>
  <form method="post" action="/admin/leads/${l.id}/resend" class="resend">
    <button type="submit" class="link">${l.confirmation_sent_at ? "Resend" : "Send"} confirmation email</button>
  </form>
</article>`;
        })
        .join("")
    : `<p class="empty">No leads${filter ? ` with status "${esc(filter)}"` : " yet"}.</p>`;

  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Leads | Mitingu</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f7f2;color:#151716;font:16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{width:min(1100px,calc(100% - 32px));margin:0 auto;padding:32px 0 64px}
.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
h1{margin:0;font-size:1.8rem;letter-spacing:-.02em}.top a.btn{background:#151716;color:#fff;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}.tab{padding:6px 12px;border:1px solid #d9e1dc;border-radius:999px;background:#fff;color:#151716;text-decoration:none;font-size:.9rem}
.tab span{color:#5d6562}.tab.on{background:#087b83;border-color:#087b83;color:#fff}.tab.on span{color:#d8f0ef}
.flash{background:#e6f1f0;border-radius:8px;padding:10px 14px;margin-bottom:16px}
.lead{background:#fff;border:1px solid #d9e1dc;border-radius:12px;padding:20px 22px;margin-bottom:14px}
.lead header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.lead h2{margin:0;font-size:1.2rem}.who{margin:2px 0 0;color:#5d6562;font-size:.95rem;word-break:break-word}a{color:#087b83}
.status{flex:none;padding:3px 10px;border-radius:999px;font-size:.8rem;font-weight:700;background:#eef1ef}
.s-new{background:#fdecc8;color:#6b4500}.s-building-demo{background:#e6f1f0;color:#065f65}.s-demo-sent{background:#dcecff;color:#174a8b}
.s-follow-up-booked{background:#ece3fb;color:#4b2a85}.s-won{background:#d9f2df;color:#1e5b2c}.s-not-now{background:#eef1ef;color:#5d6562}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px 20px;margin:16px 0 0}dt{color:#5d6562;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700}dd{margin:0}
.notes{margin:14px 0 0;padding-top:12px;border-top:1px solid #eef1ef}.mail{margin:10px 0 0;font-size:.88rem}.ok{color:#1e5b2c}.warn{color:#9a3412}
.edit{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-top:14px;padding-top:14px;border-top:1px solid #eef1ef}
.edit label{display:flex;flex-direction:column;gap:4px;font-size:.8rem;font-weight:700;color:#5d6562}.edit .grow{flex:1 1 260px}
select,input{font:inherit;font-size:.95rem;padding:8px 10px;border:1px solid #d9e1dc;border-radius:8px;background:#fff;color:#151716}
button{font:inherit;font-weight:700;font-size:.9rem;padding:9px 16px;border:0;border-radius:8px;background:#087b83;color:#fff;cursor:pointer}
.resend{margin-top:8px}button.link{background:none;color:#087b83;padding:0;text-decoration:underline;font-weight:600}
.empty{background:#fff;border-radius:12px;padding:24px;color:#5d6562}
</style></head><body><div class="wrap">
<div class="top"><h1>Demo requests</h1><a class="btn" href="/admin/leads.csv${filter ? `?status=${encodeURIComponent(filter)}` : ""}">Download CSV</a></div>
${flash ? `<p class="flash">${esc(flash)}</p>` : ""}
<nav class="tabs">${tabs}</nav>
${cards}
</div></body></html>`;
}

function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

async function handleAdmin(req, res, url) {
  if (!env.ADMIN_PASSWORD) return send(res, 503, "The admin password hasn't been set yet (ADMIN_PASSWORD).");
  if (!authorised(req)) {
    return send(res, 401, "Sign in to see Mitingu leads.", { "WWW-Authenticate": 'Basic realm="Mitingu leads", charset="UTF-8"' });
  }
  const path = url.pathname;

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
    return send(res, 200, adminPage(rows, counts, filter, url.searchParams.get("flash")), adminHeaders);
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
