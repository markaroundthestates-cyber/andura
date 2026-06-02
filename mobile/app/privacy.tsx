// ══ PRIVACY (route '/privacy') — public legal page, top-level (web router.tsx L158)
// RN twin of src/react/routes/screens/Privacy.tsx. Pair to /terms: the Auth
// consent gate links to both. Scrollable long-form GDPR copy (memory: site legal
// links must be scrollable plain text). Back = history-back when possible, else
// /auth. Same testIDs (privacy-page / privacy-back) + i18n keys.

import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

interface Section {
  heading: string;
  body: string;
}

const SECTION_KEYS: ReadonlyArray<{ headingKey: string; bodyKey: string }> = [
  { headingKey: 'legalPage.privacyControllerHeading', bodyKey: 'legalPage.privacyControllerBody' },
  { headingKey: 'legalPage.privacyCollectHeading', bodyKey: 'legalPage.privacyCollectBody' },
  { headingKey: 'legalPage.privacyBasisHeading', bodyKey: 'legalPage.privacyBasisBody' },
  { headingKey: 'legalPage.privacyStorageHeading', bodyKey: 'legalPage.privacyStorageBody' },
  { headingKey: 'legalPage.privacyProcessorsHeading', bodyKey: 'legalPage.privacyProcessorsBody' },
  { headingKey: 'legalPage.privacyRetentionHeading', bodyKey: 'legalPage.privacyRetentionBody' },
  { headingKey: 'legalPage.privacyNotDoHeading', bodyKey: 'legalPage.privacyNotDoBody' },
  { headingKey: 'legalPage.privacyCookiesHeading', bodyKey: 'legalPage.privacyCookiesBody' },
  { headingKey: 'legalPage.privacyChildrenHeading', bodyKey: 'legalPage.privacyChildrenBody' },
  { headingKey: 'legalPage.privacySecurityHeading', bodyKey: 'legalPage.privacySecurityBody' },
  { headingKey: 'legalPage.privacyRightsHeading', bodyKey: 'legalPage.privacyRightsBody' },
  { headingKey: 'legalPage.privacyChangesHeading', bodyKey: 'legalPage.privacyChangesBody' },
];

export default function Privacy(): React.JSX.Element {
  function handleBack(): void {
    if (router.canGoBack()) router.back();
    else router.replace('/auth');
  }

  const sections: Section[] = SECTION_KEYS.map((s) => ({
    heading: t(s.headingKey),
    body: t(s.bodyKey),
  }));

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-paper" style={{ backgroundColor: dark.paper }} testID="privacy-page">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('legalPage.back')}
          testID="privacy-back"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}
        >
          <ArrowLeft size={20} color={dark.ink2} />
          <Text className="text-ink2" style={{ fontSize: 14 }}>{t('legalPage.back')}</Text>
        </Pressable>

        <Text className="font-display font-bold text-ink" style={{ fontSize: 24, marginBottom: 8 }}>
          {t('legalPage.privacyTitle')}
        </Text>
        <Text className="text-ink2" style={{ fontSize: 12, marginBottom: 24 }}>
          {t('legalPage.versionLine')}
        </Text>

        <Text className="text-ink" style={{ fontSize: 14, lineHeight: 22, marginBottom: 16 }}>
          {t('legalPage.privacyIntro')}
        </Text>

        {sections.map((s) => (
          <View key={s.heading} style={{ marginBottom: 16 }}>
            <Text className="font-semibold text-ink" style={{ fontSize: 16, marginBottom: 6 }}>{s.heading}</Text>
            <Text className="text-ink2" style={{ fontSize: 14, lineHeight: 22 }}>{s.body}</Text>
          </View>
        ))}

        <View style={{ marginBottom: 16 }}>
          <Text className="font-semibold text-ink" style={{ fontSize: 16, marginBottom: 6 }}>
            {t('legalPage.privacyContactHeading')}
          </Text>
          <Text className="text-ink2" style={{ fontSize: 14, lineHeight: 22 }}>
            {t('legalPage.privacyContactBody')} privacy@andura.app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
