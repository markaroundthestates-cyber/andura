// Integrare: volumul planificat foloseste incarcarea efectiva la bodyweight,
// iar PR-ul se detecteaza pe incarcarea efectiva (nu pe kg-ul brut 0).
import { describe, it, expect } from 'vitest';
import { computePlannedVolumeKg } from '../../lib/scheduleAdapterAggregate';
import { detectPR } from '../../../engine/prEngine.js';
import { effectiveLoadKg } from '../../../engine/bodyweightLoad.js';

describe('computePlannedVolumeKg — bodyweight foloseste load efectiv', () => {
  it('exercitiu loaded: volum = sets x reps x kg (neschimbat)', () => {
    const vol = computePlannedVolumeKg(
      [{ sets: 3, targetReps: 10, targetKg: 100 }],
      80,
    );
    expect(vol).toBe(3000);
  });

  it('bodyweight pur (Dips, 0 added) la 80kg: volum = 80 x reps x sets, NU 0', () => {
    const vol = computePlannedVolumeKg(
      [{ sets: 3, targetReps: 8, targetKg: 0, isBodyweight: true, bwFraction: 1.0 }],
      80,
    );
    // 80 x 8 x 3 = 1920 (vechiul bug ar fi dat 0)
    expect(vol).toBe(1920);
  });

  it('bodyweight + added (Pull-up +10kg) la 80kg: load efectiv 90', () => {
    const vol = computePlannedVolumeKg(
      [{ sets: 3, targetReps: 6, targetKg: 10, isBodyweight: true, bwFraction: 1.0 }],
      80,
    );
    // 90 x 6 x 3 = 1620
    expect(vol).toBe(1620);
  });

  it('push-up (0.65) la 80kg: load efectiv 52', () => {
    const vol = computePlannedVolumeKg(
      [{ sets: 4, targetReps: 12, targetKg: 0, isBodyweight: true, bwFraction: 0.65 }],
      80,
    );
    // 52 x 12 x 4 = 2496
    expect(vol).toBe(2496);
  });

  it('fara bodyweight cunoscut: bodyweight contribuie 0, doar added', () => {
    const vol = computePlannedVolumeKg(
      [{ sets: 3, targetReps: 8, targetKg: 5, isBodyweight: true, bwFraction: 1.0 }],
      null,
    );
    // bw necunoscut -> 0 x frac + 5 added = 5; 5 x 8 x 3 = 120
    expect(vol).toBe(120);
  });
});

describe('PR pe incarcarea efectiva — pure-bodyweight rep PR fires', () => {
  it('Pull-up 80kg user, 0 added: mai multe reps = reps PR (load efectiv 80, NU 0)', () => {
    const bw = 80;
    const eff = effectiveLoadKg('Pull-up', 0, bw); // 80
    // istoric: 8 reps la load efectiv 80
    const history = [{ ex: 'Pull-up', w: eff, reps: 8 }];
    // set nou: 10 reps la acelasi load efectiv 80 -> reps PR
    const pr = detectPR('Pull-up', { w: eff, reps: 10 }, history);
    expect(pr).not.toBeNull();
    expect(pr?.type).toBe('reps');
    expect(pr?.kg).toBe(80);
  });

  it('vechiul bug: kg=0 -> detectPR null (confirmare ca brut 0 ar fi ucis PR-ul)', () => {
    const history = [{ ex: 'Pull-up', w: 0, reps: 8 }];
    const pr = detectPR('Pull-up', { w: 0, reps: 10 }, history);
    expect(pr).toBeNull();
  });

  it('Dips +5kg vs +0kg la 80kg: weight PR pe load efectiv (85 > 80)', () => {
    const prev = effectiveLoadKg('Dip', 0, 80); // 80
    const now = effectiveLoadKg('Dip', 5, 80); // 85
    const history = [{ ex: 'Dip', w: prev, reps: 8 }];
    const pr = detectPR('Dip', { w: now, reps: 6 }, history);
    expect(pr).not.toBeNull();
    expect(pr?.type).toBe('weight');
    expect(pr?.kg).toBe(85);
  });
});
