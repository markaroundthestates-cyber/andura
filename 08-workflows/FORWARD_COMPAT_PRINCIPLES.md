# FORWARD COMPATIBILITY PRINCIPLES

**Created:** 25 Apr 2026
**Owner:** Daniel
**Status:** ACTIVE — applies to all code, all decisions, all documentation
**Related:** [[MODEL_UPGRADE_AUDIT_PROTOCOL]] | [[ENGINE_ARCHITECTURE]] | [[010-no-anthropic-trademark-public]]

---

## CORE INTENT

Andura is being built over a 2-3 year horizon. During that time, AI models will improve dramatically. Code, architecture, and documentation must be written today such that future models (Opus 5+, Mythos-class, or successors) can audit, refactor, and extend without rewriting from zero.

This is not optional. Forward compatibility is the difference between Andura being a leveraged asset versus a frozen artifact.

---

## PRINCIPLE 1 — DECISIONS DOCUMENT WHY, NOT JUST WHAT

Every architectural choice gets an ADR. The ADR explains:

- **Context** — what problem existed
- **Decision** — what was chosen
- **Alternatives considered** — at least 2-3 other options evaluated
- **Trade-offs accepted** — what was sacrificed
- **Reconsideration triggers** — what conditions warrant revisiting

A future model reading the ADR can re-evaluate with new context. Without alternatives + trade-offs documented, the future model has to guess why something was chosen, and may make worse decisions trying to "fix" something that was correctly chosen for reasons not captured.

**Anti-pattern:** ADRs that just describe the chosen solution. Future model has no way to know if the choice was deliberate or convenience.

---

## PRINCIPLE 2 — MODULAR ARCHITECTURE, CLEAR INTERFACES

Engines, components, and modules expose well-defined interfaces. Internal implementation can change without breaking consumers.

In Andura terms:
- `coachDirector` orchestrates, doesn't know engine internals
- Engines (DP, AA, RuleEngine, etc.) expose `evaluate(ctx)` style methods
- `CoachContext` is the single shared payload — versioned if shape changes
- Reality Engine validates output without knowing how engines produced it

Future model can rewrite a single engine completely without touching others. That's the test.

**Anti-pattern:** engine A directly accesses engine B's private state. Refactor breaks chain reaction.

---

## PRINCIPLE 3 — TESTS AS CONTRACTS

Tests describe expected behavior, not implementation. A test passing should mean "this feature works as users expect", not "this code is structured this way".

Practical guidance:
- Test public API, not private functions
- Test edge cases that matter to users (empty state, max state, error state)
- Test contract between layers (if engine returns X format, consumer accepts X format)
- Avoid testing through 5 layers of mocks (if you need that, your architecture is too coupled)

A future model rewriting a module should keep tests green. If tests fail after refactor, behavior changed (intentional or accident — both must be reviewed).

**Anti-pattern:** tests that mock so much that they pass even if underlying code is deleted.

---

## PRINCIPLE 4 — LANGUAGE-NEUTRAL DOCUMENTATION

All vault docs in English (or simple Romanian where appropriate for Daniel personally). No proprietary jargon. No internal nicknames.

Why: future models trained on broader corpus understand English well. Romanian-only documentation creates a translation tax. Proprietary jargon creates mystery.

**Allowed in vault:**
- English for technical content (preferred)
- Romanian for Daniel-personal docs (DANIEL_COMPLETE_PROFILE, gym sessions notes)
- Mixed RO/EN where natural ("rateSession double-tap guard" is fine)

**Discouraged:**
- Made-up internal codenames without definition
- Heavy abbreviation without glossary
- Local cultural references without context

---

## PRINCIPLE 5 — NO LOCK-IN TO MODEL-SPECIFIC QUIRKS

Code does not depend on:
- Specific Opus 4.7 context window size
- Specific reasoning style of current model
- Specific output format of current model
- Internal Anthropic API quirks that may change

When code touches AI:
- Use abstractions (engine layer, prompt template) so model can be swapped
- Document expected input/output schema explicitly
- Test with varied prompts to ensure robustness, not narrow optimization

**Anti-pattern:** prompt engineered to game current model's specific behavior. New model arrives, prompt fails, scramble to rewrite.

---

## PRINCIPLE 6 — MAGIC NUMBERS & CONFIGS DOCUMENTED

Every numeric threshold, hardcoded date, magic constant in code:
- Has a comment explaining why this number
- Either lives in a config file (preferred) or has comment with reasoning
- Has a "what would I change to test the opposite hypothesis" note when non-obvious

Example:
```javascript
// AA cooldown threshold: 2 sessions consecutive subperform
// Rationale: 1 session may be off-day (sleep, stress); 2 = real signal
// To test opposite: change to 1 (more aggressive) or 3 (more conservative)
const AA_COOLDOWN_THRESHOLD = 2;
```

Future model reading code understands intent. Can adjust intelligently or leave alone with confidence.

**Anti-pattern:** `const X = 2;` with no context. Future model either guesses or wastes time digging through git blame.

---

## PRINCIPLE 7 — SCHEMA EVOLUTION OVER SCHEMA EXPANSION

When data schemas need new fields:
- Add fields with defaults — old data stays valid
- Document schema version in metadata if breaking changes
- Migration scripts are explicit, not implicit
- `logNormalize` style adapters for legacy formats

The "Andura pattern" already does this partially. Make it explicit principle.

**Anti-pattern:** field added in writer, not added in reader. Silent data loss until someone reads old logs.

---

## PRINCIPLE 8 — CRITICAL DEPENDENCIES PINNED, REVIEWED

`package.json` pins exact versions for runtime dependencies. Pinning prevents:
- Surprise breakages from minor version updates
- Supply chain attacks via compromised packages
- Bug introductions from "drift" updates

Quarterly review schedule:
- Run `npm outdated`, evaluate each
- Update with intent (bug fix, security patch, feature need), not "because it's available"
- Test thoroughly post-update

**Anti-pattern:** caret/tilde version specifiers (`^1.2.3`). Builds reproducible only by chance.

---

## PRINCIPLE 9 — VENDOR INDEPENDENCE BY DESIGN

Critical infrastructure components should be swappable:
- Firebase RTDB → if cost or scaling forces migration, REST abstraction layer makes it possible
- Anthropic API → engine reasoning layer can swap to OpenAI / open models if needed (in principle, not as urgent decision)
- Sentry → can swap to alternative observability vendor
- GitHub → could migrate to GitLab, Codeberg, or self-hosted

This doesn't mean abstracting prematurely. It means:
- Don't use vendor-specific features when generic alternatives exist
- Document where vendor-specific dependence is intentional
- Pre-launch audit includes "vendor dependency map"

**Anti-pattern:** Firebase queries throughout codebase, no abstraction. Migration cost = rewrite.

---

## PRINCIPLE 10 — HUMAN-READABLE COMMITS

Commit messages tell a story future model can follow:
- Subject line: imperative, concrete (`feat(brand): rebrand cleanup` not `update`)
- Body: WHY, not just WHAT
- Reference issues, ADRs, decisions where relevant

Why: when future model audits and asks "why was this changed?", git log answers. Without context, model has to reverse-engineer intent from diff.

**Anti-pattern:** `fix bug` / `wip` / `update files` commits. Useless after 6 months.

---

## ENFORCEMENT MECHANISMS

These principles are not wishes. They are enforced:

1. **Pre-commit checks** (Husky hooks) — lint + test pass minimum
2. **PR review** (Daniel + Co-CTO) — adherence to principles checked
3. **Mandatory audit** (vezi MODEL_UPGRADE_AUDIT_PROTOCOL) — non-compliance flagged
4. **Sprint retro** — each FAZA review checks compliance score

If any principle is violated and not justified, that's tech debt. Tech debt > 5% of LOC = refactor sprint priority.

---

## COMPLIANCE EXCEPTIONS

Some principles can be violated when:
- Pre-launch crunch with explicit time pressure (documented decision, not silent)
- Experimental code in `/spike` folder (not production)
- Third-party integration where alternative doesn't exist

Each exception goes in DECISION_LOG with rationale. Future audit decides if exception still justified or if debt should be paid.

---

## RELATIONSHIP WITH OTHER DOCS

- [[MODEL_UPGRADE_AUDIT_PROTOCOL]] — this principles doc says HOW to write code that survives audit. The protocol doc says WHAT to do when audit triggers.
- [[ENGINE_ARCHITECTURE]] — concrete implementation following these principles
- [[010-no-anthropic-trademark-public]] — vendor independence in branding (extends Principle 9)
- [[DECISION_LOG]] — each ADR follows Principle 1

---

## CHANGELOG

- **25 Apr 2026:** Document created. 10 principles established. Active immediately.
