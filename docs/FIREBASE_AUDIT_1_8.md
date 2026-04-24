# FIREBASE AUDIT 1.8 — Security + Sync Cap

**Created:** 2026-04-24
**Status:** AUDIT ONLY — zero modificări cod/config
**Refs:** H27g (rules + DSN), C2g (.slice(0,500) data loss)

---

## 1. Current State

### 1.1 Firebase Credentials în Client Code

**Fișier:** `src/firebase.js`

```js
export const FIREBASE_URL = 'https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app';
export const USER_PATH = 'users/daniel';
```

**Nu există:**
- Firebase SDK (`import { initializeApp }` etc.) — se folosește raw REST API
- `apiKey`, `authDomain`, `projectId` în client — REST API nu le cere pentru RTDB neauthentificat
- Orice formă de autentificare (`getAuth`, `signIn`, `onAuthStateChanged`, anonymous auth)
- `.env` / `.env.local` / `.firebaserc` / `firebase.json` în repo

**Concluzie:** `FIREBASE_URL` este singurul secret expus. Nu e secret în sensul tradițional — Firebase RTDB URL e public by design (apare în toate SDK-urile Firebase). Securitatea provine **exclusiv din Database Rules**, nu din ascunderea URL-ului.

---

### 1.2 Authentication

**Status: NONE**

Zero autentificare implementată. Toate request-urile sunt unauthentificate:
```js
fetch(`${FIREBASE_URL}/${path}.json`, { method: 'PUT', body: JSON.stringify(data) })
```

Consecință: `auth` în Firebase Rules este `null` pentru orice request din aplicație.

---

### 1.3 Database Rules — Stare Curentă

**Status: UNKNOWN** — nu pot fi citite fără acces la Firebase Console.

**Inferit din comportament:** Aplicația funcționează fără autentificare → rules permit access neauthentificat la `users/daniel`. Cel mai probabil una din variantele:

**Varianta A — Fully open (risc maxim):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
→ Oricine citește/scrie ORICE din DB.

**Varianta B — Path-restricted (risc mediu):**
```json
{
  "rules": {
    "users": {
      "daniel": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
→ Numai `users/daniel` e accesibil. Alte paths sunt protejate.

**Acțiune necesară:** Verifică manual în Firebase Console → Realtime Database → Rules tab.

---

### 1.4 Sync Cap — Analiză Exhaustivă

**Fișiere cu `.slice(0, 500)` pe `logs`:**

| Fișier | Linie | Context |
|--------|-------|---------|
| `src/pages/coach/logging.js` | 100 | Fiecare set logat → cap imediat |
| `src/pages/coach/session.js` | 230 | Early stop marker → cap imediat |
| `src/firebase.js` | 102 | Merge la sync din Firebase |
| `src/onboarding.js` | 116 | Import baseline la onboarding |

**Mecanism:**
```js
logs.unshift({ ...newLog });        // prepend — cel mai nou la index 0
DB.set('logs', logs.slice(0, 500)); // taie tot ce e după poziția 500
```
→ Logs sunt newest-first. `.slice(0, 500)` păstrează **500 cele mai recente**. Logurile vechi cad **fără warning, fără arhivare**.

**Calcul impact — când se pierd date:**

- ~40 baseline logs adăugate la onboarding (inject.js)
- Sesiune tipică: 5-6 exerciții × 3 seturi = 15-18 seturi = 15-18 intrări
- Cap efectiv non-baseline: ~460 real logs
- **Sesiuni până la data loss: `460 ÷ 16 = ~29 sesiuni`**
- La 3 sesiuni/săptămână → **~10 săptămâni** de la prima sesiune reală
- La 4 sesiuni/săptămână → **~7 săptămâni**

**Status probabil Daniel (estimat):**
- Dacă app-ul e activ de >7-10 săptămâni → **deja pierde date vechi**
- Logurile care cad sunt folosite de: `weaknessDetector`, `stagnationDetector`, `calibration`, `dp.js` (weight history)
- Impact calibration: cu cap 500 și >29 sesiuni, calibration funcționează corect (vede 500 logs = ~29 sesiuni), dar nu vede progresul de la sesiunile 30+

**Firebase sync:** `.slice(0, 500)` în `firebase.js:102` apare la merge-ul de arrays — dar `logging.js` deja face cap local → Firebase primește max 500 → merge rezultă în tot max 500 → capul din firebase.js e redundant dar nu dăunează.

---

### 1.5 tierStorage.js — Scaffold Existent Nefolosit

`src/util/tierStorage.js` implementează complet arhitectura tier pe 3 niveluri:
- **live** (0-90 zile): date complete per-entry
- **aggregate** (90 zile - 1 an): sumar zilnic
- **archive** (>1 an): sumar lunar

**Status: ZERO imports în codebase.** Este scaffold gata de folosit pentru OPT C, dar nu e wired up.

---

## 2. Target State v1 — FAZA 1.8 (Single-User, No Auth)

### 2.1 Rules v1 — Path Restriction fără Auth

```json
{
  "rules": {
    "users": {
      "daniel": {
        ".read": true,
        ".write": true
      },
      "$other_user": {
        ".read": false,
        ".write": false
      }
    }
  }
}
```

**Ce face:** Restricționează accesul la `users/daniel` exclusiv. Niciun alt path nu e accesibil.

**Ce NU face:** Nu blochează un atacator care știe exact că path-ul e `users/daniel`. Auth e în continuare null.

**Upgrade față de fully-open:** Elimină riscul că cineva scrie la alte paths din DB. Reduce suprafața de atac la un singur path cunoscut.

---

### 2.2 Sync Cap v1 — Increase la 5.000

**Recomandare OPT B** (detalii secțiunea 4).

Schimbare: `logs.slice(0, 500)` → `logs.slice(0, 5000)` în toate 4 locurile.

**Calcul capacitate la 5.000:**
- 5.000 ÷ 16 seturi/sesiune = **~312 sesiuni**
- La 3-4 sesiuni/săptămână = **~78-104 săptămâni = 1.5-2 ani** fără data loss
- Storage: ~5.000 intrări × ~200 bytes/intrare = ~1 MB în localStorage (față de 5-10 MB limit)
- Firebase RTDB: 1 MB transmis per sync — în limite free tier cu mult headroom

---

## 3. Target State v2 — FAZA 4 (Multi-User cu Firebase Auth)

### 3.1 Rules v2 — Per-UID Auth

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

**Cerințe implementare:**
- `firebase/auth` SDK adăugat
- Anonymous auth sau Google/email sign-in la prima deschidere
- `USER_PATH` devine `users/${auth.currentUser.uid}` (nu mai e hardcoded `daniel`)
- Migration: logurile existente ale lui Daniel sub `users/daniel` → migrate la `users/${danielUID}` (one-time script)

**Notă:** `USER_PATH = 'users/daniel'` a fost centralizat în `src/config/constants.js` la FAZA 1.2. Migration = 1 loc de schimbat.

### 3.2 Sync Cap v2 — tierStorage.js Integration

OPT C: wireuirea `tierStorage.js` existent:
- `logs` key rămâne pentru live (0-90 zile) — backwards compatible
- `tier-aggregate` + `tier-archive` keys pentru date mai vechi
- Engines care cer full history primesc `[...getLiveLogs(), ...reconstructFromAggregate()]`

**Effort:** ~4-6h (tierStorage.js deja scris, trebuie wired în buildCoachContext + firebase sync)

---

## 4. Migration Plan — FAZA 1.8

### Step 1 — Backup complet DB (MANUAL, PRE-ORICE)

```js
// În browser console, pe dispozitivul Daniel:
window.syncFromFirebase().then(() => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    data[k] = JSON.parse(localStorage.getItem(k) || 'null');
  }
  const a = document.createElement('a');
  a.download = 'salafull-backup-prefaza18.json';
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
  a.click();
});
```

→ Salvează fișierul. Acesta e rollback-ul.

### Step 2 — Export Firebase rules curente (MANUAL)

În Firebase Console → Realtime Database → Rules → copiază JSON-ul curent și salvează ca `salafull-rules-backup-YYYYMMDD.json` local.

### Step 3 — Deploy rules v1 (MANUAL, Firebase Console)

Înlocuiește cu rules v1 din secțiunea 2.1. Testează imediat:
```
# Verificare: app se deschide și sincronizează normal
# Verificare: nu există erori Firebase în console browser
```

### Step 4 — Fix sync cap (COD, Claude Code)

În 4 fișiere: `logging.js:100`, `session.js:230`, `firebase.js:102`, `onboarding.js:116`
→ `logs.slice(0, 500)` → `logs.slice(0, 5000)`

**Build + test + commit.**

### Step 5 — Verify post-deploy

- App se deschide fără erori
- Set logging funcționează (scrie în Firebase)
- `syncFromFirebase` restaurează date
- `window.syncToFirebase()` în console → returnează `true`

---

## 5. Risk Matrix

| Schimbare | Impact | Reversibilitate | Risc |
|-----------|--------|-----------------|------|
| Rules v1 (path restrict) | Daniel blocat dacă path greșit | Immediate rollback via Console paste | **MEDIU** — test imediat după deploy |
| Rules v1 pe DB fully open | Fără schimbare comportamentală | N/A | **LOW** — dacă e deja B |
| slice 500 → 5000 | Zero funcțional, mai mult storage | Git revert | **VERY LOW** |
| slice 500 → 5000 pe Firebase | Payload mai mare per sync (~4-5× la full) | Git revert | **LOW** — sub 1MB chiar la 5000 entries |
| Rules v2 (auth) | Daniel blocat până la auth flow implementat | Rollback la v1 | **HIGH** — nu face în FAZA 1 |
| tierStorage integration | Engines primesc date diferite | Revert + retest | **MEDIUM** — nu face în FAZA 1 |

---

## 6. Recomandări pe Sub-Sarcini

### 6a. Rules (FAZA 1.8)
**Acțiune:** Verifică în Firebase Console care e regula curentă.
- Dacă e fully open → deploy rules v1 (path restrict)
- Dacă e deja path-restricted → skip (deja OK pentru FAZA 1)
- **Needs manual action** — Claude Code nu are acces la Firebase Console

### 6b. Sync Cap (FAZA 1.8)
**Acțiune:** `slice(0, 500)` → `slice(0, 5000)` în 4 locuri
**Recomandare: OPT B** — 4 caractere schimbate, 1.5-2 ani headroom, zero complexity
- OPT A (remove cap): risc cost Firebase la scale, risc localStorage bloat la 10+ ani
- OPT B (5000): **RECOMANDAT** — optimal pentru FAZA 1, timp de viață 2+ ani
- OPT C (tierStorage): cel mai robust, dar ~4-6h effort + risc regressions — defer FAZA 4

### 6c. Authentication (FAZA 4)
**Acțiune:** Nu în FAZA 1. Documentat în FAZA_2_ROADMAP.md → Priority pentru FAZA 4.
**De reținut:** `USER_PATH` centralizat în `constants.js` → schimbare = 1 loc.

### 6d. DSN / API Key Exposure
**Status:** Nu e o problemă activă.
- `FIREBASE_URL` e public by design (Firebase doesn't treat it as secret)
- Dacă repo devine public → URL expus, dar rules protejează datele
- API key nu există în client (REST API nu îl cere)
- **Concluzie:** No action needed în FAZA 1.

---

## 7. Actions Needed per Responsabil

| # | Acțiune | Responsabil | Urgență |
|---|---------|-------------|---------|
| A1 | Verifică rules curente în Firebase Console | Daniel (manual) | HIGH |
| A2 | Export + salvare rules curente ca backup | Daniel (manual) | HIGH |
| A3 | Deploy rules v1 dacă e fully-open | Daniel (manual) | HIGH |
| A4 | Fix slice 500→5000 în 4 fișiere | Claude Code | MEDIUM |
| A5 | Test post-rules: app sync funcționează | Daniel (manual) | HIGH — după A3 |
| A6 | Rollback plan: rules JSON salvat local | Daniel (manual) | HIGH — înainte de A3 |
