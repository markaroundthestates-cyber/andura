// ══ ONBOARDING — Big 6 Hard Typing 7-Step React Port ═════════════════════
// Phase 5 task_14 — onboarding flow MVP cu Big 6 hard typing (varsta + sex
// + obiectiv + frecventa + experienta + greutate). 7 steps mockup wv2
// reference. Saves la onboardingStore.

import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { OnboardingData } from '../../stores/onboardingStore';

const TOTAL_STEPS = 7;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function Onboarding(): JSX.Element {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const stepNum = Math.max(1, Math.min(TOTAL_STEPS, parseInt(step ?? '1', 10))) as Step;
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);
  const finalize = useOnboardingStore((s) => s.finalize);

  const isLast = stepNum === TOTAL_STEPS;

  function next(): void {
    if (isLast) {
      finalize();
      navigate('/app/antrenor');
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
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            data-testid={`progress-dot-${i + 1}`}
            data-active={i + 1 <= stepNum ? 'true' : 'false'}
            className={`flex-1 h-1 rounded-full ${i + 1 <= stepNum ? 'bg-brick' : 'bg-line'}`}
          />
        ))}
      </div>

      <p className="text-xs text-ink2 uppercase tracking-wide mb-2">
        Pasul {stepNum} din {TOTAL_STEPS}
      </p>

      {stepNum === 1 && <Step1 value={data.age} onChange={(v) => setField('age', v)} />}
      {stepNum === 2 && <Step2 value={data.sex} onChange={(v) => setField('sex', v)} />}
      {stepNum === 3 && <Step3 value={data.goal} onChange={(v) => setField('goal', v)} />}
      {stepNum === 4 && <Step4 value={data.frequency} onChange={(v) => setField('frequency', v)} />}
      {stepNum === 5 && <Step5 value={data.experience} onChange={(v) => setField('experience', v)} />}
      {stepNum === 6 && <Step6 value={data.weight} onChange={(v) => setField('weight', v)} />}
      {stepNum === 7 && <Step7 data={data} />}

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
          className="flex-1 px-5 py-3 bg-brick text-paper rounded-xl text-base font-semibold"
        >
          {isLast ? 'Gata' : 'Continua'}
        </button>
      </div>
    </section>
  );
}

interface NumericStepProps {
  value: number | null;
  onChange: (v: number) => void;
}

interface OptionStepProps<T extends string> {
  value: T | null;
  onChange: (v: T) => void;
}

function Step1({ value, onChange }: NumericStepProps): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-2">Ce varsta ai?</h1>
      <p className="text-sm text-ink2 mb-6">Ajustam programul pe varsta ta.</p>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="ex. 32"
        min={14}
        max={99}
        data-testid="onb-age-input"
        className="w-full p-4 border border-lineStrong rounded-2xl text-2xl font-semibold text-center bg-paper2 font-mono"
      />
    </>
  );
}

function Step2({ value, onChange }: OptionStepProps<'m' | 'f'>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-6">Cum te identifici?</h1>
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
            <span className="font-medium">{v === 'm' ? 'Barbat' : 'Femeie'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// §B003/D-1b audit fix — Goal labels 6 values per mockup andura-clasic.html
// L863-869. Auto = default (engine alege singur). Slabire (was 'definire'),
// Longevitate (was 'sanatate'). Mentenanta + Auto = NEW.
const GOAL_LABELS: Record<'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta' | 'longevitate', string> = {
  auto: 'Auto · Coach-ul alege',
  forta: 'Forta',
  masa: 'Masa musculara',
  slabire: 'Slabire',
  mentenanta: 'Mentenanta',
  longevitate: 'Longevitate / Sanatate',
};

function Step3({ value, onChange }: OptionStepProps<keyof typeof GOAL_LABELS>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-6">Ce vrei sa obtii?</h1>
      <div className="flex flex-col gap-3">
        {(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            data-testid={`onb-goal-${v}`}
            aria-pressed={value === v}
            className={`p-4 rounded-xl border text-left ${value === v ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
          >
            <span className="font-medium">{GOAL_LABELS[v]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Step4({ value, onChange }: OptionStepProps<'2' | '3' | '4' | '5'>): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-2">Cat de des te antrenezi?</h1>
      <p className="text-sm text-ink2 mb-6">Sesiuni pe saptamana.</p>
      <div className="grid grid-cols-2 gap-3">
        {(['2', '3', '4', '5'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            data-testid={`onb-freq-${v}`}
            aria-pressed={value === v}
            className={`p-4 rounded-xl border ${value === v ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
          >
            <span className="text-2xl font-bold font-mono">{v}</span>
            <span className="block text-xs mt-1">pe saptamana</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Step5({ value, onChange }: OptionStepProps<'incepator' | 'intermediar' | 'avansat'>): JSX.Element {
  const labels = {
    incepator: 'Incepator',
    intermediar: 'Intermediar',
    avansat: 'Avansat',
  } as const;
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-6">Cata experienta ai?</h1>
      <div className="flex flex-col gap-3">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            data-testid={`onb-exp-${v}`}
            aria-pressed={value === v}
            className={`p-4 rounded-xl border text-left ${value === v ? 'bg-brick text-paper border-brick' : 'bg-paper2 border-lineStrong text-ink'}`}
          >
            <span className="font-medium">{labels[v]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Step6({ value, onChange }: NumericStepProps): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-2">Cat cantaresti?</h1>
      <p className="text-sm text-ink2 mb-6">Calculam volum + tonaj real.</p>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="ex. 78"
        step="0.1"
        min={30}
        max={250}
        data-testid="onb-weight-input"
        className="w-full p-4 border border-lineStrong rounded-2xl text-2xl font-semibold text-center bg-paper2 font-mono"
      />
      <p className="text-xs text-ink2 mt-2 text-center">kg</p>
    </>
  );
}

function Step7({ data }: { data: OnboardingData }): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-2">Verifica datele</h1>
      <p className="text-sm text-ink2 mb-6">Poti reveni oricand sa schimbi.</p>
      <div className="bg-paper2 border border-line rounded-xl p-4 space-y-2" data-testid="onb-summary">
        <div className="flex justify-between text-sm"><span className="text-ink2">Varsta</span><span className="text-ink font-medium">{data.age ?? '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Sex</span><span className="text-ink font-medium">{data.sex === 'm' ? 'Barbat' : data.sex === 'f' ? 'Femeie' : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Obiectiv</span><span className="text-ink font-medium">{data.goal ? GOAL_LABELS[data.goal] : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Frecventa</span><span className="text-ink font-medium">{data.frequency ? `${data.frequency}/sapt` : '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Experienta</span><span className="text-ink font-medium">{data.experience ?? '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink2">Greutate</span><span className="text-ink font-medium">{data.weight ? `${data.weight} kg` : '-'}</span></div>
      </div>
    </>
  );
}
