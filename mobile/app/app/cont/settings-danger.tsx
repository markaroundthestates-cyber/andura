// ══ SETTINGS DANGER (route '/app/cont/settings-danger') — RN port ═══════════
// RN twin of src/react/routes/screens/cont/SettingsDanger.tsx (D047 drill-down
// paradigm). The Cont hub "danger" row landed here, and previously this was a
// bare Placeholder — so Logout / Reset data / Delete account were unreachable
// (dead-end). This is the real list page: a cream danger warning banner + three
// rows that navigate to the existing confirm drill-downs (logout-confirm /
// reset-data-confirm / delete-account-confirm) + the GDPR footer. i18n keys +
// testIDs kept verbatim from web (settings-danger / danger-warning-banner /
// danger-logout / danger-reset / danger-delete / settings-danger-back).
// Markup div/button → View/Pressable; entrance + press-feedback motion added
// (web-export safe, reduced-motion respected).

import { View, Text } from 'react-native';
import { LogOut, RotateCcw, Trash2, AlertTriangle, type LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SubHeader } from '../../../components/SubHeader';
import { Entrance } from '../../../components/motion/Entrance';
import { PressableScale } from '../../../components/motion/PressableScale';
import { goto } from '../../../lib/nav';
import type { GotoScreen } from '../../../lib/nav';
import { dark, status } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

interface DangerRow {
  id: string;
  testID: string;
  Icon: ComponentType<LucideProps>;
  titleKey: string;
  subKey: string;
  target: GotoScreen;
  danger?: boolean;
}

const ROWS: readonly DangerRow[] = [
  {
    id: 'logout',
    testID: 'danger-logout',
    Icon: LogOut,
    titleKey: 'settings.danger.logoutRowTitle',
    subKey: 'settings.danger.logoutRowSub',
    target: 'logout-confirm',
  },
  {
    id: 'reset',
    testID: 'danger-reset',
    Icon: RotateCcw,
    titleKey: 'settings.danger.resetRowTitle',
    subKey: 'settings.danger.resetRowSub',
    target: 'reset-data-confirm',
  },
  {
    id: 'delete',
    testID: 'danger-delete',
    Icon: Trash2,
    titleKey: 'settings.danger.deleteRowTitle',
    subKey: 'settings.danger.deleteRowSub',
    target: 'delete-account-confirm',
    danger: true,
  },
];

export default function SettingsDanger(): React.JSX.Element {
  return (
    <View testID="settings-danger" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.danger.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-danger-back"
      />

      <View style={{ flex: 1, padding: 20 }}>
        {/* Cream danger warning banner — alert-triangle + safety messaging. */}
        <Entrance delay={0}>
          <View
            testID="danger-warning-banner"
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              marginBottom: 16,
              backgroundColor: status.dangerBg,
              borderColor: status.dangerBorder,
            }}
          >
            <AlertTriangle size={20} color={status.dangerText} style={{ marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: status.dangerText }}>
              {t('settings.danger.warningBanner')}
            </Text>
          </View>
        </Entrance>

        {/* Action rows → confirm drill-downs. */}
        <Entrance delay={70}>
          <View
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: dark.line,
              backgroundColor: dark.paper2,
              marginBottom: 16,
            }}
          >
            {ROWS.map((row, idx) => {
              const Icon = row.Icon;
              const isLast = idx === ROWS.length - 1;
              const color = row.danger ? dark.brickDark : dark.ink;
              return (
                <PressableScale
                  key={row.id}
                  testID={row.testID}
                  accessibilityRole="button"
                  onPress={() => goto(row.target)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: dark.line,
                  }}
                >
                  <Icon size={20} color={color} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color }}>{t(row.titleKey)}</Text>
                    <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 2 }}>{t(row.subKey)}</Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </Entrance>

        {/* GDPR footer. */}
        <Entrance delay={140}>
          <Text style={{ fontSize: 12, lineHeight: 18, color: dark.ink2 }}>
            {t('settings.danger.gdprFooter')}
          </Text>
        </Entrance>
      </View>
    </View>
  );
}
