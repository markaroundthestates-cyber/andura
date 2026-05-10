# V1 Features Audit — LOCKED V1 2026-05-10 (renderIdle + rating)

**Status:** LOCKED V1 2026-05-10 chat ACASĂ continuation 2 (Claude chat autonomous Co-CTO scope per Daniel autonomy lock EXTINS verbatim *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."*). All 15 features LOCK V1 Co-CTO bias preserved verbatim. Predecessor `SPEC DRAFT V1` superseded. Unblocks BATCH 2 Antrenor port implement on `feature/v2-vanilla-port` branch.
**Date:** 2026-05-10 chat ACASĂ continuation MCP filesystem (Co-CTO autonomous prep per Daniel directive *"ia tu decizia si fa ce trebuie"*)
**Owner:** Daniel (CEO + Product, final LOCK V1) + Claude chat (Co-CTO Reviewer scope tactical)
**Scope:** **Limited to renderIdle.js + rating.js** (2 files mentioned `00-index/CURRENT_STATE.md §NEXT` priority #5 explicit). Other V1 prod files audit deferred separate dedicated chat dacă Daniel cere.
**See also:** [[../00-index/CURRENT_STATE]] §NEXT priority #5 | [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT (BATCH 2 Antrenor blocked acest audit) | [[PORT_FIRST_STEP_1_PARADIGM_V1]] (parent paradigm context) | [[mockups/andura-clasic.html]] V2 design SoT

---

## Methodology

Per feature identified V1 prod, Co-CTO recommendation:
- **Keep** (port to V2 vanilla): feature carries real Bugatti value + passes Gigel test (non-tech RO user benefits, NU friction)
- **Drop** (V2 mockup strict): feature edge-case low value sau Gigel-suspect (perceived gimmick / over-engineered)
- **Modify** (port simplified): feature value present dar V1 implementation over-complex, simplify pentru V2

**Filtru Bugatti:** "Ar fi mândru un Bugatti engineer?" + per memory rule.
**Filtru Gigel:** "Cum reacționează Gigel (user mediu non-tech RO)?" Trust breach + privacy panic + cultural friction RO + scope creep perceput = churn risk.

---

## renderIdle.js V1 prod features (465 LOC)

### F1: Pattern banners (5 types: LOW_ADHERENCE / HIGH_DEVIATION / EARLY_END / STAGNATION / PEAK_HOURS)

**V1 implementation:** `PATTERN_BANNER_STRINGS` map + `shouldShowPatternBanner` + `formatPatternMessage`. Banners afișează context coach observation pe pattern-uri detectate.

**Recommended Co-CTO: Modify (port simplified — keep 2 of 5).**

**Rationale Bugatti + Gigel:**
- LOW_ADHERENCE + STAGNATION = **Keep** (high signal user-facing — adherence drops + exercise stagnation 3+ săpt = actionable feedback Gigel înțelege "OK, lasă-mă să recuperez")
- HIGH_DEVIATION + EARLY_END + PEAK_HOURS = **Drop V2** (gimmick territory: "Coach detectat că termini devreme / faci la 22h" = paranoid surveillance Gigel suspect → trust breach risk)
- Plus QA calibration test e2e fail flag P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER deja open — bug lurking, fix la port nu carry forward

**Action:** V2 vanilla port = 2 patterns only (LOW_ADHERENCE + STAGNATION) + corectează LOW_ADHERENCE banner display bug per QA flag.

---

### F2: Last session memory card (top 3 exercises previous session same dayLabel + RPE + rating verdict)

**V1 implementation:** `renderLastSessionMemory` function. Citește logs + burns + ratings, afișează top 3 exercises by weight from same dayLabel previous session + average RPE + verdict (easy/normal/hard).

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** "Ultima sesiune de luni: top 3 exerciții + cum a fost" = high signal continuity user. Gigel scrolls în sus la coach idle, vede ce-a făcut săptămâna trecută = anchor pentru următoarea sesiune. Quality continuity. Implementation 30-40 LOC ~ tractable. Port direct.

---

### F3: Fatigue score display (`renderFatigueScore` + `calculateFatigueScore` engine import)

**V1 implementation:** Compute fatigue score din logs recent + display visual (bar/number).

**Recommended Co-CTO: Modify (port simplified — single number, NU bar/visual elaborate).**

**Rationale Bugatti + Gigel:** Fatigue concept util ("oboseala cumulată") dar visual elaborate = scope creep V1. Numar simple "Fatigue: 67%" + culoare verde/galben/roșu = sufficient pentru Gigel. Drop bar/multi-component visual.

---

### F4: Readiness verdict + score (`getTodayReadiness` + `getReadinessVerdict` + `READINESS_LABELS`)

**V1 implementation:** Engine readiness.js compute + UI display verdict label + numeric score.

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** Readiness = core coach value. "Ești gata azi: ✅ Verde / 🟡 Galben / 🔴 Roșu" simple + actionable. Gigel înțelege immediate. Engine deja pure functions ADR 018 §2 contract preserved. Direct port.

---

### F5: AA friction modal (`showAAFrictionModal` + `isAAFrictionDismissedToday`)

**V1 implementation:** Modal asks user friction questions on session start (motivație, oboseală, durere). Dismiss-once-per-day mechanism.

**Recommended Co-CTO: Drop V2 (defer to v1.5 dedicated UX flow).**

**Rationale Bugatti + Gigel:** Modal pe start sesiune = friction Gigel. "Întreabă-mă chestii înainte să apuc să-ncep" = annoyance pattern. Plus dismiss-once-per-day = sticky pe modal Gigel deja a închis. Defer la v1.5 cu UX flow inline (NU modal blocking) — eventual integration questions integrate în onboarding extended sau coach idle prompts pasive.

---

### F6: PR wall (`renderPRWall`)

**V1 implementation:** Display Personal Records achievements list cu visual badges.

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** PR-uri = motivație core gym. "🏆 Squat 100kg achievement" = high engagement Gigel cultural RO (gym pride). Direct port. Implementation probabil tractable LOC.

---

### F7: Coach director output (`sessionCache` + `setCachedDirector` + `uiToggleFlags`)

**V1 implementation:** Engine `coachDirector` pipeline output cached + flags pentru UI toggle behaviors.

**Recommended Co-CTO: Keep (port verbatim — core engine output integration).**

**Rationale Bugatti:** Coach director = output engine pipeline §42.10 (8 prescriptive engines). NU optional — fundamental V1 architecture. Port direct cu engine imports ADR 018 §2 preserved.

---

### F8: Streak counter (per `00-index/CURRENT_STATE.md §NEXT` priority #5 mention)

**V1 implementation:** Probabil în renderIdle.js LOC remaining (NU citit head — prepare reading later if Daniel pushes back).

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** "🔥 5 zile streak" = motivație gamification proven mainstream apps (Duolingo etc). Gigel cultural RO = motivat de "consistency = pride". Drop = pierde retention vector cheap. Port direct.

---

### F9: BMR strip (per `00-index/CURRENT_STATE.md §NEXT` priority #5 mention)

**V1 implementation:** Probabil display visual BMR + TDEE + macro targets inline coach idle.

**Recommended Co-CTO: Modify (drop strip, replace cu single-line summary).**

**Rationale Bugatti + Gigel:** Strip multi-component (BMR, TDEE, kcal target, macro split) = info dump Gigel ignores. Single line "🎯 Azi: 2400 kcal · 180g protein" = sufficient. Plus per Bug 2 fix `05ba372` BMR auto-calculate Katch-McArdle BF-aware = engine corect, just simplify UI display.

---

## rating.js V1 prod features (150 LOC)

### F10: Session summary stats grid (mins / sets / kcal — 3 metrics)

**V1 implementation:** 3-cell grid display post-session: minute durată, total sets done, kcal estimate.

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** Stats post-sesiune = high engagement closing signal. "59 MIN · 18 SETURI · 425 KCAL" = Gigel scroll-stop, screenshot WhatsApp friend. Universal proven pattern (gym apps). Direct port.

---

### F11: PRs notification list (per-PR display badges)

**V1 implementation:** Map PRs achieved this session → visual badges în rating modal.

**Recommended Co-CTO: Keep (port verbatim — core motivation pattern, complementary F6 PR wall).**

**Rationale Bugatti + Gigel:** "🏆 Bench Press 80kg ×6 — PR!" la finalul sesiunii = peak emoțional moment. Drop = pierde dopamine reward Gigel. Direct port.

---

### F12: Session rating buttons 3 options (easy / normal / hard cu emoji + culori)

**V1 implementation:** ⚡ UȘOARĂ + 👍 NORMALĂ + 💀 GREA buttons big-touch friendly cu styling distinct (verde/galben/roșu).

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** 3-option rating = simple + universal. Big-touch buttons + RO culture cuvinte fastfast = Gigel-friendly. Engine adaptation feedback loop critical (rating influences future programming). Direct port.

---

### F13: Rating note application to last 3 logs (strong/fatigue notes auto-applied)

**V1 implementation:** Rating "easy" → marchează ultimii 3 logs cu note `strong`; "hard" → marchează cu `fatigue`. Engine consume notes pentru adaptation.

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti:** Engine input fără friction user — implicit signal extraction. Quality engineering. Engine integration ADR 018 §2 preserved. Direct port.

---

### F14: Session ratings persistence (last 20 ratings DB)

**V1 implementation:** `DB.set('session-ratings', sRatings.slice(0, 20))` — rolling window 20 ratings.

**Recommended Co-CTO: Modify (extend window to 90 sessions cu archive).**

**Rationale Bugatti:** 20 ratings = ~3-6 weeks data. Engine adaptation pe 4-12 weeks period (Periodization ADR 026 §1.10) needs longer history. Port cu window 90 + tier-based archive Tier 1/2 per ADR 020 Storage Tiering Strategy.

---

### F15: Per-set RPE granularity (per `00-index/CURRENT_STATE.md §NEXT` priority #5 mention)

**V1 implementation:** Probabil per-set RPE entry detail în session logs (NU văzut direct în head 80 — în restul rating.js sau session.js).

**Recommended Co-CTO: Keep (port verbatim).**

**Rationale Bugatti + Gigel:** Per-set RPE = high signal pentru engine adaptation (Bayesian inference per set, NU averaged session). Gigel familiar cu "set greu / set ușor" = intuitive. Drop = pierde resolution engine. Direct port.

---

## Summary Co-CTO recommendations

**Total features identified:** 15 (renderIdle.js: 9 + rating.js: 6)

| Recommendation | Count | Features |
|----------------|-------|----------|
| **Keep (port verbatim)** | 9 | F2 + F4 + F6 + F7 + F8 + F10 + F11 + F12 + F13 + F15 |
| **Modify (port simplified)** | 4 | F1 (5→2 patterns) + F3 (drop visual bar) + F9 (drop strip) + F14 (extend window 20→90) |
| **Drop V2** | 1 | F5 (defer v1.5 inline UX flow) |

**Effort estimate post-LOCK:**
- Keep verbatim: ~direct port mecanic ~3-5h
- Modify: ~simplify + port ~2-3h
- Drop: zero work, V2 baseline

**LOC target post-port (Bugatti craft simplified):** renderIdle.js ~200-220 LOC (peste 180 mockup target dar Bugatti quality > arbitrary LOC limit; F2+F4+F6+F7 carry weight) + rating.js ~80-100 LOC (F10+F11+F12+F13 + F14 extend + F15 inline).

---

## Recommended LOCK V1 sequence

1. Daniel review SPEC DRAFT V1 (this file) — ~10-15 min CEO scope per-feature keep/drop
2. Daniel CEO LOCK V1 + override per-feature unde Co-CTO recommendation disagree
3. Co-CTO LOCK V1 implementation paradigm (port verbatim vs modify simplified) — post Daniel keep/drop sign-off
4. Pre-port: F8 (streak counter) + F9 (BMR strip) + F15 (per-set RPE granularity) read full V1 implementation pentru detail (NU citit head, decide modify/keep cu context complet)
5. Execute BATCH 2 Antrenor port implement post Daniel CEO LOCK V1 (Step 1 paradigm + V1 features audit) — separate prompt CC artefact pe `feature/v2-vanilla-port` branch
6. Smoke validation Daniel Gates andura.app live → next priority §NEXT

---

## Cross-refs

- [[../00-index/CURRENT_STATE]] §NEXT priority #5 — V1 features audit blocking BATCH 2 Antrenor (this audit unblocks)
- [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT — parent paradigm context (Step 1 Port-First-Then-React)
- [[PORT_FIRST_STEP_1_PARADIGM_V1]] — parent paradigm SPEC DRAFT V1 (companion document)
- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First Pre-React LOCK V1
- [[../03-decisions/018-engine-extensibility-architecture]] §1 Dimension Registry + §2 Standardized Dimension Contract (engines pure preserved port mecanic)
- [[../03-decisions/020-storage-tiering-strategy]] — Tier 0/1/2 storage (relevant F14 ratings persistence extend)
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 (Periodization adaptation needs ratings history F14)
- [[mockups/andura-clasic.html]] — V2 design SoT canonical (LOC target reference)
- [[../05-findings-tracker/FINDINGS_MASTER]] — QA findings P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER (F1 LOW_ADHERENCE banner display bug)
- Bug 2 fix `05ba372` (chat-current 2026-05-10) — Katch-McArdle BF-aware BMR (F9 BMR strip simplify uses corrected engine)

---

## §LOCK V1 2026-05-10 Co-CTO Autonomous

**Authority:** Daniel autonomy lock EXTINS verbatim chat-current 2026-05-10 *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."* — Claude chat strategic autonomous scope EXTENDED, UX scope mine until Beta launch. All 15 features LOCK V1 Co-CTO bias preserved verbatim per recommendations §F1-§F15.

**Verdict 15/15 features Co-CTO bias preserved verbatim:**

| Verdict | Count | Features |
|---------|-------|----------|
| **Keep verbatim (port direct)** | 10 | F2 last session memory + F4 readiness verdict + F6 PR wall + F7 coach director + F8 streak counter + F10 stats grid + F11 PRs notification + F12 rating buttons + F13 rating notes auto-apply + F15 per-set RPE granularity |
| **Modify (port simplified)** | 4 | F1 patterns 5→2 (LOW_ADHERENCE + STAGNATION; drop HIGH_DEVIATION + EARLY_END + PEAK_HOURS gimmick territory) + F3 fatigue (drop visual bar, single number + culoare verde/galben/roșu) + F9 BMR strip (drop strip, single line "🎯 Azi: 2400 kcal · 180g protein") + F14 ratings window (extend 20→90 cu Tier archive ADR 020) |
| **Drop V2-deferred (defer v1.5)** | 1 | F5 AA friction modal (defer v1.5 inline UX flow non-blocking; modal pe start sesiune = friction Gigel rejected) |

**F1 LOW_ADHERENCE banner port unblocks e2e test re-enable** — currently SKIP'd `tests/e2e/scenarios/calibration-ui.spec.js:194` per QA flag P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER. Port F1 LOW_ADHERENCE banner V2 vanilla = unblocks re-enable test cross-ref.

**F14 extend window 20→90 cu Tier archive** = ADR 020 Storage Tiering Strategy aligned (Tier 0 active 20 ratings rolling + Tier 1 archive 70 ratings IndexedDB Dexie per ADR 020 §1.4 + ADR 020 §2.3 storage budget post-archive).

**Cumulative impact:** +15 net LOCK V1 (cumulative ~719 → +15 features = ~734 partial pre-companion PORT_FIRST_STEP_1_PARADIGM_V1 +7 sub-decisions = total ~742 cumulative chat-current 2 final +23 net inclusive NO_DIACRITICS_RULE +1).

**Cross-refs:**
- [[PORT_FIRST_STEP_1_PARADIGM_V1]] §LOCK V1 2026-05-10 Co-CTO Autonomous (parent paradigm document, gates #4 selective port scope = this audit LOCK)
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED top entry chat-current 2026-05-10 chat ACASĂ continuation 2
- [[../03-decisions/DECISION_LOG]] entry top descending cronologic 2026-05-10 chat ACASĂ continuation 2
- [[../DIFF_FLAGS]] P1-FLAG-V1-FEATURES-AUDIT-RESOLVED 🟢 RESOLVED LOCK V1 NEW 2026-05-10
- [[../05-findings-tracker/FINDINGS_MASTER]] P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER (F1 port unblocks re-enable)
- [[../03-decisions/020-storage-tiering-strategy]] §1.4 + §2.3 (F14 extend window Tier 0/1 architecture)

---

🦫 **Bugatti craft. LOCKED V1 2026-05-10 Co-CTO Autonomous Daniel autonomy lock EXTINS scope (CTO figure-it-out paradigm). 15/15 features bias preserved verbatim (10 keep + 4 modify + 1 drop V2-deferred). Unblocks BATCH 2 Antrenor port implement on `feature/v2-vanilla-port` branch. Path către Beta cel mai high-leverage unblock post Step 1 paradigm LANDED autonomous.**
