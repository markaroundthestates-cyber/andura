// ══ VITEST SETUP — React Testing Library matchers + fake IDB + auto-cleanup ══
// §2-H3 audit fix — global fake-indexeddb registration (eliminates cross-test
// state leak from per-file forget) + RTL afterEach cleanup (defensive — RTL v14
// auto-cleans but explicit is safer for sub-render leaks).
// console.error → throw conversion DEFERRED to Track 7 (high cascade risk:
// React act warnings + PropTypes deprecation warnings + key warnings would all
// fail tests; needs systematic suppress-or-fix audit first).

import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
