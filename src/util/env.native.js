// React Native (Metro, iOS/Android) environment flags — sibling of env.js.
//
// RN exposes the `__DEV__` global (true in dev, false in a release build); there
// is no separate test mode, so prod is simply "not dev". NO `import.meta` here:
// Metro cannot parse it, and this file (not env.js) is what the RN graph loads.
const dev = typeof globalThis !== 'undefined' && globalThis.__DEV__ === true;

export const IS_PROD = !dev;
export const IS_DEV = dev;

// Vite injects config via import.meta.env (VITE_*); Expo/RN injects via
// process.env.EXPO_PUBLIC_* (inlined at build by babel-preset-expo). Map the
// EXPO_PUBLIC_* vars to the VITE_* keys the shared code reads, so Firebase /
// Google config reaches auth.js + firebase.js + pushNotifications.ts on native.
// Unset vars are undefined (guards warn in dev, throw only on a real prod build
// that should have set them).
export const VITE_ENV = {
  VITE_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  VITE_FIREBASE_RTDB_URL: process.env.EXPO_PUBLIC_FIREBASE_RTDB_URL,
  VITE_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  VITE_FIREBASE_VAPID_KEY: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
  VITE_GOOGLE_OAUTH_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
};
