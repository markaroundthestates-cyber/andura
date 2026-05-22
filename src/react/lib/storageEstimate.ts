// ══ STORAGE ESTIMATE — §35-H2 navigator.storage.estimate() wrapper ════════
// Wave 2d HIGH-IOTA — Tier 0/1/2 quota surfacing.
//
// Per ADR 020 §Risks #2: storage budget per-user variable (32GB phone vs
// 256GB phone, browser quota diferit). Telemetry storage usage observability
// + UX alert when approaching limit. Pre-Beta MVP wrap returning ratio
// usage/quota — consumer (e.g. Cont panel diagnostics, future Storage Settings)
// can surface banner cand `pct >= 0.8` (80% threshold per ADR 020 §Open Items 2).
//
// jsdom test environment: `navigator.storage` undefined → fail-silent returns
// `{ usage: 0, quota: 0, pct: 0, supported: false }` (additive layer, NOT
// critical path per ADR 020 §Risks 5 fail-silent paradigm).
//
// Cross-refs:
//   - ADR 020 §35-H2 audit fix — storage size per tier monitored MVP
//   - ADR 020 §Open Items 2 — "Alert Storage Full UX" prompt cand Tier 1 >80%
//   - §13-M3 OfflineBanner pattern — surface visual cand state degraded

export interface StorageEstimateResult {
  /** Bytes used by origin (sum localStorage + IndexedDB + ServiceWorker cache). */
  usage: number;
  /** Bytes quota assigned by browser (typical Chrome ~80% disk free, FF 10GB hard). */
  quota: number;
  /** Ratio usage/quota in [0, 1]. Returns 0 if quota=0 or unsupported. */
  pct: number;
  /** True if browser exposes `navigator.storage.estimate()`. */
  supported: boolean;
}

const EMPTY_RESULT: StorageEstimateResult = {
  usage: 0,
  quota: 0,
  pct: 0,
  supported: false,
};

/**
 * Query browser quota for the current origin via Storage API.
 *
 * @returns Promise resolving to estimate result. Fail-silent on jsdom or
 *   non-supporting browsers (Safari < 14, legacy environments).
 */
export async function getStorageEstimate(): Promise<StorageEstimateResult> {
  if (typeof navigator === 'undefined') return EMPTY_RESULT;
  const storage = navigator.storage;
  if (storage === undefined || typeof storage.estimate !== 'function') {
    return EMPTY_RESULT;
  }
  try {
    const est = await storage.estimate();
    const usage = est.usage ?? 0;
    const quota = est.quota ?? 0;
    const pct = quota > 0 ? usage / quota : 0;
    return { usage, quota, pct, supported: true };
  } catch {
    return EMPTY_RESULT;
  }
}

/** Threshold pentru "approaching limit" alert (per ADR 020 §Open Items 2). */
export const STORAGE_ALERT_THRESHOLD_PCT = 0.8;

/**
 * Convenience: true daca estimate atinge sau depaseste 80% quota.
 * Consumer (Cont panel, future Settings/Storage) surface banner.
 */
export function isStorageNearLimit(result: StorageEstimateResult): boolean {
  return result.supported && result.pct >= STORAGE_ALERT_THRESHOLD_PCT;
}
