// dp_used_variant_v1 + dp_same_lift_variants_v1 (founder 2026-10-10: "eu le am M torture
// fly la aparat mereu"; "lat pulldown si wide grip lat pulldown... sunt una si aceeasi").
// Session counts are his real last 60 days: Pec Deck / Cable Fly 7, Cable Fly 1,
// Lat Pulldown 12, Wide-Grip Lat Pulldown 0.
import { describe, it, expect, beforeEach } from 'vitest';
import { onUsedVariants, usedVariantTwins } from '../usedVariant.js';
import { loggedRowMatcher } from '../logIdentity.js';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 9, 9);
const rows = (ex, sessions) => Array.from({ length: sessions }, (_, i) => ({
  ex, w: 50, reps: 8, ts: T0 - i * 4 * DAY, date: new Date(T0 - i * 4 * DAY).toISOString().slice(0, 10),
}));

describe('onUsedVariants — the plan names the twin he trains', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('logs', JSON.stringify([...rows('Pec Deck / Cable Fly', 7), ...rows('Cable Fly', 1), ...rows('Lat Pulldown', 12)]));
  });

  it('Cable Fly → Pec Deck / Cable Fly (his M Torture), Wide-Grip → Lat Pulldown', () => {
    const out = onUsedVariants([{ name: 'Cable Fly' }, { name: 'Wide-Grip Lat Pulldown' }, { name: 'Machine Shoulder Press' }]);
    expect(out.map((e) => e.name)).toEqual(['Pec Deck / Cable Fly', 'Lat Pulldown', 'Machine Shoulder Press']);
  });

  it('never repeats a lift already in the session', () => {
    const out = onUsedVariants([{ name: 'Lat Pulldown' }, { name: 'Wide-Grip Lat Pulldown' }]);
    expect(out.map((e) => e.name)).toEqual(['Lat Pulldown', 'Wide-Grip Lat Pulldown']);
  });

  it('a twin trained once is not a habit — no rename', () => {
    localStorage.setItem('logs', JSON.stringify(rows('Pec Deck / Cable Fly', 1)));
    expect(onUsedVariants([{ name: 'Cable Fly' }])[0].name).toBe('Cable Fly');
  });

  it('different movements never pair (Lat Pulldown ≁ Straight-Arm; Hip Thrust ≁ Smith Hip Thrust)', () => {
    expect(usedVariantTwins('Lat Pulldown')).not.toContain('Straight-Arm Lat Pulldown');
    expect(usedVariantTwins('Hip Thrust')).not.toContain('Smith Hip Thrust');
  });
});

describe('dp_same_lift_variants_v1 — one history for Lat Pulldown / Wide-Grip', () => {
  beforeEach(() => localStorage.clear());

  it('a Wide-Grip row reads as Lat Pulldown and back', () => {
    expect(loggedRowMatcher('Lat Pulldown')({ ex: 'Wide-Grip Lat Pulldown' })).toBe(true);
    expect(loggedRowMatcher('Wide-Grip Lat Pulldown')({ ex: 'Lat Pulldown' })).toBe(true);
    expect(loggedRowMatcher('Lat Pulldown')({ ex: 'Neutral-Grip Lat Pulldown' })).toBe(false);
  });

  it('flag OFF → two lifts', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_same_lift_variants_v1: false }));
    expect(loggedRowMatcher('Lat Pulldown')({ ex: 'Wide-Grip Lat Pulldown' })).toBe(false);
  });
});
