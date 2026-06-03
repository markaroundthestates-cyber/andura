// React Native WEB (Metro, platform=web) environment flags — sibling of env.js.
//
// Metro picks `env.web.js` over `env.js` for the web platform, so this keeps the
// unparseable `import.meta` out of the Expo-web bundle. Mirrors env.native.js
// (`__DEV__` global). Vite/Vitest still resolve env.js, NOT this file.
const dev = typeof globalThis !== 'undefined' && globalThis.__DEV__ === true;

export const IS_PROD = !dev;
export const IS_DEV = dev;

// Vite injects config via import.meta.env (VITE_*); Expo injects via
// process.env.EXPO_PUBLIC_* (inlined at build by babel-preset-expo). Map the
// EXPO_PUBLIC_* vars to the VITE_* keys the shared code reads, so Firebase /
// Google config reaches auth.js + firebase.js + pushNotifications.ts on Expo.
// Unset vars are undefined (callers degrade: guards warn in dev, throw only on
// a real prod build that should have set them).
export const VITE_ENV = {
  VITE_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  VITE_FIREBASE_RTDB_URL: process.env.EXPO_PUBLIC_FIREBASE_RTDB_URL,
  VITE_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  VITE_FIREBASE_VAPID_KEY: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
  VITE_GOOGLE_OAUTH_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
};
