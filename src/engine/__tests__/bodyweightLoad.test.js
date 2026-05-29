// Tests pentru modelul de incarcare la exercitiile cu greutatea corpului.
import { describe, it, expect } from 'vitest';
import {
  isBodyweightExercise,
  bodyweightFraction,
  effectiveLoadKg,
  BODYWEIGHT_FRACTION_DEFAULT,
} from '../bodyweightLoad.js';

describe('isBodyweightExercise — clasificator din equipment_type (library SoT)', () => {
  it('marcheaza exercitiile bodyweight cunoscute', () => {
    expect(isBodyweightExercise('Dip')).toBe(true);
    expect(isBodyweightExercise('Pull-up')).toBe(true);
    expect(isBodyweightExercise('Push-up')).toBe(true);
    expect(isBodyweightExercise('Plank')).toBe(true);
  });

  it('NU marcheaza exercitiile cu greutate (barbell/dumbbell/machine/cable)', () => {
    expect(isBodyweightExercise('Flat Barbell Bench')).toBe(false);
    expect(isBodyweightExercise('Flat DB Press')).toBe(false);
    expect(isBodyweightExercise('Leg Press')).toBe(false);
    expect(isBodyweightExercise('Lat Pulldown')).toBe(false);
  });

  it('nume necunoscut sau invalid -> false (path legacy, tratat ca loaded)', () => {
    expect(isBodyweightExercise('Inexistent XYZ')).toBe(false);
    expect(isBodyweightExercise(undefined)).toBe(false);
    expect(isBodyweightExercise(null)).toBe(false);
  });
});

describe('bodyweightFraction — fractie per pattern de miscare', () => {
  it('pull-up / chin-up / dip = 1.0 BW', () => {
    expect(bodyweightFraction('Pull-up')).toBe(1.0);
    expect(bodyweightFraction('Chin-up')).toBe(1.0);
    expect(bodyweightFraction('Dip')).toBe(1.0);
    expect(bodyweightFraction('Weighted Pull-up')).toBe(1.0);
  });

  it('push-up family = 0.65 BW', () => {
    expect(bodyweightFraction('Push-up')).toBe(0.65);
    expect(bodyweightFraction('Diamond Push-up')).toBe(0.65);
    expect(bodyweightFraction('Decline Push-up')).toBe(0.65);
  });

  it('squat / lunge / pistol = 0.6 BW', () => {
    expect(bodyweightFraction('Bodyweight Squat')).toBe(0.6);
    expect(bodyweightFraction('Pistol Squat')).toBe(0.6);
  });

  it('core / plank / hold / hanging-ab = 0 (fara load extern rep)', () => {
    expect(bodyweightFraction('Plank')).toBe(0);
    expect(bodyweightFraction('Hollow Body Hold')).toBe(0);
    expect(bodyweightFraction('Hanging Leg Raise')).toBe(0);
    expect(bodyweightFraction('Hyperextension Bodyweight')).toBe(0);
  });

  it('inverted row partial = 0.6', () => {
    expect(bodyweightFraction('Inverted Row Bar')).toBe(0.6);
  });

  it('nume nepotrivit -> default conservator push-up-like', () => {
    expect(bodyweightFraction('Some Unknown BW Move')).toBe(BODYWEIGHT_FRACTION_DEFAULT);
    expect(BODYWEIGHT_FRACTION_DEFAULT).toBe(0.65);
  });
});

describe('effectiveLoadKg — math corect cu bodyweight + added', () => {
  it('Dips la 80kg user, 0 added -> 80kg load efectiv (NU 0)', () => {
    expect(effectiveLoadKg('Dip', 0, 80)).toBe(80);
  });

  it('Pull-ups la 80kg user + 10kg centura -> 90kg', () => {
    expect(effectiveLoadKg('Pull-up', 10, 80)).toBe(90);
  });

  it('Push-ups la 80kg user, 0 added -> 52kg (0.65 x 80)', () => {
    expect(effectiveLoadKg('Push-up', 0, 80)).toBe(52);
  });

  it('Push-ups la 80kg user + 5kg rucsac -> 57kg', () => {
    expect(effectiveLoadKg('Push-up', 5, 80)).toBe(57);
  });

  it('plank (fractie 0) -> doar added (0 pur bodyweight, kg added daca exista)', () => {
    expect(effectiveLoadKg('Plank', 0, 80)).toBe(0);
    expect(effectiveLoadKg('Plank', 10, 80)).toBe(10);
  });

  it('exercitiu loaded NU foloseste bodyweight — kg-ul introdus E load-ul', () => {
    expect(effectiveLoadKg('Flat Barbell Bench', 100, 80)).toBe(100);
    expect(effectiveLoadKg('Leg Press', 200, 80)).toBe(200);
    // bodyweight irelevant pentru loaded
    expect(effectiveLoadKg('Flat DB Press', 30, null)).toBe(30);
  });

  it('bodyweight necunoscut (null/0) -> cade pe added singur, fara fabricare', () => {
    expect(effectiveLoadKg('Pull-up', 12, null)).toBe(12);
    expect(effectiveLoadKg('Pull-up', 0, 0)).toBe(0);
  });

  it('assist (added negativ) clampat la 0, niciodata negativ', () => {
    // banded pull-up cu asistenta mai mare decat BW efectiv
    expect(effectiveLoadKg('Pull-up', -100, 80)).toBe(0);
  });

  it('rotunjire la 0.5 (grid real de discuri)', () => {
    // 73kg x 0.65 = 47.45 -> 47.5
    expect(effectiveLoadKg('Push-up', 0, 73)).toBe(47.5);
  });
});
