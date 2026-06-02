// ══ ONBOARDING — choice steps (sex / training / goal / freq / exp) (RN port)
// Twin of src/react/routes/screens/onboarding/ChoiceSteps.tsx. Pure
// presentational steps — value + onChange come from the parent wizard which still
// owns every hook/store call/handler. The enriched row pattern (icon + label +
// grey subtitle + check affordance) + the 2-tile sex picker are reproduced with
// View/Text/Pressable + lucide-react-native. aria-pressed -> accessibilityState
// {selected}. Every testID + i18n key is kept verbatim. The "Auto recomandat"
// brick-border idle hint + the auto badge are preserved.
//
// FIDELITY: the web's selected state combined `.ob-row-selected` +
// `.option-selected-ring` (a brick-tinted fill + ring). RN reproduces it with a
// brick border + a faint brick-tinted background; the check badge fills brick
// when on.

import type { ComponentType } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Sparkles,
  Dumbbell,
  Flame,
  TrendingDown,
  ShieldCheck,
  Check,
  User,
  Dumbbell as DumbbellIcon,
  HeartPulse,
  Layers,
  type LucideProps,
} from 'lucide-react-native';
import type { Frequency, Experience, TrainingType } from '../../../src/react/stores/onboardingStore';
import { type OptionStepProps, type GoalKey, goalLabel } from './shared';
import { dark, mix } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

type IconType = ComponentType<LucideProps>;

function StepHeading({ title, desc }: { title: string; desc: string }): React.JSX.Element {
  return (
    <View>
      <Text className="font-bold text-ink" style={{ fontSize: 24, marginBottom: 8 }}>{title}</Text>
      <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 24, lineHeight: 20 }}>{desc}</Text>
    </View>
  );
}

// Selected-row visual (web .ob-row-selected + .option-selected-ring).
function rowStyle(selected: boolean, autoHint = false): { borderColor: string; backgroundColor: string; borderWidth: number } {
  if (selected) return { borderColor: dark.brick, backgroundColor: mix.brick16Dark, borderWidth: 1 };
  if (autoHint) return { borderColor: dark.brick, backgroundColor: dark.paper2, borderWidth: 2 };
  return { borderColor: dark.lineStrong, backgroundColor: dark.paper2, borderWidth: 1 };
}

// Circular brick check badge (web .ob-check.on). Reserves the slot so rows don't
// shift on select.
function CheckBadge({ on }: { on: boolean }): React.JSX.Element {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: on ? dark.brick : 'transparent',
        borderWidth: on ? 0 : 1,
        borderColor: dark.line,
      }}
    >
      {on && <Check size={14} color={dark.onAccent} strokeWidth={2.6} />}
    </View>
  );
}

// ── Step 2: sex (2-tile grid) ───────────────────────────────────────────────
export function Step2({ value, onChange }: OptionStepProps<'m' | 'f'>): React.JSX.Element {
  return (
    <View>
      <StepHeading title={t('onboarding.steps.2.title')} desc={t('onboarding.steps.2.desc')} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['m', 'f'] as const).map((v) => {
          const selected = value === v;
          const s = rowStyle(selected);
          return (
            <Pressable
              key={v}
              onPress={() => onChange(v)}
              testID={`onb-sex-${v}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 28,
                paddingHorizontal: 12,
                borderRadius: 22,
                ...s,
              }}
            >
              <View style={{ position: 'absolute', top: 12, right: 12 }}>
                <CheckBadge on={selected} />
              </View>
              <User size={32} color={selected ? dark.brick : dark.ink2} />
              <Text className="font-display font-semibold text-ink" style={{ fontSize: 16 }}>
                {v === 'm' ? t('onboarding.options.sex.m') : t('onboarding.options.sex.f')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Generic enriched row (icon + label + subtitle + check) ───────────────────
function EnrichedRow({
  Icon,
  label,
  subtitle,
  selected,
  autoHint,
  badge,
  leading,
  onPress,
  testID,
  accessibilityLabel,
}: {
  Icon?: IconType;
  label: string;
  subtitle: string;
  selected: boolean;
  autoHint?: boolean;
  badge?: string;
  leading?: React.ReactNode;
  onPress: () => void;
  testID: string;
  accessibilityLabel?: string;
}): React.JSX.Element {
  const s = rowStyle(selected, autoHint);
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 22,
        ...s,
      }}
    >
      {leading}
      {Icon && <Icon size={20} color={selected || autoHint ? dark.brick : dark.ink2} />}
      <View style={{ flex: 1 }}>
        <Text className="font-medium text-ink" style={{ fontSize: 15 }}>
          {label}
          {badge ? <Text className="font-semibold text-brick" style={{ fontSize: 12 }}>{`  ${badge}`}</Text> : null}
        </Text>
        <Text className="text-ink3" style={{ fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <CheckBadge on={selected} />
    </Pressable>
  );
}

// ── Step 3: training type ────────────────────────────────────────────────────
const TRAINING_TYPE_OPTIONS: ReadonlyArray<{ value: TrainingType; Icon: IconType; labelKey: string; subtitleKey: string }> = [
  { value: 'gym', Icon: DumbbellIcon, labelKey: 'onboarding.options.trainingType.gym', subtitleKey: 'onboarding.options.trainingType.gymSubtitle' },
  { value: 'aerobic', Icon: HeartPulse, labelKey: 'onboarding.options.trainingType.aerobic', subtitleKey: 'onboarding.options.trainingType.aerobicSubtitle' },
  { value: 'both', Icon: Layers, labelKey: 'onboarding.options.trainingType.both', subtitleKey: 'onboarding.options.trainingType.bothSubtitle' },
];

export function StepTrainingType({ value, onChange }: OptionStepProps<TrainingType>): React.JSX.Element {
  return (
    <View>
      <StepHeading title={t('onboarding.steps.3.title')} desc={t('onboarding.steps.3.desc')} />
      <View style={{ gap: 12 }}>
        {TRAINING_TYPE_OPTIONS.map(({ value: v, Icon, labelKey, subtitleKey }) => (
          <EnrichedRow
            key={v}
            Icon={Icon}
            label={t(labelKey)}
            subtitle={t(subtitleKey)}
            selected={value === v}
            onPress={() => onChange(v)}
            testID={`onb-training-${v}`}
          />
        ))}
      </View>
    </View>
  );
}

// ── Step 4: goal ─────────────────────────────────────────────────────────────
const GOAL_OPTIONS: ReadonlyArray<{ key: GoalKey; Icon: IconType; subtitleKey: string }> = [
  { key: 'auto', Icon: Sparkles, subtitleKey: 'onboarding.options.goal.autoSubtitle' },
  { key: 'forta', Icon: Dumbbell, subtitleKey: 'onboarding.options.goal.fortaSubtitle' },
  { key: 'masa', Icon: Flame, subtitleKey: 'onboarding.options.goal.masaSubtitle' },
  { key: 'slabire', Icon: TrendingDown, subtitleKey: 'onboarding.options.goal.slabireSubtitle' },
  { key: 'mentenanta', Icon: ShieldCheck, subtitleKey: 'onboarding.options.goal.mentenantaSubtitle' },
];

export function Step3({ value, onChange }: OptionStepProps<GoalKey>): React.JSX.Element {
  return (
    <View>
      <StepHeading title={t('onboarding.steps.4.title')} desc={t('onboarding.steps.4.desc')} />
      <View style={{ gap: 12 }}>
        {GOAL_OPTIONS.map(({ key, Icon, subtitleKey }) => {
          const selected = value === key;
          const isAuto = key === 'auto';
          return (
            <EnrichedRow
              key={key}
              Icon={Icon}
              label={goalLabel(key)}
              subtitle={t(subtitleKey)}
              selected={selected}
              autoHint={isAuto && !selected}
              badge={isAuto ? t('onboarding.options.goal.autoBadge') : undefined}
              onPress={() => onChange(key)}
              testID={`onb-goal-${key}`}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Step 5: frequency ────────────────────────────────────────────────────────
const FREQ_OPTIONS: ReadonlyArray<{ value: Frequency; labelKey: string; subtitleKey: string }> = [
  { value: '2', labelKey: 'onboarding.options.frequency.2', subtitleKey: 'onboarding.options.frequency.2Subtitle' },
  { value: '3', labelKey: 'onboarding.options.frequency.3', subtitleKey: 'onboarding.options.frequency.3Subtitle' },
  { value: '4', labelKey: 'onboarding.options.frequency.4', subtitleKey: 'onboarding.options.frequency.4Subtitle' },
  { value: '5', labelKey: 'onboarding.options.frequency.5', subtitleKey: 'onboarding.options.frequency.5Subtitle' },
];

export function Step4({ value, onChange }: OptionStepProps<Frequency>): React.JSX.Element {
  return (
    <View>
      <StepHeading title={t('onboarding.steps.5.title')} desc={t('onboarding.steps.5.desc')} />
      <View style={{ gap: 12 }}>
        {FREQ_OPTIONS.map(({ value: v, labelKey, subtitleKey }) => {
          const selected = value === v;
          return (
            <EnrichedRow
              key={v}
              label={t(labelKey)}
              subtitle={t(subtitleKey)}
              selected={selected}
              onPress={() => onChange(v)}
              testID={`onb-freq-${v}`}
              accessibilityLabel={t('onboarding.steps.5.ariaLabelFmt', { n: v })}
              leading={
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: dark.paper }}
                >
                  <Text className="font-mono font-bold" style={{ fontSize: 16, color: selected ? dark.brick : dark.ink2 }}>{v}</Text>
                </View>
              }
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Step 6: experience ───────────────────────────────────────────────────────
const EXP_OPTIONS: ReadonlyArray<{ value: Experience; labelKey: string; subtitleKey: string }> = [
  { value: 'incepator', labelKey: 'onboarding.options.experience.incepator', subtitleKey: 'onboarding.options.experience.incepatorSubtitle' },
  { value: 'intermediar', labelKey: 'onboarding.options.experience.intermediar', subtitleKey: 'onboarding.options.experience.intermediarSubtitle' },
  { value: 'avansat', labelKey: 'onboarding.options.experience.avansat', subtitleKey: 'onboarding.options.experience.avansatSubtitle' },
];

export function Step5({ value, onChange }: OptionStepProps<Experience>): React.JSX.Element {
  return (
    <View>
      <StepHeading title={t('onboarding.steps.6.title')} desc={t('onboarding.steps.6.desc')} />
      <View style={{ gap: 12 }}>
        {EXP_OPTIONS.map(({ value: v, labelKey, subtitleKey }) => (
          <EnrichedRow
            key={v}
            label={t(labelKey)}
            subtitle={t(subtitleKey)}
            selected={value === v}
            onPress={() => onChange(v)}
            testID={`onb-exp-${v}`}
          />
        ))}
      </View>
    </View>
  );
}
