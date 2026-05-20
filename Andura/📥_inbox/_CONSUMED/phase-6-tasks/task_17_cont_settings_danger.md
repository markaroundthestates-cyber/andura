# task_17 — Cont Settings Danger Sub-Screen

**Phase:** 6 (Cont Tab sub-screens)
**Type:** Feature — React screen + destructive actions cu double-confirm
**Deps:** task_16 LANDED
**Backup tag:** `pre-phase6-task-17-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +8-12

---

## §1 Scope

Mockup verbatim source `#screen-settings-danger`. Destructive actions cu double-confirm modal: logout + reset all data + delete account (Firebase auth removal + IndexedDB Dexie clear + localStorage purge).

Closure Cont sub-screens — last task din 9-screen series (#9-#17).

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-settings-danger" 04-architecture/mockups/andura-clasic.html
```

### B. NEW `src/react/screens/SettingsDanger.tsx`

3 row-uri cu severity progressive:
- "Iesire din cont" → confirm modal "Esti sigur? Vei pierde sesiunea curenta" → logout dispatch
- "Reseteaza datele locale" → confirm modal "Toate datele tale vor fi sterse de pe acest dispozitiv. Esti sigur?" → IndexedDB Dexie clear + localStorage purge + dispatch reset stores
- "Sterge contul permanent" → DOUBLE confirm modal (type "STERGE" pentru confirm + 5sec delay button enable) → Firebase auth delete + Dexie clear + localStorage purge + navigate splash

### C. NEW `src/react/components/ConfirmDangerModal.tsx`

Reusable modal cu 3 variants severity (low/mid/high cu type-to-confirm):
```tsx
interface ConfirmDangerModalProps {
  severity: 'low' | 'mid' | 'high';
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  requireTypeConfirm?: string; // e.g. "STERGE" — only severity 'high'
  enableDelayMs?: number; // e.g. 5000 — only severity 'high'
}
```

### D. NEW helpers `src/react/lib/dangerActions.ts`

```ts
export async function logoutUser(): Promise<void> {
  // Firebase auth signOut
  // Clear stores in-memory (NU Dexie — sessions preserved)
}

export async function resetLocalData(): Promise<void> {
  // IndexedDB Dexie clear all tables
  // localStorage purge wv2-* keys
  // Reset Zustand stores
}

export async function deleteAccountPermanent(): Promise<void> {
  // Firebase auth deleteUser (requires recent sign-in)
  // Resetlocal data
  // Navigate to splash
}
```

### E. NEW route `/cont/settings-danger`

### F. Cont.tsx rows "Iesire din cont" / "Reseteaza date" / "Sterge cont" onClick wired

### G. Tests `src/react/__tests__/SettingsDanger.test.tsx`

```js
- logout dispatches Firebase signOut + clears stores in-memory
- reset clears Dexie + localStorage wv2-* + Zustand stores
- delete account requires type "STERGE" + 5sec delay enable
- ConfirmDangerModal 3 severity variants render correctly
- back navigation gotoPath('cont')
- cancel preserves state (no destructive action)
- post-delete navigate splash
```

## §3 Acceptance criteria

- [ ] `SettingsDanger.tsx` + `ConfirmDangerModal.tsx` + `dangerActions.ts` LANDED
- [ ] 3 actions (logout + reset + delete) cu severity-appropriate confirm
- [ ] Type-to-confirm "STERGE" + 5sec delay only severity 'high'
- [ ] Tests +8 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE
- [ ] CLOSURE Cont sub-screens 9/9 LANDED

## §4 Tests delta target +8-12

## §5 Commit

```
feat(react/cont): settings-danger logout + reset + delete account flows

NEW screen + ConfirmDangerModal (3 severity variants) + dangerActions helpers
(logout + resetLocalData + deleteAccountPermanent). Type-to-confirm "STERGE"
+ 5sec delay enable button only severity high (delete account permanent).

Closure Cont sub-screens 9/9 LANDED — Phase 6 Cont Tab complete mockup parity.
Firebase auth integration ready, Dexie + localStorage purge wired.
```

## §6 Next

task_18 TS strict noUncheckedIndexedAccess flag enable.
