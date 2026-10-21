/**
 * All site content lives here. Edit this file to update the website —
 * no component changes needed. Anything in [BRACKETS] is a placeholder.
 */

export const site = {
  url: "https://example.com", // [SITE_URL] — used for Open Graph links
  title: "Ronan Wong — Product Manager",
  description:
    "Ronan Wong is an aspiring Product Manager studying Data Science and Cognitive Science at UC Berkeley.",
};

export const profile = {
  name: "Ronan Wong",
  initials: "RW",
  showPhoto: false, // set to true to show the photo in the hero
  photo: "/profile.svg", // [PHOTO_URL] — drop a square photo in /public and point to it
  photoAlt: "Portrait of Ronan Wong",
  headline: "Aspiring Product Manager · Data Science & Cognitive Science @ UC Berkeley",
  valueStatement:
    "I combine data and an understanding of how people think to build products users actually love.",
  about: [
    "I started out studying Computer Science at Mt. San Antonio College, where I learned to break problems into pieces and build things that work. I then transferred to UC Berkeley, where I now study Data Science and Cognitive Science.",
    "I found product at the intersection of data and human behavior: understanding what users do, why they do it, and how to build for it. Working with students with disabilities taught me to build with care for people whose needs are easy to overlook, and research showed me how much I love talking with people and understanding their problems up close. Product is where I bring that attentive perspective.",
    "I'm an AI-native builder: I prototype rapidly and relentlessly, making apps that build community, support learning, and create real impact. I'm currently looking for PM and APM internships for Summer 2027.",
  ],
  strengths: [
    "Data Analysis",
    "SQL",
    "Python",
    "User Research",
    "Behavioral Insights",
    "Experiment Design",
    "AI Prototyping",
    "Rapid Prototyping",
    "Accessibility",
  ],
};

export type TimelineEntry = {
  title: string;
  org: string;
  dates: string;
  type: "Education" | "Work" | "Leadership";
  bullets: string[];
};

export const timeline: TimelineEntry[] = [
  {
    title: "B.A. Data Science & Cognitive Science",
    org: "University of California, Berkeley",
    dates: "2026 – Present",
    type: "Education",
    bullets: [
      "Coursework: CS 61A (Structure and Interpretation of Computer Programs), Data 8 (Foundations of Data Science)",
      "Pairing data science with the study of how people think, perceive, and decide",
    ],
  },
  {
    title: "Product & Software Engineering Intern",
    org: "Cal Hockey",
    dates: "Aug 2026 – Present",
    type: "Work",
    bullets: [
      "Synthesized 12+ player, coach, and staff interviews on the team's biggest weekly time sink, film review, into a PRD, roadmap, and Figma prototype that won approval for a 4-game pilot",
      "Piloted a live sideline tagging sheet that cut daily film review from 2–3 hours to 20 minutes and scoring errors by 67%",
      "Adopted by the full coaching staff as the standard game-day workflow; now leading one-click clip retrieval with 2 engineers and 1 designer",
    ],
  },
  {
    title: "Founder & Product Lead",
    org: "Sendo · AI form coach for climbers",
    dates: "Feb 2026 – Present",
    type: "Work",
    bullets: [
      "Scoped the MVP to a single form-scoring feature after 15+ interviews and a 100-climber survey (80% lacked form feedback)",
      "Shipped a real-time climb-scoring web app with 1 engineer and 1 designer; built the MediaPipe pose model myself",
      "Reached 40+ beta users and 70% 30-day retention; an A/B test of per-move body cues took weekly climbs logged from 30 to 70",
    ],
  },
  {
    title: "Data Science Intern, Mortgage Process Automation",
    org: "Outamation",
    dates: "Nov 2025 – Mar 2026",
    type: "Work",
    bullets: [
      "Turned stakeholder interviews into specs and Python pipelines that automate PDF field extraction, saving a 15-person team 10 hours a week",
      "Benchmarked retrieval options on a 200-query test set to win sign-off on a RAG search design that improved retrieval relevance by 54%",
    ],
  },
];

export type Project = {
  id: string;
  title: string;
  problem: string;
  tags: string[];
  result: string;
  cover: string; // CSS gradient, or swap for an image path via `image`
  image?: string;
  problemDetail: string;
  users: string;
  role: string;
  approach: string[];
  solution: string;
  results: string[];
  next?: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    id: "sendo",
    title: "Sendo",
    problem: "Climbers improve slowly because almost no one gets feedback on their form.",
    tags: ["0 → 1", "AI / Computer Vision", "A/B Testing"],
    result: "70% 30-day retention",
    cover: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #78350f 140%)",
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
  },
  {
    id: "3d-gallery",
    title: "Interactive 3D Object Gallery",
    problem: "Art is meant to be experienced, but online it's just a flat image on a screen.",
    tags: ["Hackathon", "Hardware", "Computer Vision"],
    result: "2nd of 40 teams at RoseHacks 2026",
    cover: "linear-gradient(135deg, #18181b 0%, #27272a 55%, #92400e 150%)",
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
    links: [{ label: "Devpost", href: "https://devpost.com/software/interactive-3d-object-gallery" }],
  },
];

export type Breakdown = {
  id: string;
  product: string;
  logo: string; // short text mark shown as a placeholder logo
  title: string;
  category: string;
  readTime: string;
  context: string[];
  users: string[];
  works: { point: string; why: string }[];
  friction: { point: string; opportunity: string }[];
  recommendation: { feature: string; rationale: string[] };
  metrics: { northStar: string; supporting: string[] };
  risks: string[];
};

export const breakdowns: Breakdown[] = [
  {
    id: "duolingo-streaks",
    product: "Duolingo",
    logo: "Du",
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
];

/**
 * Live A/B test on the hero's primary button. Results show near the footer.
 * Changing `id` starts a fresh experiment with new counters.
 */
export const experiment = {
  id: "hero-cta-v1",
  hypothesis:
    "Framing the button around how I think (B) will get more clicks than naming the section (A).",
  metric: "Click-through on the hero's primary button, one count per visitor.",
  variants: {
    A: "View my breakdowns",
    B: "See how I think",
  },
};

export const contact = {
  heading: "Let's build something.",
  line: "I'm actively looking for PM opportunities. Always happy to chat about products.",
  email: "[EMAIL]",
  linkedin: "[LINKEDIN_URL]",
};

export const nav = [
  { id: "about", label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "projects", label: "Projects" },
  { id: "breakdowns", label: "Breakdowns" },
  { id: "contact", label: "Contact" },
];
