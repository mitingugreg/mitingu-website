# Editing Guide

This site now has its own local CMS for routine content edits.

## CMS

Start the local server:

```bash
PORT=3003 npm run cms
```

Open:

```text
http://localhost:3003/cms/
```

If that port is busy, choose another:

```bash
PORT=3004 npm run cms
```

The CMS saves to `content/site-content.json` and rebuilds the preview automatically.

## Main copy

Most reusable copy is in `content/site-content.json`:

- navigation labels
- page hero copy
- short answer boxes
- image paths, alt text and captions
- SEO titles and descriptions
- FAQs
- proof points
- outcome cards
- platform modules
- AI questions
- pricing cards
- resources
- footer contact details

Edit through the CMS for day-to-day changes. Direct JSON edits are also fine if you prefer.

## Individual pages

The page layouts are rendered from the `pageBodies` object in `src/site.mjs`:

- `/`
- `/platform`
- `/ai-insights`
- `/pricing`
- `/resources`
- `/book-a-demo`
- `/solutions/corporate-events`
- `/solutions/event-agencies`
- `/solutions/multi-office-event-programmes`

The markup is plain HTML inside template strings. Change layout structure there; change copy in the CMS where possible.

## Styling

All global styling is in `src/styles.css`.

Start with the colour variables at the top of the file. The main palette is designed to feel enterprise, practical and product-led without becoming a generic blue SaaS theme.

## Images

Images live in `public/assets/` and can be managed through the CMS.

Use the CMS `Media Library` section to:

- upload a new PNG, JPG, WEBP or GIF image
- replace an existing image while keeping the same path
- copy an image path such as `/assets/showcase-reports-assistant.webp`
- assign an image as the logo, product screenshot or domain restriction image

Use the CMS `Image Settings` section to edit:

- image paths
- alt text
- screenshot captions

Current key images:

- `mitingu-logo.png`
- `showcase-reports-assistant.webp`
- `showcase-event-analytics.webp`
- `showcase-nps-dashboard.webp`
- `showcase-communications.webp`
- `product-domain-restriction.png`

Use real product screenshots where possible.

## Demo form

The form is in `src/site.mjs` under `demoForm`.

It currently uses a simple `mailto:` action. Replace that action with HubSpot, CRM or server endpoint details before the site is used for live lead capture.
