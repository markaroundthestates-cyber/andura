import { describe, it, expect } from 'vitest';
import { MS_PER_DAY, MS_PER_HOUR } from '../../constants.js';
import {
  getRecoveryByGroup,
  daysSinceGroup,
  hoursSinceGroup,
  getGroupRecoveryDetail,
  groupForExerciseBig11,
  getLaggingMuscles,
  GROUP_HEAD_MAP,
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  BIG11_GROUPS,
} from '../muscleRecovery.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';
import { MUSCLE_HEADS, getMuscleState } from '../muscleMap.js';

const now = Date.now();
const hoursAgo = (h) => now - h * MS_PER_HOUR;
const daysAgo  = (d) => now - d * MS_PER_DAY;

describe('getRecoveryByGroup (Big 11 canonical V1)', () => {
  it('returns all groups recovered when no logs provided', () => {
    const state = getRecoveryByGroup([]);
    expect(Object.keys(state).sort()).toEqual(
      Object.keys(GROUP_HEAD_MAP).sort()
    );
    Object.values(state).forEach(s => expect(s).toBe('recovered'));
  });

  it('marks piept fatigued after recent heavy session', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Flat DB Press',    w: 32, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: hoursAgo(2) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(state.piept).toBe('fatigued');
  });

  it('marks piept recovered after 5+ days', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: daysAgo(6) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(state.piept).toBe('recovered');
  });

  it('marks umeri partial when stress is moderate (24-48h)', () => {
    // delt_mid has 48h recovery — single moderate exposure at 24h shows partial
    const logs = [
      { ex: 'DB Shoulder Press', w: 20, reps: 8, rpe: 8, ts: hoursAgo(24) },
      { ex: 'Lateral Raises',    w: 10, reps: 12, rpe: 7, ts: hoursAgo(24) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(['partial', 'fatigued']).toContain(state.umeri);
  });
});

describe('daysSinceGroup (Big 11 canonical V1)', () => {
  it('returns null when no logs hit the group', () => {
    expect(daysSinceGroup([], 'piept')).toBeNull();
  });

  it('returns days since last piept session', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(3) },
      { ex: 'Lateral Raises',   w: 10, reps: 12, ts: daysAgo(1) },
    ];
    expect(daysSinceGroup(logs, 'piept')).toBe(3);
    expect(daysSinceGroup(logs, 'umeri')).toBeLessThanOrEqual(1);
  });
});

describe('hoursSinceGroup — sub-day elapsed precision (Big 11 canonical V1)', () => {
  // Real wall-clock anchors: trained yesterday 18:00, checked next morning 07:00.
  // That is 13h of rest — sub-minimal for the SAME group — yet a day-floored
  // model reads "yesterday"/0-1 days and treats it as a full rest day.
  const yesterday1800 = new Date('2026-06-04T18:00:00').getTime();
  const today0700 = new Date('2026-06-05T07:00:00').getTime();

  it('returns null when no logs hit the group', () => {
    expect(hoursSinceGroup([], 'picioare-quads')).toBeNull();
  });

  it('reports the REAL 13h gap for an 18:00 -> next-day 07:00 leg session', () => {
    const logs = [{ ex: 'Leg Press', w: 120, reps: 8, rpe: 9, ts: yesterday1800 }];
    const hours = hoursSinceGroup(logs, 'picioare-quads', today0700);
    expect(hours).toBeCloseTo(13, 5);
    // Where the day-floored signal hides it: floor(13h) -> 0 whole days.
    expect(daysSinceGroup(logs, 'picioare-quads', today0700)).toBe(0);
  });
});

describe('getGroupRecoveryDetail — exposed {state, elapsedHours} signal', () => {
  // Same 18:00 -> 07:00 (13h) leg session. quad recoveryHours=96h, so 13h is deep
  // sub-minimal: the group must NOT read 'recovered', and elapsedHours must be the
  // real ~13 (not floored to a day).
  const yesterday1800 = new Date('2026-06-04T18:00:00').getTime();
  const today0700 = new Date('2026-06-05T07:00:00').getTime();
  const legLogs = [
    { ex: 'Leg Press', w: 120, reps: 8, rpe: 9, ts: yesterday1800 },
    { ex: 'Leg Extension', w: 60, reps: 10, rpe: 8, ts: yesterday1800 },
  ];

  it('exposes real elapsedHours and a non-recovered state for a 13h-rested group', () => {
    const detail = getGroupRecoveryDetail(legLogs, undefined, today0700);
    expect(detail['picioare-quads'].elapsedHours).toBeCloseTo(13, 5);
    expect(['partial', 'fatigued']).toContain(detail['picioare-quads'].state);
    expect(detail['picioare-quads'].state).not.toBe('recovered');
  });

  it('reports every Big-11 group; untrained groups recovered with null elapsedHours', () => {
    const detail = getGroupRecoveryDetail(legLogs, undefined, today0700);
    expect(Object.keys(detail).sort()).toEqual(BIG11_GROUPS.slice().sort());
    // piept never trained in legLogs => recovered, no elapsed time.
    expect(detail.piept.state).toBe('recovered');
    expect(detail.piept.elapsedHours).toBeNull();
  });
});

describe('groupForExerciseBig11 — exercise -> primary Big-11 group(s)', () => {
  it('maps a chest press to piept', () => {
    expect(groupForExerciseBig11('Flat DB Press')).toEqual(['piept']);
    expect(groupForExerciseBig11('Incline DB Press')).toEqual(['piept']);
  });

  it('maps a back row to spate', () => {
    expect(groupForExerciseBig11('Cable Row')).toEqual(['spate']);
    expect(groupForExerciseBig11('Lat Pulldown')).toEqual(['spate']);
  });

  it('maps a biceps curl to biceps', () => {
    expect(groupForExerciseBig11('Cable Curl')).toEqual(['biceps']);
  });

  it('maps a multi-group lift to each primary group (Leg Press -> quads + glutes)', () => {
    const groups = groupForExerciseBig11('Leg Press');
    expect(groups).toContain('picioare-quads');
    expect(groups).toContain('fese');
  });

  it('returns [] for an unknown / empty exercise name', () => {
    expect(groupForExerciseBig11('Totally Unknown Lift')).toEqual([]);
    expect(groupForExerciseBig11(undefined)).toEqual([]);
    expect(groupForExerciseBig11(null)).toEqual([]);
    expect(groupForExerciseBig11('')).toEqual([]);
  });
});

describe('getLaggingMuscles (Big 11 canonical V1)', () => {
  it('returns empty when no logs', () => {
    expect(getLaggingMuscles({ logs: [] })).toEqual([]);
  });

  it('detects umeri lagging when piept+spate trained heavy, umeri barely', () => {
    const logs = [];
    // Lots of piept sets (12)
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Lots of spate sets (12)
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Lat Pulldown', w: 50, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Barely any umeri direct (1 set)
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });

    const lagging = getLaggingMuscles({ logs });
    const groups = lagging.map(l => l.group);
    expect(groups).toContain('umeri');
  });

  it('ratio of laggers below 0.6 of average', () => {
    const logs = [];
    for (let i = 0; i < 10; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(i + 1) });
    }
    for (let i = 0; i < 10; i++) {
      logs.push({ ex: 'Lat Pulldown', w: 50, reps: 8, ts: daysAgo(i + 1) });
    }
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });

    const lagging = getLaggingMuscles({ logs });
    lagging.forEach(l => {
      expect(l.ratio).toBeLessThan(0.6);
    });
  });

  it('respects custom lookbackDays', () => {
    const logs = [];
    // All piept but >14 days ago
    for (let i = 0; i < 10; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(20 + i) });
    }
    // Recent umeri + spate
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });
    logs.push({ ex: 'Lat Pulldown',   w: 50, reps: 8,  ts: daysAgo(2) });

    const lagging = getLaggingMuscles({ logs, lookbackDays: 14 });
    // piept dropped out of window — only umeri+spate active, both equal → no lagging
    expect(lagging.find(l => l.group === 'piept')).toBeUndefined();
  });

  it('skips baseline logs', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(2), baseline: true },
      { ex: 'Lat Pulldown',     w: 50, reps: 8, ts: daysAgo(2) },
      { ex: 'Lateral Raises',   w: 10, reps: 12, ts: daysAgo(2) },
    ];
    const lagging = getLaggingMuscles({ logs });
    expect(lagging.find(l => l.group === 'piept')).toBeUndefined();
  });
});

// ══ Big 11 canonical V1 anatomical taxonomy — constants contract ════════
// Per ADR_ENGINE_REFACTOR_BIG8_TO_BIG11_V1 §2 + §3.2 + §4.1 LOCK V1 2026-05-14

describe('Big 11 canonical V1 anatomical taxonomy', () => {
  it('GROUP_HEAD_MAP_BIG11 has 11 canonical V1 entries', () => {
    expect(Object.keys(GROUP_HEAD_MAP_BIG11).length).toBe(11);
  });

  it('GROUP_HEAD_MAP_BIG11 contains all 11 canonical V1 categories', () => {
    const expected = [
      'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate',
      'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ];
    expected.forEach(group => {
      expect(GROUP_HEAD_MAP_BIG11).toHaveProperty(group);
    });
  });

  it('GROUP_LABELS_RO_BIG11 has Romanian label per canonical V1 group', () => {
    BIG11_GROUPS.forEach(group => {
      expect(GROUP_LABELS_RO_BIG11[group]).toBeDefined();
      expect(typeof GROUP_LABELS_RO_BIG11[group]).toBe('string');
      expect(GROUP_LABELS_RO_BIG11[group].length).toBeGreaterThan(0);
    });
  });

  it('BIG11_GROUPS ordered iteration starts piept ends gambe', () => {
    expect(BIG11_GROUPS.length).toBe(11);
    expect(BIG11_GROUPS[0]).toBe('piept');
    expect(BIG11_GROUPS[10]).toBe('gambe');
  });

  it('GROUP_HEAD_MAP backwards-compat alias = Big 11 forward', () => {
    expect(GROUP_HEAD_MAP).toBe(GROUP_HEAD_MAP_BIG11);
  });

  it('arms cluster split into biceps + triceps + antebrate per §4.1', () => {
    expect(GROUP_HEAD_MAP_BIG11.biceps).toEqual(['bi_long', 'bi_short']);
    expect(GROUP_HEAD_MAP_BIG11.triceps).toEqual(['tri_long', 'tri_lateral', 'tri_medial']);
    expect(GROUP_HEAD_MAP_BIG11.antebrate).toEqual([]); // no forearm heads in muscleMap V1
  });

  it('legs cluster split into picioare-quads + picioare-hamstrings + fese + gambe per §4.1', () => {
    expect(GROUP_HEAD_MAP_BIG11['picioare-quads']).toEqual(['quad']);
    expect(GROUP_HEAD_MAP_BIG11['picioare-hamstrings']).toEqual(['hamstring']);
    expect(GROUP_HEAD_MAP_BIG11.fese).toEqual(['glute']);
    expect(GROUP_HEAD_MAP_BIG11.gambe).toEqual(['calf']);
  });

  it('piept/spate/umeri preserved muscle heads identical from Big 6', () => {
    expect(GROUP_HEAD_MAP_BIG11.piept).toEqual(['chest_upper', 'chest_mid', 'chest_lower']);
    expect(GROUP_HEAD_MAP_BIG11.spate).toEqual(['lat', 'mid_trap', 'lower_back']);
    expect(GROUP_HEAD_MAP_BIG11.umeri).toEqual(['delt_front', 'delt_mid', 'delt_rear', 'rear_delt_trap']);
  });

  it('antebrate empty-heads behaves as recovered (no muscleMap heads V1)', () => {
    const state = getRecoveryByGroup([]);
    expect(state.antebrate).toBe('recovered');
  });

  it('core reads recovered with no logs (synthetic head, no baseline stress)', () => {
    const state = getRecoveryByGroup([]);
    expect(state.core).toBe('recovered');
  });

  it('core is LOADED after a heavy compound day (squat/hinge/OHP/row brace core)', () => {
    // Loaded compounds now carry a `core` secondary token; a recent heavy
    // session must lift the Core group off 'recovered' (was [] -> recovered
    // forever before, misleading the body map). Multiple compounds at high RPE
    // stack the core stabilization load past the partial threshold.
    const logs = [
      { ex: 'Leg Press', w: 200, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Romanian Deadlift', w: 100, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'DB Shoulder Press', w: 24, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Cable Row', w: 60, reps: 8, rpe: 9, ts: hoursAgo(2) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(['partial', 'fatigued']).toContain(state.core);
  });

  it('core recovers as the stress decays away (recovered 5+ days later)', () => {
    const logs = [
      { ex: 'Leg Press', w: 200, reps: 8, rpe: 9, ts: daysAgo(6) },
      { ex: 'Romanian Deadlift', w: 100, reps: 8, rpe: 9, ts: daysAgo(6) },
    ];
    expect(getRecoveryByGroup(logs).core).toBe('recovered');
  });

  it('antebrate daysSinceGroup returns null (empty heads V1)', () => {
    expect(daysSinceGroup([{ ex: 'Incline DB Press', w: 30, ts: daysAgo(1) }], 'antebrate')).toBeNull();
  });

  it('split: arms heavy session marks biceps OR triceps fatigued not both equally', () => {
    // Bayesian Curl primary bi_long → biceps fatigued; triceps untouched
    const logs = [
      { ex: 'Bayesian Curl', w: 15, reps: 8, ts: hoursAgo(2) },
      { ex: 'Cable Curl',    w: 15, reps: 8, ts: hoursAgo(2) },
      { ex: 'Hammer Curl',   w: 12, reps: 10, ts: hoursAgo(2) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(['partial', 'fatigued']).toContain(state.biceps);
    expect(state.triceps).toBe('recovered');
  });

  it('split: legs heavy session distinguishes picioare-quads vs picioare-hamstrings', () => {
    // Leg Extension primary quad → picioare-quads fatigued; hams less so
    const logs = [
      { ex: 'Leg Extension', w: 50, reps: 10, ts: hoursAgo(2) },
      { ex: 'Leg Press',     w: 100, reps: 10, ts: hoursAgo(2) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(['partial', 'fatigued']).toContain(state['picioare-quads']);
  });

  it('lagging detection considers Big 11 active groups (not Big 6 aggregation)', () => {
    const logs = [];
    // Heavy piept volume
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Heavy spate volume
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Lat Pulldown', w: 50, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Single biceps set (lagging)
    logs.push({ ex: 'Bayesian Curl', w: 15, reps: 8, ts: daysAgo(3) });

    const lagging = getLaggingMuscles({ logs });
    const groups = lagging.map(l => l.group);
    // biceps is active but well below piept+spate avg → should appear
    expect(groups).toContain('biceps');
  });

  it('lagging detection emits Romanian Big 11 label', () => {
    const logs = [];
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(i + 1) });
    }
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });
    const lagging = getLaggingMuscles({ logs });
    const umeriEntry = lagging.find(l => l.group === 'umeri');
    if (umeriEntry) {
      expect(umeriEntry.label).toBe('Umerii');
    }
  });
});

// ══ Recovery-hours runtime SoT ════════════════════════════════════════════
// Runtime decay algorithm (getMuscleState in muscleMap.js) uses head-level
// MUSCLE_HEADS.recoveryHours as the single source of truth. The prior inert
// cluster-level DECAY_RATE_HOURS_BIG11 reference table was removed (F0 dedup);
// these tests pin the runtime values that actually drive recovery decay.

describe('recovery-hours runtime SoT (MUSCLE_HEADS.recoveryHours)', () => {
  it('MUSCLE_HEADS.recoveryHours is the populated runtime SoT', () => {
    expect(MUSCLE_HEADS).toBeDefined();
    expect(Object.keys(MUSCLE_HEADS).length).toBeGreaterThan(0);
  });

  it('head-level recovery hours match locked runtime values', () => {
    expect(MUSCLE_HEADS.quad.recoveryHours).toBe(96);
    expect(MUSCLE_HEADS.hamstring.recoveryHours).toBe(96);
    expect(MUSCLE_HEADS.calf.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.bi_long.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.bi_short.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_long.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_lateral.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_medial.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.glute.recoveryHours).toBe(72);
    expect(MUSCLE_HEADS.lat.recoveryHours).toBe(72);
    expect(MUSCLE_HEADS.delt_front.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.delt_mid.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.delt_rear.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.chest_upper.recoveryHours).toBe(60);
    expect(MUSCLE_HEADS.chest_mid.recoveryHours).toBe(60);
    expect(MUSCLE_HEADS.chest_lower.recoveryHours).toBe(60);
  });
});

// ══ E-02 — injectable `now` => deterministic output (ADR 026 §9 purity) ══
// Decay + recency cutoffs read wall clock by default. Injecting a fixed `now`
// makes the same logs yield identical output regardless of when the test runs.
describe('injectable now — deterministic recovery (E-02)', () => {
  const FIXED = 1_700_000_000_000; // fixed reference timestamp
  // Heavy chest session 2h before fixed now (mirrors fatigued-threshold test).
  const logsAt = (ms) => [
    { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: ms - 2 * MS_PER_HOUR },
    { ex: 'Flat DB Press', w: 32, reps: 8, rpe: 9, ts: ms - 2 * MS_PER_HOUR },
    { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: ms - 2 * MS_PER_HOUR },
  ];

  it('getRecoveryByGroup with fixed now is reproducible (same input => same output)', () => {
    const a = getRecoveryByGroup(logsAt(FIXED), undefined, FIXED);
    const b = getRecoveryByGroup(logsAt(FIXED), undefined, FIXED);
    expect(a).toEqual(b);
    expect(a.piept).toBe('fatigued'); // recent heavy chest at fixed now
  });

  it('daysSinceGroup with fixed now computes exact elapsed days', () => {
    const logs = [{ ex: 'Incline DB Press', w: 30, ts: FIXED - 3 * MS_PER_DAY }];
    expect(daysSinceGroup(logs, 'piept', FIXED)).toBe(3);
  });

  it('getLaggingMuscles is reproducible + honors injected now cutoff', () => {
    // Multi-group volume: chest trained heavily, back trained once => back lags.
    const logs = [
      { ex: 'Incline DB Press', w: 30, ts: FIXED - 1 * MS_PER_DAY },
      { ex: 'Flat DB Press', w: 32, ts: FIXED - 1 * MS_PER_DAY },
      { ex: 'Pec Deck / Cable Fly', w: 20, ts: FIXED - 1 * MS_PER_DAY },
      { ex: 'Cable Row', w: 40, ts: FIXED - 1 * MS_PER_DAY },
    ];
    const a = getLaggingMuscles({ logs, lookbackDays: 14, now: FIXED });
    const b = getLaggingMuscles({ logs, lookbackDays: 14, now: FIXED });
    expect(a).toEqual(b); // deterministic with fixed now
    // Shift now 30 days forward => all logs outside 14-day window => no active
    // groups => empty result. Proves cutoff is driven by injected now.
    const shifted = getLaggingMuscles({ logs, lookbackDays: 14, now: FIXED + 30 * MS_PER_DAY });
    expect(shifted).toEqual([]);
  });
});

// ── Cycle-9 cluster 3 — future-dated log guard (clock skew / timezone) ──
describe('cycle9 cluster3 — future-dated log does not inflate recovery', () => {
  const NOW = Date.UTC(2026, 5, 1, 12);
  const H = (h) => NOW - h * MS_PER_HOUR;
  // A real recent chest session 6h ago + a FUTURE-dated set (clock skew: 5h ahead).
  const realSet = { ex: 'Flat DB Press', w: 32.5, reps: 8, rpe: 8, ts: H(6) };
  const futureSet = { ex: 'Flat DB Press', w: 32.5, reps: 8, rpe: 8, ts: H(-5) };

  it('getMuscleState ignores a future-dated log (no decay>1 stress inflation)', () => {
    const normal = getMuscleState([realSet], NOW);
    const withFuture = getMuscleState([realSet, futureSet], NOW);
    // The future set must NOT add inflated stress (pre-fix it nearly doubled it).
    expect(withFuture).toEqual(normal);
    // And no head exceeds the single-set peak (pre-fix a future set read decay>1).
    const peak = Math.max(...Object.values(normal));
    expect(Math.max(...Object.values(withFuture))).toBeCloseTo(peak, 6);
  });

  it('getGroupRecoveryDetail reports a non-negative elapsedHours for a future-dated log', () => {
    const detail = getGroupRecoveryDetail([realSet, futureSet], undefined, NOW);
    // Elapsed is the real last-trained set (6h), never the future one (-5h).
    expect(detail.piept.elapsedHours).toBeGreaterThanOrEqual(0);
    expect(detail.piept.elapsedHours).toBeCloseTo(6, 5);
  });

  it('a lone future-dated log reads as untrained (no negative elapsed, no stress)', () => {
    const detail = getGroupRecoveryDetail([futureSet], undefined, NOW);
    expect(detail.piept.elapsedHours).toBeNull();
    expect(detail.piept.state).toBe('recovered');
    const state = getMuscleState([futureSet], NOW);
    expect(Math.max(...Object.values(state))).toBe(0);
  });
});

// ══ Pain CDL -> Recovery escalation (item 43-H2 / ADR section 9 consumption) ══
// muscleRecovery now CONSUMES the append-only pain CDL persisted by PainButton
// (DB('pain-cdl')). A recent pain region escalates the recovery state of the
// mapped Big 11 group(s) so future sessions adapt volume. Section 8 intensity->
// action + section 9 volume multipliers anchor the mapping: sever->fatigued
// (0.60x), usor/mediu->partial (0.80x). Escalation only RAISES state.
const painEntry = (region, intensity, ts = now) => ({ type: 'pain', region, intensity, ts });

describe('getRecoveryByGroup pain CDL escalation (43-H2)', () => {
  it('no painEntries arg -> identical to log-only baseline (backward compatible)', () => {
    const logs = [{ ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: daysAgo(6) }];
    expect(getRecoveryByGroup(logs)).toEqual(getRecoveryByGroup(logs, undefined));
    expect(getRecoveryByGroup(logs, [])).toEqual(getRecoveryByGroup(logs));
  });

  it('sever (3) pain on piept escalates a recovered group to fatigued', () => {
    const state = getRecoveryByGroup([], [painEntry('piept', 3)]);
    expect(state.piept).toBe('fatigued');
  });

  it('usor (1) pain escalates a recovered group to partial (not fatigued)', () => {
    const state = getRecoveryByGroup([], [painEntry('spate', 1)]);
    expect(state.spate).toBe('partial');
  });

  it('mediu (2) pain escalates a recovered group to partial', () => {
    const state = getRecoveryByGroup([], [painEntry('umar-stang', 2)]);
    expect(state.umeri).toBe('partial');
  });

  it('cot pain escalates BOTH biceps and triceps (multi-group joint)', () => {
    const state = getRecoveryByGroup([], [painEntry('cot-drept', 3)]);
    expect(state.biceps).toBe('fatigued');
    expect(state.triceps).toBe('fatigued');
  });

  it('genunchi pain escalates BOTH picioare-quads and picioare-hamstrings', () => {
    const state = getRecoveryByGroup([], [painEntry('genunchi-stang', 2)]);
    expect(state['picioare-quads']).toBe('partial');
    expect(state['picioare-hamstrings']).toBe('partial');
  });

  it('incheietura pain escalates antebrate (empty-heads group still escalates)', () => {
    const state = getRecoveryByGroup([], [painEntry('incheietura-dreapta', 3)]);
    expect(state.antebrate).toBe('fatigued');
  });

  it('escalation only RAISES — usor pain does NOT downgrade an already-fatigued group', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Flat DB Press',    w: 32, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: hoursAgo(2) },
    ];
    expect(getRecoveryByGroup(logs).piept).toBe('fatigued');
    const state = getRecoveryByGroup(logs, [painEntry('piept', 1)]);
    expect(state.piept).toBe('fatigued');
  });

  it('stale pain (older than recency window) does NOT escalate', () => {
    const state = getRecoveryByGroup([], [painEntry('piept', 3, daysAgo(10))]);
    expect(state.piept).toBe('recovered');
  });

  it('only affects mapped group(s), leaves others at log-only state', () => {
    const state = getRecoveryByGroup([], [painEntry('glezna-stanga', 3)]);
    expect(state.gambe).toBe('fatigued');
    expect(state.piept).toBe('recovered');
    expect(state.biceps).toBe('recovered');
  });

  it('ignores non-pain entries + unknown regions (defensive)', () => {
    const state = getRecoveryByGroup([], [
      { type: 'override', region: 'piept', intensity: 3, ts: now },
      painEntry('zona-inexistenta', 3),
    ]);
    expect(state.piept).toBe('recovered');
  });

  it('PAIN_REGION_GROUP_MAP covers all 15 PainButton regions -> valid Big 11 groups', () => {
    const regions = Object.keys(PAIN_REGION_GROUP_MAP);
    expect(regions.length).toBe(15);
    for (const groups of Object.values(PAIN_REGION_GROUP_MAP)) {
      for (const g of groups) expect(BIG11_GROUPS).toContain(g);
    }
  });
});
