# PROMPT_CC — Phase 7 Audit Cleanup Continuous Neîntrerupt V1

**Date:** 2026-05-19
**Authority:** Daniel directive chat ACASĂ 2026-05-19 verbatim — *"mi se rupe... trebuie sa le facem pe toate... pe mine nu ma intereseaza ordinea. Momentan avem o aplicatie cu 56.5%"*
**Procedure:** D031 candidate — Phase 7 Audit Cleanup mirror D029 reverse (audit log-only → fix continuous neîntrerupt)
**Model:** Opus EXCLUSIVELY (Sonnet concediat permanent 2026-05-03)
**Startup:** `claude --dangerously-skip-permissions` (standard, zero reminder)
**Stop trigger UNIC:** Daniel STOP explicit (auto-loop seamless neîntrerupt până atunci)
**Source spec:** `📤_outbox/audit-nuclear-2026-05-19/findings-§01.md` → `findings-§50.md` + `SUMMARY.md` + `_pass-2-secondary.md` → `_pass-5-quinary.md`

---

## §0 Context

Audit Nuclear FULL V3 LANDED 2026-05-19 per `DECISIONS.md §D029` = 5 passes COMPLETE log-only Opus MAX continuous neîntrerupt.

**Aggregate findings:** 698 total — 73 CRITICAL + 167 HIGH + 234 MED + 178 LOW (multe positive arhitectural baseline) + 46 NIT. Production readiness score recalibrat **56.5%** (primary 53.80% + secondary→quinary refinement). Beta status: **BLOCKED** până Wave 1+2+3 fix complete.

**HEAD start:** `b705c3f` (post `deploy-react-production-2026-05-19` tag, post Phase 6 BATCH 24-task LANDED — engine pipeline real wire 8/8 + Cont sub-screens 9/9 + polish pre-Beta 7/7, 4303→4522 PASS).

**Branch active:** `feature/v3-react-clasic` (current Phase 6 BATCH LANDED baseline).

**Daniel CEO directive Bugatti Pre-Beta:** verbatim `ANDURA_PRIMER.md §4` *"FULL AUDIT. Fiecare linie de cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"*. Phase 7 = clean-up actionable companion D029 audit log.

---

## §1 Procedure Continuous Neîntrerupt

LOOP până Daniel STOP:

1. **Read next § finding file** (start `findings-§01.md`, increment sequential)
2. **Per finding în § (severity ordered CRITICAL → HIGH → MED → LOW negative → NIT):**
   - Sequential Thinking skill: root cause + minimal fix scope per Karpathy 4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution)
   - Apply fix surgical — DOAR liniile care rezolvă finding direct. ZERO drive-by refactor. ZERO improve-adjacent. Match existing style.
   - Pre-commit hook GREEN mandatory (ZERO `--no-verify` bypass)
   - Tests preserved (4522 baseline) + extended where finding spec require (e.g. §4-C1 Sentry init = add minimal coverage)
3. **Verify per §:** re-run `npm run test` baseline pass + grep finding artifact eliminated + Impeccable `/critique` skill self-review pre-commit
4. **Atomic commit per § Bugatti single-concern:** `fix(audit-§NN): <category short> - <fix summary ≤80 char>`
5. **Push origin** `feature/v3-react-clasic`
6. **Append checkpoint** `📤_outbox/LATEST.md` format §7 (sub)
7. **Continue loop §NN+1 IMMEDIATELY** zero pause, zero "ready?", zero "continue?", zero confirm

Stop trigger UNIC = Daniel STOP explicit. Otherwise NEVER pause.

---

## §2 Severity Strategy Cumulative Per §

- **CRITICAL (73)** = MANDATORY fix all (Beta blocker)
- **HIGH (167)** = MANDATORY fix all (pre-Beta polish strict)
- **MED (234)** = MANDATORY fix all (Bugatti craft Quality > Speed)
- **LOW positive arhitectural baseline** = verify keep no action (e.g. NO_DIACRITICS clean, anti-paternalism preserved, F13 absent, 4-tab nav, Suflet voice, engine pipeline ADR 030 D1-D5)
- **LOW negative** = fix all (small drift cumulative)
- **NIT (46)** = fix if cheap (≤5 LOC change), else defer Track 6 polish post-Beta

ZERO partial commit. Toate severitățile lui § rezolvate într-un atomic commit. NU split severitate cross-commit.

---

## §3 Skills MANDATORY Per Task

- **Karpathy 4 principii** (`07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4) — pre-task tactical filter universal
- **Sequential Thinking** — root cause analysis pre-fix
- **Context7** — library/framework reference latest patterns (React 19, Vite, Firebase, Sentry, Tailwind, Zustand)
- **Tavily** — external best practice verification dacă fix-strategy ambiguous
- **Impeccable `/critique`** — post-fix self-review pre-commit Bugatti gate
- **gstack `/qa` + `/review`** — pre-commit verification suite
- **GitNexus** — `npx gitnexus@latest analyze` per § milestone V4 impact/Cypher/rename/detect automatic

---

## §4 Skip § Strategy

Dacă § finding file zice "ALL POSITIVE arhitectural baseline strong, no fix needed" → append `LATEST.md` checkpoint format `§NN VERIFIED no-fix LOW positive baseline` + skip imediat §NN+1. Atomic commit OMIS (zero diff). ZERO churn.

Dacă § finding file conține mix positive + negative → fix doar findings negative + atomic commit + checkpoint mention positive baseline preserved.

---

## §5 Commit + Branch + Tag Convention

- **Branch active:** `feature/v3-react-clasic` (continue HEAD `b705c3f` Phase 6 BATCH LANDED)
- **Backup tag pre-Phase 7:** `pre-phase-7-audit-cleanup-2026-05-19` (CC creates **PRE-first commit** mandatory rollback safety)
- **Per § milestone tag:** `phase-7-§NN-landed-YYYY-MM-DD` (small footprint, every 5-10 § OK alternative)
- **Cumulative milestone post §50 LANDED:** tag `phase-7-audit-cleanup-landed-YYYY-MM-DD` + push origin
- **Push origin** every § landed atomic commit (small fast feedback Daniel browser-check live URL `andura.app`)

---

## §6 Tests Baseline + Regression Discipline

**Start:** 4522 PASS local vitest jsdom (Phase 6 BATCH LANDED baseline). Per § fix:
- **ZERO regression tolerate** — any test red post-fix = revert + re-think + ask Sequential Thinking + Tavily fallback
- Where finding spec requires new test (e.g. §4-C1 Sentry init, §28-C3 GDPR erasure verify) → add minimal coverage TDD-style red→green
- **Final post §50 LANDED:** re-run full suite + Playwright E2E smoke verify cap-coadă + report cumulative delta în `LATEST.md` §"Final"

**Track 5 D019 backlog E2E disclaimer dismiss helper:** dacă finding § match Track 5 scope (LOCK 4 Medical Disclaimer pre-test setup) → fix incluse natural în Phase 7.

---

## §7 Output Format `📤_outbox/LATEST.md` Checkpoint Per §

Update LATEST.md cu accumulator pattern (NU overwrite, append per §):

```markdown
# Phase 7 Audit Cleanup Continuous — Running Checkpoint Log

**Status:** IN PROGRESS § NN / 50 LANDED
**Started:** YYYY-MM-DD HH:MM (HEAD `b705c3f` baseline `pre-phase-7-audit-cleanup-2026-05-19`)
**Stop trigger UNIC:** Daniel STOP explicit

---

## § 01 LANDED (YYYY-MM-DD HH:MM)

- Commit: `<sha>` `fix(audit-§01): <short>`
- Severities fixed: C=4 H=8 M=3 L=2 N=1
- Tests delta: 4522 → 4527 (+5 / -0)
- Files modified: 7 (paths listed)
- Karpathy principle dominant: <Goal-Driven / Surgical / etc.>
- Next: § 02 starting now

## § 02 LANDED (YYYY-MM-DD HH:MM)

- (same format)

...

## Cumulative status (refresh per §)

- § LANDED: NN / 50
- Total commits: NN
- Cumulative tests delta: 4522 → NNNN
- Cumulative findings cleared: NNN / 698
- Cumulative time elapsed: NN h
- Production readiness % estimate: NN%
- Remaining § ETA: NN h
```

Daniel poate ping `latest` trigger anytime → vede status real-time cumulative.

---

## §8 Stop Trigger UNIC

**Daniel STOP explicit only.** Auto-loop seamless neîntrerupt §01 → §50 → backup-passes deep-dive opțional dacă production readiness % < threshold Daniel-defined.

**NEVER ask "continue?".** NEVER pause "ready?". NEVER surface ordering questions ("ce § next?"). Per D029 mirror reverse: quality-asymptotic continuous neîntrerupt multi-noapte Opus MAX. Daniel singura authority pause/stop.

**Anomalii hard:**
- Test red persistă post 3 fix-attempts Sequential Thinking + Tavily fallback → log finding `📤_outbox/_blockers/§NN_<short>_<timestamp>.md` + skip § + continue §NN+1 + flag final LATEST.md §"Blockers" Daniel review
- Pre-commit hook fail persistă → same blocker pattern
- Disk full / git push reject / external API down → 5min retry then blocker log

---

## §9 Per-§ Tactical Hints (non-exhaustive, Sequential Thinking decides)

Findings files au severity + dovezi. Tactical fix decide CC autonomous via Karpathy:

- **§4 Security:** Sentry init `main.tsx` + env var `SENTRY_DSN` + sourcemap upload `deploy.yml` + CSP headers (`Content-Security-Policy` strict + `X-Frame-Options: DENY` + `Strict-Transport-Security` HSTS + `Referrer-Policy` + `Permissions-Policy` + `X-Content-Type-Options: nosniff`) + Firebase API key env var real (NU `'PLACEHOLDER_WEB_API_KEY'`)
- **§7 UX Auth chain:** real Magic Link wire (remove mock login Phase 5 dev bypass) + ProtectedRoute real Firebase `onAuthStateChanged` listener (NU Phase 2 stub)
- **§5 Performance:** route-based code splitting `React.lazy()` per tab + bundle analysis target ≤100 KB main + tree-shake Firebase modular SDK
- **§1+§10+§15+§16 index.html:** rewrite complete (title proper + manifest link + theme-color + icon meta + viewport-fit=cover + color-scheme light/dark)
- **§33 CI/CD:** `deploy.yml` test gate (run vitest + Playwright pre-deploy + abort on red)
- **§28 GDPR:** SettingsTerms.tsx content verify + erasure full wipe (Firestore + IndexedDB + localStorage + Tier 0/1/2 + Auth user delete) + portability export include all tiers
- **§38 Engine Math:** Big 6 bounds align spec (age 13-95 not 14-99) + Brzycki 1RM rounding precision verify
- **§39 Library 657:** count audit re-verify post any exercise add/remove
- **§43 Trust&Safety:** PainButton sound verify + cognitive load reduce
- **§44 Mode FSM:** state transitions verify exhaustive

CC autonomous decide tactical fix-spec din finding evidence + Karpathy filter + Sequential Thinking.

---

## §10 Final Post §50 LANDED

1. Re-run full suite: `npm run test` + `npm run test:e2e` (Playwright cap-coadă)
2. GitNexus analyze final pass
3. Bundle size verify ≤100 KB main + Lighthouse CI score check
4. Append `LATEST.md` §"Final": cumulative metrics + production readiness % estimate post-fix
5. Push milestone tag `phase-7-audit-cleanup-landed-YYYY-MM-DD`
6. **Wait Daniel STOP** explicit before declaring DONE. CC continuă log-only review pass dacă Daniel idle.

---

## §11 Anti-Hallucination Discipline

- Per Karpathy Think Before Coding: înainte fix orice § → re-read finding file complete + grep target file complete (NU recall din memorie)
- ZERO "presupun fix-ul X" — verifică source code direct via Read tool primary
- Per `DECISIONS.md §D008`: pre-action vault primary-source verification MANDATORY pentru product state claims
- Per `DECISIONS.md §D023`: filesystem write via `write_file` only + verify list_directory post-write Windows emoji paths
- Ambiguous fix-strategy 2+ options → Sequential Thinking decide + log rationale în commit message body

---

🦫 **D031 candidate Phase 7 Audit Cleanup procedure. Bugatti craft peak. Quality > Speed strict. ALL findings cleared 100% mandatory pre-Beta launch. Mirror D029 reverse log-only → fix continuous neîntrerupt multi-noapte Opus MAX. Stop trigger UNIC Daniel STOP explicit.**
