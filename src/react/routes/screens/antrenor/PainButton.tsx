// ══ PAIN BUTTON — Phase 3 task_06 §B Rewrite Stub → Real ═════════════════
// Per spec §2 B pain region selector + intensity (1=usor / 2=mediu / 3=sever)
// + propagation pain context la workout-preview via location.state.
//
// CDL override pattern (D-LEGACY-035): pain context Phase 3 propagated via
// location.state. Phase 4+ wires real CDL append-only log (engine layer
// reads context, avoid exercitii care irita zona).
//
// Anti-force-typing (D-LEGACY-010 §AMENDED): region selection mandatory
// pentru Continue button (disabled cand region null), but "Salveaza si iesi"
// always vizibil ca escape hatch — NU forteaza completion.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-035 Pain/Discomfort Button CDL override
//   - DECISIONS.md §D-LEGACY-010 anti-force-typing
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';

export type BodyRegion =
  | 'gat'
  | 'umar-stang'
  | 'umar-drept'
  | 'spate'
  | 'lombar'
  | 'piept'
  | 'cot-stang'
  | 'cot-drept'
  | 'incheietura-stanga'
  | 'incheietura-dreapta'
  | 'sold'
  | 'genunchi-stang'
  | 'genunchi-drept'
  | 'glezna-stanga'
  | 'glezna-dreapta';

export type PainIntensity = 1 | 2 | 3;

interface RegionOption {
  id: BodyRegion;
  label: string;
}

const REGIONS: readonly RegionOption[] = [
  { id: 'gat', label: 'Gat' },
  { id: 'umar-stang', label: 'Umar stang' },
  { id: 'umar-drept', label: 'Umar drept' },
  { id: 'piept', label: 'Piept' },
  { id: 'spate', label: 'Spate' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'cot-stang', label: 'Cot stang' },
  { id: 'cot-drept', label: 'Cot drept' },
  { id: 'incheietura-stanga', label: 'Incheietura stanga' },
  { id: 'incheietura-dreapta', label: 'Incheietura dreapta' },
  { id: 'sold', label: 'Sold' },
  { id: 'genunchi-stang', label: 'Genunchi stang' },
  { id: 'genunchi-drept', label: 'Genunchi drept' },
  { id: 'glezna-stanga', label: 'Glezna stanga' },
  { id: 'glezna-dreapta', label: 'Glezna dreapta' },
];

const INTENSITY_LABELS: Record<PainIntensity, string> = {
  1: 'Usor',
  2: 'Mediu',
  3: 'Sever',
};

export function PainButton(): JSX.Element {
  const navigate = useNavigate();
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [intensity, setIntensity] = useState<PainIntensity>(1);

  function handleContinue(): void {
    if (!region) return;
    navigate(gotoPath('workout-preview'), {
      state: { painContext: { region, intensity }, intensityMod: 'minus' },
    });
  }

  function handleExit(): void {
    navigate(gotoPath('antrenor'));
  }

  const continueDisabled = region === null;

  return (
    <section className="p-6 bg-paper" data-testid="pain-button">
      <h1 className="text-2xl font-semibold text-ink mb-2">Unde te doare?</h1>
      <p className="text-base text-ink2 mb-6">Coach evita exercitii care irita zona.</p>

      <div className="grid grid-cols-2 gap-3 mb-6" role="list" aria-label="Zone corp">
        {REGIONS.map((r) => {
          const selected = region === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              data-region={r.id}
              aria-pressed={selected}
              className={
                selected
                  ? 'p-3 rounded-xl border bg-brick text-paper border-brick'
                  : 'p-3 rounded-xl border bg-paper2 border-lineStrong text-ink'
              }
            >
              <span className="text-sm font-medium">{r.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <p className="text-base text-ink mb-3">Cat de tare?</p>
        <div className="flex gap-3" role="list" aria-label="Intensitate durere">
          {([1, 2, 3] as const).map((lvl) => {
            const selected = intensity === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                data-intensity={lvl}
                aria-pressed={selected}
                className={
                  selected
                    ? 'flex-1 py-3 rounded-xl border bg-brick text-paper border-brick'
                    : 'flex-1 py-3 rounded-xl border bg-paper2 border-lineStrong text-ink'
                }
              >
                <span className="text-base font-medium">{INTENSITY_LABELS[lvl]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={continueDisabled}
        data-testid="pain-continue"
        className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold disabled:opacity-50"
      >
        Continui adaptat
      </button>
      <button
        type="button"
        onClick={handleExit}
        data-testid="pain-exit"
        className="w-full mt-3 py-3 text-ink2 text-sm"
      >
        Salveaza si iesi
      </button>
    </section>
  );
}
