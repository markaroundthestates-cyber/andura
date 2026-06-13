// ══ REPLAY-REAL — the founder's REAL training history vs the LIVE engine ═══════
//
// THE GROUND-TRUTH REGRESSION NET. Unit tests assert the engine against
// hand-picked numbers; this asserts it against WHAT ACTUALLY HAPPENED. Daniel's
// own account (6 sessions, 2026-06-01→11, 99 logged sets, 30 PRs, 18 calibration
// factors, onboarding m/36/181/108 intermediar v-taper CUT) is replayed
// CHRONOLOGICALLY: for each real session date D we seed the world with ONLY the
// data that existed STRICTLY BEFORE D, then ask the engine — through the SAME
// public entry points the app uses — what it would have prescribed, and check it
// stayed sane against what he really lifted that day.
//
// This is the net that would have caught the bugs the unit suite missed:
//   - the name-key bug (logs keyed on the RO display name → engine reads the EN
//     canonical → getLogs empty → a lift he progressed craters back to cold-start);
//   - the synergist under-floor (an isolation after a compound shaved below his
//     proven working weight);
//   - the 110×15 cold-start calibration inflation (a first-exposure seed far above
//     his demonstrated capacity);
//   - the Back Squat 220 transfer (an unlogged compound transferring an absurd load
//     off a wrong-movement same-muscle source).
// Each of those is a band a real session would have blown — and now does, loudly.
//
// PUBLIC SEAM (robust to engine-internal edits): per-lift loads come from
// `DP.getSmartRecommendation(name, readiness, null, nowMs, …)` — the EXACT call
// scheduleAdapterAggregate.compose.ts makes for every planned exercise (compose.ts
// :215), keyed on the EN canonical name (the name-key surface). Whole-week SHAPE
// comes from `composePlannedWorkoutToday(date)` — the full live composer. Both are
// the same entry points the app drives, so a sibling agent editing schedule/
// sessionBuilder internals cannot silently break this harness's contract.
//
// DETERMINISTIC: every DP call and every compose call gets an INJECTED clock
// (nowMs / new Date(D)) pinned to the session date — no wall-clock, no Date.now().
// Seeding mirrors fp-config.js `world` + the _DIAG focus×freq sweep probe (the two
// modules that already solve store/DB seeding for his real state).
//
// BANDS are named constants with WHY comments. A future engine change that
// LEGITIMATELY shifts a band must update it CONSCIOUSLY here — the assertion
// message names the real session + lift that broke, so the diff is self-explaining.
// Bands were derived from his data + the _SEEDFIX_REPORT_2026-06-12.md sentinels,
// NOT invented to make the suite green.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { world, resetWorld } from '../full-path-sim/fp-config.js';
import { DP } from '../../../src/engine/dp.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { SCHEDULE_STORE_KEY } from '../../../src/engine/schedule/scheduleAdapter/constants.js';

// ── fixture: his minimized real account (engine-relevant fields only) ──────────
// Path is relative to the vitest cwd (project root) — same convention as the
// full-path-sim / _DIAG probes that read his real state from disk.
const FX = JSON.parse(
  readFileSync('./tests/engine/replay-real/fixtures/daniel-2026-06-12.json', 'utf8'),
);

// ── the 6 real sessions, chronological ─────────────────────────────────────────
const SESSION_DATES = ['2026-06-01', '2026-06-03', '2026-06-05', '2026-06-06', '2026-06-10', '2026-06-11'];
const dayStartMs = (iso) => Date.parse(iso + 'T00:00:00Z');
const noonClock = (iso) => dayStartMs(iso) + 12 * 3600000; // pinned per-session clock

// ════════════════════════════ BANDS (named, WHY) ══════════════════════════════

// WARM band — a lift he has ALREADY logged at this point in the replay. The engine
// knows his demonstrated working weight, so its rec must stay in a tight neighbour-
// hood of what he actually lifted that session. This is the real regression net:
//   - the name-key bug would empty getLogs → rec drops to a cold-start seed
//     (~0.2× actual) → BELOW 0.55× → FAIL;
//   - the synergist under-floor shaved an iso below proven kg → BELOW 0.55× → FAIL;
//   - a calibration inflation would push rec ABOVE 1.45× → FAIL.
// Upper 1.45 (not 1.25): he sometimes trained a lift LIGHT after a heavier session
// (Lat Pulldown 64 on 06-03 → 45 on 06-05 while the engine correctly held ~60 =
// 1.33× the light day). The band anchors on that day's session-MAX, so a correct
// "remember the heavier prior" rec must fit. Lower 0.55 catches a genuine crater
// without flagging a deliberate light/deload day.
const WARM_LO = 0.55;
const WARM_HI = 1.45;

// COLD band — a lift with NO prior logs at this point (first-ever exposure). The
// engine has zero personal signal, so by DESIGN it seeds CONSERVATIVELY (Gigel-
// safe ramp, _SEEDFIX_REPORT §"Back Squat 220→100"). Closeness to his eventual
// capacity is NOT asserted (a first-exposure Leg Press seeds ~0.2× his eventual
// 230 — correct, not a bug). What IS asserted is DIRECTIONAL sanity:
//   - alive: rec > 0;
//   - no INFLATION: rec ≤ COLD_CEIL × best-e1RM (the 110×15 bug blew past this);
//   - no CRATER: rec ≥ COLD_FLOOR × best-e1RM (a name-key+transfer double-miss
//     collapses a lift to ~0 → below this floor → FAIL).
// COLD_FLOOR 0.08: the lowest first-exposure ratio actually observed in his replay
// is ~0.16× best-e1RM (Leg Extension 20 / e1RM 128); 0.08 sits a safe margin below
// the real engine floor so it only fires on a true collapse, never on the normal
// conservative seed. COLD_CEIL 0.90: a cold seed must never reach 90% of his all-
// time e1RM (his actual cold recs top out ~0.21× → enormous headroom; the ceiling
// exists to catch inflation, not to fit the data).
//
// COLD_INIT_KG 20 — the cold ceiling is max(COLD_CEIL×e1RM, COLD_INIT_KG). The
// engine's first-exposure seed is the CURATED per-movement start table (dp.js:1574
// suggestStartWeight) / the flat INIT (iso 10 / compound 20, dp.js:1569), NOT a
// fraction of the user's e1RM. For a lift where his OWN demonstrated e1RM is light
// (Reverse Curl EZ-bar tops at 15×8 → e1RM 19, so 0.9×=17.1) the curated cold seed
// (20) legitimately exceeds 0.9×e1RM — that is the documented conservative start,
// not inflation. The 20-kg INIT floor lets a by-design curated seed pass while a
// seed materially above BOTH the e1RM-scaled ceiling AND the curated floor (the
// 110×15 class) still fails. Compounds seed via transfer/curated and are pinned
// tighter by the Section-3 sentinels.
const COLD_FLOOR = 0.08;
const COLD_CEIL = 0.90;
const COLD_INIT_KG = 20;

// ABSOLUTE ceiling — applies to EVERY rec, warm or cold: never above 2× his best
// demonstrated e1RM for that lift. The hard backstop on any path (transfer,
// calibration, climb) going haywire.
const ABS_CEIL_X_E1RM = 2.0;

// ── per-lift e1RM ceilings (Epley over his full history: logs ∪ PR-records) ─────
function bestE1RM(ex) {
  let best = 0;
  for (const l of FX.logs) {
    if (l.ex !== ex) continue;
    const reps = parseInt(l.reps, 10) || 1;
    best = Math.max(best, l.kg * (1 + reps / 30));
  }
  for (const p of FX['pr-records']) {
    if (p.ex !== ex) continue;
    best = Math.max(best, p.kg * (1 + (p.reps || 1) / 30));
  }
  return best;
}

// ── session-max working weight + prior log count per lift per date ──────────────
function sessionLifts(iso) {
  const rows = FX.logs.filter((l) => l.date === iso);
  const perEx = {};
  for (const r of rows) {
    (perEx[r.ex] ??= { maxW: 0, reps: [] });
    if (r.kg > perEx[r.ex].maxW) perEx[r.ex].maxW = r.kg;
    perEx[r.ex].reps.push(parseInt(r.reps, 10));
  }
  return perEx;
}

// ── seed the world with ALL data STRICTLY BEFORE `beforeMs` ─────────────────────
// Mirrors the _DIAG focus×freq sweep's seedDanielState (resetWorld → DB.set logs/
// pr-records/dp-cal-factors/readiness/phase-override + schedule store + onboarding
// store), the proven path for his real state through the live composer.
function seedBefore(beforeMs) {
  resetWorld();
  world.DB.set('logs', FX.logs.filter((l) => (l.ts ?? 0) < beforeMs));
  world.DB.set('pr-records', FX['pr-records'].filter((p) => (p.ts ?? 0) < beforeMs));
  world.DB.set('dp-cal-factors', FX['dp-cal-factors']);
  world.DB.set('readiness', FX.readiness);
  if (FX.phaseOverride) world.DB.set('phase-override', FX.phaseOverride);
  if (Array.isArray(FX.scheduleDays)) {
    localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ state: { days: FX.scheduleDays }, version: 0 }));
  }
  const ob = FX.onboarding;
  world.useOnboardingStore.setState({
    data: {
      age: ob.age, sex: ob.sex, goal: ob.goal, experience: ob.experience,
      weight: ob.weight, height: ob.height, trainingType: ob.trainingType,
      frequency: ob.frequency, focusPreset: ob.focusPreset,
      focusPresetPickedAt: ob.completedAt,
    },
    completed: true, completedAt: ob.completedAt,
  });
}

// The exact prescriptive call compose.ts:215 makes (readiness null = neutral; his
// computed readinessScore is 60-85 across these days → the <60 gate is inert, so
// null is byte-equivalent here AND keeps the replay independent of the TDEE/protein
// readiness model, which is not what this harness tests).
function recFor(name, nowMs) {
  return DP.getSmartRecommendation(name, null, null, nowMs, null, [], {});
}

describe('REPLAY-REAL — founder real history vs live engine', () => {
  // ════════════════════════════════════════════════════════════════════════════
  // 1. CHRONOLOGICAL REPLAY — per logged set, rec stays in a sane band of actual.
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. chronological replay (rec kg in sane band of actual)', () => {
    for (const iso of SESSION_DATES) {
      it(`session ${iso}: every logged lift recommends a sane kg`, () => {
        seedBefore(dayStartMs(iso));
        const clock = noonClock(iso);
        const lifts = sessionLifts(iso);
        for (const ex of Object.keys(lifts)) {
          const actual = lifts[ex].maxW;
          const prior = DP.getLogs(ex, 50).length; // history visible AT this date
          const rec = recFor(ex, clock);
          const kg = rec && typeof rec.kg === 'number' ? rec.kg : null;
          const e1rm = bestE1RM(ex);

          // alive + absolute ceiling (every lift, every path)
          expect(kg, `[${iso}] ${ex}: engine produced no kg (null rec)`).not.toBeNull();
          expect(kg, `[${iso}] ${ex}: rec ${kg} must be > 0`).toBeGreaterThan(0);
          expect(
            kg,
            `[${iso}] ${ex}: rec ${kg} kg exceeds 2× best e1RM (${e1rm.toFixed(0)}) — inflation/transfer blowout`,
          ).toBeLessThanOrEqual(ABS_CEIL_X_E1RM * e1rm);

          if (prior > 0) {
            // WARM — tight band around demonstrated working weight.
            const lo = WARM_LO * actual;
            const hi = WARM_HI * actual;
            expect(
              kg,
              `[${iso}] ${ex} (WARM, ${prior} prior logs): rec ${kg} kg below ${WARM_LO}× actual ${actual} `
                + `(=${lo.toFixed(1)}) — a CRATER (name-key/synergist-under-floor regression). Update WARM_LO `
                + 'only if this drop is a deliberate, documented engine change.',
            ).toBeGreaterThanOrEqual(lo);
            expect(
              kg,
              `[${iso}] ${ex} (WARM, ${prior} prior logs): rec ${kg} kg above ${WARM_HI}× actual ${actual} `
                + `(=${hi.toFixed(1)}) — over-prescription/calibration inflation. Update WARM_HI consciously.`,
            ).toBeLessThanOrEqual(hi);
          } else {
            // COLD — directional sanity only (conservative seed is by design).
            const floor = COLD_FLOOR * e1rm;
            const ceil = Math.max(COLD_CEIL * e1rm, COLD_INIT_KG); // curated/INIT floor

            expect(
              kg,
              `[${iso}] ${ex} (COLD, first exposure): rec ${kg} kg below ${COLD_FLOOR}× best-e1RM `
                + `(${e1rm.toFixed(0)} → floor ${floor.toFixed(1)}) — a COLLAPSE (transfer+name-key double miss). `
                + 'Update COLD_FLOOR only if a lower conservative seed is the intended new behavior.',
            ).toBeGreaterThanOrEqual(floor);
            expect(
              kg,
              `[${iso}] ${ex} (COLD, first exposure): rec ${kg} kg above ${COLD_CEIL}× best-e1RM `
                + `(${e1rm.toFixed(0)} → ceil ${ceil.toFixed(1)}) — cold-start INFLATION (the 110×15 class). `
                + 'Update COLD_CEIL consciously.',
            ).toBeLessThanOrEqual(ceil);
          }
        }
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. NO-CRATER INVARIANT — once a lift is warm, later recs never drop below his
  //    demonstrated PR-floor (the Bayesian 9-vs-14 regression net). As sessions
  //    accumulate the engine must not FORGET proven capacity.
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. no-crater (warm rec never drops below demonstrated PR-floor)', () => {
    // lifts he trained on ≥2 distinct dates → a chronology to regress against.
    const repeated = (() => {
      const datesByEx = {};
      for (const l of FX.logs) (datesByEx[l.ex] ??= new Set()).add(l.date);
      return Object.entries(datesByEx).filter(([, s]) => s.size >= 2).map(([ex]) => ex);
    })();

    for (const ex of repeated) {
      it(`${ex}: rec never craters below proven floor across sessions`, () => {
        // For each session AFTER the lift first appears, the rec must be ≥
        // PR_FLOOR_X × (the heaviest working weight he had demonstrated BEFORE that
        // session). PR_FLOOR_X = WARM_LO: a warm rec may legitimately ease a step
        // (DP "hard eases" design) but must not crater off the proven floor.
        const exDates = SESSION_DATES.filter((iso) => FX.logs.some((l) => l.ex === ex && l.date === iso));
        // demonstrated max strictly before a date
        const demoBefore = (iso) => {
          const t = dayStartMs(iso);
          let m = 0;
          for (const l of FX.logs) if (l.ex === ex && (l.ts ?? 0) < t && l.kg > m) m = l.kg;
          return m;
        };
        for (let i = 1; i < exDates.length; i++) {
          const iso = exDates[i];
          const floorKg = demoBefore(iso);
          if (floorKg <= 0) continue;
          seedBefore(dayStartMs(iso));
          const rec = recFor(ex, noonClock(iso));
          const kg = rec && typeof rec.kg === 'number' ? rec.kg : null;
          expect(
            kg,
            `[${iso}] ${ex}: rec ${kg} kg craters below ${WARM_LO}× demonstrated-before floor ${floorKg} `
              + `(=${(WARM_LO * floorKg).toFixed(1)}) — the engine FORGOT proven capacity (PR-floor regression).`,
          ).toBeGreaterThanOrEqual(WARM_LO * floorKg);
        }
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. TRANSFER SANITY — curated UNLOGGED big lifts on his REAL state. Cold-start
  //    rec must land in the verified bands (anchored on _SEEDFIX_REPORT sentinels).
  //    This is the Back-Squat-220 / Hammer-25 / Smith-OHP-off-a-rear-delt net.
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. transfer sanity (curated unlogged lifts, full real state)', () => {
    // [lift, lo, hi, why] — bands from _SEEDFIX_REPORT_2026-06-12.md (the cold-
    // start transfer 4-bug fix, measured on Daniel's REAL state via the live chain).
    const SENTINELS = [
      // Back Squat: pre-fix transferred 220 off Leg Press (wrong magnitude); post-
      // fix Leg Press ×0.45 → 100 (Gigel-safe). Band brackets the verified 100.
      ['Barbell Back Squat (High Bar)', 80, 110, 'Leg Press ×0.45 → ~100 (was 220, BUG A)'],
      // Hack Squat: same path → ~100, must be materially < his 200-class machine load.
      ['Hack Squat Machine', 80, 130, 'Leg Press ×0.45 → ~100 (materially < 200)'],
      // Smith OHP: rear-delt-fly source REJECTED (wrong movement) → population ohp
      // prior → ~55. Band spans the sane press family, not the bug's 25.
      ['Smith OHP', 35, 62, 'rear-delt REJECTED → ohp population prior → ~55'],
      // Converging Chest Press: cable-fly source REJECTED → Flat DB Press ×2.5 →
      // ~75-80 (benchpress family). Verified identical to Flat Chest Press Machine.
      ['Converging Chest Press', 60, 95, 'cable-fly REJECTED → Flat DB ×2.5 → ~75-80'],
      // Flat Chest Press Machine: now classifies `benchpress` (BUG 4 fix) → Flat DB
      // Press ×2.5 → ~75-80, byte-identical to Converging. (NOTE: Hammer Curl was a
      // SEEDFIX sentinel too but he LOGGED it on 06-11 → not a cold-transfer case in
      // his full state; it is covered warm in Section 1 instead.)
      ['Flat Chest Press Machine', 60, 95, 'now benchpress → Flat DB ×2.5 → ~75-80'],
    ];

    // Seed his FULL real state (everything, as of after his last session).
    const fullClock = noonClock('2026-06-12');
    for (const [ex, lo, hi, why] of SENTINELS) {
      it(`${ex}: cold-start rec in verified band [${lo}, ${hi}] (${why})`, () => {
        seedBefore(dayStartMs('2026-06-12') + 1); // strictly after every real log
        const rec = recFor(ex, fullClock);
        const kg = rec && typeof rec.kg === 'number' ? rec.kg : null;
        expect(DP.getLogs(ex, 50).length, `${ex} must be UNLOGGED for a transfer test`).toBe(0);
        expect(kg, `${ex}: engine produced no kg`).not.toBeNull();
        expect(
          kg,
          `${ex}: transfer rec ${kg} kg below verified band [${lo},${hi}] (${why}). `
            + 'A drop here = a transfer source going wrong-direction. Update the band only with a documented fix.',
        ).toBeGreaterThanOrEqual(lo);
        expect(
          kg,
          `${ex}: transfer rec ${kg} kg ABOVE verified band [${lo},${hi}] (${why}). `
            + 'An inflation here = the Back-Squat-220 class bug. Update the band only with a documented fix.',
        ).toBeLessThanOrEqual(hi);
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. WORKOUT-SHAPE SANITY — his REAL account at his REAL settings, composed
  //    through the live composer for a fresh future week (v-taper, 4d, CUT).
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. workout-shape sanity (live composer, his real settings)', () => {
    // Compose a forward week so each weekday composes as a FUTURE fresh-week
    // session (structure review, not same-day recovery nuance) — same approach as
    // the _DIAG focus×freq sweep. Mon-Sun 2026-06-15..21; his schedule pattern
    // [rest,rest,training,training,training,training,rest] → Wed-Sat train.
    const WEEK_MON = Date.UTC(2026, 5, 15, 6, 0, 0);
    // 'bench' counts: a chest-primary "...Bench" (flat/incline/decline) IS a press
    // (the name carries no literal "press"). Same blind-spot dp_selection_dedup_v1
    // closed in movementKey — a bench is a chest press, not a fly.
    const CHEST_PRESS = (name, g) => g === 'piept' && /press|dip|bench/i.test(name);
    const LUMBAR = /romanian deadlift|deadlift|hyperextension|back extension|good morning/i;

    // collect the composed training days once (compose is async)
    async function composeWeek() {
      const days = [];
      for (let off = 0; off < 7; off++) {
        const trains = Array.isArray(FX.scheduleDays) ? FX.scheduleDays[off] === 'training' : true;
        if (!trains) continue;
        seedBefore(dayStartMs('2026-06-12') + 1); // full real state
        let plan = null;
        try {
          plan = await world.composePlannedWorkoutToday(new Date(WEEK_MON + off * 86400000));
        } catch (e) {
          plan = { error: String(e) };
        }
        days.push({ off, plan });
      }
      return days;
    }

    it('every training day is well-formed (≥3 ex, has a press where chest-capable, no dup, lumbar dedup)', async () => {
      const days = await composeWeek();
      expect(days.length, 'expected ≥1 composed training day for his 4d schedule').toBeGreaterThanOrEqual(1);
      for (const { off, plan } of days) {
        const tag = `day+${off}`;
        expect(plan, `${tag}: composer threw`).toBeTruthy();
        expect(plan.error, `${tag}: composer error: ${plan && plan.error}`).toBeFalsy();
        expect(Array.isArray(plan.exercises), `${tag}: no exercises array`).toBe(true);
        const rows = plan.exercises.map((e) => {
          const name = e.engineName || e.name;
          const meta = getExerciseMetadata(name) || {};
          return { name, g: meta.muscle_target_primary, kg: e.targetKg };
        });

        // (a) no thin day
        expect(
          rows.length,
          `${tag} [${plan.sessionType}]: THIN day — only ${rows.length} exercises (<3). Lifts: ${rows.map((r) => r.name).join(', ')}`,
        ).toBeGreaterThanOrEqual(3);

        // (b) a real press where the day is chest-capable (push/upper/full with chest)
        const t = plan.sessionType || '';
        const chestCapable = /push|upper|full/i.test(t) && rows.some((r) => r.g === 'piept');
        if (chestCapable) {
          expect(
            rows.some((r) => CHEST_PRESS(r.name, r.g)),
            `${tag} [${t}]: chest-capable day with NO chest press. Lifts: ${rows.map((r) => r.name).join(', ')}`,
          ).toBe(true);
        }

        // (c) no duplicate exercise within a day
        const names = rows.map((r) => r.name);
        const dups = names.filter((n, i) => names.indexOf(n) !== i);
        expect(
          dups.length,
          `${tag} [${t}]: duplicate exercise(s) within the day: ${[...new Set(dups)].join(', ')}`,
        ).toBe(0);

        // (d) lumbar dedup — at most ONE heavy-lumbar hinge per day
        const lumbar = rows.filter((r) => LUMBAR.test(r.name)).map((r) => r.name);
        expect(
          lumbar.length,
          `${tag} [${t}]: ${lumbar.length} heavy-lumbar lifts in one day (${lumbar.join(', ')}) — lumbar dedup broke (cap 1).`,
        ).toBeLessThanOrEqual(1);
      }
    }, 60000);
  });
});
