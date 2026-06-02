// Per-bundler environment flags (default resolution: Vite web app + Vitest).
//
// Vite + Vitest read Vite's `import.meta.env`. React Native bundles resolve the
// platform siblings `env.web.js` (Metro, platform=web) and `env.native.js`
// (Metro, iOS/Android) instead — a literal `import.meta` cannot be parsed by
// Metro, so it must never reach the React Native dependency graph. Consumers
// import this extensionless (`./env`) so each bundler picks its own variant.
const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

// True only in a Vite production build (`vite build`). Dev server + Vitest = false.
export const IS_PROD = env?.PROD === true;

// True in the Vite dev server + Vitest; false in a production build.
export const IS_DEV = env?.DEV === true;

// Raw Vite env bag (build-time-injected VITE_* vars). Empty object on React
// Native (see env.web.js / env.native.js) so callers read it without crashing.
export const VITE_ENV = env || {};
