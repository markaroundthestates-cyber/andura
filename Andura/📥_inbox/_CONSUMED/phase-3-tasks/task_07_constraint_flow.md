# TASK 07 — Constraint Flow (EquipmentSwap + AparateLipsa + ScheduleOverride)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_04 task_05 task_06 task_08 task_09)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 3 rewrite stubs → real components
**Estimated new tests:** +20-30

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-07-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-038 (Smart Routing Equipment v2 cascade) §D-LEGACY-076 (Calendar V1 spec)
3. `04-architecture/mockups/andura-clasic.html` grep:
   - `id="equipment-swap"` screen + equipment list toggle
   - `id="aparate-lipsa"` screen + alternative exercise suggestion
   - `id="schedule-override"` screen + per-day intent picker

---

## §2 Spec exact

### A) `EquipmentSwap.tsx` rewrite stub → real

Screen "Aparate ocupate?" cu equipment list toggle + smart routing cascade per D-LEGACY-038. Lista echipamente curente sesiune (din workoutStore via engineWrappers.getTodayWorkout sau hardcoded Phase 3 demo).

Equipment toggle UI:
- Lista exerciții din sesiune curentă cu echipament asociat
- Toggle "Aparat ocupat" per echipament
- Coach recalculate alternative cascade (engine cascade Phase 4 wire — Phase 3 placeholder text "Coach gaseste alternative")
- "Continui adaptat" → goto workout-preview cu equipmentContext în state

```tsx
type EquipmentStatus = 'available' | 'busy';

interface EquipmentItem {
  id: string;
  name: string; // "Bench press", "Smith machine", "Lat pulldown", etc.
  status: EquipmentStatus;
}

export function EquipmentSwap(): JSX.Element {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([
    { id: 'bench', name: 'Bench press', status: 'available' },
    { id: 'smith', name: 'Smith machine', status: 'available' },
    { id: 'lat-pulldown', name: 'Lat pulldown', status: 'available' },
    { id: 'cable-row', name: 'Cable row', status: 'available' },
    { id: 'leg-press', name: 'Leg press', status: 'available' },
  ]);

  function toggleStatus(id: string) {
    setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, status: e.status === 'available' ? 'busy' : 'available' } : e));
  }

  function handleContinue() {
    const busy = equipment.filter((e) => e.status === 'busy').map((e) => e.id);
    navigate(gotoPath('workout-preview'), { state: { equipmentContext: { busy } } });
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Aparate ocupate?</h1>
      <p className="body-text text-ink2 mb-6">Marcheaza ce e ocupat. Coach gaseste alternative.</p>
      <div className="flex flex-col gap-2 mb-6">
        {equipment.map((e) => (
          <button
            key={e.id}
            onClick={() => toggleStatus(e.id)}
            className={`flex items-center justify-between p-4 rounded-xl border ${e.status === 'busy' ? 'bg-brick/10 border-brick' : 'bg-paper2 border-line-strong'}`}
          >
            <span className="body-text font-medium text-ink">{e.name}</span>
            <span className={`small-text font-semibold ${e.status === 'busy' ? 'text-brick' : 'text-ink3'}`}>
              {e.status === 'busy' ? 'Ocupat' : 'Liber'}
            </span>
          </button>
        ))}
      </div>
      <button onClick={handleContinue} className="w-full py-4 bg-brick text-white rounded-xl body-text font-semibold">
        Continui adaptat
      </button>
    </section>
  );
}
```

### B) `AparateLipsa.tsx` rewrite stub → real

Screen "Aparat lipsa?" — pentru exerciții care necesită echipament inexistent în sala (e.g., home gym setup, sala mică). Different from equipment-swap (ocupat temporar) — aici e absent permanent.

UI: lista echipamente filtrabile + selector "Lipseste din sala" + persistent toggle (Phase 4 wires la userSettings store).

```tsx
const EQUIPMENT_CATEGORIES = [
  { id: 'free-weights', label: 'Greutati libere', items: ['Haltere mici', 'Haltere mari', 'Bara olimpica', 'Discuri'] },
  { id: 'machines', label: 'Aparate', items: ['Smith', 'Lat pulldown', 'Cable row', 'Leg press', 'Hack squat'] },
  { id: 'cardio', label: 'Cardio', items: ['Banda alergat', 'Bicicleta', 'Eliptic'] },
];

export function AparateLipsa(): JSX.Element {
  const navigate = useNavigate();
  const [missing, setMissing] = useState<Set<string>>(new Set());

  function toggle(item: string) {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item); else next.add(item);
      return next;
    });
  }

  function handleSave() {
    // Phase 4 wires la userSettings store persist
    navigate(gotoPath('workout-preview'), { state: { missingEquipment: Array.from(missing) } });
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Ce aparate lipsesc?</h1>
      <p className="body-text text-ink2 mb-6">Salvez setarea. Coach NU mai recomanda exercitii pe acestea.</p>
      {EQUIPMENT_CATEGORIES.map((cat) => (
        <div key={cat.id} className="mb-4">
          <p className="small-text font-semibold text-ink3 mb-2">{cat.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {cat.items.map((item) => (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`p-3 rounded-xl border ${missing.has(item) ? 'bg-brick/10 border-brick' : 'bg-paper2 border-line-strong'}`}
              >
                <span className="small-text text-ink">{item}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSave} className="w-full py-4 bg-brick text-white rounded-xl body-text font-semibold mt-6">
        Salveaza setarea
      </button>
    </section>
  );
}
```

### C) `ScheduleOverride.tsx` rewrite stub → real

Screen "Vrei alt antrenament azi?" (Calendar V1 override per D-LEGACY-076). Picker:
- "Antrenament mai usor" → intensityMod=minus
- "Antrenament mai greu" → intensityMod=plus
- "Alta grupa musculara" → picker grupe (piept/spate/picioare/umeri/brate/core)
- "Doar mobilitate / stretching" → low intensity routine
- "Cardio doar" → cardio session

```tsx
type OverrideKind = 'easier' | 'harder' | 'different-muscle' | 'mobility' | 'cardio';

const OVERRIDE_OPTIONS: Array<{ kind: OverrideKind; label: string; description: string }> = [
  { kind: 'easier', label: 'Mai usor', description: 'Intensitate redusa -20%' },
  { kind: 'harder', label: 'Mai greu', description: 'Intensitate crescuta +15%' },
  { kind: 'different-muscle', label: 'Alta grupa', description: 'Schimba target azi' },
  { kind: 'mobility', label: 'Mobilitate', description: 'Stretching + dynamic warm-up' },
  { kind: 'cardio', label: 'Cardio doar', description: 'Sesiune cardio 25-40 min' },
];

export function ScheduleOverride(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(kind: OverrideKind) {
    const intensityMod = kind === 'easier' ? 'minus' : kind === 'harder' ? 'plus' : 'normal';
    navigate(gotoPath('workout-preview'), { state: { overrideKind: kind, intensityMod } });
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Vrei alt antrenament azi?</h1>
      <p className="body-text text-ink2 mb-6">Coach respecta. Doar azi — maine reia planul.</p>
      <div className="flex flex-col gap-3">
        {OVERRIDE_OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            onClick={() => handleSelect(opt.kind)}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-line-strong bg-paper2 hover:bg-paper transition text-left"
          >
            <span className="body-text font-medium text-ink">{opt.label}</span>
            <span className="small-text text-ink3">{opt.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

---

## §3 Implementation hints

- Smart Routing Equipment v2 (D-LEGACY-038): cascade ordered list + sequence reordering — Phase 3 placeholder NU implementat. Phase 4+ wires engine cascade.
- Calendar V1 (D-LEGACY-076): override = ephemeral (azi only, next Monday resets to original preset per scheduleAdapter). Phase 3 location.state propagation acceptable.
- Romanian no-diacritics rule preserved.
- Persona-aware variants opțional Phase 3 (Maria simplified labels, Marius granular).

---

## §4 Tests vitest + RTL (MemoryRouter per D020)

### A) `EquipmentSwap.test.tsx`

```typescript
describe('EquipmentSwap screen', () => {
  it('renders equipment list cu status available default', () => { /* ... */ });
  it('toggle equipment status available ↔ busy', () => { /* ... */ });
  it('Continue navigates workout-preview cu equipmentContext.busy în state', () => { /* ... */ });
  // ... 5-7 tests
});
```

### B) `AparateLipsa.test.tsx`

```typescript
describe('AparateLipsa screen', () => {
  it('renders 3 categories cu items each', () => { /* ... */ });
  it('toggle item adds la missing set', () => { /* ... */ });
  it('toggle item again removes from missing set', () => { /* ... */ });
  it('Save navigates workout-preview cu missingEquipment array în state', () => { /* ... */ });
  // ... 5-7 tests
});
```

### C) `ScheduleOverride.test.tsx`

```typescript
describe('ScheduleOverride screen', () => {
  it('renders 5 override options', () => { /* ... */ });
  it('easier selects → intensityMod=minus', () => { /* ... */ });
  it('harder selects → intensityMod=plus', () => { /* ... */ });
  it('mobility selects → intensityMod=normal + overrideKind=mobility', () => { /* ... */ });
  // ... 6-8 tests
});
```

---

## §5 Acceptance criteria

- [ ] EquipmentSwap + AparateLipsa + ScheduleOverride real components
- [ ] Constraint context propagated la workout-preview via location.state (equipmentContext, missingEquipment, overrideKind, intensityMod)
- [ ] Toggle UI patterns: equipment status, missing equipment Set, override picker
- [ ] Romanian no-diacritics preserved
- [ ] vitest count: +20-30 new tests

---

## §6 Commit strategy

3 commits atomic:
1. `feat(react/antrenor): EquipmentSwap screen toggle list + busy/available status + cascade stub`
2. `feat(react/antrenor): AparateLipsa screen missing equipment Set toggle + persist stub`
3. `feat(react/antrenor): ScheduleOverride screen 5-option picker + Calendar V1 override stub`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-07-2026-05-16
git push origin pre-phase3-task-07-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_07 Constraint flow. Phase C paralel. 3 sub-screens. Calendar V1 ephemeral override. Persist stubs Phase 4 wire real.**
