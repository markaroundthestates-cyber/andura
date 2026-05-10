Model: Opus (--dangerously-skip-permissions standard).
Setup: ACASĂ Windows VS Code Desktop + PowerShell, C:\Users\Daniel\Documents\salafull.

PREREQUISITE: Tasks 1+2 LANDED (commits b439530 + dfa3bbd pushed origin).

CONTEXT:
- Predecessor commits cc98b46 (WCAG v1 silver-3 + ink-3 + ink-4) + b439530 (v3 Luxury line-strong rgba→#6e5a2a 3.15:1) + dfa3bbd (v2 Path 2a Clasic :root lift 385 hex→tokens). Cumulative ~707-709 PRESERVED.
- Luxury --line: 27 usages mixed per v3 LATEST classification (14 interactive selectable button row borders + 13 decorative section dividers). Refactor: interactive → var(--line-strong) existing 3.15:1 post v3, decorative keep var(--line) rgba.
- Clasic --line `#e7e0d0`: 49 usages decorative borders 1.23:1 vs --paper. Per v2 Path 2a LATEST DEFERRED pending Daniel decide essential vs decorative split. Now decided: classify + introduce --line-strong in Clasic if interactive usages exist + refactor selectors.
- Tests baseline 2731 PASS preserved EXACT — mockup-only edits, ZERO src changes.

SCOPE STRICT:
Cross-skin --line architectural split classify + refactor 2 themes:
- 04-architecture/mockups/andura-luxury.html: classify 27 --line usages interactive vs decorative, refactor 14 interactive → var(--line-strong) existing
- 04-architecture/mockups/andura-clasic.html: classify 49 --line usages, introduce --line-strong token in :root if interactive, refactor selectors

PHASE 1 — PRE-FLIGHT GREP (anti-hallucination):
1. Read Luxury line-by-line each --line usage → classify per element class + selector context (interactive UI border vs decorative section divider vs hairline).
2. Read Clasic same approach 49 --line usages.
3. Output per-skin classification tables: file | line | element class | role (essential/decorative) | refactor action.
4. Verify totals match v3 LATEST baseline: Luxury 27 + Clasic 49.

PHASE 2 — TOKEN DESIGN (Clasic only — Luxury already has --line-strong solid hex post v3):
If Clasic interactive --line usages found:
- Manual WCAG luminance per candidate hex satisfying ≥3:1 vs --paper #faf7f1 L=0.930 (target token L ≤ 0.293)
- Tonal family: warm cream Clasic clinical character DARKER than current #e7e0d0 (L=0.749) — need significantly darker
- Output candidate table: hex | RGB | L computed | ratio vs --paper | tonal preview rationale.
If NO Clasic interactive --line usages: skip Phase 2 Clasic, document.

PHASE 3 — LAND:
1. Luxury: refactor 14 interactive selectors var(--line) → var(--line-strong). Inline comment cu citation v4 batch + role classification.
2. Clasic: insert new --line-strong token in :root (if needed) + refactor interactive selectors var(--line) → var(--line-strong).
3. Visual integrity check: interactive borders distinguishable from decorative + tonal hierarchy preserved cross-skin.

HALT CONDITIONS (fail-stop, report + STOP):
- Selector ambiguous (single CSS rule serves both interactive + decorative contexts) → flag Daniel decide architectural restructure.
- Classification reveals NU clean split (e.g., >80% mixed contexts) → flag Daniel decide alternative approach (uniform fix all 27/49 to 3:1).
- Cross-skin pattern divergence (Luxury structure ≠ Clasic structure forces different approaches) → flag for review.
- Pre-flight grep usage count mismatches v3 LATEST baseline by >10% → flag (potential file drift).

DELIVERABLES:
1. `📤_outbox/LATEST.md` raport format §10.4 PROMPT_CC_HYGIENE.md:
   - Task + model + status (LANDED / HALTED)
   - Pre-flight classification tables both skins (Luxury 27 + Clasic 49)
   - Phase 2 Clasic --line-strong token table (if introduced)
   - Modifications (files + LOC delta + commit SHA)
   - Build + Tests (2731 PASS gate preserve)
   - Commits + push
   - Issues / Halt conditions triggered
   - Next action

2. Archive precedent `📤_outbox/LATEST.md` → `📤_outbox/_archive/2026-05/<NN>_THEMES_BATCH_WCAG_CLASIC_PATH2A.md` (next NN sequential cronologic).

3. Backup tag: `pre-themes-batch-wcag-line-split-cross-skin-2026-05-10-<HHMM>` push origin.

4. Commit message:
   `WCAG v4 cross-skin --line architectural split: Luxury 14 interactive + Clasic <N> interactive (~707-709 LOCKED V1 preserved + Beta blocker closure)`

CONSTRAINTS HARD:
- ZERO src changes (mockups-only).
- Tests `npm run test:run` preserved 2731 PASS.
- ZERO touch andura-brain-coach.html + andura-living-body.html (Tasks 4 + 5 separate sequential).
- Vault flow strict: 📥_inbox NEVER write, 📤_outbox/_archive precedent rotation.
