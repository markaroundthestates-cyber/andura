import { defineConfig } from 'vitest/config';

// --no-webstorage disables the Node-level Web Storage API (added in Node 25+)
// so jsdom can mock it correctly. Flag only exists on Node 25+, so guard it.
const nodeMajor = parseInt(process.version.slice(1).split('.')[0]);
const execArgv = nodeMajor >= 25 ? ['--no-webstorage'] : [];

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,ts}'],
    poolOptions: {
      threads: { execArgv },
      forks: { execArgv },
    },
  }
});
