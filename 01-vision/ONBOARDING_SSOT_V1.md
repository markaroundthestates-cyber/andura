# ONBOARDING SSOT V1 — Andura

**Status:** 🟢 **CONSOLIDATED V1** (created Vault Hygiene Sprint Faza 3, 2026-05-04 — recomandare B per §36.96 + §36.92 D4 hybrid C LOCKED)
**Owner:** Daniel (CEO + Product) + Claude Co-CTO
**Scope:** Single source of truth pentru onboarding flow, goal taxonomy, profile typing, equipment filter, disclaimer, pre-session readiness — consolidare fragmentări 5 SSOT-uri pre-existente.

**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §26 (Goal-ca-Setting + 8 templates V1) + §29.5.14 (4 ecrane disclaimer integrat) + §29.5.17 (Autofocus iOS workaround) + §29.5.18 (Friction Map V1) + §36.35 (Goal Shift Event Handler) + §36.92 D4 (Goal Taxonomy hybrid C LOCKED) + §36.106 D2 NEW (Injury/Contraindication pending) + §36.107 D3 NEW (Don't Like + Home + Calistenice + Sport pending) + [[014-onboarding-profile-typing]] + [[017-demographic-prior-database]] + [[../03-decisions/025-andura-gandeste-pentru-user|ADR 025]] (Graceful Degradation Universal candidate) + [[PRODUCT_STRATEGY_SPEC_v1]] §2 UX & Onboarding Flow

---

## §0 SCOPE

Acest document este SSOT activ pentru onboarding flow Andura V1. Înlocuiește **5 fragmentări pre-existente** consolidate aici:

1. **HANDOVER_GLOBAL §26** — Goal-ca-setting + 8 templates programe V1 (5 templates major: Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală + sub-variante)
2. **HANDOVER_GLOBAL §29.5.14** — Onboarding flow 4 ecrane (post-amendment 2026-05-02 disclaimer integrat)
3. **PRODUCT_STRATEGY_SPEC_v1 §2.1-§2.3** — Onboarding form 5-7 câmpuri + skip permis + first session UX
4. **ADR 014 Onboarding Profile Typing** — tier-aware activation T0/T1+/T2+ + Strong Prior 80% input + 20% baseline
5. **ADR 017 Demographic Prior Database** — T0 fallback K-NN K=10 + 6 anchor personas + 500 profiles total

**Goal Taxonomy decizie:** §36.92 D4 LOCKED hybrid C — onboarding self-selection routing (B) + engine internal mapping (A) cu graceful degradation universal per [[../03-decisions/025-andura-gandeste-pentru-user|ADR 025]] candidate.

---

## §1 ONBOARDING FLOW V1 (4 ecrane, total <45 sec)

**Source:** §29.5.14 LOCKED V1 OBLIGATORIU (post-amendment 2026-05-02 — disclaimer medical mutat din ecran 5 dedicat în ecran 4 Obiectiv ca checkbox disabled-until-checked).

### Ecran 1 — Nume (no skip)
- Input: text "Cum vrei să-ți spun?"
- Validation: 2-30 chars, RO/EN diacritics permise
- Friction: 🟢 LOW (zero ambiguity, identitate user)

### Ecran 2 — Vârstă (no skip)
- Input: number, inputmode="numeric", autofocus iOS workaround per §29.5.17 (`setTimeout 50ms`)
- Range: 16-99 (boundary check: <16 → soft block "Andura recomandă min 16 ani" + Liability Flag silent / >75 → soft prompt "vrei să încercăm Longevitate?" + 70-75 conservatoare bracket per §29.2.6)
- Friction: 🟢 LOW

### Ecran 3 — Greutate & Înălțime (SKIP PERMIS — graceful degradation per ADR 025)
- Input: 2 number fields (kg + cm)
- Skip behavior: median demographic prior din Synthetic 50+ profile (ADR 017) — variance mare, calibration slow
- Smart inference: dacă T0 + Skip → Demographic Prior fallback ([[../03-decisions/017-demographic-prior-database|ADR 017]]) + ofertă "completează când vrei tu" în Profile
- Friction: 🟢 LOW (zero coerciție, user agency preserved)

### Ecran 4 — Obiectiv + Disclaimer Medical (no skip, checkbox obligatoriu)
- Input radio: 5 templates V1 (Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală) + descriere 1-line per template
- Disclaimer integrat (post §29.5.14 amendment): checkbox "Am citit și sunt de acord cu termenii medicali" disabled-until-checked
- Disclaimer wording: "Andura este o aplicație de fitness, NU consultanță medicală. Consultă medicul tău dacă ai condiții preexistente. Continuarea = acord termeni." (link expandabil ToS+Privacy Policy)
- Friction: 🟡 MEDIUM (decizie strategică user + acord legal mandatory)

**Total ecrane:** 4 (vs 5 pre-amendment). Total timp target: <45 sec (vs <60 sec pre-amendment).

**Skip path (graceful degradation per ADR 025):**
- Ecran 1 + Ecran 2 + Ecran 4 — mandatory (zero skip)
- Ecran 3 — skippable cu fallback Demographic Prior

**Smart defaults:**
- Frecvență — auto-derived din experience tier (Beginner: 3x/săpt, Intermediate: 4x/săpt, Advanced: 5x/săpt) + override Profile post-onboarding
- Equipment — categorical universal display T0 default ("Sală standard cu barbell + dumbbells + machines"), Profile post-onboarding refinement
- Restul (BF%, PRs, schedule, history, recovery markers) — DEFERRED post-onboarding via natural session flow + Profile Typing T1+

---

## §2 GOAL TAXONOMY V1 (per §36.92 D4 hybrid C LOCKED)

### Distincție tehnică critică (per §36.102 slip clarification)

- **GOAL** = setting strategic user (5 template choice) — schimbat manual via Setări (§36.35 Goal Shift Event Handler)
- **PHASE** = automated CUT/BULK/MAINTAIN sub-state per goal (sys.js calculează BF% + sezon)
- **MODE** = Estetică ↔ Forță sub-modificator rep ranges/intensity

### 5 Templates V1 LOCKED (per §26)

| Template | Persona target | Frecvență | Durată | RPE | Periodizare |
|----------|----------------|-----------|--------|-----|-------------|
| **Forță & Dezvoltare** | Marius 25 athletic + Daniel 36 HR | 4x/săpt L-Ma-Jo-V Upper/Lower | 50-70 min | 7-9 | Linear Block 4+1 |
| **Tonifiere & Definire** | Gigica 35 + Iasmina 18 | 4x/săpt | 45-60 min | 6-8 | Hibrid hipertrofie + cut emphasis |
| **Slăbire** (Majoră / Moderată) | Elena 35 mama + Gigel 45 mecanic | 3-4x/săpt | 40-55 min | 5-7 | Continuous + conditioning add-on |
| **Longevitate** | Maria 60-70 (vârstă mediană 65) | 3x/săpt L-Mi-V | 35-40 min | 5-7 | Continuous + Double Progression |
| **Sănătate Generală** | Ana 55 educatoare + general 18-49 | 3-4x/săpt | 40-55 min | 5-7 | Balanced + lifestyle integration |

**Sub-variante backlog v3+ (NU V1):**
- §29.2.7 Sănătate Generală 18-29 vs 30-49 sub-variants — auto-reglare RPE rezolvă diferențe biologice + onboarding self-selection routing 25 ani athletic baseline → Tonifiere/Forță; decizie data-driven post-launch analytics 6 luni.

### Goal Shift Event Handler (§36.35 LOCKED V1)

User tap "Schimbă obiectiv" în Setări → Engine aplică:
1. **Modificatori Template** (rep ranges, RIR, rest time)
2. **Streak Reset** (per goal)
3. **2-session calibration window** (interval estimat NU single point per SUFLET F1 Triangulation)
4. **Conservare date fizice** — PR records + CDL logs + istoric forță = INTACT post-shift

### Re-prompt Periodic (§26.5 LOCKED)

Modal in-app la 4-6 săpt: "Obiectivul tău e încă X? Confirmă sau schimbă"
- Anti-rigid (user adapts goal lifecycle)
- Anti-spam: cooldown 21 zile post-confirm
- Cross-ref §36.102 Goal lifecycle change first-class supported (NU edge case 2%)

---

## §3 PROFILE TYPING TIER-AWARE (per ADR 014)

### Tier gating

- **T0 (cold-start, < 5 sesiuni):** Demographic Prior baseline activate (ADR 017 K-NN K=10). Profile Typing SKIP — zero force prompt
- **T1 (5-20 sesiuni, INITIAL):** Profile Typing ACTIVATE cu Strong Prior strategy (80% input + 20% baseline calibration time -50% per PRODUCT_STRATEGY §3.5.1)
- **T2+ (20+ sesiuni, DEVELOPING+):** Vitality Layer ACTIVATE per ADR 016 (depends ADR 018 Engine Extensibility)

### Plugin architecture (ADR 018)

Profile Typing devine dimension cu standardized contract:
- Stage: ADJUSTMENT primary + ENHANCEMENT secundar (post §AMENDMENT 2026-04-27)
- Priority: 65
- enabledFlag: `profile_typing_v1`
- schemaVersion: 1

### Wording update §AMENDMENT 2026-04-27 (data-injected, NU static)

Static "Am văzut pattern-ul" → Data-injected dynamic: `"continui peste {N} signals în 14 zile"` — frază unică per modal, anti-reflex paste-buffer + cognitive lock-in real (per ADR 014 §5).

---

## §4 EQUIPMENT FILTER V1 (Q1+Q1.5 conditional)

### Q1 onboarding equipment filter (§36.36 schema extension)

- **Default categorical universal:** "Sală standard cu barbell + dumbbells + machines"
- **Refinement Profile post-onboarding:** equipment list complet + per-exercise availability
- **Cross-ref §36.107 D3.2 Home Workouts** (PENDING decision pre-Beta) — equipment hierarchy detail bodyweight only / dumbbells / bands / pull-up bar / adjustable bench / cables home

### Q1.5 conditional (post Q1 selection)

- **Sală standard:** zero further questions, default equipment full
- **Home / Hibrid:** equipment list refined cu sub-filter (1 pair dumbbells / 2 pairs / bands / pull-up bar / etc.)

### "Nu am aparat" inline buton in-session (existing)

User-driven equipment override per session — alternativeEngine.js substitution biomechanical similarity hierarchy.

### NEW per §36.107 D3.1 (PENDING decision pre-Beta) — Buton "Nu vreau / Nu îmi place"

Distinct semantic vs existing:
- "Nu am aparat" = logistic (equipment temporar absent)
- "Mă doare" = medical (§36.106 D2 contraindication PENDING)
- "Nu vreau / Nu îmi place" = preferință stylistic pură user (NU medical, NU logistic, NU temporary) — D3.1 PRE-BETA mandatory recommend

---

## §5 PRE-SESSION READINESS (per §36.82 LOCKED V1)

### Pre-Session Energy Input (§36.82.1)

Dashboard greeting card 1-tap selection: 🟢 (energie bună) / 🟡 (medium) / 🔴 (jos)
- **🟢:** session as-planned
- **🟡:** session as-planned (no adjustment, transparent UX)
- **🔴:** silent adaptive adjustment per §36.82.2 (§36.16 RIR Matrix reps/intensity reduction, ZERO mesaj paternalist)

### Deload Suggestion Trigger (§36.82.3)

3× consecutive 🔴 → optional Deload prompt (NU auto-trigger). Wording placeholder Phase B PENDING.

### Cross-ref §36.100 Engine #5 Energy Adjustment Engine

Sleep × stress × pre-session readiness → volume / intensity adjustment (extends §36.82 partial calibration). NEW ADR pending — full spec post Vault Hygiene + Auth Flow.

---

## §6 INJURY / CONTRAINDICATION (PENDING D2 NEW per §36.106)

**Status:** 🟡 OPENED FOR DISCUSSION — pending chat strategic dedicat NEW post Vault Hygiene + Auth Flow.

**Daniel articulation verbatim:** "Sa existe in onboarding o chestie de accidentari — gen daca omul are hernie sa nu il pui la deadlifts."

**Scope candidate:**
- Onboarding screen NEW (sau integrat profil typing T1+) — checkbox/multi-select condiții medicale exclud anumite mișcări specific
- Inline buton in-session adjacent "Nu am aparat" — flag contraindicație acută permanent / temporary / pentru azi
- Granular contraindication mapping (NU SAFETY_TRIPWIRE_GLOBAL all-or-nothing per Cognitive Q18)
- Auto-substitution alternativeEngine — exercise excluded → propose biomechanically similar safe alternative

**D2.1-D2.7 sub-decisions PENDING** (vezi §36.106 detail).

**Reasoning Claude pre-chat strategic:** Probabil RECOMMEND hybrid — taxonomie predefinită minimal (top 10-15 condiții common) onboarding + free-text Pain Button §36.38 post-hoc detection + alternativeEngine auto-substitution + user override liability flag.

---

## §7 SAFETY_TRIPWIRE_GLOBAL (per Cognitive Q18 — exception la "skippable everything")

### Hard-stop conditions (Passive Mode tripwire)

- Pregnancy declared → Passive Mode total (Dumb Tracker excellent, ZERO algorithmic recommendation)
- Severe medical condition declared (post-bariatric / heart condition / pregnancy / serious injury < 3 luni) → Passive Mode

### Aliniat ADR 025 candidate "Andura Gândește pentru User"

Acest §7 e EXCEPȚIA mandatată la principiul "skippable everything" per [[../03-decisions/025-andura-gandeste-pentru-user|ADR 025]]. Filtru pre-feature LOCK: graceful degradation skipable EXCLUDE safety tripwire (rationale: liability + user safety > ergonomics).

---

## §8 DISCLAIMER MEDICAL (post §29.5.14 amendment)

### Wording locked V1 (placeholder Phase B refinement)

> "Andura este o aplicație de fitness, NU consultanță medicală. Consultă medicul tău dacă ai condiții preexistente. Continuarea = acord termeni."

### UX placement (Ecran 4 Obiectiv)

- Checkbox obligatoriu disabled-until-checked
- Link expandabil ToS+Privacy Policy (§29.7 Pre-Launch Checklist V1 — Legal DIY + Audit Plătit €300-500 1 lună înainte)

### Cross-ref EU AI Act (§36.85)

Wording must NOT trigger medical device boundary. "Informativ user-declared" framing safe. NU "diagnostic", DA "user-declared contraindication" if D2 NEW (§36.106) approved.

---

## §9 ANTI-REFLEX PROTECTION (per ADR 013)

### Friction Map V1 (§29.5.18)

Touchpoint matrix:
- 🟢 Onboarding (low friction, smart defaults)
- 🟢 Pauze
- 🟡 Editare istoric (24h liberă / Zile 2-7 confirmare modal / >7 zile Hard Lock)
- 🔴 Storage Full (80% banner săpt + 95% modal blocant per §33)
- 🟡 Disclaimer (mandatory checkbox)
- 🟡 MMI prompt (post §32 LOCKED V1 hibrid)

### Anti-Reflex Wording (per ADR 014 §5)

Static phrases banned. Data-injected dynamic ONLY:
- ❌ "Am văzut pattern-ul" (static, anti-reflex paste)
- ✅ "continui peste {N} signals în 14 zile" (dynamic)

---

## §10 OPEN QUESTIONS / NEXT ACTIONS

1. **D2 NEW Injury/Contraindication Mapping** (§36.106) — chat strategic dedicat NEW pending
2. **D3 NEW Don't Like Button + Home Workouts + Calistenice + Sport-Oriented** (§36.107) — chat strategic dedicat NEW pending
3. **Goal lifecycle phase transitions** (CUT → MAINTAIN → BULK auto-detect vs user manual override) — see [[../03-decisions/024-goal-driven-program-templates|ADR 024]] open question
4. **Pre-session energy 🟡 transparent UX** — currently no-adjustment, future iteration consider micro-prompt?
5. **Disclaimer wording legal-audit** — Pre-Launch §29.7 Audit Plătit €300-500 ~Dec 2026
6. **i18n Onboarding RO + EN** — F-NEW-1 LOCKED V1 OBLIGATORIU (§22) — RO Default + Toggle EN OFF, exception RPE/BMI/kcal cu explicații
7. **Calibration target pre-Beta 85-90%** (§36.89) — NU 95%, validation post-launch luna 3-6 obligatoriu
8. **Onboarding completion analytics** — KPI primari Retention D7/D30 + Completion >75% pre-launch DoD criteria

---

## §11 CROSS-REFERENCES

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §26 (8 templates) + §29 (templates spec) + §29.5.14 (4 ecrane) + §29.5.17 (Autofocus iOS) + §29.5.18 (Friction Map) + §32 (MMI) + §33 (Storage Full UX) + §36.35 (Goal Shift) + §36.82 (Pre-Session Energy) + §36.92 D4 (Goal Taxonomy hybrid C) + §36.99 (Offline Coaching Tree) + §36.102 (Goal lifecycle first-class) + §36.106 (D2 NEW Injury) + §36.107 (D3 NEW Don't Like + Home + Calistenice + Sport)
- [[014-onboarding-profile-typing|ADR 014]] (Profile Typing tier-aware)
- [[017-demographic-prior-database|ADR 017]] (T0 Demographic Prior K-NN K=10)
- [[018-engine-extensibility-architecture|ADR 018]] (Dimension Registry foundation)
- [[023-llm-intent-interpretation|ADR 023]] (Pain text + Equipment text scope strict)
- [[025-andura-gandeste-pentru-user|ADR 025]] (Graceful Degradation Universal candidate)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] (Offline Coaching Tree candidate, PRE-BETA blocker)
- [[PRODUCT_STRATEGY_SPEC_v1]] §2 UX & Onboarding Flow + §3.5.1 Strong Prior Strategy
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q4 + Q11 + Q18 SAFETY_TRIPWIRE_GLOBAL
- [[SUFLET_ANDURA]] F1 Triangulation + F2 Bias + F5 Push-back + F6 Adaptive output + R17 User Agency

---

🦫 **Onboarding SSOT V1 consolidated. Hybrid C per §36.92 D4 LOCKED. Graceful degradation universal per ADR 025 candidate. 4 ecrane <45 sec. Skippable everything except SAFETY_TRIPWIRE_GLOBAL. Andura gândește pentru user. ✊**
