# task_10 — Cont Settings Notifications Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + route + Cont landing wire
**Deps:** task_09 LANDED
**Backup tag:** `pre-phase6-task-10-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Mockup verbatim source `#screen-settings-notifications`. Toggle preferinte notification: toast workout reminder + frecventa daily/weekly + zile active L-Ma-Mi-J-V-S-D.

Phase 5 task_18 `settingsStore` exists cu notification slice scaffold. Phase 6 wire UI complete.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-notifications" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsNotifications.tsx`

- Toggle "Notificari workout" on/off (main switch)
- Frecventa radio buttons: zilnic / saptamanal / off
- Day picker 7 chips L-Ma-Mi-J-V-S-D (multi-select, mockup parity Calendar7Day)
- Time picker HH:MM single (default 18:00 reminder before evening workout)
- Save action persist `useSettingsStore`

### C. NEW route `/cont/settings-notifications`

### D. Cont.tsx row "Notificari" onClick wired

### E. Tests `src/react/__tests__/SettingsNotifications.test.tsx`

```js
- main toggle on/off respects store
- frequency radio 3 options (zilnic/saptamanal/off)
- day picker multi-select 7 chips
- time picker HH:MM format 24h
- save persists settingsStore
- back navigation gotoPath('cont')
- ZERO browser notification API call (gating Phase 7 — UI-only V1)
```

## §3 Acceptance criteria

- [ ] `SettingsNotifications.tsx` NEW screen LANDED mockup parity
- [ ] Route `/cont/settings-notifications` registered
- [ ] Cont.tsx row wired
- [ ] settingsStore notification slice consumed
- [ ] ZERO actual notification dispatch (UI-only Phase 6, real wire Phase 7+)
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/cont): settings-notifications sub-screen toggle + frequency + days

NEW screen permite configurare notification preferences (main toggle +
frequency radio + day picker multi-select + time picker). Persist
settingsStore. UI-only V1 — ZERO actual notification dispatch (Phase 7+
real wire when service worker + permissions flow).
```

## §6 Next

task_11 settings-subscription sub-screen.
