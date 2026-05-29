// ══ ONBOARDING — Big 6 Hard Typing 8-Step React Port ═════════════════════
// Phase 5 task_14 — onboarding flow MVP cu Big 6 hard typing (varsta + sex
// + obiectiv + frecventa + experienta + greutate + inaltime + summary).
//
// Pulse arc reskin (2026-05-29, GROUP A / A3) — the 8 step bodies follow
// Daniel's Pulse mockup (interfata-noua/screens-entry.jsx OnboardingScreen
// ~117-262): a per-step aqua Kicker eyebrow, big-number inputs for age/kg/cm
// (huge centered figure + unit + helper), a 2-tile sex picker, enriched choice
// rows for goal/frequency/experience (accent-tinted selected state + check
// affordance), and a summary review card. The brain is preserved verbatim:
// useOnboardingStore setField/finalize/validateOnboardingField, the per-step
// validation gate + Gigel-friendly toast, the finalize()+completed guard, the
// weight-timeline seed (seedFromProfileIfEmpty), the `onboarding-step-N` +
// per-control testids, and the round-dot progress (tests assert progress-dot-N
// + data-active — kept, NOT swapped for the mockup's bar). The mockup's English
// goal IDs map to the REAL RO store vocab (auto/forta/masa/slabire/mentenanta);
// frequency stays the real 2-5 union (the mockup's 2-6 stepper exceeds the
// store type). Token-only styling, no raw hex.

import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Dumbbell,
  Flame,
  TrendingDown,
  ShieldCheck,
  Check,
  User,
  Calendar,
  Target,
  Activity,
  Award,
  Scale,
  Ruler,
} from 'lucide-react';
import { useOnboardingStore, validateOnboardingField } from '../../stores/onboardingStore';
import type { OnboardingData, Frequency, Experience } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { Kicker } from '../../components/pulse/Kicker';
import { toast } from '../../lib/toast';
import { t } from '../../../i18n/index.js';

/** Local ISO YYYY-MM-DD (date-only) — mirror LogWeight.todayIso (date-tz local). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const TOTAL_STEPS = 8;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function Onboarding(): JSX.Element {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const stepNum = Math.max(1, Math.min(TOTAL_STEPS, parseInt(step ?? '1', 10))) as Step;
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);
  const finalize = useOnboardingStore((s) => s.finalize);

  const isLast = stepNum === TOTAL_STEPS;

  // §30-C1 Big 6 bounds gate — keystroke commits allowed (UX: user types
  // "1" → "16" → "32" without blocking each digit); validation gate fires
  // pe Continua attempt + surfaces Gigel-friendly toast. Defense-in-depth:
  // onboardingStore.setField rejects silently dacă final value out-of-range
  // (paste "999" la weight: store discards, UI shows toast on Continua).
  //
  // U-02 (CRIT) — block click-through gol: fiecare pas cere selectie/valoare
  // inainte de Continua (sex/goal/frecventa/experienta null → blocat). Fara
  // asta Gigel trecea 6 pasi fara input → finalize cu Big 6 null. finalize
  // are guard propriu (store) ca safety net defense-in-depth.
  // Resolve the store's semantic validation outcome (messageKey + params) to
  // localized copy at the React boundary via t() — the store emits keys, never
  // Romanian prose (i18n leak fix audit 09 store-evading).
  function resolveFieldCheck(
    check: ReturnType<typeof validateOnboardingField>,
  ): { ok: true } | { ok: false; reason: string } {
    if (check.ok) return { ok: true };
    return { ok: false, reason: t(check.messageKey, check.params) };
  }

  function validateCurrentStep(): { ok: true } | { ok: false; reason: string } {
    if (stepNum === 1) {
      if (data.age === null) return { ok: false, reason: t('onboarding.toast.completeAge') };
      return resolveFieldCheck(validateOnboardingField('age', data.age));
    }
    if (stepNum === 2 && data.sex === null) return { ok: false, reason: t('onboarding.toast.completeOption') };
    if (stepNum === 3 && data.goal === null) return { ok: false, reason: t('onboarding.toast.completeGoal') };
    if (stepNum === 4 && data.frequency === null) return { ok: false, reason: t('onboarding.toast.completeFrequency') };
    if (stepNum === 5 && data.experience === null) return { ok: false, reason: t('onboarding.toast.completeLevel') };
    if (stepNum === 6) {
      if (data.weight === null) return { ok: false, reason: t('onboarding.toast.completeWeight') };
      return resolveFieldCheck(validateOnboardingField('weight', data.weight));
    }
    if (stepNum === 7) {
      if (data.height === null) return { ok: false, reason: t('onboarding.toast.completeHeight') };
      return resolveFieldCheck(validateOnboardingField('height', data.height));
    }
    return { ok: true };
  }

  function next(): void {
    const check = validateCurrentStep();
    if (!check.ok) {
      toast.show({ message: check.reason, variant: 'warning' });
      return;
    }
    if (isLast) {
      // U-02 (CRIT) — navigate DOAR daca finalize a reusit. finalize respinge
      // daca vreun Big 6 e null/out-of-range (stale state sau acces direct
      // /onboarding/7). Fara verificare, user ar ajunge in app ne-onboarded.
      finalize();
      if (useOnboardingStore.getState().completed) {
        // BUG #5 — seed timeline-ul de greutate din greutatea de onboarding cand
        // e gol, ca "Greutate (7 zile)" sa porneasca de la greutatea reala a
        // user-ului (NU disconnect intre profil si timeline). Idempotent: NU
        // suprascrie loguri reale daca user-ul a cantarit deja.
        const w = useOnboardingStore.getState().data.weight;
        if (w !== null) {
          useProgresStore.getState().seedFromProfileIfEmpty(w, todayIso());
        }
        navigate('/app/antrenor');
      } else {
        toast.show({ message: t('onboarding.toast.completeAll'), variant: 'warning' });
      }
    } else {
      navigate(`/onboarding/${stepNum + 1}`);
    }
  }

  function back(): void {
    if (stepNum > 1) navigate(`/onboarding/${stepNum - 1}`);
  }

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col p-6"
      data-testid={`onboarding-step-${stepNum}`}
    >
      {/* MED — round DOTS per mockup andura-clasic.html L489-498 (.progress-dot
          8px circle; current = brick + scale, done = brick, pending = line) +
          "N din TOTAL" counter at row end. Replaces prior thin-bar fill. */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              data-testid={`progress-dot-${i + 1}`}
              data-active={i + 1 <= stepNum ? 'true' : 'false'}
              className={`w-2 h-2 rounded-full ${
                i + 1 === stepNum
                  ? 'bg-ink scale-150'
                  : i + 1 < stepNum
                    ? 'bg-brick'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-ink3 font-medium">
          {t('onboarding.progress', { current: stepNum, total: TOTAL_STEPS })}
        </span>
      </div>

      {/* Pulse Kicker eyebrow — aqua mono "PASUL N" leads the per-step stagger
          so the eye lands on it first before the heading (mockup OnboardingScreen
          <Kicker color="var(--aqua)">STEP N</Kicker>). Reuses the existing
          stepKicker key (i18n parity). */}
      <div className="mb-1 animate-fade-in-up delay-0">
        <Kicker color="var(--aqua)">{t('onboarding.stepKicker', { n: stepNum })}</Kicker>
      </div>

      {/* Wave A5 — each step re-mounts under a key so the fade-in-up replays
          per navigation. Wrapping the active step lets the fade carry the
          whole "title + helper + options" block as a unit (cleaner than
          per-element animation that fights the staggered children inside). */}
      <div key={`onb-step-${stepNum}`} className="animate-fade-in-up delay-75">
        {stepNum === 1 && <Step1 value={data.age} onChange={(v) => setField('age', v)} />}
        {stepNum === 2 && <Step2 value={data.sex} onChange={(v) => setField('sex', v)} />}
        {stepNum === 3 && <Step3 value={data.goal} onChange={(v) => setField('goal', v)} />}
        {stepNum === 4 && <Step4 value={data.frequency} onChange={(v) => setField('frequency', v)} />}
        {stepNum === 5 && <Step5 value={data.experience} onChange={(v) => setField('experience', v)} />}
        {stepNum === 6 && <Step6 value={data.weight} onChange={(v) => setField('weight', v)} />}
        {stepNum === 7 && <Step7Height value={data.height} onChange={(v) => setField('height', v)} />}
        {stepNum === 8 && <Step8Summary data={data} />}
      </div>

      <div className="flex-1" />

      <div className="flex gap-3 mt-6">
        {stepNum > 1 && (
          <button
            type="button"
            onClick={back}
            data-testid="onb-back"
            className="btn-secondary-lift px-5 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
          >
            {t('onboarding.backCta')}
          </button>
        )}
        <button
          type="button"
          onClick={next}
          data-testid="onb-next"
          className={`btn-primary-lift btn-grad press-feedback flex-1 px-5 py-3 text-base font-semibold${isLast ? ' option-selected-ring' : ''}`}
        >
          {isLast ? t('onboarding.finishCta') : t('onboarding.continueCta')}
        </button>
      </div>
    </section>
  );
}

interface NumericStepProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

interface OptionStepProps<T extends string> {
  value: T | null;
  onChange: (v: T) => void;
}

/**
 * Pulse big-number field (mockup BigNumberInput ~205-218): a huge centered
 * figure on a volt-accent underline + a unit beside it + a helper line, with
 * the error message replacing the helper when out-of-range. A thin presentation
 * wrapper — all the brain (NaN guard, store commit, bounds, aria) is passed in
 * by the calling step so age/kg/cm keep their exact testids + validation.
 */
interface BigNumberFieldProps extends NumericStepProps {
  unit: string;
  helper: string;
  error: string | null;
  inputId: string;
  errorId: string;
  testId: string;
  ariaLabel: string;
  placeholder: string;
  min: number;
  max: number;
  step?: string;
  inputMode: 'numeric' | 'decimal';
  enterKeyHint: 'next' | 'done';
}

function BigNumberField({
  value,
  onChange,
  unit,
  helper,
  error,
  inputId,
  errorId,
  testId,
  ariaLabel,
  placeholder,
  min,
  max,
  step,
  inputMode,
  enterKeyHint,
}: BigNumberFieldProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <div className="flex items-baseline gap-2.5">
        <input
          id={inputId}
          type="number"
          value={value ?? ''}
          // MED-A-3 fix CODE-REVIEW chat3: paste of non-numeric ("abc") yields
          // truthy value + Number("abc")=NaN → NaN propagates to store. Guard
          // with Number.isFinite before commit.
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return onChange(null);
            const n = Number(v);
            onChange(Number.isFinite(n) ? n : null);
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          inputMode={inputMode}
          autoComplete="off"
          enterKeyHint={enterKeyHint}
          aria-label={ariaLabel}
          data-testid={testId}
          className="onb-bignum font-mono w-[150px] text-center bg-transparent border-0 border-b-2 border-[color:var(--volt)] text-ink text-[58px] font-bold leading-none outline-none pb-1 transition-colors"
        />
        <span className="font-display text-[22px] font-semibold text-ink2">{unit}</span>
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          data-testid={`${testId.replace('-input', '')}-error`}
          className="text-sm text-danger text-center"
        >
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink3 text-center">{helper}</p>
      )}
      <style>{`.onb-bignum::-webkit-inner-spin-button,.onb-bignum::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}`}</style>
    </div>
  );
}

function Step1({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 — surface range validation pentru screen reader. Show
  // doar daca value e ne-null + out-of-range (NU initial empty). WCAG SC
  // 3.3.1 + 3.3.3.
  const error = value !== null && (value < 18 || value > 99)
    ? t('onboarding.steps.1.error')
    : null;
  return (
    <>
      <h1 id="onb-step1-heading" className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.1.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.1.desc')}</p>
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.1.unit')}
        helper={t('onboarding.steps.1.helper')}
        error={error}
        inputId="onb-age"
        errorId="onb-age-error"
        testId="onb-age-input"
        ariaLabel={t('onboarding.steps.1.ariaLabel')}
        placeholder={t('onboarding.steps.1.placeholder')}
        min={18}
        max={99}
        inputMode="numeric"
        enterKeyHint="next"
      />
    </>
  );
}

function Step2({ value, onChange }: OptionStepProps<'m' | 'f'>): JSX.Element {
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

// §B003/D-1b + §obiectiv-drop-longevitate 2026-05-28 — Goal labels 5 values
// (post-D080 longevitate dropped, semantic duplicate of mentenanta — ambele
// MAINTENANCE phase). Auto = default (engine alege singur). Slabire (was
// 'definire'). Mentenanta + Auto = NEW (D-1b).
type GoalKey = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta';

function goalLabel(key: GoalKey): string {
  return t(`onboarding.options.goal.${key}`);
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

function Step3({ value, onChange }: OptionStepProps<GoalKey>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.3.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.3.desc')}</p>
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

function Step4({ value, onChange }: OptionStepProps<Frequency>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.4.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.4.desc')}</p>
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
              aria-label={t('onboarding.steps.4.ariaLabelFmt', { n: v })}
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

function Step5({ value, onChange }: OptionStepProps<Experience>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.5.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.5.desc')}</p>
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

function Step6({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 — surface range validation pentru screen reader. Show
  // doar daca value e ne-null + out-of-range. WCAG SC 3.3.1 + 3.3.3.
  const error = value !== null && (value < 30 || value > 250)
    ? t('onboarding.steps.6.error')
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.6.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.6.desc')}</p>
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.6.unit')}
        helper={t('onboarding.steps.6.helper')}
        error={error}
        inputId="onb-weight"
        errorId="onb-weight-error"
        testId="onb-weight-input"
        ariaLabel={t('onboarding.steps.6.ariaLabel')}
        placeholder={t('onboarding.steps.6.placeholder')}
        min={30}
        max={250}
        step="0.1"
        inputMode="decimal"
        enterKeyHint="done"
      />
    </>
  );
}

// P-02 — Inaltime step (mockup andura-clasic.html #screen-onb-inaltime L599-
// 621 "Cat esti de inalt?"). Fitness metric necesar Mifflin-St Jeor BMR +
// US Navy BF% (NU medical). Bounds 120-230 cm match ONBOARDING_BOUNDS.height
// + SettingsProfile composition input. Modeled pe Step6 (weight) numeric
// pattern: keystroke commits allowed, range gate + aria-invalid on out-of-range.
function Step7Height({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 parity — surface range validation pentru screen reader.
  // Show doar daca value e ne-null + out-of-range. WCAG SC 3.3.1 + 3.3.3.
  const error = value !== null && (value < 120 || value > 230)
    ? t('onboarding.steps.7.error')
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.7.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.7.desc')}</p>
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.7.unit')}
        helper={t('onboarding.steps.7.helper')}
        error={error}
        inputId="onb-height"
        errorId="onb-height-error"
        testId="onb-height-input"
        ariaLabel={t('onboarding.steps.7.ariaLabel')}
        placeholder={t('onboarding.steps.7.placeholder')}
        min={120}
        max={230}
        step="1"
        inputMode="numeric"
        enterKeyHint="next"
      />
    </>
  );
}

function Step8Summary({ data }: { data: OnboardingData }): JSX.Element {
  // Wave A5 polish (Daniel "Top Grade" 2026-05-28) — each summary row gets a
  // lucide icon (Calendar/User/Target/Activity/Award/Scale/Ruler) for visual
  // affordance + a clean two-column hierarchy (icon+label left, value right).
  // i18n DEEP (A1) — all field labels + values resolve via t(); locale switch
  // is live (no re-mount required) since t() is called at render time.
  const empty = t('onboarding.confirm.empty');
  const sexValue =
    data.sex === 'm' ? t('onboarding.confirm.values.sexM')
    : data.sex === 'f' ? t('onboarding.confirm.values.sexF')
    : empty;
  const goalValue = data.goal ? goalLabel(data.goal) : empty;
  const frequencyValue = data.frequency
    ? t('onboarding.confirm.values.frequencyShort', { n: data.frequency })
    : empty;
  const experienceValue = data.experience
    ? t(`onboarding.confirm.values.experience${data.experience.charAt(0).toUpperCase() + data.experience.slice(1)}`)
    : empty;
  const weightValue = data.weight
    ? t('onboarding.confirm.values.weightSuffix', { kg: data.weight })
    : empty;
  const heightValue = data.height
    ? t('onboarding.confirm.values.heightSuffix', { cm: data.height })
    : empty;
  const rows: Array<{ Icon: typeof Calendar; label: string; value: string | number }> = [
    { Icon: Calendar, label: t('onboarding.confirm.fields.age'), value: data.age ?? empty },
    { Icon: User, label: t('onboarding.confirm.fields.sex'), value: sexValue },
    { Icon: Target, label: t('onboarding.confirm.fields.goal'), value: goalValue },
    { Icon: Activity, label: t('onboarding.confirm.fields.frequency'), value: frequencyValue },
    { Icon: Award, label: t('onboarding.confirm.fields.experience'), value: experienceValue },
    { Icon: Scale, label: t('onboarding.confirm.fields.weight'), value: weightValue },
    { Icon: Ruler, label: t('onboarding.confirm.fields.height'), value: heightValue },
  ];
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.8.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.8.desc')}</p>
      <div
        className="surface-elevated bg-paper2 border border-line rounded-2xl overflow-hidden"
        data-testid="onb-summary"
      >
        {rows.map(({ Icon, label, value }, idx) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-4 py-3 text-sm animate-fade-in-up ${
              idx === 0 ? 'delay-150' : idx === 1 ? 'delay-225' : idx === 2 ? 'delay-300' : idx === 3 ? 'delay-375' : idx === 4 ? 'delay-450' : idx === 5 ? 'delay-525' : 'delay-600'
            } ${idx < rows.length - 1 ? 'border-b border-line' : ''}`}
          >
            <Icon className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-ink2">{label}</span>
            <span className="text-ink font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
