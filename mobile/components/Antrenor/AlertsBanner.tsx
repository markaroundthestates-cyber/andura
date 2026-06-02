// ══ ALERTS BANNER (RN port) — Phase 6 task_06 Option B UI ════════════════
// RN twin of src/react/components/Antrenor/AlertsBanner.tsx. Renders
// ProactiveAlert[] from coachDirectorAggregate.alerts, 3-tier severity
// (urgent/warn/info). Same testID (alerts-banner) + data-* semantics carried
// onto accessibility props. Engine emits RO copy (no diacritics, D-LEGACY-064).
//
// Web→RN: <div>→<View>, <p>→<Text>, lucide-react→lucide-react-native, the
// --status-* CSS-var surfaces → static dark-theme tokens (lib/tokens.status).

import { View, Text } from 'react-native';
import { AlertTriangle, Info } from 'lucide-react-native';
import type { ProactiveAlert } from '../../../src/react/lib/engineWrappers';
import { dark, status, surface } from '../../lib/tokens';

interface AlertsBannerProps {
  alerts: readonly ProactiveAlert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps): React.JSX.Element | null {
  if (alerts.length === 0) return null;
  return (
    <View testID="alerts-banner" style={{ marginBottom: 16, gap: 8 }}>
      {alerts.map((a) => {
        const tint =
          a.severity === 'urgent'
            ? { backgroundColor: status.dangerBg, borderColor: status.dangerBorder }
            : a.severity === 'warn'
              ? { backgroundColor: status.neutralBg, borderColor: status.neutralBorder }
              : { backgroundColor: surface.s2, borderColor: dark.line };
        const isAlertRow = a.severity === 'urgent' || a.severity === 'warn';
        return (
          <View
            key={a.id}
            accessibilityRole={a.severity === 'urgent' ? 'alert' : 'text'}
            accessibilityLiveRegion={a.severity === 'urgent' ? 'assertive' : 'polite'}
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
            {isAlertRow ? (
              <AlertTriangle size={16} color={dark.ink} style={{ marginTop: 2 }} />
            ) : (
              <Info size={16} color={dark.ink2} style={{ marginTop: 2 }} />
            )}
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 19, color: dark.ink }}>{a.text}</Text>
          </View>
        );
      })}
    </View>
  );
}
