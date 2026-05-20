# HANDOVER Post-Wave Template — CC Scribe LATEST.md Format

**Purpose:** CC autonomous scribe template post-Wave-LANDED replacement format `📤_outbox/LATEST.md`. Replicate Wave A → B → C → D + iter EXIT. Bugatti consistency cross-Wave.

**Author:** Co-CTO chat 4 ACASĂ 2026-05-20 night.

**Authority:** D031 push-discipline + D041 anti-inflation + Karpathy 4 principii + chat 1 LATEST §0-§9 reference good format.

---

## §0 Status header (mandatory first block)

```markdown
# Wave <X> Iter 1 LANDED — <Brief title>

**Status:** Wave <X> phase LANDED <YYYY-MM-DD evening/morning> ACASĂ/birou. <Next Wave trigger pending OR iter EXIT trigger pending OR Daniel verify pending>.
**Last LANDED:** <N tasks LANDED> + <commits SHA short list> + <PRIMER §5 micro-update line>
**Procedure:** D031 push-discipline + D042 + D043 LOCKED V1 ABSOLUTE — Beta gate ZERO bug-uri dual-source convergence
**Model:** Opus 4.7 EXCLUSIVELY
**Stop trigger UNIC:** Daniel STOP explicit

---
```

**Anti-inflation rule:** NU "95%+ closure" / NU "production-ready" / NU "comprehensive". DOAR concrete signals: task IDs, commits SHA, test deltas, file paths, measurement numbers.

---

## §1 Tasks LANDED (mandatory granular)

```markdown
## §1 Tasks LANDED Wave <X>

### §1.1 Cluster A — <axis name>
- `T<###>` <task title> — `<file path>:§<id>` (Karpathy <SC/SF/TBC/GD>) → commit `<sha7>`
- `T<###>` <task title> — `<file path>:§<id>` (Karpathy <SC/SF/TBC/GD>) → commit `<sha7>`

### §1.2 Cluster B — <axis name>
- `T<###>` ... 
...
```

**Format strict:** every task = 1 line cu task ID + title + file path + section ID + Karpathy attribution + commit SHA. NU paragraf prose, NU summary global.

**Anti-stale-baseline note (D029 lesson):** if `T<###>` was NO-OP skip (Phase 7 LANDED detected via per-task pre-flight HEAD grep `§<id> audit fix`), explicit mark `T<###> — NO-OP skip Phase 7 LANDED detected` + cite verbatim grep result. NU silent skip, NU count as completed.

---

## §2 Tests delta (mandatory measurement)

```markdown
## §2 Tests delta Wave <X>

- **Vitest local:** <baseline N> → <post N> = +<delta>
- **Property invariants fast-check:** all green / NEW added: <list>
- **Golden master engine snapshot:** <unchanged / drift CONFIRMED INTENTIONAL — review per case>
- **Playwright E2E React:** <baseline N> → <post N> = +<delta>
- **Visual regression `toHaveScreenshot()`:** <unchanged / NEW snapshots added: <count>>
```

**Anti-inflation:** count via direct command output (NU CC raport unverified):
```bash
npm run test 2>&1 | grep "Tests"
npm run test:e2e 2>&1 | grep "passed"
```

---

## §3 Commits SHA list (chronological)

```markdown
## §3 Commits Wave <X> (chronological)

1. `<sha7>` <commit message subject line>
2. `<sha7>` <commit message subject line>
...
N. `<sha7>` <commit message subject line>

**Branch state:** ahead origin/main <N> commits, NU pushed (D031 invariant push manual final Wave LANDED).
```

**Atomic commit format mandatory:**
`fix(wave-<X>-<NNN>): <title> (<source>) [<karpathy>]`

Example:
`fix(wave-a-007): Auth.tsx error boundary handle ReactQueryError (audit-§7-C2) [SC]`

---

## §4 Daniel review verbatim section

```markdown
## §4 Daniel review pending — Wave <X> verify gate

**Required reads pre-verify:**
1. This file (`📤_outbox/LATEST.md`)
2. `📥_inbox/iter-1-mass-fix-v2/WAVE_VERIFY_CHECKLIST.md` §1 mandatory checks
3. `gitnexus_impact` output post-Wave run

**Required verify commands (Daniel terminal):**
- `git log --oneline <range>` — verify commits SHA match §3 list
- `npm run test` — verify §2 delta matches
- `npm run build` — bundle size sanity check
- `npx gitnexus@latest analyze` — gitnexus_impact + detect_changes match declared scope

**Verdict required:** GREEN gate (trigger next Wave) / YELLOW gate (carry-forward fix iter EXIT) / RED gate (HALT + revert).
```

**NU narrative aici** — DOAR explicit commands Daniel + verdict slots. Co-CTO chat post-verify scribe scribe verify report separat în `📥_inbox/WAVE_<X>_VERIFY_<date>.md`.

---

## §5 Next Wave trigger (or iter EXIT trigger)

```markdown
## §5 Next P1 — Wave <Y> trigger OR iter EXIT trigger

**Option A — Wave <Y> sequential:**
- Open NEW CC session ACASĂ post `git pull`
- Paste content `📥_inbox/iter-1-mass-fix-v2/PROMPT_CC_iter1_wave_<Y>_*.md` → CC autonomous Wave <Y> ~Xh Opus continuous

**Option B — Wave <Y> + <Z> parallel (per `_DAG.md §2` analysis):**
- 2 CC sessions concurrent ACASĂ (terminal 1 + terminal 2 SAU `claude rc` birou)
- Daniel monitor + check-in every ~4h

**Option C — iter EXIT audit trigger (post Wave D LANDED only):**
- Paste content `PROMPT_CC_iter1_exit_audit.md` → CC autonomous iter EXIT audit V4 + parity V2 re-run + Track 7 aggregate scan

**Cluster E parallel (any time):**
- Daniel sessions ~30min each, ~5-6h total
- Template `CLUSTER_E_PARADIGM_TEMPLATE.md`
```

---

## §6 Issues / Anti-recurrence flags

```markdown
## §6 Issues encountered Wave <X>

- `<issue title>` — `<file path>:§<id>` — <severity HIGH/MED/LOW> — <fix proposed / deferred iter EXIT / carry-forward iter 2>
- ...

**Anti-recurrence invariants reaffirmed:**
- D008 primary-source verify ✅ — read files line cited verbatim per task pre-flight
- D023 MCP filesystem write_file ✅ — Windows emoji paths preserved
- D029 stale-baseline lesson ✅ — per-task HEAD grep mandatory <N NO-OP skips detected>
- D031 push-discipline ✅ — manual final post-Wave-LANDED, NU per-task push
- D041 anti-inflation ✅ — concrete signals only în report
- D-LEGACY-064 Romanian no-diacritics ✅ — UI surfaces touched verified
- Karpathy 4 principii ✅ — explicit attribution per commit
```

---

## §7 Production readiness honest D041

```markdown
## §7 Production readiness honest D041 post-Wave-<X>

- **Audit Nuclear:** baseline 56.5% @ `b705c3f` → post Wave <X> projection ~+<X>% (NOT measured)
- **Mockup Parity:** baseline ~36% @ `caaae99` → post Wave <X> projection ~+<X>% (NOT measured)
- **Real measurement TBD:** iter EXIT V4 audit re-run + parity V2 re-run (post Wave D LANDED only)
- **Co-CTO chat next:** read this file `§0-§6` instant onboard fluent
```

---

## §8 Skills used (transparency Karpathy CLAUDE.md)

```markdown
## §8 Skills used Wave <X>

- ✅ Sequential Thinking — <use case>
- ✅ Context7 — <library docs consulted>
- ✅ GitNexus pre-execution per task — gitnexus_impact + detect_changes
- ✅ Karpathy 4 principii — per-task attribution
- ✅ Anti-halucinare D008 — primary-source verify per task
- ✅ Impeccable /critique — Wave LANDED self-review pre-scribe
- 🔲 Other skills NOT used — explicit reason
```

---

## §9 Files reference

```markdown
## §9 Files reference

- `ORCHESTRATOR.md` — Wave <X> declared scope
- `PROMPT_CC_iter1_wave_<X>_*.md` — Wave <X> mega-prompt source
- `_MASTER_BACKLOG.md` — atomic task list SoT post-Wave-<X> status update
- `WAVE_VERIFY_CHECKLIST.md` — verify gate protocol next step
- `HANDOVER_POST_WAVE_TEMPLATE.md` — this template source
- `ANDURA_PRIMER.md` §5 — micro-update appended <line N>
- `DECISIONS.md` — NEW entry <D###> if paradigm shift (else NU touched)
```

---

🦫 **HANDOVER_POST_WAVE_TEMPLATE.md = CC scribe `📤_outbox/LATEST.md` post-Wave-LANDED format. §0-§9 mandatory sections. Anti-inflation D041 + anti-stale-baseline D029 + Karpathy attribution per task. Replicate Wave A → B → C → D + iter EXIT.**
