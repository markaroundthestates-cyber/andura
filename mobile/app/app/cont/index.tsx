// ══ CONT — Tab 4 of 4 (RN port, W6a) ═════════════════════════════════════
// RN twin of src/react/routes/screens/cont/Cont.tsx (the account hub). Markup
// rewritten div/span/button → View/Text/Pressable; ALL else kept verbatim:
// the SECTIONS map + every row `target` navigation, the JWT profile wire
// (getUserProfileDisplay), the streak Pill (useWorkoutStore.streak), i18n keys
// (cont.* / tabs.cont.title) and every testID (cont-home, cont-account-*,
// cont-section-*, cont-row-*, cont-version*).
//
// Navigation: web used react-router `navigate(gotoPath(target))`; here the RN
// nav shim `goto(target)` (mobile/lib/nav.ts → expo-router push) consumes the
// SAME GotoScreen vocabulary, single-source via the shared web navigation.ts.
// (W6b ports the rest of the cont sub-screens; the rows whose targets are not
// yet ported still navigate — the leaf routes are placeholders until then.)

import { ScrollView, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Bell,
  Sparkles,
  Palette,
  XOctagon,
  SlidersHorizontal,
  ShieldCheck,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  LifeBuoy,
  Info,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';
import { goto } from '../../../lib/nav';
import type { GotoScreen } from '../../../lib/nav';
import { getUserProfileDisplay } from '../../../components/cont/userProfile';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { Pill } from '../../../components/pulse/Pill';
import { Card, ZoneHeading } from '../../../components/cont/fields';
import { dark, accent } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

interface ContRow {
  id: string;
  labelKey: string;
  Icon: typeof User;
  danger?: boolean;
  target?: GotoScreen;
}

interface ContSection {
  id: 'cont' | 'general' | 'privacy' | 'danger' | 'help';
  titleKey: string;
  rows: ContRow[];
  danger?: boolean;
}

// Verbatim from web Cont.tsx SECTIONS (same ids / labelKeys / targets).
const SECTIONS: readonly ContSection[] = [
  {
    id: 'cont',
    titleKey: 'cont.sections.cont',
    rows: [
      { id: 'profile', labelKey: 'cont.rows.profile', Icon: User, target: 'settings-profile' },
      { id: 'notifications', labelKey: 'cont.rows.notifications', Icon: Bell, target: 'settings-notifications' },
      { id: 'subscription', labelKey: 'cont.rows.subscription', Icon: Sparkles, target: 'settings-subscription' },
    ],
  },
  {
    id: 'general',
    titleKey: 'cont.sections.general',
    rows: [
      { id: 'appearance', labelKey: 'cont.rows.appearance', Icon: Palette, target: 'settings-appearance' },
      { id: 'aparate-lipsa', labelKey: 'cont.rows.aparateLipsa', Icon: XOctagon, target: 'aparate-lipsa' },
      { id: 'prefs', labelKey: 'cont.rows.prefs', Icon: SlidersHorizontal, target: 'settings-prefs' },
    ],
  },
  {
    id: 'privacy',
    titleKey: 'cont.sections.privacy',
    rows: [
      { id: 'privacy', labelKey: 'cont.rows.privacy', Icon: ShieldCheck, target: 'settings-privacy' },
      { id: 'terms', labelKey: 'cont.rows.terms', Icon: FileText, target: 'settings-terms' },
      { id: 'export', labelKey: 'cont.rows.export', Icon: Download, target: 'settings-export' },
      { id: 'import', labelKey: 'cont.rows.import', Icon: Upload, target: 'settings-import' },
    ],
  },
  {
    id: 'danger',
    titleKey: 'cont.sections.danger',
    danger: true,
    rows: [{ id: 'danger', labelKey: 'cont.rows.danger', Icon: AlertTriangle, danger: true, target: 'settings-danger' }],
  },
  {
    id: 'help',
    titleKey: 'cont.sections.help',
    rows: [
      { id: 'support', labelKey: 'cont.rows.support', Icon: LifeBuoy, target: 'settings-support' },
      { id: 'about', labelKey: 'cont.rows.about', Icon: Info, target: 'settings-about' },
      { id: 'faq', labelKey: 'cont.rows.faq', Icon: HelpCircle, target: 'settings-faq' },
    ],
  },
];

const FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

export default function Cont() {
  const handleRowPress = (target: GotoScreen | undefined): void => {
    if (target) goto(target);
  };

  // §F-cont-01/02/03 user-wire — read avatar initial + name + email from the
  // id_token JWT claims (single source post Magic Link verify). Unauthenticated
  // fallback preserves generic placeholders (native auth wiring is W-Final).
  const profile = getUserProfileDisplay();
  const emailLocalPart = profile.email.split('@')[0] ?? '';
  const hasRealName = profile.name.length > 0 && profile.name !== emailLocalPart;
  const firstName = profile.name.split(' ')[0] || profile.name;
  const primaryLine = hasRealName ? firstName : profile.email || t('cont.accountFallback');
  const subtitle = hasRealName ? profile.email : profile.email ? '' : t('cont.emailFallback');

  const streak = useWorkoutStore((s) => s.streak);
  const streakUnit = streak === 1 ? t('stats.streakUnit_one') : t('stats.streakUnit_other');

  return (
    <ScrollView
      testID="cont-home"
      style={{ flex: 1, backgroundColor: dark.paper }}
      contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 }}
    >
      {/* Pulse header — display wordmark (tabs.cont.title). */}
      <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 16 }}>
        {t('tabs.cont.title')}
      </Text>

      {/* Account card — gradient avatar pebble + name/email + streak Pill. */}
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }}>
          <View
            testID="cont-account-initial"
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinearGradient
              colors={[accent.volt, accent.aqua]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ ...FILL, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="font-display" style={{ fontSize: 22, fontWeight: '700', color: dark.onAccent }}>
                {profile.initial}
              </Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              testID="cont-account-name"
              className="font-display"
              numberOfLines={1}
              style={{ fontWeight: '700', color: dark.ink }}
            >
              {primaryLine}
            </Text>
            {subtitle ? (
              <Text testID="cont-account-email" numberOfLines={1} style={{ fontSize: 14, color: dark.ink2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {/* Streak chip — the RN Pill renders children inside a single <Text>,
              so the web's inline <Flame> glyph (an SVG, invalid inside <Text> on
              native) is dropped; the chip text carries the streak. FLAG: flame
              glyph drift vs web (revisit at design polish). */}
          <Pill color={accent.volt}>{`${streak} ${streakUnit}`}</Pill>
        </View>
      </Card>

      {SECTIONS.map((section) => (
        <View key={section.id} testID={`cont-section-${section.id}`}>
          <ZoneHeading danger={section.danger ?? false}>{t(section.titleKey)}</ZoneHeading>
          <Card>
            {section.rows.map((row, idx) => {
              const Icon = row.Icon;
              const isLast = idx === section.rows.length - 1;
              const color = row.danger ? dark.brickDark : dark.ink;
              return (
                <Pressable
                  key={row.id}
                  testID={`cont-row-${row.id}`}
                  accessibilityRole="button"
                  disabled={!row.target}
                  onPress={() => handleRowPress(row.target)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: dark.line,
                    opacity: row.target ? 1 : 0.5,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: dark.paper,
                    }}
                  >
                    <Icon size={20} color={color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color }}>{t(row.labelKey)}</Text>
                  <ChevronRight size={20} color={dark.ink3} strokeWidth={1.6} />
                </Pressable>
              );
            })}
          </Card>
        </View>
      ))}

      {/* Version footer — terse version + soft serif tagline. */}
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
        <Text testID="cont-version" style={{ fontSize: 12, color: dark.ink3 }}>
          {t('cont.version')}
        </Text>
        <Text
          testID="cont-version-tagline"
          className="font-serif"
          style={{ fontStyle: 'italic', fontSize: 12, color: dark.ink3, marginTop: 4 }}
        >
          {t('cont.versionTagline')}
        </Text>
      </View>
    </ScrollView>
  );
}
