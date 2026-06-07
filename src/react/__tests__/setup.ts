// ══ VITEST SETUP — React Testing Library matchers + fake IDB + auto-cleanup ══
// §2-H3 audit fix — global fake-indexeddb registration (eliminates cross-test
// state leak from per-file forget) + RTL afterEach cleanup (defensive — RTL v14
// auto-cleans but explicit is safer for sub-render leaks).
// LOW-CODE-14 fix — global beforeEach localStorage.clear() enforces cross-test
// isolation. Belt + suspenders with existing individual beforeEach clears in
// stores/screens tests — future tests cannot forget cross-test order
// dependence. sessionStorage not currently used by tests; add if/when needed.
// console.error → throw conversion DEFERRED to Track 7 (high cascade risk:
// React act warnings + PropTypes deprecation warnings + key warnings would all
// fail tests; needs systematic suppress-or-fix audit first).

import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  // D107 behavioral collection is DEFAULT-ON in prod (absent key = enabled). In
  // tests we force it OFF for determinism — otherwise every Workout/flow test
  // fires async IDB behavior-log writes that perturb render timing (flaky
  // target/entry assertions). The debugLog suite removes this key explicitly to
  // assert the absent→ON default.
  localStorage.setItem('andura-behavior-collect', 'false');
});

afterEach(() => {
  cleanup();
});
