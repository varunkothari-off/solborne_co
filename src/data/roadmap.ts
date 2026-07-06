/**
 * Roadmap catalog — every workflow from docs/master-workflow-catalog.md,
 * organized under that file's category headings. These are NOT bookable
 * services: real capability, not yet staffed with a named expert. The
 * Services page renders them as deliberately lighter-weight entries with
 * no CTA, no pricing, and no links.
 *
 * Blurbs are the catalog one-liners rewritten in brand voice. No
 * capability is described beyond what the source one-liner says.
 */
export interface RoadmapItem {
  name: string;
  blurb: string;
}

export interface RoadmapCategory {
  name: string;
  items: RoadmapItem[];
}

export const roadmap: RoadmapCategory[] = [
  {
    name: 'Research & Diligence',
    items: [
      {
        name: 'Legal research',
        blurb:
          'A citation-backed read on a legal question: the controlling authority, the counter-arguments, and a practical recommendation.',
      },
      {
        name: 'Due diligence',
        blurb:
          'A full review of a company — market, competitors, team, financials, customers, patents, regulatory risk.',
      },
      {
        name: 'Contract review',
        blurb:
          'Clause-by-clause analysis against your playbook, with risk ratings and a prioritized list of issues.',
      },
      {
        name: 'Litigation prep',
        blurb:
          'Complaint summary, counter-arguments, affirmative defenses, and deposition questions in priority order.',
      },
      {
        name: 'Compliance monitor',
        blurb:
          'A standing watch on the regulatory sources that matter to you, with alerts when something material changes.',
      },
      {
        name: 'Customer cube review',
        blurb:
          'Diligence across financial, customer, contract, legal, and HR files, surfacing the risks and the gaps.',
      },
      {
        name: 'Market map',
        blurb:
          'An industry vertical sorted by sub-segment, stage, and funding into one visual map.',
      },
      {
        name: 'Startup market map',
        blurb:
          'A market map the way an investor would draw it: sizing, dynamics, and the diligence questions worth asking.',
      },
      {
        name: 'Product teardown',
        blurb:
          "A product's pricing, features, onboarding, and positioning — captured and analyzed.",
      },
      {
        name: 'Competitive intelligence',
        blurb:
          'Recurring monitoring of competitor launches, pricing, and partnerships.',
      },
      {
        name: 'Intelligence monitor',
        blurb: 'Scheduled monitoring of any topic, entity, or sector you name.',
      },
      {
        name: 'Market research',
        blurb: 'A deep read of macro, industry, company, and customer trends.',
      },
      {
        name: 'Investor sourcing',
        blurb:
          'Best-fit investors, ranked by deal history, check size, and portfolio fit.',
      },
      {
        name: 'Prospect research',
        blurb:
          "Deep profiles on the people you're selling to: decision-makers, history, tech stack.",
      },
      {
        name: 'Website audit',
        blurb: 'A full marketing audit of your site, from a single URL.',
      },
      {
        name: 'Evidence brief',
        blurb:
          'A concise brief on the clinical evidence behind a therapy or intervention.',
      },
      {
        name: 'Medical evidence council',
        blurb:
          'Journal evidence on a health question, compared side by side — including where the experts disagree.',
      },
      {
        name: 'Software adoption',
        blurb: 'Adoption trends across categories, vendors, and company sizes.',
      },
      {
        name: 'Property analysis',
        blurb:
          'Comparable sales, yields, demographics, and an investment score for a property.',
      },
      {
        name: 'Pitch deck screen',
        blurb:
          'A startup deck scored for investor readiness, with the gaps and the diligence questions.',
      },
      {
        name: 'Final pass',
        blurb:
          'An expert-level annotation pass over a document, flagging errors, inconsistencies, and unverified claims.',
      },
    ],
  },
  {
    name: 'Finance & Investment',
    items: [
      {
        name: 'Company comps',
        blurb:
          'A trading-comps table — EV/revenue, EV/EBITDA, P/E, growth, margins — against a peer set.',
      },
      {
        name: 'Three-statement model',
        blurb:
          'A linked financial model with editable assumptions and valuation outputs.',
      },
      {
        name: 'Credit memo',
        blurb:
          'A credit-committee memo covering borrower quality, structure, and downside risk.',
      },
      {
        name: 'CIM review',
        blurb:
          'A first read of a CIM the way a private-equity associate would do it: highlights, returns, red flags, diligence questions.',
      },
      {
        name: 'Loan structuring analysis',
        blurb:
          'Recommended loan terms built from borrower needs, comparables, and downside protections.',
      },
      {
        name: 'Key driver analysis',
        blurb:
          'The fundamentals and factors that actually move a stock, identified plainly.',
      },
      {
        name: 'Pre-earnings / post-earnings brief',
        blurb:
          'Consensus, key metrics, and reaction scenarios around an earnings print.',
      },
      {
        name: 'Equity research council',
        blurb:
          "Analyst reports compared side by side: where opinions converge, and where they don't.",
      },
      {
        name: 'Company tearsheet / initiation report / deep dive',
        blurb: 'Company profiles from one page to institutional depth.',
      },
      {
        name: 'Property acquisition underwriting',
        blurb:
          'Full commercial real estate underwriting: cash flow, returns, debt metrics, and a recommendation.',
      },
      {
        name: 'Real estate IC memo',
        blurb:
          'Commercial real estate diligence turned into an investment-committee-ready memo.',
      },
      {
        name: 'Cash flow and debt capacity analysis',
        blurb:
          'Sustainable debt sized from cash flow, with the downside cases run.',
      },
      {
        name: 'Client portfolio monitoring',
        blurb:
          'Recurring checks on a client portfolio for drift, concentration, and news.',
      },
      {
        name: 'ETF overlap',
        blurb: 'ETF holdings compared for overlap and real diversification.',
      },
      {
        name: 'Sourcing screen',
        blurb: 'Sector scans and deal-sourcing dashboards, private-equity style.',
      },
      {
        name: 'Watchlist monitor',
        blurb:
          'Companies and sectors tracked for material news and corporate actions.',
      },
    ],
  },
  {
    name: 'Legal',
    items: [
      {
        name: 'Draft a contract',
        blurb:
          "A first-draft contract from a term sheet, grounded in your firm's precedent.",
      },
      {
        name: 'Billable hours',
        blurb:
          'Billable hours for a work product, estimated by task and complexity.',
      },
    ],
  },
  {
    name: 'Sales',
    items: [
      {
        name: 'Outreach message',
        blurb: 'Personalized outreach copy for a contact or company list.',
      },
      {
        name: 'Account outreach',
        blurb: 'Research-driven outreach campaigns, automated and run at scale.',
      },
      {
        name: 'Customer demo',
        blurb: 'Demo scripts and talking points tailored to a target account.',
      },
      {
        name: 'Account profiles',
        blurb: 'Company and account research for sales call prep.',
      },
    ],
  },
  {
    name: 'Marketing',
    items: [
      {
        name: 'SEO / keyword research',
        blurb:
          'Search-intent analysis, competitor gaps, and keyword and bid recommendations.',
      },
      {
        name: 'Store optimizer',
        blurb: 'Storefront listing, SEO, and photography improvements.',
      },
      {
        name: 'Brand inspiration',
        blurb: 'Competitor creative, analyzed into an annotated reference deck.',
      },
      {
        name: 'Newsletter / post creator',
        blurb: 'Newsletters and social posts drafted in a voice you define.',
      },
      {
        name: 'Product photos',
        blurb:
          'Product images generated across lighting, angle, and background variants.',
      },
      {
        name: 'Event prep',
        blurb: 'Event brief, landing page, invites, and RSVP management.',
      },
      {
        name: 'Brand reputation',
        blurb:
          'Sentiment and reputation analysis across social, reviews, and news.',
      },
      {
        name: 'Sales prep',
        blurb:
          'A full account profile and call-prep document from a company name.',
      },
    ],
  },
  {
    name: 'Utility & Productivity',
    items: [
      {
        name: 'Prompt refinement',
        blurb: 'An AI prompt, improved for clarity and effectiveness.',
      },
      {
        name: 'Candidate sourcing',
        blurb: 'A hiring rubric and an evidence-backed candidate shortlist.',
      },
      {
        name: 'Message polish',
        blurb: 'Drafts refined for tone and audience.',
      },
      {
        name: 'Background removal',
        blurb: 'Clean background removal from an image.',
      },
      {
        name: 'Website builder',
        blurb:
          'A guided site build from a description, through design and deployment.',
      },
      {
        name: 'Filetype converter',
        blurb: 'A document converted across multiple formats.',
      },
      {
        name: 'Slide creation',
        blurb: 'A research-backed presentation from a topic.',
      },
      {
        name: 'Document summary',
        blurb: 'An exportable summary with the key metrics and takeaways.',
      },
    ],
  },
  {
    name: 'Recruiting',
    items: [
      {
        name: 'Autonomous candidate sourcing',
        blurb:
          'Iterative sourcing, verification, and scoring, with review batches delivered on a schedule.',
      },
    ],
  },
  {
    name: 'Personal Finance',
    items: [
      {
        name: 'Daily finance digest',
        blurb:
          'A personalized daily note on balances, spending, and activity.',
      },
      {
        name: 'Run rate dashboard',
        blurb: 'A live dashboard annualizing your current spending pace.',
      },
      {
        name: 'Cash flow forecast',
        blurb: 'Cash on hand, projected past upcoming bills and income.',
      },
      {
        name: 'Subscription cleanup',
        blurb: 'The forgotten subscriptions worth cancelling, surfaced.',
      },
      {
        name: 'Spending / net worth review',
        blurb:
          'Where the money went this month, and the full asset, debt, and cash picture.',
      },
      {
        name: 'Credit card optimizer',
        blurb: 'The best card for each purchase, to make the most of rewards.',
      },
    ],
  },
  {
    name: 'Careers',
    items: [
      {
        name: 'Career explorer',
        blurb: 'Personalized role, company, and skill-gap recommendations.',
      },
      {
        name: 'Interview prep',
        blurb:
          'Technical, case, and behavioral preparation, specific to the company.',
      },
      {
        name: 'Resume editor / cover letter generator',
        blurb:
          'Recruiter-ready, ATS-aware resume and cover-letter drafting.',
      },
      {
        name: 'Job finder',
        blurb:
          'Personalized job and internship matches, with outreach-ready notes.',
      },
      {
        name: 'Scholarship and fellowship finder',
        blurb: 'Matches with deadlines and eligibility signals.',
      },
    ],
  },
  {
    name: 'Health',
    items: [
      {
        name: 'Health review',
        blurb: 'A comprehensive, actionable overview of your health.',
      },
      {
        name: 'Nutrition planner',
        blurb: 'A meal plan aligned to your goals and your labs.',
      },
      {
        name: 'Lab results interpreter',
        blurb: 'Lab results in plain language, with next steps.',
      },
      {
        name: 'Fitness / sleep coach',
        blurb: 'Personalized workout and recovery guidance.',
      },
    ],
  },
];

/** Total number of roadmap entries (used nowhere critical; handy for checks). */
export const roadmapCount = roadmap.reduce((n, c) => n + c.items.length, 0);
