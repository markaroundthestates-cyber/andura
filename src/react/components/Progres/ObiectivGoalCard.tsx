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
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dumbbell, Flame, TrendingDown, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import { gotoPath } from '../../lib/navigation';

interface ObiectivOption {
  id: Goal;
  title: string;
  sub: string;
  Icon: LucideIcon;
}

// Mockup L864-868 verbatim labels + sub-copy + lucide icons. 5 obiective
// post-D080 longevitate drop (semantic duplicate cu mentenanta — ambele
// MAINTENANCE engine phase, identice template parameters). Persisted users
// cu goal='longevitate' migrated → 'mentenanta' via onboardingStore v4→v5.
const OPTIONS: readonly ObiectivOption[] = [
  { id: 'auto',        title: 'Auto',           sub: 'Coach-ul alege singur, se adapteaza in timp', Icon: Sparkles },
  { id: 'forta',       title: 'Forta',          sub: 'Greutati mari, mai putine repetari',           Icon: Dumbbell },
  { id: 'masa',        title: 'Masa musculara', sub: 'Cresti musculatura vizibil',                   Icon: Flame },
  { id: 'slabire',     title: 'Slabire',        sub: 'Pierzi grasime, pastrezi muschi',              Icon: TrendingDown },
  { id: 'mentenanta',  title: 'Mentenanta',     sub: 'Pastrezi forma actuala',                       Icon: ShieldCheck },
];

export function ObiectivGoalCard(): JSX.Element {
  const navigate = useNavigate();
  const goal = useOnboardingStore((s) => s.data.goal);

  // Default Auto cand goal nu e setat (mockup L864 data-program="auto" is-active).
  const activeGoal: Goal = goal ?? 'auto';

  function pick(g: Goal): void {
    if (g === activeGoal) return;
    const opt = OPTIONS.find((o) => o.id === g);
    navigate(gotoPath('program-change-confirm'), {
      state: {
        pendingGoal: g,
        pendingLabel: opt?.title ?? g,
        pendingSub: opt?.sub ?? '',
        // ProgramChangeConfirm intoarce la Progres dupa confirm/cancel (caller-aware).
        returnTo: 'progres',
      },
    });
  }

  return (
    <section
      className="mb-5"
      data-testid="obiectiv-goal-card"
      aria-label="Obiectiv antrenament"
    >
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
        Obiectiv
      </p>
      <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
        {OPTIONS.map((opt, i) => {
          const selected = activeGoal === opt.id;
          const isLast = i === OPTIONS.length - 1;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              data-testid={`obiectiv-row-${opt.id}`}
              data-program={opt.id}
              aria-pressed={selected}
              aria-label={`${opt.title} — ${opt.sub}`}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left ${
                isLast ? '' : 'border-b border-line'
              } ${selected ? 'bg-brick text-paper' : 'bg-paper2 text-ink'}`}
            >
              <opt.Icon
                className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-paper' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-sm leading-tight">
                  {opt.title}
                  {selected && opt.id === 'auto' && ' · activ'}
                </span>
                <span className={`block text-xs leading-tight mt-0.5 ${selected ? 'text-paper opacity-80' : 'text-ink3'}`}>
                  {opt.sub}
                </span>
              </span>
              {selected && (
                <span
                  className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-paper text-brick flex-shrink-0"
                  data-testid={`obiectiv-ales-${opt.id}`}
                >
                  Ales
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
