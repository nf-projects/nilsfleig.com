// Mock dataset for the OrgSpace prospecting demo.
//
// The seller is Vizcom (real company, https://vizcom.com — sketch-to-render AI
// for industrial design teams). Everything else on this page is invented:
// companies, people, posts, emails, connections. No real person is depicted.
//
// The data is shaped so all three trigger tiers have something to find, and so
// a meaningful minority of prospects have NO findable hook — a demo where every
// row works teaches the wrong lesson.

export const seller = {
  name: "Dana Whitfield",
  title: "Account Executive",
  company: "Vizcom",
  email: "dana@vizcom.com",
  headline: "AE at Vizcom · sketch to render in seconds for design teams",
  location: "San Francisco, CA",
  hometown: "Ann Arbor, MI",
  school: "Art Center College of Design",
  pastCompanies: ["Formlabs", "Shapeways"],
  interests: ["trail running", "ceramics", "vintage Hondas"],
};

export type Company = {
  id: string;
  name: string;
  domain: string;
  hq: string;
  employees: number;
  industry: string;
  segment: string;
  designTeam: string;
  signals: string[];
  lastFunding?: string;
};

export const companies: Company[] = [
  {
    id: "northbeam",
    name: "Northbeam Footwear",
    domain: "northbeamfootwear.com",
    hq: "Portland, OR",
    employees: 420,
    industry: "Footwear",
    segment: "Performance running",
    designTeam: "In-house, ~18 designers",
    signals: [
      "Six open industrial design roles posted in the last month",
      "Announced a 2027 trail line at their spring press day",
    ],
    lastFunding: "Series C · $60M · Mar 2026",
  },
  {
    id: "kestrel",
    name: "Kestrel Mobility",
    domain: "kestrelmobility.com",
    hq: "Detroit, MI",
    employees: 1200,
    industry: "Automotive",
    segment: "Electric commercial vehicles",
    designTeam: "In-house studio, ~40 designers",
    signals: [
      "New VP of Design hired in July 2026",
      "Public complaint from their design lead about render turnaround",
    ],
  },
  {
    id: "halcyon",
    name: "Halcyon Audio",
    domain: "halcyonaudio.com",
    hq: "Brooklyn, NY",
    employees: 140,
    industry: "Consumer electronics",
    segment: "Home audio",
    designTeam: "In-house, 6 designers",
    signals: ["Launched a second speaker line in June 2026"],
    lastFunding: "Series B · $28M · Nov 2025",
  },
  {
    id: "pinegrove",
    name: "Pinegrove Outdoor",
    domain: "pinegroveoutdoor.com",
    hq: "Boulder, CO",
    employees: 310,
    industry: "Outdoor gear",
    segment: "Packs and shelters",
    designTeam: "In-house, ~12 designers",
    signals: ["Hiring a Senior Industrial Designer, posted 9 days ago"],
  },
  {
    id: "motiva",
    name: "Motiva Health",
    domain: "motivahealth.com",
    hq: "Minneapolis, MN",
    employees: 800,
    industry: "Medical devices",
    segment: "Home diagnostics",
    designTeam: "In-house, ~20 designers",
    signals: ["FDA clearance for their at-home analyzer, July 2026"],
    lastFunding: "Series D · $110M · Jan 2026",
  },
  {
    id: "tandem",
    name: "Tandem Toys",
    domain: "tandemtoys.com",
    hq: "Cincinnati, OH",
    employees: 950,
    industry: "Toys",
    segment: "Preschool and play",
    designTeam: "In-house, ~30 designers",
    signals: ["Opened a second design studio in Barcelona"],
  },
  {
    id: "orbit",
    name: "Orbit Kitchen",
    domain: "orbitkitchen.com",
    hq: "Chicago, IL",
    employees: 260,
    industry: "Appliances",
    segment: "Small kitchen appliances",
    designTeam: "In-house, 8 designers",
    signals: ["Three ID roles open", "Rebrand shipped in May 2026"],
  },
  {
    id: "wilder",
    name: "Wilder Bikes",
    domain: "wilderbikes.com",
    hq: "Bentonville, AR",
    employees: 180,
    industry: "Sporting goods",
    segment: "Gravel and trail bicycles",
    designTeam: "In-house, 5 designers",
    signals: ["Frame platform refresh announced for 2027"],
  },
  {
    id: "lumen",
    name: "Lumen Instruments",
    domain: "lumeninstruments.com",
    hq: "Cambridge, MA",
    employees: 540,
    industry: "Lab equipment",
    segment: "Benchtop instruments",
    designTeam: "In-house, ~10 designers",
    signals: [],
  },
  {
    id: "caldera",
    name: "Caldera Cookware",
    domain: "calderacookware.com",
    hq: "Providence, RI",
    employees: 90,
    industry: "Housewares",
    segment: "Cast iron and enamel",
    designTeam: "Two designers plus agencies",
    signals: [],
  },
  {
    id: "arcus",
    name: "Arcus Robotics",
    domain: "arcusrobotics.com",
    hq: "Pittsburgh, PA",
    employees: 220,
    industry: "Robotics",
    segment: "Warehouse automation",
    designTeam: "In-house, 4 designers",
    signals: ["Series B raise, Aug 2026"],
    lastFunding: "Series B · $45M · Aug 2026",
  },
  {
    id: "solstice",
    name: "Solstice Eyewear",
    domain: "solsticeeyewear.com",
    hq: "Los Angeles, CA",
    employees: 130,
    industry: "Apparel and accessories",
    segment: "Eyewear",
    designTeam: "In-house, 5 designers",
    signals: ["Collab collection with a footwear brand announced"],
  },
  {
    id: "foundry",
    name: "Foundry Furniture",
    domain: "foundryfurniture.com",
    hq: "Grand Rapids, MI",
    employees: 700,
    industry: "Furniture",
    segment: "Contract office furniture",
    designTeam: "In-house, ~15 designers",
    signals: ["Hiring a Design Operations Manager"],
  },
  {
    id: "atlas",
    name: "Atlas Luggage",
    domain: "atlasluggage.com",
    hq: "Austin, TX",
    employees: 110,
    industry: "Travel goods",
    segment: "Hard-shell luggage",
    designTeam: "Two designers",
    signals: [],
  },
  {
    id: "meridian",
    name: "Meridian Watch",
    domain: "meridianwatch.com",
    hq: "Seattle, WA",
    employees: 75,
    industry: "Accessories",
    segment: "Mechanical watches",
    designTeam: "One designer plus freelancers",
    signals: [],
  },
  {
    id: "birch",
    name: "Birch Baby",
    domain: "birchbaby.com",
    hq: "Nashville, TN",
    employees: 160,
    industry: "Juvenile products",
    segment: "Strollers and car seats",
    designTeam: "In-house, 7 designers",
    signals: ["Recall on a 2024 stroller model, resolved June 2026"],
  },
  {
    id: "quarry",
    name: "Quarry Tools",
    domain: "quarrytools.com",
    hq: "Milwaukee, WI",
    employees: 1400,
    industry: "Power tools",
    segment: "Professional cordless",
    designTeam: "In-house, ~25 designers",
    signals: ["Two Senior ID roles open in Milwaukee"],
  },
  {
    id: "vessel",
    name: "Vessel Drinkware",
    domain: "vesseldrinkware.com",
    hq: "Denver, CO",
    employees: 95,
    industry: "Housewares",
    segment: "Insulated drinkware",
    designTeam: "Three designers",
    signals: [],
  },
  {
    id: "cadence",
    name: "Cadence Fitness",
    domain: "cadencefitness.com",
    hq: "San Diego, CA",
    employees: 380,
    industry: "Fitness equipment",
    segment: "Connected strength",
    designTeam: "In-house, ~11 designers",
    signals: ["Hiring surge: 4 ID and 2 CMF roles"],
    lastFunding: "Series C · $75M · Feb 2026",
  },
  {
    id: "thistle",
    name: "Thistle Home",
    domain: "thistlehome.com",
    hq: "Raleigh, NC",
    employees: 240,
    industry: "Home goods",
    segment: "Lighting",
    designTeam: "In-house, 6 designers",
    signals: [],
  },
];

export type Post = {
  date: string;
  text: string;
  likes: number;
  comments: number;
};

export type Person = {
  slug: string;
  name: string;
  title: string;
  companyId: string;
  location: string;
  about: string;
  school?: string;
  pastCompanies: string[];
  mutuals: string[];
  degree: "1st" | "2nd" | "3rd";
  posts: Post[];
};

export const people: Person[] = [
  {
    slug: "marisol-ferreira",
    name: "Marisol Ferreira",
    title: "VP of Design",
    companyId: "northbeam",
    location: "Portland, OR",
    about:
      "Twenty years drawing shoes. Building the team that takes Northbeam from six drops a year to twelve without burning anyone out.",
    school: "Art Center College of Design",
    pastCompanies: ["Brooks", "Keen"],
    mutuals: ["Priya Raghavan", "Tom Okafor"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-11",
        text: "Six ID reqs open on my team. If you can draw a midsole and take feedback without flinching, my inbox is open. The trail line ships in 2027 and I would like it to ship on time.",
        likes: 312,
        comments: 41,
      },
      {
        date: "2026-07-28",
        text: "Concept review this morning: 40 sketches, 3 rendered. That ratio is the whole problem. The ideas that never get rendered never get chosen, and we are choosing from a fraction of what the team actually drew.",
        likes: 587,
        comments: 96,
      },
    ],
  },
  {
    slug: "tom-okafor",
    name: "Tom Okafor",
    title: "Director of Industrial Design",
    companyId: "kestrel",
    location: "Detroit, MI",
    about:
      "Cars, vans, and the boring boxes that move things. Previously ten years in consumer.",
    school: "College for Creative Studies",
    pastCompanies: ["Formlabs", "Ford"],
    mutuals: ["Marisol Ferreira"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-14",
        text: "Waited nine days for a set of exterior renders last month. Nine. The decision they supported had already been made by day four, so we made it on a marker sketch and a prayer. Somebody please fix visualization.",
        likes: 1204,
        comments: 187,
      },
      {
        date: "2026-08-02",
        text: "New VP starts Monday. Excited and mildly terrified, which is the correct amount of both.",
        likes: 233,
        comments: 28,
      },
    ],
  },
  {
    slug: "priya-raghavan",
    name: "Priya Raghavan",
    title: "Head of Product Design",
    companyId: "halcyon",
    location: "Brooklyn, NY",
    about:
      "Speakers that look like furniture. Ex-Formlabs, ex-Sonos contractor.",
    school: "Rhode Island School of Design",
    pastCompanies: ["Formlabs"],
    mutuals: ["Marisol Ferreira", "Dana Whitfield"],
    degree: "1st",
    posts: [
      {
        date: "2026-08-09",
        text: "Second line shipped in June and the CMF exploration for it took longer than the tooling. Four weeks of color studies to pick three finishes. There has to be a faster way to look at fifty options.",
        likes: 421,
        comments: 63,
      },
    ],
  },
  {
    slug: "evan-brandt",
    name: "Evan Brandt",
    title: "Senior Industrial Designer",
    companyId: "pinegrove",
    location: "Boulder, CO",
    about:
      "Packs, tents, and the occasional trekking pole. Runs long, sleeps outside.",
    school: "Art Center College of Design",
    pastCompanies: ["Osprey"],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-08-06",
        text: "We are hiring a senior ID here in Boulder. Small team, big surface area, you will touch everything from softgoods to hardware.",
        likes: 88,
        comments: 9,
      },
      {
        date: "2026-07-19",
        text: "Ran the Boulder 100 on Saturday. Nineteen hours, two blisters, one existential crisis around mile 70. Would recommend.",
        likes: 194,
        comments: 37,
      },
    ],
  },
  {
    slug: "nadia-hartmann",
    name: "Nadia Hartmann",
    title: "Director of Design",
    companyId: "motiva",
    location: "Minneapolis, MN",
    about:
      "Medical devices people actually want in their kitchen. Regulatory is a design constraint, not an enemy.",
    school: "University of Cincinnati DAAP",
    pastCompanies: ["Medtronic"],
    mutuals: ["Tom Okafor"],
    degree: "2nd",
    posts: [
      {
        date: "2026-07-22",
        text: "Clearance came through on the home analyzer. Four years. The industrial design brief for it is dated 2022 and I still have the first sketch on my wall.",
        likes: 902,
        comments: 141,
      },
    ],
  },
  {
    slug: "gil-mendoza",
    name: "Gil Mendoza",
    title: "VP Design",
    companyId: "tandem",
    location: "Cincinnati, OH",
    about: "Toys. Thirty people, two studios, one very loud test lab.",
    school: "University of Cincinnati DAAP",
    pastCompanies: ["Hasbro"],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-08-04",
        text: "Barcelona studio is open. Nine designers, mostly hired locally, and the time zone gap means concepts now get reviewed twice a day instead of once.",
        likes: 356,
        comments: 44,
      },
    ],
  },
  {
    slug: "rae-kimball",
    name: "Rae Kimball",
    title: "Head of Industrial Design",
    companyId: "orbit",
    location: "Chicago, IL",
    about: "Kettles, toasters, and the war against the beige plastic box.",
    school: "Art Center College of Design",
    pastCompanies: ["Whirlpool"],
    mutuals: ["Priya Raghavan"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-12",
        text: "Three open ID roles. Also: the rebrand shipped in May and I have opinions about how many rounds of visual exploration it took to get there. Ask me at IDSA.",
        likes: 267,
        comments: 52,
      },
    ],
  },
  {
    slug: "colin-vance",
    name: "Colin Vance",
    title: "Design Lead",
    companyId: "wilder",
    location: "Bentonville, AR",
    about:
      "Bikes. Frames mostly. Moved here for the trails and stayed for the trails.",
    pastCompanies: ["Specialized"],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-08-08",
        text: "Platform refresh for 2027 is locked. Two years of geometry arguments compressed into one very quiet meeting.",
        likes: 145,
        comments: 18,
      },
    ],
  },
  {
    slug: "hannah-liu",
    name: "Hannah Liu",
    title: "Design Manager",
    companyId: "lumen",
    location: "Cambridge, MA",
    about: "Benchtop instruments. Ten designers, a lot of sheet metal.",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [],
  },
  {
    slug: "peter-adeyemi",
    name: "Peter Adeyemi",
    title: "Creative Director",
    companyId: "caldera",
    location: "Providence, RI",
    about: "Cast iron. Enamel. Objects that outlive their owners.",
    school: "Rhode Island School of Design",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-06-30",
        text: "Kiln day at the studio. Nothing about this is efficient and that is rather the point.",
        likes: 76,
        comments: 6,
      },
    ],
  },
  {
    slug: "sasha-petrov",
    name: "Sasha Petrov",
    title: "Head of Hardware Design",
    companyId: "arcus",
    location: "Pittsburgh, PA",
    about:
      "Robots that move boxes. Four designers, forty engineers, constant negotiation.",
    pastCompanies: ["Bosch"],
    mutuals: ["Tom Okafor"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-15",
        text: "Series B closed. We are going to double the hardware team and I have exactly one design req approved, so if you know an ID who likes robots, tell them to be patient with me.",
        likes: 518,
        comments: 71,
      },
    ],
  },
  {
    slug: "imani-clarke",
    name: "Imani Clarke",
    title: "Design Director",
    companyId: "solstice",
    location: "Los Angeles, CA",
    about: "Eyewear. Frames are the hardest small object there is.",
    school: "Art Center College of Design",
    pastCompanies: ["Oakley"],
    mutuals: ["Marisol Ferreira"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-05",
        text: 'The collab is announced. Two brands, one frame, eleven months of color arguments. I have learned that "warm grey" means something different in footwear.',
        likes: 388,
        comments: 59,
      },
    ],
  },
  {
    slug: "derek-nowak",
    name: "Derek Nowak",
    title: "Director of Design",
    companyId: "foundry",
    location: "Grand Rapids, MI",
    about:
      "Contract furniture. Chairs are a twenty-year argument with gravity.",
    pastCompanies: ["Steelcase"],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-07-31",
        text: "Looking for a Design Operations Manager. If you have ever tried to run fifteen designers on a shared file server, you know why this role exists.",
        likes: 122,
        comments: 14,
      },
    ],
  },
  {
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    title: "Lead Industrial Designer",
    companyId: "atlas",
    location: "Austin, TX",
    about: "Luggage. Two of us. We do everything.",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [],
  },
  {
    slug: "oliver-shaw",
    name: "Oliver Shaw",
    title: "Founder and Designer",
    companyId: "meridian",
    location: "Seattle, WA",
    about: "Mechanical watches, made in small batches.",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-08-13",
        text: "Moved house this weekend. Twins start kindergarten Tuesday. The workshop is in boxes and I am fine, everything is fine.",
        likes: 63,
        comments: 11,
      },
    ],
  },
  {
    slug: "grace-obrien",
    name: "Grace O'Brien",
    title: "Head of Design",
    companyId: "birch",
    location: "Nashville, TN",
    about: "Strollers and car seats. Safety first, then everything else.",
    pastCompanies: ["Graco"],
    mutuals: [],
    degree: "3rd",
    posts: [
      {
        date: "2026-06-24",
        text: "The recall is closed out. Ten months. I will write about what we changed in our review process once I have slept.",
        likes: 431,
        comments: 88,
      },
    ],
  },
  {
    slug: "martin-reyes",
    name: "Martin Reyes",
    title: "Senior Design Manager",
    companyId: "quarry",
    location: "Milwaukee, WI",
    about:
      "Cordless tools. Twenty-five designers. Drop tests are my love language.",
    pastCompanies: ["Snap-on"],
    mutuals: ["Sasha Petrov"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-10",
        text: "Two senior ID roles open in Milwaukee. Yes you have to come to the office. Yes there is a machine shop.",
        likes: 209,
        comments: 31,
      },
    ],
  },
  {
    slug: "lena-fischer",
    name: "Lena Fischer",
    title: "Design Lead",
    companyId: "vessel",
    location: "Denver, CO",
    about: "Drinkware. Three designers, a lot of tumblers.",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [],
  },
  {
    slug: "andre-baptiste",
    name: "Andre Baptiste",
    title: "VP of Product Design",
    companyId: "cadence",
    location: "San Diego, CA",
    about:
      "Connected strength equipment. Hardware, software, and the seam between them.",
    school: "Art Center College of Design",
    pastCompanies: ["Formlabs", "Peloton"],
    mutuals: ["Priya Raghavan", "Marisol Ferreira"],
    degree: "2nd",
    posts: [
      {
        date: "2026-08-07",
        text: "Four ID and two CMF roles open. We raised in February and the whole point of the raise was to stop shipping one product a year.",
        likes: 674,
        comments: 103,
      },
      {
        date: "2026-07-15",
        text: "Ann Arbor for the weekend. Every time I go back I end up at the same diner ordering the same thing.",
        likes: 156,
        comments: 22,
      },
    ],
  },
  {
    slug: "sofia-almeida",
    name: "Sofia Almeida",
    title: "Design Manager",
    companyId: "thistle",
    location: "Raleigh, NC",
    about: "Lighting. Six designers. Lumens are a design material.",
    pastCompanies: [],
    mutuals: [],
    degree: "3rd",
    posts: [],
  },
];

export function companyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function personBySlug(slug: string): Person | undefined {
  return people.find((p) => p.slug === slug);
}

export function peopleByCompany(companyId: string): Person[] {
  return people.filter((p) => p.companyId === companyId);
}

// Dana's own connections, the raw material for tier-1 triggers.
export const connections = [
  {
    name: "Priya Raghavan",
    title: "Head of Product Design",
    company: "Halcyon Audio",
    connectedOn: "2021-04-18",
  },
  {
    name: "Jordan Wexler",
    title: "Design Program Manager",
    company: "Formlabs",
    connectedOn: "2020-02-03",
  },
  {
    name: "Ana Costa",
    title: "Materials Engineer",
    company: "Formlabs",
    connectedOn: "2019-11-27",
  },
  {
    name: "Mike Delaney",
    title: "Shop Manager",
    company: "Art Center College of Design",
    connectedOn: "2018-09-14",
  },
  {
    name: "Beatriz Nunes",
    title: "Senior CMF Designer",
    company: "Shapeways",
    connectedOn: "2019-06-02",
  },
  {
    name: "Tom Okafor",
    title: "Director of Industrial Design",
    company: "Kestrel Mobility",
    connectedOn: "2022-08-30",
  },
  {
    name: "Hal Berger",
    title: "Recruiter, Design",
    company: "Independent",
    connectedOn: "2023-01-19",
  },
  {
    name: "Sun-Mi Park",
    title: "Prototyping Lead",
    company: "Formlabs",
    connectedOn: "2020-07-11",
  },
  {
    name: "Owen Trask",
    title: "Studio Director",
    company: "Kestrel Mobility",
    connectedOn: "2024-03-06",
  },
  {
    name: "Camille Roy",
    title: "Design Director",
    company: "Solstice Eyewear",
    connectedOn: "2023-10-22",
  },
];

export type Email = {
  id: string;
  folder: "inbox" | "sent";
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  read: boolean;
};

export const emails: Email[] = [
  {
    id: "e1",
    folder: "sent",
    from: "Dana Whitfield",
    fromEmail: "dana@vizcom.com",
    to: "j.moreau@arcnorth.com",
    subject: "nine days",
    date: "2026-05-12",
    body: `Julien,

You posted last month that a set of exteriors took your team nine days and the decision was already made by day four. That is the thing we fix — sketch to render while the review is still happening.

Worth fifteen minutes? I would rather show you than describe it.

Dana`,
    read: true,
  },
  {
    id: "e2",
    folder: "inbox",
    from: "Julien Moreau",
    fromEmail: "j.moreau@arcnorth.com",
    to: "dana@vizcom.com",
    subject: "Re: nine days",
    date: "2026-05-13",
    body: `Ha. You read the post. Yes, fifteen minutes — send times for next week.

J`,
    read: true,
  },
  {
    id: "e3",
    folder: "sent",
    from: "Dana Whitfield",
    fromEmail: "dana@vizcom.com",
    to: "k.bright@lantern.co",
    subject: "Sun-Mi says hello",
    date: "2026-06-03",
    body: `Katie,

Sun-Mi Park mentioned you when I asked her who else was fighting the CMF review cycle. We both did time at Formlabs, so consider this a warm-ish introduction.

You have four designers and twelve finishes to pick. We make that a morning instead of a month.

Fifteen minutes?

Dana`,
    read: true,
  },
  {
    id: "e4",
    folder: "inbox",
    from: "Katie Bright",
    fromEmail: "k.bright@lantern.co",
    to: "dana@vizcom.com",
    subject: "Re: Sun-Mi says hello",
    date: "2026-06-04",
    body: `Any friend of Sun-Mi. Thursday 2pm?`,
    read: true,
  },
  {
    id: "e5",
    folder: "inbox",
    from: "Vizcom Revenue",
    fromEmail: "revops@vizcom.com",
    to: "dana@vizcom.com",
    subject: "Q3 pipeline review — Thursday",
    date: "2026-08-17",
    body: `Bring your top 10 accounts and the reason each one is not closed yet. 30 minutes, no deck.`,
    read: false,
  },
  {
    id: "e6",
    folder: "inbox",
    from: "IDSA Conference",
    fromEmail: "no-reply@idsa.org",
    to: "dana@vizcom.com",
    subject: "Your 2026 attendee pass",
    date: "2026-08-16",
    body: `Thanks for registering. Your pass and the speaker list are attached.`,
    read: false,
  },
  {
    id: "e7",
    folder: "inbox",
    from: "Marisol Ferreira",
    fromEmail: "m.ferreira@northbeamfootwear.com",
    to: "dana@vizcom.com",
    subject: "Out of office",
    date: "2026-08-15",
    body: `I am out until August 24 with limited email. For urgent design team matters contact Ana in the studio.`,
    read: true,
  },
];
