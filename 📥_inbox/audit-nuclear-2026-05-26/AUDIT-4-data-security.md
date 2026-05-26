# AUDIT-4 — Data / Auth / Security / Persistence (Nuclear, 2026-05-26)

Slice: data/auth/security/persistence. Read line-by-line, no sampling. Read-only.
Baseline: working tree `main` HEAD as of 2026-05-26.

---

## 1. Coverage — files read line by line

**Scope (all read in full):**
- `src/auth.js` (588 L) — Magic Link, Google OAuth, token refresh, signOut, freshness gate, soft-delete flag, anon-merge probes.
- `src/firebase.js` (389 L) — RTDB REST sync (get/set/remove), getUserPath, syncTo/FromFirebase, DB.set override, schema version, bulkSync.
- `src/util/sentry.js` (135 L) — Sentry init, PII scrub (beforeSend), captureException.
- `src/util/coachDecisionLog.js` (439 L) — CDL append-only, 3-tier demote, idempotency.
- `src/util/featureFlags.js` (363 L) — rollout bucketing, dev override, Kalman flag.
- `src/util/tombstones.js` (265 L) — soft-delete tombstones, filter, GC.
- `src/util/coachReset.js`, `src/util/phaseOverride.js`, `src/util/dataRegistry.js`, `src/util/isoWeek.js`, `src/util/logsMigration.js`.
- `src/storage/db.js` (394 L) — Dexie per-UID namespacing, schema v1/v2, wipeUserDB, wipeAnonymousDBs, tier1* CRUD.
- `src/storage/tieringEngine.js` (407 L) — Tier 0→1 rotation, Web Locks, retry, quota guard.
- `src/migrations/migrationRunner.js`, `MIGRATIONS.js`, `2026-05-02-auth-path-migration.js`, `2026-05-02-tier-5-to-6.js`, `index.js`.
- `src/config/user.js`, `src/config/weights.js`.

**Cross-cutting context read (to answer Daniel questions, outside strict slice):**
- `src/react/routes/screens/Auth.tsx`, `AuthCallback.tsx` — OAuth/Magic Link UI wiring.
- `src/react/routes/screens/cont/DeleteAccountConfirm.tsx` — GDPR Art.17 erasure.
- `src/react/routes/screens/cont/SettingsExport.tsx` (grep) — GDPR Art.20 export.
- `src/react/stores/onboardingStore.ts` (grep) — age gate.
- `src/main.tsx` (grep) — Sentry consent gate.
- `.github/workflows/deploy.yml` L108-137 — env injection.
- `ANDURA_PRIMER.md` §1-§3.

---

## 2. Findings

### CRITICAL
**None that block Beta.** No hardcoded secret keys (Firebase Web API key is public/embeddable per design; placeholder throws fail-fast in prod). No auth bypass. No PII leak in logs (scrubbed + consent-gated). Erasure + export present.

### HIGH

**H-1 — `getUserPath()` falls back to `users/daniel` legacy literal exposure via `USER_PATH` alias.** `firebase.js:40-45`. `getUserPath()` itself is correct (returns `users/<uid>` or `null`), but `USER_PATH = LEGACY_USER_PATH = 'users/daniel'` is still exported and the auth-path migration (`2026-05-02-auth-path-migration.js:75`) reads `users/daniel` with any authenticated token. This relies on Firebase RTDB rules permitting a cross-user read of `users/daniel`. If production rules are now per-uid strict (`auth.uid === $uid`), this read returns 403 and migration silently fails (`status:'failed'`, no Sentry) — harmless for new users (no source data) but means **the rules-vs-code assumption is unverified from the codebase**. If rules are still open on that legacy node, any authed user can read Daniel's old data. **Action: confirm RTDB rules and either lock `users/daniel` or delete the node post-migration.** Not Beta-blocking for new users, but a real data-exposure question only Daniel's Firebase console can close.

**H-2 — RTDB security rules are not in this repo / not auditable here.** All per-UID isolation (`fbGet`/`fbSet`/`fbRemove` write `users/<uid>` with `?auth=<idToken>`) depends entirely on server-side rules enforcing `auth.uid === $uid`. The code is correct *if* rules are correct, but a misconfigured rule (e.g., `.read: true`) would let any authed token read any user's tree and the client code would never know. PRIMER §232 notes "Firebase rules deploy LIVE 09:15:57 UTC" — but the rules file/content is not in scope here. **This is the single largest unverifiable security surface for the slice.** Recommend including `database.rules.json` in repo + a rules unit test before Beta.

### MEDIUM

**M-1 — `syncFromFirebase` merge: local-always-wins, no per-entry LWW.** `firebase.js:288-306`. Documented as known limitation. For object maps (`weights`, `kcals`) `Object.assign({}, remote, local)` makes local clobber remote on same-date conflict regardless of recency. Single-device pre-Beta = no impact; multi-device = silent edit loss. Acceptable for Beta given single-device assumption, but it is a real (documented) data-correctness gap.

**M-2 — Array merge caps at 5000 + dedups only by `e.ts`.** `firebase.js:303`. Entries lacking `ts` collapse (all `undefined` → one survives in the Set). For `logs`/`pr-records` this is fine (always `ts`-stamped), but any future array key without `ts` would silently lose entries on merge. Low likelihood; flagging for forward-safety.

**M-3 — `runAuthPathMigration` verify is key-count `>=`, not deep-equal.** `2026-05-02-auth-path-migration.js:126`. A partial write where dest has *more* top-level keys than source (e.g., a concurrent normal sync already wrote `_ts`/`_device`/`_schemaVersion`) passes verify even if some source keys never landed. Self-documented as intentional bandwidth tradeoff for single-user. Edge, single-user only.

**M-4 — Tombstone filter not applied to all SYNC_KEYS.** `tombstones.js:34` `TS_INDEXED_KEYS = ['logs','coach-decisions','pr-records']`. `session-ratings`, `session-burns`, `early-stops` etc. are also `ts`-indexed arrays synced from Firebase but are NOT tombstone-filtered, so a deleted entry in those keys *can* resurrect on Firebase pull. Memory-Paradox hotfix scope was deliberately narrow, but this is a real (if minor) "deleted thing comes back" surface for non-log entries.

### LOW

**L-1 — `getDeviceId` uses `Math.random` for device id.** `firebase.js:88`. Not security-sensitive (device id is a sync namespace tag + feature-flag bucketing seed, not a token), but inconsistent with the CSPRNG nonce in `buildGoogleSignInUrl` (`auth.js:236`). Bucketing is non-cryptographic by design (`hashStringDjb2` comment). Acceptable.

**L-2 — `generateEntryId` CDL id uses `Math.random` 4-char suffix.** `coachDecisionLog.js:120`. Collision space = 36^4 ≈ 1.6M within same minute+date — effectively zero collision risk for a single user's session cadence. Fine.

**L-3 — `signOut` re-route depends on a window-event listener.** `auth.js:383` dispatches `andura:signedout`. The React side (DeleteAccountConfirm, logout flows) calls `setAuthenticated(false)` directly so it does not rely on the event — but any non-React consumer relying solely on the event must register a listener. Verified React paths set the flag explicitly, so no orphan-session bug here (the §A007 historical CRIT is closed).

**L-4 — `_buildUrl` puts idToken in the URL query (`?auth=<jwt>`).** `firebase.js:99`. This is the documented Firebase RTDB REST contract, but JWTs in URLs land in any intermediary access logs / referrer. Sentry scrubs it (`sentry.js:64` `?auth=` → `[REDACTED]`), and RTDB is HTTPS, so transit is safe. Header-based auth (`Authorization: Bearer`) is not supported by RTDB REST, so this is unavoidable given ADR 002. Residual but inherent.

**L-5 — `wipeAnonymousDBs` enumerates ALL `andura_anonymous_*` DBs on the device and deletes them on any account delete.** `db.js:322-342`. On a shared device with two anonymous users this deletes the *other* anonymous user's DB too. Edge (multi-anon-on-one-device), and account-delete semantics arguably justify it, but worth noting.

### NIT
- **N-1** `firebase.js:45` `USER_PATH` alias marked "removed post-Beta" — dead-weight export, candidate for cleanup.
- **N-2** `config/user.js:9` ships Daniel's real bio defaults (height 183, age 30, startKg 111.4) as `USER_DEFAULTS`. Not PII-at-rest risk (local defaults only), but a new user briefly sees Daniel's numbers until onboarding overwrites. Cosmetic / Gigel-confusing.
- **N-3** `sentry.js:9` `DEFAULT_SENTRY_DSN` hardcoded fallback. DSNs are publicly embeddable (write-only ingest), so not a secret — but it means telemetry routes to Andura's project even if `VITE_SENTRY_DSN` unset. Consent gate (main.tsx) still protects it. Acceptable.

---

## 3. Daniel questions (answered explicitly)

**Q: Any real security hole that blocks Beta (auth bypass / data leak / PII in logs / missing erasure)?**
No Beta-*blocking* hole in the code I can see. Specifically:
- Auth bypass: none. Tokens are short-lived, refresh is deduped (`auth.js:320`), destructive actions gated by `isAuthFresh()` (5-min window), skip-auth keeps data local only.
- PII in logs: **clean.** Sentry is (a) consent-gated — only inits on explicit `telemetryOptIn=true` which defaults false (`main.tsx:30`, test `sentry-consent-gate.test.ts`), and (b) scrubs uid/email/`?auth=` JWT across exception values, message, request.url, user.{email,id,username}, and breadcrumbs incl. `breadcrumb.data.url` (`sentry.js:55-93`). The uid regex is anchored (`uid=`/`/users/<28>`) so it preserves Vite chunk hashes — the past over-broad-regex incident is fixed.
- Missing erasure: **present.** Art.17 wipe (`DeleteAccountConfirm.tsx`) does Tier0 `localStorage.clear()` + Tier1 `wipeUserDB` (IDB) + Tier2 RTDB DELETE, awaits the cloud DELETE with a still-valid token BEFORE signOut (RE-S-01 fix), sets a sync-suppression window so a debounced push can't resurrect, and sweeps anonymous residue. This is genuinely thorough.
- **The one caveat:** data-leak risk is NOT fully closeable from code — it hinges on RTDB rules (H-2) and the legacy `users/daniel` node (H-1), both server-side. Verify those in the Firebase console before GO.

**Q: Any data-loss or migration-corruption risk?**
- Migrations are sound: idempotent (schemaVersion gate), stable-sorted by `fromVersion`, fail-loud to Sentry, abort-and-preserve on throw (remaining entries copied unchanged), non-array keys skipped defensively. Tier 5→6 remap is a pure additive id shift. Dexie schema v1→v2 is additive-only with idempotent backfill. **No migration-corruption risk found.**
- Real (documented, accepted) data-correctness gaps: M-1 (local-wins multi-device), M-4 (tombstones cover only 3 of the synced array keys). Neither loses data in the single-device pre-Beta path. M-1 only bites with two active devices editing the same date.
- Tiering rotation is zero-loss by construction (write Tier1 + verify → only then prune Tier0; retain on failure; Web Locks against cross-tab race).

**Q: Is OAuth genuinely ready (code-side) pending only Daniel's console config?**
**Yes — code-side complete, graceful, env-gated.**
- `Auth.tsx:20-22,73-83`: `VITE_GOOGLE_OAUTH_CLIENT_ID` read at build time; empty → `showGoogle=false`, button hidden, email becomes the primary CTA. No crash, no broken button. Verified graceful degradation.
- `buildGoogleSignInUrl` (`auth.js:231`) builds the OAuth URL with a CSPRNG nonce; `AuthCallback.tsx:35-54` parses `#id_token` from the fragment, exchanges via `signInWithGoogleIdToken` → `accounts:signInWithIdp` REST, clears the hash pre-navigate (anti referrer-leak), then `runPostAuthSync`.
- `deploy.yml:121-125`: secret injected, explicitly documented as optional ("Build succeeds dacă secret missing").
- **Pending only:** Daniel enabling Google in Firebase Console → Sign-in providers + creating the Google Cloud OAuth client + adding the `VITE_GOOGLE_OAUTH_CLIENT_ID` GitHub Secret. Nothing in code is left to do.

**Bonus — k-anonymity (claimed in Terms `Auth.tsx:425` "k-anonimat 5+"):** there is **no k-anonymity / telemetry-aggregation code in `src/`** (grep for k-anon/cohort/MIN_COHORT = zero implementation; "telemetry" hits are only the Sentry consent flag + tiering size telemetry). The k=5 promise is currently a Terms statement with no enforcement code because there is no demographic-aggregation pipeline shipping yet. Not a Beta blocker (no aggregated data is collected — Sentry is error-only + opt-in), but the Terms copy is **ahead of the implementation**. Flag for Daniel: either ship the k-anon aggregation before making the claim, or soften the Terms wording for Beta.

---

## 4. Readiness for this slice

**Code-side: ~90%.**

Justification: The auth/storage/migration/sentry code is genuinely Bugatti-grade — fail-fast on placeholder key, deduped token refresh, freshness-gated destructive actions, await-before-signout erasure with resurrection defense, anchored PII scrubbing that survived the over-broad-regex regression, consent-gated telemetry, idempotent fail-loud migrations, zero-loss tiering with Web Locks. OAuth is code-complete and degrades cleanly. Art.17 erasure and Art.20 export both present and Tier-aware.

The missing ~10% is **not code I can fix — it is server-side verification only Daniel can do:**
1. (H-2) Confirm RTDB rules enforce `auth.uid === $uid` (the entire per-UID isolation model rests on this and is unauditable from the repo). Strongly recommend committing `database.rules.json` + a rules test.
2. (H-1) Lock or delete the legacy `users/daniel` node post-migration.
3. Decide on the k-anonymity Terms-vs-implementation gap (no aggregation pipeline exists yet).

None of these block a single-user/early Beta, but #1 must be visually confirmed in the Firebase console before opening to real users — a wrong rule is a silent total data-leak that the client code cannot detect.
