// ══ RN NAVIGATION SHIM — gotoPath → expo-router (Wave 2) ═══════════════════
// The PWA navigates by mockup screen-name via src/react/lib/navigation.ts
// `gotoPath(screen)` → a React Router path string. This is the RN twin: same
// screen-name vocabulary, but it DRIVES expo-router's imperative `router`
// instead of returning a string for react-router-dom.
//
// We import the canonical `gotoPath` + `GotoScreen` type from the web module so
// the screen→path mapping stays SINGLE-SOURCE (zero drift): the path strings are
// identical (`/app/antrenor`, `/onboarding/1`…) and expo-router's file tree in
// mobile/app/ mirrors exactly those paths. Per the manager's rule we do NOT edit
// the web navigation.ts — we only consume it.

import { router } from 'expo-router';
import { gotoPath, type GotoScreen } from '../../src/react/lib/navigation';

export type { GotoScreen };
export { gotoPath };

/** Push a mockup screen onto the stack (adds to history). */
export function goto(screen: GotoScreen): void {
  router.push(gotoPath(screen) as never);
}

/** Replace the current route with a mockup screen (no back entry) — used by
 *  guards / post-auth redirects that must not be "back"-reachable. */
export function gotoReplace(screen: GotoScreen): void {
  router.replace(gotoPath(screen) as never);
}

/** Go back one entry when possible; otherwise fall through to the antrenor hub
 *  (mirrors the web SubHeader's explicit-intent back pattern). */
export function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/app/antrenor');
  }
}
