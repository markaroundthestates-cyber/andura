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
// §F-ceva-nu-merge-02 (MED chat5 Wave 12) — title swap "Ceva nu merge azi?"
// → "Ce nu merge?" mockup verbatim L1001 (`<h2>Ce nu merge?</h2>`). Mockup
// terse + active voice ("Ce" prompt) > prod verbose interrogativ. Body intro
// preserved (different finding scope). Tests updated (CevaNuMerge.test.tsx +
// EnergyScreens.aria.test.tsx + routing.test.tsx).
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
import { t } from '../../../../i18n/index.js';

export type ProblemKind = 'pain' | 'equipment-busy' | 'equipment-missing' | 'override' | 'cancel';

interface ProblemOption {
  kind: ProblemKind;
  /** i18n key under cevaNuMerge.options.* — label localized at render. */
  labelKey: string;
  Icon: typeof Activity;
  target: GotoScreen;
}

const PROBLEM_OPTIONS: readonly ProblemOption[] = [
  { kind: 'pain', labelKey: 'cevaNuMerge.options.pain', Icon: Activity, target: 'pain-button' },
  { kind: 'equipment-busy', labelKey: 'cevaNuMerge.options.equipmentBusy', Icon: Users, target: 'equipment-swap' },
  { kind: 'equipment-missing', labelKey: 'cevaNuMerge.options.equipmentMissing', Icon: PackageX, target: 'aparate-lipsa' },
  { kind: 'override', labelKey: 'cevaNuMerge.options.override', Icon: Shuffle, target: 'schedule-override' },
  // Phase 4+ will route la confirm-finish-early (D-LEGACY-061 anti-paternalism).
  { kind: 'cancel', labelKey: 'cevaNuMerge.options.cancel', Icon: CircleX, target: 'antrenor' },
];

export function CevaNuMerge(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(option: ProblemOption): void {
    // A2 H-4: aparate-lipsa reached from workout flow → tag origin so save
    // returns la workout-preview (adapteaza sesiunea imediat). Din Cont nu se
    // pasaza state → save se intoarce la Cont.
    if (option.target === 'aparate-lipsa') {
      navigate(gotoPath(option.target), { state: { from: 'workout' } });
      return;
    }
    navigate(gotoPath(option.target));
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="ceva-nu-merge">
      <SubHeader
        title={t('cevaNuMerge.subHeaderTitle')}
        onBack={handleBack}
        testIdBack="ceva-nu-merge-back"
      />
      <div className="p-6 flex-1">
        <p className="text-base text-ink2 mb-6">{t('cevaNuMerge.body')}</p>
        <div className="flex flex-col gap-3">
          {PROBLEM_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            return (
              <button
                key={opt.kind}
                type="button"
                onClick={() => handleSelect(opt)}
                data-problem-kind={opt.kind}
                className="pulse-card pulse-card-tight flex items-center gap-4 p-4 hover:bg-paper transition"
              >
                <Icon className="w-5 h-5 text-ink2" aria-hidden="true" />
                <span className="text-base font-medium text-ink">{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
