/**
 * Workflow catalog — every workflow from docs/master-workflow-catalog.md,
 * organized under that file's category headings.
 *
 * Each item is a built, ready-to-run workflow: the system and playbook exist
 * and can be run today, delivered by AI with a human expert review pass on
 * every paid engagement. Items carry a `slug` and a `detail` object, and each
 * renders its own one-pager at /services/<slug>/ via services/[slug].astro.
 *
 * The one gap we're honest about is engagement history, not capability: these
 * specific workflows have no completed paying engagements behind them yet.
 * That is why the live-services catalog (services.ts) still visibly outranks
 * this catalog in styling weight — a documented, deliberate hierarchy.
 *
 * Evidence tiering is load-bearing, not decoration. Every `benefit` carries a
 * `tier` stating how strong the number behind it actually is — a controlled
 * study, an analogous benchmark, a vendor's own figure, or no benchmark at
 * all. Where no honest number exists, we say so on the page rather than
 * inventing one. This keeps the brand's "confidence gets a number, not a
 * shrug" promise honest — and keeps the site inside what's actually true.
 *
 * Blurbs are the catalog one-liners rewritten in brand voice. No capability
 * is described beyond what the source one-liner and the Phase-0 research say.
 *
 * NOTE (spec desync, intentional): docs/master-workflow-catalog.md and
 * docs/architecture-and-api-spec.md still describe this catalog as "roadmap /
 * coming soon / NOT bookable." Those docs are being reconciled separately by
 * the founder and are knowingly out of sync with this file.
 */

/**
 * Evidentiary tier for a quantified benefit. Lower is stronger. This nuance
 * is surfaced to visitors on each one-pager — see evidenceTiers below.
 */
export type EvidenceTier = 1 | 2 | 3 | 4;

export interface EvidenceTierMeta {
  /** Short label shown as a tag on the page. */
  label: string;
  /** One-line plain-language explanation of what this tier means. */
  note: string;
}

/** Human-readable meaning of each tier, rendered on the one-pagers. */
export const evidenceTiers: Record<EvidenceTier, EvidenceTierMeta> = {
  1: {
    label: 'Controlled study or government data',
    note: 'A controlled study or official government data, measuring this task fairly directly. The strongest kind of number.',
  },
  2: {
    label: 'Named source, analogous task',
    note: 'A real, named study or survey — but on an adjacent task, not this one exactly. Read it as an honest approximation, not a promise.',
  },
  3: {
    label: 'Vendor-reported figure',
    note: 'A figure published by a company that sells this capability. Directionally useful, but not independently audited.',
  },
  4: {
    label: 'No established benchmark',
    note: 'No credible public benchmark exists for this task. We say so plainly rather than invent a number that would be the shrug in disguise.',
  },
};

export interface RoadmapBenefit {
  /** The quantified benefit, in brand voice. States the number and its limits. */
  claim: string;
  /** Named source(s) behind the claim. */
  source: string;
  /** How strong the number is. Do not strip — this is the honesty guardrail. */
  tier: EvidenceTier;
}

export interface RoadmapDetail {
  /** What the workflow actually produces. Plain and concrete. */
  whatItDoes: string;
  /** Who it's built for. */
  target: string;
  /** How this work gets done today, without us. */
  currentState: string;
  /** The quantified benefit and its evidentiary tier. */
  benefit: RoadmapBenefit;
}

export interface RoadmapItem {
  name: string;
  blurb: string;
  /** Present when the item has its own one-pager. */
  slug?: string;
  detail?: RoadmapDetail;
}

export interface RoadmapCategory {
  name: string;
  /** Kebab-case anchor/id, used for nav links into the services hub. */
  slug: string;
  /** One goal-framed line, in brand voice, shown wherever the category is
      browsed ("what are you trying to do?" — not internal jargon). */
  description: string;
  items: RoadmapItem[];
}

export const roadmap: RoadmapCategory[] = [
  {
    name: 'Research & Diligence',
    slug: 'research-diligence',
    description:
      'Understand a company, a market, or a question before you act on it.',
    items: [
      {
        name: 'Legal research',
        slug: 'legal-research',
        blurb:
          'A citation-backed read on a legal question: the controlling authority, the counter-arguments, and a practical recommendation.',
        detail: {
          whatItDoes:
            'Takes a specific legal question and returns a memo-style answer: the controlling statute or case law, the strongest counter-arguments opposing counsel would raise, and a practical recommendation — each claim tied to a citation a lawyer can pull and check.',
          target:
            'Solo attorneys and small firms without in-house research staff; in-house counsel fielding one-off questions outside their specialty; founders and operators who need a first-pass read before paying for attorney time.',
          currentState:
            'Manual research in Westlaw or LexisNexis, or AI-assisted platforms like Lexis+ AI and CoCounsel at roughly $300–$500/user/month. Smaller shops often make do with Google Scholar, court sites, and a senior attorney’s memory.',
          benefit: {
            claim:
              'Thomson Reuters’ 2025 Future of Professionals survey found lawyers expect AI to free up roughly 240 hours a year — about five hours a week, worth on the order of $19,000 per professional. Read that as an expectation, not a measured result. And a hard limit worth stating: Stanford RegLab’s peer-reviewed study found leading legal-AI research tools still hallucinated 17–33% of the time, which is exactly why every answer here is built to be citation-checked by a person, not trusted on the model’s word.',
            source:
              'Thomson Reuters 2025 Future of Professionals report; Magesh et al., Journal of Empirical Legal Studies (2025), via Stanford RegLab.',
            tier: 2,
          },
        },
      },
      {
        name: 'Due diligence',
        slug: 'due-diligence',
        blurb:
          'A full review of a company — market, competitors, team, financials, customers, patents, regulatory risk.',
        detail: {
          whatItDoes:
            'Pulls together a structured, cross-functional profile of a target company — market position, competitive landscape, leadership, financial health, customer concentration, IP, and regulatory exposure — into a single risk-flagged narrative rather than a stack of siloed spreadsheets.',
          target:
            'Independent sponsors, search-fund buyers, and lower-middle-market PE firms without a large deal team; corporate development teams weighing bolt-ons; angels and seed/Series A investors doing lightweight diligence before a term sheet.',
          currentState:
            'A mix of advisor-led workstreams, Quality-of-Earnings reports ($10K–$100K+), vendor diligence engagements ($100K–$500K), and data-room platforms like Datasite, Intralinks, and DealRoom.',
          benefit: {
            claim:
              'Half of investment-banking respondents say M&A deals take at least six months to close (SRS Acquiom, 2025), and Deloitte reports AI-assisted document review achieving 20–90% time savings on review tasks. No single public benchmark measures full-company-diligence-report time directly, so these are adjacent figures — the direction is real, the exact number for your deal is not promised.',
            source:
              'SRS Acquiom 2025 M&A Due Diligence Study; Deloitte on AI-assisted review; CapLinked / ABF Journal on VDR diligence timelines.',
            tier: 2,
          },
        },
      },
      {
        name: 'Contract review',
        slug: 'contract-review',
        blurb:
          'Clause-by-clause analysis against your playbook, with risk ratings and a prioritized list of issues.',
        detail: {
          whatItDoes:
            'Reviews a contract clause by clause against your playbook — or a standard market playbook where you have none — flagging deviations, missing protections, and non-standard language, and returns a risk-rated, prioritized issues list. Not a bare redline: an interpreted one.',
          target:
            'Solo attorneys and small firms handling routine commercial paper (NDAs, MSAs, vendor agreements, leases) with no dedicated contracts team; in-house counsel at small and mid-size companies; procurement leads and business owners wanting a first-pass read before signing.',
          currentState:
            'Manual attorney read-and-redline in Word against memory and institutional knowledge; or point tools like LegalOn (~$550/mo/user) and enterprise CLM+AI platforms like Ironclad ($30K–$100K+/yr) that flag issues but still need a lawyer to prioritize; or, for many small businesses, no review at all before signing.',
          benefit: {
            claim:
              'In a controlled 2018 study (LawGeex, with professors from Stanford, Duke, and USC), 20 experienced corporate lawyers and an AI system each reviewed the same five NDAs for the same risks. The AI averaged 94% accuracy in 26 seconds; the lawyers averaged 85% in 92 minutes — a roughly 200× speed gap with no accuracy tradeoff on that document type. Honest caveat: NDAs are relatively standardized, so heavily negotiated agreements (M&A, credit) would show a smaller gain and need more human judgment. Separately, our Phase-0 research (via Clio’s 2025 Legal Trends Report) puts a small-firm contract review at roughly four hours today.',
            source:
              'LawGeex / Stanford / Duke / USC (Feb 2018), via Artificial Lawyer and the World Economic Forum; Clio 2025 Legal Trends Report.',
            tier: 1,
          },
        },
      },
      {
        name: 'Litigation prep',
        slug: 'litigation-prep',
        blurb:
          'Complaint summary, counter-arguments, affirmative defenses, and deposition questions in priority order.',
        detail: {
          whatItDoes:
            'Reads an incoming complaint and produces a working packet: a plain-language summary of the claims, likely counter-arguments and available affirmative defenses, and a prioritized set of deposition questions ranked by likely evidentiary value.',
          target:
            'Litigation associates and solo/small-firm litigators in employment, commercial, or personal-injury matters; in-house litigation counsel managing outside counsel; small firms without a dedicated e-discovery function.',
          currentState:
            'Manual associate and paralegal work reading the complaint, researching defenses, and drafting outlines — billed hourly — supported by platforms like Relativity ($20K–$100K+/yr) and Everlaw (~$2K–$5K/mo).',
          benefit: {
            claim:
              'Fisher Phillips, a 500-lawyer labor-and-employment firm, reported that CoCounsel produced in five minutes an analysis that would otherwise take an associate five hours — roughly a 60× gap, per an ABA Journal case study. There’s no public benchmark for complaint-to-deposition-questions specifically, so treat this as the closest real-world analog, not a measurement of this exact task.',
            source:
              'ABA Journal on Fisher Phillips / CoCounsel; BLS Occupational Employment and Wage Statistics (Paralegals, May 2024).',
            tier: 2,
          },
        },
      },
      {
        name: 'Compliance monitor',
        slug: 'compliance-monitor',
        blurb:
          'A standing watch on the regulatory sources that matter to you, with alerts when something material changes.',
        detail: {
          whatItDoes:
            'Keeps a continuous watch on the specific regulators, agencies, and rulebooks that touch your business, and alerts you when something material changes — instead of staff manually checking agency sites and bulletins on rotation.',
          target:
            'Compliance and risk teams at small and mid-size banks, credit unions, broker-dealers, insurers, fintechs, and asset managers who need coverage but can’t justify a dedicated regulatory-affairs hire; general counsel at regulated companies without a compliance department.',
          currentState:
            'Manual tracking — staff monitoring agency websites and bulletins — supplemented by enterprise tools like Thomson Reuters Regulatory Intelligence or Ascent RegTech, roughly $15K–$25K/user/year.',
          benefit: {
            claim:
              'Thomson Reuters’ 2023 Cost of Compliance Report (350+ practitioners) found 62% of compliance staff spend 1–7 hours a week just tracking regulatory change, rising to 8–10+ hours at the largest banks. The downside is documented too: Bank of Ireland’s UK arm was fined £3.7M in 2025 after missing an implementation deadline. These size the manual burden; no public study isolates the before/after of an AI monitoring layer specifically.',
            source:
              'Thomson Reuters 2023 Cost of Compliance Report; fintech.global; Compliance and Risks.',
            tier: 2,
          },
        },
      },
      {
        name: 'Customer cube review',
        slug: 'customer-cube-review',
        blurb:
          'Diligence across financial, customer, contract, legal, and HR files, surfacing the risks and the gaps.',
        detail: {
          whatItDoes:
            'Works through the full data-room folder structure — financial, customer, contract, legal, and HR — and surfaces both the risks (change-of-control clauses, customer concentration, missing signatures) and the gaps (missing documents, unanswered diligence questions).',
          target:
            'PE associates and VPs running deal diligence on lower-middle-market targets; corporate development and M&A teams at strategic acquirers; independent sponsors and buy-side advisors without a large analyst bench.',
          currentState:
            'Manual review by deal-team analysts working folder by folder through a data room against a checklist — hosted on Datasite, Intralinks, or DealRoom, but read and flagged by hand; larger firms sometimes add contract-review AI for the contracts subfolder.',
          benefit: {
            claim:
              'The clearest precedent is JPMorgan’s COIN platform, reported to eliminate an estimated 360,000 hours a year previously spent interpreting commercial loan agreements (Bloomberg, 2017). A vendor in the space, DealRoom AI, claims up to 80% reduction in contract-review time — that one is vendor-reported, not independently verified. Both are single-category analogs; no independent benchmark covers a full multi-category cube review.',
            source:
              'Bloomberg / ABA Journal on JPMorgan COIN (2017); V7 Labs; DealRoom AI (vendor-reported).',
            tier: 2,
          },
        },
      },
      {
        name: 'Market map',
        slug: 'market-map',
        blurb:
          'An industry vertical sorted by sub-segment, stage, and funding into one visual map.',
        detail: {
          whatItDoes:
            'Takes a defined industry vertical and sorts every notable company in it into a single visual grid — by sub-segment, stage, and funding raised — so someone new to the space can see the whole landscape at a glance.',
          target:
            'Corporate strategy and biz-dev teams scoping a new market; consultants building a landscape slide; corp-dev teams doing sector scans; founders orienting before a raise; small VC/PE teams without a research function.',
          currentState:
            'Built by hand by analysts using CB Insights or PitchBook’s market-map tooling, cross-referenced with Crunchbase, and assembled in PowerPoint or Figma.',
          benefit: {
            claim:
              'We’ll be plain: no public benchmark exists for hours-to-build-one-market-map — nobody publishes a time-per-map figure. What the market does tell us is the standing cost of the tooling: CB Insights runs roughly $50K–$85K+/year and PitchBook’s equivalent $12K–$70K+/year. That prices the capability as a five-to-six-figure annual line item, not a clean per-map hour count.',
            source:
              'CB Insights and PitchBook market-map tooling; Vendr pricing data.',
            tier: 4,
          },
        },
      },
      {
        name: 'Startup market map',
        slug: 'startup-market-map',
        blurb:
          'A market map the way an investor would draw it: sizing, dynamics, and the diligence questions worth asking.',
        detail: {
          whatItDoes:
            'Produces the same sub-segment/stage/funding map, but framed for an investment decision — adding market sizing, competitive dynamics, and a generated list of the specific diligence questions an investor would want answered.',
          target:
            'VC associates and analysts at seed and Series A funds doing thesis-driven sourcing; angels and scout networks; corporate VC teams; solo GPs and small funds without a research analyst.',
          currentState:
            'Associates build thematic maps and run TAM/SAM/SOM sizing by hand, using PitchBook (median ~$30K/yr) and Crunchbase Pro (~$588/yr/seat) stitched together with manual web research.',
          benefit: {
            claim:
              'No controlled study measures hours-saved-per-market-map for VC associates. The closest real, cited figure is Bessemer Venture Partners reclaiming a reported 234 hours per analyst after building AI into its workflow — an analogous benchmark (AI-assisted diligence broadly, not market-mapping alone), flagged as approximate.',
            source:
              'Bessemer Venture Partners AI roadmap and State of AI 2025; Affinity on VC diligence.',
            tier: 2,
          },
        },
      },
      {
        name: 'Product teardown',
        slug: 'product-teardown',
        blurb:
          "A product's pricing, features, onboarding, and positioning — captured and analyzed.",
        detail: {
          whatItDoes:
            'Walks systematically through a competitor’s or partner’s product — pricing tiers, feature set, signup and onboarding flow, positioning and messaging — and documents each with analysis attached, rather than a raw screenshot dump.',
          target:
            'Product marketers and PMs at B2B SaaS companies prepping a competitive launch or renewal push; founders doing pre-launch positioning; VCs assessing a portfolio company’s competitive set.',
          currentState:
            'Done by hand by product marketers signing up for trials and building decks; supplemented by competitive-intelligence platforms like Klue ($15K–$40K+/yr) or Crayon, and research vendors like Sacra.',
          benefit: {
            claim:
              'No controlled study benchmarks hours-per-teardown. The closest figure — from Kompyte, a company that sells CI software — puts manual competitive-intelligence work at 15–20 hours a week without a tool versus 2–4 with one, an 80–85% reduction. That’s a vendor’s number on a broader workload, not one teardown; read it as directional.',
            source:
              'Kompyte (vendor-reported); Klue and Sacra pricing.',
            tier: 3,
          },
        },
      },
      {
        name: 'Competitive intelligence',
        slug: 'competitive-intelligence',
        blurb:
          'Recurring monitoring of competitor launches, pricing, and partnerships.',
        detail: {
          whatItDoes:
            'Runs an ongoing watch on a defined set of competitors, surfacing new product launches, pricing changes, and partnership announcements as they happen.',
          target:
            'B2B SaaS sales and product-marketing teams with three or more direct competitors; revenue and GTM leaders who need battlecards kept current; smaller companies that can’t justify a dedicated CI hire.',
          currentState:
            'Dedicated CI software — Klue, Crayon, Kompyte — run by teams with headcount to manage them ($15K–$40K+/yr); or manual tracking via Google Alerts, newsletters, and periodic site checks.',
          benefit: {
            claim:
              'Crayon’s 2022 State of Competitive Intelligence report (1,200+ practitioners) found CI teams spend 14% less time on research and 15% more on activation than in 2018. Crayon also estimates weak competitive readiness costs firms $2–10M a year in lost deals — but that figure is Crayon’s own, and Crayon sells CI software, so treat the dollar number as vendor-sourced.',
            source:
              'Crayon 2022 State of Competitive Intelligence (vendor-reported); SCIP.',
            tier: 3,
          },
        },
      },
      {
        name: 'Intelligence monitor',
        slug: 'intelligence-monitor',
        blurb: 'Scheduled monitoring of any topic, entity, or sector you name.',
        detail: {
          whatItDoes:
            'Lets you name any topic, company, person, or sector and receive scheduled updates when something relevant happens — news, filings, mentions, site changes.',
          target:
            'Corp-dev teams tracking acquisition targets; policy and regulatory-affairs teams tracking a regulator or bill; journalists and analysts tracking a beat; investors tracking a sector.',
          currentState:
            'Google Alerts remains the free default for individuals; mid-market teams step up to Mention or Brand24; enterprises use Meltwater (~$25K/yr median).',
          benefit: {
            claim:
              'No independent study benchmarks hours saved on topic monitoring. A directly relevant but vendor-reported data point: the monitoring tool Syften reports AI-powered monitoring cutting a team’s daily monitoring from about three hours to roughly ten minutes. The broader media-monitoring market was valued near $5.4–5.9B in 2024/25 — context on the category’s size, not a savings figure for you.',
            source:
              'Syften (vendor-reported); Grand View Research and Mordor Intelligence market sizing.',
            tier: 3,
          },
        },
      },
      {
        name: 'Market research',
        slug: 'market-research',
        blurb: 'A deep read of macro, industry, company, and customer trends.',
        detail: {
          whatItDoes:
            'Synthesizes macro indicators, industry dynamics, company-specific signals, and customer trends into a single structured read.',
          target:
            'Founders and strategy leads evaluating a new market; corporate strategy and corp-dev teams doing pre-diligence sizing; boutique consultants and VCs needing a fast first read.',
          currentState:
            'Manual synthesis from Statista, IBISWorld, government data, and news; or commissioned research from Nielsen, Forrester, Gartner, or independent agencies. Custom projects typically run $25K–$65K; a single ~400-response survey costs $5K–$15K.',
          benefit: {
            claim:
              'No benchmark compares AI-assisted synthesis to commissioned research like-for-like — the deliverables genuinely differ. What we can cite directly is the cost of the commissioned alternative: $25K–$65K and weeks to months per project, against a global market-research industry valued at over $150B (ESOMAR, 2024). The saving is real in direction; the exact figure depends on what you’d otherwise have bought.',
            source:
              'Drive Research on market-research costs; ESOMAR Global Market Research 2025.',
            tier: 2,
          },
        },
      },
      {
        name: 'Investor sourcing',
        slug: 'investor-sourcing',
        blurb:
          'Best-fit investors, ranked by deal history, check size, and portfolio fit.',
        detail: {
          whatItDoes:
            'Builds and ranks a target list of investors on fit signals — deal activity, typical check size, stage focus, and portfolio overlap or conflicts.',
          target:
            'Pre-seed to Series A founders running their own raise; solo-GP and small-fund managers building co-investor pipelines; accelerator participants doing list-building at scale.',
          currentState:
            'Manual research across Crunchbase (~$49/mo Pro), PitchBook (five-figure contracts), and Affinity CRM; founders without database tools report 15–25 hours a week on investor research during an active raise.',
          benefit: {
            claim:
              'DocSend’s fundraising data shows founders typically contact 20–30+ investors to secure 30–60 meaningful meetings, at a 5–10% meeting-to-commitment rate, over a raise averaging ~115 days. Industry commentary suggests a good investor database cuts research time from 15–25 hours a week to 3–8 — directional, not from a peer-reviewed study.',
            source:
              'DocSend Startup Fundraising Survey; Affinity, “The VC Tech Stack.”',
            tier: 2,
          },
        },
      },
      {
        name: 'Prospect research',
        slug: 'prospect-research',
        blurb:
          "Deep profiles on the people you're selling to: decision-makers, history, tech stack.",
        detail: {
          whatItDoes:
            'Compiles a working profile on a target account and its decision-makers — roles, background, recent moves, tech stack, trigger events — condensing what a rep would otherwise dig up across many sources into one brief.',
          target:
            'B2B SDRs, BDRs, and account executives at SaaS and services companies; sales managers standardizing pre-call prep; founders doing their own outbound before hiring a sales team.',
          currentState:
            'Manual research across LinkedIn Sales Navigator and news, supplemented by data platforms like ZoomInfo, Apollo.io, Clearbit, and Cognism.',
          benefit: {
            claim:
              'Salesforce’s State of Sales research finds reps spend only about 28–30% of the week actually selling, with research eating roughly 15% of it — and top reps spend 5–6 hours a week on account research alone. No controlled study isolates the ROI of an AI research brief specifically, so this is reasoned from real time-allocation data, not a direct measurement.',
            source:
              'Salesforce State of Sales research and 2026 sales statistics.',
            tier: 2,
          },
        },
      },
      {
        name: 'Website audit',
        slug: 'website-audit',
        blurb: 'A full marketing audit of your site, from a single URL.',
        detail: {
          whatItDoes:
            'Takes a single URL and produces a marketing-oriented audit — SEO health, content and messaging gaps, technical issues, competitive positioning — in one pass.',
          target:
            'Small-business owners and solo marketers without in-house SEO expertise; marketing consultants needing a fast first-pass audit; in-house teams wanting a quarterly health check without hiring an agency.',
          currentState:
            'Point tools like SEMrush (~$140/mo), Ahrefs (~$129/mo), HubSpot’s free Website Grader, and Screaming Frog — each covering one slice and needing a human to interpret; or hiring an agency or consultant.',
          benefit: {
            claim:
              'Agency and freelance SEO audits typically run $500–$15,000, with a standard audit for a ~200-page site at $2,000–$6,000 and hourly rates of $60–$200. No public figure states how many consultant-hours a manual audit takes; reasoning from the pricing implies roughly 10–40 hours — an approximation from cost data, not a measured benchmark.',
            source:
              'SEOprofy and AgencyAnalytics SEO-audit pricing.',
            tier: 2,
          },
        },
      },
      {
        name: 'Evidence brief',
        slug: 'evidence-brief',
        blurb:
          'A concise brief on the clinical evidence behind a therapy or intervention.',
        detail: {
          whatItDoes:
            'Pulls together published clinical evidence on a specific therapy or intervention — key trials, effect sizes, quality of evidence — into a short, readable brief. A fast first pass ahead of a formal systematic review, not a replacement for one.',
          target:
            'Clinicians and hospital committees needing a quick evidence check before a treatment decision; medical-affairs and HEOR teams; academic researchers scoping a topic; policy and health-tech analysts.',
          currentState:
            'Manual PubMed/Embase searches cross-checked against point-of-care tools like UpToDate or formal Cochrane reviews; increasingly supplemented by AI literature tools like Elicit and Consensus.',
          benefit: {
            claim:
              'A full systematic review is heavy — a median of 67.3 weeks end-to-end and roughly 1,110 person-hours (Borah et al., BMJ Open, 2017). A brief is lighter and not a substitute, so no benchmark compares the two. As an analog: Elicit reports its AI screening can cut screening time 70–80% versus manual, with extraction accuracy (81.4%) statistically comparable to human reviewers (86.7%) in a peer-reviewed proof-of-concept.',
            source:
              'Borah et al., BMJ Open 2017; Elicit comparison study (PMC).',
            tier: 2,
          },
        },
      },
      {
        name: 'Medical evidence council',
        slug: 'medical-evidence-council',
        blurb:
          'Journal evidence on a health question, compared side by side — including where the experts disagree.',
        detail: {
          whatItDoes:
            'Takes a health question where the published literature is genuinely split, pulls the relevant studies, and lays out where they agree, where they conflict, and why — surfacing the methodological differences rather than collapsing everything into one averaged answer. A side-by-side of the disagreement, not a single recommendation.',
          target:
            'Clinicians and researchers weighing a decision where guidelines are silent or contested; health journalists and policy staffers; medical-affairs teams; informed patients facing a treatment choice amid conflicting coverage.',
          currentState:
            'Formal systematic reviews using Cochrane and GRADE methodology. Clinicians read journals ~4.4 hours a week and fully read only 37% of the articles they open. Most AI tools synthesize to a single answer; only Consensus.app’s “Consensus Meter” explicitly visualizes disagreement.',
          benefit: {
            claim:
              'There’s no public benchmark for “time to compare conflicting studies side by side” as a discrete task — we’ll say that plainly. For context: full systematic reviews take a mean of 67.3 weeks and an estimated $141,195 each, ML-assisted screening cuts labor 45–74% with comparable recall, and 70% of physicians report feeling overwhelmed by literature volume. These are directional analogs, not a measurement of this task.',
            source:
              'Cochrane Handbook; Borah et al., BMJ Open 2017; Michelson & Reuter 2019; Marshall et al. 2025; Consensus.app.',
            tier: 2,
          },
        },
      },
      {
        name: 'Software adoption',
        slug: 'software-adoption',
        blurb: 'Adoption trends across categories, vendors, and company sizes.',
        detail: {
          whatItDoes:
            'Answers “who’s actually winning in this software category, and at what size of company,” pulling adoption and sentiment signals across vendors, categories, and company-size segments.',
          target:
            'IT and procurement leads and heads of operations evaluating a new software category; SaaS founders doing competitive positioning; VCs assessing a vendor’s market position.',
          currentState:
            'Manually cross-referencing G2 Grid reports and Gartner Peer Insights, then consulting SaaS-management platforms like Zylo or Productiv. Capterra’s 2026 report found 60% of buyers regret a purchase made in the last 12–18 months.',
          benefit: {
            claim:
              'No published benchmark exists for time or cost saved researching software-adoption trends — stated plainly. What is documented: Zylo’s 2025 index found companies waste an average of $21M a year on unused licenses, and Capterra found buyers who skip structured research are about twice as likely to regret the purchase. Those are the stakes, not a measured saving.',
            source:
              'G2 methodology; Zylo 2025 SaaS Management Index; Capterra 2026 Software Buying Trends.',
            tier: 4,
          },
        },
      },
      {
        name: 'Property analysis',
        slug: 'property-analysis',
        blurb:
          'Comparable sales, yields, demographics, and an investment score for a property.',
        detail: {
          whatItDoes:
            'Pulls comparable sales, rental-yield estimates, and neighborhood demographics for a specific property, then rolls them into a single investment score.',
          target:
            'Individual real-estate investors and small syndicates evaluating rentals or flips; brokerages and property managers screening acquisitions; family offices without a research team.',
          currentState:
            'A mix of point tools — Zillow’s Zestimate, CoStar, Reonomy (from $500/mo), DealCheck ($10–$20/mo), Mashvisor ($50–$100/mo); or a licensed appraiser, at an average $314–$424 for a residential appraisal.',
          benefit: {
            claim:
              'No credible published benchmark exists for the time to build a full comp-plus-yield-plus-demographics-plus-score package — we’ll say so rather than guess. For rough context only: commercial loan underwriting broadly runs 1–4 weeks per deal, and a property appraiser’s time is worth a median $65,420 a year (~$31/hour, BLS 2024) — a wage anchor, not a task-time figure.',
            source:
              'BLS Occupational Outlook (Appraisers, May 2024); Blooma on underwriting timelines; Angi appraisal-cost data.',
            tier: 4,
          },
        },
      },
      {
        name: 'Pitch deck screen',
        slug: 'pitch-deck-screen',
        blurb:
          'A startup deck scored for investor readiness, with the gaps and the diligence questions.',
        detail: {
          whatItDoes:
            'Reads a pitch deck the way a VC associate would on first pass — scoring it against what investors actually look for, then producing the specific gaps and diligence questions a partner would raise.',
          target:
            'Pre-seed to Series A founders preparing to raise without a dedicated advisor; accelerator programs screening cohorts; angels and micro-VC associates doing first-pass triage.',
          currentState:
            'Mostly manual and extremely fast on the investor side. A 2015 DocSend/HBS study found investors spend an average of 3 minutes 44 seconds per deck, with only 58% viewed to completion — and 2023 data shows that time has fallen further.',
          benefit: {
            claim:
              'A rigorous structured read does, deliberately, what an investor renders a verdict on in under four minutes — the 2015 DocSend/HBS figure, over a decade old and from a small, self-acknowledged non-representative sample, but directionally reaffirmed since. One thing we won’t repeat: the widely circulated “VCs review ~3,000 decks a year and fund ~9” claim traces only to an uncorroborated blog post, so it isn’t cited here.',
            source:
              'TechCrunch on the 2015 DocSend/HBS study; DocSend Mid-Year 2023 analysis.',
            tier: 2,
          },
        },
      },
      {
        name: 'Final pass',
        slug: 'final-pass',
        blurb:
          'An expert-level annotation pass over a document, flagging errors, inconsistencies, and unverified claims.',
        detail: {
          whatItDoes:
            'Runs a close, adversarial read over a finished document — checking internal consistency, flagging unbacked claims, catching factual errors. The job a professional copyeditor or fact-checker does before publication, not a grammar pass.',
          target:
            'Consulting and research teams finalizing a client deliverable; comms and PR teams before a report goes out; authors, journalists, and academics finalizing a manuscript; any small team without an in-house editorial function.',
          currentState:
            'Freelance copyeditors, proofreaders, and fact-checkers. The 2026 EFA rate chart lists copyediting at $40–$75/hour and fact-checking at $50–$60/hour, with a benchmark throughput of 25 pages/hour.',
          benefit: {
            claim:
              'At 25 pages an hour and $50–$60/hour, professionally fact-checking a 50-page report costs roughly $100–$120 and two hours — a real, EFA-sourced anchor. On error rates there’s no study specific to business reports, so we cite analogous academic work (citation-error rates of 14.5% in medical research, 11–41% across other fields) only as illustration, not as your number.',
            source:
              'EFA 2026 Rate Chart; Mogull, PLOS ONE 2017.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Finance & Investment',
    slug: 'finance-investment',
    description:
      'Build the models, memos, and monitoring that deal and investment work runs on.',
    items: [
      {
        name: 'Company comps',
        slug: 'company-comps',
        blurb:
          'A trading-comps table — EV/revenue, EV/EBITDA, P/E, growth, margins — against a peer set.',
        detail: {
          whatItDoes:
            'Builds a public trading-comparables table against a defined peer set, pulling and normalizing EV/revenue, EV/EBITDA, P/E, growth, and margins into one ranked view — with the peer set and metric choices reasoned through, not pulled off a generic screener.',
          target:
            'Equity research and investment-banking analysts, corporate development teams benchmarking their own company, and independent valuation consultants who need a defensible peer set without a full terminal subscription.',
          currentState:
            'Built in Excel via a data-terminal plugin. A Bloomberg Terminal runs ~$32K/year per seat; S&P Capital IQ has a ~$53K/year median; PitchBook runs $12K–$30K/user/year.',
          benefit: {
            claim:
              'No study measures hours-to-build-one-comps-table in isolation. As an analog: bankers average 77.7 hours a week (Wall Street Oasis 2022 survey), Wall Street Prep estimates 20–30 hours to learn basic comps modeling (learning time, not production time), and BLS puts the median financial-analyst wage at $101,350 (~$49/hour, 2024). Adjacent anchors, not a task timer.',
            source:
              'Wall Street Oasis 2022 IB survey; Wall Street Prep; BLS OOH (Financial Analysts).',
            tier: 2,
          },
        },
      },
      {
        name: 'Three-statement model',
        slug: 'three-statement-model',
        blurb:
          'A linked financial model with editable assumptions and valuation outputs.',
        detail: {
          whatItDoes:
            'Constructs an integrated income statement, balance sheet, and cash-flow model — properly linked, with editable assumption cells and valuation outputs (DCF and/or multiples) that update when assumptions change.',
          target:
            'Investment-banking analysts, mid-size-company FP&A teams, corporate development groups, and PE or growth-equity associates who need a working model, not a static valuation slide.',
          currentState:
            'Built by hand in Excel; historicals pulled from 10-Ks or FactSet/Capital IQ plug-ins, then hand-linked. Wall Street Prep describes it as “hours of meticulous, manual work.” No dominant point-and-click tool replaces this, even at large banks.',
          benefit: {
            claim:
              'No independent study measures build-time-per-model. The closest proxies are training benchmarks, not production timers: the 77.7-hour average IB workweek (Wall Street Oasis 2022) and Wall Street Prep’s course durations (20–30 hours basic, 70–90 for the full package). Directional only.',
            source:
              'Wall Street Prep; Wall Street Oasis 2022 IB survey; BLS OOH (Financial Analysts).',
            tier: 2,
          },
        },
      },
      {
        name: 'Credit memo',
        slug: 'credit-memo',
        blurb:
          'A credit-committee memo covering borrower quality, structure, and downside risk.',
        detail: {
          whatItDoes:
            'Produces a credit-committee-ready memo assessing a borrower’s credit quality, the proposed deal structure, and downside/stress scenarios — the document a bank’s committee reviews to approve or decline a commercial loan.',
          target:
            'Commercial credit analysts and underwriters at community and regional banks, credit unions, and non-bank lenders; boutique lenders without a dedicated credit-writing team.',
          currentState:
            'Written by hand by credit analysts, often on loan-origination platforms like nCino or Moody’s CreditLens; community banks frequently run legacy systems. End-to-end underwriting runs 3–4 weeks for conventional loans, 4–8 for SBA.',
          benefit: {
            claim:
              'No independent study quantifies hours-per-credit-memo. The figures that exist are the vendor’s own: nCino publicizes up to 80% faster loan origination and an AI review agent cutting credit-review time 60–70% — nCino sells this exact software, so treat it as vendor-reported. For a neutral anchor, BLS puts the median loan-officer wage at $74,180 (2024).',
            source:
              'nCino (vendor-reported); Federal Reserve Small Business Credit Survey; BLS OOH (Loan Officers).',
            tier: 3,
          },
        },
      },
      {
        name: 'CIM review',
        slug: 'cim-review',
        blurb:
          'A first read of a CIM the way a private-equity associate would do it: highlights, returns, red flags, diligence questions.',
        detail: {
          whatItDoes:
            'Reads a Confidential Information Memorandum the way a PE associate does on first pass — pulling highlights, running a quick returns sanity-check, flagging red flags, and drafting the diligence questions that would go back to the banker or management.',
          target:
            'PE associates and analysts at buyout and growth funds, independent sponsors, search-fund operators, and corporate development teams screening targets.',
          currentState:
            'Almost entirely manual — no mainstream tool automates the first read. Deal-flow platforms like DealCloud track the pipeline, not the substance; the review is still an analyst opening a PDF and building notes in Excel and Word.',
          benefit: {
            claim:
              'No formal study quantifies CIM-review time. As a forum-sourced analog (not a study): Wall Street Oasis threads suggest a first high-level read and model takes roughly 1–3 hours, with associates at active shops working 60–80-hour weeks and reviewing on the order of 100 opportunities for every one or two that close. Directional, and labeled as such.',
            source:
              'DealCloud/Intapp pricing; Dealroom PE funnel statistics; Wall Street Oasis forum discussion.',
            tier: 2,
          },
        },
      },
      {
        name: 'Loan structuring analysis',
        slug: 'loan-structuring-analysis',
        blurb:
          'Recommended loan terms built from borrower needs, comparables, and downside protections.',
        detail: {
          whatItDoes:
            'Recommends concrete loan terms — rate, covenants, collateral, amortization — built from the borrower’s actual needs, comparable deal structures, and downside protections.',
          target:
            'Commercial and business bank loan officers and credit analysts at community and regional banks, CRE lenders, and non-bank lenders structuring deals for small-to-midsize borrowers.',
          currentState:
            'Built in Excel using DSCR/LTV/debt-yield calculations against regulatory guidance. Larger institutions use nCino or Moody’s CreditLens; community banks often run legacy platforms.',
          benefit: {
            claim:
              'No independent study measures hours-per-loan-structured. As an analog, standard business loans take 2–8 weeks end-to-end, with the credit-review sub-step alone at 24–72 hours for non-complex loans. Vendors (V7 Labs, Blooma) claim AI-assisted underwriting cutting data extraction from 30–40 minutes to 1–3 — their numbers, not independently verified.',
            source:
              'Ramp on underwriting timelines; nCino adoption data; V7 Labs and Blooma (vendor-reported); BLS OOH (Loan Officers).',
            tier: 3,
          },
        },
      },
      {
        name: 'Key driver analysis',
        slug: 'key-driver-analysis',
        blurb:
          'The fundamentals and factors that actually move a stock, identified plainly.',
        detail: {
          whatItDoes:
            'Identifies, in plain language, the fundamental factors that actually move a given stock — the specific revenue lines, margin drivers, or macro sensitivities that matter — instead of a generic “risks and opportunities” list.',
          target:
            'Sell-side and buy-side equity research analysts and associates, independent research shops, and sophisticated individual investors who want analyst-grade reasoning without a full research subscription.',
          currentState:
            'No dedicated software category exists; this is built by hand in Excel through ratio and sensitivity work on terminal feeds, usually folded into building or maintaining a coverage model.',
          benefit: {
            claim:
              'No benchmark exists for hours spent isolating key drivers as a standalone task — it’s normally bundled into general model and report time, and we’ll say so. As an analog: equity research analysts typically work 55–60-hour weeks, rising to 70–80 in earnings season, at a median wage of $101,350 (BLS 2024).',
            source:
              'Mergers & Inquisitions on equity research; BLS OOH (Financial Analysts).',
            tier: 2,
          },
        },
      },
      {
        name: 'Pre-earnings / post-earnings brief',
        slug: 'earnings-brief',
        blurb:
          'Consensus, key metrics, and reaction scenarios around an earnings print.',
        detail: {
          whatItDoes:
            'Compiles Street consensus, the key metrics that matter for a given name, and plausible stock-reaction scenarios around an earnings release — before the print to frame expectations, after it to interpret the reaction.',
          target:
            'Buy-side portfolio analysts, sell-side associates managing a coverage list through earnings season, and independent investors tracking a concentrated set of positions.',
          currentState:
            'Built from consensus-aggregation platforms like Visible Alpha and Estimize layered on a terminal — Bloomberg (~$32K/yr) or FactSet ($4K–$50K+/user/yr).',
          benefit: {
            claim:
              'No direct per-report hours figure exists. As an analog: earnings season compresses analysts into 70–80-hour weeks, and the average S&P 500 stock carries ~25.6 sell-side ratings, so even one “consensus” view means reconciling dozens of estimates by hand. Academic work on Estimize found combined consensus more accurate than traditional consensus 60–64% of the time.',
            source:
              'Visible Alpha (S&P Global); Estimize accuracy research; FactSet Earnings Insight.',
            tier: 2,
          },
        },
      },
      {
        name: 'Equity research council',
        slug: 'equity-research-council',
        blurb:
          "Analyst reports compared side by side: where opinions converge, and where they don't.",
        detail: {
          whatItDoes:
            'Places multiple sell-side reports on the same stock side by side and surfaces where the views converge and where they genuinely diverge — on estimates, thesis, or risk factors.',
          target:
            'Buy-side analysts and PMs who need a synthesized cross-broker view, corporate IR teams watching how the Street sees their stock, and independent investors without a full sell-side distribution list.',
          currentState:
            'Done by hand, or via aggregation platforms like AlphaSense (which acquired Tegus in 2024), at $10K–$20K per seat/year and $50K–$100K+ enterprise deals.',
          benefit: {
            claim:
              'No study benchmarks time saved comparing analyst reports manually versus via an aggregator. The clearest evidence for the value of aggregating views: Estimize research found ~70% of companies beat traditional Wall Street consensus but only ~50% beat the more accurate crowd-consensus — evidence a single-source consensus embeds real distortion. An argument for breadth, not a time saving for you.',
            source:
              'AlphaSense/Tegus (PRNewswire, 2024); Estimize crowd-vs-consensus research.',
            tier: 2,
          },
        },
      },
      {
        name: 'Company tearsheet / initiation report / deep dive',
        slug: 'company-tearsheet',
        blurb: 'Company profiles from one page to institutional depth.',
        detail: {
          whatItDoes:
            'Produces a company profile at whatever depth is needed — a one-page tearsheet for a quick screen, or a full institutional-grade initiation report with thesis, model, and risk discussion — from the same underlying research.',
          target:
            'Sell-side research boutiques, buy-side and hedge-fund analysts building coverage, corporate access and IR teams, and independent research shops competing on turnaround.',
          currentState:
            'Built by hand in Excel/Word/PowerPoint from Bloomberg, FactSet, or Capital IQ data. Industry commentary describes tearsheets as “assembled by hand from scratch under time pressure by the most junior person on the team,” and ~80% of asset managers reportedly outsource part of their research workflow.',
          benefit: {
            claim:
              'Initiation reports commonly run 50–100+ pages and take months to build the underlying model; during initiation or earnings season, analysts work 60–80-hour weeks against a median wage of $101,350 (~$49/hour, BLS 2024). No independent study gives a precise hours-per-tearsheet figure — these are the surrounding anchors.',
            source:
              'V7 Labs on tear sheets; Magistral Consulting; BLS OOH (Financial Analysts).',
            tier: 2,
          },
        },
      },
      {
        name: 'Property acquisition underwriting',
        slug: 'property-acquisition-underwriting',
        blurb:
          'Full commercial real estate underwriting: cash flow, returns, debt metrics, and a recommendation.',
        detail: {
          whatItDoes:
            'Runs a full commercial-real-estate underwriting workup on a prospective acquisition — pro forma cash flows, return metrics (IRR, equity multiple, cap rate), debt metrics (DSCR, LTV), and a go/no-go recommendation.',
          target:
            'Acquisitions and asset-management teams at real-estate PE funds and REITs, private owner-operators, and CRE lenders evaluating collateral.',
          currentState:
            'Built in Argus Enterprise plus Excel pro formas, with comps from CoStar (~$15K/yr) and Real Capital Analytics or PitchBook.',
          benefit: {
            claim:
              'The full CRE underwriting cycle typically takes 1–4 weeks for a straightforward deal, with analysts spending up to 8 hours per deal on data collection alone. Vendors claim AI compresses a 2–5-day analysis to hours, and one offshore-analyst provider reports a client cutting costs 40% while tripling output — both vendor case studies, not audited, and flagged as such.',
            source:
              'Blooma on underwriting timelines; CoStar pricing; Gallagher & Mohan (vendor case study).',
            tier: 3,
          },
        },
      },
      {
        name: 'Real estate IC memo',
        slug: 'real-estate-ic-memo',
        blurb:
          'Commercial real estate diligence turned into an investment-committee-ready memo.',
        detail: {
          whatItDoes:
            'Converts the full body of CRE diligence — financials, market comps, property condition, sponsor track record — into an investment-committee-ready memo in the firm’s standard template.',
          target:
            'Deal teams at real-estate PE funds, REIT acquisition committees, and family offices that run a formal IC approval process.',
          currentState:
            'Written by hand in Word/PowerPoint by deal-team analysts, compiling outputs from Argus/Excel models, CoStar/RCA comps, and the CIM into the firm’s template. IC memos typically run 20–30 pages.',
          benefit: {
            claim:
              'The only figure available comes from a vendor selling IC-memo automation (xlagent.ai): analysts spend roughly 20–40 hours per memo, compressed to under 8 with AI drafting. That’s a claim from a company with a product to sell in exactly this space — the weakest independent evidence in this category, and we won’t dress it up as more.',
            source:
              'getrefm.com on IC-memo components; xlagent.ai (vendor-reported).',
            tier: 3,
          },
        },
      },
      {
        name: 'Cash flow and debt capacity analysis',
        slug: 'debt-capacity-analysis',
        blurb:
          'Sustainable debt sized from cash flow, with the downside cases run.',
        detail: {
          whatItDoes:
            'Sizes the maximum sustainable debt a company or property can carry from its cash flow, then runs downside and stress cases — rate shocks, revenue or NOI declines — to confirm the debt level still holds.',
          target:
            'Corporate FP&A and treasury teams, leveraged-finance and credit teams at banks and private-credit funds, and CRE lenders sizing acquisition debt.',
          currentState:
            'Built in Excel with debt schedules and scenario manager. In CRE, DSCR is usually the binding constraint — most lenders require 1.20–1.25x minimum, stressed with +100 to +300 bps and/or 10–20% NOI declines.',
          benefit: {
            claim:
              'No study measures hours-to-build a debt-capacity/stress-test model. The CRE underwriting hours cited elsewhere in this category are the relevant analog, since debt sizing is normally embedded there. The Federal Reserve has published a formal stress-test methodology (a 650-bps cost-of-debt increase with a 20% EBITDA decline) — real and citable for the approach, not for prep time.',
            source:
              'Federal Reserve FEDS Notes (May 2024); Clearhouse Lending on DSCR analysis.',
            tier: 2,
          },
        },
      },
      {
        name: 'Client portfolio monitoring',
        slug: 'client-portfolio-monitoring',
        blurb:
          'Recurring checks on a client portfolio for drift, concentration, and news.',
        detail: {
          whatItDoes:
            'Runs recurring checks on a client’s portfolio to catch allocation drift from target, concentration building up in a position or sector, and material news affecting held positions.',
          target:
            'Financial advisors and wealth managers at RIAs and broker-dealers, particularly smaller teams without a dedicated trading or operations desk.',
          currentState:
            'Done through platforms like Orion, Addepar, or Black Diamond. Kitces Research found the median three-advisor team spends 8.7 hours a week on portfolio monitoring, with pure investment-management work only about 10% of an advisor’s total time.',
          benefit: {
            claim:
              'Kitces’ time-allocation research is the clearest independent, citable benchmark here — though it measures overall monitoring time, not a per-portfolio check. A secondary Morningstar analysis (original not independently verified) claims continuous rebalancing beats calendar-based by 28–47 bps a year after tax — flagged pending primary-source confirmation.',
            source:
              'Kitces Research on advisor time; Addepar/Morningstar (secondary, unverified).',
            tier: 2,
          },
        },
      },
      {
        name: 'ETF overlap',
        slug: 'etf-overlap',
        blurb: 'ETF holdings compared for overlap and real diversification.',
        detail: {
          whatItDoes:
            'Compares the underlying holdings of two or more ETFs to show how much they actually overlap and how much true diversification a combined portfolio really provides.',
          target:
            'Financial advisors building model portfolios, and self-directed investors trying to avoid unintentional concentration across multiple fund holdings.',
          currentState:
            'Free tools already handle the mechanical comparison — ETFRC’s Fund Overlap tool and Morningstar’s Instant X-Ray. YCharts offers a paid Holdings Overlap feature at roughly $3,600–$6,000+/year.',
          benefit: {
            claim:
              'No source gives a citable figure for hours spent manually checking ETF overlap — no public benchmark exists, plainly. And since free tools already solve the mechanical calculation, the honest value here is in interpretation, not raw time saved; any hours-saved number would be unsupported, so we don’t offer one.',
            source:
              'ETFRC Fund Overlap; Morningstar Instant X-Ray; YCharts pricing.',
            tier: 4,
          },
        },
      },
      {
        name: 'Sourcing screen',
        slug: 'sourcing-screen',
        blurb: 'Sector scans and deal-sourcing dashboards, private-equity style.',
        detail: {
          whatItDoes:
            'Scans a sector against defined criteria and surfaces a live dashboard of prospective acquisition or investment targets — the format a PE deal-sourcing team uses to triage which companies merit a closer look.',
          target:
            'PE and VC associates and principals running proactive origination, corporate development teams doing buy-side sourcing, and independent sponsors without a large sourcing team.',
          currentState:
            'PE sourcing staff typically work 60–70-hour weeks (80–90+ on live deals), using platforms like PitchBook ($12K–$70K/yr) and Grata ($25K–$50K/yr).',
          benefit: {
            claim:
              'Grata claims that surfacing 2–3 proprietary opportunities a year that PitchBook would miss pays for the subscription — a vendor ROI claim, not independently verified. A widely cited conversion figure: the average PE firm reviews roughly 80 opportunities to close one deal. No independent study quantifies hours saved automating sector scans.',
            source:
              'PitchBook and Grata pricing (vendor-reported); PE deal-funnel statistics.',
            tier: 3,
          },
        },
      },
      {
        name: 'Watchlist monitor',
        slug: 'watchlist-monitor',
        blurb:
          'Companies and sectors tracked for material news and corporate actions.',
        detail: {
          whatItDoes:
            'Continuously tracks a defined list of companies and sectors for material news, M&A, earnings surprises, and other corporate actions — surfacing what actually matters.',
          target:
            'Buy-side and sell-side analysts maintaining a coverage or position list, PMs tracking a watchlist beyond current holdings, and corporate development teams tracking competitors or targets.',
          currentState:
            'Done via Bloomberg Terminal watchlist/alert functions (~$30K/yr) or AlphaSense across 10,000+ curated sources; smaller shops rely on free tools like Google Alerts.',
          benefit: {
            claim:
              'A vendor testimonial (AlphaSense’s own) claims the platform saves users at least 10–15 hours a week; at the BLS median analyst wage (~$49/hour, 2024) that’s roughly $970–$1,455 a week if the figure holds directionally. It’s vendor-reported — no independent benchmark exists for watchlist-monitoring time specifically.',
            source:
              'AlphaSense (vendor-reported); BLS OOH (Financial Analysts).',
            tier: 3,
          },
        },
      },
    ],
  },
  {
    name: 'Legal',
    slug: 'legal',
    description:
      'Get a first draft of a contract, or an honest estimate of the hours a matter will take.',
    items: [
      {
        name: 'Draft a contract',
        slug: 'draft-a-contract',
        blurb:
          "A first-draft contract from a term sheet, grounded in your firm's precedent.",
        detail: {
          whatItDoes:
            'Converts a signed or near-final term sheet into a complete first-draft contract — populating standard clauses, defined terms, and structure from the deal’s commercial points, pulling boilerplate and preferred language from your own precedent library rather than a generic template. A document ready for attorney review, not a blank slate.',
          target:
            'Solo attorneys and small-to-midsize firms (2–20 lawyers) doing transactional work with a precedent bank but limited associate bandwidth; in-house counsel at startups and mid-market companies needing a fast first draft after a deal is agreed; corp-dev staff who need a document to send counterparty counsel same-day.',
          currentState:
            'Usually manual — a junior associate or paralegal pulls the closest precedent, adapts the deal-specific terms, and does a first markup for a senior attorney to revise. Some firms use document assembly (HotDocs, Contract Express) or clause libraries; generative first-draft tools (Spellbook, Harvey) are newer and unevenly adopted.',
          benefit: {
            claim:
              'No direct benchmark exists for term-sheet-to-first-draft specifically. On the closest analog: ContractsCounsel’s 2025 marketplace data shows business-contract drafting taking lawyers 2–3 billable hours at $225–$300/hour ($800 average flat fee). A September 2025 study (LegalBenchmarks.ai, 72 professionals, 450 outputs) found human lawyers produced a “reliable” first draft 56.7% of the time versus 73.3% for the top AI tool — suggesting AI first drafts can match or beat baseline human reliability on bounded tasks, with human review still needed for negotiation strategy and novel terms.',
            source:
              'ContractsCounsel (2025); LegalBenchmarks.ai (Sept 2025), via Artificial Lawyer and LawNext.',
            tier: 2,
          },
        },
      },
      {
        name: 'Billable hours',
        slug: 'billable-hours',
        blurb:
          'Billable hours for a work product, estimated by task and complexity.',
        detail: {
          whatItDoes:
            'Takes a described work product — a brief, a contract, a diligence review — breaks it into constituent tasks, and estimates the billable hours each will likely take, adjusted for complexity. A task-by-task estimate you can use to scope a matter, set a budget, or quote a fee, instead of a single gut-feel number.',
          target:
            'Solo attorneys and small/midsize-firm partners and billing managers who need to quote before starting; in-house legal-ops and procurement teams evaluating outside-counsel budgets; firms moving to alternative or flat fees who need a defensible basis for a quote.',
          currentState:
            'Almost entirely informal — partners estimate from memory of similar matters, then track actual time after the fact in Clio, TimeSolv, or Bill4Time. Per Thomson Reuters Institute (2023), only 7% of partners “always” give clients an upfront estimate; 49% do so only sometimes or rarely.',
          benefit: {
            claim:
              'No direct benchmark compares AI-estimated to human-estimated task hours, so the case rests on the cost of today’s estimation gap. The same Thomson Reuters survey found partners silently write down an average of 76 hours a year (~$47,000 in lost fees), plus 300+ more hours (~$190,000) written off in pre-bill review — much of it from misjudged complexity. Clio’s 2025 report puts firm-wide utilization at just 38%.',
            source:
              'Thomson Reuters Institute (2023, 245 respondents); Clio 2025 Legal Trends Report.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Sales',
    slug: 'sales',
    description:
      'Walk into the next call prepared, with outreach that sounds like you.',
    items: [
      {
        name: 'Outreach message',
        slug: 'outreach-message',
        blurb: 'Personalized outreach copy for a contact or company list.',
        detail: {
          whatItDoes:
            'Generates personalized outreach copy — emails, LinkedIn messages, or call scripts — for a contact or company list, drawing on available signals (role, company context, recent activity) to tailor each message rather than sending one generic template.',
          target:
            'SDRs and AEs at B2B SaaS and services companies running outbound; founders and solo operators doing their own outbound before hiring a sales team; agencies running outbound for clients.',
          currentState:
            'Reps write each message by hand or use a shared template with light mail-merge; more mature teams use sequencing tools (Outreach, Salesloft, Apollo) that automate sending but still need a human to write and personalize the copy.',
          benefit: {
            claim:
              'Outreach’s 2025 data reports customized emails getting 10% higher open rates and 2× higher reply rates than standard templates, and reps using its AI agent going from ~20 minutes to ~2 per contact. These are figures from a company selling this capability, so read the magnitude as directional — the 10%/2× personalization lift is the more load-bearing one, since it compares message types rather than tool adoption.',
            source:
              'Outreach “Sales 2025” and Prospecting 2025 reports (vendor-reported).',
            tier: 3,
          },
        },
      },
      {
        name: 'Account outreach',
        slug: 'account-outreach',
        blurb: 'Research-driven outreach campaigns, automated and run at scale.',
        detail: {
          whatItDoes:
            'Builds and runs multi-touch outreach across a target account list, where each touch is grounded in account-specific research (firmographics, tech stack, recent news, hiring signals) rather than a single static sequence, with the sending and follow-up automated at scale.',
          target:
            'Revenue and demand-gen leaders and SDR teams running account-based marketing or outbound, typically mid-market to enterprise; growth-stage startups scaling outbound beyond a manual SDR team.',
          currentState:
            'Manual list-building and generic sequences in Outreach/Salesloft/Apollo, with a human researching each account before hand-tailoring a campaign; or standalone “AI SDR” tools (11x, Artisan, AiSDR), a newer category most buyers are still evaluating.',
          benefit: {
            claim:
              'HubSpot’s Breeze data indicates manual prospect research runs 15–20 minutes per prospect versus under 60 seconds automated — a 10-person team researching 50 prospects a week saving an estimated 125–150 hours. That’s vendor-published, and it isolates the research component, not the full at-scale motion; combined with Outreach’s finding that ~40% of AI-SDR adopters save 4–7 hours a week, read the whole thing as directional.',
            source:
              'HubSpot Breeze via man.digital; Outreach Prospecting 2025 (both vendor-reported).',
            tier: 3,
          },
        },
      },
      {
        name: 'Customer demo',
        slug: 'customer-demo',
        blurb: 'Demo scripts and talking points tailored to a target account.',
        detail: {
          whatItDoes:
            'Produces a demo script and talking points customized to a specific account — sequencing which features and use cases to lead with based on that account’s stated priorities, likely objections, and business context — instead of a generic walkthrough used for everyone.',
          target:
            'Account executives and sales engineers at B2B SaaS companies running demos, especially mid-market/enterprise sellers where deal size justifies prep; founder-led sales at early-stage startups without a sales-engineering function.',
          currentState:
            'Reps build demo flows by hand in Slides or a demo tool (Demodesk, Consensus, Reprise), often reusing a generic deck and improvising live; better-resourced teams pull in a scarce, expensive sales engineer for high-value accounts.',
          benefit: {
            claim:
              'Gong’s analysis of 67,149 recorded demos found structure correlates with outcomes — winning demos run 30.5% longer and spend 12.7% more time on next steps — and that bringing in a sales engineer lifts win rates up to 30%. Gong’s research arm produced these on adjacent questions, not “AI-tailored talking points” as an isolated variable, so they’re a supporting analog. Practitioner commentary (not a study) puts demo prep at roughly 10× the demo’s length.',
            source:
              'Gong Labs (analysis of 67,149 demos); Gong 2025 insights.',
            tier: 2,
          },
        },
      },
      {
        name: 'Account profiles',
        slug: 'account-profiles',
        blurb: 'Company and account research for sales call prep.',
        detail: {
          whatItDoes:
            'Compiles company and account research ahead of a call — firmographics, recent news, org and leadership context, competitive landscape, relevant signals — into a single brief, replacing the manual piecing-together before every call.',
          target:
            'Account executives and SDRs at B2B companies who run discovery or sales calls, especially those covering large account books; sales managers standardizing call-prep quality across a team.',
          currentState:
            'Manual research across LinkedIn (plus Sales Navigator), the company site, Google News, and paid platforms like ZoomInfo (~$15K–$40K+/yr); reps then synthesize into personal notes, often inconsistently across a team.',
          benefit: {
            claim:
              'Thorough manual account research runs roughly 1–3 hours per account, and reps covering large books (~200 accounts) spend 20+ hours a week on research; Forrester attributes about 15% of a rep’s week to it. No single controlled study isolates the time saved by an AI-assembled brief, and the HubSpot Breeze comparison is an analog — directionally consistent, not a like-for-like measurement.',
            source:
              'Avoma on pre-call routines; Forrester rep time-allocation data; HubSpot Breeze via man.digital.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description:
      'Keep search, content, and brand work moving without an agency.',
    items: [
      {
        name: 'SEO / keyword research',
        slug: 'seo-keyword-research',
        blurb:
          'Search-intent analysis, competitor gaps, and keyword and bid recommendations.',
        detail: {
          whatItDoes:
            'Analyzes what searchers actually mean by a query, finds keywords competitors rank for that you don’t, and returns prioritized targets with bid and difficulty context — for both organic content planning and paid search.',
          target:
            'Marketing managers or founders at small-to-mid-size businesses and e-commerce brands without an in-house SEO specialist; agencies needing faster first-pass research for onboarding; PPC managers needing bid guidance alongside organic strategy.',
          currentState:
            'Built by hand in Semrush (~$140–$250/mo) or Ahrefs (~$129–$249/mo) using their keyword and content-gap tools, cross-referencing four or five competitor domains manually; or outsourced to a freelance or agency SEO.',
          benefit: {
            claim:
              'Ahrefs’ 2024 survey of 439 SEO providers found average billing of $111/hour (agencies ~$99, consultants ~$171), with monthly retainers of $501–$2,000. Industry guides estimate keyword research, briefs, and gap analysis alone at 8–12 hours a month for a small account. No controlled study isolates keyword-research time with versus without AI — this is a reasoned range from pricing data.',
            source:
              'Ahrefs 2024 SEO pricing survey; Semrush pricing; SEO pricing/hours guides.',
            tier: 2,
          },
        },
      },
      {
        name: 'Store optimizer',
        slug: 'store-optimizer',
        blurb: 'Storefront listing, SEO, and photography improvements.',
        detail: {
          whatItDoes:
            'Audits an e-commerce storefront or product listings (Etsy, Amazon, Shopify) for weak titles, tags, descriptions, and missing SEO metadata, rewrites listing copy for search visibility, and flags photography gaps against what the platform’s own ranking signals reward.',
          target:
            'Independent Etsy/Amazon/Shopify sellers and small DTC brands (a handful to a few hundred SKUs) without a merchandising or SEO hire; agencies managing multiple small-seller storefronts.',
          currentState:
            'Fully manual seller effort guided by platform help docs, or point-tool apps (Plug in SEO, SEO Manager, ListifyAI) at $10–$50/month; larger sellers hire freelance listing specialists per listing.',
          benefit: {
            claim:
              'Etsy’s own guidance says search ranking weighs title, tags, attributes, description, and lead photo together — a task sellers handle listing by listing today. AI listing generators (ListifyAI) advertise a full optimized title/description/13-tag set in under 60 seconds, but that’s a vendor claim, and no independently audited study measures average manual per-listing time. Treat the comparison as approximate.',
            source:
              'Etsy Seller Handbook; Shopify Dev Docs; ListifyAI (vendor-reported).',
            tier: 3,
          },
        },
      },
      {
        name: 'Brand inspiration',
        slug: 'brand-inspiration',
        blurb: 'Competitor creative, analyzed into an annotated reference deck.',
        detail: {
          whatItDoes:
            'Pulls competitor ads, social posts, and campaign creative, analyzes patterns in messaging, format, and visual style, and compiles an annotated reference deck a creative team can brief against — a structured, interpreted swipe file instead of an unstructured one.',
          target:
            'In-house brand and marketing managers and creative directors at small-to-mid-size consumer brands preparing a campaign or launch; boutique creative and ad agencies briefing designers; founders benchmarking category creative before a first big ad spend.',
          currentState:
            'Manually screenshotting competitor ads into Notion, Slack, or shared drives; or using creative-research platforms like Foreplay or Atria that save ads into boards but still need a human to synthesize the patterns into a brief.',
          benefit: {
            claim:
              'A vendor in this space (Atria) reports teams going from “days to hours” to turn a competitor ad library into ready creative concepts using AI synthesis — a vendor claim, not an audited study. No rigorous public benchmark exists for the time to produce an annotated competitor-creative deck; we’ll state that as the gap it is rather than paper over it.',
            source:
              'Foreplay on swipe files; Atria (vendor-reported).',
            tier: 3,
          },
        },
      },
      {
        name: 'Newsletter / post creator',
        slug: 'newsletter-post-creator',
        blurb: 'Newsletters and social posts drafted in a voice you define.',
        detail: {
          whatItDoes:
            'Drafts email newsletters and social posts in a specified brand voice — taking a topic, update, or brief and producing publish-ready copy across multiple posts or emails at once, rather than one piece at a time from a blank page.',
          target:
            'Solo founders, small-business owners, and lean marketing teams needing consistent-cadence content without a dedicated copywriter; e-commerce brands running regular newsletters; agencies producing content across client accounts.',
          currentState:
            'Founder or marketer writing it themselves; hiring freelance copywriters per piece; or using generic AI chat tools ad hoc without a persistent brand voice, re-prompting and editing heavily each time.',
          benefit: {
            claim:
              'Freelance rates run $200–$1,500 per newsletter or $150–$750 per email, at $50–$300/hour. Small-business owners report about 6 hours a week on social media overall (VerticalResponse survey), roughly half of it on content creation. No controlled study measures AI-in-a-defined-voice versus manual drafting directly — this is reasoned from adjacent cost and time data.',
            source:
              'VerticalResponse survey; SoloPricing and Fueler freelance-rate data.',
            tier: 2,
          },
        },
      },
      {
        name: 'Product photos',
        slug: 'product-photos',
        blurb:
          'Product images generated across lighting, angle, and background variants.',
        detail: {
          whatItDoes:
            'Generates product images across multiple lighting setups, camera angles, and background scenes from a base image — a full visual set without a physical reshoot for each variant.',
          target:
            'E-commerce and DTC brands with frequent SKU turnover or seasonal collections; small retailers and Shopify/Amazon sellers who can’t afford recurring studio shoots per product; marketing teams needing localized or platform-specific variants.',
          currentState:
            'Hiring a product photographer or studio — typically $25–$65 per image for simple white-background shots, $100–$300+ for lifestyle, plus rush fees and 5–10-day turnaround; or DIY with a lightbox and phone.',
          benefit: {
            claim:
              'Industry pricing guides put AI-generated images at roughly $0.20–$0.75 each versus $25–$500 for traditional studio work. Fair warning: widely repeated claims like “H&M cut imagery costs 73%” trace back to unsourced marketing blogs and are deliberately excluded here. No independently audited study quantifies AI-versus-traditional savings, so the per-image pricing comparison is the better-sourced figure — and it’s a comparison, not a guarantee.',
            source:
              'Razor Creative Labs, Retouching Zone, and Photta pricing guides (industry blogs, not audited studies).',
            tier: 2,
          },
        },
      },
      {
        name: 'Event prep',
        slug: 'event-prep',
        blurb: 'Event brief, landing page, invites, and RSVP management.',
        detail: {
          whatItDoes:
            'Produces the operational package to launch an event — a structured brief, a registration/landing page, invitation copy and sends, and RSVP tracking — as one connected workflow instead of separately built pieces.',
          target:
            'Small-business owners and marketing teams running customer or partner events, webinars, or launches without a dedicated planner; nonprofits organizing fundraisers; internal comms and HR teams; agencies managing events for multiple small clients.',
          currentState:
            'Either a hired event planner (median wage $59,440, ~$28.58/hour, BLS 2024) or DIY assembly of separate point tools — Eventbrite or RSVPify for registration, Paperless Post for invitations, a separate landing-page builder — stitched together by hand.',
          benefit: {
            claim:
              'Using the BLS median event-planner wage of $28.58/hour as the labor anchor, even a modest cut to the manual-assembly portion (brief-writing, page building, invite drafting — distinct from on-site logistics and vendor negotiation, which still need human judgment) converts directly into planner-hours saved. No audited study isolates this exact combination, and vendor claims of “up to 60 hours saved per event” are marketing, not data, so they’re excluded here.',
            source:
              'BLS OOH (Meeting, Convention, and Event Planners, May 2024); EventPro on event-planning hours.',
            tier: 2,
          },
        },
      },
      {
        name: 'Brand reputation',
        slug: 'brand-reputation',
        blurb:
          'Sentiment and reputation analysis across social, reviews, and news.',
        detail: {
          whatItDoes:
            'Aggregates and analyzes mentions of a brand across social media, reviews, and news, scoring sentiment and surfacing reputation risks or emerging issues — turning scattered mentions into one trackable signal instead of manually monitoring each channel.',
          target:
            'Marketing and comms leads at small-to-mid-size consumer brands and multi-location businesses who need to track sentiment but can’t justify enterprise tooling; PR teams managing brand risk; agencies handling reputation monitoring for several clients.',
          currentState:
            'Manual periodic checks of Google/Yelp reviews, social mentions, and news alerts with no systematic scoring; or paid tools — enterprise listening platforms like Brandwatch ($36K–$50K+/yr) or reputation agencies charging $500–$2,500/month for small businesses.',
          benefit: {
            claim:
              'The clearest comparison here is cost: small-business reputation retainers average roughly $830/month ($9,960/year), and enterprise social-listening runs from an ~$800 floor into the tens of thousands — both ongoing costs for a capability this workflow can substantially compress. No audited study quantifies hours saved per week analyzing sentiment, so the benefit rests on displaced subscription/service cost, not a labor-hours study.',
            source:
              'SurveySparrow, CheckThat.ai, and NetReputation cost data.',
            tier: 2,
          },
        },
      },
      {
        name: 'Sales prep',
        slug: 'sales-prep',
        blurb:
          'A full account profile and call-prep document from a company name.',
        detail: {
          whatItDoes:
            'Takes a target company name and produces a full account profile — firmographics, recent news, likely stakeholders, relevant talking points — in one call-prep document, replacing the manual pull-together before every call.',
          target:
            'B2B sales reps and account executives (SMB through mid-market SaaS/services) doing outbound or discovery; SDRs prepping high call volumes; account managers preparing renewal or expansion conversations.',
          currentState:
            'Manual research across LinkedIn Sales Navigator (~$99–$169/mo), ZoomInfo (commonly $15K+/yr), company sites, and news — toggling across four or five tools per account; or a CRM account view that surfaces raw data but doesn’t synthesize it into a prep narrative.',
          benefit: {
            claim:
              'Salesforce’s State of Sales found reps spend only about 30% of their time actually selling, with the rest on research, prioritization, and admin; manual account research specifically runs ~1–3 hours per account, or 14% of a rep’s week. Salesforce also found sellers expect AI agents to cut research time by roughly 34% once fully implemented — but that’s a forward-looking expectation, not a measured outcome, and flagged as such.',
            source:
              'Salesforce State of Sales (6th ed.) and 2026 sales statistics.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Utility & Productivity',
    slug: 'utility-productivity',
    description:
      'Clear the small jobs that eat an afternoon — documents, decks, images, files.',
    items: [
      {
        name: 'Prompt refinement',
        slug: 'prompt-refinement',
        blurb: 'An AI prompt, improved for clarity and effectiveness.',
        detail: {
          whatItDoes:
            'Takes your draft prompt for an AI system and rewrites it for clarity, specificity, and structure — tightening ambiguous instructions, adding missing context and constraints, and reorganizing it so the target model is more likely to produce what you meant on the first try.',
          target:
            'Non-technical professionals and small teams who use AI tools daily but haven’t studied prompt engineering — marketers, solo consultants, support leads, small-agency owners — who want reliably better outputs without learning the technique themselves.',
          currentState:
            'Fully manual trial-and-error — re-running a prompt and eyeballing results, or copying generic “prompt formulas” from blog posts. A few dedicated tools exist (PromptPerfect, orq.ai) but most casual users use none of them.',
          benefit: {
            claim:
              'This is one where an honest answer is “no number.” Effectiveness depends entirely on the downstream task and model, and the stats circulating (“40% efficiency gains” and the like) trace back to marketing content, not a peer-reviewed benchmark. What can be said credibly: academic work on prompt optimization consistently finds structured, well-specified prompts outperform ad hoc ones. Directionally positive; magnitude not independently benchmarked — so we won’t invent one.',
            source:
              'Academic literature on prompt optimization; orq.ai (used only to confirm no rigorous benchmark exists).',
            tier: 4,
          },
        },
      },
      {
        name: 'Candidate sourcing',
        slug: 'candidate-sourcing',
        blurb: 'A hiring rubric and an evidence-backed candidate shortlist.',
        detail: {
          whatItDoes:
            'Builds a structured hiring rubric tied to the role’s actual requirements, then produces a shortlist of candidates scored against it with evidence cited for each score — a documented, criteria-based first cut instead of gut-feel resume skimming. A one-off deliverable; see Autonomous candidate sourcing for the ongoing version.',
          target:
            'Hiring managers and founders at small and mid-size companies (10–200 employees) without a recruiting function, and solo or small internal recruiting teams at growth-stage startups facing high applicant volume.',
          currentState:
            'Manual resume review in an ATS inbox or spreadsheet, often with no written rubric; mid-market teams may use Greenhouse, Ashby, or Lever for pipeline tracking, but the screening judgment stays manual.',
          benefit: {
            claim:
              'SHRM’s 2025 benchmarking puts average U.S. cost-per-hire at $5,475 for non-executive roles, with screening commonly eating about half of a recruiter’s per-hire time, and Ashby’s data (109M+ applications) shows recruiters now process 300+ applications per hire. No peer-reviewed study isolates the delta from adding a structured rubric specifically — this is reasoned from real, adjacent benchmarks.',
            source:
              'SHRM 2025 Benchmarking; Ashby Talent Trends; Mitratech time-to-fill data.',
            tier: 2,
          },
        },
      },
      {
        name: 'Message polish',
        slug: 'message-polish',
        blurb: 'Drafts refined for tone and audience.',
        detail: {
          whatItDoes:
            'Takes a drafted message — email, Slack note, client memo, exec update — and rewrites it for the intended audience and tone: adjusting formality, trimming length, fixing ambiguous phrasing, and flagging anything that reads as unintentionally harsh or off-brand, without changing what you’re actually trying to say.',
          target:
            'Client-facing professionals (account managers, consultants, CS reps), non-native English speakers in corporate roles, and busy executives and founders sending high volumes of externally visible writing.',
          currentState:
            'Manual self-editing before sending; grammar/tone tools like Grammarly Business or ProWritingAid for line-level checks; or, for high-stakes messages, routing a draft to a colleague for a read, adding hours of delay.',
          benefit: {
            claim:
              'McKinsey’s standard reference figure puts email at about 28% of the workweek (~11.2 hours) for knowledge workers. More directly on tools, a Forrester study commissioned by Grammarly found 92% of users said it saved them time and measured a 71% reduction in email “idling” time. That tool study was vendor-commissioned and covers grammar/tone broadly, not a full redraft for tone — so read the percentage as directionally supportive, not an exact match.',
            source:
              'McKinsey Global Institute (2012); Forrester TEI commissioned by Grammarly (Jan 2024).',
            tier: 3,
          },
        },
      },
      {
        name: 'Background removal',
        slug: 'background-removal',
        blurb: 'Clean background removal from an image.',
        detail: {
          whatItDoes:
            'Detects the subject in a photo and removes the background, producing a clean cutout suitable for product listings, marketing assets, or profile imagery — with a human quality pass for edge cases (hair, glass, fur) where automated detection is imperfect.',
          target:
            'E-commerce sellers and small retail brands prepping product photography, real-estate and marketing teams needing quick listing images, and social-media managers and small agencies producing high volumes of visual content without design staff.',
          currentState:
            'Manual removal in Photoshop (Pen tool, Quick Selection, Background Eraser), or outsourced to offshore clipping-path services at ~$0.25–$5 per image; or dedicated tools like remove.bg or Adobe’s built-in action.',
          benefit: {
            claim:
              'remove.bg states automated removal takes about 5 seconds per image versus roughly 3–8 minutes of manual Photoshop work for a straightforward product shot and 10–20 for complex images — a real, vendor-stated but independently corroborated order-of-magnitude reduction (~95%+ on the first pass). Complex images still need a manual cleanup pass, which is exactly why a human review step is built in.',
            source:
              'remove.bg; Clipping Path Center; Cutout.pro.',
            tier: 2,
          },
        },
      },
      {
        name: 'Website builder',
        slug: 'website-builder',
        blurb:
          'A guided site build from a description, through design and deployment.',
        detail: {
          whatItDoes:
            'Takes a plain-language description of a business and its goals and produces a complete, deployed website — page structure, copy, design, and hosting — walking you through the process rather than handing over a blank template to fill in yourself.',
          target:
            'Solo entrepreneurs, local service businesses, and early-stage startups who need an online presence fast and can’t justify a $3,000–$20,000+ agency engagement or its multi-week timeline.',
          currentState:
            'DIY builds on Squarespace or Wix (learn the editor, write the copy, troubleshoot layout); freelance designers at ~$50–$150/hour or $1,500–$8,000 per site; boutique agencies at $6,000–$35,000+; or, commonly, no real website at all because of cost and time.',
          benefit: {
            claim:
              'Multiple 2025–2026 small-business costing guides converge on DIY builds taking roughly 40–80 hours of the owner’s own time to reach a finished site, while freelance and agency routes cost $1,500–$35,000+ and take 2–4 weeks of calendar time. These are aggregated industry estimates rather than one controlled study — a converging-consensus range, and we frame it that way.',
            source:
              'Squarespace, City Print, and GruffyGoat small-business website cost guides.',
            tier: 2,
          },
        },
      },
      {
        name: 'Filetype converter',
        slug: 'filetype-converter',
        blurb: 'A document converted across multiple formats.',
        detail: {
          whatItDoes:
            'Converts a document from one format to another — PDF to Word, DOCX to plain text, PPTX to PDF — preserving formatting and structure as closely as the source and target formats allow.',
          target:
            'Essentially any office worker or small-business owner who occasionally needs to move a file between formats — admin staff, students, freelancers. No strong role specificity; a near-universal, low-stakes task.',
          currentState:
            'Free and near-free tools already dominate — Adobe Acrobat’s online converter, Zamzar, CloudConvert, Convertio, and built-in Save As / Export in Word, Google Docs, and PowerPoint. A genuine commodity task with near-zero switching cost.',
          benefit: {
            claim:
              'No meaningful public benchmark exists, and we won’t force one. File conversion is typically a sub-minute, free, one-click action with existing tools; there’s no credible “hours saved” or “dollars saved” story against Zamzar or Adobe’s free converter, and inventing one would misrepresent the real baseline. The honest positioning here is convenience and consolidation, not time or cost savings.',
            source:
              'Zamzar; Adobe free PDF converter; Lido on PDF converter software.',
            tier: 4,
          },
        },
      },
      {
        name: 'Slide creation',
        slug: 'slide-creation',
        blurb: 'A research-backed presentation from a topic.',
        detail: {
          whatItDoes:
            'Takes a topic and produces a complete, structured slide deck — researching the subject, organizing it into a narrative, and designing the layout — rather than making you outline the content and then separately format it.',
          target:
            'Consultants, sales and biz-dev professionals building pitch decks, marketing and ops teams producing recurring reports (QBRs, board updates), and founders who need investor or client decks without design staff.',
          currentState:
            'Manual deck-building in PowerPoint or Google Slides from a blank canvas or template, doing your own research, outlining, and design; larger orgs may use Canva or Beautiful.ai for layouts, but content research and structuring stay manual.',
          benefit: {
            claim:
              'INNOFACT’s “Big PowerPoint Study” found professionals spend an average of 100 hours a year on presentations, that building a deck from a blank canvas takes 8–12 hours (versus 45 minutes to 2 hours from a template), and that about 40% of PowerPoint time goes to repetitive formatting rather than message. A real, substantial baseline for from-scratch decks — though the study measures overall PowerPoint time, not AI-assisted creation as the isolated intervention.',
            source:
              'INNOFACT “Big PowerPoint Study” (via Empowersuite); 24slides.',
            tier: 2,
          },
        },
      },
      {
        name: 'Document summary',
        slug: 'document-summary',
        blurb: 'An exportable summary with the key metrics and takeaways.',
        detail: {
          whatItDoes:
            'Reads a long-form document — report, filing, research paper, transcript — and produces a condensed, exportable summary surfacing the key metrics, findings, and action items, so you get the substance without reading the full source.',
          target:
            'Executives and analysts who need to digest long reports quickly (board members on financials, investors on diligence materials, ops leads on vendor or compliance documents), and teams that need one shared, consistent takeaway from a source document.',
          currentState:
            'Manual reading and note-taking, often delegated to a junior analyst or assistant; or AI summarization features increasingly built into Microsoft Copilot, Google’s Gemini/NotebookLM, or Adobe Acrobat — which still require you to prompt, review, and pull the numbers into usable form.',
          benefit: {
            claim:
              'Research on knowledge-worker time converges on a large real burden even before summarization: employees spend roughly 2 hours a day (~5 a week) searching for and processing documents (IDC and workplace-search studies). That describes the adjacent “finding and processing information” burden rather than isolating “summarizing one already-located document,” so it’s an approximate analog for the surrounding workflow, not a direct measurement of summarization.',
            source:
              'IDC 2012 knowledge-worker survey (via APQC); Forbes Technology Council.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Recruiting',
    slug: 'recruiting',
    description:
      'Keep the candidate pipeline full without running it by hand.',
    items: [
      {
        name: 'Autonomous candidate sourcing',
        slug: 'autonomous-candidate-sourcing',
        blurb:
          'Iterative sourcing, verification, and scoring, with review batches delivered on a schedule.',
        detail: {
          whatItDoes:
            'Runs candidate sourcing as a standing, recurring process rather than a one-time search — continuously identifying new candidates against a role’s criteria, verifying employment and contact details, scoring against the profile, and delivering a fresh ranked batch for human review on a set cadence until the req is filled. Built for reqs that stay open for weeks; distinct from the one-off Candidate sourcing deliverable.',
          target:
            'In-house talent-acquisition teams and RPO providers at small-to-mid-size companies (roughly 50–2,000 employees) with hard-to-fill or recurring reqs — a Series B–D company hiring engineers continuously, a health system with chronic nursing vacancies, a staffing agency running concurrent searches. The buyer typically owns 15–60+ open reqs and needs the pipeline replenished without re-running manual searches weekly.',
          currentState:
            'Manual, repeated recruiter searches in LinkedIn Recruiter (~$10K–$15K/seat/yr) plus Boolean searches, then manual verification into an ATS. Point “AI sourcing” tools (SeekOut, hireEZ, Fetcher) automate parts at $10K–$30K+/seat/yr but still need a recruiter to re-launch and re-triage; none deliver it as a fully managed, scheduled, human-reviewed batch. Outsourcing to a contingency agency instead costs 15–25% of first-year salary per hire.',
          benefit: {
            claim:
              'SHRM’s 2025 data (2,371 respondents) puts median time-to-fill at ~44–45 days and cost-per-hire at $1,200–$10,625 — the baselines this competes against, not proof of a reduction. On labor, sourcing is repeatedly cited as recruiters’ single biggest time sink at roughly 13 hours a week per open role (a figure from sourcing-tech vendor Entelo, so flagged as vendor-sourced). No independently audited study isolates the marginal saving of scheduled AI sourcing; vendor case-study claims of big time-to-hire cuts are directional marketing, not verified. The defensible claim: this targets the ~13 hrs/week/role sourcing burden directly, and its value scales with how many reqs stay open at once.',
            source:
              'SHRM 2025 Recruiting Executives Benchmarking and Talent Trends; Entelo (vendor-reported) via Qualigence; vendor pricing for LinkedIn Recruiter, SeekOut, hireEZ, Fetcher.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Personal Finance',
    slug: 'personal-finance',
    description:
      'See where your money actually goes — and where it is heading.',
    items: [
      {
        name: 'Daily finance digest',
        slug: 'daily-finance-digest',
        blurb:
          'A personalized daily note on balances, spending, and activity.',
        detail: {
          whatItDoes:
            'Delivers a short daily written summary — balances across linked accounts, notable transactions, unusual charges, and spending versus your normal pattern — so you get a consistent daily read on your money without opening multiple bank apps or a spreadsheet.',
          target:
            'Employed individuals and dual-income households (roughly $40K–$150K income) juggling several accounts who want daily visibility without the anxiety of actively monitoring; gig and variable-income earners who need a daily balance read to time spending safely.',
          currentState:
            'Most people either check individual bank and card apps by hand or rely on reactive low-balance push alerts. Aggregators like Rocket Money, Monarch, or Copilot show an on-demand dashboard but require opening the app; few deliver a written daily narrative unprompted.',
          benefit: {
            claim:
              'No direct benchmark exists for daily-digest products specifically — stated plainly. Directionally: Northwestern Mutual’s 2025 study found 69% of Americans say financial uncertainty has made them anxious or depressed, and 63% say money worries disrupt their sleep — an analog for the uncertainty this targets, not a measure of the product’s effect. On time, ATUS data shows the average American spends under two minutes a day actively managing finances, so few are doing rigorous daily reviews today.',
            source:
              'Northwestern Mutual 2025 Planning & Progress Study; Motley Fool Money on ATUS data.',
            tier: 2,
          },
        },
      },
      {
        name: 'Run rate dashboard',
        slug: 'run-rate-dashboard',
        blurb: 'A live dashboard annualizing your current spending pace.',
        detail: {
          whatItDoes:
            'Takes your current month-to-date (or trailing) spending and projects it forward to an annualized run rate — “at this pace you’ll spend $54,000 this year” — refreshed as new transactions post, so you see the forward trajectory of your spending, not just a backward-looking monthly total.',
          target:
            'Higher earners and dual-income households ($75K–$250K+) with variable discretionary spending who want a forward-looking check rather than a rearview budget report; also people planning a major purchase or savings goal.',
          currentState:
            'Almost universally manual — mental extrapolation or a personal spreadsheet formula. Budgeting apps like YNAB, Monarch, and Copilot show monthly and category totals but don’t natively surface an annualized run-rate framing the way a fractional-CFO dashboard would; it’s a business concept not commonly ported to consumer tools.',
          benefit: {
            claim:
              'No direct public benchmark exists for consumer run-rate dashboards — it’s a novel framing borrowed from business finance, so no study measures its effect on personal spending, and we’ll say so. For loose context only: YNAB’s own (self-reported, not audited) figures claim users save $600 in their first month and $6,000 in a year — a vendor claim about category budgeting, not run-rate projection, so only loosely analogous.',
            source:
              'YNAB (vendor-reported); Motley Fool on baseline time spent reviewing finances.',
            tier: 4,
          },
        },
      },
      {
        name: 'Cash flow forecast',
        slug: 'cash-flow-forecast',
        blurb: 'Cash on hand, projected past upcoming bills and income.',
        detail: {
          whatItDoes:
            'Projects your checking balance forward, netting known upcoming bills, subscriptions, and expected income against current cash on hand, so you can see whether you’ll stay positive through the next set of due dates rather than just seeing today’s balance.',
          target:
            'Households living paycheck-to-paycheck or with thin buffers (income doesn’t fully predict this), plus gig workers and freelancers with irregular income timing who need to sequence bill payments against uncertain deposit dates.',
          currentState:
            'Mental math and habit, or an ad hoc spreadsheet of bills and due dates; reactive low-balance alerts (after the fact, not predictive); or “safe-to-spend” features in Rocket Money, Monarch, or Copilot that vary widely in how far they project forward.',
          benefit: {
            claim:
              'The clearest stakes come from government data on the cost of getting this wrong: Americans paid an estimated $12.1 billion in overdraft and NSF fees in 2024 (average $26.77 per incident in 2025), and the CFPB found 79% of those fees hit just 9% of accounts, whose median balance is under $350 — precisely the population a forecast targets. We use this as the baseline cost this workflow aims to reduce, not as a measured before/after; no transparent study isolates how much a predictive forecast cuts overdrafts versus reactive alerts.',
            source:
              'Consumer Financial Protection Bureau overdraft/NSF data via Financial Health Network.',
            tier: 1,
          },
        },
      },
      {
        name: 'Subscription cleanup',
        slug: 'subscription-cleanup',
        blurb: 'The forgotten subscriptions worth cancelling, surfaced.',
        detail: {
          whatItDoes:
            'Scans linked accounts for recurring charges, identifies subscriptions you likely forgot or no longer use, and surfaces a prioritized cancel-list — distinguishing “still using this” from “probably forgot this” rather than just listing every recurring charge.',
          target:
            'Broad across income bands, skewing toward people managing 8+ recurring subscriptions who’ve lost track; younger adults who accumulate free-trial-to-paid conversions; households consolidating finances after a move or life change.',
          currentState:
            'Manually scrolling statements line by line, or asking each service directly; dedicated tools like Rocket Money and features in Monarch or bank apps algorithmically detect recurring charges and offer one-click or concierge cancellation.',
          benefit: {
            claim:
              'C+R Research found the average American has 12+ active subscriptions, estimates their monthly spend at $86 but actually pays $219 — a ~$133/month (2.5×) blind spot — and that 42% admit they’ve kept paying for something after they stopped using it. Rocket Money reports its average member saving $700+/year, but that’s vendor-reported and combines cancellation with bill negotiation, so it shouldn’t be read as cancellation-alone savings.',
            source:
              'C+R Research subscription study; CNBC coverage; Rocket Money (vendor-reported).',
            tier: 2,
          },
        },
      },
      {
        name: 'Spending / net worth review',
        slug: 'spending-net-worth-review',
        blurb:
          'Where the money went this month, and the full asset, debt, and cash picture.',
        detail: {
          whatItDoes:
            'Combines a monthly spending breakdown (categorized, compared to prior months) with a consolidated net-worth statement — all assets minus all debts — for a single monthly snapshot of both flow (spending) and stock (net worth), instead of two disconnected views.',
          target:
            'Individuals and households with at least moderate financial complexity — a mortgage or investments, retirement accounts, maybe a taxable brokerage — roughly $60K–$300K household income, often near a life-stage checkpoint.',
          currentState:
            'Free aggregators like Empower already offer automated net-worth tracking tied to spending views; more basic users keep a manual spreadsheet updated quarterly or annually; higher-net-worth individuals may get this in an annual review from a fee-only planner, bundled into a broader engagement.',
          benefit: {
            claim:
              'No direct study measures time or dollars saved from combined spending-plus-net-worth reviews specifically. For cost context: a comprehensive one-time financial plan from a CFP typically costs $2,500–$5,000, and ongoing advisory had a median annual fee of $4,500 in 2024 — advisors deliver net-worth statements and spending reviews inside that broader, far more expensive engagement. An analogous cost benchmark (a full planning relationship, not an isolated review), flagged as approximate.',
            source:
              'Harness and Domain Money advisor-cost guides; Empower feature description.',
            tier: 2,
          },
        },
      },
      {
        name: 'Credit card optimizer',
        slug: 'credit-card-optimizer',
        blurb: 'The best card for each purchase, to make the most of rewards.',
        detail: {
          whatItDoes:
            'Given your set of cards and their reward structures — category bonuses, rotating quarters, sign-up spend requirements — recommends which card to use for a specific purchase or merchant category to maximize rewards, instead of defaulting to one habitual card for everything.',
          target:
            'Reward-motivated consumers holding two or more cards with different bonus categories, roughly middle-to-upper income ($50K–$200K) with good credit (irrelevant to anyone carrying revolving debt, where interest dwarfs any rewards); frequent travelers and points enthusiasts are a strong sub-segment.',
          currentState:
            'Most people default to one everyday card from habit, via memory or a phone note. Dedicated apps like CardPointers (~$63–$90/yr) and MaxRewards already track category bonuses across thousands of cards and prompt the optimal card at checkout.',
          benefit: {
            claim:
              'The CFPB found cardholders earned an average of just 1.6 cents in rewards per dollar in 2024 and estimated consumers forfeit roughly $500 million in rewards value a year to devaluation and redemption friction; Bankrate found 23% of cardholders redeemed no rewards at all last year. Some financial-content estimates suggest a household spending $60,000 a year could earn $900–$2,500 depending on strategy — that last figure is a general industry estimate, not an audited study, and flagged as approximate.',
            source:
              'Consumer Financial Protection Bureau credit-card-rewards spotlight; Bankrate 2025 statistics.',
            tier: 1,
          },
        },
      },
    ],
  },
  {
    name: 'Careers',
    slug: 'careers',
    description:
      'Find the next role and arrive prepared — from first search to interview.',
    items: [
      {
        name: 'Career explorer',
        slug: 'career-explorer',
        blurb: 'Personalized role, company, and skill-gap recommendations.',
        detail: {
          whatItDoes:
            'Takes your current skills, experience, and goals and produces a personalized map of viable role targets, fit-scored companies to pursue, and a specific skill-gap breakdown — a shortlist tied to your actual background, not generic “explore careers” browsing.',
          target:
            'Career changers weighing a pivot, recent graduates unsure which roles fit their degree, mid-career professionals feeling stuck, and returners re-entering the workforce — generally people earlier in the decision than active applicants.',
          currentState:
            'Mostly unstructured DIY research — browsing LinkedIn/Indeed titles, reading O*NET or BLS entries, asking friends, cross-referencing postings by hand to guess at skill gaps. Paid alternatives: a career coach ($75–$500+/hour) or narrower tools that compare a resume against one job description at a time.',
          benefit: {
            claim:
              'No direct benchmark exists for time saved by an AI career-mapping tool — stated plainly. As an approximate analog: workers report spending an average of 11 months deliberating before a career change, with 83% planning it in advance — today’s exploration phase is measured in months of informal research, not hours. A tool that compresses the research (not the reflection or decision) is reasoning from that gap, not a measured time saving.',
            source:
              'Career-change research via Zippia; Noomii and Thervo on coaching costs.',
            tier: 2,
          },
        },
      },
      {
        name: 'Interview prep',
        slug: 'interview-prep',
        blurb:
          'Technical, case, and behavioral preparation, specific to the company.',
        detail: {
          whatItDoes:
            'Generates interview prep tailored to both the role type (technical/coding, case, or behavioral) and the specific target company — likely questions, company context, and structured practice (like STAR-format behavioral answers) rather than a generic question bank.',
          target:
            'Candidates interviewing at a specific employer with limited lead time — new grads and career switchers facing unfamiliar formats, and working professionals prepping around a full-time job who can’t invest in an extended course.',
          currentState:
            'The free/DIY approach is Googling “[Company] interview questions,” Glassdoor and Blind threads, and generic behavioral lists, then self-practicing silently. Paid alternatives include platforms like Exponent or Interview Query (~$79/month) or 1:1 mock interviews (~$200/hour).',
          benefit: {
            claim:
              'No controlled study measures time saved by AI-generated, company-specific prep versus manual research — stated plainly. Directionally, the relevant frame is the gap between the ~4 hours candidates actually spend (a survey of 1,500+ accountants found ~60% spend 4 hours or less) and the 5–10+ hours guidance recommends; assembling company-specific material by hand plausibly consumes several of those hours before practice even begins. Reasoning from time allocation, not a measured figure.',
            source:
              'Indeed Career Advice citing accountant-workshop survey data; Exponent pricing; IGotAnOffer.',
            tier: 2,
          },
        },
      },
      {
        name: 'Resume editor / cover letter generator',
        slug: 'resume-cover-letter',
        blurb:
          'Recruiter-ready, ATS-aware resume and cover-letter drafting.',
        detail: {
          whatItDoes:
            'Drafts or rewrites a resume and matching cover letter that both parse cleanly through applicant tracking systems and read well to the human recruiter who sees them after — addressing “does it get through the filter” and “is it actually compelling” together.',
          target:
            'Active job seekers applying across multiple postings who need a resume that works across varied ATS platforms without hiring a writer for every version; candidates who suspect formatting, not qualifications, is costing them callbacks.',
          currentState:
            'Most people write their own in Word or a free builder with no ATS-specific formatting knowledge; tools like Jobscan or Teal offer keyword-match scoring against one job description; professional human resume writers run $100–$400 entry-level, $350–$750 mid-career, $600–$2,500 executive — usually one-time, not per-application.',
          benefit: {
            claim:
              'One thing we won’t repeat: the famous “75% of resumes rejected by ATS” stat traces to an unattributed 2013 source with no published method — treat it as fake. What is sourced: Jobscan found complex two-column templates had a 43% higher rejection rate than simple single-column ones, and a 1,000-resume analysis (EDLIGO, 2025) found single-column layouts parse at 93% versus 86%, with plain DOCX failing only 4% of the time versus 18% for PDFs. No study isolates time or cost saved by an AI drafting tool specifically; the case rests on those formatting failure rates plus the $100–$2,500 cost of a comparable human-written deliverable.',
            source:
              'Jobscan research via ResumeAdapter; EDLIGO 2025 parsing analysis; TopResume cost data.',
            tier: 2,
          },
        },
      },
      {
        name: 'Job finder',
        slug: 'job-finder',
        blurb:
          'Personalized job and internship matches, with outreach-ready notes.',
        detail: {
          whatItDoes:
            'Surfaces job and internship openings matched to your specific background and goals, and drafts ready-to-send outreach notes (to a hiring manager or alum) for each match — combining “find the role” and “get a foot in the door” into one step instead of two.',
          target:
            'Active job seekers and students seeking internships who apply broadly and want to also work the hidden job market via direct outreach, but lack the time or confidence to research and personalize a message for every target.',
          currentState:
            'Standard practice is manually searching LinkedIn, Indeed, and career pages and applying via “Easy Apply” in bulk — often with generic applications — while networking outreach, if done at all, is hand-written per contact after individually researching each person.',
          benefit: {
            claim:
              'LinkedIn’s own 2016–17 survey found 70% of people hired that year had an existing connection at the hiring company. Fair warning: the more dramatic “85% of jobs filled through networking” figure traces to a self-selected survey and shouldn’t be treated as rigorous. Personalized LinkedIn messages are reported to get 10–35% response rates (industry-reported, not a controlled study). No direct benchmark compares AI-matched jobs plus AI-drafted outreach to the DIY baseline; the case rests on that directional evidence plus the 15–30 minutes each personalized note takes by hand.',
            source:
              'LinkedIn 2016–17 hiring data via Zippia; Kondo on message response rates; The Interview Guys.',
            tier: 2,
          },
        },
      },
      {
        name: 'Scholarship and fellowship finder',
        slug: 'scholarship-finder',
        blurb: 'Matches with deadlines and eligibility signals.',
        detail: {
          whatItDoes:
            'Matches a student against scholarships and fellowships based on their eligibility profile — major, background, GPA, demographics, activities — and surfaces the matches alongside deadlines and the eligibility signals that made each relevant, turning a broad database search into a filtered, time-ordered shortlist.',
          target:
            'High-school seniors and undergraduates (and their parents) looking beyond FAFSA-based aid, plus graduate students seeking fellowships; especially valuable for first-generation students without a counselor or paid advisor who knows the landscape.',
          currentState:
            'Typically free aggregator sites (Fastweb, Scholarships.com, Bold.org, BigFuture) that require manually building a profile and scrolling hundreds of listings to check eligibility and deadlines one by one, plus a counselor’s personal knowledge where available.',
          benefit: {
            claim:
              'A commonly cited figure is that students spend around 60 hours searching for and applying to scholarships — but it’s repeated across secondary sources with no identifiable original study, so we flag it as rough and unverified. On the dollar side, government and industry estimates put $100 million+ in private scholarship money unclaimed annually, and $4.4 billion in Pell Grant money went unclaimed in 2024 (a related discovery problem). No controlled study isolates time saved by an AI matching tool; the case rests on that directional baseline and the scale of unclaimed funds.',
            source:
              'EducationData.org college-scholarship statistics; SoFi on unclaimed scholarships and grants.',
            tier: 2,
          },
        },
      },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    description:
      'Make sense of your labs, meals, and training in plain language.',
    items: [
      {
        name: 'Health review',
        slug: 'health-review',
        blurb: 'A comprehensive, actionable overview of your health.',
        detail: {
          whatItDoes:
            'Pulls together your available health information — self-reported history, prior records, recent labs, medications, lifestyle factors — into a single organized, plain-language overview that highlights patterns, flags gaps, and produces a prioritized list of things to discuss with a doctor or act on. An organizational and comprehension aid, not a diagnosis: it explains what already exists rather than generating new clinical findings.',
          target:
            'Health-conscious adults juggling scattered records across providers and portals, often managing a chronic condition or aging parents; people about to see a new doctor who want a coherent one-page history instead of a stack of PDFs.',
          currentState:
            'Fully manual — patients log into several portals, scroll PDFs, and either wing it verbally at the next appointment or spend hours building their own timeline. Some use a patient-advocate service ($75–$200/hour) or an executive physical ($2,500–$25,000) that bundles this with in-person testing. There’s no common affordable product that just organizes and explains existing records.',
          benefit: {
            claim:
              'No direct benchmark exists for time to compile a personal health overview. As an analog: physicians give patients an average of about 18.9 minutes of face-to-face time, with half of visits 15 minutes or less — so pre-visit organization falls entirely on the patient. And the comprehension gap is real: CDC data show only 12% of U.S. adults have proficient health literacy, and 35% basic or below. A framing for the need, not a measure of the product’s effect.',
            source:
              'CDC on health literacy; PBS NewsHour on visit length; PartnerMD and HealthyGuru on executive-physical cost.',
            tier: 2,
          },
        },
      },
      {
        name: 'Nutrition planner',
        slug: 'nutrition-planner',
        blurb: 'A meal plan aligned to your goals and your labs.',
        detail: {
          whatItDoes:
            'Builds a personalized meal plan that accounts for a stated goal (weight change, energy, a dietary pattern) and factors in relevant lab markers you already have (cholesterol, A1C, vitamin D) to shape food choices and flag things worth discussing with a clinician. Not a substitute for medical nutrition therapy for a diagnosed condition — a structured, informed starting plan.',
          target:
            'Adults with a specific, non-acute goal (weight management, pre-diabetes lifestyle change, general “get healthier” after a checkup) who have lab results in hand but no dietitian relationship; people who tried a generic app and found it doesn’t reference their actual labs.',
          currentState:
            'Most people follow a generic app (MyFitnessPal ~$20/mo, Noom ~$17–$59/mo) that ignores personal lab data, self-research via Google, or hire a registered dietitian directly. RD costs run $100–$300 for an intake and $50–$150 per follow-up, plus $50–$150/month for a dedicated meal-plan add-on.',
          benefit: {
            claim:
              'No controlled study measures an AI lab-informed meal plan against dietitian time-to-plan — treat this as a cost comparison, not an outcomes claim, plainly. An initial RD visit plus a first meal plan commonly totals $150–$400 out of pocket before monthly fees, versus generic tracking apps at $17–$20/month that don’t incorporate labs at all. No clinical study comparing AI-assisted to RD-only meal planning was found, and none is implied.',
            source:
              'ConsumerAffairs, Healthline, and Nourish on dietitian costs; Noom and MyFitnessPal pricing.',
            tier: 2,
          },
        },
      },
      {
        name: 'Lab results interpreter',
        slug: 'lab-results-interpreter',
        blurb: 'Lab results in plain language, with next steps.',
        detail: {
          whatItDoes:
            'Translates raw lab values, reference ranges, and flags into plain-language explanations of what each marker measures and why it might be out of range, and produces a next-steps list — an explanatory layer over an existing report, not a diagnosis of what the results mean clinically for you.',
          target:
            'Anyone who receives lab results via a patient portal before (or without) a follow-up call — a very common experience; people managing an ongoing condition who get quarterly panels; people with lower baseline health literacy or non-native English speakers who find standard lab formatting opaque.',
          currentState:
            'Fully manual — patients read a portal PDF full of abbreviations and ranges with no explanation, then wait for a callback that may not come or Google values one at a time. A JMIR study of 203 patients found that even with a reference range shown, patients struggle to judge whether a result is meaningfully abnormal, and ranked “timely explanation with follow-up instructions” as their top-desired portal feature (52.7%).',
          benefit: {
            claim:
              'No study directly times “AI plain-language lab explanation” against patient self-research, so this is reasoned from the closest data, flagged as such. Only 12% of U.S. adults have proficient health literacy (CDC), so most face real friction with standard lab reports, and Pew found that among adults searching online for health information, 61% spend 30 minutes or more per session — an analog for the time currently spent piecing together an explanation of one confusing report.',
            source:
              'Jimenez et al., JMIR (Dec 2020); CDC on health literacy; Pew Research “Health Online 2013.”',
            tier: 2,
          },
        },
      },
      {
        name: 'Fitness / sleep coach',
        slug: 'fitness-sleep-coach',
        blurb: 'Personalized workout and recovery guidance.',
        detail: {
          whatItDoes:
            'Generates a personalized workout program and recovery/sleep guidance based on your goals, current fitness, schedule, and available equipment, and adjusts over time as you report progress or setbacks. A structured programming and coaching layer, not a substitute for physical therapy or treatment of a diagnosed sleep disorder.',
          target:
            'Adults starting or restarting a routine without gym-based personal training; people whose main obstacle is poor sleep or recovery undermining consistency (shift workers, new parents, high-stress jobs); intermediate exercisers plateaued on a generic app template.',
          currentState:
            'Most people follow free generic templates (YouTube, influencer PDFs), use a tracking app with pre-built programs (MyFitnessPal ~$20/mo, Noom ~$17–$59/mo — neither built around individualized programming or sleep integration), or hire a human trainer. In-person training averages $55–$65/hour, $40 at budget gyms to $150+ at boutique studios, usually sold in packages of $160–$1,320/month.',
          benefit: {
            claim:
              'No public study benchmarks AI-generated program adherence or outcomes against human-trainer programs for general consumers — treat this as a cost comparison only, plainly, not an outcomes claim. Even a modest package of in-person training (8 sessions a month at the ~$55–$65/hour average) runs roughly $440–$520/month before any nutrition or recovery coaching, versus generic tracking apps at $17–$20/month that provide templates but not individualized, adapting programming.',
            source:
              'Thumbtack and FitBudd on personal-trainer costs; Noom and MyFitnessPal pricing; ISSA on coaching rates.',
            tier: 2,
          },
        },
      },
    ],
  },
];

/** Total number of catalog entries (used nowhere critical; handy for checks). */
export const roadmapCount = roadmap.reduce((n, c) => n + c.items.length, 0);

/** Flat list of every item that has its own one-pager, with its category. */
export const roadmapPages = roadmap.flatMap((category) =>
  category.items
    .filter((item) => item.slug && item.detail)
    .map((item) => ({ category, item }))
);
