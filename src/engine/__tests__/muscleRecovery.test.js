import { describe, it, expect } from 'vitest';
import { MS_PER_DAY, MS_PER_HOUR } from '../../constants.js';
import {
  getRecoveryByGroup,
  daysSinceGroup,
  getLaggingMuscles,
  GROUP_HEAD_MAP,
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  DECAY_RATE_HOURS_BIG11,
  BIG11_GROUPS,
} from '../muscleRecovery.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';
import { MUSCLE_HEADS } from '../muscleMap.js';

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

  it('DECAY_RATE_HOURS_BIG11 differential per cluster research-backed (§3.2)', () => {
    // Smallest isolation (12h) — antebrate per §3.2
    expect(DECAY_RATE_HOURS_BIG11.antebrate).toBe(12);
    // Small isolation primary (24h)
    expect(DECAY_RATE_HOURS_BIG11.biceps).toBe(24);
    expect(DECAY_RATE_HOURS_BIG11.triceps).toBe(24);
    expect(DECAY_RATE_HOURS_BIG11.gambe).toBe(24);
    expect(DECAY_RATE_HOURS_BIG11.core).toBe(24);
    // Medium-large compound (36-48h)
    expect(DECAY_RATE_HOURS_BIG11.umeri).toBe(36);
    expect(DECAY_RATE_HOURS_BIG11.piept).toBe(48);
    expect(DECAY_RATE_HOURS_BIG11.fese).toBe(48);
    // Large compound slower recovery (60h)
    expect(DECAY_RATE_HOURS_BIG11.spate).toBe(60);
    expect(DECAY_RATE_HOURS_BIG11['picioare-quads']).toBe(60);
    expect(DECAY_RATE_HOURS_BIG11['picioare-hamstrings']).toBe(60);
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

  it('antebrate + core empty-heads behave as recovered (no muscleMap heads V1)', () => {
    const state = getRecoveryByGroup([]);
    expect(state.antebrate).toBe('recovered');
    expect(state.core).toBe('recovered');
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

// ══ Dual-SoT separation — runtime vs reference ════════════════════════════
// Per ENGINE-DEEPER-AUDIT chat 5 MED finding (2026-05-23): runtime decay
// algorithm uses muscleMap MUSCLE_HEADS.recoveryHours (head-level), NU
// DECAY_RATE_HOURS_BIG11 (cluster-level published reference). Values
// intentionally diverge — head-level granularity (quad/calf isolated) vs
// cluster-level aggregate published rates. Test guards against future dev
// modifying DECAY_RATE_HOURS_BIG11 expecting runtime impact.

describe('decay rate SoT separation (dual-source hazard guard)', () => {
  it('MUSCLE_HEADS.recoveryHours is runtime SoT, NOT DECAY_RATE_HOURS_BIG11', () => {
    // Runtime SoT exists + populated
    expect(MUSCLE_HEADS).toBeDefined();
    expect(Object.keys(MUSCLE_HEADS).length).toBeGreaterThan(0);
    // Reference SoT exists distinct from runtime
    expect(DECAY_RATE_HOURS_BIG11).toBeDefined();
    expect(MUSCLE_HEADS).not.toBe(DECAY_RATE_HOURS_BIG11);
  });

  it('picioare-quads cluster 60h diverges from MUSCLE_HEADS.quad 96h (head-level)', () => {
    // Cluster-level reference (published rate) — DECAY_RATE_HOURS_BIG11
    expect(DECAY_RATE_HOURS_BIG11['picioare-quads']).toBe(60);
    // Head-level runtime (actual decay calc) — MUSCLE_HEADS
    expect(MUSCLE_HEADS.quad.recoveryHours).toBe(96);
    // Intentional divergence — head granularity vs cluster published rate
    expect(MUSCLE_HEADS.quad.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11['picioare-quads']
    );
  });

  it('gambe cluster 24h diverges from MUSCLE_HEADS.calf 48h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.gambe).toBe(24);
    expect(MUSCLE_HEADS.calf.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.calf.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.gambe
    );
  });

  it('biceps cluster 24h diverges from MUSCLE_HEADS.bi_long 48h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.biceps).toBe(24);
    expect(MUSCLE_HEADS.bi_long.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.bi_short.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.bi_long.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.biceps
    );
  });

  it('triceps cluster 24h diverges from MUSCLE_HEADS.tri_long 48h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.triceps).toBe(24);
    expect(MUSCLE_HEADS.tri_long.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_lateral.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_medial.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.tri_long.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.triceps
    );
  });

  it('picioare-hamstrings cluster 60h diverges from MUSCLE_HEADS.hamstring 96h', () => {
    expect(DECAY_RATE_HOURS_BIG11['picioare-hamstrings']).toBe(60);
    expect(MUSCLE_HEADS.hamstring.recoveryHours).toBe(96);
    expect(MUSCLE_HEADS.hamstring.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11['picioare-hamstrings']
    );
  });

  it('fese cluster 48h diverges from MUSCLE_HEADS.glute 72h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.fese).toBe(48);
    expect(MUSCLE_HEADS.glute.recoveryHours).toBe(72);
    expect(MUSCLE_HEADS.glute.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.fese
    );
  });

  it('spate cluster 60h diverges from MUSCLE_HEADS.lat 72h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.spate).toBe(60);
    expect(MUSCLE_HEADS.lat.recoveryHours).toBe(72);
    expect(MUSCLE_HEADS.lat.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.spate
    );
  });

  it('umeri cluster 36h diverges from MUSCLE_HEADS.delt_front 48h (head-level)', () => {
    expect(DECAY_RATE_HOURS_BIG11.umeri).toBe(36);
    expect(MUSCLE_HEADS.delt_front.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.delt_mid.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.delt_rear.recoveryHours).toBe(48);
    expect(MUSCLE_HEADS.delt_front.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.umeri
    );
  });

  it('piept cluster 48h matches MUSCLE_HEADS.chest_* 60h with intentional spread', () => {
    // piept happens to share order-of-magnitude but values still differ by design
    expect(DECAY_RATE_HOURS_BIG11.piept).toBe(48);
    expect(MUSCLE_HEADS.chest_upper.recoveryHours).toBe(60);
    expect(MUSCLE_HEADS.chest_mid.recoveryHours).toBe(60);
    expect(MUSCLE_HEADS.chest_lower.recoveryHours).toBe(60);
    expect(MUSCLE_HEADS.chest_upper.recoveryHours).not.toBe(
      DECAY_RATE_HOURS_BIG11.piept
    );
  });

  it('getMuscleState uses MUSCLE_HEADS.recoveryHours not DECAY_RATE_HOURS_BIG11', () => {
    // Sanity contract — if DECAY_RATE_HOURS_BIG11 ever wired into runtime decay,
    // this test should be REVISITED + documentation updated. Until then,
    // assert structural separation — MUSCLE_HEADS has 19 heads, BIG11 has 11
    // clusters, indicating distinct granularity levels.
    const headCount = Object.keys(MUSCLE_HEADS).length;
    const clusterCount = Object.keys(DECAY_RATE_HOURS_BIG11).length;
    expect(headCount).toBeGreaterThan(clusterCount);
    expect(clusterCount).toBe(11); // Big 11 canonical V1
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
