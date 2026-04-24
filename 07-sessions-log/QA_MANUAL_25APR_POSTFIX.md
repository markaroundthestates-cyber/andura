# QA MANUAL — 25 APR 2026 (Post C10c fix)

**See also:** [[INDEX_MASTER]] | [[FINDINGS_MASTER]] | [[QA_MANUAL_24APR_2230]] | [[OPUS_NUCLEAR_AUDIT_25APR]]

**Context:** User real (Daniel) testing live app post-FAZA 2 + Task #26 (C10c cache coalesce) deployed.
**Environment:** GitHub Pages → https://markaroundthestates-cyber.github.io/salafull/
**Scope:** validare fix C10c + descoperire bug-uri reziduale + feature requests noi.

---

## ✅ CONFIRMĂRI

### C10c Cache Coalesce (Task #26) — VALIDAT pe Firebase sync inițial
- **Înainte:** 12+ log-uri `[Cache] Director session invalidated` la page load
- **După:** 1 log `[Cache] Director session invalidated` la page load
- **Condiție de validare:** normal navigation (nu reset flow)
- **Status:** ✅ FIXED — scope-ul Task #26 atins

---

## 🔴 BUG-URI CRITICE NOI / CONFIRMATE

### BUG A (CRITICAL) — Full Reset declanșează cache cascade 12+ invalidări
**Flow observat:**
- User → Full Reset button
- Reload
- Console afișează 12+ `[Cache] Director session invalidated`
- Plus 12+ `[CoachDirector] Calibration: cold_start` (re-runs)

**Implicație:** Task #26 fix nu acoperă reset flow — doar cascade-ul din `syncFromFirebase` loop.

**Root cause suspect:**
- `dataCleanup.fullReset` face `ALL_KEYS.forEach(k => localStorage.removeItem(k))` — asta nu triggerează DB.set wrapper (folosește localStorage direct). 
- Dar după reset → `location.reload()` cu `?nocache=`, la fresh load: `initFirebaseSync` rulează și Firebase PUT null din reset s-a propagat → `syncFromFirebase` pull-uiește state nou (payload remote ar trebui gol).
- Dacă remote returnează null, `forEach` exit early pentru fiecare key. În acest caz cache NU ar fi invalidat.
- **Alternativ:** dacă `syncFromFirebase` returnează null (remote=null), după el `syncToFirebase` (line 135) face PUT cu payload local gol. Apoi multiple `renderCoachIdle` apeluri din diverse route changes.
- **Mai probabil:** cascade-ul vine din `dataCleanup.js` calls directe: linia 174, 279, 339, 433 — toate apelează `window._directorCache.invalidate()` direct, bypass la debounce. Plus `setTimeout(() => { window._suppressFirebaseSync = false; }, 3000)` → după reload suppress e OFF, fiecare DB.set din sync triggers scheduleInvalidation.

**Fix propus pentru Task #27 (extend scope):**
- Wrap `fullReset` și variantele în `suppressInvalidations`
- Sau înlocuiește direct `invalidate()` calls din dataCleanup cu `scheduleInvalidation()` (prin DB.set pe un key dummy, sau expune o metodă coalesce-aware)

**Severity:** CRITICAL. Task #27 (reset registry) trebuie să includă asta în scope.

---

### BUG B (HIGH) — H30c persistă (confirmat live)
**Observație:** UI afișează pattern-uri false:
- "Marți 88% skip rate"
- "Miercuri 100% skip rate"
- "Joi 100% skip rate"

**Status:** Known, va fi rezolvat prin **Task #28 + #29** (neexecutate încă).
- Task #28: banner prin director (nu DB.get direct în renderIdle.js:186)
- Task #29: `dayScheduled` = zile plan active, nu zile calendar

**Severity:** HIGH. Nu blochează Task #27 dar trebuie în același sprint.

---

### BUG C (HIGH) — "Rerun onboarding" nu funcționează post-reset
**Symptom:** Daniel: "Rerun onboarding down"
**Suspect:** `onboarding-done` key persistă după Full Reset — sau se re-populează imediat prin Firebase pull.

**Flow ipotetic:**
1. User Full Reset → `ALL_KEYS.forEach(removeItem)` șterge `onboarding-done` local
2. Reload → `initFirebaseSync` → `syncFromFirebase` → pull remote
3. Dacă remote conține `onboarding-done: true` (din starea pre-reset care n-a fost PUT null la timp), se re-setează local
4. `main.js:156` detectează `onboarding-done=true` → skip onboarding
5. User rămâne în app state, nu ajunge la onboarding wizard

**Alternativ:** Dacă remote e null (PUT null a reușit), atunci `main.js:156` check `(DB.get('logs') || []).length > 0` ar trebui să fie false → onboarding ar trebui să ruleze. Totuși dacă `inject.js:77 DB.set('onboarding-done', true)` rulează automatic la un `injectBaseline`, onboarding e skip.

**Needs investigation** post Task #27 — poate fi simptom al H31c (reset incomplet) sau bug separat în main.js flow.

**Severity:** HIGH (blocks user from re-testing onboarding).

---

### BUG D (MEDIUM) — "Ocupat" button persistă după Full Reset
**Symptom:** Key `equipment-occupied-session` nu e curățat de Full Reset.
**Evidență cod:**
- `dataCleanup.js:4-16 TEST_RESIDUE_KEYS` — nu include `equipment-occupied-session`
- `dataCleanup.js:18-42 USER_DATA_KEYS` — nu include `equipment-occupied-session`
- `dataCleanup.js:212 ALL_KEYS = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS, 'onboarding-done', 'onboarding-completed']` — deci `equipment-occupied-session` e skip-uit
- **DAR:** e în SYNC_KEYS (firebase.js:9) — vine înapoi prin sync dacă remote n-a fost șters
- Confirmă H31c registry gap

**Rezolvare:** TASK #27 (registry-based reset) — va acoperi automat prin `localStorage.clear()` + preserve list.

**Severity:** MEDIUM.

---

## 💡 FEATURE REQUESTS (Tier 5, documentate separat)

### FR1 — Săptămânal LMMJVSD clickable pe zile
**Daniel:** "vreau și clickable pe zilele alea"
**Scope:** UI enhancement pe componenta calendar săptămânal — click pe zi → detalii sesiune / istoric.
**Effort:** 2-3 zile. **Tier:** 5 (FAZA 4 UX).

### FR2 — "Trend activ" UX color
**Daniel:** "trend activ de ce cu roșu?"
**Observație:** Roșul semnalează alert / pericol. Pentru "tendință pozitivă" (progres), color-ul ar trebui verde sau neutru (var(--text2)).
**Scope:** CSS/UI fix, 10 minute.
**Tier:** 5 (cleanup UX), dar cost-low merită imediat.

### FR3 — Echipament list insuficient
**Daniel:** "am dat ceva lipsa la aparate și sunt prea puține opțiuni"
**Observație:** `sessionBuilder.js:14 EQUIP_MAP` are ~7 tipuri echipament. Lista nu acoperă diversitatea gym-urilor reale (smith machine, hack squat, trap bar, dip station, pull-up bar, etc.).
**Scope:** Expand `EQUIP_MAP` + `EXERCISES_BY_TYPE` + alternative engine pentru mapping mai bogat.
**Effort:** 3-5 zile. **Tier:** 5 (FAZA 4 feature).

### FR4 — UX clarity pe persistență alegeri
**Daniel:** "nu știu dacă mă mai întreabă și sesiunea viitoare de ele"
**Observație:** User NU știe dacă "echipament lipsă / ocupat" e per-sesiune sau permanent. UI trebuie să comunice explicit:
- `equipment-occupied-session` → per-sesiune (curățat la endSession)
- `unavailable-equipment` → permanent (up to user to remove)
**Scope:** Micro-UX — tooltip / label "per sesiune" vs "permanent" pe butoane.
**Effort:** 1 zi. **Tier:** 5.

---

## 🟡 NOTE DEBUGGING

### Console error "listener indicated async response"
**Sursă:** Extensie browser (adblock, translator, dev tool, etc.) — NU cod aplicație SalaFull.
**Action:** Ignore safely. Poate fi ascuns prin Console filter "hide extension messages".

---

## LOCAL STORAGE STATE (din screenshot)

Keys observate post-activitate:
- `ex-extra-sets-Pec Deck / Cable Fly` — dinamic, write-only, NU în reset list
- `ex-extra-sets-Pushdown` — același
- `ex-extra-sets-Bayesian Curl` — același
- `backup-1777066619124` (11839 bytes) — logBackup lucrează ✅
- Plus toate keys-urile standard

**Confirmă audit finding:** keys dinamice `ex-extra-sets-*` supraviețuiesc Full Reset. Audit point #5 (write-only dynamic keys) — confirmat live.

---

## PRIORITIZARE REVIZUITĂ POST-QA

| Prio | Task | Status |
|------|------|--------|
| 1 | **Task #27 (H31c reset registry) — ESCALATED CRITICAL** | PENDING — scope extins cu reset cascade (BUG A) |
| 2 | **Task #28 (H30c banner via director)** | PENDING |
| 3 | **Task #29 (H30c plan-days not calendar-days)** | PENDING |
| 4 | **Investigate "Rerun onboarding" post Task #27 (BUG C)** | PENDING — poate fi sub-task de #27 |
| 5 | FR1-4 | QUEUE FAZA 4 (nu urgent) |

---

## VALIDARE C10c — SCOPE vs GAP

**Scope Task #26 = ACOPERIT:** Firebase sync inițial cascade (`syncFromFirebase` loop cu 11 DB.set) → 1 invalidare netă. ✅ Validat live de Daniel.

**Gap descoperit:** Reset flow produce propriul cascade de invalidări (BUG A). Task #26 fix nu acoperă:
- Direct `invalidate()` calls din `dataCleanup.js:174,279,339,433`
- Post-reload `syncFromFirebase` (dacă remote conține stale data)
- Multiple `renderCoachIdle` re-renders post-reset

**Concluzie:** Task #26 a fost corect dimensionat (scope: sync cascade). Gap-ul pe reset e un **scope nou** care merge în Task #27 (register + coalesce reset flow).

---

## Next action

Execute TASK #27 (H31c registry) cu scope EXTENDED:
- `src/util/dataRegistry.js` — listă completă + regex prefixe
- `fullReset` → `localStorage.clear()` + preserve list
- **Plus:** wrap reset flow cu `suppressInvalidations` + replace direct `invalidate()` calls cu `scheduleInvalidation` (coalesced)
- **Plus:** investigate BUG C (rerun onboarding) ca parte din register audit
