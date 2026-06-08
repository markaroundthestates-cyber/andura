// ══ PERSONA MATRIX (#70) — runner + band-check ════════════════════════════
// Drives Andura's REAL compose path for each persona over the active days of a
// week, with the intelligence flags FORCED ON via localStorage._devFlags (the
// fp-config pattern), aggregates per-muscle WEEKLY volume + the structure
// signals (split, ex-count, compound-first, lateral-raise-present, core, cut),
// evaluates goal-realism for the unrealistic asks, and scores each persona
// PASS / DIVERGE against the principle bands. READ-ONLY — no engine change.

import { world, resetWorld, setPathAFlags } from '../full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { DB } from '../../../src/db.js';
import { evaluateGoalRealism } from '../../../src/engine/goalRealism.js';
import { estimateBfDeurenbergCapped } from '../../../src/engine/bodyComposition.js';
import {
  PERSONAS, ANDURA_ON_FLAGS, GROUP_LABEL, PAIN_REGION, COHORT_START, MS_DAY,
} from './pm-personas.js';

// Active-day offsets per frequency (mirror the schedule's default active days).
const ACTIVE_DAYS = {
  '2': [0, 3],
  '3': [0, 2, 4],
  '4': [0, 1, 3, 4],
  '5': [0, 1, 2, 3, 4],
};

// Compound vs isolation hint for the "compound-first" structure check (the
// engine's own COMPOUND_EX list is the source; this readable subset covers the
// big lifts we expect to lead a session).
const COMPOUND_RE = /squat|deadlift|press|row|pull-?up|chin-?up|pulldown|lunge|leg press|hack|hip thrust|rdl|romanian/i;
const LATERAL_RAISE_RE = /lateral raise|lat raise|side raise/i;

function setFlags(ids) {
  const obj = {};
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
      const g = getExerciseMetadata(name).muscle_target_primary;
      weekly[g] = (weekly[g] || 0) + (e.sets || 0);
      if (LATERAL_RAISE_RE.test(name)) lateralRaisePresent = true;
      if (injuryGroups.includes(g)) injuryGroupExercises += 1;
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

  return { persona, weekly, days, lateralRaisePresent, injuryGroupExercises, bfPct, realism };
}

// ── band-check: principle-band acceptance per persona ──────────────────────
// Returns { pass, findings[] }. Bands are SANE RANGES from the policy docs, not
// a single gold — a coach varies. A finding = a real divergence (a fix item).
function checkPersona(agg) {
  const { persona, weekly, days, lateralRaisePresent, realism } = agg;
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
  // 3. emphasis present in volume — the focus group should be among the top by
  //    weekly volume (specialization +2-6 sets reallocation).
  const FOCUS_GROUP = {
    'v-taper': ['spate', 'umeri'], back: ['spate'], chest: ['piept'],
    shoulders: ['umeri'], arms: ['biceps', 'triceps'], lower: ['fese', 'picioare-quads', 'picioare-hamstrings'],
    upper: ['spate', 'piept', 'umeri'],
  }[persona.data.focusPreset];
  if (FOCUS_GROUP) {
    const sorted = Object.entries(weekly).sort((a, b) => b[1] - a[1]);
    const top3 = sorted.slice(0, Math.max(3, FOCUS_GROUP.length)).map(([g]) => g);
    const hit = FOCUS_GROUP.some((g) => top3.includes(g));
    if (!hit) {
      findings.push(`focus '${persona.data.focusPreset}' not in top volume groups (top: ${top3.join(',')})`);
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
