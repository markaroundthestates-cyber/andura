// ══ SETTINGS TERMS (RN port, W6b) ════════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsTerms.tsx. T&C + Medical
// Disclaimer re-display, segmented tab switch (tc/medical). Active-tab state +
// tArray item lists + i18n keys + testIDs verbatim; markup → RN. The web role
// tablist segmented control → a Pressable segmented control (volt active half).
// The T&C live link → Linking.openURL.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { FileText, AlertTriangle } from 'lucide-react-native';
import { t, tArray } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, accent, surface } from '../../../lib/tokens';

type ActiveDoc = 'tc' | 'medical';

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={{ color: dark.brick }}>{'•'}</Text>
          <Text style={{ flex: 1, fontSize: 14, color: dark.ink2, lineHeight: 21 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export default function SettingsTerms() {
  const [active, setActive] = useState<ActiveDoc>('tc');

  const tcItems = tArray('settings.terms.tcItems');
  const medicalItems = tArray('settings.terms.medicalItems');

  const tab = (doc: ActiveDoc, testID: string, Icon: typeof FileText, label: string) => {
    const on = active === doc;
    return (
      <Pressable
        testID={testID}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        onPress={() => setActive(doc)}
        style={{
          flex: 1,
          minHeight: 40,
          borderRadius: 11,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: on ? accent.volt : 'transparent',
        }}
      >
        <Icon size={16} color={on ? dark.onAccent : dark.ink2} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: on ? dark.onAccent : dark.ink2 }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View testID="settings-terms" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.terms.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-terms-back"
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
            borderRadius: 14,
            padding: 4,
            borderWidth: 1,
            borderColor: dark.line,
            backgroundColor: surface.s2,
          }}
        >
          {tab('tc', 'terms-tab-tc', FileText, t('settings.terms.tabTerms'))}
          {tab('medical', 'terms-tab-medical', AlertTriangle, t('settings.terms.tabMedical'))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        {active === 'tc' ? (
          <Card style={{ padding: 18 }}>
            <View testID="terms-tc-content">
              <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
                {t('settings.terms.tcHeading')}
              </Text>
              <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.terms.tcIntro')}</Text>
              <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.terms.tcAcceptIntro')}</Text>
              <BulletList items={tcItems} />
              <Text style={{ fontSize: 12, color: dark.ink3, marginTop: 16 }}>
                {t('settings.terms.tcVersion')}{' '}
                <Text
                  testID="terms-tc-live-link"
                  onPress={() => { void Linking.openURL('https://andura.app/terms'); }}
                  style={{ color: dark.brick, textDecorationLine: 'underline' }}
                >
                  {t('settings.terms.tcLiveLinkLabel')}
                </Text>
                .
              </Text>
            </View>
          </Card>
        ) : (
          <Card style={{ padding: 18 }}>
            <View testID="terms-medical-content">
              <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
                {t('settings.terms.medicalScreenHeading')}
              </Text>
              <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.terms.medicalIntro')}</Text>
              <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.terms.medicalConsultIntro')}</Text>
              <BulletList items={medicalItems} />
              <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.terms.medicalListenBody')}</Text>
              <Text style={{ fontSize: 12, color: dark.ink3, marginTop: 16 }}>{t('settings.terms.medicalAccepted')}</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
