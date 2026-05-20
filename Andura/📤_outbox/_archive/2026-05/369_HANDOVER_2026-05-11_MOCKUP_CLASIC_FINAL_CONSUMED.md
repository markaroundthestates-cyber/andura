# HANDOVER 2026-05-11 — Mockup Andura Clasic final + paradigm adaptive reconfirmat

**Mod:** §CC.5 FAST · Birou MSIX → Acasă Windows VS Code+PowerShell · Scribe-mode narrativ
**Scope:** mockup design refinement (design master pre-React migration), ZERO impact arhitectură/spec V2 LOCKED V1 — cumulative ~719 PRESERVED.

---

## Ce am făcut

Discutam reviewul mockup-ului `andura-clasic.html` livrat de Claude Design. Pass 1: 2 critice + 7 lipsuri features + 4 clarificări decisions identificate vs spec V2 LOCKED V1. CD a livrat 2 iterații, am ajuns la versiune solidă, dar prima rundă a sărit 8 din 11 items, runda 2 a făcut majoritatea dar a interpretat L6 greșit (win-back inactive user în loc de reactivation post-delete-grace). Plus CD a ajuns la limita quota săptămânală (token boundary x20 plan separat). Eu am preluat tail-ul: L6 fix + dead code cleanup + lucide CDN URL deprecation bug.

Toate decisions luate cap-coadă:
- **#10 LOCKED Auth Google primary** (brick top, Email ghost middle, Skip ultimul cu risk-note). Decisive: friction one-tap >> email 30s+ round-trip + Magic Link 1h expiration risk Phase 2.
- **#11 LOCKED Termina mai devreme confirm extra** drill-down `screen-confirm-finish-early` cu body explicit "NU pierzi progresul" (anti-panic Maria 65).
- **#12 LOCKED DEFER pre-Beta Sumar săptămânal archive** (push only). Istoric deja dens, add v1.5 dacă feedback users cere.
- **#13 LOCKED DEFER pre-Beta Mesaj zilnic archive** (push only, ephemeral by design).
- **LOCKED paradigm adaptive scheduling NU e nou** — e fundamental PROJECT_VISION + ADR 011 CDL "follows the body, not the calendar". CD-ul l-a ratat în prima versiune (template săptămânal rigid "Joi · Push · Sapt 3 Ziua 3/4"). Refactor mockup: Antrenor home "Coach-ul recomandă AZI" + WHY line italic + REST-DAY variant + Schedule override 4 opțiuni adaptive (Vreau alt tip / Sesiune ușoară / Sar ziua / Vreau antrenez când era pauză contextual). Heatmap Istoric legenda nouă (Greu/Normal/Ușor/Zi liberă, NU "missed/skipped" compliance shame).
- **LOCKED "Vrei altceva azi?"** text link sub butonul Începe sesiunea (NU chevron-row separat — Daniel preferință explicită). Drop complet "Schimbă planul săptămânii" row vechi (redundancy Hick's law).
- **LOCKED L6 dual-feature distinct semantic:** screen-auth-reactivate NEW (post-delete-grace 30 zile flow) + card "Bun venit înapoi" preserved separat (win-back inactive user 14+ zile). Comentarii clarificate ambele HTML+JS.

Mid-flight:
- **Lucide CDN URL** `unpkg.com/lucide@latest/dist/umd/lucide.min.js` întoarce JS valid în testele mele jsdom (245 icons rendered 100%), dar Daniel local NU vedea iconițele post-modificările mele. Diagnostic via testare deterministă jsdom: lucide library funcționează, problema era cache local / network browser Daniel. Soluția robustă aplicată: **lucide UMD v1.14.0 embedded INLINE** în mockup (file size +400KB la 702KB, dar self-contained zero CDN dependency, never network issue again). Daniel confirmat post-embed: merge bine.
- **Themes 3 rămase** (Living Body / Luxury / Brain Coach) — Daniel decision: Claude (eu) port mecanic per Theme Parity Invariant LOCKED V1 post-finisaj Clasic, NU CD (token quota limit). Aștept go signal.

Engine mapping cap-coadă pentru port-first vanilla JS:
- ~85-90% UI elements ✅ map 1:1 cu engines existing în `src/engine/` (coachDirector / CDL / ruleEngine / dp / patternLearning / adherence / calibration / stagnationDetector / predictionEngine / whyEngine / weaknessDetector / energyAdjustment / bayesianNutrition / proactiveEngine / alternativeEngine).
- **3 gap-uri reale** (extension/new needed, NU complete rebuild):
  1. `muscleRecovery.js` helper — "Pectoralii recuperează din marți · spatele e gata" WHY line + Step 2 schedule override alt-type generation cu rationale recovery state. Probabil extension la patternLearning/weaknessDetector, NU complet nou. **Verifică src/engine/ existence pre-port.**
  2. coachDirector methods noi pentru 4 opțiuni schedule override: `buildLightMobility()`, `rebalanceWeekAfterSkip()`, `generateSafeSessionForRestDay()`.
  3. US Navy BF calculation + greutate țintă projection — verifică src/ existence sau e new helper.

## Mid-flight unresolved BLOCKING pre-port (carry-forward CURRENT_STATE)

- 🔴 **P1-FLAG-PROD-AUTO-FAZA-2026-05-10** — Auto template fallback 2000 kcal hardcoded vs auto-detect goal+calibrations. Neinvestigat.
- 🔴 **P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10** — BF manual edit nu recalc kcal phase + BMR formula audit Katch-McArdle vs Mifflin. Neinvestigat.
- 🟡 CEO decizie V1 features keep/drop BATCH 2 Antrenor (streak counter + BMR strip + per-set RPE granularity) — încă pending pre BATCH 2.

## Files in inbox

- `andura-clasic.html` (4212 LOC, 702KB cu lucide embedded inline) = mockup design master FINAL pentru tema Clasic. Audit final ~98% compliant spec V2 LOCKED V1. Bază solidă pentru port-first vanilla JS Step 1 + React migration Step 2.

## Next actions

1. (Optional) CC update CURRENT_STATE.md cu locks recente (paradigm adaptive scheduling reconfirmat fundament, decisions #10-13, L6 dual-feature). Comandă: **"Update CURRENT_STATE per inbox handover"**. ~5 min CC.
2. Move `andura-clasic.html` din `📥_inbox/` în `04-architecture/mockups/` (design master). Verifică dacă există versiune anterioară să faci backup tag git pre-replace.
3. Daniel signal Claude (eu) când vrea port mecanic 3 themes rămase (Living Body / Luxury / Brain Coach) per Theme Parity Invariant.
4. Pre-port: rezolvă 2 bugs P1 prod + CEO decizie BATCH 2 V1 features.

## Daniel-isms folosite în chat

- "halucinezi" 2x (paradigm adaptive shift fals atribuit ca nou + URL lucide deprecat) → mea culpa rapidă fără auto-flagelare, acțiune imediată.

## Bandwidth

Chat saturat ~8% la momentul handover. Scribe mode active permanent, lean format păstrat cap-coadă. Mockup self-contained zero CDN dependency = robust transmissable între medii (acasă MCP filesystem ↔ birou MSIX PK fallback).
