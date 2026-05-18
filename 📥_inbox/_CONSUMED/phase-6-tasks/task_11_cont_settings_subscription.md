# task_11 — Cont Settings Subscription Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + route
**Deps:** task_10 LANDED
**Backup tag:** `pre-phase6-task-11-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +5-8

---

## §1 Scope

Mockup verbatim source `#screen-settings-subscription`. Beta gratuit info display + paywall placeholder post-Beta (NU live billing flow — UI shell V1).

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-subscription" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsSubscription.tsx`

- Card "Beta gratuit" status badge active
- "Plan curent" row → "Beta (gratuit pana la lansare)"
- "Lansare estimata" row → static text or omis V1
- CTA secondary "Restore purchases" (Apple/Google placeholder — Phase 7+ wire IAP)
- ZERO upgrade flow V1 (Phase 7+ subscription tier real wire)

### C. NEW route `/cont/settings-subscription`

### D. Cont.tsx row "Abonament" / "Plan" onClick wired

### E. Tests `src/react/__tests__/SettingsSubscription.test.tsx`

```js
- renders Beta gratuit badge active
- "Plan curent" display "Beta (gratuit pana la lansare)"
- back navigation gotoPath('cont')
- ZERO upgrade button real action (UI-only V1)
```

## §3 Acceptance criteria

- [ ] `SettingsSubscription.tsx` NEW screen LANDED mockup parity
- [ ] Route registered
- [ ] Cont.tsx row wired
- [ ] Beta gratuit info display
- [ ] Tests +5 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +5-8

## §5 Commit

```
feat(react/cont): settings-subscription Beta gratuit info display

NEW screen Beta gratuit status badge + plan curent info row. UI shell V1 —
ZERO upgrade flow live (Phase 7+ subscription tier real wire when IAP
flows defined post-Beta launch).
```

## §6 Next

task_12 settings-appearance sub-screen.
