// ══ NATIVE kv.clearAll() — GDPR Art. 17 full Tier-0 flush (CR-03) ════════════
// On device the account-delete wipe must clear the WHOLE MMKV keyspace. Before
// CR-03 the wipe used a typeof-guarded `localStorage.clear()` — a no-op on native
// where there is no localStorage, so MMKV Tier-0 data survived an account delete
// (GDPR Art. 17 break). kv.clearAll() routes to MMKV `clearAll()` on native.
//
// Runs under jest-expo (native platform) → `./storage/kv` resolves kv.native.js
// (MMKV mock). We assert the adapter is the native variant + clearAll wipes all
// keys, including a key written outside the wv2-* convention.

import { kv } from '../../../../../src/storage/kv';

describe('native kv.clearAll() (MMKV)', () => {
  it('resolves the native variant and wipes the entire keyspace', () => {
    expect(require.resolve('../../../../../src/storage/kv')).toMatch(/kv\.native\.js$/);

    kv.setItem('wv2-workout', '{"a":1}');
    kv.setItem('pain-cdl', '[]');
    kv.setItem('firebase-uid', 'uid-123');
    expect(kv.keys().length).toBeGreaterThanOrEqual(3);

    kv.clearAll();

    expect(kv.keys()).toEqual([]);
    expect(kv.getItem('wv2-workout')).toBeNull();
    expect(kv.getItem('firebase-uid')).toBeNull();
  });
});
