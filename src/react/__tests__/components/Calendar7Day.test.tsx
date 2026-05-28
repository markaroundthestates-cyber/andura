// ══ CALENDAR 7-DAY TESTS — task_19 Phase 4 MVP ═══════════════════════════
// Wave E3 i18n: assertions flipped to EN-default (Daniel mandate 2026-05-28).
// data-day attribute reads from t('calendar.day7.dayLabels.*') — under EN
// default locale that surfaces "Mon"/"Tue"/etc. RO labels still verified in
// the dedicated RO-locale block at the bottom of the file.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar7Day } from '../../components/Calendar7Day';
import { useScheduleStore, weekStartIso } from '../../stores/scheduleStore';
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';

beforeEach(() => {
  // Phase 5 task_01 fix: seed cu current Monday (mount effect auto-resets
  // editMode false dacă weekStartISO stale). Pre-fix hardcoded date broke
  // post wall-clock drift.
  useScheduleStore.setState({
    weekStartISO: weekStartIso(),
    days: ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'],
    editMode: false,
  });
  localStorage.clear();
  // Force EN locale — the post-2026-05-28 default. RO-specific tests below
  // flip explicitly via setLocale('ro').
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('Calendar7Day — render', () => {
  it('renders 7 day cells L-Ma-Mi-J-V-S-D', () => {
    render(<Calendar7Day />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`calendar-day-${i}`)).toBeInTheDocument();
    }
  });

  it('renders day labels in Monday-first order (EN: Mon..Sun)', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-day-0')).toHaveAttribute('data-day', 'Mon');
    expect(screen.getByTestId('calendar-day-1')).toHaveAttribute('data-day', 'Tue');
    expect(screen.getByTestId('calendar-day-2')).toHaveAttribute('data-day', 'Wed');
    expect(screen.getByTestId('calendar-day-3')).toHaveAttribute('data-day', 'Thu');
    expect(screen.getByTestId('calendar-day-4')).toHaveAttribute('data-day', 'Fri');
    expect(screen.getByTestId('calendar-day-5')).toHaveAttribute('data-day', 'Sat');
    expect(screen.getByTestId('calendar-day-6')).toHaveAttribute('data-day', 'Sun');
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

  // THEME-INVERSION fix (2026-05-27): edit-state fill/text tokenizat la
  // --heat-usor / --heat-usor-text (paritate dark exista) ca sa nu inverseze
  // pe tema mov. Verde-deschis (#d4e6cb light) + text verde-inchis pastrate
  // semantic; valorile devin token refs.
  it('EDIT state training day uses --heat-usor fill + --heat-usor-text', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    const dayL = screen.getByTestId('calendar-day-0'); // training
    expect(dayL.style.background).toContain('var(--heat-usor)');
    expect(dayL.style.color).toBe('var(--heat-usor-text)');
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

  it('day buttons enabled in edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`calendar-day-${i}`)).not.toBeDisabled();
    }
  });

  it('toggleDay flips training ↔ rest in edit mode', () => {
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

  // §F-pass2-calendar-05 (LOW chat5) — edit hint copy mockup verbatim
  // andura-clasic.html#L856 visible doar cand editMode true.
  it('edit hint hidden cand locked state', () => {
    render(<Calendar7Day />); // editMode=false default
    expect(screen.queryByTestId('calendar-edit-hint')).not.toBeInTheDocument();
  });

  it('edit hint visible cand edit mode (EN default copy)', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    const hint = screen.getByTestId('calendar-edit-hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveTextContent(
      'Toggle the days you can train this week.'
    );
  });

  it('Save click commits + exits edit mode', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    fireEvent.click(screen.getByTestId('calendar-save'));
    expect(useScheduleStore.getState().editMode).toBe(false);
  });

  it('edit toggle in edit mode acts as Save (idempotent)', () => {
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

  it('edit toggle has dynamic aria-label per state (EN default)', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-edit-toggle')).toHaveAttribute(
      'aria-label',
      'Edit schedule'
    );
    fireEvent.click(screen.getByTestId('calendar-edit-toggle'));
    expect(screen.getByTestId('calendar-edit-toggle')).toHaveAttribute(
      'aria-label',
      'Save schedule'
    );
  });
});

describe('Calendar7Day — RO locale opt-in (Cont > Setari > Limba)', () => {
  beforeEach(() => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
  });

  it('renders RO day labels L Ma Mi J V S D under RO locale', () => {
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-day-0')).toHaveAttribute('data-day', 'L');
    expect(screen.getByTestId('calendar-day-1')).toHaveAttribute('data-day', 'Ma');
    expect(screen.getByTestId('calendar-day-2')).toHaveAttribute('data-day', 'Mi');
    expect(screen.getByTestId('calendar-day-6')).toHaveAttribute('data-day', 'D');
  });

  it('RO edit hint copy verbatim (mockup parity)', () => {
    useScheduleStore.setState({ editMode: true });
    render(<Calendar7Day />);
    expect(screen.getByTestId('calendar-edit-hint')).toHaveTextContent(
      'Modifica zilele de antrenament in care esti disponibil.'
    );
  });

  it('RO edit toggle aria-label cycles Editeaza ↔ Salveaza', () => {
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
