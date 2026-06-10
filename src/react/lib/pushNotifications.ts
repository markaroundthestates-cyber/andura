// ══ FCM WEB PUSH — client module ═════════════════════════════════════════
// Activare / dezactivare push notifications via Firebase Cloud Messaging.
//
// ADR 002 = Firebase via REST, NU SDK pentru DATA. EXCEPTIE (Co-CTO): FCM web
// push CERE firebase client SDK (firebase/messaging — getToken nu are echivalent
// REST). Mitigare: SDK lazy-load EXCLUSIV in enablePushNotifications/
// disablePushNotifications via import('firebase/...') — niciodata top-level —
// deci firebase NU intra in main bundle (separate lazy chunk). Mirror pattern
// Sentry (src/util/sentry.js: await import('@sentry/browser')).
//
// Token storage: RTDB la users/<uid>/fcmTokens/<token> = true via REST PUT
// autenticat (getIdToken + ?auth=). Scheduler-ul (Agent B) citeste acest nod
// ca sa targeteze device-urile uid-ului. Push CERE un cont (uid) — anonim →
// 'no-account' (local-only mode, nimic de targetat server-side).
//
// Toate side-effect-urile (network, SW register, Notification, SDK) sunt
// confinate aici. NO top-level firebase import.

import { getUserPath, FIREBASE_URL } from '../../firebase.js';
import { getIdToken } from '../../auth.js';

export type PushResult = 'granted' | 'denied' | 'unsupported' | 'no-account' | 'error';

// SW dedicat FCM — scope separat ca sa NU intre in coliziune cu workbox SW
// (dist/sw.js, scope '/'). Fisier static din public/firebase-messaging-sw.js.
const FCM_SW_PATH = '/firebase-messaging-sw.js';
const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

// Build-time env (Vite inject). Custom VITE_ vars nu sunt in vite/client
// types, deci assertion inline (mirror DeleteAccountConfirm.tsx pattern).
interface FcmEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_VAPID_KEY?: string;
}

function readEnv(): FcmEnv {
  return (
    (import.meta as ImportMeta & { env?: FcmEnv }).env || {}
  );
}

// Firebase web config gata de initializeApp. apiKey/appId/senderId obligatorii
// (din env). projectId/authDomain hardcodate fittracker-c34e8 (non-secret).
interface MessagingConfig {
  apiKey: string;
  projectId: string;
  authDomain: string;
  messagingSenderId: string;
  appId: string;
}

// Returneaza config complet DOAR daca toate valorile secrete sunt injectate;
// altfel null → caller raspunde 'error' graceful (nu crash).
function getMessagingConfig(): MessagingConfig | null {
  const env = readEnv();
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_MESSAGING_SENDER_ID || !env.VITE_FIREBASE_APP_ID) {
    return null;
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'fittracker-c34e8',
    authDomain: 'fittracker-c34e8.firebaseapp.com',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

function getVapidKey(): string | undefined {
  return readEnv().VITE_FIREBASE_VAPID_KEY;
}

/**
 * Push e suportat doar daca runtime-ul are Notification + ServiceWorker +
 * PushManager. jsdom / SSR / browsere vechi → false.
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && typeof navigator !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window;
}

/**
 * Cere permisiunea + inregistreaza un FCM token pentru uid-ul curent.
 *
 *  - runtime fara suport         → 'unsupported'
 *  - mod anonim (getUserPath null) → 'no-account'
 *  - user refuza permisiunea     → 'denied'
 *  - succes (token salvat in RTDB) → 'granted'
 *  - orice exceptie / config lipsa → 'error'
 */
export async function enablePushNotifications(): Promise<PushResult> {
  if (!isPushSupported()) return 'unsupported';

  // Push are nevoie de un cont ca scheduler-ul sa targeteze uid-ul. Anonim =
  // local-only, nimic de inregistrat server-side.
  const userPath = getUserPath();
  if (!userPath) return 'no-account';

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const config = getMessagingConfig();
    const vapidKey = getVapidKey();
    // Config incomplet (VAPID / appId / senderId neinjectate) → fail graceful.
    if (!config || !vapidKey) {
      return 'error';
    }

    // Lazy-load firebase SDK — confinat aici, NU top-level (anti main-bundle
    // bloat). Mirror pattern Sentry.
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getMessaging, getToken } = await import('firebase/messaging');

    // initializeApp idempotent: reuse app-ul existent daca a fost deja creat.
    const app = getApps().length ? getApp() : initializeApp(config);
    const messaging = getMessaging(app);

    // SW dedicat FCM cu scope propriu — nu se atinge de workbox SW.
    const swReg = await navigator.serviceWorker.register(FCM_SW_PATH, { scope: FCM_SW_SCOPE });

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return 'error';

    // Salveaza token in RTDB la users/<uid>/fcmTokens/<token> = true via REST
    // PUT autenticat. userPath = 'users/<uid>'.
    const idToken = await getIdToken();
    const url = `${FIREBASE_URL}/${userPath}/fcmTokens/${token}.json`
      + (idToken ? `?auth=${encodeURIComponent(idToken)}` : '');
    const res = await fetch(url, { method: 'PUT', body: 'true', signal: AbortSignal.timeout(15000) }); // _fbFetch idiom
    if (!res.ok) return 'error';

    return 'granted';
  } catch {
    // Best-effort — orice esec (network, SDK, permission API) → 'error'.
    return 'error';
  }
}

/**
 * Best-effort dezactivare: sterge token-ul FCM local (deleteToken) + nodul din
 * RTDB. NU arunca niciodata — esecurile sunt inghitite silent.
 */
export async function disablePushNotifications(): Promise<void> {
  try {
    if (!isPushSupported()) return;

    const config = getMessagingConfig();
    if (!config) return;

    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getMessaging, getToken, deleteToken } = await import('firebase/messaging');

    const app = getApps().length ? getApp() : initializeApp(config);
    const messaging = getMessaging(app);

    const vapidKey = getVapidKey();
    // Ne trebuie token-ul curent ca sa stergem nodul RTDB corespunzator.
    let token: string | null = null;
    if (vapidKey) {
      const swReg = await navigator.serviceWorker
        .getRegistration(FCM_SW_SCOPE)
        .catch(() => undefined);
      token = await getToken(messaging, {
        vapidKey,
        ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
      }).catch(() => null);
    }

    await deleteToken(messaging).catch(() => false);

    if (token) {
      const userPath = getUserPath();
      if (userPath) {
        const idToken = await getIdToken().catch(() => null);
        const url = `${FIREBASE_URL}/${userPath}/fcmTokens/${token}.json`
          + (idToken ? `?auth=${encodeURIComponent(idToken)}` : '');
        await fetch(url, { method: 'DELETE', signal: AbortSignal.timeout(15000) }).catch(() => undefined); // _fbFetch idiom
      }
    }
  } catch {
    // Never throw — best-effort cleanup.
  }
}
