# ALIGNMENT VERIFICATION QUESTIONS — Pre Rebrand Sweep + Re-spec Sprint UI

**Generat:** 2026-05-03 post handover ingest §36.76 + §36.77
**Scope:** 10 Q-uri verification-driven pentru chat strategic NEW (Project Andura) — TREBUIE să citească vault real + raporteze evidence cu citate verbatim
**Cumulative LOCKED state target:** **70** (post §36.76 6 UX LOCKED V1 + §36.77 slip log)
**Output mandatory:** ALIGNMENT_SCORE final 0-10 cu discrepancies list

---

## ⚠️ MANDATORY READ FIRST — REGULI EXECUȚIE ⚠️

**1. NU citi DOAR acest document.** Sursa adevărului = `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` + `VAULT_RULES.md` + `03-decisions/ADR_*.md` + `📤_outbox/LATEST.md` + `📤_outbox/_archive/2026-05/BATCH_UI_01_REPORT.md`.

**2. Format răspuns OBLIGATORIU per Q:**
```
[Q[N]/10] [PASS|PARTIAL|FAIL]
Files searched: [path1, path2]
Evidence: "<citat verbatim 1-2 propoziții>"
Match: [confirmed / discrepancy: <detail>]
```

**3. La final RAPORT AGGREGATE OBLIGATORIU:**
```
ALIGNMENT_SCORE: X/10
Verdict: [PROCEED rebrand sweep / RE-SYNC needed first]
Discrepancies (if any):
- [Q[N]: <detail>]
Recommended action: [<one-line>]
```

**4. NU aproxima scor. NU "depinde". Dacă <8/10 → RE-SYNC mandatory înainte continuare.**

**5. Chat strategic NEW deschis în Project Claude = "Andura"** (rebrand cross-platform consolidation). Path actual repo = `salafull/` până post-sweep §30.

---

## §1 — STATE CUMULATIV (Q1-Q3)

### [Q1/10] Cumulative LOCKED count = 70?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Verifică:**
- Cea mai recentă session-lock entry (EOF) menționează "70 decizii LOCKED cumulative"
- Breakdown: 12 + 11 + 8 + 14 + 8 + 1 + 2 + 4 cluster + §36.71 + §36.72 + §36.73 + §36.74 + §36.75 + §36.76 = 70

**Citează:** linia exactă "70 decizii LOCKED cumulative" + breakdown specific (cu §36.76 included).

---

### [Q2/10] §36.76 conține 6 decizii UX LOCKED V1 cu opțiunile A/B/C/etc. corecte?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.76
**Verifică table cu 6 Q-uri:**
- Q4 DOMS expand pattern = **A** (Link "Mai multe opțiuni ▼" inline expand, state NU persistă)
- Q5 Founding cap counter = **C** (HIDDEN TOTAL UI, atomic counter Firebase backend)
- Q6 3 Card buttons grouping = **B** (Split 2+1 Equipment row + Body row)
- Q7 Goal Shift card position = **C** (Settings menu only, scos din Dashboard)
- Q8 Telegram CTA placement = **B revizuit** (Onboarding 1× + Settings → Comunitate)
- Q-PROMPT Profile Validation = **C** (card persistent Dashboard)

**Citează:** wording LOCKED Q8 onboarding text exact (cu "Vrei să testezi alături de noi?").

---

### [Q3/10] §36.77 Slip Log + anti-recurrence rule prezent?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.77
**Verifică:**
- Status: Cluster Sprint UI 7-batch ABORTED pre-flight BATCH_UI_01
- Slip identification: Claude chat strategic React/JSX assumption peste vanilla JS ADR 005
- Anti-recurrence rule: pre-flight `project_knowledge_search` ADR framework ÎNAINTE primul artefact tehnic
- Cumulative impact: 0 (lessons learned, NU decision)

**Citează:** propoziția cu "anti-recurrence rule" sau "OBLIGATORIU pre-flight".

---

## §2 — REBRAND PRIORITY 1 (Q4-Q5)

### [Q4/10] §30 Rebrand SalaFull → Andura status = PENDING (Priority 1 ABSOLUT)?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §30 + EOF session-lock entry 2026-05-03
**Verifică:**
- §30 LOCKED 2026-05-01 RESUBMIT existent
- Sweep PENDING ÎNCĂ neexecutat
- Daniel decizie acest chat: PRIORITAR ÎNAINTE re-spec Sprint UI
- Project Claude = "Andura" cross-platform consolidation confirmed

**Citează:** propoziția cu "Priority 1 ABSOLUT" sau "Rebrand sweep §30 PENDING".

---

### [Q5/10] Sprint UI cluster status = ABORTED pre-flight cu Recovery Path A vanilla JS?

**Caută:** `📤_outbox/_archive/2026-05/BATCH_UI_01_REPORT.md` SAU `📤_outbox/_archive/2026-05/94_LATEST_PREVIOUS_SPRINT_UI_CLUSTER_ABORTED.md`
**Verifică:**
- Status: 🛑 STOP — Cluster ABORTED at pre-flight
- Reason: React/JSX assumed, vanilla JS reality (ADR 005)
- Foundation engines confirmed compatible (suflet-andura, smart-routing, pain-button etc.)
- Recovery Path A recommended: vanilla JS pattern matching `safetyBanner.js` factory function
- 7 prompts STILL în `📥_inbox/` (NOT archived) pentru re-spec

**Citează:** propoziția cu "Recovery Path A" SAU "factory function" din BATCH_UI_01_REPORT.

---

## §3 — VAULT FOUNDATION + ADRs (Q6-Q7)

### [Q6/10] 8 ADR drafts ALL LOCKED V1, 0 DRAFT pending?

**Caută:** `03-decisions/ADR_*.md` (8 fișiere expected)
**Verifică status header din fiecare:**
1. ADR_RIR_MATRIX_ADAPTIVE_v1
2. ADR_MODE_DETECTION_UI_v1
3. ADR_BIAS_DETECTION_OBSERVABLE_v1
4. ADR_OUTLIER_FILTER_v1
5. ADR_CASCADE_DEFENSE_v1
6. ADR_COMPOSITE_SIGNAL_LAYER_v1
7. ADR_PAIN_DISCOMFORT_BUTTON_v1 (cu EXT-1 DOMS hide)
8. ADR_SMART_ROUTING_EQUIPMENT_v1

**Toate header `**Status:** LOCKED V1`?** Citează status verbatim din 2-3 ADRs (random sample).

---

### [Q7/10] §BATCH_PROTOCOL.X codificat în VAULT_RULES.md cu rule "1 LATEST.md final"?

**Caută:** `VAULT_RULES.md` (root, NOT în `00-meta/`)
**Verifică:**
- Section `### §BATCH_PROTOCOL.X — Default Batches + Single Centralized Report (LOCKED V1 §36.74)` existent
- Conține regulile: N artefacte distincte + Daniel drag-drop + comandă unică + 1 LATEST.md final centralizat
- Cross-ref §36.74 prezent

**Citează:** prima propoziție a regulii MANDATORY default + cross-ref §36.74.

---

## §4 — TESTS + BUILD BASELINES (Q8-Q9)

### [Q8/10] Tests baseline = 1203 PASS / 75 files (unchanged post acest ingest)?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` EOF session-lock entry 2026-05-03 + §36.71
**Verifică:**
- Tests count = 1203 PASS
- Test files = 75
- Coverage = 60.33% lines / 78.38% branches
- Build = 4.026s / 921 KB / 283 KB gzipped

**Citează:** linia cu "1203 PASS" sau "1203/1203 unchanged".

---

### [Q9/10] Daniel solo gate technical Firebase 100% COMPLETE per §36.75?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.75
**Verifică table cu items DONE:**
- Firebase Auth Email/Password + Magic Link enabled
- Firebase Auth Google OAuth (project "Andura")
- User Auth UID Daniel `2GsDvxqXc4bvQGSm8B1Zft5S05i2`
- DB rules per-UID strict published
- Smoke test prod 401 Unauthorized confirmed

**Citează:** UID Daniel exact + status smoke test prod.

---

## §5 — NEXT STEPS (Q10)

### [Q10/10] Next chat priority order = Rebrand → Re-spec → Cluster execution → Smoke → Beta?

**Caută:** `📤_outbox/LATEST.md` (root outbox curent post acest ingest) §6 SAU EOF session-lock entry 2026-05-03 "Next:"
**Verifică ordine prioritară:**
1. Rebrand sweep §30 (~5h CC Opus dedicat)
2. Re-spec 7 BATCH_UI_NN vanilla JS pattern (~30-45 min strategic + ~2-3h CC actual)
3. Smoke tests prod gates B/C/D
4. Beta cohorts 3-tier 50 users §36.47 + §36.53 Telegram
5. Beta sept-dec 2026 → audit legal dec 2026 → Soft Launch 1 ian 2027

**Citează:** "Priority 1 ABSOLUT Rebrand sweep" + "Priority 2 Re-spec 7 BATCH_UI_NN".

---

## §6 — RAPORT FINAL OBLIGATORIU

**După ce ai răspuns la toate 10 Q-uri, generează:**

```markdown
## ALIGNMENT VERIFICATION REPORT

**Date:** 2026-05-03
**Files searched (cumulative across Q1-Q10):**
- [list paths]

### Per-Q scores

| Q | Status | Discrepancy |
|---|--------|-------------|
| Q1 | PASS/PARTIAL/FAIL | <if any> |
| ... | ... | ... |
| Q10 | ... | ... |

### Aggregate

**ALIGNMENT_SCORE: X/10**

**Discrepancies detected:**
- [list]

**Verdict:**
- 10/10 → ✅ PROCEED Rebrand sweep §30 (generate prompt CC REBRAND_SWEEP)
- 8-9/10 → ⚠️ Note discrepancies + ask Daniel pentru clarification înainte rebrand
- <8/10 → 🔴 RE-SYNC mandatory: stop work, request Daniel re-handover sau vault audit

**Recommended next action:** <one-line>
```

---

## §7 — Q-URI ADRESATE (Sprint UI 6 UX deja LOCKED — NU mai apar)

Pentru claritate — **NU re-deschide aceste Q-uri (deja LOCKED V1 §36.76):**

| Q | Decizie LOCKED |
|---|---|
| Q4 DOMS expand | A inline NU persist |
| Q5 Founding cap | C HIDDEN UI |
| Q6 3 Card buttons | B split 2+1 |
| Q7 Goal Shift | C Settings only |
| Q8 Telegram CTA | B revizuit |
| Q-PROMPT Profile Validation | C card persistent Dashboard |
| Q1, Q3, Q9, Q10, Q11, Q14, Q15 | Resolved §36.73 anterior |

---

*Generat 2026-05-03 post §36.76 + §36.77 ingest. Anti-hallucination guards: format verification PASS/PARTIAL/FAIL + evidence verbatim + ALIGNMENT_SCORE 0-10 + verdict threshold. Cumulative target 70 LOCKED V1.*
