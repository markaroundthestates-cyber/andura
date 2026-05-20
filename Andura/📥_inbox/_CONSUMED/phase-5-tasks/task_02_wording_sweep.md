# task_02 — Wording Sweep Batch 22 placeholdere RO Autonomous Compose

**Phase:** 5 (cap-coadă)
**Type:** Wording fill autonomous compose
**Deps:** none (atomic sweep)
**Backup tag:** `pre-phase5-task-02-2026-05-17`
**Est commits:** 1-3 atomic (per file group: LOCK 9 modal + screens empty states + PostSummary)
**Est tests delta:** ±0-5 (assertion updates pe text content)

---

## §1 Scope

D024 LOCKED V1 (2026-05-17): Pre-Beta UI wording RO Co-CTO autonomous compose OK. Daniel verifică post-Beta a-z review. Daniel verbatim: *"pentru wordings pui tu ce vrei, daca nu imi confine schimbam in beta cand o sa il verific eu"*.

Sweep ALL `PLACEHOLDER_RO_TEXT_*_TBD` placeholdere + standard fitness vocabulary loose ends din WORDING BACKLOG Phase 4 §6 (LATEST.md 2026-05-17). NO_DIACRITICS_RULE strict + anti-paternalism ABSOLUTE invariant.

## §2 Changes — wording final propose per loc

### A. `src/react/components/AaFrictionModal.tsx` LOCK 9 safety modal (7 items)

```tsx
const COPY = {
  title: 'Stai un pic',
  body: 'Ai marit ritmul peste obisnuit. Verifica forma si recupereaza inainte de set urmator.',
  buttonPause: 'Pauza 30 sec',
  buttonContinue: 'Continui oricum',
} as const;

const REASON_LABEL: Record<AggressiveReason, string> = {
  fast_sets: 'Set-uri prea rapide',
  kg_jump: 'Greutate marita brusc',
  rep_spike: 'Repetari peste obisnuit',
};
```

Rationale: anti-paternalism preserved (NU "esti obosit/te doare/te oprim" — observe pattern + verify form). Direct + scurt. RPE-style language. Pauza 30s = concret time-bounded NU vague. Continui oricum = user agency preserved override.

### B. `src/react/routes/screens/progres/BodyData.tsx` heading + fields

- Heading: `'Masuratori corp'` (preserve existing — standard fitness vocab Romanian, NU jargon)
- Sub-text: `'Logheaza periodic - estimari calibrate.'`
- Field labels: `Talie (cm)` / `Piept (cm)` / `Sold (cm)` / `Biceps (cm)` / `Coapsa (cm)` (preserve standard)
- Save button: `'Salveaza masuratori'`
- Empty state: `'Nu ai inregistrari inca. Logheaza prima masuratoare ca sa vezi tendintele.'`

### C. `src/react/components/Workout/*` empty state (task_17 placeholders)

- Heading: `'Astazi e zi de odihna'`
- Body: `'Nu ai antrenament programat azi. Foloseste calendarul de mai sus daca vrei sa schimbi programul.'`
- Back CTA: `'Inapoi'`

### D. `src/react/components/Calendar7Day.tsx` (task_19 wording)

- Section label: `'Saptamana'` (preserve existing)
- Edit aria-label: `'Editeaza saptamana'`
- Save aria-label: `'Salveaza saptamana'`
- Save button: `'Salveaza'` (preserve existing)

### E. `src/react/routes/screens/istoric/*` empty states (task_21 placeholders)

- List empty: `'Nu ai antrenamente inca. Prima sesiune apare aici dupa ce o termini.'`
- Detail missing: `'Sesiunea nu a fost gasita.'` (preserve existing)
- List heading: `'Istoric'` (preserve existing mockup verbatim L1157)

### F. `src/react/components/Workout/PostSummary.tsx` PR labels (task_22)

PR type labels Romanian:
```tsx
const PR_TYPE_LABEL: Record<PRDelta['type'], string> = {
  weight: 'PR greutate',
  reps: 'PR repetari',
  volume: 'PR volum',
};
```

1RM display copy:
```tsx
const oneRMLabel = (kg: number) => `1RM estimat: ${kg}kg`;
```

DeltaPct copy:
```tsx
const deltaPctLabel = (pct: number) =>
  pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
```

### G. Nutrition `src/react/components/NutritionInline.tsx` (task_20)

Mockup verbatim already preserved L1800-1834. Verify NU placeholderi în cod (should be clean per LATEST §6 LOCK 11 0 placeholders).

## §3 Acceptance criteria

- [ ] ZERO `PLACEHOLDER_RO_TEXT_*_TBD` literal markers în `src/react/**/*.tsx`
- [ ] Anti-paternalism strict (NU "esti obosit" / "te doare" / "te oprim" forced wording)
- [ ] NO_DIACRITICS_RULE — ZERO ă/â/î/ș/ț în toate strings UI
- [ ] All tests updated cu noua text (assertion updates inline cu schimbarea)
- [ ] Vitest verde post-sweep
- [ ] TS strict 0 errors

## §4 Tests

Existing tests cu placeholder references trebuie actualizate la text final:
```bash
grep -rn "PLACEHOLDER_RO_TEXT" src/react/__tests__/
grep -rn "PLACEHOLDER_RO_TEXT" src/react/
```

NEW tests OPTIONAL:
- Snapshot AaFrictionModal text rendered (eliminate placeholder regression)
- BodyData empty state text assert
- Workout empty state text assert

## §5 Commits (atomic per file group recommended)

```
feat(react/components): AaFrictionModal LOCK 9 wording final propose
feat(react/screens): BodyData + Workout empty state wording final
feat(react/screens): Istoric empty states + PostSummary PR labels wording
```

Per ADR Daniel CEO directive D024 LOCKED V1 — autonomous compose pre-Beta, review Beta a-z.

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_02_wording_sweep.md`:
- Wording table per file (placeholder → final text)
- Grep evidence ZERO `_TBD` post-sweep
- D024 citation
