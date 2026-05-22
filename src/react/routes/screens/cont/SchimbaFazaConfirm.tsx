// ══ SCHIMBA FAZA CONFIRM — B001/D047 drill-down screen ════════════════════
// Per mockup andura-clasic.html L2140-2152 (#screen-confirm-schimba-faza).
// Universal destructive drill-down pattern (mockup §11 LOCKED V1).
//
// Manual phase override per pattern parity src/pages/plan.js legacy
// setPhaseOverride. Radio selector AUTO/CUT/MAINTENANCE/BULK/STRENGTH +
// persists DB.set('phase-override') + phase-change-date + phase-log entry.
// Engine TDEE/volume/progression recalibrate next session via existing
// DB.get('phase-override') consumers (dp.js, modals.js, reality.js, etc.).

import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { setPhaseOverride, getPhaseOverride } from '../../../../util/phaseOverride.js';
import { SYS } from '../../../../engine/sys.js';

type PhaseOption = 'AUTO' | 'CUT' | 'MAINTENANCE' | 'BULK' | 'STRENGTH';

const PHASE_OPTIONS: ReadonlyArray<{ value: PhaseOption; label: string; hint: string }> = [
  { value: 'AUTO',        label: 'Auto-detect',  hint: 'Coach decide pe baza progresului' },
  { value: 'CUT',         label: 'Cut',          hint: 'Deficit caloric (slabire grasime)' },
  { value: 'MAINTENANCE', label: 'Mentinere',    hint: 'Greutate stabila, calibrare' },
  { value: 'BULK',        label: 'Bulk',         hint: 'Surplus caloric (masa musculara)' },
  { value: 'STRENGTH',    label: 'Forta',        hint: 'Usor surplus, focus performanta' },
];

export function SchimbaFazaConfirm(): JSX.Element {
  const navigate = useNavigate();
  const initial: PhaseOption = (getPhaseOverride() as PhaseOption | null) ?? 'AUTO';
  const [selected, setSelected] = useState<PhaseOption>(initial);

  function handleConfirm(): void {
    const tdee = typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000;
    setPhaseOverride(selected, tdee);
    navigate(gotoPath('settings-prefs'));
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-prefs'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="schimba-faza-confirm">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Inapoi"
          data-testid="schimba-faza-confirm-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Schimba faza manual</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <GitBranch className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Atentie</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Schimbi faza activa manual? Coach-ul va recalibra TDEE, volum si
          progresie pe baza noii faze.
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-6 max-w-sm">
          Datele istorice raman intacte.
        </p>

        {/* §6-M3 a11y: role="radiogroup" + aria-label so screen readers
            announce the radio set semantic (5 mutually exclusive phase
            options). aria-required reinforces user must pick one. */}
        <div
          className="w-full max-w-sm bg-paper2 border border-line rounded-xl overflow-hidden"
          role="radiogroup"
          aria-label="Selecteaza faza activa"
          aria-required="true"
        >
          {PHASE_OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`phase-${opt.value.toLowerCase()}`}
                onClick={() => setSelected(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${
                  idx < PHASE_OPTIONS.length - 1 ? 'border-b border-line' : ''
                } ${isSelected ? 'text-brick' : 'text-ink'}`}
              >
                <div className="flex-1">
                  <p className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-ink2 mt-0.5">{opt.hint}</p>
                </div>
                {isSelected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="schimba-faza-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
          >
            Confirma
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="schimba-faza-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-xl text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
