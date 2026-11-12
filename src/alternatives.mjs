// Competitor "alternative" pages. Facts about each competitor come only from
// its own website (read 5 Nov 2026). No claims about their support, pricing,
// reviews or features they lack. Approved by Greg on 5 Nov 2026.
// These pages are deliberately NOT linked from the menu or footer.

const pay = ["Payment the way companies pay", "Card, bank transfer or invoice, in full or in part, so a delegate can pay a deposit now and the balance later."];
const built = ["Things built for you", "If an event needs something the platform doesn't do yet, ask, and Mitingu builds it into the platform rather than leaving you with a workaround."];
const builder = ["Describe the event, and Mitingu builds it", "The AI Event Builder takes a plain-English description of the audience, format and dates and builds a first draft of the branded event site, registration and communications for your team to review and launch. You can also do it from Claude, ChatGPT or Microsoft Copilot through Mitingu MCP."];
const clients = "Mitingu has worked with event teams at Booking.com, Workday, CBRE and Campari.";
const ukFaq = ["Is Mitingu only for UK events?", "No. Mitingu is built and supported in the UK and works with event teams and agencies anywhere."];
const payFaq = ["Can Mitingu take payments?", "Yes, by card, bank transfer or invoice, in full or in part."];

export const alternatives = [
  {
    path: "/cvent-alternative",
    name: "Cvent",
    title: "Cvent Alternative for Corporate Event Teams and Agencies",
    description: "Looking for a Cvent alternative? Where Mitingu fits: one platform for registration, a white-label app and onsite check-in, without the full suite.",
    intro: [
      "Cvent is the biggest name in event software, and it says so with numbers: more than 34,000 customers, 8 million events, and most of the Fortune 100. Alongside registration, apps and check-in, it runs a marketplace of venues, hotel room-block tools, budgeting approvals and a lot more besides.",
      "If your organisation uses all of that, it's hard to argue with. Plenty of teams don't. They run a steady programme of corporate, client or agency events, and want registration, an app and a smooth front door, not a suite with a module for every department. That's who Mitingu is for.",
    ],
    answerTitle: "If you use the whole suite, Cvent is hard to argue with.",
    differences: [
      ["One supplier, from invitation to report", "Registration with hotel and accommodation booking, event emails, a white-label attendee app with networking and meeting booking, self-service booths that print badges on the spot, staffed check-in desks, exhibitor lead capture and reporting, all from the same attendee record."],
      builder,
      ["Built around your event", "Registration is flexible enough to follow different guest types and routes. If an event needs something the platform doesn't do yet, you can ask for it and Mitingu builds it into the platform for you."],
      ["White-label as standard", "For agencies, every client can have its own branded event environment: sites, emails, the app and the booths."],
    ],
    suitsBetter: [
      "You source venues through the Cvent marketplace.",
      "You need one vendor across events, webinars and virtual experiences at very large scale.",
      "Your organisation has already standardised on Cvent and it's working.",
    ],
    questions: [
      "Which of the modules we're paying for will we actually use this year?",
      "How long does it take to set up a new event site and registration from scratch? Can you show us?",
      "How far does the branding go: the app's name and icon, emails, web addresses, the check-in screens?",
      "Do registration, hotel booking, the app, check-in and lead capture share one attendee record?",
      "Can delegates pay by invoice, or pay a deposit now and the rest later?",
    ],
    faqs: [
      ["What is a good alternative to Cvent?", "For corporate event teams and agencies who need registration, a branded app and onsite check-in from one supplier, without a venue marketplace or a large suite, Mitingu is worth a look."],
      ["Is Mitingu as big as Cvent?", "No. Cvent is a very large suite with a venue marketplace. Mitingu focuses on registration, accommodation booking, communications, a white-label app, onsite check-in, lead capture and reporting on one platform."],
      ["Does Mitingu have a white-label event app?", "Yes. The attendee app for iOS and Android carries your brand or your client's, with networking and meeting booking."],
      ukFaq,
    ],
  },
  {
    path: "/bizzabo-alternative",
    name: "Bizzabo",
    title: "Bizzabo Alternative for Corporate Events and Agencies",
    description: "Looking for a Bizzabo alternative? Mitingu runs registration, a branded app with networking and self-service badge booths for corporate events.",
    intro: [
      "Bizzabo describes itself as an “Event Experience OS” for B2B event leaders. Its focus is large conferences, trade shows and summits: networking, sponsor ROI, AI matchmaking and Klik SmartBadges that attendees tap to connect.",
      "That's a strong fit for a flagship conference. Many corporate event teams and agencies run something different: client dinners, internal kick-offs, invite-only briefings, roadshows and the occasional conference, often under several brands. For that mix, Mitingu is worth a look.",
    ],
    answerTitle: "Built for the whole mix of corporate events, not just the flagship.",
    differences: [
      ["Every kind of corporate event", "Public, private, internal and invite-only events, with registration that follows different guest types and routes, and hotel and accommodation booking built in."],
      ["Networking and meetings, under your brand", "Attendees network and book meetings in a white-label app for iOS and Android that carries your name, or your client's."],
      ["A front door that runs itself", "Self-service booths print each attendee's badge when they scan their QR pass, alongside staffed desks working from the same live list."],
      builder,
      ["Built for agencies", "Separate branded environments for each client, with their own sites, emails and app."],
      built,
    ],
    suitsBetter: [
      "You want wearable smart badges that attendees tap to connect.",
      "Virtual, hybrid and webinar formats are a big part of your programme.",
      "Your organisation has already standardised on Bizzabo and it's working.",
    ],
    questions: [
      "Will this work as well for a 60-person client dinner as for our conference?",
      "How quickly can we set up an invite-only event with its own branding?",
      "Can attendees network and book meetings in an app that carries our brand?",
      "How do guests check in when the queue is 200 deep at 8.55am?",
      "Can delegates pay by invoice, or in instalments?",
    ],
    faqs: [
      ["What is a good alternative to Bizzabo?", "If you run a mix of corporate, client, internal and agency events rather than one big conference, Mitingu is worth a look."],
      ["Does Mitingu support networking and meeting booking?", "Yes, in the white-label attendee app."],
      ["Does Mitingu do onsite check-in?", "Yes: self-service booths that print badges on the spot, plus staffed desks, from the same live attendee list."],
      payFaq,
    ],
  },
  {
    path: "/swoogo-alternative",
    name: "Swoogo",
    noPay: true,
    title: "Swoogo Alternative with White-label App and Onsite",
    description: "Looking for a Swoogo alternative? Mitingu adds a white-label app, self-service badge booths and lead scoring to registration, from one supplier.",
    intro: [
      "Swoogo is known for registration. It talks about “limitless customization”, unlimited conditional logic and in-house support. If registration and event websites are all you need, it's a strong choice, and we'd say so.",
      "Where teams start looking elsewhere is usually the day itself: the attendee app, the front door, the exhibitors, and how much of that comes from the same supplier as the registration.",
    ],
    answerTitle: "Strong on registration. The question is the day itself.",
    differences: [
      ["Registration, app and onsite from one supplier", "Registration and emails, plus a white-label attendee app with networking and meeting booking, self-service booths that print badges on the spot, staffed check-in desks, and exhibitor lead capture with hot, warm and cold scoring. All from the same attendee record, so nobody is matching spreadsheets after the event."],
      ["The app carries your brand", "Your name and icon on the attendee's phone, or your client's. The app has its own content system, so your team can move a session or send an announcement themselves on the day."],
      ["Custom features, built in for you", "If an event needs something the platform doesn't do yet, ask, and Mitingu builds it into the platform rather than leaving you with a workaround."],
      builder,
    ],
    suitsBetter: [
      "You need registration and event websites only, and run the app and onsite through other suppliers you're happy with.",
      "Virtual and webinar formats are a big part of your programme.",
    ],
    questions: [
      "Is the attendee app branded as ours, or as the supplier's?",
      "Who provides the check-in kit and badge printing on the day, and is it the same system as registration?",
      "Can exhibitors scan and score leads, and where do those leads go?",
      "When we need something the platform doesn't do, what happens next?",
    ],
    faqs: [
      ["What is a good alternative to Swoogo?", "If you want registration, a white-label attendee app, self-service badge booths and lead capture from one supplier, Mitingu is worth a look."],
      ["Does Mitingu have a white-label event app?", "Yes, for iOS and Android, carrying your brand or your client's, with networking and meeting booking."],
      ["Can Mitingu print badges onsite?", "Yes. Self-service booths print each attendee's badge when they scan their QR pass, alongside staffed desks."],
      ["Can Mitingu build custom features?", "Yes. Ask for something the platform doesn't do, and Mitingu builds it into the platform for you."],
    ],
  },
  {
    path: "/eventsair-alternative",
    name: "EventsAir",
    title: "EventsAir Alternatives for Corporate Events",
    description: "Comparing EventsAir alternatives? Where Mitingu fits for corporate event teams and agencies, and where EventsAir may still suit you better.",
    intro: [
      "EventsAir has been around since 1990 and covers almost everything: registration, apps, check-in, lead capture, abstracts, travel and accommodation, live streaming and AI assistants. It's built for every kind of event planner, from associations and congress organisers to corporate teams.",
      "Breadth is useful, but it comes with set-up. If you're a corporate event team or an agency, most of your time goes on getting the next event live, branded and running smoothly. That's where Mitingu concentrates.",
    ],
    answerTitle: "Breadth is useful. Getting the next event live matters more.",
    differences: [
      ["Get the event live quickly", "Describe the event in plain English and the AI Event Builder drafts the branded site, registration and emails for your team to review and launch. Or ask Claude, ChatGPT or Microsoft Copilot to do it through Mitingu MCP."],
      ["Corporate and agency events first", "Client events, internal events, invite-only briefings and conferences, with hotel and accommodation booking in registration, and white-label environments for agencies running several clients."],
      ["One attendee record on the day", "A white-label app with networking and meeting booking, self-service badge booths, staffed desks and lead capture all work from the same live list as registration."],
      built,
    ],
    suitsBetter: [
      "Abstract submission and review are central to your events. Mitingu doesn't currently offer abstract management.",
      "Live streaming and virtual audiences are a big part of your programme.",
    ],
    questions: [
      "How long does it take a new team member to set up an event without help?",
      "Which features will we use, and which are we paying to ignore?",
      "Can each client or brand have its own environment?",
      "When we need something the platform doesn't do, what happens next?",
    ],
    faqs: [
      ["What is a good alternative to EventsAir?", "For corporate event teams and agencies who want to get branded events live quickly, with registration, a white-label app and onsite check-in on one platform, Mitingu is worth a look."],
      ["Does Mitingu handle hotel and accommodation booking?", "Yes, as part of registration."],
      ["Does Mitingu do abstract management?", "Not currently."],
      ["Does Mitingu support live streaming?", "Mitingu focuses on in-person events; streaming can be added when an event needs it."],
    ],
  },
  {
    path: "/inevent-alternative",
    name: "InEvent",
    title: "InEvent Alternatives for In-Person Corporate Events",
    description: "Comparing InEvent alternatives? Mitingu focuses on in-person corporate events: registration, a white-label app, badge booths and lead scoring.",
    intro: [
      "InEvent describes itself as an all-in-one platform for virtual, hybrid and in-person events. It has a lot in it: a live streaming studio, virtual lobbies, NFC badges, facial-recognition check-in, AI matchmaking and a marketplace of service providers.",
      "If your events lean towards virtual and hybrid, that's a lot of capability. If they're mostly in-person corporate events, a long feature list can mean more to set up, more to train and more to ignore.",
    ],
    answerTitle: "In person first, and simpler to run.",
    differences: [
      ["In-person first", "Registration with hotel and accommodation booking, event emails, a white-label attendee app with networking and meeting booking, self-service booths that print badges on the spot, staffed desks and lead capture with hot, warm and cold scoring. Streaming can be added when an event needs it, but it isn't where our attention goes."],
      ["Quick to set up", "The AI Event Builder turns a plain-English description of your event into a first draft of the branded site, registration and emails."],
      built,
      ["Built and supported in the UK", "Working with event teams and agencies anywhere. We reply quickly and fix things quickly: ask us something awkward in the demo and time the answer."],
    ],
    suitsBetter: [
      "Virtual and hybrid events with studio-quality streaming are central to your programme.",
      "You want features such as facial-recognition check-in or a service marketplace.",
    ],
    questions: [
      "Which features will our team actually use at an in-person event?",
      "How long does training take before a new organiser can launch an event alone?",
      "Who do we talk to on event day, and where are they based?",
      "Do the app, check-in and lead capture share one attendee record with registration?",
    ],
    faqs: [
      ["What is a good alternative to InEvent?", "If your events are mostly in person and you want registration, a branded app, badge booths and lead capture without a long list of virtual features, Mitingu is worth a look."],
      ["Does Mitingu do virtual events?", "Mitingu focuses on in-person events; streaming can be added when an event needs it."],
      ["Does Mitingu have self-service check-in?", "Yes. Booths print each attendee's badge when they scan their QR pass."],
      payFaq,
    ],
  },
  {
    path: "/rainfocus-alternative",
    name: "RainFocus",
    title: "RainFocus Alternative for Corporate Event Teams",
    description: "Looking for a RainFocus alternative? Mitingu gives corporate event teams and agencies registration, a branded app and onsite check-in, set up quickly.",
    intro: [
      "RainFocus calls itself an event marketing platform. It's built for Fortune 1000 companies running hundreds of events, with a data-first approach, deep marketing integrations (it's an Adobe partner) and AI-driven recommendations.",
      "If your events sit inside a large marketing operation, that's the point. If you're a corporate event team or an agency that needs events running well (registration, the app, the front door, the report), you may not need a marketing data platform to do it.",
    ],
    answerTitle: "You may not need a marketing data platform to run events well.",
    differences: [
      ["The event, run well", "Registration with hotel and accommodation booking, emails, a white-label attendee app with networking and meeting booking, self-service badge booths, staffed desks, lead capture with hot, warm and cold scoring, and reporting, all on one platform."],
      ["Set up in less time", "The AI Event Builder drafts the branded site, registration and emails from a plain-English description, for your team to review and launch."],
      ["Answers without an analyst", "Event Intelligence lets you ask questions of your event data in plain English and get reports. Mitingu MCP connects that data to Claude, ChatGPT or Microsoft Copilot."],
      ["Built for agencies too", "Separate branded environments for each client, with their own sites, emails and app."],
    ],
    suitsBetter: [
      "You run hundreds of events inside a large marketing organisation with a big martech stack.",
      "Event data feeding pipeline and attribution is the main reason for the platform.",
    ],
    questions: [
      "Do we need an event marketing platform, or an event platform that reports well?",
      "How long until a new team member can launch an event on their own?",
      "Who looks after us on event day?",
      "What will we actually use in the first year?",
    ],
    faqs: [
      ["What is a good alternative to RainFocus?", "For corporate event teams and agencies who want registration, a branded app, onsite check-in and clear reporting without an enterprise marketing data platform, Mitingu is worth a look."],
      ["Can Mitingu report on event performance?", "Yes: registrations, attendance, app activity, leads, communications and NPS, plus Event Intelligence for plain-English questions about event data."],
      ["Does Mitingu integrate with other systems?", "Mitingu has integration and API capability, and Mitingu MCP connects compatible AI assistants to approved event data."],
      ukFaq,
    ],
  },
  {
    path: "/whova-alternative",
    name: "Whova",
    title: "Whova Alternatives with a White-label Event App",
    description: "Comparing Whova alternatives? Mitingu's attendee app carries your brand, with networking, registration, badge booths and lead capture.",
    intro: [
      "Whova is an all-in-one event platform with a strong attendee app: agendas, maps, networking, community boards and gamification. It's popular with conferences, associations and academic events, and covers registration, check-in kiosks, badges, lead capture and virtual events too.",
      "For corporate event teams and agencies, the question is often less about features and more about whose event it looks like.",
    ],
    answerTitle: "The question is often whose event it looks like.",
    differences: [
      ["An app that's yours", "Mitingu's attendee app for iOS and Android is white-label: your name and icon on the attendee's phone, or your client's. Attendees network and book meetings in it, and your team can change the agenda or send an announcement themselves on the day."],
      ["Corporate and agency events", "Client events, internal events, invite-only briefings and conferences, with hotel and accommodation booking in registration and separate branded environments for each client."],
      ["Quick to set up", "The AI Event Builder drafts the branded site, registration and emails from a plain-English description."],
      built,
    ],
    suitsBetter: [
      "You run academic or association conferences that need abstract management. Mitingu doesn't currently offer it.",
      "Community boards and gamification are the heart of your event.",
      "Virtual and hybrid sessions are a big part of your programme.",
    ],
    questions: [
      "Whose name and icon will attendees see on their phone?",
      "Can the app be branded differently for each client or event?",
      "Who can change the agenda on the day, and how quickly?",
      "Do registration, check-in and lead capture share one attendee record with the app?",
    ],
    faqs: [
      ["What is a good alternative to Whova?", "If you want an attendee app that carries your brand or your client's, with networking, registration, badge booths and lead capture on one platform, Mitingu is worth a look."],
      ["Is the Mitingu app white-label?", "Yes, for iOS and Android, with networking and meeting booking."],
      payFaq,
    ],
  },
];

export const alternativesByPath = Object.fromEntries(alternatives.map((a) => [a.path, a]));
export { pay, clients };
