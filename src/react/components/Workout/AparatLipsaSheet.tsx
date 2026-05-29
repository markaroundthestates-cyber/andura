// ══ APARAT LIPSA SHEET — In-Session Missing-Equipment Picker ══════════════
// Daniel smoke 2026-05-28 #17 verbatim: *"sa apara si un aparat lipsa care sa
// adauge in lista... sa se actualizeze si in Cont in timp real"*. The action
// row in Workout already has "Aparat ocupat" (temporary) and "Nu vreau"
// (preference); this third button surfaces the PERMANENT missing-equipment
// flow mid-session, so the user doesn't have to leave the workout to update
// Cont -> AparateLipsa screen.
//
// UX:
//   - Tap "Aparat lipsa" in the action row -> sheet slides up over the log
//     zone (NOT a full-screen modal — keeps session context visible).
//   - List = the same 10 EQUIPMENT_ITEMS from AparateLipsa.tsx (single source
//     of truth: re-imported here so both surfaces stay in lock-step naming).
//   - Each item has a checkbox; ALREADY-missing items pre-checked from
//     localStorage (key wv2-missing-equipment via getMissingEquipment).
//   - Tap "Salveaza" -> setMissingEquipment(next) persists durable; the
//     change is immediately visible in Cont -> AparateLipsa next time it
//     mounts (it re-hydrates from localStorage on open). PARENT (Workout.tsx)
//     receives the new missing list via onConfirm and decides whether to
//     recompose the current exercise (resolveMissingSwap) when the item
//     covering this exercise's equipment was newly checked.
//
// Stateless WRT parent open/close (parent owns boolean), but owns its own
// LOCAL set selection so cancel doesn't bleed back to localStorage. Save
// confirms; Inchide cancels (parent closes via setOpen(false)).
//
// Cross-refs:
//   - src/react/routes/screens/antrenor/AparateLipsa.tsx (10-item SoT)
//   - src/engine/schedule/scheduleAdapter.js getMissingEquipment / set
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  getMissingEquipment,
  setMissingEquipment,
} from '../../../engine/schedule/scheduleAdapter.js';
import { t } from '../../../i18n/index.js';

// Daniel smoke 2026-05-28 #17 — keep the 10-item list in ONE place. Mirrors
// AparateLipsa.tsx EQUIPMENT_ITEMS verbatim (Slice 1.7 LOCKED naming order
// per mockup andura-clasic.html#L1056-1097). Duplicated value-only to avoid
// cross-screen import churn / RSC barrel-file thrash; if either drifts,
// E2E tests on aparate-lipsa-save / wv2-missing-equipment persistence catch
// it instantly (the localStorage shape is the single technical SoT).
export interface EquipmentItem {
  id: string;
  label: string;
}

export const APARAT_LIPSA_ITEMS: readonly EquipmentItem[] = [
  { id: 'banca-inclinata', label: 'Banca inclinata' },
  { id: 'banca-plana', label: 'Banca plana' },
  { id: 'bara-halterelor', label: 'Bara halterelor' },
  { id: 'gantere', label: 'Gantere' },
  { id: 'aparat-cablu', label: 'Aparat cablu / scripete' },
  { id: 'power-rack', label: 'Power rack / Smith machine' },
  { id: 'leg-press', label: 'Leg press' },
  { id: 'aparat-extensii', label: 'Aparat extensii / curls picioare' },
  { id: 'aparat-tractiuni', label: 'Aparat tractiuni / bara fixa' },
  { id: 'banda-elastica', label: 'Banda elastica' },
];

interface AparatLipsaSheetProps {
  open: boolean;
  /** Called after persisting the new missing list; receives the freshly-saved
   *  list so the parent can decide whether to recompose the current exercise.
   *  Empty list = user de-selected everything (still a valid save). */
  onConfirm: (missing: readonly string[]) => void;
  onClose: () => void;
}

export function AparatLipsaSheet({
  open,
  onConfirm,
  onClose,
}: AparatLipsaSheetProps): JSX.Element | null {
  // Re-hydrate from persistence each open (so Cont-side changes since last
  // mount surface immediately + cancel doesn't leak the prior open's draft).
  const [missing, setMissing] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!open) return;
    setMissing(new Set(getMissingEquipment()));
  }, [open]);

  // U-04 (MED) sister-pattern — focus management + Escape close + restore
  // focus on close (matches ExitConfirmSheet / why-modal in Workout.tsx).
  const firstActionRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    firstActionRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  function toggle(id: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave(): void {
    const list = Array.from(missing);
    // Persist FIRST so Cont -> AparateLipsa hydrates the new state on next
    // mount (Daniel "se actualizeze si in Cont in timp real" — the localStorage
    // shape is shared with that screen, no extra wiring needed).
    setMissingEquipment(list);
    onConfirm(list);
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="aparat-lipsa-sheet-backdrop"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
        data-testid="aparat-lipsa-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('workout.aparatLipsaSheet.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink mb-1">{t('workout.aparatLipsaSheet.title')}</h2>
        <p className="text-sm text-ink2 mb-4">
          {t('workout.aparatLipsaSheet.subtitle')}
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {APARAT_LIPSA_ITEMS.map((item, idx) => {
            const selected = missing.has(item.id);
            return (
              <label
                key={item.id}
                className={
                  selected
                    ? 'flex items-center gap-3 p-3 rounded-xl border bg-brick/10 border-brick text-ink cursor-pointer'
                    : 'pulse-card pulse-card-tight flex items-center gap-3 p-3 text-ink cursor-pointer'
                }
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(item.id)}
                  data-item={item.id}
                  data-testid={`aparat-lipsa-sheet-item-${item.id}`}
                  aria-label={item.label}
                  ref={idx === 0 ? null : undefined}
                  className="w-5 h-5 accent-brick"
                />
                <span className="text-sm font-medium">{item.label}</span>
              </label>
            );
          })}
        </div>
        <button
          ref={firstActionRef}
          type="button"
          onClick={handleSave}
          data-testid="aparat-lipsa-sheet-save"
          className="w-full py-3 pulse-grad-bg pulse-shine text-paper rounded-[14px] text-base font-semibold min-h-[44px]"
        >
          {t('workout.aparatLipsaSheet.saveCta')}
        </button>
        <button
          type="button"
          onClick={onClose}
          data-testid="aparat-lipsa-sheet-close"
          className="w-full mt-2 py-2.5 text-ink2 text-sm"
        >
          {t('workout.aparatLipsaSheet.closeCta')}
        </button>
      </div>
    </div>
  );
}
