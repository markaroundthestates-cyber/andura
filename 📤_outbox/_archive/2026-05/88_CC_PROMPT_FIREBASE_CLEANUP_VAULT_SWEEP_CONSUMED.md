# CC PROMPT — Firebase Cleanup + Vault Sweep §36.73-74 + VAULT_RULES Batch Rule

**Model:** Opus 4.7 (governance + vault-wide cross-refs + foundation VAULT_RULES = NU mecanic Sonnet)
**Estimate:** ~30-45 min (factor 5-7x optimism Opus probably ~10-15 min actual)
**Run mode:** Single batch (NU multi-batch — task-uri interdependente, 1 raport LATEST.md final)

---

## CONTEXT

Sesiune chat strategic 2026-05-02 evening (post cluster 10-batch + Sprint UI sequencing §36.72) a produs:

1. **Daniel solo gate technical = COMPLET** — Firebase Console manual setup live de Daniel:
   - Auth Email/Password + Magic Link enabled
   - Auth Google OAuth enabled (project public-facing name = "Andura")
   - Region confirmat europe-west1 (GDPR)
   - User Auth manual created cu UID `2GsDvxqXc4bvQGSm8B1Zft5S05i2`
   - DB rules per-UID strict published (`auth !== null && auth.uid === $uid`)
   - Backup local salvat de Daniel (`fittracker-c34e8-default-rtdb-export.json`)
   - Manual import făcut în Firebase Console: `users/daniel` legacy + `users/{UID}` copy ambele coexistă acum

2. **3 decizii LOCKED noi** (§36.73 + §36.74 + §36.75) care trebuie ingerate în SSOT vault.

3. **Smoke test live confirmat:** GitHub Pages prod returnează `401 Unauthorized` pe `users/daniel.json` — exact ce voiam (rules per-UID active, Anonymous UUID legacy blocat). App-ul real funcțional vine când CC Opus rulează Sprint UI Integration cu Auth real.

---

## SCOPE BATCH (5 sub-tasks sequential, 1 raport LATEST.md final)

### TASK 1 — Firebase RTDB cleanup `users/daniel` legacy (~5 min)

**Scop:** Șterge `users/daniel` din Firebase RTDB (păstrăm doar `users/2GsDvxqXc4bvQGSm8B1Zft5S05i2`). Nu mai e necesar — Sprint UI va folosi exclusiv `users/{firebase.uid}` paths.

**Mecanism:**
- Folosește Firebase REST API cu service account credentials existing (vezi `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md` pentru pattern Cloud Function `migrateUserData`)
- DELETE request pe `https://fittracker-c34e8-default-rtdb.europe-west1.firebasedatabase.app/users/daniel.json`
- ALTERNATIVE dacă REST cleanup blocat de rules per-UID strict: skip task asta, document în raport "manual delete needed by Daniel via Console" + provide step-by-step instructions
- VERIFY post-cleanup: GET `users/daniel.json` → 401 sau 404 (ambele OK, înseamnă șters/inaccesibil)

**Acceptance:**
- ✅ `users/daniel` ne-mai-existent în RTDB (sau flagged manual cleanup needed)
- ✅ `users/2GsDvxqXc4bvQGSm8B1Zft5S05i2` intact (DO NOT TOUCH)

---

### TASK 2 — Vault sweep `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (~10 min)

**Scop:** Adaugă 3 secțiuni noi LOCKED (§36.73, §36.74, §36.75) la final §36 înainte de "Sesiune 2026-05-02 CLUSTER 10-BATCH + Sprint UI Sequencing LOCK" entry (sau după acel entry, depinde de ordine cronologică). Update `61` → `64` în toate locurile cumulative count.

**Decizii noi de ingerat:**

#### §36.73 ALIGNMENT_QUESTIONS Q-Set NEW Resolution LOCKED V1 (2026-05-02 evening)

**Decizie:** Din 15 Q-uri propuse în `ALIGNMENT_QUESTIONS_CHAT_NEW.md` (cluster Sprint UI sequencing post-§36.72), **4 Q-uri rezolvate în chat alignment fără să intre în Sprint UI design**:

| Q | Status | Resolution |
|---|--------|------------|
| Q3 (CC batch sizing 5/7 batches) | ✅ RESOLVED → §36.74 BATCH_PROTOCOL extension | Halucinație chat anterior. Înlocuit cu regulă generică (vezi §36.74). |
| Q11 (GDPR + Avocat blocking Sprint UI) | ✅ RESOLVED → opțiunea C | GDPR + Avocat = pre-launch PUBLIC, NU pre-Beta închis cu prietenii. Sprint UI gate Daniel solo redus la Firebase Auth + DB rules (technical only). GDPR tutorial + Avocat outreach defer la launch oficial. |
| Q14 (Beta cohorts ratio €) | ✅ DEFER post-Beta | NU se discută înainte de launch oficial. După Beta cu prieteni avem date reale piață, atunci decidem ratio Founding/Standard/Elite. |
| Q15 (Marketing V1.1 timing reopen) | ✅ REJECTED | §36.60 LOCKED defer Februarie 2027. Întrebarea reopen = scope creep mascat. Out. |

**Cumulative LOCKED count impact:** +1 (61 → 62)

**Cross-refs:** §36.60 Marketing Channel Mix Decision V1.1 + §36.72 Sprint UI Sequencing LOCKED V1 + §36.47 Beta Recruitment 50 Users 3 Cohorts.

---

#### §36.74 BATCH_PROTOCOL Extension — Default Batches + Single Output Report LOCKED V1 (2026-05-02 evening)

**Decizie:** Extension VAULT_RULES.md §BATCH_PROTOCOL (codified §36.63 cluster 10-batch) cu regula **mandatory default permanent**:

**Regula default:**
- Claude chat strategic generează **N artefacte CC prompts copy-ready distincte** (oricare N: 2, 3, 5, 6+) când scope-ul permite disjuncte clean
- Daniel drag toate N artefacte în 📥_inbox/
- Daniel comandă unică CC Opus: rulează batch-urile sequential per VAULT_RULES §BATCH_PROTOCOL
- CC Opus rulează batch după batch fail-fast strict
- **CC Opus produce 1 SINGUR raport `📤_outbox/LATEST.md` centralizat la final**, conținând outcomes pentru toate batch-urile rulate (NU 1 raport per batch separat în chat)
- Per-batch reports detaliate merg în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md` (consistent cu §36.63 cluster pattern)

**Excepție single prompt:**
- Single prompt CC = DOAR când scope nu se poate batch (interdependențe forțate, tot scope-ul atinge același module)
- Default = batch. Single = excepție justificată.

**Rationale:**
- Eficient pentru Daniel (drag-drop multiple, 1 comandă, 1 raport final)
- Empirical validated cluster 10-batch (factor 5-7x optimism, zero errors, raport centralizat funcționează)
- Reduce chat-back-and-forth pe per-batch progress

**Cumulative LOCKED count impact:** +1 (62 → 63)

**Cross-refs:** §36.63 §BATCH_PROTOCOL codified (cluster 10-batch session lock) + §36.71 Cluster Session Lock pattern + VAULT_RULES.md §BATCH_PROTOCOL.

---

#### §36.75 Daniel Solo Gate Technical Execution Live LOCKED V1 (2026-05-02 evening)

**Decizie:** Documentare execution live Firebase Console manual setup completat de Daniel în chat alignment Q-uri. Sprint UI gate technical = CLEAR.

**Items completate:**

| Item | Status | Notes |
|------|--------|-------|
| Firebase Auth Email/Password + Magic Link enabled | ✅ DONE | Console live |
| Firebase Auth Google OAuth enabled | ✅ DONE | Public-facing project name = "Andura", support email = `maziludanielconstantin90@gmail.com` |
| Region confirmat europe-west1 | ✅ VERIFIED | GDPR EU residency per ADR_MULTI_TENANT_AUTH §5 |
| User Auth manual created | ✅ DONE | UID Daniel: `2GsDvxqXc4bvQGSm8B1Zft5S05i2`, email: `maziludanielconstantin90@gmail.com` |
| Backup RTDB local | ✅ DONE | Daniel salvat fișier export 49KB pe disk local |
| Data import în RTDB | ✅ DONE | Manual import via Console: `users/daniel` legacy + `users/{UID}` copy coexistă pre-cleanup task §TASK 1 acest batch |
| DB rules per-UID strict published | ✅ DONE | Sintaxa LOCKED §34.2 published live |
| Smoke test prod confirmat | ✅ DONE | GitHub Pages https://markaroundthestates-cyber.github.io/salafull/ returnează `401 Unauthorized` pe `users/daniel.json` — exact expected (rules active, Anonymous UUID legacy blocat) |

**Items deferred to launch oficial (NU pre-Beta închis cu prietenii):**
- GDPR screenshot tutorial (§36.55) → defer launch
- Avocat barter outreach → defer launch

**Sprint UI gate status:** **CLEAR** pentru CC Opus Sprint UI Integration execution post strategic chat NEW design discussion.

**Cumulative LOCKED count impact:** +1 (63 → 64)

**Cross-refs:** §36.72 Sprint UI Sequencing LOCKED V1 + §34.2 Blocker 2 Firebase Rules RTDB Lock (RESOLVED) + ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02 Faza 1 Batch B + §36.73 Q11 resolution (GDPR/Avocat defer) + §36.55 GDPR Phone Privacy Onboarding (defer launch).

---

**Update HANDOVER_GLOBAL header summary (find & replace):**

Toate ocurențele cumulative count `61 decizii LOCKED cumulative` → `64 decizii LOCKED cumulative`.

Toate ocurențele `61` în breakdown count = `(12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E + 2 post-Chat-E flags §36.59-60 + 4 cluster 10-batch §36.62 ADR LOCKS + §36.63 §BATCH_PROTOCOL codified + §36.71 cluster session-lock + §36.72 Sprint UI sequencing)` → update breakdown la `(... + §36.73 Q-Set resolution + §36.74 BATCH_PROTOCOL ext + §36.75 Daniel solo gate execution = 64)`.

---

### TASK 3 — Update `00-meta/VAULT_RULES.md` §BATCH_PROTOCOL extension (~5 min)

**Scop:** Add subsection §BATCH_PROTOCOL.X "Default Batches + Single Output Report" la VAULT_RULES.md cu regula §36.74.

**Conținut adăugat:**

```markdown
### §BATCH_PROTOCOL.X — Default Batches + Single Centralized Report (LOCKED V1 §36.74)

**Regula MANDATORY default permanent pentru CC Opus task-uri:**

**Default = BATCHES (NU single prompts):**
- Claude chat strategic generează N artefacte CC prompts copy-ready distincte (oricare N: 2, 3, 5, 6+) când scope-ul permite disjuncte clean
- Daniel drag toate N artefacte în 📥_inbox/
- Daniel comandă unică CC Opus: "Rulează toate batch-urile din inbox sequential per §BATCH_PROTOCOL"
- CC Opus rulează batch după batch fail-fast strict per §BATCH_PROTOCOL
- **CC Opus produce 1 SINGUR raport `📤_outbox/LATEST.md` centralizat la final**, conținând outcomes pentru toate batch-urile rulate
- Per-batch reports detaliate merg în `📤_outbox/_archive/<YYYY-MM>/BATCH_NN_REPORT.md`

**Excepție single prompt:**
- Single prompt CC permis DOAR când scope-ul nu se poate batch (interdependențe forțate, tot scope-ul atinge același module)
- Default = batch. Single = excepție justificată cu rationale explicit în prompt header.

**Rationale:**
- Eficient pentru Daniel (drag-drop multiple, 1 comandă, 1 raport final)
- Empirical validated cluster 10-batch sesiune 2026-05-02 (factor 5-7x optimism Opus, zero errors)
- Reduce chat-back-and-forth pe per-batch progress

**Cross-refs:** §36.63 cluster pattern + §36.71 cluster session lock + §36.74 LOCKED V1 decision.
```

**Acceptance:**
- ✅ Subsection adăugat în VAULT_RULES.md secțiunea §BATCH_PROTOCOL
- ✅ Cross-refs valid (§36.63, §36.71, §36.74 toate exist post-TASK 2)

---

### TASK 4 — Tests verification (~5 min)

**Scop:** Verifică că vault sweep + VAULT_RULES update NU strică teste existente.

**Comenzi:**
```bash
cd <repo_root>
npm test -- --run 2>&1 | tail -30
```

**Acceptance:**
- ✅ Tests count = 1203 PASS (baseline cluster 10-batch §36.71)
- ✅ NU sunt regresii noi
- ✅ Coverage neschimbat (60.33% lines / 78.38% branches baseline §36.71)

**Notes:** Vault docs only modificări → NU ar trebui să afecteze teste. Dacă apar regresii = bug în alt loc, flag în raport.

---

### TASK 5 — Commits + push origin/main (~3 min)

**Scop:** 1 commit per task (3-4 commits total, NU 1 commit mega), push origin/main.

**Commit messages template:**

```
chore(firebase): cleanup users/daniel legacy post-migration §36.75

Remove legacy users/daniel node from RTDB after manual import preserved
data under users/{UID} (Daniel UID 2GsDvxqXc4bvQGSm8B1Zft5S05i2).
Sprint UI Integration will use exclusively users/{firebase.uid} paths.

Refs: §36.75 Daniel Solo Gate Technical Execution Live LOCKED V1
```

```
docs(handover): ingest §36.73 + §36.74 + §36.75 decisions LOCKED V1

Cumulative LOCKED count: 61 → 64
- §36.73: ALIGNMENT_QUESTIONS Q-Set NEW resolution (Q3/Q11/Q14/Q15)
- §36.74: BATCH_PROTOCOL extension default batches + single LATEST.md
- §36.75: Daniel solo gate technical execution live (Firebase done)

Refs: HANDOVER_GLOBAL §36.73-75
```

```
docs(vault-rules): codify §BATCH_PROTOCOL.X default batches per §36.74

Add MANDATORY default rule: CC Opus tasks default to batches (NU single
prompts), Claude generates N distinct copy-ready artifacts, Daniel
drag-drops all to inbox, CC Opus runs sequential fail-fast strict, produces
1 single centralized LATEST.md report at end (NU per-batch reports in chat).
Single prompt = exception only when scope cannot be batched.

Refs: VAULT_RULES.md §BATCH_PROTOCOL.X + §36.74 LOCKED V1
```

**Push:**
```bash
git push origin main
```

**Acceptance:**
- ✅ 3 commits separate cu messages clare
- ✅ Push origin/main success
- ✅ Vault sync OK

---

## RAPORT FINAL CENTRALIZAT — `📤_outbox/LATEST.md`

**Format STANDARD raport (per VAULT_RULES §RAPORT_FORMAT):**

```markdown
# LATEST — Firebase Cleanup + Vault Sweep §36.73-75 + VAULT_RULES Batch Rule

**Task:** Single batch CC Opus — Firebase RTDB cleanup users/daniel legacy + vault sweep §36.73-75 + VAULT_RULES.md §BATCH_PROTOCOL.X codification
**Model:** Opus 4.7
**Status:** [Complete | Partial | Failed]
**Daniel-time:** ~30-45 min estimate / [actual]
**Run mode:** Single batch (5 sub-tasks sequential)

## Pre-flight checks
- [ ] Repo state clean (git status)
- [ ] Tests baseline 1203 PASS verified
- [ ] Vault paths confirmed accessible

## Modificări per task

### TASK 1 — Firebase RTDB cleanup
- [Status: Done | Skipped | Manual needed]
- [Details: REST DELETE result OR flag manual cleanup needed]

### TASK 2 — Vault sweep HANDOVER_GLOBAL §36.73-75
- Lines added: ~150
- Cumulative count update: 61 → 64
- Sections added: §36.73, §36.74, §36.75
- Header summary updated: ✅

### TASK 3 — VAULT_RULES §BATCH_PROTOCOL.X
- Subsection added: ✅
- Cross-refs validated: ✅

### TASK 4 — Tests
- Tests: 1203 PASS / [actual] PASS
- Coverage: [actual] lines / [actual] branches
- Regressions: [None | List]

### TASK 5 — Commits
- Commit 1 (firebase cleanup): [hash] OR skipped
- Commit 2 (handover sweep): [hash]
- Commit 3 (vault rules ext): [hash]
- Push origin/main: ✅

## Build + Tests final
- Tests: 1203 PASS
- Build: [size, time]

## Issues / Flags
- [None | List]

## Next action
- Daniel: paste raportul în chat strategic (current sau next)
- Claude: produce handover ingest pentru chat strategic NEW Sprint UI design (post §36.75 reflection)
```

---

## CONSTRAINTS

- **NU touch:** `users/2GsDvxqXc4bvQGSm8B1Zft5S05i2` în RTDB (datele live Daniel)
- **NU touch:** Nici un fișier în `src/engine/` sau `src/schema/` (out of scope)
- **NU touch:** Tests existing (out of scope)
- **DO:** Vault docs only + Firebase REST cleanup + VAULT_RULES.md
- **DO:** Cross-refs valid post-update
- **DO:** Commit messages clare per task

---

## RAPORTARE ANOMALII

Dacă apar issues:
- Firebase REST cleanup blocked de rules per-UID strict → flag în raport, document manual cleanup steps pentru Daniel
- Tests regresează → STOP + flag în raport, NU push, attempt rollback git
- Cross-ref invalid post-update → flag, NU procedez, return raport partial

**Daniel decision needed dacă:**
- Issue major (>50% scope blocked)
- Conflict logic detectat în vault (e.g., §36.73-75 conflict cu §36.71-72 existing)

---

**END PROMPT**
