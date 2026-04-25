import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,ts}'],
    // Node.js v25+ enables Web Storage API natively, conflicting with jsdom's localStorage mock.
    // --no-webstorage disables the Node-level localStorage so jsdom can mock it correctly.
    // See: https://github.com/vitest-dev/vitest/issues/8757
    poolOptions: {
      threads: {
        execArgv: ['--no-webstorage'],
      },
      forks: {
        execArgv: ['--no-webstorage'],
      },
    },
  }
});
