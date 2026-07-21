import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pages, redirects, renderPage, renderNotFound } from "./site.mjs";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
const server = join(dist, "server");
const origin = "https://www.mitingu.com";

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

await cp(join(root, "public"), client, { recursive: true });
await cp(join(root, "src", "styles.css"), join(client, "styles.css"));

for (const path of pages) {
  const filePath =
    path === "/" ? join(client, "index.html") : join(client, path, "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, renderPage(path));
}

await writeFile(join(client, "404.html"), renderNotFound());

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (path) => `  <url>
    <loc>${origin}${path === "/" ? "" : path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : path.includes("solutions") ? "0.8" : "0.9"}</priority>
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

Mitingu is the Event Operations Platform for corporate event teams and event agencies.

## What Mitingu Does

- Planning support for corporate event programmes
- Branded event websites
- Event registration
- Event communications
- Collaboration and attendee management
- Event delivery support
- Event analytics and reporting
- Event Intelligence
- Mitingu MCP for compatible AI assistants
- White-label event environments
- Multi-office and multi-region event programme control

## Best Fit

- Corporate event teams
- Event marketing teams
- Internal communications teams
- Event agencies
- Enterprise organisations with multiple offices, regions, brands or clients

## Key Pages

- ${origin}/platform
- ${origin}/event-intelligence
- ${origin}/mcp
- ${origin}/white-label-event-platform
- ${origin}/enterprise-event-registration-platform
- ${origin}/event-communications-platform
- ${origin}/event-analytics-reporting
- ${origin}/pricing
- ${origin}/about
- ${origin}/book-a-demo

## Mitingu MCP

Mitingu connects with compatible MCP clients, including Claude and ChatGPT. It is compatible with Microsoft Copilot environments that support MCP, subject to configuration. Available information and tools depend on the permissions and Mitingu capabilities enabled for each account.

## Contact

Email: hello@mitingu.com
Website: ${origin}
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

console.log(`Built ${pages.length} pages into dist/`);
