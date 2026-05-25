import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// --no-webstorage disables the Node-level Web Storage API (added in Node 25+)
// so jsdom can mock it correctly. Flag only exists on Node 25+, so guard it.
const nodeMajor = parseInt(process.version.slice(1).split('.')[0]);
const execArgv = nodeMajor >= 25 ? ['--no-webstorage'] : [];

// §2-C2 audit fix — testTimeout/hookTimeout/retry/passWithNoTests + coverage
// thresholds (initial low floor — ratchet Track 7 post coverage measurement).
export default defineConfig({
  // §S-12 — resolve the Vite-injected `virtual:pwa-register` module to a stub
  // in the test build (VitePWA plugin does not run under vitest, so the virtual
  // specifier is otherwise unresolvable by Vite import-analysis). See
  // src/react/__tests__/stubs/pwa-register-stub.ts.
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('./src/react/__tests__/stubs/pwa-register-stub.ts', import.meta.url)
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    silent: 'passed-only',
    include: [
      'src/**/*.test.{js,ts,tsx}',
      // Track 7 §7.1+ — engine fixtures, invariants, golden master tests
      // (tests/e2e/, tests/*.spec.js stay in Playwright runner via npm run test)
      'tests/engine/**/*.test.{js,ts}',
    ],
    setupFiles: ['./src/react/__tests__/setup.ts'],
    // §2-C2 — explicit timeouts (default 5000ms causes slow CI nondeterminism).
    testTimeout: 10000,
    hookTimeout: 10000,
    // §2-C2 — retry 1 on flake (vitest 1.0+ default 0; flake masquerade as fail).
    retry: 1,
    // §2-C2 — fail when test file has no tests (silent pass mask removed).
    passWithNoTests: false,
    poolOptions: {
      threads: { execArgv },
      forks: { execArgv },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // §2-C2 — explicit include (was implicit, may over-include build artifacts).
      // Widened to gate auth/firebase/storage against regression (existing tests
      // cover them; coverage include makes the gate enforce).
      include: [
        'src/engine/**',
        'src/coach/**',
        'src/react/**',
        'src/util/**',
        'src/auth.js',
        'src/firebase.js',
        'src/storage/**',
      ],
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'src/**/__tests__/**',
        'src/**/__snapshots__/**',
        'src/_legacy-vanilla/**',
        'dist/**',
        'tests/**',
        'coverage/**',
        '**/*.config.js',
        '**/*.d.ts',
      ],
      // §2-C2 — coverage thresholds at LOW initial floor (Track 7 ratchet
      // post coverage measurement). Prevents silent coverage regression.
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 50,
        statements: 60,
      },
    },
  },
});
