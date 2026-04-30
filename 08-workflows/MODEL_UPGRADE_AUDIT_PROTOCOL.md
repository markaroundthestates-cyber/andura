# MODEL UPGRADE AUDIT PROTOCOL

**Created:** 25 Apr 2026
**Owner:** Daniel
**Status:** ACTIVE — mandatory at every triggering event
**Related:** [[FORWARD_COMPAT_PRINCIPLES]] | [[OPUS_NUCLEAR_AUDIT_25APR]] (template reference)

---

## PURPOSE

Each time a superior AI model becomes generally available, the entire SalaFull codebase, architecture, and decision log must be re-audited adversarially. This is non-negotiable.

The goal is to prevent SalaFull from becoming a fossil — code written by an older LLM under pressure, frozen in time. New models bring better reasoning, better pattern detection, better security analysis. Without periodic audit, advantages of model improvements are lost.

---

## TRIGGERING EVENTS

This protocol activates automatically at any of:

1. **Anthropic releases new flagship model** (Opus 5.x, or successor naming)
2. **Anthropic releases new mid-tier model with step-change improvement** (Sonnet 5.x or successor with documented coding gains)
3. **Mythos-class model becomes generally available** (currently Project Glasswing only)
4. **Anthropic announces "step-change improvement in agentic coding"** (own marketing language used as trigger)
5. **Competitor model claims state-of-the-art on SWE-bench, USAMO, or equivalent benchmarks** by margin > 10 percentage points over current Anthropic flagship

In any of these cases, current sprint pauses. Audit takes priority.

---

## AUDIT EXECUTION

### Step 1 — Pause Current Work

- All active sprints pause
- Active queues (EXEC_QUEUE) frozen
- Sonnet/Code halted on multi-day tasks until audit triggers reprioritization
- New tasks not added until audit complete

### Step 2 — Auditor Selection

The new model performs the audit, NOT the old one. This is critical — old model auditing its own work is conflict of interest.

If new model is not yet available to Daniel (e.g., Mythos-class restricted), wait until accessible. Do not proceed with old model "to save time".

### Step 3 — Adversarial Framing

The auditor model receives instructions framed as:

> "This codebase was written by an older, less capable LLM under time pressure and incomplete information. It claims to be production-ready. Your job is to find the betrayals — places where the old model:
> - Made shortcuts and called them solutions
> - Documented decisions superficially without exploring alternatives
> - Used pattern-matching from training data instead of context-specific reasoning
> - Skipped edge cases that any senior engineer would have caught
> - Trusted its own output without verification
> Be ruthless. Don't be polite. Find what's broken even if commits say 'FIXED'."

### Step 4 — Multi-Pass Audit Scope

Minimum 5 passes, each with distinct lens:

**Pass 1 — Security**
- Auth gaps, session handling, token leaks
- Firebase rules, API key exposure, XSS vectors
- Privacy compliance (GDPR/CCPA breach surface)
- Dependency vulnerabilities (npm audit + Snyk)

**Pass 2 — Scale & Performance**
- N+1 queries, sync loops, cache cascade bugs
- Memory leaks, listener leaks, timer leaks
- Edge cases at 100x current data (1000 users, 10k logs/user, 100 sessions/user/year)

**Pass 3 — Edge Cases**
- Empty states, null/undefined handling
- Concurrent operations, race conditions
- Network failures, partial writes, retry logic
- Date boundaries (year-end, leap years, DST)

**Pass 4 — Dependencies & Architecture**
- Module coupling, circular dependencies
- Dead code, unused exports, stale comments
- Outdated patterns vs current best practices
- Forward compatibility (vezi FORWARD_COMPAT_PRINCIPLES)

**Pass 5 — Adversarial Final**
- Claude Code competitor analysis: "If a hostile fork attempted to copy SalaFull, what's their fastest path?"
- Trust signals: "Does this code look like it would impress a senior staff engineer at Anthropic?"
- Hidden assumptions documented in DECISION_LOG vs reality on disk

### Step 5 — Output Format

Audit produces a single document at `02-audit/AUDIT_<MODEL_NAME>_<DATE>.md` with mandatory sections:

1. **Executive Summary** — 1 paragraph, brutal honest
2. **VERDICT** — binary (PASS/FAIL/CONDITIONAL) with justification
3. **Top 5 Absolute Blockers** — must-fix before anything else
4. **False/Half DONE List** — items previously marked complete that fail re-audit
5. **NEW Problems Found** — anti-rediscovery target ≥3 (if fewer, audit shallow)
6. **Architecture Decisions Re-evaluated** — per ADR, status PRESERVED / DEPRECATED / REVISED
7. **Forward-Compatibility Score** — how well code can evolve to next model
8. **Task List Pre-queued** — concrete tasks for next sprint, ready for EXEC_QUEUE
9. **Tier Reorganization** — 5 tiers (Tier 0 immediate, Tier 1-5 weeks/quarters)
10. **Confidence + Methodology** — auditor's confidence in own findings, methodology used

Length expected: 1500-3000 lines. Shorter than 1000 lines suggests shallow audit.

### Step 6 — Daniel Review

Daniel personally reads:
- Executive Summary
- VERDICT
- Top 5 Blockers
- False/Half DONE
- New Problems

Then validates or rejects task list. Validated items go into EXEC_QUEUE. Rejected items get reasoning recorded in DECISION_LOG.

### Step 7 — Sprint Reprioritization

EXEC_QUEUE rebuilt from audit output. Old pending tasks evaluated against new findings:
- Still relevant → keep priority
- Superseded by new finding → mark obsolete
- Lower priority than new findings → demote

### Step 8 — Post-Audit Documentation

In DECISION_LOG, append entry:

```markdown
## YYYY-MM-DD — Model Upgrade Audit (<MODEL_NAME>)

**Trigger:** [which event triggered]
**Auditor:** [model name + version]
**Verdict:** [PASS/FAIL/CONDITIONAL]
**Top blockers:** [count + brief]
**New problems found:** [count]
**Tasks queued:** [count]
**Reference:** AUDIT_<MODEL>_<DATE>
```

In INDEX_MASTER, add link to audit doc under Audits section.

---

## ANTI-PATTERNS (REJECT ANY OF THESE)

1. **"This audit found nothing significant"** — improbable. If true, audit was shallow. Re-do with stronger adversarial framing.

2. **"The old code looks defensible"** — old code always looks defensible to old reasoning. New model must challenge from new vantage point.

3. **"We can skip this audit, model improvements are minor"** — if Anthropic ships a flagship release, improvements are not minor. Skipping = falling behind.

4. **"Run the new model on our existing audit prompt"** — old prompt was calibrated for old model capabilities. New model deserves new prompt that exploits its expanded capability.

5. **"Pause is too expensive, we ship features"** — every model upgrade not audited compounds technical debt. Three skipped audits = unauditable codebase.

---

## RECONCILIATION WITH FORWARD_COMPAT_PRINCIPLES

This protocol assumes [[FORWARD_COMPAT_PRINCIPLES]] are followed during regular development. If forward-compat principles are broken (vendor lock-in, undocumented decisions, modules tightly coupled to specific model behavior), audit becomes much harder and remediation more expensive.

The two documents are paired:
- **Forward-compat principles** = how to write code that survives model upgrades cheaply
- **This audit protocol** = what to do when new model arrives

Skipping forward-compat = paying interest on every audit. Following both = compounding leverage.

---

## ESCAPE VALVES (Daniel's prerogative)

Daniel can defer audit at most 30 days from trigger event for:
- Pre-launch crunch (last 4 weeks before public release)
- Critical bug-fix sprint already in progress
- Personal/family emergency

Cannot defer indefinitely. After 30 days, audit becomes mandatory regardless of context.

---

## PRIOR EXECUTIONS

| Date | Trigger | Auditor | Verdict | Reference |
|------|---------|---------|---------|-----------|
| 25 Apr 2026 | Manual (pre-launch hardening) | Opus 4.7 | FAIL | [[OPUS_NUCLEAR_AUDIT_25APR]] |
| (future) | Opus 5 release (TBD) | Opus 5 | (TBD) | (TBD) |

---

## CHANGELOG

- **25 Apr 2026:** Document created. Established as mandatory protocol. First execution (Opus 4.7 self-audit) precedes this protocol but serves as template structure.
