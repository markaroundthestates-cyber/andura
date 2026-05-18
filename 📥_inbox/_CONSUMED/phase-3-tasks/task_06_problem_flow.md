# TASK 06 — Problem Flow (CevaNuMerge + PainButton)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_04 task_05 task_07 task_08 task_09)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 2 rewrite stubs → real components
**Estimated new tests:** +15-20

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-06-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-035 (Pain/Discomfort Button architecture CDL override)
3. `04-architecture/mockups/andura-clasic.html` grep:
   - `id="ceva-nu-merge"` screen
   - `id="pain-button"` screen + pain location grid (anatomical body map)
   - CDL override pattern (mockup `_dirSession` references)

---

## §2 Spec exact

### A) `CevaNuMerge.tsx` rewrite stub → real

Screen "Ceva nu merge azi?" cu picker:
- "Ma doare ceva" → goto pain-button
- "Aparate ocupate" → goto equipment-swap
- "Aparat lipsa" → goto aparate-lipsa
- "Vreau alt antrenament" → goto schedule-override
- "Renunt azi" → confirm cancel (Phase 4 confirm-* screens) sau direct goto antrenor

```tsx
type ProblemKind = 'pain' | 'equipment-busy' | 'equipment-missing' | 'override' | 'cancel';

const PROBLEM_OPTIONS: Array<{ kind: ProblemKind; label: string; icon: string }> = [
  { kind: 'pain', label: 'Ma doare ceva', icon: 'activity' },
  { kind: 'equipment-busy', label: 'Aparate ocupate', icon: 'users' },
  { kind: 'equipment-missing', label: 'Aparat lipsa', icon: 'package-x' },
  { kind: 'override', label: 'Vreau alt antrenament', icon: 'shuffle' },
  { kind: 'cancel', label: 'Renunt azi', icon: 'x-circle' },
];

export function CevaNuMerge(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(kind: ProblemKind) {
    const routes: Record<ProblemKind, string> = {
      'pain': gotoPath('pain-button'),
      'equipment-busy': gotoPath('equipment-swap'),
      'equipment-missing': gotoPath('aparate-lipsa'),
      'override': gotoPath('schedule-override'),
      'cancel': gotoPath('antrenor'), // Phase 4 will route la confirm-finish-early
    };
    navigate(routes[kind]);
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Ceva nu merge azi?</h1>
      <p className="body-text text-ink2 mb-6">Spune-mi ce e si ajustez sesiunea.</p>
      <div className="flex flex-col gap-3">
        {PROBLEM_OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            onClick={() => handleSelect(opt.kind)}
            className="flex items-center gap-4 p-4 rounded-xl border border-line-strong bg-paper2 hover:bg-paper transition"
          >
            <i data-lucide={opt.icon} className="w-5 h-5 text-ink3" />
            <span className="body-text font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

### B) `PainButton.tsx` rewrite stub → real

Screen "Unde te doare?" cu anatomical body map (simplified clickable regions) + intensity selector + free-text optional:
- Regions: gat, umar, spate, lombar, piept, cot, incheietura, sold, genunchi, glezna
- Intensity: 1-3 (usor / mediu / sever)
- Optional cause text (NU mandatory anti-force-typing)
- "Continui adaptat" → goto workout-preview cu pain context în location.state (Phase 4 wires CDL override real)
- "Salveaza si iesi" → cancel pentru azi

```tsx
type BodyRegion = 'gat' | 'umar-stang' | 'umar-drept' | 'spate' | 'lombar' | 'piept' | 'cot-stang' | 'cot-drept' | 'incheietura-stanga' | 'incheietura-dreapta' | 'sold' | 'genunchi-stang' | 'genunchi-drept' | 'glezna-stanga' | 'glezna-dreapta';
type PainIntensity = 1 | 2 | 3;

const REGIONS: Array<{ id: BodyRegion; label: string }> = [
  { id: 'gat', label: 'Gat' },
  { id: 'umar-stang', label: 'Umar stang' },
  { id: 'umar-drept', label: 'Umar drept' },
  // ... toate regions
];

export function PainButton(): JSX.Element {
  const navigate = useNavigate();
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [intensity, setIntensity] = useState<PainIntensity>(1);

  function handleContinue() {
    if (!region) return;
    navigate(gotoPath('workout-preview'), {
      state: { painContext: { region, intensity }, intensityMod: 'minus' }
    });
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Unde te doare?</h1>
      <p className="body-text text-ink2 mb-6">Coach evita exercitii care irita zona.</p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRegion(r.id)}
            className={`p-3 rounded-xl border ${region === r.id ? 'bg-brick text-white border-brick' : 'bg-paper2 border-line-strong text-ink'}`}
          >
            <span className="small-text font-medium">{r.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <p className="body-text text-ink mb-3">Cat de tare?</p>
        <div className="flex gap-3">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl as PainIntensity)}
              className={`flex-1 py-3 rounded-xl border ${intensity === lvl ? 'bg-brick text-white border-brick' : 'bg-paper2 border-line-strong text-ink'}`}
            >
              <span className="body-text font-medium">{['Usor', 'Mediu', 'Sever'][lvl - 1]}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!region}
        className="w-full py-4 bg-brick text-white rounded-xl body-text font-semibold disabled:opacity-50"
      >
        Continui adaptat
      </button>
      <button
        onClick={() => navigate(gotoPath('antrenor'))}
        className="w-full mt-3 py-3 text-ink3 small-text"
      >
        Salveaza si iesi
      </button>
    </section>
  );
}
```

---

## §3 Implementation hints

- CDL override pattern (D-LEGACY-035): pain context propagated la workout flow via location.state Phase 3. Phase 4+ wires real CDL append-only log.
- Lucide icons: install `lucide-react` din task_04 sau task_06 dacă nu există. Use `i data-lucide` deprecated — prefera `<X />` component imports.
- Anti-force-typing: pain region buttons mandatory pentru continue, dar Skip/Iesi visible always. Free-text optional NU mandatory.
- Romanian no-diacritics rule preserved.

---

## §4 Tests vitest + RTL (MemoryRouter per D020)

### A) `CevaNuMerge.test.tsx`

```typescript
describe('CevaNuMerge screen', () => {
  it('renders 5 problem options', () => { /* ... */ });
  it('pain selects navigates pain-button', () => { /* ... */ });
  it('equipment-busy selects navigates equipment-swap', () => { /* ... */ });
  it('cancel selects navigates antrenor (Phase 4 confirm-finish-early)', () => { /* ... */ });
  // ... 5-7 tests
});
```

### B) `PainButton.test.tsx`

```typescript
describe('PainButton screen', () => {
  it('renders region grid + intensity selector', () => { /* ... */ });
  it('Continue button disabled cand region NU selected', () => { /* ... */ });
  it('Continue button enabled cand region selected', () => { /* ... */ });
  it('Continue navigates workout-preview cu painContext în state + intensityMod=minus', () => { /* ... */ });
  it('Iesi navigates antrenor', () => { /* ... */ });
  // ... 7-10 tests
});
```

---

## §5 Acceptance criteria

- [ ] CevaNuMerge + PainButton real components
- [ ] Problem flow chain: ceva-nu-merge → [pain-button / equipment-swap / aparate-lipsa / schedule-override / cancel]
- [ ] Pain context propagated la workout-preview via location.state
- [ ] Anti-force-typing preserved (Iesi visible, free-text optional)
- [ ] Romanian no-diacritics preserved
- [ ] vitest count: +15-20 new tests

---

## §6 Commit strategy

2 commits atomic:
1. `feat(react/antrenor): CevaNuMerge screen problem picker + 5-route navigation`
2. `feat(react/antrenor): PainButton screen region selector + intensity + CDL stub propagation`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-06-2026-05-16
git push origin pre-phase3-task-06-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_06 Problem flow. Phase C paralel. 2 sub-screens. CDL stub propagation. Anti-force-typing preserved.**
