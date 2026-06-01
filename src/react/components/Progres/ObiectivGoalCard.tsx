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
import { Sparkles, Dumbbell, Flame, TrendingDown, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { getCurrentWeightKg, readUserMaintenanceTDEE } from '../../lib/userTdee';
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
    // Per-user TDEE snapshot (coherent with AUTO / getPhaseOverrideKcalToday);
    // legacy SYS.estimateTDEE (capped 3500) only as cold-start fallback.
    const tdee =
      readUserMaintenanceTDEE() ??
      (typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000);
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
      {/* Compact 5-tile selector (Daniel mockup goals-compact.png 2026-06-01):
          5 EQUAL tiles in one row (grid-cols-5), each centered icon + short
          label; selected = volt border + volt tint (ob-row-selected) + volt
          glow + a mono "PICKED" caption. The per-goal sub-copy (opt.subKey)
          no longer renders inside a tile (no room) but stays in OPTIONS for the
          aria-label + the program-change-confirm pendingSub. Behavior, OPTIONS,
          pick(), gating + every data-testid unchanged — layout/styling only. */}
      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map((opt) => {
          const selected = activeGoal === opt.id;
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
              style={
                selected
                  ? { boxShadow: '0 0 16px -4px color-mix(in oklab, var(--brick) 60%, transparent)' }
                  : { background: 'var(--surface-2)' }
              }
              className={`pulse-card-tight flex flex-col items-center justify-center gap-1.5 px-1.5 py-3 min-h-[76px] text-center text-ink border ${
                selected ? 'ob-row-selected' : 'border-line'
              } ${
                disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              <opt.Icon
                className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="block font-semibold text-[11px] leading-tight">
                {title}
                {selected && opt.id === 'auto' && t('obiectiv.activeSuffix')}
              </span>
              {selected && (
                <span
                  className="font-mono text-[9px] font-bold tracking-wider uppercase text-brick"
                  data-testid={`obiectiv-ales-${opt.id}`}
                >
                  {t('obiectiv.alesBadge')}
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
