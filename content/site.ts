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
    "I found product at the intersection of data and human behavior: understanding what users do, why they do it, and how to build for it. Data tells me where people get stuck; cognitive science helps me understand why. [ADD PERSONAL DETAIL]",
    "I'm currently looking for [APM / PM internship or new grad roles starting YEAR].",
  ],
  strengths: [
    "Data Analysis",
    "SQL",
    "Python",
    "User Research",
    "Behavioral Insights",
    "Experiment Design",
  ],
};

export type TimelineEntry = {
  title: string;
  org: string;
  dates: string;
  type: "Education" | "Work";
  bullets: string[];
};

export const timeline: TimelineEntry[] = [
  {
    title: "B.A. Data Science & Cognitive Science",
    org: "University of California, Berkeley",
    dates: "[START YEAR] – [EXPECTED GRAD YEAR]",
    type: "Education",
    bullets: [
      "[Relevant coursework, e.g., Data 100, CogSci 131]",
      "[Clubs or projects]",
      "[One product-relevant insight from studying human cognition]",
    ],
  },
  {
    title: "[ROLE]",
    org: "[COMPANY]",
    dates: "[YEARS]",
    type: "Work",
    bullets: [
      "[User + problem: who you served and what was broken]",
      "[What you did about it]",
      "[Outcome, with a metric if possible]",
    ],
  },
  {
    title: "[ROLE]",
    org: "[COMPANY]",
    dates: "[YEARS]",
    type: "Work",
    bullets: [
      "[User + problem: who you served and what was broken]",
      "[What you did about it]",
      "[Outcome, with a metric if possible]",
    ],
  },
  {
    title: "Computer Science",
    org: "Mt. San Antonio College",
    dates: "[START YEAR] – [END YEAR]",
    type: "Education",
    bullets: [
      "[CS foundations, e.g., data structures, programming]",
      "Transferred to UC Berkeley",
      "[Any leadership or projects]",
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
  next: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    id: "study-buddy",
    title: "StudySync",
    problem: "Students abandon study plans within a week of making them.",
    tags: ["Behavior Design", "Mobile", "User Research"],
    result: "↑ 32% week-2 retention in pilot",
    cover: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #78350f 140%)",
    problemDetail:
      "Most study planners assume students fail because they lack a schedule. Interviews showed the real problem: plans are too ambitious, so the first missed session makes the whole plan feel broken.",
    users:
      "Undergraduates in large lecture courses who self-report procrastinating before exams.",
    role: "[Product lead — scoped the problem, ran 12 user interviews, wrote the spec, and analyzed pilot data.]",
    approach: [
      "Interviewed 12 students and mapped where plans fell apart.",
      "Used implementation-intention research to reframe goals as small, specific commitments.",
      "Ran a 3-week pilot with two variants: fixed schedules vs. flexible daily commitments.",
    ],
    solution:
      "A planner that asks for one 25-minute commitment per day and automatically reschedules a missed one instead of marking it failed.",
    results: [
      "↑ 32% week-2 retention vs. the fixed-schedule variant",
      "68% of pilot users completed at least 4 sessions per week",
      "“Missed session” drop-off fell from 41% to 19%",
    ],
    next: "Test social accountability (study pairs) and see whether it helps or hurts intrinsic motivation.",
    links: [
      { label: "Prototype", href: "#" },
      { label: "Deck", href: "#" },
    ],
  },
  {
    id: "campus-dining",
    title: "Dining Hall Wait Times",
    problem: "Students waste lunch breaks in lines they can't see coming.",
    tags: ["Data", "SQL", "Dashboard"],
    result: "↓ 18% peak-hour congestion",
    cover: "linear-gradient(135deg, #18181b 0%, #27272a 55%, #92400e 150%)",
    problemDetail:
      "Dining halls have predictable rushes, but students have no way to know them. Everyone arrives at 12:05 and lines back up.",
    users: "Students on meal plans with tight class schedules; dining staff planning shifts.",
    role: "[Data analyst + PM — pulled swipe data, built the model, and designed the student-facing view.]",
    approach: [
      "Analyzed 6 months of anonymized card-swipe data in SQL to find rush patterns.",
      "Surveyed 150 students on what makes them choose when and where to eat.",
      "Prototyped a simple “best time to go” view instead of a detailed live chart.",
    ],
    solution:
      "A lightweight web view showing each hall's expected wait for the next two hours, with a single recommendation: “Go to Crossroads at 12:40.”",
    results: [
      "↓ 18% peak-hour congestion at participating halls",
      "Avg. self-reported wait fell from 14 to 9 minutes",
      "Staff used the same data to shift one worker to the rush window",
    ],
    next: "Push a nudge 15 minutes before a student's usual lunch time and measure whether it shifts arrivals.",
    links: [{ label: "Repo", href: "#" }],
  },
  {
    id: "onboarding-experiment",
    title: "Onboarding Experiment",
    problem: "Half of new users never finish setting up a budgeting app.",
    tags: ["A/B Testing", "Onboarding", "Python"],
    result: "↑ 21% setup completion",
    cover: "linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #b45309 160%)",
    problemDetail:
      "A student budgeting app asked for bank linking, categories, and a monthly goal before showing any value. Funnel data showed a 50% drop at the bank-linking step.",
    users: "College students managing money on their own for the first time.",
    role: "[Designed the experiment, wrote the analysis in Python, and presented the recommendation.]",
    approach: [
      "Mapped the funnel and found the drop-off step.",
      "Hypothesized that showing value first would make the bank-link ask feel worth it.",
      "Ran an A/B test: original flow vs. a “see your week in 30 seconds” manual-entry start.",
    ],
    solution:
      "Let users log three recent purchases by hand and see a mini spending summary before asking them to link a bank.",
    results: [
      "↑ 21% setup completion (p < 0.05, n ≈ 2,400)",
      "Bank-link rate held steady among users who finished",
      "Day-7 retention up 9% in the treatment group",
    ],
    next: "Check whether the manual-entry users stay engaged at day 30, or whether the lift fades.",
    links: [{ label: "Analysis", href: "#" }],
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
