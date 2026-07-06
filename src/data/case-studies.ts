/**
 * Case study registry. Both entries are placeholders awaiting real client
 * write-ups — their pages render a clearly marked "coming soon" stub with
 * no engagement specifics. The `sector` values are unconfirmed placeholders
 * and are not rendered anywhere on the site.
 * When real case studies exist, consider migrating this to an Astro
 * content collection (see README).
 */
export interface CaseStudy {
  slug: string;
  name: string;
  sector: string;
  status: 'coming-soon' | 'published';
  teaser: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'myndshyp',
    name: 'MyNDSHyP',
    sector: 'Placeholder sector — to be confirmed',
    status: 'coming-soon',
    teaser:
      'A full write-up of this engagement is in preparation. It will follow the same rule as our advice: what we did, what worked, what didn’t, and the numbers — plainly stated.',
  },
  {
    slug: 'kothari-financial-services',
    name: 'Kothari Financial Services',
    sector: 'Placeholder sector — to be confirmed',
    status: 'coming-soon',
    teaser:
      'A full write-up of this engagement is in preparation. It will follow the same rule as our advice: what we did, what worked, what didn’t, and the numbers — plainly stated.',
  },
];
