// ══ ONBOARDING — Big 6 Hard Typing 7-Step React Port ═════════════════════
// Phase 5 task_14 — onboarding flow MVP cu Big 6 hard typing (varsta + sex
// + obiectiv + frecventa + experienta + greutate). 7 steps mockup wv2
// reference. Saves la onboardingStore.

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
  function validateCurrentStep(): { ok: true } | { ok: false; reason: string } {
    if (stepNum === 1) {
      if (data.age === null) return { ok: false, reason: t('onboarding.toast.completeAge') };
      return validateOnboardingField('age', data.age);
    }
    if (stepNum === 2 && data.sex === null) return { ok: false, reason: t('onboarding.toast.completeOption') };
    if (stepNum === 3 && data.goal === null) return { ok: false, reason: t('onboarding.toast.completeGoal') };
    if (stepNum === 4 && data.frequency === null) return { ok: false, reason: t('onboarding.toast.completeFrequency') };
    if (stepNum === 5 && data.experience === null) return { ok: false, reason: t('onboarding.toast.completeLevel') };
    if (stepNum === 6) {
      if (data.weight === null) return { ok: false, reason: t('onboarding.toast.completeWeight') };
      return validateOnboardingField('weight', data.weight);
    }
    if (stepNum === 7) {
      if (data.height === null) return { ok: false, reason: t('onboarding.toast.completeHeight') };
      return validateOnboardingField('height', data.height);
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

      {/* MED — brick uppercase "Pasul N" kicker above the step heading per
          mockup L502 (color #c8412e, uppercase, tracking-wide). Wave A5 polish
          (Daniel "Top Grade" 2026-05-28) — the kicker leads the per-step
          stagger so the eye lands on it first before the heading + question. */}
      <p className="text-xs text-brick font-semibold uppercase tracking-wide mb-1 animate-fade-in-up delay-0">
        {t('onboarding.stepKicker', { n: stepNum })}
      </p>

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
          className={`btn-primary-lift press-feedback flex-1 px-5 py-3 bg-brick text-paper rounded-[14px] text-base font-semibold${isLast ? ' option-selected-ring' : ''}`}
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
      <input
        type="number"
        value={value ?? ''}
        // MED-A-3 fix CODE-REVIEW chat3: paste of non-numeric ("abc") yields
        // truthy `e.target.value` + `Number("abc")=NaN` → NaN propagates to
        // store, corrupting Big 6 + downstream engine math silently. Guard
        // with Number.isFinite check before commit.
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return onChange(null);
          const n = Number(v);
          onChange(Number.isFinite(n) ? n : null);
        }}
        placeholder={t('onboarding.steps.1.placeholder')}
        min={18}
        max={99}
        required
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'onb-age-error' : undefined}
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        aria-label={t('onboarding.steps.1.ariaLabel')}
        data-testid="onb-age-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono transition-colors focus:border-brick"
      />
      {error ? (
        <p
          id="onb-age-error"
          role="alert"
          data-testid="onb-age-error"
          className="mt-2 text-sm text-danger text-center"
        >
          {error}
        </p>
      ) : (
        // MED — helper line per mockup L565 "Intre 16 si 99 ani".
        <p className="mt-2 text-xs text-ink3 text-center">{t('onboarding.steps.1.helper')}</p>
      )}
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
          pressed/not pressed" perfect valid. */}
      <div className="flex flex-col gap-3">
        {(['m', 'f'] as const).map((v, idx) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            data-testid={`onb-sex-${v}`}
            aria-pressed={value === v}
            className={`press-feedback animate-fade-in-up p-4 rounded-xl border text-left transition-colors ${idx === 0 ? 'delay-150' : 'delay-225'} ${value === v ? 'bg-brick text-paper border-brick option-selected-ring' : 'bg-paper2 border-lineStrong text-ink'}`}
          >
            <span className="font-medium">{v === 'm' ? t('onboarding.options.sex.m') : t('onboarding.options.sex.f')}</span>
          </button>
        ))}
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
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                selected
                  ? 'bg-brick text-paper border-brick option-selected-ring'
                  : isAuto
                    ? 'bg-paper2 border-2 border-brick text-ink'
                    : 'bg-paper2 border-lineStrong text-ink'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-paper' : isAuto ? 'text-brick' : 'text-ink2'}`}
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block font-medium">
                  {goalLabel(key)}
                  {isAuto && (
                    <span
                      className={`ml-2 text-xs font-semibold ${selected ? 'text-paper' : 'text-brick'}`}
                      data-testid="onb-goal-auto-badge"
                    >
                      {t('onboarding.options.goal.autoBadge')}
                    </span>
                  )}
                </span>
                <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                  {t(subtitleKey)}
                </span>
              </span>
              {selected && (
                <Check
                  className="w-5 h-5 flex-shrink-0 text-paper"
                  aria-hidden="true"
                />
              )}
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
              className={`press-feedback animate-fade-in-up ${delayClass} flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${selected ? 'bg-brick text-paper border-brick option-selected-ring' : 'bg-paper2 border-lineStrong text-ink'}`}
            >
              <span
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold font-mono ${selected ? 'bg-paper text-brick' : 'bg-paper text-ink2'}`}
                aria-hidden="true"
              >
                {v}
              </span>
              <span className="flex-1">
                <span className="block font-medium">{t(labelKey)}</span>
                <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                  {t(subtitleKey)}
                </span>
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
              className={`press-feedback animate-fade-in-up ${delayClass} p-4 rounded-xl border text-left transition-colors ${selected ? 'bg-brick text-paper border-brick option-selected-ring' : 'bg-paper2 border-lineStrong text-ink'}`}
            >
              <span className="block font-medium">{t(labelKey)}</span>
              <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                {t(subtitleKey)}
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
      <input
        type="number"
        value={value ?? ''}
        // MED-A-3 fix CODE-REVIEW chat3: see Step1 commentary — NaN guard
        // before commit la store. Number.isFinite(NaN) === false → null.
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return onChange(null);
          const n = Number(v);
          onChange(Number.isFinite(n) ? n : null);
        }}
        placeholder={t('onboarding.steps.6.placeholder')}
        step="0.1"
        min={30}
        max={250}
        required
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'onb-weight-error' : undefined}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        aria-label={t('onboarding.steps.6.ariaLabel')}
        data-testid="onb-weight-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono transition-colors focus:border-brick"
      />
      {error ? (
        <p
          id="onb-weight-error"
          role="alert"
          data-testid="onb-weight-error"
          className="mt-2 text-sm text-danger text-center"
        >
          {error}
        </p>
      ) : (
        // MED — helper line per mockup L647 pattern ("Intre N si N kg").
        <p className="text-xs text-ink3 mt-2 text-center">{t('onboarding.steps.6.helper')}</p>
      )}
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
      <input
        type="number"
        value={value ?? ''}
        // MED-A-3 fix parity (see Step1/Step6) — NaN guard before commit la
        // store. Number.isFinite(NaN) === false → null.
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return onChange(null);
          const n = Number(v);
          onChange(Number.isFinite(n) ? n : null);
        }}
        placeholder={t('onboarding.steps.7.placeholder')}
        step="1"
        min={120}
        max={230}
        required
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'onb-height-error' : undefined}
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        aria-label={t('onboarding.steps.7.ariaLabel')}
        data-testid="onb-height-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono transition-colors focus:border-brick"
      />
      {error ? (
        <p
          id="onb-height-error"
          role="alert"
          data-testid="onb-height-error"
          className="mt-2 text-sm text-danger text-center"
        >
          {error}
        </p>
      ) : (
        // MED — helper line per mockup L620 pattern ("Intre N si N cm").
        <p className="text-xs text-ink3 mt-2 text-center">{t('onboarding.steps.7.helper')}</p>
      )}
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
        className="surface-elevated bg-paper2 border border-line rounded-xl overflow-hidden"
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
