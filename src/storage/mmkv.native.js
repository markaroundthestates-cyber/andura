// ══ Shared MMKV instance (React Native) ══════════════════════════════════════
//
// The default MMKV store backing Tier-0 on native. Shared by BOTH native
// Tier-0 paths so they read/write the SAME flat keyspace (a second `new MMKV()`
// would create a parallel store and split the keys):
//   - kv.native.js   — the SWALLOWING StateStorage adapter (Zustand persist +
//                      scheduleAdapter). Never throws.
//   - dbset.native.js — the THROWING setter behind DB.set (MED-CODE-22 quota
//                      contract needs throws to propagate).
//
// Native only — Metro loads this into the RN graph; Vite/Vitest never resolve a
// `.native.js` sibling, so `react-native-mmkv` is never imported on web/test.

import { MMKV } from 'react-native-mmkv';

/** Default MMKV store — one flat keyspace, same as web `localStorage`. */
export const storage = new MMKV();
