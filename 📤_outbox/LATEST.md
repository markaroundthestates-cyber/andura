# Iter 1 Mass Fix V2 Design LANDED + D045 LOCKED V1 — Daniel CEO Approve Gate

**Status:** V2 Design phase LANDED 2026-05-20 evening ACASĂ. D045 LOCKED V1 — supersedes D044 v1 (stale-baseline). Pending Daniel CEO approve → trigger Wave A execution.
**Last LANDED:** 8 artefacte design V2 `📥_inbox/iter-1-mass-fix-v2/` + DECISIONS.md D044 → SUPERSEDED-BY-D045 + D045 LOCKED V1 + inbox/outbox curățare
**Procedure:** D042 + D043 LOCKED V1 ABSOLUTE — Beta gate ZERO bug-uri dual-source convergence
**Model:** Opus 4.7 EXCLUSIVELY
**Stop trigger UNIC:** Daniel STOP explicit

---

## §0 Why V2 — D044 v1 stale-baseline halucinație

V1 design (D044 LOCKED V1 birou 2026-05-20) a fost generat de chat birou pe baseline raw 698+263 findings = 961 total, **assumed ALL 698 audit nuclear OPEN**. NU a verificat HEAD curent vs audit date `b705c3f` (2026-05-19) — Phase 7 D031 closure window 2026-05-19 → 2026-05-20 LANDED ~58 fixes. V1 BATCH_C1 Wave 1 task list = ~4 din 8 tasks DEJA LANDED Phase 7:
- `Auth.tsx` `§7-C1 + §7-C2 audit fix` headers VERBATIM
- `ProtectedRoute.tsx` `§7-C3 audit fix`
- `main.tsx` `§4-C1 + §13-H3 + §13-H4 audit fix`
- `index.html` + `vite.config.js` + `deploy.yml` + `ErrorBoundary.tsx` + `sentry.js` + `eslint.config.js` + `AuthCallback.tsx` (iter 9.6) toate LANDED

Daniel push-back ACASĂ 2026-05-20 evening: *"orchestratorul nu trebuia facut de chatul vechi. E de datoria ta sa il citesti si verifici"*. Co-CTO ACASĂ verificat 9 prod files verbatim grep `§X-Y audit fix` pattern → confirmat ~58 LANDED ignorate v1. → fresh V2 design HEAD-verified baseline.

**Daniel directive verbatim:** *"961 total findings? Aproximativ. Faci prompt/atomic/batch cu multe files (cate vrei tu), 1 chat sau mai multe... orchestrator si tot ce mai trebuie, cat sa acoperi cat mai mult din cele 961. Dupa sa ne ramana cateva punctuale. Si inainte sa incepi fa ceva cu ce e in plus la mine in inbox/outbox"*.

---

## §1 V2 Design final metrics (D041 anti-inflation)

**Source baseline corrected:**
- Audit Nuclear `b705c3f` 2026-05-19: 698 raw - ~58 Phase 7 LANDED = **~640 remaining**
- Mockup Parity `caaae99` 2026-05-20: 263 raw - 13 OK = **~250 actionable**
- Overlap dedup: ~6
- **Net actionable remaining: ~870 findings raw**

**Pattern collapse + aggregation:**
- Pass 4 polish per-file: ~60 → ~20 tasks (-40)
- Per-screen text aggregation: ~70 → ~25 (-45)
- Vanilla legacy archive cluster: ~30 → 1 (-29)
- Coach engine wire: 5 → 2 (-3)
- **Total collapse: -117 tasks**
- **Net atomic remaining: ~305 atomic tasks** (post Wave D multi-file bundling)

**4 mega-Waves architecture (NU 28 BATCH-uri micro):**

| Wave | Cluster axis | Tasks | ETA Opus | Daniel paste prompt |
|------|--------------|-------|----------|---------------------|
| **A** | Critical real OPEN + Coach + ConfirmModal + Bundle + GDPR + a11y + PWA + Prod ops + Backup/DR + DB tier + Engine math + Beta entry checklist | ~40 | ~12-16h | `PROMPT_CC_iter1_wave_a_critical_real.md` |
| **B** | Surgical text + tokens + Pass 4 polish per-file | ~150 | ~25-30h | `PROMPT_CC_iter1_wave_b_surgical_text_polish.md` |
| **C** | Components (SubHeader + 15 uses, WorkoutPreview rich, Istoric heatmaps, MISSING screens NEW, sub-screen sections) + Simplicity (vanilla archive) | ~80 | ~25-30h | `PROMPT_CC_iter1_wave_c_components_simplicity.md` |
| **D** | Goal-Driven multi-file refactor (Zod + Branded + FSM + GDPR full + Backup/DR + Tailwind CSS vars + Inter font + Engine math + DST + Beta entry checklist + Prod ops + Trust&Safety + Supply chain) | ~35 | ~20-25h | `PROMPT_CC_iter1_wave_d_goal_driven_refactor.md` |
| **TOTAL CC autonomous** | — | **~305** | **~82-101h** | 4 prompts |
| **Cluster E Daniel paradigm** | SettingsPrefs swap + CevaNuMerge + PainButton + EquipmentSwap + AparateLipsa + Phase 6 prod-extras + 22 wording + 6 misc | ~20 | N/A | Daniel sessions 3-5 days parallel |

**Hybrid parallel option:** Post Wave A LANDED, Daniel poate spawn Wave B + Wave C concurrent sessions (LOW collision risk per `_DAG.md §2`). Wave D sequential post B+C.

**ETA codified:**
- Single-session sequential: ~15 calendar days (Wave A + B + C + D + EXIT audit)
- Hybrid 2-session parallel: ~11 calendar days
- Iter 2 Pareto residual ~50%: ~5-7 calendar days
- Iter 3 residual (if needed): ~3-5 days
- Daniel single smoke a-z: ~1-2 days
- **Total Beta gate path D042+D043: ~20-30 calendar days** post V2 design approve

---

## §2 Artefacte V2 LANDED `📥_inbox/iter-1-mass-fix-v2/`

| File | Purpose |
|------|---------|
| `ORCHESTRATOR.md` | Master V2 spec ~10k chars — Phase 7 LANDED examples + 4 Wave architecture + per-task pre-flight protocol + iter EXIT criterion |
| `_MASTER_BACKLOG.md` | 305 atomic tasks SoT ~14k chars TSV-table — Wave A/B/C/D + Cluster E + Karpathy attribution + Effort + Source per task |
| `_DAG.md` | Mermaid dependency graph ~5k chars — critical path + Wave A internal deps + Wave C internal deps + Wave D internal deps + parallel-safety analysis Wave B+C |
| `_progress.md` | Checkpoint per Wave + Cluster E + Iter EXIT + aggregate metrics expected post-iter-1 (~49-65% closure projection) |
| `PROMPT_CC_iter1_wave_a_critical_real.md` | Wave A mega-prompt ~7k chars — Daniel paste new CC session ACASĂ → CC autonomous execute 40 tasks |
| `PROMPT_CC_iter1_wave_b_surgical_text_polish.md` | Wave B mega-prompt — 150 tasks surgical text + Pass 4 polish + emoji + JSDoc + misc |
| `PROMPT_CC_iter1_wave_c_components_simplicity.md` | Wave C mega-prompt — 80 tasks vanilla archive + SubHeader + WorkoutPreview rich + Istoric heatmaps + 6 MISSING screens NEW + sub-screen sections |
| `PROMPT_CC_iter1_wave_d_goal_driven_refactor.md` | Wave D mega-prompt — 35 tasks Zod + FSM + GDPR full + Bundle full + Beta entry checklist + Prod ops + Trust&Safety + Supply chain |

---

## §3 D045 LOCKED V1 — supersedes D044

**D045** (PROC LOCKED V1): *"Iter 1 Mass Fix Orchestrator V2 LANDED HEAD-verified — 4 mega-Waves architecture ~305 atomic tasks post pattern-collapse + per-screen aggregation + vanilla legacy archive cluster. Per-task pre-flight HEAD verify MANDATORY anti-stale-baseline D029 lesson (grep '§<id> audit fix' în prod → NO-OP skip if Phase 7 LANDED ~58 fixes verified verbatim). Cluster E paradigm Daniel deferred ~20 items. ETA ~85-110h CC Opus = ~11-15 calendar days iter 1 hybrid 2-session parallel mode."* Source: `DECISIONS.md §D045`.

**D044 status flip:** `LOCKED V1` → `SUPERSEDED-BY-D045` per D007 enforcement rule schema. Source path D044 updated la `📥_inbox/_CONSUMED/iter-1-mass-fix_STALE-DESIGN-2026-05-20/` post archive move.

---

## §4 Curățare inbox/outbox LANDED 2026-05-20 evening

**Inbox curat (per Daniel directive "fa ceva cu ce e in plus la mine in inbox/outbox"):**
- ✅ `PROMPT_CC_iter_8_track_7_ci_debug.md` → `_CONSUMED/` (suffix `_inbox-v1-pre-final`)
- ✅ `PROMPT_CC_mockup-vs-prod-parity-2026-05-20.md` → `_CONSUMED/`
- ✅ `PROMPT_CC_mockup-vs-prod-parity-CONTINUE-2026-05-20.md` → `_CONSUMED/`
- ✅ `PROMPT_CC_mockup-vs-prod-parity-PASS5-2026-05-20.md` → `_CONSUMED/`
- ✅ `iter-1-mass-fix/` (entire v1 folder) → `_CONSUMED/iter-1-mass-fix_STALE-DESIGN-2026-05-20/`

**Inbox final state:** `.gitkeep` + `_CONSUMED/` + `iter-1-mass-fix-v2/` (8 artefacte V2 design).

**Outbox active (no changes — toate active reference):**
- `LATEST.md` (this file — V2 design LANDED state)
- `TRACK_7_FINAL_SMOKE_CHECKLIST.md` — Daniel §7.10 mobile manual smoke awaiting (defer per iter 1 EXIT)
- `audit-nuclear-2026-05-19/` — V3 audit baseline
- `mockup-vs-prod-parity-2026-05-20/` — mockup parity baseline + 54 PNG visual proof
- `_archive/` — historical LATEST snapshots

---

## §5 Next P1 — Daniel CEO approve V2 + trigger Wave A

**Daniel CEO approve checklist:**
1. Read `📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md` §0 + §1 + §2 (exec summary + Phase 7 LANDED examples + 4 Wave structure)
2. Skim `_MASTER_BACKLOG.md` head 80 lines (Wave A) — verify task format + Karpathy attribution
3. Read `PROMPT_CC_iter1_wave_a_critical_real.md` (Wave A first mega-prompt) — verify execution-ready spec
4. Decision: approve OR push-back specific item OR ask question

**Post-approval trigger Wave A:**
- Open NEW CC session ACASĂ post `git pull`
- Paste content of `PROMPT_CC_iter1_wave_a_critical_real.md` → CC autonomous Wave A execution ~12-16h Opus continuous
- Per task atomic commit + push manual final post-Wave-A LANDED
- Post Wave A LANDED → Daniel decide: trigger Wave B sequential OR Wave B + C parallel (per `_DAG.md §2`)

---

## §6 Pending Daniel-action

1. Pull acasă: `git pull origin main` post commit LANDED (V2 design + DECISIONS.md D045)
2. Read V2 design artefacte → approve OR push-back
3. Post-approve: paste `PROMPT_CC_iter1_wave_a_critical_real.md` în NEW CC session → Wave A starts
4. Cluster E paradigm Daniel sessions can start parallel cu Wave A/B/C execution (3-5 short discussions ~30min each, total ~5-6h Daniel time)
5. Optional: Daniel decide hybrid 2-session parallel mode post Wave A LANDED

---

## §7 Production readiness honest D041

- Audit Nuclear D029: 56.5% factual measured @ `b705c3f` 2026-05-19 (698 findings)
- Mockup-vs-Prod Parity: **~36% measured** @ `caaae99` 2026-05-20 (263 findings, 54 PNG visual proof)
- Phase 7 D031 LANDED: ~58 audit nuclear closures verified verbatim grep prod
- Estimated post iter 1 V2 LANDED (NOT measured): ~70-80% production readiness + ~70-80% mockup parity (per ~49-65% findings closure projection)
- Real measurement TBD via iter 1 EXIT audit V4 post-iter-1 LANDED

---

## §8 Skills used Co-CTO V2 design session ACASĂ

- ✅ Sequential Thinking — Phase 7 closure pattern detection + Wave cluster strategy reasoning
- ✅ Karpathy 4 principii — Wave axis primary (A=SC/SF, B=SC, C=TBC/SF, D=GD)
- ✅ Anti-halucinare D008 — sampled prod files Auth.tsx + main.tsx + ProtectedRoute.tsx + sentry.js + index.html + vite.config.js + deploy.yml + ErrorBoundary.tsx + eslint.config.js + AuthCallback.tsx + router.tsx verbatim
- ✅ Impeccable /critique — self-review v1 vs HEAD state revealed ~58 LANDED → v2 baseline corrected
- ✅ /qa + /review embedded per Wave spec
- 🔲 GitNexus — N/A V2 design phase chat-side; MANDATORY pre-execution per CLAUDE.md (gitnexus_impact + gitnexus_detect_changes per task Wave execution)
- 🔲 Context7 — N/A V2 design phase; available at Wave execution time

---

## §9 Anti-recurrence invariants V2

- **D008** primary-source verify mandatory per task (read file line cited verbatim, NO recall)
- **D029 stale baseline lesson** — per-task HEAD grep `§<id> audit fix` mandatory pre-execute
- **D023** MCP filesystem write_file pentru vault writes (Windows emoji paths)
- **D031** push manual final per Wave, NU per task — preserve `f40ebbc` Stop hook D030
- **D041** anti-inflation per-task report explicit "Closed N findings", NU compound
- **D-LEGACY-064** Romanian no-diacritics în any UI surface touched
- **Karpathy 4 principii** explicit attribution per task commit message format `fix(wave-X-NNN): <title> (<source>) [<karpathy>]`

---

🦫 **Iter 1 Mass Fix V2 LANDED design 2026-05-20 evening ACASĂ. D045 LOCKED V1 supersedes D044. 305 atomic tasks across 4 mega-Waves. Per-task HEAD-verify mandatory anti-stale-baseline. Pending Daniel CEO approve → Wave A trigger.**
