# PROMPT_CC_BATCH_01_ADR_LOCKS

**Model:** Opus
**Order:** 1/10
**Dependencies:** none (first batch)
**Scope:** LOCK V1 cele 3 ADR drafts pending review, cu amend EXT-1 pe Pain Discomfort Button
**Estimate:** ~1h

---

## CONTEXT

Per ALIGNMENT_QUESTIONS Daniel responses 2026-05-02:
- **Q1 ✅ LOCK V1** — ADR_COMPOSITE_SIGNAL_LAYER_v1: 3/3 threshold + lifecycle 3 cooldown / 2 resolving acceptabile.
- **Q2 ⚠️ AMEND EXT-1** — ADR_PAIN_DISCOMFORT_BUTTON_v1: wording 3 options LOCKED, DAR `doms_severe` HIDE behind "Mai multe opțiuni" expandable (Gigel test — Maria 65 NU înțelege DOMS terminology).
- **Q3 ✅ LOCK V1** — ADR_SMART_ROUTING_EQUIPMENT_v1: tier-aware filtering + similarity ranking 3/2/1 acceptabile.

---

## TASKS

### Task 1.1 — LOCK V1 ADR_COMPOSITE_SIGNAL_LAYER_v1

**File:** `03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md`

Update header status:
- `Status: DRAFT V1` → `Status: LOCKED V1`
- Append `**Locked:** 2026-05-02 per ALIGNMENT_QUESTIONS Q1 Daniel response`

Verify content unchanged (3/3 threshold + lifecycle idle → flagged → cooldown 3 → resolving → idle after 2 clean + Layer D budget ≤50ms).

---

### Task 1.2 — LOCK V1 + AMEND EXT-1 ADR_PAIN_DISCOMFORT_BUTTON_v1

**File:** `03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md`

Update header status:
- `Status: DRAFT V1` → `Status: LOCKED V1 (with EXT-1)`
- Append `**Locked:** 2026-05-02 per ALIGNMENT_QUESTIONS Q2 Daniel response`

Append section **EXT-1 — DOMS Visibility Tier-Aware** la final ADR:

```markdown
## EXT-1 — DOMS Visibility Tier-Aware (LOCKED 2026-05-02)

**Rationale:** Gigel test failed pentru `doms_severe` option visibility default. User cohort cold_start (e.g., Maria 65, non-tech RO) NU înțelege termen tehnic "DOMS" (Delayed Onset Muscle Soreness). Trust breach + cultural friction RO + scope creep medical perceput.

**Decision:**
- 2 options PRIMARY visible default: "Mișcarea mă deranjează" + "Simt o tensiune ciudată"
- 1 option SECONDARY behind expand "Mai multe opțiuni": "DOMS sever" (renamed în UI: "Durere musculară severă post-antrenament (DOMS)")
- Expand pattern: chevron down icon, default collapsed, state preserved per session
- Telemetry: track expand_rate per cohort tier (T0/T1/T2+) pentru future analysis

**Implementation guidance pentru Sprint UI Integration:**
- Component `<PainDiscomfortCard>` exposes prop `showAdvancedOptions: boolean` default `false`
- Daniel UX final review pre-Beta launch
```

Verify content unchanged restul (3 PAIN_OPTIONS structure + override CDL flag `user_override_pain_redflag` + ZERO medical claim per F2 SUFLET).

---

### Task 1.3 — LOCK V1 ADR_SMART_ROUTING_EQUIPMENT_v1

**File:** `03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md`

Update header status:
- `Status: DRAFT V1` → `Status: LOCKED V1`
- Append `**Locked:** 2026-05-02 per ALIGNMENT_QUESTIONS Q3 Daniel response`

Verify content unchanged (Tier 1 strict force_demand high + Tier 2/3 muscle_target_primary + similarity 3/2/1 + anti-paternalism skip zero alternatives).

---

### Task 1.4 — Cross-refs HANDOVER_GLOBAL.md §36

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry sub §36 (after EOF Sprint 4.x cluster entry):

```markdown
### §36.62 ADR LOCKS POST ALIGNMENT_QUESTIONS 2026-05-02

3 ADR drafts → LOCKED V1 per Daniel responses ALIGNMENT_QUESTIONS:
- ADR_COMPOSITE_SIGNAL_LAYER_v1 LOCKED (Q1) — 3/3 threshold + lifecycle confirmed
- ADR_PAIN_DISCOMFORT_BUTTON_v1 LOCKED + EXT-1 (Q2) — DOMS hide behind "Mai multe opțiuni" expandable per Gigel test
- ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED (Q3) — tier-aware filtering + similarity 3/2/1 confirmed

**Cumulative LOCKED count:** 56 → 59 (+3 ADR drafts promoted)
```

Update top-of-file `Total LOCKED` counter dacă există: 56 → 59.

---

## VERIFICATION GATE

Pre-commit:
1. `grep -c "Status: LOCKED V1" 03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md` → expect 3 matches (1 per file)
2. `grep -c "EXT-1 — DOMS Visibility Tier-Aware" 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md` → expect 1
3. `grep "§36.62 ADR LOCKS" 06-sessions-log/HANDOVER_GLOBAL.md` → expect 1 match
4. `npm test` → all pass (no test breakage from .md edits)

---

## COMMIT

```
git add 03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-01): LOCK V1 cele 3 ADR drafts + EXT-1 DOMS hide

- ADR_COMPOSITE_SIGNAL_LAYER_v1 LOCKED V1 (Q1 alignment)
- ADR_PAIN_DISCOMFORT_BUTTON_v1 LOCKED V1 + EXT-1 DOMS tier-aware (Q2)
- ADR_SMART_ROUTING_EQUIPMENT_v1 LOCKED V1 (Q3)
- HANDOVER_GLOBAL §36.62 entry + cumulative 56→59"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_01_REPORT.md`:

```markdown
# BATCH_01_ADR_LOCKS — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- 3 ADR-uri promoted DRAFT → LOCKED V1
- EXT-1 DOMS visibility appended ADR_PAIN_DISCOMFORT_BUTTON_v1
- HANDOVER_GLOBAL §36.62 entry

## Verification gate
- [✅/❌] grep LOCKED V1: 3 matches
- [✅/❌] grep EXT-1: 1 match
- [✅/❌] grep §36.62: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista>

## Next batch
BATCH_02_BATCH_PROTOCOL_CODIFICATION
```

Stop. Trigger BATCH_02.
