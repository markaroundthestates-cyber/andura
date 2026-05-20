# task_18 — Settings Persist Real + Theme Toggle Dark/Light

**Phase:** 6 (foundations)
**Type:** Feature — settings + theme + export
**Deps:** task_12 (Dexie) + task_13 (Cont sub-screens)
**Backup tag:** `pre-phase5-task-18-2026-05-17`
**Est commits:** 2 atomic (settings store + theme toggle + export)
**Est tests delta:** +12-18

---

## §1 Scope

Settings + Aspect + Export Cont sub-screens (task_13 dep) require persist real:
- Theme dark/light radio + body class toggle
- Units kg/lb radio (placeholder — engine uses kg internally invariant)
- Language placeholder (RO default invariant pre-Beta)
- Export full JSON + CSV sessions download

## §2 Changes

### A. `src/react/stores/settingsStore.ts` (NEW)

```tsx
export type Theme = 'light' | 'dark';
export type Units = 'kg' | 'lb';

export interface SettingsState {
  theme: Theme;
  units: Units;
}

export const useSettingsStore = create<SettingsState & {
  setTheme: (t: Theme) => void;
  setUnits: (u: Units) => void;
}>()(
  persist(
    (set) => ({
      theme: 'light',
      units: 'kg',
      setTheme: (theme) => set({ theme }),
      setUnits: (units) => set({ units }),
    }),
    { name: 'wv2-settings-store', storage: createDexieStorage() }
  )
);
```

### B. Theme apply hook `src/react/lib/useThemeApply.ts` (NEW)

```tsx
export function useThemeApply(): void {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme]);
}
```

Invoked în `App.tsx` root.

### C. CSS theme vars `src/react/styles/theme.css` (NEW or extend)

```css
.theme-light {
  --paper: #faf6ee;
  --paper-2: #f0e9d8;
  --ink: #1a1a1a;
  --ink-2: #555;
  --line: rgba(0,0,0,0.12);
  --brick: #c2410c;
}

.theme-dark {
  --paper: #1a1a1a;
  --paper-2: #2a2a2a;
  --ink: #f5f5f5;
  --ink-2: #aaa;
  --line: rgba(255,255,255,0.12);
  --brick: #ea580c;
}
```

NU break mockup paper-cream identity light theme default. Dark = inverted equivalent.

### D. Aspect screen (task_13)

```tsx
const theme = useSettingsStore((s) => s.theme);
const setTheme = useSettingsStore((s) => s.setTheme);
return (
  <div className="p-4">
    <h2 className="text-base font-bold mb-4">Aspect</h2>
    <div className="space-y-3">
      <label className="flex items-center gap-3 p-3 border border-line rounded-lg">
        <input type="radio" checked={theme === 'light'} onChange={() => setTheme('light')} />
        <span>Tema deschisa</span>
      </label>
      <label className="flex items-center gap-3 p-3 border border-line rounded-lg">
        <input type="radio" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
        <span>Tema intunecata</span>
      </label>
    </div>
  </div>
);
```

### E. Export screen (task_13)

```tsx
const handleExportJson = async () => {
  const allData = {
    profile: useProfileStore.getState(),
    sessions: JSON.parse(localStorage.getItem('wv2-sessions-history') ?? '[]'),
    schedule: useScheduleStore.getState(),
    settings: useSettingsStore.getState(),
    exportedAt: new Date().toISOString(),
  };
  downloadBlob(JSON.stringify(allData, null, 2), 'andura-export.json', 'application/json');
};

const handleExportCsv = () => {
  const sessions = JSON.parse(localStorage.getItem('wv2-sessions-history') ?? '[]');
  const rows = sessions.flatMap((s) =>
    (s.exercises ?? []).flatMap((ex) =>
      ex.sets.map((set) => ({
        date: new Date(s.startTime).toISOString().slice(0, 10),
        exercise: ex.exerciseName,
        set_idx: ex.sets.indexOf(set) + 1,
        kg: set.kg, reps: set.reps, rpe: set.rpe ?? '',
        is_pr: set.isPR ? 1 : 0,
      }))
    )
  );
  const csv = csvStringify(rows);
  downloadBlob(csv, 'andura-sessions.csv', 'text/csv');
};
```

Helper `downloadBlob(content, filename, mime)` standard Blob URL + temporary `<a download>` click pattern.

## §3 Acceptance criteria

- [ ] Settings persisted Dexie
- [ ] Theme toggle changes body class → CSS vars cascade
- [ ] Light theme = paper-cream identity preserved
- [ ] Dark theme = inverted (paper dark + ink light)
- [ ] Export JSON full data + Export CSV sessions only
- [ ] Tests +12-18 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/settingsStore.test.ts
- persists theme + units
- defaults light + kg

src/react/__tests__/useThemeApply.test.tsx
- toggles body.theme-dark class
- removes inverse class

src/react/__tests__/cont.Export.test.tsx
- exportJson creates blob with profile + sessions + settings
- exportCsv flattens sessions × exercises × sets
- downloadBlob invokes <a download> click
```

## §5 Commits (atomic 2)

```
feat(react/store): settingsStore Dexie + theme apply hook

Settings (theme + units) persist Dexie. useThemeApply hook toggles body
class light/dark. CSS theme.css vars cascade --paper --ink --line --brick
per theme. Light = paper-cream identity preserved invariant.

feat(react/screens): Cont Aspect + Export functional

Aspect radio theme toggle live preview. Export JSON full + CSV sessions
download helpers. downloadBlob utility shared.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_18_settings_persist_theme.md`:
- Theme CSS vars matrix
- Export JSON shape
- Export CSV shape flatten
