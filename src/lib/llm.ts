/**
 * LLM seam for the walk: generates Part 2's "right questions" from the Part 1
 * transcripts, and generates the preliminary report on the members dashboard.
 *
 * Real provider: Anthropic Claude API via plain fetch (no SDK dependency).
 * Stub while ANTHROPIC_API_KEY is absent/placeholder: deterministic canned
 * output, clearly labelled, zero network calls.
 *
 * Cost notes (verified 2026-07-07): default model claude-sonnet-5 at
 * $2/$10 per MTok intro pricing — question generation ≈ $0.01/walk, a
 * researched report ≈ $0.15–0.40/walk. Set LLM_MODEL in .env to override.
 */
import { envVar, realEnv } from './env';
import { roadmap } from '../data/roadmap';

export interface WalkAnswerInput {
  section: string;
  question: string;
  transcript: string;
}

export interface WalkReport {
  headline: string;
  sections: { title: string; body: string }[];
  matches: { slug: string; name: string; reason: string }[];
  /** true when produced by the stub — surfaced in the UI. */
  stub: boolean;
}

export interface LlmProvider {
  readonly name: string;
  readonly isStub: boolean;
  generateWalkQuestions(answers: WalkAnswerInput[]): Promise<string[]>;
  generateWalkReport(input: {
    answers: WalkAnswerInput[];
    contact: Record<string, unknown>;
  }): Promise<WalkReport>;
}

/** Compact catalog context so the report maps pain to real workflows. */
function catalogContext(): string {
  const lines: string[] = [];
  for (const category of roadmap) {
    for (const item of category.items) {
      if (item.slug) lines.push(`${item.slug} | ${item.name} | ${category.name} | ${item.blurb}`);
    }
  }
  return lines.join('\n');
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

function model(): string {
  return envVar('LLM_MODEL') || 'claude-sonnet-5';
}

async function anthropicCall(body: Record<string, unknown>): Promise<string> {
  const apiKey = realEnv('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`anthropic call failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  // Concatenate text blocks (tool-use blocks from web_search are interleaved).
  return (data.content ?? [])
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/** Pull the first JSON object/array out of a model reply, tolerant of prose. */
function extractJson<T>(text: string): T {
  const start = Math.min(
    ...['{', '['].map((c) => {
      const i = text.indexOf(c);
      return i === -1 ? Number.POSITIVE_INFINITY : i;
    })
  );
  if (!Number.isFinite(start)) throw new Error('no JSON in model reply');
  // Walk back from the end to find the matching close.
  for (let end = text.length; end > start; end -= 1) {
    const candidate = text.slice(start, end).trim();
    if (!candidate.endsWith('}') && !candidate.endsWith(']')) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      /* keep shrinking */
    }
  }
  throw new Error('unparseable JSON in model reply');
}

const anthropicProvider: LlmProvider = {
  name: 'anthropic',
  isStub: false,

  async generateWalkQuestions(answers: WalkAnswerInput[]): Promise<string[]> {
    const transcripts = answers
      .map((a, i) => `Q${i + 1}: ${a.question}\nTHEY SAID: ${a.transcript}`)
      .join('\n\n');
    const text = await anthropicCall({
      model: model(),
      max_tokens: 1500,
      system:
        'You are the intake engine for Solborne & Co., an independent AI advisory. ' +
        'Voice: calm, plain, honest, no hype, no exclamation marks, no jargon. ' +
        'Your one job: from what a visitor SAID out loud, find THE RIGHT QUESTIONS to ask them next — ' +
        'the questions that reframe their situation and surface what actually matters ' +
        '(the way "Are you better off than you were four years ago?" reframed an election). ' +
        'As many or as few as are genuinely right: 3 if 3 are right, 9 if 9 are right (max 12). ' +
        'Each must be specific to what THEY said (quote their own words where it sharpens the question), ' +
        'answerable out loud in under two minutes, and free of assumptions they did not state. ' +
        'Return ONLY a JSON array of question strings. No preamble.',
      messages: [{ role: 'user', content: transcripts }],
    });
    const questions = extractJson<string[]>(text);
    if (!Array.isArray(questions) || questions.length < 1) {
      throw new Error('model returned no questions');
    }
    return questions.slice(0, 12).map((q) => String(q).slice(0, 1000));
  },

  async generateWalkReport({ answers, contact }): Promise<WalkReport> {
    const transcripts = answers
      .map((a) => `[part ${a.section}] ${a.question}\nTHEY SAID: ${a.transcript}`)
      .join('\n\n');
    const facts = Object.entries(contact)
      .filter(([k, v]) => v && k !== 'email' && k !== 'phone')
      .map(([k, v]) => `${k}: ${String(v).slice(0, 500)}`)
      .join('\n');

    const body: Record<string, unknown> = {
      model: model(),
      max_tokens: 4000,
      system:
        'You are the preliminary-audit engine for Solborne & Co., an independent AI advisory. ' +
        'Voice: calm, plain, honest, no hype, no exclamation marks; confidence gets stated plainly, ' +
        'and what you do NOT know is stated just as plainly. Never invent facts about the person. ' +
        'You are given (1) a visitor\'s spoken answers about their work and pain, ' +
        '(2) typed facts (company, links), and (3) Solborne\'s workflow catalog. ' +
        'If web search is available, research their company/site/links briefly to sharpen the read. ' +
        'Produce a PRELIMINARY audit report as ONLY a JSON object: ' +
        '{"headline": string (one calm sentence naming their core pain in their own words), ' +
        '"sections": [{"title": string, "body": string}] (4-6 sections: what we heard; where the hours are going; ' +
        'where AI genuinely fits — and where it does not; what we found from research (omit if nothing found); ' +
        'what we would verify next), ' +
        '"matches": [{"slug": string (MUST be a slug from the catalog), "name": string, "reason": string}] (2-5 best-fit workflows)}. ' +
        'This is preliminary and automated — say so in the final section and point to the screening call as the next step. ' +
        'No markdown syntax inside strings; plain sentences.\n\nCATALOG (slug | name | category | what it does):\n' +
        catalogContext(),
      messages: [
        {
          role: 'user',
          content: `SPOKEN ANSWERS:\n${transcripts}\n\nTYPED FACTS:\n${facts || '(none provided)'}`,
        },
      ],
    };

    // Server-side web research on the visitor (their site, socials, news) —
    // capped to keep cost ~$0.05-0.10/report. If the tool is unavailable on
    // this account/model, fall back to a no-research report rather than fail.
    let text: string;
    try {
      text = await anthropicCall({
        ...body,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }],
      });
    } catch (err) {
      console.warn('[llm] web_search unavailable, generating without research:', err);
      text = await anthropicCall(body);
    }
    const parsed = extractJson<Omit<WalkReport, 'stub'>>(text);
    if (!parsed.headline || !Array.isArray(parsed.sections)) {
      throw new Error('model returned malformed report');
    }
    const validSlugs = new Set(
      roadmap.flatMap((c) => c.items.map((i) => i.slug)).filter(Boolean)
    );
    return {
      headline: String(parsed.headline).slice(0, 500),
      sections: parsed.sections.slice(0, 8).map((s) => ({
        title: String(s.title).slice(0, 200),
        body: String(s.body).slice(0, 5000),
      })),
      matches: (parsed.matches ?? [])
        .filter((m) => validSlugs.has(String(m.slug)))
        .slice(0, 5)
        .map((m) => ({
          slug: String(m.slug),
          name: String(m.name).slice(0, 200),
          reason: String(m.reason).slice(0, 1000),
        })),
      stub: false,
    };
  },
};

// STUB: replaced by the real Anthropic call once ANTHROPIC_API_KEY is set —
// see docs/human-steps-checklist.md step 1. Zero network calls.
const llmStub: LlmProvider = {
  name: 'llm-stub',
  isStub: true,

  async generateWalkQuestions(answers: WalkAnswerInput[]): Promise<string[]> {
    const mention = answers[2]?.transcript?.slice(0, 60) ?? 'the work you described';
    return [
      `You mentioned "${mention}…" — walk us through the last time that actually happened, start to finish.`,
      'Of everything you described, which single task would you pay to never do again — and what makes it so costly?',
      'Who else touches this work before it is done — and where does it wait on someone?',
      'If this were fixed tomorrow, what would you do with the reclaimed time — honestly?',
    ];
  },

  async generateWalkReport({ answers }): Promise<WalkReport> {
    return {
      headline:
        'Preview report — the real, researched read switches on when the Anthropic key is added.',
      sections: [
        {
          title: 'What we heard',
          body:
            `You answered ${answers.length} questions out loud. In preview mode we cannot ` +
            'analyse them — this placeholder proves the pipeline: your words were captured, ' +
            'transcribed, and will be read in full when generation goes live.',
        },
        {
          title: 'What the real report contains',
          body:
            'Where your hours are going, where AI genuinely fits (and where it does not), ' +
            'what we found researching you from the links you gave, and what we would verify ' +
            'next — each claim stated with its confidence, plainly.',
        },
        {
          title: 'Preliminary, by design',
          body:
            'The automated read is the start, not the verdict. The screening call and a human ' +
            'review come next — nothing reaches you as final without a person checking it.',
        },
      ],
      matches: [],
      stub: true,
    };
  },
};

export function llmProvider(): LlmProvider {
  return realEnv('ANTHROPIC_API_KEY') ? anthropicProvider : llmStub;
}
