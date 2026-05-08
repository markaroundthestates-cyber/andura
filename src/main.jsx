// ══ REACT ENTRY POINT — Batch 1 Scaffold (parallel) ═══════════════════════
// Active doar pentru `react-test.html` parallel entry. Existing vanilla app
// `src/main.js` preserved unchanged. Migration progresses Batch 2-8 sequential.
//
// Cross-refs:
//   - 03-decisions/005-vanilla-js-no-framework.md §AMENDMENT 2026-05-08 React Migration LOCK
//   - 04-architecture/REACT_MIGRATION_STATE_MAPPING_V1.md §7 8-batch strategy

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found în react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
