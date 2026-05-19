# Audit final — andura-clasic.html

**File:** `andura-clasic.html` (4212 LOC, 702KB cu lucide inline)
**Date:** 2026-05-11 birou
**Baseline:** spec V2 LOCKED V1 (~719 cumulative) + Co-CTO review iterations 1-3
**Status overall:** ✅ **COMPLIANT** (~98%)

---

## A. Violations spec FIXED (2/2 ✅)

| ID | Item | Status | Implementare |
|---|---|---|---|
| C1 | `program-confirm-modal` → drill-down | ✅ | `screen-confirm-program-change` line 2102 |
| C2 | `wv2-edit-modal` → inline edit | ✅ | Inline pe coach-card, modal complet șters |

---

## B. Features adăugate (7/7 ✅)

| ID | Feature | Implementare |
|---|---|---|
| L1 | "De ce facem ăsta?" workout | Bottom sheet `openWhyExercise()` + `WHY_EXERCISE` map cu reasoning detaliat per exercitiu + fallback generic |
| L2 | Inactivity auto-pause | 7min threshold, hook click/touch/keydown reset, non-modal prompt "Ești acolo?" (Continui / Salvează și ieși) |
| L3 | Wake Lock | `navigator.wakeLock.request('screen')` la entry workout, release la exit, visibilitychange listener re-acquire, graceful fallback |
| L4 | Banner cont anonim | Sticky cross-screen (Antrenor/Progres/Cont) când `auth-status === 'skip'`, CTA "Salvează" → trigger L5 merge flow |
| L5 | Anonymous→Auth merge | `openMergePreview()` bottom sheet cu lista date care se mută (antrenamente, streak, weight logs, ținte, istoric) → "Asociaza cu Google" confirm |
| L6 | Reactivation post-delete 30-zile | NEW `screen-auth-reactivate` adăugat post `confirm-delete` (Co-CTO 2026-05-11). Conținut: clock icon, "Cont înghețat", data delete + zile rămase + data permanentă, recap "Ce se recuperează", 2 butoane (Reactivează brick / Lasă-l șters ghost). Tweak demo trigger în panel. |
| L7 | Sesiune întreruptă reluare | `pauseWorkoutSession()` salvează în localStorage `wv2-paused-session`, card brick `resume-session-card` pe Antrenor home cu 2 acțiuni (Reia / Renunță) |

---

## C. Decisions clarificări (4/4 ✅)

| ID | Decizie | Status |
|---|---|---|
| #10 | Auth Google primary | ✅ Google brick top, Email ghost middle, Skip ultimul cu risk-note |
| #11 | Termina mai devreme confirm | ✅ `screen-confirm-finish-early` cu body "NU pierzi progresul" explicit |
| #12 | Sumar săptămânal archive | ✅ DEFER pre-Beta (push notification only, NU pagină dedicată — corect per decision) |
| #13 | Mesaj zilnic coach archive | ✅ DEFER pre-Beta (push only, NU carusel home — corect) |

---

## D. Paradigm adaptive scheduling (8/8 ✅)

Aliniat fundament PROJECT_VISION + ADR 011 CDL "follows the body, not the calendar":

- ✅ Antrenor home "Coach-ul recomandă AZI" (dark card) — NU "Programul săptămânii Sapt. 3 Ziua 3/4" rigid
- ✅ WHY line italic Lora dinamic ("Pectoralii recuperează din marți · spatele e gata")
- ✅ REST-DAY variant complet (`coach-rest-card` cream theme + readiness rationale + btn-ghost "Sesiune ușoară mobilitate" + link "Vreau totuși antrenament →")
- ✅ Schedule override 4 opțiuni adaptive (Vreau alt tip · Sesiune ușoară · Sar ziua · Vreau antrenez când era pauză contextual)
- ✅ Step 2 alt-type dinamic generat din muscleRecovery state (Push Disponibil verde / Legs Recomandat #2 brick / Full body usor Safe neutral)
- ✅ Tweak debug Context coach workout/rest toggle în Tweaks panel
- ✅ Drop "Schimbă planul săptămânii" row complet + ADD text link "Vrei altceva azi? →" subtle sub butonul Începe sesiunea (decision Daniel)
- ✅ Heatmap Istoric legenda nouă (Greu/Normal/Ușor/Zi liberă, NU "missed/skipped" shame)

---

## E. Dead code cleanup (3/3 ✅)

| Item | Status | Action |
|---|---|---|
| Orphan JS `getElementById('program-confirm-modal')` | ✅ Removed | Line 2898 (defensive null check pentru element eliminat) |
| Legacy `<button>Schimbă planul săptămânii</button>` `display:none` | ✅ Removed | 9 LOC eliminate complet din DOM |
| Comments L6 clarificare win-back vs post-delete | ✅ Updated | HTML + JS comments explicit |

Pre-existent dead code minor (NU regression, low priority): line ~1175 legacy hidden Cue/Coach card/Coach voice/History/Log inputs/Rating zone (CD original, pre-existent din workout V1).

---

## F. Spec V2 LOCKED V1 fundamentals (preserved)

Confirmate prezente fără regresii:

**Architecture:**
- ✅ 4 taburi root nav V2 (Antrenor/Progres/Istoric/Cont) — V2 LOCKED final
- ✅ Lang toggle RO/EN inline header (V2 §11 LOCKED)
- ✅ Pattern destructive confirm 7 drill-down pages (reset-coach / schimba-faza / redo-onboarding / logout / delete / program-change / finish-early) — uniform ZERO-MODAL pattern
- ✅ Pattern drill-down universal physical pages (back button PWA history real navStack)

**Onboarding:**
- ✅ 7 ecrane Big 6 + medical (Obiectiv/Vârsta/Sex/Înălțime/Greutate/Medical/Frecvență) per ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05.7
- ✅ Disclaimer medical integrat (NU modal, drill-down page)

**Auth:**
- ✅ Google OAuth primary brick + Email Link fallback ghost + Skip ghost cu risk-note
- ✅ Anonymous mode (skip-auth)
- ✅ Anonymous→Auth merge flow (L5)
- ✅ Delete 30 zile grace + Reactivate flow (L6)

**Workout flow:**
- ✅ Energy check 3 stări + Energy cause 4 cauze blocking
- ✅ Workout Preview NEW (Pasul 3)
- ✅ Workout execution V2 state-driven (logging→rating→resting→logging)
- ✅ ⋯ menu sheet (Pain/Skip/Finish/Sound/Cancel) bottom sheet OK pattern
- ✅ Exercise action sheet (Aparat ocupat/lipsa/Nu vreau) bottom sheet
- ✅ Rest overlay non-modal sticky bottom
- ✅ Why exercise help-circle (L1)
- ✅ Inactivity prompt (L2)
- ✅ Wake Lock (L3)
- ✅ Post-RPE 1 întrebare 3 stări (Ușor/Potrivit/Greu)
- ✅ Post-summary: PR banner F11 + Streak F8 + Sumar stats + Muscle groups + Marius detaliu granular

**Antrenor home:**
- ✅ Coach recomandă AZI card adaptive (workout/rest variant via Tweak)
- ✅ Programe 6 obiective LOCKED (Auto + Forță + Masă musculară + Slăbire + Mentenanță + Longevitate/Sănătate)
- ✅ "Ceva nu merge" 1 buton merged → Pain + Equipment (LOCK V1 2026-05-10 SUPERSEDE ADR 023 split)
- ✅ Pain 3 predefined (free text REMOVED 2026-05-11)
- ✅ Equipment swap 4 preset (free text REMOVED 2026-05-11)
- ✅ Schedule override drill (paradigm adaptive)
- ✅ Resume session card (L7)
- ✅ Win-back inactive user card (separat de L6 — distinct feature)

**Progres tab:**
- ✅ TDEE/faza badge + auto detect
- ✅ F3 oboseala strip + F9 BMR strip (V1 LOCKED single number, NU visual bar)
- ✅ Greutate snapshot 7z + Greutate țintă
- ✅ Plan nutritie text-based
- ✅ F1 Alerte (LOW_ADHERENCE + STAGNATION doar — DROP HIGH_DEVIATION + EARLY_END + PEAK_HOURS pre-Beta confirmat)
- ✅ Logheaza greutate drill-down (V1 zero-modals canonical)
- ✅ Logheaza nutritie kcal + proteine inline (RE-IN-SCOPE V1 per §AMENDMENT 2026-05-10)

**Istoric tab:**
- ✅ Ultima sesiune memory card (mutată din Antrenor — locul natural)
- ✅ Quick stats 3 (Zile consecutive / Sesiuni total / Recorduri)
- ✅ Calendar heatmap cu legenda nouă (history NU adherence)
- ✅ Sesiuni recente drill
- ✅ F14 V1 ratings window 90 zile (Ușor/Potrivit/Greu)
- ✅ Drill-downs: Greutate & BF / Import Nutritie (JSON) / Recorduri Personale

**Weight timeline:**
- ✅ Range selector text-toggle (30/60/90/Tot) — NU dropdown
- ✅ KPI row Greutate + BF estimat
- ✅ Chart SVG cu clickable dots + tooltip
- ✅ Photo progress 3 columns + "+ Adaugă"
- ✅ Loguri recente drill

**Cont V2 inventar complet:**
- ✅ Account card header (avatar inițial + nume + email)
- ✅ Section Cont (Profil&ținte / Notificări / Abonament placeholder)
- ✅ Section General (Aspect → Themes drill 4 themes + Setări → Reset coach + Refă onboarding + Schimba faza)
- ✅ Section Date&confidențialitate (Politica / Termeni / Descarcă JSON)
- ✅ Zona sensibilă drill separat (Logout + Delete 30 zile grație)
- ✅ Footer Ajutor (Suport / Despre / FAQ)
- ✅ v1.0.0 text gri

**Profil&ținte:**
- ✅ Date personale (Nume/Vârsta/Înălțime/Greutate)
- ✅ Compoziție corporală: Talie + Gât → BF auto US Navy + override manual checkbox + Fallback Demographic Prior K-NN per ADR 017
- ✅ Ținte personale (Greutate țintă + Pana în)

**Notificări:**
- ✅ Section Antrenament (Reamintire sesiune / Pauza între seturi / Sărit ședință)
- ✅ Section Coaching (Mesaj zilnic 07:30 / Sumar săptămânal)
- ✅ Section Ore de liniște (Nu deranja 22-07)

**Theme picker:**
- ✅ 4 cards brand-prefixed (🤍 Clasic / 🌑 Living Body / 💎 Luxury / 🧠 Brain Coach)

---

## G. Technical improvements

- ✅ **Lucide embedded inline** — self-contained, no CDN dependency. Verified via jsdom: 245 `[data-lucide]` elemente, 100% render success rate post-`createIcons()`. File standalone deployable.
- ✅ Tailwind cdn preserved (preview-time only, port React va elimina)
- ✅ JS syntax valid (all 2 inline script blocks parse clean)

---

## H. Observații minor (non-blocking pre-port)

1. **Win-back inactive user card** (Antrenor home) coexistă cu screen-auth-reactivate (L6 real). Sunt features separate semantic clarificat în comentarii. Daniel decide la port React dacă păstrăm ambele sau drop unul.

2. **Pre-existent legacy hidden elements** (line ~1175 Cue/Coach card/Coach voice/History/Log inputs/Rating zone) — kept-in-DOM display:none din CD original V1 workout. NU regression, low priority cleanup pentru CC port.

3. **Tweak panel** vizibil în mockup-demo time only. La port React în prod, panel-ul Tweaks dispare complet (Persona auto-detect + Context coach citit din `_dirSession.restDay`).

---

## Verdict final

✅ **COMPLIANT cu spec V2 LOCKED V1.** Base solidă pentru port-first vanilla JS modules `src/` Step 1 + React migration Step 2.

**Cumulative LOCKED V1 impact (vault):** ZERO (mockup design refinement, NU product/architecture additive). Cumulative rămâne ~719 PRESERVED.

**Next steps recomandate:**
1. Port mecanic mockup Clasic → 3 themes (Living Body / Luxury / Brain Coach) per Theme Parity Invariant LOCKED V1
2. Daniel review final cap-coadă pe toate 4 themes
3. CC Opus BATCH 2 Antrenor port implement (vault SSOT branch `feature/v2-vanilla-port`)
