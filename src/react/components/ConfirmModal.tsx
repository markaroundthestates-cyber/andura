// ══ CONFIRM MODAL — Shared Destructive Confirm Dialog ════════════════════
// §A003 audit fix (MP-P5 + MP-missing-confirms) — extracted from inline
// SettingsDanger pattern. Used by 7 sites: reset-coach + schimba-faza +
// redo-onboarding + logout + delete-account + program-change + finish-early.
//
// Mobile-first bottom-sheet (sm+ centered modal). aria-modal + role=dialog
// per WCAG 2.1. Destructive flag toggles brick CTA vs primary CTA.

import type { JSX } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmCta: string;
  cancelCta?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testIdPrefix?: string;
}

export function ConfirmModal({
  open,
  title,
  body,
  confirmCta,
  cancelCta = 'Anuleaza',
  destructive = false,
  onConfirm,
  onCancel,
  testIdPrefix = 'confirm',
}: ConfirmModalProps): JSX.Element | null {
  if (!open) return null;

  const confirmClass = destructive
    ? 'flex-1 py-2.5 bg-brick text-paper rounded-xl text-sm font-semibold'
    : 'flex-1 py-2.5 bg-ink text-paper rounded-xl text-sm font-semibold';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={`${testIdPrefix}-modal`}
      className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50"
    >
      <div className="bg-paper w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          {destructive && <AlertTriangle className="w-5 h-5 text-brick" aria-hidden="true" />}
          <h2 className="text-base font-semibold text-ink">{title}</h2>
        </div>
        <p className="text-sm text-ink2 mb-4 leading-snug">{body}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            data-testid={`${testIdPrefix}-cancel`}
            className="flex-1 py-2.5 border border-line rounded-xl text-sm text-ink"
          >
            {cancelCta}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid={`${testIdPrefix}-accept`}
            className={confirmClass}
          >
            {confirmCta}
          </button>
        </div>
      </div>
    </div>
  );
}
