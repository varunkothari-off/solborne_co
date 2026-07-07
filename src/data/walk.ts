/**
 * The Walk — voice-first intake flow. Naming and the fixed Part-1 questions.
 *
 * NAMING: the working name is the founder's pick, pending naming research.
 * It is deliberately defined ONCE here — change these three strings and the
 * whole site follows.
 */
export const walk = {
  /** The flow's name as shown in copy. */
  name: 'The Walk of Pain',
  /** Short form for the nav pill / buttons. */
  cta: 'Walk of Pain',
  /** Route. */
  path: '/walk/',
  /** Target duration surfaced in copy. */
  targetMinutes: 30,
} as const;

/**
 * Part labels ("Set A/B/C" is internal shorthand only — never shown).
 */
export const walkParts = [
  {
    key: 'one',
    label: 'In your words',
    blurb: 'Five questions, answered out loud. No typing, no forms — just say it the way you would to a colleague.',
  },
  {
    key: 'two',
    label: 'The right questions',
    blurb: 'From what you said, we work out the questions actually worth asking you — and ask only those.',
  },
  {
    key: 'three',
    label: 'Where to find you',
    blurb: 'A few typed facts so we can research you properly — your market, your competition, your customers.',
  },
] as const;

/**
 * Part 1 — the fixed voice questions, identical for everyone. Their job is to
 * surface the raw material from which Part 2's "right questions" are derived:
 * context → where time goes → the dread → what's been tried → the wish.
 */
export const partOneQuestions: readonly string[] = [
  'Tell us about your work — what do you do, and who do you do it for?',
  'Walk us through a normal week. Where does your time actually go?',
  'What part of your work do you dread — the thing that eats hours and gives little back?',
  'What have you already tried to fix it — tools, hires, AI, anything — and what actually happened?',
  'If one thing about how you work could be different six months from now, what would it be?',
];

/** Part 3 — the typed facts. Only name + email are mandatory. */
export interface WalkContactField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
}

export const partThreeFields: readonly WalkContactField[] = [
  { key: 'name', label: 'Your name', required: true, type: 'text' },
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'company', label: 'Company / firm', required: false, type: 'text' },
  { key: 'phone', label: 'Phone', required: false, type: 'tel', placeholder: '+91 98765 43210' },
  { key: 'website', label: 'Website', required: false, type: 'url', placeholder: 'https://…' },
  { key: 'linkedin', label: 'LinkedIn', required: false, type: 'url' },
  { key: 'socials', label: 'Other social profiles', required: false, type: 'textarea' },
  { key: 'news', label: 'Been in the news lately? Paste links', required: false, type: 'textarea' },
  { key: 'anything', label: 'Anything else we should look at', required: false, type: 'textarea' },
];
