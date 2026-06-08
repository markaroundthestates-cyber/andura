// ══ PREFERENCES PICKERS — refused movement patterns + equipment profile ═════
// Activates the already-wired-and-tested engine fields #81 (user.refusedPatterns)
// + #82 (user.equipmentProfile). These were a DECLARED OnboardingData input-
// capture boundary with NO UI to SET them (onboardingStore.ts:111-132); the
// engine HARD-EXCLUDES the refused patterns (movementExclusion.REFUSAL_PATTERN_
// TOKENS) and FILTERS the pool to the available equipment (getDailyWorkout #82).
//
// Two optional multi-select chip grids, reused in the onboarding summary step
// (skippable — leaving both empty is byte-identical to today) AND in Settings ›
// Profil (editable later). Token vocabulary is the ENGINE's, not a parallel list:
//   - REFUSAL keys      = movementExclusion.REFUSAL_PATTERN_TOKENS keys
//                         (squat | deadlift | lunge | hip-thrust | overhead-press)
//   - EQUIPMENT coarse  = library equipment_type values
//                         (barbell | dumbbell | machine | cable | bodyweight | band)
// Empty selection persists as absent/empty → no exclusion + missing-picker path
// (the engine treats both as the unchanged default). Token-only styling, i18n
// keys en+ro (RO no-diacritics).

import type { JSX } from 'react';
import { Check } from 'lucide-react';
import { t } from '../../i18n/index.js';

// The engine refusal keys (movementExclusion.REFUSAL_PATTERN_TOKENS). 'hinge' is
// an alias of 'deadlift' there, so the UI offers the user-facing five.
export const REFUSAL_PATTERN_KEYS = ['squat', 'deadlift', 'lunge', 'hip-thrust', 'overhead-press'] as const;
// The coarse library equipment_type values the #82 filter reads.
export const EQUIPMENT_PROFILE_KEYS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'] as const;

const REFUSAL_LABEL_KEYS: Record<(typeof REFUSAL_PATTERN_KEYS)[number], string> = {
  squat: 'preferences.refusal.squat',
  deadlift: 'preferences.refusal.deadlift',
  lunge: 'preferences.refusal.lunge',
  'hip-thrust': 'preferences.refusal.hipThrust',
  'overhead-press': 'preferences.refusal.overheadPress',
};

const EQUIPMENT_LABEL_KEYS: Record<(typeof EQUIPMENT_PROFILE_KEYS)[number], string> = {
  barbell: 'preferences.equipment.barbell',
  dumbbell: 'preferences.equipment.dumbbell',
  machine: 'preferences.equipment.machine',
  cable: 'preferences.equipment.cable',
  bodyweight: 'preferences.equipment.bodyweight',
  band: 'preferences.equipment.band',
};

interface ChipGridProps {
  options: ReadonlyArray<string>;
  labelKeys: Readonly<Record<string, string>>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
  testIdPrefix: string;
}

function ChipGrid({ options, labelKeys, selected, onToggle, testIdPrefix }: ChipGridProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((v) => {
        const isOn = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            aria-pressed={isOn}
            data-testid={`${testIdPrefix}-${v}`}
            className={`press-feedback inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-colors ${
              isOn ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong text-ink2'
            }`}
          >
            {isOn && <Check className="w-3.5 h-3.5 text-brick" strokeWidth={2.6} aria-hidden="true" />}
            <span>{t(labelKeys[v] ?? v)}</span>
          </button>
        );
      })}
    </div>
  );
}

interface PreferencesPickersProps {
  refusedPatterns: ReadonlyArray<string>;
  equipmentProfile: ReadonlyArray<string>;
  onRefusedChange: (next: string[]) => void;
  onEquipmentChange: (next: string[]) => void;
}

/** Toggle a value in/out of a list (stable order = the canonical option order). */
function toggleIn(list: ReadonlyArray<string>, value: string, order: ReadonlyArray<string>): string[] {
  const set = new Set(list);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return order.filter((o) => set.has(o));
}

export function PreferencesPickers({
  refusedPatterns,
  equipmentProfile,
  onRefusedChange,
  onEquipmentChange,
}: PreferencesPickersProps): JSX.Element {
  return (
    <div className="flex flex-col gap-5" data-testid="preferences-pickers">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">{t('preferences.refusalTitle')}</h3>
        <p className="text-xs text-ink3 mb-3 leading-snug">{t('preferences.refusalDesc')}</p>
        <ChipGrid
          options={REFUSAL_PATTERN_KEYS}
          labelKeys={REFUSAL_LABEL_KEYS}
          selected={refusedPatterns}
          onToggle={(v) => onRefusedChange(toggleIn(refusedPatterns, v, REFUSAL_PATTERN_KEYS))}
          testIdPrefix="pref-refusal"
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">{t('preferences.equipmentTitle')}</h3>
        <p className="text-xs text-ink3 mb-3 leading-snug">{t('preferences.equipmentDesc')}</p>
        <ChipGrid
          options={EQUIPMENT_PROFILE_KEYS}
          labelKeys={EQUIPMENT_LABEL_KEYS}
          selected={equipmentProfile}
          onToggle={(v) => onEquipmentChange(toggleIn(equipmentProfile, v, EQUIPMENT_PROFILE_KEYS))}
          testIdPrefix="pref-equipment"
        />
      </div>
    </div>
  );
}
