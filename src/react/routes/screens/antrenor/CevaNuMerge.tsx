// ══ CEVA NU MERGE — Phase 3 task_06 §A Rewrite Stub → Real ═══════════════
// Per spec §2 A problem picker. Triage screen: durere / aparate / override /
// renunt. Each route handles distinct adaptation flow (Phase 4+ wires CDL
// override real append-only log per D-LEGACY-035).
//
// Phase 3 scope: routing only — destination screens stubbed (PainButton task_06
// §B real, EquipmentSwap + AparateLipsa + ScheduleOverride task_07 stubs).
//
// HIGH-GAMMA §F-ceva-nu-merge-03: SubHeader consume — cross-cutting back-btn
// pattern shared cu Auth/EnergyCause per mockup andura-clasic.html L1001
// .sub-header sticky top. SubHeader created HIGH-ALFA cluster. handleBack
// navigates(-1) for history-natural return.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-035 Pain/Discomfort Button architecture (CDL override)
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L999-1009 screen-ceva-nu-merge

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, PackageX, Shuffle, CircleX } from 'lucide-react';
import { gotoPath, type GotoScreen } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

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

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="ceva-nu-merge">
      <SubHeader
        title="Ceva nu merge azi?"
        onBack={handleBack}
        testIdBack="ceva-nu-merge-back"
      />
      <div className="p-6 flex-1">
        <p className="text-base text-ink2 mb-6">Spune-mi ce e si ajustez sesiunea.</p>
        <div className="flex flex-col gap-3">
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
      </div>
    </section>
  );
}
