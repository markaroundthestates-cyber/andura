// SET RATING BUTTONS - Workout "feel" card (Pulse reskin)
// Phase 4 task_12 §A extract din Workout.tsx rating buttons (~lines 213-237
// prior). Pure presentational - 3 buttons RO (Usor / Potrivit / Greu) cu
// data-rating attribute preserved.
//
// Stateless: parent Workout.tsx owns handleLogSet pipeline (logSet store
// action + getPRDelta wire + markPRHit + state machine transition la rest/
// transition/post-rpe). onRate callback dispatches rating la parent.
//
// data-testid + data-rating preserved verbatim pentru Workout.test.tsx
// baseline (data-rating usor/potrivit/greu + accessible name Easy/Just
// right/Hard via /^Easy$/i regex). The reskin swaps ONLY the visual shell;
// the onRate(rating) contract + accessible names are untouched.
//
// PULSE RESKIN (Andura Pulse arc 2026-05-29, mockup interfata-noua/
// screens-workout.jsx:271-285 "feel" card): the flat traffic-light row
// becomes the mockup's big-button feel card — a "HOW DID IT FEEL?" eyebrow
// over three large token-tinted buttons (Easy=--volt, Right=--aqua,
// Hard=--ember). Each button presses (active:scale) + lights its accent on
// touch. Single tap calibrates the next set (the coach engine reads the
// rating). Token-only styling (var(--volt|--aqua|--ember)); no raw hex.
// The colored dot stays as a small aria-hidden status mark above the label.

import type { CSSProperties, JSX } from 'react';
import { Kicker } from '../pulse/Kicker';
import { t } from '../../../i18n/index.js';

type SetRating = 'usor' | 'potrivit' | 'greu';

interface SetRatingButtonsProps {
  onRate: (rating: SetRating) => void;
}

interface RatingMeta {
  rating: SetRating;
  accent: string; // CSS var token — volt (easy) / aqua (right) / ember (hard) — dot + glow (decorative)
  textAccent: string; // AA-safe ink token for the LABEL text (bright accents <2:1 on light --paper)
  labelKey: string;
}

// Labels resolved at render time via t() so the locale flip surfaces EN
// copy under default + RO opt-in. Rating IDs stay the canonical engine
// keys (usor/potrivit/greu) consumed by the workoutStore + history. Accent
// tokens map the mockup's feel-card colors: Easy=volt, Right=aqua, Hard=ember
// (dot + glow). The LABEL text uses the AA-safe ink-path tokens (--brick /
// --aqua-ink / --ember-ink) which resolve >=4.5:1 on BOTH light + dark.
const RATING_META: readonly RatingMeta[] = [
  { rating: 'usor', accent: 'var(--volt)', textAccent: 'var(--brick)', labelKey: 'setRating.options.usor' },
  { rating: 'potrivit', accent: 'var(--aqua)', textAccent: 'var(--aqua-ink)', labelKey: 'setRating.options.potrivit' },
  { rating: 'greu', accent: 'var(--ember)', textAccent: 'var(--ember-ink)', labelKey: 'setRating.options.greu' },
];

export function SetRatingButtons({ onRate }: SetRatingButtonsProps): JSX.Element {
  return (
    <div
      className="pulse-card pulse-shine animate-fade-in-up p-4 mb-2"
      data-testid="setrating-feel-card"
    >
      <div className="text-center mb-3">
        <Kicker>{t('setRating.prompt')}</Kicker>
      </div>
      {/* No role="list": children are <button>s (not valid role="listitem"),
          which makes a screen reader announce an empty list. The Kicker
          heading labels the group (parity §6-M3 EnergyScreens revert). */}
      <div className="flex gap-2.5">
        {RATING_META.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => onRate(opt.rating)}
            data-rating={opt.rating}
            className="feel-btn flex-1 flex flex-col items-center gap-1.5 py-4 bg-paper border rounded-2xl text-ink transition-transform active:scale-[.94] min-h-[44px]"
            style={{ '--feel-accent': opt.accent, borderColor: 'var(--line)' } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: opt.accent }}
            />
            <span className="font-display font-bold text-base" style={{ color: opt.textAccent }}>
              {t(opt.labelKey)}
            </span>
          </button>
        ))}
      </div>
      <style>{`.feel-btn:active{border-color:var(--feel-accent);box-shadow:0 0 22px -6px var(--feel-accent);}`}</style>
    </div>
  );
}
