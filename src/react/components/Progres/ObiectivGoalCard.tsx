// ══ OBIECTIV GOAL CARD — Progres tab goal selector ═══════════════════════
//
// Daniel verbatim 2026-05-28: "sa muti aia cu Obiectiv de la Coach la progres
// ... ma refer la alea de faze auto, forta slabire mentenanta longevitate".
// Goal selector relocated from Antrenor home (ObiectivSelector.tsx) + SettingsProfile
// Antrenament > Obiectiv select. Logic groups it cu ObiectivCard (target
// weight + deadline + ETA) at top of Progres — the Obiectiv hub.
//
// Behavior parity cu Antrenor ObiectivSelector (preserved):
//   - Same-row click = no-op (already-active guard).
//   - Different-row click = navigate la /app/progres/program-change-confirm cu
//     state.pendingGoal/pendingLabel/pendingSub (universal destructive
//     drill-down per D047 LOCKED V1).
//   - aria-pressed toggle pattern (§6-M3 — NU radiogroup, evita arrow-key
//     roving tabIndex pre-Beta inutil).
//   - Tap target >= 44px (Maria 65 WCAG 2.5.5).
//
// Frecventa + Experienta RAMAN in Cont > SettingsProfile (setup-once params,
// NU progress-tracking goal). Doar selectorul de obiectiv s-a mutat aici.
//
// testid prefix `obiectiv-row-*` + `obiectiv-ales-*` preserved (cross-screen
// stable contract — used by smoke + audit pipelines).

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dumbbell, Flame, TrendingDown, ShieldCheck, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { targetDirection, isGoalEnabled } from '../../lib/goalPhaseModel';
import type { TargetDirection } from '../../lib/goalPhaseModel';
import { setPhaseOverride } from '../../../util/phaseOverride.js';
import { SYS } from '../../../engine/sys.js';
import { gotoPath } from '../../lib/navigation';
import { t } from '../../../i18n/index.js';

interface ObiectivOption {
  id: Goal;
  titleKey: string;
  subKey: string;
  Icon: LucideIcon;
}

// Mockup L864-868 verbatim labels + sub-copy + lucide icons. 5 obiective
// post-D080 longevitate drop (semantic duplicate cu mentenanta — ambele
// MAINTENANCE engine phase, identice template parameters). Persisted users
// cu goal='longevitate' migrated → 'mentenanta' via onboardingStore v4→v5.
// Title + sub-copy resolved via i18n at render time so EN/RO swap is wire-only
// (NU rewrite OPTIONS) per Daniel 2026-05-28 EN-default mandate.
const OPTIONS: readonly ObiectivOption[] = [
  { id: 'auto',        titleKey: 'obiectiv.options.autoTitle',        subKey: 'obiectiv.options.autoSub',        Icon: Sparkles },
  { id: 'forta',       titleKey: 'obiectiv.options.fortaTitle',       subKey: 'obiectiv.options.fortaSub',       Icon: Dumbbell },
  { id: 'masa',        titleKey: 'obiectiv.options.masaTitle',        subKey: 'obiectiv.options.masaSub',        Icon: Flame },
  { id: 'slabire',     titleKey: 'obiectiv.options.slabireTitle',     subKey: 'obiectiv.options.slabireSub',     Icon: TrendingDown },
  { id: 'mentenanta',  titleKey: 'obiectiv.options.mentenantaTitle',  subKey: 'obiectiv.options.mentenantaSub',  Icon: ShieldCheck },
];

// Gating prompt copy per target direction — shown after an auto-switch to AUTO
// fired because the user's selected goal contradicted a new target weight.
const SWITCH_NOTE_KEY: Record<Exclude<TargetDirection, 'MAINTAIN'> | 'MAINTAIN', string> = {
  LOSE: 'obiectiv.gating.switchedToAutoLose',
  GAIN: 'obiectiv.gating.switchedToAutoGain',
  MAINTAIN: 'obiectiv.gating.switchedToAutoMaintain',
};

export function ObiectivGoalCard(): JSX.Element {
  const navigate = useNavigate();
  const goal = useOnboardingStore((s) => s.data.goal);
  const setField = useOnboardingStore((s) => s.setField);

  // Default Auto cand goal nu e setat (mockup L864 data-program="auto" is-active).
  const activeGoal: Goal = goal ?? 'auto';

  // §gating 2026-05-30 — target weight = master intent. direction gates which
  // phases are SELECTABLE; contradicting ones gray out + become untappable.
  const targetWeightKg = useProgresStore((s) => s.targetObiectiv.weightKg);
  const currentWeightKg = getCurrentWeightKg();
  const direction = targetDirection(currentWeightKg, targetWeightKg);

  // Auto-switch: if the user changes their target so the CURRENTLY selected goal
  // becomes disabled, drop them to AUTO (clears phase-override) + surface a note.
  // The note is held in state so it survives the post-switch re-render (after the
  // switch, activeGoal=auto is enabled again, so it can't be derived live).
  const selectedDisabled = direction !== null && !isGoalEnabled(activeGoal, direction);
  const [switchNote, setSwitchNote] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedDisabled || direction === null) return;
    setField('goal', 'auto');
    const tdee = typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000;
    setPhaseOverride('AUTO', tdee);
    setSwitchNote(t(SWITCH_NOTE_KEY[direction]));
  }, [selectedDisabled, direction, setField]);

  function pick(g: Goal): void {
    if (g === activeGoal) return;
    // Gating — contradicting phases are not tappable.
    if (direction !== null && !isGoalEnabled(g, direction)) return;
    // Picking a fresh goal dismisses any prior auto-switch note.
    setSwitchNote(null);
    const opt = OPTIONS.find((o) => o.id === g);
    const pendingLabel = opt ? t(opt.titleKey) : g;
    const pendingSub = opt ? t(opt.subKey) : '';
    navigate(gotoPath('program-change-confirm'), {
      state: {
        pendingGoal: g,
        pendingLabel,
        pendingSub,
        // ProgramChangeConfirm intoarce la Progres dupa confirm/cancel (caller-aware).
        returnTo: 'progres',
      },
    });
  }

  return (
    <section
      className="mb-5"
      data-testid="obiectiv-goal-card"
      aria-label={t('obiectiv.goalCardAriaLabel')}
    >
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
        {t('obiectiv.heading')}
      </p>
      <div className="pulse-card overflow-hidden">
        {OPTIONS.map((opt, i) => {
          const selected = activeGoal === opt.id;
          const isLast = i === OPTIONS.length - 1;
          const title = t(opt.titleKey);
          const sub = t(opt.subKey);
          // §gating — contradicting phases for the target direction are disabled:
          // grayed (reduced opacity), not tappable, aria-disabled. Auto is never
          // disabled (it always resolves to a coherent phase).
          const disabled = direction !== null && !isGoalEnabled(opt.id, direction);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              disabled={disabled}
              data-testid={`obiectiv-row-${opt.id}`}
              data-program={opt.id}
              data-disabled={disabled ? 'true' : undefined}
              aria-pressed={selected}
              aria-disabled={disabled || undefined}
              title={disabled ? t('obiectiv.gating.disabledHint') : undefined}
              aria-label={t('obiectiv.optionAriaTemplate', { title, sub })}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left text-ink ${
                isLast ? '' : 'border-b border-line'
              } ${selected ? 'ob-row-selected' : 'bg-paper2'} ${
                disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              <opt.Icon
                className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-sm leading-tight">
                  {title}
                  {selected && opt.id === 'auto' && t('obiectiv.activeSuffix')}
                </span>
                <span className="block text-xs leading-tight mt-0.5 text-ink3">
                  {sub}
                </span>
              </span>
              {selected && (
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-brick flex-shrink-0"
                  data-testid={`obiectiv-ales-${opt.id}`}
                >
                  {t('obiectiv.alesBadge')}
                  <span className="ob-check ob-check-on" aria-hidden="true">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {switchNote && (
        <p
          className="text-xs text-brick mt-2 px-1 leading-snug font-medium"
          role="status"
          data-testid="obiectiv-gating-note"
        >
          {switchNote}
        </p>
      )}
    </section>
  );
}
