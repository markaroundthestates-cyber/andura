// React Native WEB (Metro, platform=web) environment flags — sibling of env.js.
//
// Metro picks `env.web.js` over `env.js` for the web platform, so this keeps the
// unparseable `import.meta` out of the Expo-web bundle. Mirrors env.native.js
// (`__DEV__` global). Vite/Vitest still resolve env.js, NOT this file.
const dev = typeof globalThis !== 'undefined' && globalThis.__DEV__ === true;

export const IS_PROD = !dev;
export const IS_DEV = dev;

// No Vite build-time env on React Native web; empty bag keeps web-coupled
// callers (e.g. sentry.js) safe.
export const VITE_ENV = {};
