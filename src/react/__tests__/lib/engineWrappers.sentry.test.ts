// ══ ENGINE WRAPPERS — §48-H1 Sentry instrumentation test ══════════════════
//
// Verify adapter integrity instrumentation: when engine throws inside any
// wrapper try/catch, captureException is invoked with tags.source =
// 'engine-adapter-fallback' + tags.adapter = <adapterName>.
//
// Rationale (§48.5 audit recon): engineWrappers wraps engines cu try/catch
// fallback to baseline. Risk = silent divergence (engine returns malformed
// shape, adapter returns baseline → UI shows stale defaults forever).
// Sentry alert breaks the silence; this test guards the wire pre-Beta.
//
// Pattern: vi.mock sentry helper module + spy captureException + force
// engine throw → assert helper called with adapter + source tags.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../util/sentry.js', () => ({
  captureException: vi.fn(),
}));

vi.mock('../../../engine/readiness.js', () => ({
  getComputedReadinessScore: vi.fn(),
  getReadinessVerdict: vi.fn(),
}));

vi.mock('../../../engine/fatigue.js', () => ({
  calculateFatigueScore: vi.fn(),
}));

vi.mock('../../../engine/prEngine.js', () => ({
  detectPR: vi.fn(),
}));

vi.mock('../../../engine/adherence.js', () => ({
  getAdherenceScore: vi.fn(),
}));

vi.mock('../../../engine/proactiveEngine.js', () => ({
  runProactiveChecks: vi.fn(),
}));

import {
  getReadiness,
  getFatigue,
  getPRDelta,
  getAdherenceOutput,
  getProactiveAlerts,
} from '../../lib/engineWrappers';
import { captureException } from '../../../util/sentry.js';
import { getComputedReadinessScore } from '../../../engine/readiness.js';
import { calculateFatigueScore } from '../../../engine/fatigue.js';
import { detectPR } from '../../../engine/prEngine.js';
import { getAdherenceScore } from '../../../engine/adherence.js';
import { runProactiveChecks } from '../../../engine/proactiveEngine.js';

describe('engineWrappers §48-H1 Sentry instrumentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getReadiness catch: captureException called cu source + adapter tags', () => {
    vi.mocked(getComputedReadinessScore).mockImplementation(() => {
      throw new Error('engine boom');
    });
    expect(getReadiness()).toBeNull();
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getReadiness' },
      }),
    );
  });

  it('getFatigue catch: captureException called cu adapter tag', () => {
    vi.mocked(calculateFatigueScore).mockImplementation(() => {
      throw new Error('fatigue boom');
    });
    expect(getFatigue()).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getFatigue' },
      }),
    );
  });

  it('getPRDelta catch: captureException called cu exercise extra', () => {
    vi.mocked(detectPR).mockImplementation(() => {
      throw new Error('pr boom');
    });
    expect(getPRDelta('Bench Press', { w: 100, reps: 5 }, [])).toBeNull();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getPRDelta' },
        extra: { exercise: 'Bench Press' },
      }),
    );
  });

  it('getAdherenceOutput catch: captureException called', () => {
    vi.mocked(getAdherenceScore).mockImplementation(() => {
      throw new Error('adherence boom');
    });
    // Returns BASELINE_ADHERENCE_OUTPUT object — verify call happened.
    getAdherenceOutput();
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getAdherenceOutput' },
      }),
    );
  });

  it('getProactiveAlerts catch: captureException called', () => {
    vi.mocked(runProactiveChecks).mockImplementation(() => {
      throw new Error('proactive boom');
    });
    expect(getProactiveAlerts({})).toEqual([]);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: 'engine-adapter-fallback', adapter: 'getProactiveAlerts' },
      }),
    );
  });

  it('no engine throw: captureException NOT called (happy path)', () => {
    vi.mocked(getComputedReadinessScore).mockReturnValue(null);
    getReadiness();
    expect(captureException).not.toHaveBeenCalled();
  });
});
