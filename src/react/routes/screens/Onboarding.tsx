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
  HeartPulse,
  Check,
} from 'lucide-react';
import { useOnboardingStore, validateOnboardingField } from '../../stores/onboardingStore';
import type { OnboardingData, Frequency, Experience } from '../../stores/onboardingStore';
import { toast } from '../../lib/toast';

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
      if (data.age === null) return { ok: false, reason: 'Completeaza varsta.' };
      return validateOnboardingField('age', data.age);
    }
    if (stepNum === 2 && data.sex === null) return { ok: false, reason: 'Alege o optiune.' };
    if (stepNum === 3 && data.goal === null) return { ok: false, reason: 'Alege un obiectiv.' };
    if (stepNum === 4 && data.frequency === null) return { ok: false, reason: 'Alege frecventa.' };
    if (stepNum === 5 && data.experience === null) return { ok: false, reason: 'Alege nivelul.' };
    if (stepNum === 6) {
      if (data.weight === null) return { ok: false, reason: 'Completeaza greutatea.' };
      return validateOnboardingField('weight', data.weight);
    }
    if (stepNum === 7) {
      if (data.height === null) return { ok: false, reason: 'Completeaza inaltimea.' };
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
        navigate('/app/antrenor');
      } else {
        toast.show({ message: 'Completeaza toti pasii inainte de a continua.', variant: 'warning' });
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
          {stepNum} din {TOTAL_STEPS}
        </span>
      </div>

      {/* MED — brick uppercase "Pasul N" kicker above the step heading per
          mockup L502 (color #c8412e, uppercase, tracking-wide). */}
      <p className="text-xs text-brick font-semibold uppercase tracking-wide mb-1">
        Pasul {stepNum}
      </p>

      {stepNum === 1 && <Step1 value={data.age} onChange={(v) => setField('age', v)} />}
      {stepNum === 2 && <Step2 value={data.sex} onChange={(v) => setField('sex', v)} />}
      {stepNum === 3 && <Step3 value={data.goal} onChange={(v) => setField('goal', v)} />}
      {stepNum === 4 && <Step4 value={data.frequency} onChange={(v) => setField('frequency', v)} />}
      {stepNum === 5 && <Step5 value={data.experience} onChange={(v) => setField('experience', v)} />}
      {stepNum === 6 && <Step6 value={data.weight} onChange={(v) => setField('weight', v)} />}
      {stepNum === 7 && <Step7Height value={data.height} onChange={(v) => setField('height', v)} />}
      {stepNum === 8 && <Step8Summary data={data} />}

      <div className="flex-1" />

      <div className="flex gap-3 mt-6">
        {stepNum > 1 && (
          <button
            type="button"
            onClick={back}
            data-testid="onb-back"
            className="px-5 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
          >
            Inapoi
          </button>
        )}
        <button
          type="button"
          onClick={next}
          data-testid="onb-next"
          className="flex-1 px-5 py-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
        >
          {isLast ? 'Gata' : 'Continua'}
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
    ? 'Varsta intre 18 si 99 ani.'
    : null;
  return (
    <>
      <h1 id="onb-step1-heading" className="text-2xl font-bold text-ink mb-2">Cati ani ai?</h1>
      <p className="text-sm text-ink2 mb-6">Ne ajuta sa adaptam intensitatea si recuperarea.</p>
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
        placeholder="ex. 32"
        min={18}
        max={99}
        required
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'onb-age-error' : undefined}
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        aria-label="Varsta in ani"
        data-testid="onb-age-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono"
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
        <p className="mt-2 text-xs text-ink3 text-center">Intre 18 si 99 ani</p>
      )}
    </>
  );
}

function Step2({ value, onChange }: OptionStepProps<'m' | 'f'>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Sex biologic</h1>
      <p className="text-sm text-ink2 mb-6">Influenteaza estimarea TDEE si ratele de recuperare.</p>
      {/* §6-M3 revert per Karpathy SF — aria-pressed valid pattern toggle
          select state pe <button>. role=radiogroup necesita arrow-key
          handling + roving tabIndex (~200 LOC pentru 7 grupuri) = zero
          user benefit pre-Beta. Screen reader anunta "button, [label],
          pressed/not pressed" perfect valid. */}
      <div className="flex flex-col gap-3">
        {(['m', 'f'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            data-testid={`onb-sex-${v}`}
            aria-pressed={value === v}
            className={`p-4 rounded-xl border text-left ${value === v ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
          >
            <span className="font-medium">{v === 'm' ? 'Barbat (M)' : 'Femeie (F)'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// §B003/D-1b audit fix — Goal labels 6 values per mockup andura-clasic.html
// L507-531. Auto = default (engine alege singur). Slabire (was 'definire'),
// Longevitate (was 'sanatate'). Mentenanta + Auto = NEW.
type GoalKey = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta' | 'longevitate';

const GOAL_LABELS: Record<GoalKey, string> = {
  auto: 'Auto',
  forta: 'Forta',
  masa: 'Masa musculara',
  slabire: 'Slabire',
  mentenanta: 'Mentenanta',
  longevitate: 'Longevitate / Sanatate',
};

// HIGH chat6 — enriched goal rows per mockup L507-531: lucide icon + grey
// descriptive subtitle pe fiecare optiune. Auto pre-recomandat (brick border
// + "recomandat" badge + check affordance) restored din mockup parity strip.
const GOAL_OPTIONS: Array<{
  key: GoalKey;
  Icon: typeof Sparkles;
  subtitle: string;
}> = [
  { key: 'auto', Icon: Sparkles, subtitle: 'Coach-ul alege singur, se adapteaza in timp' },
  { key: 'forta', Icon: Dumbbell, subtitle: 'Greutati mari, mai putine repetari' },
  { key: 'masa', Icon: Flame, subtitle: 'Cresti musculatura vizibil' },
  { key: 'slabire', Icon: TrendingDown, subtitle: 'Pierzi grasime, pastrezi muschi' },
  { key: 'mentenanta', Icon: ShieldCheck, subtitle: 'Pastrezi forma actuala' },
  { key: 'longevitate', Icon: HeartPulse, subtitle: 'Fit pe termen lung, fara efort extrem' },
];

function Step3({ value, onChange }: OptionStepProps<GoalKey>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Ce vrei sa obtii?</h1>
      <p className="text-sm text-ink2 mb-6">Alegi unul. Poti schimba mai tarziu.</p>
      <div className="flex flex-col gap-3">
        {GOAL_OPTIONS.map(({ key, Icon, subtitle }) => {
          const selected = value === key;
          // "Auto" recomandat: brick border cand neselectat inca (idle hint),
          // brick fill cand selectat (consistent cu restul optiunilor).
          const isAuto = key === 'auto';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              data-testid={`onb-goal-${key}`}
              aria-pressed={selected}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left ${
                selected
                  ? 'bg-brick text-paper border-brick'
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
                  {GOAL_LABELS[key]}
                  {isAuto && (
                    <span
                      className={`ml-2 text-xs font-semibold ${selected ? 'text-paper' : 'text-brick'}`}
                      data-testid="onb-goal-auto-badge"
                    >
                      recomandat
                    </span>
                  )}
                </span>
                <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                  {subtitle}
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
const FREQ_OPTIONS: Array<{ value: Frequency; label: string; subtitle: string }> = [
  { value: '2', label: '2 zile', subtitle: 'Minim, recuperare ampla' },
  { value: '3', label: '3 zile', subtitle: 'Incepem usor, recuperare ampla' },
  { value: '4', label: '4 zile', subtitle: 'Ritm echilibrat' },
  { value: '5', label: '5 zile', subtitle: 'Volum mare, atentie la recuperare' },
];

function Step4({ value, onChange }: OptionStepProps<Frequency>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Cat de des te antrenezi?</h1>
      <p className="text-sm text-ink2 mb-6">Zile pe saptamana in care poti sa te antrenezi.</p>
      {/* aria-label pe fiecare buton numeric pastrat (Screen readers anunta
          numeric value semantic "3 sesiuni pe saptamana" nu doar "3"). */}
      <div className="flex flex-col gap-3">
        {FREQ_OPTIONS.map(({ value: v, label, subtitle }) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-freq-${v}`}
              aria-pressed={selected}
              aria-label={`${v} sesiuni pe saptamana`}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left ${selected ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
            >
              <span
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold font-mono ${selected ? 'bg-paper text-brick' : 'bg-paper text-ink2'}`}
                aria-hidden="true"
              >
                {v}
              </span>
              <span className="flex-1">
                <span className="block font-medium">{label}</span>
                <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                  {subtitle}
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
const EXP_OPTIONS: Array<{ value: Experience; label: string; subtitle: string }> = [
  { value: 'incepator', label: 'Incepator', subtitle: 'Sub un an de antrenament constant' },
  { value: 'intermediar', label: 'Intermediar', subtitle: '1-3 ani, tehnica de baza solida' },
  { value: 'avansat', label: 'Avansat', subtitle: 'Peste 3 ani, antrenament structurat' },
];

function Step5({ value, onChange }: OptionStepProps<Experience>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Cata experienta ai?</h1>
      <p className="text-sm text-ink2 mb-6">Calibram volumul si progresia de start.</p>
      <div className="flex flex-col gap-3">
        {EXP_OPTIONS.map(({ value: v, label, subtitle }) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              data-testid={`onb-exp-${v}`}
              aria-pressed={selected}
              className={`p-4 rounded-xl border text-left ${selected ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
            >
              <span className="block font-medium">{label}</span>
              <span className={`block text-xs mt-0.5 ${selected ? 'text-paper' : 'text-ink3'}`}>
                {subtitle}
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
    ? 'Kg intre 30 si 250.'
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Cat cantaresti?</h1>
      <p className="text-sm text-ink2 mb-6">Calculam volum + tonaj real.</p>
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
        placeholder="ex. 78"
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
        aria-label="Greutate in kilograme"
        data-testid="onb-weight-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono"
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
        <p className="text-xs text-ink3 mt-2 text-center">Intre 30 si 250 kg</p>
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
    ? 'Inaltime intre 120 si 230 cm.'
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Cat esti de inalt?</h1>
      <p className="text-sm text-ink2 mb-6">Necesar pentru calculul caloriilor de baza (BMR).</p>
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
        placeholder="ex. 175"
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
        aria-label="Inaltime in centimetri"
        data-testid="onb-height-input"
        className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 font-mono"
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
        <p className="text-xs text-ink3 mt-2 text-center">Intre 120 si 230 cm</p>
      )}
    </>
  );
}

function Step8Summary({ data }: { data: OnboardingData }): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">Verifica datele</h1>
      <p className="text-sm text-ink2 mb-6">Poti reveni oricand sa schimbi.</p>
      <div className="bg-paper2 border border-line rounded-xl p-4 space-y-2" data-testid="onb-summary">
        <div className="flex justify-between text-sm"><span className="text-ink2">Varsta</span><span className="text-ink font-medium">{data.age ?? '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Sex</span><span className="text-ink font-medium">{data.sex === 'm' ? 'Barbat' : data.sex === 'f' ? 'Femeie' : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Obiectiv</span><span className="text-ink font-medium">{data.goal ? GOAL_LABELS[data.goal] : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Frecventa</span><span className="text-ink font-medium">{data.frequency ? `${data.frequency}/sapt` : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Experienta</span><span className="text-ink font-medium">{data.experience ? data.experience.charAt(0).toUpperCase() + data.experience.slice(1) : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Greutate</span><span className="text-ink font-medium">{data.weight ? `${data.weight} kg` : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Inaltime</span><span className="text-ink font-medium">{data.height ? `${data.height} cm` : '-'}</span></div>
      </div>
    </>
  );
}
