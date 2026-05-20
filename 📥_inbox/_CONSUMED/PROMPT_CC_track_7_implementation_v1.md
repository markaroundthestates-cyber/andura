# PROMPT_CC — Track 7 Automated Testing Implementation V1

**Date:** 2026-05-19 (Daniel acasă post-Phase-7-LANDED)
**Authority:** Daniel directive verbatim — *"facem totul automat ca smokeul meu final sa fie clean. Si faci si mockuri de date sa verificam outputul decision engine"*
**Procedure:** D032 candidate — Track 7 Automated Testing mirror D031 (per phase atomic commit + push manual final)
**Source spec:** `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` (pre-moved by Co-CTO MCP cleanup 2026-05-19 evening)
**Model:** Opus EXCLUSIVELY (anti-fallback policy NEVER downgrade)
**Stop trigger UNIC:** Daniel STOP explicit (auto-loop seamless neîntrerupt §7.1→§7.10)

---

## §0 Context

Phase 7 Findings FIX LANDED clean per D031 — 50/50 § + 43 commits + 2 tags pushed origin + ANDURA_PRIMER §5+§6 updated, HEAD `3bae2ec` post-cleanup + `17b0bba chore(auto)` settings unpushed (intenționat Stop-hook D030 anti-recurrence).

Audit-vs-UX gap identificat (75% audit code-side / 20% UX percepție Daniel mobile smoke real — Antrenor bulk/cut lipsă + Istoric gol + Cont aparate greyed + Magic Link fail Firebase API key). **Track 7 = automated testing 3-tier defense să închidă gap → smoke Daniel manual pre-Beta = ZERO surprize.**

Master spec complet la `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` (pre-moved by Co-CTO MCP 2026-05-19 evening din inbox; inbox cleanup done: 4 fișiere consumate archived `_CONSUMED/` HANDOVER_obsidian + PROMPT_CC_handover_ingest_obsidian + PROMPT_CC_audit_nuclear_full Phase 6 D029 + PROMPT_CC_phase_7_findings_fix_v2 D031). **Read master spec cap-coadă §0-§9 PRIMUL ÎNAINTE de orice fix.**

---

## §1 Procedure continuous neîntrerupt

LOOP §7.1 → §7.10 până Daniel STOP:

1. **Read master spec section §8** = implementation order phases definite
2. **Per phase §7.N:**
   - Sequential Thinking: scope + deps + Karpathy 4 (Think Before + Simplicity + Surgical + Goal-Driven)
   - Read master spec §1-§5 section relevant pentru phase (e.g. §1.1 Vitest fixtures, §1.2 Playwright, §1.4 Lighthouse, §3 engine mocks etc.)
   - Apply install + config + tests + integration surgical per master spec verbatim
   - Pre-commit hook GREEN mandatory (ZERO `--no-verify`)
   - Tests baseline preserved 4519 + extended per phase (target ~4719+ post §7.10)
3. **Verify per phase:** `npm run test` baseline + new tests phase pass + Impeccable `/critique` self-review + gstack `/qa` `/review`
4. **Atomic commit per phase Bugatti single-concern:**
   `feat(track-7-§7.N): <phase short> - <summary ≤80 char>`
5. **NO push origin per phase** (preserve D030 anti-recurrence). Manual milestone push DOAR la §7.10 LANDED final SAU Daniel trigger explicit între phases.
6. **Append checkpoint** `📤_outbox/LATEST.md` accumulator format §7 (sub)
7. **Continue §7.N+1 IMMEDIATELY** zero pause zero "ready?" zero confirm

---

## §2 Skills MANDATORY per phase (master spec §6 preserved)

- **Karpathy 4 principii** (`07-meta/karpathy-skills-ref/CLAUDE.md`) — pre-task tactical filter
- **Sequential Thinking** — root cause + minimal scope analysis
- **Context7** — library reference latest (Playwright + Vitest + fast-check + Lighthouse + Checkly + Stagehand + Firebase Admin + @langwatch/scenario + @nearform/playwright-firebase)
- **WebSearch fallback** — best practice 2026 verification (Tavily missing local)
- **Impeccable `/critique`** — post-fix self-review pre-commit Bugatti gate
- **gstack `/qa` + `/review`** — pre-commit verification suite
- **GitNexus** — `npx gitnexus@latest analyze` per phase milestone

---

## §3 Commit + Branch + Tag Convention

- **Branch active:** `main` (continue HEAD `17b0bba` post-Phase-7 + chore-auto)
- **Backup tag pre-Track 7:** `pre-track-7-automated-testing-2026-05-19` (CC creates PRE-first commit, push origin single conscious safety)
- **Per phase commit:** `feat(track-7-§7.N): <short>` Bugatti single-concern atomic
- **Per phase tag optional:** `track-7-§7.N-landed-YYYY-MM-DD` (light, every 2-3 phases OK)
- **Final milestone post §7.10:** tag `track-7-automated-testing-landed-YYYY-MM-DD` + **push origin manual final** (toate commits + tags single Daniel-aware act)

---

## §4 Tests Baseline + Regression Discipline

**Start:** 4519 PASS local Vitest jsdom (Phase 7 LANDED). Per phase:
- ZERO regression tolerate — test red post-fix = revert + Sequential Thinking + WebSearch fallback
- Phase adds new tests per master spec §1-§3 (Vitest fixtures + Playwright E2E + engine fast-check + @langwatch/scenario)
- **Target post §7.10:** ~4719+ PASS (~200 new tests across phases)
- **Final post §7.10:** full suite + Playwright E2E + Lighthouse CI live + Stryker + Checkly + Stagehand smoke

---

## §5 Output Format `📤_outbox/LATEST.md` Per Phase (accumulator pattern)

```markdown
# Track 7 Automated Testing Implementation — Running Checkpoint Log

**Status:** IN PROGRESS § N / 10 LANDED
**Started:** YYYY-MM-DD HH:MM (HEAD `17b0bba` baseline tag `pre-track-7-automated-testing-2026-05-19`)
**Procedure:** D032 LOCKED V1 — Track 7 Automated Testing
**Stop trigger UNIC:** Daniel STOP explicit

## §7.1 LANDED (YYYY-MM-DD HH:MM) — Vitest persona fixtures + engine golden master
- Commit (local): `<sha>` `feat(track-7-§7.1): <short>`
- Tests delta: 4519 → 4612 (+93 / -0)
- New: tests/fixtures/personas.ts + tests/engine/golden-master/ + fast-check invariants
- Karpathy dominant: Goal-Driven / Surgical
- Next: §7.2 starting now

## §7.2 LANDED — Playwright E2E React 4-tab + auth fixture
- (same format)

...

## Cumulative status (refresh per phase)
- § LANDED: N / 10
- Total commits local: N
- Cumulative tests: 4519 → NNNN
- Production readiness % estimate: NN%
- Remaining ETA: ~NN h
```

---

## §6 Stop Trigger UNIC + Anomalii

**Daniel STOP explicit only.** NEVER ask "continue?". NEVER pause "ready?". Auto-loop seamless §7.1→§7.10.

**Anomalii hard:**
- Test red persistă post 3 fix-attempts Sequential + WebSearch → log `📤_outbox/_blockers/§7.N_<short>_<timestamp>.md` + skip phase + continue §7.N+1 + flag final LATEST.md §"Blockers"
- Pre-commit hook fail persistă → same blocker pattern
- npm install failure external dep → 5min retry then blocker log
- Library version conflict → Context7 latest patterns + downgrade if blocker

---

## §7 Per-phase tactical hints (master spec §8 verbatim)

1. **§7.1** Vitest persona fixtures + engine golden master (foundation, NU UI changes)
2. **§7.2** Playwright E2E React 4-tab + `@nearform/playwright-firebase` auth fixture
3. **§7.3** Visual regression Playwright `toHaveScreenshot()` + Lighthouse CI + axe-core a11y
4. **§7.4** Bundle budget (size-limit) + code health (depcheck/madge/jscpd/license-checker/Snyk)
5. **§7.5** @langwatch/scenario coach voice persona scenarios + judge criteria
6. **§7.6** Stryker mutation nightly + deploy.yml augment
7. **§7.7** Checkly synthetic prod every-5min global + Slack alert routing
8. **§7.8** Stagehand exploration nightly (Browserbase) → GitHub Issues queue
9. **§7.9** Vanilla legacy E2E delete (48 obsolete tests cleanup)
10. **§7.10** Production readiness Lighthouse live verify + Daniel manual smoke single comprehensive cap-coadă

---

## §8 Anti-Hallucination Discipline

- Karpathy Think Before Coding: re-read master spec section relevant + grep target files complete pre any fix (NU recall memorie)
- `DECISIONS.md §D008`: vault primary-source verification MANDATORY for product state claims
- `DECISIONS.md §D023`: filesystem `write_file` only Windows emoji paths + verify `list_directory` post-write
- Ambiguous fix-strategy 2+ options → Sequential Thinking decide + log rationale commit message body

---

## §9 First Actions On Start (ÎNAINTE de §7.1)

Execute în ordine atomic:

**A. Vault writes + organize**

1. **Master spec already moved** by Co-CTO MCP 2026-05-19 evening → `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` (verify `list_directory 08-workflows/`). Inbox cleanup done: 4 fișiere consumate archived `_CONSUMED/` (HANDOVER_obsidian + PROMPT_CC_handover_ingest_obsidian + PROMPT_CC_audit_nuclear_full Phase 6 D029 + PROMPT_CC_phase_7_findings_fix_v2 D031). **SKIP move step**, continue direct la step 2.

2. **Append D032 entry** la `DECISIONS.md` post D031:
   ```
   D032 | 2026-05-19 | PROC | Track 7 Automated Testing procedure continuous neîntrerupt Opus exclusively per phase atomic commit, push manual final §7.10 SAU Daniel trigger, mirror D031 = 3-tier defense (Tier 1 in-repo Vitest+Playwright+visual+Lighthouse+fast-check+@langwatch/scenario+Stryker+axe+bundle+health / Tier 2 Checkly synthetic prod / Tier 3 Stagehand exploration nightly monitoring scope per WebTestBench arXiv 2603.25226) + persona-driven engine deterministic verification ADR 030 D1-D5 8/8 adapters | LOCKED V1 | DECISIONS.md §D032 + 08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md
   ```
   Update header `latest_entry: D032` + `total_entries: 32`.

3. **Update `ANDURA_PRIMER.md §6 Backlog`:** Track 7 status `BACKLOG` → `IN PROGRESS § N/10` cu daily refresh per phase milestone.

4. **Update `ANDURA_PRIMER.md §5 Current State`:** append paragraf NEW:
   ```
   **2026-05-19 evening Track 7 Automated Testing kickoff (chat ACASĂ post-Phase-7-LANDED):**
   - D032 LOCKED procedure 3-tier defense + persona-driven engine mocks
   - Backup tag `pre-track-7-automated-testing-2026-05-19` pushed origin
   - Target: smoke Daniel manual pre-Beta clean (audit-vs-UX gap close 75%→≥90%)
   - ETA ~5-8 zile lucrătoare CC autonomous neîntrerupt Opus exclusively
   ```

**B. Git ops**

5. **Cleanup `.gitignore` augment:** add `.obsidian/graph.json` + `.obsidian/workspace.json` + `.obsidian/workspace-mobile.json` (UI state local Obsidian, nu vault content).

6. **Push pending `17b0bba chore(auto)`** la origin single conscious act pre-Track-7 (clean baseline).

7. **Backup tag pre-Track 7:** `git tag pre-track-7-automated-testing-2026-05-19 HEAD` + `git push origin pre-track-7-automated-testing-2026-05-19` (single push safety net start).

8. **Verify working tree clean** + `git status` empty + sync 100% origin pre-loop start.

**C. Verify environment**

9. `npm run test` baseline confirm 4519 PASS (zero regression pre-track-7).

10. `node --version` confirm Node 22.19+ (Lighthouse 12+ require Phase 7 §20-H2 LANDED).

11. `npm outdated` quick scan (info-only, NU upgrade aici).

**D. Start §7.1 loop**

12. Read `08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md` §1.1 Vitest persona fixtures section complete → apply install + config + scrie `tests/fixtures/personas.ts` + `tests/engine/golden-master/` files + fast-check invariants + atomic commit + checkpoint LATEST.md + continue §7.2.

---

🦫 **D032 candidate Track 7 Automated Testing procedure. Bugatti craft peak. Quality > Speed strict. 3-tier defense in-depth + persona-driven engine deterministic verification. Smoke Daniel manual pre-Beta = ZERO surprize. Mirror D031 reverse procedure scope. Stop trigger UNIC Daniel STOP explicit. ~5-8 zile lucrătoare CC autonomous Opus exclusively per phase atomic commit.**
