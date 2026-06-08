// ══ ONBOARDING — summary review step ══════════════════════════════════════
// Extracted from Onboarding.tsx (hygiene split, zero behavior change). Pure
// presentational — reads the finalized data passed by the parent Onboarding.tsx
// which still owns every hook/store call/handler.

import type { JSX } from 'react';
import {
  User,
  Calendar,
  Target,
  Activity,
  Award,
  Scale,
  Ruler,
  HeartPulse,
} from 'lucide-react';
import type { OnboardingData } from '../../../stores/onboardingStore';
import { goalLabel } from './shared';
import { PreferencesPickers } from '../../../components/PreferencesPickers';
import { t } from '../../../../i18n/index.js';

interface Step8SummaryProps {
  data: OnboardingData;
  // #81/#82 optional preference capture — refused movement patterns + available
  // equipment. Skippable: leaving both empty persists nothing (byte-identical to
  // the pre-#81/#82 onboarding). Wired to setField by the parent Onboarding.tsx.
  onRefusedChange?: (next: string[]) => void;
  onEquipmentChange?: (next: string[]) => void;
}

export function Step8Summary({ data, onRefusedChange, onEquipmentChange }: Step8SummaryProps): JSX.Element {
  // Wave A5 polish (Daniel "Top Grade" 2026-05-28) — each summary row gets a
  // lucide icon (Calendar/User/Target/Activity/Award/Scale/Ruler) for visual
  // affordance + a clean two-column hierarchy (icon+label left, value right).
  // i18n DEEP (A1) — all field labels + values resolve via t(); locale switch
  // is live (no re-mount required) since t() is called at render time.
  const empty = t('onboarding.confirm.empty');
  const sexValue =
    data.sex === 'm' ? t('onboarding.confirm.values.sexM')
    : data.sex === 'f' ? t('onboarding.confirm.values.sexF')
    : empty;
  const trainingTypeValue =
    (data.trainingType ?? 'gym') === 'aerobic' ? t('onboarding.confirm.values.trainingTypeAerobic')
    : (data.trainingType ?? 'gym') === 'both' ? t('onboarding.confirm.values.trainingTypeBoth')
    : t('onboarding.confirm.values.trainingTypeGym');
  const goalValue = data.goal ? goalLabel(data.goal) : empty;
  const frequencyValue = data.frequency
    ? t('onboarding.confirm.values.frequencyShort', { n: data.frequency })
    : empty;
  const experienceValue = data.experience
    ? t(`onboarding.confirm.values.experience${data.experience.charAt(0).toUpperCase() + data.experience.slice(1)}`)
    : empty;
  const weightValue = data.weight
    ? t('onboarding.confirm.values.weightSuffix', { kg: data.weight })
    : empty;
  const heightValue = data.height
    ? t('onboarding.confirm.values.heightSuffix', { cm: data.height })
    : empty;
  const rows: Array<{ Icon: typeof Calendar; label: string; value: string | number }> = [
    { Icon: Calendar, label: t('onboarding.confirm.fields.age'), value: data.age ?? empty },
    { Icon: User, label: t('onboarding.confirm.fields.sex'), value: sexValue },
    { Icon: HeartPulse, label: t('onboarding.confirm.fields.trainingType'), value: trainingTypeValue },
    { Icon: Target, label: t('onboarding.confirm.fields.goal'), value: goalValue },
    { Icon: Activity, label: t('onboarding.confirm.fields.frequency'), value: frequencyValue },
    { Icon: Award, label: t('onboarding.confirm.fields.experience'), value: experienceValue },
    { Icon: Scale, label: t('onboarding.confirm.fields.weight'), value: weightValue },
    { Icon: Ruler, label: t('onboarding.confirm.fields.height'), value: heightValue },
  ];
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.9.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.9.desc')}</p>
      <div
        className="surface-elevated bg-paper2 border border-line rounded-2xl overflow-hidden"
        data-testid="onb-summary"
      >
        {rows.map(({ Icon, label, value }, idx) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-4 py-3 text-sm animate-fade-in-up ${
              idx === 0 ? 'delay-150' : idx === 1 ? 'delay-225' : idx === 2 ? 'delay-300' : idx === 3 ? 'delay-375' : idx === 4 ? 'delay-450' : idx === 5 ? 'delay-525' : 'delay-600'
            } ${idx < rows.length - 1 ? 'border-b border-line' : ''}`}
          >
            <Icon className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-ink2">{label}</span>
            <span className="text-ink font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* #81/#82 optional preferences — refused movements + equipment profile.
          Activates the already-wired engine exclusion/filter. Skippable: empty
          = today's behavior. Rendered only when the parent supplies handlers. */}
      {onRefusedChange && onEquipmentChange && (
        <div className="mt-6 animate-fade-in-up delay-600">
          <PreferencesPickers
            refusedPatterns={data.refusedPatterns ?? []}
            equipmentProfile={data.equipmentProfile ?? []}
            onRefusedChange={onRefusedChange}
            onEquipmentChange={onEquipmentChange}
          />
        </div>
      )}
    </>
  );
}
