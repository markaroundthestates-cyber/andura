import { describe, it, expect } from 'vitest';
import { MS_PER_DAY, MS_PER_HOUR } from '../../constants.js';
import {
  getRecoveryByGroup,
  daysSinceGroup,
  getLaggingMuscles,
  GROUP_HEAD_MAP,
} from '../muscleRecovery.js';

const now = Date.now();
const hoursAgo = (h) => now - h * MS_PER_HOUR;
const daysAgo  = (d) => now - d * MS_PER_DAY;

describe('getRecoveryByGroup', () => {
  it('returns all groups recovered when no logs provided', () => {
    const state = getRecoveryByGroup([]);
    expect(Object.keys(state).sort()).toEqual(
      Object.keys(GROUP_HEAD_MAP).sort()
    );
    Object.values(state).forEach(s => expect(s).toBe('recovered'));
  });

  it('marks chest fatigued after recent heavy session', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Flat DB Press',    w: 32, reps: 8, rpe: 9, ts: hoursAgo(2) },
      { ex: 'Pec Deck / Cable Fly', w: 20, reps: 10, rpe: 8, ts: hoursAgo(2) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(state.chest).toBe('fatigued');
  });

  it('marks chest recovered after 5+ days', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, rpe: 9, ts: daysAgo(6) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(state.chest).toBe('recovered');
  });

  it('marks shoulders partial when stress is moderate (24-48h)', () => {
    // delt_mid has 48h recovery — single moderate exposure at 24h shows partial
    const logs = [
      { ex: 'DB Shoulder Press', w: 20, reps: 8, rpe: 8, ts: hoursAgo(24) },
      { ex: 'Lateral Raises',    w: 10, reps: 12, rpe: 7, ts: hoursAgo(24) },
    ];
    const state = getRecoveryByGroup(logs);
    expect(['partial', 'fatigued']).toContain(state.shoulders);
  });
});

describe('daysSinceGroup', () => {
  it('returns null when no logs hit the group', () => {
    expect(daysSinceGroup([], 'chest')).toBeNull();
  });

  it('returns days since last chest session', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(3) },
      { ex: 'Lateral Raises',   w: 10, reps: 12, ts: daysAgo(1) },
    ];
    expect(daysSinceGroup(logs, 'chest')).toBe(3);
    expect(daysSinceGroup(logs, 'shoulders')).toBeLessThanOrEqual(1);
  });
});

describe('getLaggingMuscles', () => {
  it('returns empty when no logs', () => {
    expect(getLaggingMuscles({ logs: [] })).toEqual([]);
  });

  it('detects shoulders lagging when chest+back trained heavy, shoulders barely', () => {
    const logs = [];
    // Lots of chest sets (12)
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Lots of back sets (12)
    for (let i = 0; i < 12; i++) {
      logs.push({ ex: 'Lat Pulldown', w: 50, reps: 8, ts: daysAgo(i % 12 + 1) });
    }
    // Barely any shoulder direct (1 set)
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });

    const lagging = getLaggingMuscles({ logs });
    const groups = lagging.map(l => l.group);
    expect(groups).toContain('shoulders');
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
    // All chest but >14 days ago
    for (let i = 0; i < 10; i++) {
      logs.push({ ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(20 + i) });
    }
    // Recent shoulder + back
    logs.push({ ex: 'Lateral Raises', w: 10, reps: 12, ts: daysAgo(2) });
    logs.push({ ex: 'Lat Pulldown',   w: 50, reps: 8,  ts: daysAgo(2) });

    const lagging = getLaggingMuscles({ logs, lookbackDays: 14 });
    // Chest dropped out of window — only shoulders+back active, both equal → no lagging
    expect(lagging.find(l => l.group === 'chest')).toBeUndefined();
  });

  it('skips baseline logs', () => {
    const logs = [
      { ex: 'Incline DB Press', w: 30, reps: 8, ts: daysAgo(2), baseline: true },
      { ex: 'Lat Pulldown',     w: 50, reps: 8, ts: daysAgo(2) },
      { ex: 'Lateral Raises',   w: 10, reps: 12, ts: daysAgo(2) },
    ];
    const lagging = getLaggingMuscles({ logs });
    expect(lagging.find(l => l.group === 'chest')).toBeUndefined();
  });
});
