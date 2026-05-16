# ORCHESTRATOR — Pre-Beta Cap-Coadă Batch 2026-05-16

**Model:** Opus EXCLUSIVELY (per `DECISIONS.md §D-LEGACY-049` Sonnet concediat permanent).
**Branch:** `feature/v2-vanilla-port`.
**Working dir:** `C:\Users\Daniel\Documents\salafull`.

## Mod execuție

Sequential fail-stop. Citește TASK_<N>.md în ordine 1 → 7. Pe fail = STOP imediat, scrie raport `📤_outbox/LATEST.md` cu task-ul eșuat + cauza + ce e LANDED până acolo, NU continui task-urile rămase.

Pe succes per task = atomic commit single-concern (pre-commit hook verde mandatory, NU `--no-verify`). Tag backup pre-batch pushed origin înainte primul task.

## Sequencing rationale

- **TASK 1-3** = Track 2 P4 fix-uri substantive pre-Beta cap-coadă (PRIMER §6 Track 2). Cod prod modificat.
- **TASK 4** = test coverage extension pentru fix-urile 1-3 (Bugatti — pre-commit hook fails fără teste pe cod nou).
- **TASK 5-6** = audit cross-cluster pre Bugatti Audit Nuclear final (mockup parity post triple LANDED + diacritics).
- **TASK 7** = wording inventory extract Daniel CEO review batch (CEO scope strict per `DECISIONS.md §D009` — NU autonomous edit user-facing wording, doar extract pentru review).

## Pre-flight (înainte TASK 1)

1. `git status` clean working tree (smart-env auto-tracked OK).
2. Tests baseline 3734 PASS verified local vitest (`npm test -- --run`).
3. Smoke 4 taburi V2 5/5 PASS vs live andura.app verified (`.bat` scripts hands-off).
4. Backup tag `pre-batch-cap-coada-2026-05-16` pushed origin explicit.
5. `git log --oneline -5` snapshot pentru raport context.

Dacă pre-flight fail (orice punct) → STOP, scrie LATEST.md cu cauza, ZERO TASK execute.

## Raport format (`📤_outbox/LATEST.md`)

```
# LATEST — Pre-Beta Cap-Coadă Batch 2026-05-16 [Status]

## Tasks completate
- TASK 1 ✓/✗ — <descriere scurtă + commit hash>
- TASK 2 ...
- ...

## Pre-flight
- <8 checks listed>

## Modificări per task
- <per task: files modified, LOC delta, key decisions>

## Build+Tests
- Tests: <count> PASS (delta vs baseline 3734)
- Build: <vite duration + clean/warnings>
- Pre-commit hooks: <pass per commit>

## Commits (atomic single-concern)
- <hash> | <conventional commit message>

## Pushed
- feature/v2-vanilla-port origin ✓
- backup tag pre-batch-cap-coada-2026-05-16 ✓

## Issues / Deviations
- <orice deviation spec, ambiguity surfaced, sau eșec parțial>

## Next action Daniel
- <recomandare CEO următor pas: Bugatti Audit Nuclear / wording review / etc.>
```

## Reguli invariante

- ZERO `--no-verify` bypass pre-commit hook.
- ZERO `git add -A` (smart-env pollution). Use `git add <specific-files>`.
- ZERO src/ touched în audit-only tasks (TASK 5, 6).
- Daniel-isms verbatim preserved în raport (NU rephrase).
- Co-CTO autonomy = decide tactical singur (path concret, test names, function naming), NU întrebări Daniel mid-batch.
- Bugatti craft mandatory: peak craft, zero compromise. Refactor later NEVER happens — fix corect first try.
- Pe ambiguitate spec → choose path coerent cu strategy LOCKED V1, flag în raport §Issues.
- Quality argumente only — NICIODATĂ timing/effort/deadline ca decision base.

## Trigger CC

Daniel paste prompt simplu în CC terminal:
```
Citește `📥_inbox/BATCH_2026-05-16_pre_beta_cap_coada/ORCHESTRATOR.md` și execută sequential fail-stop. Model: Opus.
```

Sau Daniel zice doar **"latest"** în CC pre-armat → CC reads `📤_outbox/LATEST.md` (anterior) pentru context startup, apoi switch la acest ORCHESTRATOR.

---

🦫 **Pre-Beta cap-coadă closure batch. Bugatti craft peak. Quality > Speed strict. Co-CTO autonomy MAXIMUM tactical. Daniel zero touch până raport LATEST.md ready.**
