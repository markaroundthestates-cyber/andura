// ══ OBIECTIV SELECTOR — Antrenor Home 6-Row Programe Picker ══════════════
// F-antrenor-03 parity per MOCKUP-PARITY-chat3 §2.2 + §4 P4.
// Mockup verbatim source: 04-architecture/mockups/andura-clasic.html L861-870
// "Programe (6 obiective V1 LOCK — Auto + 5 specific. Auto = default.
//  Restructure post-Gigel-test 2026-05-11: 'Tonifiere' → 'Masa musculara'
//  (jargon → clar), added 'Mentenanta' (was missing for eutrophic stable),
//  Longevitate+Sanatate generala consolidate → 'Longevitate / Sanatate'."
//
// 6 obiective labels MATCH onboardingStore Goal type (D-1b migration LANDED):
//   auto / forta / masa / slabire / mentenanta / longevitate
//
// Pattern: aria-pressed toggle pe <button> (§6-M3 revert decision per commit
// 88b4b64c — role=radiogroup necesita arrow-key handling roving tabIndex
// pre-Beta inutil; aria-pressed pattern proven across Onboarding Step 2-5).
//
// Selectarea actualizeaza useOnboardingStore.data.goal direct (single source
// truth pentru Big 6; SettingsProfile foloseste acelasi store). Schimbarea
// e immediate (NO confirm modal V1 — mockup pickProgram() does the same
// instant `is-active` toggle; F-confirm-program-change e separate scope).
//
// Tap target >=44px (p-3 + min-h-[44px] — Maria 65 WCAG 2.5.5).

import type { JSX } from 'react';
import { Sparkles, Dumbbell, Flame, TrendingDown, ShieldCheck, HeartPulse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';

interface ObiectivOption {
  id: Goal;
  title: string;
  sub: string;
  Icon: LucideIcon;
}

// Mockup L864-869 verbatim labels + sub-copy + lucide icons.
const OPTIONS: readonly ObiectivOption[] = [
  { id: 'auto',        title: 'Auto',                   sub: 'Coach-ul alege singur, se adapteaza in timp', Icon: Sparkles },
  { id: 'forta',       title: 'Forta',                  sub: 'Greutati mari, mai putine repetari',           Icon: Dumbbell },
  { id: 'masa',        title: 'Masa musculara',         sub: 'Cresti musculatura vizibil',                   Icon: Flame },
  { id: 'slabire',     title: 'Slabire',                sub: 'Pierzi grasime, pastrezi muschi',              Icon: TrendingDown },
  { id: 'mentenanta',  title: 'Mentenanta',             sub: 'Pastrezi forma actuala',                       Icon: ShieldCheck },
  { id: 'longevitate', title: 'Longevitate / Sanatate', sub: 'Fit pe termen lung, fara efort extrem',        Icon: HeartPulse },
];

export function ObiectivSelector(): JSX.Element {
  const goal = useOnboardingStore((s) => s.data.goal);
  const setField = useOnboardingStore((s) => s.setField);

  // Default Auto cand goal nu e setat (mockup L864 data-program="auto" is-active).
  const activeGoal: Goal = goal ?? 'auto';

  function pick(g: Goal): void {
    setField('goal', g);
  }

  return (
    <section
      className="mb-4"
      data-testid="obiectiv-selector"
      aria-label="Obiectiv antrenament"
    >
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
        Obiectiv
      </p>
      <div className="bg-paper2 border border-line rounded-xl overflow-hidden">
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
