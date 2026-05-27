// ══ INACTIVITY PROMPT — Workout Idle User Prompt Overlay ═════════════════
// Phase 4 task_15 §A — conditional overlay cand >7 min no activity (mockup
// wv2 verbatim threshold). NU blocking (user can keep working — overlay
// just a soft re-engage prompt).
//
// Mockup wv2 copy verbatim (andura-clasic.html#L4407-4421 showInactivityPrompt):
//   - Title: "Esti acolo?"
//   - Body: "N-am vazut activitate de 7 min. Daca ai facut o pauza mai
//     lunga, e OK - continuam de unde am ramas."
//   - Button primary: "Continui" (resume — reset activity)
//   - Button secondary: "Salveaza si iesi" (pause session + navigate antrenor)
//
// Cross-refs:
//   - mockup andura-clasic.html FIX wv2 §inactivity-prompt 2026-05-11
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics (em-dash → hyphen)

import type { JSX } from 'react';
import { Clock } from 'lucide-react';

interface InactivityPromptProps {
  open: boolean;
  onContinue: () => void;
  onSaveExit: () => void;
}

export function InactivityPrompt({
  open,
  onContinue,
  onSaveExit,
}: InactivityPromptProps): JSX.Element | null {
  if (!open) return null;
  return (
    <div
      className="fixed left-3.5 right-3.5 bottom-3.5 bg-paper2 border-2 border-brick rounded-2xl p-4 z-[50] shadow-xl"
      data-testid="inactivity-prompt"
      role="dialog"
      aria-labelledby="inactivity-prompt-title"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <Clock className="w-4 h-4 text-brick" aria-hidden="true" />
        <div
          id="inactivity-prompt-title"
          className="font-bold text-ink"
          data-testid="inactivity-prompt-title"
        >
          Esti acolo?
        </div>
      </div>
      <div className="text-sm text-ink2 leading-snug mb-2.5" data-testid="inactivity-prompt-body">
        N-am vazut activitate de 7 min. Daca ai facut o pauza mai lunga, e OK - continuam de unde am ramas.
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onContinue}
          data-testid="inactivity-continue"
          className="flex-1 bg-ink text-paper dark:bg-brick border-0 rounded-lg py-2.5 text-sm font-semibold"
        >
          Continui
        </button>
        <button
          type="button"
          onClick={onSaveExit}
          data-testid="inactivity-save-exit"
          className="bg-transparent border border-lineStrong text-ink2 rounded-lg py-2.5 px-3.5 text-sm font-medium"
        >
          Salveaza si iesi
        </button>
      </div>
    </div>
  );
}
