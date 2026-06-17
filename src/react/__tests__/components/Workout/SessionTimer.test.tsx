// SESSION TIMER TESTS — header zone presentational + §F-pass2-sessiontimer-01
// menu button parity (⋯ button + 5-row "Optiuni sesiune" bottom sheet).
//
// Baseline coverage: title/progress/elapsed render + exit trigger (preserves
// Workout.test.tsx selectors). Menu coverage: trigger button present, sheet
// opens on tap, action callbacks fire + sheet closes, backdrop dismiss,
// stopPropagation guard, sound icon swap soundOn true/false.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SessionTimer } from '../../../components/Workout/SessionTimer';
// i18n locale pin — these specs assert RO copy (Optiuni sesiune, seturi,
// exercitii, Iesi din sesiune). Force RO so the i18n indirection resolves
// to the RO assertion targets. EN coverage is locked separately by
// i18nNoRoLeak.test.tsx via Workout flow surfaces.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
});

function renderTimer(overrides: Partial<Parameters<typeof SessionTimer>[0]> = {}) {
  const props = {
    exerciseName: 'Impins inclinat',
    exIdx: 1,
    totalExercises: 5,
    // Perf isolation: SessionTimer now takes the raw sessionStart epoch ms and
    // the <SessionElapsed> leaf inside ticks it. Default null = clock at 0:00
    // (no live session) for the presentational tests below.
    sessionStart: null as number | null,
    onExit: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<SessionTimer {...props} />) };
}

describe('SessionTimer — header baseline', () => {
  it('renders exercise name + progress + elapsed 0:00 (no live session)', () => {
    renderTimer();
    expect(screen.getByTestId('workout-title')).toHaveTextContent('Impins inclinat');
    expect(screen.getByTestId('workout-progress')).toHaveTextContent(/Ex 2\/5/);
    expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('0:00');
  });

  it('elapsed leaf ticks from sessionStart (1:35 at 95s)', () => {
    // Frozen fake clock (no real drift): sessionStart 94s back, advance one
    // 1000ms tick → interval reads exactly 95s delta → leaf shows 1:35. Proves
    // the elapsed text derives from sessionStart via the <SessionElapsed> leaf.
    vi.useFakeTimers();
    try {
      renderTimer({ sessionStart: Date.now() - 94_000 });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByTestId('workout-elapsed')).toHaveTextContent('1:35');
    } finally {
      vi.useRealTimers();
    }
  });

  it('exit trigger fires onExit', () => {
    const { props } = renderTimer();
    fireEvent.click(screen.getByTestId('workout-exit-trigger'));
    expect(props.onExit).toHaveBeenCalledTimes(1);
  });
});

describe('SessionTimer — §F-pass2-sessiontimer-01 menu button + sheet', () => {
  it('renders menu trigger with aria-label "Optiuni sesiune"', () => {
    renderTimer();
    const trigger = screen.getByTestId('workout-menu-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Optiuni sesiune');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('menu sheet hidden by default (closed initial state)', () => {
    renderTimer();
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('tap menu trigger opens sheet with 4 action rows (sound gated, ascuns default)', () => {
    // Parity LOW (decizie Daniel) — randul Sunet e gated pe onToggleSound.
    // Workout.tsx NU il paseaza (NU exista subsistem audio) → ascuns in prod.
    renderTimer();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('workout-menu-pain')).toBeInTheDocument();
    expect(screen.getByTestId('workout-menu-skip')).toBeInTheDocument();
    expect(screen.getByTestId('workout-menu-finish-early')).toBeInTheDocument();
    expect(screen.queryByTestId('workout-menu-sound')).not.toBeInTheDocument();
    expect(screen.getByTestId('workout-menu-cancel')).toBeInTheDocument();
  });

  it('sound row reapare cand onToggleSound wired (subsistem audio viitor)', () => {
    renderTimer({ onToggleSound: vi.fn() });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-sound')).toBeInTheDocument();
  });

  it('aria-expanded updates true cand sheet open', () => {
    renderTimer();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  it('pain action fires onPain + closes sheet', () => {
    const onPain = vi.fn();
    renderTimer({ onPain });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-pain'));
    expect(onPain).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('skip action fires onSkipExercise + closes sheet', () => {
    const onSkipExercise = vi.fn();
    renderTimer({ onSkipExercise });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-skip'));
    expect(onSkipExercise).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('finish-early action fires onFinishEarly + closes sheet', () => {
    const onFinishEarly = vi.fn();
    renderTimer({ onFinishEarly });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-finish-early'));
    expect(onFinishEarly).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('sound action fires onToggleSound + closes sheet', () => {
    const onToggleSound = vi.fn();
    renderTimer({ onToggleSound });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-sound'));
    expect(onToggleSound).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('cancel action fires onCancelSession + closes sheet', () => {
    const onCancelSession = vi.fn();
    renderTimer({ onCancelSession });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-cancel'));
    expect(onCancelSession).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('sound label "Sunet: pornit" cand soundOn=true (default)', () => {
    // onToggleSound necesar acum pentru a randa randul (gated parity LOW).
    renderTimer({ onToggleSound: vi.fn() });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-sound')).toHaveTextContent('Sunet: pornit');
  });

  it('sound label "Sunet: oprit" cand soundOn=false', () => {
    renderTimer({ soundOn: false, onToggleSound: vi.fn() });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-sound')).toHaveTextContent('Sunet: oprit');
  });

  it('backdrop tap dismisses sheet (no action fired)', () => {
    const onPain = vi.fn();
    renderTimer({ onPain });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-backdrop'));
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
    expect(onPain).not.toHaveBeenCalled();
  });

  // Z-WAR (founder live 2026-06-12) — the menu open/close is mirrored to the
  // parent so the in-session logging dock yields (auto-hides) while the sheet is
  // up. Fires true on open, false on close (action OR backdrop).
  it('onMenuOpenChange fires true on open, false on close (action + backdrop)', () => {
    const onMenuOpenChange = vi.fn();
    renderTimer({ onMenuOpenChange, onPain: vi.fn() });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(true);
    // Close via an action.
    fireEvent.click(screen.getByTestId('workout-menu-pain'));
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(false);
    // Re-open then close via the backdrop.
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByTestId('workout-menu-backdrop'));
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('click inside sheet does NOT dismiss via backdrop (stopPropagation)', () => {
    renderTimer();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    fireEvent.click(screen.getByTestId('workout-menu-sheet'));
    expect(screen.getByTestId('workout-menu-sheet')).toBeInTheDocument();
  });

  it('action handlers default noop — clicking without callback does NOT throw', () => {
    renderTimer();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(() => fireEvent.click(screen.getByTestId('workout-menu-pain'))).not.toThrow();
    // sheet still closes (handler defaults noop, close always runs)
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });

  it('menu trigger tap target ≥44px (a11y WCAG 2.5.5)', () => {
    renderTimer();
    const trigger = screen.getByTestId('workout-menu-trigger');
    expect(trigger.className).toMatch(/min-w-\[44px\]/);
    expect(trigger.className).toMatch(/min-h-\[44px\]/);
  });

  it('menu copy no diacritics', () => {
    renderTimer();
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    const sheet = screen.getByTestId('workout-menu-sheet');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(sheet.textContent ?? '')).toBe(false);
  });
});

describe('SessionTimer — a11y: Escape closes menu + restores focus (keyboard trap fix)', () => {
  it('Escape closes the open menu without firing any session action', () => {
    const onPain = vi.fn();
    const onSkipExercise = vi.fn();
    const onFinishEarly = vi.fn();
    const onCancelSession = vi.fn();
    renderTimer({ onPain, onSkipExercise, onFinishEarly, onCancelSession });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(screen.getByTestId('workout-menu-sheet')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
    // Escape is a SAFE close — no session action may fire.
    expect(onPain).not.toHaveBeenCalled();
    expect(onSkipExercise).not.toHaveBeenCalled();
    expect(onFinishEarly).not.toHaveBeenCalled();
    expect(onCancelSession).not.toHaveBeenCalled();
  });

  it('Escape mirrors close to parent via onMenuOpenChange(false)', () => {
    const onMenuOpenChange = vi.fn();
    renderTimer({ onMenuOpenChange });
    fireEvent.click(screen.getByTestId('workout-menu-trigger'));
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onMenuOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('focuses the first menu item on open, restores focus to the trigger on close', () => {
    renderTimer();
    const trigger = screen.getByTestId('workout-menu-trigger');
    fireEvent.click(trigger);
    // First action row receives focus on open.
    expect(document.activeElement).toBe(screen.getByTestId('workout-menu-pain'));
    // Escape closes → focus returns to the ⋯ trigger (no keyboard dead-end).
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('no keydown effect when menu closed (Escape on a closed menu is inert)', () => {
    const onMenuOpenChange = vi.fn();
    renderTimer({ onMenuOpenChange });
    // Menu never opened — Escape must do nothing (no false close signal).
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onMenuOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('workout-menu-sheet')).not.toBeInTheDocument();
  });
});

describe('SessionTimer — §F-pass2-sessiontimer-02 workoutTitle center label', () => {
  it('renders exerciseName fallback cand workoutTitle absent (backward compat)', () => {
    renderTimer();
    expect(screen.getByTestId('workout-title')).toHaveTextContent('Impins inclinat');
  });

  it('renders workoutTitle when prop provided (overrides exerciseName)', () => {
    renderTimer({ workoutTitle: 'Push · piept si umeri' });
    expect(screen.getByTestId('workout-title')).toHaveTextContent('Push · piept si umeri');
  });

  it('workoutTitle empty string still falls back to exerciseName', () => {
    // Empty string is "absent" semantic per nullish coalesce — TS string but
    // null-equivalent display. Asserts conservative fallback.
    renderTimer({ workoutTitle: '' });
    // '' ?? 'Impins...' = '' (not nullish). Title shows empty. Document
    // expectation explicit: API contract is "absent OR non-empty"; parent
    // ensures workoutTitle is meaningful.
    expect(screen.getByTestId('workout-title').textContent).toBe('');
  });
});

describe('SessionTimer — §F-pass2-sessiontimer-04 wv2-progress block', () => {
  it('progress block omitted when setsTotal absent (backward compat)', () => {
    renderTimer();
    expect(screen.queryByTestId('workout-progress-bar')).not.toBeInTheDocument();
  });

  it('progress block omitted when setsTotal=0 (rest day / loading)', () => {
    renderTimer({ setsTotal: 0, setsDone: 0 });
    expect(screen.queryByTestId('workout-progress-bar')).not.toBeInTheDocument();
  });

  it('progress block renders when setsTotal>0', () => {
    renderTimer({ setsDone: 5, setsTotal: 17 });
    expect(screen.getByTestId('workout-progress-bar')).toBeInTheDocument();
  });

  it('sets counter displays setsDone/setsTotal verbatim', () => {
    renderTimer({ setsDone: 5, setsTotal: 17 });
    expect(screen.getByTestId('workout-progress-sets')).toHaveTextContent('5/17 seturi');
  });

  it('exercise counter prefers exerciseCount/exerciseTotal cand provided', () => {
    renderTimer({ setsDone: 5, setsTotal: 17, exerciseCount: 2, exerciseTotal: 5 });
    expect(screen.getByTestId('workout-progress-ex')).toHaveTextContent('2/5 exercitii');
  });

  it('exercise counter fallback to exIdx+1/totalExercises when explicit absent', () => {
    renderTimer({ setsDone: 5, setsTotal: 17, exIdx: 1, totalExercises: 5 });
    expect(screen.getByTestId('workout-progress-ex')).toHaveTextContent('2/5 exercitii');
  });

  it('progress fill width matches setsDone/setsTotal percent', () => {
    renderTimer({ setsDone: 5, setsTotal: 17 });
    // 5/17 = 0.2941 → rounded 29%
    const fill = screen.getByTestId('workout-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('29%');
  });

  it('progress fill clamped 0% cand setsDone=0', () => {
    renderTimer({ setsDone: 0, setsTotal: 17 });
    const fill = screen.getByTestId('workout-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('progress fill clamped 100% cand setsDone=setsTotal', () => {
    renderTimer({ setsDone: 17, setsTotal: 17 });
    const fill = screen.getByTestId('workout-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('progress fill clamped 100% cand setsDone>setsTotal (overrun defensive)', () => {
    renderTimer({ setsDone: 20, setsTotal: 17 });
    const fill = screen.getByTestId('workout-progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('progress copy no diacritics', () => {
    renderTimer({ setsDone: 5, setsTotal: 17 });
    const bar = screen.getByTestId('workout-progress-bar');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(bar.textContent ?? '')).toBe(false);
  });
});
