// ══ SETTINGS SUBSCRIPTION (RN port, W6b) ═════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsSubscription.tsx. Beta-free
// info display + "notify me" placeholder (ZERO upgrade flow live pre-Beta).
// Local `notified` toggle state + i18n keys + testIDs verbatim; markup → RN.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Sparkles, Gift } from 'lucide-react-native';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, status } from '../../../lib/tokens';

export default function SettingsSubscription() {
  const [notified, setNotified] = useState(false);

  return (
    <View testID="settings-subscription" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.subscription.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-subscription-back"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            backgroundColor: status.infoBg,
          }}
        >
          <Sparkles size={36} color={dark.brick} />
        </View>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 8, textAlign: 'center' }}>
          {t('settings.subscription.comingSoonTitle')}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 24, textAlign: 'center', maxWidth: 320 }}>
          {t('settings.subscription.comingSoonBody')}
        </Text>

        <Card style={{ width: '100%', padding: 16, marginBottom: 20 }}>
          <View testID="subscription-beta-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Gift size={20} color={dark.brick} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: dark.ink }}>{t('settings.subscription.freeBetaTitle')}</Text>
              <Text style={{ fontSize: 12, color: dark.ink2 }}>{t('settings.subscription.freeBetaSubtitle')}</Text>
            </View>
          </View>
        </Card>

        <Pressable
          testID="subscription-notify-cta"
          accessibilityRole="button"
          disabled={notified}
          onPress={() => setNotified(true)}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: notified ? dark.ink3 : dark.aquaInk,
              textDecorationLine: notified ? 'none' : 'underline',
            }}
          >
            {notified ? t('settings.subscription.notifiedCta') : t('settings.subscription.notifyCta')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
