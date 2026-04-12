export const DEFAULT_FRAMEWORK_PROGRESS = {
  completedStepIds: [],
  answers: {},
  encouragements: {},
};

export const PLANNER_FRAMEWORK_PHASES = [
  {
    id: "couple-brief",
    number: 1,
    title: "The Couple Brief",
    summary: "Collect the context every vendor needs before you ask for availability or a quote.",
    steps: [
      {
        id: "big-three-priorities",
        title: "The Big Three Priorities",
        shortSummary: "Set the tone, tradeoffs, and vendor style before money starts moving.",
        icon: "⭐",
        actionType: "manual",
        outreachGoal: "Help every vendor understand what quality means to you.",
        briefFields: ["top-priority", "tradeoff-boundary", "decision-owner", "vendor-energy"],
        draftQuestions: [
          "Which parts of our priorities affect your quote the most?",
          "Where would you recommend we simplify without hurting the guest experience?",
          "What decisions do you need from us before you can hold availability?",
        ],
        guidance: "Use this as the brief behind every vendor message. It keeps outreach focused on what matters instead of asking every vendor for a generic package.",
        questions: [
          {
            id: "top-priority",
            prompt: "What should feel unforgettable?",
            options: [
              { id: "food", label: "Food and hospitality", helper: "Massive spreads, live counters, and flawless service." },
              { id: "experience", label: "Rituals and Vibe", helper: "The decor, the Mandap, and the cultural authenticity." },
              { id: "photos", label: "Photos and film", helper: "The story matters long after the day ends." },
              { id: "entertainment", label: "Music and energy", helper: "The Baraat, Sangeet choreography, and dance floor." },
            ],
          },
          {
            id: "tradeoff-boundary",
            prompt: "What is the top tradeoff you are willing to make?",
            options: [
              { id: "decor", label: "Decor scale", helper: "Keep the mood, reduce the buildout." },
              { id: "guest-count", label: "Guest count", helper: "Protect quality by inviting fewer people." },
              { id: "extra-events", label: "Extra events", helper: "Focus budget on the core functions." },
              { id: "premium-brands", label: "Premium vendor names", helper: "Choose strong fit over famous names." },
            ],
          },
          {
            id: "decision-owner",
            prompt: "Who should have final say when priorities clash?",
            options: [
              { id: "couple", label: "The couple decides", helper: "Families advise, but the couple breaks ties." },
              { id: "families", label: "Families decide together", helper: "Useful when parents are hosting or funding major events." },
              { id: "event-owner", label: "Whoever hosts that event", helper: "Each host controls the priorities for their function." },
            ],
          },
          {
            id: "vendor-energy",
            prompt: "What kind of vendor energy do you prefer?",
            options: [
              { id: "premium", label: "Premium and polished", helper: "You want a high-touch team with strong presentation." },
              { id: "flexible", label: "Flexible and practical", helper: "You value responsiveness and smart problem-solving." },
              { id: "traditional", label: "Traditional and family-led", helper: "You want vendors who understand customs and elders." },
              { id: "experimental", label: "Experimental and fresh", helper: "You want new ideas, modern styling, and a distinct point of view." },
            ],
          },
        ],
      },
      {
        id: "auspicious-timing",
        title: "The Muhurat & Dates",
        shortSummary: "Identify your dates based on astrology, panchang, or family preference.",
        icon: "📅",
        actionType: "wedding-details",
        appliesToAllVendors: true,
        vendorTypes: ["Pandit", "Astrologers"],
        outreachGoal: "Tell vendors whether the date is fixed, flexible, or still waiting on family approval.",
        briefFields: ["date-driver", "date-flexibility", "seasonality", "date-approval"],
        draftQuestions: [
          "Are you available for our date or backup windows?",
          "How long can you hold availability while families finalize the date?",
          "Do your prices change for peak season or auspicious dates?",
        ],
        guidance: "Date flexibility changes every vendor conversation. Capture it once so your outreach can be direct without over-explaining.",
        questions: [
          {
            id: "date-driver",
            prompt: "What is driving your date selection?",
            options: [
              { id: "strict-muhurat", label: "Strict Muhurat", helper: "Dates are fixed by astrology; venues must fit this." },
              { id: "flexible-auspicious", label: "Flexible Saaya", helper: "You have 2-3 auspicious options to check venues against." },
              { id: "convenience", label: "Long weekends/Travel", helper: "Optimizing for NRI guests or holidays." },
            ],
          },
          {
            id: "date-flexibility",
            prompt: "How fixed is the muhurat or date?",
            options: [
              { id: "locked", label: "Locked date", helper: "Vendors need to confirm exact availability." },
              { id: "few-options", label: "A few date options", helper: "You can compare availability and pricing." },
              { id: "open", label: "Still open", helper: "You can ask vendors which windows work best." },
            ],
          },
          {
            id: "seasonality",
            prompt: "Which season are you targeting?",
            options: [
              { id: "winter-peak", label: "Winter Peak (Nov-Feb)", helper: "Highest demand, premium pricing, outdoor friendly." },
              { id: "summer-monsoon", label: "Summer/Monsoon", helper: "Indoor venues required, better vendor rates." },
              { id: "shoulder", label: "Shoulder Season", helper: "Balancing weather and availability." },
            ],
          },
          {
            id: "date-approval",
            prompt: "Who must approve the date before you announce it?",
            options: [
              { id: "pandit", label: "Pandit or astrologer", helper: "Get the final muhurat window in writing." },
              { id: "parents", label: "Both families", helper: "Confirm family travel, exams, and work conflicts." },
              { id: "venue-first", label: "Venue availability first", helper: "Hold the date before socializing it widely." },
            ],
          },
        ],
      },
      {
        id: "budget-distribution",
        title: "The Budget & Distribution",
        shortSummary: "Set quote boundaries without exposing private numbers by default.",
        icon: "₹",
        actionType: "wedding-details",
        outreachGoal: "Give vendors enough budget context to recommend the right package without weakening your negotiation position.",
        briefFields: ["host-distribution", "stretch-category", "hidden-costs", "budget-keeper"],
        draftQuestions: [
          "Which package level best fits a clear but controlled budget?",
          "What costs are usually missed in your quotes?",
          "What payment schedule and taxes should we expect?",
        ],
        guidance: "This step keeps money conversations useful. Vendor drafts should say you are shortlisting within a clear range, not reveal the exact budget unless you choose to later.",
        questions: [
          {
            id: "host-distribution",
            prompt: "How are the events being hosted?",
            options: [
              { id: "joint", label: "Fully joint events", helper: "Families pool budgets for all functions." },
              { id: "split-events", label: "Split by event", helper: "e.g., Bride hosts Mehndi, Groom hosts Reception." },
              { id: "traditional", label: "Traditional split", helper: "Bride's side hosts the primary wedding day." },
            ],
          },
          {
            id: "stretch-category",
            prompt: "Which categories are allowed to stretch?",
            options: [
              { id: "venue-food", label: "Venue and food", helper: "Guest comfort and hospitality can take priority." },
              { id: "photo-decor", label: "Photo, film, and decor", helper: "The look and memory of the wedding can lead." },
              { id: "entertainment", label: "Entertainment", helper: "Music, Sangeet, and after-party energy can stretch." },
              { id: "none", label: "None", helper: "Every quote needs to stay inside the planned range." },
            ],
          },
          {
            id: "hidden-costs",
            prompt: "Have you factored in the hidden Indian wedding costs?",
            options: [
              { id: "yes", label: "Yes, fully buffered", helper: "Jewelry, trousseau, gifting, and 18% GST are in." },
              { id: "no-gifting", label: "Forgot gifting/jewelry", helper: "Recalculate: these change your liquid budget." },
              { id: "unsure", label: "Still estimating", helper: "Add a strict 15% buffer to your current math." },
            ],
          },
          {
            id: "budget-keeper",
            prompt: "Who will keep the master budget honest?",
            options: [
              { id: "couple", label: "The couple", helper: "Best when you want one clean source of truth." },
              { id: "parents", label: "Parents or family lead", helper: "Best when families are making most payments." },
              { id: "planner", label: "Planner or accountant", helper: "Best for large, multi-vendor celebrations." },
            ],
          },
        ],
      },
      {
        id: "guest-event-matrix",
        title: "The Guest & Event Matrix",
        shortSummary: "Map event-wise headcount before vendors quote.",
        icon: "👥",
        actionType: "guests",
        outreachGoal: "Give vendors the right headcount and event shape instead of one vague guest number.",
        briefFields: ["event-attendance", "largest-event", "out-of-towners", "rsvp-owner"],
        draftQuestions: [
          "How does pricing change by event-wise headcount?",
          "What minimum guest count or staffing level should we plan for?",
          "What details do you need once RSVPs firm up?",
        ],
        guidance: "A multi-day wedding rarely has one guest count. Venue, food, decor, transport, photo, and entertainment teams all need to know which functions are intimate and which are large.",
        questions: [
          {
            id: "event-attendance",
            prompt: "How does attendance change across functions?",
            options: [
              { id: "intimate-to-grand", label: "Intimate to grand", helper: "Small pre-wedding, massive wedding or reception." },
              { id: "consistent", label: "Consistent crowd", helper: "The same people attend most functions." },
              { id: "unknown", label: "Needs mapping", helper: "Sit with families before asking vendors to quote." },
            ],
          },
          {
            id: "largest-event",
            prompt: "Which event has the largest guest count?",
            options: [
              { id: "wedding", label: "Wedding ceremony", helper: "Ritual logistics and meal timing matter most." },
              { id: "reception", label: "Reception", helper: "Stage flow, dinner service, and guest movement lead." },
              { id: "sangeet", label: "Sangeet or cocktail", helper: "Entertainment, AV, and late-night service matter." },
              { id: "not-sure", label: "Not sure yet", helper: "Use a range in your first vendor messages." },
            ],
          },
          {
            id: "out-of-towners",
            prompt: "How many out-of-town guests are expected?",
            options: [
              { id: "heavy", label: "Majority out-of-town", helper: "Room blocks and transport are major line items." },
              { id: "some", label: "Some out-of-town guests", helper: "Plan airport and hotel support for VIPs." },
              { id: "light", label: "Mostly local", helper: "Focus vendor spend on event scale." },
            ],
          },
          {
            id: "rsvp-owner",
            prompt: "Who owns RSVP follow-up?",
            options: [
              { id: "couple", label: "The couple", helper: "Best for friends and peers." },
              { id: "parents", label: "Parents by side", helper: "Best for extended family lists." },
              { id: "planner-team", label: "Planner or hospitality team", helper: "Best when travel and rooms are complex." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "venue-movement",
    number: 2,
    title: "Venue, Stay & Movement",
    summary: "Prepare strong outreach for venues, planners, transport, and party spaces.",
    steps: [
      {
        id: "venue-stay",
        title: "The Venue & Residential Logistics",
        shortSummary: "Decide if you are hosting the stay, the event, or both.",
        icon: "🏛️",
        actionType: "wedding-details",
        vendorTypes: ["Venue", "Party Places"],
        outreachGoal: "Ask venues for the right spaces, room commitments, guest flow, and restrictions.",
        briefFields: ["venue-type", "venue-subtype", "room-block", "venue-risk"],
        draftQuestions: [
          "Are you available for our date or date window?",
          "What spaces, room commitments, and minimums apply?",
          "What catering, decor, AV, sound, and outside-vendor restrictions should we know?",
        ],
        guidance: "Indian weddings are logistical beasts. A venue message should mention whether you need residential hosting, a city function space, or just a party venue.",
        questions: [
          {
            id: "venue-type",
            prompt: "What is the core logistical plan?",
            options: [
              { id: "residential", label: "Residential / Destination", helper: "All guests stay and celebrate at one property." },
              { id: "city-banquet", label: "City Banquets / Lawns", helper: "Events at a venue, guests stay at home/hotels." },
              { id: "hybrid", label: "Hybrid", helper: "Close family gets rooms, others commute." },
            ],
          },
          {
            id: "venue-subtype",
            prompt: "Which venue subtype should we shortlist first?",
            options: [
              { id: "resort-hotel", label: "Resort or hotel", helper: "Best for rooms, hospitality, and one-property flow." },
              { id: "lawn-farmhouse", label: "Lawn or farmhouse", helper: "Best for outdoor scale and heavier decor." },
              { id: "banquet-mandapam", label: "Banquet or mandapam", helper: "Best for city convenience and controlled service." },
              { id: "party-place", label: "Party place", helper: "Best for cocktail, after-party, or smaller functions." },
            ],
          },
          {
            id: "room-block",
            prompt: "How much room inventory do you need to control?",
            options: [
              { id: "buyout", label: "Full property buyout", helper: "Maximum control, highest minimum commitment." },
              { id: "family-block", label: "Close family room block", helper: "Protect VIP logistics without hosting everyone." },
              { id: "no-rooms", label: "No hosted rooms", helper: "Keep venue spend focused on events only." },
            ],
          },
          {
            id: "venue-risk",
            prompt: "What venue risk worries you most?",
            options: [
              { id: "weather", label: "Weather backup", helper: "Insist on indoor alternates for outdoor functions." },
              { id: "sound", label: "Sound deadline", helper: "Check curfew, permits, and neighborhood rules." },
              { id: "vendor-lockin", label: "Vendor lock-in", helper: "Understand catering, decor, and AV restrictions early." },
              { id: "parking", label: "Parking and access", helper: "Guest arrival and VIP entry can make or break flow." },
            ],
          },
        ],
      },
      {
        id: "planner-coordination",
        title: "Planner & Coordination",
        shortSummary: "Decide how much professional help the families need.",
        icon: "🗂️",
        actionType: "vendor",
        vendorTypes: ["Wedding Planners"],
        outreachGoal: "Help planners quote the right scope and understand the family complexity.",
        briefFields: ["planning-scope", "coordination-pain", "contract-help", "communication-style"],
        draftQuestions: [
          "Which planning scope would you recommend for our wedding?",
          "Do you handle vendor negotiation, guest hospitality, and show calling?",
          "How do you communicate with multiple family decision-makers?",
        ],
        guidance: "A planner quote depends on the number of functions, decision-makers, and logistics. This step keeps that message crisp.",
        questions: [
          {
            id: "planning-scope",
            prompt: "What level of planning help do you need?",
            options: [
              { id: "full-planning", label: "Full planning", helper: "Vendor, budget, hospitality, timeline, and production." },
              { id: "partial-planning", label: "Partial planning", helper: "Help with shortlist, contracts, and key logistics." },
              { id: "day-coordination", label: "Day-of coordination", helper: "Execution support once vendors are chosen." },
              { id: "not-sure", label: "Not sure yet", helper: "Ask planners to recommend scope." },
            ],
          },
          {
            id: "coordination-pain",
            prompt: "Who or what is hardest to coordinate?",
            options: [
              { id: "vendors", label: "Vendors", helper: "You need one owner for quotes, contracts, and timelines." },
              { id: "families", label: "Families", helper: "You need diplomatic coordination across sides." },
              { id: "guest-logistics", label: "Guest logistics", helper: "Travel, rooms, RSVPs, and hospitality are complex." },
              { id: "timelines", label: "Function timelines", helper: "You need show calling and on-ground execution." },
            ],
          },
          {
            id: "contract-help",
            prompt: "Should the planner help negotiate contracts?",
            options: [
              { id: "yes", label: "Yes, review and negotiate", helper: "Useful before deposits and cancellation terms." },
              { id: "review-only", label: "Review only", helper: "You want advice without full negotiation." },
              { id: "no", label: "No, execution only", helper: "Families will own commercial decisions." },
            ],
          },
          {
            id: "communication-style",
            prompt: "What communication style works best?",
            options: [
              { id: "single-owner", label: "One point of contact", helper: "Cleaner for decisions and approvals." },
              { id: "family-groups", label: "Family groups", helper: "Useful when both sides need visibility." },
              { id: "weekly-review", label: "Weekly reviews", helper: "Good for detailed planning cadence." },
            ],
          },
        ],
      },
      {
        id: "transport-hospitality",
        title: "Transport & Hospitality",
        shortSummary: "Brief transport vendors on routes, guests, and VIP movement.",
        icon: "🚌",
        actionType: "vendor",
        vendorTypes: ["Wedding Transportation"],
        outreachGoal: "Ask for a transport plan that matches airport arrivals, hotel loops, and baraat/VIP movement.",
        briefFields: ["transport-need", "pickup-zones", "guest-reminders", "transport-concern"],
        draftQuestions: [
          "What fleet mix would you recommend for our guest movement?",
          "Can you support airport pickups, shuttle loops, and VIP cars?",
          "How do you coordinate drivers, schedules, and last-minute guest changes?",
        ],
        guidance: "Transport vendors need more than a vehicle count. They need routes, pickup zones, guest type, and timing risk.",
        questions: [
          {
            id: "transport-need",
            prompt: "What transport is needed?",
            options: [
              { id: "airport-transfers", label: "Airport transfers", helper: "Guest arrivals and departures need tracking." },
              { id: "guest-coaches", label: "Guest coaches", helper: "Best for hotels to venue loops." },
              { id: "vip-cars", label: "VIP cars", helper: "Families and elders need assigned cars." },
              { id: "baraat-vehicle", label: "Baraat vehicle", helper: "Plan entry, route, and permissions early." },
            ],
          },
          {
            id: "pickup-zones",
            prompt: "How many pickup or drop zones are expected?",
            options: [
              { id: "one-zone", label: "One hotel or venue", helper: "Simple loop planning." },
              { id: "two-three", label: "Two to three zones", helper: "Needs route grouping and buffers." },
              { id: "many", label: "Many locations", helper: "Needs dispatch support and detailed guest mapping." },
            ],
          },
          {
            id: "guest-reminders",
            prompt: "Do guests need schedule reminders or hospitality support?",
            options: [
              { id: "yes", label: "Yes", helper: "Ask about driver coordination and message templates." },
              { id: "vip-only", label: "VIPs only", helper: "Focus support on elders and immediate family." },
              { id: "no", label: "No", helper: "Keep the quote focused on vehicles and drivers." },
            ],
          },
          {
            id: "transport-concern",
            prompt: "What is the biggest transport concern?",
            options: [
              { id: "punctuality", label: "Punctuality", helper: "Buffer ceremony and baraat timing." },
              { id: "comfort", label: "Comfort", helper: "Vehicle quality matters for elders and OOT guests." },
              { id: "cost", label: "Cost", helper: "Group routes and avoid idle-hour surprises." },
              { id: "complexity", label: "Route complexity", helper: "Multiple venues need a dispatch plan." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rituals-looks",
    number: 3,
    title: "Rituals, Beauty & Looks",
    summary: "Brief vendors who need cultural, family, and personal context.",
    steps: [
      {
        id: "ritual-guidance",
        title: "Ritual Guidance",
        shortSummary: "Align muhurat, rituals, language, and samagri expectations.",
        icon: "🪔",
        actionType: "vendor",
        vendorTypes: ["Pandit", "Astrologers"],
        outreachGoal: "Ask ritual vendors for the right ceremony scope, language, and family guidance.",
        briefFields: ["ritual-need", "ritual-language", "family-alignment", "samagri-checklist"],
        draftQuestions: [
          "Can you support the ritual scope and language style we need?",
          "Do you provide muhurat, samagri, and ceremony timing guidance?",
          "How do you coordinate with both families before the wedding?",
        ],
        guidance: "Ritual outreach needs cultural clarity. This step gives Pandits and astrologers enough context to respond properly.",
        questions: [
          {
            id: "ritual-need",
            prompt: "What ritual support do you need?",
            options: [
              { id: "muhurat-only", label: "Muhurat only", helper: "You need dates and timings first." },
              { id: "full-rituals", label: "Full rituals", helper: "You need ceremony execution and guidance." },
              { id: "kundli", label: "Kundli matching", helper: "Families need compatibility guidance." },
              { id: "samagri", label: "Samagri guidance", helper: "You need a clear item list and owner." },
            ],
          },
          {
            id: "ritual-language",
            prompt: "What language style should the ceremony use?",
            options: [
              { id: "traditional-sanskrit", label: "Traditional Sanskrit", helper: "Classic ceremony flow and chanting." },
              { id: "bilingual", label: "Bilingual explanation", helper: "Guests understand what is happening." },
              { id: "short-modern", label: "Short modern ceremony", helper: "Keep rituals meaningful and time-boxed." },
            ],
          },
          {
            id: "family-alignment",
            prompt: "Which families must be aligned?",
            options: [
              { id: "both-families", label: "Both families", helper: "A pre-call may prevent ritual confusion." },
              { id: "parents-only", label: "Parents only", helper: "Keep the couple looped in after decisions." },
              { id: "couple-led", label: "Couple-led", helper: "The ceremony should reflect your preferences." },
            ],
          },
          {
            id: "samagri-checklist",
            prompt: "Do you need an itemized samagri checklist?",
            options: [
              { id: "yes", label: "Yes", helper: "Ask for exact quantities and who brings what." },
              { id: "vendor-provides", label: "Vendor provides it", helper: "Confirm what is included in the fee." },
              { id: "no", label: "No", helper: "Families already have the list." },
            ],
          },
        ],
      },
      {
        id: "makeup-hair",
        title: "Makeup & Hair (MUA)",
        shortSummary: "Top Indian MUAs book out early. Secure the right scope.",
        icon: "💄",
        actionType: "vendor",
        vendorTypes: ["Bridal & Pre-Bridal"],
        outreachGoal: "Ask MUAs about availability, bridal look, family packages, trials, and getting-ready logistics.",
        briefFields: ["mua-priority", "family-makeup", "trial-plan", "getting-ready-logistics"],
        draftQuestions: [
          "Are you available for our date and getting-ready window?",
          "Do you offer family makeup packages or a junior team?",
          "What is included in bridal makeup, hair, draping, touch-ups, and trials?",
        ],
        guidance: "Premium MUAs book out quickly. A strong message should mention how flexible you are, who needs makeup, and where everyone gets ready.",
        questions: [
          {
            id: "mua-priority",
            prompt: "How critical is the bridal MUA choice?",
            options: [
              { id: "non-negotiable", label: "Non-negotiable", helper: "Book them the second the date is finalized." },
              { id: "flexible", label: "Flexible", helper: "Start trials and references before committing." },
              { id: "budget-led", label: "Budget-led", helper: "Ask for clear inclusions and assistant options." },
            ],
          },
          {
            id: "family-makeup",
            prompt: "Do you need family makeup packages?",
            options: [
              { id: "yes", label: "Yes, for mothers/sisters", helper: "Ask about junior artists and timing." },
              { id: "vip-only", label: "VIPs only", helper: "Prioritize immediate family." },
              { id: "no", label: "Bride only", helper: "Family will manage their own." },
            ],
          },
          {
            id: "trial-plan",
            prompt: "How will you test the look before the wedding?",
            options: [
              { id: "full-trial", label: "Full trial before booking", helper: "Best if the look is non-negotiable." },
              { id: "reference-call", label: "Reference call first", helper: "Shortlist through past work and skin-tone matches." },
              { id: "event-trial", label: "Use a smaller event as trial", helper: "Try them for engagement or roka makeup." },
            ],
          },
          {
            id: "getting-ready-logistics",
            prompt: "What getting-ready setup do you need?",
            options: [
              { id: "single-suite", label: "One bridal suite", helper: "Simpler timing and photography." },
              { id: "multiple-rooms", label: "Multiple family rooms", helper: "Needs assistants, call times, and room access." },
              { id: "venue-salon", label: "Venue salon or studio", helper: "Confirm chairs, mirrors, lights, and power." },
            ],
          },
        ],
      },
      {
        id: "bridal-groom-styling",
        title: "Bridal & Groom Styling",
        shortSummary: "Plan outfits, jewelry, grooming, and fitting timelines.",
        icon: "👗",
        actionType: "vendor",
        vendorTypes: ["Bridal & Pre-Bridal", "Groom Services"],
        outreachGoal: "Ask styling vendors for the right outfit, jewelry, grooming, and alteration support.",
        briefFields: ["outfit-strategy", "look-count", "jewelry-approach", "groom-needs"],
        draftQuestions: [
          "Can you support our outfit timeline and number of looks?",
          "What fittings, alteration buffers, and styling consultations are included?",
          "Can you coordinate jewelry, accessories, safa, footwear, or grooming?",
        ],
        guidance: "Couture, jewelry, and grooming vendors need timeline clarity. This step turns look planning into a useful outreach brief.",
        questions: [
          {
            id: "outfit-strategy",
            prompt: "What is your outfit strategy?",
            options: [
              { id: "custom-designer", label: "Designer or custom", helper: "Start early and plan trial trips." },
              { id: "ready-to-wear", label: "Boutique ready-to-wear", helper: "Faster, but still needs fittings." },
              { id: "rental", label: "Rental", helper: "Ask about dates, deposits, and damage terms." },
              { id: "heirloom", label: "Family heirloom", helper: "Styling and alteration support matter." },
            ],
          },
          {
            id: "look-count",
            prompt: "How many looks need coordinated planning?",
            options: [
              { id: "main-two", label: "Wedding and reception", helper: "Focus on the two most photographed looks." },
              { id: "all-functions", label: "Every function", helper: "Needs a styling calendar and alteration buffer." },
              { id: "family-coordination", label: "Family coordination too", helper: "Color palettes and shopping deadlines matter." },
            ],
          },
          {
            id: "jewelry-approach",
            prompt: "How are you handling jewelry?",
            options: [
              { id: "owned", label: "Owned or heirloom", helper: "Design outfits around existing pieces." },
              { id: "buying-new", label: "Buying new", helper: "Match after outfit direction is set." },
              { id: "rental", label: "Rental jewelry", helper: "Confirm security deposits and pickup timing." },
              { id: "undecided", label: "Undecided", helper: "Ask styling vendors what sequence they recommend." },
            ],
          },
          {
            id: "groom-needs",
            prompt: "What groom support is needed?",
            options: [
              { id: "sherwani", label: "Sherwani", helper: "Ask about fittings, custom work, and delivery." },
              { id: "full-styling", label: "Full styling", helper: "Safa, mojari, accessories, and coordination." },
              { id: "salon-grooming", label: "Salon and grooming", helper: "Hair, beard, facial, and wedding-week schedule." },
              { id: "none", label: "None yet", helper: "Keep the first draft focused on bridal needs." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "food-production",
    number: 4,
    title: "Food, Decor & Production",
    summary: "Collect the operational details that prevent vague quotes and missed inclusions.",
    steps: [
      {
        id: "catering-bar",
        title: "Catering & Bar",
        shortSummary: "Plan food direction, dietary needs, bar policy, and tasting expectations.",
        icon: "🍽️",
        actionType: "vendor",
        vendorTypes: ["Catering"],
        outreachGoal: "Ask caterers for menus, pricing, staffing, tastings, bar support, and dietary discipline.",
        briefFields: ["food-direction", "bar-policy", "dietary-coverage", "tasting-expectation"],
        draftQuestions: [
          "Can you support the food direction and dietary requirements we need?",
          "What is included per plate, and what costs are separate?",
          "How do tastings, staffing, bar support, and live counters work?",
        ],
        guidance: "Food is one of the fastest ways quotes become fuzzy. Capture cuisine, bar, diet, and tasting expectations before messaging caterers.",
        questions: [
          {
            id: "food-direction",
            prompt: "What is the food direction?",
            options: [
              { id: "regional", label: "Regional", helper: "Authentic menus that reflect both families." },
              { id: "global-live", label: "Global and live counters", helper: "Interactive stations and multi-cuisine variety." },
              { id: "traditional-sitdown", label: "Traditional sit-down", helper: "Controlled timing and service." },
              { id: "mixed-events", label: "Mixed by event", helper: "Different formats for ceremony, Sangeet, and reception." },
            ],
          },
          {
            id: "bar-policy",
            prompt: "What is the alcohol plan?",
            options: [
              { id: "dry", label: "Dry Wedding", helper: "Focus budget on mocktails and specialty coffees/teas." },
              { id: "full-bar", label: "Full Bar & Mixology", helper: "Requires licenses (P-10), bartenders, and heavy budget allocation." },
              { id: "sangeet-only", label: "Sangeet / Cocktail only", helper: "Restricted to specific evening events." },
            ],
          },
          {
            id: "dietary-coverage",
            prompt: "What dietary coverage is non-negotiable?",
            options: [
              { id: "jain", label: "Jain and no onion/garlic", helper: "Needs separate prep, labels, and service discipline." },
              { id: "regional", label: "Regional preferences", helper: "Balance both families' cuisines." },
              { id: "allergy", label: "Allergies and special meals", helper: "Track with RSVP notes and kitchen labels." },
              { id: "children-elders", label: "Children and elders", helper: "Plan mild, easy-to-serve options." },
            ],
          },
          {
            id: "tasting-expectation",
            prompt: "When do you expect a tasting?",
            options: [
              { id: "before-shortlist", label: "Before shortlist", helper: "Useful if food is the top priority." },
              { id: "after-shortlist", label: "After shortlist", helper: "Compare only serious vendors." },
              { id: "after-booking", label: "After booking", helper: "Make tasting part of menu finalization." },
            ],
          },
        ],
      },
      {
        id: "decor-florals-tent",
        title: "Decor, Florals & Tent",
        shortSummary: "Translate the mood into build, flowers, and outdoor infrastructure.",
        icon: "🌺",
        actionType: "vendor",
        vendorTypes: ["Wedding Decorators", "Florists", "Tent House"],
        outreachGoal: "Ask production vendors for the right scope, references, fresh florals, tenting, power, and weather backup.",
        briefFields: ["decor-priority", "floral-style", "outdoor-infrastructure", "reference-style"],
        draftQuestions: [
          "Can you quote the priority areas first before a full buildout?",
          "What is included for florals, rentals, tenting, power, and labor?",
          "How do you handle weather backup and venue restrictions?",
        ],
        guidance: "Decor quotes need clear priorities. A mandap-first brief is very different from a full venue transformation.",
        questions: [
          {
            id: "decor-priority",
            prompt: "What decor area matters most?",
            options: [
              { id: "mandap", label: "Mandap", helper: "Ceremony photos and rituals lead." },
              { id: "stage", label: "Stage", helper: "Reception and Sangeet visuals lead." },
              { id: "entry", label: "Entry experience", helper: "Guest arrival and first impression lead." },
              { id: "full-venue", label: "Full venue transformation", helper: "Every zone needs design continuity." },
            ],
          },
          {
            id: "floral-style",
            prompt: "What floral style fits the plan?",
            options: [
              { id: "fresh-heavy", label: "Fresh-heavy", helper: "Premium look, higher cost and timing sensitivity." },
              { id: "minimal-fresh", label: "Minimal fresh", helper: "Use flowers where they photograph best." },
              { id: "artificial-mix", label: "Artificial mix", helper: "Budget control and weather resilience." },
              { id: "seasonal-local", label: "Seasonal and local", helper: "Better freshness and supply reliability." },
            ],
          },
          {
            id: "outdoor-infrastructure",
            prompt: "What outdoor infrastructure is needed?",
            options: [
              { id: "tenting", label: "Tenting", helper: "Shade, rain, or dining cover." },
              { id: "lounge-seating", label: "Lounge seating", helper: "Guest comfort and photo zones." },
              { id: "weather-covers", label: "Weather covers", helper: "Outdoor backup matters." },
              { id: "generators", label: "Generators and power", helper: "Production needs reliable power." },
            ],
          },
          {
            id: "reference-style",
            prompt: "What reference style feels right?",
            options: [
              { id: "royal", label: "Royal", helper: "Grandeur, heritage, and rich detailing." },
              { id: "modern", label: "Modern", helper: "Clean lines and statement elements." },
              { id: "traditional", label: "Traditional", helper: "Cultural motifs and warm ceremony styling." },
              { id: "garden-minimal", label: "Garden or minimal", helper: "Soft, natural, and restrained." },
            ],
          },
        ],
      },
      {
        id: "cake-dessert",
        title: "Cake & Dessert",
        shortSummary: "Plan cake, dessert table, dietary needs, and delivery risks.",
        icon: "🎂",
        actionType: "vendor",
        vendorTypes: ["Wedding Cakes"],
        outreachGoal: "Ask cake vendors for design, eggless options, display setup, delivery, and heat-safe planning.",
        briefFields: ["cake-need", "cake-event", "cake-design", "cake-logistics"],
        draftQuestions: [
          "Can you support the design and dietary needs for this event?",
          "What is included for delivery, setup, stand, and display table styling?",
          "How do you handle heat, timing, and venue coordination?",
        ],
        guidance: "Cake vendors need event context, design direction, and delivery constraints before they can quote honestly.",
        questions: [
          {
            id: "cake-need",
            prompt: "What dessert support do you need?",
            options: [
              { id: "tiered-cake", label: "Tiered cake", helper: "A focal point for reception or cocktail." },
              { id: "dessert-table", label: "Dessert table", helper: "More variety and guest flow." },
              { id: "eggless-options", label: "Eggless options", helper: "Confirm taste, stability, and labeling." },
              { id: "ceremonial-only", label: "Ceremonial cake only", helper: "Keep the quote simple." },
            ],
          },
          {
            id: "cake-event",
            prompt: "Which event is it for?",
            options: [
              { id: "reception", label: "Reception", helper: "Plan stage/table placement." },
              { id: "cocktail", label: "Cocktail", helper: "Late-night service and lighting matter." },
              { id: "engagement", label: "Engagement", helper: "Smaller but still photo-forward." },
              { id: "not-sure", label: "Not sure yet", helper: "Ask for options by event size." },
            ],
          },
          {
            id: "cake-design",
            prompt: "What design direction fits?",
            options: [
              { id: "floral", label: "Floral", helper: "Coordinate with decor and fresh flowers." },
              { id: "minimal", label: "Minimal", helper: "Clean and elegant." },
              { id: "grand-tiered", label: "Grand tiered", helper: "More structure and delivery planning." },
              { id: "custom-motif", label: "Custom motif", helper: "Names, monograms, or theme details." },
            ],
          },
          {
            id: "cake-logistics",
            prompt: "What delivery or setup concern matters most?",
            options: [
              { id: "heat", label: "Heat", helper: "Ask about stability and refrigeration." },
              { id: "timing", label: "Timing", helper: "Coordinate setup around event flow." },
              { id: "display", label: "Display table", helper: "Stand, linen, florals, and lighting." },
              { id: "venue-coordination", label: "Venue coordination", helper: "Security, entry, and storage matter." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "memories-entertainment",
    number: 5,
    title: "Memories & Entertainment",
    summary: "Brief photo, film, music, DJ, entertainment, choreography, and photo booth teams.",
    steps: [
      {
        id: "photo-video",
        title: "Photographer & Videographer",
        shortSummary: "Shortlist the team that will preserve the wedding story.",
        icon: "📸",
        actionType: "vendor",
        vendorTypes: ["Photography", "Wedding Videography"],
        outreachGoal: "Ask photo and film teams for coverage, deliverables, crew size, and family portrait support.",
        briefFields: ["visual-style", "coverage-scope", "deliverables", "family-photo-plan"],
        draftQuestions: [
          "Are you available for our date and event coverage scope?",
          "What crew size, deliverables, and delivery timelines are included?",
          "Can you support the family portrait flow we need?",
        ],
        guidance: "Strong photography and film teams book early. Your message should make style, coverage, deliverables, and family expectations clear.",
        questions: [
          {
            id: "visual-style",
            prompt: "What visual style feels right?",
            options: [
              { id: "candid-cinematic", label: "Candid and cinematic", helper: "Focus on real moments and wedding films." },
              { id: "traditional", label: "Traditional heavy", helper: "Focus on stage shots, family groups, and rituals." },
              { id: "mixed", label: "Hybrid", helper: "Blend documentary storytelling with family coverage." },
            ],
          },
          {
            id: "coverage-scope",
            prompt: "Which events need full coverage?",
            options: [
              { id: "all-events", label: "Every function", helper: "Best for multi-day storytelling." },
              { id: "core-events", label: "Core events only", helper: "Prioritize wedding, reception, and Sangeet." },
              { id: "split-crew", label: "Split crew by event", helper: "Use smaller teams for lower-priority functions." },
            ],
          },
          {
            id: "deliverables",
            prompt: "What is your must-have deliverable?",
            options: [
              { id: "same-day-edit", label: "Same-day edit or reels", helper: "Fast turnaround for social sharing." },
              { id: "documentary", label: "Full documentary film", helper: "Long-format ceremony and event memory." },
              { id: "coffee-table", label: "Premium albums", helper: "High-end print deliverables for families." },
              { id: "raw-footage", label: "Raw footage", helper: "Confirm storage, format, and handover." },
            ],
          },
          {
            id: "family-photo-plan",
            prompt: "How formal should family photos be?",
            options: [
              { id: "detailed-shotlist", label: "Detailed shot list", helper: "Best for large families and formal portraits." },
              { id: "quick-groups", label: "Quick group blocks", helper: "Keep ceremonies moving without missing VIPs." },
              { id: "mostly-candid", label: "Mostly candid", helper: "Works only if families are aligned." },
            ],
          },
        ],
      },
      {
        id: "music-dj-entertainment",
        title: "Music, DJ & Entertainment",
        shortSummary: "Plan the Baraat, Sangeet, cocktail, live acts, and sound risks.",
        icon: "🎵",
        actionType: "vendor",
        vendorTypes: ["Music", "Wedding DJ", "Wedding Entertainment"],
        outreachGoal: "Ask entertainment vendors for the right act, sound setup, permissions, and playlist control.",
        briefFields: ["energy-moment", "entertainment-need", "sound-concern", "playlist-control"],
        draftQuestions: [
          "Are you available for the function and energy moment we are planning?",
          "What sound, lighting, crew, permits, and backup equipment are included?",
          "How do you handle family requests, playlists, and live crowd reading?",
        ],
        guidance: "Entertainment outreach should say which moment matters most. A Baraat brief is not the same as a cocktail DJ brief.",
        questions: [
          {
            id: "energy-moment",
            prompt: "What is the main energy moment?",
            options: [
              { id: "baraat", label: "Baraat", helper: "Movement, permissions, and live energy matter." },
              { id: "sangeet", label: "Sangeet", helper: "Performance flow and AV matter." },
              { id: "cocktail", label: "Cocktail", helper: "DJ, bar flow, and late-night energy matter." },
              { id: "reception", label: "Reception", helper: "Crowd reading and family-friendly music matter." },
            ],
          },
          {
            id: "entertainment-need",
            prompt: "What entertainment do you need?",
            options: [
              { id: "live-band", label: "Live band", helper: "Sufi, instrumental, or reception set." },
              { id: "dhol-dj", label: "Dhol and DJ", helper: "Baraat and dance floor energy." },
              { id: "anchor-mc", label: "Anchor or MC", helper: "Show flow and family announcements." },
              { id: "celebrity-act", label: "Celebrity or live act", helper: "Higher production and contract complexity." },
            ],
          },
          {
            id: "sound-concern",
            prompt: "What sound or AV concern matters most?",
            options: [
              { id: "curfew", label: "Curfew", helper: "Confirm shutdown times and permits." },
              { id: "quality", label: "Sound quality", helper: "Mics, monitors, console, and testing." },
              { id: "permissions", label: "Permissions", helper: "Venue, neighborhood, and route approvals." },
              { id: "backup", label: "Backup equipment", helper: "Avoid show-stopping failures." },
            ],
          },
          {
            id: "playlist-control",
            prompt: "How should music choices be controlled?",
            options: [
              { id: "vendor-led", label: "Vendor-led", helper: "Trust the DJ or band to read the room." },
              { id: "family-requests", label: "Family requests", helper: "Keep elders and relatives included." },
              { id: "couple-curated", label: "Couple-curated", helper: "Specific songs and do-not-play list." },
            ],
          },
        ],
      },
      {
        id: "choreography",
        title: "Choreography",
        shortSummary: "Plan who performs, how rehearsals work, and whether staging is needed.",
        icon: "💃",
        actionType: "vendor",
        vendorTypes: ["Choreographer"],
        outreachGoal: "Ask choreographers for routines, rehearsal mode, family handling, and stage blocking.",
        briefFields: ["sangeet-scale", "performers", "rehearsal-mode", "stage-blocking"],
        draftQuestions: [
          "Can you support our Sangeet scale and performer mix?",
          "How many rehearsals, edits, and video references are included?",
          "Do you handle stage blocking and the final run-through?",
        ],
        guidance: "Choreography quotes depend on performance count, family comfort, and rehearsal style. Capture that before asking for packages.",
        questions: [
          {
            id: "sangeet-scale",
            prompt: "How big is the Sangeet production?",
            options: [
              { id: "casual", label: "Casual family jam", helper: "Simple routines and fun energy." },
              { id: "polished", label: "Polished family show", helper: "Structured medleys and rehearsals." },
              { id: "award-show", label: "Award-show level", helper: "Heavy AV, transitions, and stage blocking." },
            ],
          },
          {
            id: "performers",
            prompt: "Who will perform?",
            options: [
              { id: "couple", label: "Couple", helper: "Focus on one polished moment." },
              { id: "siblings-friends", label: "Siblings and friends", helper: "Fun, high-energy routines." },
              { id: "parents-family", label: "Parents and family", helper: "Needs patience and simpler steps." },
              { id: "both-sides", label: "Both families", helper: "Needs scheduling and group owners." },
            ],
          },
          {
            id: "rehearsal-mode",
            prompt: "How should rehearsals work?",
            options: [
              { id: "in-person", label: "In-person", helper: "Best for polish and non-dancers." },
              { id: "hybrid-video", label: "Hybrid or video", helper: "Useful for guests in different cities." },
              { id: "family-captains", label: "Family captains", helper: "One owner per performance group." },
            ],
          },
          {
            id: "stage-blocking",
            prompt: "Do you need stage blocking and a final run-through?",
            options: [
              { id: "yes", label: "Yes", helper: "Important for polished shows and AV sync." },
              { id: "only-main-acts", label: "Only main acts", helper: "Prioritize couple and family highlights." },
              { id: "no", label: "No", helper: "Keep it casual and cost-controlled." },
            ],
          },
        ],
      },
      {
        id: "photobooth-extras",
        title: "Photobooth & Memory Extras",
        shortSummary: "Decide the booth type, event, guest memory goal, and space needs.",
        icon: "📷",
        actionType: "vendor",
        vendorTypes: ["Photobooth"],
        outreachGoal: "Ask photobooth vendors for the right format, print/digital output, props, backdrop, and footprint.",
        briefFields: ["booth-type", "booth-event", "memory-goal", "space-constraint"],
        draftQuestions: [
          "Which booth format fits our event and guest flow?",
          "What prints, digital sharing, props, and backdrop are included?",
          "How much space, power, setup time, and staffing do you need?",
        ],
        guidance: "A photobooth can be delightful or awkward depending on guest flow. This step makes the setup useful before you ask for a quote.",
        questions: [
          {
            id: "booth-type",
            prompt: "Which booth type fits?",
            options: [
              { id: "instant-print", label: "Instant print", helper: "Guests leave with a keepsake." },
              { id: "gif", label: "GIF booth", helper: "Fun digital sharing." },
              { id: "mirror", label: "Mirror booth", helper: "Interactive and premium-looking." },
              { id: "video-360", label: "360 video", helper: "High-energy social content." },
            ],
          },
          {
            id: "booth-event",
            prompt: "Which event should it appear at?",
            options: [
              { id: "mehndi", label: "Mehndi", helper: "Daytime, playful, colorful." },
              { id: "sangeet", label: "Sangeet", helper: "High-energy guest activity." },
              { id: "cocktail", label: "Cocktail", helper: "Great for late-evening fun." },
              { id: "reception", label: "Reception", helper: "Steady guest flow and family photos." },
            ],
          },
          {
            id: "memory-goal",
            prompt: "What memory goal matters most?",
            options: [
              { id: "prints", label: "Prints", helper: "Physical takeaway." },
              { id: "digital", label: "Digital sharing", helper: "Quick social posting." },
              { id: "guestbook", label: "Guestbook", helper: "Printed notes and keepsakes." },
              { id: "props", label: "Props and fun", helper: "Guest engagement over polish." },
            ],
          },
          {
            id: "space-constraint",
            prompt: "What space setup is realistic?",
            options: [
              { id: "compact", label: "Compact corner", helper: "Small footprint, easy setup." },
              { id: "backdrop", label: "Dedicated backdrop", helper: "Better photos and brandable setup." },
              { id: "roaming", label: "Roaming setup", helper: "Bring the experience to guests." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "guest-touchpoints",
    number: 6,
    title: "Guest Touchpoints",
    summary: "Prepare invitation and gifting briefs without adding heavy planning friction.",
    steps: [
      {
        id: "invitations",
        title: "Invitations",
        shortSummary: "Plan format, languages, inserts, and timeline before asking for samples.",
        icon: "💌",
        actionType: "vendor",
        vendorTypes: ["Wedding Invitations"],
        outreachGoal: "Ask invitation vendors for the right card suite, language support, inserts, and production timing.",
        briefFields: ["invite-type", "language-needs", "insert-needs", "invite-timeline"],
        draftQuestions: [
          "Can you support the invite type and language needs we have?",
          "What is included for design rounds, printing, inserts, envelopes, and digital files?",
          "What timeline should we plan for production and delivery?",
        ],
        guidance: "Invitation vendors need format, language, inserts, and timeline clarity. This keeps the first sample request efficient.",
        questions: [
          {
            id: "invite-type",
            prompt: "What invite type do you need?",
            options: [
              { id: "luxury-box", label: "Luxury box", helper: "Premium production and gifting feel." },
              { id: "traditional-cards", label: "Traditional cards", helper: "Printed suites for families." },
              { id: "digital", label: "Digital invites", helper: "Fast, shareable, and flexible." },
              { id: "mixed", label: "Mixed", helper: "Printed for elders, digital for wider guests." },
            ],
          },
          {
            id: "language-needs",
            prompt: "What language support is needed?",
            options: [
              { id: "english", label: "English", helper: "Simple and broadly readable." },
              { id: "hindi", label: "Hindi", helper: "Useful for family and traditional wording." },
              { id: "regional", label: "Regional language", helper: "Confirm font and proofing support." },
              { id: "bilingual", label: "Bilingual", helper: "Plan layout and copy carefully." },
            ],
          },
          {
            id: "insert-needs",
            prompt: "Which inserts do you need?",
            options: [
              { id: "event-cards", label: "Event cards", helper: "Separate function details." },
              { id: "rsvp", label: "RSVP", helper: "Make guest tracking easier." },
              { id: "accommodation", label: "Accommodation", helper: "Useful for out-of-town guests." },
              { id: "dress-code", label: "Dress code", helper: "Help guests prepare by event." },
            ],
          },
          {
            id: "invite-timeline",
            prompt: "What production timeline are you on?",
            options: [
              { id: "urgent", label: "Urgent", helper: "Ask for rush feasibility and fees." },
              { id: "standard", label: "Standard", helper: "Enough time for design and proofing." },
              { id: "premium", label: "Premium production", helper: "Allow longer for boxes, foiling, and finishes." },
            ],
          },
        ],
      },
      {
        id: "gifts-hampers",
        title: "Gifts & Hampers",
        shortSummary: "Plan gifting type, quantity confidence, personalization, and delivery.",
        icon: "🎁",
        actionType: "vendor",
        vendorTypes: ["Wedding Gifts"],
        outreachGoal: "Ask gifting vendors for quantity-based options, personalization, packaging, and delivery handling.",
        briefFields: ["gift-use", "quantity-confidence", "personalization-level", "delivery-model"],
        draftQuestions: [
          "What hamper or gift options fit our use case and quantity range?",
          "What personalization, tags, packaging, and delivery are included?",
          "How late can quantities change before production?",
        ],
        guidance: "Gifting vendors quote better when they know use case, quantity confidence, personalization, and delivery plan.",
        questions: [
          {
            id: "gift-use",
            prompt: "What is the gift or hamper use?",
            options: [
              { id: "welcome-hampers", label: "Welcome hampers", helper: "Best for hotels and destination weddings." },
              { id: "shagun-trays", label: "Shagun trays", helper: "Traditional presentation and family gifting." },
              { id: "bridesmaid-gifts", label: "Bridesmaid gifts", helper: "Personal and smaller quantity." },
              { id: "corporate-style", label: "Large guest gifting", helper: "Bulk packaging and logistics matter." },
            ],
          },
          {
            id: "quantity-confidence",
            prompt: "How confident is the quantity?",
            options: [
              { id: "exact", label: "Exact", helper: "You can ask for a firm quote." },
              { id: "rough-range", label: "Rough range", helper: "Ask for slab pricing." },
              { id: "estimating", label: "Still estimating", helper: "Keep production flexible." },
            ],
          },
          {
            id: "personalization-level",
            prompt: "How personalized should gifting be?",
            options: [
              { id: "tags-only", label: "Tags only", helper: "Simple and efficient." },
              { id: "custom-packaging", label: "Custom packaging", helper: "More premium and production-heavy." },
              { id: "family-names", label: "Family names", helper: "Needs careful proofing." },
              { id: "event-theme", label: "Event theme", helper: "Coordinate with invites and decor." },
            ],
          },
          {
            id: "delivery-model",
            prompt: "How should gifts be delivered?",
            options: [
              { id: "venue-drop", label: "One venue drop", helper: "Simplest logistics." },
              { id: "room-placement", label: "Room placement", helper: "Needs hotel coordination." },
              { id: "home-delivery", label: "Home delivery", helper: "Needs addresses and tracking." },
            ],
          },
        ],
      },
    ],
  },
];

const LEGACY_STEP_ID_ALIASES = {
  budget: "budget-distribution",
  "guest-matrix": "guest-event-matrix",
  "attire-jewelry": "bridal-groom-styling",
  "entertainment-choreography": "music-dj-entertainment",
};

const VALID_STEP_IDS = new Set(PLANNER_FRAMEWORK_PHASES.flatMap((phase) => (
  phase.steps.map((step) => step.id)
)));

const VALID_ANSWER_OPTIONS = new Map(PLANNER_FRAMEWORK_PHASES.flatMap((phase) => (
  phase.steps.map((step) => [
    step.id,
    new Map((step.questions || []).map((question) => [
      question.id,
      new Set((question.options || []).map((option) => option.id)),
    ])),
  ])
)));
const GENTLE_CHOICE_IDS = new Set(["unknown", "unsure", "not-yet", "none", "open", "maybe"]);
const QUESTION_DURATION_SECONDS = {
  mcq: 40,
  dropdown: 60,
  openEnded: 120,
  "open-ended": 120,
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function hasValue(value) {
  return normalizeText(value).length > 0;
}

function hasVendorType(vendors, expectedTypes) {
  const expected = new Set(expectedTypes.map(normalizeText));
  return (Array.isArray(vendors) ? vendors : []).some((vendor) => (
    vendor &&
    normalizeText(vendor.status) !== "cancelled" &&
    expected.has(normalizeText(vendor.type))
  ));
}

function hasAnyVendorType(vendors, expectedTypes) {
  return hasVendorType(vendors, expectedTypes);
}

function hasExpenseCategory(expenses, expectedCategories) {
  const expected = new Set(expectedCategories.map(normalizeText));
  return (Array.isArray(expenses) ? expenses : []).some((expense) => (
    expense &&
    Number(expense.amount || 0) > 0 &&
    expected.has(normalizeText(expense.category))
  ));
}

function normalizeStepId(stepId) {
  const normalizedStepId = String(stepId || "").trim();
  return LEGACY_STEP_ID_ALIASES[normalizedStepId] || normalizedStepId;
}

function findFrameworkStep(stepId) {
  const normalizedStepId = normalizeStepId(stepId);
  return PLANNER_FRAMEWORK_PHASES
    .flatMap((phase) => phase.steps.map((step) => ({ ...step, phase })))
    .find(({ id }) => id === normalizedStepId) || null;
}

function findQuestion(step, questionId) {
  return (step?.questions || []).find((question) => question.id === questionId) || null;
}

function findOption(question, optionId) {
  return (question?.options || []).find((option) => option.id === optionId) || null;
}

function getAnswerLabel(step, questionId, optionId) {
  const question = findQuestion(step, questionId);
  const option = findOption(question, optionId);
  return option?.label || "";
}

function compactList(items) {
  return items.map((item) => String(item || "").trim()).filter(Boolean);
}

export function normalizePlannerFrameworkProgress(progress) {
  const completedStepIds = Array.isArray(progress?.completedStepIds)
    ? progress.completedStepIds
    : [];
  const rawAnswers = progress?.answers && typeof progress.answers === "object" && !Array.isArray(progress.answers)
    ? progress.answers
    : {};
  const rawEncouragements = progress?.encouragements && typeof progress.encouragements === "object" && !Array.isArray(progress.encouragements)
    ? progress.encouragements
    : {};
  const answers = {};
  const encouragements = {};

  Object.entries(rawAnswers).forEach(([stepId, stepAnswers]) => {
    const normalizedStepId = normalizeStepId(stepId);
    const validQuestions = VALID_ANSWER_OPTIONS.get(normalizedStepId);

    if (!validQuestions || !stepAnswers || typeof stepAnswers !== "object" || Array.isArray(stepAnswers)) {
      return;
    }

    const normalizedStepAnswers = {};
    Object.entries(stepAnswers).forEach(([questionId, optionId]) => {
      const normalizedQuestionId = String(questionId || "").trim();
      const normalizedOptionId = String(optionId || "").trim();
      const validOptions = validQuestions.get(normalizedQuestionId);

      if (validOptions?.has(normalizedOptionId)) {
        normalizedStepAnswers[normalizedQuestionId] = normalizedOptionId;
      }
    });

    if (Object.keys(normalizedStepAnswers).length) {
      answers[normalizedStepId] = normalizedStepAnswers;
    }
  });

  Object.entries(rawEncouragements).forEach(([stepId, stepEncouragements]) => {
    const normalizedStepId = normalizeStepId(stepId);
    const validQuestions = VALID_ANSWER_OPTIONS.get(normalizedStepId);

    if (!validQuestions || !stepEncouragements || typeof stepEncouragements !== "object" || Array.isArray(stepEncouragements)) {
      return;
    }

    const normalizedStepEncouragements = {};
    Object.entries(stepEncouragements).forEach(([questionId, encouragement]) => {
      const normalizedQuestionId = String(questionId || "").trim();
      const normalizedEncouragement = String(encouragement || "").trim().slice(0, 120);

      if (answers[normalizedStepId]?.[normalizedQuestionId] && normalizedEncouragement) {
        normalizedStepEncouragements[normalizedQuestionId] = normalizedEncouragement;
      }
    });

    if (Object.keys(normalizedStepEncouragements).length) {
      encouragements[normalizedStepId] = normalizedStepEncouragements;
    }
  });

  return {
    completedStepIds: [...new Set(
      completedStepIds
        .map((stepId) => normalizeStepId(stepId))
        .filter((stepId) => VALID_STEP_IDS.has(stepId))
    )],
    answers,
    encouragements,
  };
}

export function addPlannerFrameworkCompletedStep(progress, stepId) {
  const normalizedStepId = normalizeStepId(stepId);
  const normalizedProgress = normalizePlannerFrameworkProgress(progress);

  if (!VALID_STEP_IDS.has(normalizedStepId)) {
    return normalizedProgress;
  }

  return normalizePlannerFrameworkProgress({
    completedStepIds: [...normalizedProgress.completedStepIds, normalizedStepId],
    answers: normalizedProgress.answers,
    encouragements: normalizedProgress.encouragements,
  });
}

export function getPlannerFrameworkEncouragement(stepId, questionId, optionId) {
  const normalizedStepId = String(stepId || "").trim();
  const normalizedQuestionId = String(questionId || "").trim();
  const normalizedOptionId = String(optionId || "").trim();

  if (!VALID_ANSWER_OPTIONS.get(normalizedStepId)?.get(normalizedQuestionId)?.has(normalizedOptionId)) {
    return "Nice! Keep it up!";
  }

  if (normalizedOptionId === "none" && normalizedStepId === "planner") {
    return "Clear choice. Intentional counts.";
  }

  if (GENTLE_CHOICE_IDS.has(normalizedOptionId)) {
    return "Good honesty. That's useful planning.";
  }

  return "Nice! Keep it up!";
}

export function getPlannerFrameworkStepSeconds(step = {}) {
  return (Array.isArray(step.questions) ? step.questions : []).reduce((total, question) => {
    const questionType = String(question?.type || "mcq").trim();
    return total + (QUESTION_DURATION_SECONDS[questionType] || QUESTION_DURATION_SECONDS.mcq);
  }, 0);
}

export function getPlannerFrameworkStepMinutes(step = {}) {
  return Math.max(1, Math.ceil(getPlannerFrameworkStepSeconds(step) / 60));
}

export function setPlannerFrameworkAnswer(progress, stepId, questionId, optionId, encouragement) {
  const normalizedProgress = normalizePlannerFrameworkProgress(progress);
  const normalizedStepId = String(stepId || "").trim();
  const normalizedQuestionId = String(questionId || "").trim();
  const normalizedOptionId = String(optionId || "").trim();

  if (!VALID_ANSWER_OPTIONS.get(normalizedStepId)?.get(normalizedQuestionId)?.has(normalizedOptionId)) {
    return normalizedProgress;
  }

  const normalizedEncouragement = String(
    encouragement || getPlannerFrameworkEncouragement(normalizedStepId, normalizedQuestionId, normalizedOptionId)
  ).trim().slice(0, 120);

  return normalizePlannerFrameworkProgress({
    completedStepIds: normalizedProgress.completedStepIds,
    answers: {
      ...normalizedProgress.answers,
      [normalizedStepId]: {
        ...(normalizedProgress.answers[normalizedStepId] || {}),
        [normalizedQuestionId]: normalizedOptionId,
      },
    },
    encouragements: {
      ...normalizedProgress.encouragements,
      [normalizedStepId]: {
        ...(normalizedProgress.encouragements[normalizedStepId] || {}),
        [normalizedQuestionId]: normalizedEncouragement,
      },
    },
  });
}

export function getPlannerFrameworkCompletionMap({
  wedding = {},
  vendors = [],
  expenses = [],
  guests = [],
  frameworkProgress = DEFAULT_FRAMEWORK_PROGRESS,
} = {}) {
  const manualCompleted = new Set(normalizePlannerFrameworkProgress(frameworkProgress).completedStepIds);
  const guestCountKnown = hasValue(wedding.guests) || (Array.isArray(guests) && guests.length > 0);

  const derivedCompleted = {
    "auspicious-timing": hasValue(wedding.date),
    "budget-distribution": hasValue(wedding.budget),
    "venue-stay": hasValue(wedding.venue),
    "guest-event-matrix": guestCountKnown,
    "planner-coordination": hasAnyVendorType(vendors, ["Wedding Planners"]),
    "transport-hospitality": hasAnyVendorType(vendors, ["Wedding Transportation"]),
    "ritual-guidance": hasAnyVendorType(vendors, ["Pandit", "Astrologers"]),
    "makeup-hair": hasAnyVendorType(vendors, ["Bridal & Pre-Bridal"]),
    "bridal-groom-styling": hasAnyVendorType(vendors, ["Bridal & Pre-Bridal", "Groom Services"]) || hasExpenseCategory(expenses, ["attire", "jewelry"]),
    "catering-bar": hasAnyVendorType(vendors, ["Catering"]) || hasExpenseCategory(expenses, ["catering"]),
    "decor-florals-tent": hasAnyVendorType(vendors, ["Wedding Decorators", "Florists", "Tent House"]) || hasExpenseCategory(expenses, ["decor", "flowers", "tent"]),
    "cake-dessert": hasAnyVendorType(vendors, ["Wedding Cakes"]) || hasExpenseCategory(expenses, ["cake", "dessert"]),
    "photo-video": hasAnyVendorType(vendors, ["Photography", "Wedding Videography"]) || hasExpenseCategory(expenses, ["photography"]),
    "music-dj-entertainment": hasAnyVendorType(vendors, ["Music", "Wedding DJ", "Wedding Entertainment"]) || hasExpenseCategory(expenses, ["music", "entertainment"]),
    choreography: hasAnyVendorType(vendors, ["Choreographer"]) || hasExpenseCategory(expenses, ["choreography"]),
    "photobooth-extras": hasAnyVendorType(vendors, ["Photobooth"]),
    invitations: hasAnyVendorType(vendors, ["Wedding Invitations"]) || hasExpenseCategory(expenses, ["invitations"]),
    "gifts-hampers": hasAnyVendorType(vendors, ["Wedding Gifts"]) || hasExpenseCategory(expenses, ["gifts"]),
  };

  return Object.fromEntries([...VALID_STEP_IDS].map((stepId) => {
    const source = derivedCompleted[stepId] ? "derived" : manualCompleted.has(stepId) ? "manual" : null;
    return [stepId, {
      isComplete: Boolean(source),
      source,
    }];
  }));
}

export function buildPlannerFramework({
  wedding = {},
  vendors = [],
  expenses = [],
  guests = [],
  frameworkProgress = DEFAULT_FRAMEWORK_PROGRESS,
} = {}) {
  const completionMap = getPlannerFrameworkCompletionMap({ wedding, vendors, expenses, guests, frameworkProgress });
  const normalizedProgress = normalizePlannerFrameworkProgress(frameworkProgress);
  let firstIncompleteId = "";

  const phases = PLANNER_FRAMEWORK_PHASES.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      const completion = completionMap[step.id] || { isComplete: false, source: null };
      if (!completion.isComplete && !firstIncompleteId) {
        firstIncompleteId = step.id;
      }

      return {
        ...step,
        minutes: getPlannerFrameworkStepMinutes(step),
        isComplete: completion.isComplete,
        completionSource: completion.source,
        answers: normalizedProgress.answers[step.id] || {},
        encouragements: normalizedProgress.encouragements[step.id] || {},
        answeredCount: (step.questions || []).filter((question) => normalizedProgress.answers[step.id]?.[question.id]).length,
        questionCount: (step.questions || []).length,
        answerProgress: (step.questions || []).length
          ? (step.questions || []).filter((question) => normalizedProgress.answers[step.id]?.[question.id]).length / (step.questions || []).length
          : 0,
      };
    }),
  }));

  const allSteps = phases.flatMap((phase) => phase.steps.map((step) => ({
    ...step,
    phaseId: phase.id,
    phaseNumber: phase.number,
    phaseTitle: phase.title,
  })));
  const completedCount = allSteps.filter((step) => step.isComplete).length;

  return {
    phases,
    allSteps,
    completedCount,
    totalCount: allSteps.length,
    firstIncompleteId,
  };
}

export function buildPlannerFrameworkVendorBrief({
  vendorType = "",
  vendorName = "",
  wedding = {},
  frameworkProgress = DEFAULT_FRAMEWORK_PROGRESS,
  includeBudgetAmount = false,
} = {}) {
  const normalizedVendorType = String(vendorType || "").trim();
  const normalizedVendorName = String(vendorName || "").trim();
  const normalizedProgress = normalizePlannerFrameworkProgress(frameworkProgress);
  const allSteps = PLANNER_FRAMEWORK_PHASES.flatMap((phase) => phase.steps.map((step) => ({
    ...step,
    phaseId: phase.id,
    phaseTitle: phase.title,
  })));
  const universalSteps = allSteps.filter((step) => (
    step.appliesToAllVendors || !Array.isArray(step.vendorTypes) || step.vendorTypes.length === 0
  ));
  const vendorSteps = allSteps.filter((step) => (
    Array.isArray(step.vendorTypes) && step.vendorTypes.includes(normalizedVendorType)
  ));
  const selectedSteps = [...new Map([...vendorSteps, ...universalSteps].map((step) => [step.id, step])).values()];
  const preferences = [];
  const practicalQuestions = [];

  selectedSteps.forEach((step) => {
    const stepAnswers = normalizedProgress.answers[step.id] || {};
    (step.briefFields || []).forEach((questionId) => {
      const answerLabel = getAnswerLabel(step, questionId, stepAnswers[questionId]);
      if (answerLabel) {
        const question = findQuestion(step, questionId);
        preferences.push(`${question?.prompt || questionId}: ${answerLabel}`);
      }
    });
    practicalQuestions.push(...(step.draftQuestions || []));
  });

  const contextParts = compactList([
    hasValue(wedding.date) ? `around ${wedding.date}` : "around our wedding date/window",
    hasValue(wedding.venue) ? `in/around ${wedding.venue}` : "",
    hasValue(wedding.guests) ? `for roughly ${wedding.guests} guests` : "",
  ]);
  const budgetLine = includeBudgetAmount && hasValue(wedding.budget)
    ? ` We have a working budget of ${wedding.budget}.`
    : " We are shortlisting within a clear budget range.";
  const uniqueQuestions = [...new Set(practicalQuestions)].slice(0, 5);
  const preferenceLine = preferences.length
    ? ` Our current brief: ${preferences.slice(0, 6).join("; ")}.`
    : "";
  const questionLine = uniqueQuestions.length
    ? ` Could you share availability, package options, what is included, and help with: ${uniqueQuestions.join(" ")}`
    : " Could you share availability, package options, what is included, setup/team requirements, and any constraints we should know before shortlisting?";
  const vendorIntro = normalizedVendorName
    ? `I found ${normalizedVendorName} on VivahGo and we are looking for ${normalizedVendorType || "vendor"} support.`
    : `We are looking for ${normalizedVendorType || "vendor"} support.`;
  const message = `Hi, we are planning a wedding ${contextParts.join(" ")}. ${vendorIntro}${budgetLine}${preferenceLine}${questionLine}`;

  return {
    vendorType: normalizedVendorType,
    vendorName: normalizedVendorName,
    context: contextParts,
    preferences,
    questions: uniqueQuestions,
    message,
  };
}
