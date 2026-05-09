Model: Opus (--dangerously-skip-permissions standard).
Setup: ACASĂ Windows VS Code Desktop + PowerShell, C:\Users\Daniel\Documents\salafull.

PREREQUISITE: Tasks 1+2+3 LANDED (commits b439530 + dfa3bbd + <TASK_3_SHA> pushed origin).

CONTEXT:
- Predecessor commits stack v1+v2+v3+v4. Cumulative ~707-709 PRESERVED.
- Brain Coach --ink-4: previous WCAG v1 fix #3a3e48 → #5d6172 PASS SC 1.4.11 non-text 3:1 (3.11:1) but 3 etched mini-labels 9px text fail strict AA SC 1.4.3 4.5:1 due to tonal hierarchy constraint (bumping ink-4 to 4.5:1 collapses ink-3/ink-4 distinction). Per v1 LATEST flagged Daniel decide: per-element override OR token split text vs border.
- Brain Coach --line + --line-2: rgba(255,255,255,0.08) + rgba(255,255,255,0.05) — subtle hairlines on dark bg (--bg #0b0c10). Per WCAG v1 audit table NU explicitly flagged FAIL but NU explicitly verified PASS for interactive contexts. Cross-skin parity audit pending.
- Tests baseline 2731 PASS preserved EXACT.

SCOPE STRICT:
Brain Coach remaining WCAG closure:
- 04-architecture/mockups/andura-brain-coach.html: --ink-4 9px text edge case + --line/--line-2 classification + remediation if interactive

PHASE 1 — PRE-FLIGHT GREP (anti-hallucination):
1. Read --ink-4 9 usages line-by-line, isolate 3 9px etched text occurrences vs 6 border/non-text occurrences.
2. Read --line + --line-2 usages cross-file, classify interactive UI border vs decorative hairline.
3. Output tables: token | line | element class | role | current ratio | required ratio.

PHASE 2 — DESIGN DECISION:
A. --ink-4 9px text 3 occurrences:
   - Option A1 (per-element override): 3 inline `style="color: <hex>"` overrides bumping to ≥4.5:1, value computed manual WCAG luminance vs --bg L=0.0050 (target L ≥ 0.282 = 4.5:1).
   - Option A2 (token split): introduce --ink-4-text (≥4.5:1) + keep --ink-4 (border 3:1), refactor 3 selectors.
   - Co-CTO recommend A1: 3 elements only, less architectural change, NU set precedent token explosion.

B. --line + --line-2 interactive usages (if found Phase 1):
   - Compute solid hex satisfying ≥3:1 vs --bg L=0.0050 (target L ≥ 0.1042) preserving Brain Coach playful cool palette tonal family.
   - Output candidate table: hex | L | ratio | rationale.

PHASE 3 — LAND:
1. Apply chosen Option A (per-element override OR token split) for --ink-4 9px text.
2. If interactive --line/--line-2 found: introduce --line-strong-bc OR refactor existing.
3. Inline comment cu WCAG v5 citation + 4.5:1 ratio post-fix verifiable.
4. Visual integrity check: 3 etched labels visibly more legible + Brain Coach playful character preserved.

HALT CONDITIONS (fail-stop, report + STOP):
- 9px text usage count mismatches expected 3 (e.g., found 5+ or 0) → flag pre-flight discovery.
- Per-element override Option A1 requires hex value > --ink-3 L=0.217 (token would need ink-3-equivalent or lighter, breaking semantic) → flag, switch to Option A2 token split.
- --line/--line-2 interactive usages reveal complex mixed contexts → flag Daniel decide architectural pattern.

DELIVERABLES:
1. `📤_outbox/LATEST.md` raport §10.4 format complete (Task + status + pre-flight tables + design decision + modifications + tests + commit + push + issues + next action).

2. Archive precedent LATEST → `📤_outbox/_archive/2026-05/<NN>_THEMES_BATCH_WCAG_LINE_SPLIT_CROSS_SKIN.md` (next NN sequential).

3. Backup tag: `pre-themes-batch-wcag-bc-ink4-line-2026-05-10-<HHMM>` push origin.

4. Commit message:
   `WCAG v5 BC --ink-4 9px + --line audit closure: <option chosen> (~707-709 LOCKED V1 preserved + Beta blocker closure)`

CONSTRAINTS HARD:
- ZERO src changes (mockups-only).
- Tests `npm run test:run` preserved 2731 PASS.
- ZERO touch andura-luxury.html + andura-clasic.html + andura-living-body.html (Task 5 separate sequential).
- Vault flow strict.
