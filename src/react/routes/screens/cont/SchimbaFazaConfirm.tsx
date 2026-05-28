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
import { GitBranch } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { setPhaseOverride, getPhaseOverride } from '../../../../util/phaseOverride.js';
import { getAutoDetectedPhaseLabelRo } from '../../../lib/engineWrappers';
import { SYS } from '../../../../engine/sys.js';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

type PhaseOption = 'AUTO' | 'CUT' | 'MAINTENANCE' | 'BULK' | 'STRENGTH';

const PHASE_OPTIONS: ReadonlyArray<{ value: PhaseOption; labelKey: string; hintKey: string }> = [
  { value: 'AUTO',        labelKey: 'confirm.schimbaFaza.options.autoLabel',        hintKey: 'confirm.schimbaFaza.options.autoHint' },
  { value: 'CUT',         labelKey: 'confirm.schimbaFaza.options.cutLabel',         hintKey: 'confirm.schimbaFaza.options.cutHint' },
  { value: 'MAINTENANCE', labelKey: 'confirm.schimbaFaza.options.maintenanceLabel', hintKey: 'confirm.schimbaFaza.options.maintenanceHint' },
  { value: 'BULK',        labelKey: 'confirm.schimbaFaza.options.bulkLabel',        hintKey: 'confirm.schimbaFaza.options.bulkHint' },
  { value: 'STRENGTH',    labelKey: 'confirm.schimbaFaza.options.strengthLabel',    hintKey: 'confirm.schimbaFaza.options.strengthHint' },
];

export function SchimbaFazaConfirm(): JSX.Element {
  const navigate = useNavigate();
  const initial: PhaseOption = (getPhaseOverride() as PhaseOption | null) ?? 'AUTO';
  const [selected, setSelected] = useState<PhaseOption>(initial);
  // Problem 2 (UI surface) — afiseaza faza AUTO-detectata din weight trend pe
  // optiunea Auto-detect. Engine returns the canonical RO label ('Cut' / 'Bulk' /
  // 'Mentinere'); we translate via the coachEngine.autoPhase bundle so EN
  // shows 'Cut'/'Bulk'/'Maintenance'. Cold-start (fara istoric) → MAINTENANCE.
  const autoDetectedRo = getAutoDetectedPhaseLabelRo();
  const PHASE_RO_TO_KEY: Record<string, string> = {
    'Cut': 'coachEngine.autoPhase.CUT',
    'Bulk': 'coachEngine.autoPhase.BULK',
    'Mentinere': 'coachEngine.autoPhase.MAINTENANCE',
  };
  const autoDetectedLabel =
    PHASE_RO_TO_KEY[autoDetectedRo]
      ? t(PHASE_RO_TO_KEY[autoDetectedRo])
      : autoDetectedRo;

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
      <SubHeader
        title={t('confirm.schimbaFaza.title')}
        onBack={handleCancel}
        testIdBack="schimba-faza-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <GitBranch className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.schimbaFaza.heading')}</h2>
        {/* Body paragraphs split per mockup andura-clasic.html L2146-2147. */}
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.schimbaFaza.body1')}
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-6 max-w-sm">
          {t('confirm.schimbaFaza.body2')}
        </p>

        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            pattern toggle select state. role=radiogroup necesita arrow-key
            handling + roving tabIndex (~200 LOC pentru 7 grupuri) = zero
            user benefit pre-Beta. Screen reader anunta "button, [label],
            pressed/not pressed" perfect valid pentru toggle. */}
        <div className="w-full max-w-sm bg-paper2 border border-line rounded-[14px] overflow-hidden">
          {PHASE_OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.value;
            const hint =
              opt.value === 'AUTO'
                ? t('confirm.schimbaFaza.options.autoHintWithNow', { label: autoDetectedLabel })
                : t(opt.hintKey);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                data-testid={`phase-${opt.value.toLowerCase()}`}
                onClick={() => setSelected(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${
                  idx < PHASE_OPTIONS.length - 1 ? 'border-b border-line' : ''
                } ${isSelected ? 'text-brick' : 'text-ink'}`}
              >
                <div className="flex-1">
                  <p className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                    {t(opt.labelKey)}
                  </p>
                  <p className="text-xs text-ink2 mt-0.5">{hint}</p>
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
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            {t('confirm.schimbaFaza.acceptCta')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="schimba-faza-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            {t('confirm.schimbaFaza.cancelCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
