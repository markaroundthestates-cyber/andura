# task_13 — Cont Settings Prefs Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + units + week start + locale
**Deps:** task_12 LANDED
**Backup tag:** `pre-phase6-task-13-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Mockup verbatim source `#screen-settings-prefs`. Units kg/lb + week start Luni/Duminica + locale ro-RO fixed display. Phase 5 task_18 `settingsStore.units` slice exists.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-prefs" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsPrefs.tsx`

- Units toggle: "kg" / "lb" radio (default kg, mockup verbatim)
- Week start: "Luni" / "Duminica" radio (default Luni)
- Locale: "Romana (ro-RO)" static info row (V1 NU multi-lang)
- Date format: static "DD/MM/YYYY" info row
- Save action persist settingsStore

### C. Units propagation invariant

Verify weight display components consume settingsStore.units cu Math.round(kg * 2.20462) când lb selected. Currently `WorkoutSet.kg` always stored în kg base unit (canonical). Display layer only conversion.

### D. NEW route `/cont/settings-prefs`

### E. Cont.tsx row "Preferinte" onClick wired

### F. Tests `src/react/__tests__/SettingsPrefs.test.tsx`

```js
- units toggle kg/lb dispatches store
- week start radio 2 options
- locale static display ro-RO
- units conversion display 100kg ≈ 220.5lb roundtrip
- canonical storage kg base (NU lb persisted)
- save persists settingsStore
- back navigation gotoPath('cont')
```

## §3 Acceptance criteria

- [ ] `SettingsPrefs.tsx` NEW screen LANDED
- [ ] Units toggle kg/lb cu canonical kg storage invariant
- [ ] Week start Luni default mockup verbatim
- [ ] settingsStore.units + weekStart persist
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/cont): settings-prefs units kg/lb + week start + locale

NEW screen permite units toggle (kg canonical / lb display) + week start
(Luni default / Duminica) + locale ro-RO static info. Canonical storage kg
base preserved invariant — display layer only lb conversion roundtrip.
```

## §6 Next

task_14 settings-privacy sub-screen.
