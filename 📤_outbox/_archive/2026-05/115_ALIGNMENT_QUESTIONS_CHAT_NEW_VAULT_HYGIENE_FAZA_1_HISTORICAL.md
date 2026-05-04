# ALIGNMENT QUESTIONS — Chat Strategic NEW (post Vault Hygiene Faza 1 + Decizii Strategice ingest 2026-05-03)

**Owner:** CC Opus (generate per VAULT_RULES §HANDOVER_PROTOCOL step 9 + memory rule #22).
**Pass criteria:** ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW (Faza 3 + Faza 4 Vault Hygiene execution sau Auth Flow per Daniel decision).
**Source:** Vault SSOT post-merge `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.93-§36.98 + ADR 023 §Reconsideration Trigger #2 update + DIFF_FLAGS P2-FLAG-1 update.

---

## Q1: D3 Cloud Functions decision LOCKED?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.93 D3 LOCKED B + DIFF_FLAGS.md P2-FLAG-1 D3 RESOLVED.

**Răspuns verbatim:** **B Spark Plan retain LOCKED**. Cloud Functions Blaze upgrade RESPINS pre-Beta. Rationale calcul real: 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier (14400/zi limit). Cost cap €10/lună = paranoia, NU nevoie reală. Bootstrap-aware Bugatti: scale când e problemă reală, NU ipotetică. Reconsider triggers: revenue confirmed / Groq deprecation / demand spike >5% free tier (~720 calls/zi → ~250 useri activi). D6 = frontend-only soft cap (depinde D3=B). NEW-IDEATION-5 backend cost monitoring DEFERRED post-revenue.

---

## Q2: ADR 025 candidate decision wording și aplicabilitate?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.94 ADR 025 candidate.

**Răspuns verbatim:** **"Aplicabilitate: ALL features V1 + V1.5 + V2+ permanent. Mecanism: graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional. Filtru pre-feature LOCK: 'Dacă user ignoră complet feature, app-ul tot funcționează rezonabil?' DA → eligible LOCKED. NU → REJECTED indiferent tech sophistication."** Origin story: Excel "câte kg la leg press" 13 zile → app coach AI fitness Bugatti paradigm. Articulare retroactivă a principiului fondator implicit în deciziile bune existente. Status: candidate, file `03-decisions/025-andura-gandeste-pentru-user.md` PENDING file creation Faza 3.

---

## Q3: ADR Numbering Additive rule + ADR 022 ORPHAN-1 split?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.95.

**Răspuns verbatim:** ADR Numbering Additive Rule LOCKED — ZERO renumber existing, additive curat zero collision. ADR 023 LLM Intent existent **NU renumber**. Split ORPHAN-1: **ADR 022 = Bayesian Nutrition Inference** (PENDING file create) + **ADR 024 = Goal-Driven Program Templates** (PENDING file create) + **ADR 025 = Andura Gândește pentru User / Graceful Degradation Universal** (§36.94 candidate, PENDING file create). Toate 3 file creation Faza 3 cleanup.

---

## Q4: Vault Hygiene Sprint priority order?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.96.

**Răspuns verbatim:** **Vault Hygiene Sprint = Priority 0 promovat înaintea pre-Beta blockers + Auth Flow §36.80**. Rationale: Daniel NU citește vault (psihic imposibil) — vault e pentru Claude chat + CC Opus. Drift cumulativ → halucinare risc + indexare cost + inconsistențe răspuns chat-uri viitoare. Fragmentări SSOT (Goal 5 + Onboarding 5 + Pricing 4 + Mode Detection 3 + RPE/RIR 3) + 4 ADR drift + 22 orphan wikilinks + DECISION_LOG UTF-8 broken + INDEX_MASTER stale 3 zile + HANDOVER_GLOBAL 5443 LOC mega-fișier blochează decizii downstream calitate. **ZERO cod până vault clean** (sequencing strict).

---

## Q5: 8 recomandări APROBATE — care în detaliu?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.96 + `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` §7.

**Răspuns verbatim:** Per Daniel directive "decide tu, e pentru tine" → 8 recomandări APROBATE Co-CTO 100% delegation: **A** HANDOVER_GLOBAL split = Option C (Active 30 zile + Archive cronologic per lună); **B** Goal Taxonomy + Onboarding SSOT consolidare = hybrid C deja LOCKED §36.92 D4 → `01-vision/ONBOARDING_SSOT_V1.md` exhaustiv; **C** INDEX_MASTER refresh complete (stats 62+ files, pricing €39/€59/€79, ADR 023 + 8 drafts + 022/024/025 stubs add); **D** Archive policy = PĂSTREAZĂ audit pass 1-9 raw + sessions istorice ca audit trail permanent; **E** Folder restructuring = NU change (exception DIFF_FLAGS root → 05-findings-tracker/); **F** Orphans cleanup 22 wikilinks MISSING + 3 UNREFERENCED (19 LOW delete + 4 MEDIUM EXEC_QUEUE rename → INSIGHTS_BACKLOG); **G** ADR 022 split fizic per ADR Numbering Additive (§36.95) — 022 + 024 + 025 stubs create; **H** DECISION_LOG.md UTF-8 re-save (chars `â€™`, `Ã¢`, `Â§` proliferate).

---

## Q6: Faza 4 VAULT_HYGIENE_PASS rule spec?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.97 + `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` §8.

**Răspuns verbatim:** Extension comenzii standard "Ingest handover from inbox" cu STEP 10-15 vault hygiene mandatory automat. NU optional, NU prompt separat, parte din ingest flow. **STEP 10:** Detect new SSOT fragmentation. **STEP 11:** Detect new orphans. **STEP 12:** Detect ADR drift. **STEP 13:** Detect HANDOVER size threshold. **STEP 14:** Auto-fix mecanic safe. **STEP 15:** Flag DIFF_FLAGS dacă consolidare manuală necesară. Effort run ~10-15min CC autonomous per ingest. Codification PENDING Faza 3-4: VAULT_RULES.md root §VAULT_HYGIENE_PASS NEW + PROMPT_CC_INGEST_HANDOVER.md update.

---

## Q7: Cumulative LOCKED count cumulativ post acest ingest?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` session-lock 2026-05-03 VAULT HYGIENE SPRINT FAZA 1.

**Răspuns verbatim:** Decizii cumulative pre-launch V1 = **87** (85 → 87, +2: §36.93 D3 LOCKED B + §36.94 ADR 025 candidate Andura Gândește). §36.95 META Numbering Additive +0 + §36.96 Vault Hygiene Sprint Priority 0 +0 + §36.97 META rule LOCK PENDING +0 + §36.98 System Prompt artefact +0 = +0 each. Toate 4 META operations zero cumulative count contribution.

---

## Q8: Decision points D1-D6 status post acest chat?

**Citation:** `DIFF_FLAGS.md` P2-FLAG-1 update.

**Răspuns verbatim:** **D2/D3/D4/D5/D6 RESOLVED Co-CTO; D1 only remaining strategic.**
- D1 Save the week silent: **🟡 PENDING** strategic dedicat post-Vault Hygiene + Auth Flow (A passive intelligence / C in-app banner pasiv, NU B opt-in)
- D2 §36.86b DELOCK Mechanism: ✅ RESOLVED ACCEPT propunere wording verbatim Co-CTO
- D3 Cloud Functions Blaze: ✅ RESOLVED B Spark plan retain (§36.93)
- D4 Goal Taxonomy: ✅ RESOLVED hybrid C (deja LOCKED §36.92)
- D5 Sprint Vault Hygiene Q2 2026: ✅ SUPERSEDED Vault Hygiene Sprint = Priority 0 acum (NU Q2 deferred)
- D6 ADR 023 cost monitoring: ✅ RESOLVED B frontend-only soft cap (depends D3=B)

---

## Q9: P1-FLAG-1 ADDENDUM source upload status?

**Citation:** `DIFF_FLAGS.md` P1-FLAG-1 update + handover §8.

**Răspuns verbatim:** **🟡 PARTIALLY MITIGATED 2026-05-03** — Faza 3 va integra direct sub-secțiuni A-M ADR 023 din addendum context window în chat strategic original (NU file upload separate). Original raised 2026-05-03 audit total ingest. RESOLVED post-Faza 3 execution.

---

## Q10: Faza 3 + Faza 4 next chat NEW execution scope?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` session-lock Next + handover §6.

**Răspuns verbatim:** **Priority 0 ABSOLUT Faza 3 + Faza 4 Vault Hygiene Sprint execution** chat NEW dedicat. **Faza 3 prompt CC Opus (~2-3h CC autonomous)** — 8 recomandări A-H execute mecanic: A HANDOVER_GLOBAL split Option C + B Onboarding SSOT V1 + C INDEX_MASTER refresh + F orphans cleanup + G ADR 022/024/025 stubs + H DECISION_LOG UTF-8 fix + 3 anomalies outbox cleanup (SPRINT_4X archive + HANDOVER_INPUT unnumbered + DIFF_FLAGS root → 05-findings-tracker/). **Faza 4 prompt CC Opus (~30min CC)** — VAULT_RULES.md §VAULT_HYGIENE_PASS NEW + PROMPT_CC_INGEST_HANDOVER.md STEP 10-15 codification.

---

## Q11: Auth Flow §36.80 Priority 1 ABSOLUT preserved?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.80 + session-lock Next post-Vault Hygiene.

**Răspuns verbatim:** **DA, preserved separat post-Vault Hygiene** clean. §36.80 BUG 2 Firebase 401 auth flow NOT WIRED = blocking Beta. Estimate: chat strategic ~1-2h Daniel-time + prompt CC Opus dedicat ~30-45min autonomous factor 7-9x: wire `/auth-callback` route + `createAuthScreen` integration main shell + `LEGACY_USER_PATH` fallback strategy update block-render-until-auth NU fallback users/daniel + Tests Playwright e2e Magic Link + Google OAuth mock + smoke prod verification user nou vede auth screen NU dashboard direct.

---

## Q12: Status V1 cumulative + tests baseline?

**Citation:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` session-lock 2026-05-03 VAULT HYGIENE Status V1.

**Răspuns verbatim:** Status V1: 8/8 templates LOCKED + F-NEW + MMI + Storage Full UX + 4 CRITICAL pre-Beta blockers + 12 HIGH cleanup + Top 6 ideation + **87 decizii LOCKED cumulative** + Beta-launch ASAP timing flexible §36.83 + Suflet Andura + filozofia 12k + Self-Correction + Chat C + Pricing tiers + Telegram channel + 8 ADR drafts ALL LOCKED V1 + ADR 023 LOCKED V1 partial spec + ⚠️ PENDING addendum integration Faza 3 + Phase B 51 strings INTEGRATED + Cluster 10-batch foundation tests **1203/1203 PASS** unchanged + Coverage/Build baselines + Sprint UI Sequencing LOCKED V1 + Daniel solo gate Firebase live + Sprint UI 6 UX LOCKED V1 + Slip Log §36.77 + Andura V1 prod LIVE `andura.app` ✅ + §36.78-§36.79 Rebrand+Hotfix + §36.80 BUG 2 Auth Flow Priority 1 ABSOLUT preserved + §36.81-§36.85 Coach/Energy/META/Backlog/Body Region + Memory #24 + §36.86-§36.91 audit total + §36.92 reclasificare 4 buckets + DIFF_FLAGS P1+P2 + **§36.93-§36.98 Vault Hygiene Sprint Faza 1 + decizii strategice**.

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW. <10/12 = RE-SYNC mandatory. Cumulative 87 LOCKED. Vault Hygiene Sprint Priority 0 Faza 3+4 PENDING. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. ADR Numbering Additive 022 + 024 + 025 PENDING file creation Faza 3. ADR 025 candidate filtru pre-feature LOCK forward-looking.**
