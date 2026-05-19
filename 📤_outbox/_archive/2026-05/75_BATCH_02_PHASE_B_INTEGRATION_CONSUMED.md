# PROMPT_CC_SPRINT4X_BATCH_02_PHASE_B_INTEGRATION

**Model:** Opus
**Order:** 02
**Dependencies:** None (strict disjunct — modifies src/engine/*.js, ADR docs touched only for placeholder wording read)
**Scope:** §36.58 implementation — replace 51 strings LOCKED V1 în 5 module engine + integrate 2 placeholders + production gate lift

---

## TASK

Replace 51 strings Phase B LOCKED V1 (§36.58 master) în source code + integrate 2 NEW placeholders + remove `PHASE_B_LOCK_REQUIRED` flags + grep verify zero rezidual.

### Pre-flight

```bash
# Verifică 5 engines existing (sau create dacă missing)
ls -la src/engine/fatigue.js src/engine/dp.js src/engine/reality.js src/engine/sys.js src/engine/calibration.js

# Count flags pre-lift
grep -rn "PHASE_B_LOCK_REQUIRED\|PHASE_B_WORDING_PENDING" src/ | wc -l
```

**Engines status:** Conform alignment Q14, engines pot fi NOT YET CREATED (doar prEngine.js + linearBlock.js + masteryMilestone.js shipped Batch B). Acest batch = CREATE 5 new engine modules + INTEGRATE 51 strings ca first iteration.

### Strings sursă — §36.58 SSOT

Citește direct din `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.58 — 51 strings master (5 module engine: fatigue 8 + dp 20 + reality 6 + sys 13 + calibration 4) + 2 NEW placeholders (PROMPT_PROFILE_VALIDATION + GOAL_SHIFT_CALIBRATION).

### Implementation

**fatigue.js (8 strings):**
- 4 verdicte LOCKED (HIGH_FATIGUE / MODERATE_FATIGUE / PEAK_FORM / NORMAL) cu label + detail per §36.58
- ZERO score numeric expus, ZERO category raw (oboseală/somn prost/RPE)

**dp.js (20 strings):**
- 10 verdicte progresie (incl. ON_TARGET ca stare neutră — clarifică count "10 verdicte tranziție + 1 ON_TARGET" în comment header)
- 4 intensity labels RIR (incl. 🟠 excepție justificată per Q26.bis)
- 2 in-session adjust (DOWN/UP)
- 4 start verdicte (EXACT_MATCH / SIMILAR / FALLBACK + intern logic)
- Format: `${lastW} kg → ${newKg} kg` simetric (NU `${lastW} × 0.7`)

**reality.js (6 strings):**
- FIXED_PHASE_NOTICE / AUTO_PHASE_NOTICE / PROGRESS_TOO_SLOW / PROGRESS_ON_TRACK / PROGRESS_PLATEAU / PROGRESS_TOO_FAST
- Pattern: emotional-sensitive (PLATEAU + TOO_FAST) folosesc "Hai să..." invitație colaborativă, routine context (TOO_SLOW + ON_TRACK) folosesc voice plural neutră

**sys.js (13 strings):**
- 4 tempo notes (TEMPO_STRENGTH / TEMPO_STRENGTH_ISO / TEMPO_BULK_COMP / etc)
- 3 contextual notes (NOTE_SQUEEZE / NOTE_PUMP_QUALITY / NOTE_CUT_DEFENSE)
- 2 technique alerts (TECHNIQUE_DROP_SET cu "−30% greutate" + TECHNIQUE_PARTIALS)
- 4 phase timeline labels RO native (Definire până la vară / Vară peak (menținere) / Creștere (toamnă-iarnă) / Definire pre-vară) + checkpoint sub-label
- Keys ENG păstrate intern (PHASE_CUT_TO_SUMMER, etc) per Q6 LOCKED — display labels RO

**calibration.js (4 banner texts):**
- COLD_START / INITIAL / DEVELOPING / PERSONALIZING
- PERSONALIZED + OPTIMIZED tiers păstrează `bannerText: null` (transparent UI) per Q7 LOCKED
- Logic check `tier.bannerText !== null` pre-render

**2 NEW placeholders:**
- `PROMPT_PROFILE_VALIDATION_PLACEHOLDER` per ADR_MODE_DETECTION_UI_v1 EXT-4 final wording
- `GOAL_SHIFT_CALIBRATION_PLACEHOLDER` per ADR_OUTLIER_FILTER_v1 EXT-2 final wording

### Production gate lift

Remove TOATE `PHASE_B_LOCK_REQUIRED` și `PHASE_B_WORDING_PENDING` flags din src/.

### Tests

Add Golden Master tests per engine (snapshot-based pe wording output, prevent silent drift):
- `tests/engine/fatigue.golden.test.js` — assert toate 4 verdicte produc strings exacte locked
- Idem dp/reality/sys/calibration

---

## VERIFICATION

```bash
# Zero flags
grep -rn "PHASE_B_LOCK_REQUIRED\|PHASE_B_WORDING_PENDING" src/
# Expected: 0 matches

# Strings present
grep -rn "Azi mergem mai blând" src/engine/fatigue.js
grep -rn "Pornim conservator" src/engine/dp.js
grep -rn "Definire până la vară" src/engine/sys.js
grep -rn "Învățăm cum lucrezi" src/engine/calibration.js

# Tests pass
npm test -- engine/
# Expected: all green, +N new Golden Master tests
```

---

## COMMIT + PUSH

```bash
git add src/engine/ tests/engine/
git commit -m "engines: Phase B 51 strings LOCKED V1 integrated + 2 placeholders + production gate lift per §36.58"
git push
```

---

## RAPORT — `📤_outbox/LATEST.md`

Move existing LATEST → archive cu next NN.

**Format raport:**
- Task, Model, Status
- Pre-flight: engines existence check, flags count pre
- Modificări: 5 engine files + tests + line counts
- Strings count integrated: 51 + 2 placeholders
- Production gate: flags before X → 0 after
- Build + Tests: total tests count + pass/fail
- Commits: hash
- Pushed: Yes/No
- Issues: detail orice abatere de la §36.58 master
- Next action: BATCH_03 (sequential auto-trigger)
