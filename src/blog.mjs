import { readFileSync } from "node:fs";
import { layout, button, sectionIntro, finalCta, setLatestBlogSection } from "./site.mjs";

// Blog posts restored from the old Squarespace site (October 2026), kept at
// their original addresses so links and search rankings carry over.
const data = JSON.parse(
  readFileSync(new URL("../content/blog-posts.json", import.meta.url), "utf8"),
);

export const posts = data.posts;
const origin = "https://www.mitingu.com";

// Old addresses that are no longer pages on the site. Each gets a small page
// that forwards visitors (and search engines) to the right place.
// Pages from the old Squarespace site that Google still knows about
// (Search Console "Not found (404)" report, October 2026).
const oldSitePages = {
  "/home": "/",
  "/homepage": "/",
  "/features": "/platform",
  "/features/integrations": "/mcp",
  "/features/custom-admin-platform": "/white-label-event-platform",
  "/features/event-apps": "/event-apps-onsite-registration",
  "/features/event-check-in": "/event-apps-onsite-registration",
  "/faqs": "/platform",
  "/demo": "/book-a-demo",
  "/contact": "/book-a-demo",
  "/done-for-you": "/solutions/event-agencies",
  "/event-marketing": "/event-communications-platform",
  "/security-statement": "/privacy-policy",
  "/blog-1": "/blog",
  "/printerevents": "/blog/2017/5/29/how-events-can-help-grow-your-print-business",
  // Old product pages still linked from inside restored blog posts
  "/branding-options": "/white-label-event-platform",
  "/company": "/about",
  "/event-crm": "/enterprise-event-registration-platform",
  "/event-surveys": "/event-analytics-reporting",
  "/greetdesk": "/event-apps-onsite-registration",
  "/intelligent-sites": "/enterprise-event-registration-platform",
  "/landing-2": "/",
  "/managed-services": "/solutions/event-agencies",
  "/new-gen-editor": "/enterprise-event-registration-platform",
  "/personalised-communications": "/event-communications-platform",
  "/personalised-emails": "/event-communications-platform",
  "/powerful-crm": "/enterprise-event-registration-platform",
  "/registration-sites": "/enterprise-event-registration-platform",
  "/signup": "/book-a-demo",
};

const oldTagAndCategoryPages = [
  "whitelabelsoftware", "%23datacollection", "Event+Engagement", "businessevents", "tagging",
  "3dinteractive", "Attendee+Apps", "Event+Trends", "two-step-authentication", "virtualevents",
  "Event+Invitations", "pubtalk", "Internal+Events+Registration", "branding", "event+pre-registration",
  "Mobile+Event+Apps", "spreadsheets+v+event+registration+platforms", "tags", "3denvironments",
  "Delegate+Management", "spam+filters", "event+spreadsheets", "Event+Registration+Abandonment",
  "Smart+Events", "Domain+Restriction", "datasecurity", "SEO", "NPS", "event+emails", "Social+Media",
  "event+communications", "Internal+Events", "eventdata", "High+Converting+Event+Registration",
  "low+attendance+rates", "Restrict+Domains+for+Event+Registration", "event+analytics",
  "return-on-investment", "Event+Data+Security", "whitelabeleventssoftware", "event+registration+platform",
  "event+planning", "email+deliverability", "%23TicketSales", "event-roi", "event+registration", "Tagging",
  "registrationsoftware", "file-upload", "Secure+Event+Registration", "Event+check-in", "eventtech",
  "Event+Technology", "event+marketing", "Event+Management", "whitelabel", "eventplanning", "eventprofs",
].map((tag) => `/blog/tag/${tag}`);

export const blogForwards = {
  ...oldSitePages,
  ...Object.fromEntries(oldTagAndCategoryPages.map((path) => [path, "/blog"])),
  "/blog/category/Technical": "/blog",
  "/blog/category/Event+Experience": "/blog",
  ...Object.fromEntries((data.retired || []).map((path) => [path, "/blog"])),
};

export const blogPages = ["/blog", ...posts.map((post) => post.path)];

const escapeHtml = (text = "") =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function postCard(post) {
  return `<article class="blog-card">
    <a class="blog-card-link" href="${post.path}">
      ${
        post.image
          ? `<img class="blog-card-image" src="${post.image}" alt="" width="${post.imageWidth}" height="${post.imageHeight}" loading="lazy">`
          : `<span class="blog-card-image blog-card-image-empty" aria-hidden="true"></span>`
      }
      <span class="blog-card-date">${formatDate(post.published)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.description)}</p>
    </a>
  </article>`;
}

function relatedPosts(post, count = 3) {
  const tags = new Set((post.tags || []).map((tag) => tag.toLowerCase()));
  return posts
    .filter((other) => other.path !== post.path)
    .map((other) => ({
      other,
      score:
        (other.tags || []).filter((tag) => tags.has(tag.toLowerCase())).length * 10 +
        (other.published > "2021" ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.other.published < b.other.published ? 1 : -1))
    .slice(0, count)
    .map(({ other }) => other);
}

function renderIndex() {
  const recent = posts.filter((post) => post.published >= "2021");
  const archive = posts.filter((post) => post.published < "2021");
  return layout({
    path: "/blog",
    title: "Event management blog: registration, communications and attendance",
    description:
      "Practical articles for corporate event teams and agencies on event registration, communications, attendance, check-in, event apps and white-label event platforms.",
    breadcrumbs: [
      ["Home", "/"],
      ["Blog", "/blog"],
    ],
    extraGraph: [
      {
        "@type": "Blog",
        "@id": `${origin}/blog#blog`,
        url: `${origin}/blog`,
        name: "The Mitingu blog",
        publisher: { "@id": `${origin}/#organization` },
        blogPost: posts.slice(0, 20).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: `${origin}${post.path}`,
          datePublished: post.published,
        })),
      },
    ],
    body: `<section class="page-hero blog-hero">
      <div>
        <p class="eyebrow">Blog</p>
        <h1>Practical thinking for people who run important events.</h1>
        <p>Registration, invitations, attendance, check-in, event apps and white-label platforms. Written by the team behind Mitingu, from more than ten years of running event technology for corporate teams and agencies.</p>
      </div>
    </section>
    <section class="content-section">
      ${sectionIntro("Latest", "Recent articles")}
      <div class="blog-grid">${recent.map(postCard).join("")}</div>
    </section>
    <section class="content-band">
      ${sectionIntro("From the archive", "Earlier articles", "Older posts from the Mitingu blog. Some product details have changed since they were written.")}
      <div class="blog-grid">${archive.map(postCard).join("")}</div>
    </section>
    ${finalCta("", {
      eyebrow: "See it running",
      title: "Talk through the way your events really run.",
      text: "We will shape the demo around your events, your team and the things that are hardest to keep under control.",
      actionLabel: "Book a Demo",
      actionHref: "/book-a-demo",
    })}`,
  });
}

function renderPost(post) {
  const url = `${origin}${post.path}`;
  const old = post.published < "2021";
  return layout({
    path: post.path,
    title: post.seoTitle || `${post.title} | Mitingu blog`,
    description: escapeHtml(post.description),
    ogImage: post.image || "/screenshot.jpeg",
    ogType: "article",
    breadcrumbs: [
      ["Home", "/"],
      ["Blog", "/blog"],
      [post.title, post.path],
    ],
    extraGraph: [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.published,
        dateModified: post.published,
        url,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        ...(post.image
          ? {
              image: {
                "@type": "ImageObject",
                url: `${origin}${post.image}`,
                width: post.imageWidth,
                height: post.imageHeight,
              },
            }
          : {}),
        author: { "@type": "Organization", name: "Mitingu", "@id": `${origin}/#organization` },
        publisher: { "@id": `${origin}/#organization` },
        keywords: (post.tags || []).join(", "),
        inLanguage: "en-GB",
      },
    ],
    body: `<article class="blog-post">
      <header class="blog-post-header">
        <nav class="blog-breadcrumb" aria-label="Breadcrumb"><a href="/blog">Blog</a></nav>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="blog-post-meta"><time datetime="${post.published}">${formatDate(post.published)}</time></p>
        ${old ? `<p class="blog-post-note">Written in ${post.published.slice(0, 4)}. Some product details have changed since; <a href="/platform">see what Mitingu does today</a>.</p>` : ""}
      </header>
      ${
        post.image
          ? `<img class="blog-post-image" src="${post.image}" alt="" width="${post.imageWidth}" height="${post.imageHeight}">`
          : ""
      }
      <div class="blog-post-body">${post.body}</div>
      <aside class="blog-post-cta">
        <h2>Running events where this matters?</h2>
        <p>Mitingu brings registration, communications, the attendee app, onsite check-in and reporting into one white-label platform, so your team spends less time joining systems together.</p>
        <div class="hero-actions">
          ${button("/book-a-demo", "Book a Demo")}
          ${button("/platform", "See the platform", "secondary")}
        </div>
      </aside>
    </article>
    <section class="content-band">
      ${sectionIntro("Keep reading", "Related articles")}
      <div class="blog-grid">${relatedPosts(post).map(postCard).join("")}</div>
    </section>`,
  });
}

export function renderBlogPage(path) {
  if (path === "/blog") return renderIndex();
  const post = posts.find((item) => item.path === path);
  if (!post) throw new Error(`Unknown blog path ${path}`);
  return renderPost(post);
}

setLatestBlogSection(
  () => `<section class="content-section">
    ${sectionIntro("From the blog", "Recent articles", "Practical writing on registration, communications, attendance and check-in.")}
    <div class="blog-grid">${posts.slice(0, 6).map(postCard).join("")}</div>
    <div class="hero-actions">${button("/blog", "Read the blog", "secondary")}</div>
  </section>`,
);
