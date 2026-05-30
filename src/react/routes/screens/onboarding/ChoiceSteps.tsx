// ══ ONBOARDING — choice steps (sex / training / goal / freq / experience) ══
// Extracted from Onboarding.tsx (hygiene split, zero behavior change). Pure
// presentational steps — value + onChange come from the parent Onboarding.tsx
// which still owns every hook/store call/handler.

import type { JSX } from 'react';
import {
  Sparkles,
  Dumbbell,
  Flame,
  TrendingDown,
  ShieldCheck,
  Check,
  User,
  Dumbbell as DumbbellIcon,
  HeartPulse,
  Layers,
} from 'lucide-react';
import type { Frequency, Experience, TrainingType } from '../../../stores/onboardingStore';
import { type OptionStepProps, type GoalKey, goalLabel } from './shared';
import { t } from '../../../../i18n/index.js';

export function Step2({ value, onChange }: OptionStepProps<'m' | 'f'>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.2.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.2.desc')}</p>
      {/* §6-M3 revert per Karpathy SF — aria-pressed valid pattern toggle
          select state pe <button>. role=radiogroup necesita arrow-key
          handling + roving tabIndex (~200 LOC pentru 7 grupuri) = zero
          user benefit pre-Beta. Screen reader anunta "button, [label],
          pressed/not pressed" perfect valid.
          Pulse reskin — 2-tile grid (mockup .ob-tile): centered User glyph +
          label, accent-tinted when selected. */}
      <div className="grid grid-cols-2 gap-3">
        {(['m', 'f'] as const).map((v, idx) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-sex-${v}`}
              aria-pressed={selected}
              className={`press-feedback animate-fade-in-up relative flex flex-col items-center justify-center gap-2 py-7 px-3 rounded-2xl border text-ink transition-colors ${idx === 0 ? 'delay-150' : 'delay-225'} ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
            >
              {/* mockup .ob-check.on — circular brick check badge, corner-pinned
                  on the tile (the row variant trails inline). */}
              <span
                className={`ob-check absolute top-3 right-3 ${selected ? 'ob-check-on' : ''}`}
                aria-hidden="true"
              >
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
              <User
                className={`w-8 h-8 ${selected ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="font-display font-semibold">{v === 'm' ? t('onboarding.options.sex.m') : t('onboarding.options.sex.f')}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// Daniel spec 2026-05-30 — training-type step (Step 3). Gates gym vs aerobic
// vs both. Enriched rows mirror the goal/frequency pattern (icon + subtitle +
// check affordance). Default 'gym' pre-selected (EMPTY seed) so a user who just
// taps Continua keeps the original gym experience.
const TRAINING_TYPE_OPTIONS: ReadonlyArray<{
  value: TrainingType;
  Icon: typeof Sparkles;
  labelKey: string;
  subtitleKey: string;
}> = [
  { value: 'gym', Icon: DumbbellIcon, labelKey: 'onboarding.options.trainingType.gym', subtitleKey: 'onboarding.options.trainingType.gymSubtitle' },
  { value: 'aerobic', Icon: HeartPulse, labelKey: 'onboarding.options.trainingType.aerobic', subtitleKey: 'onboarding.options.trainingType.aerobicSubtitle' },
  { value: 'both', Icon: Layers, labelKey: 'onboarding.options.trainingType.both', subtitleKey: 'onboarding.options.trainingType.bothSubtitle' },
];

export function StepTrainingType({ value, onChange }: OptionStepProps<TrainingType>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.3.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.3.desc')}</p>
      <div className="flex flex-col gap-3">
        {TRAINING_TYPE_OPTIONS.map(({ value: v, Icon, labelKey, subtitleKey }, idx) => {
          const selected = value === v;
          const delayClass = ['delay-150', 'delay-225', 'delay-300'][idx] ?? 'delay-300';
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-training-${v}`}
              aria-pressed={selected}
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-2xl border text-ink text-left transition-colors ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block font-medium">{t(labelKey)}</span>
                <span className="block text-xs mt-0.5 text-ink3">{t(subtitleKey)}</span>
              </span>
              <span
                className={`ob-check ${selected ? 'ob-check-on' : ''}`}
                aria-hidden="true"
              >
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// HIGH chat6 — enriched goal rows per mockup L507-531: lucide icon + grey
// descriptive subtitle pe fiecare optiune. Auto pre-recomandat (brick border
// + "recomandat" badge + check affordance) restored din mockup parity strip.
// Subtitle is resolved via t() at render time (locale switching) instead of
// being baked into a static module-level constant.
const GOAL_OPTIONS: Array<{
  key: GoalKey;
  Icon: typeof Sparkles;
  subtitleKey: string;
}> = [
  { key: 'auto', Icon: Sparkles, subtitleKey: 'onboarding.options.goal.autoSubtitle' },
  { key: 'forta', Icon: Dumbbell, subtitleKey: 'onboarding.options.goal.fortaSubtitle' },
  { key: 'masa', Icon: Flame, subtitleKey: 'onboarding.options.goal.masaSubtitle' },
  { key: 'slabire', Icon: TrendingDown, subtitleKey: 'onboarding.options.goal.slabireSubtitle' },
  { key: 'mentenanta', Icon: ShieldCheck, subtitleKey: 'onboarding.options.goal.mentenantaSubtitle' },
];

export function Step3({ value, onChange }: OptionStepProps<GoalKey>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.4.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.4.desc')}</p>
      <div className="flex flex-col gap-3">
        {GOAL_OPTIONS.map(({ key, Icon, subtitleKey }, idx) => {
          const selected = value === key;
          // "Auto" recomandat: brick border cand neselectat inca (idle hint),
          // brick fill cand selectat (consistent cu restul optiunilor).
          const isAuto = key === 'auto';
          // Stagger first 5 entries — max delay 525ms (~half a second total)
          // keeps the reveal feeling fluid without becoming a wait.
          const delayClass = ['delay-150', 'delay-225', 'delay-300', 'delay-375', 'delay-450'][idx] ?? 'delay-450';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              data-testid={`onb-goal-${key}`}
              aria-pressed={selected}
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-2xl border text-ink text-left transition-colors ${
                selected
                  ? 'ob-row-selected option-selected-ring'
                  : isAuto
                    ? 'bg-paper2 border-2 border-brick'
                    : 'bg-paper2 border-lineStrong'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${selected || isAuto ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block font-medium">
                  {goalLabel(key)}
                  {isAuto && (
                    <span
                      className="ml-2 text-xs font-semibold text-brick"
                      data-testid="onb-goal-auto-badge"
                    >
                      {t('onboarding.options.goal.autoBadge')}
                    </span>
                  )}
                </span>
                <span className="block text-xs mt-0.5 text-ink3">
                  {t(subtitleKey)}
                </span>
              </span>
              {/* mockup .ob-check.on — circular brick check badge (not a bare
                  icon on a solid fill). Reserve the slot so rows don't shift. */}
              <span
                className={`ob-check ${selected ? 'ob-check-on' : ''}`}
                aria-hidden="true"
              >
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// HIGH chat6 — enriched frequency rows per mockup L710-723: circular number
// bubble + label + grey subtitle (recuperare guidance). Option set 2/3/4/5
// preserved (testids + aria-labels invariant), converted din grid → vertical
// stack-row pattern matching mockup.
const FREQ_OPTIONS: ReadonlyArray<{ value: Frequency; labelKey: string; subtitleKey: string }> = [
  { value: '2', labelKey: 'onboarding.options.frequency.2', subtitleKey: 'onboarding.options.frequency.2Subtitle' },
  { value: '3', labelKey: 'onboarding.options.frequency.3', subtitleKey: 'onboarding.options.frequency.3Subtitle' },
  { value: '4', labelKey: 'onboarding.options.frequency.4', subtitleKey: 'onboarding.options.frequency.4Subtitle' },
  { value: '5', labelKey: 'onboarding.options.frequency.5', subtitleKey: 'onboarding.options.frequency.5Subtitle' },
];

export function Step4({ value, onChange }: OptionStepProps<Frequency>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.5.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.5.desc')}</p>
      {/* aria-label pe fiecare buton numeric pastrat (Screen readers anunta
          numeric value semantic "3 sesiuni pe saptamana" nu doar "3"). */}
      <div className="flex flex-col gap-3">
        {FREQ_OPTIONS.map(({ value: v, labelKey, subtitleKey }, idx) => {
          const selected = value === v;
          const delayClass = ['delay-150', 'delay-225', 'delay-300', 'delay-375'][idx] ?? 'delay-375';
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-freq-${v}`}
              aria-pressed={selected}
              aria-label={t('onboarding.steps.5.ariaLabelFmt', { n: v })}
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-2xl border text-ink text-left transition-colors ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
            >
              <span
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold font-mono bg-paper ${selected ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              >
                {v}
              </span>
              <span className="flex-1">
                <span className="block font-medium">{t(labelKey)}</span>
                <span className="block text-xs mt-0.5 text-ink3">
                  {t(subtitleKey)}
                </span>
              </span>
              {/* mockup .ob-check.on — circular brick check badge. Reserve the
                  slot so rows don't shift on select. */}
              <span
                className={`ob-check ${selected ? 'ob-check-on' : ''}`}
                aria-hidden="true"
              >
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// HIGH chat6 — enriched experience rows: label + grey descriptive subtitle
// matching goal/frequency enriched pattern (mockup stack-row convention).
const EXP_OPTIONS: ReadonlyArray<{ value: Experience; labelKey: string; subtitleKey: string }> = [
  { value: 'incepator', labelKey: 'onboarding.options.experience.incepator', subtitleKey: 'onboarding.options.experience.incepatorSubtitle' },
  { value: 'intermediar', labelKey: 'onboarding.options.experience.intermediar', subtitleKey: 'onboarding.options.experience.intermediarSubtitle' },
  { value: 'avansat', labelKey: 'onboarding.options.experience.avansat', subtitleKey: 'onboarding.options.experience.avansatSubtitle' },
];

export function Step5({ value, onChange }: OptionStepProps<Experience>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.6.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.6.desc')}</p>
      <div className="flex flex-col gap-3">
        {EXP_OPTIONS.map(({ value: v, labelKey, subtitleKey }, idx) => {
          const selected = value === v;
          const delayClass = ['delay-150', 'delay-225', 'delay-300'][idx] ?? 'delay-300';
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-exp-${v}`}
              aria-pressed={selected}
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-2xl border text-ink text-left transition-colors ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
            >
              <span className="flex-1">
                <span className="block font-medium">{t(labelKey)}</span>
                <span className="block text-xs mt-0.5 text-ink3">
                  {t(subtitleKey)}
                </span>
              </span>
              {/* mockup .ob-check.on — circular brick check badge. Reserve the
                  slot so rows don't shift on select. */}
              <span
                className={`ob-check ${selected ? 'ob-check-on' : ''}`}
                aria-hidden="true"
              >
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
