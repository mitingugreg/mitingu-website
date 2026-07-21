# Mitingu Enterprise Website

Modern enterprise SaaS rebuild for Mitingu, built as an editable static HTML/CSS site with a small Sites-compatible Worker wrapper.

## Run locally

```bash
npm install
PORT=3003 npm run cms
```

Open the CMS at:

```text
http://localhost:3003/cms/
```

Use a different port if needed:

```bash
PORT=3004 npm run cms
```

## Build

```bash
npm run build
```

## Editing

- Main editable content lives in `content/site-content.json`.
- The purpose-built local CMS lives in `cms/` and saves back to `content/site-content.json`.
- The CMS Media Library uploads new images, replaces existing images and updates image settings.
- Page layouts and reusable HTML sections live in `src/site.mjs`.
- The visual system is in `src/styles.css`.
- The build script is `src/build.mjs`.
- The local preview server is `scripts/dev-server.mjs`.
- Uploaded images are stored in `public/assets/`.

The demo form currently opens an email to `hello@mitingu.com`. Replace the form action in `src/site.mjs` when you connect HubSpot, a CRM or a server-side lead endpoint.
