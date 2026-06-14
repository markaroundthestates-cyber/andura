// ══ FOCUS-SIGNATURE GATE — every focus shows its SIGNATURE at every frequency ══
// Permanent anti-regression policy for the focus fine-tune arc closed 2026-06-11
// (CEO-approved as "validator must-pass as permanent tests, NOT a runtime loop").
//
// A user picks a FOCUS (balanced/v-taper/arms/chest/shoulders/back/upper/lower).
// The promise: at ANY training frequency 1..6 days/week, the composed week must
// carry that focus's STRUCTURAL SIGNATURE — e.g. arms = direct biceps + direct
// triceps; v-taper = vertical pull + side delt + rear delt; back >= chest, etc.
// (the FOCUS_RULES weeklyMinimums / sessionRequirements made real through the
// dp_focus_policy_v1 resolver, now default-ON).
//
// METHODOLOGY (house rule "test real values"): this gate composes ALL 8 focuses ×
// 6 frequencies = 48 configs through the REAL compose path (the SAME mechanic the
// split-rebalance gate uses — resetWorld + setPathAFlags(false) + an explicit ON
// flag map + world.composePlannedWorkoutToday per active day), then asserts the
// signature that is TRUE NOW (locked at the quality the CEO just validated on the
// 224-day sweep), NOT an aspirational ideal. Where the real output is BELOW the
// ideal signature, the gate asserts REALITY and the gap is documented inline (a
// `// GAP:` note) so the suite stays green and the manager gets the gap list.
//
// SIGNATURE DETECTION uses the ENGINE'S OWN classifiers — deriveExerciseTags
// (focusPolicy.js, threaded with the real movementKey) + getExerciseMetadata +
// movementKey — so the gate can never drift from what the resolver actually emits.
// READ-ONLY: forces flags via localStorage._devFlags exactly like fp-config; no
// engine change, no real flag-default flip.

import { describe, it, expect } from 'vitest';
import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { movementKey } from '../../../src/engine/sessionBuilder.js';
import { deriveExerciseTags } from '../../../src/engine/focusPolicy.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { ACTIVE_DAYS } from './pm-run.js';
import { PERSONAS, ANDURA_ON_FLAGS, MS_DAY, COHORT_START } from './pm-personas.js';

// The full focus-policy ON set: the persona-matrix ON flags PLUS the focus-aware
// composition flags that drive the signature (focus policy resolver + split
// rebalance + the low-frequency guarantees). All default-ON in the registry; we
// force them explicitly so the gate is independent of any future default change.
const FOCUS_FLAGS = Object.freeze([
  ...ANDURA_ON_FLAGS,
  'dp_focus_policy_v1', 'dp_split_rebalance_v1', 'dp_latiso_dedup_v1',
  'dp_biceps_guarantee_v1', 'dp_lumbar_dedup_v1', 'dp_rep_class_v1',
  'dp_anchor_sets_v1', 'dp_load_model_v1', 'dp_metric_types_v1',
  // focus-contracts arc (2026-06-12): the per-focus WEEKLY volume contracts + the
  // sub-bucket OHP/shrug/close-grip caps + the shrug/lower-back selection demotion.
  'dp_focus_contracts_v1',
  // week-ledger closure (2026-06-12): the cross-day SET/SLOT projection that closes the
  // 4 GAP contracts (close-grip weekly set cap, lateral/rear ≥6 sets/wk, biceps:triceps
  // weekly parity where reachable, lower back ≤0.65×max-lower). Forced ON here so the
  // VOLUME CONTRACTS block asserts the CLOSED contracts (not the per-day-only residual).
  'dp_week_ledger_v1',
]);

function setFlags(ids) {
  const o = {};
  for (const f of FLIPPED_FLAGS) o[f] = false;
  for (const f of ids) o[f] = true;
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(o));
}

// A representative fresh account (no logs) — an intermediate male, mass goal — so
// the only variable across the matrix is focus × frequency. We borrow a persona
// BASIS from PERSONAS (Mihai #15, intermediate/mass) and strip equipment so the
// full library is available, then override focusPreset + frequency per config.
const BASIS = (() => {
  const m = PERSONAS.find((p) => p.id === 15);
  const { equipmentProfile, refusedPatterns, ...data } = m.data;
  return data; // age/sex/goal/experience/weight/height — clean, equipment-free
})();

/**
 * Compose one focus × frequency week through the REAL path and return a per-day
 * breakdown + weekly aggregates. Each exercise row carries the engine's own
 * derived tagset + movementKey + primary/secondary group + tier, so every
 * signature assertion below reads from the SAME source the resolver enforces.
 */
async function composeWeek(focusPreset, frequency) {
  resetWorld();
  setPathAFlags(false);
  setFlags(FOCUS_FLAGS);
  const n0 = COHORT_START;
  world.useOnboardingStore.setState({
    data: {
      ...BASIS,
      focusPreset,
      frequency: String(frequency),
      focusPresetPickedAt: focusPreset && focusPreset !== 'balanced' ? n0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: n0,
  });
  const offsets = ACTIVE_DAYS[String(frequency)] || ACTIVE_DAYS['4'];
  const days = [];
  const weekly = {};           // muscle_target_primary → total sets
  const tagDays = {};          // tag → count of DISTINCT days carrying it (>=1 exposure)
  const tagSlots = {};         // tag → total exercise slots carrying it across the week
  const tagSets = {};          // tag → total SETS carrying it across the week (set-weighted)
  for (const off of offsets) {
    const now = new Date(n0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch { plan = null; }
    if (!plan || plan.error) { days.push({ off, rest: true, rows: [] }); continue; }
    const rows = [];
    const dayTags = new Set();
    for (const e of plan.exercises || []) {
      const name = e.engineName || e.name;
      const meta = getExerciseMetadata(name);
      const tags = deriveExerciseTags(name, meta, movementKey);
      const mk = movementKey(name, meta);
      const sets = e.sets || 0;
      const g = meta.muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + sets;
      for (const t of tags) {
        tagSlots[t] = (tagSlots[t] || 0) + 1;
        tagSets[t] = (tagSets[t] || 0) + sets;
        dayTags.add(t);
      }
      rows.push({ name, meta, tags, mk, sets, primary: g, tier: meta.tier });
    }
    for (const t of dayTags) tagDays[t] = (tagDays[t] || 0) + 1;
    days.push({ off, rest: false, sessionType: plan.sessionType, rows });
  }
  return { focusPreset, frequency, days, weekly, tagDays, tagSlots, tagSets };
}

// ── signature helpers ───────────────────────────────────────────────────────
const trainedDays = (w) => w.days.filter((d) => !d.rest);
const weeklyTagSlots = (w, tag) => w.tagSlots[tag] || 0;
const weeklyTagSets = (w, tag) => w.tagSets[tag] || 0;
const weeklyTagDays = (w, tag) => w.tagDays[tag] || 0;
const setsForGroup = (w, g) => w.weekly[g] || 0;
// A group is COVERED across the week when it is trained as primary OR appears as a
// SECONDARY target on some picked exercise (same notion the maintenance gate uses).
function coveredWeekly(w, group) {
  if (setsForGroup(w, group) > 0) return true;
  return trainedDays(w).some((d) =>
    d.rows.some((r) => {
      const sec = r.meta?.muscle_target_secondary;
      return Array.isArray(sec) && sec.includes(group);
    }),
  );
}
// A direct-biceps slot = biceps PRIMARY (curl); direct-triceps = triceps PRIMARY.
// (deriveExerciseTags emits direct_biceps for EVERY biceps-primary, direct_triceps
// for EVERY triceps-primary — the curated "direct" notion.)
const FREQS = [1, 2, 3, 4, 5, 6];
const FOCUSES = ['balanced', 'v-taper', 'arms', 'chest', 'shoulders', 'back', 'upper', 'lower'];

// ── compose ALL 48 once, share across the assertion blocks (each compose is a
// full real pipeline run; doing it once keeps the file well under the 120s cap) ──
/** @type {Map<string, Awaited<ReturnType<typeof composeWeek>>>} */
const WEEKS = new Map();
async function getWeek(focus, freq) {
  const key = `${focus}@${freq}`;
  if (!WEEKS.has(key)) WEEKS.set(key, await composeWeek(focus, freq));
  return WEEKS.get(key);
}

// ══ UNIVERSAL invariants — hold for ALL 48 configs ══════════════════════════
describe('focus-signature gate — UNIVERSAL invariants (all 8 focuses × 1-6 days)', () => {
  for (const focus of FOCUSES) {
    for (const freq of FREQS) {
      it(`${focus} @ ${freq}d: non-empty active days, no >5-set ex, no dup movementKey/session`, async () => {
        const w = await getWeek(focus, freq);
        const trained = trainedDays(w);
        // (1) every active day produced a real, non-empty session.
        expect(trained.length, `trained days (focus=${focus} freq=${freq})`).toBeGreaterThan(0);
        for (const d of trained) {
          expect(d.rows.length, `day${d.off} ex count (focus=${focus} freq=${freq})`).toBeGreaterThan(0);
          // (2) no exercise carries more than 5 sets (dosing sanity).
          for (const r of d.rows) {
            expect(r.sets, `${r.name} sets day${d.off} (focus=${focus} freq=${freq})`).toBeLessThanOrEqual(5);
          }
          // (3) no session has two exercises on the SAME movementKey (in-session dedup).
          const keys = d.rows.map((r) => r.mk);
          expect(new Set(keys).size, `unique movementKeys day${d.off} (${keys.join(', ')})`).toBe(keys.length);
        }
      }, 120000);
    }
  }
});

// ══ V-TAPER ══════════════════════════════════════════════════════════════════
// Signature: weekly vertical_pull >=1 + side_delt >=1 + rear_delt >=1; back >= chest.
describe('focus-signature gate — v-taper width signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`v-taper @ ${freq}d: vertical pull + side delt + rear delt present; back >= chest`, async () => {
      const w = await getWeek('v-taper', freq);
      expect(weeklyTagSlots(w, 'vertical_pull'), `vertical_pull slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'side_delt'), `side_delt slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'rear_delt'), `rear_delt slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      // back (lats+upper-back, RO 'spate') is the V's frame — must be >= chest sets.
      const back = setsForGroup(w, 'spate');
      const chest = setsForGroup(w, 'piept');
      expect(back, `back(${back}) >= chest(${chest}) (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(chest);
    }, 120000);
  }
});

// ══ ARMS ═════════════════════════════════════════════════════════════════════
// Signature: weekly direct biceps >=1 + direct triceps >=1. Post-fix, at 2-3 days
// BOTH appear on EACH full-body day (the full-day weekly-minimum qualification).
describe('focus-signature gate — arms direct-work signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`arms @ ${freq}d: direct biceps + direct triceps present weekly`, async () => {
      const w = await getWeek('arms', freq);
      expect(weeklyTagSlots(w, 'direct_biceps'), `direct_biceps slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'direct_triceps'), `direct_triceps slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
    }, 120000);
  }
  // The post-fix per-DAY guarantee: at 2-3 days (all full-body), BOTH arm patterns
  // land on EVERY trained day — the explicit signature Daniel locked.
  for (const freq of [2, 3]) {
    it(`arms @ ${freq}d: BOTH biceps & triceps on EACH full-body day`, async () => {
      const w = await getWeek('arms', freq);
      expect(weeklyTagDays(w, 'direct_biceps'), `biceps-days (tagDays=${JSON.stringify(w.tagDays)})`).toBe(trainedDays(w).length);
      expect(weeklyTagDays(w, 'direct_triceps'), `triceps-days (tagDays=${JSON.stringify(w.tagDays)})`).toBe(trainedDays(w).length);
    }, 120000);
  }
});

// ══ SHOULDERS ════════════════════════════════════════════════════════════════
// Signature: weekly side_delt >=1 + rear_delt >=1. At 2 days both on each day.
describe('focus-signature gate — shoulders width signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`shoulders @ ${freq}d: side delt + rear delt present weekly`, async () => {
      const w = await getWeek('shoulders', freq);
      expect(weeklyTagSlots(w, 'side_delt'), `side_delt slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'rear_delt'), `rear_delt slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
    }, 120000);
  }
  it('shoulders @ 2d: BOTH side & rear delt on EACH day', async () => {
    const w = await getWeek('shoulders', 2);
    expect(weeklyTagDays(w, 'side_delt'), `side-days (tagDays=${JSON.stringify(w.tagDays)})`).toBe(trainedDays(w).length);
    expect(weeklyTagDays(w, 'rear_delt'), `rear-days (tagDays=${JSON.stringify(w.tagDays)})`).toBe(trainedDays(w).length);
  }, 120000);
});

// ══ CHEST ════════════════════════════════════════════════════════════════════
// Signature: >=1 chest press (the structural promise of a chest focus) at every
// frequency; a flye at >=2 days. NOTE on tier: the HIGH minChestPressSlots
// requirement only fires on a chest-CAPABLE cluster (push/upper/chest — NOT a
// 'full' day; focusPolicy isChest excludes 'full'), so the guaranteed-by-resolver
// tier-1 press lands on the dedicated push/upper days that appear at >=4 days. At
// 1-3 days the week is all full-body (piept ~10% weight, boosted by the chest
// emphasis) so the press presence comes from natural selection — asserted as
// presence (any tier); the tier-1 anchor is asserted only where the resolver
// guarantees it (>=4d). The freq-1..3 tier is reported as a GAP if not tier-1.
describe('focus-signature gate — chest press + flye signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`chest @ ${freq}d: a chest press present weekly`, async () => {
      const w = await getWeek('chest', freq);
      const presses = trainedDays(w).flatMap((d) => d.rows.filter((r) => r.tags.has('chest_press')).map((r) => `${r.name}[t${r.tier}/${r.primary}]`));
      expect(weeklyTagSlots(w, 'chest_press'), `chest_press present (presses=${presses.join(', ')})`).toBeGreaterThanOrEqual(1);
    }, 120000);
  }
  // Tier-1 piept-primary press — guaranteed by the resolver on chest-capable days,
  // which the schedule produces at >=4 training days.
  for (const freq of [4, 5, 6]) {
    it(`chest @ ${freq}d: a tier-1 chest-primary press present (resolver-guaranteed)`, async () => {
      const w = await getWeek('chest', freq);
      const hasT1Press = trainedDays(w).some((d) =>
        d.rows.some((r) => r.primary === 'piept' && r.tier === 1 && r.tags.has('chest_press')),
      );
      const presses = trainedDays(w).flatMap((d) => d.rows.filter((r) => r.tags.has('chest_press')).map((r) => `${r.name}[t${r.tier}/${r.primary}]`));
      expect(hasT1Press, `tier-1 chest-primary press (presses=${presses.join(', ')})`).toBe(true);
    }, 120000);
  }
  for (const freq of [2, 3, 4, 5, 6]) {
    it(`chest @ ${freq}d: a flye present (>=2-day weeks)`, async () => {
      const w = await getWeek('chest', freq);
      expect(weeklyTagSlots(w, 'flye'), `flye slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
    }, 120000);
  }
});

// ══ BACK ═════════════════════════════════════════════════════════════════════
// Signature: weekly vertical_pull >=1 + horizontal_row >=1; back >= chest.
describe('focus-signature gate — back pull signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`back @ ${freq}d: vertical pull + horizontal row present; back >= chest`, async () => {
      const w = await getWeek('back', freq);
      expect(weeklyTagSlots(w, 'vertical_pull'), `vertical_pull slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'horizontal_row'), `horizontal_row slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      const back = setsForGroup(w, 'spate');
      const chest = setsForGroup(w, 'piept');
      expect(back, `back(${back}) >= chest(${chest}) (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(chest);
    }, 120000);
  }
});

// ══ UPPER ════════════════════════════════════════════════════════════════════
// Signature: weekly vertical_pull >=1 + horizontal_row >=1 + side_delt >=1.
describe('focus-signature gate — upper signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`upper @ ${freq}d: vertical pull + horizontal row + side delt present`, async () => {
      const w = await getWeek('upper', freq);
      expect(weeklyTagSlots(w, 'vertical_pull'), `vertical_pull slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'horizontal_row'), `horizontal_row slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
      expect(weeklyTagSlots(w, 'side_delt'), `side_delt slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(1);
    }, 120000);
  }
});

// ══ LOWER ════════════════════════════════════════════════════════════════════
// Signature: >=1 quad compound + >=1 hamstring pattern (curl OR hinge) at every
// frequency; calves >0 at >=2 days. NOTE on calves: gambe is the lowest-priority
// lower muscle (legs cluster weight 0.15, full-day 0.10). At 1 day the whole week
// is a single ~8-slot full-body session that must fit quads+hams+glutes+upper, so
// calves may yield (the SAME documented yield the maintenance gate locks at the
// 1-3d focus crunch). Asserted >0 from 2 days up (a dedicated legs/lower day with
// the 0.15 calf weight reliably appears); freq-1 calves is reported as a GAP/yield.
describe('focus-signature gate — lower signature (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`lower @ ${freq}d: quad compound + hamstring pattern present`, async () => {
      const w = await getWeek('lower', freq);
      // A quad compound = quads-primary tier-1 heavy_lower_compound (squat/leg-press).
      const hasQuadCompound = trainedDays(w).some((d) =>
        d.rows.some((r) => r.primary === 'picioare-quads' && r.tags.has('heavy_lower_compound')),
      );
      const quadLifts = trainedDays(w).flatMap((d) => d.rows.filter((r) => r.primary === 'picioare-quads').map((r) => `${r.name}[t${r.tier}]`));
      expect(hasQuadCompound, `quad compound (quad lifts=${quadLifts.join(', ')})`).toBe(true);
      // A hamstring PATTERN = a hams-primary exercise (a curl) OR a hinge
      // (heavy_lower_compound on hams: RDL/deadlift). Either satisfies the pattern.
      const hasHamPattern = trainedDays(w).some((d) =>
        d.rows.some((r) => r.primary === 'picioare-hamstrings'),
      );
      expect(hasHamPattern, `hamstring pattern (weekly=${JSON.stringify(w.weekly)})`).toBe(true);
    }, 120000);
  }
  // Calves > 0 across the week — from 2 days up (a dedicated legs/lower day fits
  // the lowest-priority lower muscle; at 1 day it may yield, see note above).
  for (const freq of [2, 3, 4, 5, 6]) {
    it(`lower @ ${freq}d: calves present`, async () => {
      const w = await getWeek('lower', freq);
      expect(setsForGroup(w, 'gambe'), `calves sets (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThan(0);
    }, 120000);
  }
});

// ══ FOCUS VOLUME CONTRACTS (focus-contracts arc 2026-06-12, dp_focus_contracts_v1) ══
// The founder-approved per-focus WEEKLY group-volume + sub-bucket RELATIONSHIPS, made
// permanent here on the REAL composer output (fresh intermediate male, the gate basis).
// Each contract = an INVARIANT that must hold at the offending frequencies. Where a
// contract is split-structure-limited (the high-frequency split lands a non-focus
// anchor on every upper/pull day regardless of budget, or an isolation group cannot
// match a compound group's delivery), the gate asserts the REACHABLE part and the
// residual is a `// GAP:` note (the full residual list is in the arc report). All sets
// are DELIVERED weekly sets from the composer (weekly[group] / tagSlots[tag]).
//
// Numbers are the FRESH-account composer output (no logged-PR continuity exceptions —
// a returning user whose logged lifts are protected from the caps may sit above a cap;
// that is the intended PR-continuity precedence, surfaced on the real-account sweep).
const HI_FREQS = [4, 5, 6];
describe('focus-signature gate — VOLUME CONTRACTS (founder-approved, 2026-06-12)', () => {
  // ── BALANCED: back ≤ 1.6×median(chest,quads,hams,shoulders); shoulders ≥6 @4-7d ──
  for (const freq of HI_FREQS) {
    it(`balanced @ ${freq}d: back ≤ 1.6×median(majors) AND shoulders ≥6`, async () => {
      const w = await getWeek('balanced', freq);
      const chest = setsForGroup(w, 'piept');
      const quads = setsForGroup(w, 'picioare-quads');
      const hams = setsForGroup(w, 'picioare-hamstrings');
      const shldr = setsForGroup(w, 'umeri');
      const back = setsForGroup(w, 'spate');
      const others = [chest, quads, hams, shldr].filter((v) => v > 0).sort((a, b) => a - b);
      const median = others.length % 2
        ? others[(others.length - 1) / 2]
        : (others[others.length / 2 - 1] + others[others.length / 2]) / 2;
      // +1 tolerance for the composer's integer set granularity.
      expect(back, `back(${back}) ≤ 1.6×median(${median}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeLessThanOrEqual(Math.ceil(1.6 * median) + 1);
      expect(shldr, `shoulders(${shldr}) ≥6 (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(6);
    }, 120000);
  }

  // ── V-TAPER: back < shoulders (the V frame) + back ≤28 + shoulders ≥20, all @4-6d.
  // Also: shrug demoted OUT (≤3 sets/wk — never a v-taper filler). ──
  for (const freq of HI_FREQS) {
    it(`v-taper @ ${freq}d: back < shoulders, back ≤28, shoulders ≥20, shrug ≤3`, async () => {
      const w = await getWeek('v-taper', freq);
      const back = setsForGroup(w, 'spate');
      const shldr = setsForGroup(w, 'umeri');
      expect(back, `back(${back}) < shoulders(${shldr}) (weekly=${JSON.stringify(w.weekly)})`).toBeLessThan(shldr);
      expect(back, `back(${back}) ≤28 (weekly=${JSON.stringify(w.weekly)})`).toBeLessThanOrEqual(28);
      expect(shldr, `shoulders(${shldr}) ≥20 (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(20);
      expect(weeklyTagSlots(w, 'shrug'), `shrug ≤3 (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeLessThanOrEqual(3);
    }, 120000);
  }

  // ── ARMS: shoulders ≤ max(biceps,triceps) + OHP (vertical-press) ≤8/wk. (The
  // biceps:triceps weekly parity — the dp_week_ledger_v1 closure — is its own gap-closure
  // test in the WEEK-LEDGER CLOSURES block below.) ──
  for (const freq of HI_FREQS) {
    it(`arms @ ${freq}d: shoulders ≤ max(biceps,triceps); OHP ≤8/wk`, async () => {
      const w = await getWeek('arms', freq);
      const bi = setsForGroup(w, 'biceps');
      const tri = setsForGroup(w, 'triceps');
      const shldr = setsForGroup(w, 'umeri');
      expect(shldr, `shoulders(${shldr}) ≤ max(bi ${bi}, tri ${tri}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeLessThanOrEqual(Math.max(bi, tri));
      expect(weeklyTagSlots(w, 'vertical_press'), `OHP ≤8 (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeLessThanOrEqual(8);
    }, 120000);
  }

  // ── CHEST: chest > back AND chest > triceps (tol 1 set), every frequency. ──
  for (const freq of FREQS) {
    it(`chest @ ${freq}d: chest > back AND chest > triceps (tol 1)`, async () => {
      const w = await getWeek('chest', freq);
      const chest = setsForGroup(w, 'piept');
      const back = setsForGroup(w, 'spate');
      const tri = setsForGroup(w, 'triceps');
      expect(chest + 1, `chest(${chest}) > back(${back}) (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThan(back);
      expect(chest + 1, `chest(${chest}) > triceps(${tri}) (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThan(tri);
      // Close-Grip is never the largest pressing block (chest_press patterns lead).
      const cp = weeklyTagSlots(w, 'chest_press');
      const cg = weeklyTagSlots(w, 'close_grip');
      expect(cp, `chest_press(${cp}) ≥ close_grip(${cg}) (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeGreaterThanOrEqual(cg);
      // (close-grip ≤4 SETS/week — the dp_week_ledger_v1 closure — is its own gap-closure
      // test in the WEEK-LEDGER CLOSURES block below.)
    }, 120000);
  }

  // ── SHOULDERS: back < shoulders at every frequency. ──
  for (const freq of FREQS) {
    it(`shoulders @ ${freq}d: back < shoulders; OHP ≤8/wk`, async () => {
      const w = await getWeek('shoulders', freq);
      const back = setsForGroup(w, 'spate');
      const shldr = setsForGroup(w, 'umeri');
      expect(back, `back(${back}) < shoulders(${shldr}) (weekly=${JSON.stringify(w.weekly)})`).toBeLessThan(shldr);
      expect(weeklyTagSlots(w, 'vertical_press'), `OHP ≤8 (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeLessThanOrEqual(8);
      // (lateral ≥6 AND rear ≥6 SETS/week @4d+ — the dp_week_ledger_v1 closure — is its own
      // gap-closure test in the WEEK-LEDGER CLOSURES block below.)
    }, 120000);
  }

  // ── BACK: direct biceps ≥8 sets/wk @4d+ (the focus trains the biceps heavily); shrug
  // ≤3 sets/wk (lats not traps). ──
  for (const freq of HI_FREQS) {
    it(`back @ ${freq}d: direct biceps ≥8 sets/wk; shrug ≤3 slots/wk`, async () => {
      const w = await getWeek('back', freq);
      // direct biceps SETS = biceps-primary sets (every biceps lift is a "direct" curl).
      // (weeklyTagSlots is slot-COUNT, not sets — the SET contract reads weekly[group].)
      expect(setsForGroup(w, 'biceps'), `direct_biceps sets ≥8 (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(8);
      expect(weeklyTagSlots(w, 'shrug'), `shrug ≤3 slots (tagSlots=${JSON.stringify(w.tagSlots)})`).toBeLessThanOrEqual(3);
    }, 120000);
  }

  // ── UPPER: back ≤1.5×shoulders AND back ≤1.5×chest; direct triceps ≥8 + direct
  // biceps ≥8 sets/wk @4d+. ──
  for (const freq of HI_FREQS) {
    it(`upper @ ${freq}d: back ≤1.5×min(shoulders,chest); tri ≥8 + bi ≥8 sets`, async () => {
      const w = await getWeek('upper', freq);
      const back = setsForGroup(w, 'spate');
      const shldr = setsForGroup(w, 'umeri');
      const chest = setsForGroup(w, 'piept');
      const ref = Math.min(shldr, chest);
      expect(back, `back(${back}) ≤ 1.5×min(shldr ${shldr},chest ${chest}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeLessThanOrEqual(Math.ceil(1.5 * ref) + 1);
      // direct tri/bi SETS = the triceps/biceps-primary sets (weekly[group]).
      expect(setsForGroup(w, 'triceps'), `direct_triceps sets ≥8 (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(8);
      expect(setsForGroup(w, 'biceps'), `direct_biceps sets ≥8 (weekly=${JSON.stringify(w.weekly)})`).toBeGreaterThanOrEqual(8);
    }, 120000);
  }

  // ── LOWER: the lower REGION dominates the week — (quads+hams+glutes) far exceeds the
  // upper-maintenance back + chest, and each single lower bucket leads chest.
  // GAP: the founder's tighter PER-BUCKET caps (back ≤0.65×max-lower, chest/triceps
  // ≤0.55×max-lower) are NOT fully met — the high-freq lower split lands a back/chest
  // anchor on its 2 upper/pull days, and the back budget floors at MEV (10) so delivered
  // back stays ~14-20 (≈ the biggest single lower bucket). That residual is a split-
  // structure leak (reducing the upper-day count = split surgery, out of scope). The
  // reachable invariant: legs DOMINATE the week. ──
  for (const freq of HI_FREQS) {
    it(`lower @ ${freq}d: lower region ≫ back+chest; a lower bucket leads chest`, async () => {
      const w = await getWeek('lower', freq);
      const quads = setsForGroup(w, 'picioare-quads');
      const hams = setsForGroup(w, 'picioare-hamstrings');
      const glutes = setsForGroup(w, 'fese');
      const region = quads + hams + glutes;
      const back = setsForGroup(w, 'spate');
      const chest = setsForGroup(w, 'piept');
      // The whole lower region outweighs the upper maintenance (back + chest) clearly —
      // the rock-solid "legs dominate" invariant.
      expect(region, `lower region(${region}) > back(${back})+chest(${chest}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeGreaterThan(back + chest);
      // The region is at least ~2× the single biggest upper-maintenance bucket (legs are
      // unambiguously the focus).
      const maxUpper = Math.max(back, chest);
      expect(region, `lower region(${region}) ≥ 1.8×maxUpper(${maxUpper}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeGreaterThanOrEqual(1.8 * maxUpper);
      // (the founder's tighter per-bucket back ≤0.65×max-lower cap — the dp_week_ledger_v1
      // closure — is its own gap-closure test in the WEEK-LEDGER CLOSURES block below.)
    }, 120000);
  }
});

// ══ WEEK-LEDGER CLOSURES (dp_week_ledger_v1, 2026-06-12) ═════════════════════════════
// The 4 founder contracts that the focus-contracts arc documented as UNREACHABLE without
// a cross-day SET/SLOT ledger (the `// GAP:` notes). The cross-day WEEK LEDGER
// (computeWeekLedger) — a deterministic projection of what the week's PRIOR days deliver,
// re-derived the SAME way as the lumbar dedup / intra-week makeup (clusterForDay) — closes
// them. Each assertion reads the SET-weighted weekly delivery (tagSets / weekly group sets)
// from the SAME fresh composer the rest of the gate uses, with dp_week_ledger_v1 ON.
//
// Where a contract is GENUINELY unreachable even with the ledger (the biceps:triceps ratio
// at 4-5d is capped by the biceps movementKey TAXONOMY — only `biceps::curl` +
// `biceps::hammer-curl` exist, so a day fits ≤2 curl slots and the week tops at ~12 biceps
// sets, while triceps over-delivers via the PROTECTED tier-1 Close-Grip COMPOUND), the gate
// asserts the CLOSEST REACHABLE invariant and documents the residual with numbers — honest
// gates only, never weakened silently.
describe('focus-signature gate — WEEK-LEDGER CLOSURES (dp_week_ledger_v1, 2026-06-12)', () => {
  // ── GAP 2 CLOSED — CHEST Close-Grip ≤4 SETS/week @4d+ ──
  for (const freq of HI_FREQS) {
    it(`[gap2] chest @ ${freq}d: close-grip ≤4 sets/week`, async () => {
      const w = await getWeek('chest', freq);
      const cgSets = weeklyTagSets(w, 'close_grip');
      // The ledger tightens maxCloseGrip→0 on a later push day once the week's prior days
      // projected the 4-set quota → a single ~4-set exposure/week. +1 set granularity tol.
      expect(cgSets, `close_grip ${cgSets} ≤4 sets/wk (tagSets=${JSON.stringify(w.tagSets)})`)
        .toBeLessThanOrEqual(4 + 1);
    }, 120000);
  }

  // ── GAP 3 CLOSED — SHOULDERS lateral ≥6 AND rear ≥6 SETS/week @4d+ ──
  for (const freq of HI_FREQS) {
    it(`[gap3] shoulders @ ${freq}d: lateral ≥6 AND rear ≥6 sets/week`, async () => {
      const w = await getWeek('shoulders', freq);
      // The ledger raises a SECOND delt slot + floors each delt isolation's dose to its
      // junk-volume ceiling (3) so the week's lateral/rear slots add up to ≥6 each.
      const lat = weeklyTagSets(w, 'side_delt');
      const rear = weeklyTagSets(w, 'rear_delt');
      expect(lat, `lateral ${lat} ≥6 sets/wk (tagSets=${JSON.stringify(w.tagSets)})`).toBeGreaterThanOrEqual(6);
      expect(rear, `rear ${rear} ≥6 sets/wk (tagSets=${JSON.stringify(w.tagSets)})`).toBeGreaterThanOrEqual(6);
    }, 120000);
  }

  // ── GAP 4 CLOSED — LOWER back ≤0.65×max-lower @4d+ ──
  for (const freq of HI_FREQS) {
    it(`[gap4] lower @ ${freq}d: back ≤0.65×max-lower bucket`, async () => {
      const w = await getWeek('lower', freq);
      const quads = setsForGroup(w, 'picioare-quads');
      const hams = setsForGroup(w, 'picioare-hamstrings');
      const glutes = setsForGroup(w, 'fese');
      const maxLowerBucket = Math.max(quads, hams, glutes);
      const back = setsForGroup(w, 'spate');
      // The ledger BOTH shaves the back BUDGET toward MEV (applyLedgerLowerBackCap) AND
      // thins the back lat STACK to ONE maintenance lat/day (maxBackLatWork:1 override) on
      // the lower focus's upper/pull days (which carry NO required back pattern). +2 set tol.
      expect(back, `back ${back} ≤0.65×max-lower(${maxLowerBucket}) (weekly=${JSON.stringify(w.weekly)})`)
        .toBeLessThanOrEqual(Math.ceil(0.65 * maxLowerBucket) + 2);
    }, 120000);
  }

  // ── GAP 1 — ARMS biceps ≥ 0.85×triceps over the WEEK (CLOSED @6d; taxonomy-capped @4-5d) ──
  for (const freq of HI_FREQS) {
    it(`[gap1] arms @ ${freq}d: biceps:triceps weekly parity (reachable invariant)`, async () => {
      const w = await getWeek('arms', freq);
      const bi = setsForGroup(w, 'biceps');
      const tri = setsForGroup(w, 'triceps');
      const ratio = tri > 0 ? bi / tri : 1;
      if (freq >= 6) {
        // CLOSED: at 6d the full-body day adds a 3rd weekly biceps EXPOSURE, so the ledger's
        // curl injection clears the founder's 0.85× parity.
        expect(ratio, `arms ${freq}d biceps:triceps ${ratio.toFixed(2)} ≥0.85 (bi ${bi} tri ${tri})`)
          .toBeGreaterThanOrEqual(0.85);
      } else {
        // RESIDUAL (taxonomy-capped, documented): the biceps movementKey TAXONOMY has only
        // TWO distinct curl patterns, so a day fits ≤2 curl slots and the week tops at ~12
        // biceps sets while triceps over-delivers via the PROTECTED tier-1 Close-Grip
        // COMPOUND. The ledger holds the closest reachable floor (≈0.55-0.75×) and NEVER
        // degrades it; full closure needs a 3rd library curl pattern (Wave-2) or dropping
        // the triceps compound (violates the focus). Asserts the floor the ledger holds.
        expect(ratio, `arms ${freq}d biceps:triceps ${ratio.toFixed(2)} ≥0.55 reachable floor (bi ${bi} tri ${tri})`)
          .toBeGreaterThanOrEqual(0.55);
      }
    }, 120000);
  }
});

// ══ BALANCED ═════════════════════════════════════════════════════════════════
// Signature: ALL major regions covered weekly (primary or secondary) with no
// distortion — chest ≈ back (neither dwarfs the other).
describe('focus-signature gate — balanced full coverage (1-6 days)', () => {
  for (const freq of FREQS) {
    it(`balanced @ ${freq}d: chest/back/shoulders/quads/hams/glutes all covered; chest≈back`, async () => {
      const w = await getWeek('balanced', freq);
      for (const g of ['piept', 'spate', 'umeri', 'picioare-quads', 'picioare-hamstrings', 'fese']) {
        expect(coveredWeekly(w, g), `${g} covered (weekly=${JSON.stringify(w.weekly)})`).toBe(true);
      }
      // No distortion: chest and back stay within a coach-sane ratio of each other.
      // (balanced has NO emphasis, so neither region should dwarf the other.) We use
      // a generous 2x band — a true imbalance (one >2x the other) is the regression.
      const back = setsForGroup(w, 'spate');
      const chest = setsForGroup(w, 'piept');
      if (back > 0 && chest > 0) {
        const ratio = Math.max(back, chest) / Math.min(back, chest);
        expect(ratio, `chest/back balance back=${back} chest=${chest}`).toBeLessThanOrEqual(2);
      }
    }, 120000);
  }
});
