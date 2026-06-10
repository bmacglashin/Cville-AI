/**
 * Marketing + offer content. Single source of truth for the positioning,
 * product ladder, example workflows, tool-category doctrine, risk boundaries,
 * and FAQs. Mirrored in seed data for service_packages and in docs/sales
 * assets. tests/content.test.ts cross-asserts pricing, slugs, and language.
 */

export const SITE = {
  name: "Agent Ally",
  tagline: "A tool-agnostic AI operating partner for Charlottesville owner-led businesses.",
  subhead:
    "We audit your business, recommend the right client-owned tool stack, configure safe workflows, document the system, train your team, and stay on to operate and improve it. Existing tools first — custom builds only when the business case is clear.",
  primaryCta: "Apply for the Founding AI Operating Audit",
  secondaryCta: "See example workflows",
  city: "Charlottesville",
  region: "Charlottesville & Albemarle County, Virginia",
  email: "ben@agentally.co", // placeholder — update when domain email is live
};

/**
 * The positioning lines. The proprietary asset is the METHOD — audit
 * methodology, opportunity scoring, data-risk framework, vendor vetting,
 * workflow playbooks, prompt library, QA, operating cadence — never a
 * platform or portal.
 */
export const POSITIONING = {
  statement:
    "Agent Ally is a tool-agnostic AI operating partner for owner-led businesses. We audit the business, recommend the right client-owned tool stack, configure safe workflows, document the system, train the team, and stay on to operate and improve it.",
  ownership: "Your accounts. Your data. Our operating method.",
  existingFirst: "Existing tools first. Custom builds only when the business case is clear.",
  rightTool: "We use the right tool, not one tool.",
};

/**
 * Generic tool categories used in public copy. We never name specific
 * vendors on the public site — recommendations are made case-by-case
 * inside an engagement.
 */
export interface ToolCategory {
  name: string;
  description: string;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: "Foundational workspace",
    description:
      "The email, documents, and calendar suite your business already runs on — usually the first place AI workflows should live.",
  },
  {
    name: "Business-grade AI assistants",
    description:
      "Commercial AI assistant plans with admin controls and no-training terms, set up in accounts your business owns.",
  },
  {
    name: "Knowledge bases",
    description:
      "Structured homes for SOPs, checklists, and project knowledge — so answers stop living in one person's head.",
  },
  {
    name: "Automation platforms",
    description:
      "Workflow glue that moves information between the tools you already use, with human checkpoints built in.",
  },
  {
    name: "Messaging-native assistants",
    description:
      "Lightweight assistants that work inside the messaging channels your team already checks — for low-risk, non-sensitive workflows only.",
  },
  {
    name: "Advanced agent workspaces",
    description:
      "Heavier-duty AI work environments. We use these internally to deliver; client use is rare and only after a security review.",
  },
  {
    name: "Custom builds",
    description:
      "Purpose-built software, scoped under a paid statement of work — and only after an audit shows the ROI, data risk, scope, and budget justify it.",
  },
];

export const TOOL_CATEGORY_DISCLAIMER =
  "Specific tools are recommended case-by-case and remain subject to vendor terms, data requirements, and client approval. We are not affiliated with, and do not resell, any tool vendor.";

export interface Offer {
  slug: string;
  name: string;
  tagline: string;
  foundingPriceCents: number;
  standardPriceCents: number;
  standardPriceNote?: string;
  priceNote: string;
  href: string;
  ctaLabel: string;
  includes: string[];
  position: string;
}

export const OFFERS: Offer[] = [
  {
    slug: "ai-operating-audit",
    name: "AI Operating Audit",
    tagline: "Two weeks. A clear-eyed look at where AI actually helps your business — and where it doesn't.",
    foundingPriceCents: 95000,
    standardPriceCents: 125000,
    priceNote:
      "Founding price for the first five Charlottesville clients. $500 credited toward implementation if you proceed within 14 days.",
    href: "/audit",
    ctaLabel: "About the audit",
    includes: [
      "Fit call to confirm we're the right match before you pay",
      "Structured intake covering tools, workflows, and pain points",
      "90-minute owner/operator interview",
      "Tool and process inventory",
      "AI opportunity map with data-risk ranking",
      "Top 5 use cases scored by impact, effort, and risk",
      "A recommended tool stack — built on accounts you own",
      "30-day implementation roadmap",
      "Where useful: a small mockup built on dummy or approved non-sensitive data",
    ],
    position: "The starting point for every engagement. No exceptions — judgment before tools.",
  },
  {
    slug: "ai-workflow-quickstart",
    name: "AI Workflow Quickstart",
    tagline: "One workflow, two weeks, working in tools you already own. No custom platform.",
    foundingPriceCents: 350000,
    standardPriceCents: 450000,
    standardPriceNote: "$4,500–$5,000 standard",
    priceNote:
      "Founding price. Scoped to one workflow from your audit roadmap, built on existing tools first.",
    href: "/quickstart",
    ctaLabel: "About the Quickstart",
    includes: [
      "One workflow selected from your audit's top use cases",
      "Configured in existing, client-owned tools wherever possible",
      "Built and tested in two weeks alongside your team",
      "Human-review checkpoints on anything customer-facing",
      "Written SOP so your team can run it without us",
      "Two weeks of post-launch adjustment",
    ],
    position: "The first implementation step after an audit — one workflow at a time.",
  },
  {
    slug: "managed-ai-workspace",
    name: "Managed AI Workspace + Operate",
    tagline:
      "Your tools, configured into a documented AI operating stack — with us operating and improving it month over month.",
    foundingPriceCents: 850000,
    standardPriceCents: 1250000,
    priceNote: "Founding setup price. Operate retainer from $1,500/month. Offered after an audit only.",
    href: "/managed-workspace",
    ctaLabel: "About the Managed Workspace",
    includes: [
      "Client-owned tool accounts — your logins, your data, your billing relationships",
      "A selected set of workflow playbooks configured across your existing tools",
      "A documented operating stack: SOPs, prompt library, data boundaries, human-review rules",
      "Team training so the workflows survive contact with a busy week",
      "Monthly operating cadence: workflow health, output quality, and a prioritized backlog",
    ],
    position:
      "Not a private platform — a documented way of running AI inside tools you already own, with an operating cadence behind it. A post-audit path for businesses where the ROI and risk profile justify it.",
  },
];

export interface ExampleWorkflow {
  /** Matches the workflow_playbooks.slug seeded in supabase/seed.sql. */
  slug: string;
  title: string;
  forWhom: string;
  description: string;
  ownerWin: string;
}

export const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    slug: "proposal-estimate-drafting-assistant",
    title: "Proposal assistant",
    forWhom: "Design/build, remodeling, premium trades",
    description:
      "Drafts proposals and estimates from your past projects, pricing rules, and site-visit notes. You review and send — nothing goes out without your eyes on it.",
    ownerWin: "Proposals out in days, not weeks. Fewer deals lost to slow paperwork.",
  },
  {
    slug: "internal-sop-assistant",
    title: "Internal SOP assistant",
    forWhom: "Any owner-led team",
    description:
      "Answers your team's repeated questions from an approved set of SOPs, checklists, and policies — so they stop walking into your office for things that are written down.",
    ownerWin: "Fewer interruptions. New hires ramp without shadowing you for a month.",
  },
  {
    slug: "customer-inquiry-triage-drafts",
    title: "Customer inquiry triage drafts",
    forWhom: "High-inquiry-volume services",
    description:
      "Reads incoming inquiries, sorts them by type and urgency, and drafts replies for a human to review and send. No auto-sending. No bot talking to your customers.",
    ownerWin: "Faster, more consistent follow-up without hiring a coordinator.",
  },
  {
    slug: "project-handoff-checklist-generator",
    title: "Project handoff checklist generator",
    forWhom: "Design/build, property management",
    description:
      "Turns project details into stage-specific handoff checklists — sales to production, production to close-out — so nothing falls through between teams.",
    ownerWin: "Cleaner handoffs. Fewer 'I thought you told them' moments.",
  },
  {
    slug: "owner-weekly-ops-brief",
    title: "Owner weekly priorities digest",
    forWhom: "Owners who are the unofficial COO",
    description:
      "A Monday-morning brief assembled from your approved sources: stalled proposals, follow-up gaps, handoff risks, and the three actions most worth your attention.",
    ownerWin: "You see what matters before the week eats you.",
  },
  {
    slug: "staff-onboarding-knowledge-base",
    title: "Staff onboarding knowledge base",
    forWhom: "Teams of 6–40",
    description:
      "Your scattered training materials organized into a structured, searchable onboarding path — with an assistant that answers new-hire questions from approved content only.",
    ownerWin: "Onboarding stops depending on whoever has time that week.",
  },
  {
    slug: "review-content-drafting-system",
    title: "Review & content draft system",
    forWhom: "Reputation-driven local businesses",
    description:
      "Drafts review responses, project write-ups, and follow-up notes in your voice for human review. Keeps your public presence current without becoming your night job.",
    ownerWin: "A consistent public presence that doesn't cost your evenings.",
  },
];

export const WHO_FOR = [
  "Design/build and remodeling firms where the owner still touches every proposal",
  "Architecture-adjacent and premium home-service businesses with 5–40 employees",
  "Property managers and venue operators drowning in coordination",
  "Owner-led professional services with real operational complexity",
  "Owners who want fewer interruptions — not another system to babysit",
];

export const NOT_FOR = [
  "Businesses that want a chatbot talking to customers unsupervised",
  "Anyone shopping for 'AI that replaces employees'",
  "Workflows involving regulated data — health records, student records, lending, legal advice",
  "Companies that want AI making decisions with nobody reviewing them",
  "Teams looking for the cheapest possible automation — this is advisory-grade work",
];

export const RISK_BOUNDARIES = [
  "No HIPAA / PHI or health-record workflows",
  "No student-record (FERPA) workflows",
  "No tenant-screening, employment, credit, lending, or insurance decisions",
  "No legal or tax advice workflows",
  "No payroll decisioning",
  "No financial account credentials",
  "No children's data",
  "No AI acting on its own — human review is required on anything customer-facing, financial, legal, HR, housing-related, or regulated",
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Why is the audit paid?",
    a: "Because free 'AI assessments' are sales calls in disguise. A paid audit means the work is serious from day one: structured intake, a real owner interview, scored use cases, a recommended tool stack, and a roadmap you can act on with or without us. The $500 implementation credit means the audit effectively pays for half of itself if we proceed together.",
  },
  {
    q: "What does the audit actually produce?",
    a: "A written deliverable: an inventory of your tools and workflows, an AI opportunity map with each use case scored by impact, effort, and risk, a data-risk ranking, your top five use cases, a recommended operating stack built on tools your business owns, and a 30-day implementation roadmap. Where it helps, we include a small mockup built on dummy or approved non-sensitive data so you can see — not imagine — what a workflow would look like.",
  },
  {
    q: "Which AI tools do you use?",
    a: "The right one for the job — we use the right tool, not one tool. We work across foundational workspaces, business-grade AI assistants, knowledge bases, automation platforms, messaging-native assistants, advanced agent workspaces, and (rarely) custom builds. Every recommendation is case-by-case, set up in accounts your business owns, and subject to vendor terms, data requirements, and your approval. We don't resell software, and we're not affiliated with any vendor.",
  },
  {
    q: "Do you build custom software?",
    a: "Only when the business case is clear. Existing tools come first — they're faster, cheaper, and easier for your team to own. A custom build happens only after an audit, under its own paid statement of work, and only when ROI, data risk, scope, and budget all justify it. Most businesses never need one, and we'll say so.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. You need to know your business. We translate between how your operation actually runs and what current AI can reliably do. You'll never be handed something your team can't operate.",
  },
  {
    q: "Will this put my data at risk?",
    a: "We take the opposite approach of most AI vendors: we start by ranking your data by sensitivity and explicitly exclude regulated and sensitive data from MVP work. Tools are vetted against our data-risk framework before they're recommended, everything runs in accounts you own, and anything customer-facing gets a human-review step. We'll tell you plainly when something shouldn't be automated yet.",
  },
  {
    q: "What if the audit finds AI isn't worth it for us?",
    a: "Then the audit says so, and you've spent $950 to avoid spending $20,000 on the wrong thing. The roadmap is yours either way — some recommendations may be process fixes that need no AI at all.",
  },
  {
    q: "Why one workflow at a time?",
    a: "Because big-bang AI projects fail in small businesses. One workflow in two weeks gives you something working, your team's trust, and a real read on ROI before anything bigger is on the table.",
  },
  {
    q: "Can my team keep running it if we stop working together?",
    a: "Yes — that's the standard. Everything is built in tool accounts your business owns, every Quickstart ships with a written SOP, and offboarding includes a documented handoff. Your accounts, your data, our operating method. No hostage infrastructure.",
  },
  {
    q: "Are you an agency? Will work be outsourced?",
    a: "No. Agent Ally is founder-led. Ben runs every audit, every interview, and every implementation personally during the founding period. That's why the founding cohort is capped at five clients.",
  },
  {
    q: "What do you charge after the founding period?",
    a: "The audit moves to $1,250, Workflow Quickstarts to $4,500–$5,000, and Managed AI Workspace setup to $12,500. Founding clients keep their pricing for any engagement started within six months.",
  },
  {
    q: "We're not in Charlottesville. Can we still work with you?",
    a: "The founding cohort is intentionally local — the owner interview and working sessions are better in person. If you're in the broader central-Virginia area, apply anyway and we'll see if it fits.",
  },
];

export const PIPELINE_PUBLIC = [
  { step: "Apply", detail: "Five-minute application. We respond within one business day." },
  { step: "Fit call", detail: "20 minutes, free. We both decide whether the audit makes sense." },
  { step: "Audit", detail: "Paid engagement: intake, owner interview, opportunity map, recommended stack, roadmap." },
  { step: "Implement", detail: "If — and only if — the ROI and risk profile justify it. Existing tools first." },
];
