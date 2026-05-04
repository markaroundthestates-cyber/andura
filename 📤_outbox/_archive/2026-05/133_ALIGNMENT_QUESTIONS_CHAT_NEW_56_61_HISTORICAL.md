# ALIGNMENT QUESTIONS — Chat Strategic NEW (post §56-§61 Auth Flow §36.80 ingest — search-driven format LOCKED V1 per §47)

**Owner:** CC Opus per VAULT_RULES §HANDOVER_PROTOCOL step 9 amendment 2026-05-04 night + PROMPT_CC_HYGIENE §9 amendment + HANDOVER_GLOBAL §47 LOCKED V1.
**Format:** SEARCH-DRIVEN STRICT (per §47 LOCKED V1) — chat strategic NEW **OBLIGAT** să folosească `project_knowledge_search` per Q și să producă extract real din vault. Pre-fed verbatim format DEPRECATED post 2026-05-04 night.
**Pass criteria:** ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW (sau CC Opus Auth Flow implementation Priority 1 ABSOLUT post Daniel manual prep prerequisites).
**Source ingest:** `📤_outbox/_archive/2026-05/128_HANDOVER_2026-05-04_AUTH_FLOW_36_80_RESOLUTION_LOCKED_CONSUMED.md`
**Predecessors archived:** `_archive/2026-05/129_LATEST_PREVIOUS_HANDOVER_INGEST_50_55.md` + `_archive/2026-05/130_ALIGNMENT_QUESTIONS_CHAT_NEW_50_55_HISTORICAL.md`

---

## INSTRUCȚIUNI GLOBALE CHAT STRATEGIC NEW (citește înainte de Q1)

Pentru FIECARE întrebare Q1-Q12:

1. **Folosește `project_knowledge_search`** cu keywords-urile date — NU răspunde din memorie/training.
2. **Citează verbatim** 2-4 propoziții din rezultatul search (NU parafraza, NU rezuma).
3. **Confirmă citation path + §X** match cu hint-ul dat (ex: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md §56.1.3`).
4. **Dacă search NU returnează match** la citation hint → flag explicit "SEARCH MISS — path/section NU găsit" (NU inventa). Acesta = FAIL pe Q-ul respectiv.
5. **Cross-refs verifiable** — dacă răspunsul referențiază alt §X sau alt fișier (ex: `ADR_MULTI_TENANT_AUTH_v1.md §AMENDMENT 2026-05-04`), confirm-l prin a doua căutare.

Daniel verifică spot-check post-paste: search rezultate vs răspuns chat. Mismatch verbatim sau citation eronat = FAIL Q.

---

## Q1: §56.1 Auth Pattern UX & Anonymous Mode — auth-banner-soft + getUserPath() fix code-level + IndexedDB namespace per UID?

**Search keywords:** `"§56.1 Auth Pattern UX"` SAU `"auth-banner-soft Anonymous"` SAU `"getUserPath() returnează obligatoriu null"` SAU `"IndexedDB namespace per UID Dexie multi-DB"` SAU `"andura_${uid}"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.1 (§56.1.1-§56.1.4) + cross-confirm `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04.1

**PASS criteria:**
- Confirm pattern verbatim: "auth-banner-soft (Anonymous + prompt 'Salvează contul')"
- Confirm BUG 2 root cause + fix verbatim: `getUserPath()` returnează **obligatoriu `null`** mode Anonymous (`getAuthState() === null`) → "Eliminăm fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`. Toate apelurile Firebase API blocate când path null → app rulează exclusiv local IndexedDB. Bucla 401 eliminată mecanic."
- Confirm IndexedDB pattern verbatim: `andura_${uid}` dinamic + `andura_anonymous` users neautentificați + logout User A + login User B same device → `andura_UserA` dormant intact + `andura_UserB` separat
- Confirm rationale: "Familie share tablet privacy preserved + Daniel test multi-account safe"

---

## Q2: §56.2 Auth Methods — Google OAuth primary + Magic Link nativ Firebase + PIN custom REJECTED + auth screen wording LOCKED V1?

**Search keywords:** `"§56.2 Auth Methods"` SAU `"Google OAuth primary 1-tap"` SAU `"PIN custom 6-digit REJECTED"` SAU `"sendSignInLinkToEmail handleCodeInApp"` SAU `"Salvează-ți progresul"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.2 (§56.2.1-§56.2.2) + cross-confirm `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04.2

**PASS criteria:**
- Confirm Google OAuth primary rationale: "1-tap login PWA cross-context ZERO issues (Google popup nativ în PWA)"
- Confirm Magic Link technical config verbatim: `sendSignInLinkToEmail` cu `handleCodeInApp: true` + `continueUrl: https://andura.app/auth-callback` + Universal/App Links interceptor
- Confirm PIN custom REJECTED rationale verbatim: "scope creep masiv: SMTP backend + Cloud Function = Blaze plan obligatoriu contradicts §36.93 D3 Spark retain LOCKED"
- Confirm auth screen wording LOCKED V1 toate 6 elemente:
  - Titlu: "Salvează-ți progresul"
  - Subtitlu: "Săptămânile tale de antrenament rămân în siguranță și le poți accesa de pe orice telefon sau tabletă."
  - CTA primar: "Continuă cu Google"
  - CTA secundar: "Trimite-mi link de acces pe e-mail"
  - Loading: "Se trimite link-ul de acces..."
  - Success: "Bine ai venit înapoi!"

---

## Q3: §56.3 Onboarding Position — auth screen DUPĂ T0 + T0 scope 3-5 min max?

**Search keywords:** `"§56.3 Onboarding Position"` SAU `"Auth screen position DUPĂ T0 onboarding"` SAU `"Investment Phase commitment psihologic maxim"` SAU `"5-7 întrebări cheie"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.3

**PASS criteria:**
- Confirm flow verbatim: "User completează profilul (3-5 min max, anti-dropoff Bugatti), vede valoarea ('Acesta este planul tău inițial'), apoi prompt auth 'Salvează-ți profilul ca să nu pierzi datele'"
- Confirm rationale "Investment Phase = commitment psihologic maxim"
- Confirm T0 scope 5-7 întrebări lista: vârstă, sex, istoric medical simplu, obiectiv, frecvență

---

## Q4: §56.4 Migration Strategy — Daniel-only legacy + `_migration` flag schema + rollback strategy?

**Search keywords:** `"§56.4 Migration Strategy Daniel-Only"` SAU `"_migration flag persistent Firestore"` SAU `"sourceLegacy users/daniel"` SAU `"rollback strategy idempotent"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.4 (§56.4.1-§56.4.3)

**PASS criteria:**
- Confirm scope: "Migrare exclusivă cont test. NU funcții Cloud generice (Spark plan retain). Cloud Function multi-tenant generic = post-Beta v1.5"
- Confirm `_migration` flag schema verbatim: `users/{uid}/_migration: { status: 'pending' | 'complete' | 'failed', attemptedAt, sourceLegacy: 'users/daniel' }`
- Confirm rollback verbatim: "Dacă migrare eșuează mid-way (conexiune întreruptă): rollback complet (datele legacy rămân intacte, status `failed`). Sistemul reîncearcă fundal next session cu conexiune activă. Idempotent + zero risc data corruption"

---

## Q5: §56.5 Account Lifecycle — soft delete 30 zile grace + reactivation auth/user-disabled + email change updateEmail nativ?

**Search keywords:** `"§56.5 Account Lifecycle"` SAU `"soft delete 30 zile grace"` SAU `"hard delete imediat REJECTED"` SAU `"auth/user-disabled"` SAU `"updateEmail Firebase Auth"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.5 (§56.5.1-§56.5.6)

**PASS criteria:**
- Confirm hard delete REJECTED rationale: "NUKE risk Maria 65 + GDPR 'without undue delay' permite 30 zile + audit-trail nuked atomic = no recovery"
- Confirm soft delete mecanism 4 steps: Firestore `users/{uid}/_deleted` flag + Firebase Auth disabled (NU delete) + 30 zile recovery + post-30 cascade real
- Confirm reactivation flow `auth/user-disabled` catch + email contact `suport@andura.app`
- Confirm wording UI LOCKED V1 reactivation verbatim: "Acest cont este dezactivat și programat pentru ștergere definitivă. Dacă te-ai răzgândit și vrei să îl reactivezi, trimite un e-mail la suport@andura.app în termenul de 30 de zile de la solicitare."
- Confirm email change `updateEmail` retains `uid` + Firestore `users/{uid}` neschimbat + ZERO migrare
- Confirm conflict detection wording LOCKED V1: "Această adresă de e-mail este deja folosită pentru alt cont. Folosește o altă adresă sau contactează asistența."
- Confirm typo guard wording LOCKED V1: "Aceasta este deja adresa ta de e-mail curentă."

---

## Q6: §56.6 Multi-device + §56.7 Anonymous→Auth Merge — record-level LWW + Fork Decision + archive 7 zile?

**Search keywords:** `"§56.6 Multi-device"` SAU `"Record-level Last-Write-Wins"` SAU `"§56.7 Anonymous Auth Merge"` SAU `"Fork Decision UI"` SAU `"archive 7 zile export local JSON"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.6 (§56.6.1-§56.6.2) + §56.7 (§56.7.1-§56.7.2)

**PASS criteria:**
- Confirm Record-level LWW pre-Beta + field-level CRDT REJECTED rationale: "scope creep ~5-10h dev solo + edge cases multiple. Field-level merge defer v1.5 când avem real conflict telemetry"
- Confirm Fork Decision UI verbatim: "Am găsit un istoric în cloud. Ce vrei să păstrezi? [Datele din Cloud] sau [Datele de pe acest Telefon]?"
- Confirm suprascriere REJECTED rationale: "Maria 65 click greșit = data loss permanent"
- Confirm archive mecanism 4 elemente: Backup local automat `andura-backup-{timestamp}.json` IndexedDB + Arhivă Firestore `_archived/{uid}/{timestamp}` 7 zile + Recovery 7 zile restore button Settings + Post 7 zile cascade real
- Confirm wording LOCKED V1 archive: "Datele din [Telefon/Cloud] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări."

---

## Q7: §56.8 GDPR & Legal — double bifa Privacy + ToS + biometrice REJECTED + liability absolute REJECTED rationale RO consumer law?

**Search keywords:** `"§56.8 GDPR & Legal"` SAU `"double checkbox privacy ToS"` SAU `"biometrice REJECTED"` SAU `"OUG 21/1992 Codul Civil EU Consumer Rights Directive"` SAU `"în măsura permisă de lege"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.8 (§56.8.1-§56.8.3) + cross-confirm `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md`

**PASS criteria:**
- Confirm double bifa text exact 2 checkbox-uri:
  - "Sunt de acord cu Politica de Confidențialitate"
  - "Sunt de acord cu Termenii de Utilizare și înțeleg că folosesc aplicația pe propriul risc."
- Confirm sub-text login: "Datele tale de antrenament rămân strict private — niciodată vândute, niciodată partajate."
- Confirm "biometrice" REJECTED rationale: "legal risc + trigger trust panic Gigel + Andura NU colectează biometric data în sens GDPR"
- Confirm Privacy Policy V1 Beta template 5 puncte (ce date / unde / retenție 30 zile grace / Firebase subprocessor / contact suport@andura.app)
- Confirm ToS V1 Beta template 4 puncte (utilizare risc / NU sfat medical / modificare serviciu / limitare răspundere "în măsura permisă de lege")
- Confirm liability absolute REJECTED rationale verbatim: "RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83 — NU enforceable absolute, retain răspundere neglijență gravă/dol"

---

## Q8: §56.9 Sunset & Beta Gate — Anonymous post-Beta v1.5 + 30 zile grace + 1 ianuarie 2027 target Quality>Speed?

**Search keywords:** `"§56.9 Sunset Timeline Beta Gate"` SAU `"sunset Anonymous mode post-Beta v1.5 + 30 zile grace"` SAU `"1 ianuarie 2027 optimistic"` SAU `"Quality > Speed strict"` SAU `"Realism Bugatti audit"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.9 (§56.9.1-§56.9.2)

**PASS criteria:**
- Confirm sunset Anonymous mode "post-Beta v1.5 + 30 zile grace period" + "v1.5 utilizatori anonimi primesc notificare 'salvarea în cloud devine obligatorie' + 30 zile pentru tranziție"
- Listă MUST-HAVE v1.0 Beta (5 elemente):
  - Google OAuth (primary) + Firebase Email Link (fallback PWA Android)
  - Auto-migrare transparentă Daniel-only (`_migration` flag retry silent)
  - Onboarding-first flow + auth la final post-T0 (post "planul tău")
  - Consimțământ GDPR simplificat (privacy policy + ToS bife separate)
  - Soft delete 30 zile grace + reactivare manual contact
- Listă Defer v1.5+ (8 elemente — alerte securitate / pagini complexe sesiuni / SMS recovery / Cloud Function generic / field-level LWW / deep linking / logout all devices / iOS Universal Links)
- Confirm Realism Bugatti audit verbatim: "1 ian 2027 = ~8 luni de acum, Daniel solo + work + copil mic + ADR 026 compile pending + Periodization Engine spec (~3-4 chats) + Engine #8 sub-decisions + audit legal + Beta recruitment 50 testeri. Quality > Speed strict — testarea Beta septembrie 2026 dacă arată şlefuire necesară, decalare fără ezitare."

---

## Q9: §56.10 PWA Cross-Context — Magic Link Universal Links Android only + iOS scope cut + TWA wrap v1.5 contingent?

**Search keywords:** `"§56.10 PWA Cross-Context Platform Strategy"` SAU `"Universal Links Android only pre-Beta"` SAU `"iOS scope cut defer v2/v3"` SAU `"Apple Developer 99/an"` SAU `"TWA wrap Android v1.5 contingent rate fail >30%"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.10 (§56.10.1-§56.10.3)

**PASS criteria:**
- Confirm Android Links technical: `assetlinks.json` în `.well-known/` + click email PWA installed → OS interceptează → deschide direct PWA
- Confirm iOS scope cut rationale: "Apple Developer account ($99/an) + bundle ID + `apple-app-site-association` setup. Pre-Beta solo dev = scope creep nejustificat" + iOS users pre-Beta "comportament browser default acceptabil, document fallback manual ghid testare"
- Confirm TWA wrap rationale verbatim: "Pre-Beta PWA puro: ~70-80% click email deschide PWA nativ; ~20-30% deschide browser default. Accept partial pre-Beta (50 testeri tolerant)" + "Plan TWA wrap Android v1.5 dacă rate fail >30%. NU bloc launch."

---

## Q10: §56.11-§56.12 Session Persistence + Logout — always logged in + offline non-blocking + IndexedDB preserve at logout REJECTED wipe?

**Search keywords:** `"§56.11 Session Persistence"` SAU `"Always Logged In indexedDBLocalPersistence"` SAU `"§56.12 Logout Behavior"` SAU `"Wipe IndexedDB la logout REJECTED"` SAU `"opt-in toggle Settings advanced default OFF"` SAU `"unsynced data warning calm"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.11 (§56.11.1-§56.11.2) + §56.12 (§56.12.1-§56.12.3)

**PASS criteria:**
- Confirm session persistence verbatim: "Firebase SDK `indexedDBLocalPersistence` + refresh token forever default. Token ID 1h auto-refresh background"
- Confirm offline banner wording: "Mod offline. Conectează-te la internet pentru a-ți sincroniza datele în cloud."
- Confirm wipe REJECTED rationale 4 motive verbatim: "bandwidth + battery cost re-fetch full history 5-15MB / 30-60s; quota Spark burn risk; offline-post-logout edge case blocked complet; trust break Maria 65 percepe slow"
- Confirm logout mecanism 5 elemente: default clear auth tokens + session state / `andura_${uid}` rămâne intact / next login same UID instant + delta sync background / different UID open `andura_${new_uid}` fresh / opt-in toggle Settings "Șterge datele de pe acest dispozitiv la deconectare" default OFF
- Confirm unsynced data warning wording LOCKED V1: "Ai X modificări nesincronizate în cloud. Acestea vor rămâne salvate pe acest telefon. Dacă te deconectezi acum, ele nu vor fi vizibile pe alte dispozitive până nu revii."
- Confirm "le poți pierde definitiv" REJECTED rationale: "inaccurate — IndexedDB local rămâne, NU panic"

---

## Q11: §56.14-§56.16 Cleanup A+B + Telemetry Spark + Firestore Rules v1 extended?

**Search keywords:** `"§56.14 Cleanup Mechanism A + B Fallback"` SAU `"admin-cleanup.js manual weekly"` SAU `"_telemetry/global FieldValue.increment"` SAU `"Spark plan compatible"` SAU `"Firestore Security Rules v1 pre-Beta"` SAU `"_deleted _archived per-UID"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.14 (§56.14.1-§56.14.3) + §56.15 (§56.15.1-§56.15.2) + §56.16 (§56.16.1)

**PASS criteria:**
- Confirm Cleanup A: `admin-cleanup.js` Daniel weekly duminică ~5min identifică + șterge `_deleted/` >30 zile + `_archived/` >7 zile
- Confirm Cleanup B client-side fallback: "user activ deschide app: verifică timestamps locale propriile date `_deleted/` + `_archived/`. Depășire termenelor → cerere ștergere noduri specifice. Defense in depth users inactive 60+ zile"
- Confirm Cleanup C deferred post-Beta v1.5 rationale: "Blaze plan upgrade nejustificat pre-Beta (contradicts §36.93 D3 Spark retain LOCKED)"
- Confirm telemetry events 4 listă: `onboarding_started` + `onboarding_completed` + `auth_prompt_shown` + `auth_completed`
- Confirm telemetry storage `_telemetry/global` Firestore + `FieldValue.increment(1)` direct client-side Spark plan compatible
- Confirm Firestore Security Rules v1 pre-Beta block code 3 match patterns:
  - `match /users/{uid}` → `request.auth != null && request.auth.uid == uid`
  - `match /_deleted/{uid}` → same
  - `match /_archived/{uid}/{docId}` → same
- Confirm `_migration` flag în interior `users/{uid}` document beneficiază automat aceleași rules (per-UID strict §36.75 preserved + extended)

---

## Q12: §56.18 Daniel Manual Setup + §57 Cumulative 243 + §59 DIFF_FLAGS HANDOVER split TRIGGERED 7214 LOC?

**Search keywords:** `"§56.18 Daniel Manual Setup Checklist"` SAU `"Firebase Auth Console setup authorized domains"` SAU `"suport@andura.app MX records Namecheap"` SAU `"§57 Cumulative LOCKED Count Update"` SAU `"243 LOCKED V1"` SAU `"§59 DIFF_FLAGS HANDOVER_GLOBAL split FLAG"` SAU `"7214 LOC > 7000 threshold"`

**Citation expected:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.18 + §57 + §58 + §59 + cross-confirm `DIFF_FLAGS.md` (root) + `00-index/INDEX_MASTER.md` (last updated stamp)

**PASS criteria:**
- Confirm Daniel manual setup 2 task-uri Pre-CC + estimates:
  - §56.18.1 Firebase Auth Console: 4 elemente (authorized domains `andura.app` + Email Template Magic Link RO + Google OAuth Client ID + Action URL `https://andura.app/auth-callback`) + ~15 min
  - §56.18.2 Email infrastructure: MX Namecheap → forward Daniel personal sau Google Workspace ($6/lună/user) sau temp `andura.suport@gmail.com` + ~15 min
- Confirm cumulative cifră exactă 216 → **243** (+27 substantive net Auth Flow §36.80)
- Confirm breakdown decomposition: "4 auth pattern + 2 methods/UI + 2 onboarding + 3 migration + 6 lifecycle + 2 multi-device + 2 merge + 3 GDPR/legal + 2 sunset/gate + 3 PWA + 2 persistence/offline + 3 logout + 1 network + 3 cleanup + 2 telemetry + 1 DB rules + 1 SW + 2 Daniel manual + 3 scope-out — overlap = 27 net"
- Confirm Priority 1 ABSOLUT CC implementation pending: ~30-45 min CC autonomous factor 7-9x clusters mari, scope cross-file integrare ~10 fișiere
- Confirm DIFF_FLAGS HANDOVER split FLAG status verbatim: "TRIGGERED post §56-§61 ingest 7214 LOC > 7000 threshold" + Daniel decision required plan split strategy concrete chat strategic NEW dedicat
- Confirm Privacy Policy + ToS V1 Beta initial drafts created vault: `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (verbatim §56.8.2/3 LOCKED V1 templates) + Daniel validate sprint 30-60 min pre-Beta

---

## Pass / Fail Criteria

| Score | Status | Action Daniel |
|-------|--------|---------------|
| 12/12 | EXCELLENT | Search-driven verification full PASS — chat poate naviga vault SSOT autonomous post §56-§61 ingest masiv (35 sub-decisions Auth Flow). PROCEED CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT (post Daniel manual prep prerequisites complete). |
| 10-11/12 | PASS | PROCEED, flag specific Q-uri missed pentru re-sync targeted dacă material critical (especially §56.1.3 BUG 2 fix code-level + §56.5.2 soft delete + §56.7.2 archive 7 zile + §56.16 Firestore Rules = high-impact LOCKED V1). |
| <10/12 | FAIL | RE-SYNC mandatory: chat strategic NEW NU navighează vault corect. Re-paste alignment questions după chat full Project Knowledge sync, sau regenerare handover dacă SSOT incomplete. Verifică sync `01-vision/` (PRIVACY_POLICY + TERMS_OF_SERVICE noi) + `03-decisions/` (ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04) + `06-sessions-log/` + root `VAULT_RULES.md` + `PROMPT_CC_HYGIENE.md` + `DIFF_FLAGS.md`. |

**Spot-check Daniel post-paste:**
1. Chat răspunde Q1 cu citation `§56.1.3` + extract verbatim "obligatoriu null"? → Daniel grep `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §56.1.3 → match verbatim?
2. Chat răspunde Q2 cu auth screen wording 6 elemente? → Daniel grep §56.2.2 → wording match?
3. Chat răspunde Q5 cu reactivation wording verbatim "trimite un e-mail la suport@andura.app în termenul de 30 de zile"? → Daniel grep §56.5.3 → match?
4. Chat răspunde Q8 cu MUST-HAVE v1.0 Beta 5 elemente + Defer v1.5+ 8 elemente? → Daniel grep §56.9.2 → liste match?
5. Chat răspunde Q11 cu Firestore Rules code block 3 match patterns? → Daniel grep §56.16.1 → cod match?
6. Chat răspunde Q12 cu cifră exactă "7214 LOC > 7000 threshold" + "243 LOCKED V1"? → Daniel grep DIFF_FLAGS + §57 → cifre match?
7. Chat raportează "SEARCH MISS" pe orice Q? → flag explicit, NU inventa.

---

🦫 **12 Q-uri search-driven format STRICT (per §47 LOCKED V1 + VAULT_RULES amendment + PROMPT_CC_HYGIENE amendment) covering §56.1 Auth Pattern UX (Q1) + §56.2 Auth Methods (Q2) + §56.3 Onboarding Position (Q3) + §56.4 Migration (Q4) + §56.5 Account Lifecycle (Q5) + §56.6+§56.7 Multi-device + Merge (Q6) + §56.8 GDPR & Legal (Q7) + §56.9 Sunset & Beta Gate (Q8) + §56.10 PWA Cross-Context (Q9) + §56.11+§56.12 Session + Logout (Q10) + §56.14-§56.16 Cleanup + Telemetry + Rules (Q11) + §56.18 Daniel Setup + §57 Cumulative 243 + §59 DIFF_FLAGS split TRIGGERED (Q12). Pass criteria ≥10/12 (≥83%). Source ingest archived `_archive/2026-05/128_*`. Predecessors archived `_archive/2026-05/129_*` + `_archive/2026-05/130_*`.**

**Andura needs to be the best. ✊**
