# HANDOVER — Auth Flow §36.80 BUG 2 Firebase 401 RESOLUTION (chat strategic 2026-05-04)

**Status:** Chat strategic dedicat Auth Flow §36.80 BUG 2 Firebase 401 production blocker. **35 substantive sub-decisions LOCKED V1** ready compile + CC Opus implementation dedicat. Cumulative LOCKED 216 → **243** (+27 substantive net).

**Source:** Chat strategic 2026-05-04 evening Daniel (CEO + Product) + Claude (Co-CTO) cu push-back challenge multiple iteration (PIN custom REJECTED → Magic Link nativ Firebase reused; hard delete imediat REJECTED → soft delete 30 zile grace; LWW field-level REJECTED → record-level pre-Beta; Fork Decision suprascrie definitiv REJECTED → archive 7 zile + export local backup; iOS Universal Links REJECTED → Android-only pre-Beta + iOS v2/v3 demand-driven; logout wipe IndexedDB REJECTED → preserve local + opt-in toggle Settings; ToS liability absolute REJECTED → "în măsura permisă de lege" + retain neglijență gravă).

**Context arhitectural confirmat:**
- §36.80 BUG 2 root cause: `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit
- Faza 1 Batch B `src/auth.js` REST helpers + `src/pages/auth.js` UI bare-DOM Magic Link landed code DAR NOT integrate în main app shell
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 2 (banner UX + auth-callback route) NOT landed
- App `andura.app` LIVE prod (post §36.78 Phase 1-4 + §36.79 hotfix + §36.80 DNS LIVE) DAR auth flow not wired = users blocați 401
- Beta-launch pre-condiție: auth flow integrat complet (LOCKED §36.80 decizie pre-acest-chat)

---

## §56 AUTH FLOW §36.80 RESOLUTION SUB-DECISIONS LOCKED V1

### §56.0 Status: ✅ COMPLETE

Chat strategic dedicat Auth Flow §36.80 production blocker. 35 substantive sub-decisions LOCKED V1 acoperind: auth pattern UX + Anonymous mode + auth methods + onboarding position + migration strategy + account lifecycle (delete/recovery/email change) + multi-device sync + Anonymous→Auth merge + GDPR/legal + sunset timeline + PWA cross-context + session persistence + offline UX + logout behavior + network resilience + cleanup mechanism + telemetry + DB rules + auth wording + Daniel manual setup + scope out v1.5+.

### §56.1 Auth Pattern UX & Anonymous Mode Preserve

#### §56.1.1 Auth pattern UX — auth-banner-soft (Anonymous + prompt "Salvează contul") ✅ LOCKED

User intră direct în aplicație. Datele se salvează local IndexedDB prin Dexie.js. Banner discret amintește "Salvează-ți progresul" non-blocking. Previne abandon masiv prima impresie. Bugatti F4 Maria 65 frictionless.

#### §56.1.2 Anonymous mode preserve — fallback local-first ✅ LOCKED

Per ADR_MULTI_TENANT_AUTH_v1 Faza 1-2 design preserved. User poate rula app local fără cont. Auth devine necesar DOAR pentru sincronizare multi-device.

#### §56.1.3 Code-level fix `getUserPath()` ✅ LOCKED V1 (BUG 2 root cause resolution)

În mod Anonymous (`getAuthState() === null`), `getUserPath()` returnează **obligatoriu `null`**. Eliminăm fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`. Toate apelurile Firebase API blocate când path null → app rulează exclusiv local IndexedDB. Bucla 401 eliminată mecanic.

#### §56.1.4 IndexedDB namespace per UID — Dexie multi-DB ✅ LOCKED

DB locală instanțiată dinamic: `andura_${uid}`. Pentru utilizatori neautentificați: `andura_anonymous`. La logout User A + login User B same device: `andura_UserA` rămâne dormant intact, `andura_UserB` se deschide separat. Familie share tablet privacy preserved + Daniel test multi-account safe.

### §56.2 Auth Methods & UI Wording

#### §56.2.1 Google OAuth primary + Firebase Email Link nativ fallback ✅ LOCKED

Google OAuth = 1-tap login PWA cross-context ZERO issues (Google popup nativ în PWA). Firebase Email Link = `sendSignInLinkToEmail` cu `handleCodeInApp: true` + `continueUrl: https://andura.app/auth-callback` + Universal/App Links interceptor. **PIN custom 6-digit REJECTED** (scope creep masiv: SMTP backend + Cloud Function = Blaze plan obligatoriu contradicts §36.93 D3 Spark retain LOCKED).

#### §56.2.2 Auth screen wording LOCKED V1 ✅ LOCKED

- **Titlu:** "Salvează-ți progresul"
- **Subtitlu:** "Săptămânile tale de antrenament rămân în siguranță și le poți accesa de pe orice telefon sau tabletă."
- **CTA primar (Google):** "Continuă cu Google"
- **CTA secundar (Email):** "Trimite-mi link de acces pe e-mail"
- **Loading:** "Se trimite link-ul de acces..."
- **Success:** "Bine ai venit înapoi!"

### §56.3 Onboarding Position & Email Timing

#### §56.3.1 Auth screen position — DUPĂ T0 onboarding ✅ LOCKED

User completează profilul (3-5 min max, anti-dropoff Bugatti), vede valoarea ("Acesta este planul tău inițial"), apoi prompt auth "Salvează-ți profilul ca să nu pierzi datele". Investment Phase = commitment psihologic maxim. Profilare profundă (Tier-based feature unlock) treptat post-auth, NU prima atingere.

#### §56.3.2 T0 onboarding scope — 3-5 min max (5-7 întrebări cheie) ✅ LOCKED

Scope minimal: vârstă, sex, istoric medical simplu, obiectiv, frecvență. Anti-fricțiune dropoff conversion T0→Auth.

### §56.4 Migration Strategy Daniel-Only

#### §56.4.1 Migration scope — Daniel `users/daniel` legacy ONLY pre-Beta ✅ LOCKED

Migrare exclusivă cont test. NU funcții Cloud generice (Spark plan retain). Cloud Function multi-tenant generic = post-Beta v1.5.

#### §56.4.2 `_migration` flag persistent Firestore ✅ LOCKED

Schema: `users/{uid}/_migration: { status: 'pending' | 'complete' | 'failed', attemptedAt, sourceLegacy: 'users/daniel' }`. La fiecare deschidere app, dacă status `pending`/`failed` → retry silent până success complet. ZERO notificări eroare user.

#### §56.4.3 Migration rollback strategy ✅ LOCKED

Dacă migrare eșuează mid-way (conexiune întreruptă): rollback complet (datele legacy rămân intacte, status `failed`). Sistemul reîncearcă fundal next session cu conexiune activă. Idempotent + zero risc data corruption.

### §56.5 Account Lifecycle — Recovery, Deletion, Email Change

#### §56.5.1 Recovery email lost access — refusal pattern explicit ✅ LOCKED

Pre-Beta NU include verificare SMS sau email secundar. Avertisment clar la creare cont. **Wording UI exact LOCKED V1:**

> "Contul tău în cloud nu mai poate fi accesat. Totuși, datele tale de antrenament de pe acest dispozitiv sunt în siguranță și rămân aici. Pierzi doar sincronizarea automată cu alte telefoane sau tablete."

NU panic "data pierdută". Bugatti F4 cognitive Maria 65 calm.

#### §56.5.2 Account deletion GDPR Article 17 — Soft delete 30 zile grace ✅ LOCKED

**Hard delete imediat REJECTED** (NUKE risk Maria 65 + GDPR "without undue delay" permite 30 zile + audit-trail nuked atomic = no recovery).

Mecanism:
- Firestore: `users/{uid}/_deleted: { requestedAt, scheduledHardDelete }` flag
- Firebase Auth: cont **disabled** imediat (NU delete)
- Recovery 30 zile: user "M-am răzgândit" → reactivare manual (vezi §56.5.3)
- Post 30 zile: hard delete cascade `users/{uid}` Firestore + Firebase Auth user delete + IndexedDB local wipe automat

#### §56.5.3 Reactivation flow — catch `auth/user-disabled` + email contact ✅ LOCKED

User cu cont disabled încearcă login → Firebase Auth returnează `auth/user-disabled`. **Wording UI exact LOCKED V1:**

> "Acest cont este dezactivat și programat pentru ștergere definitivă. Dacă te-ai răzgândit și vrei să îl reactivezi, trimite un e-mail la suport@andura.app în termenul de 30 de zile de la solicitare."

Pre-Beta 50 testeri: email forward Daniel personal manual. Decision flag: `suport@andura.app` MX setup Namecheap pre-Beta launch (Daniel manual task).

#### §56.5.4 Email change — retain `uid` + Firebase `updateEmail` nativ ✅ LOCKED

Schimbare email NU modifică `uid`. Magic Link pe noua adresă → validate → `updateEmail` Firebase Auth. Nodul Firestore `users/{uid}` rămâne neschimbat. ZERO migrare.

#### §56.5.5 Email change conflict detection — preventive check ✅ LOCKED

Înainte `updateEmail`, sistem verifică în fundal dacă noua adresă aparține deja altui cont existent. **Wording UI exact LOCKED V1 conflict:**

> "Această adresă de e-mail este deja folosită pentru alt cont. Folosește o altă adresă sau contactează asistența."

#### §56.5.6 Email change — current address typo guard ✅ LOCKED

Pre-flight check: `newEmail === auth.currentUser.email` → return early. **Wording UI exact LOCKED V1:**

> "Aceasta este deja adresa ta de e-mail curentă."

### §56.6 Multi-device & Concurrent Sessions

#### §56.6.1 Multi-device same-account — silent sync transparent ✅ LOCKED

Datele sincronizează automat Firestore eventual consistency. NU ecrane confirmare device nou pre-Beta. Experiența curată.

#### §56.6.2 Concurrent session conflict — Record-level Last-Write-Wins ✅ LOCKED

**Field-level LWW (CRDT-light) REJECTED** pre-Beta (scope creep ~5-10h dev solo + edge cases multiple). Record-level LWW: timestamp global per înregistrare, cel mai recent document complet rescrie tot. Field-level merge defer v1.5 când avem real conflict telemetry.

### §56.7 Anonymous → Auth Merge (Conflict Existing Account)

#### §56.7.1 Fork Decision UI — explicit user resolution ✅ LOCKED

User Anonymous click "Salvează contul" + email cu data preexistente Firestore: ecran Fork Decision "Am găsit un istoric în cloud. Ce vrei să păstrezi? [Datele din Cloud] sau [Datele de pe acest Telefon]?"

#### §56.7.2 Sursa respinsă — archive 7 zile + export local JSON ✅ LOCKED

**Suprascriere definitivă REJECTED** (Maria 65 click greșit = data loss permanent).

Mecanism:
- **Backup local automat:** export `andura-backup-{timestamp}.json` salvat IndexedDB
- **Arhivă Firestore:** `_archived/{uid}/{timestamp}` 7 zile retenție
- **Recovery:** user "Greșit am ales" 7 zile → restore button Settings
- **Post 7 zile:** cascade real

**Wording UI exact LOCKED V1:**

> "Datele din [Telefon/Cloud] au fost arhivate. Le poți recupera timp de 7 zile din zona de Setări."

### §56.8 GDPR & Legal

#### §56.8.1 GDPR consent pe auth screen — explicit + privacy/ToS double checkbox ✅ LOCKED

Două bife obligatorii separate:
- `[ ]` Sunt de acord cu Politica de Confidențialitate
- `[ ]` Sunt de acord cu Termenii de Utilizare și înțeleg că folosesc aplicația pe propriul risc.

Sub butonul de login: "Datele tale de antrenament rămân strict private — niciodată vândute, niciodată partajate."

**Termen "biometrice" REJECTED** (legal risc + trigger trust panic Gigel + Andura NU colectează biometric data în sens GDPR).

#### §56.8.2 Privacy policy template `privacy-policy.md` minimal V1 Beta ✅ LOCKED

```markdown
# Politica de Confidențialitate Andura (v1.0 Beta)

1. **Ce date colectăm:** Salvăm exclusiv jurnalele de antrenament (exerciții, seturi, repetiții) și opțiunile tale din profilul de onboarding pentru a-ți genera programul de fitness.
2. **Unde sunt ținute datele:** Datele sunt stocate local pe telefonul tău și în cloud pe serverele Google Firebase.
3. **Retenție și Ștergere:** Datele tale sunt păstrate doar atât timp cât folosești aplicația. Dacă alegi să îți ștergi contul, datele tale vor fi complet eliminate după o perioadă de grație de 30 de zile.
4. **Furnizori de infrastructură:** Datele tale nu sunt vândute, închiriate sau partajate cu terțe părți pentru marketing sau publicitate. Folosim Google Firebase ca furnizor de infrastructură (găzduire securizată) — vezi politica Google Firebase.
5. **Contact:** Pentru întrebări sau suport tehnic, ne poți scrie direct la **suport@andura.app**.
```

**Daniel write/validate sprint 30-60 min pre-Beta.** Audit legal complet + GDPR profundă defer v1.5 (§46 P4 prerequisite).

#### §56.8.3 ToS template `terms-of-service.md` minimal V1 Beta ✅ LOCKED

```markdown
# Termeni și Condiții Andura (v1.0 Beta)

1. **Utilizare pe propriul risc:** Utilizarea aplicației și executarea exercițiilor sugerate se fac exclusiv pe riscul tău. Andura nu își asumă nicio responsabilitate pentru eventualele accidentări.
2. **Fără sfat medical:** Andura este un asistent AI de fitness, NU un medic, fizioterapeut sau antrenor personal certificat. Consultă un specialist înainte de a începe orice program de efort fizic.
3. **Modificarea serviciului:** Ne rezervăm dreptul de a modifica, suspenda sau opri funcționarea aplicației în orice moment pe parcursul fazei de testare Beta.
4. **Limitarea răspunderii:** În măsura maximă permisă de legea aplicabilă, Andura și dezvoltatorii săi nu răspund pentru daune indirecte, accidentale sau de consecință rezultate din utilizarea aplicației. Această clauză nu limitează răspunderea pentru cazuri de neglijență gravă sau dol, conform legii.
```

**Liability waivers absolute REJECTED** (RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83 — NU enforceable absolute, retain răspundere neglijență gravă/dol).

### §56.9 Sunset Timeline & Beta Gate

#### §56.9.1 Sunset Anonymous mode — post-Beta v1.5 + 30 zile grace period ✅ LOCKED

Modul Anonymous preserve toată durata Beta. Începând v1.5, utilizatori anonimi primesc notificare "salvarea în cloud devine obligatorie" + 30 zile pentru tranziție.

#### §56.9.2 Beta launch gate minimum — target 1 ianuarie 2027 (optimistic) ✅ LOCKED

**MUST-HAVE v1.0 Beta:**
- Google OAuth (primary) + Firebase Email Link (fallback PWA Android)
- Auto-migrare transparentă Daniel-only (`_migration` flag retry silent)
- Onboarding-first flow + auth la final post-T0 (post "planul tău")
- Consimțământ GDPR simplificat (privacy policy + ToS bife separate)
- Soft delete 30 zile grace + reactivare manual contact

**Defer v1.5+:**
- Alerte securitate dispozitive noi
- Pagini complexe management sesiuni active
- Recovery prin metode secundare (SMS / email backup)
- Cloud Function generic multi-tenant migration
- Field-level LWW merge
- Deep linking
- Logout all devices revoke refresh tokens
- iOS Universal Links (TWA wrap Android v1.5 contingent rate fail >30%)

**Realism Bugatti audit:** 1 ian 2027 = ~8 luni de acum, Daniel solo + work + copil mic + ADR 026 compile pending + Periodization Engine spec (~3-4 chats) + Engine #8 sub-decisions + audit legal + Beta recruitment 50 testeri. Quality > Speed strict — testarea Beta septembrie 2026 dacă arată şlefuire necesară, decalare fără ezitare.

### §56.10 PWA Cross-Context & Platform Strategy

#### §56.10.1 Magic Link cross-context — Universal Links Android only pre-Beta ✅ LOCKED

`sendSignInLinkToEmail` + `handleCodeInApp: true` + `continueUrl: https://andura.app/auth-callback`. Android App Links via `assetlinks.json` în `.well-known/`. Click email PWA installed → OS interceptează → deschide direct PWA.

#### §56.10.2 iOS scope cut — defer v2/v3 demand-driven ✅ LOCKED

iOS Universal Links require Apple Developer account ($99/an) + bundle ID + `apple-app-site-association` setup. Pre-Beta solo dev = scope creep nejustificat. iOS users pre-Beta: comportament browser default acceptabil, document fallback manual ghid testare. v2/v3 dacă cerere reală.

#### §56.10.3 TWA wrap Android v1.5 contingent ✅ LOCKED

Pre-Beta PWA puro: ~70-80% click email deschide PWA nativ; ~20-30% deschide browser default. Accept partial pre-Beta (50 testeri tolerant), document edge case testing checklist. Plan TWA wrap Android v1.5 dacă rate fail >30%. NU bloc launch.

### §56.11 Session Persistence & Offline UX

#### §56.11.1 Session persistence — Always Logged In ✅ LOCKED

Firebase SDK `indexedDBLocalPersistence` + refresh token forever default. Token ID 1h auto-refresh background. Maria 65 NU re-auth surpriză weekly/lunar.

#### §56.11.2 Offline auth UX — local data + non-blocking banner ✅ LOCKED

Refresh token expirat offline: app NU blochează ecranul. Datele locale IndexedDB servite normal. Banner discret top: "Mod offline. Conectează-te la internet pentru a-ți sincroniza datele în cloud."

### §56.12 Logout Behavior

#### §56.12.1 Sign-out UX placement — primary Settings bottom + double-confirmation modal ✅ LOCKED

Buton vizibil Setări jos, acțiune necesită confirmare modal: "Ești sigur că vrei să te deconectezi? Va trebui să te autentifici din nou pentru a-ți vedea datele." Anti-tap-accidental Maria 65.

#### §56.12.2 Logout local IndexedDB — preserve data + opt-in toggle Settings ✅ LOCKED

**Wipe IndexedDB la logout REJECTED** (bandwidth + battery cost re-fetch full history 5-15MB / 30-60s; quota Spark burn risk; offline-post-logout edge case blocked complet; trust break Maria 65 percepe slow).

Mecanism:
- Default: logout = clear auth tokens + session state. `andura_${uid}` rămâne intact local.
- Next login same UID: instant data + delta sync background (Firestore reads recent only post last sync timestamp).
- Different UID login same device: open `andura_${new_uid}` fresh, `andura_${old_uid}` rămâne dormant safe.
- **Opt-in toggle Settings advanced (default OFF):** "Șterge datele de pe acest dispozitiv la deconectare". Power users / shared device aware → ON.
- Cleanup dormant DBs: optional Daniel weekly script detect `andura_*` not-touched 90+ zile → delete. Defense in depth.

#### §56.12.3 Logout cu unsynced data — sync attempt + warning calm ✅ LOCKED

App încearcă sync background. Dacă fail (offline), wording UI exact LOCKED V1:

> "Ai X modificări nesincronizate în cloud. Acestea vor rămâne salvate pe acest telefon. Dacă te deconectezi acum, ele nu vor fi vizibile pe alte dispozitive până nu revii. Vrei să continui deconectarea? [Forțează deconectarea] / [Anulează]"

**Wording "le poți pierde definitiv" REJECTED** (inaccurate — IndexedDB local rămâne, NU panic).

### §56.13 Network Resilience

#### §56.13.1 Network fail mid-Magic-Link request — auto-retry 3x + manual fallback ✅ LOCKED

Network drop trimitere link: auto-retry 3x background. Fail persistent: ecran curat eroare "Nu am putut trimite codul. Verifică conexiunea la internet." + buton manual "Reîncearcă".

### §56.14 Cleanup Mechanism — A + B Fallback (Spark Plan Compatible)

#### §56.14.1 Cleanup A — Manual weekly script `admin-cleanup.js` ✅ LOCKED

Daniel rulează săptămânal duminică ~5min: identifică + șterge documentele `_deleted/` >30 zile + arhivele `_archived/` >7 zile. Pre-Beta 50 testeri scale-fezabil.

#### §56.14.2 Cleanup B — Client-side fallback la deschidere app ✅ LOCKED

User activ deschide app: verifică timestamps locale propriile date `_deleted/` + `_archived/`. Depășire termenelor → cerere ștergere noduri specifice. Defense in depth pentru users inactive 60+ zile (Daniel script catches).

#### §56.14.3 Cleanup C (Cloud Function scheduled) — defer post-Beta v1.5 ✅ LOCKED

Blaze plan upgrade nejustificat pre-Beta (contradicts §36.93 D3 Spark retain LOCKED). v1.5 când Beta scale justifies + Cloud Function patterns mature.

### §56.15 Telemetry & Observability

#### §56.15.1 T0→Auth conversion telemetry — aggregate counters anonymous GDPR-safe ✅ LOCKED

Events tracked: `onboarding_started` + `onboarding_completed` + `auth_prompt_shown` + `auth_completed`. Numere agregate, ZERO PII / user IDs. Conversion drop-off measurable fără GDPR breach.

#### §56.15.2 Telemetry storage — `_telemetry/global` Firestore document client-side increment ✅ LOCKED

`FieldValue.increment(1)` direct client-side. Spark plan compatible (NU Cloud Functions). Single document centralized counters. Privacy-safe (numere întregi only).

### §56.16 DB Rules Firestore Update

#### §56.16.1 Firestore Security Rules v1 pre-Beta ✅ LOCKED

```javascript
// Firestore Security Rules (v1 pre-Beta)
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /_deleted/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /_archived/{uid}/{docId} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

`_migration` flag = în interior `users/{uid}` document → beneficiază automat aceleași rules. Per-UID strict §36.75 preserved + extended pentru `_deleted` + `_archived` collections.

### §56.17 Service Worker Auth State Caching

#### §56.17.1 SW + Firebase Auth coexistence — standard SDK pattern ✅ LOCKED

Firebase SDK gestionează nativ persistența `indexedDBLocalPersistence`. Service Worker configurat să respecte + NU intercepteze `/auth-callback` route. Decizie operațională Claude Opus implementation, NU strategic.

### §56.18 Daniel Manual Setup Checklist Pre-CC Implementation

#### §56.18.1 Firebase Auth Console setup ✅ LOCKED

1. **Authorized domains:** add `andura.app` în lista
2. **Email Template Magic Link RO:** subject "Link-ul tău de acces în Andura" + body brand Andura
3. **Google OAuth Client ID:** generate Google Cloud Console + paste Firebase Auth Google Provider
4. **Action URL:** `https://andura.app/auth-callback`

#### §56.18.2 Email infrastructure `suport@andura.app` ✅ LOCKED

MX records Namecheap → forward Daniel personal email (gmail/yahoo). Alternative: Google Workspace ($6/lună/user) sau temp `andura.suport@gmail.com` pre-Beta. Daniel manual ~15 min decide format. **Pre-Beta launch blocker minor.**

### §56.19 Scope OUT v1.5+

#### §56.19.1 Marketing email opt-in ✅ LOCKED OUT

Pre-Beta NU infrastructură newsletter. ZERO căsuțe bifat marketing pre-Beta. v1.5+ când campanii justified.

#### §56.19.2 Deep linking ✅ LOCKED OUT (defer v1.5)

NU partajare antrenamente / link-uri externe dinamice pre-Beta. Scope clean.

#### §56.19.3 Logout all devices (revoke refresh tokens) ✅ LOCKED OUT (defer v1.5)

50 testeri Beta = NU blocking critical. v1.5 când security advanced justified.

---

## §57 Cumulative LOCKED Count Update (post 2026-05-04 Auth Flow §36.80 resolution)

**Pre-session:** 216 LOCKED V1 (post §50-§55 ingest 2026-05-05 morning).
**Post-session:** **243 LOCKED V1** (+27 substantive net Auth Flow §36.80: 4 auth pattern + 2 methods/UI + 2 onboarding + 3 migration + 6 lifecycle + 2 multi-device + 2 merge + 3 GDPR/legal + 2 sunset/gate + 3 PWA + 2 persistence/offline + 3 logout + 1 network + 3 cleanup + 2 telemetry + 1 DB rules + 1 SW + 2 Daniel manual + 3 scope-out — overlap = 27 net).

---

## §58 Next Actions Priority Order (post 2026-05-04 Auth Flow resolution)

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 CC Opus Implementation Dedicat

**Model: Opus** (rationale: scope cross-file integrare ~10 fișiere `firebase.js` + `auth.js` + `pages/auth.js` + `index.html` + `main.js` + `_migration` flow + `_deleted` lifecycle + `_archived/` archive flow + IndexedDB namespace per UID + Firestore rules update + wording RO LOCKED + Playwright e2e + `admin-cleanup.js` script + setup Daniel runbook documentation).

**Estimate:** ~30-45 min CC autonomous factor 7-9x clusters mari.

**Daniel manual prep prerequisites pre-CC:**
1. Firebase Auth Console setup §56.18.1 (~15 min)
2. `suport@andura.app` MX forward §56.18.2 (~15 min)
3. Privacy policy + ToS file write §56.8.2 + §56.8.3 (~30-60 min)

### Priority 2 — ADR 026 COMPILE DRAFT FULL (extended scope post-Auth)

**126 decisions ready compile draft full** = 75 spec §45 + D3.1 13 + D4 11 + D2 13 + D1 7 + naming distinction. Compile in `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (replace candidate stub). Chat strategic NEW dedicat post Auth Flow CC implementation complete.

### Priority 3 — Periodization Engine spec generation (post ADR 026 compile)

Per dimension cross-persona Q30 LOCKED: chat 1 Volume Landmarks all 3 + chat 2 Frequency Distribution + chat 3 Progressive Overload + chat 4 Mesocycle Structure (~3-4 chat-uri).

### Priority 4 — D3.2-D3.4 + Engine #8 sub-decisions (deferred)

D3.2 Don't Like + D3.3 Home + D3.4 Calistenice + Sport-Oriented (D3.2-D3.4 verdicts §36.107) chat strategic NEW. Engine #8 Warm-up & Mobility sub-decisions (~50-80 ramuri V1 spec) chat strategic NEW post Periodization spec.

### Priority 5 long-term

ADR 022 + 024 + 025 full spec generation. Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal complete (§46 P4 prerequisite D2 telemetry + Privacy Policy GDPR profundă post-Beta v1.5). TWA wrap Android v1.5 contingent. iOS Universal Links v2/v3 demand-driven. Soft Launch.

---

## §59 DIFF_FLAGS Update (post 2026-05-04 Auth Flow resolution)

- **§36.80 BUG 2 Firebase 401 status:** OPEN → **RESOLVED chat strategic** (CC Opus implementation pending Priority 1 ABSOLUT). Update DIFF_FLAGS.md P1 BLOCKERS section.
- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow CC implementation.
- **HANDOVER_GLOBAL split FLAG approaching threshold** = post-merge §56-§61 estimated ~7400-7700 LOC (pre-merge 6774 + ~600-900 added §56-§61). **Threshold §VAULT_HYGIENE_PASS STEP 13 BREACHED >7000 LOC FLAG**. Recommend **FLAG triggered**, plan split concrete strategie chat NEW dedicat.
- **NEW pre-Beta launch blockers (Daniel manual tasks):** suport@andura.app MX setup + Privacy Policy + ToS files write + Firebase Auth Console configuration. Flag DIFF_FLAGS.md.
- **NEW Auth Flow features flagged INDEX_MASTER:** §56.1.4 IndexedDB namespace per UID + §56.4.2 `_migration` flag + §56.5.2 soft delete 30 zile + §56.7.2 archive 7 zile + §56.10 PWA strategy + §56.14 cleanup A+B fallback + §56.16 DB Rules update + §56.18 Daniel manual setup checklist.

---

## §60 Cross-refs Updates Required (CC ingest mandatory)

**INDEX_MASTER.md updates:**
- §36.80 status: OPEN BUG 2 → **RESOLVED chat strategic 2026-05-04, CC implementation pending**
- §56 Auth Flow Resolution: add full entry SUFLET section + AUTH section LOCKED V1 (35 sub-decisions)
- ADR_MULTI_TENANT_AUTH_v1 Faza 2 status: NOT landed → **LOCKED V1 spec, CC implementation pending Priority 1 ABSOLUT**
- Cumulative LOCKED count: 216 → **243**
- Pre-Beta launch checklist: add Daniel manual tasks (Firebase Console + suport@ + Privacy Policy + ToS)

**DECISION_LOG.md +1 condensed entry:** referencing HANDOVER_GLOBAL §56.1-§56.19 verbatim (top of file, cronologic descending, header `2026-05-04 evening — Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1 (Priority 1 ABSOLUT CC implementation pending)`).

**ADR_MULTI_TENANT_AUTH_v1.md updates:**
- §AMENDMENT 2026-05-04: Faza 2 wiring spec LOCKED V1 (auth-banner-soft + Anonymous preserve + Google OAuth primary + Magic Link nativ Android + auth-callback route + auth post-T0 + IndexedDB namespace per UID + `_migration` flag + soft delete 30 zile + Fork Decision archive 7 zile + record-level LWW + always-logged-in + offline non-blocking banner + manual cleanup A+B + telemetry aggregate Spark + Firestore rules extended)
- Cross-ref §56 sub-sections verbatim

**Privacy Policy + ToS files create:**
- `01-vision/PRIVACY_POLICY_V1_BETA.md` (Daniel write per §56.8.2 template)
- `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (Daniel write per §56.8.3 template)

**Cross-refs:** [[ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 (Faza 2 spec LOCKED V1) | [[026-offline-coaching-decision-tree-exhaustive]] (Priority 2 compile 126 decisions ready, post-CC) | [[023-llm-intent-interpretation]] (Safety tier preserved) | HANDOVER §36.75 (DB Rules per-UID strict extended cu `_deleted` + `_archived`) + §36.78 (Rebrand Sweep preserved) + §36.79 (Custom Domain Hotfix preserved) + §36.80 (BUG 2 RESOLVED chat strategic + Priority 1 CC implementation pending) + §36.93 (D3 Spark retain — Cloud Function defer post-Beta v1.5 confirmed cleanup C deferred) + §36.94 ADR 025 (Instant Skip principle reused — `getUserPath()=null` graceful degradation) + §36.99 (offline-first preservation §56.11.2) + §50.4 D1 (Q20 §45.3 pattern reuse — record-level LWW NU duplicate logic) + §46 P4 (audit legal post-Beta v1.5 prerequisite preserved Privacy Policy profundă)

---

## §61 Verification Questions Topics For Next Chat

**CC Opus MUST generate alignment questions search-driven format §47 LOCKED V1 din topics below. NOT pre-fed verbatim answers.**

**Suggested 12 Q-uri topics covering §56-§60:**

- Q: §56.1 Auth pattern UX auth-banner-soft + Anonymous preserve + `getUserPath()=null` fix code-level + IndexedDB namespace per UID `andura_${uid}` Dexie multi-DB?
- Q: §56.2 Google OAuth primary + Firebase Email Link nativ fallback (PIN custom REJECTED rationale) + auth screen wording LOCKED V1 (titlu/subtitlu/CTA/loading/success)?
- Q: §56.3 Auth screen position DUPĂ T0 onboarding + T0 scope 3-5 min max 5-7 întrebări cheie (anti-dropoff Bugatti)?
- Q: §56.4 Migration Daniel-only `users/daniel` legacy + `_migration` flag schema + retry silent + rollback strategy verbatim?
- Q: §56.5 Account lifecycle — recovery email lost refusal pattern wording LOCKED V1 + soft delete 30 zile grace + reactivare `auth/user-disabled` catch + email change `updateEmail` nativ + conflict detection wording + current address typo guard?
- Q: §56.6 Multi-device silent sync transparent + record-level LWW pre-Beta (field-level CRDT REJECTED rationale defer v1.5)?
- Q: §56.7 Anonymous→Auth merge Fork Decision + archive 7 zile (suprascriere REJECTED) + export local JSON + Firestore `_archived/{uid}/{timestamp}` + wording LOCKED V1?
- Q: §56.8 GDPR consent double bifa Privacy + ToS + privacy-policy.md template (Firebase subprocessor wording fix) + ToS template "în măsura permisă de lege" (liability absolute REJECTED rationale OUG 21/1992 + Codul Civil + EU Consumer Rights Directive)?
- Q: §56.9 Sunset Anonymous post-Beta v1.5 + 30 zile grace + Beta launch gate MUST-HAVE v1.0 + 1 ian 2027 target optimistic Quality>Speed Bugatti audit?
- Q: §56.10 PWA cross-context Magic Link nativ Firebase + Android Links pre-Beta + iOS scope cut v2/v3 + TWA wrap Android v1.5 contingent rate fail >30%?
- Q: §56.11 + §56.12 Always logged in + offline non-blocking banner + sign-out double-confirmation modal + IndexedDB preserve at logout (wipe REJECTED rationale bandwidth/quota/offline) + opt-in toggle Settings + unsynced data warning calm wording LOCKED V1?
- Q: §56.14 + §56.15 + §56.16 Cleanup A+B fallback `admin-cleanup.js` weekly + client-side timestamps + telemetry `_telemetry/global` Spark plan compatible `FieldValue.increment` + Firestore Rules v1 extended `_deleted` + `_archived` per-UID?

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT. Cumulative 243 LOCKED V1 post §56-§61 ingest. ADR 026 compile draft full ready 126 decisions chat strategic NEW Priority 2 post-CC. Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE preserved. HANDOVER_GLOBAL split FLAG triggered post-merge >7000 LOC threshold — plan split concrete next handover dedicat. D3.2-D3.4 + Engine #8 sub-decisions deferred Priority 4. Daniel manual prep prerequisites pre-CC: Firebase Console + suport@andura.app + Privacy Policy + ToS write.**

**Andura needs to be the best. ✊**
