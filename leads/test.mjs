// Tests for the leads service. Needs a throwaway Postgres in TEST_DATABASE_URL.
// SendGrid is faked: no real email is sent.
//   TEST_DATABASE_URL=postgres://postgres@localhost:5433/leads_test node test.mjs

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";
process.env.SENDGRID_API_KEY = "SG.fake";

const sent = [];
let sendgridFails = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).startsWith("https://api.sendgrid.com/")) {
    sent.push(JSON.parse(opts.body));
    return sendgridFails ? new Response("bad key", { status: 401 }) : new Response("", { status: 202 });
  }
  return realFetch(url, opts);
};

const { server, migrate, pool } = await import("./server.mjs");
await pool.query("DROP TABLE IF EXISTS leads");
await migrate();
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);

const good = {
  name: "Sam Rivers",
  email: "sam@example.co.uk",
  organisation: "Kestrel Park",
  website: "kestrelpark.co.uk",
  event_type: "Awards or gala",
  event: "Spring dinner, March",
  notes: "80 guests, free",
  personality: "The Shopkeeper",
};
const post = (body, headers = {}) =>
  realFetch(`${base}/api/demo-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://www.mitingu.com", "X-Forwarded-For": headers.ip || "1.1.1.1", ...headers },
    body: JSON.stringify(body),
  });
const auth = (u, p) => ({ Authorization: "Basic " + Buffer.from(`${u}:${p}`).toString("base64") });

// Preflight
let r = await realFetch(`${base}/api/demo-requests`, { method: "OPTIONS", headers: { Origin: "https://www.mitingu.com" } });
check("CORS preflight allows www.mitingu.com", r.status === 204 && r.headers.get("access-control-allow-origin") === "https://www.mitingu.com");
r = await realFetch(`${base}/api/demo-requests`, { method: "OPTIONS", headers: { Origin: "https://evil.example" } });
check("CORS preflight refuses other sites", !r.headers.get("access-control-allow-origin"));

// Valid lead
r = await post(good);
let j = await r.json();
check("Valid request accepted", r.status === 200 && j.success === true && j.id > 0);
await wait(200);
let { rows } = await pool.query("SELECT * FROM leads");
check("Lead stored with every field", rows.length === 1 && Object.keys(good).every((k) => rows[0][k] === good[k]));
check("Status starts as New", rows[0].status === "New");
const conf = sent.find((m) => m.personalizations[0].to[0].email === good.email);
const note = sent.find((m) => m.personalizations[0].to[0].email === "greg@mitingu.com");
check("Confirmation email sent to visitor", !!conf && conf.subject === "Your Mitingu demo site is on its way");
check("Confirmation from greg.wood@mitingu.com", conf?.from.email === "greg.wood@mitingu.com");
check("Confirmation names their organisation and event", conf?.content[0].value.includes("Kestrel Park's branding, with a sample awards evening"));
check("Confirmation greets by first name", conf?.content[0].value.startsWith("Hi Sam,"));
check("Notification email to Greg with subject", note?.subject === "Demo site request: Kestrel Park (Shopkeeper)");
check("Notification reply-to is the visitor", note?.reply_to.email === good.email);
check("Notification lists every field", ["Spring dinner, March", "80 guests, free", "kestrelpark.co.uk", "Awards or gala"].every((s) => note?.content[0].value.includes(s)));
check("Send times recorded", !!rows[0].confirmation_sent_at && !!rows[0].notified_at);

// Validation
r = await post({ ...good, email: "sam@nowhere" });
j = await r.json();
check("Bad email rejected with message", r.status === 400 && j.message.includes("doesn't look quite right"));
r = await post({ ...good, website: "kestrelpark" });
j = await r.json();
check("Website without a dot rejected", r.status === 400 && j.message.includes("website"));
r = await post({ ...good, name: "" });
check("Blank name rejected", r.status === 400);
r = await post({ ...good, event_type: "Hacked" });
await wait(100);
({ rows } = await pool.query("SELECT event_type FROM leads ORDER BY id DESC LIMIT 1"));
check("Unknown event type stored as Something else", r.status === 200 && rows[0].event_type === "Something else");

// Honeypot and origin
const before = (await pool.query("SELECT count(*)::int n FROM leads")).rows[0].n;
r = await post({ ...good, botcheck: "on" });
const after = (await pool.query("SELECT count(*)::int n FROM leads")).rows[0].n;
check("Honeypot: looks successful, nothing stored", r.status === 200 && after === before);
r = await post(good, { Origin: "https://evil.example", ip: "2.2.2.2" });
check("Other websites can't post", r.status === 403);

// Rate limit
let last;
for (let i = 0; i < 9; i++) last = await post(good, { ip: "9.9.9.9" });
check("Rate limit after 8 an hour", last.status === 429);

// Email failure is recorded, lead still stored
sendgridFails = true;
r = await post({ ...good, name: "Fail Test", email: "fail@example.com" }, { ip: "3.3.3.3" });
await wait(200);
({ rows } = await pool.query("SELECT * FROM leads WHERE email = 'fail@example.com'"));
check("SendGrid failure: lead still saved and accepted", r.status === 200 && rows.length === 1);
check("SendGrid failure recorded on the lead", (rows[0].confirmation_error || "").includes("401") && !rows[0].confirmation_sent_at);
sendgridFails = false;

// Admin: sign in with an emailed code
const form = (o) => new URLSearchParams(o).toString();
const formPost = (path, body, cookie = "", origin = base) =>
  realFetch(`${base}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: form(body),
  });
const setCookies = (r) => r.headers.getSetCookie();
const cookieFrom = (r, name) => (setCookies(r).find((c) => c.startsWith(name + "=")) || "").split(";")[0];
const lastCode = () => {
  const m = [...sent].reverse().find((x) => /sign-in code/.test(x.subject));
  return m ? m.subject.slice(0, 6) : null;
};

r = await realFetch(`${base}/admin`, { redirect: "manual" });
check("Admin sends signed-out visitors to the sign-in page", r.status === 303 && r.headers.get("location") === "/admin/login");
r = await realFetch(`${base}/admin/leads.csv`, { redirect: "manual" });
check("CSV needs sign-in", r.status === 303);
r = await realFetch(`${base}/admin/login`);
let html = await r.text();
check("Sign-in page shows and isn't indexable", r.status === 200 && html.includes("Email me a code") && (r.headers.get("x-robots-tag") || "").includes("noindex"));

// Address that isn't allowed: same response, no email sent
sent.length = 0;
r = await formPost("/admin/login", { email: "intruder@example.com" });
check("Unknown email: same response as a real one", r.status === 303 && r.headers.get("location") === "/admin/login?step=code");
check("Unknown email: no code sent", sent.length === 0);

// Real admin address
sent.length = 0;
r = await formPost("/admin/login", { email: "Greg@Mitingu.com" });
let pending = cookieFrom(r, "mitingu_admin_pending");
let code = lastCode();
check("Allowed email gets a 6-digit code", r.status === 303 && /^\d{6}$/.test(code || "") && sent[0]?.personalizations[0].to[0].email === "greg@mitingu.com");
check("Code email comes from Mitingu", sent[0]?.from.email === "greg.wood@mitingu.com");
r = await realFetch(`${base}/admin/login?step=code`, { headers: { Cookie: pending } });
html = await r.text();
check("Code page shows", html.includes("Check your email") && html.includes("greg@mitingu.com"));

r = await formPost("/admin/login", { email: "greg@mitingu.com" }, "", "https://evil.example");
check("Sign-in form from another site blocked", r.status === 403);

const wrongCode = code === "000000" ? "111111" : "000000";
r = await formPost("/admin/verify", { code: wrongCode }, pending);
html = await r.text();
check("Wrong code refused with tries left", r.status === 401 && html.includes("4 tries left"));
r = await formPost("/admin/verify", { code }, "");
check("Code without the pending cookie is refused", r.status === 303 && r.headers.get("location").includes("expired"));
r = await formPost("/admin/verify", { code }, pending);
let session = cookieFrom(r, "mitingu_admin");
const sessionCookieFlags = setCookies(r).find((c) => c.startsWith("mitingu_admin="));
check("Right code signs in", r.status === 303 && r.headers.get("location") === "/admin" && session.length > 40);
check("Session cookie is HttpOnly and SameSite", /HttpOnly/.test(sessionCookieFlags) && /SameSite=Lax/.test(sessionCookieFlags));
check("Session lasts for the browser session unless remembered", !/Max-Age/.test(sessionCookieFlags));
r = await formPost("/admin/verify", { code }, pending);
check("A code only works once", r.status === 401);

await post({ ...good, name: "<script>alert(1)</script> Smith", email: "xss@example.com" }, { ip: "4.4.4.4" });
await wait(150);
r = await realFetch(`${base}/admin`, { headers: { Cookie: session } });
html = await r.text();
check("Admin opens when signed in", r.status === 200 && html.includes("Demo requests") && html.includes("Kestrel Park"));
check("Admin shows who is signed in and a sign-out button", html.includes("Signed in as greg@mitingu.com") && html.includes("Sign out"));
check("Admin escapes what visitors typed", !html.includes("<script>alert(1)") && html.includes("&lt;script&gt;"));
check("Admin shows failed confirmation", html.includes("Confirmation not sent"));
check("Admin is not indexable", (r.headers.get("x-robots-tag") || "").includes("noindex"));

const id = (await pool.query("SELECT id FROM leads WHERE email = $1 ORDER BY id LIMIT 1", [good.email])).rows[0].id;
r = await formPost(`/admin/leads/${id}`, { status: "Demo sent", internal_note: "x" }, session, "https://evil.example");
check("Admin change from another site blocked", r.status === 403);
r = await formPost(`/admin/leads/${id}`, { status: "Demo sent", internal_note: "Link sent 12 Nov" }, "");
check("Admin change without signing in refused", r.status === 401);
r = await formPost(`/admin/leads/${id}`, { status: "Demo sent", internal_note: "Link sent 12 Nov" }, session);
({ rows } = await pool.query("SELECT status, internal_note FROM leads WHERE id = $1", [id]));
check("Status and note saved", r.status === 303 && rows[0].status === "Demo sent" && rows[0].internal_note === "Link sent 12 Nov");
r = await realFetch(`${base}/admin?status=Demo%20sent`, { headers: { Cookie: session } });
html = await r.text();
check("Status filter works", html.includes("Kestrel Park") && !html.includes("xss@example.com"));

const failId = (await pool.query("SELECT id FROM leads WHERE email = 'fail@example.com'")).rows[0].id;
sent.length = 0;
r = await formPost(`/admin/leads/${failId}/resend`, {}, session);
({ rows } = await pool.query("SELECT confirmation_sent_at FROM leads WHERE id = $1", [failId]));
check("Resend confirmation works", r.status === 303 && sent.length === 1 && !!rows[0].confirmation_sent_at);

await post({ ...good, name: '=HYPERLINK("http://x")', email: "csv@example.com" }, { ip: "5.5.5.5" });
await wait(100);
r = await realFetch(`${base}/admin/leads.csv`, { headers: { Cookie: session } });
const csv = await r.text();
check("CSV export downloads", r.status === 200 && (r.headers.get("content-type") || "").includes("text/csv") && csv.includes("Kestrel Park"));
check("CSV blocks spreadsheet formulas", csv.includes(`"'=HYPERLINK`));

// Sign out
r = await formPost("/admin/logout", {}, session);
check("Sign out goes back to the sign-in page", r.status === 303 && r.headers.get("location") === "/admin/login?signed_out=1");
r = await realFetch(`${base}/admin`, { redirect: "manual", headers: { Cookie: session } });
check("Old session no longer works after signing out", r.status === 303);

// Remember me
sent.length = 0;
r = await formPost("/admin/login", { email: "greg.wood@mitingu.com" });
pending = cookieFrom(r, "mitingu_admin_pending");
r = await formPost("/admin/verify", { code: lastCode(), remember: "1" }, pending);
check("'Keep me signed in' sets a 30-day cookie", /Max-Age=2592000/.test(setCookies(r).find((c) => c.startsWith("mitingu_admin=")) || ""));

// Too many wrong codes
sent.length = 0;
r = await formPost("/admin/login", { email: "greg@mitingu.com" });
pending = cookieFrom(r, "mitingu_admin_pending");
const good6 = lastCode();
const bad6 = good6 === "123456" ? "654321" : "123456";
for (let i = 0; i < 5; i++) r = await formPost("/admin/verify", { code: bad6 }, pending);
r = await formPost("/admin/verify", { code: good6 }, pending);
check("After 5 wrong tries even the right code is refused", r.status === 401);

// Expired code
sent.length = 0;
r = await formPost("/admin/login", { email: "greg@mitingu.com" });
pending = cookieFrom(r, "mitingu_admin_pending");
await pool.query("UPDATE admin_codes SET expires_at = now() - interval '1 minute' WHERE used_at IS NULL");
r = await formPost("/admin/verify", { code: lastCode() }, pending);
check("Expired code refused", r.status === 401 && (await r.text()).includes("expired"));

// Code requests are rate limited per email
for (let i = 0; i < 6; i++) r = await formPost("/admin/login", { email: "greg.wood@mitingu.com" });
check("Too many code requests are refused", r.status === 429);

r = await realFetch(`${base}/healthz`);
check("Health check", r.status === 200);

console.log(results.join("\n"));
const failed = results.filter((l) => l.startsWith("FAIL")).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
server.close();
await pool.end();
process.exit(failed ? 1 : 0);
