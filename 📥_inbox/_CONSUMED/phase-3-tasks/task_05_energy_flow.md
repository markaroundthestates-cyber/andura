# TASK 05 — Energy Flow (EnergyCheck + EnergyCause + WorkoutPreview)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_04 task_06 task_07 task_08 task_09)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 3 rewrite stubs → real components
**Estimated new tests:** +20-30

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-05-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-021 (Energy Adjustment ±15%) §D-LEGACY-061 (anti-paternalism)
3. `04-architecture/mockups/andura-clasic.html` grep pentru:
   - `id="energy-check"` screen section + 5 emoji buttons
   - `id="energy-cause"` screen section + cause picker grid
   - `id="workout-preview"` screen + intensity banner + duration/volume + coach line + start button
   - `preview-intensity-banner` CSS variants (plus/normal/minus)
   - `setSchedContext` + `_dirSession` mockup references

---

## §2 Spec exact

### A) `EnergyCheck.tsx` rewrite stub → real

Screen "Cum te simti azi?" cu 5 emoji buttons (mockup):
- 💪 Excelent → intensity 'plus'
- ⚡ Bine → intensity 'normal'
- 😊 Normal → intensity 'normal'
- 🌱 Slabit → intensity 'minus' + goto energy-cause
- 😴 Obosit → intensity 'minus' + goto energy-cause

```tsx
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';

type EnergyLevel = 'excelent' | 'bine' | 'normal' | 'slabit' | 'obosit';

const ENERGY_OPTIONS: Array<{ level: EnergyLevel; emoji: string; label: string; intensity: 'plus' | 'normal' | 'minus' }> = [
  { level: 'excelent', emoji: '💪', label: 'Excelent', intensity: 'plus' },
  { level: 'bine', emoji: '⚡', label: 'Bine', intensity: 'normal' },
  { level: 'normal', emoji: '😊', label: 'Normal', intensity: 'normal' },
  { level: 'slabit', emoji: '🌱', label: 'Slabit', intensity: 'minus' },
  { level: 'obosit', emoji: '😴', label: 'Obosit', intensity: 'minus' },
];

export function EnergyCheck(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(option: typeof ENERGY_OPTIONS[number]) {
    if (option.intensity === 'minus') {
      navigate(gotoPath('energy-cause'), { state: { energyLevel: option.level, intensityMod: option.intensity } });
    } else {
      navigate(gotoPath('workout-preview'), { state: { energyLevel: option.level, intensityMod: option.intensity } });
    }
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-6">Cum te simti azi?</h1>
      <div className="flex flex-col gap-3">
        {ENERGY_OPTIONS.map((opt) => (
          <button
            key={opt.level}
            onClick={() => handleSelect(opt)}
            className="energy-btn flex items-center gap-4 p-4 rounded-xl border border-line-strong bg-paper2 hover:bg-paper transition"
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="body-text font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

### B) `EnergyCause.tsx` rewrite stub → real

Screen "De ce te simti asa?" cu cause grid (mockup buttons cause):
- Dormit putin
- Mancat putin
- Stres / oboseala mentala
- Antrenament greu ieri
- Boala / racit
- Altceva

Cu free-text optional input (NU mandatory — anti-force-typing D-LEGACY-010 §AMENDED) + Skip button.

```tsx
const CAUSE_OPTIONS = [
  'Dormit putin',
  'Mancat putin',
  'Stres mental',
  'Antrenament greu ieri',
  'Boala sau racit',
  'Altceva',
];

export function EnergyCause(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { energyLevel, intensityMod } = (location.state as any) || {};

  function handleSelect(cause: string) {
    navigate(gotoPath('workout-preview'), { state: { energyLevel, intensityMod, cause } });
  }

  function handleSkip() {
    navigate(gotoPath('workout-preview'), { state: { energyLevel, intensityMod } });
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">De ce te simti asa?</h1>
      <p className="body-text text-ink2 mb-6">Optional. Coach ajusteaza in functie de cauza.</p>
      <div className="grid grid-cols-2 gap-3">
        {CAUSE_OPTIONS.map((cause) => (
          <button
            key={cause}
            onClick={() => handleSelect(cause)}
            className="cause-btn p-4 rounded-xl border border-line-strong bg-paper2 text-ink hover:bg-paper transition"
          >
            <span className="small-text font-medium">{cause}</span>
          </button>
        ))}
      </div>
      <button onClick={handleSkip} className="w-full mt-6 py-3 text-ink3 small-text">
        Sari peste
      </button>
    </section>
  );
}
```

### C) `WorkoutPreview.tsx` rewrite stub → real

Screen preview cu intensity banner (plus/normal/minus colors), duration estimate, volume estimate, coach line, start workout button.

```tsx
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout } from '../../../lib/engineWrappers';

export function WorkoutPreview(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { intensityMod = 'normal' } = (location.state as any) || {};
  const userId = 'demo-user';
  const workout = getTodayWorkout(userId);

  // Banner colors per intensityMod
  const banner = intensityMod === 'plus'
    ? { bg: '#e7f0e2', border: '#bdd9b3', msg: 'Coach urca intensitatea +15%. Mai grele cu o haltera, 1 rep in plus.' }
    : intensityMod === 'minus'
    ? { bg: '#fbe3df', border: '#e8b2a8', msg: 'Coach reduce intensitatea -20%. Mai usor azi, focus pe forma.' }
    : { bg: '#fdf3df', border: '#e8d59a', msg: 'Sesiune normala — baseline. Coach ajusteaza in timpul sesiunii daca apare ceva.' };

  // Duration + volume estimates per intensityMod
  const duration = intensityMod === 'minus' ? 35 : intensityMod === 'plus' ? 60 : 50;
  const volume = intensityMod === 'minus' ? 10200 : intensityMod === 'plus' ? 14500 : 12450;

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">{workout?.workoutTitle || 'Push (piept & umeri)'}</h1>
      <div
        className="preview-intensity-banner p-3 rounded-xl border mb-6"
        style={{ background: banner.bg, borderColor: banner.border }}
      >
        <p className="body-text text-ink">{banner.msg}</p>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 p-4 rounded-xl bg-paper2 border border-line">
          <p className="small-text text-ink3">Durata estimata</p>
          <p className="display-text font-semibold text-ink">~ {duration} min</p>
        </div>
        <div className="flex-1 p-4 rounded-xl bg-paper2 border border-line">
          <p className="small-text text-ink3">Tonaj total</p>
          <p className="display-text font-semibold text-ink">{volume.toLocaleString('ro-RO').replace(/,/g, ' ')} kg</p>
        </div>
      </div>
      <p className="coach-quote body-text text-ink2 italic mb-6">
        „{coachPick('preview', undefined, 0)}"
      </p>
      <button
        onClick={() => navigate(gotoPath('workout'))}
        className="w-full py-4 bg-brick text-white rounded-xl body-text font-semibold"
      >
        Incepe antrenament
      </button>
    </section>
  );
}
```

---

## §3 Implementation hints

- Mockup CSS pattern: `.energy-btn`, `.cause-btn`, `.preview-intensity-banner` — port la Tailwind utilities sau preserve custom CSS class definitions (verifică Phase 1 LANDED config).
- React Router state passing: `navigate(path, { state })` + `useLocation().state` pentru transfer between screens (energy → cause → preview).
- Phase 4+ înlocuiește location.state cu workoutStore intensity slice (Phase 3 acceptable location.state pentru izolare flow).
- Anti-force-typing: EnergyCause Skip button mandatory visible. NU disable continue.
- Romanian no-diacritics rule preserved.

---

## §4 Tests vitest + RTL (MemoryRouter per D020)

### A) `EnergyCheck.test.tsx`

```typescript
describe('EnergyCheck screen', () => {
  it('renders 5 energy options cu emoji', () => { /* ... */ });
  it('Excelent navigates direct la workout-preview cu intensityMod=plus', () => { /* ... */ });
  it('Slabit navigates la energy-cause cu intensityMod=minus', () => { /* ... */ });
  it('Obosit navigates la energy-cause', () => { /* ... */ });
  // ... 5-7 tests
});
```

### B) `EnergyCause.test.tsx`

```typescript
describe('EnergyCause screen', () => {
  it('renders 6 cause options + Skip button', () => { /* ... */ });
  it('selects cause navigates la workout-preview cu cause în state', () => { /* ... */ });
  it('Skip navigates la workout-preview fara cause', () => { /* ... */ });
  // ... 5-7 tests
});
```

### C) `WorkoutPreview.test.tsx`

```typescript
describe('WorkoutPreview screen', () => {
  it('renders banner +15% intensity cand intensityMod=plus', () => { /* ... */ });
  it('renders banner -20% intensity cand intensityMod=minus', () => { /* ... */ });
  it('renders banner normal cand intensityMod=normal', () => { /* ... */ });
  it('duration estimate ~35 min cand intensityMod=minus', () => { /* ... */ });
  it('start button navigates la workout', () => { /* ... */ });
  // ... 6-10 tests
});
```

---

## §5 Acceptance criteria

- [ ] EnergyCheck + EnergyCause + WorkoutPreview real components (NU stubs)
- [ ] Energy flow chain: energy-check → [energy-cause optional] → workout-preview → workout
- [ ] Intensity mod propagated via location.state
- [ ] Mockup parity visual (intensity banner colors, energy buttons, cause grid)
- [ ] Romanian no-diacritics preserved
- [ ] Anti-force-typing: Skip button visible EnergyCause
- [ ] vitest count: +20-30 new tests
- [ ] TS strict compile clean

---

## §6 Commit strategy

3 commits atomic:
1. `feat(react/antrenor): EnergyCheck screen 5-option emoji selector + flow routing`
2. `feat(react/antrenor): EnergyCause screen cause grid + skip + location.state propagation`
3. `feat(react/antrenor): WorkoutPreview screen intensity banner + duration/volume + coach line`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-05-2026-05-16
git push origin pre-phase3-task-05-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_05 Energy flow. Phase C paralel. 3 sub-screens. Anti-force-typing preserved. Location.state propagation.**
