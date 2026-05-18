# task_14 — Cont Settings Privacy Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + GDPR consent toggles
**Deps:** task_13 LANDED
**Backup tag:** `pre-phase6-task-14-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +6-10

---

## §1 Scope

Mockup verbatim source `#screen-settings-privacy`. Privacy preferences GDPR-aligned k-anonymity validation (ADR 019): data export consent + telemetry opt-in + analytics opt-in + crash reports opt-in.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-privacy" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsPrivacy.tsx`

- Toggle "Telemetrie anonima" (default off, opt-in mockup parity)
- Toggle "Rapoarte de erori" (default off)
- Toggle "Analitica de produs" (default off)
- Info row "Datele tale sunt locale" static text Anti-paternalism wording
- Link "Citeste politica completa" → settings-terms screen
- Save action persist settingsStore.privacy slice

### C. settingsStore privacy slice extend

```ts
interface PrivacySettings {
  telemetryOptIn: boolean;
  crashReportsOptIn: boolean;
  productAnalyticsOptIn: boolean;
}
const DEFAULT_PRIVACY: PrivacySettings = {
  telemetryOptIn: false, // ADR 019 k-anonymity opt-in default OFF
  crashReportsOptIn: false,
  productAnalyticsOptIn: false,
};
```

### D. NEW route `/cont/settings-privacy`

### E. Cont.tsx row "Confidentialitate" onClick wired

### F. Tests `src/react/__tests__/SettingsPrivacy.test.tsx`

```js
- 3 toggles default OFF (opt-in mandatory ADR 019)
- save persists settingsStore.privacy slice
- link "politica completa" navigates to settings-terms
- back navigation gotoPath('cont')
- ZERO actual telemetry dispatch când opt-in (UI-only V1, real wire Phase 7+)
```

## §3 Acceptance criteria

- [ ] `SettingsPrivacy.tsx` NEW screen LANDED
- [ ] 3 toggles default OFF invariant (ADR 019 opt-in)
- [ ] settingsStore.privacy slice persist
- [ ] ZERO telemetry actual dispatch (UI-only V1)
- [ ] Tests +6 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +6-10

## §5 Commit

```
feat(react/cont): settings-privacy GDPR consent toggles ADR 019 k-anonymity

NEW screen privacy preferences 3 toggles (telemetry + crash reports +
product analytics) default OFF per ADR 019 opt-in mandatory k-anonymity
validation. UI-only V1 — ZERO actual telemetry dispatch (Phase 7+ real
wire when consent flow defined).

Anti-paternalism preserved — "Datele tale sunt locale" info wording NU
surveillance-jargon. Link "Citeste politica completa" → settings-terms.
```

## §6 Next

task_15 settings-terms sub-screen.
