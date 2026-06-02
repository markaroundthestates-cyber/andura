// ══ PATTERNS BANNER (RN port) — Phase 6 task_06 Option B UI ══════════════
// RN twin of src/react/components/Antrenor/PatternsBanner.tsx. Renders
// STAGNATION + LOW_ADHERENCE banners from coachDirectorAggregate. 2 patterns
// V1 LOCK. Same testID (patterns-banner). Engine emits RO copy (D-LEGACY-064).

import { View, Text } from 'react-native';
import { AlertCircle, Info } from 'lucide-react-native';
import type { PatternBanner } from '../../../src/react/lib/engineWrappers';
import { dark, status, surface } from '../../lib/tokens';

interface PatternsBannerProps {
  banners: readonly PatternBanner[];
}

export function PatternsBanner({ banners }: PatternsBannerProps): React.JSX.Element | null {
  if (banners.length === 0) return null;
  return (
    <View testID="patterns-banner" style={{ marginBottom: 16, gap: 8 }}>
      {banners.map((b) => {
        const tint =
          b.severity === 'warn'
            ? { backgroundColor: status.neutralBg, borderColor: status.neutralBorder }
            : { backgroundColor: surface.s2, borderColor: dark.line };
        return (
          <View
            key={b.id}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              ...tint,
            }}
          >
            {b.severity === 'warn' ? (
              <AlertCircle size={16} color={dark.ink} style={{ marginTop: 2 }} />
            ) : (
              <Info size={16} color={dark.ink2} style={{ marginTop: 2 }} />
            )}
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 19, color: dark.ink }}>{b.text}</Text>
          </View>
        );
      })}
    </View>
  );
}
