// ══ STATS GRID (RN port) — F10 3-Cell Compact ════════════════════════════
// RN twin of src/react/components/Antrenor/StatsGrid.tsx. Streak + Fatigue +
// Readiness 3-cell (or 2-cell compact) layout. The label-resolution helpers
// (engine semantic key → i18n, with RO label fallback) are kept 1:1. Same
// testIDs (stats-streak / -fatigue / -readiness + stats-streak-label) + i18n.
// useCountUp = the RN lib hook (mobile/lib/useCountUp). The ambient-drift wash +
// flame flicker idle motions are dropped (FIDELITY FLAG — design-polish wave).

import { View, Text } from 'react-native';
import { Flame, Battery, Sparkles, type LucideIcon } from 'lucide-react-native';
import type { ReadinessOutput, FatigueOutput } from '../../../src/react/lib/engineWrappers';
import { useCountUp } from '../../lib/useCountUp';
import { PulseCard } from '../pulse/PulseCard';
import { dark, varColor, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function localizedFatigueLabel(f: FatigueOutput | null): string {
  if (!f) return t('stats.naFallback');
  const i18nKey =
    f.key === 'INSUFFICIENT_DATA'
      ? 'coachEngine.fatigue.insufficient.label'
      : f.key
        ? `coachEngine.fatigue.${f.key}.label`
        : null;
  if (!i18nKey) return f.label;
  const v = t(i18nKey);
  return v && v !== i18nKey ? v : f.label;
}

function localizedReadinessLabel(r: ReadinessOutput | null): string {
  if (!r) return t('stats.naFallback');
  const i18nKey = r.key ? `coachEngine.readiness.labels.${r.key}` : null;
  if (!i18nKey) return r.label;
  const v = t(i18nKey);
  return v && v !== i18nKey ? v : r.label;
}

interface Props {
  streak: number;
  fatigue: FatigueOutput | null;
  readiness: ReadinessOutput | null;
  compact?: boolean;
}

export function StatsGrid({ streak, fatigue, readiness, compact = false }: Props): React.JSX.Element {
  const streakLabel = streak === 1 ? t('stats.streakUnit_one') : t('stats.streakUnit_other');
  const streakDisplay = useCountUp(streak);
  const fatigueDisplay = useCountUp(fatigue?.score ?? 0);
  const readinessDisplay = useCountUp(readiness?.score ?? 0);

  return (
    <View
      accessibilityLabel={t('stats.ariaLabel')}
      style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}
    >
      <StatTile
        label={t('stats.streak')}
        value={streakDisplay}
        sublabel={streakLabel}
        Icon={Flame}
        accentVar="--brick"
        testID="stats-streak"
        sublabelTestID="stats-streak-label"
      />
      <StatTile
        label={t('stats.fatigue')}
        value={fatigue ? fatigueDisplay : '-'}
        sublabel={localizedFatigueLabel(fatigue)}
        Icon={Battery}
        accentVar="--olive"
        testID="stats-fatigue"
      />
      {!compact && (
        <StatTile
          label={t('stats.readiness')}
          value={readiness ? readinessDisplay : '-'}
          sublabel={localizedReadinessLabel(readiness)}
          Icon={Sparkles}
          accentVar="--deep"
          testID="stats-readiness"
        />
      )}
    </View>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  sublabel: string;
  Icon: LucideIcon;
  accentVar: string;
  testID: string;
  sublabelTestID?: string;
}

function StatTile({ label, value, sublabel, Icon, accentVar, testID, sublabelTestID }: StatTileProps): React.JSX.Element {
  const accentColor = varColor(accentVar);
  return (
    <PulseCard tight style={{ flex: 1, padding: 12, alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 8, right: 8 }}>
        <Icon size={14} color={withAlpha(accentColor, 0.8)} />
      </View>
      <Text className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: 0.8, fontWeight: '500', color: dark.ink2 }}>
        {label}
      </Text>
      <Text testID={testID} style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginTop: 4 }}>
        {String(value)}
      </Text>
      <Text testID={sublabelTestID} style={{ fontSize: 12, color: dark.ink2, marginTop: 2 }}>
        {sublabel}
      </Text>
    </PulseCard>
  );
}
