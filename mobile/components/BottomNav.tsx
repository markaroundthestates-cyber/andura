// ══ BOTTOM NAV (RN port) — 4 Taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) ═
// RN twin of src/react/components/BottomNav.tsx. The 4-tab structure, i18n
// labels (t('nav.tabs.*')), lucide icons, active-route detection by /app/{tab}
// prefix, and the testIDs are preserved. Web specifics dropped on native: the
// sliding-pill indicator + CSS color-mix glow are a later re-skin wave; here the
// active tab is marked by the brick accent + a tinted chip (pre-calc'd rgba from
// lib/tokens.ts). Route ids stay Romanian (URL stability); only labels localize.

import { View, Text, Pressable } from 'react-native';
import { usePathname } from 'expo-router';
import { Dumbbell, Activity, CalendarDays, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../lib/theme';
import { t } from '../../src/i18n/index.js';

type Tab = 'antrenor' | 'progres' | 'istoric' | 'cont';

const TABS: readonly { id: Tab; Icon: typeof Activity }[] = [
  { id: 'antrenor', Icon: Dumbbell },
  { id: 'progres', Icon: Activity },
  { id: 'istoric', Icon: CalendarDays },
  { id: 'cont', Icon: User },
];

export function BottomNav() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const isActive = (tab: Tab): boolean =>
    pathname === `/app/${tab}` || pathname.startsWith(`/app/${tab}/`);

  return (
    <View
      testID="bottom-nav"
      accessibilityRole="tablist"
      accessibilityLabel={t('nav.ariaLabel')}
      className="flex-row items-center border-t border-line bg-paper"
      style={{ height: 64, paddingHorizontal: 12 }}
    >
      {TABS.map(({ id, Icon }) => {
        const active = isActive(id);
        return (
          <Pressable
            key={id}
            testID={`bottom-nav-${id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => router.navigate(`/app/${id}` as never)}
            className="flex-1 items-center justify-center"
            style={{ height: '100%', gap: 4 }}
          >
            <View
              style={{
                width: 46,
                height: 30,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.mix.brick16 : 'transparent',
              }}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                color={active ? colors.brick : colors.ink2}
              />
            </View>
            <Text
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: 1,
                color: active ? colors.brick : colors.ink2,
              }}
            >
              {t(`nav.tabs.${id}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
