// ══ CALENDAR 7-DAY TESTS — task_19 Phase 4 MVP ═══════════════════════════

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar7Day } from '../../components/Calendar7Day';
import { useScheduleStore } from '../../stores/scheduleStore';

beforeEach(() => {
  useScheduleStore.setState({
    weekStartISO: '2026-05-11', // arbitrary Monday
    days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'],
    editMode: false,
  });
  localStorage.clear();
});

describe('Calendar7Day — render', () => {
  it('renders 7 day cells L-Ma-Mi-J-V-S-D', () => {
    render(<Calendar7Day />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`calendar-day-${i}`)).toBeInTheDocument();
    }
  });

  it('renders day labels în order L Ma Mi J V S D', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-day-0')).toHaveAttribute('data-day', 'L');
    expect(screen.getByTestId('calendar-day-1')).toHaveAttribute('data-day', 'Ma');
    expect(screen.getByTestId('calendar-day-2')).toHaveAttribute('data-day', 'Mi');
    expect(screen.getByTestId('calendar-day-3')).toHaveAttribute('data-day', 'J');
    expect(screen.getByTestId('calendar-day-4')).toHaveAttribute('data-day', 'V');
    expect(screen.getByTestId('calendar-day-5')).toHaveAttribute('data-day', 'S');
    expect(screen.getByTestId('calendar-day-6')).toHaveAttribute('data-day', 'D');
  });

  it('training day cu background #3d7a4a (color token spec)', () => {
    render(<Calendar7Day />);
    const dayL = screen.getByTestId('calendar-day-0'); // training
    expect(dayL).toHaveAttribute('data-kind', 'training');
    expect(dayL.style.background).toContain('rgb(61, 122, 74)'); // #3d7a4a
  });

  it('rest day cu background var(--paper-2)', () => {
    render(<Calendar7Day />);
    const dayMa = screen.getByTestId('calendar-day-1'); // rest
    expect(dayMa).toHaveAttribute('data-kind', 'rest');
    expect(dayMa.style.background).toContain('var(--paper-2)');
  });

  // task_01: wiki spec dual-state color SSOT (LOCKED vs EDIT)
  it('LOCKED state training day uses #3d7a4a verde inchis + white text', () => {
    render(<Calendar7Day />); // editMode false default
    const dayL = screen.getByTestId('calendar-day-0'); // training
    expect(dayL.style.background).toContain('rgb(61, 122, 74)'); // #3d7a4a
    expect(dayL.style.color).toBe('rgb(255, 255, 255)'); // #ffffff white
  });

  it('EDIT state training day uses #d4e6cb verde deschis + var(--ink) text', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    const dayL = screen.getByTestId('calendar-day-0'); // training
    expect(dayL.style.background).toContain('rgb(212, 230, 203)'); // #d4e6cb
    expect(dayL.style.color).toBe('var(--ink)');
  });

  it('rest day color invariant cross-states (var(--paper-2) LOCKED + EDIT)', () => {
    const { rerender } = render(<Calendar7Day />); // editMode false
    expect(screen.getByTestId('calendar-day-1').style.background).toContain('var(--paper-2)');
    useScheduleStore.setState({ editMode: true });
    rerender(<Calendar7Day />);
    expect(screen.getByTestId('calendar-day-1').style.background).toContain('var(--paper-2)');
  });

  it('locked default state — day buttons disabled', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-7day')).toHaveAttribute('data-edit-mode', 'false');
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`calendar-day-${i}`)).toBeDisabled();
    }
  });
});

describe('Calendar7Day — edit mode', () => {
  it('edit toggle (pencil) activates edit mode', () => {
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-edit-toggle'));
    expect(screen.getByTestId('calendar-7day')).toHaveAttribute('data-edit-mode', 'true');
    expect(useScheduleStore.getState().editMode).toBe(true);
  });

  it('day buttons enabled în edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`calendar-day-${i}`)).not.toBeDisabled();
    }
  });

  it('toggleDay flips training ↔ rest în edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-day-1')); // rest → training
    expect(useScheduleStore.getState().days[1]).toBe('training');
    fireEvent.click(screen.getByTestId('calendar-day-1')); // back
    expect(useScheduleStore.getState().days[1]).toBe('rest');
  });

  it('locked state — toggleDay NU flips (no-op)', () => {
    render(<Calendar7Day />); // editMode=false default
    fireEvent.click(screen.getByTestId('calendar-day-1'));
    expect(useScheduleStore.getState().days[1]).toBe('rest'); // unchanged
  });

  it('Save button visible cand edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-save')).toBeInTheDocument();
  });

  it('Save click commits + exits edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-save'));
    expect(useScheduleStore.getState().editMode).toBe(false);
  });

  it('edit toggle în edit mode acts as Save (idempotent)', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-edit-toggle'));
    expect(useScheduleStore.getState().editMode).toBe(false);
  });
});

describe('Calendar7Day — D-LEGACY-064 no-diacritics + a11y', () => {
  it('day aria-labels NU contain diacritics', () => {
    const { container } = render(<Calendar7Day />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.innerHTML)).toBe(false);
  });

  it('edit toggle has dynamic aria-label per state', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-edit-toggle')).toHaveAttribute(
      'aria-label',
      'Editeaza'
    );
    fireEvent.click(screen.getByTestId('calendar-edit-toggle'));
    expect(screen.getByTestId('calendar-edit-toggle')).toHaveAttribute(
      'aria-label',
      'Salveaza'
    );
  });
});
