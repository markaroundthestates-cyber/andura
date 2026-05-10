Model: Opus (--dangerously-skip-permissions standard).
Setup: ACASĂ Windows VS Code Desktop + PowerShell, C:\Users\Daniel\Documents\salafull.

PREREQUISITE: Tasks 1+2+3+4 LANDED (commits b439530 + dfa3bbd + <TASK_3_SHA> + <TASK_4_SHA> pushed origin).

CONTEXT:
- Predecessor commits stack v1+v2+v3+v4+v5. Cumulative ~707-709 PRESERVED.
- Living Body NO `:root` block currently (per WCAG v1 baseline + v2 Path 2a confirmation hardcoded throughout). Hex muted text candidates per v1 LATEST: #8b8470=133× / #b8b0a0=56× / #f0eadb=110× / #d4a574=95× / #03050a=2× phone bg / #07090f=9×.
- LB passes WCAG already (#8b8470 5.43:1 PASS AA + #b8b0a0 9.63:1 PASS AAA per v1 audit). NU strictly required for AA compliance.
- Justification: cross-skin token discipline parity (Luxury + Clasic + Brain Coach all :root vars-based post v1+v2). Bugatti craft + production-ready strict cross-skin uniformity per Daniel directive "facem toate themes".
- Tests baseline 2731 PASS preserved EXACT.

SCOPE STRICT:
Architectural lift Living Body to `:root` CSS vars (parallel Path 2a Clasic pattern):
- 04-architecture/mockups/andura-living-body.html: introduce :root block + replace hardcoded muted hex with tokens + audit additional hex if found
- Visual character preserved (warm dark theme LB earthy organic palette)

PHASE 1 — PRE-FLIGHT GREP (anti-hallucination):
1. Confirm LB NO `:root` block currently (audit verbatim line 1-50 `<style>` start).
2. Enumerate all hex hardcoded candidates: #8b8470, #b8b0a0, #f0eadb, #d4a574, #03050a, #07090f, plus alte hex găsite în file.
3. Output usage table: hex | usage count | typical context (text size + element role) | bg context.
4. Verify counts vs v1 LATEST baseline: #8b8470=133 / #b8b0a0=56 / #f0eadb=110 / #d4a574=95. Mismatch >10% → flag potential file drift.

PHASE 2 — TOKEN DESIGN (Living Body warm dark earthy organic character):
Propose tonal hierarchy `:root` block respecting LB warm dark aesthetic:
- `--bg` / `--bg-2` / `--bg-3` (very dark backgrounds, KEEP existing values)
- `--ink` / `--ink-2` / `--ink-3` (text light→muted on dark bg, KEEP currently passing values)
- `--accent` (warm gold/copper Living Body signature `#d4a574` if applicable)
- `--line` / `--line-2` (borders if hardcoded equivalents exist)
- Other tokens existing in skin per convention

Manual WCAG luminance computation each token vs phone bg `#03050a` (L≈0.0015) — text needs LIGHT for contrast (consistent with Luxury/Brain Coach dark theme polarity).

Output token table: name | hex | role | L computed | ratio vs bg | AA verdict (mostly KEEP since LB passes).

PHASE 3 — LAND:
1. Insert `:root { ... }` block at top `<style>` in andura-living-body.html cu tokens proposed Phase 2.
2. Replace hardcoded hex cu var(--TOK) systematic via str_replace bulk per token (~133 + 56 + 110 + 95 = ~394 replacements).
3. Visual integrity check: before/after parity (eyeballing diff via grep + spot-check samples).
4. Inline comment top `:root` block: WCAG audit batch v6 LB lift citation + token discipline cross-skin parity intent.
5. Fix-back non-CSS contexts (similar Path 2a Clasic pattern): SVG fill attributes + JS style.color literals + Tailwind config palette (if any).

HALT CONDITIONS (fail-stop, report + STOP):
- Token consolidation reveals semantic ambiguity (same hex used for text AND border AND background contexts) → flag Daniel decide architectural split.
- Tonal hierarchy break unavoidable (proposed token violates strict-decreasing L pattern) → flag Daniel decide.
- Bulk replace count mismatches pre-flight expectation by >10% → flag potential hidden context.
- Visual integrity check reveals broken element (e.g. text becomes invisible due to missed bg context) → STOP + revert.
- Pre-flight reveals LB already has partial :root block (file drift since v1 baseline) → flag.

DELIVERABLES:
1. `📤_outbox/LATEST.md` raport §10.4 format complete (Task + status + pre-flight tables + token design + modifications + tests + commit + push + issues + next action).

2. Archive precedent LATEST → `📤_outbox/_archive/2026-05/<NN>_THEMES_BATCH_WCAG_BC_INK4_LINE.md` (next NN sequential).

3. Backup tag: `pre-themes-batch-wcag-lb-root-lift-2026-05-10-<HHMM>` push origin.

4. Commit message:
   `WCAG v6 Path 2b LB :root lift: ~394 hex→tokens systematic cross-skin parity (~707-709 LOCKED V1 preserved)`

CONSTRAINTS HARD:
- ZERO src changes (mockups-only).
- Tests `npm run test:run` preserved 2731 PASS.
- ZERO touch andura-luxury.html + andura-clasic.html + andura-brain-coach.html (parallel safety preserved).
- Vault flow strict.

POST-COMPLETION (FINAL TASK):
After Task 5 LANDED, generate `📤_outbox/LATEST_CONSOLIDATED.md` aggregating all 6 WCAG batches (v1 + v3 + v2 + v4 + v5 + v6) cross-skin parity summary:
- Per-skin closure status table
- Cumulative tokens introduced
- Tests preserved 2731 PASS gate verified
- Backup tags chronologic chat-current
- Mid-flight unresolved (none expected if all clean)
- Daniel smoke validation checklist consolidated 4 themes
