// ══ ITEM 3 REGRESSION — active-probing calibration-set opt-in UX ═════════════
// (1) compose: a rec carrying activeProbe is carried THROUGH toPlannedExercise
//     onto PlannedExercise.activeProbe (descriptor-only — kg/reps untouched); a
//     rec with NO activeProbe carries nothing.
// (2) i18n: the calibration note + prompt resolve in BOTH ro + en (the hardcoded
//     RO note moved out of dp.js — engine emits a noteKind token).
// (3) UI: ActiveProbePrompt renders the opt-in prompt; accept reveals the
//     suggested set; dismiss removes it; never forced.
//
// FAILS BEFORE: compose dropped rec.activeProbe (PlannedExercise had no field),
// the note lived only in dp.js (no i18n key), and no UI surface rendered it.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { buildSwappedExercise } from '../../lib/scheduleAdapterAggregate.compose';
import { ActiveProbePrompt } from '../../components/Workout/ActiveProbePrompt';
import { DP } from '../../../engine/dp.js';
import { t, setLocale } from '../../../i18n/index.js';

const PROBE = { kg: 62.5, reps: 6, sigma: 4.2, noteKind: 'calibration' };

describe('compose — carries activeProbe through toPlannedExercise', () => {
  afterEach(() => vi.restoreAllMocks());

  it('a rec WITH activeProbe → PlannedExercise.activeProbe (descriptor-only)', () => {
    // The probe is descriptor-only: the rec's kg/reps drive the prescription, the
    // probe is a SEPARATE heavier suggestion that does NOT change targetKg.
    vi.spyOn(DP, 'getSmartRecommendation').mockReturnValue({
      kg: 50,
      repsTarget: 8,
      status: 'ON_TARGET',
      activeProbe: { ...PROBE },
    });
    const ex = buildSwappedExercise('Flat Barbell Bench', 0, 'test');
    expect(ex.activeProbe).toBeDefined();
    expect(ex.activeProbe!.kg).toBe(62.5);
    expect(ex.activeProbe!.reps).toBe(6);
    expect(ex.activeProbe!.noteKind).toBe('calibration');
    // Descriptor-only: the heavier probe kg (62.5) NEVER bleeds into the
    // prescribed targetKg (the probe is a separate suggestion, not the load).
    expect(ex.targetKg).not.toBe(62.5);
    expect(ex.targetKg).toBeGreaterThan(0);
  });

  it('a rec with NO activeProbe → PlannedExercise has no activeProbe field', () => {
    vi.spyOn(DP, 'getSmartRecommendation').mockReturnValue({
      kg: 50,
      repsTarget: 8,
      status: 'ON_TARGET',
    });
    const ex = buildSwappedExercise('Flat Barbell Bench', 0, 'test');
    expect(ex.activeProbe).toBeUndefined();
  });
});

describe('i18n — the calibration note resolves in ro + en (moved out of dp.js)', () => {
  afterEach(() => setLocale('en'));

  it('ro: prompt + calibration note (no diacritics)', () => {
    setLocale('ro');
    expect(t('workout.activeProbe.prompt')).toBe('Vrei un set de calibrare?');
    expect(t('workout.activeProbe.calibration')).toContain('Set de calibrare');
    // RO no-diacritics rule (D-LEGACY-064).
    expect(t('workout.activeProbe.calibration')).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  it('en: prompt + calibration note', () => {
    setLocale('en');
    expect(t('workout.activeProbe.prompt')).toBe('Want a calibration set?');
    expect(t('workout.activeProbe.calibration')).toContain('Calibration set');
  });

  it('suggested copy interpolates kg + reps', () => {
    setLocale('en');
    const s = t('workout.activeProbe.suggested', { kg: 62.5, reps: 6 });
    expect(s).toContain('62.5');
    expect(s).toContain('6');
  });
});

describe('ActiveProbePrompt — opt-in affordance (never forced)', () => {
  beforeEach(() => setLocale('en'));
  afterEach(() => {
    cleanup();
    setLocale('en');
  });

  it('renders the opt-in prompt with accept + dismiss', () => {
    render(<ActiveProbePrompt probe={{ ...PROBE }} />);
    expect(screen.getByTestId('active-probe-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('active-probe-accept')).toBeInTheDocument();
    expect(screen.getByTestId('active-probe-dismiss')).toBeInTheDocument();
    // The suggested set is NOT shown until the user opts in.
    expect(screen.queryByTestId('active-probe-suggested')).not.toBeInTheDocument();
  });

  it('accept → reveals the suggested set (kg x reps)', () => {
    render(<ActiveProbePrompt probe={{ ...PROBE }} />);
    fireEvent.click(screen.getByTestId('active-probe-accept'));
    const suggested = screen.getByTestId('active-probe-suggested');
    expect(suggested).toBeInTheDocument();
    expect(suggested.textContent).toContain('62.5');
    expect(suggested.textContent).toContain('6');
  });

  it('dismiss → the prompt disappears (opt-in, not forced)', () => {
    render(<ActiveProbePrompt probe={{ ...PROBE }} />);
    fireEvent.click(screen.getByTestId('active-probe-dismiss'));
    expect(screen.queryByTestId('active-probe-prompt')).not.toBeInTheDocument();
  });
});
