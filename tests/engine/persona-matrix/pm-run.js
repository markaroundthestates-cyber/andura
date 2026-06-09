// ══ PERSONA MATRIX (#70) — runner + band-check ════════════════════════════
// Drives Andura's REAL compose path for each persona over the active days of a
// week, with the intelligence flags FORCED ON via localStorage._devFlags (the
// fp-config pattern), aggregates per-muscle WEEKLY volume + the structure
// signals (split, ex-count, compound-first, lateral-raise-present, core, cut),
// evaluates goal-realism for the unrealistic asks, and scores each persona
// PASS / DIVERGE against the principle bands. READ-ONLY — no engine change.

import { world, resetWorld, setPathAFlags, FLIPPED_FLAGS } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { movementKey } from '../../../src/engine/sessionBuilder.js';
import { INJURY_PATTERN_EXCLUSIONS, REFUSAL_PATTERN_TOKENS, isExcludedMovement, buildExclusionTokens } from '../../../src/engine/movementExclusion.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { activeWeekForFrequency } from '../../../src/engine/schedule/scheduleAdapter/frequencySplit.js';
import { DB } from '../../../src/db.js';
import { evaluateGoalRealism } from '../../../src/engine/goalRealism.js';
import { estimateBfDeurenbergCapped } from '../../../src/engine/bodyComposition.js';
import {
  PERSONAS, ANDURA_ON_FLAGS, GROUP_LABEL, PAIN_REGION, COHORT_START, MS_DAY,
} from './pm-personas.js';

// Active-day offsets per frequency — DERIVED from the engine's REAL active-week
// bit-pattern (activeWeekForFrequency in frequencySplit.js), NOT hardcoded
// contiguous offsets. The compose path resolves the same activeWeekForFrequency
// (no override / no schedule-store under resetWorld's localStorage.clear), and
// clusterForDay maps each day-INDEX to a cluster by its ORDINAL position among
// the active days. Feeding contiguous offsets (e.g. [0,1,2,3,4] for freq-5)
// queries REST-day indices the engine never trains and skips real active days,
// double-mapping one cluster and dropping another (the old freq-5 fabricated
// PULL/PULL with no LEGS). Deriving from the real pattern drives the composer on
// the SAME days the engine actually trains. Frequencies 1-7 all covered (6/7 use
// the DEFAULT_ACTIVE_WEEK fallback the engine itself uses, kept consistent).
function offsetsForFrequency(freq) {
  const week = activeWeekForFrequency(freq);
  const out = [];
  for (let i = 0; i < week.length; i++) if (week[i]) out.push(i);
  return out;
}
const ACTIVE_DAYS = {
  1: offsetsForFrequency('1'), 2: offsetsForFrequency('2'),
  3: offsetsForFrequency('3'), 4: offsetsForFrequency('4'),
  5: offsetsForFrequency('5'), 6: offsetsForFrequency('6'),
  7: offsetsForFrequency('7'),
  // string-keyed mirrors (personas carry frequency as a string '2'..'5')
  '1': offsetsForFrequency('1'), '2': offsetsForFrequency('2'),
  '3': offsetsForFrequency('3'), '4': offsetsForFrequency('4'),
  '5': offsetsForFrequency('5'), '6': offsetsForFrequency('6'),
  '7': offsetsForFrequency('7'),
};

// Compound vs isolation hint for the "compound-first" structure check (the
// engine's own COMPOUND_EX list is the source; this readable subset covers the
// big lifts we expect to lead a session).
const COMPOUND_RE = /squat|deadlift|press|row|pull-?up|chin-?up|pulldown|lunge|leg press|hack|hip thrust|rdl|romanian/i;
const LATERAL_RAISE_RE = /lateral raise|lat raise|side raise/i;

function setFlags(ids) {
  // Start from an explicit ALL-OFF base over the flipped set (registry default is
  // now ON post 2026-06-08 flip) so an empty `ids` list = a TRUE off arm (the
  // gold-ref Daniel-OFF), not "registry ON". Listed ids then force ON.
  const obj = {};
  for (const f of FLIPPED_FLAGS) obj[f] = false;
  for (const f of ids) obj[f] = true;
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* */ }
}

function seedPain(regionKey, now) {
  const region = PAIN_REGION[regionKey];
  if (!region) return;
  // PainButton write shape: { type:'pain', region, intensity, ts } newest-first.
  DB.set('pain-cdl', [{ type: 'pain', region, intensity: 3, ts: now - 2 * MS_DAY }]);
}

/** Run one persona's week through the real compose path. Returns the aggregate. */
async function runPersona(persona, { flags }) {
  resetWorld();
  setPathAFlags(false);
  setFlags(flags);

  const now0 = COHORT_START;
  if (persona.pain) seedPain(persona.pain, now0);
  if (persona.timeCapMin) {
    world.useWorkoutStore.setState({ sessionTimeBudgetMin: persona.timeCapMin });
  }

  world.useOnboardingStore.setState({
    data: {
      ...persona.data,
      focusPresetPickedAt:
        persona.data.focusPreset && persona.data.focusPreset !== 'balanced'
          ? now0 - 7 * MS_DAY
          : null,
    },
    completed: true,
    completedAt: now0,
  });

  const offsets = ACTIVE_DAYS[persona.data.frequency] || ACTIVE_DAYS['4'];
  const weekly = {};
  const days = [];
  let lateralRaisePresent = false;
  let injuryGroupExercises = 0; // exercises hitting the injured group (lower=safer)
  // #81 — every movement token emitted across the week (e.g. squat/deadlift/press),
  // with the offending exercise name, so the gate can assert a refused/contraindicated
  // PATTERN never appears for the injury/refusal personas.
  const movementsSeen = []; // { token, name }
  // #82 — every exercise's coarse equipment_type, so the gate can assert an
  // equipment-profile persona only ever gets lifts they can actually perform.
  const equipmentSeen = []; // { equip, name }
  const injuryGroups = persona.pain
    ? { knee: ['picioare-quads', 'picioare-hamstrings'], lowerBack: ['spate'], shoulder: ['umeri'] }[persona.pain]
    : [];

  for (const off of offsets) {
    const now = new Date(now0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); } catch (e) { plan = { error: String(e) }; }
    if (!plan || plan.error) { days.push({ off, rest: true, err: plan && plan.error }); continue; }
    const exs = plan.exercises || [];
    const rows = [];
    let firstNonCompoundIdx = -1;
    let firstCompoundIdx = -1;
    exs.forEach((e, i) => {
      const name = e.engineName || e.name;
      const meta = getExerciseMetadata(name);
      const g = meta.muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + (e.sets || 0);
      if (LATERAL_RAISE_RE.test(name)) lateralRaisePresent = true;
      if (injuryGroups.includes(g)) injuryGroupExercises += 1;
      movementsSeen.push({ token: movementKey(name, meta).split('::')[1] ?? '', name });
      equipmentSeen.push({ equip: meta.equipment_type ?? '', name });
      const isCompound = COMPOUND_RE.test(name);
      if (isCompound && firstCompoundIdx === -1) firstCompoundIdx = i;
      if (!isCompound && firstNonCompoundIdx === -1) firstNonCompoundIdx = i;
      rows.push({ sets: e.sets, name, g, isCompound });
    });
    // compound-first = the lead exercise (idx 0) is a compound (or no compound on
    // an isolation-only accessory day, which is allowed for a focus/arm day).
    const compoundFirst = exs.length === 0 || rows[0].isCompound || firstCompoundIdx === -1;
    days.push({
      off, sessionType: plan.sessionType, count: exs.length,
      total: exs.reduce((a, e) => a + (e.sets || 0), 0), rows, compoundFirst,
    });
  }

  // goal-realism evaluation (pure) — the reframe layer for the unrealistic asks.
  const bfPct = estimateBfDeurenbergCapped({
    sex: persona.data.sex, weightKg: persona.data.weight,
    heightCm: persona.data.height, ageYears: persona.data.age,
  });
  const realism = evaluateGoalRealism({
    currentKg: persona.data.weight,
    targetKg: persona.data.targetWeight ?? null,
    weeks: persona.deadlineWeeks ?? null,
    bfPct,
    sex: persona.data.sex,
    goal: persona.data.goal,
    experience: persona.data.experience,
    hardDaysPerWeek: persona.days ?? Number(persona.data.frequency),
  });

  return { persona, weekly, days, lateralRaisePresent, injuryGroupExercises, movementsSeen, equipmentSeen, bfPct, realism };
}

// ── band-check: principle-band acceptance per persona ──────────────────────
// Returns { pass, findings[] }. Bands are SANE RANGES from the policy docs, not
// a single gold — a coach varies. A finding = a real divergence (a fix item).
function checkPersona(agg) {
  const { persona, weekly, days, lateralRaisePresent, movementsSeen, equipmentSeen, realism } = agg;
  const findings = [];
  const trained = days.filter((d) => !d.rest);
  const exec = persona.data.experience;
  const goal = persona.data.goal;

  // 1. session count / structure (4-7 ex band, fewer/day at higher freq).
  for (const d of trained) {
    if (d.count < 3) findings.push(`day${d.off} only ${d.count} exercises (<3, thin)`);
    if (d.count > 9) findings.push(`day${d.off} ${d.count} exercises (>9, bloated)`);
  }
  // 2. compound-first on each trained day (arm/isolation focus day exempt).
  const focusIsolationDay = persona.data.focusPreset === 'arms';
  for (const d of trained) {
    if (!d.compoundFirst && !focusIsolationDay) {
      findings.push(`day${d.off} (${d.sessionType}) leads with an isolation (not compound-first)`);
    }
  }
  // 3. emphasis present in volume — the emphasized focus REGION must clearly WIN
  //    the weekly volume race (fresh-eyes 2026-06-08 #2: a small/lower focus that
  //    only ranks "somewhere in the top 3 individual groups" under-delivers — the
  //    user picked arms/chest/glutes and a coach would make THAT region lead). We
  //    score the focus as a COMBINED region (sum its Big-11 groups — arms =
  //    biceps+triceps, lower = quads+hams+glutes, etc.) and require that summed
  //    region to rank TOP-1-or-2 against every OTHER single group's volume. This
  //    is the genuine "did the focus win" assertion the audit asked for; it stays
  //    bounded by MEV/MRV (the budget biasing clamps each group), so it cannot
  //    starve the rest.
  const FOCUS_GROUP = {
    'v-taper': ['spate', 'umeri'], back: ['spate'], chest: ['piept'],
    shoulders: ['umeri'], arms: ['biceps', 'triceps'], lower: ['fese', 'picioare-quads', 'picioare-hamstrings'],
    upper: ['spate', 'piept', 'umeri'],
  }[persona.data.focusPreset];
  if (FOCUS_GROUP) {
    const focusVol = FOCUS_GROUP.reduce((a, g) => a + (weekly[g] || 0), 0);
    // every NON-focus group's individual volume — the focus region must out-rank
    // all but at most one of them (top-1 or top-2).
    const focusSet = new Set(FOCUS_GROUP);
    const others = Object.entries(weekly).filter(([g]) => !focusSet.has(g)).map(([, v]) => v);
    const aboveFocus = others.filter((v) => v > focusVol).length;
    if (aboveFocus > 1) {
      const sorted = Object.entries(weekly).sort((a, b) => b[1] - a[1])
        .map(([g, v]) => `${g}:${v}`).join(' ');
      findings.push(`focus '${persona.data.focusPreset}' region vol ${focusVol} not top-2 (${aboveFocus} groups above; ${sorted})`);
    }
  }
  // 4. v-taper specials — lateral raise present + core kept LOW.
  if (persona.data.focusPreset === 'v-taper') {
    if (!lateralRaisePresent) findings.push('v-taper: NO lateral raise selected (width-muscle miss)');
    if ((weekly.core || 0) > 8) findings.push(`v-taper: core ${weekly.core} > 8 (waist not kept minimal)`);
    // the _REF band: back 16-20, lat+rear 17-20, chest 10-12, legs 10-13.
    const checks = [
      ['spate', 14, 22, 'back/lats 16-20'],
      ['umeri', 13, 22, 'lat+rear delt 17-20'],
      ['piept', 8, 14, 'chest 10-12'],
    ];
    for (const [g, lo, hi, lbl] of checks) {
      const v = weekly[g] || 0;
      if (v < lo || v > hi) findings.push(`v-taper REF band: ${lbl} → got ${v} (out of ${lo}-${hi})`);
    }
  }
  // 5. injury / back-safe — an injured group should NOT be the most-loaded group.
  if (persona.expectBackSafe) {
    const back = weekly.spate || 0;
    const maxG = Object.entries(weekly).sort((a, b) => b[1] - a[1])[0];
    if (maxG && maxG[0] === 'spate' && back > 12) {
      findings.push(`back-safe expected but spate is top group @ ${back} sets (injury not respected)`);
    }
  }
  // 6. refuses-legs (Gabriela/upper) — legs should be MAINTENANCE, not zero.
  if (persona.id === 14) {
    const legs = (weekly['picioare-quads'] || 0) + (weekly['picioare-hamstrings'] || 0) + (weekly.fese || 0);
    if (legs === 0) findings.push('upper-only: legs gutted to ZERO (should be maintenance)');
  }
  // 7. time-cap (Cristina 45min) — sessions should fit ~4-6 exercises.
  if (persona.timeCapMin) {
    for (const d of trained) {
      if (d.count > 7) findings.push(`45min cap: day${d.off} has ${d.count} ex (too many for the budget)`);
    }
  }
  // 8. goal-realism reframe expected (unrealistic personas).
  if (persona.expectReframe && !realism) {
    findings.push('expected a goal-realism reframe but NONE emitted');
  }
  // 9. beginner volume sanity — a beginner should not be pushed to a high
  //    per-group weekly volume (MEV start, no specialization peak).
  if (exec === 'incepator') {
    for (const [g, v] of Object.entries(weekly)) {
      if (v > 22) findings.push(`beginner: ${GROUP_LABEL[g] || g} weekly ${v} > 22 (over-dosed for a novice)`);
    }
  }
  // 11. #81 EXPLICIT REFUSAL — a refused movement PATTERN must NEVER appear (hard
  //     exclusion, not just deprioritize). The landmine/neutral shoulder-press carve-
  //     out is honored by the engine; the leg-pattern refusals (squat/deadlift) have
  //     no carve-out so any occurrence is a violation.
  if (Array.isArray(persona.expectNoRefused)) {
    const banned = new Set();
    for (const r of persona.expectNoRefused) for (const t of REFUSAL_PATTERN_TOKENS[r] || []) banned.add(t);
    for (const { token, name } of movementsSeen) {
      if (banned.has(token)) {
        findings.push(`refusal violated: "${name}" (pattern '${token}') appeared despite refusedPatterns ${JSON.stringify(persona.expectNoRefused)}`);
      }
    }
  }
  // 12. #81 INJURY CONTRAINDICATION — a back-safe (disc) persona must get ZERO
  //     spinal-loading patterns (deadlift/squat/good-morning/hip-thrust). The pain
  //     CDL (lombar→spate) drives the exclusion; any contraindicated pattern is a
  //     safety violation. Press carve-out (landmine/neutral) not relevant for spate.
  if (persona.expectBackSafe) {
    const banned = new Set(INJURY_PATTERN_EXCLUSIONS.spate);
    for (const { token, name } of movementsSeen) {
      if (banned.has(token)) {
        findings.push(`disc contraindication: "${name}" (pattern '${token}') is spinal-loading — must be excluded for a back-safe user`);
      }
    }
  }
  // 13b. #81 SHOULDER impingement — no overhead press / upright row (name-based for
  //     OHP). Uses the real engine predicate so the gate tracks the carve-out exactly.
  if (persona.expectShoulderSafe) {
    const excl = buildExclusionTokens(['umeri'], []);
    for (const { token, name } of movementsSeen) {
      if (getExerciseMetadata(name).muscle_target_primary === 'umeri'
          && isExcludedMovement(name, token, excl)) {
        findings.push(`shoulder contraindication: "${name}" is an overhead-press/upright-row aggravator — must be excluded`);
      }
    }
  }
  // 14. #82 EQUIPMENT PROFILE — a home/DB-only persona must NEVER get a lift whose
  //     equipment_type is outside their profile (bodyweight always allowed).
  if (Array.isArray(persona.expectEquipment)) {
    const ok = new Set([...persona.expectEquipment, 'bodyweight']);
    for (const { equip, name } of equipmentSeen) {
      if (!ok.has(equip)) {
        findings.push(`equipment mismatch: "${name}" needs '${equip}' not in profile ${JSON.stringify(persona.expectEquipment)}`);
      }
    }
  }
  // 10. every persona produces a real, non-empty week.
  if (trained.length === 0) findings.push('NO trained day produced (empty week)');
  for (const d of trained) if (d.total === 0) findings.push(`day${d.off} produced 0 sets`);

  return { pass: findings.length === 0, findings };
}

export async function runMatrix() {
  const results = [];
  for (const persona of PERSONAS) {
    const agg = await runPersona(persona, { flags: [...ANDURA_ON_FLAGS] });
    const check = checkPersona(agg);
    results.push({ agg, check });
  }
  // gold-ref delta: Daniel-0 OFF for the before/after contrast, plus the
  // COMPOSITION-CORE arm (the 3 path-A volume flags only) which isolates the
  // finding that dp_energy_volume_v1 (the deficit volume-cut) is what drags a
  // cut persona BELOW the _REF band — comp-core alone lands Daniel-0 IN-band.
  const danielOff = await runPersona(PERSONAS[0], { flags: [] });
  const danielCompCore = await runPersona(PERSONAS[0], {
    flags: ['dp_emphasis_specialization_v1', 'dp_coherent_weekly_alloc_v1', 'dp_learned_volume_v1'],
  });
  return { results, danielOff, danielCompCore };
}

export { runPersona, checkPersona, ACTIVE_DAYS, GROUP_LABEL };
