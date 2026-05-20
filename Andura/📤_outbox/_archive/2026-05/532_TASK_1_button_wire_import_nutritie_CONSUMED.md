# TASK 1 — Wire "Import Nutritie (JSON)" button în prod src/

**Track:** P4 Track 2 fix 1 (per `ANDURA_PRIMER.md` §6).
**Category:** ENG tactical, prod src/ wire-up.
**Atomic commit type:** `fix(istoric):` sau `feat(weight-import):` (CC decide după impact real).

## Intent

Mockup `04-architecture/mockups/andura-clasic.html` are pe Istoric tab buton "Import Nutritie (JSON)" cu `onclick="showToast('Import Nutritie (JSON)')"` = PLACEHOLDER. Prod port-side trebuie să cheme funcția reală `triggerMFPImport()` (sau echivalent existing) din modulul de weight/nutrition.

**Drift PRIMER:** PRIMER §6 menționează "mockup line 3034" — incorect, butonul real e pe line 1234 în mockup. Linia 3034 e JS routing logic (`if (el) el.classList.add('active');`). NU urma linia, urmează identificarea prin string match.

## Discovery (CC autonomous)

1. **Mockup grep:** `grep -n "Import Nutritie" 04-architecture/mockups/andura-clasic.html` → confirmă linia exactă + textul exact (probabil line 1234, dar verifică).
2. **Src prod grep:** `grep -rn "Import Nutritie\|importMFP\|triggerMFPImport\|importNutritie" src/` → identifică:
   - Unde apare butonul în prod (tab Istoric component)
   - Dacă funcția target există (`triggerMFPImport` în `src/pages/weight.js` per PRIMER, sau alt nume)
3. **Verify `src/pages/weight.js`:** citește fișierul, identifică funcția importer existentă (poate fi `triggerMFPImport`, `importMFPCSV`, `handleMFPImport` etc. — match pe semantic NU literal).

## Specs decision (CC tactical)

- Dacă funcția există în src/ cu nume diferit → wire butonul la numele REAL existing (NU rename funcția).
- Dacă funcția NU există în src/ încă (port incomplete) → STOP TASK 1, flag în raport `📤_outbox/LATEST.md` §Issues "Funcție importer lipsă din src/, port incomplete — necesită Daniel decide port-side completion vs alt approach". Continuă orchestrator la TASK 2.
- Dacă butonul în prod e deja wired la altceva (NU placeholder) → verifică intentul. Dacă wire-ul existing îndeplinește scopul → marchează TASK 1 ca "already-LANDED-no-op" în raport, continuă. Dacă wire greșit → corectează.

## Fix concret (după discovery)

În fișierul prod cu butonul Istoric (probabil `src/pages/istoric.js` sau component analog):
```js
// BEFORE (placeholder mockup-style):
onclick="showToast('Import Nutritie (JSON)')"
// or equivalent event handler addEventListener showing toast

// AFTER (wire la funcția reală):
onclick="triggerMFPImport()"
// or event handler invocând funcția existentă din src/pages/weight.js
```

Import statement dacă lipsește (în top fișier component Istoric):
```js
import { triggerMFPImport } from './weight.js';
// sau path relativ corect — CC decide după structura src/ actuală
```

## Test coverage

NU adăuga teste în TASK 1 — TASK 4 batch test extension acoperă (per orchestrator sequencing).

## Acceptance criteria

- [x] Buton "Import Nutritie (JSON)" în Istoric tab prod wired la funcția importer reală (NU showToast placeholder).
- [x] Funcția existentă invocată corect (signature + import path corecte).
- [x] Build clean: `npm run build` zero errors, zero warnings noi.
- [x] Tests baseline 3734 PASS preserved (NU adăugat teste încă, doar invariant).
- [x] Smoke manual mockup-side dacă posibil (browser DevTools, click button → console nu mai e showToast, but actual function attempted).
- [x] Atomic commit message conventional: `fix(istoric): wire Import Nutritie button to triggerMFPImport()` sau similar.

## Files atinse

- `src/pages/istoric.js` (sau component Istoric tab — CC discovery).
- Eventual `src/pages/weight.js` (verify only, NU edit decât dacă import trebuie ajustat).
- ZERO mockup modificat (mockup = DESIGN MASTER read-only în această task).

## Raport per task (input pentru LATEST.md §Tasks)

```
TASK 1 ✓/✗ — <commit hash> | fix(istoric): wire Import Nutritie button
- Files: <list>
- LOC delta: <±N>
- Discovery findings: <function name real, path real>
- Deviations spec: <dacă PRIMER line 3034 confirmat drift, etc.>
```
