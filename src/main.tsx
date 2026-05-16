// ══ REACT ENTRY POINT — Andura Clasic Build (Phase 1 Foundation LANDED) ═══
// Per DECISIONS.md §D015 STRAT PIVOT + §D016 PROC: lansăm Andura Clasic pe
// React folosind mockup 04-architecture/mockups/andura-clasic.html DESIGN
// MASTER direct. Vanilla src/main.js + index.html = LEGACY preserved live
// andura.app până React LANDED.
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT Pre-Beta React Andura Clasic
//   - DECISIONS.md §D016 PROC nav 6→4 + screens 50+ în React build only

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
