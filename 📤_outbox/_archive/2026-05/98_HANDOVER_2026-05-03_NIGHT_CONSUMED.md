---
name: HANDOVER_2026-05-03_NIGHT
description: Handover post Rebrand Sweep §36.78 + Hotfix Custom Domain §36.79 + DNS andura.app LIVE + 2 bugs raportate user smoke prod (SW zombie cache self-healing + Firebase 401 auth flow not wired)
date: 2026-05-03 night
session_focus: Rebrand SalaFull → Andura sweep + DNS/HTTPS activation + hotfix custom domain + smoke prod buguri identificate
bandwidth_at_handover: ~15-20% remaining (saturation triggered preventiv anti-halucinație)
cumulative_locked_count: 72 (post §36.79 hotfix)
---

# HANDOVER GLOBAL — 2026-05-03 NIGHT

## §1 — REZUMAT SESIUNE

Sesiune lung ~5h Daniel-time real. 3 milestone-uri majore + 2 buguri raportate end-of-session.

**Milestone-uri completate:**

1. **Memory updates Claude (2 reguli noi, mem #22 + #23):** Alignment questions strict CC din vault SSOT NU Claude chat handover + Pre-flight grep ABSOLUT ÎNAINTE primul artefact tehnic anti-halucinație React/JSX 2026-05-03 slip. Detalii vault VAULT_RULES §HANDOVER_PROTOCOL step 9 + PROMPT_CC_HYGIENE §9.

2. **Domain `andura.app` cumpărat Namecheap** (order #201394291, $13.18 total = €13.18 actual vs €10-15 estimate §31). Auto-renew ON, Domain Privacy free forever, NO PremiumDNS, NO Stellar Hosting.

3. **Rebrand sweep §36.78 EXECUTAT autonomous CC Opus** Phase 1-4 (~25-30 min real, factor 7-9x optimism CONFIRMAT 5x consecutive empirical). Tests 1203 PASS unchanged. Build 3.24s (warmer cache vs 4.715s baseline). 28 historical refs preserved corect (audit trail Bugatti). Cumulative LOCKED 70→71.

4. **DNS Namecheap config + GitHub Pages activation:** 4 A records GitHub Pages IPs + CNAME www, records vechi parkingpage + URL Redirect deleted. GitHub repo rename `salafull` → `andura` manual. Local remote update `git remote set-url origin https://github.com/markaroundthestates-cyber/andura.git`. Custom domain `andura.app` saved + DNS check successful + Enforce HTTPS ON. **Site LIVE la `https://andura.app/` ✅**.

5. **Hotfix §36.79 EXECUTAT autonomous CC Opus** post smoke 404 raport user. Root cause: Phase 2 sweep `vite.config.js base: '/andura/'` corect pentru subpath github.io DAR greșit pentru custom domain root `/`. Fix: vite base `/`, sw.js BASE `''`, CACHE_VERSION bump v1→v2 (anti zombie cache), manifest paths root, src/main.js sw register `/sw.js`, index.html refs root, playwright tests baseURL `https://andura.app`. Tests 1203 PASS. Cumulative LOCKED 71→72.

---

## §2 — STATUS ANDURA V1 PROD CURENT

**Site:** `https://andura.app/` LIVE cu HTTPS ✅
**Service Worker activ:** `andura-v2` (post hotfix §36.79)
**Firebase RTDB:** `fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app` (UID Daniel `2GsDvxqXc4bvQGSm8B1Zft5S05i2` provisioned manual §36.75)
**DB Rules:** per-UID strict published §36.75 (`users/{auth.uid}` access only)
**Firebase Auth:** Magic Link + Google OAuth enabled console, project name "Andura"

---

## §3 — BUGURI RAPORTATE END-OF-SESSION (UNRESOLVED, NEXT CHAT PRIORITY)

### BUG 1: SW zombie cache 404 (SELF-HEALING — NU acțiune necesară)

**Symptom:** browser console primele 8 linii post hard refresh:
```
main-BorYfxhx.css:1  Failed to load resource: 404
main-O1l7mO6Y.js:1   Failed to load resource: 404
manifest.json:1      Failed to load resource: 404
```

**Root cause:** sw `andura-v1` (deployed pre-hotfix §36.79 ~10 min window) cache-uit paths `/andura/...` 404. La hard refresh user, sw vechi încă servea cached paths broken ÎNAINTE să se înregistreze sw nou.

**Verify self-healing:** după linia `sw.js:31 [SW] Activate complete, claiming clients. Version: andura-v2`, log-ul NU mai conține 404 css/js/manifest. Hash-uri noi build (`main-DpDxmZcE.js`, `index-D7JyUQ7S.js`) load OK 200. Asset 404-uri DISAPPEAR post sw v2 activate.

**Decision:** NU bug real, e tranziție expected post CACHE_VERSION bump. La următorul reload normal user post sw v2 activated, totul curat. Daniel poate confirma cu Ctrl+Shift+R a doua oară (force reload post sw v2 controlled).

**Action next chat:** None. Closed. Doar documentat aici pentru audit trail.

### BUG 2: Firebase 401 Unauthorized PERSISTENT (REAL BUG, NEXT CHAT PRIORITY 1)

**Symptom:** repetitiv multiple cycles:
```
GET https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/users/daniel.json 401 (Unauthorized)
PUT https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/users/daniel.json 401 (Unauthorized)
DELETE https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/users/daniel/{applied-patterns,detected-patterns,pattern-learning-cache}.json 401 (Unauthorized)
[Firebase] clearFirebaseKeys: 0/3 removed
```

**Root cause analysis:**
1. Codul `src/firebase.js` are `LEGACY_USER_PATH = 'users/daniel'` ca fallback când `getAuthState()` returnează null (NU autentificat).
2. `getUserPath()` resolver: dacă `auth?.uid` exists → `users/<uid>`, altfel fallback `users/daniel`.
3. Pe `andura.app` proaspăt deschis, Daniel NU a făcut Magic Link sign-in flow → `getAuthState()` = null → resolver returnează `users/daniel` literal.
4. DB Rules per-UID strict §36.75 BLOCHEAZĂ `users/daniel` (no `auth.uid` matches literal "daniel") → 401.
5. App încearcă cycle: get → clearFirebaseKeys (DELETE) → set (PUT) → toate 401.

**Implication critic:** Auth flow Magic Link/OAuth NU complet wired în UI Andura production. Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 NOT landed:
- "index.html route hookup pentru `/auth-callback` — Daniel wires when integrating UI shell (next batch)"
- "Faza 2 banner UX 'Salvează contul' prompt for existing Anonymous users → dedicated 30-min wiring batch"

**Status:** Faza 1 Batch B `src/auth.js` REST helpers + `src/pages/auth.js` UI bare-DOM Magic Link landed code, DAR NU integrate în main app shell. User deschide `andura.app/` → vede dashboard direct (NU forced auth screen) → Firebase calls fail 401.

**Decision LOCKED:** Beta-launch pre-condiție = auth flow integrate complet. Acum este blocking.

**Action next chat (PRIORITY 1):**

Strategic chat NEW design discussion:
- Wireframe auth-first vs auth-banner-soft vs auth-modal patterns (Daniel CEO decizie UX)
- Decizie route auth-callback wire: `/auth-callback?oobCode=...` la app shell main.js sau separate page
- Migration path users existing IndexedDB local data Daniel → post-Magic-Link `users/{uid}` Firebase RTDB
- Wording onboarding auth screen RO (Magic Link primary, Google OAuth secondary)
- Error states UX (email invalid, link expired, network fail)

Apoi prompt CC Opus dedicat pentru:
- Wire `/auth-callback` route în `index.html` + `src/main.js` route handler
- Integrare `createAuthScreen` din `src/pages/auth.js` în main app flow (forced gate dacă `getAuthState() == null`)
- Update `LEGACY_USER_PATH` fallback strategy: dacă custom domain prod + auth required → block dashboard render până auth, NU fallback `users/daniel`
- Tests Playwright e2e flow Magic Link mock + Google OAuth mock
- Smoke prod confirm: user nou pe `andura.app/` vede auth screen, NU dashboard direct

**Estimate:** Strategic chat ~1-2h Daniel-time + CC Opus ~30-45 min real autonomous (factor 7-9x).

---

## §4 — DECIZII LOCKED V1 ACEASTĂ SESIUNE

### §36.78 Rebrand Sweep Phase 1-4 Complete LOCKED V1 (2026-05-03 evening)

**Decizie:** Sweep `salafull` → `andura` execuție completă autonomous CC Opus, 4 phases sequential fail-fast strict. Phase 1 vault docs (164+ .md, 28 historical preserved). Phase 2 source code + PWA manifest + sw.js (CACHE_VERSION reset andura-v1, BASE `/andura`). Phase 3 package.json + lock regen + CI workflows. Phase 4 public/CNAME prep andura.app.

**Refs preserved (data continuity, NOT bug):**
- `src/storage/db.js DB_NAME_PREFIX = 'salafull'` — IndexedDB namespace, rename = local data wipe risk pre-Beta. Migration optional post-Beta.
- `src/storage/__tests__/db.test.js DEFAULT_DB_NAME = 'salafull_users_daniel'`
- `src/storage/__tests__/tieredRead.test.js`
- 28 historical session-log entries vault (audit trail rebrand decision evolution)

**Tests:** 1203 → 1203 PASS unchanged. Build 4.715s → 3.24s (warmer cache). dist size 921 KB ±0.01 KB.

**Empirical:** estimate 3.5-4.5h Opus runtime → actual ~25-30 min (factor 7-9x). Calibration update: factor 5-7x → 7-9x pentru clusters spec-clean confirmat 5x consecutive.

**Cumulative LOCKED count:** +1 (70 → 71)

**Cross-refs:** §30 Rebrand SalaFull → Andura LOCKED 2026-05-01 RESUBMIT + §31 Investiții (€13.18 actual achitat 2026-05-03 Namecheap order #201394291) + §36.74 §BATCH_PROTOCOL.X single LATEST.md final centralizat + §36.77 anti-recurrence rule (pre-flight respected).

### §36.79 Custom Domain Base Path Hotfix LOCKED V1 (2026-05-03 evening late)

**Decizie:** Post §36.78 Phase 1-4 deploy + DNS andura.app activation, smoke prod Daniel raportat 404 toate assets. Root cause Phase 2 vite.config base `/andura/` corect subpath github.io DAR greșit custom domain root `/`. Hotfix surgical 22 files changed (vite + sw + manifest + main + html + playwright).

**Decision LOCKED:** Custom domain `andura.app` = sursa adevărului unic post-launch. URL `markaroundthestates-cyber.github.io/andura/` deprecated. Toate paths config root-relative (`/`).

**CACHE_VERSION bump MANDATORY:** v1 → v2 invalidate sw cache zombie pe browsers care accesat în window-ul broken ~10 min pre-fix.

**Lessons learned ext anti-recurrence:**
- Custom domain deployment ≠ subpath deployment. Pre-rebrand checklist viitor: primul item = "destination URL type subpath sau custom domain root?"
- CACHE_VERSION bump MANDATORY la schema change sw.js base paths
- Phase 4 spec original lipsea sw fetch intercept consideration. Flag pentru custom-domain projects future: spec sw + manifest paths separat de vite base

**Empirical:** estimate ~25 min → actual ~10 min (factor 2.5x — hotfix simplu pattern cunoscut, NU cluster nou). Calibration nuance: factor 7-9x = clusters mari noi, factor 2-3x = hotfix-uri scope-clean.

**Cumulative LOCKED count:** +1 (71 → 72)

**Cross-refs:** §30 + §36.78 (introduced base path mismatch) + §36.77 anti-recurrence rule + §31.

---

## §5 — ROADMAP NEXT CHAT(S)

### Imediat next chat (Priority 1 ABSOLUT)

**Auth flow integration `andura.app` production** — strategic chat NEW design + prompt CC Opus dedicat.

Scope chat strategic:
1. Daniel CEO decizii UX (auth-first vs banner-soft vs modal pattern, wording RO Magic Link primary, error states)
2. Decizie migration path local IndexedDB Daniel → post-auth Firebase `users/{uid}`
3. Decizie route handler `/auth-callback?oobCode=...`

Scope CC Opus:
1. Wire `/auth-callback` route + `createAuthScreen` integration main shell
2. `LEGACY_USER_PATH` fallback strategy update (block dashboard render until auth, NU fallback `users/daniel`)
3. Tests Playwright e2e Magic Link + Google OAuth mock
4. Smoke prod verification

**Estimate Daniel-time:** ~1-2h chat + ~30-45 min CC autonomous.

### Priority 2 (post auth flow live)

**Re-spec 7 BATCH_UI_NN vanilla JS pattern** Path A per §36.77 anti-recurrence rule. Pattern matching `src/components/safetyBanner.js` factory function `(opts) → { element, dispose }`. Strategic chat NEW ~30-45 min + cluster execution autonomous CC Opus ~2-3h actual factor 5-7x.

### Priority 3-N (subsequent)

- Smoke tests prod gates B/C/D pe `andura.app` post Sprint UI live
- Beta cohorts 3-tier 50 users invitation §36.47 + §36.53 Telegram
- Beta sept-dec 2026
- Audit legal €300-500 dec 2026
- Soft Launch 1 ianuarie 2027 🚀

---

## §6 — STATE FOUNDATION INTACT

- 8/8 ADR drafts LOCKED V1 (RIR_MATRIX + MODE_DETECTION_UI + BIAS_DETECTION_OBSERVABLE + OUTLIER_FILTER + CASCADE_DEFENSE + COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON cu EXT-1 + SMART_ROUTING_EQUIPMENT)
- ADR_MULTI_TENANT_AUTH_v1 Faza 1 Batch B code landed (`src/auth.js` REST helpers, `src/pages/auth.js` UI bare-DOM, migrations idempotent), DAR NOT wired în app main shell (BUG 2 cause)
- 8/8 templates LOCKED design-wise
- F-NEW LOCKED V1, MMI LOCKED V1, Storage Full UX LOCKED V1
- 51 strings Phase B INTEGRATED
- Cluster 10-batch foundation tests 1203 PASS unchanged
- Coverage baseline 60.33% lines / 78.38% branches
- Build baseline post-hotfix ~3.2s wall-clock / 921 KB / 283 KB gzipped cold-start
- 70 → 72 cumulative LOCKED count post §36.78 + §36.79

---

## §7 — INFRASTRUCTURE STATUS

| Component | Status |
|-----------|--------|
| Domain `andura.app` | ✅ LIVE, Namecheap order #201394291, $13.18 1 year |
| DNS Namecheap | ✅ 4 A records GitHub IPs + CNAME www → markaroundthestates-cyber.github.io |
| GitHub repo | ✅ Renamed `salafull` → `andura` |
| Local remote | ✅ Updated `https://github.com/markaroundthestates-cyber/andura.git` |
| GitHub Pages custom domain | ✅ `andura.app` saved, DNS check successful, Enforce HTTPS ON |
| Service Worker | ✅ `andura-v2` activated post hotfix §36.79 |
| Firebase Auth | ⚠️ Configured Console (Magic Link + Google OAuth + Andura project), code Faza 1 landed, NU wired în app shell main → BUG 2 |
| Firebase RTDB | ✅ DB rules per-UID strict published §36.75 |
| Firebase UID Daniel | ✅ `2GsDvxqXc4bvQGSm8B1Zft5S05i2` provisioned manual + data import users/{UID} done §36.75 |
| Tests | ✅ 1203 PASS / 75 files unchanged |
| Build prod | ✅ ~3.2s / 921 KB / 283 KB gzipped |

---

## §8 — DANIEL MANUAL ITEMS PENDING (LOW PRIORITY)

1. Local folder rename `C:\Users\Daniel\Documents\salafull` → `andura` (optional, low priority — git și totul funcționează cu nume vechi disk)
2. Email signature update `[Andura V1 Feedback]` (deja LOCKED §29.6 — apply în Outlook/Gmail client)
3. `users/daniel` legacy delete from Firebase RTDB Console post auth flow live + verify migration `users/{uid}` complete (post Priority 1 next chat)

---

## §9 — VERIFICATION QUESTIONS — N/A

Per memory rule #22 LOCKED 2026-05-03 evening: alignment questions = STRICT CC Opus din vault SSOT post-merge, NU Claude chat în handover. Comanda standard "Ingest handover" deja include generare fresh `ALIGNMENT_QUESTIONS_CHAT_NEW.md` cu citation §X file.md + răspuns verbatim.

Acest handover NU include §VERIFICATION QUESTIONS — duplicate work + halucinare risk.

---

## §10 — CROSS-REFS COMPLET

- §30 Rebrand SalaFull → Andura LOCKED 2026-05-01 RESUBMIT
- §31 Investiții (€13.18 andura.app actual achitat)
- §34.2 Blocker 2 Firebase Rules RTDB Lock RESOLVED
- §36.47 Beta Recruitment 50 Users 3 Cohorts
- §36.50-§36.52 Founding pricing tiers
- §36.53-§36.54 Telegram Channel
- §36.55 GDPR Phone Privacy Onboarding (defer launch)
- §36.62 ADR LOCKS (3 drafts → V1)
- §36.63 §BATCH_PROTOCOL codified
- §36.71 Cluster 10-batch session-lock
- §36.72 Sprint UI Sequencing LOCKED V1
- §36.73 Q-Set Resolution
- §36.74 §BATCH_PROTOCOL.X Default Batches + Single Centralized Report
- §36.75 Daniel Solo Gate Firebase Live
- §36.76 Sprint UI 6 UX LOCKED V1
- §36.77 Slip Log + Anti-recurrence Rule
- §36.78 Rebrand Sweep Phase 1-4 Complete (NEW acest handover)
- §36.79 Custom Domain Base Path Hotfix (NEW acest handover)
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 1 Batch B (relevant BUG 2)
- ADR 005 Vanilla JS Stack Decision
- ADR 007 Firebase Open Rules + §AMENDMENT 2026-05-02

---

## §11 — COMANDA INGEST OBLIGATORIE

După drag acest handover în `📥_inbox/` din vault Daniel local:

```
Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL
```

CC Opus citește singur regulile (PROMPT_CC_INGEST_HANDOVER.md SSOT root) + execută merge SSOT 06-sessions-log + archive `📤_outbox/_archive/2026-05/<NN>_HANDOVER_2026-05-03_NIGHT_CONSUMED.md` + generare fresh `ALIGNMENT_QUESTIONS_CHAT_NEW.md` cu citation §36.78 + §36.79 + răspuns verbatim per memory rule #22.

---

*Generat 2026-05-03 night post saturation ~15-20% bandwidth fresh anti-halucinație. Sesiune ~5h Daniel-time real. 2 decizii LOCKED V1 noi (§36.78 + §36.79). 72 cumulative LOCKED count. Andura V1 prod LIVE `andura.app` ✅. BUG 2 Firebase auth flow not wired = next chat Priority 1 ABSOLUT. Per memory rule #22, NU §VERIFICATION QUESTIONS în handover (CC generează post-merge).*
