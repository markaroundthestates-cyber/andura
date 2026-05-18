import { defineConfig } from 'vitest/config';

// --no-webstorage disables the Node-level Web Storage API (added in Node 25+)
// so jsdom can mock it correctly. Flag only exists on Node 25+, so guard it.
const nodeMajor = parseInt(process.version.slice(1).split('.')[0]);
const execArgv = nodeMajor >= 25 ? ['--no-webstorage'] : [];

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    silent: 'passed-only',
    include: ['src/**/*.test.{js,ts,tsx}'],
    setupFiles: ['./src/react/__tests__/setup.ts'],
    poolOptions: {
      threads: { execArgv },
      forks: { execArgv },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'src/**/__tests__/**',
        'src/**/__snapshots__/**',
        'dist/**',
        'tests/**',
        'coverage/**',
        '**/*.config.js',
      ],
    },
  }
});
