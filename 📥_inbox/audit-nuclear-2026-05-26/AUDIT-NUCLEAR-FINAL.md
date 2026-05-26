# AUDIT NUCLEAR pre-Launch — SINTEZA FINALA (2026-05-26)

**Baseline:** main `48c4a7ae`. 7 agenti Opus read-only, linie-cu-linie. Zero editari cod.
**Rapoarte sursa:** AUDIT-1-engines · AUDIT-2-react-ui · AUDIT-3-state-wiring · AUDIT-4-data-security · AUDIT-5-spec-parity-coverage · AUDIT-W2-wiring-truth · AUDIT-W2-engine-math.

---

## VERDICT GLOBAL

- **0 CRITICAL** pe tot codul. Nimic care crapa la load, niciun auth bypass, nicio pierdere de date pe happy-path.
- **Procent "cat e Andura din ce trebuie" (Bugatti pre-Beta FULL, functional): ~85%.**
  - Structural (ce exista in cod): ~92-94% — toate engine-urile, feature-urile, ecranele sunt prezente.
  - Functional/incredere (ce livreaza userului real): ~85% — tras in jos de creierul de nutritie dormant + un cluster de UI placeholder care minte userul + 2 buguri de logica engine.
- **Poate livra ce vrei? DA, cu un gap definit.** Moat-ul "coach care gandeste pentru tine" e REAL si impresionant pe partea de ANTRENAMENT (dovedit la nivel de cod). Pe partea de NUTRITIE (TDEE adaptiv Kalman, diferentiator de prima pagina) e momentan INACTIV.
- **"extreme-quality-ready" din raportul de noapte = supraevaluat.** Adevarat pentru structura + creierul de workout; fals pentru nutritie + ecranele placeholder.

## CE S-A RATAT (intrebarea ta directa)

- **NU lipseste niciun engine** — toate 9 pipeline + 6 auxiliare prezente, math 96% corect (re-derivat de mana).
- **NU lipseste niciun feature** (19/19) si niciun ecran structural (49/50, 1 cosmetic).
- **NU e contrazisa nicio decizie LOCKED.**
- **CE s-a ratat de fapt = WIRING + ADEVAR vs PLACEHOLDER:**
  1. **Engine #4 Bayesian/Kalman TDEE = dormant.** Creierul de nutritie exista si e corect matematic, dar nu primeste niciodata date reale → intoarce mereu baseline 2640 kcal. "Vizor fara usa" pe nutritie. Contrazice promisiunea de brand (PRIMER §2) + D046 LOCKED ("TDEE adaptiv trebuie sa fie REAL pre-Beta").
  2. **Cluster de UI placeholder prezentat ca functional** — minte userul (reset incomplet, teme, notificari, aparate lipsa).
  3. **2 buguri de logica engine** (F1 faza inversata, F4 gap goal slabire).
  4. **Server-side doar pe tine** (reguli RTDB neverificate = risc scurgere date).
  5. **Claim legal inaintea codului** (Termeni promit k-anonimat 5+, cod inexistent).

---

## HIGH (8) — grupate pe teme

### Tema 1 — Creierul de nutritie e deconectat (cel mai important)
- **[HIGH] BN/Kalman TDEE input-starved** (`NutritionInline.tsx:66` + `TDEEStrip.tsx:91` cheama engine-ul fara userState → `evaluateBN({})` → `tier:'none'` → `BASELINE_NUTRITION` 2640 kcal hardcodat la `engineWrappers.ts:522,599`). Nu exista nicaieri un builder de observatii din `nutritionStore.dailyLog` + `progresStore.weightLog`. 8/9 engine-uri adapteaza live; #4 e singurul mort. **Activare = un slice focusat** (builder observatii + context BN pasat din 2 call-site-uri).

### Tema 2 — UI placeholder care minte userul (incredere + integritate date)
- **[HIGH] "Reseteaza toate datele" sterge doar cheile `wv2-`**, NU datele engine (`logs`, `pr-records`, `pain-cdl`, `coach-decisions` scrise neprefixat via `db.js`). Textul zice "Toate... vor fi sterse... nu poate fi anulata" — fals. PR Wall arata recorduri vechi dupa reset. (DeleteAccount face corect `localStorage.clear()` — doar Reset e partial.)
- **[HIGH] SettingsThemes "Se aplica instant"** dar 3/4 palete doar scriu localStorage, nu aplica nimic vizual.
- **[HIGH] SettingsNotifications** = panou complet (toggles/frecventa/zile/ora/quiet-hours) cu ZERO dispatch real de notificari. Quiet-hours = text static hardcodat.
- **[HIGH] "Aparate lipsa" din Cont** arunca userul in `workout-preview` la save, iar `missingEquipment` nu e nici persistat, nici citit de vreun consumer.

### Tema 3 — Bug de logica engine
- **[HIGH] F1 — Tempo clasifica `LOAD` (W1, saptamana usoara) ca high-intensity in loc de `LOAD+` (W2, cea grea)** (`tempo/constants.js:187-190` + `crossEngineHooks.js:58`). Comentariile proprii zic "PEAK or LOAD+"; engine-ul vecin (EnergyAdjustment) o face corect. Cue-uri de forma pe saptamana gresita. Confirmat de re-derivarea math (W2).

### Tema 4 — Server-side, doar Daniel poate inchide
- **[HIGH] Reguli RTDB nu-s in repo** — toata izolarea per-UID atarna de reguli care impun `auth.uid === $uid`. O regula gresita = scurgere totala silentioasa pe care clientul n-o poate detecta. De verificat in consola Firebase inainte de GO; recomandare: commit `database.rules.json` + test reguli.
- **[HIGH] Nod legacy `users/daniel`** citibil cu orice token authed → de blocat/sters post-migrare.

---

## MED (selectie ~16) — fixabile in pasaj de polish
- **F4** — user pe slabire primeste coridor de hipertrofie din Periodization (`periodization/crossEngineHooks.js:99-108`, fara caz `slabire`). Partial salvat downstream de detectia CUT.
- **MMI #9 invizibil** — boost re-resume fara suprafata UI de reasigurare (D059 deschis, decizie UX pe tine).
- **No 404/errorElement route** — white screen pe URL gresit.
- **Dark theme rupt** pe FatigueStrip + RatingsStrip90Day (`bg-white` hardcodat) — dark e real via themeSync.
- **SettingsProfile arunca tacut** campurile Talie/Gat/target dupa "Profil salvat".
- **GDPR contradictie regiune** — eu-central-1 vs europe-west1 in copy/config.
- **Jargon englez "Streak"/"Readiness"** pe ecranul principal Gigel.
- **macro key naming inselator** (`protein_g_per_kg_lbm` tine de fapt grame totale) — landmina latenta.
- **B1 — clash unitate BF%** (percent 2-60 in `usNavyBF.js:41` vs fractie 0-1 in GoalAdaptation) — latent, fara consumer azi.
- **k-anonimat** in Termeni fara cod (onestitate/legal).
- Multi-device merge "local wins" + tombstones acopera doar 3 din chei + `USER_DEFAULTS` livreaza bio-ul real al lui Daniel ca default cold-start.

## LOW/NIT
PrWall chevron netappable, RatingsStrip "Usor" colorat cu token rosu, legenda "Recuperare" moarta, branch-uri duplicate engine, warmup DELOAD clamp mislabel, profile ordering fragility (B2), MMI boost la 100% peak (per ADR 033).

---

## CE E SOLID (sa nu uitam)
- Math engine 96% corect, re-derivat de mana: Kalman 1D, Normal-Normal conjugat, Brzycki, US-Navy BF, deload, ±15%/±10%, kcal-floor, week%4. Zero NaN/divide-by-zero/varianta negativa neaparata.
- Pure-function ADR 026 tinut strict (zero Date.now/Math.random/mutation in cele 8 engine-uri pure). Constraint Object immutable, ordine canonica §42.10, MMI compune ultimul.
- Creierul de WORKOUT chiar primeste inputuri reale (istoric, RPE per-set, readiness, persona, tier, goalPhase, bf%, Pain-CDL) — claim cycle-4 meritat PE GREUTATI.
- Securitate cod ~90%: zero secrete hardcodate, PII scrubbing solid + consent-gated, GDPR erasure/export thorough, OAuth code-complete + degradare gratioasa, migratii idempotente fail-loud.
- Time-bomb scheduleStore reparat real (ancorat la saptamana curenta).
- Parity ecrane ~98% (PRIMER §5 "88%" e stale — de updatat).

---

## DRUMUL PANA LA ~95%+ (lista bounded, fara surprize)
1. Wire observations-builder + context BN → activeaza TDEE adaptiv (Tema 1) — slice focusat.
2. Fix cluster placeholder UI (Tema 2): reset complet + teme reale SAU dezactiveaza/ascunde ce nu merge + notificari (dispatch sau scoate panoul) + aparate-lipsa persist+nav.
3. Fix F1 (LOAD→LOAD+) + F4 (caz slabire in Periodization).
4. Daniel server-side: verifica/commit reguli RTDB + blocheaza nod legacy.
5. Decide k-anonimat: implementeaza pipeline SAU inmoaie wording Termeni.
6. MED/LOW polish (dark theme, 404 route, profile fields, jargon RO, GDPR regiune).
7. Decizie UX MMI reveal (D059).

**Niciuna CRITICAL. Toate fixabile fara rescriere.** Bones-urile sunt Bugatti; gap-ul e wiring + adevar-vs-placeholder, nu capabilitate absenta.
