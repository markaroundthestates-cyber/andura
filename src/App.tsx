// ══ REACT APP ROOT — Andura Clasic Build (Phase 1 Foundation) ═════════════
// Per DECISIONS.md §D015 + §D016. Tailwind PostCSS verified parity mockup
// color tokens. Routing + 4 root nav (Antrenor/Progres/Istoric/Cont)
// adăugat Phase 2.

import type { JSX } from 'react';

export function App(): JSX.Element {
  return (
    <main className="min-h-screen bg-paper text-ink p-6 font-sans">
      <h1 className="text-2xl font-semibold text-ink mb-3">
        🦫 Andura Clasic
      </h1>
      <p className="text-sm text-ink2 mb-2">
        Phase 1 Foundation LANDED — Vite + React 19 + TypeScript + Zustand + Tailwind PostCSS.
      </p>
      <p className="text-sm text-ink2 mb-2">
        Vanilla legacy preserved exact la <code className="text-brick">/</code>.
      </p>
      <p className="text-sm text-ink2 mt-6">
        Next: Phase 2 React Router skeleton + 50+ screens mockup goto() migration.
      </p>
    </main>
  );
}
