# task_14 — Onboarding T0 Big 6 Hard Typing React Port

**Phase:** 6 (foundations)
**Type:** Feature — onboarding flow port mockup screens
**Deps:** task_12 (Dexie storage profile persist)
**Backup tag:** `pre-phase5-task-14-2026-05-17`
**Est commits:** 3-4 atomic (Big 6 form + Profile store + onboarding flow)
**Est tests delta:** +20-30

---

## §1 Scope

Onboarding T0 Big 6 Hard Typing (D-LEGACY-062 + D-LEGACY-097) = mandatory user typing 6 demographic+experience attributes pentru cold-start engine personalization (Demographic Prior Database D-LEGACY-013 ADR 017):
- Age (years)
- Sex (M/F — per ADR 017 simplified binary biological context)
- Height (cm)
- Weight (kg)
- Experience level (T0 beginner / T1 intermediate / T2 advanced)
- Primary goal (CUT / BULK / MAINTAIN / RECOMP)

Mockup screens `andura-clasic.html` `#screen-onb-1` ... `#screen-onb-7` Big 6 progressive forms + T&C confirmation final.

Currently `src/react/routes/screens/Onboarding.tsx` placeholder. Task 14: full port 7 screens flow + persist via Dexie + Goal Adaptation engine seed via Demographic Prior.

## §2 Changes

### A. `src/react/stores/profileStore.ts` (NEW)

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDexieStorage } from '../storage/zustandDexieStorage';

export type Sex = 'M' | 'F';
export type ExperienceTier = 'T0' | 'T1' | 'T2';
export type Goal = 'CUT' | 'BULK' | 'MAINTAIN' | 'RECOMP';

export interface ProfileState {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  experience: ExperienceTier | null;
  goal: Goal | null;
  onboardedAt: number | null;
  tcAcceptedAt: number | null;
  medicalDisclaimerAcceptedAt: number | null;
}

export interface ProfileActions {
  setBig6: (data: Partial<Pick<ProfileState, 'age' | 'sex' | 'heightCm' | 'weightKg' | 'experience' | 'goal'>>) => void;
  completeOnboarding: () => void;
  acceptTC: () => void;
  acceptMedicalDisclaimer: () => void;
  reset: () => void;
}

const INITIAL: ProfileState = {
  age: null, sex: null, heightCm: null, weightKg: null,
  experience: null, goal: null, onboardedAt: null,
  tcAcceptedAt: null, medicalDisclaimerAcceptedAt: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      ...INITIAL,
      setBig6: (data) => set((s) => ({ ...s, ...data })),
      completeOnboarding: () => set({ onboardedAt: Date.now() }),
      acceptTC: () => set({ tcAcceptedAt: Date.now() }),
      acceptMedicalDisclaimer: () => set({ medicalDisclaimerAcceptedAt: Date.now() }),
      reset: () => set(INITIAL),
    }),
    {
      name: 'wv2-profile-store',
      storage: createDexieStorage(),
    }
  )
);
```

### B. Onboarding wizard `src/react/routes/screens/Onboarding.tsx` (refactor)

State machine via local `useState` step counter + zustand store dispatch finalize:
```tsx
type Step = 'welcome' | 'age' | 'sex' | 'height-weight' | 'experience' | 'goal' | 'tc' | 'medical' | 'done';

export function Onboarding(): JSX.Element {
  const [step, setStep] = useState<Step>('welcome');
  const setBig6 = useProfileStore((s) => s.setBig6);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const acceptTC = useProfileStore((s) => s.acceptTC);
  const acceptMedical = useProfileStore((s) => s.acceptMedicalDisclaimer);
  const navigate = useNavigate();

  const handleNext = (data?: Partial<...>) => {
    if (data) setBig6(data);
    const flow: Step[] = ['welcome', 'age', 'sex', 'height-weight', 'experience', 'goal', 'tc', 'medical', 'done'];
    const idx = flow.indexOf(step);
    if (idx < flow.length - 1) setStep(flow[idx + 1]);
    else {
      completeOnboarding();
      navigate('/antrenor');
    }
  };

  // Render step-specific form
  return <div className="p-6 min-h-screen flex flex-col">{renderStep(step, handleNext, ...)}</div>;
}
```

### C. Step components (7 small components inline OR separate)

- **Welcome** — splash + "Hai sa te cunoastem" CTA
- **AgeForm** — number input 16-90 validation
- **SexForm** — radio M/F (cu sublabel "Pentru context biologic. Nu vinde-cumpara conform GDPR.")
- **HeightWeightForm** — 2 number inputs cu validare realiste (140-220 cm + 35-200 kg)
- **ExperienceForm** — 3 radio cu descriere fiecare tier (T0 incepator < 6 luni / T1 intermediar 6m-2 ani / T2 avansat 2+ ani)
- **GoalForm** — 4 radio CUT/BULK/MAINTAIN/RECOMP cu descriere RO
- **TCForm** — Termeni si Conditii scrollable + checkbox "Am citit si accept" + buton Continua
- **MedicalForm** — Medical Disclaimer LOCK 4 (D-LEGACY-060) verbatim text + checkbox + buton Confirm

### D. Engine seed Demographic Prior

Pe `completeOnboarding()` invocation, seed engine via `src/engine/demographicPrior.js` (D-LEGACY-013 ADR 017):
```tsx
import { seedDemographicPrior } from '../../engine/demographicPrior.js';

completeOnboarding: () => {
  const state = get();
  set({ onboardedAt: Date.now() });
  try {
    seedDemographicPrior({
      age: state.age!,
      sex: state.sex!,
      heightCm: state.heightCm!,
      weightKg: state.weightKg!,
      experience: state.experience!,
      goal: state.goal!,
    });
  } catch (e) {
    console.warn('[profileStore] seedDemographicPrior failed:', e);
  }
},
```

### E. `ProtectedRoute.tsx` (gate)

If `onboardedAt === null` → redirect `/onboarding`. Else allow access.

## §3 Acceptance criteria

- [ ] 7-step onboarding wizard works
- [ ] Big 6 data validated (age 16-90, height 140-220, weight 35-200, etc.)
- [ ] Profile persisted via Dexie
- [ ] T&C acceptance timestamped
- [ ] Medical Disclaimer acceptance timestamped (LOCK 4 invariant)
- [ ] ProtectedRoute gates app pre-onboarding
- [ ] Demographic Prior seeded engine post-completion
- [ ] Mockup parity preserved (verbatim copy când disponibil)
- [ ] Tests +20-30 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/Onboarding.flow.test.tsx
- step 1 → 2 → ... → done progression
- Big 6 validations enforce ranges
- back button navigates correctly

src/react/__tests__/profileStore.test.ts
- setBig6 merges partial data
- completeOnboarding sets timestamp
- acceptTC + acceptMedical timestamps independent
- reset returns to initial state

src/react/__tests__/ProtectedRoute.onboarding.test.tsx
- redirects to /onboarding când onboardedAt null
- allows access când onboardedAt set
```

## §5 Commits (atomic 3-4)

```
feat(react/store): profileStore Dexie persist Big 6 + T&C + Medical

7-field profile state cu zustand persist Dexie. Big 6 hard typing pattern
ADR 014 onboarding-profile-typing. T&C + Medical Disclaimer timestamps
LOCK 4 D-LEGACY-060 invariant.

feat(react/screens): Onboarding wizard 7-step Big 6 React port

State machine local useState + zustand dispatch finalize. Validations
range-bound demographics realistic. Mockup parity #screen-onb-1..7.

feat(react/routes): ProtectedRoute onboarding gate redirect

Pre-onboarding access blocked redirect /onboarding. Post-completion
allows /antrenor + tabs access. Backward compat existing users (no
gate flag triggered).

feat(engine): seedDemographicPrior consumer wire profileStore

Profile completeOnboarding invokes seedDemographicPrior cold-start
engine personalization. ADR 017 demographic-prior-database invariant
preserved.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_14_onboarding_t0_big6.md`:
- Step flow + back button UX
- Validation ranges per field
- Demographic prior seed confirm
- ProtectedRoute gate path
