// ══ MUSCLE RECOVERY — Per-group recovery state + lagging detection ═══════
// Aggregate per-muscle-head recovery (MUSCLE_HEADS recoveryHours) into broad
// groups Big 11 canonical V1 anatomical taxonomy per ADR_ENGINE_REFACTOR §4.1
// LOCK V1 2026-05-14 (piept/spate/umeri/biceps/triceps/antebrate/core/
// picioare-quads/picioare-hamstrings/fese/gambe). Plus lagging detection:
// muscles sub-volume 2+ saptamani vs equal Big 11 active-group distribution.
//
// Time-dependent functions (recovery decay + recency cutoffs read the wall
// clock). Inject `now` (default Date.now at I/O boundary) for deterministic
// testing per ADR 026 §9. No DB / DOM deps. Inputs: logs array.
// ZERO mutation algorithm semantics per §4.1 (FATIGUED/PARTIAL thresholds
// preserved; aggregation preserved; refactor = taxonomy expansion only).
//
// Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §9 — Pain CDL + Recovery Engine
// wire-through documented; recovery state thresholds (FATIGUED=35, PARTIAL=12)
// + volume redistribution multipliers (recovered=1.00, partial=0.80,
// fatigued=0.60) cataloged for cross-engine audit gate.

import { getMuscleState, musclesForExercise, MUSCLE_HEADS, learnedRecoveryHours } from './muscleMap.js';
import { MS_PER_DAY, MS_PER_HOUR } from '../constants.js';
import { isEnabled } from '../util/featureFlags.js';
import {
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  BIG11_GROUPS,
  PAIN_REGION_GROUP_MAP,
} from './muscleRecoveryConstants.js';

// Big 11 canonical V1 group taxonomy — maps muscle heads → broad group for UI.
// Re-export from constants for backwards-compatible import path.
export const GROUP_HEAD_MAP = GROUP_HEAD_MAP_BIG11;

const GROUP_LABELS_RO = GROUP_LABELS_RO_BIG11;

// Re-export Big 11 constants for downstream cross-engine consumption.
export { GROUP_HEAD_MAP_BIG11, GROUP_LABELS_RO_BIG11, BIG11_GROUPS };

// State thresholds — getMuscleState returns 0-100 (higher = more recent stress).
// Calibrated against typical session contribution: ~22.5 per primary muscle head
// at peak (no decay, rpe 1.0). Two-three primary hits on same head ~= fatigued.
const FATIGUED_THRESHOLD = 35;
const PARTIAL_THRESHOLD  = 12;

// ══ DOSE + UNACCUSTOMED RECOVERY SCALING (dp_recovery_dose_v1) ════════════════
// The decay window for a head is its recoveryHours in getMuscleState's exponent
// exp(-K·h/recovH); a LONGER window = a slower decay = the group reads stressed
// longer. The flat model decays only with TIME — blind to two real drivers of a
// longer recovery window the founder felt live (2026-06-11): a muscle that took a
// BIG dose of volume in one session needs longer, and a muscle hit after a LONG
// layoff has lost its repeated-bout protection so unfamiliar volume bites longer
// (DOMS prolonged). This scales the window UP (never down) for those two cases,
// so a typical dose on an accustomed muscle is EXACTLY ×1.0 — byte-identical to
// the flat model, keeping the QA-F9 calibration (RECOVERY_DECAY_K=1.8 anchors:
// legs fatigued@24h / Easing@4.3d / recovered by the next legs day; shoulders
// fatigued the evening after 11 sets) true for the typical-dose / common-muscle
// case. The stretch only fires at high dose or after a layoff.
//
// PURE: derives everything from `logs` (the same persisted sessions the rest of
// this module reads); injectable `now`; no clock/DB/DOM. OFF (flag off) → no map
// → getMuscleState runs on the global/learned hours exactly as before.

// Dose: ratio of sets-to-head in the stressful session vs the user's TYPICAL
// per-head session dose. ×1.0 at typical, ramping to a capped stretch at a big
// dose. The cap keeps a monster session from pinning a group fatigued forever.
const DOSE_FACTOR_MAX = 1.6;
// Floor for "typical dose" so a first/sparse history does not read a normal 3-4
// set session as a huge multiple of a tiny baseline (→ false stretch). 3 sets is
// a single working exposure — at or below it, dose is treated as typical (×1.0).
const TYPICAL_DOSE_FLOOR = 3;
// How far back to look when learning the user's typical per-head session dose.
const DOSE_LOOKBACK_DAYS = 42;

// Unaccustomed: days between the stressful session and the head's PREVIOUS
// exposure. Below MIN the repeated-bout protection still holds (×1.0). Ramps
// linearly to MAX at FULL days of layoff (repeated-bout effect ~gone at 3+ wks).
const UNACCUSTOMED_MIN_DAYS = 10;
const UNACCUSTOMED_FULL_DAYS = 21;
const UNACCUSTOMED_FACTOR_MAX = 1.4;

// Total window stretch is clamped so the composed factor can never explode.
const RECOVERY_SCALE_CAP = 1.8;

// Group same-session sets by calendar day (a "session" = one training day). A
// head touched by N exercise-sets that day = N sets toward that head's dose.
const _dayKey = (/** @type {number} */ ts) => Math.floor(ts / MS_PER_DAY);

/**
 * Median of a numeric array (sorted copy; mean of the two middles for even n).
 * @param {number[]} arr
 * @returns {number}
 */
function _median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * For one muscle head, derive { stressSets, typicalDose, layoffDays } from logs:
 *   - stressSets  = sets touching the head in its MOST-RECENT training day.
 *   - typicalDose = median sets/head across that head's training days in the
 *     DOSE_LOOKBACK_DAYS window (floored at TYPICAL_DOSE_FLOOR).
 *   - layoffDays  = days between the most-recent day and the PREVIOUS day the
 *     head was trained (null if there is no prior exposure → cold start).
 * A set counts when the head is primary OR secondary (same attribution the
 * decay kernel loads it under). PURE.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} head
 * @param {number} now
 * @returns {{stressSets: number, typicalDose: number, layoffDays: number|null}|null}
 *   null when the head was never trained.
 */
function _headDoseSignal(logs, head, now) {
  /** @type {Map<number, number>} */
  const setsByDay = new Map(); // dayKey → sets touching this head that day
  for (const log of logs || []) {
    if (!log || log.baseline || !log.ex) continue;
    const ms = musclesForExercise(log.ex); // QA-F8: curated OR metadata-derived
    if (!ms) continue;
    const touches = (ms.primary || []).includes(head) || (ms.secondary || []).includes(head);
    if (!touches) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (!ts) continue;
    const key = _dayKey(ts);
    setsByDay.set(key, (setsByDay.get(key) ?? 0) + 1);
  }
  if (setsByDay.size === 0) return null;

  const days = [...setsByDay.keys()].sort((a, b) => a - b);
  const mostRecentDay = days[days.length - 1];
  const prevDay = days.length >= 2 ? days[days.length - 2] : null;

  const stressSets = setsByDay.get(mostRecentDay) ?? 0;
  const layoffDays = prevDay === null ? null : mostRecentDay - prevDay;

  // Typical dose: per-day set counts inside the lookback window (excluding the
  // stress day itself so a single huge day does not inflate its own baseline).
  const cutoffDay = _dayKey(now) - DOSE_LOOKBACK_DAYS;
  /** @type {number[]} */
  const priorDoses = [];
  for (const d of days) {
    if (d === mostRecentDay) continue;
    if (d < cutoffDay) continue;
    priorDoses.push(setsByDay.get(d) ?? 0);
  }
  const typicalDose = Math.max(TYPICAL_DOSE_FLOOR, priorDoses.length ? _median(priorDoses) : 0);

  return { stressSets, typicalDose, layoffDays };
}

/**
 * Dose multiplier in [1.0, DOSE_FACTOR_MAX]. Sets at/under the typical dose →
 * exactly 1.0 (the F9 anchor case). Above typical it ramps linearly with the
 * excess ratio, capped. PURE.
 * @param {number} stressSets
 * @param {number} typicalDose
 * @returns {number}
 */
function _doseFactor(stressSets, typicalDose) {
  if (!(typicalDose > 0) || !(stressSets > typicalDose)) return 1.0;
  const ratio = stressSets / typicalDose; // > 1
  return Math.min(DOSE_FACTOR_MAX, ratio);
}

/**
 * Unaccustomed multiplier in [1.0, UNACCUSTOMED_FACTOR_MAX] from the layoff gap.
 * No prior exposure (null) → 1.0 (cold start: nothing to be un-accustomed to).
 * < MIN days → 1.0 (protection intact). Linear ramp MIN→FULL, capped. PURE.
 * @param {number|null} layoffDays
 * @returns {number}
 */
function _unaccustomedFactor(layoffDays) {
  if (layoffDays === null || layoffDays <= UNACCUSTOMED_MIN_DAYS) return 1.0;
  if (layoffDays >= UNACCUSTOMED_FULL_DAYS) return UNACCUSTOMED_FACTOR_MAX;
  const t = (layoffDays - UNACCUSTOMED_MIN_DAYS) / (UNACCUSTOMED_FULL_DAYS - UNACCUSTOMED_MIN_DAYS);
  return 1.0 + t * (UNACCUSTOMED_FACTOR_MAX - 1.0);
}

/**
 * Build the per-head recovery-hours map for getMuscleState's `learnedHours`
 * arg, applying the dose × unaccustomed window stretch on top of a base-hours
 * source (the learned map when present, else the MUSCLE_HEADS globals). Each
 * head's hours = baseHours × clamp(doseFactor × unaccustomedFactor, 1.0, CAP).
 * A head with no stress signal, or a typical dose on an accustomed muscle, keeps
 * its base hours UNCHANGED — so when nothing qualifies the returned map equals
 * the base hours and getMuscleState is byte-identical to its OFF path. PURE.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {number} now
 * @param {Record<string, number>|null} [baseHours] — base recovery hours per head
 *   (learned override). Omitted/null → MUSCLE_HEADS globals.
 * @returns {Record<string, number>} per-head recovery hours (stretched where it applies)
 */
export function buildDoseScaledRecoveryHours(logs, now = Date.now(), baseHours = null) {
  const heads = /** @type {Record<string, {recoveryHours:number}>} */ (MUSCLE_HEADS);
  const baseFor = (/** @type {string} */ m) =>
    (baseHours && Number.isFinite(baseHours[m]) && baseHours[m] > 0
      ? baseHours[m]
      : heads[m]?.recoveryHours) || 48;
  /** @type {Record<string, number>} */
  const out = {};
  for (const m of Object.keys(heads)) {
    const base = baseFor(m);
    const sig = _headDoseSignal(logs, m, now);
    if (!sig) { out[m] = base; continue; }
    const mult = Math.min(
      RECOVERY_SCALE_CAP,
      _doseFactor(sig.stressSets, sig.typicalDose) * _unaccustomedFactor(sig.layoffDays),
    );
    out[m] = base * mult;
  }
  return out;
}

// Pain CDL -> Recovery escalation (ADR-ENGINE-MATH-LOCKED-VALUES section 9).
// Section 9 wires the consumption but does NOT lock a numeric pain->recovery
// formula, so the mechanism below is the simplest contract aligned with the
// section 8 intensity->action branching + section 9 volume-redistribution
// multipliers:
//   intensity 1 (usor)  -> suggest_alternative -> escalate to >= 'partial'  (0.80x)
//   intensity 2 (mediu) -> reduce_volume        -> escalate to >= 'partial'  (0.80x)
//   intensity 3 (sever) -> skip                 -> escalate to 'fatigued'    (0.60x)
// Escalation only RAISES the computed state (never lowers): a recovered group
// with recent pain becomes partial/fatigued; an already-fatigued group stays.
// Pain is acute — only entries within PAIN_RECENCY_DAYS influence recovery so a
// one-off report does not dampen the group indefinitely.
const PAIN_RECENCY_DAYS = 3;
/** @type {Record<'recovered'|'partial'|'fatigued', number>} */
const STATE_RANK = { recovered: 0, partial: 1, fatigued: 2 };
const STATE_BY_RANK = ['recovered', 'partial', 'fatigued'];

/**
 * Build per-group recovery state map.
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs — workout logs (db.js logs shape)
 * @param {Array<{type?: string, region?: string, intensity?: 1|2|3, ts?: number}>} [painEntries] — append-only pain CDL (DB('pain-cdl')), read at I/O boundary
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @param {{doseScaling?: boolean}} [opts] — when `doseScaling` is true AND the
 *   dp_recovery_dose_v1 flag is enabled, the per-head recovery window is stretched
 *   by the dose × unaccustomed factors (see buildDoseScaledRecoveryHours). Omitted
 *   / flag OFF → no stretch → byte-identical to the time-only decay.
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function getRecoveryByGroup(logs, painEntries, now = Date.now(), opts) {
  // Stretch over the SAME base getMuscleState would have used: the learned
  // per-muscle map when dp_learned_recovery_v1 is on (passing scaledHours as the
  // learnedHours arg SHADOWS getMuscleState's internal learned read — without
  // this the dose path would silently drop the learned hours), else globals.
  const scaledHours =
    opts?.doseScaling && isEnabled('dp_recovery_dose_v1')
      ? buildDoseScaledRecoveryHours(logs, now, learnedRecoveryHours())
      : undefined;
  const headState = /** @type {Record<string, number>} */ (
    scaledHours ? getMuscleState(logs, now, scaledHours) : getMuscleState(logs, now)
  );
  /** @type {{[group:string]: 'recovered'|'partial'|'fatigued'}} */
  const groupState = {};
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  for (const [group, heads] of Object.entries(headMap)) {
    if (heads.length === 0) {
      groupState[group] = 'recovered';
      continue;
    }
    const max = heads.reduce((m, h) => Math.max(m, headState[h] ?? 0), 0);
    if (max >= FATIGUED_THRESHOLD)      groupState[group] = 'fatigued';
    else if (max >= PARTIAL_THRESHOLD)  groupState[group] = 'partial';
    else                                groupState[group] = 'recovered';
  }
  applyPainEscalation(groupState, painEntries, now);
  return groupState;
}

// ══ AEROBIC → RECOVERY (light, fast-recovery cardio touch) ════════════════
// Aerobic CLASSES (aerobicStore) load muscles too, but cardio fatigue is NOT
// resistance fatigue: it is a light, broad, fast-recovering touch. So an aerobic
// session may EASE a group (recovered -> partial / "Easing") but NEVER drives it
// deep "Loaded"/fatigued, and it clears fast (~24h window) instead of the 48-96h
// resistance recovery. The body map should reflect "you moved that yesterday"
// without crying deep fatigue.
//
// Per-class muscle gradient (real aerobic movement: marching, jacks, knee lifts,
// grapevine, lunges, butt kicks, burpees / mountain climbers):
//   core dominant (every move) · legs heavy · upper light · arms light isometric.
//   NOTHING is fully untouched. Spinning is the exception — legs + core dominant,
//   minimal upper. Values are 0..1 RELATIVE intensity per Big-11 group.
/** @type {Record<string, Record<string, number>>} */
export const AEROBIC_GROUP_GRADIENT = {
  // General studio aerobics / step / zumba / "alta" share the full-body gradient.
  aerobic: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.7, gambe: 0.7,
    umeri: 0.35, piept: 0.3, triceps: 0.3, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
  step: {
    core: 1.0,
    'picioare-quads': 0.9, fese: 0.85, 'picioare-hamstrings': 0.7, gambe: 0.8,
    umeri: 0.3, piept: 0.25, triceps: 0.25, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
  zumba: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.65, gambe: 0.7,
    umeri: 0.4, piept: 0.3, triceps: 0.3, spate: 0.35,
    biceps: 0.25, antebrate: 0.2,
  },
  // Spinning: legs + core dominant, minimal upper (still nothing fully zero —
  // the torso braces, the arms hold the bars).
  spinning: {
    core: 0.9,
    'picioare-quads': 1.0, fese: 0.85, 'picioare-hamstrings': 0.8, gambe: 0.7,
    umeri: 0.15, piept: 0.15, triceps: 0.15, spate: 0.2,
    biceps: 0.15, antebrate: 0.15,
  },
  // Generic "other class" — same broad full-body gradient as aerobic.
  alta: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.7, gambe: 0.7,
    umeri: 0.35, piept: 0.3, triceps: 0.3, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
};

// Cardio clears fast — a 24h light-touch window. Beyond it an aerobic session no
// longer eases any group (a single rest day fully resets the cardio touch).
const AEROBIC_RECOVERY_WINDOW_HOURS = 24;
// A group whose decayed aerobic load clears this bar reads "Easing" (partial).
// Tuned so a same-day / recent class eases its dominant groups (core + legs)
// while the light upper-body touch stays mostly below the bar — honest: cardio
// barely taxes the upper body.
const AEROBIC_EASE_THRESHOLD = 0.35;

// UPPER-BODY groups a GENERIC full-body class (aerobic/step/zumba/alta) should NOT
// ease (dp_aerobic_load_cap_v1). A generic studio class genuinely taxes legs+core,
// not chest/back/shoulders/arms — the gradient's upper weights (e.g. aerobic umeri
// 0.35) sit AT the ease threshold, so a single such class would wrongly read the
// upper body as eased and cut a both-user's push/pull resistance volume. The
// classification is tightened so generic classes only ease legs + core.
const AEROBIC_UPPER_GROUPS = new Set(['umeri', 'piept', 'triceps', 'spate', 'biceps', 'antebrate']);
// Generic full-body class types whose upper-body touch is over-fired. Spinning is
// EXCLUDED (its upper weights are already 0.15-0.20, well below the threshold, and
// it is legitimately leg-dominant) so its honest minimal touch is preserved.
const AEROBIC_GENERIC_TYPES = new Set(['aerobic', 'step', 'zumba', 'alta']);

/**
 * Per-group "Easing" contribution from recent aerobic CLASSES. Pure. Returns a
 * partial map: only groups the recent cardio actually eased appear (value
 * 'partial'); everything else is omitted (caller treats absent as no aerobic
 * touch). Cardio is capped at 'partial' by design — it never reports 'fatigued'.
 *
 * @param {Array<{type?: string, ts?: number, date?: string}>} sessions — aerobicStore sessions
 * @param {number} [now] — reference timestamp (default Date.now); inject for tests
 * @returns {{[group:string]: 'partial'}}
 */
export function getAerobicRecoveryContribution(sessions, now = Date.now()) {
  /** @type {{[group:string]: number}} */
  const load = {};
  if (!Array.isArray(sessions)) return {};
  const windowMs = AEROBIC_RECOVERY_WINDOW_HOURS * 60 * 60 * 1000;
  for (const s of sessions) {
    if (!s || typeof s.type !== 'string') continue;
    const gradient = AEROBIC_GROUP_GRADIENT[s.type];
    if (!gradient) continue;
    // Recency must reflect WHEN THE CLASS HAPPENED, not when it was logged.
    // Backward logging (decision #45): a class logged TODAY for a PAST day keeps
    // a fresh `ts` (= now) but an older `date`. Anchoring on `ts` would read a
    // days-old class as "just done" and ease groups it shouldn't.
    //   - When `ts` falls on the SAME calendar day as `date` it is a genuine
    //     real-time log → use `ts` (precise, and never in the future).
    //   - Otherwise (backdated, or `ts` absent) anchor on the day's NOON so a
    //     past day reads as past and today's morning log never lands in the
    //     future (noon-anchoring `ts` on the current day could).
    const rawTs = typeof s.ts === 'number' ? s.ts : 0;
    const noonTs = s.date ? new Date(`${s.date}T12:00:00`).getTime() : 0;
    let ts;
    if (rawTs && noonTs) {
      const tsDay = new Date(rawTs);
      const sameDay = `${tsDay.getFullYear()}-${String(tsDay.getMonth() + 1).padStart(2, '0')}-${String(tsDay.getDate()).padStart(2, '0')}` === s.date;
      ts = sameDay ? rawTs : noonTs;
    } else {
      ts = rawTs || noonTs;
    }
    if (!ts) continue;
    const hoursAgo = (now - ts) / (60 * 60 * 1000);
    if (hoursAgo < 0 || hoursAgo > AEROBIC_RECOVERY_WINDOW_HOURS) continue;
    // Linear fade across the 24h window (light + fast: a class eases most right
    // after, and is gone by the next day).
    const decay = 1 - (now - ts) / windowMs;
    // dp_aerobic_load_cap_v1 (cycle-25b): two coupled corrections for the upper-body
    // false-ease (a both-user's push/pull resistance volume cut ~20% when it shouldn't):
    //   (a) a GENERIC full-body class (aerobic/step/zumba/alta) only eases legs+core —
    //       its upper-body touch is dropped so a single such class can't ease the upper
    //       body (the gradient's umeri 0.35 sat AT the threshold), and
    //   (b) each group's accumulated load is CAPPED at the single-class max (Math.max,
    //       not +=) so STACKING N classes can never push a group past one class's
    //       genuine touch (N spin classes no longer accumulate the torso into eased).
    // OFF → the original additive accumulation over the full gradient (byte-identical).
    const capOn = isEnabled('dp_aerobic_load_cap_v1');
    const generic = capOn && AEROBIC_GENERIC_TYPES.has(s.type);
    for (const [group, weight] of Object.entries(gradient)) {
      if (generic && AEROBIC_UPPER_GROUPS.has(group)) continue; // generic class: legs+core only
      const contribution = weight * decay;
      load[group] = capOn
        ? Math.max(load[group] ?? 0, contribution) // cap at one class's genuine touch
        : (load[group] ?? 0) + contribution;       // legacy: additive accumulation
    }
  }
  /** @type {{[group:string]: 'partial'}} */
  const out = {};
  for (const [group, value] of Object.entries(load)) {
    if (value >= AEROBIC_EASE_THRESHOLD) out[group] = 'partial';
  }
  return out;
}

/**
 * Merge the aerobic "Easing" contribution into a resistance recovery-state map
 * (from getRecoveryByGroup). Cardio only RAISES a 'recovered' group to 'partial'
 * — it never deepens an already-stressed group and never reaches 'fatigued'. So
 * a muscle the user lifted heavy stays 'fatigued'/'partial' from the weights;
 * one only touched by cardio shows 'partial' (Easing). Returns a NEW map.
 *
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} resistanceState
 * @param {Array<{type?: string, ts?: number, date?: string}>} aerobicSessions
 * @param {number} [now]
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function mergeAerobicRecovery(resistanceState, aerobicSessions, now = Date.now()) {
  const aerobic = getAerobicRecoveryContribution(aerobicSessions, now);
  /** @type {{[group:string]: 'recovered'|'partial'|'fatigued'}} */
  const merged = { ...resistanceState };
  for (const [group, state] of Object.entries(aerobic)) {
    // Only lift a recovered group up to partial — never lower a stressed one.
    if ((merged[group] ?? 'recovered') === 'recovered') merged[group] = state;
  }
  return merged;
}

/**
 * Escalate group recovery states from recent pain CDL entries (in place).
 * now is an injectable reference timestamp (default Date.now — same
 * time-relative convention as sibling daysSinceGroup / getLaggingMuscles which
 * also accept an injectable now). Empty/missing painEntries is a no-op (conservative
 * baseline preserved when the adapter has no pain CDL to pass).
 *
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} groupState — mutated in place
 * @param {Array<{type?: string, region?: string, intensity?: number, ts?: number}>|undefined} painEntries
 * @param {number} [now] — reference timestamp for recency cutoff
 */
function applyPainEscalation(groupState, painEntries, now = Date.now()) {
  if (!Array.isArray(painEntries) || painEntries.length === 0) return;
  const regionMap = /** @type {Record<string, string[]>} */ (PAIN_REGION_GROUP_MAP);
  const cutoff = now - PAIN_RECENCY_DAYS * MS_PER_DAY;
  for (const entry of painEntries) {
    if (!entry || entry.type !== 'pain' || !entry.region) continue;
    const ts = typeof entry.ts === 'number' ? entry.ts : 0;
    if (ts < cutoff) continue;
    const groups = regionMap[entry.region];
    if (!groups) continue;
    // intensity 3 (sever) -> fatigued; 1/2 (usor/mediu) -> at least partial.
    const escalatedRank = entry.intensity === 3 ? STATE_RANK.fatigued : STATE_RANK.partial;
    for (const group of groups) {
      const currentRank = STATE_RANK[groupState[group]] ?? 0;
      if (escalatedRank > currentRank) {
        groupState[group] = /** @type {'recovered'|'partial'|'fatigued'} */ (STATE_BY_RANK[escalatedRank]);
      }
    }
  }
}

/**
 * Most-recent timestamp (epoch ms) of a session that touched a given group, or
 * null if the group was never trained. Single source of truth for the
 * elapsed-time helpers below: session.ts is epoch ms and carries time-of-day, so
 * the raw timestamp preserves sub-day (hour-level) precision that day-floored
 * callers would otherwise lose. Pure.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @param {number} [now] — reference timestamp; future-dated logs (ts > now, clock
 *   skew / timezone) are ignored so a downstream elapsed-hours never goes negative.
 * @returns {number|null} — epoch ms of the last-trained session, or null if never trained
 */
function lastTrainedTsForGroup(logs, group, now = Date.now()) {
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  const heads = new Set(headMap[group] || []);
  if (heads.size === 0) return null;
  let latest = 0;
  for (const log of logs || []) {
    if (log.baseline || !log.ex) continue;
    const muscles = musclesForExercise(log.ex); // QA-F8: curated OR metadata-derived
    if (!muscles) continue;
    const touchesGroup = [...(muscles.primary || []), ...(muscles.secondary || [])]
      .some(h => heads.has(h));
    if (!touchesGroup) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts > now) continue; // skip a future-dated log (would yield negative elapsedHours)
    if (ts > latest) latest = ts;
  }
  return latest === 0 ? null : latest;
}

/**
 * REAL elapsed HOURS since the last session targeting a given group (NOT floored
 * to whole days). This is the honest rest-gap signal: a session at 18:00 read at
 * 07:00 the next morning is ~13h — sub-minimal for the same group — even though
 * daysSinceGroup would floor it to 0/1 "day" and read it as a full rest. Pairs
 * with getRecoveryByGroup (which already decays per-hour) so the daily plan and
 * narrative speak the same hour-accurate truth.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {number|null} — elapsed hours (float), or null if never trained
 */
export function hoursSinceGroup(logs, group, now = Date.now()) {
  const latest = lastTrainedTsForGroup(logs, group, now);
  if (latest === null) return null;
  return (now - latest) / MS_PER_HOUR;
}

/**
 * Days since last session targeting a given group (floored). Kept for callers
 * that genuinely want whole-day buckets; derives from the same last-trained
 * timestamp as hoursSinceGroup (single source of truth).
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {number|null} — null if never trained
 */
export function daysSinceGroup(logs, group, now = Date.now()) {
  const latest = lastTrainedTsForGroup(logs, group, now);
  if (latest === null) return null;
  return Math.floor((now - latest) / MS_PER_DAY);
}

/**
 * Per-group recovery DETAIL — the clean machine signal a narrative layer words.
 * For every Big-11 group, exposes BOTH the recovery `state`
 * ('recovered'|'partial'|'fatigued', already hour-accurate via getMuscleState's
 * per-hour decay) AND the REAL `elapsedHours` since that group was last trained
 * (null if never trained). No copy here — the narrative agent decides whether to
 * say "13h" / "yesterday" / "fresh" from these numbers.
 *
 * Sub-minimal rest surfaces honestly: a group trained 13h ago reads
 * elapsedHours≈13 with state 'partial'/'fatigued' (never a false 'recovered').
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {Array<{type?: string, region?: string, intensity?: 1|2|3, ts?: number}>} [painEntries]
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @param {{doseScaling?: boolean}} [opts] — forwarded to getRecoveryByGroup (dose ×
 *   unaccustomed window stretch when dp_recovery_dose_v1 is on; OFF → byte-identical)
 * @returns {{[group:string]: {state: 'recovered'|'partial'|'fatigued', elapsedHours: number|null}}}
 */
export function getGroupRecoveryDetail(logs, painEntries, now = Date.now(), opts) {
  const groupState = getRecoveryByGroup(logs, painEntries, now, opts);
  /** @type {{[group:string]: {state: 'recovered'|'partial'|'fatigued', elapsedHours: number|null}}} */
  const detail = {};
  for (const group of Object.keys(groupState)) {
    detail[group] = {
      state: groupState[group],
      elapsedHours: hoursSinceGroup(logs, group, now),
    };
  }
  return detail;
}

/**
 * Map a single exercise (by its canonical EN engine name) to the Big-11 group(s)
 * its PRIMARY muscles load. Same taxonomy + attribution the recovery + lagging
 * math use (EXERCISE_MUSCLES.primary → GROUP_HEAD_MAP_BIG11), so a narrative
 * layer can compute "which groups does TODAY's plan actually train" against the
 * exact buckets the engine reasons in. Returns [] for an unknown exercise name.
 *
 * Primary-only (not secondary) so allocation reflects the exercise's MAIN target
 * — a bench press counts toward chest, not toward the triceps it incidentally
 * assists. Pure; no clock.
 *
 * @param {string|undefined|null} engineName — canonical EN exercise name (the key into EXERCISE_MUSCLES)
 * @returns {string[]} Big-11 RO group keys this exercise primarily trains (deduped)
 */
export function groupForExerciseBig11(engineName) {
  if (!engineName) return [];
  const muscles = musclesForExercise(engineName); // QA-F8: curated OR metadata-derived
  if (!muscles) return [];
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  /** @type {Set<string>} */
  const groups = new Set();
  for (const head of muscles.primary || []) {
    for (const [g, heads] of Object.entries(headMap)) {
      if (heads.includes(head)) groups.add(g);
    }
  }
  return [...groups];
}

/**
 * Volume-based lagging detection: groups under-volume 2+ saptamani vs Big 6
 * equal distribution (~16-17% target each). Lagging = group < 60% of average
 * peer group volume across last 14 days.
 *
 * @param {{ logs?: Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>, lookbackDays?: number, now?: number } | null | undefined} profile — { logs: Array, lookbackDays?: 14, now?: Date.now } — inject now for deterministic testing
 * @returns {Array<{group: string, label: string, ratio: number, sets: number}>}
 *   Sorted by ratio ascending (most lagging first).
 */
export function getLaggingMuscles(profile) {
  const logs = profile?.logs || [];
  const lookbackDays = profile?.lookbackDays ?? 14;
  const injectedNow = profile?.now;
  const now = Number.isFinite(injectedNow) ? /** @type {number} */ (injectedNow) : Date.now();
  const cutoff = now - lookbackDays * MS_PER_DAY;

  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  /** @type {Record<string, number>} */
  const setsPerGroup = {};
  for (const g of Object.keys(headMap)) setsPerGroup[g] = 0;

  for (const log of logs) {
    if (log.baseline || !log.ex) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts < cutoff) continue;
    const muscles = musclesForExercise(log.ex); // QA-F8: curated OR metadata-derived
    if (!muscles) continue;
    /** @type {Set<string>} */
    const touched = new Set();
    for (const head of muscles.primary || []) {
      for (const [g, heads] of Object.entries(headMap)) {
        if (heads.includes(head)) touched.add(g);
      }
    }
    touched.forEach(g => { setsPerGroup[g] = (setsPerGroup[g] ?? 0) + 1; });
  }

  // Only consider groups user actually trains (sets > 0 across any group)
  const activeGroups = Object.entries(setsPerGroup).filter(([, s]) => s > 0);
  if (activeGroups.length < 2) return [];

  const avg = activeGroups.reduce((a, [, s]) => a + s, 0) / activeGroups.length;
  const labels = /** @type {Record<string, string>} */ (GROUP_LABELS_RO);
  const lagging = [];
  for (const [group, sets] of activeGroups) {
    const ratio = avg > 0 ? sets / avg : 1;
    if (ratio < 0.6) {
      lagging.push({
        group,
        label: labels[group] || group,
        ratio: parseFloat(ratio.toFixed(3)),
        sets,
      });
    }
  }
  lagging.sort((a, b) => a.ratio - b.ratio);
  return lagging;
}

// ══ BUILD F6a #5 — ACWR readiness (acute:chronic workload ratio, F6a spec §3) ═
// Rolling acute:chronic workload ratio per the SAME per-set stress kernel
// getMuscleState uses (15·k·rpeContrib) — NOT a new tonnage formula. Acute = the
// recent short window (≈7d) load; chronic = the long window (≈28d) load scaled to
// the SAME window length (so the ratio is dimensionless ~1.0 at steady volume). A
// spike (>HIGH) = accumulated fatigue; an undershoot (<LOW) = detraining / a life
// dip (links to #32). PURE — pure read of `logs`, recomputed each session; `now`
// injectable. Independent of e1RM (#1).
//
// UNVERIFIED thresholds (F6a §7): the 0.8–1.3 sweet-spot + HIGH/LOW cuts are a
// literature DESIGN PROPOSAL, must be sourced/cited + Daniel/research-reviewed
// before dp_acwr_readiness_v1 flips ON, exactly like the F3 ceiling ratios.
export const ACWR_ACUTE_DAYS = 7;
export const ACWR_CHRONIC_DAYS = 28;
export const ACWR_HIGH = 1.5;   // accumulated-fatigue spike → readiness penalty
export const ACWR_LOW = 0.8;    // undershoot → no penalty (links to #32 LIFE_DIP)
const ACWR_PRIMARY_W = 15 * 1.5;   // primary head per-set weight (getMuscleState kernel)
const ACWR_SECONDARY_W = 15 * 1.0; // secondary head per-set weight

/**
 * Sum the per-set stress "load units" over [now - days, now] across the logs,
 * using the SAME 15·k·rpeContrib weighting getMuscleState applies (primary 1.5x /
 * secondary 1.0x), WITHOUT the exp-decay (this is accumulated WORKLOAD, not an
 * instantaneous recovery state). PURE.
 * @param {ReadonlyArray<{ex?:string, baseline?:boolean, w?:number, rpe?:number, ts?:number, date?:string}>} logs
 * @param {number} now
 * @param {number} days
 * @returns {number}
 */
function _loadUnits(logs, now, days) {
  const cutoff = now - days * MS_PER_DAY;
  let total = 0;
  for (const l of Array.isArray(logs) ? logs : []) {
    if (!l || l.baseline || !l.ex) continue;
    const w = Number(l.w);
    if (!Number.isFinite(w) || w <= 0) continue;
    const ts = Number(l.ts) || (l.date ? new Date(l.date).getTime() : 0);
    if (!Number.isFinite(ts) || ts < cutoff || ts > now) continue;
    const ms = musclesForExercise(l.ex); // QA-F8: curated OR metadata-derived
    if (!ms) continue;
    const rpeContrib = l.rpe ? Math.min(Number(l.rpe) / 10, 1) : 0.7;
    total += (ms.primary?.length || 0) * ACWR_PRIMARY_W * rpeContrib;
    total += (ms.secondary?.length || 0) * ACWR_SECONDARY_W * rpeContrib;
  }
  return total;
}

/**
 * The earliest qualifying (non-baseline, real-load) log timestamp within
 * [now - days, now], or +Infinity when none. PURE. Used by the cold-start guard to
 * measure how much pre-acute history actually exists.
 * @param {ReadonlyArray<{ex?:string, baseline?:boolean, w?:number, ts?:number, date?:string}>} logs
 * @param {number} now
 * @param {number} days
 * @returns {number}
 */
function _earliestLogTs(logs, now, days) {
  const cutoff = now - days * MS_PER_DAY;
  let earliest = Infinity;
  for (const l of Array.isArray(logs) ? logs : []) {
    if (!l || l.baseline || !l.ex) continue;
    const w = Number(l.w);
    if (!Number.isFinite(w) || w <= 0) continue;
    const ts = Number(l.ts) || (l.date ? new Date(l.date).getTime() : 0);
    if (!Number.isFinite(ts) || ts < cutoff || ts > now) continue;
    if (ts < earliest) earliest = ts;
  }
  return earliest;
}

/**
 * Systemic acute:chronic workload ratio. PURE. Acute = the last ACWR_ACUTE_DAYS load.
 *
 * Chronic (dp_acwr_uncoupled_v1 ON — canonical uncoupled ACWR): the load in the
 * PRE-ACUTE band [ACWR_ACUTE_DAYS, ACWR_CHRONIC_DAYS] scaled to the SAME 7-day window
 * length, so the ratio is ~1.0 at steady volume and a returning/week-1 user is NOT
 * structurally pinned to 28/7 = 4.0. Returns null until there is a real chronic
 * baseline (pre-acute span >= ~2x the acute window AND non-trivial pre-acute load),
 * mirroring the existing cold-start null-return.
 *
 * Chronic (flag OFF — legacy): the last ACWR_CHRONIC_DAYS load scaled by a fixed
 * acuteDays/chronicDays — which INCLUDES the acute window (coupled).
 * @param {ReadonlyArray<{ex?:string, baseline?:boolean, w?:number, rpe?:number, ts?:number, date?:string}>} logs
 * @param {number} [now]
 * @returns {{acwr:number, acute:number, chronic:number}|null}
 */
export function computeACWR(logs, now = Date.now()) {
  const acute = _loadUnits(logs, now, ACWR_ACUTE_DAYS);
  const chronicTotal = _loadUnits(logs, now, ACWR_CHRONIC_DAYS);
  // Need a real chronic baseline: at least the acute window's worth of history
  // beyond the acute window itself, else the ratio is undefined (cold start).
  if (!(chronicTotal > 0)) return null;

  if (isEnabled('dp_acwr_uncoupled_v1')) {
    // Pre-acute load = the chronic-window load OUTSIDE the acute window (days [7,28]).
    const preAcute = chronicTotal - acute;
    // Cold start: no honest denominator without a real baseline BEFORE the acute window.
    // Require both non-trivial pre-acute load AND a span of >= ~2x the acute window from
    // the earliest in-window log to now (a steady 2-week user reads ~1.0, not a spike).
    if (!(preAcute > 0)) return null;
    const earliest = _earliestLogTs(logs, now, ACWR_CHRONIC_DAYS);
    if (!Number.isFinite(earliest) || now - earliest < 2 * ACWR_ACUTE_DAYS * MS_PER_DAY) return null;
    // Scale the pre-acute (21-day) load to a 7-day window so acute/chronic is dimensionless.
    const chronicPerWindow = preAcute * (ACWR_ACUTE_DAYS / (ACWR_CHRONIC_DAYS - ACWR_ACUTE_DAYS));
    if (!(chronicPerWindow > 0)) return null;
    const acwr = acute / chronicPerWindow;
    return { acwr: Math.round(acwr * 1000) / 1000, acute: Math.round(acute), chronic: Math.round(chronicTotal) };
  }

  const chronicPerWindow = chronicTotal * (ACWR_ACUTE_DAYS / ACWR_CHRONIC_DAYS);
  if (!(chronicPerWindow > 0)) return null;
  const acwr = acute / chronicPerWindow;
  return { acwr: Math.round(acwr * 1000) / 1000, acute: Math.round(acute), chronic: Math.round(chronicTotal) };
}

/**
 * The ADDITIVE readiness-score penalty from a systemic ACWR spike, in [0, cap].
 * Only a spike (> ACWR_HIGH) penalizes — accumulated volume means "you feel fine
 * but you've been piling on, hold today" (it nudges the score toward the existing
 * <60 hold). An undershoot (< ACWR_LOW) is UNPENALIZED (links to #32). Bounded so
 * a single spike can cross the <60 cliff but never crater the score. PURE.
 * @param {{acwr:number}|null} acwr
 * @returns {number} >= 0 points to SUBTRACT from the readiness score
 */
export function acwrReadinessPenalty(acwr) {
  if (!acwr || !Number.isFinite(acwr.acwr) || acwr.acwr <= ACWR_HIGH) return 0;
  // Linear above HIGH, capped at 25 points (enough to cross 60+ → <60 on a good
  // energy day, never enough to floor the [10,100] score on its own).
  const over = acwr.acwr - ACWR_HIGH;
  return Math.min(25, Math.round(over * 50));
}
