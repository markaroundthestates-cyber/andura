# task_17 — T&C + Medical Disclaimer Modal React Port (LOCK 4)

**Phase:** 6 (foundations)
**Type:** Feature — legal text port LOCK 4 D-LEGACY-060
**Deps:** task_14 (profileStore acceptance timestamps)
**Backup tag:** `pre-phase5-task-17-2026-05-17`
**Est commits:** 1 atomic
**Est tests delta:** +8-12

---

## §1 Scope

LOCK 4 (D-LEGACY-060) Medical Disclaimer + T&C verbatim text MUST be displayed at onboarding step 7 + 8 + accessible permanent via Cont/About (task_13 dependency). Vanilla `src/ui/modals/legalModals.js` has verbatim copy. React port: 2 modal components + reuse via Onboarding step + About drill.

## §2 Changes

### A. `src/react/components/legal/MedicalDisclaimerModal.tsx` (NEW)

```tsx
import { useProfileStore } from '../../stores/profileStore';

const MEDICAL_DISCLAIMER_TEXT = `
[Verbatim text from src/ui/modals/legalModals.js — copy via grep verify]

LOCK 4 (D-LEGACY-060) text preserved EXACT. NO modifications.
`;

export function MedicalDisclaimerModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }): JSX.Element {
  const [agreed, setAgreed] = useState(false);
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-paper max-w-md w-full rounded-2xl p-6 max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-bold mb-3">Avertizare medicala</h2>
        <div className="overflow-y-auto flex-1 text-sm text-ink2 mb-4 whitespace-pre-wrap">
          {MEDICAL_DISCLAIMER_TEXT}
        </div>
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span className="text-sm">Am citit si inteleg avertizarea medicala</span>
        </label>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-line rounded-lg">Inchide</button>
          <button onClick={onAccept} disabled={!agreed} className="flex-1 py-2 bg-brick text-paper rounded-lg disabled:opacity-50">
            Confirma
          </button>
        </div>
      </div>
    </div>
  );
}
```

### B. `src/react/components/legal/TermsModal.tsx` (NEW)

Similar pattern cu T&C verbatim text. Same UI scaffold.

### C. Onboarding wizard integration (task_14)

Steps `tc` + `medical` use these modal components inline ca screen content. On accept → store timestamp via `acceptTC()` / `acceptMedicalDisclaimer()`.

### D. Cont/About drill (task_13)

About sub-screen exposes "Termeni si Conditii" + "Avertizare medicala" drill items care deschid modals oricand re-read.

## §3 Acceptance criteria

- [ ] Verbatim copy LOCK 4 D-LEGACY-060 preserved EXACT (grep verify src/ui/modals/legalModals.js)
- [ ] Checkbox required înainte Confirma button enabled
- [ ] Onboarding step integrare timestamp persist (task_14 dep)
- [ ] Cont/About re-read access oricând
- [ ] Modals dismissable via Inchide button + ESC key + outside click optional
- [ ] Accessibility — role="dialog" aria-modal aria-labelledby
- [ ] Tests +8-12 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/MedicalDisclaimerModal.test.tsx
- renders verbatim text content
- Confirma disabled until checkbox checked
- onAccept callback invoked on Confirma
- onClose callback invoked on Inchide

src/react/__tests__/TermsModal.test.tsx
- mirror MedicalDisclaimer pattern
```

## §5 Commits (atomic 1)

```
feat(react/components/legal): T&C + Medical Disclaimer modals LOCK 4 port

Verbatim text from src/ui/modals/legalModals.js preserved EXACT per
LOCK 4 D-LEGACY-060 invariant. 2 modal components cu checkbox-gated
Confirma button. Onboarding wizard integration (task_14 dep) +
Cont/About re-read drill (task_13 dep). Accessibility role=dialog.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_17_tc_medical_disclaimer_modals.md`:
- LOCK 4 verbatim verify grep source
- Acceptance flow timestamps
- Re-read access via Cont/About
