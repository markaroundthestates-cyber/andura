// ══ SETTINGS PREFS — Phase 6 task_13 Cont Sub-Screen ═════════════════════
// Units kg (lb disabled, post-Beta) + week start L/D + locale ro-RO fixed.
// kg is the effective active unit (no weight display converts to lb yet), so
// the lb option is shown-but-disabled with an honest note instead of pretending
// a switch happened. Persist settingsStore.weekStart field.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronRight, RefreshCcw, GitBranch } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { WeekStart } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

const UNIT_OPTIONS: ReadonlyArray<{ value: 'kg' | 'lb'; label: string }> = [
  { value: 'kg', label: 'Kilograme (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
];

const WEEK_START_OPTIONS: ReadonlyArray<{ value: WeekStart; label: string }> = [
  { value: 'L', label: 'Luni' },
  { value: 'D', label: 'Duminica' },
];

export function SettingsPrefs(): JSX.Element {
  const navigate = useNavigate();
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const weekStart = useSettingsStore((s) => s.weekStart);
  const setWeekStart = useSettingsStore((s) => s.setWeekStart);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-prefs">
      <SubHeader
        title="Setari"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-prefs-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Vezi SchimbaFazaConfirm + Onboarding pentru
            rationale full. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Unitati
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          {UNIT_OPTIONS.map((opt, idx) => {
            // Honest V1: app shows weights in kg everywhere; lb conversion is
            // post-Beta. kg is the effective active unit regardless of any
            // legacy persisted value; lb is disabled (no false "switched" state).
            const disabled = opt.value === 'lb';
            const selected = opt.value === 'kg';
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`unit-${opt.value}`}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => !disabled && setUnitSystem(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${idx < UNIT_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${disabled ? 'text-ink2 opacity-60 cursor-not-allowed' : selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{opt.label}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink2 mb-4 mt-2 leading-snug">
          Momentan doar kilograme. Pounds vor fi disponibile post-Beta.
        </p>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Inceput saptamana
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          {WEEK_START_OPTIONS.map((opt, idx) => {
            const selected = weekStart === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`week-start-${opt.value}`}
                aria-pressed={selected}
                onClick={() => setWeekStart(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${idx < WEEK_START_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{opt.label}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Limba
        </p>
        <div className="bg-paper2 border border-line rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between text-sm text-ink">
            <span>Romana (ro-RO)</span>
            <span className="text-xs text-ink2">Implicit</span>
          </div>
          <p className="text-xs text-ink2 mt-2 leading-snug">
            Engleza si alte limbi vor fi disponibile post-Beta.
          </p>
        </div>

        {/* §B001+B002+B011 D047 Stage 3 — Avansat section drill-downs (mockup L2085-2096). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Avansat
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          <button
            type="button"
            onClick={() => navigate(gotoPath('reset-coach-confirm'))}
            data-testid="advanced-reset-coach"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RefreshCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Reseteaza coach</p>
              <p className="text-xs text-ink2">Reporneste invatarea AI de la zero</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate(gotoPath('redo-onboarding-confirm'))}
            data-testid="advanced-redo-onboarding"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Refa onboarding</p>
              <p className="text-xs text-ink2">Reia configurarea initiala</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate(gotoPath('schimba-faza-confirm'))}
            data-testid="advanced-schimba-faza"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
          >
            <GitBranch className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Schimba faza manual</p>
              <p className="text-xs text-ink2">Reseteaza unele calibrari</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
