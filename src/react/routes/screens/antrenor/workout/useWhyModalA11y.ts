import { useEffect, useRef } from 'react';

// U-04 (MED) — why-modal focus management (auto-focus + Escape + restore +
// trap), paritate cu ExitConfirmSheet sister pattern. whyDismissRef = singurul
// buton ("Am inteles") → Tab trap pe el insusi.
//
// Extracted verbatim from Workout.tsx (behavior preserved) — owns whyDismissRef
// + whyPrevFocusRef + the auto-focus/Escape/Tab-trap/restore effect gated on
// whyText !== null. Returns whyDismissRef for the modal's dismiss button.
// setWhyText is the stable useState setter (effect deps stay [whyText], exactly
// as the original — never re-runs on identity churn of an inline closure).
export function useWhyModalA11y(
  whyText: string | null,
  setWhyText: (v: string | null) => void,
): React.RefObject<HTMLButtonElement | null> {
  const whyDismissRef = useRef<HTMLButtonElement | null>(null);
  const whyPrevFocusRef = useRef<HTMLElement | null>(null);

  // U-04 (MED) — why-modal a11y: auto-focus "Am inteles" la open, Escape inchide,
  // Tab trap (singur buton → ramane focus pe el), restore focus la invoker on
  // close. Paritate cu ExitConfirmSheet/AaFrictionModal sister pattern (WCAG
  // 2.1.1 / 2.4.3). Open gated pe whyText !== null.
  useEffect(() => {
    if (whyText === null) return;
    whyPrevFocusRef.current = document.activeElement as HTMLElement | null;
    whyDismissRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        setWhyText(null);
        return;
      }
      if (e.key === 'Tab') {
        // Singur element focusabil → trap pe el insusi.
        e.preventDefault();
        whyDismissRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      whyPrevFocusRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whyText]);

  return whyDismissRef;
}
