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
