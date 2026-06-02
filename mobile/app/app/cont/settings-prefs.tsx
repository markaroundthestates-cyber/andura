// ══ SETTINGS PREFS (RN port, W6a) ════════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsPrefs.tsx. Units (kg / lb
// disabled) + week start (L/D) + LIVE language toggle (EN default / RO opt-in)
// + Advanced drill-downs (reset-coach / redo-onboarding / schimba-faza / check-
// update). Store wires + i18n setLocale kept verbatim; every testID preserved
// (unit-*, week-start-*, language-*, advanced-*). Segmented toggles → Pressable
// rows with the Pulse gradient on the active half.
//
// FLAGS:
//  - LANGUAGE persistence: i18n.setLocale persists to localStorage ('sf.locale')
//    which is undefined on RN native → the in-memory locale flips (UI updates)
//    but does NOT persist across app restarts on native yet. Route through kv at
//    W-Final. On web export it persists fully (parity).
//  - CHECK-UPDATE row: web checkForUpdatesAndApply drives the service-worker
//    update flow (PWA). On RN that maps to expo-updates (W-Final). The handler
//    is kept (graceful no-op on native — the SW virtual module is absent); the
//    row stays for parity and gets the expo-updates wire at W-Final.

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, ChevronRight, RefreshCcw, GitBranch, DownloadCloud } from 'lucide-react-native';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import type { WeekStart } from '../../../../src/react/stores/settingsStore';
import { getCurrentLocale, setLocale, t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { goto, goBack } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';
import { checkAndMaybeApply } from '../../../lib/updates';

// CHECK-UPDATE handler — expo-updates twin of the web's checkForUpdatesAndApply
// (src/react/lib/swUpdate.ts). Runs an explicit OTA check + safe-apply (reload
// only when no active workout session, §D102) with toast feedback. Graceful
// no-op on web / Expo Go dev / until EAS Update is configured (Daniel-gated).
function checkForUpdatesAndApply(): void {
  void checkAndMaybeApply({ notify: true });
}

const UNIT_OPTIONS: ReadonlyArray<{ value: 'kg' | 'lb'; labelKey: string }> = [
  { value: 'kg', labelKey: 'settings.prefs.units.kg' },
  { value: 'lb', labelKey: 'settings.prefs.units.lb' },
];

const WEEK_START_OPTIONS: ReadonlyArray<{ value: WeekStart; labelKey: string }> = [
  { value: 'L', labelKey: 'settings.prefs.weekStart.monday' },
  { value: 'D', labelKey: 'settings.prefs.weekStart.sunday' },
];

type Locale = 'en' | 'ro';
const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Locale; labelKey: string }> = [
  { value: 'en', labelKey: 'settings.prefs.language.english' },
  { value: 'ro', labelKey: 'settings.prefs.language.romanian' },
];

const SURFACE_2 = 'rgba(33,39,60,0.78)';

// Segmented toggle row — active half carries the Pulse gradient.
function Segment({
  label,
  selected,
  disabled,
  onPress,
  testID,
  sublabel,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  testID: string;
  sublabel?: string;
}) {
  const inner = (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? dark.onAccent : dark.ink2 }}>{label}</Text>
      {sublabel ? (
        <Text className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: 0.5, opacity: 0.7, color: selected ? dark.onAccent : dark.ink2 }}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ flex: 1, minHeight: 44, borderRadius: 11, overflow: 'hidden', opacity: disabled ? 0.6 : 1 }}
    >
      {selected ? (
        <LinearGradient colors={[accent.volt, accent.aqua]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </Pressable>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <Text className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: '600', color: dark.ink3, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

export default function SettingsPrefs() {
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const weekStart = useSettingsStore((s) => s.weekStart);
  const setWeekStart = useSettingsStore((s) => s.setWeekStart);

  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale() as Locale);
  function handleLocaleChange(next: Locale): void {
    if (next === locale) return;
    setLocale(next);
    setLocaleState(next);
  }

  const advancedRows: ReadonlyArray<{
    testID: string;
    target: 'reset-coach-confirm' | 'redo-onboarding-confirm' | 'schimba-faza-confirm';
    Icon: typeof RefreshCcw;
    titleKey: string;
    descKey: string;
  }> = [
    { testID: 'advanced-reset-coach', target: 'reset-coach-confirm', Icon: RefreshCcw, titleKey: 'settings.prefs.advanced.resetCoach', descKey: 'settings.prefs.advanced.resetCoachDesc' },
    { testID: 'advanced-redo-onboarding', target: 'redo-onboarding-confirm', Icon: RotateCcw, titleKey: 'settings.prefs.advanced.redoOnboarding', descKey: 'settings.prefs.advanced.redoOnboardingDesc' },
    { testID: 'advanced-schimba-faza', target: 'schimba-faza-confirm', Icon: GitBranch, titleKey: 'settings.prefs.advanced.schimbaFaza', descKey: 'settings.prefs.advanced.schimbaFazaDesc' },
  ];

  return (
    <View testID="settings-prefs" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('settings.prefs.title')} onBack={goBack} testIdBack="settings-prefs-back" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* UNITS */}
        <Heading>{t('settings.prefs.units.heading')}</Heading>
        <View style={{ flexDirection: 'row', gap: 6, borderRadius: 14, padding: 4, backgroundColor: SURFACE_2 }}>
          {UNIT_OPTIONS.map((opt) => {
            const disabled = opt.value === 'lb';
            const selected = opt.value === 'kg';
            return (
              <Segment
                key={opt.value}
                testID={`unit-${opt.value}`}
                label={t(opt.labelKey)}
                selected={selected}
                disabled={disabled}
                onPress={() => { if (!disabled) setUnitSystem(opt.value); }}
              />
            );
          })}
        </View>
        <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 8, marginBottom: 16 }}>{t('settings.prefs.units.note')}</Text>

        {/* WEEK START */}
        <Heading>{t('settings.prefs.weekStart.heading')}</Heading>
        <View style={{ flexDirection: 'row', gap: 6, borderRadius: 14, padding: 4, backgroundColor: SURFACE_2, marginBottom: 16 }}>
          {WEEK_START_OPTIONS.map((opt) => (
            <Segment
              key={opt.value}
              testID={`week-start-${opt.value}`}
              label={t(opt.labelKey)}
              selected={weekStart === opt.value}
              onPress={() => setWeekStart(opt.value)}
            />
          ))}
        </View>

        {/* LANGUAGE */}
        <Heading>{`${t('settings.prefs.language.heading')} / Language`}</Heading>
        <View style={{ flexDirection: 'row', gap: 6, borderRadius: 14, padding: 4, backgroundColor: SURFACE_2, marginBottom: 16 }}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <Segment
              key={opt.value}
              testID={`language-${opt.value}`}
              label={t(opt.labelKey)}
              selected={locale === opt.value}
              onPress={() => handleLocaleChange(opt.value)}
              sublabel={opt.value === 'en' ? t('settings.prefs.language.default') : undefined}
            />
          ))}
        </View>

        {/* ADVANCED */}
        <Heading>{t('settings.prefs.advanced.heading')}</Heading>
        <View style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, overflow: 'hidden' }}>
          {advancedRows.map((row) => {
            const Icon = row.Icon;
            return (
              <Pressable
                key={row.testID}
                testID={row.testID}
                accessibilityRole="button"
                onPress={() => goto(row.target)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: dark.line }}
              >
                <Icon size={20} color={dark.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t(row.titleKey)}</Text>
                  <Text style={{ fontSize: 12, color: dark.ink2 }}>{t(row.descKey)}</Text>
                </View>
                <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
              </Pressable>
            );
          })}
          <Pressable
            testID="advanced-check-update"
            accessibilityRole="button"
            onPress={() => checkForUpdatesAndApply()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
          >
            <DownloadCloud size={20} color={dark.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t('settings.prefs.advanced.checkUpdate')}</Text>
              <Text style={{ fontSize: 12, color: dark.ink2 }}>{t('settings.prefs.advanced.checkUpdateDesc')}</Text>
            </View>
            <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
