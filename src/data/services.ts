/**
 * Service catalog (USD/global storefront; INR track deferred by design —
 * do not surface currency anywhere).
 *
 * PRICING GATE: price figures are deliberately NOT stored or rendered.
 * Every place a price once appeared now carries a CTA toward the free
 * diagnostic. The USD figures live in the Phase 0 research (docs/, not
 * committed) and in git history if ever needed again. `priceNote`
 * describes the pricing model (flat fee, per month), never a number.
 */
export interface Service {
  slug: string;
  name: string;
  priceNote: string;
  summary: string;
  deliverables: string[];
  flagship?: boolean;
}

/*
 * NOTE: the free diagnostic is deliberately NOT in this catalog. It is the
 * lead-capture flow at /diagnostic/ — the way in, not a service — so it never
 * appears in the services listing, the nav dropdown, or service highlights.
 */
export const services: Service[] = [
  {
    slug: 'opportunity-audit',
    name: 'AI Opportunity Audit',
    priceNote: 'flat fee · fixed scope',
    summary:
      'The full version of the question the diagnostic opens: where, specifically, would AI earn its keep in your practice? Answered rigorously, checked by a human, and mapped into a roadmap you can act on without us.',
    deliverables: [
      'Audit of your workflows against current AI capability',
      'A prioritized roadmap with confidence levels on each call',
      'Checked by a human before it reaches you',
    ],
    flagship: true,
  },
  {
    slug: 'module-build',
    name: 'Module Build',
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
