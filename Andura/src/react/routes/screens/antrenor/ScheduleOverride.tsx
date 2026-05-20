// ══ SCHEDULE OVERRIDE — Phase 3 task_07 §C Rewrite Stub → Real ═══════════
// Per spec §2 C 5-option override picker. Calendar V1 ephemeral override per
// D-LEGACY-076 — azi only (next Monday resets to original preset per
// scheduleAdapter). Phase 3 location.state propagation acceptable; Phase 4+
// wires real scheduleAdapter override commit (CDL append-only log).
//
// Map override kind → intensityMod pentru consumer (workout-preview banner):
//   easier → 'minus' / harder → 'plus' / different-muscle → 'normal'
//   mobility → 'normal' (low-intensity routine, NU coach reduce — different
//   semantic, scheduleAdapter routes la mobility template) / cardio → 'normal'
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-076 Calendar V1 ephemeral override
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import type { IntensityMod } from './EnergyCheck';

export type OverrideKind = 'easier' | 'harder' | 'different-muscle' | 'mobility' | 'cardio';

interface OverrideOption {
  kind: OverrideKind;
  label: string;
  description: string;
}

const OVERRIDE_OPTIONS: readonly OverrideOption[] = [
  { kind: 'easier', label: 'Mai usor', description: 'Intensitate redusa -20%' },
  { kind: 'harder', label: 'Mai greu', description: 'Intensitate crescuta +15%' },
  { kind: 'different-muscle', label: 'Alta grupa', description: 'Schimba target azi' },
  { kind: 'mobility', label: 'Mobilitate', description: 'Stretching + dynamic warm-up' },
  { kind: 'cardio', label: 'Cardio doar', description: 'Sesiune cardio 25-40 min' },
];

function intensityFor(kind: OverrideKind): IntensityMod {
  if (kind === 'easier') return 'minus';
  if (kind === 'harder') return 'plus';
  return 'normal';
}

export function ScheduleOverride(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(kind: OverrideKind): void {
    navigate(gotoPath('workout-preview'), {
      state: { overrideKind: kind, intensityMod: intensityFor(kind) },
    });
  }

  return (
    <section className="p-6 bg-paper" data-testid="schedule-override">
      <h1 className="text-2xl font-semibold text-ink mb-2">Vrei alt antrenament azi?</h1>
      <p className="text-base text-ink2 mb-6">
        Coach respecta. Doar azi - maine reia planul.
      </p>
      <div className="flex flex-col gap-3" role="list">
        {OVERRIDE_OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            type="button"
            onClick={() => handleSelect(opt.kind)}
            data-override-kind={opt.kind}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-[var(--line-strong)] bg-paper2 hover:bg-paper transition text-left"
          >
            <span className="text-base font-medium text-ink">{opt.label}</span>
            <span className="text-sm text-ink2">{opt.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
