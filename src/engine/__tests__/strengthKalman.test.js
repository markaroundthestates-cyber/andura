// ══ BUILD #2 — per-exercise Kalman strength latent (F3 spec §2) unit tests ═══
// Exercises the REUSED 1-D Kalman re-targeted to a strength e1RM latent: the
// time-scaled process noise, the high-R smoothing, the quota-guarded persistence,
// and a corrupt-hydrate guard. e1RM observations use the real rating→rpe scale.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computePosteriorFromLogs,
  updatePosterior,
  processNoiseForGap,
  loadPosterior,
  savePosterior,
  trendDirection,
  STRENGTH_POSTERIOR_KEY,
  Q_BASE,
  SIGMA_PRIOR as SIGMA_PRIOR_REF,
} from '../dp/strengthKalman.js';
import { DP } from '../dp.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const MS_DAY = 86400000;

beforeEach(() => {
  localStorage.clear();
});

describe('processNoiseForGap — time-scaled Q (variance grows with the gap)', () => {
  it('a longer layoff yields strictly more process noise', () => {
    const fresh = processNoiseForGap(0);
    const week = processNoiseForGap(7);
    const sixWeeks = processNoiseForGap(42);
    expect(fresh).toBeCloseTo(Q_BASE, 6); // no gap -> base floor
    expect(week).toBeGreaterThan(fresh);
    expect(sixWeeks).toBeGreaterThan(week);
    // random-walk sqrt(time) shape: 42 days ≈ Q_BASE*sqrt(43).
    expect(sixWeeks).toBeCloseTo(Q_BASE * Math.sqrt(43), 6);
  });
});

describe('computePosteriorFromLogs — Kalman fold', () => {
  it('seeds the latent at the first observation with the prior sigma', () => {
    const e = DP.e1RMForSet(60, 8, RPE.potrivit);
    const post = computePosteriorFromLogs([{ e1rm: e, ts: 0 }]);
    expect(post.mu).toBeCloseTo(e, 6);
    expect(post.sigma).toBeCloseTo(SIGMA_PRIOR_REF, 6); // seeded at the prior — only one set seen
    expect(post.n).toBe(1);
  });

  it('high R smooths — once the posterior is NARROW a lone outlier barely moves mu', () => {
    const base = DP.e1RMForSet(60, 8, RPE.potrivit);
    // Many stable sets first → the posterior narrows (sigma shrinks, confident).
    const stable = [];
    for (let i = 0; i < 10; i++) stable.push({ e1rm: base, ts: i * MS_DAY });
    const narrow = computePosteriorFromLogs(stable);
    expect(narrow.mu).toBeCloseTo(base, 1);
    expect(narrow.sigma).toBeLessThan(10); // confident
    // Now a single wild 2x observation: with a narrow posterior + high R it barely
    // moves mu (the smoothing the saw-tooth needs).
    const withOutlier = computePosteriorFromLogs([
      ...stable,
      { e1rm: base * 2, ts: 11 * MS_DAY },
    ]);
    expect(withOutlier.mu).toBeGreaterThan(narrow.mu);
    expect(withOutlier.mu).toBeLessThan(base * 1.25); // moved <25% toward the 2x outlier
  });

  it('the 2nd set moves mu toward the new obs but the smoothing damps the jump', () => {
    const base = DP.e1RMForSet(60, 8, RPE.potrivit);
    const post = computePosteriorFromLogs([
      { e1rm: base, ts: 0 },
      { e1rm: base * 2, ts: 3 * MS_DAY },
    ]);
    // Moderate prior + HIGH R -> mu moves up but stays well below the 2x obs
    // (smoothing, not chasing): a partial step, and the posterior narrows.
    expect(post.mu).toBeGreaterThan(base);
    expect(post.mu).toBeLessThan(base * 1.5);
    expect(post.sigma).toBeLessThan(SIGMA_PRIOR_REF);
  });

  it('returns null for no usable observations', () => {
    expect(computePosteriorFromLogs([])).toBeNull();
    expect(computePosteriorFromLogs([{ e1rm: 0, ts: 0 }])).toBeNull();
    expect(computePosteriorFromLogs(null)).toBeNull();
  });

  it('a long gap widens the posterior more than a same-week update', () => {
    const e = DP.e1RMForSet(80, 6, RPE.potrivit);
    const close = computePosteriorFromLogs([
      { e1rm: e, ts: 0 },
      { e1rm: e, ts: 1 * MS_DAY },
    ]);
    const far = computePosteriorFromLogs([
      { e1rm: e, ts: 0 },
      { e1rm: e, ts: 60 * MS_DAY },
    ]);
    // Bigger Q in the predict step -> a wider posterior after the same observation.
    expect(far.sigma).toBeGreaterThan(close.sigma);
  });
});

describe('updatePosterior — incremental continuation', () => {
  it('continuing a prior with new sets equals folding the full stream', () => {
    const e = DP.e1RMForSet(70, 8, RPE.potrivit);
    const full = computePosteriorFromLogs([
      { e1rm: e, ts: 0 },
      { e1rm: e, ts: MS_DAY },
      { e1rm: e, ts: 2 * MS_DAY },
    ]);
    const part = computePosteriorFromLogs([
      { e1rm: e, ts: 0 },
      { e1rm: e, ts: MS_DAY },
    ]);
    const cont = updatePosterior(part, [{ e1rm: e, ts: 2 * MS_DAY }]);
    expect(cont.mu).toBeCloseTo(full.mu, 6);
    expect(cont.sigma).toBeCloseTo(full.sigma, 6);
    expect(cont.n).toBe(full.n);
  });

  it('a null prior with no obs returns null', () => {
    expect(updatePosterior(null, [])).toBeNull();
  });
});

describe('persistence — quota-guarded + corrupt-hydrate guard', () => {
  it('round-trips a valid posterior', () => {
    const state = { mu: 95.5, sigma: 8, lastObsTs: 123, n: 4 };
    const res = savePosterior('Leg Press', state);
    expect(res.ok).toBe(true);
    expect(loadPosterior('Leg Press')).toEqual(state);
  });

  it('rejects an invalid state without throwing', () => {
    expect(savePosterior('Leg Press', { mu: NaN, sigma: 8, lastObsTs: 0, n: 1 }).ok).toBe(false);
    expect(savePosterior('', { mu: 90, sigma: 8, lastObsTs: 0, n: 1 }).ok).toBe(false);
  });

  it('loadPosterior returns null on a corrupt persisted entry', () => {
    localStorage.setItem(STRENGTH_POSTERIOR_KEY, JSON.stringify({ 'Leg Press': { mu: 'oops', sigma: -1 } }));
    expect(loadPosterior('Leg Press')).toBeNull();
  });
});

// ══ BUILD F6c #31 — trendDirection (noise-aware trend-vs-noise) ══════════════
describe('trendDirection — direction is confident only when it clears the noise band', () => {
  const MS = MS_DAY;
  // Build a chronological per-set e1RM stream from (kg, reps, rpe) tuples.
  const stream = (rows) =>
    rows.map((r, i) => ({
      e1rm: DP.e1RMForSet(r.w, r.reps, r.rpe ?? RPE.potrivit),
      ts: i * MS,
      failedShort: false,
    }));

  it('returns FLAT/unconfident on < 2 observations (cold start → legacy fallback)', () => {
    expect(trendDirection(null, [])).toEqual({ dir: 'FLAT', slope: 0, confident: false });
    const one = stream([{ w: 60, reps: 8 }]);
    expect(trendDirection(null, one).dir).toBe('FLAT');
    expect(trendDirection(null, one).confident).toBe(false);
  });

  it('a steady-load trace is FLAT (no false-positive trend)', () => {
    const flat = stream(Array.from({ length: 8 }, () => ({ w: 60, reps: 8 })));
    const t = trendDirection(null, flat);
    expect(t.dir).toBe('FLAT');
    expect(t.confident).toBe(false);
  });

  it('one bad day inside a steady trace is rejected as FLAT (the deepen win)', () => {
    const rows = Array.from({ length: 8 }, () => ({ w: 60, reps: 8 }));
    rows[5] = { w: 50, reps: 6, rpe: RPE.greu }; // a single bad/short set
    const t = trendDirection(null, stream(rows));
    expect(t.dir).toBe('FLAT'); // net move stays inside the noise band
  });

  it('a sustained climb fires UP once it clears the noise band', () => {
    const rows = [];
    for (let i = 0; i < 8; i++) rows.push({ w: 60 + i * 5, reps: 8, rpe: RPE.usor });
    const t = trendDirection(null, stream(rows));
    expect(t.dir).toBe('UP');
    expect(t.confident).toBe(true);
    expect(t.slope).toBeGreaterThan(0);
  });

  it('a sustained decline fires DOWN once it clears the noise band', () => {
    const rows = [];
    for (let i = 0; i < 8; i++) rows.push({ w: 100 - i * 5, reps: 8, rpe: RPE.greu });
    const t = trendDirection(null, stream(rows));
    expect(t.dir).toBe('DOWN');
    expect(t.confident).toBe(true);
    expect(t.slope).toBeLessThan(0);
  });
});
