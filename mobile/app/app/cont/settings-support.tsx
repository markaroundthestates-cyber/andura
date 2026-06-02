// ══ SETTINGS SUPPORT (RN port, W6b) ══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsSupport.tsx. Static contact
// info + mailto (Pre-Beta: feedback via email direct). i18n keys + testIDs +
// SUPPORT_EMAIL verbatim. The web mailto <a> → Linking.openURL('mailto:...').

import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, MessageSquare, ChevronRight } from 'lucide-react-native';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';

const SUPPORT_EMAIL = 'support@andura.app';

export default function SettingsSupport() {
  return (
    <View testID="settings-support" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.support.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-support-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 16 }}>
          {t('settings.support.intro')}
        </Text>

        <View style={{ marginBottom: 8 }}>
          <Kicker color={dark.ink3}>{t('settings.support.contactHeading')}</Kicker>
        </View>
        <Card style={{ marginBottom: 16 }}>
          <Pressable
            testID="support-email"
            accessibilityRole="link"
            onPress={() => { void Linking.openURL(`mailto:${SUPPORT_EMAIL}`); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: dark.line }}
          >
            <Mail size={20} color={dark.ink} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t('settings.support.emailLabel')}</Text>
              <Text numberOfLines={1} style={{ fontSize: 12, color: dark.ink2 }}>{SUPPORT_EMAIL}</Text>
            </View>
            <ChevronRight size={20} color={dark.ink2} strokeWidth={1.6} />
          </Pressable>
          <View testID="support-whatsapp" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
            <MessageSquare size={20} color={dark.ink2} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t('settings.support.whatsappLabel')}</Text>
              <Text style={{ fontSize: 12, color: dark.ink2 }}>{t('settings.support.whatsappHours')}</Text>
            </View>
            <Text style={{ fontSize: 12, fontStyle: 'italic', color: dark.ink3 }}>{t('settings.support.postBetaLabel')}</Text>
          </View>
        </Card>

        <View style={{ marginBottom: 8 }}>
          <Kicker color={dark.ink3}>{t('settings.support.messageHeading')}</Kicker>
        </View>
        <Card style={{ padding: 16 }}>
          <Text style={{ fontSize: 12, color: dark.ink2, lineHeight: 18, marginBottom: 12 }}>
            {t('settings.support.messageHint')}
          </Text>
          <Pressable
            testID="support-feedback-mailto"
            accessibilityRole="link"
            onPress={() => { void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Andura%20feedback&body=`); }}
            style={{ borderRadius: 999, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={[accent.volt, accent.aqua]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('settings.support.openEmailCta')}</Text>
            </LinearGradient>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}
