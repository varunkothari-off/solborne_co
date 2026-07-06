/**
 * Service catalog — first-draft content derived from the Phase 0 pricing
 * research (USD/global storefront). Every string here is DRAFT COPY;
 * pages that render it carry the <!-- DRAFT COPY --> marker.
 *
 * NOTE FOR VARUN: prices are shown publicly on the Services page in this
 * draft. Whether to display pricing at all is flagged in the README
 * "Decisions needed" list.
 */
export interface Service {
  slug: string;
  name: string;
  price: string;
  priceNote: string;
  summary: string;
  deliverables: string[];
  flagship?: boolean;
}

export const services: Service[] = [
  {
    slug: 'diagnostic',
    name: 'Free Diagnostic',
    price: '$0',
    priceNote: 'self-serve · no call required',
    summary:
      'Eight plain questions about your firm and how work actually flows through it. You get an honest first read on where AI is worth your attention — and where it is not. The diagnostic is the one thing we don’t hand-check — paid work always is.',
    deliverables: [
      'A short written read on your situation — automated, which is what makes it free',
      'The one or two areas worth a closer look',
      'No sales call attached',
    ],
  },
  {
    slug: 'opportunity-audit',
    name: 'AI Opportunity Audit',
    price: '$1,497',
    priceNote: 'flat fee · fixed scope',
    summary:
      'The full version of the question the diagnostic opens: where, specifically, would AI earn its keep in your practice? Answered rigorously, checked by a human, and mapped into a roadmap you can act on without us.',
    deliverables: [
      'Audit of your workflows against current AI capability',
      'A prioritized roadmap with confidence levels on each call',
      'Human-verified before it reaches you',
    ],
    flagship: true,
  },
  {
    slug: 'module-build',
    name: 'Module Build',
    price: '$2,500',
    priceNote: 'per module · one-off',
    summary:
      'One working module for one job — legal research, contract review, intake triage — built for your practice, tested against your documents, and handed over with the keys.',
    deliverables: [
      'One production module, scoped to one job',
      'Tested against your real documents',
      'Handover and training included — you own it',
    ],
  },
  {
    slug: 'retainer-starter',
    name: 'Managed Retainer — Starter',
    price: '$990',
    priceNote: 'per month',
    summary:
      'One live module, kept honest. We monitor output quality, review a sample by hand every month, and tell you plainly when something drifts.',
    deliverables: [
      'One live module under management',
      'Monthly human quality review',
      'Standard response times',
    ],
  },
  {
    slug: 'retainer-pro',
    name: 'Managed Retainer — Pro',
    price: '$1,900',
    priceNote: 'per month',
    summary:
      'Multiple modules under the same discipline, with priority turnaround and a named reviewer who knows your practice.',
    deliverables: [
      'Multiple modules under management',
      'Priority turnaround and a named QA reviewer',
      'Faster escalation when something needs a human now',
    ],
  },
  {
    slug: 'readiness-assessment',
    name: 'Readiness Assessment',
    price: '$6,900',
    priceNote: 'fixed engagement',
    summary:
      'For larger firms: a full-depth assessment of where your organization actually stands with AI — capability, risk, and sequence — with a roadmap your own team can run.',
    deliverables: [
      'Organization-wide readiness assessment',
      'Sequenced roadmap with confidence levels',
      'Board-ready summary in plain language',
    ],
  },
];
