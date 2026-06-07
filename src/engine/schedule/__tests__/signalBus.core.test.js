// Signal-bus PURE core — computed-vs-applied trace. No DOM, no flag, no
// localStorage: feeds a fabricated `results` array and asserts the delta.
// This is the instrument that makes Faza 1/2 wiring PROVABLE — a field added to
// APPLIED_MAP but never read by getDailyWorkout (or vice-versa) trips a test.

import { describe, it, expect } from 'vitest';
import {
  buildSessionSignalTrace,
  APPLIED_MAP,
} from '../scheduleAdapter/signalBus.core.js';

const FIXED_NOW = 1717000000000;

/** Minimal ok-result for an engine with the given meta blueprint. */
const ok = (id, meta) => ({ ok: true, output: { id, meta } });

describe('buildSessionSignalTrace — computed vs applied vs dropped', () => {
  it('periodization: volume_target_pct applied, other fields dropped', () => {
    const results = [
      ok('periodization', {
        volume_target_pct: { chest: 12 },
        intensity_target_pct: {},
        mesocycle_phase: 'ACCUM',
      }),
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const p = t.engines.find((e) => e.engineId === 'periodization');
    expect(p.applied).toContain('volume_target_pct');
    expect(p.dropped).toContain('intensity_target_pct');
    expect(p.dropped).toContain('mesocycle_phase');
    expect(p.ran).toBe(true);
  });

  it('specialization: target_muscle_group applied', () => {
    const results = [ok('specialization', { target_muscle_group: 'chest', other: 1 })];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const s = t.engines.find((e) => e.engineId === 'specialization');
    expect(s.applied).toEqual(['target_muscle_group']);
    expect(s.dropped).toEqual(['other']);
  });

  it('warmup: whole blueprint applied (* sentinel) → dropped empty', () => {
    const results = [ok('warmup', { duration_min: 7, ui_label: 'Incalzire ~7 min', extra: 1 })];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const w = t.engines.find((e) => e.engineId === 'warmup');
    expect(w.applied.sort()).toEqual(['duration_min', 'extra', 'ui_label']);
    expect(w.dropped).toEqual([]);
  });

  it('goalAdaptation: rest_time + rep_range + rir_target applied, nutrition fields dropped', () => {
    const results = [
      ok('goalAdaptation', {
        rest_time_modifier: [60, 120],
        rep_range_modifier: [3, 8],
        rir_target_modifier: [1, 2],
        kcal_target_delta_pct: 0,
        macro_split: {},
      }),
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const g = t.engines.find((e) => e.engineId === 'goalAdaptation');
    expect(g.applied).toContain('rest_time_modifier');
    expect(g.applied).toContain('rep_range_modifier');
    expect(g.applied).toContain('rir_target_modifier');
    // kcal/macro drive the SEPARATE nutrition aggregate, NOT the workout — they
    // stay correctly dropped in the workout pipeline (F2 spec §4).
    expect(g.dropped).toContain('kcal_target_delta_pct');
    expect(g.dropped).toContain('macro_split');
  });

  it('deload: intensity_modifier + deload_state applied', () => {
    const results = [
      ok('deload', { intensity_modifier: {}, deload_state: 'IDLE', volume_modifier: {} }),
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const d = t.engines.find((e) => e.engineId === 'deload');
    expect(d.applied.sort()).toEqual(['deload_state', 'intensity_modifier']);
    expect(d.dropped).toEqual(['volume_modifier']);
  });

  it('dark engines: energyAdjustment/bayesianNutrition fully dropped in workout pipeline', () => {
    const results = [
      ok('energyAdjustment', { intensity_modifier: 'plus' }),
      ok('bayesianNutrition', { kcal_target: 2400 }),
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    for (const id of ['energyAdjustment', 'bayesianNutrition']) {
      const e = t.engines.find((x) => x.engineId === id);
      expect(e.applied).toEqual([]);
      expect(e.dropped.length).toBeGreaterThan(0);
    }
  });

  it('tempo: tempo_prescription + form_cue applied (uniform session cue, F2 #3)', () => {
    const results = [
      ok('tempo', {
        tempo_prescription: { notation: '2-1-2-0', preSetIntro: 'Tempo 2-1-2-0, controleaza coborarea' },
        form_cue: { cueText: 'controleaza coborarea' },
        mind_muscle_active: true,
      }),
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const e = t.engines.find((x) => x.engineId === 'tempo');
    expect(e.applied).toContain('tempo_prescription');
    expect(e.applied).toContain('form_cue');
    expect(e.dropped).toContain('mind_muscle_active');
  });

  it('records errorCode + ran=false for a failed adapter', () => {
    const results = [
      { ok: false, output: { id: 'periodization' }, error: { code: 'INVALID_INPUT', severity: 'soft' } },
    ];
    const t = buildSessionSignalTrace(results, APPLIED_MAP, null, FIXED_NOW);
    const p = t.engines.find((e) => e.engineId === 'periodization');
    expect(p.ran).toBe(false);
    expect(p.errorCode).toBe('INVALID_INPUT');
    expect(p.computed).toEqual([]);
  });

  it('hardHalt names the halting engine; null when no halt', () => {
    const noHalt = buildSessionSignalTrace([ok('periodization', {})], APPLIED_MAP, null, FIXED_NOW);
    expect(noHalt.hardHalt).toBeNull();
    const halt = { ok: false, output: { id: 'periodization' }, error: { code: 'X', severity: 'hard' } };
    const withHalt = buildSessionSignalTrace([halt], APPLIED_MAP, halt, FIXED_NOW);
    expect(withHalt.hardHalt).toBe('periodization');
  });

  it('trace envelope is v:1 with injected deterministic timestamp', () => {
    const t = buildSessionSignalTrace([ok('warmup', {})], APPLIED_MAP, null, FIXED_NOW);
    expect(t.v).toBe(1);
    expect(t.t).toBe(FIXED_NOW);
  });

  // ── Stale-map guard: every key the APPLIED_MAP claims must be a field the
  // engine can actually emit. This is the falsifiable contract that keeps the
  // hand-maintained map honest as wiring lands. We assert against the live
  // getDailyWorkout reads documented in §2a of the spec.
  it('stale-map guard: APPLIED_MAP only references known live-read fields', () => {
    const KNOWN_FIELDS = {
      periodization: ['volume_target_pct'],
      specialization: ['target_muscle_group'],
      goalAdaptation: ['rest_time_modifier', 'rep_range_modifier', 'rir_target_modifier'],
      deload: ['intensity_modifier', 'deload_state'],
      tempo: ['tempo_prescription', 'form_cue'],
    };
    for (const [id, fields] of Object.entries(KNOWN_FIELDS)) {
      const map = APPLIED_MAP[id];
      expect(map).toBeInstanceOf(Set);
      for (const k of [...map]) {
        expect(fields).toContain(k);
      }
    }
    // warmup consumes the whole blueprint → '*' sentinel
    expect(APPLIED_MAP.warmup).toBe('*');
    // remaining dark engines must declare an empty applied set
    for (const id of ['energyAdjustment', 'bayesianNutrition']) {
      expect(APPLIED_MAP[id]).toBeInstanceOf(Set);
      expect([...APPLIED_MAP[id]]).toEqual([]);
    }
  });

  it('handles empty / non-array results without throwing', () => {
    expect(buildSessionSignalTrace([], APPLIED_MAP, null, FIXED_NOW).engines).toEqual([]);
    expect(buildSessionSignalTrace(null, APPLIED_MAP, null, FIXED_NOW).engines).toEqual([]);
  });
});
