# task_09 — Cont Settings Profile Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + route + Cont landing wire
**Deps:** task_08 LANDED
**Backup tag:** `pre-phase6-task-09-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +8-12

---

## §1 Scope

Phase 5 task_13 `Cont.tsx` landing 5 sections cu 14 rows mockup verbatim. Phase 6 implements 9 sub-screens — `settings-profile` first. Mockup verbatim source `#screen-settings-profile` în `04-architecture/mockups/andura-clasic.html`.

Big 6 user profile edit: varsta + gen + obiectiv + frecventa + experienta + greutate. Modificare permite update Onboarding Big 6 typing post-T0.

## §2 Changes

### A. Grep mockup source verbatim

```bash
grep -n "screen-settings-profile" 04-architecture/mockups/andura-clasic.html | head -10
# Then extract LOC range pentru section complete
```

### B. NEW `src/react/screens/SettingsProfile.tsx`

- Big 6 form fields (mockup parity styling)
- Read din `useOnboardingStore` initial values
- Save action dispatch update `useOnboardingStore` + persist Dexie
- Back navigation prin `gotoPath('cont')`
- Loading skeleton primary paint

### C. NEW route `/cont/settings-profile`

`src/react/routes/index.tsx` add route entry pattern parity existing sub-screens (e.g. `/istoric/:sessionId` if exists).

### D. `Cont.tsx` landing nav wire

Row "Profil" onClick → `gotoPath('cont/settings-profile')` (mockup verbatim row label).

### E. Tests `src/react/__tests__/SettingsProfile.test.tsx`

```js
- renders 6 form fields (age + gender + goal + frequency + experience + weight)
- initial values populated din onboardingStore
- save updates store + persist Dexie
- back navigation calls gotoPath('cont')
- units toggle kg/lb respected
- locale ro-RO date formatting
- gender enum options 3 (M / F / Other)
- frequency enum options 5 (1/2/3/4/5+ per week)
- experience enum options 3 (beginner/intermediate/advanced)
```

## §3 Acceptance criteria

- [ ] `SettingsProfile.tsx` NEW screen LANDED mockup parity
- [ ] Route `/cont/settings-profile` registered
- [ ] Cont.tsx row wired `gotoPath('cont/settings-profile')`
- [ ] Big 6 update persists via onboardingStore
- [ ] Tests +8 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE preserved

## §4 Tests delta target +8-12

## §5 Commit

```
feat(react/cont): settings-profile sub-screen Big 6 edit mockup parity

NEW screen permite update Big 6 user profile post-T0 (varsta + gen + obiectiv
+ frecventa + experienta + greutate). Read din onboardingStore + save persist
Dexie. Route /cont/settings-profile registered. Cont landing row wired.
```

## §6 Next

task_10 settings-notifications sub-screen.
