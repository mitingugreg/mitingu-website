// Registration personality quiz: www.mitingu.com/personality
//
// Rebuilt 25 Nov 2026 from Greg's brief ("Brief: Mitingu registration
// personality quiz page") and its design mock-up. One job: get event organisers
// through a 30-second, six-question quiz to their result, then make it easy to
// book a 15-minute chat with Greg.
//
// All wording lives in TYPES, QUESTIONS and the markup below. The browser
// script is public/personality-quiz.js; it reads TYPES and QUESTIONS from the
// JSON block this page writes, so the wording is only ever edited here.
// The leads service (leads/server.mjs) also imports TYPES for the result email.

export const BOOKING_URL = "https://calendar.app.google/KEUX6y2QWYxhrUPw7";
export const EXAMPLE_EMAIL = "greg@mitingu.com";

export const TYPES = {
  stickler: {
    name: "The Stickler",
    short: "Stickler",
    code: "ST-01",
    colour: "#2EC4B6",
    shadow: "#1B7F76",
    icon: "clipboard",
    tag: "Same platform every year, same workarounds every time the brief changes.",
    superpower: "You know your system inside out, and you get it done.",
    time: "Working around it every time a brief doesn't fit.",
    win: "Let the registration flex to the event, not the other way round.",
    cta: "Want the platform to bend for once?",
  },
  technician: {
    name: "The Technician",
    short: "Technician",
    code: "TE-02",
    colour: "#FFD23F",
    shadow: "#B38F00",
    icon: "grid",
    tag: "Spreadsheets, forms and fifty “did you get my email?” emails.",
    superpower: "Nothing gets past you.",
    time: "Spreadsheets, merges and chasing replies.",
    win: "One place for every registration, so the lists build themselves.",
    cta: "Want to close a few tabs?",
  },
  builder: {
    name: "The Builder",
    short: "Builder",
    code: "BU-03",
    colour: "#FF8A5B",
    shadow: "#B85A33",
    icon: "spanner",
    tag: "A lovely site that only one person knows how to change.",
    superpower: "You care how it looks, and it shows.",
    time: "Waiting for the one person who can change it.",
    win: "A setup anyone on the team can update in minutes.",
    cta: "Want to make the changes yourself?",
  },
  shopkeeper: {
    name: "The Shopkeeper",
    short: "Shopkeeper",
    code: "SK-04",
    colour: "#B9A6FF",
    shadow: "#7C66CC",
    icon: "bag",
    tag: "Event places sold like T-shirts, with dietary needs in the “notes” box.",
    superpower: "You sell places quickly and simply.",
    time: "Reading notes boxes and fixing who's actually coming.",
    win: "Ask the right questions for each guest type when they register.",
    cta: "Want to know who's actually coming?",
  },
  juggler: {
    name: "The Juggler",
    short: "Juggler",
    code: "JG-05",
    colour: "#FF5CA8",
    shadow: "#A8306B",
    icon: "juggle",
    tag: "All of the above, sometimes in the same week.",
    superpower: "Calm under pressure. You make it work.",
    time: "Stitching forms, spreadsheets and inboxes together.",
    win: "Every guest type through one registration, each with its own questions.",
    cta: "Want to drop a few plates?",
  },
};

export const ORDER = ["stickler", "technician", "builder", "shopkeeper", "juggler"];

// Old result links (before 12 Nov 2026) still open the matching result.
export const OLD_KEYS = { "platform-loyalist": "stickler", "spreadsheet-wrangler": "technician", "bespoke-builder": "builder" };

// Answers A-D score Stickler, Technician, Builder, Shopkeeper. The most-picked
// type wins; a tie, or picking all four, makes a Juggler.
export const ANSWER_TYPES = ["stickler", "technician", "builder", "shopkeeper"];
export const QUESTIONS = [
  {
    q: "The brief changes two weeks out. What happens next?",
    a: [
      "We bend it to fit the platform we always use.",
      "New tab on the spreadsheet, and a round of “did you get my email?”",
      "We wait for the one person who can change the website.",
      "Add a new ticket type and hope the notes box copes.",
    ],
  },
  {
    q: "Where do your speakers' and sponsors' details live?",
    a: ["The same system as last year, mostly.", "A spreadsheet, plus a few inboxes.", "On the event site, if Sam updated it.", "In the order notes."],
  },
  {
    q: "Someone asks for a list of who's coming, with dietary needs, by tomorrow. You…",
    a: ["Run the usual report and tidy it by hand.", "Merge three spreadsheets and pray.", "Ask the person who built the site.", "Export orders and read every “notes” box."],
  },
  {
    q: "Your registration form is…",
    a: ["The one we've always used.", "Several forms, held together with formulas.", "Beautiful, and a bit fragile.", "A checkout."],
  },
  {
    q: "Your VIPs get…",
    a: ["The same form as everyone else.", "A separate email, sent by hand.", "A special page we built for them.", "A “VIP ticket”."],
  },
  {
    q: "When does registration keep you up late?",
    a: ["Every time the brief doesn't fit.", "Chasing replies.", "When the site needs changing and the builder's away.", "Sorting out who's actually coming."],
  },
];

export function scoreAnswers(answers) {
  const counts = {};
  for (const key of answers) counts[key] = (counts[key] || 0) + 1;
  const keys = Object.keys(counts);
  if (!keys.length) return "juggler";
  if (keys.length >= 4) return "juggler";
  const top = Math.max(...Object.values(counts));
  const winners = keys.filter((k) => counts[k] === top);
  return winners.length === 1 ? winners[0] : "juggler";
}

export const personalityPath = "/personality";

export const personalityMeta = [
  "What's your registration personality?",
  "A 30-second quiz for event organisers. Answer six quick questions, meet your registration personality, and see where your setup quietly eats your time.",
];

// Questions answered on the page (also published as FAQPage structured data).
export const personalityFaqs = [
  [
    "What is a registration personality?",
    "A light-hearted way of describing how an event team runs registration. Mitingu sees five common set-ups: the Stickler, the Technician, the Builder, the Shopkeeper and the Juggler. Each one works, up to the point where it quietly starts eating the team's time.",
  ],
  [
    "What are the five registration personalities?",
    ORDER.map((key) => `${TYPES[key].name}: ${TYPES[key].tag}`).join(" "),
  ],
  [
    "How does the registration personality quiz work?",
    "Six quick questions, one tap each. Each answer points to one of four set-ups, and the one you pick most often is your result. A tie, or a real mix of all four, makes you a Juggler. It takes about 30 seconds and you see your result straight away, with no sign-up.",
  ],
  [
    "What happens after the quiz?",
    "You see your superpower, where your time goes and one quick win for your type. If you'd like to talk it through, you can book a 15-minute chat: tell us about the event on your mind and we'll show you how we'd set up its registration, with no hard sell.",
  ],
  [
    "How do I stop running event registration on spreadsheets?",
    "Move one event onto a registration platform first. With Mitingu that means a branded event site, one live guest list, confirmations and reminders that send themselves, and check-in on the day from the same list, so there is nothing to copy between spreadsheets and inboxes.",
  ],
];

export const personalityGraph = [
  {
    "@type": "DefinedTermSet",
    "@id": "https://www.mitingu.com/personality#types",
    name: "Registration personalities",
    description: "Five common ways event organisers run registration, as described by Mitingu.",
    hasDefinedTerm: ORDER.map((key) => ({
      "@type": "DefinedTerm",
      "@id": `https://www.mitingu.com/personality#${key}`,
      name: TYPES[key].name,
      termCode: TYPES[key].code,
      description: `${TYPES[key].tag} Where the time goes: ${TYPES[key].time}`,
      url: `https://www.mitingu.com/personality#${key}`,
    })),
  },
];

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// JSON safe to drop inside a <script> element.
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

const ICON_PATHS = {
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4h6v3H9z"></path><path d="M9 12l2 2 4-4"></path>',
  grid: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18M3 15h18M9 4v16M15 4v16"></path>',
  spanner: '<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.7-7.7z"></path><path d="M14.7 6.3L17 4l3 3-2.3 2.3"></path>',
  bag: '<path d="M5 8h14l-1 12H6z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>',
  juggle: '<circle cx="6" cy="15" r="3"></circle><circle cx="18" cy="15" r="3"></circle><circle cx="12" cy="6" r="3"></circle><path d="M8 12l2-3M16 12l-2-3"></path>',
};

export function icon(name, size = 48) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#160B2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}

const CONFETTI = `
  <svg class="pq-confetti" aria-hidden="true" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice">
    <circle cx="90" cy="90" r="10" fill="#FFD23F"></circle>
    <rect x="1080" y="70" width="22" height="22" rx="4" fill="#2EC4B6" transform="rotate(20 1091 81)"></rect>
    <circle cx="1120" cy="300" r="7" fill="#D1006E"></circle>
    <rect x="150" y="360" width="18" height="18" rx="3" fill="#FF5CA8" transform="rotate(-25 159 369)"></rect>
    <path d="M40 250 l14 -24 l14 24 z" fill="#2EC4B6"></path>
    <path d="M1010 430 l16 -28 l16 28 z" fill="#FFD23F"></path>
    <rect x="300" y="60" width="12" height="22" rx="3" fill="#FF8A5B" transform="rotate(-30 306 71)"></rect>
    <rect x="880" y="40" width="12" height="22" rx="3" fill="#B9A6FF" transform="rotate(25 886 51)"></rect>
    <circle cx="980" cy="150" r="5" fill="#ffffff"></circle>
    <circle cx="230" cy="190" r="5" fill="#ffffff"></circle>
  </svg>`;

const TILTS = ["-1.5deg", "1deg", "-0.5deg", "1.5deg", "-1deg"];
const LETTERS = ["A", "B", "C", "D"];

export function renderPersonalityPage(site = {}) {
  const leadsEndpoint = site.leadsEndpoint || "";
  const data = {
    types: TYPES,
    order: ORDER,
    oldKeys: OLD_KEYS,
    answerTypes: ANSWER_TYPES,
    questions: QUESTIONS,
    icons: ICON_PATHS,
    bookingUrl: BOOKING_URL,
    exampleEmail: EXAMPLE_EMAIL,
    leadsBase: leadsEndpoint.replace(/\/api\/demo-requests$/, ""),
    pageUrl: "https://www.mitingu.com/personality",
  };

  return `
<div class="pq" id="pq">
  <header class="pq-top">
    <a class="pq-logo" href="/" aria-label="Mitingu home"><img src="/assets/mitingu-logo-white.png" alt="Mitingu" width="750" height="211"></a>
    <a class="pq-pill pq-pill-outline" href="#quiz" data-start>Take the quiz</a>
  </header>

  <section class="pq-view" id="view-start" aria-labelledby="pq-title">
    <div class="pq-hero">
      ${CONFETTI}
      <p class="pq-tag">30-second quiz</p>
      <h1 id="pq-title">What's your <span>registration</span> personality?</h1>
      <p class="pq-lede">Every event organiser has one. Answer six quick questions, meet your type, and see where your setup quietly eats your time.</p>
      <a class="pq-pill pq-pill-pink pq-pill-big" href="#quiz" data-start>Find out now →</a>
      <p class="pq-small">No sign-up needed to see your result.</p>
    </div>

    <div class="pq-cream">
      <div class="pq-wrap">
        <h2>Meet the five</h2>
        <p class="pq-sub">Most organisers are a mix. Which one sounds like your week?</p>
        <ul class="pq-five">
          ${ORDER.map(
            (key, i) => `<li style="--c:${TYPES[key].colour};--tilt:${TILTS[i]}">
            ${icon(TYPES[key].icon)}
            <h3>${esc(TYPES[key].name)}</h3>
            <p>${esc(TYPES[key].tag)}</p>
          </li>`,
          ).join("")}
        </ul>
      </div>
    </div>

    <div class="pq-how pq-wrap">
      <div><span style="color:#FFD23F">1</span><h3>Answer six questions</h3><p>Tap the answer that sounds most like your last event. No wrong answers.</p></div>
      <div><span style="color:#2EC4B6">2</span><h3>Meet your type</h3><p>Your personality, your superpower, and the bit of your setup that costs you evenings.</p></div>
      <div><span style="color:#FF5CA8">3</span><h3>Get your evenings back</h3><p>One practical tip for your type, and an easy way to talk it through with us if you'd like.</p></div>
    </div>

    <div class="pq-wrap pq-faq">
      <h2>Questions</h2>
      ${personalityFaqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
    </div>

    <div class="pq-wrap">
      <div class="pq-band">
        <h2>Ready to meet yourself?</h2>
        <a class="pq-pill pq-pill-white" href="#quiz" data-start>Start the quiz →</a>
      </div>
    </div>
  </section>

  <section class="pq-view" id="view-quiz" hidden aria-live="polite">
    <div class="pq-quiz pq-wrap">
      <div class="pq-progress">
        <div class="pq-bar" role="progressbar" aria-valuemin="1" aria-valuemax="${QUESTIONS.length}" aria-valuenow="1" id="q-bar"><span id="q-fill"></span></div>
        <span id="q-count">1 of ${QUESTIONS.length}</span>
      </div>
      <p class="pq-honest">Be honest</p>
      <h1 id="q-text" tabindex="-1"></h1>
      <div class="pq-answers" id="q-answers">
        ${LETTERS.map(
          (l, i) => `<button type="button" class="pq-answer" data-i="${i}" style="--c:${TYPES[ANSWER_TYPES[i]].colour};--s:${TYPES[ANSWER_TYPES[i]].shadow}"><b>${l}</b><span></span></button>`,
        ).join("")}
      </div>
      <div class="pq-quiz-foot">
        <button type="button" class="pq-link" id="q-back">← Back</button>
        <span>Tap an answer to move on</span>
      </div>
    </div>
  </section>

  <section class="pq-view" id="view-result" hidden>
    <div class="pq-reveal">
      ${CONFETTI}
      <div class="pq-burst" id="r-burst" aria-hidden="true"></div>
      <p class="pq-drum">Drum roll… you are</p>
      <div class="pq-badge" id="r-badge"></div>
      <h1 id="r-name" tabindex="-1"></h1>
      <p class="pq-lede" id="r-tag"></p>
    </div>
    <div class="pq-cream">
      <div class="pq-wrap">
        <div class="pq-cards">
          <div><p class="pq-label" style="color:#0B7A75">Your superpower</p><p id="r-super"></p></div>
          <div><p class="pq-label" style="color:#B0005D">Where your time goes</p><p id="r-time"></p></div>
          <div><p class="pq-label" style="color:#6B2BD9">One quick win</p><p id="r-win"></p></div>
        </div>

        <div class="pq-cta">
          <div>
            <h2 id="r-cta">Want to drop a few plates?</h2>
            <p>Tell us about the event on your mind. We'll show you how we'd set up its registration, in 15 minutes, no hard sell.</p>
          </div>
          <div class="pq-cta-actions">
            <a class="pq-pill pq-pill-yellow" id="r-book" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a 15-minute chat</a>
            <a class="pq-cta-link" id="r-example" href="mailto:${EXAMPLE_EMAIL}">Or send me an example</a>
          </div>
        </div>

        <form class="pq-profile" id="profile-form" novalidate>
          <h3>Get your full profile by email <span>(optional)</span></h3>
          <div class="pq-profile-row">
            <label class="pq-sr" for="p-name">First name</label>
            <input id="p-name" autocomplete="given-name" placeholder="First name">
            <label class="pq-sr" for="p-email">Email</label>
            <input id="p-email" type="email" autocomplete="email" placeholder="you@company.com">
            <button type="submit" class="pq-pill pq-pill-dark" id="p-send">Send it</button>
          </div>
          <div class="pq-hp" aria-hidden="true"><label for="p-botcheck">Leave this empty</label><input type="checkbox" id="p-botcheck" tabindex="-1"></div>
          <p class="pq-small" id="p-msg" role="status"></p>
        </form>

        <div class="pq-share">
          <div>
            <span>Share your type:</span>
            <a class="pq-pill pq-pill-line" id="r-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.mitingu.com%2Fpersonality" target="_blank" rel="noopener">LinkedIn</a>
            <button type="button" class="pq-pill pq-pill-line" id="r-copy">Copy link</button>
          </div>
          <a href="#quiz" class="pq-retake" data-start>Retake the quiz</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="pq-foot">
    <span>Mitingu: event registration built around how your event actually works.</span>
    <span>UK-built and UK-hosted · <a href="/">mitingu.com</a> · <a href="/privacy-policy">Privacy</a></span>
  </footer>
</div>
<script type="application/json" id="pq-data">${safeJson(data)}</script>
<script src="/personality-quiz.js?v=20261125" defer></script>`;
}
