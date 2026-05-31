# Evaluare de Impact asupra Confidentialitatii (PIA) + Triaj DPIA — Andura, pre-Beta

> **PRIVILEGED & CONFIDENTIAL — DRAFT WORK PRODUCT / DOCUMENT INTERN PENTRU REVIZUIRE.**
>
> Acest document a fost generat de un agent AI urmand metodologia oficiala Anthropic
> `privacy-legal` (skill-urile `use-case-triage`, `pia-generation`, `reg-gap-analysis`
> din `github.com/anthropics/claude-for-legal`). NU este consultanta juridica. Fiecare
> caracterizare juridica de mai jos este un **ajutor pentru un om care revizuieste**,
> nu o concluzie — dreptul aplicabil categoriilor speciale + deciziilor automate in
> fitness este nesigur si interpretabil. Inainte de Beta, un avocat / DPO calificat
> RO/UE trebuie sa valideze. Citarile de articole GDPR sunt din cunostinte de model
> `[model knowledge — verify]` si trebuie verificate contra sursei primare (EUR-Lex,
> ghiduri EDPB/ANSPDCP) inainte de a te baza pe ele.
>
> **Pregatit de:** Claude (agent privacy-legal) | **Data:** 2026-05-31 | **Status:** DRAFT
> **Product owner / Operator:** Daniel (fondator solo Andura) | **Revizor confidentialitate:** _de numit (Daniel / avocat extern)_

---

## 0. Ipoteza de jurisdictie (citeste prima)

Acest triaj + PIA presupun **GDPR (Regulamentul UE 2016/679) + dreptul RO** (Legea
190/2018), operator stabilit in Romania, persoane vizate in UE. Config-ul oficial al
plugin-ului `privacy-legal` nu era populat la rulare (template cu `[PLACEHOLDER]`), deci
am rulat in mod **PROVIZORIU** cu jurisdictia fixata pe RO/UE per cererea Daniel — NU pe
default-ul US al skill-ului. Daca Andura ajunge sa proceseze persoane din alte
jurisdictii (UK GDPR, state US), analiza se reface.

---

## 1. Verdict triaj (use-case-triage) — sus, onest

### Concluzie: 🔴 **DPIA OBLIGATORIE** (mandatory) — NU doar PIA

**ACTIVITATEA:** Andura colecteaza profil demografic + de sanatate fizica (varsta, sex,
greutate, inaltime, masuratori corporale, % grasime estimat) + jurnale de antrenament,
greutate si nutritie, le stocheaza local + optional in cloud (Firebase RTDB), si ruleaza
**8+1 motoare de coaching** care produc **automat** prescriptii de antrenament + tinte
nutritionale (TDEE/kcal, deficit/surplus, faze) pe baza acestor date.

**CLASIFICARE:** DPIA MANDATORY
**Trigger casa (house trigger):** N/A — config plugin neconfigurat (mod provizoriu)
**Trigger DPIA GDPR Art. 35:** **DA** — vezi cele 3 criterii decisive mai jos
**Conflict cu politica de confidentialitate:** Minor (vezi §4 gap-uri) — NU un STOP

### Cele 3 criterii decisive care impun DPIA (Art. 35(3)) `[model knowledge — verify]`

1. **Date din categorii speciale "pe scara larga" (Art. 9 + Art. 35(3)(b)).** Greutatea,
   masuratorile corporale (talie/gat/sold), pliurile cutanate si **% grasime corporala
   estimat** sunt date privind sanatatea fizica. Politica deja shipped admite explicit
   acest lucru: *"Datele privind sanatatea (greutate, masuratori corporale) sunt date din
   categorii speciale (Art. 9)"* (`ro.json:2190`). Procesarea sistematica a categoriilor
   speciale catre toti utilizatorii Beta este un indicator primar de DPIA.

2. **Evaluare/scoring sistematic + decizii automate (Art. 35(3)(a) + Art. 22).** Cele 8+1
   motoare (`engineWrappers.ts`, `engine/*`) genereaza **automat**, fara interventie umana,
   tinte de kcal (`getNutritionTargetsToday` — TDEE − deficit capat la 25%), recomandari de
   antrenament, faze, readiness. Acesta este profiling pe date de sanatate.

3. **Combinatia "categorie speciala + evaluare automata + nou".** Ghidul WP248
   (criteriile EDPB pentru DPIA) considera ca **≥2 criterii indeplinite** → DPIA
   obligatorie `[verify-pinpoint]`. Aici se intrunesc cel putin 3 (date sensibile +
   evaluare automata + potential vulnerabilitate, ex. utilizatori cu tulburari alimentare
   expusi la tinte kcal). Pragul e clar depasit.

**Temei legal identificat (de confirmat in DPIA):** Art. 9(2)(a) — **consimtamant explicit**
pentru datele de sanatate; Art. 6(1)(b) contract pentru emailul de cont; Art. 6(1)(a)
consimtamant separat pentru backup cloud + Sentry. Codul implementeaza deja porti de
consimtamant separate (`auth-consent-checkbox`, `telemetryOptIn` default false).

> **Ce inseamna practic:** "DPIA obligatorie" NU blocheaza Beta de drept, dar GDPR cere
> ca DPIA sa fie **finalizata inainte** de inceperea procesarii pe scara larga. Acest PIA
> intern este primul pas; un DPIA formal (cu consultarea unui DPO/avocat si, daca riscul
> rezidual ramane ridicat, consultare prealabila ANSPDCP per Art. 36) este pasul urmator.
> Pentru un proiect solo, varianta pragmatica: documenteaza DPIA-ul, aplica mitigarile
> must-fix din §5, si pastreaza dovada ca ai facut evaluarea.

---

## 2. Inventar de date (fiecare rand citat la file:line)

| # | Categorie de date | Sursa (file:line) | Stocare | Temei legal (de confirmat) | Retentie |
|---|---|---|---|---|---|
| 1 | Varsta (18-99) | `onboardingStore.ts:34,106` | localStorage `wv2-onboarding-store` + RTDB `users/{uid}/wv2/onboarding` | Art. 6(1)(b) contract / 6(1)(a) consimtamant | Pana la stergere |
| 2 | Sex (m/f) | `onboardingStore.ts:18,35` | idem | idem | idem |
| 3 | Greutate (30-250 kg) — **sanatate Art. 9** | `onboardingStore.ts:39,107` + `progresStore.ts:9-13` | idem + `progres` node | **Art. 9(2)(a) consimtamant explicit** | idem |
| 4 | Inaltime (120-230 cm) | `onboardingStore.ts:40,108` | idem | Art. 6(1)(a) | idem |
| 5 | Obiectiv / frecventa / experienta | `onboardingStore.ts:19,22,23` | idem | Art. 6(1)(a) | idem |
| 6 | Greutate-tinta + deadline | `onboardingStore.ts:66,73` + `progresStore.ts:44-49` | idem | Art. 6(1)(a) | idem |
| 7 | Masuratori corporale (talie/gat/sold, pliuri) — **sanatate Art. 9** | `progresStore.ts:15-35` | RTDB `users/{uid}/wv2/progres` `bodyData` | **Art. 9(2)(a)** | idem |
| 8 | % grasime corporala (derivat US Navy / Jackson-Pollock) — **sanatate Art. 9** | `progresStore.ts:64-77` (`LatestBodyMeasurements`) + `bf-override` (`firebase.js:100`) | derivat in app + RTDB | **Art. 9(2)(a)** | idem |
| 9 | Jurnale antrenament (sesiuni, seturi, RPE, streak) | `storeSync.ts:67-105` (`workout` node) | localStorage + RTDB + IDB Tier-1 (>90 zile) | Art. 6(1)(a) / 9(2)(a) (efort fizic) | idem |
| 10 | Jurnale nutritie (kcal/proteine/apa zilnic) | `storeSync.ts:171-186` (`nutrition` node) | idem | Art. 9(2)(a) | idem |
| 11 | Jurnale aerobic (clase, durata, readiness subiectiv) | `storeSync.ts:192-226` (`aerobic` node) | idem | Art. 9(2)(a) | idem |
| 12 | Decizii coach (CDL, patterns, recomandari automate) | `firebase.js:101-103` (`coach-decisions*`, `cdl-patterns`) | localStorage + RTDB + IDB | derivat (profiling Art. 22) | idem |
| 13 | Email (magic link / Google OAuth) | `auth.js:43-52` (`firebase-magic-link-email`, `firebase-uid`) | localStorage + Firebase Identity Toolkit (Google) | Art. 6(1)(b) contract | Pana la stergere cont |
| 14 | Token-uri auth (id/refresh token, uid) | `auth.js:44-52` (`AUTH_STORAGE_KEYS`) | localStorage `firebase-*` | Art. 6(1)(b) | Sesiune / pana logout |
| 15 | Device ID (pseudonim) | `firebase.js:120-124` (`device-id`) | localStorage + RTDB `_device` | Art. 6(1)(f) interes legitim (sync) | Pana la reset |
| 16 | Token FCM (push opt-in) | `pushNotifications.ts` (`fcmTokens` node) | RTDB | Art. 6(1)(a) consimtamant | Pana la opt-out |
| 17 | Crash reports (PII strip) — opt-in default OFF | `util/sentry.js:32` (`beforeSend`) | Sentry (3rd party) | Art. 6(1)(a) consimtamant separat | Per retentie Sentry |
| 18 | Foto progres (base64) | `firebase.js:98-99` | **doar localStorage** (exclus din cloud) | Art. 9(2)(a) | Local pana la stergere |

**Mod oaspete (skip-auth):** `appStore.ts:27` + `Auth.tsx:103` — datele raman exclusiv
local (Tier-0), niciun apel Firebase (`getUserPath()` → null, `firebase.js:85-89`). Pentru
acesti utilizatori Andura nu e operator de date in cloud (datele nu parasesc dispozitivul).

---

## 3. Evaluare de riscuri (severitate Critic / Inalt / Mediu / Scazut)

Riscuri specifice, legate de design (NU "data breach" generic), per standardul de
calitate al skill-ului `pia-generation`.

| # | Risc | Probabil. | Impact | Severitate | Mitigare | Status |
|---|---|---|---|---|---|---|
| R1 | **Hard-delete dupa 30 zile NU e executat server-side.** `buildSoftDeleteFlag` (`auth.js:625`) construieste doar un flag `scheduledHardDelete`; nu exista cron/Cloud Function shipped care sa stearga efectiv nodul RTDB la termen. Datele de sanatate ale unui cont "sters" pot supravietui indefinit in cloud → incalca Art. 17 + promisiunea din politica (`ro.json:2196` "sters definitiv dupa 30 zile"). | Inalt | Inalt | **Critic** | Implementeaza job server-side care executa hard-delete (DELETE `users/{uid}`) la `scheduledHardDelete`; SAU schimba politica sa nu promita ceva neimplementat. | Gap |
| R2 | **Datele Art. 9 nu sunt criptate at-rest la nivel aplicatie.** RTDB cripteaza in transit (HTTPS) si la nivel Google infra, dar nu exista criptare app-side a categoriilor speciale; accesul depinde de regulile RTDB + tokenul uid. Daca regulile RTDB sunt laxe (de verificat in Firebase Console — NU exista in repo), datele de sanatate ar putea fi citite cross-uid. | Mediu | Inalt | **Inalt** | Verifica + ataseaza regulile RTDB (`.read`/`.write` scoped la `auth.uid === $uid`) ca artefact in DPIA. Documenteaza masurile tehnice Art. 32. | Necunoscut (in afara repo) |
| R3 | **Decizii automate pe date de sanatate (Art. 22) fara transparenta/contestare.** Motoarele dau tinte kcal (deficit capat 25% TDEE) + prescriptii fara explicatie "de ce" sau cale umana de contestare. Pentru un user vulnerabil (ex. tulburare alimentara), o tinta kcal automata e un risc real de vatamare. | Mediu | Inalt | **Inalt** | (a) Disclaimer medical exista deja (LOCK 4) — bun; (b) adauga in politica o sectiune Art. 22 (logica implicata + dreptul la interventie umana); (c) podea kcal 1200 exista (D-LOCK 8) — mentine. | Partial (disclaimer da, transparenta Art. 22 nu) |
| R4 | **Transfer in afara UE catre Google fara dovada SCC atasata.** Politica afirma SCC (`ro.json:2194`), dar nu exista in vault un DPA Google/Firebase semnat sau referinta la mecanismul de transfer. Afirmatia "acoperite de SCC" e corecta in general pentru Firebase, dar trebuie probata. | Scazut | Mediu | **Mediu** | Confirma DPA-ul Google Cloud / Firebase (Google ofera SCC standard) si pastreaza dovada. Verifica regiunea RTDB (US vs `europe-west`). | Gap (proba) |
| R5 | **k-anonimitate k=5 (ADR 019) NU e in cod shipped.** Cautarea in `src/` nu gaseste niciun prag de cohorta k≥5 enforced. Daca NU exista nicio partajare agregata, riscul e teoretic (nu se partajeaza nimic) — dar daca ADR 019 presupune ca un viitor feature de benchmarking agregat e protejat, controlul lipseste. | Scazut | Mediu | **Mediu** | Confirma: nu exista azi partajare agregata → R5 e N/A pentru Beta. Daca se adauga benchmarking, implementeaza k≥5 inainte. | N/A azi / viitor |
| R6 | **Minori — poarta de varsta e doar declarativa (18+).** `ONBOARDING_BOUNDS.age min:18` (`onboardingStore.ts:106`) respinge varste <18 introduse, dar nu exista verificare reala a varstei. Un minor poate minti. Politica declara 18+ (`ro.json:2202`). Risc acceptabil pentru self-declaration, dar de documentat. | Scazut | Mediu | **Scazut** | Pastreaza 18+ self-declaration + nota in DPIA ca masura proportionala (nu se justifica verificare invaziva de varsta pentru un app de fitness). | Acceptabil |
| R7 | **Leak PII pe dispozitiv partajat — mitigat deja.** `enforceDataOwner` + `wipeUserDataOnLogout` (`dataReset.js:164-204`) sterg datele Tier-0 la logout + account-switch. Bine proiectat. | Scazut | Mediu | **Scazut** | Niciuna — control existent adecvat. | Done |

**Risc rezidual dupa mitigari:** Mediu. R1 (hard-delete) si R3 (transparenta Art. 22)
sunt cele care trebuie inchise inainte de a considera procesarea conforma; R2 cere
verificarea regulilor RTDB (artefact in afara repo).

---

## 4. Analiza de gap-uri (reg-gap-analysis) — politica shipped vs. cerinte GDPR

Politica + Termenii sunt **deja shipped si solide** (`ro.json:2180-2240`, `Privacy.tsx`,
`Terms.tsx`, draft `LEGAL-GDPR-TERMS-DRAFT.md`). Acopera operator, ce/de ce, temei Art. 6+9,
stocare, persoane imputernicite + transfer SCC, retentie, drepturi GDPR + ANSPDCP, copii,
securitate. Gap-urile de mai jos sunt fata de un standard GDPR complet.

### Must-fix INAINTE de Beta

| Gap | Cerinta GDPR | Stare actuala | Remediere concreta |
|---|---|---|---|
| **G1 — Identitate operator incompleta** | Art. 13(1)(a) cere **nume legal + adresa** a operatorului | Politica spune doar "fondatorul, persoana fizica in Romania" (`ro.json:2186`) | Completeaza nume legal (PFA/SRL/persoana fizica) + adresa de contact in `legalPage.privacyControllerBody`. **Blocant** pentru o politica conforma. |
| **G2 — Hard-delete neimplementat** | Art. 17 — stergerea trebuie sa se intample efectiv | Doar flag `buildSoftDeleteFlag`, fara executor server-side (R1) | Implementeaza jobul de hard-delete la 30 zile, SAU rescrie `ro.json:2196` sa nu promita stergere automata pe care nu o livrezi. |
| **G3 — Lipsa sectiune Art. 22 in politica** | Art. 13(2)(f) — informare despre decizii automate + logica implicata + dreptul la interventie umana | Politica nu mentioneaza profiling/decizii automate, desi motoarele le fac | Adauga un paragraf: "Andura genereaza automat recomandari de antrenament + tinte nutritionale pe baza profilului tau. Acestea sunt recomandari informative, nu decizii cu efect juridic; poti sa le ignori si sa ne contactezi." |

### Should-fix (risc mai mic, ne-blocant)

| Gap | Cerinta | Remediere |
|---|---|---|
| **G4 — Proba transfer SCC** | Art. 44-46 | Pastreaza DPA Google/Firebase + confirma regiunea RTDB (ideal `europe-west`). Daca regiunea e US, transferul e mai expus. |
| **G5 — Regulile RTDB ca artefact** | Art. 32 masuri tehnice | Exporta + versiona `database.rules.json` in repo cu `.read/.write` scoped la `auth.uid === $uid`; e dovada securitatii pentru DPIA. |
| **G6 — Registru activitati prelucrare (ROPA)** | Art. 30 | Pentru solo founder sub 250 angajati exista derogare partiala, DAR procesarea de categorii speciale pe scara larga **anuleaza derogarea** → ROPA devine obligatoriu. Creeaza un ROPA minimal (acest inventar §2 e baza). |
| **G7 — Consimtamant Art. 9 granular** | Art. 9(2)(a) "explicit" | Bifa de signup acopera Termeni+Confidentialitate generic (`auth-consent-checkbox`). Pentru Art. 9 "explicit" e mai sigur un consimtamant distinct pentru datele de sanatate (sau formulare clara ca introducerea greutatii/masuratorilor = consimtamant explicit pentru categorie speciala). |

### Nice-to-have

| Gap | Remediere |
|---|---|
| G8 — Notificare breach (Art. 33/34) | Documenteaza o procedura simpla de notificare (cui, in 72h) — chiar 1 paragraf intern. |
| G9 — Politica de retentie explicita pe Tier-1 IDB (>90 zile) | Mentioneaza ca sesiunile arhivate local sunt incluse in export + sterse la reset (deja adevarat — `SettingsExport.tsx:52-60`, `dataReset.js:83-93`). |
| G10 — Versionare consimtamant | Stocheaza versiunea politicii acceptate la signup (pentru dovada). |

### Deja conform (util pentru mesajul "suntem in mare regula")

- Drepturi GDPR auto-servire: **export JSON** Art. 20 (`SettingsExport.tsx` — acopera toate
  store-urile + Tier-0 legacy keys + Tier-1 IDB), **stergere** Art. 17 local + cloud
  (`dataReset.js` `clearUserCloudData` + `clearUserIndexedDB`).
- Minimizare: doar campuri care hranesc coaching-ul; foto exclus din cloud
  (`firebase.js:98`); circumferinte-noise eliminate (`progresStore.ts:18-21`).
- Securitate: magic link passwordless, token strip la export (`SettingsExport.tsx:27`),
  Sentry PII-strip (`sentry.js:32`), HTTPS, dev/prod separation enforced (`firebase.js:46-53`).
- Categorie speciala recunoscuta explicit in politica (`ro.json:2190`) — onestitate rara.
- Mod oaspete = zero cloud (privacy-by-default, Art. 25).

---

## 5. Checklist de actiuni pre-Beta (ordonat dupa prioritate)

1. **[CRITIC] G2/R1** — Implementeaza executorul de hard-delete la 30 zile SAU corecteaza
   promisiunea din politica. (Owner: Daniel/CC)
2. **[CRITIC] G1** — Completeaza nume legal + adresa operator in politica. (Owner: Daniel)
3. **[INALT] R2/G5** — Verifica + versioneaza regulile RTDB (`auth.uid === $uid`) ca dovada
   Art. 32. (Owner: Daniel/CC)
4. **[INALT] G3/R3** — Adauga sectiune Art. 22 (decizii automate) in politica. (Owner: CC)
5. **[MEDIU] G6** — Creeaza un ROPA minimal (inventarul §2 = baza). (Owner: Daniel)
6. **[MEDIU] G4/R4** — Confirma DPA Google/Firebase + regiunea RTDB; pastreaza dovada SCC.
7. **[MEDIU] G7** — Clarifica consimtamantul explicit Art. 9 pentru datele de sanatate.
8. **[SCAZUT] G8/G10** — Procedura breach 72h + versionare consimtamant acceptat.
9. **[DECIZIE] DPIA formal** — Decide cu Daniel daca finalizezi un DPIA formal (recomandat
   dat fiind verdictul RED) si daca riscul rezidual ramane ridicat dupa mitigari, evalueaza
   consultarea prealabila ANSPDCP (Art. 36). Pentru un solo founder, varianta minima =
   documenteaza DPIA-ul (acest PIA + mitigarile aplicate) si pastreaza dovada.

---

## 6. Drepturile persoanei vizate — cum sunt implementate efectiv

| Drept | Se poate exercita? | Cum |
|---|---|---|
| Acces (Art. 15) | Da | Export JSON in app (`SettingsExport.tsx`) + datele vizibile in UI |
| Portabilitate (Art. 20) | Da | Export JSON structurat, toate store-urile + Tier-0 + Tier-1 (`SettingsExport.tsx:34-118`) |
| Stergere (Art. 17) | Partial | Local: complet (`dataReset.js`); Cloud: DELETE per-cheie (`clearUserCloudData`) — DAR hard-delete cont la 30 zile neexecutat (R1/G2) |
| Rectificare (Art. 16) | Da | Editare profil in Cont → Profil; toate campurile editabile |
| Retragere consimtamant (Art. 7(3)) | Da | Stergerea datelor = retragere; toggle Sentry/push/backup |
| Opozitie / restrictionare (Art. 18/21) | Partial | Prin email operator; nu exista buton dedicat (acceptabil pentru solo) |
| Plangere autoritate | Da | ANSPDCP (dataprotection.ro) mentionat in politica (`ro.json:2206`) |

---

## 7. Recomandare

**APROBAT CU CONDITII** (de un om — eu nu aprob procesarea).

Andura are o postura de confidentialitate **peste medie** pentru un proiect solo pre-Beta:
local-first, minimizare reala, export/stergere implementate, categorie speciala recunoscuta
onest. Cele 3 conditii blocante inainte de Beta sunt **G1 (identitate operator)**, **G2/R1
(hard-delete real)** si **G3/R3 (transparenta Art. 22)**. Verdictul de triaj ramane
**DPIA OBLIGATORIE** din cauza combinatiei categorie-speciala + decizii automate pe scara
larga — finalizarea unui DPIA documentat (cu mitigarile din §5) este pasul corect inainte de
a porni procesarea Beta pe scara larga.

**Sign-off:** _______________ (Daniel / avocat extern), data ___________

---

## 8. Fisiere de metodologie folosite + nota de verificare

**Metodologie (clonat din `github.com/anthropics/claude-for-legal`, plugin `privacy-legal`):**
- `privacy-legal/skills/use-case-triage/SKILL.md` — arborele de triaj (PROCEED / PIA REQUIRED
  / DPIA MANDATORY / STOP) + criteriile mandatory-assessment.
- `privacy-legal/skills/pia-generation/SKILL.md` — structura PIA (sectiunile 1-7, standardul
  de calitate al riscurilor, diff-ul cu politica).
- `privacy-legal/skills/reg-gap-analysis/SKILL.md` — formatul de gap-uri (must-do / should-do
  / already-compliant) + tier-ul de atributie a surselor.
- `privacy-legal/CLAUDE.md` (template) — house style (era `[PLACEHOLDER]` → rulare provizorie).

**Sursa Andura (file:line citate in §2-§4):** `onboardingStore.ts`, `progresStore.ts`,
`storeSync.ts`, `firebase.js`, `auth.js`, `dataReset.js`, `SettingsExport.tsx`, `Auth.tsx`,
`Privacy.tsx`, `sentry.js`, `i18n/ro.json`, `LEGAL-GDPR-TERMS-DRAFT.md`.

> **Nota de verificare a citarilor:** Articolele GDPR (Art. 6, 9, 13, 17, 22, 30, 32, 35, 36,
> 44-46) si ghidul WP248/EDPB de mai sus au fost generate de model (`[model knowledge —
> verify]`) si NU au fost verificate contra sursei primare. Inainte de a te baza pe ele,
> verifica-le contra EUR-Lex / ghidurilor EDPB + ANSPDCP. Pinpoint-urile (subpunctele de
> articol) au cel mai mare risc de fabricatie — verifica-le primele.

### Urmatorii pasi (alege)
- **Finalizeaza DPIA formal** din acest PIA (recomandat — verdict RED).
- **Inchide must-fix-urile** (G1/G2/G3) si re-evalueaza riscul rezidual.
- **Adu la avocat** acest document + cele 3 conditii blocante pentru validare RO/UE.
- **Watch & wait** — daca Beta se amana, re-triaza la schimbare de scop/date.
