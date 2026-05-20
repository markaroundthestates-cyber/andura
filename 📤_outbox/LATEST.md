# Iter 1 Mass Fix Orchestrator Design LANDED + D044 LOCKED V1 — Handover Daniel CEO Approve Gate

**Status:** Design phase iter 1 LANDED 2026-05-20 birou. D044 LOCKED V1 cu spec ~340 atomic tasks / 28 BATCH-uri / Wave 1 critical-path 4 BATCH-uri. Pending Daniel CEO approve → trigger BATCH_C1 execution session.
**Last LANDED:** 11 artefacte design `📥_inbox/iter-1-mass-fix/` (ORCHESTRATOR + _MASTER_BACKLOG + _DAG + _BATCH_INDEX + _progress + 2 BATCH samples + 5 task samples + template README)
**Procedure:** D042 + D043 LOCKED V1 ABSOLUTE — Beta gate ZERO bug-uri dual-source convergence + Daniel single comprehensive smoke
**Model:** Opus 4.7 EXCLUSIVELY
**Stop trigger UNIC:** Daniel STOP explicit

## §1 Iter 1 Mass Fix Orchestrator Design 2026-05-20 — final metrics

**Source aggregation:**
- Audit Nuclear D029 (`b705c3f` 2026-05-19): 698 raw → 648 post-cross-ref-dedup → 568 post-positives-exclude actionable
- Mockup vs Prod parity (`caaae99` 2026-05-20): 263 raw → 250 actionable
- Overlap dedup: ~6
- **Total actionable raw:** ~890 findings
- **Pattern collapse via Pass 3 patterns P1-P8 + per-file aggregation:** -95 tasks
- **Per-screen text aggregation:** -250 tasks
- **Final atomic count: 340 tasks** (NOT 450-550 predecessor estimate; Daniel "500 max" cap respected cu ~30% margin)

**Cluster split Karpathy-driven (5 clusters):**
- **Cluster A — Surgical Changes** 180 tasks / 8 BATCH-uri ~25-30h (text + token polish + emoji + security/hygiene + JSDoc)
- **Cluster B — Simplicity First** 50 tasks / 5 BATCH-uri ~10-13h (vanilla legacy archive closes ~30 findings, dead code, standards)
- **Cluster C — Think Before Coding** 80 tasks / 8 BATCH-uri ~30-40h (Auth chain, ConfirmModal+7uses, SubHeader+15uses, WorkoutPreview, Istoric heatmaps, Antrenor Obiectiv, RestOverlay, MISSING screens new)
- **Cluster D — Goal-Driven** 30 tasks / 7 BATCH-uri ~20-25h (bundle code-split, Tailwind CSS vars migration, ESLint, Zod boundaries, Branded types, FSM, GDPR, Backup/DR, engine math precision, deploy.yml test gate, Firebase rules CLI)
- **Cluster E — Paradigm Daniel CEO** 20 deferred (NU CC autonomous — SettingsPrefs PARADIGM SWAP, CevaNuMerge, PainButton, EquipmentSwap, AparateLipsa, SettingsNotifications, Phase 6 prod-extras keep+amend, BodyData drift, AaFrictionModal wording, wording backlog 22 items D024)

**Wave 1 critical path (4 BATCH-uri ~12-15h sequential, BLOCKS Wave 2):**
1. **BATCH_C1 Auth Chain** — sendMagicLink wire + Mock login DEV gate + ProtectedRoute Firebase listener + Sentry init + AuthCallback verify + Onboarding gate + SettingsDanger re-auth (closes 11 CRIT)
2. **BATCH_D1 index.html + CSP + Sentry + deploy.yml** — security baseline + production observability (closes 14+ CRIT)
3. **BATCH_C2 Coach engine wire** — CoachTodayCard + CoachRestCard (closes 5 CRIT P4 pattern)
4. **BATCH_C3 ConfirmModal + 7 uses** — UX safety (closes 7 CRIT P5 pattern)

**Wave 2 parallel-safe (20 BATCH-uri ~30-45h hybrid 2-3 concurrent sessions, ~3-5 calendar days):**
- 8 BATCH-uri Cluster A (parallel across themselves)
- 5 BATCH-uri Cluster B (sequential within cluster)
- 5 BATCH-uri Cluster C 4-8 (semi-parallel file-scoped)
- 6 BATCH-uri Cluster D 2-7 (sequential within cluster)

**Wave 3 Cluster E Daniel sessions** ~3-5 calendar days discussion + ~1 day CC implement post-decisions.

**Iter 1 EXIT audit** ~12-15h (Audit Nuclear V4 + Mockup vs Prod V2 + Track 7 scan + aggregate).

**ETA codified (D041 anti-inflation):**
- Iter 1 single-session sequential mode: ~110-140h CC = ~14-22 calendar days
- Iter 1 hybrid 2-session parallel mode: ~40-55h elapsed = ~7-10 calendar days
- Iter 2 estimated (Pareto residual ~50%): ~50-70h CC + ~10-20 Cluster E items = ~7-10 days
- Iter 3 residual: ~25h CC = ~3-5 days
- Daniel single smoke a-z: ~1-2 days
- **Total Beta gate path D042+D043 absolute: ~25-39 calendar days** post design approve

## §2 Artefacte LANDED `📥_inbox/iter-1-mass-fix/`

| File | Purpose |
|------|---------|
| `ORCHESTRATOR.md` | Master spec ~9k chars — design rationale + cluster split + Wave sequencing + execution protocol + fail-stop + DAG entry + approval gate |
| `_MASTER_BACKLOG.md` | 340 atomic tasks SoT TSV-table cu source-citation per task + Karpathy attribution + effort + Beta blocker flag + dependencies |
| `_DAG.md` | Mermaid dependency graph + critical path + cross-cluster hard deps + Wave 1 detail per BATCH + Daniel-orchestrated multi-session model |
| `_BATCH_INDEX.md` | 28 BATCH-uri summary cu task ranges + pre-req + parallel-safe flag + ETA per BATCH |
| `BATCH_C1_auth_chain.md` | Wave 1 first BATCH fully detailed (8 tasks pre-flight + implementation + tests + commits + post-BATCH protocol) |
| `BATCH_A1_text_swaps_wave_a.md` | Sample parallel-safe Cluster A BATCH (25 tasks compact format) |
| `task_001_C001_auth_sendMagicLink_wire.md` | Wave 1 critical Auth chain entry task — full atomic format reference |
| `task_002_A001_antrenor_date_header.md` | Cluster A surgical text addition sample |
| `task_003_B001_vanilla_legacy_archive.md` | Cluster B Simplicity First large cleanup sample (~30 findings closed via 1 archive op) |
| `task_004_C019_subheader_shared_component.md` | Cluster C Think Before Coding new shared component (P1 1-component-15-uses) |
| `task_005_D001_bundle_code_split.md` | Cluster D Goal-Driven multi-file refactor (perf gate Maria 65 LCP) |
| `task_template_README.md` | Reference format for atomic task files generated per BATCH at execution time |
| `_progress.md` | Checkpoint — Wave 1 + Wave 2 BATCH status PENDING + Cluster E deferred list + iter EXIT audit phase |

## §3 D044 LOCKED V1 — Design decision rationale

**D044** (PROC): *"Iter 1 Mass Fix Orchestrator design LANDED — 340 atomic tasks across 28 BATCH-uri Karpathy-driven 5 clusters... Wave 1 critical path 4 BATCH-uri ~12-15h... Total Beta gate path ~25-39 calendar days. NU follow predecessor CONSUMED plan (Daniel directive verbatim 'gandeste fresh')."*

**Fresh design vs CONSUMED predecessor delta:**
- Predecessor estimate: 450-550 atomic prompts
- Fresh design: 340 atomic tasks (~25% reduction via pattern dedup + per-screen aggregation + cluster collapse)
- Predecessor format: 500 separate `task_NNN.md` files generated upfront
- Fresh design: `_MASTER_BACKLOG.md` table SoT + sample task files + execution-time per-BATCH expansion (lazy generation, minimal churn)
- Predecessor sequencing: cluster A→B→C→D sequential
- Fresh design: Wave 1 critical-path (4 BATCH-uri) BLOCKS Wave 2 ALL; Wave 2 parallel-safe Daniel-orchestrated multi-session

## §4 Next P1 — Daniel CEO approve design + trigger BATCH_C1

Daniel directive verbatim post-design: *"trigger BATCH_C1 execution session ACASĂ"*.

**Daniel CEO approve checklist:**
1. Read `📥_inbox/iter-1-mass-fix/ORCHESTRATOR.md` §0 + §1 + §2 (~3k chars exec summary)
2. Skim `_MASTER_BACKLOG.md` head 100 lines (Cluster A start) for task format
3. Read `BATCH_C1_auth_chain.md` (Wave 1 first BATCH) for execution-ready spec
4. Read `task_001_C001_auth_sendMagicLink_wire.md` for atomic task format
5. Decision: approve OR push-back specific item OR ask question

**Post-approval trigger Wave 1:**
- Open NEW CC session ACASĂ post `git pull`
- Paste: `Execute BATCH_C1 per spec 📥_inbox/iter-1-mass-fix/BATCH_C1_auth_chain.md. Read pre-flight + execute tasks C001-C008 sequential. Atomic commits per task. Push origin manual final post-BATCH.`
- CC autonomous Wave 1 execution ~3-4h Opus continuous

**Track 7 §7.10 final smoke + Firebase Secrets DEFERRED** până post iter 1 convergence D043 (smoke pe ~36% parity = waste Daniel time; aștept iter N EXIT 0/0 trigger smoke).

## §5 Pending Daniel-action

1. Sync acasă: `cd C:\Users\Daniel\Documents\salafull && git pull` post handover commit LANDED
2. Open chat ACASĂ → review iter-1-mass-fix design artefacte → approve OR push-back
3. Post-approve: paste BATCH_C1 prompt în new CC session → Wave 1 starts
4. Firebase Secrets `VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_RTDB_URL` upload GitHub Secrets per D040 — pre BATCH_C1 execution prerequisite

## §6 Production readiness honest D041

- Audit Nuclear D029: 53.80% measured @ `b705c3f` 2026-05-19
- Audit Mockup vs Prod: 36% measured @ `caaae99` 2026-05-20
- Estimated post iter 1 LANDED (NOT measured): ~75-80% production readiness + ~75% mockup parity (per Pareto closure projection ~58% findings closed)
- Real measurement final TBD via iter 1 EXIT audit V4 post-iter-1 LANDED

## §7 Skills used per Co-CTO design session

- ✅ Sequential Thinking — cluster strategy reasoning + Pareto pattern dedup analysis
- ✅ Karpathy 4 principii — cluster axis primary (A/B/C/D/E split + per-task attribution)
- ✅ Anti-halucinare D008 — sampled 8 real finding files line-cited verbatim (NC§01 + §04 + §07 + §31 + MP-antrenor + MP-wave-f-missing + MP-pass3-patterns + MP-pass4-polish)
- ✅ Impeccable /critique — self-review predecessor CONSUMED plan 450-550 critiqued + reduced 25% via pattern dedup
- ✅ /qa + /review — embedded per cluster spec
- ✅ Context7 — N/A design session
- ✅ Tavily/WebSearch — N/A
- ✅ GitNexus — N/A design phase chat-side; MANDATORY pre-execution per CLAUDE.md (gitnexus_impact + gitnexus_detect_changes)

🦫 Bugatti craft. D044 LOCKED V1 design LANDED. Iter 1 mass fix orchestrator ~340 atomic tasks / 28 BATCH-uri ready execution. Daniel CEO approve gate → trigger BATCH_C1 Wave 1.
