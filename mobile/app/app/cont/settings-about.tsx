// ══ SETTINGS ABOUT (RN port, W6b) ════════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsAbout.tsx. Static branding:
// PulseMark tile + tagline + intro + andura.app link + Versiune/Build/Echipa
// rows. i18n keys + testIDs + APP_VERSION/APP_BUILD constants verbatim. The web
// <a href> external link → Linking.openURL.

import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { Globe } from 'lucide-react-native';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { PulseMark } from '../../../components/pulse/PulseMark';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, surface } from '../../../lib/tokens';

const APP_VERSION = 'v1.0.0';
const APP_BUILD = '2026.05.22';

export default function SettingsAbout() {
  return (
    <View testID="settings-about" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.about.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-about-back"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, alignItems: 'center' }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            backgroundColor: surface.base,
            borderWidth: 1,
            borderColor: dark.line,
          }}
        >
          <PulseMark size={52} />
        </View>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 16, textAlign: 'center', lineHeight: 30 }}>
          {t('settings.about.tagline')}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 24, textAlign: 'center', maxWidth: 320 }}>
          {t('settings.about.intro')}
        </Text>

        <Pressable
          accessibilityRole="link"
          onPress={() => { void Linking.openURL('https://andura.app'); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          <Globe size={16} color={dark.brick} />
          <Text style={{ color: dark.brick, fontWeight: '500' }}>andura.app</Text>
        </Pressable>

        <Card style={{ width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: dark.line }}>
            <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('settings.about.versionLabel')}</Text>
            <Text testID="about-version" className="font-mono" style={{ fontSize: 14, color: dark.ink, fontWeight: '500' }}>{APP_VERSION}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: dark.line }}>
            <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('settings.about.buildLabel')}</Text>
            <Text testID="about-build" className="font-mono" style={{ fontSize: 14, color: dark.ink, fontWeight: '500' }}>{APP_BUILD}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('settings.about.teamLabel')}</Text>
            <Text style={{ fontSize: 14, color: dark.ink, fontWeight: '500' }}>{t('settings.about.teamValue')}</Text>
          </View>
        </Card>

        <Text style={{ fontSize: 12, color: dark.ink3, marginTop: 24, lineHeight: 18, textAlign: 'center' }}>
          {t('settings.about.thanks')}
        </Text>
      </ScrollView>
    </View>
  );
}
