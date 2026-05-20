---
title: BATCH Index — All 28 CC Autonomous BATCHes
status: DESIGN_LANDED
purpose: Single index referencing all BATCH_NN.md files cu task ranges + dependencies + ETA
---

# _BATCH_INDEX — Iter 1 BATCH Master List

## Wave 1 — Critical path (4 BATCHes, sequential)

| BATCH | Cluster | Tasks | Pre-req | Parallel | ETA | Theme |
|-------|---------|-------|---------|----------|-----|-------|
| **BATCH_C1** | C | C001-C008 (8 tasks) | Daniel CEO approve design | sequential within | ~3-4h | **Auth Chain** — sendMagicLink wire + Mock login DEV gate + ProtectedRoute Firebase listener + Sentry init + AuthCallback verify + Onboarding gate + SettingsDanger re-auth |
| **BATCH_D1** | C+D | C056-C058 + A121-A124 + D014 (8 tasks) | BATCH_C1 | sequential within | ~3-4h | **index.html + CSP + Sentry init + console strip + deploy.yml test gate** |
| **BATCH_C2** | C | C009-C010 (2 tasks) | BATCH_D1 | sequential within | ~2-3h | **Coach engine wire** — CoachTodayCard + CoachRestCard (closes 5 CRIT) |
| **BATCH_C3** | C | C011-C018 (8 tasks) | BATCH_C2 | C011 BLOCKS C012-C018 then parallel | ~3-4h | **ConfirmModal shared + 7 use sites** (closes 7 CRIT) |

**Wave 1 total: ~12-15h sequential, 26 tasks LANDED.**

---

## Wave 2 — Cluster A (8 BATCHes, parallel-safe)

| BATCH | Tasks | ETA | Theme |
|-------|-------|-----|-------|
| BATCH_A1 | A001-A025 (25 tasks) | ~3-4h | Text swaps Wave A: Antrenor + Splash + Auth + first 5 sub-screens text fidelity |
| BATCH_A2 | A026-A050 (25 tasks) | ~3-4h | Text swaps Wave B: Progres + Istoric + Cont + EnergyCheck + EnergyCause + WorkoutPreview |
| BATCH_A3 | A051-A070 (20 tasks) | ~3-4h | Text swaps Wave C: Workout + PostRpe + PostSummary + Wave C/D/E batch + Pass 2 sub-comp text |
| BATCH_A4 | A071-A095 (25 tasks) | ~3-4h | Pass 4 polish per-file 1: font-weight + padding asymmetric Antrenor + Splash + 10 sub-screens |
| BATCH_A5 | A096-A120 (25 tasks) | ~3-4h | Pass 4 polish per-file 2: border-radius + margin/gap/icon misc 15 NIT |
| BATCH_A6 | A121-A135 (15 tasks) | ~2-3h | Surgical security/hygiene: env vars + Magic Link throttle + Sentry config + as any removes |
| BATCH_A7 | A136-A145 (10 tasks) | ~2h | Emoji traffic-light + a11y aria + autocomplete + tap targets + T&C timestamp |
| BATCH_A8 | A146-A180 (35 tasks) | ~4-5h | JSDoc + misc surgical (App.tsx delete + persona hoist + manifest verify + 25 catch-all LOW) |

**Cluster A total: ~25-30h cumulative across 8 BATCHes (~180 tasks).**

---

## Wave 2 — Cluster B (5 BATCHes, sequential within cluster)

| BATCH | Tasks | Pre-req | ETA | Theme |
|-------|-------|---------|-----|-------|
| BATCH_B1 | B001-B004 (4 tasks) | — | ~2-3h | **Vanilla legacy archive** (closes ~30 individual findings cluster) + dual SW resolve |
| BATCH_B2 | B005-B015 (11 tasks) | BATCH_B1 | ~2-3h | Dead code post-vanilla + BodyData decision dep on E007 |
| BATCH_B3 | B016-B025 (10 tasks) | BATCH_B2 | ~1.5h | TODO/FIXME resolutions sweep |
| BATCH_B4 | B026-B040 (15 tasks) | BATCH_B3 | ~2-3h | Standards alignment + dead-code surgical |
| BATCH_B5 | B041-B050 (10 tasks) | BATCH_B4 | ~2h | Engineering standards |

**Cluster B total: ~10-13h cumulative across 5 BATCHes (~50 tasks).**

---

## Wave 2 — Cluster C BATCHes 4-8 (5 BATCHes, semi-parallel)

| BATCH | Tasks | Pre-req | ETA | Theme |
|-------|-------|---------|-----|-------|
| BATCH_C4 | C019-C033 (15 tasks) | — | ~4-5h | **SubHeader shared + 15 use sites** (Pattern P1 closes 15 findings) |
| BATCH_C5 | C034-C036 (3 tasks) | — | ~3-4h | **WorkoutPreview 3 missing sections** (Session header + Warmup + Exercise list) |
| BATCH_C6 | C037-C041 (5 tasks) | — | ~5-6h | **Istoric heatmaps + Antrenor Obiectiv 6-row + CoachDeloadCard + Progres Alerte azi** |
| BATCH_C7 | C042-C049 (8 tasks) | BATCH_C4 (SubHeader) | ~5-6h | **Sub-screen sections + SessionTimer menu + RestOverlay SVG ring** (Compozitie + Tinte + Avatar engine + Danger warning + grace) |
| BATCH_C8 | C050-C080 (31 tasks) | BATCH_C4 (SubHeader for new sub-screens) | ~6-8h | **MISSING screens new + misc TBC** (weight-timeline + loguri-greutate + support + about + faq + themes + 25 misc) |

**Cluster C remaining (post-Wave-1): ~23-29h cumulative across 5 BATCHes (~62 tasks).**

---

## Wave 2 — Cluster D BATCHes 2-7 (6 BATCHes, sequential)

| BATCH | Tasks | Pre-req | ETA | Theme |
|-------|-------|---------|-----|-------|
| BATCH_D2 | D002 (1 task large) | BATCH_B1 | ~3-4h | **Tailwind ↔ CSS vars migration** (cascade safe single-task large) |
| BATCH_D3 | D001 + D003 (2 tasks large) | BATCH_D2 | ~5-6h | **Bundle code-split + ESLint install** |
| BATCH_D4 | D006-D010 (5 tasks) | BATCH_D3 | ~6-8h | **Zod boundaries + Branded types + FSM discriminated unions** |
| BATCH_D5 | D004 + D005 + D011-D013 (5 tasks) | BATCH_D4 | ~4-5h | **Persona hoist + Inter font self-host + reduced-motion + skip-link + autocomplete** |
| BATCH_D6 | D019-D024 (6 tasks) | BATCH_D5 | ~6-8h | **GDPR + Backup/DR + Tier 0/1/2 verify** |
| BATCH_D7 | D015-D018 + D025-D030 (10 tasks) | BATCH_D6 | ~5-6h | **Engine math + PWA + FSM verify + Firebase rules CLI + telemetry opt-in + DST + i18n + library 657 + Phase 5+6 BATCH verify + Mode Detection FSM + Beta entry checklist sign-off final** |

**Cluster D remaining (post-Wave-1): ~29-37h cumulative across 6 BATCHes (~29 tasks).**

---

## §S Totals

| Wave | BATCHes | Tasks | ETA Opus | ETA elapsed (hybrid 2-session) |
|------|---------|-------|----------|--------------------------------|
| **Wave 1 critical** | 4 | 26 | 12-15h | 2 days (single-session) |
| **Wave 2 Cluster A** | 8 | 180 | 25-30h | 3-4 days (1 session) |
| **Wave 2 Cluster B** | 5 | 50 | 10-13h | 1.5-2 days (interleaved) |
| **Wave 2 Cluster C** | 5 (excl C1-C3) | 62 | 23-29h | 3-4 days (1 session) |
| **Wave 2 Cluster D** | 6 (excl D1) | 29 | 29-37h | 4-5 days (1 session) |
| **Wave 3 Cluster E** | N/A (Daniel) | 20 | — | 3-5 days (Daniel discussion + CC implement) |
| **Iter 1 EXIT audit** | 1 audit | — | 12-15h | 2 days |
| **TOTAL** | **28 + 1 audit** | **340 + 20 + audit** | **~110-140h CC** | **~14-22 calendar days** |

---

## §T BATCH file generation strategy

**At design time (this session):**
- ✅ ORCHESTRATOR.md (anchor)
- ✅ _MASTER_BACKLOG.md (atomic task SoT)
- ✅ _DAG.md (dependency graph)
- ✅ _BATCH_INDEX.md (this file)
- 🟡 BATCH_C1.md sample (Wave 1 first BATCH detailed)
- 🟡 BATCH_A1.md sample (Wave 2 parallel-safe surgical sample)
- 🟡 task_NNN.md 5 templates (one per cluster + Wave 1 critical)

**At execution time (per-BATCH session CC autonomous):**
- CC reads BATCH_NN.md spec
- CC expands each task line item → inline `task_<NNN>_<short>.md` per atomic finding fix
- CC executes per task: pre-flight read → implement → test → commit atomic
- CC updates `_progress.md` post-BATCH milestone

**Rationale:** generating all 340 task_NNN.md files at design time = ~340 files × ~80 LOC = ~27k LOC churn-prone artifacts. Sample 5 templates + execution-time expansion = ~50 LOC × 340 = ~17k LOC distributed across BATCH sessions, generated cu fresh GitNexus context per BATCH. Better signal-to-noise ratio.

---

🦫 **_BATCH_INDEX — 28 BATCHes + 1 audit. Total ~110-140h CC autonomous + ~3-5 days Daniel Cluster E. Iter 1 EXIT target ~14-22 calendar days.**
