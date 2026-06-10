/**
 * Marketing + offer content. Single source of truth for the product ladder,
 * example workflows, risk boundaries, and FAQs. Mirrored in seed data for
 * service_packages and in docs/sales assets.
 */

export const SITE = {
  name: "Agent Ally",
  tagline: "Practical AI implementation for Charlottesville owner-led businesses.",
  subhead:
    "Start with a paid AI Operating Audit. Leave with a prioritized roadmap, a data-risk assessment, and one practical workflow worth implementing.",
  primaryCta: "Apply for the Founding AI Operating Audit",
  secondaryCta: "See example workflows",
  city: "Charlottesville",
  region: "Charlottesville & Albemarle County, Virginia",
  email: "ben@agentally.co", // placeholder — update when domain email is live
};

export interface Offer {
  slug: string;
  name: string;
  tagline: string;
  foundingPriceCents: number;
  standardPriceCents: number;
  standardPriceNote?: string;
  priceNote: string;
  href: string;
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
    includes: [
      "Fit call to confirm we're the right match before you pay",
      "Structured intake covering tools, workflows, and pain points",
      "90-minute owner/operator interview",
      "Tool and process inventory",
      "AI opportunity map with data-risk ranking",
      "Top 5 use cases scored by impact, effort, and risk",
      "30-day implementation roadmap",
      "Where useful: a small mockup built on dummy or approved non-sensitive data",
    ],
    position: "The starting point for every engagement. No exceptions — judgment before tools.",
  },
  {
    slug: "ai-workflow-quickstart",
    name: "AI Workflow Quickstart",
    tagline: "One workflow, two weeks, working in your business. No custom platform.",
    foundingPriceCents: 350000,
    standardPriceCents: 450000,
    standardPriceNote: "$4,500–$5,000 standard",
    priceNote: "Founding price. Scoped to one workflow from your audit roadmap.",
    href: "/quickstart",
    includes: [
      "One workflow selected from your audit's top use cases",
      "Built and tested in two weeks alongside your team",
      "Human-review checkpoints on anything customer-facing",
      "Written SOP so your team can run it without us",
      "Two weeks of post-launch adjustment",
    ],
    position: "The first implementation step after an audit — one workflow at a time.",
  },
  {
    slug: "command-center-lite",
    name: "Owner Command Center Lite + Operate",
    tagline: "A private, human-reviewed AI workspace for owners ready to go beyond one workflow.",
    foundingPriceCents: 850000,
    standardPriceCents: 1250000,
    priceNote: "Founding setup price. Operate retainer from $1,500/month. Offered after an audit only.",
    href: "/command-center",
    includes: [
      "Private workspace with an approved, non-sensitive document corpus",
      "One or two role-specific assistants (e.g., proposals, internal SOPs)",
      "Workflow dashboard with human-review process built in",
      "Monthly optimization meeting with Ben",
      "Light monitoring and continuous improvement",
    ],
    position:
      "Not the first thing we sell. This is a post-audit path for businesses where the ROI and risk profile justify it.",
  },
];

export interface ExampleWorkflow {
  title: string;
  forWhom: string;
  description: string;
  ownerWin: string;
}

export const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    title: "Proposal assistant",
    forWhom: "Design/build, remodeling, premium trades",
    description:
      "Drafts proposals and estimates from your past projects, pricing rules, and site-visit notes. You review and send — nothing goes out without your eyes on it.",
    ownerWin: "Proposals out in days, not weeks. Fewer deals lost to slow paperwork.",
  },
  {
    title: "Internal SOP assistant",
    forWhom: "Any owner-led team",
    description:
      "Answers your team's repeated questions from an approved set of SOPs, checklists, and policies — so they stop walking into your office for things that are written down.",
    ownerWin: "Fewer interruptions. New hires ramp without shadowing you for a month.",
  },
  {
    title: "Customer inquiry triage drafts",
    forWhom: "High-inquiry-volume services",
    description:
      "Reads incoming inquiries, sorts them by type and urgency, and drafts replies for a human to review and send. No auto-sending. No bot talking to your customers.",
    ownerWin: "Faster, more consistent follow-up without hiring a coordinator.",
  },
  {
    title: "Project handoff checklist generator",
    forWhom: "Design/build, property management",
    description:
      "Turns project details into stage-specific handoff checklists — sales to production, production to close-out — so nothing falls through between teams.",
    ownerWin: "Cleaner handoffs. Fewer 'I thought you told them' moments.",
  },
  {
    title: "Owner weekly priorities digest",
    forWhom: "Owners who are the unofficial COO",
    description:
      "A Monday-morning brief assembled from your approved sources: stalled proposals, follow-up gaps, handoff risks, and the three actions most worth your attention.",
    ownerWin: "You see what matters before the week eats you.",
  },
  {
    title: "Staff onboarding knowledge base",
    forWhom: "Teams of 6–40",
    description:
      "Your scattered training materials organized into a structured, searchable onboarding path — with an assistant that answers new-hire questions from approved content only.",
    ownerWin: "Onboarding stops depending on whoever has time that week.",
  },
  {
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
  "Companies that want autonomous agents making decisions without human review",
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
  "No autonomous decisions — human review is required on anything customer-facing, financial, legal, HR, housing-related, or regulated",
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Why is the audit paid?",
    a: "Because free 'AI assessments' are sales calls in disguise. A paid audit means the work is serious from day one: structured intake, a real owner interview, scored use cases, and a roadmap you can act on with or without us. The $500 implementation credit means the audit effectively pays for half of itself if we proceed together.",
  },
  {
    q: "What does the audit actually produce?",
    a: "A written deliverable: an inventory of your tools and workflows, an AI opportunity map with each use case scored by impact, effort, and risk, a data-risk ranking, your top five use cases, and a 30-day implementation roadmap. Where it helps, we include a small mockup built on dummy or approved non-sensitive data so you can see — not imagine — what a workflow would look like.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. You need to know your business. We translate between how your operation actually runs and what current AI can reliably do. You'll never be handed something your team can't operate.",
  },
  {
    q: "Will this put my data at risk?",
    a: "We take the opposite approach of most AI vendors: we start by ranking your data by sensitivity and explicitly exclude regulated and sensitive data from MVP work. Early workflows are built on dummy data or approved non-sensitive documents. Anything customer-facing gets a human-review step. We'll tell you plainly when something shouldn't be automated yet.",
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
    a: "Yes — that's the standard. Every Quickstart ships with a written SOP, and we build on tools you control. No hostage infrastructure.",
  },
  {
    q: "Are you an agency? Will work be outsourced?",
    a: "No. Agent Ally is founder-led. Ben runs every audit, every interview, and every implementation personally during the founding period. That's why the founding cohort is capped at five clients.",
  },
  {
    q: "What do you charge after the founding period?",
    a: "The audit moves to $1,250, Workflow Quickstarts to $4,500–$5,000, and Command Center Lite setup to $12,500. Founding clients keep their pricing for any engagement started within six months.",
  },
  {
    q: "We're not in Charlottesville. Can we still work with you?",
    a: "The founding cohort is intentionally local — the owner interview and working sessions are better in person. If you're in the broader central-Virginia area, apply anyway and we'll see if it fits.",
  },
];

export const PIPELINE_PUBLIC = [
  { step: "Apply", detail: "Five-minute application. We respond within one business day." },
  { step: "Fit call", detail: "20 minutes, free. We both decide whether the audit makes sense." },
  { step: "Audit", detail: "Paid engagement: intake, owner interview, opportunity map, roadmap." },
  { step: "Implement", detail: "If — and only if — the ROI and risk profile justify it." },
];
