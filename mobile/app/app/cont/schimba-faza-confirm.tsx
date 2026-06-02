// ══ SCHIMBA FAZA CONFIRM (RN port, W6b) ══════════════════════════════════
// RN twin of src/react/routes/screens/cont/SchimbaFazaConfirm.tsx. Manual phase
// override AUTO/CUT/MAINTENANCE/BULK/STRENGTH → setPhaseOverride (persists
// phase-override + change-date + phase-log; engine TDEE/volume recalibrate next
// session). ALL logic verbatim (auto-detect label, TDEE snapshot fallback chain,
// aria-pressed toggle pattern → accessibilityState.selected). The phase selector
// list rides the ConfirmScreen `children` slot. Web's `btn-grad` → gradient.

import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { GitBranch } from 'lucide-react-native';
import { setPhaseOverride, getPhaseOverride } from '../../../../src/util/phaseOverride.js';
import { getAutoDetectedPhaseLabelRo } from '../../../../src/react/lib/engineWrappers';
import { readUserMaintenanceTDEE } from '../../../../src/react/lib/userTdee';
import { SYS } from '../../../../src/engine/sys.js';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

type PhaseOption = 'AUTO' | 'CUT' | 'MAINTENANCE' | 'BULK' | 'STRENGTH';

const PHASE_OPTIONS: ReadonlyArray<{ value: PhaseOption; labelKey: string; hintKey: string }> = [
  { value: 'AUTO',        labelKey: 'confirm.schimbaFaza.options.autoLabel',        hintKey: 'confirm.schimbaFaza.options.autoHint' },
  { value: 'CUT',         labelKey: 'confirm.schimbaFaza.options.cutLabel',         hintKey: 'confirm.schimbaFaza.options.cutHint' },
  { value: 'MAINTENANCE', labelKey: 'confirm.schimbaFaza.options.maintenanceLabel', hintKey: 'confirm.schimbaFaza.options.maintenanceHint' },
  { value: 'BULK',        labelKey: 'confirm.schimbaFaza.options.bulkLabel',        hintKey: 'confirm.schimbaFaza.options.bulkHint' },
  { value: 'STRENGTH',    labelKey: 'confirm.schimbaFaza.options.strengthLabel',    hintKey: 'confirm.schimbaFaza.options.strengthHint' },
];

const PHASE_RO_TO_KEY: Record<string, string> = {
  Cut: 'coachEngine.autoPhase.CUT',
  Bulk: 'coachEngine.autoPhase.BULK',
  Mentinere: 'coachEngine.autoPhase.MAINTENANCE',
};

export default function SchimbaFazaConfirm() {
  const initial: PhaseOption = (getPhaseOverride() as PhaseOption | null) ?? 'AUTO';
  const [selected, setSelected] = useState<PhaseOption>(initial);

  const autoDetectedRo = getAutoDetectedPhaseLabelRo();
  const autoDetectedLabel = PHASE_RO_TO_KEY[autoDetectedRo]
    ? t(PHASE_RO_TO_KEY[autoDetectedRo])
    : autoDetectedRo;

  function handleConfirm(): void {
    const tdee =
      readUserMaintenanceTDEE() ??
      (typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000);
    setPhaseOverride(selected, tdee);
    goto('settings-prefs');
  }

  function handleCancel(): void {
    goto('settings-prefs');
  }

  return (
    <ConfirmScreen
      testID="schimba-faza-confirm"
      title={t('confirm.schimbaFaza.title')}
      backTestID="schimba-faza-confirm-back"
      onCancel={handleCancel}
      icon={<GitBranch size={28} color={dark.ink} />}
      heading={t('confirm.schimbaFaza.heading')}
      body={[t('confirm.schimbaFaza.body1'), t('confirm.schimbaFaza.body2')]}
      acceptLabel={t('confirm.schimbaFaza.acceptCta')}
      acceptTestID="schimba-faza-confirm-accept"
      acceptVariant="gradient"
      onAccept={handleConfirm}
      cancelLabel={t('confirm.schimbaFaza.cancelCta')}
      cancelTestID="schimba-faza-confirm-cancel"
    >
      {/* Phase selector — aria-pressed <button> toggle → Pressable with
          accessibilityState.selected. Brick text on the active row + a bullet
          marker, matching the web. */}
      <Card style={{ width: '100%', marginTop: 8 }}>
        {PHASE_OPTIONS.map((opt, idx) => {
          const isSelected = selected === opt.value;
          const hint =
            opt.value === 'AUTO'
              ? t('confirm.schimbaFaza.options.autoHintWithNow', { label: autoDetectedLabel })
              : t(opt.hintKey);
          return (
            <Pressable
              key={opt.value}
              testID={`phase-${opt.value.toLowerCase()}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(opt.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: idx < PHASE_OPTIONS.length - 1 ? 1 : 0,
                borderBottomColor: dark.line,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? dark.brick : dark.ink,
                  }}
                >
                  {t(opt.labelKey)}
                </Text>
                <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 2 }}>{hint}</Text>
              </View>
              {isSelected && (
                <Text style={{ color: dark.brick, marginLeft: 8 }} accessibilityElementsHidden>
                  {'•'}
                </Text>
              )}
            </Pressable>
          );
        })}
      </Card>
    </ConfirmScreen>
  );
}
