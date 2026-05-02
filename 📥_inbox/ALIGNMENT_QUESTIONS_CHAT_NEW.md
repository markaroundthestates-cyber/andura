# ALIGNMENT VERIFICATION QUESTIONS — Force-Read Vault + Score Output

**Generat:** 2026-05-03 — replacement file per Daniel directive ("undeva s-a pierdut informația")
**Scope:** 10 Q-uri verification-driven (NU design) — chat-ul NEW Claude TREBUIE să citească real vault files și să raporteze evidence cu citate, NU să creadă pe încredere acest document
**Output mandatory:** ALIGNMENT_SCORE final 0-10 cu discrepancies list

---

## ⚠️ MANDATORY READ FIRST — REGULI EXECUȚIE ⚠️

**1. NU citi DOAR acest document.** Acest doc = lista de verificat, NU sursa adevărului. Sursa adevărului = `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` + `VAULT_RULES.md` + `03-decisions/ADR_*.md` + `📤_outbox/LATEST.md`.

**2. Pentru FIECARE Q de mai jos, EXECUTĂ:**
   - Caută real fișierele indicate (Read / grep / list)
   - Citează **1-2 propoziții verbatim** ca dovadă (NU paraphrase, NU memory)
   - Score per Q: `PASS` / `PARTIAL` / `FAIL`
   - Dacă NU găsești evidence: `FAIL` cu rationale "fișier inexistent" sau "section missing"

**3. Format răspuns OBLIGATORIU per Q:**
```
[Q[N]/10] [PASS|PARTIAL|FAIL]
Files searched: [path1, path2]
Evidence: "<citat verbatim 1-2 propoziții>"
Match: [confirmed / discrepancy: <detail>]
```

**4. La final RAPORT AGGREGATE OBLIGATORIU:**
```
ALIGNMENT_SCORE: X/10
Verdict: [PROCEED Sprint UI design / RE-SYNC needed first]
Discrepancies (if any):
- [Q[N]: <detail>]
Recommended action: [<one-line>]
```

**5. NU aproxima scor. NU "depinde". Dacă <8/10 → RE-SYNC mandatory înainte continuare.**

---

## §1 — CUMULATIVE STATE VERIFICATION (Q1-Q4)

### [Q1/10] Cumulative LOCKED count = 64?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Verifică:**
- Numără secțiunile `### §36.\d+` care există în file
- Cea mai recentă session-lock entry (EOF) menționează "64 decizii LOCKED cumulative"
- Confirm count breakdown: 12 + 11 + 8 + 14 + 8 + 1 + 2 + 4 cluster + §36.71 + §36.72 + §36.73 + §36.74 + §36.75 = 64

**Citează:** linia exactă cu "64 decizii LOCKED cumulative" sau echivalent.

---

### [Q2/10] Ultimele 3 decizii LOCKED V1 = §36.73 + §36.74 + §36.75?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md`
**Verifică existența și conținutul:**
- §36.73 = ALIGNMENT_QUESTIONS Q-Set NEW Resolution (Q3 + Q11 + Q14 + Q15 closed)
- §36.74 = BATCH_PROTOCOL Extension — Default Batches + Single Output Report
- §36.75 = Daniel Solo Gate Technical Execution Live (Firebase done)

**Citează:** prima propoziție din fiecare §36.73, §36.74, §36.75.

---

### [Q3/10] 8 ADR drafts ALL LOCKED V1, 0 DRAFT pending?

**Caută:** `03-decisions/ADR_*.md` (8 fișiere expected)
**Verifică status header din fiecare:**
1. ADR_RIR_MATRIX_ADAPTIVE_v1
2. ADR_MODE_DETECTION_UI_v1
3. ADR_BIAS_DETECTION_OBSERVABLE_v1
4. ADR_OUTLIER_FILTER_v1
5. ADR_CASCADE_DEFENSE_v1
6. ADR_COMPOSITE_SIGNAL_LAYER_v1
7. ADR_PAIN_DISCOMFORT_BUTTON_v1 (cu EXT-1)
8. ADR_SMART_ROUTING_EQUIPMENT_v1

**Toate header `**Status:** LOCKED V1`?** Citează status-ul din 2-3 ADRs (random sample) verbatim.

---

### [Q4/10] §BATCH_PROTOCOL.X codificat în VAULT_RULES.md?

**Caută:** `VAULT_RULES.md` (root, NU în `00-meta/`)
**Verifică existența secțiunii:**
- `### §BATCH_PROTOCOL.X — Default Batches + Single Centralized Report (LOCKED V1 §36.74)`
- Conține regulile: N artefacte distincte + Daniel drag-drop + comandă unică CC Opus + 1 LATEST.md final centralizat

**Citează:** prima propoziție a regulii MANDATORY default + cross-ref §36.74.

---

## §2 — DANIEL SOLO GATE + FIREBASE LIVE (Q5-Q6)

### [Q5/10] §36.75 listează 9 items completate Firebase Daniel solo?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.75
**Verifică table cu items DONE:**
- Firebase Auth Email/Password + Magic Link
- Firebase Auth Google OAuth (project "Andura")
- Region europe-west1
- User Auth UID Daniel `2GsDvxqXc4bvQGSm8B1Zft5S05i2`
- Backup RTDB local 49KB
- Data import `users/{UID}`
- DB rules per-UID strict published
- Smoke test prod 401 Unauthorized
- (post manual cleanup) `users/daniel` legacy delete

**Citează:** UID Daniel exact + status smoke test prod.

---

### [Q6/10] Sprint UI gate technical = CLEAR confirmed?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.75 final paragraphs SAU EOF session-lock entry "evening late HANDOVER INGEST"
**Verifică:**
- Phrase exact "Sprint UI gate status: CLEAR" sau echivalent
- §36.72 Sprint UI Sequencing LOCKED V1 cross-ref intact
- Items deferred to launch oficial NU pre-Beta (GDPR tutorial + Avocat outreach)

**Citează:** propoziția cu "Sprint UI gate" + "CLEAR".

---

## §3 — TEST + BUILD BASELINES (Q7-Q8)

### [Q7/10] Tests baseline = 1203 PASS / 75 files?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.71 sau §36.68
**Verifică:**
- Tests count = 1203 PASS
- Test files = 75
- Coverage = 60.33% lines / 78.38% branches

**Citează:** linia cu "1203 PASS" + linia cu coverage %.

---

### [Q8/10] Build baseline = 4.026s / 921 KB / 283 KB gzipped?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §36.70
**Verifică:**
- Build time: 4.026s wall-clock
- Total dist/: 921 KB raw
- Cold-start gzipped: ~283 KB
- 3G estimate: ~3.0s

**Citează:** linia cu "4.026s" + linia cu "921 KB".

---

## §4 — PROCESS + PLAN (Q9-Q10)

### [Q9/10] §BATCH_PROTOCOL pattern validated 3x empirical?

**Caută:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` EOF session-lock entries (cele mai recente 2)
**Verifică confirmare empirical 3x factor 5-7x optimism Opus:**
- Sprint 4.x cluster pilot: ~70min actual vs 6-8h estimate
- Cluster 10-batch: ~70min actual vs 6-8h estimate
- Single batch §36.73-75: ~10min actual vs 30-45min estimate

**Citează:** propoziția cu "factor 5-7x" sau "3x" CONFIRMED.

---

### [Q10/10] LATEST.md raport curent = Firebase done + Sprint UI ready?

**Caută:** `📤_outbox/LATEST.md` (root outbox, NOT archive)
**Verifică:**
- Title menționează Firebase Daniel solo gate complete + Sprint UI ready
- Status snapshot ZERO decizii noi LOCKED, cumulative 64 unchanged
- Plan §4 listează 5-7 BATCH_UI_NN expected
- §6 next steps prioritized cu strategic chat NEW Sprint UI design

**Citează:** title-ul + cumulative count + numărul de BATCH_UI expected.

---

## §5 — RAPORT FINAL OBLIGATORIU

**După ce ai răspuns la toate 10 Q-uri, generează:**

```markdown
## ALIGNMENT VERIFICATION REPORT

**Date:** 2026-05-03 (sau data execuție)
**Files searched (cumulative across Q1-Q10):**
- [list paths]

### Per-Q scores

| Q | Status | Discrepancy |
|---|--------|-------------|
| Q1 | PASS/PARTIAL/FAIL | <if any> |
| Q2 | ... | ... |
| ... | ... | ... |
| Q10 | ... | ... |

### Aggregate

**ALIGNMENT_SCORE: X/10**

**Discrepancies detected:**
- [list]

**Verdict:**
- 10/10 → ✅ PROCEED Sprint UI design directly
- 8-9/10 → ⚠️ Note discrepancies + ask Daniel pentru clarification înainte Sprint UI batches
- <8/10 → 🔴 RE-SYNC mandatory: stop Sprint UI work, request Daniel re-handover sau vault audit

**Recommended next action:** <one-line>
```

---

## §6 — DE CE ACEST FORMAT (rationale anti-halucinație)

Daniel feedback "rateuri la aliniere" + "undeva s-a pierdut informația":
- Chat-uri anterioare au răspuns 9/10, 12/15 — **skipping fără verificare reală**
- Chat-uri au TREATED handover doc-uri ca sursa adevărului — **NU au cross-checked vault files**
- Chat-uri au halucinat status-uri (e.g., "ADR LOCKED" când era încă DRAFT)

Acest format forțează:
1. **Real reads** (citate verbatim, NU memory)
2. **Discrete pass/fail** per Q (NU "depinde")
3. **Score quantificat** (NU vag "aligned")
4. **Mandatory action threshold** (<8/10 → STOP, NU continue presupunând alignment)

---

*Generat 2026-05-03 replacement per Daniel directive. Anti-information-loss design: chat-ul NEW TREBUIE să citească real vault, NU să creadă pe încredere acest doc. Output mandatory ALIGNMENT_SCORE 0-10 cu verdict threshold.*
