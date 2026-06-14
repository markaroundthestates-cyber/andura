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
// Sentinel token marking a NAME-BASED lumbar-hinge / erector-extension exclusion
// for the disc/lower-back ('spate') persona. The deadlift/good-morning/squat/hip-
// thrust tokens already cover the heavy axial-hinge family, but the ERECTOR-EXTENSION
// family escapes a token match: Glute-Ham Raise keys as `raise`, Nordic as `curl`
// (both tokens shared with safe movements, so excluding the token would over-reach),
// and the hyperextension/back-extension variants key as `name:<...>`. These all load
// the lumbar erectors directly → contraindicated for a disc. isExcludedMovement
// detects them by NAME when this sentinel is in the exclusion set (mirrors the
// OVERHEAD_PRESS_SENTINEL). The spine-NEUTRAL leg curl (knee flexion, no axial load)
// is the safe backfill the leg-curl guarantee seats in their place.
export const LUMBAR_HINGE_SENTINEL = '__lumbar_hinge__';
// Erector-extension / GHR / Nordic family by NAME (direct lumbar-erector load).
const LUMBAR_HINGE_NAME_RE = /glute.?ham|nordic|hyperext|back\s*extension|roman\s*chair|\bghd\b|reverse\s*hyper/i;
// Sentinel token (dp_knee_safe_quads_v1) marking the KNEE-SAFE-QUADS exclusion:
// the loaded Leg Press family (token `leg-press`) PLUS the open-chain / single-leg
// deep-knee-flexion quad patterns that escape the squat/lunge/leg-extension tokens
// (Step-Up keys `name:<...>`, Sissy Squat keys `squat` already, Wall Sit keys
// `name:<...>`). The elite-coach signature for a knee-injury trainee is HIP-DOMINANT
// (RDL / leg curl / hip thrust), NOT a loaded bilateral quad-flexion machine — the
// /10 judge capped Leg Press as "loaded deep knee flexion w/o substitute". When this
// sentinel is in the exclusion set, isExcludedMovement ALSO drops the leg-press token
// and the name-based step-up / wall-sit, and poolForGroup is permitted to EMPTY the
// quads group (the leg day routes to the knee-safe posterior pool — the existing
// hamstring/posterior floors seat the substitute). OFF (flag off) → never added → the
// knee exclusion stays squat/lunge/leg-extension only → byte-identical.
export const KNEE_QUAD_SENTINEL = '__knee_quad__';
// Open-chain / single-leg deep-knee-flexion quad patterns by NAME (Step-Up loads the
// lead knee under deep flexion; Wall Sit is a sustained patellofemoral isometric).
// Sissy Squat already keys as the `squat` token (excluded). Caught only when the
// KNEE_QUAD sentinel is present.
const KNEE_DEEP_FLEXION_NAME_RE = /step.?up|wall\s*sit|sissy/i;
// Sentinel token (dp_shoulder_safe_v1) marking the SHOULDER-IMPINGEMENT escalation: the
// base umeri exclusion (OVERHEAD_PRESS_SENTINEL + `press` + upright-row) misses two
// impingement AGGRAVATORS — the BEHIND-THE-BACK / behind-neck lateral (keys as the
// `lateral-raise` token, which is otherwise a SAFE scapular-plane lateral that the
// lateral-delt guarantee depends on, so the token cannot be blanket-excluded) and a
// BEHIND-NECK press (keys as `name:<...>` or the angle-split, not the bare overhead-press
// name). When this sentinel is in the exclusion set, isExcludedMovement ALSO drops those
// by NAME. The `dip` token (deep dips, anterior-capsule load) is added directly in
// buildExclusionTokens (a real token match). Routes to the in-pool joint-friendly siblings
// (scapular-plane lateral / face pull / rear-delt / neutral-grip / landmine press). OFF
// (flag off) → never added → byte-identical.
export const SHOULDER_IMPINGE_SENTINEL = '__shoulder_impinge__';
// Behind-the-back / behind-neck lateral + behind-neck press by NAME (the impingement
// aggravators that the `lateral-raise` token / overhead-press name miss). "Behind-the-Back
// Cable Lateral" and any "behind-the-neck" / "behind neck" variant. Caught only when the
// SHOULDER_IMPINGE sentinel is present.
const SHOULDER_IMPINGE_NAME_RE = /behind.?the.?back|behind.?the.?neck|behind.?neck/i;
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
  // The deadlift/good-morning/squat/hip-thrust tokens cover the heavy AXIAL HINGE +
  // SQUAT + loaded hip-thrust. The LUMBAR_HINGE sentinel (name-based) ALSO kills the
  // erector-EXTENSION family (Glute-Ham Raise / Nordic / hyperextension / back-
  // extension / Roman chair / GHD / reverse hyper) — they load the lumbar erectors
  // directly, contraindicated for a disc, but escape a token match (GHR keys `raise`,
  // Nordic `curl`, the hypers `name:<...>`). Excluding them is SAFE only because the
  // leg-curl guarantee (sessionBuilder #R6b) backfills a spine-neutral Leg Curl in
  // their place — without the backfill, removing GHR would orphan hamstrings.
  spate: Object.freeze([LUMBAR_HINGE_SENTINEL, 'deadlift', 'good-morning', 'squat', 'hip-thrust']),
  // Shoulder impingement: the OVERHEAD_PRESS sentinel (name-based, since OHP/Smith
  // OHP key as `name:ohp` not the `press` token) + the bare `press` token + upright
  // row. The landmine/neutral carve-out keeps a safe vertical-push option.
  umeri: Object.freeze([OVERHEAD_PRESS_SENTINEL, 'press', 'upright-row']),
  // Knee (genunchi → picioare-quads + picioare-hamstrings, PAIN_REGION_GROUP_MAP):
  // kill the deep-flexion / high-patellofemoral-shear leg patterns — loaded SQUAT
  // (back/front/hack/goblet AND split-squat, which all key as the `squat` token),
  // walking LUNGE, and open-chain LEG-EXTENSION (terminal-range shear). Routes to
  // the knee-safe same-muscle siblings already ACTIVE in each pool: Leg Press
  // (closed-chain, controlled ROM — the spate path already proves it stays in-pool),
  // Leg Curl / Seated Leg Curl (hamstrings, no knee shear), Hip Thrust / Glute Drive
  // / Hip Abduction (glutes, no knee load), Romanian Deadlift (hip hinge). The
  // #81 audit + the /10 eval (Gigica-knee 84% capped) flagged the knee persona
  // STILL getting Hack Squat + Bulgarian Split Squat + Walking Lunge + Leg Extension
  // on every leg day — the contraindication map covered spate/umeri but NOT knee.
  'picioare-quads': Object.freeze(['squat', 'lunge', 'leg-extension']),
  'picioare-hamstrings': Object.freeze(['squat', 'lunge', 'leg-extension']),
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
 * @param {{ kneeSafeQuads?: boolean, shoulderSafe?: boolean }} [opts] -
 *   dp_knee_safe_quads_v1: when true AND a knee injury group is present, ALSO exclude the
 *   loaded Leg Press family + the open-chain step-up / wall-sit (the KNEE_QUAD sentinel) so
 *   the knee leg day is hip-dominant (RDL / leg curl / hip thrust). Default false →
 *   byte-identical (the knee exclusion stays squat/lunge/leg-extension only, Leg Press kept
 *   as today). dp_shoulder_safe_v1: when true AND a shoulder injury group (umeri) is
 *   present, ALSO exclude the `dip` token (deep dips) + the NAME-based behind-the-back /
 *   behind-neck lateral + behind-neck press (the SHOULDER_IMPINGE sentinel). Default false
 *   → the umeri exclusion stays OHP/press/upright-row only, Dip + BTB-lateral kept as today.
 * @returns {{ tokens: Set<string>, pressAllow: ReadonlyArray<string> }}
 *   tokens = movement tokens to hard-exclude; pressAllow = name substrings that
 *   re-permit an otherwise-excluded `press` (landmine/neutral).
 */
export function buildExclusionTokens(injuryGroups, refusedPatterns, opts) {
  const tokens = new Set();
  let hasKnee = false;
  let hasShoulder = false;
  for (const g of injuryGroups || []) {
    const list = INJURY_PATTERN_EXCLUSIONS[g];
    if (list) for (const t of list) tokens.add(t);
    if (g === 'picioare-quads' || g === 'picioare-hamstrings') hasKnee = true;
    if (g === 'umeri') hasShoulder = true;
  }
  for (const r of refusedPatterns || []) {
    const list = REFUSAL_PATTERN_TOKENS[r];
    if (list) for (const t of list) tokens.add(t);
  }
  // dp_knee_safe_quads_v1 — escalate the knee exclusion to a HIP-DOMINANT leg day:
  // drop the loaded Leg Press family + the open-chain deep-flexion patterns and signal
  // poolForGroup that quads may go empty (the knee-safe posterior pool carries the day).
  if (opts && opts.kneeSafeQuads && hasKnee) {
    tokens.add('leg-press');
    tokens.add(KNEE_QUAD_SENTINEL);
  }
  // dp_shoulder_safe_v1 — escalate the shoulder-impingement exclusion: drop deep DIPs (a
  // real `dip` token match) + signal isExcludedMovement to NAME-drop the behind-the-back /
  // behind-neck lateral + behind-neck press (the SHOULDER_IMPINGE sentinel). The safe
  // scapular-plane lateral / face pull / rear-delt / neutral-grip / landmine press are
  // already in-pool, so removing the aggravators routes to a joint-friendly substitute.
  if (opts && opts.shoulderSafe && hasShoulder) {
    tokens.add('dip');
    tokens.add(SHOULDER_IMPINGE_SENTINEL);
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
  // NAME-BASED lumbar erector-extension (GHR / Nordic / hyperextension / back-
  // extension / Roman chair / GHD / reverse hyper) — caught even though its token is
  // `raise` / `curl` / `name:<...>` (token-excluding those would over-reach onto safe
  // movements). Disc-contraindicated; the leg-curl guarantee seats a safe substitute.
  if (excl.tokens.has(LUMBAR_HINGE_SENTINEL) && LUMBAR_HINGE_NAME_RE.test(lower)) {
    return true;
  }
  // NAME-BASED knee deep-flexion (Step-Up / Wall Sit / Sissy) — caught even though
  // Step-Up / Wall Sit key as `name:<...>`. The loaded Leg Press is the bare `leg-press`
  // token (caught below). Only when the KNEE_QUAD sentinel is present (dp_knee_safe_quads_v1).
  if (excl.tokens.has(KNEE_QUAD_SENTINEL) && KNEE_DEEP_FLEXION_NAME_RE.test(lower)) {
    return true;
  }
  // NAME-BASED shoulder-impingement aggravators (Behind-the-Back Cable Lateral / behind-
  // neck lateral / behind-neck press) — caught even though the BTB lateral keys as the
  // SAFE `lateral-raise` token (a scapular-plane lateral the lateral-delt guarantee needs,
  // so the token can't be blanket-excluded) and a behind-neck press keys as `name:<...>`.
  // The `dip` token is the bare token (caught below). Only when the SHOULDER_IMPINGE
  // sentinel is present (dp_shoulder_safe_v1).
  if (excl.tokens.has(SHOULDER_IMPINGE_SENTINEL) && SHOULDER_IMPINGE_NAME_RE.test(lower)) {
    return true;
  }
  if (!excl.tokens.has(movementToken)) return false;
  // The `press` token (DB/Machine/Seated shoulder press) — landmine/neutral allowed.
  if (movementToken === 'press' && allowed) return false;
  return true;
}
