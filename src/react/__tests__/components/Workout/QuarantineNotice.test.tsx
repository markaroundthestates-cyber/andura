// ══ #65 QUARANTINE NOTICE — surface + one-tap revert ════════════════════════
// The outlier detector quarantines an implausible set (logQuarantine ledger);
// the engine revert path (unquarantineSet) existed but was unplaced. This proves
// the surface: a quarantined set for the current exercise renders a gentle note +
// a "that was real" button, the tap calls the engine revert (un-quarantines it),
// and an empty ledger renders nothing (the common case → byte-identical).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuarantineNotice } from '../../../components/Workout/QuarantineNotice';
import { quarantineSet, isQuarantined, getQuarantine } from '../../../../engine/dp/logQuarantine.js';

const EX = 'Bench Press';

vi.mock('../../../lib/toast', () => ({ toast: { show: vi.fn() } }));

beforeEach(() => {
  localStorage.clear();
});

describe('QuarantineNotice', () => {
  it('renders nothing when no set is quarantined (common case)', () => {
    const { container } = render(<QuarantineNotice engineName={EX} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('quarantine-notice')).not.toBeInTheDocument();
  });

  it('surfaces a gentle note + revert CTA for a quarantined set', () => {
    const ts = 1_700_000_000_000;
    quarantineSet(EX, { ts, w: 200, reps: 5, z: 4 });
    render(<QuarantineNotice engineName={EX} />);
    expect(screen.getByTestId('quarantine-notice')).toBeInTheDocument();
    expect(screen.getByTestId(`quarantine-entry-${ts}`)).toBeInTheDocument();
    expect(screen.getByTestId(`quarantine-revert-${ts}`)).toBeInTheDocument();
  });

  it('one-tap "that was real" un-quarantines the set (engine revert path)', () => {
    const ts = 1_700_000_000_000;
    quarantineSet(EX, { ts, w: 200, reps: 5, z: 4 });
    expect(isQuarantined(EX, ts)).toBe(true);
    render(<QuarantineNotice engineName={EX} />);
    fireEvent.click(screen.getByTestId(`quarantine-revert-${ts}`));
    // Engine ledger no longer holds the set → next posterior fold re-includes it.
    expect(isQuarantined(EX, ts)).toBe(false);
    expect(getQuarantine(EX)).toHaveLength(0);
    // The reverted entry drops from the surface.
    expect(screen.queryByTestId(`quarantine-entry-${ts}`)).not.toBeInTheDocument();
  });

  it('only shows quarantined sets for the named exercise', () => {
    quarantineSet('Squat', { ts: 1, w: 300, reps: 3, z: 5 });
    render(<QuarantineNotice engineName={EX} />);
    expect(screen.queryByTestId('quarantine-notice')).not.toBeInTheDocument();
  });
});
