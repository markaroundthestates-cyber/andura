// ══ TUTORIAL — coach-marks engine + gate + persistence tests ══════════════
// Covers the first-session coach-marks (founder pick 2026-06-12):
//   1. CoachMarks renders a step (counter + title + body + controls) and walks
//      forward through "Next", ending on "Done" → onComplete.
//   2. "Sari peste" (skip) and Escape both fire onSkip.
//   3. Absent anchor → the step degrades to a centered bubble (no spotlight),
//      present anchor (mocked rect) → a spotlight box is drawn.
//   4. TutorialGate trigger: shows for a never-trained, unseen user; persists
//      tutorialSeen on skip/complete; never re-shows when the flag is set or the
//      user has trained.
//   5. settingsStore.tutorialSeen persistence (field + action + partialize),
//      mirroring the avatarId convention.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CoachMarks } from '../../../components/Tutorial/CoachMarks';
import { TutorialGate } from '../../../components/Tutorial/TutorialGate';
import { TUTORIAL_STEPS, type TutorialStep } from '../../../components/Tutorial/steps';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useWorkoutStore } from '../../../stores/workoutStore';

// jsdom returns an all-zero rect by default → measure() treats it as absent.
// Install a non-zero rect ONLY for elements carrying one of `presentAnchors`
// (matched by their data-testid), so a test can make an anchor "present".
function mockRects(presentAnchors: readonly string[]): void {
  const set = new Set(presentAnchors);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element,
  ): DOMRect {
    const id = this.getAttribute('data-testid');
    if (id && set.has(id)) {
      return { top: 100, left: 40, width: 200, height: 80, right: 240, bottom: 180, x: 40, y: 100, toJSON: () => ({}) } as DOMRect;
    }
    return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  });
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
  // Reset the workout store's trained-before signal to a clean (untrained) slate.
  useWorkoutStore.setState({ sessionsHistory: [] });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── CoachMarks engine ────────────────────────────────────────────────────────

describe('CoachMarks — rendering + advance', () => {
  const steps: readonly TutorialStep[] = [
    { id: 'a', anchor: null, key: 'tutorial.steps.energy' },
    { id: 'b', anchor: null, key: 'tutorial.steps.start' },
    { id: 'c', anchor: null, key: 'tutorial.steps.done' },
  ];

  it('renders the first step with counter, title, body, and controls', () => {
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={() => {}} />);
    expect(screen.getByTestId('tutorial-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('tutorial-step-counter').textContent).toBe('step 1 of 3');
    expect(screen.getByTestId('tutorial-title').textContent).toBe('Tell Andura how you feel');
    expect(screen.getByTestId('tutorial-body').textContent).toContain('Tap here before training');
    expect(screen.getByTestId('tutorial-next')).toHaveTextContent('Next');
    expect(screen.getByTestId('tutorial-skip')).toBeInTheDocument();
  });

  it('advances through steps on Next, showing Done on the last', () => {
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={() => {}} />);
    fireEvent.click(screen.getByTestId('tutorial-next')); // → step 2
    expect(screen.getByTestId('tutorial-step-counter').textContent).toBe('step 2 of 3');
    expect(screen.getByTestId('tutorial-title').textContent).toBe('Ready? Start the session');
    fireEvent.click(screen.getByTestId('tutorial-next')); // → step 3 (last)
    expect(screen.getByTestId('tutorial-step-counter').textContent).toBe('step 3 of 3');
    expect(screen.getByTestId('tutorial-next')).toHaveTextContent('Done');
    // Skip is hidden on the last step (mockup parity).
    expect(screen.queryByTestId('tutorial-skip')).toBeNull();
  });

  it('fires onComplete when Done is pressed on the last step', () => {
    const onComplete = vi.fn();
    render(<CoachMarks steps={steps} onComplete={onComplete} onSkip={() => {}} />);
    fireEvent.click(screen.getByTestId('tutorial-next'));
    fireEvent.click(screen.getByTestId('tutorial-next'));
    fireEvent.click(screen.getByTestId('tutorial-next')); // Done
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('moves focus to the bubble on mount (keyboard / SR entry point)', () => {
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={() => {}} />);
    expect(document.activeElement).toBe(screen.getByTestId('tutorial-bubble'));
  });

  it('the bubble is a labelled dialog with an aria-live step region', () => {
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={() => {}} />);
    const bubble = screen.getByTestId('tutorial-bubble');
    expect(bubble).toHaveAttribute('role', 'dialog');
    expect(bubble).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('tutorial-step-text')).toHaveAttribute('aria-live', 'polite');
  });
});

describe('CoachMarks — skip + Escape', () => {
  const steps: readonly TutorialStep[] = [
    { id: 'a', anchor: null, key: 'tutorial.steps.energy' },
    { id: 'b', anchor: null, key: 'tutorial.steps.done' },
  ];

  it('fires onSkip when "skip tutorial" is clicked', () => {
    const onSkip = vi.fn();
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={onSkip} />);
    fireEvent.click(screen.getByTestId('tutorial-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('fires onSkip on Escape', () => {
    const onSkip = vi.fn();
    render(<CoachMarks steps={steps} onComplete={() => {}} onSkip={onSkip} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

describe('CoachMarks — spotlight vs centered fallback', () => {
  it('draws a spotlight when the anchor is present (measured rect)', () => {
    mockRects(['present-anchor']);
    // The anchor element must exist in the document for the query to find it.
    render(
      <>
        <div data-testid="present-anchor">target</div>
        <CoachMarks
          steps={[{ id: 's', anchor: 'present-anchor', key: 'tutorial.steps.energy', placement: 'bottom' }]}
          onComplete={() => {}}
          onSkip={() => {}}
        />
      </>,
    );
    expect(screen.getByTestId('tutorial-spotlight')).toBeInTheDocument();
  });

  it('degrades to a centered bubble (no spotlight) when the anchor is absent', () => {
    mockRects([]); // nothing present
    render(
      <CoachMarks
        steps={[{ id: 's', anchor: 'missing-anchor', key: 'tutorial.steps.energy' }]}
        onComplete={() => {}}
        onSkip={() => {}}
      />,
    );
    // Bubble still renders (teaching moment preserved); no spotlight box.
    expect(screen.getByTestId('tutorial-bubble')).toBeInTheDocument();
    expect(screen.queryByTestId('tutorial-spotlight')).toBeNull();
  });

  it('treats a zero-area anchor as absent (no spotlight)', () => {
    mockRects([]); // present-but-zero → measure() returns null
    render(
      <>
        <div data-testid="zero-anchor">collapsed</div>
        <CoachMarks
          steps={[{ id: 's', anchor: 'zero-anchor', key: 'tutorial.steps.energy' }]}
          onComplete={() => {}}
          onSkip={() => {}}
        />
      </>,
    );
    expect(screen.queryByTestId('tutorial-spotlight')).toBeNull();
  });

  it('renders one step dot per declared step', () => {
    render(
      <CoachMarks steps={TUTORIAL_STEPS} onComplete={() => {}} onSkip={() => {}} />,
    );
    // Dots live in the bubble; count the decorative markers next to Next.
    const bubble = screen.getByTestId('tutorial-bubble');
    const next = within(bubble).getByTestId('tutorial-next');
    const dotRow = next.previousElementSibling;
    expect(dotRow?.childElementCount).toBe(TUTORIAL_STEPS.length);
  });
});

// ── TutorialGate trigger + persistence ───────────────────────────────────────

describe('TutorialGate — trigger', () => {
  it('shows the coach-marks for a never-trained, unseen user', () => {
    render(<TutorialGate />);
    expect(screen.getByTestId('tutorial-overlay')).toBeInTheDocument();
  });

  it('does NOT show when tutorialSeen is already set', () => {
    useSettingsStore.getState().setTutorialSeen(true);
    render(<TutorialGate />);
    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
  });

  it('does NOT show for a user who has trained before (has session history)', () => {
    useWorkoutStore.setState({ sessionsHistory: [{ id: 'past' } as never] });
    render(<TutorialGate />);
    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
  });

  it('persists tutorialSeen=true on skip and unmounts the overlay', () => {
    render(<TutorialGate />);
    fireEvent.click(screen.getByTestId('tutorial-skip'));
    expect(useSettingsStore.getState().tutorialSeen).toBe(true);
    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
    // landed in the persisted slice (partialize)
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted?.state?.tutorialSeen).toBe(true);
  });

  it('persists tutorialSeen=true after completing the last step', () => {
    render(<TutorialGate />);
    // Walk to the end (TUTORIAL_STEPS length) then press Done.
    for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
      fireEvent.click(screen.getByTestId('tutorial-next'));
    }
    expect(useSettingsStore.getState().tutorialSeen).toBe(true);
    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
  });

  it('never re-shows once seen (re-mount with the flag set stays closed)', () => {
    const { unmount } = render(<TutorialGate />);
    fireEvent.click(screen.getByTestId('tutorial-skip'));
    unmount();
    render(<TutorialGate />);
    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
  });
});

// ── settingsStore persistence ────────────────────────────────────────────────

describe('settingsStore tutorialSeen', () => {
  it('defaults to false (unseen)', () => {
    expect(useSettingsStore.getState().tutorialSeen).toBe(false);
  });

  it('setTutorialSeen updates the field and reset clears it', () => {
    useSettingsStore.getState().setTutorialSeen(true);
    expect(useSettingsStore.getState().tutorialSeen).toBe(true);
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().tutorialSeen).toBe(false);
  });

  it('persists tutorialSeen into the partialized localStorage slice', () => {
    useSettingsStore.getState().setTutorialSeen(true);
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted?.state?.tutorialSeen).toBe(true);
  });
});
