---
title: Iter 1 DAG V2 — Wave Dependency Graph + Parallelization Rules
status: DESIGN_LANDED
---

# _DAG V2 — Iter 1 Wave Dependency Graph

## §0 Critical path

```mermaid
graph TD
    START([Daniel CEO approve V2 design]) --> A[Wave A<br/>Critical real + Coach + ConfirmModal<br/>~40 tasks ~12-16h]
    A --> CHECK_A{Wave A LANDED}
    CHECK_A -- continue --> B[Wave B<br/>Surgical text + tokens + polish<br/>~150 tasks ~25-30h]
    CHECK_A -- parallel-spawn possible --> C[Wave C<br/>Components + Simplicity + MISSING<br/>~80 tasks ~25-30h]
    B --> MERGE_BC{Wave B + C LANDED}
    C --> MERGE_BC
    MERGE_BC --> D[Wave D<br/>Goal-driven multi-file refactor<br/>~35 tasks ~20-25h]
    D --> EXIT_AUDIT[Iter 1 EXIT audit]
    EXIT_AUDIT --> CONVERGENCE{Convergence 0/0 dual-source?}
    CONVERGENCE -- NO --> ITER2[Iter 2 mass fix planning]
    CONVERGENCE -- YES --> SMOKE[Daniel single comprehensive smoke a-z]
    SMOKE --> BETA([Beta Launch])

    DANIEL_E[Cluster E Daniel sessions<br/>~20 paradigm items<br/>3-5 days parallel] -.optional parallel.-> B
    DANIEL_E -.optional parallel.-> C
    DANIEL_E --> D
```

---

## §1 Wave A — Critical real (BLOCKS Wave B+C+D)

**Hard dependencies BLOCKING Wave A → B+C:**
- A001 + A002 Coach engine wire BLOCKS C-class sub-screen wirings that reference Coach card props
- A003 + A004-A010 ConfirmModal shared + 7 uses BLOCKS SettingsDanger functional flows în Wave C
- A011 + A012 Bundle code-split BLOCKS Wave D bundle ratchet thresholds
- A013-A016 Auth gaps BLOCKS Wave C MISSING screens auth-gated routes testing
- A017-A020 security hygiene + A025-A028 GDPR BLOCKS Wave D D011-D013 functional verify (Wave D extends Wave A stubs)

**ETA Wave A:** ~12-16h Opus continuous (~2 calendar days single-session).

---

## §2 Wave B + Wave C — Parallel-safe post Wave A

Post Wave A LANDED, Daniel can spawn:
- **Session α:** PROMPT_CC_iter1_wave_b (Surgical text + tokens + polish ~150 tasks)
- **Session β:** PROMPT_CC_iter1_wave_c (Components + Simplicity + MISSING ~80 tasks)

**Parallel-safety analysis:**
- Wave B = surgical text + Pass 4 polish per-file (Antrenor + Splash + Auth + Progres + etc.) — mostly 1-3 LOC edits
- Wave C = new components (SubHeader + WorkoutPreview rich + Istoric heatmaps + MISSING screens) — file-additive primarily
- **Collision risk: LOW** — Wave B edits existing line-level text/tokens; Wave C adds new components + new files
- **Soft collisions:** Wave C C001 vanilla archive may touch tailwind.config.content scope — Wave B B083 brand token consolidation should LAND first OR sequence Wave B before Wave C if same session

**ETA hybrid Wave B + C parallel:** ~30h elapsed (max of two sessions).

---

## §3 Wave D — Sequential post Wave B + C

**Hard dependencies BLOCKING Wave D:**
- D001-D005 Zod + Branded + FSM REQUIRES Wave A bundle code-split LANDED (per-file lazy-import surface coherent)
- D011-D013 GDPR functional verify EXTENDS Wave A stubs A025-A028
- D014 Backup/DR runbook EXTENDS Wave A stubs A034 + A035
- D022 PWA UpdatePrompt EXTENDS Wave A A029 + A030
- D025 Bundle code-split full EXTENDS Wave A A011 + A012
- D026 Tailwind CSS vars EXTENDS Wave A A021 + Wave C C001 vanilla archive (clean purge scope)
- D029 deploy.yml verify EXTENDS Phase 7 LANDED + Wave A test changes

**ETA Wave D:** ~20-25h Opus continuous (~3 calendar days single-session).

---

## §4 Hybrid execution model (Daniel-orchestrated)

### §4.1 Single-session sequential mode (sustainable, slower)

Daniel paste 1 prompt at a time:
- Wave A (~2 days) → Wave B (~4 days) → Wave C (~4 days) → Wave D (~3 days) → EXIT audit (~2 days)
- **Total: ~15 calendar days**

### §4.2 Hybrid 2-session parallel mode (faster)

Post Wave A LANDED (single-session ~2 days):
- Session α: Wave B (~4 days)
- Session β: Wave C (~4 days) PARALLEL
- Daniel merges via per-task atomic commits (rare collision per §2 analysis)
- Post Wave B + C LANDED: Wave D single-session (~3 days)
- **Total: ~11 calendar days**

### §4.3 Cluster E Daniel parallel

Throughout Wave B/C/D execution, Daniel can run Cluster E paradigm sessions (3-5 short discussions ~30min each), totaling ~5-6h Daniel + ~5-10h CC implementation post-decision.

**Total iter 1 (Wave A-D + Cluster E + EXIT audit): ~11-15 calendar days.**

---

## §5 Wave-specific dependencies detail

### §5.1 Wave A internal dependencies

```mermaid
graph TD
    A003[A003 ConfirmModal build] --> A004[A004-A010 7 use sites]
    A001[A001 CoachTodayCard wire] --> A002[A002 CoachRestCard wire]
    A011[A011 Bundle code-split] --> A012[A012 Per-route chunk verify]
    A015[A015 Onboarding gate] --> A016[A016 Re-auth check]
    A025[A025 GDPR Privacy] --> A026[A026 GDPR T&C]
    A026 --> A027[A027 GDPR erasure]
    A027 --> A028[A028 GDPR portability]
    A031[A031 Prod ops] --> A032[A032 Healthcheck]
    A032 --> A033[A033 Rollback procedure]
    A034[A034 Backup runbook] --> A035[A035 Fresh device test]

    A001 -.parallel.-> A011
    A001 -.parallel.-> A013
    A011 -.parallel.-> A017
```

### §5.2 Wave C internal dependencies

```mermaid
graph TD
    C001[C001 Vanilla archive] --> C040[C040 Delete public/sw.js]
    C001 --> C041[C041 engineWrappers header doc]
    C002[C002 SubHeader shared] --> C003[C003-C017 15 use sites]
    C034[C034 weight-timeline new] --> ROUTER_C[router.tsx add /app/istoric/weight-timeline]
    C035[C035 loguri-greutate new] --> ROUTER_C
    C036[C036 settings-support] --> ROUTER_S[router.tsx add /app/cont/settings-support]
    C037[C037 settings-about] --> ROUTER_S
    C038[C038 settings-faq] --> ROUTER_S
    C039[C039 settings-themes] --> ROUTER_S
```

### §5.3 Wave D internal dependencies (mostly sequential)

```mermaid
graph TD
    D001[D001 Zod onboarding] --> D002[D002 Zod engine]
    D002 --> D003[D003 Zod Firebase]
    D004[D004 Branded types] --> D005[D005 FSM Mode Detection]
    D025[D025 Bundle full] --> D027[D027 ESLint ratchet]
    D026[D026 Tailwind CSS vars] --> D027
    D011[D011 GDPR Privacy full] --> D012[D012 GDPR T&C full]
    D012 --> D013[D013 GDPR erasure full]
    D013 --> D014[D014 Backup/DR full]
    D030[D030 Beta entry checklist] --> EXIT[Iter 1 EXIT audit]
```

---

## §6 Cross-cluster hard dependencies (must respect)

| Dependency | Reason |
|------------|--------|
| Wave A → Wave B+C+D | Critical real foundations unblock all polish + components + refactor |
| A003 → C030+C031 SettingsDanger flows | ConfirmModal must exist before SettingsDanger use sites wire |
| A011+A012 → D025 | Wave A bundle code-split foundation extended in Wave D |
| C001 vanilla archive → D026 Tailwind CSS vars | Purge scope clean before Tailwind config migration |
| C002 SubHeader → C003-C017 + Wave C MISSING screens C034-C039 | Pattern adoption requires component exists |
| A025-A028 GDPR stubs → D011-D013 functional verify | Wave D extends Wave A stubs (don't double-write) |
| Daniel Cluster E decisions → Wave C paradigm-affected tasks (B013-B017 text-only safe, but C-cluster impl waits Daniel) |

---

## §7 Convergence iter 1 EXIT criteria

Per ORCHESTRATOR.md §8:

1. All 4 Waves (A+B+C+D) LANDED + Cluster E paradigm decisions implemented
2. Run audit-nuclear V4 procedure (D029 mirror) pe HEAD post-iter-1 — measure delta vs `b705c3f` baseline 56.5% production readiness
3. Run mockup-vs-prod parity V2 audit pe HEAD post-iter-1 — measure delta vs `caaae99` baseline 36% mockup parity
4. Run Track 7 systems scan (Tier 1+2+3)
5. Aggregate `_aggregate-findings-iter-1-exit.md`
6. Daniel CEO decision: CONTINUE iter 2 (if remaining ≥ ~100 dual-source) OR EXIT iter loop (if 0/0 dual-source) → Daniel single comprehensive smoke a-z → Beta launch

**Expected post-iter-1 closure:** ~75-80% of remaining ~870 findings → ~175-220 remaining → iter 2 needed.

**Total Beta gate path D042+D043 absolute:** ~11-15 days iter 1 + ~5-7 days iter 2 + ~3-5 days iter 3 residual (if needed) + ~1-2 days Daniel smoke = **~20-30 calendar days** post Wave A trigger.

---

🦫 **_DAG V2 — 4 Waves critical path. Wave A BLOCKS Wave B+C+D. Wave B+C parallel-safe. Wave D sequential. Cluster E Daniel parallel. ~11-15 days iter 1 hybrid mode.**
