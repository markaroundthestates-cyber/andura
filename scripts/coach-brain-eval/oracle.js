// Coach Brain Eval — Claude oracle adapter (level 2).
//
// Per COACH_BRAIN_EVAL_DESIGN.md §4.3 + §7.1/§7.2: feed the SAME EngineContext
// to Claude that the pipeline saw (fairness), give it the engine framework
// vocabulary (semantics, NOT a parallel rubric), get a structured per-dimension
// decision back, compare. temperature: 0 for stability.
//
// Cost control: on-disk JSON cache keyed by a hash of (model + prompt) so reruns
// are free; serial calls with a small inter-call delay (rate-limit friendly).
// Uses native fetch against the Anthropic Messages API — NO SDK dependency
// added (surgical: keep package.json untouched).
//
// Honesty: if ANTHROPIC_API_KEY is absent, callOracle reports { skipped:true }
// and the harness runs invariants only.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.COACH_EVAL_MODEL || 'claude-opus-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/** Whether the oracle can run in this environment. */
export function oracleAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ── Identical-input serializer (§2.3) ────────────────────────────────────────
// Serialize ONLY the EngineContext the pipeline consumes. No extra prose, no
// hidden fields — anti-fairness-risk #1 (§7.2). Deterministic key order.
export function serializeEngineContextForJudge(ctx) {
  const safe = (o) => (o && typeof o === 'object' ? o : {});
  const u = safe(ctx.user);
  const meta = safe(ctx.meta);
  return {
    user: {
      sex: u.sex ?? null,
      age: u.age ?? null,
      kg: u.kg ?? null,
      bf: u.bf ?? null,
      experience: u.experience ?? null,
      goal: u.goal ?? null,
      persona: u.persona ?? null,
      joints: u.joints ?? null,
      energyEmoji: u.energyEmoji ?? null,
    },
    profileTier: ctx.profileTier ?? null,
    recentSessions: Array.isArray(ctx.recentSessions) ? ctx.recentSessions : [],
    weights: safe(ctx.weights),
    meta: {
      weeksElapsed: meta.weeksElapsed ?? null,
      emoji: meta.emoji ?? null,
      observations: Array.isArray(meta.observations) ? meta.observations : [],
    },
  };
}

// ── Framework-context dictionary (§4.3) ───────────────────────────────────────
// Gives Claude the SAME conceptual terrain as the engine (a coach who knows the
// Andura model), not a competing best-practices rubric. Concise on purpose.
const FRAMEWORK_CONTEXT = `You are the gold-standard coaching oracle for Andura, a Romanian fitness PWA.
You judge the SAME coaching decisions the deterministic engine makes, using Andura's model vocabulary:

- MESOCYCLE PHASE: 4-week cycle. weekInMesocycle = (weeksElapsed % 4) + 1.
  Week 1 = LOAD, Week 2 = LOAD+, Week 3 = PEAK, Week 4 = DELOAD (non-negotiable recovery week).
- DELOAD STATE: IDLE (no deload), SCHEDULED_LINEAR (calendar week-4 deload), REACTIVE_COMPOSITE / REACTIVE_AA (fatigue-triggered, deeper), RESOLVING.
  Scheduled depth ~ 45%. Reactive deloads are deeper than scheduled.
- GOAL PHASE (nutrition framing): CUT (deficit), BULK (surplus), MAINTAIN, RECOMP (recomposition).
- ENERGY STATE: green (ready to push), yellow (caution), red (distressed -> back off). Source: user.energyEmoji.
- TDEE DIRECTION: deficit / surplus / maintenance — the energy-balance direction implied by recent weight trend + intake.
- ADJUSTMENT DIRECTION: up / hold / down — session-level load nudge from readiness (green->up, red->down, yellow->hold).
- SPECIALIZATION: extra volume for a lagging muscle. 4-gate: only Marius-tier (advanced, age<30) AND tier T1+ AND bulk/recomp AND no injury. Otherwise off.
- VOLUME corridor: Israetel MEV<=target<=MRV per muscle. Persona modifier: maria 0.50, gigica 0.70, marius 1.00. Goal modifier scales it.
- SAFETY: kcal floor 1200 (sub-floor intake excluded from learning). Injury (joints / recent injury session) reduces volume + blocks specialization.

Decide ONLY from the structured EngineContext given. Do NOT invent facts not present in the input.`;

const OUTPUT_INSTRUCTIONS = `Return ONLY a JSON object (no markdown, no prose) with these keys (omit a key if you genuinely cannot judge it from the input):
{
  "phase": "LOAD|LOAD+|PEAK|DELOAD",
  "deloadState": "IDLE|SCHEDULED_LINEAR|REACTIVE_COMPOSITE|REACTIVE_AA|RESOLVING",
  "deloadDepthPct": <number 0-100 or null>,
  "goalPhase": "CUT|BULK|MAINTAIN|RECOMP",
  "energyState": "green|yellow|red",
  "adjustmentDirection": "up|hold|down",
  "tdeeDirection": "deficit|surplus|maintenance",
  "specialization": "on|off",
  "rationale": { "<dimension>": "<one short reason>" }
}`;

function buildPrompt(serializedCtx) {
  return `${FRAMEWORK_CONTEXT}

EngineContext (the exact input the engine received):
${JSON.stringify(serializedCtx, null, 2)}

${OUTPUT_INSTRUCTIONS}`;
}

// ── On-disk cache ─────────────────────────────────────────────────────────────
function cacheKey(model, prompt) {
  return createHash('sha256').update(`${model}\n${prompt}`).digest('hex').slice(0, 32);
}

function loadCache(cachePath) {
  if (!cachePath || !existsSync(cachePath)) return {};
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cachePath, cache) {
  if (!cachePath) return;
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function extractJson(text) {
  if (typeof text !== 'string') return null;
  // Strip code fences if present, then grab the first {...} block.
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Call the Claude oracle for one EngineContext.
 *
 * @param {object} ctx - frozen EngineContext (same object the pipeline ran)
 * @param {{ model?:string, cache?:object, cachePath?:string, delayMs?:number, maxTokens?:number }} [opts]
 * @returns {Promise<{ ok:boolean, skipped?:boolean, cached?:boolean, output?:object, raw?:string, error?:string }>}
 */
export async function callOracle(ctx, opts = {}) {
  if (!oracleAvailable()) {
    return { ok: false, skipped: true, error: 'ANTHROPIC_API_KEY not set' };
  }
  const model = opts.model || DEFAULT_MODEL;
  const serialized = serializeEngineContextForJudge(ctx);
  const prompt = buildPrompt(serialized);
  const key = cacheKey(model, prompt);

  const cache = opts.cache || loadCache(opts.cachePath);
  if (cache[key]) {
    return { ok: true, cached: true, output: cache[key].output, raw: cache[key].raw };
  }

  if (opts.delayMs) await sleep(opts.delayMs);

  let resp;
  try {
    resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens || 700,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    return { ok: false, error: `fetch failed: ${e.message}` };
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    return { ok: false, error: `HTTP ${resp.status}: ${body.slice(0, 200)}` };
  }

  const data = await resp.json();
  const text = Array.isArray(data.content)
    ? data.content.map((c) => (c && c.type === 'text' ? c.text : '')).join('')
    : '';
  const output = extractJson(text);
  if (!output) {
    return { ok: false, error: 'could not parse JSON from oracle response', raw: text };
  }

  cache[key] = { output, raw: text };
  if (opts.cachePath) saveCache(opts.cachePath, cache);
  return { ok: true, cached: false, output, raw: text };
}

export { buildPrompt, FRAMEWORK_CONTEXT, loadCache, saveCache, cacheKey, extractJson };
