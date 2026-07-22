import { readFileSync } from "node:fs";

const contentUrl = new URL("../content/site-content.json", import.meta.url);

export function loadSiteContent() {
  return JSON.parse(readFileSync(contentUrl, "utf8"));
}

const content = loadSiteContent();
const defaultMedia = {
  logo: {
    src: "/assets/mitingu-logo.png",
    alt: "Mitingu",
  },
  productScreenshot: {
    src: "/assets/showcase-reports-assistant.webp",
    alt: "Mitingu Reports Assistant screen for asking event data questions and generating reports",
    caption: "Reports Assistant helps teams ask useful questions about event data and create clearer stakeholder reports.",
  },
  domainRestriction: {
    src: "/assets/product-domain-restriction.png",
    alt: "Mitingu domain restriction control",
  },
  registrationScreenshot: {
    src: "/assets/expo-registration-mitingu.webp",
    alt: "Example branded event registration website shown on laptop and mobile screens",
    caption: "Create branded registration journeys that look right on desktop and mobile.",
  },
};

export const site = content.site;
const media = Object.fromEntries(
  Object.entries(defaultMedia).map(([key, value]) => [
    key,
    { ...value, ...((content.media && content.media[key]) || {}) },
  ]),
);
const navItems = content.navItems;
const solutionLinks = content.solutionLinks;
const proofPoints = content.proofPoints;
const outcomes = content.outcomes;
const eventStages = content.eventStages;
const aiQuestions = content.aiQuestions;
const enterpriseControls = content.enterpriseControls;
const platformModules = content.platformModules;
const solutions = content.solutions;
const pricingPlans = content.pricingPlans;
const resources = content.resources;
const moneyPages = content.moneyPages;
const discoveryFaqs = content.discoveryFaqs;
const intentClusters = content.intentClusters;
const caseStudy = content.caseStudy;
const metadata = content.metadata;
const pageCopy = content.pageCopy || {};
const homePage = content.homePage || {};
const eventIntelligencePage = content.eventIntelligencePage || {};
const mcpPage = content.mcpPage || {};
const aboutPage = content.aboutPage || {};
const finalCtaCopy = content.finalCta || {};
export const redirects = content.redirects;

export const pages = Object.keys(metadata);

export function renderPage(path) {
  const [title, description] = metadata[path];
  return layout({
    path,
    title,
    description,
    body: pageBodies[path](),
  });
}

export function renderNotFound() {
  return layout({
    path: "/404",
    title: "Page not found",
    description: "Sorry, we could not find that page. Explore the Mitingu Event Operations Platform instead.",
    body: `<section class="page-hero">
      <div>
        <p class="eyebrow">404</p>
        <h1>We could not find that page.</h1>
        <p>The page may have moved. Head back to the homepage or explore the platform.</p>
        <div class="hero-actions">
          ${button("/", "Back to home")}
          ${button("/platform", "Explore the Platform", "secondary")}
        </div>
      </div>
    </section>`,
  });
}

function layout({ path, title, description, body }) {
  const fullTitle =
    path === "/"
      ? "Mitingu | Event Operations Platform for Corporate Event Teams"
      : title.includes("|")
        ? title
        : `${title} | Mitingu`;
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${fullTitle}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="https://www.mitingu.com${path === "/" ? "" : path}">
    <meta name="theme-color" content="#151716">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Mitingu">
    <meta property="og:url" content="https://www.mitingu.com${path === "/" ? "" : path}">
    <meta property="og:image" content="https://www.mitingu.com/screenshot.jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="750">
    <meta property="og:image:alt" content="Mitingu Event Operations Platform">
    <meta property="og:locale" content="en_GB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://www.mitingu.com/screenshot.jpeg">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/styles.css">
    ${jsonLd(path, fullTitle, description)}
  </head>
  <body>
    ${header()}
    <main>
      ${body}
    </main>
    ${footer()}
    ${cookieBanner()}
    ${path === "/" ? homepageShowcaseScript() : ""}
    ${cookieScript()}
  </body>
</html>`;
}

function jsonLd(path, title, description) {
  const url = `https://www.mitingu.com${path === "/" ? "" : path}`;
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://www.mitingu.com/#organization",
      name: "Mitingu",
      url: "https://www.mitingu.com",
      logo: `https://www.mitingu.com${media.logo.src}`,
      sameAs: [site.linkedin, site.instagram],
      contactPoint: {
        "@type": "ContactPoint",
        email: site.email,
        telephone: site.phone,
        contactType: "sales",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.mitingu.com/#website",
      url: "https://www.mitingu.com",
      name: "Mitingu",
      publisher: { "@id": "https://www.mitingu.com/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.mitingu.com/#software",
      name: "Mitingu",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.mitingu.com",
      description:
        "Event operations platform for corporate event teams and agencies, keeping planning, registration, communications, reporting and event intelligence in one place.",
      offers: {
        "@type": "Offer",
        price: "Contact for pricing",
        priceCurrency: "GBP",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": "https://www.mitingu.com/#website" },
      about: { "@id": "https://www.mitingu.com/#software" },
    },
  ];

  const faqs = faqsForPath(path);
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    });
  }

  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  })}</script>`;
}

function header() {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Mitingu home">
      <img src="${media.logo.src}" alt="${media.logo.alt}">
    </a>
    <nav class="site-nav" aria-label="Primary navigation">
      ${navItems
        .map(([label, href]) =>
          label === "Solutions"
            ? `<details class="nav-details">
        <summary>Solutions</summary>
        <div class="nav-popover">
          ${solutionLinks.map(([solutionLabel, solutionHref]) => `<a href="${solutionHref}">${solutionLabel}</a>`).join("")}
        </div>
      </details>`
            : `<a href="${href}">${label}</a>`,
        )
        .join("")}
    </nav>
    ${button("/book-a-demo", "Book a Demo", "dark")}
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <div>
        <img class="footer-logo" src="${media.logo.src}" alt="${media.logo.alt}">
        <p>For corporate event teams and agencies who need less chasing and more control.</p>
      </div>
      <div>
        <h2>Platform</h2>
        <a href="/platform">Platform</a>
        <a href="/event-intelligence">Event Intelligence</a>
        <a href="/mcp">Mitingu MCP</a>
        <a href="/white-label-event-platform">White-label platform</a>
      </div>
      <div>
        <h2>Solutions</h2>
        ${solutionLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
        <a href="/enterprise-event-registration-platform">Registration capability</a>
      </div>
      <div>
        <h2>Contact</h2>
        <a href="/pricing">Pricing</a>
        <a href="/resources">Resources</a>
        <a href="/about">About</a>
        <a href="/book-a-demo">Book a Demo</a>
        <a href="mailto:${site.email}">${site.email}</a>
        <a href="tel:${site.phone.replaceAll(" ", "")}">${site.phone}</a>
        <a href="${site.linkedin}">LinkedIn</a>
        <a href="${site.instagram}">Instagram</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms-and-conditions">Terms</a>
      </div>
    </div>
    <p class="footer-small">Made in Cornwall, used globally by teams responsible for important corporate events.</p>
  </footer>`;
}

function cookieBanner() {
  return `<div class="cookie-banner" data-cookie-banner hidden role="region" aria-label="Cookie consent">
    <div class="cookie-inner">
      <p>We use cookies to run this site and understand how it is used. See our <a href="/privacy-policy">Privacy Policy</a>.</p>
      <div class="cookie-actions">
        <button type="button" class="cookie-btn cookie-btn-ghost" data-cookie-decline>Decline</button>
        <button type="button" class="cookie-btn cookie-btn-solid" data-cookie-accept>Accept</button>
      </div>
    </div>
  </div>`;
}

function cookieScript() {
  return `<script>
(() => {
  const KEY = "mitingu-cookie-consent";
  const banner = document.querySelector("[data-cookie-banner]");
  if (!banner) return;
  let stored = null;
  try { stored = window.localStorage.getItem(KEY); } catch (e) {}
  if (!stored) {
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add("is-visible"));
  }
  const choose = (value) => {
    try { window.localStorage.setItem(KEY, value); } catch (e) {}
    banner.classList.remove("is-visible");
    window.setTimeout(() => { banner.hidden = true; }, 250);
  };
  banner.querySelector("[data-cookie-accept]").addEventListener("click", () => choose("accepted"));
  banner.querySelector("[data-cookie-decline]").addEventListener("click", () => choose("declined"));
})();
</script>`;
}

function button(href, label, variant = "primary") {
  return `<a class="button button-${variant}" href="${href}"><span>${label}</span><span aria-hidden="true">-&gt;</span></a>`;
}

function sectionIntro(eyebrow, title, text = "", align = "left") {
  return `<div class="section-intro ${align === "center" ? "centered" : ""}">
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
    <h2>${title}</h2>
    ${text ? `<p>${text}</p>` : ""}
  </div>`;
}

function pageHero(eyebrow, title, text, aside = "") {
  return `<section class="page-hero">
    <div>
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${text}</p>
    </div>
    ${aside ? `<div class="page-hero-aside">${aside}</div>` : ""}
  </section>`;
}

function copyBlock(path, key, defaults) {
  return {
    ...defaults,
    ...((pageCopy[path] && pageCopy[path][key]) || {}),
  };
}

function renderPageHero(path, defaults, aside = "") {
  const hero = copyBlock(path, "hero", defaults);
  return pageHero(hero.eyebrow, hero.title, hero.text, aside);
}

function renderAnswerBox(path, defaults) {
  const answer = copyBlock(path, "answer", defaults);
  return answerBox(answer.title, answer.text, answer.facts || []);
}

function heroChecklist(path, fallbackItems) {
  const hero = copyBlock(path, "hero", { checklist: fallbackItems });
  return `<div class="hero-checklist">${(hero.checklist || fallbackItems)
    .map((item) => `<span>${item}</span>`)
    .join("")}</div>`;
}

function demoNoteAside(path, fallbackItems) {
  const hero = copyBlock(path, "hero", { signals: fallbackItems });
  return `<div class="demo-note"><strong>Good fit signals</strong>${(hero.signals || fallbackItems)
    .map((item) => `<span>${item}</span>`)
    .join("")}</div>`;
}

function homeHeroSection() {
  const hero = {
    eyebrow: "Enterprise event infrastructure",
    title: "Make running corporate events simpler.",
    text: "Keep planning, registration, communications, reporting and Event Intelligence in one place.",
    primaryAction: ["Book a Demo", "/book-a-demo"],
    secondaryAction: ["Explore the Platform", "/platform"],
    ...(homePage.hero || copyBlock("/", "hero", {})),
  };

  const [primaryLabel, primaryHref] = hero.primaryAction;
  const [secondaryLabel, secondaryHref] = hero.secondaryAction;

  return `<section class="hero-section">
    <div class="hero-copy">
      <p class="eyebrow">${hero.eyebrow}</p>
      <h1>${hero.title}</h1>
      <p>${hero.text}</p>
      ${hero.supportLine ? `<p class="hero-support">${hero.supportLine}</p>` : ""}
      <div class="hero-actions">
        ${button(primaryHref, primaryLabel)}
        ${button(secondaryHref, secondaryLabel, "secondary")}
      </div>
    </div>
    ${heroVisual(hero.showcase)}
  </section>`;
}

function objectCards(items = [], className = "info-card", columns = "three") {
  return `<div class="card-grid ${columns}">
    ${items
      .map((item) => `<article class="${className}"><h3>${item.title}</h3><p>${item.text || item.description || ""}</p></article>`)
      .join("")}
  </div>`;
}

function statusLabel(status = "") {
  return status ? `<span class="status-label">${status}</span>` : "";
}

function statusCards(items = [], columns = "three") {
  return `<div class="card-grid ${columns}">
    ${items
      .map(
        (item) => `<article class="info-card status-card">
      ${statusLabel(item.status)}
      <h3>${item.title}</h3>
      <p>${item.text || item.description || ""}</p>
      ${item.link ? `<a href="${item.link}">Learn more -&gt;</a>` : ""}
    </article>`,
      )
      .join("")}
  </div>`;
}

function capabilityShowcase(items = []) {
  return `<div class="card-grid two">
    ${items
      .map(
        (item) => `<article class="visual-card">
      ${item.image ? `<img src="${item.image}" alt="${item.alt || ""}" loading="lazy" decoding="async">` : ""}
      <div>
        ${statusLabel(item.status)}
        <h3>${item.title}</h3>
        <p>${item.description || item.text || ""}</p>
      </div>
    </article>`,
      )
      .join("")}
  </div>`;
}

function mcpDiagram(items = []) {
  return `<div class="mcp-diagram" aria-label="How Mitingu MCP connects assistants and event context">
    ${(items || []).map((item, index) => `${index ? `<span class="diagram-connector" aria-hidden="true">&#8597;</span>` : ""}<div>${item}</div>`).join("")}
  </div>`;
}

function homeTrustedStrip() {
  const section = homePage.trustedBy || {};
  return `<section class="trust-strip" aria-label="Trusted by">
    <p>${section.text || "Trusted by teams responsible for important corporate events."}</p>
    <div>${(section.items || proofPoints).map((point) => `<span>${point}</span>`).join("")}</div>
  </section>`;
}

function homeTextBand(section, extraClass = "") {
  return `<section class="content-band ${extraClass}">
    ${sectionIntro(section.eyebrow, section.title, section.text)}
  </section>`;
}

function homeProblem() {
  const section = homePage.problem || {};
  return `<section class="content-band">
    ${sectionIntro(section.eyebrow, section.title, section.text)}
    ${objectCards(section.cards || [], "info-card", "three")}
  </section>`;
}

function homeCapabilities() {
  const section = homePage.betterWay || {};
  return `<section id="how-it-works" class="content-section">
    ${sectionIntro(section.eyebrow, section.title, section.text)}
    ${objectCards(section.capabilities, "module-card", "three")}
  </section>`;
}

function homeDifference() {
  const section = homePage.difference || {};
  return `<section class="content-band">
    ${sectionIntro(section.eyebrow, section.title)}
    ${objectCards(section.points, "info-card", "four")}
  </section>`;
}

function homeMcp() {
  const section = homePage.mcp || {};
  return `<section class="content-section" id="mcp">
    <div class="split-panel mcp-panel">
      <div>
        <p class="eyebrow">${section.eyebrow || "Mitingu MCP"}</p>
        <div class="section-title-row">
          <h2>${section.title || "Use the AI assistant your team already trusts."}</h2>
          ${statusLabel(section.status)}
        </div>
        <p>${section.text || ""}</p>
        ${section.supportLine ? `<p class="support-note">${section.supportLine}</p>` : ""}
        ${section.qualification ? `<p class="small-note">${section.qualification}</p>` : ""}
        ${button(section.ctaHref || "/mcp", section.ctaLabel || "Explore Mitingu MCP", "secondary")}
      </div>
      ${mcpDiagram(section.diagram || [])}
    </div>
    ${statusCards(section.benefits || [], "three")}
  </section>`;
}

function homeEventIntelligence() {
  const section = homePage.eventIntelligence || {};
  return `<section class="content-section">
    <div class="intelligence-panel">
      <div>
        <p class="eyebrow">${section.eyebrow}</p>
        <h2>${section.title}</h2>
        <p>${section.text}</p>
      </div>
      <div class="memory-list">
        ${(section.memoryItems || []).map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
    ${statusCards(section.parts || [], "three")}
  </section>`;
}

function homeProof() {
  const section = homePage.proof || {};
  return `<section class="content-band">
    ${sectionIntro(section.eyebrow, section.title, section.text)}
    <div class="control-list">${(section.points || proofPoints).map((point) => `<span>${point}</span>`).join("")}</div>
  </section>`;
}

function homeAudiences() {
  const section = homePage.audiences || {};
  return `<section class="content-section">
    ${sectionIntro(section.eyebrow, section.title)}
    ${objectCards(section.items, "solution-card", "three")}
  </section>`;
}

function homeFinalCta() {
  const cta = homePage.finalCta || {};
  return `<section class="final-cta">
    <div>
      <p class="eyebrow">${cta.eyebrow}</p>
      <h2>${cta.title}</h2>
      <p>${cta.text}</p>
    </div>
    ${button(cta.actionHref || "/book-a-demo", cta.actionLabel || "Book a demo", "dark")}
  </section>`;
}

function renderHomePage() {
  return `
    ${homeHeroSection()}
    ${homeTrustedStrip()}
    ${homeProblem()}
    ${homeCapabilities()}
    ${homeDifference()}
    ${homeMcp()}
    ${homeEventIntelligence()}
    ${homeProof()}
    ${homeAudiences()}
    ${homeTextBand(homePage.philosophy || {}, "compact")}
    ${faqSection("/")}
    ${homeFinalCta()}
  `;
}

function answerBox(title, text, facts = []) {
  return `<section class="answer-box">
    <div>
      <p class="eyebrow">Short answer</p>
      <h2>${title}</h2>
      <p>${text}</p>
    </div>
    ${facts.length ? `<ul>${facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>` : ""}
  </section>`;
}

function moneyPagesGrid() {
  return `<div class="card-grid four">
    ${moneyPages
      .map(
        ([title, href, text]) =>
          `<a class="solution-card intent-card" href="${href}"><h3>${title}</h3><p>${text}</p><span>View page -&gt;</span></a>`,
      )
      .join("")}
  </div>`;
}

function intentGrid() {
  return `<div class="card-grid four">
    ${intentClusters
      .map(([title, text]) => `<article class="info-card"><h3>${title}</h3><p>${text}</p></article>`)
      .join("")}
  </div>`;
}

function faqSection(path) {
  const faqs = faqsForPath(path);
  if (!faqs.length) return "";
  return `<section class="content-section faq-section">
    ${sectionIntro("FAQ", "Straight answers.", "Short answers to the questions teams usually ask before a demo.")}
    <div class="faq-list">
      ${faqs
        .map(
          ([question, answer]) =>
            `<details><summary>${question}</summary><p>${answer}</p></details>`,
        )
        .join("")}
    </div>
  </section>`;
}

function faqsForPath(path) {
  const pageFaqs = {
    "/white-label-event-platform": [
      [
        "What is a white-label event platform?",
        "A white-label event platform lets an organisation or agency deliver event websites, registration, communications and reports under its own brand rather than the software vendor brand.",
      ],
      [
        "Can agencies use Mitingu for client delivery?",
        "Yes. Agencies can use Mitingu to create branded client event environments, reusable event templates, client-ready reporting and controlled access for different teams.",
      ],
      [
        "Can each client, office or region have a separate event account?",
        "Yes. Mitingu can support separate structures for brands, offices, regions or clients, with permissions and central visibility.",
      ],
    ],
    "/enterprise-event-registration-platform": [
      [
        "How does Mitingu support enterprise event registration?",
        "Registration can sit alongside branded event sites, permissions, communications, analytics and reporting.",
      ],
      [
        "Can Mitingu replace spreadsheets and basic registration forms?",
        "Yes. Mitingu is designed for teams that need repeatable registration journeys, attendee data control, branded communications and reporting beyond ad hoc forms.",
      ],
      [
        "Does Mitingu support internal and invite-only events?",
        "Yes. Mitingu can support internal, private, public, invite-only, paid and pre-registration events depending on the programme.",
      ],
    ],
    "/event-analytics-reporting": [
      [
        "What event reporting does Mitingu provide?",
        "Teams can report on registrations, attendance, feedback, engagement, event performance and regional or office-level trends.",
      ],
      [
        "Can Mitingu create custom event reports?",
        "Yes. Event dashboards and custom reports can focus on the data that matters for each event or programme.",
      ],
      [
        "How does AI help with event reporting?",
        "AI helps teams ask questions of event data, generate summaries and identify patterns across topics, audiences, offices, regions and event outcomes.",
      ],
    ],
    "/event-communications-platform": [
      [
        "What event communications can Mitingu manage?",
        "Mitingu can manage branded invitations, confirmations, reminders, updates, segmented emails and post-event follow-up communications.",
      ],
      [
        "Can event emails use our brand and domain?",
        "Yes. Event emails can be branded so messages feel like they come from your organisation or client.",
      ],
      [
        "Can communications be segmented by attendee data?",
        "Yes. Mitingu can support targeted communications based on registration, attendee and event data so different audiences receive relevant updates.",
      ],
    ],
  };

  return [...(pageFaqs[path] || []), ...(path === "/" ? discoveryFaqs : [])];
}

function heroShowcaseItems(showcase = []) {
  const fallback = [
    {
      label: "Mitingu Analytics",
      title: "See event performance clearly.",
      subtitle: media.productScreenshot.caption || "Real product visual from Mitingu analytics.",
      image: media.productScreenshot.src,
      alt: media.productScreenshot.alt,
    },
  ];

  return (Array.isArray(showcase) && showcase.length ? showcase : fallback)
    .map((item) => ({
      label: item.label || item.title || "Product screen",
      title: item.title || item.label || "Product screen",
      subtitle: item.subtitle || item.text || "",
      image: item.image || item.src || media.productScreenshot.src,
      alt: item.alt || media.productScreenshot.alt,
      fit: item.fit === "contain" ? "contain" : "cover",
    }))
    .filter((item) => item.image);
}

function heroVisual(showcase = []) {
  const items = heroShowcaseItems(showcase);

  return `<section class="hero-showcase" role="region" aria-roledescription="carousel" aria-label="Mitingu product showcase" data-showcase>
    <div class="showcase-frame" tabindex="0">
      <div class="showcase-slides">
        ${items
          .map(
            (item, index) => `<article class="showcase-slide${item.fit === "contain" ? " showcase-slide-contain" : ""}${index === 0 ? " is-active" : ""}" data-showcase-slide aria-hidden="${index === 0 ? "false" : "true"}">
          <img src="${item.image}" alt="${item.alt}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </article>`,
          )
          .join("")}
      </div>
      <button class="showcase-arrow previous" type="button" data-showcase-prev aria-label="Previous product screen"><span aria-hidden="true">&#8249;</span></button>
      <button class="showcase-arrow next" type="button" data-showcase-next aria-label="Next product screen"><span aria-hidden="true">&#8250;</span></button>
    </div>
    <div class="showcase-caption">
      ${items
        .map(
          (item, index) => `<article class="showcase-copy${index === 0 ? " is-active" : ""}" data-showcase-caption aria-hidden="${index === 0 ? "false" : "true"}">
        <p class="showcase-kicker">${item.label}</p>
        <p class="showcase-title">${item.title}</p>
        <p>${item.subtitle}</p>
      </article>`,
        )
        .join("")}
    </div>
    <div class="showcase-dots" aria-label="Choose product screen">
      ${items
        .map(
          (item, index) => `<button class="showcase-dot${index === 0 ? " is-active" : ""}" type="button" data-showcase-dot data-showcase-index="${index}" aria-label="Show ${item.label}" aria-current="${index === 0 ? "true" : "false"}"><span class="sr-only">Show ${item.label}</span></button>`,
        )
        .join("")}
    </div>
  </section>`;
}

function homepageShowcaseScript() {
  return `<script>
(() => {
  const carousels = document.querySelectorAll("[data-showcase]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-showcase-slide]"));
    const captions = Array.from(carousel.querySelectorAll("[data-showcase-caption]"));
    const dots = Array.from(carousel.querySelectorAll("[data-showcase-dot]"));
    const previous = carousel.querySelector("[data-showcase-prev]");
    const next = carousel.querySelector("[data-showcase-next]");
    const interval = 4000;
    let active = 0;
    let timer = null;
    let paused = false;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (paused || reduceMotion.matches || slides.length < 2) return;
      timer = window.setInterval(() => setActive(active + 1), interval);
    };

    const setActive = (index) => {
      active = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === active;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      captions.forEach((caption, captionIndex) => {
        const isActive = captionIndex === active;
        caption.classList.toggle("is-active", isActive);
        caption.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === active;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        setActive(Number(dot.dataset.showcaseIndex || 0));
        start();
      });
    });

    previous?.addEventListener("click", () => {
      setActive(active - 1);
      start();
    });

    next?.addEventListener("click", () => {
      setActive(active + 1);
      start();
    });

    carousel.addEventListener("mouseenter", () => {
      paused = true;
      stop();
    });

    carousel.addEventListener("mouseleave", () => {
      paused = false;
      start();
    });

    carousel.addEventListener("focusin", () => {
      paused = true;
      stop();
    });

    carousel.addEventListener("focusout", (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      paused = false;
      start();
    });

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(active - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(active + 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        setActive(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        setActive(slides.length - 1);
      }
    });

    reduceMotion.addEventListener?.("change", start);
    start();
  });
})();
</script>`;
}

function trustStrip() {
  return `<section class="trust-strip" aria-label="Enterprise proof">
    <p>Trusted by teams who need more than another registration form.</p>
    <div>${proofPoints.map((point) => `<span>${point}</span>`).join("")}</div>
  </section>`;
}

function cards(items, className = "info-card", columns = "four") {
  return `<div class="card-grid ${columns}">
    ${items.map(([title, text]) => `<article class="${className}"><h3>${title}</h3><p>${text}</p></article>`).join("")}
  </div>`;
}

function stages() {
  return `<div class="stage-grid">
    ${eventStages.map(([label, title, text]) => `<article class="stage-card"><span>${label}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
  </div>`;
}

function aiPanel() {
  return `<div class="ai-panel">
    <div>
      <p class="eyebrow">Event Intelligence</p>
      <h2>Ask better questions of your event data.</h2>
      <p>Ask questions, create reports and spot patterns across offices, audiences and event programmes.</p>
    </div>
    <div class="question-stack">
      ${aiQuestions.map((question) => `<div class="question">${question}</div>`).join("")}
    </div>
  </div>`;
}

function controlList() {
  return `<div class="control-list">${enterpriseControls.map((item) => `<span>${item}</span>`).join("")}</div>`;
}

function solutionsGrid() {
  return `<div class="card-grid three">
    ${solutions.map(([title, href, text]) => `<a class="solution-card" href="${href}"><h3>${title}</h3><p>${text}</p><span>Explore -&gt;</span></a>`).join("")}
  </div>`;
}

function caseStudySection() {
  return `<section class="case-study">
    <div><p class="eyebrow">Proof structure</p><h2>A scalable event programme in practice.</h2></div>
    <div class="case-grid">
      ${caseStudy.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}
    </div>
  </section>`;
}

function finalCta(extraClass = "", override = {}) {
  const cta = {
    eyebrow: "See Mitingu in action",
    title: "Ready to modernise your event operation?",
    text: "See how Mitingu can help your team launch faster, communicate better and understand what is working.",
    actionLabel: "See Mitingu in Action",
    actionHref: "/book-a-demo",
    ...finalCtaCopy,
    ...override,
  };

  return `<section class="final-cta ${extraClass}">
    <div>
      <p class="eyebrow">${cta.eyebrow}</p>
      <h2>${cta.title}</h2>
      <p>${cta.text}</p>
    </div>
    ${button(cta.actionHref, cta.actionLabel, "dark")}
  </section>`;
}

function screenshotFigure() {
  return `<figure class="screenshot-frame">
    <img src="${media.productScreenshot.src}" alt="${media.productScreenshot.alt}">
    <figcaption>${media.productScreenshot.caption}</figcaption>
  </figure>`;
}

function registrationFigure() {
  return `<figure class="screenshot-frame">
    <img src="${media.registrationScreenshot.src}" alt="${media.registrationScreenshot.alt}" loading="lazy" decoding="async">
    <figcaption>${media.registrationScreenshot.caption}</figcaption>
  </figure>`;
}

function heroFlowVisual(title, items, footer = "", modifier = "") {
  return `<div class="hero-visual-card${modifier ? ` ${modifier}` : ""}" aria-label="${title}">
    <p class="hero-visual-title">${title}</p>
    <div class="hero-flow">
      ${items
        .map(
          (item, index) => `${index ? `<span class="hero-flow-connector" aria-hidden="true">&#8595;</span>` : ""}<span class="hero-flow-step">${item}</span>`,
        )
        .join("")}
    </div>
    ${footer ? `<p class="hero-visual-footer">${footer}</p>` : ""}
  </div>`;
}

function aboutHeroVisual() {
  return heroFlowVisual("A simpler operating story", ["Experience", "Understanding", "Simpler event operations"]);
}

function corporateHeroVisual() {
  return heroFlowVisual("A clearer event rhythm", ["Plan", "Register", "Communicate", "Deliver", "Review"]);
}

function resourceHeroVisual() {
  const covers = [
    "Corporate Event Planning Checklist",
    "Event Communications Timeline",
    "Before You Buy Event Software",
  ];

  return `<div class="hero-visual-card guide-visual" aria-label="Coming soon resource guides">
    <p class="hero-visual-title">Coming soon</p>
    <div class="guide-cover-stack">
      ${covers
        .map(
          (cover, index) => `<article class="guide-cover guide-cover-${index + 1}">
        <span>Coming Soon</span>
        <h3>${cover}</h3>
      </article>`,
        )
        .join("")}
    </div>
  </div>`;
}

function pricingHeroVisual() {
  return `<div class="hero-visual-card plan-visual" aria-label="What shapes your plan">
    <p class="hero-visual-title">What shapes your plan</p>
    <div class="plan-factor-list">
      <span>Event scale</span>
      <span>Support</span>
      <span>Account structure</span>
      <span>White-label</span>
    </div>
    <span class="hero-flow-connector" aria-hidden="true">&#8595;</span>
    <p class="plan-outcome">The right plan for your organisation</p>
  </div>`;
}

function eventIntelligenceHeroVisual() {
  return `<figure class="screenshot-frame hero-screenshot-frame">
    <img src="/assets/showcase-event-analytics.webp" alt="Mitingu Event Analytics dashboard showing event performance metrics" loading="lazy" decoding="async">
    <figcaption>
      <span>Analytics</span>
      <span>Reporting</span>
      <span>Communications</span>
      <span>AI</span>
    </figcaption>
  </figure>`;
}

function mcpHeroVisual() {
  return `<div class="hero-visual-card mcp-hero-visual" aria-label="Mitingu MCP connection diagram">
    <p class="hero-visual-title">Available now</p>
    <div class="assistant-row">
      <span>ChatGPT</span>
      <span>Claude</span>
      <span>Copilot</span>
    </div>
    <span class="hero-flow-connector" aria-hidden="true">&#8595;</span>
    <span class="hero-flow-step hero-flow-primary">Mitingu MCP</span>
    <span class="hero-flow-connector" aria-hidden="true">&#8595;</span>
    <span class="hero-flow-step">Event Context</span>
    <span class="hero-flow-connector" aria-hidden="true">&#8595;</span>
    <p class="plan-outcome">Useful Answers</p>
  </div>`;
}

function agencyHeroVisual() {
  return `<div class="hero-visual-card branch-visual" aria-label="Agency client delivery diagram">
    <p class="hero-visual-title">Agency delivery</p>
    <span class="hero-flow-step hero-flow-primary">Agency</span>
    <div class="branch-row">
      <span>Client A</span>
      <span>Client B</span>
      <span>Client C</span>
    </div>
    <div class="branch-row">
      <span>Events</span>
      <span>Reports</span>
      <span>Branding</span>
    </div>
  </div>`;
}

function multiOfficeHeroVisual() {
  return `<div class="hero-visual-card branch-visual" aria-label="Multi-office event programme diagram">
    <p class="hero-visual-title">Central visibility. Local control.</p>
    <span class="hero-flow-step hero-flow-primary">Central Team</span>
    <div class="branch-row">
      <span>London</span>
      <span>New York</span>
      <span>Singapore</span>
    </div>
    <span class="hero-flow-step">Local Events</span>
    <p class="hero-visual-footer">Shared standards across every office.</p>
  </div>`;
}

function platformGrid() {
  return cards(platformModules, "module-card", "two");
}

function pricingCards() {
  return `<div class="pricing-grid">
    ${pricingPlans.map(([name, description, features]) => `<article class="pricing-card">
      <h3>${name}</h3><p>${description}</p>
      <ul>${features.map((feature) => `<li>${feature}</li>`).join("")}</ul>
      ${button("/book-a-demo", "Talk to us", "secondary")}
    </article>`).join("")}
  </div>`;
}

function resourceCards() {
  return `<div class="card-grid two">
    ${resources
      .map(
        ([title, status, text]) => `<article class="resource-card">
      <span class="resource-card-badge">${status || "Coming Soon"}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <span class="resource-card-action" aria-disabled="true">Coming Soon</span>
    </article>`,
      )
      .join("")}
  </div>`;
}

function demoForm() {
  const endpoint = site.formEndpoint || "https://api.web3forms.com/submit";
  return `<form class="demo-form" data-demo-form action="${endpoint}" method="POST" novalidate>
    <input type="hidden" name="access_key" value="${site.formAccessKey || ""}">
    <input type="hidden" name="subject" value="New Mitingu demo request">
    <input type="hidden" name="from_name" value="Mitingu website">
    <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
    <div><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
    <div><label for="email">Work email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
    <div><label for="company">Company</label><input id="company" name="company" type="text" autocomplete="organization" required></div>
    <div>
      <label for="scale">Event scale</label>
      <select id="scale" name="event_scale">
        <option value="">Select one</option>
        <option>1-10 events a year</option>
        <option>10-100 events a year</option>
        <option>100+ events a year</option>
        <option>Agency or client delivery</option>
      </select>
    </div>
    <div class="full"><label for="message">What needs to change?</label><textarea id="message" name="message" rows="5"></textarea></div>
    <button class="button button-primary" type="submit"><span>Request a demo</span><span aria-hidden="true">-&gt;</span></button>
    <p class="form-status" data-form-status role="status" aria-live="polite" hidden></p>
    <p class="form-note">We usually reply within one working day. Prefer email? Write to <a href="mailto:${site.email}">${site.email}</a>.</p>
  </form>
  ${demoFormScript()}`;
}

function demoFormScript() {
  return `<script>
(() => {
  const form = document.querySelector("[data-demo-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector("button[type=submit]");
  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.dataset.state = state;
  };
  form.addEventListener("submit", async (event) => {
    const keyField = form.querySelector("input[name=access_key]");
    if (!keyField || !keyField.value) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    const original = button.innerHTML;
    button.innerHTML = "<span>Sending...</span>";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        setStatus("Thank you. Your demo request has been sent and we will be in touch shortly.", "success");
      } else {
        const data = await response.json().catch(() => ({}));
        const detail = data && data.message ? data.message : "";
        setStatus("Sorry, something went wrong" + (detail ? ": " + detail : "") + ". Please email " + ${JSON.stringify(site.email)} + " instead.", "error");
      }
    } catch (error) {
      setStatus("Sorry, we could not send that. Please check your connection or email " + ${JSON.stringify(site.email)} + " instead.", "error");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
})();
</script>`;
}

function renderEventIntelligencePage() {
  const page = eventIntelligencePage;
  const hero = page.hero || {};
  const builtIn = page.builtIn || {};
  const mcp = page.mcp || {};
  const useCases = page.useCases || {};
  const control = page.control || {};
  const memory = page.memory || {};

  return `
    ${pageHero(hero.eyebrow || "Event Intelligence", hero.title || "AI becomes useful when it understands your events.", hero.text || "", eventIntelligenceHeroVisual())}
    <section class="content-section">
      ${sectionIntro(builtIn.eyebrow, builtIn.title, builtIn.text)}
      ${capabilityShowcase(builtIn.items || [])}
    </section>
    <section class="content-band">
      <div class="split-panel mcp-panel">
        <div>
          <p class="eyebrow">${mcp.eyebrow || "Mitingu MCP"}</p>
          <div class="section-title-row">
            <h2>${mcp.title || "Connect Mitingu to the AI tools your team already uses."}</h2>
            ${statusLabel(mcp.status)}
          </div>
          <p>${mcp.text || ""}</p>
          <p class="small-note">Available information and tools depend on the permissions and Mitingu capabilities enabled for your account.</p>
          ${button("/mcp", "Explore Mitingu MCP", "secondary")}
        </div>
        ${mcpDiagram(homePage.mcp?.diagram || [])}
      </div>
      <div class="control-list">${(mcp.benefits || []).map((item) => `<span>${item}</span>`).join("")}</div>
    </section>
    <section class="content-section">
      ${sectionIntro(useCases.eyebrow, useCases.title, useCases.text)}
      ${statusCards(useCases.items || [], "three")}
    </section>
    <section class="content-band compact">
      ${sectionIntro(control.eyebrow, control.title, control.text)}
    </section>
    <section class="content-section">
      <div class="intelligence-panel">
        <div>
          <p class="eyebrow">${memory.eyebrow || "Product direction"}</p>
          <h2>${memory.title || "Every event should improve the next."}</h2>
          <p>${memory.text || ""}</p>
        </div>
        <div class="memory-list">
          ${(memory.items || []).map((item) => `<span>${item}</span>`).join("")}
        </div>
      </div>
    </section>
    ${finalCta("", page.finalCta || {})}
  `;
}

function renderMcpPage() {
  const page = mcpPage;
  const hero = page.hero || {};
  const explanation = page.explanation || {};
  const supported = page.supported || {};
  const compatibility = page.compatibility || {};
  const permissions = page.permissions || {};
  const operations = page.operations || {};

  return `
    ${pageHero(hero.eyebrow || "Mitingu MCP", hero.title || "Connect your AI assistant to Mitingu.", hero.text || "", mcpHeroVisual())}
    <section class="content-section">
      ${sectionIntro(explanation.eyebrow, explanation.title, explanation.text)}
      ${mcpDiagram(homePage.mcp?.diagram || [])}
    </section>
    <section class="content-band">
      ${sectionIntro(supported.eyebrow, supported.title, supported.text)}
      ${statusCards(supported.items || [], "three")}
    </section>
    <section class="content-section">
      <div class="split-panel">
        <div>
          <p class="eyebrow">${compatibility.eyebrow || "Compatible AI assistants"}</p>
          <h2>${compatibility.title || "Use the AI environment your organisation already trusts."}</h2>
          <p>${compatibility.text || ""}</p>
        </div>
        <div>
          <p class="eyebrow">${permissions.eyebrow || "Permissions and control"}</p>
          <h2>${permissions.title || "Approved context, controlled access and human decisions."}</h2>
          <p>${permissions.text || ""}</p>
        </div>
      </div>
    </section>
    <section class="content-band">
      ${sectionIntro(operations.eyebrow, operations.title, operations.text)}
      <div class="control-list">${(operations.items || []).map((item) => `<span>${item}</span>`).join("")}</div>
    </section>
    ${finalCta("", page.finalCta || {})}
  `;
}

function renderAboutPage() {
  const hero = aboutPage.hero || {};
  return `
    ${pageHero(hero.eyebrow || "About Mitingu", hero.title || "Built to make running corporate events simpler.", hero.text || "", aboutHeroVisual())}
    <section class="content-section">
      ${objectCards(aboutPage.sections || [], "info-card", "three")}
    </section>
    ${finalCta()}
  `;
}

function legalPage(title, meta, blocks) {
  return `
    <section class="page-hero legal-hero">
      <div>
        <p class="eyebrow">Legal</p>
        <h1>${title}</h1>
        ${meta ? `<p class="legal-meta">${meta}</p>` : ""}
      </div>
    </section>
    <section class="legal">
      ${blocks
        .map((b) => (b.startsWith("## ") ? `<h2>${b.slice(3)}</h2>` : `<p>${b}</p>`))
        .join("\n      ")}
    </section>
  `;
}

const privacyBlocks = [
  "Mitingu Limited understands that your privacy is important to you and that you care about how your personal data is used and shared online. We respect and value the privacy of everyone who visits this website, www.mitingu.com (“Our Site”) and will only collect and use personal data in ways that are described here, and in a manner that is consistent with Our obligations and your rights under the law.",
  "Please read this Privacy Policy carefully and ensure that you understand it. Your acceptance of Our Privacy Policy is deemed to occur upon your first use of Our Site. If you do not accept and agree with this Privacy Policy, you must stop using Our Site immediately.",
  "## 1. Definitions and Interpretation",
  "In this Policy the following terms shall have the following meanings:",
  "“Cookie” means a small text file placed on your computer or device by Our Site when you visit certain parts of Our Site and/or when you use certain features of Our Site.",
  "“Cookie Law” means the relevant parts of the Privacy and Electronic Communications (EC Directive) Regulations 2003.",
  "“personal data” means any and all data that relates to an identifiable person who can be directly or indirectly identified from that data. In this case, it means personal data that you give to Us via Our Site. This definition shall, where applicable, incorporate the definitions provided in the EU Regulation 2016/679 – the General Data Protection Regulation (“GDPR”).",
  "“We/Us/Our” means Mitingu, a limited company registered in England under company number 08876369, whose registered address is Station Approach, Victoria, Roche, St Austell, PL26 8LG UK, and whose main trading address is Station Approach, Victoria, Roche, St Austell, PL26 8LG UK.",
  "## 2. Information About Us",
  "2.1 Our Site is owned and operated by Mitingu, a limited company registered in England under company number 08876369, whose registered address is Station Approach, Victoria, Roche, St Austell, PL26 8LG UK and whose main trading address is Station Approach, Victoria, Roche, St Austell, PL26 8LG UK.",
  "2.2 Our VAT number is GB182502522.",
  "## 3. What Does This Policy Cover?",
  "This Privacy Policy applies only to your use of Our Site. Our Site may contain links to other websites. Please note that We have no control over how your data is collected, stored, or used by other websites and We advise you to check the privacy policies of any such websites before providing any data to them.",
  "## 4. Your Rights",
  "4.1 As a data subject, you have the following rights under the GDPR, which this Policy and Our use of personal data have been designed to uphold:",
  "4.1.1 The right to be informed about Our collection and use of personal data;",
  "4.1.2 The right of access to the personal data We hold about you (see section 12);",
  "4.1.3 The right to rectification of any personal data We hold about you is inaccurate or incomplete (please contact Us using the details in section 14);",
  "4.1.4 The right to be forgotten – i.e. the right to ask Us to delete any personal data We hold about you (We only hold your personal data for a limited time, as explained in section 6 but if you would like Us to delete it sooner, please contact Us using the details in section 14);",
  "4.1.5 The right to restrict (i.e. prevent) the processing of your personal data;",
  "4.1.6 The right to data portability (obtaining a copy of your personal data to re-use with another service or organisation);",
  "4.1.7 The right to object to Us using your personal data for particular purposes; and",
  "4.1.8 Rights with respect to automated decision making and profiling.",
  "4.2 If you have any cause for complaint about Our use of your personal data, please contact Us using the details provided in section 14 and We will do Our best to solve the problem for you. If We are unable to help, you also have the right to lodge a complaint with the UK’s supervisory authority, the Information Commissioner’s Office.",
  "4.3 For further information about your rights, please contact the Information Commissioner’s Office or your local Citizens Advice Bureau.",
  "## 5. What Data Do We Collect?",
  "Depending upon your use of Our Site, We may collect some or all of the following personal and non-personal data (please also see section 13 on Our use of Cookies and similar technologies): name; business/company name; contact information such as email addresses and telephone numbers; demographic information such as post code, preferences and interests; financial information such as credit / debit card numbers; IP address; web browser type and version; operating system; and a list of URLs starting with a referring site, your activity on Our Site, and the site you exit to.",
  "## 6. How Do We Use Your Data?",
  "6.1 All personal data is processed and stored securely, for no longer than is necessary in light of the reason(s) for which it was first collected. We will comply with Our obligations and safeguard your rights under the GDPR at all times. For more details on security see section 7, below.",
  "6.2 Our use of your personal data will always have a lawful basis, either because it is necessary for Our performance of a contract with you, because you have consented to Our use of your personal data (e.g. by subscribing to emails), or because it is in Our legitimate interests. Specifically, We may use your data to: operate, optimise and maintain Our Site; personalise and tailor your experience on Our Site; respond to requests for product demonstrations, evaluations and enquiries; personalise and tailor Our products and services for you; supply you with emails that you have opted into (you may unsubscribe at any time by clicking Unsubscribe in the footer of all emails or by emailing support@mitingu.com); analyse your use of Our Site and gather feedback to enable Us to continually improve Our Site and your user experience; and customise the content and layout of Our Site.",
  "6.3 With your permission and/or where permitted by law, We may also use your data for marketing purposes which may include contacting you by email or telephone or text message or post with information, news and offers on Our products and services. We will not, however, send you any unsolicited marketing or spam and will take all reasonable steps to ensure that We fully protect your rights and comply with Our obligations under the GDPR and the Privacy and Electronic Communications (EC Directive) Regulations 2003.",
  "6.4 You have the right to withdraw your consent to Us using your personal data at any time, and to request that We delete it.",
  "6.5 We do not keep your personal data for any longer than 12 calendar months in light of the reason(s) for which it was first collected. We will retain Visitors’ personal information for the period necessary to fulfil the purposes outlined in this Policy unless a longer retention period is required or permitted by law, for legal, tax or regulatory reasons, or other lawful purposes.",
  "## 7. How and Where Do We Store Your Data?",
  "7.1 We only keep your personal data for as long as We need to in order to use it as described above in section 6, and/or for as long as We have your permission to keep it.",
  "7.2 Your data will only be stored in the UK.",
  "7.3 Data security is very important to Us, and to protect your data We have taken suitable measures to safeguard and secure data collected through Our Site.",
  "## 8. Do We Share Your Data?",
  "8.1 Subject to section 8.2, We will not share any of your data with any third parties for any purposes.",
  "8.2 In certain circumstances, We may be legally required to share certain data held by Us, which may include your personal data, for example, where We are involved in legal proceedings, where We are complying with legal obligations, a court order, or a governmental authority.",
  "8.3 We may compile statistics about the use of Our Site including data on traffic, usage patterns, user numbers, sales, and other information. All such data will be anonymised and will not include any personally identifying data. We may from time to time share such data with third parties such as prospective investors, affiliates, partners, and advertisers. Data will only be shared and used within the bounds of the law.",
  "## 9. What Happens If Our Business Changes Hands?",
  "9.1 We may, from time to time, expand or reduce Our business and this may involve the sale and/or the transfer of control of all or part of Our business. Any personal data that you have provided will, where it is relevant to any part of Our business that is being transferred, be transferred along with that part and the new owner or newly controlling party will, under the terms of this Privacy Policy, be permitted to use that data only for the same purposes for which it was originally collected by Us.",
  "9.2 In the event that any of your data is to be transferred in such a manner, you will be contacted in advance and informed of the changes.",
  "## 10. How Can You Control Your Data?",
  "10.1 In addition to your rights under the GDPR, set out in section 4, when you submit personal data via Our Site, you may be given options to restrict Our use of your data. In particular, We aim to give you strong controls on Our use of your data for direct marketing purposes (including the ability to opt-out of receiving emails from Us which you may do by unsubscribing using the links provided in Our emails and at the point of providing your details).",
  "## 11. Your Right to Withhold Information",
  "11.1 You may access certain areas of Our Site without providing any data at all.",
  "11.2 You may restrict Our use of Cookies.",
  "## 12. How Can You Access Your Data?",
  "You have the right to ask for a copy of any of your personal data held by Us (where such data is held). Under the GDPR, no fee is payable and We will provide any and all information in response to your request free of charge. Please contact Us for more details at support@mitingu.com, or using the contact details below in section 14.",
  "## 13. Our Use of Cookies",
  "13.1 Our Site may place and access certain first party Cookies on your computer or device. First party Cookies are those placed directly by Us and are used only by Us. We use Cookies to facilitate and improve your experience of Our Site and to provide and improve Our products and services. We have carefully chosen these Cookies and have taken steps to ensure that your privacy and personal data is protected and respected at all times.",
  "13.2 All Cookies used by and on Our Site are used in accordance with current Cookie Law.",
  "13.3 Before Cookies are placed on your computer or device, you will be shown a statement with a button requesting your consent to set those Cookies. By giving your consent to the placing of Cookies you are enabling Us to provide the best possible experience and service to you. You may, if you wish, deny consent to the placing of Cookies; however certain features of Our Site may not function fully or as intended.",
  "13.4 In addition to the controls that We provide, you can choose to enable or disable Cookies in your internet browser. Most internet browsers also enable you to choose whether you wish to disable all cookies or only third party cookies. By default, most internet browsers accept Cookies but this can be changed. For further details, please consult the help menu in your internet browser or the documentation that came with your device.",
  "13.5 You can choose to delete Cookies on your computer or device at any time, however you may lose any information that enables you to access Our Site more quickly and efficiently.",
  "13.6 It is recommended that you keep your internet browser and operating system up-to-date and that you consult the help and guidance provided by the developer of your internet browser and manufacturer of your computer or device if you are unsure about adjusting your privacy settings.",
  "## 14. The Mitingu Blog",
  "Our Site offers publicly accessible blogs. You should be aware that any information you provide in these areas may be read, collected, and used by others who access them. To request removal of your personal information from our blog, contact us at support@mitingu.com. In some cases, we may not be able to remove your personal information, in which case we will let you know if we are unable to do so and why.",
  "## 15. Social Media Features and Widgets",
  "Our Site may include Social Media Features and Widgets, such as share buttons or interactive mini-programs that run on our site. These Features may collect your IP address, which page you are visiting on our site, and may set a cookie to enable the Feature to function properly. Social Media Features and Widgets are either hosted by a third party or hosted directly on our Site. Your interactions with these Features are governed by the privacy policy of the company providing them.",
  "## 16. Contacting Us",
  "If you have any questions about Our Site or this Privacy Policy, please contact Us by email at support@mitingu.com, by telephone on +44 (0)1608 495288, or by post at Mitingu Limited, Station Approach, Victoria, Roche, St Austell, PL26 8LG UK. Please ensure that your query is clear, particularly if it is a request for information about the data We hold about you (as under section 12, above).",
  "## 17. Changes to Our Privacy Policy",
  "We may change this Privacy Policy from time to time (for example, if the law changes). Any changes will be immediately posted on Our Site and you will be deemed to have accepted the terms of the Privacy Policy on your first use of Our Site following the alterations. We recommend that you check this page regularly to keep up-to-date.",
];

const termsBlocks = [
  "Mitingu Ltd, Station Approach, Victoria, Roche, St Austell, PL26 8LG, United Kingdom.",
  "By signing up for the Mitingu service (“Service”) or any of the other services of Mitingu Ltd (“Mitingu”), you are agreeing to be bound by the following terms and conditions (“Terms of Service”). Any new features or tools which are added to the current Service shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time at www.mitingu.com/terms-and-conditions. Mitingu reserves the right to update and change the Terms of Service by posting updates and changes to the Mitingu website. You are advised to check the Terms of Service from time to time for any updates or changes that may impact you.",
  "## Account Terms",
  "You must be 18 years or older to use this Service.",
  "You must provide your full legal name, current address, a valid email address, and any other information needed in order to complete the signup process.",
  "You are responsible for keeping your password secure. Mitingu will not be liable for any loss or damage from your failure to maintain the security of your account and password.",
  "You may not use the Service for any illegal or unauthorised purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws) as well as the laws of England and Wales.",
  "You are responsible for all activity and content (data, graphics, photos, links) that are uploaded under your Mitingu account.",
  "You must not transmit any worms or viruses or any code of a destructive nature.",
  "A breach of any of the Terms of Service as determined in the sole discretion of Mitingu may, at Mitingu’s option, result in termination of the Services.",
  "## General Conditions",
  "You must read, agree with and accept all of the terms and conditions contained in the Terms of Service and the Privacy Policy before you may become a member of Mitingu and before you use the Service.",
  "Mitingu reserves the right to modify or terminate the Service for any reason, without notice at any time.",
  "Mitingu reserves the right to refuse service to anyone for any reason at any time.",
  "Your use of the Service is at your sole risk. The Service is provided on an “as is” and “as available” basis without any representation, warranty or condition, express, implied or statutory.",
  "Mitingu does not warrant that the Service will be uninterrupted, timely, secure, or error-free.",
  "Mitingu does not warrant that the results that may be obtained from the use of the Service will be accurate or reliable. You understand that your content (including credit card information) will be transferred encrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.",
  "Mitingu may, but has no obligation to, remove content and Accounts containing content that Mitingu determines in its sole discretion are or may be unlawful, offensive, threatening, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service.",
  "Mitingu does not warrant that the quality of any products, services, information, or other material purchased or obtained by you through the Service will meet your expectations, or that any errors in the Service will be corrected.",
  "You expressly understand and agree that Mitingu shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use of or inability to use the Service.",
  "In no event shall Mitingu or its suppliers be liable for lost profits or any special, incidental or consequential damages arising out of or in connection with the Mitingu website, the Services or this agreement (however arising including negligence). You agree to indemnify and hold us and (as applicable) our parent, subsidiaries, affiliates, officers, directors, agents, and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third party due to or arising out of your breach of this agreement or the documents it incorporates by reference, or your violation of any law or the rights of a third party.",
  "Nothing in these Terms of Service shall exclude any liability for personal injury or death caused by the negligence of Mitingu or its suppliers.",
  "Technical support is only provided to paying account holders and is only available via email. The availability of such support is not guaranteed and may be withdrawn at any time.",
  "You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without the express written permission of Mitingu.",
  "Verbal or written abuse of any kind (including threats of abuse or retribution) of any Mitingu customer, Mitingu employee, member, officer or supplier may result in account termination.",
  "We do not claim any intellectual property rights over the material you provide to the Mitingu service. You warrant to Mitingu that you own or have absolute rights to use all intellectual property and/or other proprietary interests in all material provided and shall indemnify Mitingu in respect of any and all claims, costs and expenses arising from breach of such warranty. You can remove your Mitingu box office at any time by deleting your account. This will also remove all content you have stored on the Service.",
  "By uploading images and event description content to Mitingu.com, you agree to allow other internet users to view them, you agree to allow Mitingu to display and store them, and you agree that Mitingu can, at any time, review all the content submitted by you to the Service.",
  "The failure of Mitingu to exercise or enforce any right or provision of the Terms of Service shall not constitute a waiver of such right or provision. The Terms of Service constitutes the entire agreement between you and Mitingu and govern your use of the Service, superseding any prior agreements between you and Mitingu (including, but not limited to, any prior versions of the Terms of Service).",
  "You retain ownership over all content that you submit to a Mitingu box office. However, by making your box office public, you agree to allow others to view your content.",
  "Mitingu does not pre-screen Content and it is in their sole discretion to refuse or remove any Content that is available via the Service.",
  "Questions about the Terms of Service should be sent to hello@mitingu.com.",
  "## Payment of Fees",
  "All prices are exclusive of VAT. VAT must be paid unless and until you provide written evidence to the satisfaction of Mitingu that you are exempt from paying VAT.",
  "The Service will be billed on the last day of every calendar month. Users have 14 days from the date of billing to raise any queries.",
  "All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities, and you shall be responsible for payment of all such taxes, levies, or duties.",
  "Mitingu does not provide refunds in any circumstances.",
  "Mitingu reserves the right to alter the terms and availability of any monthly plan at any time.",
  "## Cancellation and Termination",
  "Pay as you go accounts: You may cancel your account at any time by visiting your account page and selecting the option to delete your account. Once your account is cancelled all of your Content will be deleted from the Service. Since deletion of all data is final please be sure that you do in fact want to cancel your account before doing so.",
  "Contracted accounts: Contracted accounts can cancel their service in accordance with the Cancellation clause contained in your agreement. Once your account is cancelled all of your Content will be deleted from the Service. Since deletion of all data is final please be sure that you do in fact want to cancel your account before doing so.",
  "Fraud: Without limiting any other remedies, Mitingu may suspend or terminate your account if it suspects that you (by conviction, settlement, insurance or escrow investigation, or otherwise) have engaged in fraudulent activity in connection with the Site.",
  "## Modifications to the Service and Prices",
  "Pay as you go users: Prices for using Mitingu are subject to change upon 14 days notice from Mitingu. Such notice may be provided at any time by posting the changes to the Mitingu Site (Mitingu.com) or the administration area of your Mitingu account via an announcement.",
  "Contracted users: Pricing and price changes will be covered in the relevant clause of your contract. You will not be affected by general price changes for pay as you go users.",
  "Mitingu reserves the right at any time to modify or discontinue the Service (or any part thereof) with or without notice.",
  "Mitingu shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.",
  "## Law and Jurisdiction",
  "These Terms and Conditions shall be governed by the laws of England and Wales. Any dispute between the Parties relating to these Terms and Conditions shall fall within the jurisdiction of the courts of England and Wales.",
];

const pageBodies = {
  "/": () => renderHomePage(),
  "/privacy-policy": () =>
    legalPage("Privacy Policy", "Last updated 19th May 2018", privacyBlocks),
  "/terms-and-conditions": () => legalPage("Terms and Conditions", "", termsBlocks),
  "/platform": () => `
    ${renderPageHero("/platform", {
      eyebrow: "Platform",
      title: "Keep the whole event operation in one place.",
      text: "Planning, registration, communications, attendee management, delivery, reporting and Event Intelligence stay connected for corporate event teams and agencies.",
    }, screenshotFigure())}
    <section class="content-section">${sectionIntro("Event operations overview", "Plan it. Promote it. Run it. Report on it.", "Use Mitingu as one place for multiple departments, offices, regions or clients.")}${platformGrid()}</section>
    <section class="content-band">
      ${sectionIntro("White-label control", "Your event environment, not ours.", "Create branded admin areas, event sites, email journeys and reports that look like your organisation or client brand.")}
      <div class="split-panel">
        <div><h3>Central control. Local delivery.</h3><p>Lock down brand essentials while local organisers add event content, manage attendees and report performance.</p></div>
        <img src="${media.domainRestriction.src}" alt="${media.domainRestriction.alt}">
      </div>
      ${controlList()}
    </section>
    <section class="content-section">
      ${sectionIntro("Event Intelligence", "Answers are better when they start with event context.", "Ask questions, create reports and understand performance without repeatedly copying information between systems.")}
      ${statusCards(homePage.eventIntelligence?.parts || [], "three")}
    </section>
    <section class="content-band">
      <div class="split-panel mcp-panel">
        <div>
          <p class="eyebrow">Mitingu MCP</p>
          <h2>Use the AI assistant your team already trusts.</h2>
          <p>Connect Mitingu to compatible AI assistants, including Claude, ChatGPT and supported Microsoft Copilot environments.</p>
          <p class="small-note">Available information and tools depend on the permissions and Mitingu capabilities enabled for your account.</p>
          ${button("/mcp", "Explore Mitingu MCP", "secondary")}
        </div>
        ${mcpDiagram(homePage.mcp?.diagram || [])}
      </div>
    </section>
    <section class="content-section">${sectionIntro("Integrations", "Connect the tools that matter.", "Where integrations are enabled, event data can work with wider marketing, CRM, reporting and operational systems.")}</section>
    ${finalCta("", {
      eyebrow: "View the platform",
      title: "See how the pieces fit together.",
      text: "Explore how Mitingu connects planning, registration, communications, reporting, Event Intelligence and MCP.",
      actionLabel: "See Mitingu in Action",
      actionHref: "/book-a-demo",
    })}
  `,
  "/event-intelligence": () => renderEventIntelligencePage(),
  "/mcp": () => renderMcpPage(),
  "/pricing": () => `
    ${renderPageHero("/pricing", {
      eyebrow: "Pricing",
      title: "Pricing starts with how your events really run.",
      text: "We look at event scale, support, white-label needs, account structure and usage. Then we shape the right plan.",
    }, pricingHeroVisual())}
    <section class="content-section">${sectionIntro("Options", "Choose the shape that matches your events.", "Pricing depends on programme structure, event volume, support and account requirements.")}${pricingCards()}</section>
    <section class="content-band compact">${sectionIntro("Enterprise factors", "What affects pricing?", "Event volume, accounts, attendee usage, white-label depth, integrations, support, Event Intelligence, Mitingu MCP and custom work. SMS, WhatsApp and unusually high usage may carry additional charges.", "center")}</section>
    ${finalCta("", {
      eyebrow: "Pricing conversation",
      title: "Talk through the right commercial shape.",
      text: "We will understand how your events run before discussing price.",
      actionLabel: "Talk to Mitingu",
      actionHref: "/book-a-demo",
    })}
  `,
  "/resources": () => `
    ${renderPageHero("/resources", {
      eyebrow: "Resources",
      title: "Practical resources for corporate event teams",
      text: "We're building a growing library of practical guides, checklists and templates to help corporate event teams plan, communicate and deliver better events.<br><br>The first resources are on their way.",
    }, resourceHeroVisual())}
    <section class="content-section">${sectionIntro("Resource library", "The first downloads are coming soon.", "We are preparing practical resources that will be useful enough to keep, share and come back to.")}${resourceCards()}</section>
    <section class="content-band">${sectionIntro("Common questions", "The things buyers usually want to understand.", "Start with the questions teams ask when event work has become too scattered.")}${intentGrid()}</section>
    <section class="content-section">${sectionIntro("Useful pages", "Explore the areas buyers ask about most.", "These pages cover the common places where event teams need more clarity.")}${moneyPagesGrid()}</section>
    ${finalCta("", {
      eyebrow: "Keep exploring",
      title: "Move from reading to seeing it.",
      text: "See how the same thinking appears inside Mitingu.",
      actionLabel: "View the Platform",
      actionHref: "/platform",
    })}
  `,
  "/about": () => renderAboutPage(),
  "/white-label-event-platform": () => `
    ${renderPageHero("/white-label-event-platform", {
      eyebrow: "White-label event platform",
      title: "Your brand on the event experience.",
      text: "Give clients, teams or regions branded event sites, emails, admin areas, registration journeys and reports without building everything from scratch.",
    }, heroChecklist("/white-label-event-platform", ["Branded event sites and emails", "Client, office or region accounts", "User permissions and central visibility", "Reusable templates for faster launches"]))}
    ${renderAnswerBox("/white-label-event-platform", {
      title: "Use Mitingu when brand control has to scale.",
      text: "Each event, client, office or region can feel polished and branded, while central teams keep control of templates, reporting and repeatable set-up.",
      facts: ["Agency client delivery", "Corporate event programmes", "Multi-brand or multi-region event operations"],
    })}
    <section class="content-section">${sectionIntro("What white-label means in practice", "Your brand on the touchpoints people actually see.", "It is more than changing a logo. Event sites, emails, accounts, admin areas and reports can all carry the right brand.")}${cards([
      ["Branded event environments", "Mirror your organisation or client brand across event pages, forms and communications."],
      ["Reusable templates", "Give local organisers a controlled starting point so every event looks credible from day one."],
      ["Multi-account structure", "Separate clients, offices, departments or regions while keeping programme visibility."],
      ["Client-ready reporting", "Turn registration and engagement data into reports that are easier to share."],
    ])}</section>
    ${faqSection("/white-label-event-platform")}
    ${finalCta()}
  `,
  "/enterprise-event-registration-platform": () => `
    ${renderPageHero("/enterprise-event-registration-platform", {
      eyebrow: "Enterprise event registration",
      title: "Registration that does not sit on its own.",
      text: "Replace forms, spreadsheets and disconnected tools with branded registration journeys connected to attendee data, communications and reporting.",
    }, registrationFigure())}
    ${renderAnswerBox("/enterprise-event-registration-platform", {
      title: "Registration is easier when the rest of the event is connected.",
      text: "For organisations running multiple events, Mitingu keeps registration close to branding, permissions, communications and reporting.",
      facts: ["Consistent delegate experience", "Cleaner attendee data", "Faster repeat event setup"],
    })}
    <section class="content-band">${sectionIntro("Where basic registration tools start to break", "The problem is not the form. It is everything around the form.", "Registration needs to connect with branding, communications, permissions, reporting and post-event insight.")}${cards([
      ["Scattered templates", "Every team starts again, so quality and brand consistency vary from event to event."],
      ["Manual reporting", "Registration numbers, attendance and feedback are pulled together by hand after the event."],
      ["No programme view", "Senior teams cannot easily compare performance across offices, brands or regions."],
      ["Disconnected follow-up", "Post-event messages are separated from the registration data that should shape them."],
    ])}</section>
    ${faqSection("/enterprise-event-registration-platform")}
    ${finalCta("", {
      eyebrow: "Registration in context",
      title: "See how registration connects with the wider event operation.",
      text: "See registration alongside communications, attendee data, reporting and Event Intelligence.",
      actionLabel: "View the Platform",
      actionHref: "/platform",
    })}
  `,
  "/event-analytics-reporting": () => `
    ${renderPageHero("/event-analytics-reporting", {
      eyebrow: "Event analytics and reporting",
      title: "Know which events are working, not just who registered.",
      text: "See registrations, attendance, feedback, engagement and performance across events, offices and regions.",
    }, screenshotFigure())}
    ${renderAnswerBox("/event-analytics-reporting", {
      title: "Turn event activity into evidence.",
      text: "Use dashboards, custom reports and Event Intelligence questions to see what worked, what did not and what should happen next.",
      facts: ["Event dashboards", "Custom reports", "Event Intelligence", "Regional and office-level visibility"],
    })}
    <section class="content-section">${sectionIntro("Reporting questions", "Move from numbers to decisions.", "These are the questions teams ask when the spreadsheet has stopped being useful.")}${cards([
      ["Which events performed best?", "Compare registration, attendance and feedback across events and locations."],
      ["Which audiences are engaged?", "Understand attendee behaviour by event type, topic, office, region or segment."],
      ["What should we repeat?", "Use evidence from past events to shape future programmes and communications."],
      ["Where is reporting manual?", "Spot repeatable reports that should no longer be rebuilt by hand."],
    ])}</section>
    ${faqSection("/event-analytics-reporting")}
    ${finalCta("", {
      eyebrow: "Explore Event Intelligence",
      title: "Turn event reporting into clearer decisions.",
      text: "See how teams can understand registrations, attendance, feedback and performance.",
      actionLabel: "Explore Event Intelligence",
      actionHref: "/event-intelligence",
    })}
  `,
  "/event-communications-platform": () => `
    ${renderPageHero("/event-communications-platform", {
      eyebrow: "Event communications platform",
      title: "Keep everyone informed before, during and after.",
      text: "Manage invitations, confirmations, reminders, updates, segmented messages and follow-up alongside registration and reporting.",
    }, heroChecklist("/event-communications-platform", ["Invitations and confirmations", "Reminder and update emails", "Segmented attendee messaging", "Post-event follow-up"]))}
    ${renderAnswerBox("/event-communications-platform", {
      title: "Know what your attendees have seen.",
      text: "Event and attendee data help teams send clearer branded messages across the whole event journey.",
      facts: ["Brand-controlled email templates", "Audience segmentation", "Reminder and follow-up workflows"],
    })}
    <section class="content-band">${sectionIntro("Communications that support attendance", "Every message should reduce confusion.", "The best event communications are timely, branded and relevant to the attendee's status.")}${cards([
      ["Before the event", "Promote the event, invite the right audience and confirm registration clearly."],
      ["During the event", "Send updates, reminders and practical information that reduce attendee friction."],
      ["After the event", "Follow up with surveys, summaries, next steps and targeted communications."],
      ["Across the programme", "Keep messaging consistent across departments, offices, regions and client brands."],
    ])}</section>
    ${faqSection("/event-communications-platform")}
    ${finalCta("", {
      eyebrow: "Connected communications",
      title: "See how communications fit with the rest of the event.",
      text: "Keep messages connected to attendee data, reporting and the wider event record.",
      actionLabel: "View the Platform",
      actionHref: "/platform",
    })}
  `,
  "/book-a-demo": () => `
    ${renderPageHero("/book-a-demo", {
      eyebrow: "Book a demo",
      title: "Show us how your events are run today.",
      text: "Tell us what works, what is messy and what needs to change. We will shape the demo around that.",
    }, demoNoteAside("/book-a-demo", ["Multiple events, offices, regions, clients or brands", "Need for branded event sites and communications", "Manual reporting or fragmented event data"]))}
    <section class="content-section">${demoForm()}</section>
  `,
  "/solutions/corporate-events": () => {
    const benefits = [
      ["Visibility across the programme", "See registrations, attendance, feedback and performance without asking every team for an update."],
      ["Governance without delay", "Use approved templates, permissions and brand controls so organisers can move quickly."],
      ["Reporting stakeholders can trust", "Turn event data into clearer evidence for leadership, sponsors and internal teams."],
      ["Control over the attendee experience", "Keep registration, communications and follow-up connected before, during and after the event."],
      ["Confidence for important events", "Reduce last-minute uncertainty by keeping ownership, information and reporting together."],
    ];
    return `
      ${renderPageHero("/solutions/corporate-events", {
        eyebrow: "Corporate events",
        title: "Important events need more than another spreadsheet.",
        text: "Give internal event, comms and marketing teams structure, visibility and brand control without slowing them down.",
      }, corporateHeroVisual())}
      <section class="content-section">
        ${sectionIntro("Corporate outcomes", "Brand consistency, faster launches and central reporting.", "For corporate teams, the issue is rarely one event. It is the work around every event that follows.")}
        ${cards(benefits, "info-card", "three")}
      </section>
      <section class="final-cta slim"><div><p class="eyebrow">Explore the platform</p><h2>See what sits behind a better-run event.</h2></div>${button("/platform", "View Platform", "dark")}</section>
      ${finalCta("", {
        eyebrow: "Corporate event teams",
        title: "See how Mitingu fits your event team.",
        text: "We will shape the demo around how your team plans, launches, reports and improves events.",
        actionLabel: "See Mitingu in Action",
        actionHref: "/book-a-demo",
      })}
    `;
  },
  "/solutions/event-agencies": () => `
    ${renderPageHero("/solutions/event-agencies", {
      eyebrow: "Event agencies",
      title: "Client-ready event technology, without rebuilding every time.",
      text: "Deliver branded event sites, registration, communications and reports with reusable templates and flexible account structures.",
    }, agencyHeroVisual())}
    <section class="content-section">
      ${sectionIntro("Agency delivery", "Stop rebuilding the operating layer for every client.")}
      ${cards([
        ["White-label client delivery", "Present the environment as your own or as the client brand."],
        ["Reusable build patterns", "Create templates that reduce repeated set-up across clients and event types."],
        ["Client-ready reporting", "Give clients clearer evidence around registration, attendance, engagement, feedback and campaign performance."],
        ["Room for specialist service", "Keep the software efficient while your agency adds strategy, delivery and creative expertise."],
      ], "module-card", "two")}
    </section>
    <section class="content-band">
      ${sectionIntro("Agency outcomes", "Efficiency, profitability and consistency across client delivery.", "Standardise the operational work while keeping each client experience polished and on brand.")}
      ${cards([
        ["Multi-client delivery", "Separate accounts, templates and reports make it easier to serve different clients."],
        ["Repeatable processes", "Reusable event patterns reduce setup time and make recurring event delivery more predictable."],
        ["White labelling", "Client-facing event sites and communications can reflect the right brand instead of the software vendor."],
        ["Better margin on delivery", "Less manual rebuild work means more time for strategy, creative and client service."],
      ], "info-card", "two")}
    </section>
    ${finalCta("", {
      eyebrow: "Event agencies",
      title: "See how Mitingu can support client delivery.",
      text: "Explore how white-label event operations can help your agency deliver faster and report clearly.",
      actionLabel: "See Mitingu in Action",
      actionHref: "/book-a-demo",
    })}
  `,
  "/solutions/multi-office-event-programmes": () => `
    ${renderPageHero("/solutions/multi-office-event-programmes", {
      eyebrow: "Multi-office programmes",
      title: "Central visibility for events happening everywhere.",
      text: "When offices, regions and brands all run events differently, central teams need control without blocking local teams.",
    }, multiOfficeHeroVisual())}
    <section class="content-section">${sectionIntro("Governance", "Built for central teams and local organisers.", "Standardise templates, permissions, reporting and brand rules while each office keeps a practical place to work.")}${controlList()}</section>
    <section class="content-band">
      <div class="split-panel">
        <div><p class="eyebrow">Programme visibility</p><h2>Know what is working across the whole programme.</h2><p>Compare events, audiences, offices and topics so strong ideas can be repeated and weak spots can be improved.</p></div>
        <div class="mini-report"><span>Region</span><strong>EMEA leadership series</strong><p>Top performing markets: UK, Netherlands, Germany</p><p>Recommended next action: repeat post-event NPS workflow</p></div>
      </div>
    </section>
    ${finalCta("", {
      eyebrow: "Multi-office programmes",
      title: "Bring consistency and local flexibility into the same platform.",
      text: "See how templates, governance, local delivery and central reporting can work together.",
      actionLabel: "See How It Works",
      actionHref: "/platform",
    })}
  `,
};
