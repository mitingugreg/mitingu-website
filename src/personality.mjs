// Registration personality page: www.mitingu.com/personality
//
// Landing page for the cold email campaign. Visitors pick one of five organiser
// types (or take a 4-question quiz), see a result, and can request a demo event
// site in their own branding. Four views on one address, switched by the hash:
//   #start, #quiz, #<type-key> (a result), #thanks (only after a real submission).
//
// All result and quiz wording lives in TYPES and QUESTIONS just below: edit the
// words there, not in the markup. The page and its script both read them.
//
// The demo form posts to Web3Forms (the same account as the Book a Demo form),
// which emails each request to Greg. Keep the field names as they are
// (name, email, organisation, website, event_type, event, notes, personality):
// the AI builder will read the same fields later.

// ---- WORDING: edit the result and quiz words here (used by the page and its script) ----
// Results: one entry per type.
export const TYPES = {
  "platform-loyalist": {
    name: "The Platform Loyalist",
    code: "PL-01",
    quote: "“It's fine. We just work around it.”",
    tag: "You chose a system, you stuck with it, and it mostly works.",
    symptoms: [
      "Your events look a lot like everyone else's events on the same platform.",
      "There's one field you really need, and the form won't let you have it.",
      "“How did it go?” still ends with an export and a spreadsheet.",
      "You pay for a hundred features and use about eleven."
    ],
    cost: "Mostly it's the workarounds: the small jobs your team does by hand because the system almost fits.",
    lead: "Keep what works. Try one event on Mitingu and compare.",
    gains: [
      "Event sites that look like your organisation, not a template",
      "Forms built around your event, awkward bits included",
      "Reports that answer “was it worth it?” without an export"
    ]
  },
  "spreadsheet-wrangler": {
    name: "The Spreadsheet Wrangler",
    code: "SW-02",
    quote: "“Let me just check the spreadsheet.”",
    tag: "A form, an inbox and a spreadsheet. Free, flexible, and held together by you.",
    symptoms: [
      "guest_list_FINAL_v7.xlsx exists, and someone is still working from v6.",
      "A dietary requirement once arrived by text message.",
      "You've pasted the same confirmation email into 140 replies.",
      "“Is Sarah coming or not?” takes three inboxes to answer."
    ],
    cost: "Hours of copying, chasing and checking, plus the nagging worry that the list on the door is out of date.",
    lead: "Same flexibility, without the copying and pasting.",
    gains: [
      "One live guest list that keeps itself up to date",
      "Confirmations and reminders that send themselves",
      "Check-in on the day from the same list"
    ]
  },
  "bespoke-builder": {
    name: "The Bespoke Builder",
    code: "BB-03",
    quote: "“I'll ask the developer.”",
    tag: "Your event site looks exactly how you want it. Getting it there took a while.",
    symptoms: [
      "The site looks fantastic. The registrations land in an inbox.",
      "Changing a date means emailing the developer and waiting.",
      "Every new event is a new build, and a new invoice.",
      "The emails to guests live somewhere else entirely."
    ],
    cost: "Paying to rebuild much the same thing for every event, and waiting on someone else for every change.",
    lead: "The tailored look you like, without starting from scratch each time.",
    gains: [
      "Your own look and feel, ready to reuse for the next event",
      "Change wording, dates and forms yourself",
      "Registration, emails and reporting in one place"
    ]
  },
  "shopkeeper": {
    name: "The Shopkeeper",
    code: "SK-04",
    quote: "“It's on the order. Somewhere.”",
    tag: "Your website already sells things, so why not event places?",
    symptoms: [
      "One person bought four places. You know the name of one of them.",
      "“Can I transfer my ticket?” sets off a small admin project.",
      "Your shop knows what sold. It doesn't know who's coming.",
      "Badges get made by hand the night before."
    ],
    cost: "Chasing guest details after the sale, and building the guest list by hand from order reports.",
    lead: "Keep taking payments online, and get a proper guest list with them.",
    gains: [
      "Every guest's details collected as they book, group bookings included",
      "Online payments, with the guest list built as you go",
      "Reminders, badges and check-in from the same list"
    ]
  },
  "juggler": {
    name: "The Juggler",
    code: "JG-05",
    quote: "“Which system is this one on?”",
    tag: "All of the above, depending on the week. Impressive, and slightly exhausting.",
    symptoms: [
      "The conference is on a platform, the dinners are on a form, and the webinar is on something else.",
      "Every new event starts with “which system are we using for this one?”",
      "Nobody can see the whole year's events in one place.",
      "A new team member has to learn three systems before they can help."
    ],
    cost: "Running several systems to do one job, then stitching the numbers together at the end of the year.",
    lead: "Put the whole programme in one place.",
    gains: [
      "Every event in one place, from a small dinner to a paid conference",
      "The same branding and guest details across your whole programme",
      "Reporting across all your events, not one at a time"
    ]
  }
};
export const ORDER = ["platform-loyalist", "spreadsheet-wrangler", "bespoke-builder", "shopkeeper", "juggler"];

// Each answer maps to a personality, in ORDER.
export const QUESTIONS = [
  {
    q: "A guest emails to change their dietary requirement. What happens next?",
    a: [
      "I update it in our event platform",
      "I find the right row in the spreadsheet. Eventually.",
      "It goes in a note, because the site can't change bookings",
      "I dig out their order and add a comment",
      "Depends which event it's for"
    ]
  },
  {
    q: "How do the joining instructions go out?",
    a: [
      "Scheduled from the platform's email tool",
      "Mail merge, and fingers crossed",
      "A separate email tool, with the list exported from the site",
      "The order confirmation covers it. Sort of.",
      "A different way for every event"
    ]
  },
  {
    q: "Your director asks “how did it go?” Where does the answer come from?",
    a: [
      "An export from the platform, tidied up in Excel",
      "The spreadsheet is the report",
      "I ask whoever built the site for the numbers",
      "The shop's sales report",
      "Three different places, stitched together"
    ]
  },
  {
    q: "Setting up your next event looks like…",
    a: [
      "Copy the last one and wrestle with the template",
      "New form, new spreadsheet, new folder",
      "A new brief to the web developer",
      "Add a new product to the shop",
      "First, decide which system to use"
    ]
  }
];
// ---- end of wording ----

export const personalityPath = "/personality";

export const personalityMeta = [
  "What's your registration personality?",
  "Five ways event organisers run registration, and where each one quietly eats your time. Pick your badge or take the 30-second quiz.",
];

// Questions answered on the page (also published as FAQPage structured data).
export const personalityFaqs = [
  [
    "What is a registration personality?",
    "A light-hearted way of describing how an event team runs registration. Mitingu sees five common set-ups: the Platform Loyalist, the Spreadsheet Wrangler, the Bespoke Builder, the Shopkeeper and the Juggler. Each one works, up to the point where it quietly starts eating the team's time.",
  ],
  [
    "What are the five registration personalities?",
    ORDER.map((key) => `${TYPES[key].name}: ${TYPES[key].tag}`).join(" "),
  ],
  [
    "How does the registration personality quiz work?",
    "Four questions about how you handle a guest's dietary change, send joining instructions, report on an event and set up the next one. Each answer matches one set-up, and the one you choose most often is your result. A tie makes you a Juggler. It takes about 30 seconds and your answers are not saved.",
  ],
  [
    "Can I see Mitingu with my own branding?",
    "Yes. Fill in the short form on your result and Mitingu will build a demo event site in your organisation's branding, with a sample event already set up, so you can click through it the way your guests and your team would. There is no obligation and nothing to install.",
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
      description: `${TYPES[key].tag} ${TYPES[key].cost}`,
      url: `https://www.mitingu.com/personality#${key}`,
    })),
  },
];

function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Readable without JavaScript, so search engines and AI tools can see every type.
function personalitiesSummary() {
  return `<section class="rp-summary" aria-labelledby="rp-types-title">
      <h2 id="rp-types-title">The five registration personalities</h2>
      <p class="rp-muted">Every set-up works up to a point. Here's where each one starts to cost you.</p>
      <ol class="rp-type-list">
        ${ORDER.map((key) => {
          const t = TYPES[key];
          return `<li>
          <span class="rp-type-code">${escapeHtml(t.code)}</span>
          <div>
            <h3><a href="#${key}">${escapeHtml(t.name)}</a></h3>
            <p>${escapeHtml(t.tag)}</p>
            <p class="rp-muted">Where it hurts: ${escapeHtml(t.cost.charAt(0).toLowerCase() + t.cost.slice(1))}</p>
          </div>
        </li>`;
        }).join("")}
      </ol>
    </section>
    <section class="rp-faq" aria-labelledby="rp-faq-title">
      <h2 id="rp-faq-title">Questions</h2>
      ${personalityFaqs
        .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`)
        .join("")}
    </section>`;
}

export function renderPersonalityPage(site) {
  const endpoint = site.formEndpoint || "https://api.web3forms.com/submit";
  return `<div class="rp" data-rp>
  <!-- START -->
  <section id="view-start" class="rp-hero" aria-labelledby="rp-title">
    <p class="rp-eyebrow">30-second quiz</p>
    <h1 id="rp-title">What's your registration personality?</h1>
    <p class="rp-lede">Every event organiser we meet runs registration in one of five ways. Each one has a point where it quietly starts eating your time. Pick the badge that sounds like you.</p>
    <p class="rp-quiz-prompt">Not sure? <a href="#quiz">Take the 30-second quiz</a></p>
    <div class="rp-picker" id="picker"></div>
    <div class="rp-or">
      <span>Not sure which one you are?</span>
      <button class="rp-btn" type="button" id="start-quiz">Take the 4-question quiz</button>
    </div>
    ${personalitiesSummary()}
  </section>

  <!-- QUIZ -->
  <section id="view-quiz" class="rp-quiz" hidden>
    <p class="rp-eyebrow" id="quiz-count">Question 1 of 4</p>
    <div class="rp-progress" aria-hidden="true"><div id="quiz-bar" style="width:25%"></div></div>
    <h2 id="quiz-q"></h2>
    <div class="rp-answers" id="quiz-answers"></div>
    <div class="rp-quiz-nav">
      <button class="rp-link" type="button" id="quiz-back">Back</button>
      <button class="rp-link" type="button" id="quiz-skip">Skip the quiz and pick a badge</button>
    </div>
  </section>

  <!-- RESULT -->
  <section id="view-result" class="rp-result" hidden>
    <div class="rp-badge-holder">
      <div class="rp-lanyard" aria-hidden="true"></div>
      <div class="rp-badge">
        <div class="rp-hole" aria-hidden="true"></div>
        <div class="rp-hello"><strong>HELLO</strong><span>my registration personality is</span></div>
        <h1 class="rp-who" id="r-name"></h1>
        <p class="rp-tag" id="r-tag"></p>
        <div class="rp-foot"><span>Delegate type</span><span id="r-code"></span></div>
      </div>
    </div>

    <div class="rp-section">
      <h2>Symptoms you might recognise</h2>
      <ul class="rp-symptoms" id="r-symptoms"></ul>
    </div>

    <div class="rp-section">
      <h2>What it's quietly costing you</h2>
      <p class="rp-cost" id="r-cost"></p>
    </div>

    <div class="rp-section">
      <h2>What changes on Mitingu</h2>
      <p class="rp-muted" id="r-lead"></p>
      <div class="rp-gains" id="r-gains"></div>
    </div>

    <div class="rp-demo" id="demo">
      <h2>See it with your own branding</h2>
      <p class="rp-muted">Tell us a little about you and we'll build a demo event site in your organisation's branding, with a sample event already set up, so you can click through it the way your guests and your team would. No obligation, and nothing to install.</p>
      <form id="demo-form" action="${endpoint}" method="POST" novalidate>
        <input type="hidden" name="access_key" value="${site.formAccessKey || ""}">
        <input type="hidden" name="subject" id="f-subject" value="Demo site request from the personality page">
        <input type="hidden" name="from_name" value="Mitingu personality page">
        <div class="rp-trap" aria-hidden="true">
          <label for="f-botcheck">Leave this empty</label>
          <input type="checkbox" id="f-botcheck" name="botcheck" tabindex="-1" autocomplete="off">
        </div>
        <div class="rp-field">
          <label for="f-name">Your name</label>
          <input id="f-name" name="name" autocomplete="name" required>
        </div>
        <div class="rp-field">
          <label for="f-email">Work email</label>
          <input id="f-email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="rp-field">
          <label for="f-org">Organisation</label>
          <input id="f-org" name="organisation" autocomplete="organization" required>
        </div>
        <div class="rp-field">
          <label for="f-web">Your website</label>
          <input id="f-web" name="website" inputmode="url" autocomplete="url" placeholder="e.g. yourcompany.co.uk" required>
        </div>
        <div class="rp-field">
          <label for="f-kind">What kind of event should we build?</label>
          <select id="f-kind" name="event_type" required>
            <option>Client dinner or reception</option>
            <option>Conference or summit</option>
            <option>Briefing or seminar</option>
            <option>Webinar or hybrid event</option>
            <option>Awards or gala</option>
            <option>Something else</option>
          </select>
        </div>
        <div class="rp-field">
          <label for="f-event">Event name or date <span class="rp-opt">(optional)</span></label>
          <input id="f-event" name="event" placeholder="e.g. Spring client dinner, March">
        </div>
        <div class="rp-field full">
          <label for="f-notes">Anything we should know? <span class="rp-opt">(optional)</span></label>
          <textarea id="f-notes" name="notes" placeholder="Number of guests, paid or free, anything awkward"></textarea>
        </div>
        <input type="hidden" id="f-type" name="personality">
        <p class="rp-error full" id="f-error" role="alert"></p>
        <div class="rp-form-actions">
          <button class="rp-btn" type="submit" id="f-submit">Build my demo site</button>
          <span class="rp-small">We'll only use your details to set up your demo. <a href="/privacy-policy">Privacy policy</a></span>
        </div>
      </form>
    </div>

    <div class="rp-section">
      <h3>Not quite you? Try another badge</h3>
      <div class="rp-others" id="r-others"></div>
    </div>
  </section>

  <!-- THANKS -->
  <section id="view-thanks" class="rp-thanks" hidden>
    <p class="rp-eyebrow">Request received</p>
    <h1 id="t-title">Thanks.</h1>
    <p class="rp-lede">We're building your demo event site and will email you the link shortly. In the meantime, if you know a Spreadsheet Wrangler who needs rescuing, feel free to send them this page.</p>
    <div class="rp-or">
      <button class="rp-btn ghost" type="button" id="copy-link">Copy the link to this quiz</button>
      <span class="rp-small" id="copy-msg" aria-live="polite"></span>
    </div>
  </section>

  <div class="rp-footline">
    <span>Mitingu: event registration, communications and check-in. UK built, UK hosted.</span>
    <a class="rp-link" href="#start">Start again</a>
  </div>
</div>
${personalityScript(site)}`;
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function personalityScript(site) {
  return `<script>
(function () {
  var TYPES = ${safeJson(TYPES)};
  var ORDER = ${safeJson(ORDER)};
  var QUESTIONS = ${safeJson(QUESTIONS)};

  var views = ["start", "quiz", "result", "thanks"];
  var current = null;
  var submitted = false;
  var quizIndex = 0;
  var answers = [];
  var FALLBACK_EMAIL = ${JSON.stringify(site.email || "hello@mitingu.com")};
  var LEADS_ENDPOINT = ${JSON.stringify(site.leadsEndpoint || "")};

  function $(id) { return document.getElementById(id); }

  function show(view) {
    views.forEach(function (v) { $("view-" + v).hidden = v !== view; });
    window.scrollTo(0, 0);
  }

  function buildPicker() {
    var wrap = $("picker");
    ORDER.forEach(function (key) {
      var t = TYPES[key];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rp-pick is-" + key + (key === "juggler" ? " juggler" : "");
      b.innerHTML =
        '<span class="strip"><span>Delegate</span><span class="code"></span></span>' +
        '<span class="name"></span><span class="quote"></span>';
      b.querySelector(".code").textContent = t.code;
      b.querySelector(".name").textContent = t.name;
      b.querySelector(".quote").textContent = t.quote;
      b.addEventListener("click", function () { location.hash = key; });
      wrap.appendChild(b);
    });
  }

  function renderResult(key) {
    var t = TYPES[key];
    current = key;
    $("view-result").setAttribute("data-type", key);
    $("r-name").textContent = t.name.replace(/^The /, "");
    $("r-tag").textContent = t.tag;
    $("r-code").textContent = t.code;
    $("r-cost").textContent = t.cost;
    $("r-lead").textContent = t.lead;
    $("f-type").value = t.name;

    var ul = $("r-symptoms");
    ul.innerHTML = "";
    t.symptoms.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });

    var g = $("r-gains");
    g.innerHTML = "";
    t.gains.forEach(function (s) {
      var d = document.createElement("div");
      d.className = "rp-gain";
      d.textContent = s;
      g.appendChild(d);
    });

    var o = $("r-others");
    o.innerHTML = "";
    ORDER.forEach(function (k) {
      if (k === key) return;
      var c = document.createElement("button");
      c.type = "button";
      c.className = "rp-chip";
      c.textContent = TYPES[k].name;
      c.addEventListener("click", function () { location.hash = k; });
      o.appendChild(c);
    });
    show("result");
  }

  function renderQuestion() {
    var q = QUESTIONS[quizIndex];
    $("quiz-count").textContent = "Question " + (quizIndex + 1) + " of " + QUESTIONS.length;
    $("quiz-bar").style.width = ((quizIndex + 1) / QUESTIONS.length * 100) + "%";
    $("quiz-q").textContent = q.q;
    $("quiz-back").hidden = quizIndex === 0;
    var box = $("quiz-answers");
    box.innerHTML = "";
    q.a.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rp-answer";
      b.textContent = text;
      b.addEventListener("click", function () {
        answers[quizIndex] = i;
        if (quizIndex < QUESTIONS.length - 1) {
          quizIndex++;
          renderQuestion();
        } else {
          location.hash = scoreQuiz();
        }
      });
      box.appendChild(b);
    });
  }

  function scoreQuiz() {
    var tally = [0, 0, 0, 0, 0];
    answers.forEach(function (i) { tally[i]++; });
    var best = Math.max.apply(null, tally);
    var leaders = tally.filter(function (n) { return n === best; }).length;
    // A tie, or answers spread across setups, means a Juggler.
    if (leaders > 1) return "juggler";
    return ORDER[tally.indexOf(best)];
  }

  function route() {
    var h = (location.hash || "").replace("#", "");
    if (TYPES[h]) { renderResult(h); return; }
    if (h === "quiz") { quizIndex = 0; answers = []; renderQuestion(); show("quiz"); return; }
    if (h === "thanks" && submitted) { show("thanks"); return; }
    show("start");
  }

  $("start-quiz").addEventListener("click", function () { location.hash = "quiz"; });
  $("quiz-skip").addEventListener("click", function () { location.hash = "start"; });
  $("quiz-back").addEventListener("click", function () {
    if (quizIndex > 0) { quizIndex--; renderQuestion(); }
  });

  function flag(fields) {
    ["f-name", "f-email", "f-org", "f-web"].forEach(function (id) {
      if (fields.indexOf(id) > -1) $(id).setAttribute("aria-invalid", "true");
      else $(id).removeAttribute("aria-invalid");
    });
    if (fields.length) $(fields[0]).focus();
  }

  var form = $("demo-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("f-name").value.trim();
    var email = $("f-email").value.trim();
    var org = $("f-org").value.trim();
    var web = $("f-web").value.trim();
    var err = $("f-error");
    var blank = [];
    if (!name) blank.push("f-name");
    if (!email) blank.push("f-email");
    if (!org) blank.push("f-org");
    if (!web) blank.push("f-web");
    if (blank.length) {
      err.textContent = "Please add your name, work email, organisation and website so we can build your demo.";
      flag(blank);
      return;
    }
    if (!/^[^\\s]+\\.[^\\s]{2,}$/.test(web)) {
      err.textContent = "Please check your website address, for example yourcompany.co.uk.";
      flag(["f-web"]);
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      err.textContent = "That email address doesn't look quite right. Please check it.";
      flag(["f-email"]);
      return;
    }
    err.textContent = "";
    flag([]);

    var keyField = form.querySelector("input[name=access_key]");
    var button = $("f-submit");
    var personality = $("f-type").value || "Not chosen";
    $("f-subject").value = "Demo site request: " + org + " (" + personality.replace(/^The /, "") + ")";

    var done = function () {
      submitted = true;
      if (window.gtag) window.gtag("event", "generate_lead", { form: "personality_demo", personality: personality });
      $("t-title").textContent = "Thanks, " + name.split(" ")[0] + ".";
      form.reset();
      location.hash = "thanks";
    };
    var reset = function () {
      button.disabled = false;
      button.textContent = "Build my demo site";
    };
    var failed = function () {
      err.textContent = "Sorry, that didn't send. Please try again in a moment, or email " + FALLBACK_EMAIL + " and we'll set up your demo from there.";
      reset();
    };

    // Backup route: Web3Forms emails the request to Greg if the leads service can't be reached.
    var viaWeb3Forms = function () {
      if (!keyField || !keyField.value) { failed(); return; }
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            if (response.ok && data.success !== false) { reset(); done(); return; }
            throw new Error((data && data.message) || "Request failed");
          });
        })
        .catch(failed);
    };

    button.disabled = true;
    button.textContent = "Sending…";

    if (!LEADS_ENDPOINT) { viaWeb3Forms(); return; }

    // Main route: the Mitingu leads service stores the lead and sends the confirmation email.
    var payload = {};
    ["name", "email", "organisation", "website", "event_type", "event", "notes", "personality", "botcheck"].forEach(function (field) {
      var el = form.elements[field];
      if (!el) return;
      payload[field] = el.type === "checkbox" ? (el.checked ? "on" : "") : el.value;
    });
    payload.source = "personality";
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;
    fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (timer) clearTimeout(timer);
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (response.ok && data.success) { reset(); done(); return; }
          if (response.status === 400 || response.status === 429) {
            err.textContent = data.message || "Please check your details and try again.";
            reset();
            return;
          }
          viaWeb3Forms();
        });
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        viaWeb3Forms();
      });
  });

  $("copy-link").addEventListener("click", function () {
    var url = "https://www.mitingu.com/personality";
    var msg = $("copy-msg");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        msg.textContent = "Copied: " + url;
      }, function () { msg.textContent = url; });
    } else {
      msg.textContent = url;
    }
  });

  buildPicker();
  window.addEventListener("hashchange", route);
  route();
})();
</script>`;
}
