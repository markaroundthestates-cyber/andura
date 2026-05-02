import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    // GitHub Pages can be slow; give assertions a generous window
    timeout: 10000,
  },
  use: {
    // baseURL is the custom domain origin; tests navigate to / (root)
    baseURL: 'https://andura.app',
    headless: true,
    // Wait for the SPA JS to finish before each action
    actionTimeout: 15000,
  },
  reporter: 'list',
  // Subdirectory-level test patterns (used by test:e2e scripts)
  projects: [
    {
      name: 'all',
      testDir: './tests',
    },
  ],
});
