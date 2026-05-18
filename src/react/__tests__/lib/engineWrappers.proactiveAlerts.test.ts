// Phase 6 task_05 — getProactiveAlerts wrapper tests.
// Wraps runProactiveChecks cu severity mapping 3-tier (warning→warn,
// info→info, success→info).

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../engine/proactiveEngine.js', () => ({
  runProactiveChecks: vi.fn(() => []),
}));

import { getProactiveAlerts } from '../../lib/engineWrappers';
import { runProactiveChecks } from '../../../engine/proactiveEngine.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('engineWrappers — getProactiveAlerts wrapper', () => {
  it('returns [] cand engine returns empty array', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([]);
    expect(getProactiveAlerts()).toEqual([]);
  });

  it('returns [] cand engine throws (graceful fallback)', () => {
    vi.mocked(runProactiveChecks).mockImplementation(() => {
      throw new Error('engine boom');
    });
    expect(getProactiveAlerts()).toEqual([]);
  });

  it('returns [] cand engine returns non-array (defensive)', () => {
    vi.mocked(runProactiveChecks).mockReturnValue(null as unknown as ReturnType<typeof runProactiveChecks>);
    expect(getProactiveAlerts()).toEqual([]);
  });

  it('severity mapping: warning → warn', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'protein_deficit', severity: 'warning', message: 'Proteine sub target' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts[0]!.severity).toBe('warn');
  });

  it('severity mapping: info → info', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'inactivity', severity: 'info', message: 'Reia ritmul' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts[0]!.severity).toBe('info');
  });

  it('severity mapping: success → info collapse (NU urgent UI bias)', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'streak_milestone', severity: 'success', message: 'Streak 7 zile' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts[0]!.severity).toBe('info');
  });

  it('severity mapping: unknown → info default', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'mystery', severity: 'cosmic' as unknown as 'warning', message: 'Whatever' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts[0]!.severity).toBe('info');
  });

  it('id generation: type_index unique per alert', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'protein_deficit', severity: 'warning', message: 'a' },
      { type: 'protein_deficit', severity: 'warning', message: 'b' },
      { type: 'sleep_debt', severity: 'info', message: 'c' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts.map((a) => a.id)).toEqual([
      'protein_deficit_0',
      'protein_deficit_1',
      'sleep_debt_2',
    ]);
  });

  it('text extracted from alert.message', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'pr_opportunity', severity: 'success', message: 'Zi de PR azi' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    expect(getProactiveAlerts()[0]!.text).toBe('Zi de PR azi');
  });

  it('missing message → empty string defensive', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'unknown', severity: 'info' } as unknown as ReturnType<typeof runProactiveChecks>[number],
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    expect(getProactiveAlerts()[0]!.text).toBe('');
  });

  it('ctx pass-through to engine', () => {
    const ctx = { kcals: { '2026-05-18': 2000 }, prots: {} };
    vi.mocked(runProactiveChecks).mockReturnValue([]);
    getProactiveAlerts(ctx);
    expect(runProactiveChecks).toHaveBeenCalledWith(ctx);
  });

  it('order preserved (engine sorted: warning first, info, success last)', () => {
    vi.mocked(runProactiveChecks).mockReturnValue([
      { type: 'a', severity: 'warning', message: '1' },
      { type: 'b', severity: 'info', message: '2' },
      { type: 'c', severity: 'success', message: '3' },
    ] as unknown as ReturnType<typeof runProactiveChecks>);
    const alerts = getProactiveAlerts();
    expect(alerts.map((a) => a.text)).toEqual(['1', '2', '3']);
  });
});
