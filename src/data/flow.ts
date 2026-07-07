/**
 * THE FLOW — Solborne is one journey, not a menu of services. Everything a
 * client experiences runs through these stages in order; the workflow catalog
 * (roadmap.ts) is what gets delivered INSIDE the flow. Some stages are free,
 * some paid — where exactly payment begins is a founder decision still open
 * (see docs/go-live-checklist.md), so untagged stages carry no price claim.
 */
import { walk } from './walk';

export interface FlowStage {
  key: string;
  name: string;
  /** 'Free' | 'Paid' | '' — empty = no public claim yet. */
  tag: string;
  blurb: string;
  href?: string;
}

export const flow: FlowStage[] = [
  {
    key: 'walk',
    name: walk.name,
    tag: 'Free',
    blurb:
      'Say it out loud — five plain questions, then the questions your answers earn, then a few facts so we can research you properly. Under thirty minutes for most people.',
    href: walk.path,
  },
  {
    key: 'read',
    name: 'The preliminary read',
    tag: 'Free',
    blurb:
      'Built live on your member dashboard from your own words and our research on you — where the hours go, where AI genuinely fits, and where it does not.',
    href: '/login/',
  },
  {
    key: 'screening',
    name: 'The AI screening call',
    tag: '',
    blurb:
      'Thirty minutes, maximum. Our agent goes deeper than the walk could; schedule it the moment your read is in, or whenever suits.',
  },
  {
    key: 'review',
    name: 'Human review',
    tag: '',
    blurb:
      'Our reviewers go through the screening by hand. If more is needed, we come back to you — the agent for small gaps, a person when it matters.',
  },
  {
    key: 'experts',
    name: 'Expert verification',
    tag: '',
    blurb:
      'Panel experts from the industries that touch your business check the work. After your first screening you can also book one directly.',
  },
  {
    key: 'audit',
    name: 'The final audit',
    tag: 'Paid',
    blurb:
      'The full, verified read: where AI earns its keep in your work, with confidence stated on every call, mapped into a roadmap you can run without us.',
  },
  {
    key: 'build',
    name: 'Implementation & retainer',
    tag: 'Paid',
    blurb:
      'If you want it built, we build it — workflow by workflow from the catalog below — and keep it honest under a retainer, with a human review every month.',
  },
];
