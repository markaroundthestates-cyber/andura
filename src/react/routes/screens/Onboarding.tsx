import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function Onboarding(): JSX.Element {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const stepNum = parseInt(step ?? '1', 10);
  const isLast = stepNum >= 7;

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-ink mb-3">Onboarding pasul {stepNum}/7</h1>
      <p className="text-sm text-ink2 mb-6">Phase 2 placeholder — Phase 3+ Big 6 hard typing wire.</p>
      <button
        type="button"
        onClick={() => navigate(isLast ? '/app/antrenor' : `/onboarding/${stepNum + 1}`)}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        {isLast ? 'Termina' : 'Continua'}
      </button>
    </section>
  );
}
