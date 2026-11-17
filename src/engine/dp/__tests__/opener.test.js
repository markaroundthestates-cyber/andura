// dp_opener_set_v1 (founder 2026-11-17: his partner's Andura "ii recomanda mereu maxim").
// Real Lat Pulldown sessions from the partner's account: he opens at 52 and climbs.
import { describe, it, expect } from 'vitest';
import { openerFrom } from '../opener.js';

const DAY = 86_400_000;
const T = 1_794_897_848_097; // 2026-11-17
/** @param {number[][]} sessions oldest → newest, each [w, reps] in set order */
const rows = (sessions) => sessions.flatMap((sets, s) => sets.map(([w, reps], i) => ({
  ex: 'Lat Pulldown', w, reps: String(reps), rpe: 7.5,
  session: T - (sessions.length - s) * 3 * DAY, ts: T - (sessions.length - s) * 3 * DAY + i * 180_000,
})));
const BAILIB = [45, 52, 59, 66, 73, 79];
const snap = (kg) => BAILIB.reduce((b, r) => (Math.abs(r - kg) < Math.abs(b - kg) ? r : b), BAILIB[0]);

describe('openerFrom', () => {
  it('his partner climbs 52 → 66 / 52 → 73 → set 1 at 52 x 9 before 66', () => {
    const lat = rows([
      [[52, 9], [59, 9], [66, 7]],
      [[52, 9], [73, 5]],
      [[52, 11], [59, 7], [59, 6], [66, 7]],
    ]);
    expect(openerFrom(lat, 66, snap)).toEqual({ kg: 52, reps: 9 });
  });

  it('straight sets (the founder at 52 x 4) → no opener', () => {
    const lat = rows([[[45, 8], [45, 9]], [[52, 8], [52, 9]], [[52, 8], [52, 8], [52, 8], [52, 7]]]);
    expect(openerFrom(lat, 52, snap)).toBeNull();
  });

  it('opening heaviest then backing off → no opener', () => {
    const lat = rows([[[66, 8], [59, 9]], [[66, 8], [59, 8], [59, 8]], [[66, 7], [59, 9]]]);
    expect(openerFrom(lat, 66, snap)).toBeNull();
  });

  it('one climbing session out of three is not a habit', () => {
    const lat = rows([[[52, 9], [66, 7]], [[66, 8], [66, 8]], [[66, 8], [66, 7]]]);
    expect(openerFrom(lat, 66, snap)).toBeNull();
  });

  it('a single session is not enough', () => {
    expect(openerFrom(rows([[[52, 9], [66, 7]]]), 66, snap)).toBeNull();
  });

  it('an opener that snaps onto the target is dropped', () => {
    const lat = rows([[[62, 9], [66, 7]], [[62, 9], [66, 7]]]);
    expect(openerFrom(lat, 66, snap)).toBeNull();
  });
});
