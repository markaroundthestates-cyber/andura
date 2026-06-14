// ══ GOAL-9 EVAL-GRID EXPORTER (rebuild 2026-06-14) ════════════════════════════
// Rebuilds the GOAL-9 eval-grid exporter that was untracked scratch and deleted.
// Composes Andura's REAL planned week for each (persona × focus × freq) config
// through the SAME compose seam the full-path-sim / persona-matrix drive
// (world.composePlannedWorkoutToday), and serializes each config in the EXACT
// schema the GOAL-9 judge reads (see C:/Users/Daniel/Documents/salafull/
// _EVAL_GRID_2026-06-13.json — the original flags-mostly-OFF grid):
//
//   { configId, persona{id,name,age,sex,goal,experience,freq,constraint},
//     focus, freq, days[{label,type,title,durationMin,
//       exercises[{name,sub,group,sets,reps,kg,bodyweight,tier}]}],
//     weeklyVolumeByMuscle, totalWeeklySets }
//
// READ-ONLY on src/ — no engine / featureFlags change. The grid is driven purely
// via the localStorage._devFlags override (resolution-order step 1) + the
// onboarding / schedule / workout stores, exactly like the existing harnesses.
//
// SKIPPED by default (env-guarded) so it NEVER runs in the normal husky / CI
// suite — set EVAL_GRID_EXPORT=1 to run it:
//   EVAL_GRID_EXPORT=1 VITEST_MAX_THREADS=4 npx vitest run tests/engine/_eval_grid_export.test.js
//
// Two arms:
//   - OFF arm  (EVAL_GRID_MODE=off, default)   → pins ALL registry flags OFF via
//     _devFlags → reproduces the original flags-OFF grid (validation diff target).
//   - BRAINON  (EVAL_GRID_MODE=brainon)        → NO _devFlags written → the live
//     registry defaults drive (the 85 brain-on flags) → the current-engine grid.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { world, resetWorld, setPathAFlags } from './full-path-sim/fp-config.js';
import { getExerciseMetadata } from '../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY, FLAGS } from '../../src/util/featureFlags.js';
import { SCHEDULE_STORE_KEY } from '../../src/engine/schedule/scheduleAdapter/constants.js';
import { maintenanceMaxDays, lowCapacityMaxDays, reshapeMaintenanceWeek } from '../../src/engine/schedule/scheduleAdapter/frequencySplit.js';
import { isEnabled } from '../../src/util/featureFlags.js';
import { DB } from '../../src/db.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday — same anchor as pm-personas.

const VAULT = 'C:/Users/Daniel/Documents/salafull';
const ORIGINAL_GRID = path.join(VAULT, '_EVAL_GRID_2026-06-13.json');

// ── pain region map (PAIN_REGION_GROUP_MAP) — mirrors pm-personas PAIN_REGION ──
const PAIN_REGION = {
  knee: 'genunchi-drept',   // → picioare-quads + picioare-hamstrings
  lowerBack: 'lombar',      // → spate
  shoulder: 'umar-drept',   // → umeri
};

// ── RO weekday abbreviations for the day label (Lu/Ma/Mi/Jo/Vi/Sa/Du). The
//    COHORT_START is a Monday (offset 0 = Lu). The render boundary uses the same
//    2-letter RO abbreviation; the original grid stores "Lu","Ma",...           ─
const RO_WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'];

// ── canonical RO muscle-group key → ENGLISH bucket the grid's
//    weeklyVolumeByMuscle uses (back/chest/shoulders/biceps/triceps/core/quads/
//    hams/glutes/calves/forearms). Derived from the original grid's key space.  ─
const GROUP_EN = {
  spate: 'back', piept: 'chest', umeri: 'shoulders',
  biceps: 'biceps', triceps: 'triceps', core: 'core',
  'picioare-quads': 'quads', 'picioare-hamstrings': 'hams', fese: 'glutes',
  gambe: 'calves', antebrate: 'forearms',
};

// ── the 12 GRID personas, in grid order (p1..p12). age/sex/goal/experience/
//    constraint are TAKEN VERBATIM from the original grid's persona block; the
//    weight/height/targetWeight (which the grid did NOT serialize but the
//    compose path consumes for bf% + cold-start kg) are reconstructed from the
//    vetted persona-matrix specs (pm-personas.js) for the matching archetype,
//    and from name+age+sex+goal where no exact pm match exists (p3 Tudor).
//    `pain`/`timeCapMin` are the constraint → real compose inputs.             ─
const GRID_PERSONAS = [
  { id: 'p1', name: 'Andrei-novice', age: 19, sex: 'm', goal: 'masa', experience: 'incepator',
    constraint: 'none', weight: 64, height: 180 },
  { id: 'p2', name: 'Sorin-inter-strength', age: 38, sex: 'm', goal: 'forta', experience: 'intermediar',
    constraint: 'none', weight: 78, height: 175 },
  { id: 'p3', name: 'Tudor-adv-leanbulk', age: 30, sex: 'm', goal: 'masa', experience: 'avansat',
    constraint: 'lean-bulk advanced', weight: 82, height: 182, targetWeight: 85 },
  { id: 'p4', name: 'Maria-inter-glutes', age: 28, sex: 'f', goal: 'masa', experience: 'intermediar',
    constraint: 'none', weight: 62, height: 168 },
  { id: 'p5', name: 'Elena-adv-female', age: 42, sex: 'f', goal: 'masa', experience: 'avansat',
    constraint: 'none', weight: 60, height: 165 },
  { id: 'p6', name: 'Gigica-knee', age: 52, sex: 'm', goal: 'slabire', experience: 'intermediar',
    constraint: 'knee injury', weight: 95, height: 178, targetWeight: 82, pain: 'knee' },
  { id: 'p7', name: 'Ion-lowback', age: 58, sex: 'm', goal: 'forta', experience: 'intermediar',
    constraint: 'lower-back (disc) injury', weight: 92, height: 179, pain: 'lowerBack' },
  { id: 'p8', name: 'Radu-shoulder', age: 29, sex: 'm', goal: 'masa', experience: 'intermediar',
    constraint: 'shoulder impingement', weight: 82, height: 180, pain: 'shoulder' },
  { id: 'p9', name: 'Cristina-timecap', age: 34, sex: 'f', goal: 'mentenanta', experience: 'intermediar',
    constraint: '35-min time cap', weight: 72, height: 170, timeCapMin: 35 },
  { id: 'p10', name: 'Maria-65', age: 65, sex: 'f', goal: 'mentenanta', experience: 'incepator',
    constraint: 'older trainee (65+)', weight: 70, height: 162 },
  { id: 'p11', name: 'Florin-60-detrained', age: 60, sex: 'm', goal: 'masa', experience: 'intermediar',
    constraint: 'older detrained returner (60)', weight: 85, height: 180 },
  { id: 'p12', name: 'Daniela-cut', age: 27, sex: 'f', goal: 'slabire', experience: 'intermediar',
    constraint: 'aggressive cut (slabire)', weight: 75, height: 169, targetWeight: 65 },
];

// the 8 focuses, in grid order.
const FOCUSES = ['balanced', 'v-taper', 'arms', 'chest', 'shoulders', 'back', 'upper', 'lower'];

// the frequency-anomaly probe personas (1..7); the rest get 2..5.
const WIDE_FREQ_PERSONAS = new Set(['p3', 'p6', 'p9']);
const freqsForPersona = (id) => (WIDE_FREQ_PERSONAS.has(id) ? [1, 2, 3, 4, 5, 6, 7] : [2, 3, 4, 5]);

// EXACTLY `freq` evenly-spaced training-day offsets across the 7-day week (so freq
// 1/6/7 are HONORED, not collapsed to the 4-day fallback that activeWeekForFrequency
// returns for out-of-band freqs). round(i*6/(freq-1)) for i in 0..freq-1 yields
// distinct, non-adjacent indices (freq=1→[0]; 4→[0,2,4,6]; 7→[0..6]). The original
// grid has exactly `freq` days per config, so this drives the composer on `freq`
// distinct active days, each mapping to the Nth FREQUENCY_SPLITS cluster.
function evenSpacedDays(freq) {
  if (freq <= 1) return [0];
  const out = [];
  for (let i = 0; i < freq; i++) out.push(Math.min(6, Math.round((i * 6) / (freq - 1))));
  return [...new Set(out)];
}

// length-7 boolean active week from a list of offsets.
function sevenWeekFromOffsets(offsets) {
  const w = [false, false, false, false, false, false, false];
  for (const o of offsets) w[o] = true;
  return w;
}

// Seed the React scheduleStore with exactly `freq` training days at the given
// offsets (the rest 'rest'). activeWeekFromScheduleStore() reads parsed.state.days,
// and the compose path honors it (override ?? scheduleStore ?? frequency-default),
// so the resolved active-week has exactly `freq` active days → frequencyToSplit(freq)
// → the freq-appropriate cluster template. (A maintenance/older persona may then be
// further reshaped DOWN by the live dp_maintenance_freq_reshape_v1 — that is real
// current-engine behavior, preserved in the brain-on grid.)
function seedSchedule(offsets) {
  const days = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
  for (const o of offsets) days[o] = 'training';
  try {
    localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days }, version: 0 }));
  } catch { /* */ }
}

// ── flag control ─────────────────────────────────────────────────────────────
// OFF arm: pin EVERY registry flag OFF in _devFlags (a flag absent from the map
// falls through to its registry default, which is now mostly ON — so we must list
// them all). BRAINON arm: clear _devFlags entirely → registry defaults drive.
const ALL_FLAG_IDS = Object.keys(FLAGS);
function pinAllFlagsOff() {
  const obj = {};
  for (const f of ALL_FLAG_IDS) obj[f] = false;
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* */ }
}
function clearFlags() {
  try { localStorage.removeItem(DEV_FLAGS_KEY); } catch { /* */ }
}

function seedPain(regionKey, now) {
  const region = PAIN_REGION[regionKey];
  if (!region) return;
  DB.set('pain-cdl', [{ type: 'pain', region, intensity: 3, ts: now - 2 * MS_DAY }]);
}

// repsBand string from the engine; else derive "N–(N+1)" from numeric targetReps
// (matches the original grid's "8–9"/"12–13" style; en-dash U+2013).
function repsString(ex) {
  if (typeof ex.repsBand === 'string' && ex.repsBand.length > 0) return ex.repsBand;
  const r = Number(ex.targetReps);
  if (!Number.isFinite(r) || r <= 0) {
    // time/carry metric (plank/farmer) — no rep band; mirror engine targetSec note.
    return ex.targetSec ? `${ex.targetSec}s` : '0';
  }
  return `${r}–${r + 1}`;
}

/** Compose one (persona × focus × freq) config → the grid entry. */
async function composeConfig(persona, focus, freq, mode) {
  resetWorld();
  setPathAFlags(false);            // clears _devFlags to an all-OFF flipped map first
  if (mode === 'off') pinAllFlagsOff();
  else clearFlags();               // brainon → registry defaults drive

  const now0 = COHORT_START;
  // base = exactly `freq` evenly-spaced training days. The live maintenance/older
  // reshape (dp_maintenance_freq_reshape_v1, ON in brain-on) caps + re-spaces those
  // days for a maintenance-goal / age>=60 trainee — so compute the EFFECTIVE active
  // week here (same pure helper the engine uses) and seed + query exactly those days,
  // keeping the exporter's queried offsets aligned with the engine's real schedule.
  let week = sevenWeekFromOffsets(evenSpacedDays(freq));
  // Mirror the engine's EFFECTIVE day cap: maintenance/older reshape
  // (dp_maintenance_freq_reshape_v1) UNION the low-capacity cap (dp_lowcap_effective_freq_v1
  // — injured/beginner), tighter wins. Keeps the exporter's queried offsets aligned with the
  // engine's real schedule so the grid lists exactly the trained days.
  const maintMax = isEnabled('dp_maintenance_freq_reshape_v1')
    ? maintenanceMaxDays(persona.goal, persona.age)
    : null;
  const lowCapMax = isEnabled('dp_lowcap_effective_freq_v1')
    ? lowCapacityMaxDays({
      injured: !!persona.pain,
      beginner: persona.experience === 'incepator',
    })
    : null;
  const effMax =
    maintMax === null ? lowCapMax
      : lowCapMax === null ? maintMax
        : Math.min(maintMax, lowCapMax);
  if (effMax !== null) week = reshapeMaintenanceWeek(week, effMax);
  const offsets = [];
  for (let i = 0; i < 7; i++) if (week[i]) offsets.push(i);
  seedSchedule(offsets);           // the effective active days, honored by compose
  if (persona.pain) seedPain(persona.pain, now0);
  if (persona.timeCapMin) {
    world.useWorkoutStore.setState({ sessionTimeBudgetMin: persona.timeCapMin });
  }

  const onboardingData = {
    age: persona.age,
    sex: persona.sex,
    goal: persona.goal,
    experience: persona.experience,
    weight: persona.weight,
    height: persona.height,
    frequency: String(freq),
    focusPreset: focus,
    ...(persona.targetWeight !== undefined ? { targetWeight: persona.targetWeight } : {}),
  };
  world.useOnboardingStore.setState({
    data: {
      ...onboardingData,
      // a non-balanced focus is treated as a deliberate pick from a week ago so
      // the specialization mesocycle is active (same trick pm-run uses).
      focusPresetPickedAt: focus && focus !== 'balanced' ? now0 - 7 * MS_DAY : null,
    },
    completed: true,
    completedAt: now0,
  });

  const days = [];
  const weekly = {};
  let totalWeeklySets = 0;
  const failures = [];

  for (const off of offsets) {
    const now = new Date(now0 + off * MS_DAY);
    let plan = null;
    try { plan = await world.composePlannedWorkoutToday(now); }
    catch (e) { failures.push({ off, err: String(e) }); continue; }
    if (!plan || plan.error) { failures.push({ off, err: plan && plan.error }); continue; }

    const exs = plan.exercises || [];
    // A seeded offset that the live maintenance/older reshape turned into a REST
    // day composes to an empty plan — skip it (the grid lists only trained days,
    // mirroring the engine's real schedule for this persona).
    if (exs.length === 0) continue;
    const exercises = exs.map((e) => {
      const engineName = e.engineName || e.name;
      const meta = getExerciseMetadata(engineName);
      const group = meta.muscle_target_primary;
      const sets = e.sets || 0;
      weekly[group] = (weekly[group] || 0) + sets;
      totalWeeklySets += sets;
      const bodyweight = e.isBodyweight === true;
      return {
        name: e.name,
        sub: typeof e.sub === 'string' ? e.sub : '',
        group,
        sets,
        reps: repsString(e),
        kg: typeof e.targetKg === 'number' ? e.targetKg : 0,
        bodyweight,
        tier: meta.tier,
      };
    });

    const type = typeof plan.sessionType === 'string' ? plan.sessionType.toUpperCase() : '';
    days.push({
      label: RO_WEEKDAYS[off % 7],
      type,
      title: plan.workoutTitle || '__engine_workout_title_fallback__',
      durationMin: Math.round(plan.estimatedDuration ?? plan.estimatedDurationMin ?? 0),
      exercises,
    });
  }

  // weeklyVolumeByMuscle — re-key RO → EN bucket, summing collisions.
  const weeklyVolumeByMuscle = {};
  for (const [ro, v] of Object.entries(weekly)) {
    const en = GROUP_EN[ro] || ro;
    weeklyVolumeByMuscle[en] = (weeklyVolumeByMuscle[en] || 0) + v;
  }

  const entry = {
    configId: `${persona.id}_${focus}_${freq}d`,
    persona: {
      id: persona.id,
      name: persona.name,
      age: persona.age,
      sex: persona.sex,
      goal: persona.goal,
      experience: persona.experience,
      freq: 2, // the grid stores the base persona freq (2) in the block; real freq is the top-level `freq`.
      constraint: persona.constraint,
    },
    focus,
    freq,
    days,
    weeklyVolumeByMuscle,
    totalWeeklySets,
  };
  return { entry, failures };
}

async function buildGrid(mode) {
  const grid = {};
  const allFailures = [];
  for (const persona of GRID_PERSONAS) {
    for (const focus of FOCUSES) {
      for (const freq of freqsForPersona(persona.id)) {
        const { entry, failures } = await composeConfig(persona, focus, freq, mode);
        grid[entry.configId] = entry;
        for (const f of failures) allFailures.push({ configId: entry.configId, ...f });
      }
    }
  }
  return { grid, allFailures };
}

// ── validation diff: compare a sample of the OFF grid vs the original ─────────
function structuralDiff(mine, orig, sampleKeys) {
  let exNameHit = 0, exNameTotal = 0;
  let setsHit = 0, setsTotal = 0;
  let dayCountHit = 0, dayCountTotal = 0;
  const perConfig = [];
  for (const k of sampleKeys) {
    const a = mine[k]; const b = orig[k];
    if (!a || !b) { perConfig.push({ k, note: 'missing in ' + (!a ? 'mine' : 'orig') }); continue; }
    dayCountTotal++;
    if (a.days.length === b.days.length) dayCountHit++;
    let cfgNameHit = 0, cfgNameTot = 0, cfgSetHit = 0, cfgSetTot = 0;
    const n = Math.min(a.days.length, b.days.length);
    for (let di = 0; di < n; di++) {
      const ad = a.days[di].exercises; const bd = b.days[di].exercises;
      const bNames = bd.map((x) => x.name);
      const bByName = new Map(bd.map((x) => [x.name, x]));
      for (const ax of ad) {
        exNameTotal++; cfgNameTot++;
        if (bNames.includes(ax.name)) {
          exNameHit++; cfgNameHit++;
          const bx = bByName.get(ax.name);
          setsTotal++; cfgSetTot++;
          if (bx && bx.sets === ax.sets) { setsHit++; cfgSetHit++; }
        }
      }
    }
    perConfig.push({
      k,
      days: `${a.days.length}/${b.days.length}`,
      exNameMatch: cfgNameTot ? +(100 * cfgNameHit / cfgNameTot).toFixed(0) : 0,
      setsMatch: cfgSetTot ? +(100 * cfgSetHit / cfgSetTot).toFixed(0) : 0,
    });
  }
  return {
    exNameRate: exNameTotal ? +(100 * exNameHit / exNameTotal).toFixed(1) : 0,
    setsRate: setsTotal ? +(100 * setsHit / setsTotal).toFixed(1) : 0,
    dayCountRate: dayCountTotal ? +(100 * dayCountHit / dayCountTotal).toFixed(1) : 0,
    perConfig,
  };
}

describe.skipIf(process.env.EVAL_GRID_EXPORT !== '1')('GOAL-9 eval-grid exporter', () => {
  const mode = process.env.EVAL_GRID_MODE === 'brainon' ? 'brainon' : 'off';

  it('validation: grid sample matches the original (EVAL_GRID_MODE=off|brainon)', async () => {
    const orig = JSON.parse(fs.readFileSync(ORIGINAL_GRID, 'utf8'));
    // ~24-config spread across personas/focuses/freqs.
    const sample = [
      'p1_balanced_4d', 'p1_v-taper_3d', 'p1_lower_2d',
      'p2_back_4d', 'p2_arms_5d', 'p2_chest_2d',
      'p3_balanced_4d', 'p3_v-taper_5d', 'p3_lower_3d', 'p3_upper_1d',
      'p4_lower_4d', 'p4_shoulders_3d', 'p4_arms_2d',
      'p5_balanced_5d', 'p5_back_4d',
      'p6_balanced_3d', 'p6_chest_4d',
      'p7_balanced_2d', 'p7_back_4d',
      'p8_upper_4d', 'p8_balanced_3d',
      'p9_balanced_3d', 'p9_arms_4d',
      'p10_balanced_2d', 'p11_balanced_4d', 'p12_balanced_4d',
    ];
    const mine = {};
    for (const k of sample) {
      const m = k.match(/^(p\d+)_(.+)_(\d+)d$/);
      const persona = GRID_PERSONAS.find((p) => p.id === m[1]);
      const { entry } = await composeConfig(persona, m[2], +m[3], mode);
      mine[k] = entry;
    }
    const diff = structuralDiff(mine, orig, sample);
    console.log(`\n══ ${mode.toUpperCase()} VALIDATION DIFF vs original grid ══`);
    console.log(`exercise-name match: ${diff.exNameRate}%  |  sets match (on matched ex): ${diff.setsRate}%  |  day-count match: ${diff.dayCountRate}%`);
    console.log('per-config:');
    for (const c of diff.perConfig) {
      console.log(`  ${c.k.padEnd(20)} days=${c.days} exName=${c.exNameMatch}% sets=${c.setsMatch}%`);
    }
    // write the diff alongside for the manager.
    fs.writeFileSync(path.join(VAULT, `_EVAL_GRID_${mode.toUpperCase()}_VALIDATION_2026-06-14.json`),
      JSON.stringify(diff, null, 2));
    expect(diff.exNameRate).toBeGreaterThan(0); // sanity; the real bar is reported.
  }, 300000);

  it('export grid (mode from EVAL_GRID_MODE: off|brainon)', async () => {
    const { grid, allFailures } = await buildGrid(mode);
    const out = mode === 'brainon'
      ? path.join(VAULT, '_EVAL_GRID_2026-06-14_BRAINON.json')
      : path.join(VAULT, '_EVAL_GRID_2026-06-14_OFF.json');
    fs.writeFileSync(out, JSON.stringify(grid, null, 2));
    console.log(`\n══ EXPORTED ${Object.keys(grid).length} configs (mode=${mode}) → ${out} ══`);
    if (allFailures.length) {
      console.log(`FAILURES (${allFailures.length}):`);
      for (const f of allFailures) console.log('  ', JSON.stringify(f));
    } else {
      console.log('no compose failures.');
    }
    expect(Object.keys(grid).length).toBe(456);
  }, 1200000);
});
