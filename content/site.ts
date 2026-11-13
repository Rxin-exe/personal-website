/**
 * All site content lives here. Edit this file to update the website —
 * no component changes needed. Anything in [BRACKETS] is a placeholder.
 */

export const site = {
  url: "https://ronanwong.vercel.app", // the site's public address, used for link previews
  title: "Ronan Wong Website",
  description:
    "Ronan Wong is an aspiring Product Manager studying Data Science and Cognitive Science at UC Berkeley.",
  updated: "Nov 2026", // shown in the hero panel and footer; bump it when you edit the site
};

export const profile = {
  name: "Ronan Wong",
  initials: "RW",
  status: "Open to PM / APM internships, Summer 2027",
  /** The description under your name: the main text of the hero. */
  bio: "Data Science + Cognitive Science at UC Berkeley. I'm building Sendo, an AI form coach for climbers, and working on product at Cal Hockey.",
};

export type Experience = {
  org: string;
  role: string;
  dates: string;
  result: string; // one sentence, lead with the outcome
  /** The headline number. `compare` (before → now, same unit) draws two pixel bars under it. */
  metric?: { value: string; label: string; compare?: { from: number; to: number } };
  href?: string; // e.g. "/work/sendo" to open the case study
  /** What the row turns into on hover (lib/roleFx.ts). */
  fx?: "ice" | "rock" | "laser" | "robot" | "tennis";
};

/** Newest first. One line each: the result, not the duties. */
export const experience: Experience[] = [
  {
    org: "Cal Hockey",
    fx: "ice",
    role: "Product & Software Engineering Intern",
    dates: "Aug 2026 – now",
    result:
      "Turned 12+ player and coach interviews into a sideline tagging workflow that cut daily film review from 2–3 hours to 20 minutes. The coaching staff now uses it at every game.",
    metric: { value: "20 min", label: "daily film review, from 2–3 hours", compare: { from: 150, to: 20 } },
  },
  {
    org: "Sendo",
    fx: "rock",
    role: "Founder & Product Lead",
    dates: "Feb 2026 – now",
    result: "Scoped and shipped an AI form coach for climbers. 40+ beta users, 400+ climbs logged, 70% 30-day retention.",
    metric: { value: "70%", label: "30-day retention" },
    href: "/work/sendo",
  },
  {
    org: "Handshake AI",
    fx: "laser",
    role: "AI Fellow, frontier model evaluation",
    dates: "Jul – Oct 2026",
    result: "Ranked 152 recurring LLM failure patterns and rewrote the evaluation rubrics, raising reviewer agreement from 30% to 75%.",
    metric: { value: "75%", label: "reviewer agreement, from 30%", compare: { from: 30, to: 75 } },
  },
  {
    org: "Outamation",
    fx: "robot",
    role: "Data Science Intern, mortgage automation",
    dates: "Nov 2025 – Mar 2026",
    result: "Built PDF extraction pipelines that cut per-document handling from 20 to 5 minutes, saving a 15-person team 10 hours a week.",
    metric: { value: "10 h", label: "saved a week for a 15-person team" },
  },
  {
    org: "S.L.I.C.E. Athletics",
    fx: "tennis",
    role: "Co-Founder & Vice President, nonprofit",
    dates: "Nov 2022 – Aug 2025",
    result:
      "Co-founded a sports program for students with disabilities and grew it through partnerships with 5 schools and disability centers. Ran the budget that kept weekly programs and seasonal events going for 3 years.",
    metric: { value: "150+", label: "students with disabilities served" },
  },
];

export const education = {
  school: "UC Berkeley",
  degree: "B.A. Data Science & Cognitive Science",
  dates: "2026 – now",
};

export type Project = {
  id: string;
  title: string;
  context: string; // who and where, e.g. "Cal Hacks 13.0, team of 3"
  problem: string;
  metric: { value: string; label: string }; // the headline number on the card
  image?: string; // shown dithered; hovering a card reveals the original
  problemDetail: string;
  users: string;
  role: string;
  approach: string[];
  solution: string;
  results: string[];
  next?: string;
  links?: { label: string; href: string }[];
  /** Results drawn as pixel charts on the case study page. Real numbers only. */
  charts?: Chart[];
};

export type Chart =
  | { kind: "bars"; title: string; unit: string; bars: { label: string; value: number; highlight?: boolean }[] }
  | { kind: "squares"; title: string; total: number; lit: number[]; caption: string };

export const projects: Project[] = [
  {
    id: "sendo",
    title: "Sendo",
    context: "Founder and product lead, 2026",
    problem: "Climbers improve slowly because almost no one gets feedback on their form.",
    metric: { value: "70%", label: "30-day retention across 40+ beta climbers" },
    image: "/projects/sendo.jpg",
    problemDetail:
      "Most climbers learn by trial and error. Coaching is expensive and rare, so bad habits stick. In a 100-climber survey, 80% said they had no source of feedback on their form.",
    users: "Recreational climbers who want to progress but don't have regular access to a coach.",
    role: "Founder & Product Lead. I ran discovery, scoped the MVP, led 1 engineer and 1 designer, and built the MediaPipe pose model myself.",
    approach: [
      "Ran 15+ user interviews and a 100-climber survey to find the most painful gap: no form feedback.",
      "Scoped the MVP down to a single feature, form scoring, instead of a full training app.",
      "After launch, 20+ surveyed users said raw metrics weren't helpful, so I A/B tested per-move body cues against them.",
    ],
    solution:
      "A real-time web app that scores a climb from video using pose estimation, then tells the climber what to fix, move by move.",
    results: [
      "40+ beta users logged 400+ climbs (about 10 per user)",
      "70% 30-day retention",
      "19 of 20 in-app ratings positive",
      "Per-move body cues took weekly climbs logged from 30 to 70",
    ],
    next: "Reach beyond active climbers: make Sendo the way people who have never touched the sport take their first climbs, with form guidance from day one.",
    links: [{ label: "Live app", href: "https://sendo-five.vercel.app/" }],
    charts: [
      {
        kind: "bars",
        title: "A/B test: weekly climbs logged",
        unit: "climbs a week",
        bars: [
          { label: "Raw metrics", value: 30 },
          { label: "Per-move body cues", value: 70, highlight: true },
        ],
      },
      {
        kind: "squares",
        title: "In-app ratings",
        total: 20,
        lit: Array.from({ length: 19 }, (_, i) => i),
        caption: "19 of 20 positive",
      },
    ],
  },
  {
    id: "forgeai",
    title: "ForgeAI",
    context: "Cal Hacks 13.0, team of 3",
    image: "/projects/forgeai.jpg",
    problem: "Engineers can design a part in an afternoon, then wait days to find out what it costs to make.",
    metric: { value: "STL → $", label: "CAD file to price, budget check and spoken invoice in one flow" },
    problemDetail:
      "One of our teammates is a mechanical engineer who kept hitting the same wall: design software knows everything about a part's geometry and nothing about its cost. Stock had to be sized by hand, machining time estimated, quotes chased, and the total checked against a budget that was already partly spent.",
    users: "Mechanical engineers and small manufacturing teams who need to know what a part will cost, and whether the budget can cover it, before they commit.",
    role: "One of a team of 3 at Cal Hacks 13.0, with Vincent Ly and Tao Tokikawa.",
    approach: [
      "Started from a teammate's real, repeated pain instead of a technology looking for a use.",
      "Cut a huge first feature list (supplier search, approval workflows, banking integrations) down to one question: what does this part cost, and can we afford it? Integrations that didn't serve that got cut, even ones that worked.",
      "Kept the hard research problems, like predicting machining time, as explicit, editable inputs with labeled assumptions rather than overclaiming.",
      "Added mesh checks and a fallback 3D viewer so a bad file or a machine without WebGL warns the user instead of silently showing a wrong number or a blank box.",
    ],
    solution:
      "Upload an STL and ForgeAI measures the part, prices it for CNC milling or FDM printing, and shows how unit cost falls with quantity. It checks the order against your balance, upcoming commitments and a protected reserve, tells you the largest quantity you can afford, then generates itemized invoices read aloud with Cartesia's voice AI.",
    results: [
      "A complete flow from STL upload to price, budget decision and spoken invoice",
      "Invoice line items trace back to the part's real geometry, not hard-coded numbers",
      "Cost model works in whole cents and is covered by unit tests",
      "Every estimate shows its assumptions, and the app labels what is measured versus simulated",
    ],
    next: "Connect the voice agent to a phone line so customers can confirm an invoice in a live call, and replace assumed rates with live supplier quotes and lead times.",
    links: [{ label: "Devpost", href: "https://devpost.com/software/forgeai-6l3j8o" }],
  },
  {
    id: "3d-gallery",
    title: "Interactive 3D Object Gallery",
    context: "RoseHacks 2026, team of 4",
    problem: "Art is meant to be experienced, but online it's just a flat image on a screen.",
    metric: { value: "2nd", label: "of 40 teams at RoseHacks 2026, built in 24 hours" },
    image: "/projects/3d-gallery.jpg",
    problemDetail:
      "Seeing art in person is physical: you walk around a piece and look at it from every angle. Online galleries flatten all of that into a static picture, so people who can't be there miss most of the experience.",
    users: "Artists working in any medium who want to share their work, and onlookers who want to experience it as if they were in the room.",
    role: "One of a team of 4. I built the BLE connection scripts for our ESP32 Bluetooth remote.",
    approach: [
      "Set out to make viewing art immersive and physical, even for people who aren't there in person.",
      "Cut scope to a single interaction, rotating a 3D model, so the team could ship a polished experience in 24 hours.",
      "Built two ways to control it: a custom Bluetooth remote, and computer vision that tracks the viewer's hands.",
    ],
    solution:
      "A platform where artists upload work from any medium as a 3D object, and onlookers turn and explore it with either our remote or their own hand movements.",
    results: ["Placed 2nd of 40 teams at RoseHacks 2026", "Shipped a working hardware + software demo in 24 hours"],
    next: "Put it in front of real artists and viewers: test whether hand tracking alone feels natural enough to drop the remote, and add the next interaction people ask for most, such as zoom.",
    links: [{ label: "Devpost", href: "https://devpost.com/software/interactive-3d-object-gallery" }],
    charts: [
      {
        kind: "squares",
        title: "RoseHacks 2026 placing",
        total: 40,
        lit: [1],
        caption: "2nd of 40 teams",
      },
    ],
  },
];

export type Breakdown = {
  id: string;
  product: string;
  logo: string; // short text mark, shown if there's no icon
  icon?: string; // key into components/brandIcons.ts
  title: string;
  category: string;
  readTime: string;
  context: string[];
  users: string[];
  works: { point: string; why: string }[];
  friction: { point: string; opportunity: string }[];
  /** `pitch`: what I'd ship, in a few words, shown on the card as the hook. */
  recommendation: { feature: string; pitch: string; rationale: string[] };
  metrics: { northStar: string; supporting: string[] };
  risks: string[];
};

export const breakdowns: Breakdown[] = [
  {
    id: "duolingo-streaks",
    product: "Duolingo",
    logo: "Du",
    icon: "duolingo",
    title: "Why Duolingo's streaks work, and where they break",
    category: "Growth",
    readTime: "6 min read",
    context: [
      "Duolingo is the most downloaded education app in the world, and its daily streak is arguably its most important feature. The streak turns language learning, a goal that pays off over years, into something you can win today.",
      "The challenge every learning app faces is that the reward (fluency) is distant and the cost (effort) is immediate. Streaks bridge that gap.",
    ],
    users: [
      "Casual self-improvers: want to feel productive in a few minutes a day. Job: “Help me feel like I'm making progress without a big commitment.”",
      "Goal-driven learners: preparing for a trip, a move, or an exam. Job: “Get me to a usable level by a specific date.”",
      "Lapsed users: once had a long streak and lost it. Job: “Give me a reason to come back that doesn't feel like starting over.”",
    ],
    works: [
      {
        point: "Loss aversion does the heavy lifting.",
        why: "After about a week, people aren't protecting their Spanish; they're protecting the number. Losing something feels roughly twice as bad as gaining it feels good, so the streak gets more motivating the longer it runs.",
      },
      {
        point: "The minimum is tiny.",
        why: "One lesson takes about three minutes. Lowering the bar for “counting” makes the habit survive bad days, which is when most habits die.",
      },
      {
        point: "Streak Freeze is a safety valve.",
        why: "Letting users bank a skipped day keeps the streak from ending by accident, which prevents the all-or-nothing collapse that kills most habit apps.",
      },
    ],
    friction: [
      {
        point: "The streak replaces the goal.",
        opportunity: "Users do the easiest possible lesson to keep the streak alive. Engagement looks healthy while learning stalls.",
      },
      {
        point: "Breaking a long streak causes churn, not a restart.",
        opportunity: "When a 200-day streak ends, many users leave entirely. The thing that kept them is now the reason they quit.",
      },
      {
        point: "Notifications start to feel like guilt.",
        opportunity: "The mascot's nudges are funny at first and stressful later, especially for users already feeling behind.",
      },
    ],
    recommendation: {
      feature: "“Streak Recovery”: a 48-hour window to rebuild a broken streak by completing two harder lessons.",
      pitch: "Streak Recovery, a second chance for broken streaks",
      rationale: [
        "Targets the highest-value moment in the lifecycle: a committed user about to churn.",
        "Asks for more effort, not money, which rewards learning instead of just showing up.",
        "Turns a loss into a comeback story, which is more motivating than starting from zero.",
      ],
    },
    metrics: {
      northStar: "Weekly active learners completing ≥3 lessons above their current level",
      supporting: [
        "30-day retention of users whose streak broke at 30+ days",
        "Recovery rate: % of broken streaks restored within 48 hours",
        "Share of lessons completed that are “streak-saving minimum” lessons",
      ],
    },
    risks: [
      "Could make streaks feel less meaningful if recovery is too easy. Tune difficulty carefully.",
      "Might cannibalize Streak Freeze and Streak Repair purchases. Watch revenue per user alongside retention.",
      "Adds complexity to a feature whose power comes from being simple.",
    ],
  },
  {
    id: "notion-onboarding",
    product: "Notion",
    logo: "N",
    icon: "notion",
    title: "Notion's blank page problem",
    category: "Onboarding",
    readTime: "5 min read",
    context: [
      "Notion can be a doc, a wiki, a database, a project tracker, or all of them at once. That flexibility is why power users love it and why new users bounce.",
      "The first screen many people see is a blank page with a blinking cursor. For a tool that can do anything, that's a tough way to start.",
    ],
    users: [
      "Students: want one place for notes and assignments. Job: “Keep my semester organized without setting up a system.”",
      "Team leads: evaluating Notion for their team. Job: “Show me it can replace our docs and task tracker.”",
      "Template browsers: arrived from social media wanting a specific setup. Job: “Give me the exact system I saw.”",
    ],
    works: [
      {
        point: "Templates show what's possible.",
        why: "Seeing a finished setup is far easier than imagining one. Templates replace a design problem with a choice.",
      },
      {
        point: "Blocks are easy to learn.",
        why: "Typing “/” reveals everything. One shortcut unlocks the whole product, which keeps the learning curve gradual.",
      },
      {
        point: "Community content drives acquisition.",
        why: "Creators sharing their setups do Notion's marketing and onboarding at the same time.",
      },
    ],
    friction: [
      {
        point: "Too many choices on day one.",
        opportunity: "Choice overload slows decisions. New users who browse templates without picking one often never return.",
      },
      {
        point: "Databases are powerful but unexplained.",
        opportunity: "Relations and rollups are where Notion becomes sticky, yet most users never discover them.",
      },
      {
        point: "Imported templates break when edited.",
        opportunity: "Users who don't understand how a template works are afraid to change it, so they stop using it.",
      },
    ],
    recommendation: {
      feature: "A 60-second “what are you here for?” setup that builds a small starter workspace and explains each piece as you use it.",
      pitch: "A 60-second setup that ends the blank page",
      rationale: [
        "Shrinks the choice from hundreds of templates to one, based on the user's stated goal.",
        "Teaches database concepts in context, the moment the user needs them.",
        "Gets users to their first useful page faster, which predicts long-term retention.",
      ],
    },
    metrics: {
      northStar: "% of new users with a page they edit on 3+ separate days in their first 2 weeks",
      supporting: [
        "Time to first edited page after sign-up",
        "% of new users creating or editing a database view in week 1",
        "Template edit rate (edited vs. left untouched)",
      ],
    },
    risks: [
      "A guided path may feel limiting to users who want to explore freely. Keep a clear skip option.",
      "Picking the wrong starting workspace could be worse than a blank page.",
      "More onboarding steps can lower sign-up completion even if retention rises.",
    ],
  },
  {
    id: "spotify-monetization",
    product: "Spotify",
    logo: "Sp",
    icon: "spotify",
    title: "How Spotify's free tier sells Premium",
    category: "Monetization",
    readTime: "6 min read",
    context: [
      "Spotify's free tier isn't a separate product. It's a long, carefully designed trial. Most Premium subscribers started as free users, so the free experience has to be good enough to keep people and limited enough to push them to pay.",
      "The core tension: every limitation that drives upgrades also risks pushing people to a competitor.",
    ],
    users: [
      "Casual listeners: play music in the background. Job: “Give me something good to listen to without effort.”",
      "Music enthusiasts: curate playlists and chase new releases. Job: “Let me listen to exactly what I want, when I want.”",
      "Price-sensitive students: would pay but feel the cost. Job: “Make paying feel worth it.”",
    ],
    works: [
      {
        point: "Limits hit at moments of intent.",
        why: "Shuffle-only playback and skip limits show up exactly when a user wants control. The upgrade prompt arrives when its value is most obvious.",
      },
      {
        point: "Personalization builds switching costs.",
        why: "Discover Weekly and Wrapped get better the longer you use Spotify. Leaving means losing a taste profile you can't export.",
      },
      {
        point: "Student and Family plans fit real budgets.",
        why: "Pricing tiers match how people actually share and spend, which turns “too expensive” into “that's fair.”",
      },
    ],
    friction: [
      {
        point: "Ads feel like punishment, not a trade.",
        opportunity: "Repetitive ads frustrate users without making Premium feel more valuable, which hurts brand perception.",
      },
      {
        point: "Free users don't know what they're missing.",
        opportunity: "Many free users have never experienced offline listening or lossless audio, so they can't value them.",
      },
      {
        point: "Trials end abruptly.",
        opportunity: "When a trial ends, playback just gets worse. There's no moment that reminds users what they're about to lose.",
      },
    ],
    recommendation: {
      feature: "“Premium moments”: give free users a short, free Premium session at a high-intent moment, like their first long trip with no signal.",
      pitch: "Premium moments, a free taste right when it matters",
      rationale: [
        "Lets users feel the value instead of reading about it.",
        "Ties the upgrade prompt to a real need (offline listening) rather than a generic banner.",
        "Uses the endowment effect: once something feels like yours, losing it hurts.",
      ],
    },
    metrics: {
      northStar: "Free-to-Premium conversion within 30 days of a Premium moment",
      supporting: [
        "Free-tier 90-day retention (to make sure the feature doesn't cause churn)",
        "Ad revenue per free user in the test group",
        "Premium retention at 6 months for converted users",
      ],
    },
    risks: [
      "Giving away Premium might reduce urgency to pay if sessions feel too frequent.",
      "Detecting “high-intent moments” requires signals some users may find invasive.",
      "Lost ad revenue during free sessions must be offset by conversion gains.",
    ],
  },
  {
    id: "strava-climbing",
    product: "Strava",
    logo: "St",
    icon: "strava",
    title: "Strava won runners. Why doesn't it work for climbers?",
    category: "Expansion",
    readTime: "5 min read",
    context: [
      "Strava is the social network for endurance athletes. Its loop is simple: record an activity, share it, collect kudos, and come back to beat your last effort. For running and cycling, that loop is close to perfect.",
      "Climbing is one of the fastest-growing sports, especially indoors. Strava lets you log a climb, but the loop that makes it sticky for runners barely works for climbers. As someone building a climbing product, I think that gap is worth a closer look.",
    ],
    users: [
      "Gym climbers: climb a few times a week with friends. Job: “Show me I'm getting better, and let my friends see it too.”",
      "Multi-sport athletes: already run or ride on Strava. Job: “Keep all my training in one place.”",
      "Projecting climbers: work one hard problem across many sessions. Job: “Track my attempts until I finally send it.”",
    ],
    works: [
      {
        point: "Kudos make effort social.",
        why: "A small, low-cost reaction from friends turns a solo workout into something people notice. That social reward is a big reason people keep recording.",
      },
      {
        point: "Segments create a reason to return.",
        why: "Leaderboards on a stretch of road give every run a goal and a rival. Progress is visible and comparable.",
      },
      {
        point: "Recording is nearly effortless.",
        why: "Press start, press stop, and GPS does the rest. The less work logging takes, the more people log.",
      },
    ],
    friction: [
      {
        point: "The core metric doesn't fit.",
        opportunity: "Strava's stats are built around distance, pace, and routes. A climbing session has none of those; what climbers care about is grade, attempts, and whether they sent.",
      },
      {
        point: "There's nothing worth reacting to.",
        opportunity: "A climb shows up as a time and maybe a heart rate. Friends have little reason to give kudos, so the social loop never starts.",
      },
      {
        point: "No equivalent of segments.",
        opportunity: "Climbers already compare themselves on the same gym problems, but Strava has no way to represent a specific route or boulder.",
      },
    ],
    recommendation: {
      feature: "A climbing session logger: tap to log each problem's grade, attempts, and send, then share a session card showing hardest send and a grade pyramid.",
      pitch: "A session logger built for how climbers train",
      rationale: [
        "Gives climbers the progress signal they actually care about, in the same tap-to-log spirit as Strava's recording.",
        "Creates something worth giving kudos to, which restarts the social loop.",
        "Lays the groundwork for a segment-like feature later: shared gym problems with their own send lists.",
      ],
    },
    metrics: {
      northStar: "Weekly active climbers logging 2+ climbing sessions",
      supporting: [
        "Kudos per climbing activity, compared with running activities",
        "90-day retention of users whose first activity was a climb",
        "Share of multi-sport users who log at least one climb a month",
      ],
    },
    risks: [
      "Grades vary between gyms, so comparisons can feel unfair. Keep the focus on personal progress first.",
      "Manual logging mid-session is friction that GPS never had. It has to take seconds, not minutes.",
      "Climbing is a smaller market than running; the bet only pays off if it also deepens engagement for multi-sport users.",
    ],
  },
];

export const contact = {
  email: "ronanwong@berkeley.edu",
  linkedin: "https://www.linkedin.com/in/ronanwong",
  github: "https://github.com/Rxin-exe",
  resume: "/Ronan_Wong_Resume.pdf", // phone number and grad date removed
};

type SectionCopy = { label: string; title: string; intro?: string };

/** Headings for each section, in page order. The nav is built from this. */
export const sections: Record<"experience" | "projects" | "breakdowns" | "contact", SectionCopy> = {
  experience: {
    label: "Experience",
    title: "Experience",
  },
  projects: {
    label: "Projects",
    title: "Projects",
    intro: "Each opens as a full write-up: the problem, what I cut, and what happened after launch.",
  },
  breakdowns: {
    label: "Teardowns",
    title: "Product teardowns",
    intro: "What works, where it breaks, and the one thing I'd ship next.",
  },
  contact: {
    label: "Contact",
    title: "Hiring PM interns for Summer 2027?",
    intro: "Email is the fastest way to reach me.",
  },
};

export const nav = (["experience", "projects", "breakdowns"] as const).map((id) => ({ id, label: sections[id].label }));
