import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Auth(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  // Phase 2 stub: button mock authenticate. Phase 3+ wire Firebase Magic Link.
  const handleMockLogin = (): void => {
    setAuthenticated(true);
    navigate('/onboarding/1');
  };

  return (
    <section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-ink mb-4">Autentificare</h1>
      <p className="text-sm text-ink2 mb-6">Phase 2 stub — Phase 3+ Firebase Magic Link wire.</p>
      <button
        type="button"
        onClick={handleMockLogin}
        className="px-6 py-3 bg-brick text-white rounded-lg font-semibold"
      >
        Mock login (Phase 2 stub)
      </button>
    </section>
  );
}
