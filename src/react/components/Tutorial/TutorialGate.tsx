// ══ TUTORIAL GATE — first-session trigger + persistence ═══════════════════
// Decides whether to show the coach-marks and wires both exits to the persisted
// seen-flag. Mounted once on the Coach home (Antrenor) so a single line hooks
// the whole tutorial into the screen.
//
// Trigger (founder pick 2026-06-12): show ONCE for a user who has never
// completed a session AND has not already seen/skipped the tutorial. "Never
// trained" reads the durable workoutStore.sessionsHistory (the same signal
// Antrenor uses for its first-session microcopy), NOT the transient lastSession.
// Both "Sari peste" and finishing the last step persist settingsStore.
// tutorialSeen=true (mirrors the avatarId per-UID prefs convention: persisted +
// synced via storeSync), so it never re-shows.
//
// The decision is snapshotted at mount: flipping the flag mid-run does not yank
// the overlay (it unmounts cleanly only after the user's own skip/complete).

import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { CoachMarks } from './CoachMarks';
import { TUTORIAL_STEPS } from './steps';

export function TutorialGate(): JSX.Element | null {
  const tutorialSeen = useSettingsStore((s) => s.tutorialSeen);
  const setTutorialSeen = useSettingsStore((s) => s.setTutorialSeen);
  const hasTrainedBefore = useWorkoutStore((s) => s.sessionsHistory.length > 0);

  // Snapshot the eligibility ONCE (mount). A fresh, never-trained user who has
  // not seen the tutorial is eligible; everyone else is not. We freeze it so a
  // store change during the walk-through (or the seen-flag write itself) never
  // unmounts the overlay out from under the user — it closes only on their
  // explicit skip/complete via `open`.
  const eligibleRef = useRef<boolean>(!tutorialSeen && !hasTrainedBefore);
  const [open, setOpen] = useState<boolean>(eligibleRef.current);

  if (!open) return null;

  const finish = (): void => {
    setTutorialSeen(true);
    setOpen(false);
  };

  return <CoachMarks steps={TUTORIAL_STEPS} onComplete={finish} onSkip={finish} />;
}
