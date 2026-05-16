// ══ BACKEND INTEGRATION SMOKE — React Andura Clasic verify reuse ══════════
// Validates src/engine/* pure functions importable din React UI build via
// relative path. Per DECISIONS.md §D015 backend LOCK 1 100% reusable React
// migration (library 657, Big 11 8/8, Calendar engine, kcal floor, BATCH 2
// Antrenor, auth, tests 3743 PASS).

import { describe, it, expect } from 'vitest';

describe('Backend integration — src/engine/ reuse', () => {
  it('imports pure function getInitialRecommendation din src/engine/dp.js runtime', async () => {
    // Pick: src/engine/dp.js export `getInitialRecommendation` — Double Progression
    // core weight recommendation engine per D-LEGACY-003 ARCH. Named export pure
    // function (NO side effects per ADR 026 §9 pure-function paradigm).
    const mod = await import('../../engine/dp.js');
    expect(mod).toBeDefined();
    expect(typeof mod.getInitialRecommendation).toBe('function');
    expect(mod.DP).toBeDefined();
  });
});
