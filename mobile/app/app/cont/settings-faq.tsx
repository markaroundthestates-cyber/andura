// ══ SETTINGS FAQ (RN port, W6b) ══════════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsFaq.tsx. Static FAQ sections
// with chevron accordion expand. The FAQ const + sectionId/qKey/aKey structure +
// openId toggle logic + i18n keys + testIDs verbatim; markup → RN. Footer "ask
// support" link → goto('settings-support').

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { HelpCircle, ChevronRight, ChevronDown } from 'lucide-react-native';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

interface FaqItem {
  qKey: string;
  aKey: string;
}

interface FaqSection {
  titleKey: string;
  sectionId: string;
  items: FaqItem[];
}

const FAQ: ReadonlyArray<FaqSection> = [
  {
    sectionId: 'training',
    titleKey: 'settings.faq.sections.training',
    items: [
      { qKey: 'settings.faq.items.trainingChangeProgram', aKey: 'settings.faq.items.trainingChangeProgramA' },
      { qKey: 'settings.faq.items.trainingSkipSession', aKey: 'settings.faq.items.trainingSkipSessionA' },
      { qKey: 'settings.faq.items.trainingProgress', aKey: 'settings.faq.items.trainingProgressA' },
    ],
  },
  {
    sectionId: 'account',
    titleKey: 'settings.faq.sections.account',
    items: [
      { qKey: 'settings.faq.items.accountPassword', aKey: 'settings.faq.items.accountPasswordA' },
      { qKey: 'settings.faq.items.accountMultiPhone', aKey: 'settings.faq.items.accountMultiPhoneA' },
      { qKey: 'settings.faq.items.accountDataLocation', aKey: 'settings.faq.items.accountDataLocationA' },
    ],
  },
  {
    sectionId: 'notifications',
    titleKey: 'settings.faq.sections.notifications',
    items: [
      { qKey: 'settings.faq.items.notificationsMissing', aKey: 'settings.faq.items.notificationsMissingA' },
    ],
  },
];

export default function SettingsFaq() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string): void {
    setOpenId((curr) => (curr === id ? null : id));
  }

  return (
    <View testID="settings-faq" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.faq.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-faq-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 16 }}>
          {t('settings.faq.header')}
        </Text>

        {FAQ.map((section) => (
          <View key={section.sectionId} style={{ marginBottom: 16 }}>
            <View style={{ marginBottom: 8 }}>
              <Kicker color={dark.ink3}>{t(section.titleKey)}</Kicker>
            </View>
            <Card>
              {section.items.map((item, idx) => {
                const id = `${section.sectionId}-${idx}`;
                const open = openId === id;
                const isLast = idx === section.items.length - 1;
                return (
                  <View key={id} style={isLast ? undefined : { borderBottomWidth: 1, borderBottomColor: dark.line }}>
                    <Pressable
                      testID={`faq-q-${id}`}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: open }}
                      onPress={() => toggle(id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
                    >
                      <HelpCircle size={20} color={dark.ink} />
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: dark.ink }}>{t(item.qKey)}</Text>
                      {open ? (
                        <ChevronDown size={20} color={dark.ink2} strokeWidth={1.6} />
                      ) : (
                        <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
                      )}
                    </Pressable>
                    {open && (
                      <View style={{ paddingHorizontal: 16, paddingBottom: 12, marginTop: -4 }}>
                        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21 }}>{t(item.aKey)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>
        ))}

        <Text style={{ fontSize: 12, color: dark.ink3, textAlign: 'center', marginTop: 24, lineHeight: 18 }}>
          {t('settings.faq.footerHint')}{' '}
          <Text
            onPress={() => goto('settings-support')}
            style={{ color: dark.brick, fontWeight: '500', textDecorationLine: 'underline' }}
          >
            {t('settings.faq.footerCtaLabel')}
          </Text>
          .
        </Text>
      </ScrollView>
    </View>
  );
}
