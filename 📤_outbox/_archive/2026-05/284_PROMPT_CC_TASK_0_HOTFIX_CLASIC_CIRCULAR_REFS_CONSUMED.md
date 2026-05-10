Model: Opus (--dangerously-skip-permissions standard).
Setup: ACASĂ Windows VS Code Desktop + PowerShell, C:\Users\Daniel\Documents\salafull.

CONTEXT:
- Predecessor commits stack v1 cc98b46 + v3 b439530 + v2 dfa3bbd. Cumulative ~707-709 PRESERVED.
- v2 dfa3bbd introduced 5 circular CSS var refs in andura-clasic.html :root lines 47-55 via bulk replace_all hitting :root declarations themselves (slip 3 confirmed Claude scribe + CC v2).
- Per CSS Custom Properties Level 1 §3.4: circular custom properties resolve to guaranteed-invalid value → fallback initial values (background→transparent, color→canvastext, border→currentcolor) → Clasic mockup currently visually broken in browser.
- Tests 2731 PASS preserved (Vitest NU verifică browser CSS resolution — anti-recurrence rule POST_BULK_REPLACE_VERIFICATION V1 proposed).
- Path A hotfix Co-CTO recommended: separate commit fix 5 circular refs literal hex restore, NU bundle scope creep into Task 3, NU revert destructive force-push (origin already pushed).
- Pre-flight LATEST raport HALT precedent (uploaded Daniel acasă chat-current) confirms classification: 5 circular + 2 clean (--ink-3 #6e6862 NEW value + --brick #c8412e Clasic accent excluded from bulk).

SCOPE STRICT:
Surgical hotfix 5 circular var refs in andura-clasic.html :root block lines 47-55:
- 04-architecture/mockups/andura-clasic.html: 5 str_replace literal hex restore.
- Verify --ink-3 #6e6862 + --brick #c8412e preserved unchanged (clean tokens NU target).

PHASE 1 — PRE-FLIGHT GREP (anti-hallucination):
1. Read andura-clasic.html lines 41-60 verbatim → confirm :root block content matches HALT report state:
   --paper: var(--paper);
   --paper-2: var(--paper-2);
   --ink: var(--ink);
   --ink-2: var(--ink-2);
   --ink-3: #6e6862;
   --line: var(--line);
   --brick: #c8412e;
2. Confirm 5 circular self-refs present + 2 clean tokens (ink-3 + brick) preserved.
3. Self-ref detection grep on file:
   `grep -nE '--(paper|paper-2|ink|ink-2|line):[[:space:]]*var\(--' andura-clasic.html`
   → expect exactly 5 matches all in :root block lines 47-55.
4. Mismatch (e.g., 4 sau 6 circular refs OR ink-3/brick drift) → HALT report flag Daniel investigate root cause before fix.

PHASE 2 — LAND (5 surgical str_replace, exact strings):
1. `    --paper: var(--paper);` → `    --paper: #faf7f1;`
2. `    --paper-2: var(--paper-2);` → `    --paper-2: #f3ede1;`
3. `    --ink: var(--ink);` → `    --ink: #1a1815;`
4. `    --ink-2: var(--ink-2);` → `    --ink-2: #3a342d;`
5. `    --line: var(--line);` → `    --line: #e7e0d0;`

(Indent matching exact :root block convention — verify post-Phase-1 read; adjust whitespace dacă file convention diferă.)

PHASE 3 — POST-FIX VERIFICATION (anti-recurrence rule POST_BULK_REPLACE_VERIFICATION V1):
1. Self-ref detection grep post-fix:
   `grep -nE '--(paper|paper-2|ink|ink-2|line):[[:space:]]*var\(--' andura-clasic.html`
   → expect 0 matches (zero circular self-refs remaining).
2. Read post-fix :root block lines 41-60 verbatim → confirm all 7 tokens have literal hex values:
   --paper: #faf7f1; --paper-2: #f3ede1; --ink: #1a1815; --ink-2: #3a342d;
   --ink-3: #6e6862; --line: #e7e0d0; --brick: #c8412e;
3. Run `npm run test:run` → expect 2731 PASS preserved (gate verde — Vitest preserve, browser smoke deferred Daniel separate post-LANDED).

HALT CONDITIONS (fail-stop, report + STOP):
- Phase 1 mismatch (expected 5 circular refs not found OR ink-3/brick drift) → flag Daniel investigate root cause before fix.
- Phase 2 str_replace fails (multiple matches per replacement OR zero matches indicating whitespace mismatch) → adjust per Phase 1 verbatim read; second fail → HALT.
- Phase 3 verification still detects circular refs post-fix → HALT flag potential other circular refs not caught Phase 1.
- Tests regression vs 2731 baseline → HALT (NU should happen, mockup-only changes).

DELIVERABLES:
1. `📤_outbox/LATEST.md` raport format §10.4 PROMPT_CC_HYGIENE.md:
   - Task + model (Opus) + status (LANDED / HALTED)
   - Pre-flight grep results :root block verbatim + circular ref count match (Phase 1)
   - Modifications (file path + 5 line changes diff + commit SHA)
   - Build + Tests (2731 PASS gate preserve)
   - Post-fix verification grep result (0 matches expected) + :root block verbatim post-fix (Phase 3)
   - Commits + push
   - Issues / Halt conditions triggered (none expected dacă verde)
   - Next action: orchestrator continues Task 3 fresh on healthy Clasic foundation

2. Archive precedent `📤_outbox/LATEST.md` (HALT report Tasks 3+4+5 orchestrator from prior CC run) → `📤_outbox/_archive/2026-05/<NN>_THEMES_BATCH_WCAG_PATH_A_HALT_REPORT.md` (next NN sequential cronologic continuous).

3. Backup tag: `pre-hotfix-clasic-circular-refs-v2-2026-05-10-<HHMM>` push origin.

4. Commit message:
   `WCAG v2-hotfix Clasic :root 5 circular var refs literal hex restore (~707-709 LOCKED V1 preserved + Beta blocker partial closure)`

CONSTRAINTS HARD:
- ZERO src changes (mockups-only).
- Tests `npm run test:run` preserved 2731 PASS.
- ZERO touch andura-luxury.html + andura-brain-coach.html + andura-living-body.html (Tasks 3+4+5 separate sequential downstream per orchestrator).
- Vault flow strict: 📥_inbox NEVER write, 📤_outbox/_archive precedent rotation.
- Hotfix isolated single-purpose: NU expand scope to Task 3 architectural --line split work (Task 3 separate).
- Hotfix bulk replace_all FORBIDDEN — surgical str_replace 5× exact strings only (anti-recurrence: original slip cause = bulk replace_all blast radius).
