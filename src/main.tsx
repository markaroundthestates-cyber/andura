// ══ REACT ENTRY POINT — Andura Clasic Build Phase 2 Routing Wire ══════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 1 App.tsx placeholder = preserved (used as splash content reuse
// option future). Router config în src/react/routes/router.tsx.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './react/routes/router';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
