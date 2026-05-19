# TASK 2 — Verify Dashboard banner periodic 3-zile reminder în v2 prod

**Track:** P4 Track 2 fix 2 (per `ANDURA_PRIMER.md` §6).
**Category:** ENG tactical / UX verification.
**Atomic commit type:** `feat(dashboard):` dacă wire necesar, sau ZERO commit dacă already-wired (raport only).

## Intent

Per `PRODUCT_STRATEGY_SPEC §3.5 V3 §AMENDMENT 2026-05-10` Coach Direct nutrition path forward (REVERSAL OUT_OF_SCOPE 2026-04-30 → RE-IN-SCOPE V1):

> Banner periodic la 3 zile pe dashboard pentru reminder logare nutritie / greutate / etc. — Gigel-friendly gentle prompt anti-paternalism.

Verifică dacă acest banner e wired correct în v2 prod (`feature/v2-vanilla-port` branch). Dacă lipsește → wire conform spec. Dacă există dar nu corect (interval greșit, copy greșit, missing dismiss logic) → flag în raport pentru Daniel CEO review wording (NU autonomous edit user-facing wording per `DECISIONS.md §D009`).

## Discovery (CC autonomous)

1. **Read spec authority:** `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §3.5 V3 §AMENDMENT 2026-05-10 — extract spec exact (interval, copy, dismiss behavior, trigger condition).
2. **Grep prod:** `grep -rn "3 zile\|3-day reminder\|nutrition.*reminder\|banner.*periodic\|dashboardBanner" src/` → identifică dacă există implementare.
3. **Mockup verify:** confirmă mockup-side mockup-clasic.html dacă există banner relevant Progres tab sau alt tab — verifică intent UI design pentru port.

## Decision tree (CC tactical)

### Caz A: Banner LIPSEȘTE în src/ (NU implementat)

→ Implementează minim:
- Trigger: `lastLogTimestamp` check (3 zile threshold).
- Display: banner gentle în Progres tab (location per mockup spec) — copy EXACT din `PRODUCT_STRATEGY_SPEC §3.5 V3`. ZERO autonomous wording compose (per `DECISIONS.md §D009`).
- Dismiss: dismiss → localStorage flag → re-trigger după 3 zile fresh.
- Anti-paternalism: copy gentle Gigel-friendly (per `DECISIONS.md §D-LEGACY-061` engine generic invariant), NU "ar trebui să loghezi", ci "Vrei să loghezi azi greutatea?"

### Caz B: Banner EXISTĂ și conform spec

→ NU edit. Raport: "TASK 2 already-LANDED-no-op, verificat path:§ + copy spec match."

### Caz C: Banner EXISTĂ dar deviază de la spec (interval/copy/logic)

→ Fix logica (interval, dismiss, trigger condition) — tactical autonomous OK.
→ NU edit copy user-facing wording — flag în `📤_outbox/LATEST.md §Wording-review-pending` pentru Daniel CEO review batch (TASK 7).

### Caz D: Spec ambiguous în `PRODUCT_STRATEGY_SPEC §3.5 V3`

→ STOP TASK 2, scrie raport `📤_outbox/LATEST.md §Issues` "Spec ambiguity §3.5 V3: <ce e ambiguu>". Continuă orchestrator la TASK 3.

## Acceptance criteria

- [x] Banner state verificat în src/ prod (citate `path:line` exacte).
- [x] Spec authority citat verbatim (`PRODUCT_STRATEGY_SPEC §3.5 V3 §AMENDMENT 2026-05-10`).
- [x] Decision case identificat (A/B/C/D) + justificare scrisă.
- [x] Dacă caz A sau C-logic: fix LANDED + tests preserved 3734 PASS.
- [x] Dacă caz B sau D: ZERO commit, raport explicat.
- [x] User-facing wording NU edited autonomous (CEO scope strict D009).

## Files atinse (caz A/C)

- `src/pages/progres.js` (sau component Progres tab — discovery).
- `src/utils/banner.js` (sau new file dacă logic banner generic încă inexistent — CC decide naming).
- Eventual `src/store.js` sau state management central pentru `lastLogTimestamp` access.

## Raport per task

```
TASK 2 ✓/✗ — <commit hash sau "no-op" sau "BLOCKED-ambiguity">
- Case identified: A / B / C / D
- Spec citation: PRODUCT_STRATEGY_SPEC §3.5 V3 §AMENDMENT 2026-05-10 §<sub>
- Files: <list>
- Discovery findings: <existing implementation path:line dacă există>
- Wording flagged for Daniel review: <yes/no + ce wording>
```
