// §1-C4 audit fix — ESLint flat config minimal React 19 + TS strict.
// Initial config = WARNINGS only (zero error gate) so existing codebase stays
// green pre-Beta. Future hardening (post-Beta Track 7+): ratchet rules → error
// + add eslint-plugin-jsx-a11y + eslint-plugin-import boundaries enforcement.
// Pre-commit gate wires `npm run lint` post-test (lint never blocks; surface
// only). CI may surface lint diff via PR comments.
//
// Cross-refs:
//   - DECISIONS.md §D031 Phase 7 Findings FIX continuous neîntrerupt
//   - .husky/pre-commit (runs lint info-only, never blocks)
//   - Track 7 backlog — ratchet lint rules → error level by category

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  Promise: 'readonly',
  process: 'readonly',
  global: 'readonly',
  Buffer: 'readonly',
  self: 'readonly',
  caches: 'readonly',
  indexedDB: 'readonly',
  location: 'readonly',
  confirm: 'readonly',
  alert: 'readonly',
  prompt: 'readonly',
  HTMLElement: 'readonly',
  Element: 'readonly',
  Node: 'readonly',
  Event: 'readonly',
  CustomEvent: 'readonly',
  FormData: 'readonly',
  FileReader: 'readonly',
  File: 'readonly',
  Blob: 'readonly',
  URLSearchParams: 'readonly',
  MutationObserver: 'readonly',
  IntersectionObserver: 'readonly',
  ResizeObserver: 'readonly',
  performance: 'readonly',
  crypto: 'readonly',
};

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '99-archive/**',
      '04-architecture/mockups/**',
      'src/_legacy-vanilla/**',
      'public/sw*.js',
      'coverage/**',
      '.husky/**',
      'tests/**',
      'tests-e2e/**',
      'playwright-report/**',
      'test-results/**',
      '*.config.js',
      '*.config.ts',
      // §B022-prep hygiene — Obsidian vault plugins (3rd party JS, NU Andura source).
      // Per D030 setup; some plugins (colored-tags) reference TS-only rules pre-loaded
      // which break pre-commit hook ESLint scan. Exclude entire .obsidian/ tree.
      '.obsidian/**',
      // Claude Code harness dir — agent worktrees under .claude/worktrees/ are full
      // repo copies + dist build artifacts; `eslint .` scanned them and blew past
      // --max-warnings=9999, failing the pre-commit hook. NU Andura source. Exclude.
      '.claude/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: { react: { version: '19.0' } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
];
