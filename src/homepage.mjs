// Homepage (www.mitingu.com/), redesigned 17 Nov 2026.
//
// Problem-first, one guest list, real product images, no slogan pairs and no
// grids of identical cards. Wording lives in the markup below; edit it here.
// The page title, Google description, FAQ and structured data are unchanged
// and still come from site-content.json / site.mjs.
//
// Placeholders that wait on Greg (add them here when they arrive):
//   - an event photo (CBRE, cropped and cleared) for the "On the day" section
//   - optionally a team or onsite photo for the "Event people" section

const LOGOS = `
      <img class="client-logo logo-booking" src="/assets/logo-booking.png" alt="Booking.com" loading="lazy" width="336" height="56">
      <img class="client-logo logo-workday" src="/assets/logo-workday.png" alt="Workday" loading="lazy" width="183" height="88">
      <img class="client-logo logo-cbre" src="/assets/logo-cbre.png" alt="CBRE" loading="lazy" width="230" height="60">
      <img class="client-logo logo-campari" src="/assets/logo-campari.png" alt="Campari" loading="lazy" width="296" height="62">`;

const WEEK = [
  [
    "A dietary requirement arrives by text the night before, and you're the only one who saw it.",
    "It goes on the guest's record, so it's on the caterer's report and the badge by morning.",
  ],
  [
    "The keynote moves to 2pm, so you tell the website person, the app builder and every guest, separately.",
    "Change it once. The event site, the app and the next reminder all pick it up.",
  ],
  [
    "Fifty “did you get my email?” replies, and no idea who actually read the joining instructions.",
    "Confirmations and reminders go out on their own, and you can see who opened them.",
  ],
  [
    "The door list was printed at midnight and it's already wrong.",
    "Booths and staff check people in from the live list, and the badge prints on the spot.",
  ],
  [
    "Your director asks whether it was worth it, and you lose a day to exports.",
    "Registrations, attendance, leads and feedback are already in one report.",
  ],
];

const STEPS = [
  ["Invite", "Branded invitations to the right people, from your own address."],
  ["Register", "Your event site and form, with the awkward questions your event needs."],
  ["Remind", "Joining instructions and reminders that send themselves."],
  ["Check in", "Booths, staffed desks and the app, all on the live list."],
  ["Report", "Attendance, leads and feedback in one place, ready for the debrief."],
];

export function renderHomeV2({ button, faqSection }) {
  return `
  <section class="hp-hero">
    <div class="hp-hero-copy">
      <h1>Running the event is hard enough without also running the app supplier, the badge printer and the spreadsheet that joins them up.</h1>
      <p class="hp-lede">Mitingu puts your event site, registration, emails, attendee app and check-in into one place, all working from one guest list. Change a session time once and it's right everywhere. And when your director asks how it went, the answer is already there instead of buried in four exports.</p>
      <div class="hp-actions">
        ${button("/personality", "Get a free demo site in your branding", "accent")}
        ${button("/book-a-demo", "Book a demo")}
      </div>
      <p class="hp-small">We build the demo site, you click around it. No obligation, nothing to install.</p>
    </div>
    <figure class="hp-hero-figure">
      <img src="/assets/showcase-branded-event-site.webp" alt="A branded Mitingu event site for a partner summit, on a laptop and a phone" width="1800" height="1125" fetchpriority="high" decoding="async">
      <figcaption>A Mitingu event site in the organiser's own branding: registration, agenda and countdown on desktop and mobile.</figcaption>
    </figure>
  </section>

  <section class="trust-strip hp-logos" aria-label="Organisations whose event teams have used Mitingu">
    <p>Event teams at these organisations have run events on Mitingu</p>
    <div class="client-logos">${LOGOS}
    </div>
  </section>

  <section class="hp-band hp-soft">
    <div class="hp-split">
      <div class="hp-split-intro">
        <h2>Sound familiar?</h2>
        <p>None of this is anyone's fault. It's what happens when the site, the emails, the app and the door list all live in different places and you're the only thing connecting them.</p>
      </div>
      <div class="hp-week">
        <div class="hp-week-head" aria-hidden="true"><span>This week</span><span>With Mitingu</span></div>
        ${WEEK.map(
          ([now, then]) => `<div class="hp-week-row">
          <p class="hp-now"><span class="hp-sr">This week: </span>${now}</p>
          <p class="hp-then"><span class="hp-sr">With Mitingu: </span>${then}</p>
        </div>`,
        ).join("")}
      </div>
    </div>
  </section>

  <section class="hp-band hp-dark">
    <div class="hp-onday">
      <div class="hp-onday-copy">
        <h2>On the day, everything works from the list you updated last night.</h2>
        <p>Guests scan their QR code at a Mitingu Event Hub booth and their badge prints on the spot, while staffed desks handle the awkward ones. Once the morning rush is over, the same booths switch to an information point, so guests can check their agenda, find recommended exhibitors and open the floor plan.</p>
        <p>The attendee app carries every guest's pass and the floor plan, and exhibitors scan leads and mark them hot, warm or cold, so their follow-up starts before they've packed up the stand.</p>
        <p class="hp-onday-note">Event Hub booths, branded for your event, are available from early 2027.</p>
        ${button("/event-apps-onsite-registration", "See apps and onsite", "accent")}
      </div>
      <div class="hp-gallery">
        <figure>
          <img src="/assets/onsite-booths.webp" alt="Mitingu Event Hub booths with touchscreens, QR scanners and built-in badge printers, one printing a delegate badge" width="600" height="450" loading="lazy" decoding="async">
          <figcaption>Booths with built-in badge printers</figcaption>
        </figure>
        <figure>
          <img src="/assets/onsite-app.webp" alt="The attendee app showing scored leads and the exhibition floor plan" width="600" height="450" loading="lazy" decoding="async">
          <figcaption>Lead scoring and floor plan in the app</figcaption>
        </figure>
        <figure>
          <img src="/assets/onsite-checkin-screen.webp" alt="Event Hub screen asking guests to scan their QR code to check in and print their badge" width="600" height="450" loading="lazy" decoding="async">
          <figcaption>8am: scan in, badge prints</figcaption>
        </figure>
        <figure>
          <img src="/assets/onsite-info-screen.webp" alt="The same Event Hub screen later in the day, showing agenda, recommended exhibitors, floor plan and help" width="600" height="450" loading="lazy" decoding="async">
          <figcaption>10am: the same screen becomes an info point</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="hp-section">
    <div class="hp-narrow">
      <h2>One guest list, from the first invitation to the last report.</h2>
      <p>Every part of Mitingu reads and writes the same record for each guest, which is why nothing needs copying between systems and the numbers at the end actually add up.</p>
    </div>
    <ol class="hp-steps">
      ${STEPS.map(([title, text], i) => `<li><span class="hp-step-num">0${i + 1}</span><strong>${title}</strong><span>${text}</span></li>`).join("")}
    </ol>
    <div class="hp-shots">
      <figure>
        <img src="/assets/showcase-event-builder.webp" alt="The Mitingu event builder: step-by-step set-up on the left, with a live preview of the branded event page guests will see on the right" width="1568" height="705" loading="lazy" decoding="async">
        <figcaption>Build it: step by step with a live preview of what guests see, or just say what you want changed.</figcaption>
      </figure>
      <figure>
        <img src="/assets/showcase-communications.webp" alt="Email analytics in Mitingu showing opens and clicks for an invitation, a reminder and a survey" width="1800" height="1125" loading="lazy" decoding="async">
        <figcaption>Follow it: opens and clicks for every invitation, reminder and survey, next to the guest list.</figcaption>
      </figure>
    </div>
  </section>

  <section class="hp-band hp-warm">
    <div class="hp-split">
      <div class="hp-split-intro">
        <p class="hp-kicker">A real brief, name changed</p>
        <h2>Every type of guest needed something different.</h2>
      </div>
      <div class="hp-story">
        <p>Julie was running a supplier event where delegates, speakers and exhibitors each needed their own questions, joining instructions, way of checking in and follow-up. Two off-the-shelf systems couldn't do all of it, and a bespoke build missed the things only event people think of.</p>
        <p>So we adapted Mitingu around her event, and she ran it her way instead of trimming the event to fit the software. That's the part most platforms leave out: when the brief doesn't fit, we change the platform, not your event.</p>
      </div>
    </div>
  </section>

  <section class="hp-section hp-ai">
    <div class="hp-ai-copy">
      <h2>Ask a question, get an answer, not another dashboard.</h2>
      <p>Mitingu's assistant knows your events, guests and emails, so you can ask it what you'd ask a colleague who'd been watching everything. It can also build a first draft of a new event from a plain-English brief.</p>
      <p class="hp-small">Already use ChatGPT, Claude or Copilot at work? Mitingu connects to those too. <a href="/mcp">How that works</a></p>
    </div>
    <div class="hp-chat" aria-label="An example question and answer">
      <p class="hp-chat-label">Illustration</p>
      <p class="hp-chat-q">Which registrations have slowed down this week?</p>
      <p class="hp-chat-a">The Partner Summit is 38 sign-ups behind where it was this time last year. Most of the gap is EMEA partners: their reminder went out nine days ago and only 21% opened it. Shall I draft a follow-up to the ones who haven't?</p>
    </div>
  </section>

  <section class="hp-facts" aria-label="Mitingu in brief">
    <div><strong>10+ years</strong><span>running registration for corporate events</span></div>
    <div><strong>40+ languages</strong><span>for event sites and emails</span></div>
    <div><strong>UK built</strong><span>and supported, used by teams worldwide</span></div>
  </section>

  <section class="hp-section hp-person">
    <h2>Event people on the other end of the phone, not a ticket queue.</h2>
    <p>The people who show you Mitingu are the same people who help you set up your first event. They know what goes wrong at 8.30 on the morning of an event, and they'll still pick up the phone the night before yours.</p>
    <p class="hp-contact"><a href="tel:+441608495288">01608 495288</a> · <a href="mailto:hello@mitingu.com">hello@mitingu.com</a></p>
  </section>

  ${faqSection("/")}

  <section class="hp-band hp-dark hp-final">
    <div class="hp-narrow">
      <h2>See your next event on Mitingu before you commit to anything.</h2>
      <p>Tell us a little about it and we'll build a demo event site in your branding, with a sample event already set up, so you can click through it the way your guests and your team would.</p>
      <div class="hp-actions">
        ${button("/personality", "Get my free demo site", "accent")}
        ${button("/book-a-demo", "Book a demo", "outline-light")}
      </div>
      <p class="hp-small">Not sure where you'd start? <a href="/personality">Take the 30-second registration personality quiz.</a></p>
    </div>
  </section>
  `;
}
