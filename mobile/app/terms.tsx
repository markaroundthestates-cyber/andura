// ══ TERMS (route '/terms') — public legal page, top-level (web router.tsx L157)
// RN twin of src/react/routes/screens/Terms.tsx. Top-level (NOT under the auth
// shell) so it's reachable from the Auth consent links + footer. Scrollable
// long-form legal copy (memory: site legal links must be scrollable plain text,
// not a non-scroll snapshot). The back goes history-back when possible, else to
// /auth (direct deep-link load). Same testIDs (terms-page / terms-back) + i18n.

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
  { headingKey: 'legalPage.termsEligibilityHeading', bodyKey: 'legalPage.termsEligibilityBody' },
  { headingKey: 'legalPage.termsServiceHeading', bodyKey: 'legalPage.termsServiceBody' },
  { headingKey: 'legalPage.termsRecsHeading', bodyKey: 'legalPage.termsRecsBody' },
  { headingKey: 'legalPage.termsResponsibilityHeading', bodyKey: 'legalPage.termsResponsibilityBody' },
  { headingKey: 'legalPage.termsBackupHeading', bodyKey: 'legalPage.termsBackupBody' },
  { headingKey: 'legalPage.termsErrorsHeading', bodyKey: 'legalPage.termsErrorsBody' },
  { headingKey: 'legalPage.termsBetaHeading', bodyKey: 'legalPage.termsBetaBody' },
  { headingKey: 'legalPage.termsWarrantyHeading', bodyKey: 'legalPage.termsWarrantyBody' },
  { headingKey: 'legalPage.termsLiabilityHeading', bodyKey: 'legalPage.termsLiabilityBody' },
  { headingKey: 'legalPage.termsIpHeading', bodyKey: 'legalPage.termsIpBody' },
  { headingKey: 'legalPage.termsTerminationHeading', bodyKey: 'legalPage.termsTerminationBody' },
  { headingKey: 'legalPage.termsLawHeading', bodyKey: 'legalPage.termsLawBody' },
  { headingKey: 'legalPage.termsChangesHeading', bodyKey: 'legalPage.termsChangesBody' },
];

export default function Terms(): React.JSX.Element {
  function handleBack(): void {
    if (router.canGoBack()) router.back();
    else router.replace('/auth');
  }

  const sections: Section[] = SECTION_KEYS.map((s) => ({
    heading: t(s.headingKey),
    body: t(s.bodyKey),
  }));

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-paper" style={{ backgroundColor: dark.paper }} testID="terms-page">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('legalPage.back')}
          testID="terms-back"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}
        >
          <ArrowLeft size={20} color={dark.ink2} />
          <Text className="text-ink2" style={{ fontSize: 14 }}>{t('legalPage.back')}</Text>
        </Pressable>

        <Text className="font-display font-bold text-ink" style={{ fontSize: 24, marginBottom: 8 }}>
          {t('legalPage.termsTitle')}
        </Text>
        <Text className="text-ink2" style={{ fontSize: 12, marginBottom: 24 }}>
          {t('legalPage.versionLine')}
        </Text>

        <Text className="text-ink" style={{ fontSize: 14, lineHeight: 22, marginBottom: 16 }}>
          {t('legalPage.termsIntro')}
        </Text>

        {sections.map((s) => (
          <View key={s.heading} style={{ marginBottom: 16 }}>
            <Text className="font-semibold text-ink" style={{ fontSize: 16, marginBottom: 6 }}>{s.heading}</Text>
            <Text className="text-ink2" style={{ fontSize: 14, lineHeight: 22 }}>{s.body}</Text>
          </View>
        ))}

        <Text className="text-ink2" style={{ fontSize: 12, lineHeight: 20, marginTop: 8 }}>
          {t('legalPage.termsQuestions')} privacy@andura.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
