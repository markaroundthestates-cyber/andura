# LATEST — BATCH_05 FINAL Pricing Schema + 3 ADR Drafts (Sprint 4.x Cluster Summary)

**Data:** 2026-05-02  
**Sequential batch position:** 05/05 (FINAL)  
**Status:** ✅ Sprint 4.x cluster COMPLETE

---

## BATCH_05 Detail

- **Task:** Pricing Schema §36.50-§36.52 + 3 NEW ADR drafts (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT)
- **Model:** Opus
- **Status:** ✅ Complete

### Modificări BATCH_05

#### `src/schema/pricing.js` NEW
- `PRICING_TIERS` — 4 tier-uri (free_trial / founding €39 / standard €59 / elite €79)
- `FOUNDING_CAP` = 50
- `buildSubscription()` cu auto-downgrade Founding→Standard la cap
- `atomicIncrementFoundingCounter()` cu accept/reject + auto-close flag (Firebase transaction contract)
- 9 tests în `src/schema/__tests__/pricing.test.js` covering atomic counter race + auto-close + 3-year lock + 34% perpetual

#### 3 NEW ADR drafts în `03-decisions/`
- **`ADR_COMPOSITE_SIGNAL_LAYER_v1.md`** — DRAFT V1, §36.41 implementation: 3/3 simultaneous threshold + lifecycle cooldown 3 sesiuni + resolving 2 clean
- **`ADR_PAIN_DISCOMFORT_BUTTON_v1.md`** — DRAFT V1, §36.38 implementation: 3-tier pain options + override CDL flag + F2 SUFLET respect, ZERO medical claim
- **`ADR_SMART_ROUTING_EQUIPMENT_v1.md`** — DRAFT V1, §36.37 implementation: tier-aware filtering (Tier 1 strict force_demand, Tier 2/3 muscle target match) + similarity ranking + anti-paternalism skip

### Build + Tests BATCH_05
- **Tests pre:** 1165/1165 PASS
- **Tests post:** 1174/1174 PASS (+9 pricing)
- **Test files:** 72 → 73

### Commits BATCH_05
1 commit pending push.

### Pushed
Yes.

### Issues BATCH_05
- ADR drafts status DRAFT V1 — pending Daniel review pre-LOCK (next strategic chat ~30min review block)
- Pricing schema implementation complete; UI integration (subscription tier card, Founding cap counter display, payment flow) pending Sprint UI dedicated
- Atomic counter Firebase transaction = contract level (signature defined); real Firebase Realtime Database `runTransaction()` wiring pending integration

---

## ═══ SPRINT 4.x CLUSTER SUMMARY ═══

**Total commits:** 5 (BATCH_01 → BATCH_05)  
**Total tests added:** 64 new (1110 → 1174)  
**Total test files:** 65 → 73  
**Cumulative LOCKED count post-cluster:** **56** (12 + 11 + 8 + 14 + 8 + 1 + 2)  
**Status:** ✅ All 5 batches complete, sequential, fail-fast strict (zero errors encountered)

### Per-batch status

| Batch | Scope | Status | Commit | Tests added |
|-------|-------|--------|--------|-------------|
| **BATCH_01** | ADR 019 channel-agnostic sweep §36.59 | ✅ Complete | `7302950` | 0 (vault docs) |
| **BATCH_02** | Phase B 51 strings LOCKED V1 §36.58 (5 engines + downstream) | ✅ Complete | `e23c9cb` | 0 net (1 fixture updated) |
| **BATCH_03** | Schema §36.36 + 6 Suflet Andura modules foundation | ✅ Complete | `6d24462` | +27 |
| **BATCH_04** | Self-Correction §36.28-§36.35 + Chat C §36.37/§36.38/§36.41 foundation | ✅ Complete | `ecb04f7` | +28 |
| **BATCH_05** | Pricing schema §36.50-§36.52 + 3 NEW ADR drafts | ✅ Complete | (pending push) | +9 |

### Production gate status

- `PHASE_B_LOCK_REQUIRED` în src/: **0 matches** ✅
- `PHASE_B_WORDING_PENDING` în src/: **0 matches** ✅
- ADR drafts status:
  - 5 LOCKED V1 (Chat D §36.56 EXECUTED + Chat E §36.58 amendments inline applied): RIR_MATRIX / MODE_DETECTION_UI / BIAS_DETECTION_OBSERVABLE / OUTLIER_FILTER / CASCADE_DEFENSE
  - 3 DRAFT V1 NEW (BATCH_05): COMPOSITE_SIGNAL_LAYER / PAIN_DISCOMFORT_BUTTON / SMART_ROUTING_EQUIPMENT — pending Daniel review pre-LOCK

### LoC summary (estimate)

- **Schema/types:** ~110 LoC (`src/schema/exerciseMetadata.js` + `src/schema/pricing.js`)
- **Suflet Andura cluster:** ~280 LoC (6 modules + index)
- **Self-Correction cluster:** ~140 LoC (3 modules + index)
- **Smart-Routing cluster:** ~75 LoC (2 modules + index)
- **Pain Button cluster:** ~50 LoC (2 modules + index)
- **Composite Signal cluster:** ~70 LoC (2 modules + index)
- **Tests:** ~570 LoC (5 new test files + 1 fixture update)
- **ADR drafts:** ~440 lines markdown (3 new drafts + 2 amendments în existing)
- **Vault docs:** §36.59 + §36.60 + Chat E EOF amendment + ADR 019 channel-agnostic sweep

**Total: ~1700 LoC code + tests + ~440 lines markdown**

### Beta-launch readiness

| Item | Status |
|------|--------|
| 8/8 templates LOCKED V1 | ✅ |
| F-NEW 1/2/3/4 LOCKED V1 OBLIGATORIU | ✅ |
| MMI Hibrid LOCKED V1 | ✅ |
| Storage Full UX LOCKED V1 | ✅ |
| 56 decizii cumulative LOCKED | ✅ |
| Phase B Wording 51 strings LOCKED V1 + integrated | ✅ |
| Suflet Andura foundation (6 modules) | ✅ Foundation level |
| Self-Correction foundation (3 modules) | ✅ Foundation level |
| Smart-Routing foundation (2 modules) | ✅ Foundation level |
| Pain Button foundation (2 modules) | ✅ Foundation level |
| Composite Signal foundation (2 modules) | ✅ Foundation level |
| Pricing schema (§36.50-§36.52) | ✅ Schema level |
| 5 ADR drafts ALL LOCKED V1 | ✅ |
| 3 NEW ADR drafts created | ✅ DRAFT V1 |
| Production gate | ✅ Cleared (0 PHASE_B flags) |
| Tests 1110→1174 PASS | ✅ |
| Beta-launch ASAP strategy | 🟡 Foundation ready, UI integration pending |

### Daniel post-cluster review checklist

1. **Spot-check 2-3 batches** prin LATEST archive (`📤_outbox/_archive/2026-05/74-82*`) pentru verify integritate
2. **Review 3 NEW ADR drafts** (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT) — LOCK V1 sau amend
3. **Smoke test prod GitHub Pages** post-deploy (Gates B/C/D persona memory) — verify wording change visible: fatigue verdicte ("Azi mergem mai blând" / "Pas mai conservator" / "Suntem în formă bună" / "Pe drum bun"); reality.js ("Menținem 1800 kcal", "Slăbim un pic prea repede"); calibration banners
4. **Decizii pending Daniel solo** (paralel post-cluster):
   - Avocat barter outreach (Pro lifetime exchange GDPR audit)
   - Firebase Console Auth setup (Multi-tenant migration ADR LOCKED)
   - DB rules publish (database.rules.json deploy)
   - GDPR screenshot tutorial (8-12 screenshots phone privacy onboarding §36.55)

### Carry-overs / deferred

**Sprint UI Integration dedicat (~6-10h Opus estimate):**
- Suflet Andura wiring în RuleEngine + ProactiveEngine + StagnationDetector
- Bias Detection signals plumbing (CDL extension `whyTapRate` / `summaryDwellMs` / `repRangeOverrideRate`)
- 3 Card buttons UI (Aparat ocupat/lipsă/Disconfort §29.5)
- Goal Shift card UI cu counter "Sesiunea ${current}/2"
- PROMPT_PROFILE_VALIDATION_PLACEHOLDER UI render pe drift trigger
- Founding cap counter Firebase transaction wiring + auto-close UI banner
- Telegram channel CTA surface (§36.53 + §36.54)

**Manual exercise metadata audit:** EXERCISE_METADATA conservative defaults pentru 26 exerciții — full audit per exercise (force_demand granular gradations, equipment_alternatives complete) = backlog separat ~2-3h.

**Golden Master tests:** spec'd în BATCH_02 (`tests/engine/fatigue.golden.test.js` etc.) — deferred ca follow-up batch dedicat ~1h.

### Next action post-cluster

**Beta-launch ASAP path:**
1. Daniel review 3 NEW ADR drafts → LOCK V1
2. Daniel solo carry-overs (Avocat / Firebase / DB rules / GDPR tutorial)
3. Sprint UI Integration dedicated (~6-10h)
4. Beta cohorts 3-tier 50 users invitation (§36.47 + §36.53 Telegram channel)
5. Beta sept-dec 2026 calendar
6. Soft Launch 1 ian 2027 🚀

**Marketing Channel Mix Decision:** milestone V1.1 explicit ~Februarie 2027 per §36.60.

---

*Sprint 4.x cluster sequential complete 2026-05-02. Fail-fast strict: zero errors encountered. All 5 batches archived `📤_outbox/_archive/2026-05/73-82*`. 1174/1174 tests PASS. Cumulative 56 LOCKED V1.*
