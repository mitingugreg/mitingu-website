import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { pages, redirects, renderPage, renderNotFound } from "./site.mjs";
import { blogPages, blogForwards, posts, renderBlogPage } from "./blog.mjs";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
const server = join(dist, "server");
const origin = "https://www.mitingu.com";

// Make links to external sites (Instagram, LinkedIn, any non-mitingu.com URL)
// open in a new tab, with safe rel attributes. Internal and anchor/mailto/tel
// links are left untouched.
function externalizeLinks(html) {
  return html.replace(
    /<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (match, pre, url, post) => {
      let host;
      try {
        host = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return match;
      }
      if (host === "mitingu.com" || host.endsWith(".mitingu.com")) return match;
      if (/\btarget=/.test(match)) return match; // already set
      const rel = /\brel=/.test(match) ? "" : ' rel="noopener noreferrer"';
      return `<a${pre}href="${url}"${post} target="_blank"${rel}>`;
    },
  );
}

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

await cp(join(root, "public"), client, { recursive: true });
await cp(join(root, "src", "styles.css"), join(client, "styles.css"));

for (const path of pages) {
  const filePath =
    path === "/" ? join(client, "index.html") : join(client, path, "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, externalizeLinks(renderPage(path)));
}

for (const path of blogPages) {
  const filePath = join(client, path, "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, externalizeLinks(renderBlogPage(path)));
}

// Old addresses: a tiny page that forwards straight to the new location.
// Search engines treat an instant meta refresh plus canonical as a permanent move.
const forwardPage = (to) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>This page has moved | Mitingu</title>
<link rel="canonical" href="${origin}${to === "/" ? "" : to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script>
</head><body><p>This page has moved to <a href="${to}">${origin}${to}</a>.</p></body></html>
`;
for (const [from, to] of Object.entries(blogForwards)) {
  const filePath = join(client, decodeURIComponent(from.replaceAll("+", "%2B")), "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, forwardPage(to));
}

await writeFile(join(client, "404.html"), externalizeLinks(renderNotFound()));

// Last-modified date for the sitemap: the date of the latest commit, so
// search engines can see when the site last changed. Falls back to today.
let lastmod;
try {
  lastmod = execSync("git log -1 --format=%cs", { encoding: "utf8" }).trim();
} catch {
  lastmod = "";
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (path) => `  <url>
    <loc>${origin}${path === "/" ? "" : path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : path.includes("solutions") ? "0.8" : "0.9"}</priority>
  </url>`,
  )
  .join("\n")}
  <url>
    <loc>${origin}/blog</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${posts
  .map(
    (post) => `  <url>
    <loc>${origin}${post.path}</loc>
    <lastmod>${post.published}</lastmod>
    <priority>${post.published >= "2021" ? "0.6" : "0.4"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(client, "sitemap.xml"), sitemap);
await writeFile(
  join(client, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`,
);

await writeFile(
  join(client, "llms.txt"),
  `# Mitingu

> Mitingu is an event operations platform for corporate event teams and event agencies anywhere in the world. It runs online registration and communications, a branded attendee app, onsite self-service and staffed check-in, lead capture and reporting on one platform, from one supplier, with one set of attendee data from first invitation to post-event report.

Mitingu is built and supported in the UK (Cornwall) and works with companies in any country, with event sites and emails available in 40+ languages. It has worked with event teams at Booking.com, Workday, CBRE and Campari.

## What Mitingu does

### Before the event
- Branded event websites and registration journeys (public, private, invite-only, internal and paid events)
- AI Event Builder: describe the event in plain English and Mitingu drafts the branded event site, registration and communications for the team to review and launch (also available through Mitingu MCP)
- Automated, personalised event communications: invitations, confirmations, reminders, updates and follow-ups, segmented by audience
- Planning, tasks and approvals across events, offices and clients
- Secure collaboration with agencies, suppliers and stakeholders, with role-based access and shared files

### At the event
- White-label attendee app for iOS and Android, carrying the client's brand: agenda, seminar booking with live places, speakers, exhibitors, interactive floor plan with exhibitor finder, venue information, announcements and a QR attendee pass
- App content management system connected to Mitingu, so organisers make last-minute agenda, room and announcement changes themselves
- Onsite check-in: custom-branded self-service registration booths that print each attendee's badge on the spot when they scan their QR pass, plus staffed registration desks, all working from the same live attendee list
- Onsite support from the Mitingu team
- Exhibitor lead capture with hot, warm and cold lead scoring

### After the event
- Reporting on registrations, attendance, app activity, seminar bookings, leads, communications and NPS
- Event Intelligence: ask questions of event data in plain English, generate reports and see what needs attention
- Mitingu MCP: connect Claude, ChatGPT or Microsoft Copilot (where MCP is supported) to approved Mitingu event data

## Why teams choose Mitingu
- One supplier instead of three: registration, the event app and onsite check-in are one platform, so there is no exporting and matching data between systems after the event
- Fully white-label: the app, event sites, emails and booths carry the client's brand, which suits agencies delivering events for clients
- Self-service: event teams update content themselves rather than waiting on a supplier
- Built to show whether the event worked, not just how many people registered

## Best fit
- Corporate event teams
- Event agencies (white-label delivery for multiple clients)
- Event marketing and internal communications teams
- Professional conference organisers
- Organisations running events across multiple offices, regions or brands
- Conferences, client events, supplier and partner summits, exhibitions, roadshows and internal events

## Key pages
- [Platform overview](${origin}/platform)
- [Event apps and onsite registration](${origin}/event-apps-onsite-registration): attendee app, self-service booths, staffed check-in and lead capture
- [White-label event platform](${origin}/white-label-event-platform)
- [Event registration](${origin}/enterprise-event-registration-platform)
- [Event communications](${origin}/event-communications-platform)
- [Event analytics and reporting](${origin}/event-analytics-reporting)
- [Event Intelligence](${origin}/event-intelligence)
- [Mitingu MCP](${origin}/mcp)
- [For corporate event teams](${origin}/solutions/corporate-events)
- [For event agencies](${origin}/solutions/event-agencies)
- [For multi-office programmes](${origin}/solutions/multi-office-event-programmes)
- [Pricing](${origin}/pricing)
- [About Mitingu](${origin}/about)
- [Book a demo](${origin}/book-a-demo)

## Guides from the Mitingu blog
${posts
  .filter((post) => post.published >= "2021")
  .map((post) => `- [${post.title}](${origin}${post.path}): ${post.description}`)
  .join("\n")}
- [All articles](${origin}/blog)

## Contact
- Email: hello@mitingu.com
- Phone: +44 1608 495288
- Website: ${origin}
- LinkedIn: https://www.linkedin.com/company/mitingu-ltd
`,
);

await mkdir(join(dist, ".openai"), { recursive: true });
await cp(join(root, ".openai", "hosting.json"), join(dist, ".openai", "hosting.json"));

await writeFile(
  join(server, "index.js"),
  `const redirects = ${JSON.stringify(redirects, null, 2)};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirectTo = redirects[url.pathname];

    if (redirectTo) {
      const destination = new URL(redirectTo, url.origin);
      destination.search = url.search;
      return Response.redirect(destination, 301);
    }

    if (!url.pathname.includes(".") && !url.pathname.endsWith("/")) {
      url.pathname += "/";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
`
);

console.log(`Built ${pages.length} pages, ${blogPages.length} blog pages and ${Object.keys(blogForwards).length} forwards into dist/`);
