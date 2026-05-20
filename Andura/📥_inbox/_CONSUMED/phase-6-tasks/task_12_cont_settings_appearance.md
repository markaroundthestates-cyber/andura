# task_12 — Cont Settings Appearance Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + theme toggle real wire
**Deps:** task_11 LANDED
**Backup tag:** `pre-phase6-task-12-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Mockup verbatim source `#screen-settings-appearance`. Theme toggle dark/light + bottom nav style preference. Phase 5 task_18 `settingsStore.theme` slice exists — Phase 6 wire UI complete + CSS class root toggle.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-appearance" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsAppearance.tsx`

- Theme radio: "Luminos" / "Intunecat" / "Sistem (automat)"
- Bottom nav style toggle: "Standard" / "Compact" (visual demo inline preview)
- Color accent picker (3 options static V1: verde / albastru / mov)
- Save action persist settingsStore + dispatch CSS class root toggle `<html data-theme="...">`

### C. CSS theme variables `src/index.css` (or root style)

Ensure `:root[data-theme="dark"]` overrides existent — mockup verbatim color tokens. Phase 6 verifică CSS tokens parity NU rewrite.

### D. NEW route `/cont/settings-appearance`

### E. Cont.tsx row "Aspect" / "Tema" onClick wired

### F. Tests `src/react/__tests__/SettingsAppearance.test.tsx`

```js
- theme radio 3 options (luminos/intunecat/sistem)
- theme select dispatches data-theme attribute root
- bottom nav style toggle persists
- color accent picker 3 options
- save persists settingsStore
- back navigation gotoPath('cont')
- system theme respects prefers-color-scheme media query
```

## §3 Acceptance criteria

- [ ] `SettingsAppearance.tsx` NEW screen LANDED
- [ ] Theme radio dispatches `<html data-theme="...">` root
- [ ] System theme detects prefers-color-scheme
- [ ] settingsStore.theme persist Dexie
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/cont): settings-appearance theme toggle + nav style + accent

NEW screen permite theme toggle (luminos/intunecat/sistem) + bottom nav
style + color accent. Dispatches <html data-theme="..."> root attribute
+ persist settingsStore. System theme respects prefers-color-scheme media
query.
```

## §6 Next

task_13 settings-prefs sub-screen.
