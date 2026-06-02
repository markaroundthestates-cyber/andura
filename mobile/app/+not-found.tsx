// ══ NOT FOUND — catch-all 404 (web router.tsx '*' → NotFound.tsx) ═════════
// RN twin of src/react/routes/screens/NotFound.tsx. expo-router renders this for
// any unmatched route. A home link avoids a dead-end. Same testIDs
// (not-found-page / not-found-home) + i18n keys as the web screen.

import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

export default function NotFound(): React.JSX.Element {
  return (
    <View
      testID="not-found-page"
      className="flex-1 items-center justify-center bg-paper"
      style={{ backgroundColor: dark.paper, padding: 24 }}
    >
      <View style={{ maxWidth: 384, alignItems: 'center' }}>
        <Text className="font-display font-bold text-ink" style={{ fontSize: 24, marginBottom: 8, textAlign: 'center' }}>
          {t('notFound.title')}
        </Text>
        <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
          {t('notFound.body')}
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          testID="not-found-home"
        >
          <Text className="text-brick" style={{ fontSize: 14, textDecorationLine: 'underline' }}>
            {t('notFound.homeCta')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
