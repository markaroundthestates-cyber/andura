# Wave Verify Checklist — Per-Wave LANDED Gate Protocol

**Purpose:** Daniel pre-trigger next Wave checklist + Co-CTO post-Wave-LANDED verify steps. Bugatti gate, ZERO compromise. Replicate for Wave A → B → C → D + iter EXIT audit.

**Author:** Co-CTO chat 4 ACASĂ 2026-05-20 night.

**Authority sources:** Track 7 §7.1-§7.9 LANDED (3-tier defense in-repo) + D041 anti-inflation + D031 push-discipline + D008 primary-source verify + Karpathy 4 principii.

---

## §0 When to use this checklist

- ✅ Post-Wave-A LANDED → before Wave B trigger
- ✅ Post-Wave-B LANDED → before Wave C trigger (or before Wave C start if parallel B+C, run after both LANDED)
- ✅ Post-Wave-C LANDED → before Wave D trigger
- ✅ Post-Wave-D LANDED → before iter EXIT audit trigger
- ✅ Post-iter-EXIT LANDED → before iter 2 trigger or convergence verdict

**NU use:** mid-Wave checkpoint, atomic-task verify (CC autonomous handles inline via per-task pre-flight + atomic commit).

---

## §1 Mandatory gate checklist (ALL must pass, Bugatti zero compromise)

### §1.1 Tests baseline verde
- [ ] **Vitest local fast isolated:** `npm run test` → all green (target post Wave A baseline +N tests delta documented în LATEST §2 "tests delta")
- [ ] **No `*.skip` introduced:** `grep -r "\.skip(" src/ --include="*.test.*"` returns 0 (per D036 ratchet ZERO regression)
- [ ] **Property invariants pass:** fast-check engines pure-function (Track 7 §7.1 `33d9aea`) all green
- [ ] **Golden master engines:** snapshot drift CONFIRMED INTENTIONAL (NU drift accidental — review per case)

### §1.2 Pre-commit hook verde
- [ ] **ZERO `--no-verify` bypass** anywhere în Wave commits (per `git log --pretty=fuller --grep="no-verify"` returns empty)
- [ ] **Pre-commit ESLint + TypeScript + tests passed** per atomic commit (Husky enforced)

### §1.3 GitNexus impact + detect_changes
- [ ] `npx gitnexus@latest analyze` rulat fresh post-Wave-LANDED
- [ ] `gitnexus_impact` — Wave touched files = expected list per `PROMPT_CC_iter1_wave_<X>_*.md` §X.<id> declared scope
- [ ] `gitnexus_detect_changes` — surprise drift = ZERO outside declared scope (anti-D029 stale-baseline + anti-drive-by-refactor Karpathy SC)

### §1.4 Visual regression Wave-relevant (Wave C + D primary, A + B secondary)
- [ ] **Playwright `toHaveScreenshot()`** (Track 7 §7.3 `1957b6f`) — 4 taburi + sub-screens touched by Wave → green snapshots OR intentional update via `--update-snapshots` cu Daniel review explicit
- [ ] **Mockup parity check:** if Wave C touched SubHeader / WorkoutPreview rich / MISSING screens → run `mockup-vs-prod-parity` re-check (or full re-audit post iter EXIT)

### §1.5 Bundle budget + dependency health (Wave A + D primary, B + C secondary)
- [ ] **size-limit:** `npm run size` → all chunks under budget (Track 7 §7.4 `8f6a996`)
- [ ] **depcheck:** zero unused deps introduced (per D026 extension iter 9 cleanup)
- [ ] **madge circular:** zero NEW circular dependencies (anti-D026 madge concession iter 9)
- [ ] **jscpd duplication:** under threshold per Track 7 §7.4
- [ ] **license-checker:** ZERO disallowed licenses introduced
- [ ] **Snyk + npm audit:** ZERO new HIGH/CRITICAL vulnerabilities (per D034 case-by-case patch policy)

### §1.6 Lighthouse CI + a11y (Wave C + D primary)
- [ ] **Lighthouse CI 12+:** Performance + Best Practices + SEO scores under ratchet threshold (Track 7 §7.3 `1957b6f`)
- [ ] **axe-core a11y:** ZERO WCAG 2.1 AA violations introduced (per Track 7 §7.3)
- [ ] **PWA score:** unchanged sau improved (NU regression)

### §1.7 Coach voice scenarios (Wave A + D primary)
- [ ] **Engine-based golden scenarios** (Track 7 §7.5 `ecf320a` skeleton + D033 PerSetSafetyModal rename unblocks activation) — coach pipeline persona Gigel/Marius/Maria 65 outputs sanity check
- [ ] **NO surveillance / NU jargon / NU paranoid features** introduced (PRIMER §1 differentiator invariant)

### §1.8 PRIMER §5 micro-update mandatory
- [ ] **Append 1 line** la `ANDURA_PRIMER.md` §5 "Unde am rămas" final paragraph — Wave X LANDED summary cross-LOCK (tests delta + commits SHA + closure projection delta)
- [ ] **DECISIONS.md** entry NEW dacă paradigm shift (NU per Wave LANDED status update — D008 reglaj append-only constraint preserved)
- [ ] **LATEST.md scribe** via `HANDOVER_POST_WAVE_TEMPLATE.md` format §0-§7

### §1.9 Git hygiene
- [ ] **Branch state:** all atomic commits LANDED, push manual final post-Wave (NU per-task push — preserve `f40ebbc` Stop hook D030 anti-recurrence)
- [ ] **Backup tag pushed:** `pre-wave-<X>-iter1-<date>` before Wave start (Daniel manual trigger)
- [ ] **Milestone tag pushed:** `wave-<X>-iter1-landed-<date>` post Wave LANDED (Daniel manual trigger sau Co-CTO chat propose în LATEST §5 next Wave trigger)

---

## §2 Production readiness measurement (per-Wave delta, honest D041 anti-inflation)

| Metric | Pre-Wave baseline | Post-Wave projection | Real measured post LANDED |
|--------|-------------------|----------------------|---------------------------|
| Audit Nuclear closure % | 56.5% @ `b705c3f` | ~+X% expected | TBD via re-audit |
| Mockup Parity closure % | ~36% @ `caaae99` | ~+X% expected | TBD via re-parity |
| Findings closure count | 0 cumulative iter 1 | ~+N tasks LANDED | counted via commit log |
| Tests baseline | 4519+ | +N delta | counted via `npm run test` |
| Bundle size | TBD prev Wave | unchanged sau under | measured via size-limit |
| Lighthouse Perf | TBD prev Wave | unchanged sau improved | measured via LHCI |

**Anti-inflation rule:** Co-CTO scribe report explicit "Closed N findings, projection P%" NU "compound 95%+". Real % measured via iter EXIT audit V4 + parity V2 re-run, NU per-Wave estimate.

**D041 verbatim invariant:** *"Production readiness real ~75-85% estimate, target measure via Phase 8 Bugatti audit nuclear post-smoke (anti-inflation discipline)"*.

---

## §3 Bugatti gate decision criteria

**GREEN gate (trigger next Wave):**
- ALL §1.1-§1.9 mandatory checks ✅
- §2 measurements consistent cu projection (within ±5% tolerance)
- Daniel review approval verbatim (NU Co-CTO auto-trigger)

**YELLOW gate (review specific findings):**
- §1.1-§1.9 majority ✅ dar ≥1 SOFT fail (visual regression intentional update needed, bundle near budget threshold, etc.)
- Co-CTO flag explicit în LATEST §6 "Issues" + propose fix path
- Daniel decide: trigger next Wave + carry-forward fix la iter EXIT OR pause + fix-now

**RED gate (HALT, NU trigger next Wave):**
- ANY §1.1-§1.9 HARD fail (tests broken, pre-commit bypass detected, Snyk new HIGH/CRITICAL, axe-core NEW violation)
- Co-CTO immediate revert plan în LATEST §6 + git revert chain proposed
- Daniel STOP explicit until RED resolved

---

## §4 Verify protocol step-by-step Co-CTO chat post-Wave-LANDED

1. **Read** `📤_outbox/LATEST.md` (CC autonomous report Wave X LANDED)
2. **Verify** §1.1-§1.9 mandatory checklist mechanical-check (open terminal local, run commands explicit)
3. **Measure** §2 delta — re-run audit nuclear OR parity OR both (depending on Wave touched surface)
4. **Scribe** verify report `📥_inbox/WAVE_<X>_VERIFY_<date>.md` cu §1 ✅/❌ table + §2 measurements + §3 verdict GREEN/YELLOW/RED
5. **Propose** next action explicit Daniel: trigger next Wave + verbatim command OR pause + propose fix
6. **Append** PRIMER §5 1 line micro-update post-Wave (per D008 anti-revisionism)

---

## §5 Common verify pitfalls anticipated

- **MCP timeout 4min ≠ failure** — verify filesystem-side via `git log` + `npm test` direct command line, NU assume crash
- **Stale-baseline drift detection** — gitnexus_impact must match declared Wave scope; surprise files = anti-D029 stale-baseline recurrence detected → HALT
- **Test count inflation** — count via `npm run test 2>&1 | grep "Tests"` direct stdout, NU CC raport unverified
- **Visual regression false positive** — pixel diff <5px = anti-aliasing artifact, NU bug; >5px = real change → review intentional vs accident
- **Lighthouse local vs CI variance** — ±2 points expected normal; ratchet threshold absorbs noise (Track 7 §7.3 design)

---

## §6 Files reference

- `ORCHESTRATOR.md` — Wave declared scope per Wave X spec
- `_DAG.md` — Wave parallel safety analysis (Wave B + C concurrent green-light)
- `_MASTER_BACKLOG.md` — atomic task list source-of-truth per Wave
- `PROMPT_CC_iter1_wave_<X>_*.md` — Wave X mega-prompt CC autonomous spec
- `HANDOVER_POST_WAVE_TEMPLATE.md` — CC scribe LATEST.md template post Wave LANDED (chat 4 artifact)
- `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` — vault FROZEN §0-§11 Bugatti gate authoritative master

---

🦫 **WAVE_VERIFY_CHECKLIST.md = per-Wave LANDED Bugatti gate. §1 mandatory 9 sub-checks + §2 measurement table honest D041 + §3 GREEN/YELLOW/RED verdict + §4 Co-CTO verify protocol step-by-step + §5 common pitfalls anticipated. Replicate Wave A → B → C → D → iter EXIT.**
