# task_16 — Cont Settings Export Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + JSON export user data
**Deps:** task_15 LANDED
**Backup tag:** `pre-phase6-task-16-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Mockup verbatim source `#screen-settings-export`. GDPR data portability — download `.json` complete user data (profile + sessions + nutrition + PRs + settings) local file. ZERO server roundtrip — pure browser blob download.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-export" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsExport.tsx`

- Info card "Exporta datele tale" + descriere short
- Button primary "Descarca .json"
- onClick handler:
  1. Aggregate state din toate stores: onboardingStore + workoutStore + nutritionStore + settingsStore
  2. Serialize JSON cu indent 2 spaces
  3. Create Blob `{ type: 'application/json' }`
  4. Trigger download via `<a download="andura-export-<date>.json" href={blobUrl}>`
  5. Toast confirmation "Export descarcat"
- Footer privacy row "Datele tale nu pleaca de pe telefon — export local"

### C. NEW helper `src/react/lib/exportUserData.ts`

```ts
export function buildUserDataExport(): object {
  return {
    schemaVersion: 1,
    exportDate: new Date().toISOString(),
    profile: useOnboardingStore.getState(),
    sessions: useWorkoutStore.getState().sessionsHistory,
    nutrition: useNutritionStore.getState().daily,
    settings: useSettingsStore.getState(),
  };
}

export function downloadUserDataJSON(): void {
  const data = buildUserDataExport();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `andura-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### D. NEW route `/cont/settings-export`

### E. Cont.tsx row "Exporta date" onClick wired

### F. Tests `src/react/__tests__/SettingsExport.test.tsx`

```js
- buildUserDataExport aggregates 4 stores
- schemaVersion 1 present
- exportDate ISO format
- profile + sessions + nutrition + settings included
- downloadUserDataJSON triggers blob + anchor click (mock URL.createObjectURL)
- filename pattern andura-export-YYYY-MM-DD.json
- ZERO server roundtrip
- back navigation gotoPath('cont')
```

## §3 Acceptance criteria

- [ ] `SettingsExport.tsx` NEW screen LANDED
- [ ] `buildUserDataExport()` + `downloadUserDataJSON()` helpers LANDED
- [ ] ZERO server roundtrip — pure browser blob
- [ ] Privacy footer wording anti-surveillance
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/cont): settings-export GDPR data portability .json local download

NEW screen + helpers buildUserDataExport + downloadUserDataJSON. Aggregates
4 stores (onboarding + workout + nutrition + settings) → JSON blob local
browser download. ZERO server roundtrip — GDPR data portability anti-
surveillance. Filename andura-export-YYYY-MM-DD.json.
```

## §6 Next

task_17 settings-danger sub-screen.
