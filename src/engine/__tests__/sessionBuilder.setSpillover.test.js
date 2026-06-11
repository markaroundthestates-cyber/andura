// NEUTRALIZED 2026-06-11 — `dp_set_spillover_v1` was BACKED OUT. Analysis during
// the burst proved it was the wrong lever: the spill injection is free-slot-only,
// but buildSession always fills to sessionSize, so a focus session is full and
// the spill never fires (dead code). The surplus-to-2nd-variation it aimed at is
// ALREADY handled by the existing budget distribution across the seated
// isolations (sessionBuilder.js: "the surplus shaved off the capped compound
// (5->4) lands on a 2nd isolation"). The real arms-variety lever is accessory
// ROTATION, not a set-level spill. Kept as a no-op so the (untracked) file does
// not fail the suite; rm is DENY in this environment.
import { describe, it, expect } from 'vitest';

describe('set spillover — BACKED OUT (dp_set_spillover_v1 removed)', () => {
  it('is intentionally a no-op (feature dropped, see header)', () => {
    expect(true).toBe(true);
  });
});
