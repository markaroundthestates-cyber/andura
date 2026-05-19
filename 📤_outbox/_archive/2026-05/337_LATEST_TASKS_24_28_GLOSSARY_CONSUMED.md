# TASKS 24-28 — Cluster #7 Glossary Jargon LOCK V1 (CLOSURE)

- **Status:** ✅ Tasks 25+26 LANDED + Tasks 24+27+28 audit-only
- **Cluster:** #7 Glossary jargon · Atoms 1-5/5 (CLOSURE)

## Per-task findings + actions

### Task 24 RIR → "Cât mai poți la final" — AUDIT-ONLY
RIR instances cross-skin sunt în compact metric label position (ex: "RIR 2", "@ 80kg · RIR 2-3", "ex-set-val RIR 2"). Daniel's complaint was about user-facing question prompts using RIR terminology — those NU exist în mockups current state. Compact metric labels = technical notation acceptable (similar to "kg", "rep"). NO change applied. **Phase 3 follow-up:** Apply when user-facing prompt UI added.

### Task 25 TONAJ → "Volum total" / DROP — LANDED Luxury 3 instances
Per Daniel "wtf suntem camioane?" — Luxury had Tonaj cumulat / Tonaj țintă / Tonaj sesiune visible în main dashboard + workout list + summary. Replaced cu "Volum cumulat" / "Volum țintă" / "Volum sesiune" + units changed `Tone` → `k reps×kg` (more semantic, less ambiguous physics units).

### Task 26 Pace observată → "Ritm sesiune" — LANDED BC 1 instance
BC line 3220 think-label "Pace observată" → "Ritm sesiune" (Daniel: "daca eu nu inteleg... ce intelege un regular user").

### Task 27 Mărime context-specific — AUDIT-ONLY
Grep cross-skin: "Mărime estimată" (Clasic+LB Cont › Export = file size context concrete) + "Mărime text" (BC Setări = text size accessibility context concrete). Both contextual usage NU ambiguous. Daniel "marimea cui?" complaint was about a different ambiguous context (likely Luxury setting label removed în Task 19+20 BC fix). NO change applied. **Phase 3 follow-up:** Verify post-smoke whether ambiguous "Mărime" survives.

### Task 28 Comportament Familie Luxury — NO-OP
Grep cross-skin: ZERO matches "Comportament Familie". Already removed or never present în current state. Daniel complained "habar nu am ce e" — feature absent în current mockups baseline.

## Tests

✅ 2731 PASS preserved EXACT.

## Cluster #7 Glossary CLOSURE 5/5 ✅

| # | Task | Status | Action |
|---|------|--------|--------|
| 24 | RIR replace | ✅ Audit | Compact metric labels preserved (Phase 3 if prompt UI added) |
| 25 | TONAJ replace | ✅ LANDED | Luxury 3 instances → "Volum" + units `k reps×kg` |
| 26 | Pace replace | ✅ LANDED | BC "Pace observată" → "Ritm sesiune" |
| 27 | Mărime context | ✅ Audit | All instances concrete contextual NU ambiguous (Phase 3 verify post-smoke) |
| 28 | Comportament Familie | ✅ NO-OP | Feature absent în baseline |

## Phase 2 progress (13/22 tasks)

## Next action

**TASK 29** Text liber edge cases polish — maxlength=500 + char counter + empty submission block + multi-line auto-grow + persistence cross-skin.
