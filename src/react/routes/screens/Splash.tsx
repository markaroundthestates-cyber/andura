import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Splash(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold text-brick mb-4">🦫 Andura</h1>
      <p className="text-sm text-ink2 mb-6">Coach AI pentru sala.</p>
      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? '/app/antrenor' : '/auth')}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        {isAuthenticated ? 'Continua' : 'Intra in cont'}
      </button>
      <p className="text-xs text-ink2 mt-4 opacity-60">Phase 2 placeholder splash.</p>
    </section>
  );
}
