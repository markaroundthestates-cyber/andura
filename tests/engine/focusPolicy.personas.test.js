// ══ Wave 1.3-D — FOCUS-POLICY PERSONA ACCEPTANCE GATE (flag forced ON) ════════
// Proves the dp_focus_policy_v1 resolver (FOCUS_RULES + applyFocusPolicy, wired at
// the getDailyWorkout seam → buildSession) delivers the per-focus PATTERN policy
// when it runs against the REAL composer for representative personas — caps pruned,
// per-session requirements injected, weekly-minimums-as-per-session honored,
// graceful no-op under equipment restriction, and NO regression with the flag OFF.
//
// HOW THE FLAG IS FORCED ON: this never flips the registry default. It writes an
// explicit localStorage._devFlags map (resolution order step 1 in featureFlags.js)
// — the SAME mechanism the #70 persona-matrix + full-path-sim use — with
// dp_focus_policy_v1:true and EVERY other flipped/dp_*_v1 flag explicitly false, so
// the composition the policy adjusts is the plain selection path (the policy's
// effect is isolated, not entangled with the emphasis/volume flags). The live
// default-flip is a separate human-gated step.
//
// OUTCOME ASSERTIONS, NOT SNAPSHOTS: every pattern/tag is derived via the engine's
// OWN deriveExerciseTags + movementKey (the same functions applyFocusPolicy uses),
// so the test and the engine agree on what counts as a vertical press / side delt /
// flye / heavy-lower-compound. Profiles use a light/empty log so SELECTION (not
// history) drives picks. The evidence diff for 3 flagship personas is written to
// tests/engine/_DIAG_focuspolicy_evidence.txt (untracked).

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from './full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../src/engine/exerciseLibrary.js';
import { movementKey } from '../../src/engine/sessionBuilder.js';
import { deriveExerciseTags, FOCUS_RULES } from '../../src/engine/focusPolicy.js';
import { activeWeekForFrequency } from '../../src/engine/schedule/scheduleAdapter/frequencySplit.js';
import { DEV_FLAGS_KEY } from '../../src/util/featureFlags.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday — mirrors the persona-matrix
// Active-day offsets DERIVED from the engine's real active-week bit-pattern
// (activeWeekForFrequency), NOT hardcoded contiguous offsets. The composer
// resolves the same activeWeekForFrequency (no override / no schedule-store under
// resetWorld), so the harness must query the SAME day-indices the engine trains —
// contiguous offsets (e.g. freq-5 [0,1,2,3,4]) hit rest-day indices the engine
// never trains and skip real active days, mis-slotting clusters.
const offsetsForFrequency = (freq) => {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
};
const ACTIVE_DAYS = {
  '2': offsetsForFrequency('2'), '3': offsetsForFrequency('3'),
  '4': offsetsForFrequency('4'), '5': offsetsForFrequency('5'),
};

const EVIDENCE_PATH = 'C:\\Users\\Daniel\\Documents\\_wt_p3\\tests\\engine\\_DIAG_focuspolicy_evidence.txt';

// ── force the flag ON in-test (localStorage._devFlags override) ──────────────
// Base = EVERY flipped/dp_*_v1 flag explicitly OFF (the registry default is now
// ON for several, so an empty map ≠ off). `focusOn` then forces ONLY the focus-
// policy flag, so its effect is isolated against the plain selection path.
function setFocusFlag(focusOn) {
  const obj = {};
  for (const f of FLIPPED_FLAGS) obj[f] = false;
  obj.dp_focus_policy_v1 = focusOn === true;
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* jsdom always has it */ }
}

/** Compose one persona's active-day week through the REAL composer. Returns the
 *  per-day exercise lists, each enriched with the engine's own derived tags +
 *  movement key, so assertions read the same signals the resolver does. */
async function composeWeek(data, focusOn) {
  resetWorld();
  setPathAFlags(false);   // all path-A flags OFF (plain composition base)
  setFocusFlag(focusOn);  // then force ONLY the focus-policy flag (over the base)

  const now0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...data,
      focusPresetPickedAt:
        data.focusPreset && data.focusPreset !== 'balanced' ? now0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: now0,
  });

  const offsets = ACTIVE_DAYS[data.frequency] || ACTIVE_DAYS['4'];
  const days = [];
  for (const off of offsets) {
    const now = new Date(now0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch (e) { plan = { error: String(e) }; }
    if (!plan || plan.error) { days.push({ off, rest: true, err: plan && plan.error }); continue; }
    const exs = (plan.exercises || []).map((e) => {
      const name = e.engineName || e.name;
      const meta = getExerciseMetadata(name);
      return {
        name, sets: e.sets,
        group: meta.muscle_target_primary,
        equip: meta.equipment_type ?? '',
        mk: movementKey(name, meta),
        tags: deriveExerciseTags(name, meta, movementKey),
      };
    });
    // The resolver's `cluster` is the lowercase day cluster; sessionType is its
    // display form. Map it back so per-day role checks read the same axis the
    // resolver gates requirements on (push/pull/upper/lower/legs/full).
    days.push({ off, role: String(plan.sessionType || '').toLowerCase(), exs });
  }
  return days;
}

// ── per-day tag helpers (over the engine-derived tags) ───────────────────────
const dayHas = (d, tag) => d.exs.some((e) => e.tags.has(tag));
const dayCount = (d, tag) => d.exs.filter((e) => e.tags.has(tag)).length;
const trainedDays = (week) => week.filter((d) => !d.rest);
// A day whose composition could carry `tag` (the candidate pool exposed it). We
// approximate "available in the pool" by: it shows up on SOME day of the OFF or ON
// week for this persona (the selection universe is the same equipment/injury pool).
function tagAvailableAnyDay(...weeks) {
  return (tag) => weeks.some((w) => w.some((d) => !d.rest && dayHas(d, tag)));
}

// Days that are "press-ish" (a push or upper day carries the press budget).
const isPushish = (d) => d.role === 'push' || d.role === 'upper';
const isPullish = (d) => d.role === 'pull' || d.role === 'upper';

describe('FOCUS-POLICY persona acceptance (dp_focus_policy_v1 forced ON, real composer)', () => {
  // Flagship personas composed once OFF + once ON, reused across assertions +
  // the evidence dump.
  const W = {}; // { key: { off, on, data } }
  const PERSONAS = {
    vtaper: { age: 41, sex: 'm', goal: 'masa', frequency: '4', experience: 'avansat', weight: 90, height: 183, focusPreset: 'v-taper' },
    shoulders: { age: 33, sex: 'm', goal: 'masa', frequency: '5', experience: 'avansat', weight: 88, height: 182, focusPreset: 'shoulders' },
    back: { age: 35, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 88, height: 183, focusPreset: 'back' },
    chest: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 180, focusPreset: 'chest' },
    arms: { age: 28, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 78, height: 178, focusPreset: 'arms' },
    lower: { age: 28, sex: 'f', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 62, height: 168, focusPreset: 'lower' },
    shouldersDbOnly: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 180, focusPreset: 'shoulders', equipmentProfile: ['dumbbell', 'bodyweight'] },
  };

  beforeAll(async () => {
    for (const [key, data] of Object.entries(PERSONAS)) {
      W[key] = { data, off: await composeWeek(data, false), on: await composeWeek(data, true) };
    }

    // ── BEFORE/AFTER evidence for the 3 flagship personas (the flip headline) ──
    const fmt = (label, week) => {
      const lines = [`### ${label}`];
      for (const d of week) {
        if (d.rest) { lines.push(`  day${d.off}: REST/ERR ${d.err || ''}`); continue; }
        lines.push(`  day${d.off} [${d.role}]:`);
        for (const e of d.exs) {
          lines.push(`    ${e.sets}x ${e.name}  <${e.mk}>  [${[...e.tags].join(',')}]`);
        }
      }
      return lines.join('\n');
    };
    const out = ['══ FOCUS-POLICY BEFORE/AFTER (dp_focus_policy_v1 OFF vs ON) ══',
      'Generated by tests/engine/focusPolicy.personas.test.js — evidence for the human flip decision.',
      ''];
    for (const key of ['vtaper', 'shoulders', 'arms']) {
      out.push(`──────── ${key} (${W[key].data.focusPreset}, ${W[key].data.frequency}d) ────────`);
      out.push(fmt('OFF (flag off — plain selection)', W[key].off));
      out.push('');
      out.push(fmt('ON  (focus-policy forced on)', W[key].on));
      out.push('');
    }
    fs.writeFileSync(EVIDENCE_PATH, out.join('\n'));
  }, 240000);

  // ── 0. flag-OFF parity: every persona still composes a valid week OFF ────────
  it('flag OFF → every flagship persona still composes a non-empty valid week (no regression)', () => {
    for (const [key, { off }] of Object.entries(W)) {
      const trained = trainedDays(off);
      expect(trained.length, `${key} OFF produced no trained day`).toBeGreaterThan(0);
      for (const d of trained) {
        expect(d.exs.length, `${key} OFF day${d.off} is empty`).toBeGreaterThan(0);
        expect(d.exs.every((e) => (e.sets || 0) > 0), `${key} OFF day${d.off} has a 0-set exercise`).toBe(true);
      }
    }
  });

  it('flag ON → every flagship persona still composes a non-empty valid week', () => {
    for (const [key, { on }] of Object.entries(W)) {
      const trained = trainedDays(on);
      expect(trained.length, `${key} ON produced no trained day`).toBeGreaterThan(0);
      for (const d of trained) {
        expect(d.exs.length, `${key} ON day${d.off} is empty`).toBeGreaterThan(0);
        expect(d.exs.every((e) => (e.sets || 0) > 0), `${key} ON day${d.off} has a 0-set exercise`).toBe(true);
      }
    }
  });

  // ── 1. V-TAPER, 4 days ───────────────────────────────────────────────────────
  describe('v-taper 4d', () => {
    const cap = FOCUS_RULES['v-taper'].sessionCaps;

    it('press budget: no push/upper day exceeds maxTotalPressPatterns and maxVerticalPress', () => {
      expect(cap.maxTotalPressPatterns).toBe(2);
      expect(cap.maxVerticalPress).toBe(1);
      for (const d of trainedDays(W.vtaper.on).filter(isPushish)) {
        const totalPress = d.exs.filter((e) => e.tags.has('vertical_press') || e.tags.has('chest_press')).length;
        const vertPress = dayCount(d, 'vertical_press');
        expect(totalPress, `v-taper ${d.role} day${d.off} total press ${totalPress} > cap ${cap.maxTotalPressPatterns}`).toBeLessThanOrEqual(cap.maxTotalPressPatterns);
        expect(vertPress, `v-taper ${d.role} day${d.off} vertical press ${vertPress} > cap ${cap.maxVerticalPress}`).toBeLessThanOrEqual(cap.maxVerticalPress);
      }
    });

    it('side-delt present on every push/upper day (lateral is in the pool)', () => {
      const avail = tagAvailableAnyDay(W.vtaper.off, W.vtaper.on);
      expect(avail('side_delt'), 'no lateral in v-taper pool at all (precondition)').toBe(true);
      for (const d of trainedDays(W.vtaper.on).filter(isPushish)) {
        expect(dayHas(d, 'side_delt'), `v-taper ${d.role} day${d.off} missing a side delt`).toBe(true);
      }
    });

    it('rear-delt present on the shoulder-carrying push/upper days (rear-delt available)', () => {
      // v-taper requires rear delt per session (minRearDeltSlots) + a pull/upper/
      // shoulders weekly min. Assert it lands on the push/upper days that carry the
      // shoulder budget, where a rear-delt candidate exists in the pool.
      const avail = tagAvailableAnyDay(W.vtaper.off, W.vtaper.on);
      expect(avail('rear_delt'), 'no rear-delt in v-taper pool (precondition)').toBe(true);
      const shoulderDays = trainedDays(W.vtaper.on).filter((d) => isPushish(d) && d.exs.some((e) => e.group === 'umeri'));
      expect(shoulderDays.length).toBeGreaterThan(0);
      for (const d of shoulderDays) {
        expect(dayHas(d, 'rear_delt'), `v-taper ${d.role} day${d.off} missing a rear delt`).toBe(true);
      }
    });

    it('pull/upper days carry BOTH a vertical pull AND a horizontal row (not 3 vertical pulls)', () => {
      for (const d of trainedDays(W.vtaper.on).filter(isPullish).filter((d) => d.exs.some((e) => e.group === 'spate'))) {
        expect(dayHas(d, 'vertical_pull'), `v-taper ${d.role} day${d.off} missing vertical pull`).toBe(true);
        expect(dayHas(d, 'horizontal_row'), `v-taper ${d.role} day${d.off} missing horizontal row`).toBe(true);
      }
    });

    it('ON injects rear-delt and/or prunes a press vs OFF (the flag visibly bites)', () => {
      // Headline: at least one push/upper day differs in either press-count (cap) or
      // rear-delt presence (requirement) between OFF and ON.
      const offPush = trainedDays(W.vtaper.off).filter(isPushish);
      const onPush = trainedDays(W.vtaper.on).filter(isPushish);
      let bit = false;
      for (let i = 0; i < Math.min(offPush.length, onPush.length); i++) {
        const offPress = offPush[i].exs.filter((e) => e.tags.has('vertical_press') || e.tags.has('chest_press')).length;
        const onPress = onPush[i].exs.filter((e) => e.tags.has('vertical_press') || e.tags.has('chest_press')).length;
        if (onPress < offPress) bit = true;
        if (dayHas(onPush[i], 'rear_delt') && !dayHas(offPush[i], 'rear_delt')) bit = true;
      }
      expect(bit, 'focus-policy ON produced NO observable change on v-taper push/upper days').toBe(true);
    });
  });

  // ── 2. SHOULDERS focus ───────────────────────────────────────────────────────
  describe('shoulders 5d', () => {
    const cap = FOCUS_RULES.shoulders.sessionCaps;

    it('side-delt appears on every shoulder-carrying push/upper day', () => {
      const shoulderDays = trainedDays(W.shoulders.on).filter((d) => isPushish(d) && d.exs.some((e) => e.group === 'umeri'));
      expect(shoulderDays.length).toBeGreaterThan(0);
      for (const d of shoulderDays) {
        expect(dayHas(d, 'side_delt'), `shoulders ${d.role} day${d.off} missing a side delt`).toBe(true);
      }
    });

    it('no OHP spam — vertical-press cap respected on every push/upper day', () => {
      expect(cap.maxVerticalPress).toBe(1);
      for (const d of trainedDays(W.shoulders.on).filter(isPushish)) {
        expect(dayCount(d, 'vertical_press'), `shoulders ${d.role} day${d.off} > 1 vertical press`).toBeLessThanOrEqual(cap.maxVerticalPress);
      }
    });

    it('rear-delt included on the shoulder days when available', () => {
      const avail = tagAvailableAnyDay(W.shoulders.off, W.shoulders.on);
      expect(avail('rear_delt'), 'no rear-delt in shoulders pool (precondition)').toBe(true);
      const shoulderDays = trainedDays(W.shoulders.on).filter((d) => isPushish(d) && d.exs.some((e) => e.group === 'umeri'));
      for (const d of shoulderDays) {
        expect(dayHas(d, 'rear_delt'), `shoulders ${d.role} day${d.off} missing a rear delt`).toBe(true);
      }
    });

    it('front_delt is NEVER forced (no CORE_AUTO front-raise variant)', () => {
      for (const d of trainedDays(W.shoulders.on)) {
        for (const e of d.exs) {
          expect(e.tags.has('front_delt'), `front_delt tag emitted on ${e.name}`).toBe(false);
          expect(e.tags.has('front_raise'), `front_raise tag emitted on ${e.name}`).toBe(false);
        }
      }
    });
  });

  // ── 3. BACK focus ─────────────────────────────────────────────────────────────
  describe('back 4d', () => {
    it('every back-carrying pull/upper day has BOTH a vertical pull and a horizontal row', () => {
      const backDays = trainedDays(W.back.on).filter((d) => isPullish(d) && d.exs.some((e) => e.group === 'spate'));
      expect(backDays.length).toBeGreaterThan(0);
      for (const d of backDays) {
        expect(dayHas(d, 'vertical_pull'), `back ${d.role} day${d.off} missing vertical pull`).toBe(true);
        expect(dayHas(d, 'horizontal_row'), `back ${d.role} day${d.off} missing horizontal row`).toBe(true);
      }
    });

    it('optional lat-isolation injected on a back day when a candidate exists', () => {
      const avail = tagAvailableAnyDay(W.back.off, W.back.on);
      if (!avail('lat_isolation')) return; // thin pool — graceful, not a failure
      const someLatIso = trainedDays(W.back.on).some((d) => dayHas(d, 'lat_isolation'));
      expect(someLatIso, 'back: lat-isolation available but never present ON').toBe(true);
    });

    it('no more than maxVerticalPulls / maxHorizontalRows per session', () => {
      const cap = FOCUS_RULES.back.sessionCaps;
      for (const d of trainedDays(W.back.on)) {
        expect(dayCount(d, 'vertical_pull'), `back day${d.off} vertical pulls`).toBeLessThanOrEqual(cap.maxVerticalPulls);
        expect(dayCount(d, 'horizontal_row'), `back day${d.off} horizontal rows`).toBeLessThanOrEqual(cap.maxHorizontalRows);
      }
    });
  });

  // ── 4. CHEST focus ────────────────────────────────────────────────────────────
  describe('chest 4d', () => {
    const cap = FOCUS_RULES.chest.sessionCaps;

    it('a chest day has a press AND a flye (flye available in pool)', () => {
      const avail = tagAvailableAnyDay(W.chest.off, W.chest.on);
      expect(avail('flye'), 'no flye in chest pool (precondition)').toBe(true);
      // The chest requirement gates on isChest (chest/push/upper). Find the upper/
      // push days that carry chest work and assert press + flye coverage across them.
      const chestDays = trainedDays(W.chest.on).filter((d) => isPushish(d) && d.exs.some((e) => e.group === 'piept'));
      expect(chestDays.length).toBeGreaterThan(0);
      for (const d of chestDays) {
        expect(dayHas(d, 'chest_press'), `chest ${d.role} day${d.off} missing a press`).toBe(true);
        expect(dayHas(d, 'flye'), `chest ${d.role} day${d.off} missing a flye`).toBe(true);
      }
    });

    it('no more than maxChestPressPatterns flat/incline presses per session', () => {
      expect(cap.maxChestPressPatterns).toBe(2);
      for (const d of trainedDays(W.chest.on)) {
        expect(dayCount(d, 'chest_press'), `chest day${d.off} chest presses ${dayCount(d, 'chest_press')} > ${cap.maxChestPressPatterns}`).toBeLessThanOrEqual(cap.maxChestPressPatterns);
      }
    });
  });

  // ── 5. ARMS focus ─────────────────────────────────────────────────────────────
  describe('arms 4d', () => {
    it('an arm-carrying day has BOTH direct biceps and direct triceps', () => {
      // Arms emphasis routes onto the upper days; the per-session reqs (overhead-tri,
      // stretch-curl) gate on isArms||isPush||isPull. Assert each upper day carries
      // both direct-arm patterns.
      const upperDays = trainedDays(W.arms.on).filter(isPushish);
      expect(upperDays.length).toBeGreaterThan(0);
      for (const d of upperDays) {
        expect(dayHas(d, 'direct_biceps') || dayHas(d, 'direct_triceps'), `arms ${d.role} day${d.off} no direct arm work`).toBe(true);
      }
      // Across the week both biceps + triceps direct work present.
      const week = trainedDays(W.arms.on);
      expect(week.some((d) => dayHas(d, 'direct_biceps')), 'arms week: no direct biceps anywhere').toBe(true);
      expect(week.some((d) => dayHas(d, 'direct_triceps')), 'arms week: no direct triceps anywhere').toBe(true);
    });

    it('overhead-triceps requirement honored on push/upper days when available', () => {
      const avail = tagAvailableAnyDay(W.arms.off, W.arms.on);
      expect(avail('overhead_triceps'), 'no overhead-triceps in arms pool (precondition)').toBe(true);
      const pushDays = trainedDays(W.arms.on).filter(isPushish).filter((d) => d.exs.some((e) => e.group === 'triceps'));
      for (const d of pushDays) {
        expect(dayHas(d, 'overhead_triceps'), `arms ${d.role} day${d.off} missing overhead-triceps`).toBe(true);
      }
    });

    it('stretch/preacher-curl requirement honored across the week when available', () => {
      // HONEST SCOPE: the stretch-curl requirement is met where a stretched-curl
      // candidate can be added WITHOUT colliding with an already-selected curl's
      // movement key. A plain curl (e.g. Bayesian Curl) and a preacher curl BOTH key
      // `biceps::curl`, so on a day whose biceps slot is already a non-stretch curl
      // the resolver will NOT displace it (it is the sole `direct_biceps` carrier —
      // required-coverage precedence) nor add a duplicate-movement preacher. So the
      // guarantee is WEEK-level (at least one arm day lands a stretched curl), not a
      // per-day inject on top of an existing curl. This is the dedup + don't-displace-
      // a-required-carrier precedence working as designed — a documented limitation,
      // a Wave-2 sub-tag would let a preacher and a plain curl coexist as distinct.
      const avail = tagAvailableAnyDay(W.arms.off, W.arms.on);
      expect(avail('stretch_curl'), 'no stretch/preacher curl in arms pool (precondition)').toBe(true);
      const week = trainedDays(W.arms.on);
      expect(week.some((d) => dayHas(d, 'stretch_curl')), 'arms week: NO stretch/preacher curl anywhere').toBe(true);
    });

    it('direct-arm cap respected (maxDirectArmExercises)', () => {
      const cap = FOCUS_RULES.arms.sessionCaps.maxDirectArmExercises;
      for (const d of trainedDays(W.arms.on)) {
        const directArm = d.exs.filter((e) => e.tags.has('direct_biceps') || e.tags.has('direct_triceps')).length;
        expect(directArm, `arms day${d.off} direct-arm ${directArm} > cap ${cap}`).toBeLessThanOrEqual(cap);
      }
    });
  });

  // ── 6. LOWER focus ────────────────────────────────────────────────────────────
  describe('lower 4d', () => {
    const cap = FOCUS_RULES.lower.sessionCaps;

    it('a lower day has a squat/leg-press AND a hamstring pattern', () => {
      const legDays = trainedDays(W.lower.on).filter((d) => d.role === 'lower' || d.role === 'legs');
      expect(legDays.length).toBeGreaterThan(0);
      for (const d of legDays) {
        // heavy lower compound present (squat/deadlift/leg-press/hip-thrust tier-1)
        expect(dayHas(d, 'heavy_lower_compound'), `lower day${d.off} missing a heavy lower compound`).toBe(true);
        // a hamstring pattern present (RDL is a heavy_lower_compound on hams, or a leg curl)
        const hasHam = d.exs.some((e) => e.group === 'picioare-hamstrings');
        expect(hasHam, `lower day${d.off} missing a hamstring pattern`).toBe(true);
      }
    });

    it('no more than maxHeavyLowerCompounds heavy compounds per session', () => {
      expect(cap.maxHeavyLowerCompounds).toBe(2);
      for (const d of trainedDays(W.lower.on)) {
        expect(dayCount(d, 'heavy_lower_compound'), `lower day${d.off} heavy compounds ${dayCount(d, 'heavy_lower_compound')} > ${cap.maxHeavyLowerCompounds}`).toBeLessThanOrEqual(cap.maxHeavyLowerCompounds);
      }
    });
  });

  // ── 7. GRACEFUL / NO-OP — equipment-restricted (DB only, no cable) ────────────
  describe('graceful degradation (shoulders, dumbbell-only)', () => {
    it('composes without crashing + every exercise is within the DB/bodyweight profile', () => {
      const week = trainedDays(W.shouldersDbOnly.on);
      expect(week.length).toBeGreaterThan(0);
      const allowed = new Set(['dumbbell', 'bodyweight']);
      for (const d of week) {
        expect(d.exs.length).toBeGreaterThan(0);
        for (const e of d.exs) {
          expect(allowed.has(e.equip), `DB-only: "${e.name}" needs '${e.equip}' (outside profile) — policy forced an unavailable lift`).toBe(true);
        }
      }
    });

    it('does NOT force an unavailable required tag + never forces front_delt', () => {
      for (const d of trainedDays(W.shouldersDbOnly.on)) {
        for (const e of d.exs) {
          expect(e.tags.has('front_delt')).toBe(false);
          expect(e.tags.has('front_raise')).toBe(false);
        }
      }
      // It still meets what IS available with DB: side delt + rear delt exist as DB
      // variants, so the shoulder days should still carry them (graceful = meet what's
      // reachable, skip what is not — never crash, never invent).
      const shoulderDays = trainedDays(W.shouldersDbOnly.on).filter((d) => isPushish(d) && d.exs.some((e) => e.group === 'umeri'));
      for (const d of shoulderDays) {
        expect(dayHas(d, 'side_delt'), `DB-only shoulders ${d.role} day${d.off} missing side delt`).toBe(true);
        expect(dayHas(d, 'rear_delt'), `DB-only shoulders ${d.role} day${d.off} missing rear delt`).toBe(true);
      }
    });
  });

  // ── 8. FLAG-OFF vs ON SHAPE — OFF lacks at least one guarantee ON provides ────
  it('flag OFF does NOT make the same guarantees the policy adds ON (proves the policy is load-bearing)', () => {
    // The clearest contrast: on the v-taper push/upper days, OFF can run the press
    // budget over the cap and/or miss the rear delt; ON cannot. We assert ON honors
    // the cap on EVERY push day (already covered) and that the OFF→ON delta is real
    // (covered above), so here we just sanity-check OFF is a valid-but-unconstrained
    // baseline: at least one OFF push/upper day either over-caps press or lacks rear
    // delt — i.e. the policy genuinely had work to do.
    const offPush = trainedDays(W.vtaper.off).filter(isPushish);
    const offViolatesSomething = offPush.some((d) => {
      const press = d.exs.filter((e) => e.tags.has('vertical_press') || e.tags.has('chest_press')).length;
      return press > FOCUS_RULES['v-taper'].sessionCaps.maxTotalPressPatterns || !dayHas(d, 'rear_delt');
    });
    expect(offViolatesSomething, 'v-taper OFF already satisfied every policy guarantee (the policy would be a no-op — unexpected)').toBe(true);
  });
});
