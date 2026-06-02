// ══ AUTH CALLBACK (route '/auth-callback') — Magic Link verify landing ════
// RN twin of src/react/routes/screens/AuthCallback.tsx. The brain is kept
// verbatim: parseMagicLinkUrl(query) → verifyMagicLink → on success
// setAuthenticated(true) + awaitRestoreOrTimeout(runPostAuthSync) + route to the
// home tab (or restore-account when a soft-delete marker surfaced); on failure
// route to /auth?error=<reason> + clear pendingEmail. The Google #id_token
// fragment exchange (signInWithGoogleIdToken) is preserved too.
//
// THE ONE RN DELTA — the magic-link URL source. On web the callback reads
// window.location.search/.hash. On native the magic link is a deep link
// (andura://auth-callback?oobCode=...&email=...) delivered by expo-linking, so we
// read the incoming URL via Linking.useURL() (falling back to window on web
// export) and split it into the query + fragment the auth helpers expect.
//
// FLAG (Daniel-gated, queued not blocking): for the deep link to actually open
// the installed app, the Firebase Dynamic Links / associated-domains + the
// Android intent-filter for the `andura` scheme must be configured Daniel-side
// (see report). The Auth send already passes Linking.createURL('/auth-callback')
// as the continueUrl so Firebase round-trips to the app once that's wired.

import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../../src/react/stores/appStore';
import {
  verifyMagicLink,
  parseMagicLinkUrl,
  getPendingEmail,
  signInWithGoogleIdToken,
  AUTH_STORAGE_KEYS,
} from '../../src/auth.js';
import { runPostAuthSync } from '../../src/react/lib/reactBoot';
import { kv } from '../../src/storage/kv';
import { dark } from '../lib/tokens';
import { useReducedMotion } from '../lib/useReducedMotion';
import { t } from '../../src/i18n/index.js';

// Post-auth landing target — when the cloud sync found a pending deletion marker
// (runPostAuthSync set appStore.pendingDeletionRestore) the user must choose
// Restore vs Delete-now BEFORE entering the app, so route to the restore screen.
const APP_HOME = '/app/antrenor';
const RESTORE_ROUTE = '/app/cont/restore-account';

function postAuthLanding(): string {
  return useAppStore.getState().pendingDeletionRestore ? RESTORE_ROUTE : APP_HOME;
}

// Google return path — Google appends `#id_token=<jwt>&access_token=...` to the
// URL hash. Split the fragment off the incoming URL and read it.
function parseGoogleIdToken(hash: string): string | null {
  if (!hash || !hash.startsWith('#')) return null;
  try {
    const params = new URLSearchParams(hash.slice(1));
    return params.get('id_token');
  } catch {
    return null;
  }
}

// AWAIT the cloud restore (capped) before navigating into the app, so a returning
// user's sticky-restored onboarding-`completed` flag lands before the shell's
// onboarding gate evaluates (else the gate fires on freshly-wiped local state and
// loops the user through onboarding). runPostAuthSync owns its own try/catch.
const RESTORE_GATE_TIMEOUT_MS = 6000;

async function awaitRestoreOrTimeout(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, RESTORE_GATE_TIMEOUT_MS);
  });
  try {
    await Promise.race([runPostAuthSync(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Split an incoming URL (deep link on native, location on web) into the query
// string + hash fragment the auth helpers parse. On web export window exists;
// on native we get the deep link from Linking.useURL().
function splitUrl(url: string | null): { search: string; hash: string } {
  if (url) {
    const hashIdx = url.indexOf('#');
    const hash = hashIdx >= 0 ? url.slice(hashIdx) : '';
    const beforeHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
    const qIdx = beforeHash.indexOf('?');
    const search = qIdx >= 0 ? beforeHash.slice(qIdx) : '';
    return { search, hash };
  }
  if (typeof window !== 'undefined' && window.location) {
    return { search: window.location.search || '', hash: window.location.hash || '' };
  }
  return { search: '', hash: '' };
}

export default function AuthCallback(): React.JSX.Element {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);
  // The deep-link URL that opened the app (native). null until resolved; on web
  // export this stays null and splitUrl falls back to window.location.
  const incomingUrl = Linking.useURL();

  useEffect(() => {
    let cancelled = false;
    // On native, hold until the deep-link URL resolves (it's null on first
    // render). On web export Linking.useURL() also resolves to the page URL.
    // Guard: if there is genuinely no URL yet, wait for the next render.
    const hasWindow = typeof window !== 'undefined' && !!window.location;
    if (incomingUrl == null && !hasWindow) return;

    const { search, hash } = splitUrl(incomingUrl);

    async function run(): Promise<void> {
      // Google OAuth return path — exchange the #id_token via signInWithIdp.
      const googleIdToken = parseGoogleIdToken(hash);
      if (googleIdToken) {
        const result = await signInWithGoogleIdToken(googleIdToken);
        if (cancelled) return;
        if (result.ok) {
          setAuthenticated(true);
          await awaitRestoreOrTimeout();
          if (cancelled) return;
          router.replace(postAuthLanding() as never);
          return;
        }
        setError(result.error || 'google_verify_failed');
        router.replace(`/auth?error=${encodeURIComponent(result.error || 'google_verify_failed')}` as never);
        return;
      }

      const { oobCode, email: urlEmail } = parseMagicLinkUrl(search);
      // getPendingEmail honors the 1h TTL (anti-stale shared-device leak).
      const email = urlEmail || getPendingEmail();
      if (!oobCode || !email) {
        if (!cancelled) router.replace('/auth?error=missing_params' as never);
        return;
      }
      const result = await verifyMagicLink(email, oobCode);
      if (cancelled) return;
      if (result.ok) {
        setAuthenticated(true);
        await awaitRestoreOrTimeout();
        if (cancelled) return;
        router.replace(postAuthLanding() as never);
      } else {
        // Clear pendingEmail on verify-fail (anti-stale-leak shared-device): a
        // failed verify means the oobCode is invalid/expired/replayed, so the
        // cached pendingEmail is no longer trusted.
        try {
          kv.removeItem(AUTH_STORAGE_KEYS.pendingEmail);
          kv.removeItem(AUTH_STORAGE_KEYS.pendingEmailExpiry);
        } catch {}
        setError(result.error || 'verify_failed');
        router.replace(`/auth?error=${encodeURIComponent(result.error || 'verify_failed')}` as never);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [incomingUrl, setAuthenticated]);

  return (
    <SafeAreaView
      className="flex-1 bg-paper"
      style={{ backgroundColor: dark.paper }}
      testID="auth-callback"
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Spinner spinning={!error} />
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ alignItems: 'center' }}>
          <Text className="font-semibold text-ink" style={{ fontSize: 16, marginBottom: 4, textAlign: 'center' }}>
            {error ? t('authCallback.errorTitle') : t('authCallback.verifyingTitle')}
          </Text>
          <Text className="text-ink2" style={{ fontSize: 14, textAlign: 'center' }}>
            {error ? t('authCallback.errorBody') : t('authCallback.verifyingBody')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Loading spinner — rotates while verifying; a static ring once an error lands
// (web parity: a spinning ring + "Eroare" is a mixed signal for Gigel).
function Spinner({ spinning }: { spinning: boolean }): React.JSX.Element {
  const reduced = useReducedMotion();
  const rot = useSharedValue(0);

  useEffect(() => {
    if (spinning && !reduced) {
      rot.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      rot.value = 0;
    }
  }, [spinning, reduced, rot]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }));

  return (
    <View testID="auth-callback-spinner" style={{ marginBottom: 16 }}>
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 4,
          borderColor: dark.line,
          borderTopColor: dark.brick,
        },
        style,
      ]}
    />
    </View>
  );
}
