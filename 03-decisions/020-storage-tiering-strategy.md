# ADR 020: Storage Tiering Strategy (Tier 0/1/2 + Dexie.js + Rotation)

**Status:** Accepted
**Date:** 2026-04-30 (evening)
**See also:** [[001-local-first-storage]] | [[002-firebase-rest-not-sdk]] | [[006-tier-storage-for-logs]] | [[011-coach-decision-log-architecture]] | [[018-engine-extensibility-architecture]] | [[DECISION_LOG]]

---

## Context

Anti-pattern actual: `localStorage` append-only pentru CDL (Coach Decision Log per ADR 011) + logs + cache. PWA hard limit `localStorage` per origin ≈ **5MB** browser-wide. Pe user activ 6-12 luni utilizare, CDL Tier 1 + logs sesiuni + applied-patterns + cache pot atinge >80% bucket → **crash silent** (writes fail tăcut, browser nu raportează nimic vizibil).

Per Gemini 3 Pro cross-check 2026-04-30 evening **Q10 BLIND SPOT #1 — BLOCKER pre-launch**:

> "Storage Exhaustion PWA Limit ~5MB — CDL Tier 1 + logs + cache pot atinge 80% rapid pe useri activi 6-12 luni. Showstopper tehnic dacă nu rezolvăm pre-launch."

**De ce e blocker (NU deferable):**

1. Crash silent ≠ recoverable. User pierde data + trust + nu raportează "bug" (nu știe că a apărut).
2. Beta micro-launch (luna 3-4, useri reali 3-5) va atinge limita pe profile cu logging dens.
3. Foundation pentru Multi-Gym + Profile typing v2 + Synthetic Demographic Prior runtime — toate cresc data footprint.
4. Fix retroactiv (post-launch) = migration runner pe data live = risk corruption + downtime.

**Existing relate context:**

- ADR 001 — local-first storage principiu (păstrat, dar refined: "local" = `localStorage` + `IndexedDB`, NU doar `localStorage`).
- ADR 006 — Tier storage existing pentru logs (slice 5000) — overlapped, dar limitat la o singură categorie. ADR 020 generalizează.
- ADR 011 — CDL retention 90 zile pre-launch + 180 zile post-Pro. Volumul real depinde de tiering.

---

## Decision (SSOT)

### Tier 0 — Hot (`localStorage`)

- **Purpose:** ultimele 30 zile data hot pentru UI immediate + Arbitrator decisions current.
- **Budget:** ~1-2MB max (target <2MB hard ceiling sub bucket browser ~5MB).
- **Content typic:** CDL last 30d entries, logs current session + last few, applied-patterns active, user config, calibration_state current.
- **Access pattern:** sync read/write (UI render path). NU async overhead.

### Tier 1 — Warm (`IndexedDB` via Dexie.js)

- **Purpose:** retention 30-180 zile (pre-launch) / 30-365 zile (post-Pro) per ADR 011 schedule.
- **Library:** **Dexie.js** (~30KB minified, MIT license, stable, used widely PWA — Notion, Obsidian web, Linear).
- **Budget:** 50-500MB realist (browser-dependent — Chrome ~80% disk free, Firefox 10GB hard).
- **Schema:** versioned per Dexie convention (`db.version(N).stores({...})`). Migration runner aliniat cu ADR 018 §4 schema versioning pattern.
- **Access pattern:** async read/write. NU în UI render hot path — folosit pentru lookup historical (engine calibration, pattern detection retrospective, audit CDL).

### Tier 2 — Cold (`Firebase` cloud)

- **Purpose:** archive >180 zile (pre-launch) / >365 zile (post-Pro).
- **Storage:** Firestore per ADR 002 (REST API, NU SDK).
- **Cost:** $125/lună la 100 useri reali, $1500/lună la 1000 useri (per Decision Log 2026-04-27 §Decision 5 estimates).
- **Access pattern:** lazy fetch on-demand (e.g., user vede chart "all-time progress" → fetch Tier 2 batch).

### Rotation trigger (initial threshold pragmatic)

**`initAutoBackup`** la app load + periodic check (interval Sprint 4 implementation detail — start cu hourly, calibrare empirical).

**Threshold initial:**
- Tier 0 → Tier 1 migration: **localStorage size > 4MB** (sub 5MB bucket limit cu safety margin) **SAU** entry age > 30 zile (whichever first).
- Tier 1 → Tier 2 migration: **IndexedDB size > 100MB** (configurabil per-user subscription Pro) **SAU** entry age > 180 zile.

**Rotation = move-only.** Zero info loss principle absolut (per VAULT_RULES.md §5). Idempotent retry-able pe failure.

---

## Library decision — Dexie.js

**Selected:** Dexie.js v4.x (latest stable la momentul ADR).

**Rationale:**

- Battle-tested production (10+ ani, used Obsidian web, Linear cache).
- API observability storage (transactions, change tracking, version migration nativ).
- Bundle ~30KB minified — neglijabil pe budget total ~500KB target PWA.
- TypeScript support nativ (ADR 014 cross-ref).
- MIT license — zero legal friction.

**Alternative considerate:**

- **`idb-keyval`** (~1KB, Jake Archibald) — mai light, API simpler, dar lipsa migration runner + transaction primitives. Daniel/Sprint 4 may revisit dacă Dexie footprint problematic.
- **Native `IndexedDB` API direct** — verbose, error-prone, API hostile. Respins (cost dev > saving 30KB).
- **`localForage`** — abstraction peste localStorage/IndexedDB/WebSQL. Overhead inutil (WebSQL deprecated, abstraction nu adaugă value).

---

## Migration runner (one-time, app startup post-deploy ADR 020)

La primul deploy post-ADR:

1. App citește `localStorage` existing.
2. Pentru fiecare key/entry cu age > 30 zile: write în `IndexedDB` Tier 1.
3. **Verify write success** (Dexie transaction commit).
4. Doar dacă verify OK → delete entry din `localStorage` (idempotent + safe).
5. Log migration event în CDL pentru audit trail.
6. On failure: keep `localStorage` entry, retry next app load, Sentry alert dacă persistent fail >3 attempts.

**Idempotent:** dacă rulează de 2 ori, NU duplică (Dexie schema constraint + check existing key).

**Safe:** NU șterge până confirm IndexedDB write success (zero info loss).

---

## Schema versioning impact (ADR 018 cross-ref)

- ADR 018 §4 migration runner v_X→v_Y pattern aliniat cu Dexie.js native versioning.
- Tier 1 IndexedDB schema versioned per Dexie convention. Schema bump = migration script (e.g., add field, rename store).
- Migration runner ADR 018 = SSOT pentru orchestration. Dexie versioning = mecanism IndexedDB-specific.

---

## Open Items pentru Sprint 4 implementation

1. **Threshold-uri exact rotation** — size-based (>4MB) vs time-based (>30d) vs hybrid (current spec). Calibrare empirică pe Daniel + 5 beta users.
2. **Alert "Storage Full" UX** — prompt user dacă Tier 1 atinge 80% (~80MB pe budget 100MB). Wording neutral, NU paternalist (pattern ADR 013 wording rules).
3. **Failure mode IndexedDB write fail** — fallback Tier 0 retain + Sentry alert. Implementat ca exponential backoff retry (3 attempts).
4. **Multi-tenant Auth interaction** — per-user namespacing IndexedDB (`db_<auth.uid>`) per ADR_MULTI_TENANT_AUTH cross-ref. UUID Anonymous → Firebase Auth migration handle.
5. **Periodic check interval** — start hourly, calibrare empirical (poate fi reduced la daily după observation).
6. **Profile typing v2 expansion impact** — Sprint 4 verify că Profile Typing dimension storage footprint nu spike Tier 0 budget.

---

## Consequences (positive)

- **Eliminate showstopper PWA limit.** User cu 1 an+ istoric = no crash silent.
- **Foundation extensibilitate** pentru Multi-Gym, Profile Typing v2, Synthetic Demographic Prior runtime, Vitality Layer expanded data.
- **Observability native** prin Dexie transactions (debug data flow).
- **Pattern reusable** — alți dimensions (ADR 016 Vitality, ADR 017 Demographic Prior) folosesc same tiering.
- **Pro tier value clear** — retention 365 zile vs 180 zile pre-launch = differentiator monetization (vezi DECISION_LOG §Pricing locked €60 lifetime / €65/an).

## Consequences (negative)

- **Effort initial 10-15h Sprint 4** implementation (Dexie integration + migration runner + tests + Tier 1 write/read paths în engine).
- **Dexie.js dependency** — auditable (open source, MIT), low risk, dar dependency surface +1.
- **Migration runner risk** — pre-launch test atent pe Daniel + synthetic profiles. Rollback plan în Faza 1 (revert ADR 020 + restore localStorage from Firebase backup).
- **Bundle size** — +30KB pe target PWA budget. Acceptable (~6% din 500KB target).

---

## Risks + mitigation

1. **IndexedDB unreliable on iOS Safari pre-15.4** — known browser bugs (e.g., Safari iOS 14 IndexedDB data loss bug 2021).
   - **Mitigation:** Daniel target Android-first launch (Decision Log 2026-04-27), iOS deferred v1.x post-stability. Cross-ref ADR 002 (PWA browser support).

2. **Storage budget per-user variabil** — user cu 32GB phone vs 256GB phone, browser quota diferit.
   - **Mitigation:** telemetry "storage usage" în Sentry pentru observability. Alert dacă median quota usage > 50% pe cohort.

3. **Dexie.js abandonment** — risc generic open-source (rar pentru proiect 10+ ani).
   - **Mitigation:** migrate la `idb` (Jake Archibald) sau native IndexedDB. Schema portabil (Dexie e wrapper subtire). Cost migration estimate 8-12h.

4. **Migration runner data corruption** — bug în logic transferă jumătate entries.
   - **Mitigation:** Golden Master Suite ADR 018 cu 30+ profile pre-/post-migration assert. Tests Sprint 4 mandatory.

5. **Quota exceeded mid-write** — user atinge 5MB localStorage exact în timpul write critical.
   - **Mitigation:** pre-write size check + force-rotate dacă > 4MB. Defer write Tier 1 dacă Tier 0 full.

---

## Reconsideration triggers

1. **Dexie.js abandoned/unmaintained** — migrate la `idb` (Jake Archibald native IndexedDB wrapper).
2. **Useri raportează slow-down post-tiering** — revisit thresholds, consider read-cache layer.
3. **iOS launch trigger** — re-test IndexedDB behavior pe iOS Safari current, decide tiering iOS-specific (poate retain localStorage-only pe iOS dacă IndexedDB still unreliable).
4. **Pro tier subscription scale >10000 users** — revisit Firebase costs Tier 2, consider self-host backend (Postgres/SQLite + simple API).
5. **Storage budget median >70% pe cohort beta** — accelerate Tier 2 migration threshold (180d → 90d), reduce CDL retention.

---

## Cross-references

- [[001-local-first-storage]] — principiu local-first preserved (extended la IndexedDB).
- [[002-firebase-rest-not-sdk]] — Tier 2 Firebase via REST.
- [[006-tier-storage-for-logs]] — generalizat de ADR 020 (logs = subset CDL Tier 0/1).
- [[011-coach-decision-log-architecture]] — CDL retention 90→180 zile aligned cu Tier 0→Tier 1 cutoff.
- [[018-engine-extensibility-architecture]] — schema versioning + migration runner pattern shared.
- [[ADR_MULTI_TENANT_AUTH_v1]] — per-user namespacing IndexedDB.
- HANDOVER_GLOBAL_2026-04-30_evening §6.7 — effort total update.

---

🦫 **ADR 020 — Storage Tiering Strategy. Foundation extensibilitate. Pre-launch v1 mandatory.**
