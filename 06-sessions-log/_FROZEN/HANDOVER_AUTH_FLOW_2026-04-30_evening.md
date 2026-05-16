# HANDOVER GLOBAL — Auth Flow (split from 2026-04-30 evening master, 2026-05-05 overnight)

**Provenance:** Section split from `HANDOVER_GLOBAL_2026-04-30_evening.md` per §62.2 thematic split strategy LOCKED V1. Original 7673 LOC > 7000 §VAULT_HYGIENE_PASS STEP 13 FLAG threshold. Split executed 2026-05-05 overnight (CC TASK 5 finalize).
**Theme:** Auth Flow §36.80 BUG 2 RESOLUTION + Phase 1+2 spec + BATCH 1-6 + Closure UX. Sections: §56 Auth Flow §36.80 BUG 2 + Privacy/ToS V1 Beta drafts + §57-§61 + §62-§64 BATCH 1-3 + §66-§68 BATCH 5-6 + Closure.
**See also:** [[HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL master INDEX]] (post-split) + [[ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04 + 2026-05-05.

---

## §56 Auth Flow §36.80 BUG 2 RESOLUTION SUB-DECISIONS LOCKED V1 (chat strategic 2026-05-04 evening)

### §56.0 Status: ✅ COMPLETE (chat strategic resolution) / 🟡 CC Opus Implementation Pending Priority 1 ABSOLUT

Chat strategic dedicat Auth Flow §36.80 production blocker. **35 substantive sub-decisions LOCKED V1** acoperind: auth pattern UX + Anonymous mode + auth methods + onboarding position + migration strategy + account lifecycle (delete/recovery/email change) + multi-device sync + Anonymous→Auth merge + GDPR/legal + sunset timeline + PWA cross-context + session persistence + offline UX + logout behavior + network resilience + cleanup mechanism + telemetry + DB rules + auth wording + Daniel manual setup + scope out v1.5+.

**§36.80 BUG 2 root cause confirmed:** `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit.

**Chat resolution iterations (push-back validated):** PIN custom REJECTED → Magic Link nativ Firebase reused | hard delete imediat REJECTED → soft delete 30 zile grace | LWW field-level REJECTED → record-level pre-Beta | Fork Decision suprascrie REJECTED → archive 7 zile + export local backup | iOS Universal Links REJECTED → Android-only pre-Beta + iOS v2/v3 demand-driven | logout wipe IndexedDB REJECTED → preserve local + opt-in toggle Settings | ToS liability absolute REJECTED → "în măsura permisă de lege" + retain neglijență gravă (RO consumer law).

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
3. Privacy policy + ToS file write §56.8.2 + §56.8.3 (~30-60 min) — initial drafts created în vault `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` din templates LOCKED V1 verbatim, Daniel validate sprint pre-Beta

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

- **§36.80 BUG 2 Firebase 401 status:** OPEN → ✅ **RESOLVED chat strategic** (CC Opus implementation pending Priority 1 ABSOLUT). Update DIFF_FLAGS.md P1 BLOCKERS section.
- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow CC implementation.
- **HANDOVER_GLOBAL split FLAG threshold check post-merge §56-§61** = post-merge actual verified VAULT_HYGIENE_PASS auto-trigger STEP 13 (CC Opus reports actual cifră). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG candidate, >10000 LOC ESCALATE BLOCKER mandatory. Recommend split planned chat strategic NEW dedicat dacă breach threshold.
- **NEW pre-Beta launch blockers (Daniel manual tasks):** suport@andura.app MX setup + Privacy Policy + ToS files validate (initial drafts created vault) + Firebase Auth Console configuration. Flag DIFF_FLAGS.md.
- **NEW Auth Flow features flagged INDEX_MASTER:** §56.1.4 IndexedDB namespace per UID + §56.4.2 `_migration` flag + §56.5.2 soft delete 30 zile + §56.7.2 archive 7 zile + §56.10 PWA strategy + §56.14 cleanup A+B fallback + §56.16 DB Rules update + §56.18 Daniel manual setup checklist.

---

## §60 Cross-refs Updates Required (CC ingest mandatory)

**INDEX_MASTER.md updates:**
- §36.80 status: OPEN BUG 2 → ✅ **RESOLVED chat strategic 2026-05-04, CC implementation pending Priority 1 ABSOLUT**
- §56 Auth Flow Resolution: add full entry SUFLET section + AUTH section LOCKED V1 (35 sub-decisions)
- ADR_MULTI_TENANT_AUTH_v1 Faza 2 status: NOT landed → **LOCKED V1 spec via §AMENDMENT 2026-05-04, CC implementation pending Priority 1 ABSOLUT**
- Cumulative LOCKED count: 216 → **243**
- Pre-Beta launch checklist: add Daniel manual tasks (Firebase Console + suport@ + Privacy Policy + ToS validate)

**DECISION_LOG.md +1 condensed entry:** referencing HANDOVER_GLOBAL §56.1-§56.19 verbatim (top of file, cronologic descending, header `2026-05-04 evening — Auth Flow §36.80 BUG 2 RESOLUTION 35 sub-decisions LOCKED V1 (Priority 1 ABSOLUT CC implementation pending)`).

**ADR_MULTI_TENANT_AUTH_v1.md updates:**
- §AMENDMENT 2026-05-04: Faza 2 wiring spec LOCKED V1 (auth-banner-soft + Anonymous preserve + Google OAuth primary + Magic Link nativ Android + auth-callback route + auth post-T0 + IndexedDB namespace per UID + `_migration` flag + soft delete 30 zile + Fork Decision archive 7 zile + record-level LWW + always-logged-in + offline non-blocking banner + manual cleanup A+B + telemetry aggregate Spark + Firestore rules extended)
- Cross-ref §56 sub-sections verbatim

**Privacy Policy + ToS files create (initial drafts from LOCKED V1 templates):**
- `01-vision/PRIVACY_POLICY_V1_BETA.md` (verbatim from §56.8.2 LOCKED V1 template, Daniel validate sprint 30-60 min pre-Beta)
- `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (verbatim from §56.8.3 LOCKED V1 template, Daniel validate sprint 30-60 min pre-Beta)

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
- Q: §56.8 GDPR consent double bifa Privacy + ToS + privacy-policy.md template + ToS template "în măsura permisă de lege" (liability absolute REJECTED rationale OUG 21/1992 + Codul Civil + EU Consumer Rights Directive)?
- Q: §56.9 Sunset Anonymous post-Beta v1.5 + 30 zile grace + Beta launch gate MUST-HAVE v1.0 + 1 ian 2027 target optimistic Quality>Speed Bugatti audit?
- Q: §56.10 PWA cross-context Magic Link nativ Firebase + Android Links pre-Beta + iOS scope cut v2/v3 + TWA wrap Android v1.5 contingent rate fail >30%?
- Q: §56.11 + §56.12 Always logged in + offline non-blocking banner + sign-out double-confirmation modal + IndexedDB preserve at logout (wipe REJECTED rationale bandwidth/quota/offline) + opt-in toggle Settings + unsynced data warning calm wording LOCKED V1?
- Q: §56.14 + §56.15 + §56.16 Cleanup A+B fallback `admin-cleanup.js` weekly + client-side timestamps + telemetry `_telemetry/global` Spark plan compatible `FieldValue.increment` + Firestore Rules v1 extended `_deleted` + `_archived` per-UID?

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT. Cumulative 243 LOCKED V1 post §56-§61 ingest. ADR 026 compile draft full ready 126 decisions chat strategic NEW Priority 2 post-CC. Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE preserved. §36.80 BUG 2 RESOLVED chat strategic — Priority 1 ABSOLUT CC Opus implementation pending. ADR_MULTI_TENANT_AUTH_v1 Faza 2 spec LOCKED V1 §AMENDMENT 2026-05-04. Privacy Policy + ToS V1 Beta initial drafts created vault `01-vision/`. Daniel manual prep prerequisites pre-CC: Firebase Console + suport@andura.app MX + Privacy Policy + ToS validate.**

---

## §62 BATCH 1 — Architecture & Process Decisions LOCKED V1 (chat strategic 2026-05-04 evening)

### §62.1 Email infrastructure — Forward Daniel personal Gmail Option A ✅ LOCKED

MX records Namecheap → forward Daniel personal Gmail gratuit. ZERO Google Workspace ($6/lună rejected). ZERO temp gmail rejected. Pre-Beta 50 testeri scale-fezabil. Cross-ref §56.18.2 confirmation.

### §62.2 HANDOVER_GLOBAL split strategy — Thematic split Option B ✅ LOCKED

DIFF_FLAGS HANDOVER_GLOBAL split FLAG TRIGGERED 7214 LOC > 7000 threshold. Strategy LOCKED: thematic split (auth/engine/onboarding fișiere separate), NU chronological cut, NU __resolved__ folder dedicated. Cross-refs migration plan ~50+ wikilinks reference HANDOVER_GLOBAL §X — sweep + rewire required next chat strategic dedicat. Backup tag pre-split mandatory: `git tag pre-handover-split-2026-05-04-evening`.

### §62.3 CC Opus Auth Flow §36.80 implementation order — Phased Option B ✅ LOCKED

NU Big Bang single prompt all ~10 fișiere. Phased: firebase.js → auth.js → pages/auth.js → rest. Reduces blast radius per phase + intermediate validation gates. CC Opus prompt structure post-Daniel-manual-prep prerequisites complete.

### §62.4 Privacy Policy V1 Beta — Lock as-is template §56.8.2 ✅ LOCKED

`01-vision/PRIVACY_POLICY_V1_BETA.md` 5 puncte verbatim §56.8.2 LOCKED V1. Daniel validate sprint pre-Beta confirmat. Audit legal complet defer v1.5 (§46 P4 prerequisite).

### §62.5 ToS V1 Beta — Lock as-is template §56.8.3 ✅ LOCKED

`01-vision/TERMS_OF_SERVICE_V1_BETA.md` 4 puncte verbatim §56.8.3 LOCKED V1. Daniel validate sprint pre-Beta confirmat. Liability waivers absolute REJECTED preserved (RO consumer law OUG 21/1992 + Codul Civil + EU Consumer Rights Directive 2011/83).

### §62.6 Firebase Email Template Magic Link RO — Lock as-is ✅ LOCKED

Subject: "Link-ul tău de acces în Andura". Body: brand Andura custom. Daniel manual setup Firebase Auth Console pre-CC.

### §62.7 Beta launch gate — Decalare oficială Quality > Speed default (Override §56.9.2) ✅ LOCKED

**OVERRIDE:** §56.9.2 "1 ianuarie 2027 optimistic" → **decalare oficial Quality > Speed default, target flexible**. NU forced 1 ian 2027 deadline. Septembrie 2026 testare Beta dacă șlefuire necesară = decalare fără ezitare. Cross-ref §36.83 META-RULE Prebeta Scope Expansion preserved.

### §62.8 Logout modal wording — Lock as-is §56.12.1 ✅ LOCKED

"Ești sigur că vrei să te deconectezi? Va trebui să te autentifici din nou pentru a-ți vedea datele." Anti-tap-accidental Maria 65 preserved.

### §62.9 Cleanup A weekly script trigger — Reminder Calendar duminică manual Option A ✅ LOCKED

NU cron automated Windows. NU skip. Daniel manual reminder Calendar duminică ~5min `admin-cleanup.js` rule. Pre-Beta 50 testeri scale-fezabil. Cross-ref §56.14.1 preserved.

### §62.10 Cleanup C Cloud Function v1.5 trigger — Manual Daniel decision retrospectiva post-Beta Option B ✅ LOCKED

NU auto-trigger Beta scale >X users. NU skip definitiv. Manual Daniel post-Beta retrospectiva = data-driven decision: volum real → justify Blaze plan upgrade pentru Cloud Functions SAU retain hibrid (manual A + client-side B sufficient). Cross-ref §56.14.3 update.

### §62.X META — Review Division of Labor LOCKED V1 ✅ LOCKED (workflow general impact)

Pattern LOCKED: text-heavy/legal artifacts (Privacy Policy, ToS, wording UI mass, copy beta) = review cross Claude + Gemini. Daniel rămâne pe ce DOAR el poate face: decizii strategice + hands-on tehnic (Firebase Console, MX setup, prompts CC, manual prep). Daniel = final approve + spot-check minimal post-review. Anti-bottleneck Daniel-time.

---

## §63 BATCH 2 — Onboarding & Conversion LOCKED V1

### §63.1 Onboarding T0 question order — Obiectiv first hook motivațional Option B ✅ LOCKED

Order: obiectiv → vârstă → sex → istoric medical simplu → frecvență. NU vârstă-first administrative plictisitor. Maria 65 captivată hook motivațional din prima atingere. Cross-ref §56.3.2 update inline.

### §63.2 Auth-banner-soft trigger — Imediat post-T0 plan generated Option A ✅ LOCKED

Banner "Salvează contul" apare imediat post Investment Phase plan T0 generat. User vede valoarea imediată + commitment crescut salvare profil. Cross-ref §56.3.1 confirm + §56.1.1.

### §63.3 Auth-banner-soft dismiss behavior — "Nu acum" explicit + reapariție 3 sesiuni Option C ✅ LOCKED

Buton explicit "Nu acum" dismiss. Reapariție după **3 sesiuni de antrenament finalizate complet (logged workout)** — NU app-open count. High commitment threshold ~3 săptămâni Maria 65 frecvență 2x/săpt. NU sâcâie zilnic + revine post-investment real.

### §63.4 Google OAuth scope — Email only minimum absolut Option C ✅ LOCKED

`scope: email` ONLY. NU profile basic, NU contacts. Privacy posture impecabilă Beta. Eliminates suspicion Maria 65. Cross-ref §56.2.1 update inline.

### §63.5 Magic Link expiration — 24h (Override Q5 reconsider) ✅ LOCKED

**OVERRIDE:** Q5 initial choice 1h → reconsider **24h expiration**. Maria 65 cross-context PWA Android tolerance: telefon slow + email întârzie 20-30 min + nu vede notif imediat. 1h = link expirat surpriză + Maria frustrare retry. 24h = balance security/UX Beta 50 testeri familie.

### §63.6 Soft delete 30 zile reminder — Email day 25 "5 zile rămase + click reactivare" (Override Q6) ✅ LOCKED

**OVERRIDE:** Q6 initial choice ZERO notificări → reconsider email day 25 reminder. ZERO reminder contradice rationale soft delete §56.5.2 "Maria 65 click greșit = recovery 30 zile". Industry standard (Notion/Google/Apple) = reminder pre-deletion irreversible NU spam. Day 25 wording: "5 zile rămase. Click pentru reactivare cont." Pre-Beta 50 testeri = subprocess Daniel manual scale ~1-2/lună. Cloud Function automation defer v1.5.

### §63.7 Fork Decision UI default highlight — ZERO default force user choice Option C ✅ LOCKED

NU [Cloud] highlighted, NU [Telefon] highlighted. Force user manual choice anti-mistake Maria 65 click greșit. User citește + confirmă conștient. Cross-ref §56.7.1 update inline.

### §63.8 Beta recruitment 50 testeri profile — 100% RO familie/prieteni Daniel Option A ✅ LOCKED

NU 70/30 RO/EN, NU 50/50. Control strict profile testeri + zero zgomot grupuri publice + feedback calitativ direct trust. Anti-localizare prematură.

### §63.9 Onboarding skip behavior — Skip vizibil + synthetic Demographic Prior fallback (Override Q9) ✅ LOCKED

**OVERRIDE:** Q9 initial choice "NU skip mandatory" → reconsider skip vizibil. CONTRADICE foundation ADR 025 candidate "Andura Gândește pentru User" + ADR 014 Profile Typing tier-aware + §36.94 filtru pre-feature LOCK verbatim "Dacă user ignoră complet feature, app-ul tot funcționează rezonabil? DA → eligible LOCKED". Skip = FEATURE NU bug per memory persistent.

**Mecanism post-skip:** Demographic Prior Database (synthetic 50+ profiles × 90 zile) consume → engine generic acceptabil din age/sex/kg/height defaults. Cross-ref ADR 014 + ADR 017 + §36.94.

### §63.10 First session post-onboarding — "Plan generat. Începe când vrei" passive Option C ✅ LOCKED

NU auto-start sesiune imediat. NU tour 30 sec features. Passive choice = user libertate când start, evită panic forced-start Maria 65. Bugatti F4 cognitive friction zero.

---

## §64 BATCH 3 — Auth Edge Cases & Privacy LOCKED V1

### §64.1 Email change verification — Magic Link new address ONLY Option A ✅ LOCKED

NU double confirm Magic Link old + new (over-engineering). NU password-less ZERO friction (security hole). Magic Link new address only validate + auto-update Firebase `updateEmail`. Typo guard preserved §56.5.6.

### §64.2 Account deletion confirmation flow — 2-step type "ȘTERGE" + click Option B ✅ LOCKED

NU 1-click + modal final (anti-tap-accidental insufficient). NU 3-step email + 24h delay + click (over-friction). Type "ȘTERGE" manual + click confirm = balance anti-Maria-65-mistake + reasonable friction.

### §64.3 GDPR data portability Article 20 — Defer v1.5 manual cerere suport@andura.app Option C ✅ LOCKED

NU JSON download imediat Settings (scope creep pre-Beta). NU email cu link 24h expirare (infrastructure). Pre-Beta 50 testeri = cerere manuală suport@andura.app, Daniel proceseze. Automated button defer v1.5.

### §64.4 Auth screen language — RO ONLY Beta Option A ✅ LOCKED

NU EN toggle vizibil pre-Beta, NU auto-detect browser. F-NEW-1 i18n LOCKED V1 OBLIGATORIU defer post-Beta. Testeri 100% RO confirmat §63.8.

### §64.5 Magic Link inexistent email behavior — Silent send Firebase native + wording educativ email-side + soft-hint UI (Override Q5 reconsider) ✅ LOCKED

**OVERRIDE refined:** Q5 initial choice silent send raw → reconsider hibrid wording educativ.

**Email body wording verbatim (Magic Link):**
> "Dacă ai deja un cont Andura, acest link te va conecta direct la profilul tău existent. Dacă ești la prima accesare, am creat acum un cont nou pentru tine, iar progresul tău va fi salvat automat."

**Auth screen soft-hint UI sub email field:**
> "Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces."

Anti-account-enumeration security preserved (Firebase native) + anti-confusion typo Maria 65 educativ.

### §64.6 Multi-account same email forwarder edge case — Documentat ghid testeri Option B ✅ LOCKED

Daniel test 2 conturi Google diferite same Gmail forwarder = imposibil Firebase Auth (limitation native). Accept limitare technical + documenta nota informativă document testare pre-Beta. NU workaround alias Gmail "+test".

### §64.7 Session timeout inactivity — NEVER always-logged-in Option A ✅ LOCKED

NU 30 zile, NU 90 zile re-auth. Confirmă §56.11.1 always-logged-in `indexedDBLocalPersistence` + refresh token forever default. Token ID 1h auto-refresh background. Maria 65 NU re-auth surpriză.

### §64.8 Telemetry opt-out toggle — ZERO toggle Settings Option A ✅ LOCKED

NU toggle vizibil "Permite telemetrie anonimă" default ON, NU default OFF + onboarding prompt. Aggregate anonymous events (`onboarding_started` etc) = GDPR-safe by design (FieldValue.increment counter only, ZERO PII). NU încarce interfață Settings.

### §64.9 Service Worker update flow — Prompt subtil "Actualizare disponibilă. Reîncarcă" Option B ✅ LOCKED

NU silent background update (user surprise post-reload). NU force reload immediate (workout interruption disaster). Prompt non-disruptive workout-aware = user termină sesiune curentă apoi reload manual.

### §64.10 Logout dormant DBs cleanup — 90 zile not-touched auto-delete Option B ✅ LOCKED

`andura_${uid}` not-touched 90 zile → Daniel weekly script optional detect + delete (per §56.12.2). NU 30 zile (privacy familie share tablet aggressive). NU 180 zile conservativ (storage waste). 90 zile = balance privacy/recovery window.

---

## §66 BATCH 5 — RPE/RIR UX + Beta Mechanics LOCKED V1

### §66.1 RPE input UX — Hibrid segmented default + slider 1-10 advanced toggle Settings Option C ✅ LOCKED

Default segmented "Ușor / OK / Greu / La limită" Maria 65 friendly. Advanced toggle Settings activate slider 1-10 numeric pentru Guru precision. Same UI scalable Maria → Guru.

### §66.2 RIR input frequency — Per-exercise last set ONLY Option B ✅ LOCKED

NU per-set fiecare set (friction maximă), NU per-sesiune end summary 3 nivele (precision insuficientă). Last set per exercise = balance friction minimal + data quality acceptable. Engine ia oboseala necesară fără sâcâială.

### §66.3 RPE/RIR skip behavior — Engine assume RIR 2 default Option A ✅ LOCKED

User skip → engine fundal RIR 2 moderate effort default. NU flag "no data" + NU adapt next session (rupe progresie). NU MANDATORY (ADR 025 violation). Alignment §36.94 B4 + ADR 025 graceful degradation universal.

### §66.4 Rest timer between sets — Hibrid auto-start + skip button Option C ✅ LOCKED

NU auto-start countdown only (forced), NU manual user start only (friction). Auto-start post-set logged + skip button vizibil = user pregătit early skip 1 tap. Bugatti F4 zero forced friction.

### §66.5 Rest timer duration default — Adaptive exercise type Option B ✅ LOCKED

NU 90s universal (compound under-rested + isolation over-rested). Compound 3 min + isolation 60s + accessory 45s. Research-aligned (Schoenfeld 2016 rest interval hypertrophy).

### §66.6 Mid-session abandon — Auto-save + Resume per §50.2 D4 Option A ✅ LOCKED

NU prompt "Salvează sesiunea parțială?" (friction). NU discard silent (data loss). Auto-save IndexedDB local + resume next open user prompt continuation. Cross-ref §56 SessionLifecycle confirm + §50.2 D4 Mid-Session Resume Protocol LOCKED V1.

### §66.7 Retention KPI primary pre-Beta — Hibrid D7 ≥45% target / ≥35% acceptable / <30% red flag (Override Q7 reconsider) ✅ LOCKED

**OVERRIDE:** Q7 initial choice D7 ≥60% → reconsider hibrid industry-calibrated. Industry benchmark fitness consumer Strong/Hevy publicly disclosed = 25-40% D7 medie. Familie/prieteni Daniel +10-15% bonus realistic = 35-55% range. 60% bar prea ridicat → risc panic premature pivot decisions. Hibrid:
- **Target:** D7 ≥45% (motivational realistic)
- **Acceptable:** D7 ≥35% (industry-calibrated familie/prieteni bonus)
- **Red flag:** D7 <30% (UX issue major)

### §66.8 Beta recruitment channel — 100% Daniel direct familie/prieteni Option A ✅ LOCKED

NU grupuri Facebook fitness RO, NU Reddit r/Romania r/Fitness. Control strict profile + zero zgomot public + feedback calitativ direct trust. Cross-ref §63.8 confirm.

### §66.9 Beta feedback collection — Email suport@andura.app + Google Form survey săptămânal duminică Option B ✅ LOCKED

NU email only (passive bug reports only). NU 1-on-1 calls top 5 testeri (bandwidth solo dev disaster). Hibrid email passive (bug reports oricând) + Google Form structured weekly Sunday digest.

### §66.10 Pricing post-Beta v1.0 stable — Defer post-Beta retrospectiva data-driven Option C ✅ LOCKED

NU free forever bootstrap commitment (premature lock-in revenue model). NU freemium core+premium v2 (premature decision data insufficient). Defer post-Beta retro = pricing data-driven feedback 50 testeri + utilizare reală + market positioning RO fitness apps.

---

## §67 BATCH 6 — Safety, Compliance & Distribution LOCKED V1

### §67.1 Pregnancy declaration — Settings ONLY post-onboarding Option B ✅ LOCKED

NU Q4 medical checkbox onboarding (friction primă atingere). NU hibrid quick + detailed. Settings exclusive post-onboarding = preserve T0 5-7 întrebări Bugatti F4 frictionless. Cross-ref PRODUCT_STRATEGY §5.4 alignment + AMENDMENT 2026-05-04 evening inline.

### §67.2 Underage detection sub 16 — Defer v1.5 honor system Option C ✅ LOCKED

NU honor system checkbox V1, NU date-of-birth field auto-block. Beta 50 testeri adulți known direct Daniel = ZERO GDPR risk pre-Beta. Defer v1.5 honor system implementation. Cross-ref PRODUCT_STRATEGY §5.2-§5.3 alignment.

### §67.3 Heart condition declaration UX — Settings ONLY + red disclaimer scroll-to-bottom + "Confirm clearance medical" B-clarified ✅ LOCKED

**B-CLARIFIED:** Settings exclusive post-onboarding (paritate pregnancy §67.1). NU Q onboarding (friction). User activează checkbox heart condition Settings → red disclaimer screen scroll-to-bottom + "Confirm că am clearance medical" buton final. Liability protected + zero churn legitim onboarding. Cross-ref PRODUCT_STRATEGY §5.8 alignment + AMENDMENT 2026-05-04 evening inline.

### §67.4 Eating disorder pattern detection — Defer v1.5+ insufficient telemetry pre-Beta Option B ✅ LOCKED

NU algoritm weight drop brutal V1 (insufficient data 50 testeri 6-12 luni minim). NU flag DOAR (incomplete intervention). Defer v1.5+ când telemetry advanced + sample size justify. Cross-ref PRODUCT_STRATEGY §5.5 deferred status + AMENDMENT 2026-05-04 evening inline.

### §67.5 Disclaimer medical placement — Ecran 4 Obiectiv checkbox obligatoriu Option A ✅ LOCKED

NU Settings only (visibility insufficient). NU splash screen first launch (annoying). Ecran 4 Obiectiv onboarding checkbox obligatoriu disabled-until-checked + link expandabil ToS+Privacy = vizibilitate maximă în context configurare profil + accept legal conștient. Cross-ref ONBOARDING_SSOT_V1 §8 alignment + AMENDMENT 2026-05-04 evening inline.

### §67.6 Notification permission request timing — NEVER request V1 push defer v2 Option C ✅ LOCKED

NU onboarding Q5 final, NU post first session complete. ZERO push V1 = ZERO permission request. Anti-spam Bugatti dignity + scope creep pre-Beta zero.

### §67.7 Push notification scope V1 — ZERO push V1 Option A ✅ LOCKED

NU "Azi ai programat X. Mergem?" V1 (per §6.1 LOCKED inițial deferred reconsidered V1). NU deload reminder + weekly mesocycle review push (scope creep). ZERO push V1 absolute. Defer v1.5+ când Daniel decide push strategy mature. Cross-ref PRODUCT_STRATEGY §6.1 override + AMENDMENT 2026-05-04 evening inline.

### §67.8 Email digest weekly Mesocycle Review — Opt-in default OFF + discovery prompt one-time post first mesocycle Option C + clarification discovery ✅ LOCKED

Default OFF în Settings = anti-spam GDPR. Discovery prompt one-time la finalul primului mesociclu (4 săpt timing): "Vrei rezumat mesociclu pe e-mail?" = moment perfect user data relevantă strânsă + propunere percepută valoare adăugată NU spam. Post-prompt: opt-in Settings only (organic find).

### §67.9 Achievement badges scope V1 — ZERO badges V1 SCOPE CUT Option A ✅ LOCKED

NU "praguri fizice reale" V1 (1×BW Bench / 2×BW Deadlift defer v1.5+). NU streak badges 7/30 zile. ZERO badges V1 = scope cut deliberate (NU revoke §6.5 PRODUCT_STRATEGY). Praguri fizice reale rămân piloni viziune produs Andura defer v1.5+. Bugatti dignity preserved + scope creep zero. Cross-ref PRODUCT_STRATEGY §6.5 scope cut clarification + AMENDMENT 2026-05-04 evening inline.

### §67.10 App store distribution post-Beta — PWA + TWA Android Play Store ONLY (Option B + iOS REJECTED LOCKED PERMANENT) ✅ LOCKED

**iOS REJECTED LOCKED PERMANENT (NEW):**
- Pre-Beta: PWA only iOS users (browser default, ~20-30% rate fail tolerated)
- Post-Beta v1.0: NU iOS distribution
- Post-Beta v1.5: NU iOS distribution
- v2/v3: demand-driven only (real iOS user demand + revenue justify $99/an Apple Developer)

**Distribution V1 Beta + post-Beta v1.0/v1.5:**
- PWA installable browser
- TWA wrap Android Play Store (per §56.10.3 contingent rate fail >30% activation)

Cross-ref §56.10.2 iOS scope cut PERMANENT extension.

---

## §68 CLOSURE BATCH — UX Refinements Post-Implementation LOCKED V1

### §68.1 Onboarding skip post-skip UX — Transparență "Plan generat din date tipice" Option A ✅ LOCKED

User skip onboarding T0 → engine consume synthetic Demographic Prior fallback → plan generat afișat imediat cu wording verbatim:

> "Plan generat din date tipice. Îl poți ajusta oricând din profil."

NU prompt 2 întrebări critice post-skip (defeat purpose skip). NU silent default ZERO menționare (mystery anti-trust). Transparență = ADR 025 alignment "Andura Gândește pentru User" + ADR 014 + ADR 017 synthetic prior consume.

### §68.2 Auth-banner reapariție definition "3 sesiuni" — Workout-logged-complete Option clarification ✅ LOCKED

"3 sesiuni" reapariție post-dismiss = **3 antrenamente finalizate complet salvate jurnal (logged workout)**, NU 3 app-open count. ~3 săptămâni Maria 65 frecvență 2x/săpt timing realistic high commitment. Banner reapare după effort real investit. Cross-ref §63.3 clarification.

### §68.3 Email digest discovery prompt timing — Post first mesocycle complete Option B ✅ LOCKED

Prompt one-time descoperire feature = la finalul primului mesociclu 4 săptămâni completate: "Vrei rezumat mesociclu pe e-mail?" Moment perfect: user data relevantă strânsă + propunere valoare adăugată context. NU onboarding final mention (irrelevant timing). NU ZERO discovery (feature reach zero). Cross-ref §67.8 clarification.

---

