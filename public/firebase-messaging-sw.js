// ══ FCM BACKGROUND-MESSAGE SERVICE WORKER ════════════════════════════════
// Standalone Firebase Cloud Messaging worker pentru push notifications cand
// tabul Andura e inchis / in background. NU se atinge de workbox SW
// (dist/sw.js precache/offline) — clientul il inregistreaza explicit cu scope
// dedicat '/firebase-cloud-messaging-push-scope' si il paseaza la getToken via
// serviceWorkerRegistration (src/react/lib/pushNotifications.ts).
//
// De ce compat scripts via importScripts: un SW NU poate folosi ESM dynamic
// import-uri pentru firebase modular; gstatic compat este pattern-ul oficial
// FCM pentru background handler. Pin la 12.13.0 ca sa match-uiasca `firebase`
// din package.json (lazy chunk client-side).
//
// De ce config-ul e hardcodat aici: un fisier static din public/ NU are acces
// la import.meta.env (Vite nu il proceseaza). Web Firebase config (apiKey /
// appId / messagingSenderId / projectId) NU e secret — per Firebase docs e
// embeddable in client; securitatea vine din RTDB rules + App Check, nu din
// ascunderea acestor valori. apiKey/appId/senderId sunt placeholders clare,
// inlocuite de Daniel pre-launch (sau de un build step) cu valorile reale din
// Firebase Console → Project settings → Web app config.

importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

// §13.068 — DEPLOY-TIME STEP: inlocuieste cele 3 PLACEHOLDER_ de mai jos cu
// valorile reale din Firebase Console (Project settings → General → Your apps →
// Web app → SDK config), SAU printr-un build step care injecteaza valorile.
// Aceste valori NU sunt secrete (embeddable client-side per Firebase docs);
// securitatea vine din RTDB rules + App Check. Pe client-side echivalentul e
// build-injected prin VITE_FIREBASE_* (src/react/lib/pushNotifications.ts), dar
// un fisier static din public/ NU are acces la import.meta.env, deci config-ul
// e inline aici.
const FCM_CONFIG = {
  // Non-secret, fittracker-c34e8 public web config.
  projectId: 'fittracker-c34e8',
  authDomain: 'fittracker-c34e8.firebaseapp.com',
  apiKey: 'PLACEHOLDER_WEB_API_KEY',
  messagingSenderId: 'PLACEHOLDER_SENDER_ID',
  appId: 'PLACEHOLDER_APP_ID',
};

// Guard: cat timp config-ul are inca placeholdere, initializeApp +
// firebase.messaging() ar arunca si ar strica intreg SW-ul la inregistrare.
// FCM push e dormant pana cand valorile reale sunt injectate la deploy (mirror
// client: pushNotifications.ts intoarce 'error' graceful daca env lipseste).
// Cand sunt reale, background-handler-ul de mai jos se ataseaza normal.
const FCM_CONFIGURED = !Object.values(FCM_CONFIG).some(
  (v) => typeof v === 'string' && v.startsWith('PLACEHOLDER_'),
);

if (FCM_CONFIGURED) {
  firebase.initializeApp(FCM_CONFIG);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notif = (payload && payload.notification) || {};
    const data = (payload && payload.data) || {};
    const title = notif.title || data.title || 'Andura';
    const body = notif.body || data.body
      || 'E timpul pentru antrenament. Hai sa misti putin azi.';
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data,
    });
  });
}
