# task_15 — Cont Settings Terms Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + T&C + Medical Disclaimer re-display
**Deps:** task_14 LANDED
**Backup tag:** `pre-phase6-task-15-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +5-8

---

## §1 Scope

Mockup verbatim source `#screen-settings-terms`. Re-display T&C document + Medical Disclaimer (Phase 5 task_17 LOCK 4 MedicalDisclaimerModal LANDED — same content rendered inline). User accessibility post-onboarding pentru review.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-terms" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsTerms.tsx`

- 2 tabs / accordion sections: "Termeni si Conditii" + "Disclaimer Medical"
- T&C full text (mockup verbatim — Phase 5 task_17 content reuse)
- Medical Disclaimer full text (Phase 5 task_17 4 paragrafe reuse: informativ NU substitut + consultare medic + oprire la durere + consent)
- Static read-only — no edit / consent toggle (only display post-acceptance)
- Footer "Versiune document: V1 — 2026-05-XX"

### C. Reuse content constants din `MedicalDisclaimerModal.tsx` Phase 5 task_17

Export 4 paragrafe const din modal pentru reuse settings screen. Single source of truth.

### D. NEW route `/cont/settings-terms`

### E. Cont.tsx row "Termeni si conditii" / "Disclaimer medical" → both link `/cont/settings-terms`

### F. Tests `src/react/__tests__/SettingsTerms.test.tsx`

```js
- renders 2 sections (T&C + Medical Disclaimer)
- T&C text matches mockup verbatim
- Medical Disclaimer 4 paragrafe matches modal content
- back navigation gotoPath('cont')
- no consent re-acceptance (read-only post-onboarding)
- footer version display
```

## §3 Acceptance criteria

- [ ] `SettingsTerms.tsx` NEW screen LANDED
- [ ] Reuse Medical Disclaimer content constants din modal (single source)
- [ ] Read-only display (NU consent re-toggle)
- [ ] Tests +5 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +5-8

## §5 Commit

```
feat(react/cont): settings-terms T&C + Medical Disclaimer re-display

NEW screen re-display T&C + Medical Disclaimer post-onboarding. Reuse
content constants din MedicalDisclaimerModal Phase 5 task_17 (single source
of truth). Read-only — no consent re-toggle. Footer version row.
```

## §6 Next

task_16 settings-export sub-screen.
