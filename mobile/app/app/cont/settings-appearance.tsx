// ══ SETTINGS APPEARANCE (RN port, W6a) ═══════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsAppearance.tsx — the single
// home for all appearance controls: (1) Accent color (4 Pulse swatches), (2)
// Mode (Dark/Light), (3) Bottom-bar density (Comfortable/Compact). All wired to
// the REAL settingsStore (accent / theme / bottomNavStyle) — store writes are
// kept verbatim + persist through kv (W1). Every testID preserved (cont-accent-*,
// cont-theme-*, nav-style-*, cont-appearance-accent).
//
// FLAG — theme/accent RUNTIME switching: the web applied the accent app-wide via
// paletteSync.applyAccent (writes --brick on documentElement) and the theme via
// themeSync (<html data-theme>). RN has no CSS variables; NativeWind tokens
// (tailwind.config + lib/tokens) are STATIC (Pulse DARK). So the picker PERSISTS
// the choice (cloud-synced, ready for a native theme system) but does NOT re-tint
// the app live yet. Wiring NativeWind runtime theme/accent swap is W-Final /
// design-polish + Daniel-gated. The web `applyAccent` call is therefore omitted
// here (it touches `document`, native-unsafe) — store write retained.

import { ScrollView, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import type { Accent } from '../../../../src/react/stores/settingsStore';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { ZoneHeading } from '../../../components/cont/fields';
import { goBack } from '../../../lib/nav';
import { dark, accent as palette } from '../../../lib/tokens';

const ACCENT_OPTIONS: ReadonlyArray<{ value: Accent; hex: string; labelKey: string }> = [
  { value: 'volt', hex: palette.volt, labelKey: 'cont.appearance.accentVolt' },
  { value: 'aqua', hex: palette.aqua, labelKey: 'cont.appearance.accentAqua' },
  { value: 'ember', hex: palette.ember, labelKey: 'cont.appearance.accentEmber' },
  { value: 'violet', hex: palette.violet, labelKey: 'cont.appearance.accentViolet' },
];

const NAV_STYLE_OPTIONS: ReadonlyArray<{ value: 'compact' | 'comfortable'; labelKey: string }> = [
  { value: 'comfortable', labelKey: 'settings.appearance.navComfortable' },
  { value: 'compact', labelKey: 'settings.appearance.navCompact' },
];

const SURFACE_2 = 'rgba(33,39,60,0.78)';

export default function SettingsAppearance() {
  const accentSel = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  // FLAG: web also called applyAccent(a) (documentElement --brick) — omitted on
  // RN (native-unsafe + static tokens). Store write persists the choice.
  const pickAccent = (a: Accent): void => {
    setAccent(a);
  };

  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isLight = theme === 'light';
  const MODE_OPTIONS = [
    { value: 'dark' as const, labelKey: 'cont.appearance.modeDark', active: !isLight },
    { value: 'light' as const, labelKey: 'cont.appearance.modeLight', active: isLight },
  ];

  const navStyle = useSettingsStore((s) => s.bottomNavStyle);
  const setBottomNavStyle = useSettingsStore((s) => s.setBottomNavStyle);

  return (
    <View testID="settings-appearance" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('settings.appearance.title')} onBack={goBack} testIdBack="settings-appearance-back" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: 1.5, color: dark.ink3, marginBottom: 16 }}>
          {t('settings.appearance.subtitle')}
        </Text>

        {/* ACCENT — 4 Pulse swatches; selected gets glow + check. */}
        <Text className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: '600', color: dark.ink3, marginBottom: 12 }}>
          {t('cont.appearance.accentLabel')}
        </Text>
        <View
          testID="cont-appearance-accent"
          accessibilityRole="radiogroup"
          accessibilityLabel={t('cont.appearance.accentLabel')}
          style={{
            flexDirection: 'row',
            gap: 12,
            backgroundColor: dark.paper2,
            borderWidth: 1,
            borderColor: dark.line,
            borderRadius: 18,
            padding: 16,
            marginBottom: 24,
          }}
        >
          {ACCENT_OPTIONS.map((opt) => {
            const active = accentSel === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`cont-accent-${opt.value}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(opt.labelKey)}
                onPress={() => pickAccent(opt.value)}
                style={{ flex: 1, alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: opt.hex,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: active ? 1.06 : 1 }],
                    shadowColor: opt.hex,
                    shadowOpacity: active ? 0.7 : 0,
                    shadowRadius: active ? 9 : 0,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                >
                  {active && <Check size={15} color={dark.onAccent} strokeWidth={2.8} />}
                </View>
                <Text className="font-mono uppercase" style={{ fontSize: 9.5, color: dark.ink3, letterSpacing: 0.5, marginTop: 6 }}>
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* MODE — Dark/Light segmented toggle; active half = Pulse gradient. */}
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('cont.appearance.modeLabel')}
          style={{ flexDirection: 'row', gap: 6, borderRadius: 14, padding: 4, backgroundColor: SURFACE_2, marginBottom: 24 }}
        >
          {MODE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              testID={`cont-theme-${opt.value}`}
              accessibilityRole="button"
              accessibilityState={{ selected: opt.active }}
              onPress={() => setTheme(opt.value)}
              style={{ flex: 1, minHeight: 44, borderRadius: 11, overflow: 'hidden' }}
            >
              {opt.active ? (
                <LinearGradient
                  colors={[palette.volt, palette.aqua]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>{t(opt.labelKey)}</Text>
                </LinearGradient>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink2 }}>{t(opt.labelKey)}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* BOTTOM BAR — density (Comfortable / Compact). */}
        <Text className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: '600', color: dark.ink3, marginBottom: 12 }}>
          {t('settings.appearance.navHeading')}
        </Text>
        <View style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, overflow: 'hidden' }}>
          {NAV_STYLE_OPTIONS.map((opt, idx) => {
            const selected = navStyle === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`nav-style-${opt.value}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setBottomNavStyle(opt.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: idx < NAV_STYLE_OPTIONS.length - 1 ? 1 : 0,
                  borderBottomColor: dark.line,
                }}
              >
                <Text style={{ flex: 1, fontSize: 14, fontWeight: selected ? '600' : '400', color: selected ? dark.brick : dark.ink }}>
                  {t(opt.labelKey)}
                </Text>
                {selected && <Check size={16} color={dark.brick} strokeWidth={2.6} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
