// ══ PROJECTION STRIP (RN port) — "Preconizare" forward projection ════════
// RN twin of src/react/components/Progres/ProjectionStrip.tsx. readNutrition
// Projection async wire + maintain/empty/projected branches kept verbatim;
// markup → View/Text + TrendingUp icon. Same testIDs + i18n keys.

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { readNutritionProjection, DEFAULT_HORIZON_DAYS } from '../../../src/react/lib/nutritionProjection';
import type { ProjectionResult } from '../../../src/react/lib/nutritionProjection';
import { useNutritionStore } from '../../../src/react/stores/nutritionStore';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function fmtKg(n: number): string {
  return n.toLocaleString('ro-RO', { maximumFractionDigits: 1 }).replace(/,/g, ' ');
}

function horizonWeeksLabel(days: number): string {
  const weeks = Math.round(days / 7);
  return t('bodyComp.projectionStrip.weeksLabel', { n: weeks });
}

export function ProjectionStrip(): React.JSX.Element | null {
  const [proj, setProj] = useState<ProjectionResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const dailyLog = useNutritionStore((s) => s.dailyLog);

  useEffect(() => {
    let cancelled = false;
    readNutritionProjection(Date.now(), DEFAULT_HORIZON_DAYS).then((p) => {
      if (!cancelled) {
        setProj(p);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dailyLog]);

  if (!loaded) return null;

  if (proj === null) {
    return (
      <View
        testID="projection-strip-empty"
        className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
        style={{ borderRadius: 22, gap: 16 }}
        accessibilityLabel={t('bodyComp.projectionStrip.ariaLabel')}
      >
        <TrendingUp size={24} color={dark.ink2} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            className="uppercase font-semibold text-ink2"
            style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
          >
            {t('bodyComp.projectionStrip.label')}
          </Text>
          <Text className="text-ink2" style={{ fontSize: 14 }}>
            {t('bodyComp.projectionStrip.emptyHint')}
          </Text>
        </View>
      </View>
    );
  }

  const weeks = horizonWeeksLabel(proj.horizonDays);

  if (proj.direction === 'maintain') {
    return (
      <View
        testID="projection-strip"
        className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
        style={{ borderRadius: 22, gap: 16 }}
        accessibilityLabel={t('bodyComp.projectionStrip.ariaLabel')}
      >
        <TrendingUp size={24} color={dark.brick} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            className="uppercase font-semibold text-ink2"
            style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
          >
            {t('bodyComp.projectionStrip.label')}
          </Text>
          <Text testID="projection-maintain" className="font-semibold text-ink" style={{ fontSize: 16 }}>
            {t('bodyComp.projectionStrip.maintain', { kg: fmtKg(proj.projectedWeightKg) })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      testID="projection-strip"
      className="bg-paper-2 border border-line p-4 mb-4 flex-row items-center"
      style={{ borderRadius: 22, gap: 16 }}
      accessibilityLabel={t('bodyComp.projectionStrip.ariaLabel')}
    >
      <TrendingUp size={24} color={dark.brick} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="uppercase font-semibold text-ink2"
          style={{ fontSize: 12, letterSpacing: 0.4, marginBottom: 4 }}
        >
          {t('bodyComp.projectionStrip.label')}
        </Text>
        <Text testID="projection-line" className="font-semibold text-ink" style={{ fontSize: 16 }}>
          {t('bodyComp.projectionStrip.projectedLine', { weeks })}{' '}
          <Text className="font-mono">
            ~{t('bodyComp.projectionStrip.weightSuffix', { kg: fmtKg(proj.projectedWeightKg) })}
          </Text>
          {proj.projectedBfPct !== null && (
            <Text className="font-mono">
              {' '}
              {t('bodyComp.projectionStrip.projectedBfSuffix', { pct: fmtKg(proj.projectedBfPct) })}
            </Text>
          )}
          .
        </Text>
        <Text testID="projection-disclaimer" className="text-ink3" style={{ fontSize: 12, marginTop: 2, fontStyle: 'italic' }}>
          {t('bodyComp.projectionStrip.disclaimer')}
        </Text>
      </View>
    </View>
  );
}
