// Phase 6 task_08 — getAdherenceOutput wrapper tests.
// Real Adherence Engine via getAdherenceScore (sync DB-backed) wrapped cu
// defensive clamping + baseline fallback.

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../engine/adherence.js', () => ({
  getAdherenceScore: vi.fn(() => ({ score: 75, color: 'var(--accent)', label: 'OK' })),
}));

import { getAdherenceOutput } from '../../lib/engineWrappers';
import { getAdherenceScore } from '../../../engine/adherence.js';
// NIT-CODE-06 — typed mock builder. See CODE_STYLE.md §"Test mock typing".
import { createMockAdherenceScore } from '../../../test-utils/createMockContext';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('engineWrappers — getAdherenceOutput wrapper', () => {
  it('returns engine source cand getAdherenceScore valid', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(createMockAdherenceScore());
    const out = getAdherenceOutput();
    expect(out.score).toBe(75);
    expect(out.source).toBe('engine');
  });

  it('clamps raw score to 0-100 invariant (raw 150 → 100)', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(
      createMockAdherenceScore({ score: 150, color: 'r', label: 'x' }),
    );
    const out = getAdherenceOutput();
    expect(out.score).toBe(100);
  });

  it('clamps raw score to 0-100 invariant (raw -10 → 0)', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(
      createMockAdherenceScore({ score: -10, color: 'r', label: 'x' }),
    );
    const out = getAdherenceOutput();
    expect(out.score).toBe(0);
  });

  it('non-object engine output → baseline fallback', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(null as unknown as ReturnType<typeof getAdherenceScore>);
    const out = getAdherenceOutput();
    expect(out).toEqual({ score: 50, source: 'baseline' });
  });

  it('missing score field → baseline fallback', () => {
    // Negative-path: omit `score` from engine shape — raw cast (builder would
    // inject default score 75, defeating the test). One-off pattern accepted
    // per CODE_STYLE §"Test mock typing".
    vi.mocked(getAdherenceScore).mockReturnValueOnce({
      color: 'r',
      label: 'x',
    } as unknown as ReturnType<typeof getAdherenceScore>);
    const out = getAdherenceOutput();
    expect(out).toEqual({ score: 50, source: 'baseline' });
  });

  it('non-numeric score field → baseline fallback', () => {
    // Negative-path: forbidden value injection (`'high'` not `number`) —
    // requires raw cast at field level, builder cannot encode this.
    vi.mocked(getAdherenceScore).mockReturnValueOnce({
      score: 'high' as unknown as number,
      color: 'r',
      label: 'x',
    });
    const out = getAdherenceOutput();
    expect(out).toEqual({ score: 50, source: 'baseline' });
  });

  it('engine throws → baseline fallback', () => {
    vi.mocked(getAdherenceScore).mockImplementation(() => {
      throw new Error('DB unavailable');
    });
    const out = getAdherenceOutput();
    expect(out).toEqual({ score: 50, source: 'baseline' });
  });

  it('score=0 valid (NU treated ca falsy)', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(
      createMockAdherenceScore({ score: 0, color: 'r', label: 'Slab' }),
    );
    const out = getAdherenceOutput();
    expect(out.score).toBe(0);
    expect(out.source).toBe('engine');
  });

  it('boundary score=100 preserved', () => {
    vi.mocked(getAdherenceScore).mockReturnValueOnce(
      createMockAdherenceScore({ score: 100, color: 'g', label: 'Excelent' }),
    );
    const out = getAdherenceOutput();
    expect(out.score).toBe(100);
    expect(out.source).toBe('engine');
  });
});
