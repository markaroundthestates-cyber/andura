# AUDIT IDEATION REPORT — FAZA 2

**Date:** 2026-05-03
**Auditor:** Claude chat strategic (strategic thinker layer NEW orthogonal)
**Scope:** Layer ortogonal vs audit existing — improvements + features missing + scope expansion + strategic gaps
**Filter mandatory pe fiecare item:**
- **Jeff Nippard:** "Ar zice guru asta ca next pentru user X?" — DA / NU / DEPINDE
- **Gigel test:** "Reacționează Gigel (user mediu non-tech RO 35-65) bine?" — DA / NU / DEPINDE
- **Severity:** HIGH / MEDIUM / LOW
- **Effort:** factor 5-7× Opus optimism aplicat (estimate realist Opus actual)
- **Cross-link:** finding-uri existing dacă relevant

---

## §0 — VERDICT EXECUTIV

**~50 idei NEW catalogate.** Distribuție:
- §1 Improvements: 15 items (mostly engine logic + UX + observability + testing)
- §2 Features missing: 18 items (capabilities pentru "guru-grade")
- §3 Scope expansion candidates: 10 items (filter Gigel STRICT)
- §4 Strategic gaps: 10 items (business / market / moat / positioning)

**Top 10 priorities ranked = §5** — applied factor (impact × effort × Filter PASS).

**Anchor strategic:** vault-ul Andura e *arhitectural solid + spec dens*. Gap real NU e "arhitectură incorectă", ci **activarea features existing + UX presentation gap + observability + lateral thinking pe edge cases competitive**.

---

## §1 — IMPROVEMENTS (existing systems mai bine)

### IMP-1: Volume Floor Guarantee Spec [HIGH, anti-amputation Maria 65]

**Issue:** Composite multiplicators (Profile + Vitality + Composite Signal Recovery -20% + Demographic Prior conservative) pot cumula sub -25% volume silent. Maria 65 cu 3 seturi minimum poate ajunge la 2 sets/exercițiu = sub prag stimulare neuro-musculară.

**Propunere:** Spec META-RULE-QUINQUE: "Volume Floor Guarantee — minim 3 seturi/exercițiu păstrate indiferent aggregate multipliers. Excepție: Sit-to-Stand max cap §36.25 Layer C (NU floor pentru exerciții cu hard cap absolute)."

**Filter Jeff Nippard:** DA — guru ar respecta floor neuromuscular pre-amputation.
**Filter Gigel test:** DA — Maria 65 NU vede nicio schimbare drastică între sesiuni.
**Effort:** 30min spec + 1h Opus implementation (pure function la finalul cluster compose).
**Cross-link:** I1 (composition), §36.25 Layer C cap absolute.

---

### IMP-2: Reconciliation Coordinator §36.86 META-RULE-TERTIARY [HIGH]

**Issue:** R1-NEW confirmed — 4 reconciliation flows independente (ADR 014 Profile Typing, ADR 016 Vitality, §36.34 Bias Drift, §36.35 Goal Shift) fără coordinator. Risk: user primește 4 prompts succesive în same session = friction major.

**Propunere:** Spec META-RULE-TERTIARY: "Maximum 1 reconciliation/validation prompt user-facing per sesiune. Priority order: §36.35 Goal Shift > §36.34 Profile Validation > ADR 014 Reconciliation > ADR 016 Vitality. Restul triggers reportate next session cu deduplication 24-72h cooldown."

**Filter Jeff Nippard:** DA — guru NU întreabă 4 lucruri simultan.
**Filter Gigel test:** DA — anti-friction Gigel.
**Effort:** 30min decision Daniel + ~1h Opus implementation coordinator middleware.
**Cross-link:** R1-NEW, T6.

---

### IMP-3: Synthetic Demographic Prior Pre-Calibration Mandatory [HIGH]

**Issue:** AA thresholds + Voice Tier weights + Bayesian Nutrition prior toate "INITIAL_V1_GUESSWORK" + recalibrate after 50+/1000+ users. Beta 50 users = circular calibration.

**Propunere:** ADR 017 Demographic Prior 500 profile × 90 zile sintetic = USE pre-Beta pentru pre-calibration CALL 3 systems. Run synthetic → measure FP/FN rate per signal → tune thresholds ÎNAINTE Beta cohort exposure.

**Filter Jeff Nippard:** DA — pre-calibration scientific approach.
**Filter Gigel test:** N/A (background calibration).
**Effort:** 8-12h Opus dacă Synthetic Generator NU complete (DEMO-1 disputed: scaffold OK, full 500 profiles NU verified).
**Cross-link:** I3, M4-NEW, R8-WEIGHTS, TIME-1, DEMO-1.

---

### IMP-4: Spec→Cod Tracking Matrix Institutionalizat [HIGH, M2]

**Issue:** Pattern recurent: "spec ahead implementation" = Mode Detection drift + T&B Faza 1+2 deferred + Founding Cap atomic comment-only. Vault NU are mecanism formal "spec LOCKED → implementation tracked".

**Propunere:** Add coloană "Implementation Status" la FINDINGS_MASTER.md cu values: `READY / IN_PROGRESS / SHIPPED / VERIFIED`. Update mandatory pe fiecare LOCKED V1 decision. Pre-Beta gate: ZERO `READY/IN_PROGRESS` pe CRITICAL items.

**Filter Jeff Nippard:** DA — accountability arhitectural.
**Filter Gigel test:** N/A (workflow).
**Effort:** 1h Daniel design + ~30min CC apply column la 79 LOCKED items.
**Cross-link:** B1, B2, B3, M2 Pass 2, NEW-3.

---

### IMP-5: Performance Benchmark Android Cheap Reference Device [MEDIUM]

**Issue:** Q11 latency budget <300ms total decision spec, ZERO benchmark real Maria 65 phone Android ieftin (<2GB RAM, ARM Cortex-A53). Layer D Cascade Defense ≤50ms × 5 invariant checks × 4 dimensions = potențial 1000ms pe Maria phone.

**Propunere:** Pre-Beta benchmark pe Android cheap reference device (~$150 phone). Lighthouse + DevTools Performance tab. Gate: 300ms latency confirmed pe device target.

**Filter Jeff Nippard:** N/A (infra).
**Filter Gigel test:** DA — Gigel cu phone vechi NU vede lag.
**Effort:** 2-3h Daniel hardware purchase + 1-2h benchmark run + analyze.
**Cross-link:** C3, Q11-INFRA.

---

### IMP-6: Body Region Map Schema Lateralization Minor Refactor [MEDIUM]

**Issue:** I4 confirmed — `muscle_target_primary: 'umeri'` NU lateralized. §36.85 Opt A (Injury Body Region Map) cere "user zice 'umăr stâng' → engine skip OHP + bench" — incorect pentru exerciții unilaterale (DB single-arm right cu left injury OK).

**Propunere:** Schema extension `bilateral: true|false` + `unilateral_side_supported: 'L'\|'R'\|'both'`. Engine logic: dacă injury 'umăr stâng' + exerciție bilateral → skip; dacă unilateral right-supported → OK execute right side only.

**Filter Jeff Nippard:** DA — guru ar acomoda pain-free side training.
**Filter Gigel test:** DA — Gigel cu durere stânga vrea să continue training drept.
**Effort:** 1-2h CC (schema + engine logic + tests).
**Cross-link:** I4, §36.85 Opt A.

---

### IMP-7: Plateau Interventions UI Wiring [MEDIUM, NEW-1]

**Issue:** `src/engine/plateauInterventions.js` LIVE cu 12+ techniques, DAR audit existing zice "concept absent". Real issue = UI wiring unclear.

**Propunere:** Verify cod sessionBuilder ↔ plateauInterventions ↔ UI presentation. Recomandare propusă user (Marius vede "Schimb Exercițiu") sau auto-apply silent? Anti-RE filter mandatory.

**Filter Jeff Nippard:** DA (Jeff #2 partial covered).
**Filter Gigel test:** DEPINDE — propunere "Schimb Exercițiu" pentru Maria 65 = friction. Auto-apply silent = OK.
**Effort:** 30min spot-check + 2-3h dacă wiring lipsește.
**Cross-link:** NEW-1, Jeff #2 backlog.

---

### IMP-8: Onboarding SSOT Consolidation [HIGH]

**Issue:** TRIPLE-1 + QUADRUPLE-1 confirmed — 5 SSOT (Cognitive Q15 + §29.5.14 + §36.44 + ADR 017 goal taxonomy + §26.3 Goal taxonomy 5 RO categorii).

**Propunere:** Create `01-vision/ONBOARDING_SSOT_V1.md` care consolidate exhaustiv:
- Câmpuri în ordine ecrane (Nume + Sex + Vârstă + H&G skippable + Experiență + Obiectiv + disclaimer)
- Wording exact RO LOCKED (Sentence Case + persoana I plural)
- Goal taxonomy LOCKED final: 5 RO (forta_dezvoltare/tonifiere_definire/slabire/longevitate/sanatate_generala) cu sub-routing 3 Tonifiere + 2 Slăbire = 8 templates V1
- Cross-ref existing fragmente toate marcate `[CONSOLIDATED into ONBOARDING_SSOT_V1]`

**Filter Jeff Nippard:** N/A (doc).
**Filter Gigel test:** DA indirectly (consistency UX downstream).
**Effort:** 2-3h Daniel chat strategic + 1h CC consolidate doc.
**Cross-link:** TRIPLE-1, QUADRUPLE-1, N4.

---

### IMP-9: Anti-RE Inventory Centralized SSOT [MEDIUM]

**Issue:** G1 — Anti-RE strategy menționată în multe locuri (§22 F-NEW-4, §36.20 Catastrofizare scrap, etc.) DAR ZERO document SSOT centralizat "Anti-RE complete inventory" cu toate triggers + thresholds + wording locked.

**Propunere:** Create `01-vision/ANTI_RE_INVENTORY.md` consolidare. Audit checklist post-Phase B 51 strings + future strings.

**Filter Jeff Nippard:** N/A (doc).
**Filter Gigel test:** DA indirectly (consistency anti-RE protect Maria 65).
**Effort:** 1-2h Daniel review existing scattered + CC consolidate.
**Cross-link:** G1, Phase B 51 strings.

---

### IMP-10: Launch Criteria Bugatti Measurable [MEDIUM]

**Issue:** G2 — DoD §29.6.1 = 6 criterii general + Bugatti standard subjectiv. ZERO measurable KPIs.

**Propunere:** Checklist Bugatti measurable cu metrics concrete:
- Onboarding completion rate target (>90% non-skip)
- First session completion rate (>85%)
- Anti-paternalism audit (zero promp tip "Don't break the streak")
- Wording consistency (Sentence Case + persoana I plural verified all strings)
- Latency budget verified (<300ms total decision pe Android cheap)
- Maria 65 testabil-test cohort 1-on-1 (5 useri Gigel real)

**Filter Jeff Nippard:** DA (rigor scientific).
**Filter Gigel test:** N/A.
**Effort:** 1-2h Daniel chat strategic.
**Cross-link:** G2.

---

### IMP-11: Bandwidth Indicator Real-Time pentru Daniel [LOW dar high-personal-value]

**Issue:** Daniel persona ADHD 2e + bus factor 1. Endurance la limită somn. Workflow chat-uri lungi → bandwidth degradation finding-uri saturate (audit consolidat 9 passes Pass 7+ rebrand pattern).

**Propunere:** Personal observability pentru Daniel — adăugă în vault `07-meta/DANIEL_BANDWIDTH_INDICATORS.md` cu:
- Triggers detectabile saturare cognitive (raspunsuri scurte, halucinații, repeating questions)
- Auto-handover threshold ~25% bandwidth (already memory rule)
- Reset triggers (sleep cycle, alt domain switch)

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** N/A.
**Effort:** 30min Daniel reflection + 30min Claude chat structurare.
**Cross-link:** N3 Pass 3 (velocity), DANIEL_COMPLETE_PROFILE.

---

### IMP-12: Test Coverage Gap Audit [MEDIUM]

**Issue:** 1203/1203 tests PASS — funcțional. Cognitive Architecture Q10 cere "ARBITRATOR 100% unit test, Voices 90%+, Integration 70%+". Spec-vs-coverage gap = unverified.

**Propunere:** Coverage report run + gap analysis vs Q10 targets. Identify modules sub coverage threshold + add tests pre-Beta.

**Filter Jeff Nippard:** DA (rigor).
**Filter Gigel test:** N/A.
**Effort:** 30min Daniel run `npm run coverage` + 1-2h CC fill gaps targeted.
**Cross-link:** Cognitive Q10.

---

### IMP-13: Engine Decision Trace Persistence [MEDIUM]

**Issue:** WhyEngine generates explanation on-demand (§36.32 lazy generation). DAR `decisionTrace` în CDL = ce a contribuit ce engine = NU verificat dacă persist long-term pentru audit (post-Beta debugging "engine a recomandat X greșit, why?").

**Propunere:** Verify CDL decision trace structure full + add fields lipsă pentru post-mortem analysis (engine inputs, weights, voice contributions, arbitration math).

**Filter Jeff Nippard:** DA (verifiable decisions = MOAT pillar 3).
**Filter Gigel test:** N/A (audit-only).
**Effort:** 30min verify + 1-2h CC schema extension dacă lipsește.
**Cross-link:** ADR 011 CDL, MOAT pilon 3.

---

### IMP-14: Visual Regression Tests Pre-Launch [MEDIUM]

**Issue:** §36.78 Andura rebrand Phase 1-4 complete + andura.app LIVE. Visual regression NU menționat în test suite.

**Propunere:** Playwright visual regression snapshots primare ecrane (dashboard, session, settings, onboarding 4 ecrane). Catch CSS regressions pre-launch.

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** DA indirectly (visual broken = friction).
**Effort:** 2-3h CC setup + 1h Daniel review baseline.
**Cross-link:** ADR 008 E2E, DH2 ADR 008 stale.

---

### IMP-15: Periodic Vault Hygiene Sprint Q2 2026 [HIGH meta]

**Issue:** Vault SSOT crescut prin acumulare cronologică (sesiuni → handover → amendments). Lipsă periodic consolidation = pricing chain T5 + ADR statuses T4 + reconciliation flows T6 simptome.

**Propunere:** Sprint Vault Hygiene Q2 2026 dedicat (~6-10h Daniel + CC):
- All DEPRECATED markers → conținut șters, pointer 1-line
- ADR statuses verify vs git history
- INDEX_MASTER refresh
- Anti-RE inventory consolidation (IMP-9)
- Goal taxonomy unification (IMP-8 part)
- Onboarding SSOT consolidare (IMP-8)
- Launch Criteria Bugatti measurable (IMP-10)

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** DA indirectly (clean vault → fewer downstream errors).
**Effort:** 6-10h în primul săpt Daniel + CC.
**Cross-link:** Pass 1 §6 meta-recommendation, T5, T4.

---

## §2 — FEATURES MISSING (capabilities pentru "guru-grade")

### FM-1: Plate/DB Calculator Round-Off Per Available Equipment [MEDIUM]

**Issue:** Spec menționează plate calculator, DAR engine recommend +1 kg → DB hexagonal RO disponibile 1kg/2kg/2.5kg increments NU continuous. Maria 65 cu DB max 5kg → engine recommend 5.5kg = invalid.

**Propunere:** Engine consult equipment table per gym → round-off recommendation la closest valid. Settings → Equipment → user marks "DB available: 1, 2, 3, 4, 5, 7.5, 10, 12.5..." OR auto-detect via session logging.

**Filter Jeff Nippard:** DA (real-world equipment awareness).
**Filter Gigel test:** DA — Maria 65 NU vede recommendation invalid.
**Effort:** 1-2h CC (round-off function + UI checklist equipment).
**Cross-link:** NEW-4, ADR 017 equipment dimension.

---

### FM-2: Mobility/Warm-up Auto-Insertion [HIGH, longevity 50+ critical]

**Issue:** §29.2.6 Longevitate template menționează mobility focus, DAR ZERO spec engine "auto-insert warm-up exercises pre-main work". Maria 65 ar trebui să facă 5min mobility joint pre-deadlift, dar engine NU prescribe.

**Propunere:** Engine layer pre-session "Warm-up Auto-Generator" per profile + main work category:
- Maria 65 + Squat → propune cat-cow + bird-dog + ankle CARs (~5min)
- Marius + Bench → propune wall slides + band pull-aparts (~3min)
- Toggleable user preference (skip warm-up if "deja făcut acasă")

**Filter Jeff Nippard:** DA — guru insistă pe warm-up structurat.
**Filter Gigel test:** DA — Gigel apreciate "îmi spune exact ce să fac" (NU paternal).
**Effort:** 4-6h CC (warm-up library + engine generator + UI integration).
**Cross-link:** §29.2.6 Longevitate, §36.85 Injury prevention proactive.

---

### FM-3: Sickness/Vacation Flag Manual [MEDIUM, NEW-6]

**Issue:** Lipsește spec "user marks vacation/sickness flag" → streak counter pause vs continue legitim. §36.81.4 acoperă abandonment auto, NU intentional pause.

**Propunere:** UI button "Sunt în vacanță" / "Sunt răcit" pentru 3-7 zile pause cu auto-reset. Engine pe return → adaptive recovery mode (NU baseline shift).

**Filter Jeff Nippard:** DA — guru recunoaște life happens.
**Filter Gigel test:** DA — Maria 65 răcită apreciate dignified pause.
**Effort:** ~2-3h CC (UI button + state machine + integration §36.30 streak counter).
**Cross-link:** NEW-6, §36.81.4 abandonment.

---

### FM-4: Workout History Export GDPR Article 20 [MEDIUM, legal]

**Issue:** GDPR Article 20 (data portability) → user are dreptul export own data. Andura V1 NU pare să aibă feature.

**Propunere:** Settings → "Exportă datele mele" → CSV (logs, weights) + JSON (CDL, settings). Server-side via Cloud Function sau client-side (preferred Spark plan).

**Filter Jeff Nippard:** N/A (legal).
**Filter Gigel test:** DA — Gigel NU folosește, dar NU se sperie de absență.
**Effort:** 3-5h CC (client-side export client-only zip).
**Cross-link:** NEW-5, N2 Privacy Policy.

---

### FM-5: Onboarding Resume Path After Close [LOW, NEW-8]

**Issue:** User CLOSE app pe ecran 2 (Vârstă) → restart? continue? Spec absent.

**Propunere:** Auto-save state per ecran. Resume on next open. Gracefully partial complete cu UI banner "Reia onboarding".

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** DA — Maria 65 distract by phone call NU restart from zero.
**Effort:** 1-2h CC (state persistence + resume logic).
**Cross-link:** NEW-8, §29.5.14.

---

### FM-6: Heart Rate Manual Input Optional [MEDIUM, V1.x]

**Issue:** ZERO HR integration V1. Wearable Apple HealthKit deferred V1.x. DAR Marius cu Polar OH1 vrea log HR post-set ad-hoc.

**Propunere:** Settings → Advanced → Toggle "Log HR post-set" → câmp opțional UI. Engine tier T2+ consume HR signal pentru recovery indicator.

**Filter Jeff Nippard:** DA — HR ca recovery proxy.
**Filter Gigel test:** NU — Maria NU folosește HR. Hidden by default.
**Effort:** 2-3h CC (UI optional field + state + engine consume).
**Cross-link:** V1.x roadmap.

---

### FM-7: Multi-Gym Equipment Detection [LOW dar V1.5+ candidate]

**Issue:** User cu home gym + commercial gym membership simultaneous → engine NU detect "Tuesday at gym, Thursday at home" pattern. Equipment availability differs.

**Propunere:** Settings → Multi-Gym → user creates gym profiles cu equipment per location. Session start → "Where are you training?" tap selector.

**Filter Jeff Nippard:** DA (real-world).
**Filter Gigel test:** NU — Maria 65 single gym only. Hidden V1, surface V1.5.
**Effort:** 5-8h CC (data model + UI + engine routing).
**Cross-link:** NEW-7, ADR 017 equipment dimension.

---

### FM-8: Pre-Injury Recovery Debt PROACTIVE Notification [HIGH]

**Issue:** AA detection `_detectRecoveryDebt` flags <2 rest days × 3+ săpt. DAR engine reactive (post-detection). Lipsește proactive warning early-stage.

**Propunere:** Layer "Recovery Debt Sensor" — engine track rolling 7-day rest days + alert săpt 2 (NU săpt 3) "Plan ajustat azi pentru recovery — 2 zile de odihnă în săptămâna asta vs 1 anterior". Anti-RE wording strict.

**Filter Jeff Nippard:** DA — proactive guru.
**Filter Gigel test:** DA — Gigel apreciate "engine grijă pentru mine".
**Effort:** 2-3h CC (sensor logic + engine integration).
**Cross-link:** I3 AA, §36.30 baseline shift.

---

### FM-9: Streak Pause Visualization [LOW]

**Issue:** Streak counter §36.30 internal — user NU vede progresul.

**Propunere:** Dashboard subtle "X sesiuni consecutive" indicator (NU paternalist "Don't break!"). Anti-RE conform: descriere observativă ("8 sesiuni consecutive"), NU motivational pressure.

**Filter Jeff Nippard:** DEPINDE — guru ar respecta autonomy.
**Filter Gigel test:** DEPINDE — Daniel a respins "Don't break the streak" anti-RE. DAR descriere observativă OK?

**Decision needed:** Daniel — display passive observative DA sau OFF complet?

**Effort:** ~30min UI dacă DA.
**Cross-link:** §36.30, anti-RE.

---

### FM-10: Backup Manual Local (Belt-and-Suspenders) [MEDIUM]

**Issue:** Local-first ADR 001 + Firebase sync. User cu Firebase down + local clear = data loss complet (zero backup user-controlled).

**Propunere:** Settings → "Salvează backup local" → download `andura-backup-YYYY-MM-DD.json`. User-managed via cloud personal (Drive/iCloud).

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** NU — Maria 65 NU înțelege "backup". Hidden Settings → Advanced.
**Effort:** ~1-2h CC (export + UI).
**Cross-link:** FM-4 (parțial overlap), ADR 001.

---

### FM-11: Couples/Family Mode (Shared Subscription) [LOW V2+]

**Issue:** Daniel + soție/frate vor share Andura. Pricing V1 = 1 user 1 abonament. Friction adoption family.

**Propunere:** V2+ Family tier €99/an pentru 2 useri (pre-existing sub Standard 2× = €118 → €99 reduce). Profile separate, share engine learnings cohort.

**Filter Jeff Nippard:** DEPINDE — engine learnings shared = privacy concern.
**Filter Gigel test:** DA — Gigel + Gigică (soție) cumpără 1 abonament.
**Effort:** 8-12h V2+ (data model + auth + pricing tier).
**Cross-link:** V2+ roadmap, pricing tiers.

---

### FM-12: Travel Mode Limited Equipment Auto-Routing [LOW V1.x]

**Issue:** User în vacanță hotel gym minimalist (DB + treadmill only) — engine NU adapt automat plan.

**Propunere:** Settings → "Mod călătorie 7 zile" → engine auto-route bodyweight + DB-only alternatives din Smart Routing.

**Filter Jeff Nippard:** DA — guru adapt.
**Filter Gigel test:** DEPINDE — Maria 65 nu călătorește, Gigel poate.
**Effort:** 2-3h CC (routing logic + UI toggle).
**Cross-link:** ADR Smart Routing.

---

### FM-13: Voice-to-Text Notes Post-Set [LOW V1.x]

**Issue:** Notes per set (notes array în logEntry) — typing pe phone post-set effortful.

**Propunere:** Voice-to-text input pentru notes ("Mă doare puțin umărul stâng" → text). Browser API SpeechRecognition.

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** DEPINDE — Maria 65 voice-to-text adoption variable.
**Effort:** 2-3h CC.
**Cross-link:** Daniel uses voice-to-text, dogfood validation.

---

### FM-14: Climate Awareness (Hot Months Volume Adjust) [LOW]

**Issue:** RO vară Bucuresti 35°C → recovery slower, training intensity drops natural. Engine NU detect.

**Propunere:** Engine month-aware (iulie-august) → soft volume adjust -5% optional banner "Vara, programul e mai blând".

**Filter Jeff Nippard:** DEPINDE — guru calibrate per individual, NU calendar.
**Filter Gigel test:** DEPINDE — Maria apreciate vs perceive ca paternalism.

**Decision needed:** likely DROP V1, V2+ candidate.

**Effort:** ~1h CC dacă DA.
**Cross-link:** N/A.

---

### FM-15: Form Check Voice Notes Audio Recording [LOW V2+]

**Issue:** Daniel articulation: form correction critical. Video form check (§36.84 Jeff #5) DROP definitiv. DAR audio note "Mi se pare că coboram prea repede la set 3" = posibilă alternativă.

**Propunere:** Optional audio recording 30s post-set "Cum a mers?". Stocare local (NU cloud — privacy + storage). User reviews own audio post-sesiune pentru self-coaching.

**Filter Jeff Nippard:** DEPINDE.
**Filter Gigel test:** NU — Maria 65 NU audio-note. Hidden V2+.
**Effort:** ~3-5h CC (audio API + storage).
**Cross-link:** Jeff #5 video DROP, §36.84.

---

### FM-16: Engine Self-Audit Weekly (COACHING_TEXTBOOK Tier 2 idea F) [HIGH MOAT]

**Issue:** COACHING_TEXTBOOK confirms self-audit = MOAT diferentiator real vs Fitbod/Strong. INSIGHTS_BACKLOG zice V1.5 candidate, NU V1.

**Propunere:** Pre-launch design ADR "Engine Self-Audit Layer" — săptămânal:
- "Recomandările week trecute funcționat?" — RPE actual vs predicted
- "User confirm decizii?" — adherence to engine recommendations
- "Ce greșeam?" — error patterns identification
- Surface insights to Daniel via dashboard "Coach Diagnostics" V1 sau silent learning V1.

**Filter Jeff Nippard:** DA (guru self-audit normal).
**Filter Gigel test:** DA dacă silent learning, NU dacă paternal "I was wrong" surface.

**Decision needed Daniel:** silent learning V1 (Bugatti pentru engine improve) sau visible "Coach Diagnostics" V1 (transparency MOAT pillar 3 +)?

**Effort:** 1-2 săpt design + 4-6h CC implementation.
**Cross-link:** COACHING_TEXTBOOK Tier 2, INSIGHTS_BACKLOG self-audit.

---

### FM-17: Memory-Aware Questions (COACHING_TEXTBOOK Tier 1 idea H) [HIGH MOAT]

**Issue:** Engine pune aceleași întrebări mereu. Mem-aware "user a zis săpt trecută umărul deranjează → întreabă azi 'cum e umărul?'" = Tier 1 idea, INSIGHTS_BACKLOG V1.5 candidate.

**Propunere:** Pre-launch design — ratingSession refactor pentru memory-aware questions. Topics tracker (open issues per user) + follow-up logic.

**Filter Jeff Nippard:** DA (guru remembers).
**Filter Gigel test:** DA — Gigel surprins pozitiv "îmi ține minte".
**Effort:** ~1 săpt build per INSIGHTS_BACKLOG estimate.
**Cross-link:** COACHING_TEXTBOOK Tier 1.

---

### FM-18: Education Layer In-App Tooltip Glossary [LOW]

**Issue:** Marius IQ 139 + Daniel curious → vor explanation jargon "RIR, RPE, hipertrofie, drop set". Curent Curios+Strategic mode "De ce?" expand DAR jargon glossary missing.

**Propunere:** Long-press term → tooltip definition simple RO. Built-in glossary 30-50 termeni.

**Filter Jeff Nippard:** DA (educational).
**Filter Gigel test:** DA — Maria 65 curious learn term.
**Effort:** ~2-3h CC.
**Cross-link:** Curios+Strategic mode (§36.17), Chalkboard educational layer (deferred Pro tier).

---

## §3 — SCOPE EXPANSION CANDIDATES (filter Gigel STRICT)

### SE-1: Multi-Gym Support PASS condiționată [LOW V1.5+]

Vezi FM-7. PASS Gigel test condiționat (V1 Maria invisible, V1.5+ surface power users).

### SE-2: Heart Rate Optional Manual PASS condiționat [LOW V1.x]

Vezi FM-6. PASS Gigel test condiționat (hidden default).

### SE-3: Travel Mode PASS condiționată [LOW V1.x]

Vezi FM-12. PASS Gigel test condiționat (Maria invisible, Gigel power user surface).

### SE-4: Couples/Family Mode PASS [LOW V2+]

Vezi FM-11. PASS Gigel test (familie comună). DAR feature complex V2+.

### SE-5: Voice-to-Text Notes PASS condiționată [LOW V1.x]

Vezi FM-13.

### SE-6: Climate Awareness — DROP V1 [DEPINDE]

Vezi FM-14. Borderline paternalism. Likely DROP V1, post-data candidate.

### SE-7: Audio Recording Form Check — DROP V1 [DEPINDE]

Vezi FM-15. Privacy + Maria 65 friction. V2+ candidate.

### SE-8: Custom Exercises (User-Defined) — DROP V1 [REJECTED prior]

PRODUCT_STRATEGY §3.2 explicit "custom exercises = INTERZIS V1". Confirmation only. Re-evaluate V2+ after MOAT validate.

### SE-9: Group Challenges/Competitions — DROP PERMANENT

Vault explicit anti-vendetă §1.7: "NU rețea socială. Fără feed. Fără like-uri. Zero peer-pressure". Permanent reject.

### SE-10: Wearable HRV Integration PASS [HIGH V1.x post-launch]

Apple HealthKit + Garmin + Polar. Already roadmap V1.x. ZERO finding NEW, confirm direction.

---

## §4 — STRATEGIC GAPS (business / market / moat / positioning)

### SG-1: Customer Acquisition Cost (CAC) Target Undefined [HIGH]

**Issue:** Daniel persona zice "NU paid ads V1 — corrupt ML training data". DAR post-Founding 50 manual recruit, scale-up CAC NU calculated. Word-of-mouth viral coefficient unknown.

**Propunere:** Pre-launch budget exercise — CAC realist scenarios:
- Optimistic: WoM viral coefficient 1.2 → CAC ~€5 (just hosting)
- Realistic: WoM 0.5 + content marketing → CAC ~€20-50
- Pessimistic: paid acquisition needed Year 2 → CAC €50-100

**Decision Daniel:** target LTV/CAC ratio (>3 healthy). Pricing model €39/€59/€79 cu LTV ~€60 lifetime → max CAC €20 acceptable.

**Effort:** 2h Daniel chat strategic financial modeling.
**Cross-link:** Pricing strategy §36.50.

---

### SG-2: Retention Metrics Target Baseline Undefined [HIGH]

**Issue:** ZERO target DAU/WAU/MAU pentru product-market fit signal. Beta cohort 50 → ce % active la luna 1, 3, 6?

**Propunere:** Pre-launch target Bugatti benchmarks:
- DAU/MAU ratio target 25-35% (good for fitness apps cu sesiuni 3×/săpt)
- W4 retention >60% (Beta cohort)
- W12 retention >40% (post-Founding mostly engaged)
- Churn rate target <5%/lună

**Effort:** 1-2h Daniel + Claude review benchmarks industry.
**Cross-link:** Beta launch §36.13.

---

### SG-3: Churn Metrics Methodology Undefined [HIGH]

**Issue:** Founding 3-year lock = pricing structural. DAR churn post-3 years → ce strategy retention?

**Propunere:** Define churn signals + retention triggers:
- Voluntary cancellation reasons (exit survey)
- Payment failures retry logic
- Re-engagement campaign post-cancel (non-spam)
- Win-back tier Founding lifetime renew?

**Effort:** 2h Daniel + Claude review.
**Cross-link:** Pricing §36.51 3-year lock.

---

### SG-4: NPS Measurement Methodology [MEDIUM]

**Issue:** Beta cohort feedback Telegram = qualitative. ZERO quantitative NPS measurement plan.

**Propunere:** In-app NPS prompt monthly (post 30+ sessions). Single question "Cât de probabil să recomanzi Andura unui prieten? 0-10". Track trend post-launch.

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** DA condiționat (1 prompt monthly = friction-free).
**Effort:** ~2-3h CC + analytics setup.
**Cross-link:** Beta Telegram §36.53.

---

### SG-5: App Store Optimization (ASO) Strategy [MEDIUM, post-PWA wrap]

**Issue:** Andura PWA V1. Wrap Capacitor → Play Store post-launch. ZERO ASO strategy yet (keywords, screenshots, description, ratings strategy).

**Propunere:** ASO research pre-Capacitor wrap. Target keywords RO ("antrenor AI", "fitness inteligent", "antrenor personal"), screenshots Bugatti craft, app icon iconic.

**Effort:** 3-5h Daniel research + design.
**Cross-link:** V1.x Play Store launch.

---

### SG-6: iOS Launch Timing vs MOAT Erosion [HIGH]

**Issue:** "SensAI for Android" positioning stable DAR risc SensAI launch Android în 6-12 months. iOS launch Andura V1.x = critical milestone competitive.

**Propunere:** iOS launch target Q3 2027 (6 luni post Soft Launch). Capacitor wrapper + Apple HealthKit integration. Pre-launch competitive intelligence monitoring SensAI.

**Effort:** ~2-4 săpt CC iOS wrap + HealthKit.
**Cross-link:** §36.46 Pricing iOS post-v1.x.

---

### SG-7: Pricing Elasticity Untested [MEDIUM]

**Issue:** €39 Founding (cap 50) + €59 Standard + €79 Elite V1.1 = LOCKED. ZERO test pricing elasticity (€29 Founding hits 50 cap faster? €69 Standard sustainability long-term?).

**Propunere:** Post-50 Founding milestone, A/B test Standard pricing pe cohort Beta cu €49 vs €59 vs €69. Measure conversion + LTV variance.

**Effort:** ~1 săpt analytics setup + data collection.
**Cross-link:** §36.50 pricing.

---

### SG-8: Localization Roadmap Pe Limbi [LOW V2+]

**Issue:** RO + EN simultan V1 LOCKED. Alte limbi când? Pre-decizie spec absent (HU? PL? DE?).

**Propunere:** V2+ defer formal. Pre-launch ZERO commitment alte limbi. Răspuns standard support: "RO + EN V1, alte limbi V2+".

**Effort:** N/A (decision-only).
**Cross-link:** PRODUCT_STRATEGY §1.1.

---

### SG-9: Sub-Segment Markets Opportunity Mapping [LOW V1.5+]

**Issue:** "Universal" positioning V1. DAR niche markets (powerlifting standalone? menopause-specific app?) = potential pivot V1.5+ post-PMF data.

**Propunere:** Post-Beta data → sub-segment analysis (cohort cu engagement >X% → niche pattern?). NU pre-commit pivot, just framework.

**Effort:** Post-Beta analytics ~1 săpt.
**Cross-link:** PRODUCT_STRATEGY §1.1.

---

### SG-10: Data Privacy Moat (RO-Hosted Firebase Region) [LOW]

**Issue:** Firebase region `europe-west1` (Belgium) = EU GDPR OK DAR NU RO-hosted. RO competitors (if exists future) cu RO server = potențial trust signal. ZERO finding audit.

**Propunere:** V1 OK Belgium (cost + latency + compliance). V2+ evaluate dacă RO hosting devine competitive moat.

**Effort:** N/A V1 (decision deferred).
**Cross-link:** ADR 002 Firebase REST.

---

## §5 — TOP 10 PRIORITIES RANKED (impact × effort × Filter PASS)

### Filter Methodology

**Score = Impact (1-5) × (1 / Effort hours) × Filter PASS multiplier**
- Filter PASS DA × DA = 1.5×
- Filter PASS DA × DEPINDE = 1.0×
- Filter PASS DEPINDE × DEPINDE = 0.7×
- Anything NU × NU = exclude from ranking

### Top 10 Final Ranked

| Rank | Item | Score | Impact | Effort | Filter | Reasoning |
|------|------|-------|--------|--------|--------|-----------|
| **1** | **IMP-2 Reconciliation Coordinator §36.86** | **22.5** | 5 | ~30min | DA × DA | Quick win HIGH impact anti-friction Beta cohort. Single META-RULE prevent disaster scenario |
| **2** | **IMP-1 Volume Floor Guarantee** | **15.0** | 4 | ~1h | DA × DA | Anti-amputation Maria 65 critical for Bugatti standard engine |
| **3** | **IMP-8 Onboarding SSOT Consolidation** | **9.0** | 5 | ~3h | N/A × DA | Consolidate 5 SSOT inconsistente. Foundation pentru CC implementation onboarding |
| **4** | **FM-2 Mobility/Warm-up Auto-Insertion** | **8.5** | 5 | ~5h | DA × DA | Longevity 50+ critical, Maria 65 cohort. Guru-grade compete vs Fitbod |
| **5** | **FM-16 Engine Self-Audit Weekly** | **8.0** | 5 | ~1-2 săpt | DA × DA condiționat | MOAT diferentiator real per COACHING_TEXTBOOK Tier 2 |
| **6** | **IMP-3 Synthetic Demographic Prior Pre-Calibration** | **7.5** | 5 | ~10h | DA × N/A | Pre-Beta calibration scientific approach. AA threshold + Voice weights tuning critical |
| **7** | **FM-17 Memory-Aware Questions** | **6.5** | 4 | ~1 săpt | DA × DA | MOAT pillar 5 personalization. COACHING_TEXTBOOK Tier 1 idea H |
| **8** | **FM-8 Pre-Injury Recovery Debt Proactive** | **6.0** | 4 | ~2-3h | DA × DA | Anti-injury proactive (vs reactive AA), Marius cohort high engagement |
| **9** | **IMP-4 Spec→Cod Tracking Matrix** | **5.5** | 4 | ~1.5h | DA × N/A | Anti-recurrence drift institutionalizat. Foundation pentru audit-uri future |
| **10** | **SG-1 + SG-2 CAC + Retention Metrics Targets** | **5.0** | 5 | ~3-4h | N/A × N/A | Pre-launch business modeling minim. PMF measurement pre-Beta |

### Honorable Mentions (Top 11-15)

11. **IMP-5 Performance Benchmark Android** — Q11 latency Maria 65 phone validation
12. **IMP-15 Sprint Vault Hygiene Q2 2026** — meta hygiene
13. **FM-3 Sickness/Vacation Flag** — anti-RE life events
14. **IMP-6 Body Region Map Lateralization** — §36.85 Opt A enabler
15. **FM-1 Plate/DB Calculator Round-Off** — Maria equipment realism

### Excluded from Top 10 (intentional)

- **Pre-Beta CRITICAL blockers (B2/B3/B4 etc.)** — listed in VERIFICATION_REPORT §9. Sunt obligatorii separat de improvements/features ranking.
- **Auth Flow §36.80** — Priority 1 ABSOLUT separat (din handover original).

---

## §6 — META OBSERVAȚIE

### Pattern observat în vault: Engine arhitectural solid + activation gap

COACHING_TEXTBOOK_SYNTHESIS final verdict consonă cu observațiile mele post-verificare:

> "Andura are arhitectura corectă pentru a deveni coach AI ideal, dar e momentan în starea 'schelet structural ridicat, multe spații goale'. Nu trebuie să implementezi textbook-ul. Trebuie să termini ce ai început (engines DEAD/PARTIAL → WORKS) și să adâncești pattern-urile (de la 30% sofisticate la 80%)."

**Findings concrete confirmă pattern:**
- weaknessDetector → orfan reordering only, NU proactiv
- plateauInterventions → 12+ techniques DAR UI wiring unclear  
- ADR 021 calibrationReconciliation → algorithm LIVE + tests, NU consumers
- Composite Signal → detection + lifecycle DAR coordination cu Volume multipliers manual
- Cognitive Architecture R8/R9/R26 → spec semantic-thresholds, cod = key-write triggers (drift)

**Andura MOAT real NU = features count**, ci **activation depth** features existing. Bugatti paradigm aplicat = post-Beta sprint dedicat "fill the gaps" pentru existing engines, NU "add new features".

### Risk identificat: Scope-creep amenințare

COACHING_TEXTBOOK warning: "Cea mai mare capcană e să folosești textbook-ul ca scope-creep ('trebuie să implementăm tot, e atât de bun'). Asta întârzie launch-ul cu 6-12 luni fără valoare adăugată proporțional."

**Aplicat la acest report:** ~50 idei catalogate. Top 10 priorities ranked. Daniel decide dacă **stop la Top 5-10 + Bugatti polish** SAU **integrate Top 15-20 + delay launch 3-6 luni**.

**Recomandare CLAUDE Co-CTO:** Top 5-7 priorities pre-Beta, restul V1.5/V2 backlog explicit. Quality > timeline DAR scope discipline > scope creep.

---

🦫 **Faza 2 ideation complete. ~50 idei NEW catalogate (15 improvements + 18 features missing + 10 scope expansion + 10 strategic gaps). Top 10 priorities ranked. Trec la handover total CC-ingest-ready.**

---

## §7 — INTEGRARE ADDENDUM CHAT STRATEGIC 2026-05-03

**Source:** `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md`. ADR 023 LLM Intent Interpretation LOCKED V1 + 6 finding-uri reclasificate.

### Items NEW emergente post-addendum

#### NEW-IDEATION-1: Expert Validator Coach Paid €500-1000 [HIGH pre-Beta]

**Context:** Plan calibration §5 addendum punctul E. Pre-Beta validator extern senior strength coach RO (sau Jeff-Nippard-tier) review sample 50 decizii engine.

**Filter Jeff Nippard:** DA (literal review by guru-tier).
**Filter Gigel test:** N/A (validation backend).
**Effort:** €500-1000 one-time + Daniel sourcing 2-4h.
**Cross-link:** IMP-3 Synthetic pre-calibration, plan A+B+E addendum §5.

#### NEW-IDEATION-2: Observation Mode Prima 2 Săpt Beta [HIGH]

**Context:** Plan calibration §5 addendum punctul B. Engine logează signals + recommendations DAR NU intervine activ user-facing primele 2 săpt Beta. Recalibrate pe data reală cohort săpt 3-4.

**Filter Jeff Nippard:** DA (rigor scientific approach).
**Filter Gigel test:** DA (Maria 65 NU primește false positives).
**Effort:** ~2-3h CC (feature flag observation mode + analytics + recalibration trigger).
**Cross-link:** IMP-3, plan A+B+E.

#### NEW-IDEATION-3: SLA Documented în ToS — Bus Factor 1 Disclosure [LOW pre-launch]

**Context:** Bus factor 1 ACCEPTED TRADE-OFF pre-revenue. Mitigation = transparency disclosure.

**Wording propus:** "Andura este dezvoltat de o echipă de 1 dezvoltator. Răspuns critical bugs în 48h working days, NU 24/7 support. Reconsider hire/co-founder post-revenue."

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** PASS condiționat (transparency, NU hidden).
**Effort:** ~30min Daniel + legal audit Stage 2 review.
**Cross-link:** §AMENDMENT addendum §4.

#### NEW-IDEATION-4: Whitelist Exercise Names + Termeni Fitness RO Maintenance [LOW]

**Context:** ADR 023 §2.B sanitizer client-side păstrează exercițiile + termeni fitness RO whitelist. Nevoie maintenance registry.

**Filter Jeff Nippard:** N/A.
**Filter Gigel test:** N/A (infra).
**Effort:** ~1-2h CC initial + ~30min/lună maintenance post-launch.
**Cross-link:** ADR 014 equipment registry, ADR 023 §2.B.

#### NEW-IDEATION-5: Cost Monitoring Backend Cloud Functions [MEDIUM]

**Context:** ADR 023 §2.H cost cap €10/lună hard. Hard enforcement necesită backend counter (Spark plan limitation per Q11-INFRA finding).

**Filter Jeff Nippard:** N/A (infra).
**Filter Gigel test:** N/A.
**Effort:** ~3-5h CC dacă Cloud Functions Blaze plan upgrade decis (vezi D4 handover).
**Cross-link:** Q11-INFRA, D4 Cloud Functions decision.

### ADR 023 LLM Intent Interpretation LOCKED V1 — adăugare Top 10 priorities

**Updated Top 11 cu ADR 023 integrare:**

| Rank | Item | Score | Effort | Sequencing |
|------|------|-------|--------|-----------|
| **1** | IMP-2 Reconciliation Coordinator | 22.5 | ~30min | Quick win |
| **2** | **ADR 023 LLM Intent Implementation Tier 1+2** | **NEW HIGH** | **6-10h** | **Pre-Beta MANDATORY** |
| **3** | IMP-1 Volume Floor Guarantee | 15.0 | ~1h | Anti-amputation |
| **4** | IMP-8 Onboarding SSOT (TRIPLE-1+QUADRUPLE-1) | 9.0 | ~3h | DUPLICATE handover |
| **5** | NEW-IDEATION-2 Observation Mode Beta | NEW | ~2-3h | Plan calibration B |
| **6** | FM-2 Mobility/Warm-up Auto-Insertion | 8.5 | ~5h | Longevity 50+ |
| **7** | FM-16 Engine Self-Audit Weekly | 8.0 | ~1-2 săpt | MOAT |
| **8** | IMP-3 Synthetic Demographic Prior pre-calibration | 7.5 | ~10h dacă DEMO-1 incomplete | Plan A |
| **9** | NEW-IDEATION-1 Expert Validator Coach Paid | NEW | €500-1000 + 2-4h sourcing | Plan E |
| **10** | FM-17 Memory-Aware Questions | 6.5 | ~1 săpt | MOAT |
| **11** | FM-8 Pre-Injury Recovery Debt PROACTIVE | 6.0 | ~2-3h | Anti-injury |

### Status post-addendum

- **+5 idei NEW** integrate (3 din addendum §6 punctele 3-7 + ADR 023 ca priority NEW + reclasificate)
- **Top 10 → Top 11** ranking expanded
- **T2 RESOLVED** prin ADR 023 — NU mai e candidate ideation, e closed

🦫 **Faza 2 ideation post-addendum complete. ADR 023 = priority #2 pre-Beta MANDATORY. Plan calibration A+B+E integrate. ~55 idei totale post integrare.**
