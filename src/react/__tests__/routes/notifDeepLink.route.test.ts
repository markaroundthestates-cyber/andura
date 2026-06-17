// C27 regression guard — the notif-tap deep-link must resolve to a REAL route,
// not the catch-all NotFound. The cycle-26b notif-tap fix sent data.link
// '/antrenor', but the Antrenor tab lives at /app/antrenor, so every tap landed
// on the 404 catch-all. This guard asserts (a) the link the sender actually
// sends ('/app/antrenor') resolves to a non-catch-all route, and (b) the bare
// '/antrenor' deep-link redirects (never the catch-all) — closing the seam the
// SW handler test left open (it never exercised react-router).
import { describe, it, expect } from 'vitest';
import { matchRoutes } from 'react-router-dom';
import { router } from '../../routes/router';

// The deep-link the FCM sender (functions/index.js sendAndPrune) carries.
const NOTIF_DEEP_LINK = '/app/antrenor';

function leafPath(path: string): string | undefined {
  const m = matchRoutes(router.routes, path);
  return m?.[m.length - 1]?.route?.path;
}

describe('notification deep-link routing (C27 guard)', () => {
  it('the sender deep-link resolves to a real route, not the catch-all', () => {
    const m = matchRoutes(router.routes, NOTIF_DEEP_LINK);
    expect(m).not.toBeNull();
    // The matched leaf must NOT be the catch-all '*' (NotFound).
    expect(leafPath(NOTIF_DEEP_LINK)).not.toBe('*');
  });

  it('the bare /antrenor deep-link redirects (never the 404 catch-all)', () => {
    // The bare tab path is handled by the top-level redirect to /app/antrenor,
    // so a pre-redeploy push (or any /antrenor link) never hits NotFound.
    expect(leafPath('/antrenor')).not.toBe('*');
    expect(leafPath('/antrenor')).toBe('antrenor'); // the redirect route
  });

  it('a genuinely unknown path still hits the catch-all', () => {
    // Sanity: the guard only whitelists the deep-link paths, not everything.
    expect(leafPath('/this-route-does-not-exist')).toBe('*');
  });
});
