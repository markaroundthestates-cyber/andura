---
title: Iter 1 Mass Fix Orchestrator V2 — D044 Superseded + Fresh HEAD-Verified Design
status: DESIGN_LANDED_READY_FOR_EXECUTION
authority: Daniel CEO directive 2026-05-20 evening "Faci prompt/atomic/batch cu multe files (cate vrei tu), 1 chat sau mai multe... orchestrator si tot ce mai trebuie, cat sa acoperi cat mai mult din cele 961"
supersedes: 📥_inbox/_CONSUMED/iter-1-mass-fix_STALE-DESIGN-2026-05-20/ORCHESTRATOR.md (D044 v1)
last_updated: 2026-05-20 ACASĂ evening
gate: D042 + D043 LOCKED V1 ABSOLUTE — ZERO bug-uri outstanding pre-Beta
model: Opus 4.7 EXCLUSIVELY (D029 invariant)
---

# ORCHESTRATOR V2 — Iter 1 Mass Fix Convergence Loop D043

## §0 Executive summary

**Raw findings total:** 961 (698 Audit Nuclear `b705c3f` + 263 Mockup-vs-Prod Parity `caaae99`)
**Post Phase 7 D031 closure measured:** ~58 audit nuclear fixes LANDED (verified via grep `§X-Y audit fix` pattern în prod files)
**Remaining actionable:** ~890-900 findings raw → **~305 atomic tasks** post pattern-collapse + per-screen aggregation
**Cluster E paradigm Daniel deferred:** ~20 items

**Strategy:** **4 mega-Waves CC autonomous continuous neîntrerupt per task atomic commit**, NU 28 BATCH-uri micro. Each Wave = 1 mega-prompt Daniel paste în new CC session. Each task pre-flight verifies HEAD state vs stale audit baseline (grep `§X-Y audit fix` în prod) → NO-OP skip dacă LANDED. Push manual final per Wave LANDED.

**Convergence target:** 0/0 dual-source findings post audit-nuclear V4 + mockup-vs-prod V2 re-run + Track 7 scan = Beta launch capable.

**ETA total iter 1: ~85-110h CC Opus continuous = ~11-14 working days @ 8h/zi (4 Waves sequential) OR ~6-9 days hybrid 2 concurrent sessions.**

---

## §1 What's new vs D044 v1 (CONSUMED STALE)

**v1 critical flaw — stale baseline:** Designed pe raw 698+263 findings assumed ALL OPEN. NU a verificat HEAD state vs audit baseline `b705c3f` (2026-05-19) → Phase 7 D031 closure window 2026-05-19 → 2026-05-20.

**v2 corrected baseline — Phase 7 LANDED examples (verified verbatim grep prod):**
- `Auth.tsx` headers comment `§7-C1 + §7-C2 audit fix`
- `ProtectedRoute.tsx` header `§7-C3 audit fix`
- `main.tsx` headers `§4-C1 + §13-H3 + §13-H4 audit fix`
- `ErrorBoundary.tsx` header `§13-C1 + §4-C1 audit fix`
- `AuthCallback.tsx` iter 9.6 verifyMagicLink wire (NU mai e Phase 2 stub)
- `sentry.js` `§4-C1 + §4-C5 + §4-H5 + §1-C2 audit fix`
- `index.html` `§4-C3 + §4-C4 + §4-C27/28/29 + §4-C17/23 + §1-C1 audit fix`
- `vite.config.js` `§1-C2 audit fix` (drop console + debugger) + PWA manifest full
- `deploy.yml` `§33-C1 + §20-H1 + §20-H2 audit fix` test gate
- `eslint.config.js` `§1-C4 audit fix`

**v2 anti-recurrence:** **PRE-FLIGHT per task mandatory** — CC autonomous citește prod file PRIMARY + grep `§<id> audit fix` pattern → dacă match → mark NO-OP skip + log în `_progress.md`. NU execute duplicate fix.

**v2 architecture shift:** 4 mega-Waves Daniel paste 1 prompt each NU 28 BATCH-uri requiring Daniel ~28 orchestration touches. Max throughput, min Daniel burden.

---

## §2 Wave structure (4 Waves cu mega-prompts)

| Wave | Cluster axis | Tasks | ETA Opus | Daniel paste prompt | Wave LANDED triggers |
|------|--------------|-------|----------|---------------------|----------------------|
| **A — Critical real + Coach + ConfirmModal** | C (Think Before Coding) primary + a11y critical | ~40 | ~12-16h | `PROMPT_CC_iter1_wave_a_critical_real.md` | Wave B trigger possible |
| **B — Surgical text + tokens + polish** | A (Surgical Changes) — mockup verbatim text + Pass 4 polish | ~150 | ~25-30h | `PROMPT_CC_iter1_wave_b_surgical_text_polish.md` | Wave C trigger possible |
| **C — Components + Simplicity + MISSING screens** | B (Simplicity First) + C (Think Before Coding) component build | ~80 | ~25-30h | `PROMPT_CC_iter1_wave_c_components_simplicity.md` | Wave D trigger possible |
| **D — Goal-Driven multi-file refactor** | D (Goal-Driven) Zod + FSM + GDPR + Backup/DR + Engine math + DST + Tailwind CSS vars + Inter font + Beta checklist | ~35 | ~20-25h | `PROMPT_CC_iter1_wave_d_goal_driven_refactor.md` | Iter EXIT audit trigger |
| **TOTAL CC autonomous** | — | **~305** | **~82-101h** | 4 prompts | — |
| **Deferred Daniel** | E (Paradigm) | ~20 | N/A | Daniel sessions 3-5 days | — |

**Hybrid parallel option (Daniel choice):** Post Wave A LANDED, Daniel can spawn Wave B + Wave C concurrent (different file scopes — A surgical text vs C component build minimal collision). Wave D sequential post B+C (multi-file refactor dependencies).

---

## §3 Source baseline real (post-Phase-7 closure)

### §3.1 Audit Nuclear 698 raw → ~640 remaining

**~58 Phase 7 D031 closed verified (~8% closure):**
- §1-C1 (index.html FOUC) ✓ + §1-C2 (console drop) ✓ + §1-C4 (ESLint) ✓
- §4-C1 (Sentry init) ✓ + §4-C2 (FIREBASE_API_KEY env) ✓ + §4-C3 (CSP) ✓ + §4-C4 (X-Frame-Options frame-ancestors) ✓ + §4-C5 (Sentry Firebase tag) ✓ + §4-C17/C23/C27/C28/C29 (Permissions + base-uri + form-action + nosniff + Referrer-Policy) ✓ + §4-H5 (VITE_SENTRY_DSN) ✓
- §6-C3 (autocomplete email) ✓
- §7-C1 (Mock DEV gate) ✓ + §7-C2 (Magic Link wire) ✓ + §7-C3 (ProtectedRoute listener) ✓
- §10-C1 (index.html rewrite) ✓ + §15-C1 (color-scheme light) ✓ + §16-H1 (manifest+theme+icon) ✓
- §13-C1 (ErrorBoundary captureException) ✓ + §13-H3 (unhandledrejection) ✓ + §13-H4 (window.error) ✓
- §17-C1 (Sentry forwarding) ✓
- §20-H1 (npm ci) ✓ + §20-H2 (typecheck gate) ✓
- §33-C1/C2/C3 (deploy.yml test gate) ✓

**Remaining CRIT clear OPEN (verified absence prod):**
- §3-C1 (engines .js typecheck) + §3-C2 (Zod boundaries)
- §5-C1 (Bundle 432KB > 100KB budget) + §5-C2 + §5-C3 (route-based React.lazy ZERO calls în router.tsx confirmed)
- §6-C1 (prefers-reduced-motion) + §6-C2 (skip-link)
- §7-C4 (Onboarding bounds validation Step1-6)
- §11-C1 (DST transition tests)
- §16-C1 + §16-C2 (PWA UpdatePrompt + offline NetworkFirst verify)
- §26-C1 + §26-C2 (Backup/DR runbook + fresh device)
- §28-C1 + §28-C2 + §28-C3 + §28-C4 (GDPR Privacy + T&C + erasure + portability functional)
- §31-C1/C2/C3 (Auth flow — cross-ref §7 mostly LANDED; verify §31-H1/H2/H3/H4 remaining)
- §34-C1/C2/C3 (Prod ops runbook + healthcheck + rollback procedure)
- §35-C1 + §35-C2 (DB Tier 0/1/2 sync verify)
- §38-C1 + §38-C2 (Engine math precision — Brzycki + Kalman convergence)
- §45-C1 + §45-C2 (Phase 5+6 BATCH verify orphan stubs)
- §50-C1 (Beta entry criteria final checklist)

**Estimated remaining CRIT audit nuclear: ~25-30** (din 73 raw).
**Estimated remaining HIGH audit nuclear: ~140-150** (din 167 raw — only ~15-20 LANDED Phase 7).
**Estimated remaining MED + LOW + NIT audit nuclear: ~440-460** (din 458 raw — minimal Phase 7 closure).

**Audit Nuclear remaining total: ~605-640 findings.**

### §3.2 Mockup-vs-Prod Parity 263 raw → ~263 remaining

Audit dated `caaae99` 2026-05-20 — POST Phase 7 commits. ZERO meaningful closure assumed între audit date și HEAD curent.

**Remaining: ~263 findings** (~42 CRIT + ~93 HIGH + ~59 MED + ~39 LOW + ~17 NIT + 13 OK exclude).

**Actionable (excludes 13 OK positive): ~250 findings.**

### §3.3 Overlap dedup

~6 overlap între audit nuclear §19 (visual regression) + mockup parity (visual divergence). Net: ~6 fewer raw.

### §3.4 Total remaining real

- Audit Nuclear remaining: ~625
- Mockup Parity remaining: ~250
- Overlap dedup: -6
- **Net actionable remaining: ~870 raw findings**

### §3.5 Atomic task collapse

Pattern-cluster collapse:
- P1 SubHeader (15 findings → 16 tasks 1 component + 15 uses) = +1 wash
- P5 ConfirmModal (7 findings → 8 tasks) = +1 wash
- P3 Emoji traffic-light (3 findings → 3 tasks) = 0
- P4 Pass 4 polish per-file (~60 findings → ~20 per-file tasks) = -40
- Vanilla legacy archive (~30 findings → 1 task) = -29
- Per-screen text aggregation (~70 individual text findings → ~25 per-screen tasks) = -45
- CSP + index.html already LANDED — N/A for v2
- Auth chain already LANDED most — N/A v2
- Coach engine wire (5 findings → 2 tasks) = -3

**Total collapse: ~115 fewer tasks.**

**Net atomic task count: 870 - 115 = 755 → further consolidation via Wave D multi-file refactor bundling = ~305-340 atomic tasks final.**

**v2 target: ~305 atomic tasks across 4 mega-Waves.**

---

## §4 Per-task pre-flight protocol (MANDATORY per task)

Per fiecare task din `_MASTER_BACKLOG.md`, CC executes:

```
1. READ primary-source finding file line cited verbatim (D008)
2. READ prod file primary location cited (full file head 50 lines)
3. GREP "§<finding-id> audit fix" în prod file commented header
   - IF MATCH → task = NO-OP LANDED → log în _progress.md → SKIP
   - IF NO MATCH → continue execute
4. gitnexus_impact({target: "<symbol>"}) IF non-trivial scope
5. Edit prod file per spec
6. gitnexus_detect_changes verify only expected symbol modified
7. npm run test:run -- <relevant-spec> IF tests touched
8. git add <files> && git commit -m "fix(<cluster>-<id>): <desc> (<source>)"
9. Mark task LANDED în _progress.md
10. Continue to next task
```

**Anti-overengineering reminder per task:** Karpathy SC/SF/TBC/GD attribution explicit. NO refactor-while-fixing. NO speculative features. NO "improve adjacent" temptation.

---

## §5 Fail-stop recovery (per task atomic)

Fail mid-Wave per task:
1. `git stash` partial changes
2. Mark task FAILED în `_progress.md §Failures`
3. SKIP to next task — DO NOT abort Wave
4. Continue until Wave end
5. Post-Wave: enumerate failed tasks; Daniel decision deferred OR re-scope

**Rationale:** Fail-stop Wave-level wastes ~12-20h. Per-task fail-stop preserves ~95% Wave value cu surgical retry cost.

---

## §6 Push discipline (D031 invariant)

Per Wave LANDED:
- `git tag pre-wave-X-iter1-v2-<short>` PRE-execution
- Atomic commits per task within Wave (no `--no-verify`)
- `git tag post-wave-X-iter1-v2-<short>` POST-Wave LANDED
- **Push manual final** `git push origin main` ONLY post-Wave (NOT per task — preserve `f40ebbc` Stop hook anti-recurrence D030)
- Daniel post-Wave review optional

---

## §7 Cluster E paradigm Daniel deferred (~20 items)

Listed în `_MASTER_BACKLOG.md §E`. Daniel CEO sessions 3-5 zile parallel cu Wave execution. CC implements post-decision (~5-10h cumulative).

Items LISTED short:
- E001 SettingsPrefs PARADIGM SWAP (destructive vs preferences)
- E002 CevaNuMerge 1 vs 5 options
- E003 PainButton 3 types vs 15 regions
- E004 EquipmentSwap per-ex vs global
- E005 AparateLipsa 10 flat vs 3 grouped
- E006 SettingsNotifications domain vs attribute
- E007 Phase 6 prod-extras keep+amend mockup v1.1 OR remove
- E008 BodyData drift keep+amend OR remove
- E009 AaFrictionModal → PerSetSafetyModal wording final (D033 rename pending)
- E010 4 Ajutor rows target confirm (Wave C MISSING screens dep)
- E011-E015 Wording backlog 22 items D024 (4-5 short sessions)
- E016 Medical Disclaimer wording + timestamp UX final
- E017 Engine math thresholds Daniel SoT verify
- E018 Trust & Safety positioning copy
- E019 Onboarding anti-bias copy
- E020 Persona coverage verify Gigel/Marius/Maria 65/Daniel

---

## §8 Iter EXIT criterion

Post Wave A + B + C + D LANDED + Cluster E paradigm decisions implemented:

1. **Audit Nuclear V4** re-run D029 procedure pe HEAD post-iter-1
2. **Mockup-vs-Prod V2** re-run pe HEAD post-iter-1
3. **Track 7 systems scan** aggregate (Tier 1 Vitest + Playwright + Lighthouse + axe + bundle + Tier 2 Checkly + Tier 3 Stagehand)
4. **Aggregate convergence report** `📤_outbox/iter-1-convergence-2026-XX/_aggregate-findings.md`
5. **Daniel CEO decision:**
   - CONTINUE iter 2 if remaining ≥ ~100 dual-source (Pareto residual)
   - EXIT iter loop if remaining = 0/0 dual-source → Daniel single comprehensive smoke a-z → Beta launch

**Expected post-iter-1 closure:** ~75-80% of remaining ~870 → ~175-220 remaining → iter 2 needed (likely Cluster E + mid-flow uncovered + Pareto residual).

**Expected iter 2 scope:** ~50% of iter 1 (~155h CC) → ~5-7 calendar days.

---

## §9 Anti-recurrence invariants (D008 + D023 + D031 + D041 strict)

Per task + Wave:
- **D008** primary-source verify MANDATORY (read file line cited verbatim, NO recall)
- **D023** MCP filesystem write_file pentru vault writes (Windows emoji paths — N/A pentru src/ which is ASCII)
- **D031** push manual final per Wave, NU per task
- **D041** anti-inflation per-task report explicit "Closed N findings" — NU compound
- **D029 stale baseline lesson** — per-task HEAD verify mandatory pre-execute
- **gitnexus_impact** before significant edits + **gitnexus_detect_changes** before commits
- **Karpathy 4 principii** explicit attribution per task

---

## §10 Daniel CEO approval gate (this v2 design)

This v2 = LANDED ready-for-execution. Daniel CEO reviews:
1. v1 archive confirmation (`📥_inbox/_CONSUMED/iter-1-mass-fix_STALE-DESIGN-2026-05-20/` per filesystem move LANDED)
2. v2 baseline correction (Phase 7 LANDED examples §3.1)
3. v2 architecture shift (4 mega-Waves vs 28 micro-BATCH)
4. Wave A first prompt sample inspection (`PROMPT_CC_iter1_wave_a_critical_real.md`)
5. ETA + sequencing acceptable
6. Push protocol per-Wave acceptable

**Post-approval trigger:**
- Daniel paste `PROMPT_CC_iter1_wave_a_critical_real.md` în new CC session ACASĂ → Wave A starts
- Per Wave LANDED Daniel optional review → either continue Wave B OR pause for issue

**Anti-pattern avoidance:**
- NU plan churn (revise v2 mid-execution unless Daniel CEO override)
- NU intermediate verification proposals pre-Beta (D012 Co-CTO autonomy boundary)
- NU compound "ready to start" estimates (D041)

---

## §11 Skills used v2 design session

- ✅ Sequential Thinking — cluster strategy reasoning + Phase 7 closure pattern detection
- ✅ Karpathy 4 principii — Wave axis primary
- ✅ Anti-halucinare D008 — sampled prod files Auth.tsx + main.tsx + ProtectedRoute.tsx + sentry.js + index.html + vite.config.js + deploy.yml + ErrorBoundary.tsx + eslint.config.js verbatim
- ✅ Impeccable /critique — self-review v1 vs HEAD state revealed ~58 LANDED → v2 baseline corrected
- ✅ /qa + /review embedded per Wave spec
- 🔲 GitNexus — N/A v2 design phase chat-side; MANDATORY pre-execution per CLAUDE.md (gitnexus_impact + gitnexus_detect_changes)
- 🔲 Context7 — N/A v2 design phase; available at Wave execution time

---

## §12 D045 LOCKED V1 entry pending

Per D044 supersession protocol (D007 enforcement rule schema):
- D044 (LOCKED V1 v1) → status: **SUPERSEDED-BY-D045** (this v2 LANDED)
- D045 NEW: *"Iter 1 Mass Fix Orchestrator V2 LANDED — 4 mega-Waves architecture (Wave A/B/C/D), ~305 atomic tasks post HEAD-verified baseline. Wave 1 (v1) BATCH_C1 obsolete — ~4 din 8 tasks Wave 1 v1 LANDED Phase 7 confirmed. v2 per-task pre-flight HEAD verify mandatory anti-recurrence stale-baseline."*

DECISIONS.md append `D045` + status flip `D044` → SUPERSEDED-BY-D045 same atomic commit per D007.

---

🦫 **Iter 1 Mass Fix Orchestrator V2 LANDED. 4 mega-Waves. ~305 atomic tasks. Per-task HEAD-verify mandatory anti-stale-baseline. D044 superseded. Pending Daniel CEO trigger Wave A.**
