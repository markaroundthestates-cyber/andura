---
title: PROMPT_CC — Phase 7 Findings FIX Continuous Neîntrerupt V2
type: prompt-cc
status: ACTIVE
created: 2026-05-19
authority: Daniel CEO directive chat ACASĂ 2026-05-19 verbatim — "mi se rupe... trebuie sa le facem pe toate... pe mine nu ma intereseaza ordinea. Momentan avem o aplicatie cu 56.5%"
procedure: D031 candidate — Phase 7 Findings FIX (NU audit rerun, mirror D029 reverse log-only → fix continuous neîntrerupt)
model: Opus EXCLUSIVELY = anti-fallback policy NEVER downgrade Sonnet mid-run
stop_trigger: Daniel STOP explicit ONLY
source_spec: 📤_outbox/audit-nuclear-2026-05-19/findings-§01.md → findings-§50.md + SUMMARY.md + _pass-2-secondary.md → _pass-5-quinary.md
---

# PROMPT_CC — Phase 7 Findings FIX Continuous Neîntrerupt V2

**Date:** 2026-05-19 (V2 — 3 ajustări CC push-back accepted + §12 file updates explicit)
**Authority:** Daniel directive chat ACASĂ 2026-05-19 verbatim — "mi se rupe... trebuie sa le facem pe toate... pe mine nu ma intereseaza ordinea. Momentan avem o aplicatie cu 56.5%"
**Procedure:** D031 candidate — Phase 7 Findings FIX (NU audit rerun, mirror D029 reverse log-only → fix continuous neîntrerupt)
**Model:** Opus EXCLUSIVELY = anti-fallback policy NEVER downgrade Sonnet mid-run (NU cost decision). CC current = Opus 4.7 ✓ confirmat.
**Stop trigger UNIC:** Daniel STOP explicit (auto-loop seamless neîntrerupt până atunci)
**Source spec:** `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md` → `findings-§50.md` + `SUMMARY.md` + `_pass-2-secondary.md` → `_pass-5-quinary.md` (ALL existente, generate D029 5-pass audit)

## §0 Context (NU audit rerun)

Audit Nuclear FULL V3 LANDED 2026-05-19 per `DECISIONS.md §D029` = 5 passes COMPLETE log-only Opus MAX. Findings files existente pe disk `📤_outbox/audit-nuclear-2026-05-19/`.

Phase 7 = FIX action per findings spec existente, NU re-audit. Pentru fiecare § (§01-§50) cite findings file complete + apply surgical fixes per Karpathy + atomic commit per § + checkpoint LATEST.md.

Aggregate findings: 698 — 73 CRITICAL + 167 HIGH + 234 MED + 178 LOW + 46 NIT. Production readiness 56.5%. Beta BLOCKED.

HEAD start: `b705c3f` (post `deploy-react-production-2026-05-19`, post Phase 6 BATCH 24-task LANDED, 4522 PASS).
Branch active: `feature/v3-react-clasic`.

Daniel CEO Bugatti directive: "FULL AUDIT. Fiecare linie de cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care" (`ANDURA_PRIMER.md §4`). Phase 7 = action companion D029 audit log.

## §1 Procedure Continuous Neîntrerupt

LOOP până Daniel STOP:

1. Read next § finding file (start `findings-§01.md`, increment sequential)
2. Per finding în § (severity ordered CRITICAL → HIGH → MED → LOW negative → NIT):
   * Sequential Thinking: root cause + minimal fix scope per Karpathy 4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven)
   * Apply fix surgical — DOAR liniile care rezolvă finding direct. ZERO drive-by refactor. ZERO improve-adjacent. Match existing style.
   * Pre-commit hook GREEN mandatory (ZERO `--no-verify` bypass)
   * Tests preserved (4522 baseline) + extended where finding spec require
3. Verify per §: re-run `npm run test` baseline pass + grep finding artifact eliminated + Impeccable `/critique` self-review pre-commit
4. Atomic commit per § Bugatti single-concern: `fix(audit-§NN): <category short> - <fix summary ≤80 char>`
5. NO push origin per § (anti-recurrence `f40ebbc` Stop hook auto-push DEZACTIVAT preserved). Commits local + tags local. Push manual milestone DOAR la §50 final SAU Daniel explicit trigger între §.
6. Append checkpoint `📤_outbox/LATEST.md` format §7
7. Continue loop §NN+1 IMMEDIATELY zero pause, zero "ready?", zero "continue?", zero confirm

Stop trigger UNIC = Daniel STOP explicit. Otherwise NEVER pause.

## §2 Severity Strategy Cumulative Per §

* CRITICAL (73) = MANDATORY fix all (Beta blocker)
* HIGH (167) = MANDATORY fix all (pre-Beta polish strict)
* MED (234) = MANDATORY fix all (Bugatti Quality > Speed)
* LOW positive arhitectural baseline = verify keep no action (e.g. NO_DIACRITICS clean, anti-paternalism preserved, F13 absent, 4-tab nav, Suflet voice, ADR 030 D1-D5 pipeline)
* LOW negative = fix all (small drift cumulative)
* NIT (46) = fix if cheap (≤5 LOC change), else defer Track 6 post-Beta polish

ZERO partial commit. Toate severitățile lui § rezolvate într-un atomic commit. NU split severitate cross-commit.

## §3 Skills MANDATORY Per Task

* Karpathy 4 principii (`07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4) — pre-task tactical filter universal
* Sequential Thinking — root cause analysis pre-fix
* Context7 — library/framework reference latest patterns (React 19, Vite, Firebase, Sentry, Tailwind, Zustand)
* Tavily SAU fallback WebSearch dacă Tavily local install missing — external best practice verification când fix-strategy ambiguous
* Impeccable `/critique` — post-fix self-review pre-commit Bugatti gate
* gstack `/qa` + `/review` — pre-commit verification suite
* GitNexus — `npx gitnexus@latest analyze` per § milestone V4 impact/Cypher/rename/detect

## §4 Skip § Strategy

Dacă § finding file zice "ALL POSITIVE arhitectural baseline, no fix needed" → append `LATEST.md` checkpoint `§NN VERIFIED no-fix LOW positive baseline` + skip imediat §NN+1. Atomic commit OMIS. ZERO churn.

Mix positive + negative → fix doar findings negative + atomic commit + mention positive baseline preserved.

## §5 Commit + Branch + Tag Convention

* Branch active: `feature/v3-react-clasic` (continue HEAD `b705c3f`)
* Backup tag pre-Phase 7: `pre-phase-7-findings-fix-2026-05-19` (CC creates PRE-first commit, mandatory rollback safety) — local + push origin single la start (excepție de la "no push per §")
* Per § milestone: commit + local tag `phase-7-§NN-landed-YYYY-MM-DD` (optional, dacă semnal util progres)
* Cumulative milestone post §50 LANDED: tag `phase-7-findings-fix-landed-YYYY-MM-DD` + push origin manual final (commits + tags toate la o dată)
* Between § Daniel trigger explicit push: OK dacă Daniel zice "push acum" intermediate

Anti-recurrence `f40ebbc`: Stop hook auto-push DEZACTIVAT preserved permanent. Push origin = act conștient Daniel-triggered NU automation.

## §6 Tests Baseline + Regression Discipline

Start: 4522 PASS local vitest jsdom. Per § fix:

* ZERO regression tolerate — test red post-fix = revert + re-think + Sequential Thinking + WebSearch fallback
* Finding spec requires new test (e.g. §4-C1 Sentry init, §28-C3 GDPR erasure) → add minimal coverage TDD red→green
* Final post §50 LANDED: re-run full suite + Playwright E2E smoke cap-coadă + cumulative delta în `LATEST.md` §"Final"

Track 5 D019 backlog E2E disclaimer dismiss helper: dacă finding match Track 5 scope (LOCK 4 Medical Disclaimer pre-test setup) → fix inclusi natural în Phase 7.

## §7 Output Format `📤_outbox/LATEST.md` Per § (Accumulator)

```markdown
# Phase 7 Findings FIX Continuous — Running Checkpoint Log

**Status:** IN PROGRESS § NN / 50 LANDED
**Started:** YYYY-MM-DD HH:MM (HEAD `b705c3f` baseline tag `pre-phase-7-findings-fix-2026-05-19`)
**Stop trigger UNIC:** Daniel STOP explicit
**Push status:** Commits local only, push origin manual final §50 SAU Daniel trigger explicit

## § 01 LANDED (YYYY-MM-DD HH:MM)
- Commit (local): `<sha>` `fix(audit-§01): <short>`
- Severities fixed: C=4 H=8 M=3 L=2 N=1
- Tests delta: 4522 → 4527 (+5 / -0)
- Files modified: 7 (paths listed)
- Karpathy dominant: Goal-Driven / Surgical / etc.
- Next: § 02 starting now

## § 02 LANDED (YYYY-MM-DD HH:MM)
- (same format)

...

## Cumulative status (refresh per §)
- § LANDED: NN / 50
- Total commits local: NN (zero pushed yet OR pushed at Daniel trigger §NN)
- Cumulative tests delta: 4522 → NNNN
- Cumulative findings cleared: NNN / 698
- Cumulative time elapsed: NN h
- Production readiness % estimate: NN%
- Remaining § ETA: NN h
```

Daniel ping `latest` anytime → vede status real-time cumulative.

## §8 Stop Trigger UNIC + Anomalii

Daniel STOP explicit only. Auto-loop seamless neîntrerupt. NEVER ask "continue?". NEVER pause "ready?". NEVER surface ordering questions.

Anomalii hard:

* Test red persistă post 3 fix-attempts Sequential Thinking + WebSearch fallback → log `📤_outbox/_blockers/§NN_<short>_<timestamp>.md` + skip § + continue §NN+1 + flag final LATEST.md §"Blockers"
* Pre-commit hook fail persistă → same blocker pattern
* Disk full / external API down → 5min retry then blocker log

## §9 Per-§ Tactical Hints (non-exhaustive, Sequential Thinking decides)

Findings au severity + dovezi. Tactical fix decide CC autonomous via Karpathy filter:

* §4 Security: Sentry init `main.tsx` + env var `SENTRY_DSN` + sourcemap upload `deploy.yml` + CSP strict + `X-Frame-Options: DENY` + HSTS + `Referrer-Policy` + `Permissions-Policy` + `X-Content-Type-Options: nosniff` + Firebase API key env var real (NU `'PLACEHOLDER_WEB_API_KEY'`)
* §7 UX Auth chain: real Magic Link wire (remove mock login Phase 5 dev bypass) + ProtectedRoute real Firebase `onAuthStateChanged` listener
* §5 Performance: route-based code splitting `React.lazy()` per tab + bundle target ≤100 KB main + tree-shake Firebase modular SDK
* §1+§10+§15+§16 index.html: rewrite (title proper + manifest link + theme-color + icon meta + viewport-fit=cover + color-scheme light/dark)
* §33 CI/CD: `deploy.yml` test gate (vitest + Playwright pre-deploy + abort on red)
* §28 GDPR: SettingsTerms.tsx content verify + erasure full wipe (Firestore + IndexedDB + localStorage + Tier 0/1/2 + Auth delete) + portability export all tiers
* §38 Engine Math: Big 6 bounds align spec (age 13-95 NU 14-99) + Brzycki 1RM rounding precision
* §39 Library 657: count re-verify post any exercise change
* §43 Trust&Safety: PainButton sound verify + cognitive load reduce
* §44 Mode FSM: state transitions exhaustive

CC autonomous decide tactical fix-spec din finding evidence + Karpathy + Sequential Thinking.

## §10 Final Post §50 LANDED

1. Re-run full suite: `npm run test` + `npm run test:e2e` Playwright cap-coadă
2. GitNexus analyze final pass
3. Bundle size verify ≤100 KB main + Lighthouse CI score
4. Append `LATEST.md` §"Final": cumulative metrics + production readiness % post-fix estimate
5. Push origin FINAL — toate commits + tag `phase-7-findings-fix-landed-YYYY-MM-DD` la o dată single conscious act Daniel-aware
6. Wait Daniel STOP explicit before declaring DONE. CC continuă log-only review pass dacă Daniel idle.

## §11 Anti-Hallucination Discipline

* Karpathy Think Before Coding: înainte fix orice § → re-read finding file complete + grep target file complete (NU recall memorie)
* ZERO "presupun fix-ul X" — verifică source code direct via Read tool primary
* `DECISIONS.md §D008`: pre-action vault primary-source verification MANDATORY
* `DECISIONS.md §D023`: filesystem write via `write_file` only + verify list_directory post-write Windows emoji paths
* Ambiguous fix-strategy 2+ options → Sequential Thinking decide + log rationale în commit message body

## §12 First Actions On Start (sesiunea acasă, ÎNAINTE de §01)

Execute în ordine, ATOMIC commits separate:

**A. Vault writes**

1. Write artefact ăsta pe disk: `📥_inbox/PROMPT_CC_phase_7_findings_fix_v2_2026-05-19.md` (content complete din prompt-ul ăsta). Verify `list_directory 📥_inbox/`.
2. Archive V1 deprecated: mută `📥_inbox/PROMPT_CC_phase_7_audit_cleanup_2026-05-19.md` → `📥_inbox/_CONSUMED/PROMPT_CC_phase_7_audit_cleanup_2026-05-19_DEPRECATED_BY_V2.md`. Verify both.
3. Append D031 entry la `DECISIONS.md` în section `## CURRENT DECISIONS` post D030:

```
D031 | 2026-05-19 | PROC | Phase 7 Findings FIX procedure continuous neîntrerupt Opus exclusively per § atomic commit, push manual final §50 SAU Daniel trigger, mirror D029 reverse | LOCKED V1 | DECISIONS.md §D031
```

Update header `latest_entry: D031` + `total_entries: 31`. Append-only discipline preserved.

4. Supersede check per D007 rule: scan CURRENT entries D-NNN keyword overlap ≥50% / source path / category+keyword ≥30% cu D031. Trigger probabil zero (procedure new). Dacă match → mark D-OLD `SUPERSEDED-BY-D031` în same commit.
5. Update `ANDURA_PRIMER.md §6 Backlog`: insert sub Track 5 entry NEW:

```
Track 6 — Phase 7 Findings FIX continuous neîntrerupt (per D031 + D029 audit findings spec):
- ALL 73 CRITICAL + 167 HIGH + 234 MED + LOW negative + NIT cheap fix per finding file
- 50 § sequential §01→§50, atomic commit per §
- Push manual final §50 LANDED (NU per §, preserve f40ebbc)
- Production readiness target: 56.5% → ≥85% post §50
- Stop trigger UNIC Daniel STOP explicit
```

Update header `last_updated: 2026-05-19`.

6. Update `ANDURA_PRIMER.md §5 Current State`: append paragraf NEW post existing 2026-05-19 disaster recovery context:

```
**2026-05-19 evening Phase 7 Findings FIX kickoff (chat ACASĂ via `claude rc` birou Daniel):**
- D031 LOCKED procedure continuous neîntrerupt
- Backup tag `pre-phase-7-findings-fix-2026-05-19` pushed origin
- 56.5% → ≥85% target post §50 LANDED
```

**B. Git ops**

1. Backup tag pre-Phase 7: `git tag pre-phase-7-findings-fix-2026-05-19 HEAD` + `git push origin pre-phase-7-findings-fix-2026-05-19` (single conscious push start safety net). Verify `git tag -l "pre-phase-7-*"`.
2. Verify working tree clean + `git status` empty + sync 100% origin pre-loop start.

**C. Verify environment**

1. `npm run test` baseline confirm 4522 PASS (zero regression intro pre-fix).
2. `grep -r "PLACEHOLDER_WEB_API_KEY" src/` to confirm §4-C2 actually present (dovadă fix needed).
3. `find 📤_outbox/audit-nuclear-2026-05-19/ -name "findings-§*.md" | wc -l` should return 50 (confirm spec source complete).

**D. Start §01 loop**

1. Read `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md` complete + grep target files referenced + Sequential Thinking root cause + apply fixes + atomic commit + checkpoint LATEST.md + continue §02.

---

🦫 D031 candidate Phase 7 Findings FIX procedure V2. Bugatti craft peak. Quality > Speed strict. ALL 698 findings → cleared 100% pre-Beta launch. Mirror D029 reverse log-only → fix continuous neîntrerupt Opus MAX. Push manual final SAU Daniel trigger (NU per §). Stop trigger UNIC Daniel STOP explicit. CC autonomous decide tactical per §.

---

## V2 Deviation Note (CC adaptation 2026-05-19 chat start)

3 prompt assumptions divergent vs reality, adapted with Daniel approval before §01 loop start:

1. **HEAD baseline:** Prompt §0 says `b705c3f`. Actual HEAD = `f40ebbc` (post b705c3f Obsidian Sync delete-race `b1bd099` 700-file mass-delete → restore commits `22942ed`+`786dcbb` → D030 LOCKED → Stop hook auto-push fix). `git diff src/ b705c3f..f40ebbc` = EMPTY, source identical. Backup tag created at `f40ebbc` preserves D030 + anti-recurrence Stop hook fix as safety baseline.
2. **Branch:** Prompt §5 says `feature/v3-react-clasic`. Actual = `main` (production). Feature branch exists local + remote but unused. Loop continues on `main` per Daniel approval.
3. **§12-A.2 V1 archive:** Prompt asks archive `📥_inbox/PROMPT_CC_phase_7_audit_cleanup_2026-05-19.md`. File NOT present (only `PROMPT_CC_audit_nuclear_full_2026-05-19.md` exists, which is audit-trigger NOT V1). §12-A.2 SKIPPED — no V1 to deprecate.

All other §12 + §1-§11 directives executed verbatim. Stop trigger UNIC Daniel STOP explicit preserved.
