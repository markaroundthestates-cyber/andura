// ══ #81 — HARD movement-pattern EXCLUSION (contraindicated / refused) ════════
//
// DB boundary (contraindicatedGroupsFromPainCdl) reads the append-only Pain CDL
// with an INJECTED clock — the SAME pattern getDailyWorkout's recovery path uses
// (date.getTime()), NOT the React builder's Date.now() injury signal (which is
// stale against a planned/back-dated clock). The pure predicates below take plain
// groups/refusals so they stay testable without I/O.
// Fresh-eyes audit H2: the pain/refusal signal lowers VOLUME on a region but does
// NOT REMOVE the contraindicated MOVEMENT PATTERN from the candidate pool — so a
// disc-herniation user still got Romanian Deadlift + Goblet Squat + Hip Thrust and
// a "refuses squat/deadlift" user still got Hack Squat + RDL.
//
// This module is PURE DATA + PURE PREDICATES (no I/O). It maps an injury region or
// an explicit refusal to the movement tokens (sessionBuilder.movementKey vocabulary)
// that must be HARD-EXCLUDED from selection, plus a name-level allowance for the
// safe variants inside an otherwise-excluded token (landmine/neutral shoulder press).
//
// The EXCLUSION itself is applied in sessionBuilder.poolForGroup, which DROPS the
// contraindicated entry UNLESS it is the muscle's last option (anti-empty-leg-day):
// the same last-option guard the pain-swap / penalty paths already rely on. Because
// the safe same-muscle siblings (Leg Press / Leg Curl / Leg Extension / Lunge /
// Hip Abduction / Cable Kickback / Lateral Raise / Face Pull / Landmine press) are
// already ACTIVE members of each group's pool, removing the contraindicated movement
// is sufficient to route to a safe substitute — the chain alternative is already
// in-pool (no injection needed).
//
// SAFETY fix (NOT an experiment): contraindicated movements must never ship, so the
// caller applies this whenever a real injury/refusal signal exists. A user with NO
// injury + NO refusal yields an EMPTY exclusion set → poolForGroup is byte-identical.

import { DB } from '../db.js';
import { PAIN_REGION_GROUP_MAP } from './muscleRecoveryConstants.js';

const PAIN_CDL_KEY = 'pain-cdl';
const MS_DAY = 86400000;

// Sentinel token (not a real movementKey token) marking a NAME-BASED overhead-press
// exclusion: OHP / Smith OHP key as `name:ohp`, not the `press` token, so a token
// match alone misses them. isExcludedMovement detects the overhead-press by name
// when this sentinel is in the exclusion set.
export const OVERHEAD_PRESS_SENTINEL = '__overhead_press__';
// Overhead vertical-push press by NAME (the aggravator under shoulder impingement).
const OVERHEAD_PRESS_NAME_RE = /\bohp\b|overhead\s*press|shoulder\s*press|military\s*press|push\s*press|arnold\s*press/i;
// Lookback for a Pain CDL report to count as a CURRENT contraindication. Matches
// INJURY_LOOKBACK_DAYS (scheduleAdapterAggregate.injury.ts) so the exclusion + the
// pipeline injury gate agree on "recent".
const INJURY_LOOKBACK_DAYS = 42;

/**
 * Big-11 RO groups loaded by a CURRENT Pain CDL report — read directly from the
 * append-only `pain-cdl` channel with an INJECTED clock so it stays correct under a
 * planned/back-dated clock (the React builder's Date.now() injury signal does not).
 * Only reports within INJURY_LOOKBACK_DAYS count. Pure but for the DB read.
 *
 * @param {number} now epoch ms reference for the lookback window
 * @returns {string[]} deduped Big-11 RO groups (the injury exclusion keys)
 */
export function contraindicatedGroupsFromPainCdl(now) {
  const raw = /** @type {any} */ (DB.get(PAIN_CDL_KEY));
  const entries = Array.isArray(raw) ? raw : [];
  const groups = new Set();
  for (const e of entries) {
    if (!e || e.type !== 'pain' || typeof e.region !== 'string') continue;
    const ts = Number(e.ts);
    if (!Number.isFinite(ts)) continue;
    const daysAgo = Math.floor((now - ts) / MS_DAY);
    if (daysAgo < 0 || daysAgo > INJURY_LOOKBACK_DAYS) continue;
    for (const g of PAIN_REGION_GROUP_MAP[e.region] ?? []) groups.add(g);
  }
  return [...groups];
}

/**
 * Injury region (Big-11 RO group surfaced by the Pain CDL) → the movement tokens
 * that loading pattern contraindicates. Tokens are the sessionBuilder.movementKey
 * second-segment vocabulary (`<group>::<token>`).
 *
 *  - 'spate' (lombar / lower-back / disc): no heavy AXIAL HINGE (deadlift / RDL /
 *    good-morning) and no heavy AXIAL SQUAT (back/front/goblet) and no loaded
 *    hip-thrust (a loaded bar across the hips still compresses the lumbar spine —
 *    the audit flagged Hip Thrust 160kg). → routes to back-supported machines that
 *    stay in-pool: Leg Press (quads), Leg Curl / Leg Extension (no spinal load),
 *    Cable Glute Kickback / Hip Abduction (glutes, no axial load).
 *  - 'umeri' (shoulder impingement): no OVERHEAD press (the bare `press` token on
 *    umeri, EXCEPT the neutral/landmine variants — see SHOULDER_PRESS_ALLOW) and no
 *    upright row. → routes to lateral raise / rear delt / face pull / landmine.
 *
 * @type {Readonly<Record<string, ReadonlyArray<string>>>}
 */
export const INJURY_PATTERN_EXCLUSIONS = Object.freeze({
  // Disc / lower-back: kill the spinal-loading patterns across the leg/glute groups.
  spate: Object.freeze(['deadlift', 'good-morning', 'squat', 'hip-thrust']),
  // Shoulder impingement: the OVERHEAD_PRESS sentinel (name-based, since OHP/Smith
  // OHP key as `name:ohp` not the `press` token) + the bare `press` token + upright
  // row. The landmine/neutral carve-out keeps a safe vertical-push option.
  umeri: Object.freeze([OVERHEAD_PRESS_SENTINEL, 'press', 'upright-row']),
});

/**
 * Explicit user-refused movement family key → excluded movement tokens. The user
 * says "I don't squat / don't deadlift" → that PATTERN never appears (distinct from
 * the in-session one-tap skip #15: this is a PERSISTED hard exclusion).
 *
 * @type {Readonly<Record<string, ReadonlyArray<string>>>}
 */
export const REFUSAL_PATTERN_TOKENS = Object.freeze({
  squat: Object.freeze(['squat']),
  deadlift: Object.freeze(['deadlift', 'good-morning']),
  hinge: Object.freeze(['deadlift', 'good-morning']),
  lunge: Object.freeze(['lunge']),
  'hip-thrust': Object.freeze(['hip-thrust']),
  'overhead-press': Object.freeze(['press']),
});

// Shoulder-press variants that are SAFE under impingement (neutral-grip / landmine /
// machine-guided arc) and therefore NOT excluded even though their movementKey is
// `umeri::press`. Matched as a case-insensitive substring of the exercise name.
const SHOULDER_PRESS_ALLOW = Object.freeze(['landmine', 'neutral']);

/**
 * Build the exclusion descriptor consumed by poolForGroup: a set of excluded
 * `<group>::<token>` movement-keys is too coarse (token + group), so instead we
 * return a PREDICATE-friendly shape: a map of excluded TOKENS plus the allow-list
 * for the shoulder-press carve-out. poolForGroup tests each candidate's movementKey
 * token against this set.
 *
 * @param {Iterable<string>} injuryGroups - Big-11 RO groups from the Pain CDL signal
 * @param {Iterable<string>} refusedPatterns - explicit refusal keys (REFUSAL_PATTERN_TOKENS)
 * @returns {{ tokens: Set<string>, pressAllow: ReadonlyArray<string> }}
 *   tokens = movement tokens to hard-exclude; pressAllow = name substrings that
 *   re-permit an otherwise-excluded `press` (landmine/neutral).
 */
export function buildExclusionTokens(injuryGroups, refusedPatterns) {
  const tokens = new Set();
  for (const g of injuryGroups || []) {
    const list = INJURY_PATTERN_EXCLUSIONS[g];
    if (list) for (const t of list) tokens.add(t);
  }
  for (const r of refusedPatterns || []) {
    const list = REFUSAL_PATTERN_TOKENS[r];
    if (list) for (const t of list) tokens.add(t);
  }
  return { tokens, pressAllow: SHOULDER_PRESS_ALLOW };
}

/**
 * Is this exercise a HARD-EXCLUDED (contraindicated / refused) movement?
 * `movementToken` = the second segment of sessionBuilder.movementKey
 * (`<group>::<token>` → token). The shoulder-press carve-out: a `press` token is
 * NOT excluded when the name is a neutral-grip / landmine variant (safe under
 * impingement). A name keyed as `name:<...>` (no recognized token) is never
 * excluded — conservative, only known patterns are gated.
 *
 * @param {string} name - exercise name
 * @param {string} movementToken - movementKey token (post `::`)
 * @param {{ tokens: Set<string>, pressAllow: ReadonlyArray<string> }} excl
 * @returns {boolean}
 */
export function isExcludedMovement(name, movementToken, excl) {
  if (!excl || !excl.tokens || excl.tokens.size === 0) return false;
  const lower = typeof name === 'string' ? name.toLowerCase() : '';
  const allowed = (excl.pressAllow || []).some((s) => lower.includes(s));
  // NAME-BASED overhead-press (OHP / Smith OHP / Arnold / Push Press) — caught even
  // though its token is `name:ohp`. Honors the landmine/neutral carve-out.
  if (excl.tokens.has(OVERHEAD_PRESS_SENTINEL) && OVERHEAD_PRESS_NAME_RE.test(lower) && !allowed) {
    return true;
  }
  if (!excl.tokens.has(movementToken)) return false;
  // The `press` token (DB/Machine/Seated shoulder press) — landmine/neutral allowed.
  if (movementToken === 'press' && allowed) return false;
  return true;
}
