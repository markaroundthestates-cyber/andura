// React Native (Metro, iOS/Android) environment flags — sibling of env.js.
//
// RN exposes the `__DEV__` global (true in dev, false in a release build); there
// is no separate test mode, so prod is simply "not dev". NO `import.meta` here:
// Metro cannot parse it, and this file (not env.js) is what the RN graph loads.
const dev = typeof globalThis !== 'undefined' && globalThis.__DEV__ === true;

export const IS_PROD = !dev;
export const IS_DEV = dev;

// No Vite build-time env on React Native; RN config comes from app config /
// expo-constants. Empty bag keeps web-coupled callers (e.g. sentry.js) safe.
export const VITE_ENV = {};
