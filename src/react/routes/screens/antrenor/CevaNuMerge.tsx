// ══ CEVA NU MERGE — Phase 3 task_06 §A Rewrite Stub → Real ═══════════════
// Per spec §2 A problem picker. Triage screen: durere / aparate / override /
// renunt. Each route handles distinct adaptation flow (Phase 4+ wires CDL
// override real append-only log per D-LEGACY-035).
//
// Phase 3 scope: routing only — destination screens stubbed (PainButton task_06
// §B real, EquipmentSwap + AparateLipsa + ScheduleOverride task_07 stubs).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-035 Pain/Discomfort Button architecture (CDL override)
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html screen-ceva-nu-merge

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, PackageX, Shuffle, CircleX } from 'lucide-react';
import { gotoPath, type GotoScreen } from '../../../lib/navigation';

export type ProblemKind = 'pain' | 'equipment-busy' | 'equipment-missing' | 'override' | 'cancel';

interface ProblemOption {
  kind: ProblemKind;
  label: string;
  Icon: typeof Activity;
  target: GotoScreen;
}

const PROBLEM_OPTIONS: readonly ProblemOption[] = [
  { kind: 'pain', label: 'Ma doare ceva', Icon: Activity, target: 'pain-button' },
  { kind: 'equipment-busy', label: 'Aparate ocupate', Icon: Users, target: 'equipment-swap' },
  { kind: 'equipment-missing', label: 'Aparat lipsa', Icon: PackageX, target: 'aparate-lipsa' },
  { kind: 'override', label: 'Vreau alt antrenament', Icon: Shuffle, target: 'schedule-override' },
  // Phase 4+ will route la confirm-finish-early (D-LEGACY-061 anti-paternalism).
  { kind: 'cancel', label: 'Renunt azi', Icon: CircleX, target: 'antrenor' },
];

export function CevaNuMerge(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(option: ProblemOption): void {
    navigate(gotoPath(option.target));
  }

  return (
    <section className="p-6 bg-paper" data-testid="ceva-nu-merge">
      <h1 className="text-2xl font-semibold text-ink mb-2">Ceva nu merge azi?</h1>
      <p className="text-base text-ink2 mb-6">Spune-mi ce e si ajustez sesiunea.</p>
      <div className="flex flex-col gap-3" role="list">
        {PROBLEM_OPTIONS.map((opt) => {
          const Icon = opt.Icon;
          return (
            <button
              key={opt.kind}
              type="button"
              onClick={() => handleSelect(opt)}
              data-problem-kind={opt.kind}
              className="flex items-center gap-4 p-4 rounded-xl border border-lineStrong bg-paper2 hover:bg-paper transition"
            >
              <Icon className="w-5 h-5 text-ink2" aria-hidden="true" />
              <span className="text-base font-medium text-ink">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
