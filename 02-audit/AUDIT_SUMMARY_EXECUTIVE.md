# AUDIT SUMMARY EXECUTIVE

**Data:** 24 apr 2026  
**Scope:** Audit general (1774 linii) + Audit coach.js (2120 linii)  
**Total findings:** 125 unique (~15 overlap eliminate)  
**Surse:** `docs/AUDIT_BULLETPROOF_23APR.md` + `docs/AUDIT_COACH_JS_24APR.md` (gitignored în repo)

---

## VERDICT ÎN 3 RÂNDURI

1. **Arhitectura e bună conceptual, implementarea e inconsistentă** — fix-uri chirurgicale, nu rewrite
2. **9 bug-uri CRITICE blochează launch public** — 5 din coach.js + 4 arhitecturale
3. **Motor "Living AI" e parțial teatru în runtime** — 3 engines (Calibration, SessionBuilder, AA) nu funcționează real

---

## TOP 9 CRITICAL (blockers absolute)

### 🔴 GROUP A — "Engine-ul minte user-ul"

**1. Calibration stuck pe 3 sesiuni forever**  
Audit general C1 — `coachDirector.js:23`  
User cu 500 sesiuni e tratat ca user nou. Moat-ul "învață progresiv" = fals.  
**Impact:** Sistemul nu devine smart cu timpul.

**2. SessionBuilder = null literal**  
Audit general C9 — `sessionBuilder.js:5`  
"Motorul inteligent" care construiește sesiuni nu există. Fallback static.  
**Impact:** Recomandările nu sunt personalizate deloc.

**3. AA Engine mort (RPE hardcoded 8)**  
Audit coach C1 — `coach.js:581`  
Fiecare set logat cu RPE=8 fix. AA.check returnează null 100%.  
**Impact:** Progresia bazată pe dificultate = inexistentă.

### 🔴 GROUP B — "Date pierdute silent"

**4. Data loss 2/3 seturi la fiecare refresh** ⚠️ CATASTROFIC  
Audit coach C4 — `coach.js:581` + `main.js:117`  
Log fără `set` și `kg` fields. Dedupe colapsează 3 seturi identice în 1.  
**Impact:** Sesiune 3×60kg×10 devine 1×60kg×10 după refresh.

**5. Firebase sync .slice(0,500)**  
Audit general C2 — `firebase.js:102`  
După ~10 săptămâni, cele mai vechi loguri tăiate silent.  
**Impact:** Pierdere istoric 2-3 luni utilizare intensivă.

**6. Sesiuni <5min șterse fără confirmare**  
Audit coach C5 — `coach.js:690`  
User face 3 exerciții rapid = toate datele pierdute fără avertisment.

### 🔴 GROUP C — "Security + Resource leaks"

**7. Firebase rules open + DSN hardcodat public**  
Audit general H27 — `firebase.js:5`, `sentry.js:4`  
Oricine cu DevTools poate șterge toate datele.  
**Impact:** Sabotaj trivial la launch public.

**8. cancelWorkout leaks (listeners + wakelock + draft)**  
Audit coach C2 — `coach.js:663`  
Event listeners rămân, bateria consumă, draft neșters.

**9. rateSession dublu la double-tap**  
Audit coach C3 — `coach.js:863`  
Touchscreen jitter = 2 ratings, fatigue score supraestimat.

---

## PATTERN-URI META

1. **"Daniel-hardcoded" în 5+ fișiere** (110.4kg, 1800kcal, 2026-07-20, 'users/daniel' path)
2. **isInCut duplicat în 9 locuri** → schimbarea phase logic = 9 puncte failure
3. **Empty catch blocks în 5+ engines** → silent failures
4. **setInterval fără Date.now() compensation** → timer-e ruptre în tab inactiv
5. **Window.* pollution ~10 locuri** → global state fragile

---

## FAZA 1 — PLAN EXECUTIV

### Sub-faze ordonate

```
FAZA 1 — ENGINE BULLETPROOF
├── 1.0 Split coach.js planning (Opus) ⏳ IN PROGRESS
├── 1.1 Split coach.js mecanic (Sonnet)
├── 1.2 Multi-tenancy decouple
├── 1.3 Log schema fix + migration one-shot
├── 1.4 cleanDuplicateLogs fix
├── 1.5 ctx.allLogs real (calibration live)
├── 1.6 sessionBuilder implementation
├── 1.7 AA engine decizie (activate sau delete)
└── 1.8 Firebase security + sync cap
```

### Exit criteria FAZA 1
- Engine calculează context-aware reasoning corect
- Output consistent între engines
- Teste pass (Vitest + E2E)
- Tu faci 2-3 sesiuni reale, validezi "simt" personalizate

---

## FAZA 2 — BUG FIXES + RELIABILITY

După FAZA 1 validată:
- Toate UX bugs non-engine (cancelWorkout, rateSession, skipPause, draft resume)
- Timer Date.now() compensation
- Empty catch blocks → Sentry
- XSS hardening
- isInCut consolidation
- Magic numbers → constants
- Toate MEDIUM + LOW (60+ findings)

### Exit criteria FAZA 2 (CRITICAL)
**Zero breakdown în 3-5 zile usage real.**  
App merge "5 din 5", oricâte abuze user.

---

## FAZA 3 — INFRASTRUCTURE + OBSERVABILITY

- Sentry proper coverage
- Test coverage boost
- Logging/metrics
- CI/CD hardening

---

## FAZA 4 — FEATURES NOI

- 144 programe generative (framework, nu hardcoded)
- Injury detection 3-layer
- Recovery protocol living
- Health export PDF (medical/kineto/full)
- UX revolution

---

## ESTIMARE TIMELINE

**Claude Code time (estimativ):**
- FAZA 1: ~10-14h → 5-7 zile calendar
- FAZA 2: ~6-8h → 3-4 zile calendar (+ usage validation)
- FAZA 3: ~4-6h → 2-3 zile calendar

**Total până la launch-ready:** ~3 săptămâni calendar.

**TIMELINE RULER:** "Perfect, indiferent cât durează."

---

## CE NU FACEM ACUM

Amânat conștient:
- Accessibility (Domain 11 audit)
- i18n (Domain 12) — RO-only first launch
- Performance optimizations (H6, H17)
- 144 programe, injury, health export (FAZA 4)
- React migration (post-launch)

---

## SURSE AUDIT

**NOT în vault (sensibile, gitignored în repo):**
- `docs/AUDIT_BULLETPROOF_23APR.md` (general, 1774 linii)
- `docs/AUDIT_COACH_JS_24APR.md` (coach, 2120 linii)

Accesibile doar în Codespaces. Conțin detalii vulnerabilități security.
