// ══ OBIECTIV GOAL CARD (RN port) — 5-tile goal selector ══════════════════
// RN twin of src/react/components/Progres/ObiectivGoalCard.tsx. The gating model
// (targetDirection / isGoalEnabled), the auto-switch-to-AUTO effect, and the
// pick() drill to program-change-confirm are kept verbatim; markup → View/Text/
// Pressable + lucide-react-native icons.
//
// NAV: the web passed react-router `state` (pendingGoal/pendingLabel/pendingSub/
// returnTo) to /app/progres/program-change-confirm. RN passes the same payload as
// expo-router `params` via router.push({ pathname, params }). The confirm screen
// itself is W3c — this card is wired ready for it. Same testIDs + i18n keys.

import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, Dumbbell, Flame, TrendingDown, ShieldCheck } from 'lucide-react-native';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import type { Goal } from '../../../src/react/stores/onboardingStore';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import { getCurrentWeightKg, readUserMaintenanceTDEE } from '../../../src/react/lib/userTdee';
import { targetDirection, isGoalEnabled } from '../../../src/react/lib/goalPhaseModel';
import type { TargetDirection } from '../../../src/react/lib/goalPhaseModel';
import { setPhaseOverride } from '../../../src/util/phaseOverride.js';
import { SYS } from '../../../src/engine/sys.js';
import { gotoPath } from '../../lib/nav';
import { dark, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface ObiectivOption {
  id: Goal;
  titleKey: string;
  subKey: string;
  Icon: typeof Sparkles;
}

const OPTIONS: readonly ObiectivOption[] = [
  { id: 'auto', titleKey: 'obiectiv.options.autoTitle', subKey: 'obiectiv.options.autoSub', Icon: Sparkles },
  { id: 'forta', titleKey: 'obiectiv.options.fortaTitle', subKey: 'obiectiv.options.fortaSub', Icon: Dumbbell },
  { id: 'masa', titleKey: 'obiectiv.options.masaTitle', subKey: 'obiectiv.options.masaSub', Icon: Flame },
  { id: 'slabire', titleKey: 'obiectiv.options.slabireTitle', subKey: 'obiectiv.options.slabireSub', Icon: TrendingDown },
  { id: 'mentenanta', titleKey: 'obiectiv.options.mentenantaTitle', subKey: 'obiectiv.options.mentenantaSub', Icon: ShieldCheck },
];

const SWITCH_NOTE_KEY: Record<Exclude<TargetDirection, 'MAINTAIN'> | 'MAINTAIN', string> = {
  LOSE: 'obiectiv.gating.switchedToAutoLose',
  GAIN: 'obiectiv.gating.switchedToAutoGain',
  MAINTAIN: 'obiectiv.gating.switchedToAutoMaintain',
};

export function ObiectivGoalCard(): React.JSX.Element {
  const goal = useOnboardingStore((s) => s.data.goal);
  const setField = useOnboardingStore((s) => s.setField);

  const activeGoal: Goal = goal ?? 'auto';

  const targetWeightKg = useProgresStore((s) => s.targetObiectiv.weightKg);
  const currentWeightKg = getCurrentWeightKg();
  const direction = targetDirection(currentWeightKg, targetWeightKg);

  const selectedDisabled = direction !== null && !isGoalEnabled(activeGoal, direction);
  const [switchNote, setSwitchNote] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedDisabled || direction === null) return;
    setField('goal', 'auto');
    const tdee =
      readUserMaintenanceTDEE() ??
      (typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000);
    setPhaseOverride('AUTO', tdee);
    setSwitchNote(t(SWITCH_NOTE_KEY[direction]));
  }, [selectedDisabled, direction, setField]);

  function pick(g: Goal): void {
    if (g === activeGoal) return;
    if (direction !== null && !isGoalEnabled(g, direction)) return;
    setSwitchNote(null);
    const opt = OPTIONS.find((o) => o.id === g);
    const pendingLabel = opt ? t(opt.titleKey) : g;
    const pendingSub = opt ? t(opt.subKey) : '';
    router.push({
      pathname: gotoPath('program-change-confirm') as never,
      params: {
        pendingGoal: g,
        pendingLabel,
        pendingSub,
        returnTo: 'progres',
      },
    } as never);
  }

  return (
    <View testID="obiectiv-goal-card" style={{ marginBottom: 20 }} accessibilityLabel={t('obiectiv.goalCardAriaLabel')}>
      <Text
        className="uppercase font-semibold text-ink2"
        style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 8 }}
      >
        {t('obiectiv.heading')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {OPTIONS.map((opt) => {
          const selected = activeGoal === opt.id;
          const title = t(opt.titleKey);
          const sub = t(opt.subKey);
          const disabled = direction !== null && !isGoalEnabled(opt.id, direction);
          const Icon = opt.Icon;
          return (
            <Pressable
              key={opt.id}
              onPress={() => pick(opt.id)}
              disabled={disabled}
              testID={`obiectiv-row-${opt.id}`}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={t('obiectiv.optionAriaTemplate', { title, sub })}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 6,
                paddingVertical: 12,
                minHeight: 76,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selected ? dark.brick : dark.line,
                backgroundColor: selected ? withAlpha(dark.brick, 0.12) : dark.paper2,
                opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
              })}
            >
              <Icon size={20} color={selected ? dark.brick : dark.ink2} />
              <Text className="font-semibold text-ink text-center" style={{ fontSize: 11, lineHeight: 13 }}>
                {title}
                {selected && opt.id === 'auto' ? t('obiectiv.activeSuffix') : ''}
              </Text>
              {selected && (
                <Text
                  testID={`obiectiv-ales-${opt.id}`}
                  className="font-mono font-bold uppercase text-brick"
                  style={{ fontSize: 9, letterSpacing: 0.6 }}
                >
                  {t('obiectiv.alesBadge')}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
      {switchNote && (
        <Text
          testID="obiectiv-gating-note"
          accessibilityRole="text"
          className="text-brick"
          style={{ fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 16, fontWeight: '500' }}
        >
          {switchNote}
        </Text>
      )}
    </View>
  );
}
