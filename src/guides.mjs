// Guide pages added 8 Nov 2026 following Breaking B2B #508 ("How I'd Fix This
// 7 Figure SaaS AI SEO Strategy"): a definition page plus a "top tools" list
// for the same subject, so Google and AI assistants have a clear page to cite.
// Competitor facts come only from their own websites: Cvent, Bizzabo, Swoogo,
// EventsAir, InEvent, RainFocus, Whova and CrowdComms as read for the
// comparison pages on 5 Nov 2026 (see src/alternatives.mjs); Eventtia read
// 8 Nov 2026. No ratings, prices, review scores or claims about what they lack.

export const guides = [
  {
    path: "/what-is-white-label-event-registration",
    title: "What Is White-Label Event Registration? A Plain-English Guide",
    description: "White-label event registration means guests register, pay and get emails under your brand, not the software supplier's. What it covers and what to check.",
    eyebrow: "Guide",
    h1: "What is white-label event registration?",
    lead: "White-label event registration is event registration software that carries your brand, or your client's, instead of the software supplier's. Guests register, pay, get their emails and check in without ever being asked to notice who built the system.",
    answerTitle: "Your name on the door, not ours.",
    answer: "With white-label registration, the event website, registration form, confirmation and reminder emails, web address and, often, the event app and check-in screens all carry the organiser's branding. The supplier's name stays in the background. Corporate event teams use it to keep events looking like the company. Event agencies use it to run events for many clients, each under its own brand, from one platform.",
    sections: [
      {
        h2: "What “white-label” actually means",
        html: `<p>The phrase comes from manufacturing: a product made by one company and sold under another's label. In event software it means the platform is built to disappear. The guest sees your logo, your colours, your web address and your sender name. They don't see a supplier's logo in the footer, a “powered by” badge on the form, or an app on their phone named after a software company they've never heard of.</p>
<p>It isn't all or nothing. Most event platforms let you add a logo and change a colour. That's <em>branded</em>. White-label goes further, and the difference usually shows up in the details people only notice when they're wrong.</p>`,
      },
      {
        h2: "Branded versus white-label: where the difference shows",
        table: [
          ["", "Branded", "White-label"],
          ["Event website and form", "Your logo and colours on the supplier's template", "Your design, your layout, your fonts"],
          ["Web address", "yourevent.supplier.com", "events.yourcompany.com, or a web address of your choosing"],
          ["Emails", "Sent from the supplier, with their footer", "Sent in your name, from your address, in your style"],
          ["Event app", "The supplier's app; guests search for your event inside it", "An app with your name and icon in the app stores"],
          ["Check-in and badges", "Supplier screens and generic badges", "Your branding on the screens, booths and badges"],
          ["“Powered by” notices", "Usually visible", "Removed"],
        ],
        after: `<p>None of this changes how well an event runs. It changes whose event it feels like, which matters more than it sounds when the guests are your clients, your senior leaders or your client's customers.</p>`,
      },
      {
        h2: "Who uses white-label event registration",
        html: `<ul>
<li><strong>Corporate event teams</strong> who want client dinners, kick-offs, roadshows and conferences to look like the company that's hosting them, and not like a ticketing site.</li>
<li><strong>Event agencies</strong> running events for several clients at once. Each client gets its own branded event site, emails and app, while the agency runs everything from one platform and one login.</li>
<li><strong>Organisations with several brands, offices or regions</strong> that need each to look like itself, with central reporting underneath.</li>
<li><strong>Invite-only and VIP events</strong>, where a third-party brand in the middle of the guest journey looks careless.</li>
</ul>`,
      },
      {
        h2: "What to check before you choose a platform",
        html: `<p>Every supplier will tell you it's white-label. These questions find out how far it goes:</p>
<ol>
<li><strong>Can we use our own web address?</strong> And does the supplier's name appear anywhere in it?</li>
<li><strong>Whose name do the emails come from?</strong> Can we send from our own address, and remove the supplier's footer?</li>
<li><strong>Whose name and icon does the attendee app have?</strong> Is it a separate app in the App Store and Google Play under our brand, or the supplier's app with our event inside it?</li>
<li><strong>Do check-in screens, booths and badges carry our branding?</strong> The front door is the first thing guests see on the day.</li>
<li><strong>For agencies: can each client have its own environment?</strong> Separate branding, separate data, separate reports.</li>
<li><strong>Does everything share one attendee record?</strong> Registration, emails, the app, check-in and lead capture should all know who the guest is, without exports and spreadsheets in between.</li>
<li><strong>Can the form follow the event?</strong> Different guest types, routes and questions; payment by card, invoice or deposit; hotel booking; multiple languages.</li>
<li><strong>Who helps on the day?</strong> White-label means guests don't see the supplier. It shouldn't mean you can't find them either.</li>
</ol>`,
      },
      {
        h2: "White-label platform or build your own?",
        html: `<p>Some teams consider building registration in-house, or stitching together a form builder, an email tool, a spreadsheet and an app agency. It can look cheaper. The costs tend to arrive later: the reminder email sent to the wrong list, the capacity limit that didn't apply, the badge file exported at 7am, the app update that needs a developer. A white-label platform gives you the control over branding that building your own promises, without becoming the owner of the plumbing.</p>`,
      },
    ],
    related: [
      ["Event registration platforms compared", "/best-event-registration-platforms-for-corporate-events", "Ten platforms corporate teams and agencies ask us about, and when each fits."],
      ["White-label event platform", "/white-label-event-platform", "How Mitingu handles branding for agencies and multi-brand organisations."],
      ["White label event app: seven questions to ask", "/blog/2026/11/4/white-label-event-app-questions-to-ask", "What to ask before you sign for a branded event app."],
    ],
    mitingu: "Mitingu is a white-label event registration and event operations platform for corporate event teams and event agencies. Event websites, registration, emails, a white-label attendee app for iOS and Android, self-service booths that print badges on the spot, staffed check-in, exhibitor lead capture and reporting all carry your brand or your client's, and share one attendee record. It's built and supported in the UK and used for events anywhere.",
    faqs: [
      ["What is white-label event registration?", "Event registration software that carries the organiser's brand instead of the software supplier's: the event website, registration form, emails, web address and often the app and check-in screens all look like the organiser's own."],
      ["What is the difference between branded and white-label event software?", "Branded usually means your logo and colours on the supplier's template. White-label goes further: your own web address, emails sent in your name, an app with your name and icon, and no “powered by” notices."],
      ["Who needs white-label event registration?", "Corporate event teams who want events to look like the company, event agencies running events for several clients, and organisations with several brands or regions."],
      ["Can an event app be white-label?", "Yes. A white-label event app appears in the App Store and Google Play under your name and icon, rather than as the supplier's app with your event inside it. Ask suppliers which they offer."],
      ["Is Mitingu a white-label event registration platform?", "Yes. Mitingu provides white-label registration, event websites, emails, an attendee app, onsite check-in and lead capture for corporate event teams and agencies, anywhere in the world."],
    ],
  },
  {
    path: "/best-event-registration-platforms-for-corporate-events",
    title: "Event Registration Platforms for Corporate Events and Agencies: 10 Compared",
    description: "Ten event registration platforms corporate event teams and agencies ask about, what each says it does best, and when each one fits. Updated November 2026.",
    eyebrow: "Comparison",
    h1: "Event registration platforms for corporate events and agencies: 10 compared",
    lead: "Choosing event registration software is mostly about matching the platform to the events you actually run. Here are ten platforms corporate event teams and agencies ask us about, what each says it's built for, and when each one is likely to fit.",
    answerTitle: "We make one of these. So here's how to read the list.",
    answer: "Mitingu is on this list and we wrote it, so we've put ourselves first and said so. For the other nine, we've used only what each company says about itself on its own website (read in November 2026), plus when it's likely to suit you. We haven't scored anyone, guessed prices or repeated review sites. Check each supplier's current website before you decide, and use the questions at the end in every demo.",
    sections: [
      {
        h2: "At a glance",
        table: [
          ["Platform", "What it says it's built for", "Likely to fit if…"],
          ["Mitingu", "Corporate event teams and agencies: white-label registration, app, onsite check-in and reporting", "You want one supplier from invitation to report, under your brand or your client's"],
          ["Cvent", "Very large suite: registration, apps, check-in, venue marketplace, hotel room blocks", "You'll use the whole suite, or already have"],
          ["Bizzabo", "“Event Experience OS” for B2B conferences, trade shows and summits", "Your flagship conference and networking come first"],
          ["Swoogo", "Registration and event websites with extensive customisation", "You only need registration and websites"],
          ["EventsAir", "Broad platform since 1990, including abstracts, travel and streaming", "You need breadth, including abstract management"],
          ["InEvent", "All-in-one for virtual, hybrid and in-person events", "Virtual and hybrid events are central"],
          ["RainFocus", "Event marketing platform for Fortune 1000 programmes", "Events sit inside a large marketing data operation"],
          ["Whova", "All-in-one with a strong attendee app and community features", "You run conferences, associations or academic events"],
          ["CrowdComms", "Established since 2011: registration, branded app, badging, virtual and hybrid", "You want a long-established platform covering virtual too"],
          ["Eventtia", "Corporate and association teams running many events a year", "You want forms in many languages and EU or US data storage"],
        ],
      },
      {
        h2: "1. Mitingu",
        html: `<p><strong>What it is:</strong> a white-label event registration and event operations platform for corporate event teams and event agencies, built and supported in the UK and used for events anywhere. Registration with hotel and accommodation booking and payment by card, bank transfer or invoice (in full or in part); event emails; a white-label attendee app for iOS and Android with networking and meeting booking; self-service booths that print badges on the spot and staffed check-in; exhibitor lead capture with lead scoring; and reporting, all on one attendee record. The AI Event Builder drafts a branded event site, registration and emails from a plain-English description.</p>
<p><strong>Likely to fit if:</strong> you run a mix of client, internal, invite-only and conference events, or you're an agency running events under several clients' brands, and you'd rather have one supplier than a stack of tools. If an event needs something the platform doesn't do yet, Mitingu builds it into the platform.</p>
<p><strong>Worth knowing:</strong> Mitingu focuses on in-person events (streaming can be added) and doesn't currently offer abstract management.</p>`,
      },
      {
        h2: "2. Cvent",
        html: `<p><strong>What it says:</strong> the biggest name in event software, with more than 34,000 customers, 8 million events and most of the Fortune 100. Alongside registration, apps and check-in it runs a venue marketplace, hotel room-block tools and budgeting approvals.</p>
<p><strong>Likely to fit if:</strong> you source venues through its marketplace, need one vendor across events, webinars and virtual at very large scale, or have already standardised on it. <a href="/cvent-alternative">Mitingu vs Cvent</a>.</p>`,
      },
      {
        h2: "3. Bizzabo",
        html: `<p><strong>What it says:</strong> an “Event Experience OS” for B2B event leaders, focused on large conferences, trade shows and summits: networking, sponsor ROI, AI matchmaking and wearable smart badges that attendees tap to connect.</p>
<p><strong>Likely to fit if:</strong> a flagship conference is the centre of your year, or virtual and webinar formats matter a lot. <a href="/bizzabo-alternative">Mitingu vs Bizzabo</a>.</p>`,
      },
      {
        h2: "4. Swoogo",
        html: `<p><strong>What it says:</strong> registration-led, with “limitless customization”, unlimited conditional logic and in-house support.</p>
<p><strong>Likely to fit if:</strong> you need registration and event websites only, and are happy running the app and onsite through other suppliers. <a href="/swoogo-alternative">Mitingu vs Swoogo</a>.</p>`,
      },
      {
        h2: "5. EventsAir",
        html: `<p><strong>What it says:</strong> around since 1990 and covering almost everything: registration, apps, check-in, lead capture, abstracts, travel and accommodation, live streaming and AI assistants, for every kind of planner from associations and congress organisers to corporate teams.</p>
<p><strong>Likely to fit if:</strong> abstract submission and review are central, or live streaming is a big part of your programme. <a href="/eventsair-alternative">Mitingu vs EventsAir</a>.</p>`,
      },
      {
        h2: "6. InEvent",
        html: `<p><strong>What it says:</strong> an all-in-one platform for virtual, hybrid and in-person events, with a live streaming studio, virtual lobbies, NFC badges, facial-recognition check-in, AI matchmaking and a marketplace of service providers.</p>
<p><strong>Likely to fit if:</strong> virtual and hybrid events with studio-quality streaming are central to your programme. <a href="/inevent-alternative">Mitingu vs InEvent</a>.</p>`,
      },
      {
        h2: "7. RainFocus",
        html: `<p><strong>What it says:</strong> an event marketing platform built for Fortune 1000 companies running hundreds of events, with a data-first approach, deep marketing integrations (it's an Adobe partner) and AI-driven recommendations.</p>
<p><strong>Likely to fit if:</strong> your events sit inside a large marketing organisation and pipeline attribution is the main reason for the platform. <a href="/rainfocus-alternative">Mitingu vs RainFocus</a>.</p>`,
      },
      {
        h2: "8. Whova",
        html: `<p><strong>What it says:</strong> an all-in-one event platform with a strong attendee app (agendas, maps, networking, community boards and gamification), popular with conferences, associations and academic events, and covering registration, check-in kiosks, badges, lead capture and virtual events too.</p>
<p><strong>Likely to fit if:</strong> you run academic or association conferences, or community features are the heart of your event. <a href="/whova-alternative">Mitingu vs Whova</a>.</p>`,
      },
      {
        h2: "9. CrowdComms",
        html: `<p><strong>What it says:</strong> an established platform, running since 2011, covering registration, a branded event app, onsite badging, virtual and hybrid events, lead capture and reporting.</p>
<p><strong>Likely to fit if:</strong> live streaming and virtual audiences are central to most of your events, or you're already using it and nothing is pinching. <a href="/crowdcomms-alternative">Mitingu vs CrowdComms</a>.</p>`,
      },
      {
        h2: "10. Eventtia",
        html: `<p><strong>What it says:</strong> “event management software for every event you run”, for corporate and association event teams and brands running many events a year, covering planning, registration, communications, check-in and reporting. It says its forms come in 15 languages, that event pages can carry your colours and domain, and that data can be stored in the EU or the US.</p>
<p><strong>Likely to fit if:</strong> you run a high volume of events across Europe and the Americas and want a choice of where data is stored.</p>`,
      },
      {
        h2: "Questions to ask in every demo",
        html: `<ol>
<li>Can you build one of our real events in front of us? How long did that take?</li>
<li>Whose name do guests see: on the web address, the emails, the app and the check-in screens?</li>
<li>Do registration, emails, the app, check-in and lead capture share one attendee record?</li>
<li>Can delegates pay by invoice, or a deposit now and the rest later?</li>
<li>How do 200 people check in at 8.55am?</li>
<li>Which of the features we're paying for will we actually use this year?</li>
<li>When we need something the platform doesn't do, what happens next?</li>
<li>Who do we call on event day, and where are they?</li>
</ol>`,
      },
    ],
    related: [
      ["What is white-label event registration?", "/what-is-white-label-event-registration", "A plain-English guide, and what to check before you choose."],
      ["Enterprise event registration", "/enterprise-event-registration-platform", "How Mitingu handles registration for corporate event teams."],
      ["Running a multilingual event?", "/blog/2026/11/5/multilingual-event-registration", "Where multilingual registration usually goes wrong."],
    ],
    mitingu: "If you'd like to see how one of your own events would run in Mitingu, from registration and emails to the app, check-in and the report, book a demo and bring your most awkward event.",
    faqs: [
      ["What is the best event registration software for corporate events?", "It depends on the events you run. For a mix of client, internal and invite-only events where you want registration, a branded app and onsite check-in from one supplier, Mitingu is built for that. Very large organisations already using a full suite may prefer Cvent; registration-only buyers often look at Swoogo; conference-led teams look at Bizzabo or Whova."],
      ["What should I look for in event registration software?", "Whether it can follow your real events (guest types, routes, payments, languages), whose branding guests see, whether registration, emails, the app and check-in share one attendee record, how check-in works at peak, and who supports you on the day."],
      ["Which event registration platforms are white-label?", "Many platforms offer some branding. Ask each supplier about your own web address, emails sent in your name, an app with your name and icon in the app stores, and branded check-in. Mitingu offers all of these."],
      ["Is this list independent?", "No. Mitingu wrote it and lists itself first. Facts about the other platforms come only from their own websites, read in November 2026, with no scores or prices."],
    ],
  },
];

export const guidesByPath = Object.fromEntries(guides.map((guide) => [guide.path, guide]));
