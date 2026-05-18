# §36 — Network Layer + Offline Sync Edge Cases

**Scope:** Request batching + Dedup + Response cache + Stale-while-revalidate + ETag + Compression + HTTP/2 vs HTTP/3 + Connection pooling + DNS prefetch + Preconnect + Sync conflict resolution + Queued ops replay + Long offline + Partial connectivity + Captive portal + Geographic routing + SW update during offline + Background Sync + navigator.onLine + Reconnect UX

## Severity matrix §36

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 6 |
| LOW | 3 (positive) |
| NIT | 1 |
| **Total** | **15** |

---

## CRITICAL findings

### §36-C1 — Sync conflict resolution offline→online (§36.11 + §12-H3)
**Severity:** CRITICAL
**Evidence:** Local writes during offline → on reconnect, no automatic sync trigger (§16-H3 background sync absent). Local writes overwrite Firebase blindly OR Firebase overwrites local — undefined.
**Fix log:** Document last-write-wins policy + implement on-reconnect sync trigger via Workbox BackgroundSync OR app-level reconnect handler.

---

## HIGH findings

### §36-H1 — Queued operations replay on reconnect (§36.12) — absent
**Severity:** HIGH
**Resolution:** Per §36-C1 + §16-H3.

### §36-H2 — Long offline duration (days/weeks) graceful reconnect (§36.13)
**Severity:** HIGH
**Evidence:** Local Dexie writes accumulate. On reconnect, bulk sync needed. Risk: timeout, partial fail.

### §36-H3 — Partial connectivity slow 3G timeout vs retry (§36.14)
**Severity:** HIGH (§25-H2 reaffirmed)
**Resolution:** AbortController fix.

### §36-H4 — Captive portal hotel/airport WiFi (§36.15)
**Severity:** HIGH
**Evidence:** Captive portal blocks until user accepts ToS. SW NetworkFirst would attempt fetch, timeout 3s, fall back cache. User sees stale data without obvious indicator they need to log into WiFi.
**Fix log:** Detect via fetch known-good endpoint; if 200 unexpected (HTML login portal), surface banner.

---

## MED findings

### §36-M1 — Stale-while-revalidate Workbox strategy applied correctly (§36.4)
**Severity:** MED
**Evidence:** vite.config.js workbox runtimeCaching uses NetworkFirst (Firebase) + CacheFirst (Fonts) — no SWR strategy. Could add SWR for less-critical assets.

### §36-M2 — Compression gzip/brotli enabled GH Pages (§36.6)
**Severity:** MED — POSITIVE assumed
**Evidence:** GH Pages auto-enables gzip/brotli. Verify via `curl -I https://andura.app/` Content-Encoding header.

### §36-M3 — DNS prefetch hints (§36.9)
**Severity:** MED
**Evidence:** Source index.html missing `<link rel="dns-prefetch" href="//<firebase-domain>">`. Workbox precaching covers but DNS prefetch could shave initial connect time.

### §36-M4 — Preconnect hints (§36.10) — vanilla legacy has `<link rel="preconnect" href="https://fonts.googleapis.com">`; React missing
**Severity:** MED (§1-C1 partial)

### §36-M5 — Network state detection navigator.onLine + actual ping (§36.19)
**Severity:** MED
**Evidence:** No usage in src/react/. UpdatePrompt has offlineReady state passive ✓.
**Fix log:** Add `useNetworkStatus()` hook listening to `online`/`offline` events.

### §36-M6 — Reconnect UX banner (§36.20)
**Severity:** MED
**Resolution:** Tied to §36-M5.

---

## LOW (POSITIVE)

### §36-L1 — NetworkFirst Firebase 3s timeout fallback cache ✓ (§36.3 + Phase 6 task_21)
### §36-L2 — Geographic routing Firebase europe-west1 RO latency ~30-50ms ✓ (§36.16)
### §36-L3 — SW update mechanism `autoUpdate` + UpdatePrompt fires `controllerchange` ✓ (§36.17)

---

## NIT findings

### §36-N1 — HTTP/3 GH Pages support (§36.7) — automatic
**Resolution:** OK.

## Karpathy distribution §36
- Goal-Driven: 4 (C1, H1, H2, H4)
- Surgical Changes: 2 (M3, M4)
