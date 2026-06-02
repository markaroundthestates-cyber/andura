// ══ SPLASH (route '/') — top-level, no bottom nav (web router.tsx L151) ════
// Wave 2 keeps the Wave 0 ENGINE PROOF alive here: the framework-agnostic
// engine (src/engine/**) is imported + run unchanged inside the RN bundle, and
// the result is shown. This both de-risks the port (D103 thesis) and gives the
// splash a real reason to exist until the ported Splash screen lands. Buttons
// route into the rest of the shell via the gotoPath shim (lib/nav.ts).

import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goto } from '../lib/nav';
import { frequencyToSplit } from '../../src/engine/schedule/scheduleAdapter.js';

export default function Splash() {
  const [split, setSplit] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSplit(frequencyToSplit(4, 'v-taper'));
    } catch (e: unknown) {
      setError(String((e as Error)?.message ?? e));
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-paper" testID="screen-splash">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text className="font-display text-3xl font-bold text-brick">Andura</Text>
        <Text className="font-body text-ink2">
          Nav shell RN — Wave 2. Engine ruleaza neschimbat (proof Wave 0):
        </Text>
        {error ? (
          <Text style={{ color: '#ff8a6e' }}>EROARE: {error}</Text>
        ) : (
          <Text className="font-mono text-ink">
            frequencyToSplit(4, v-taper): {split ? JSON.stringify(split) : '...'}
          </Text>
        )}

        <View style={{ gap: 10, marginTop: 16 }}>
          <NavBtn label="Auth" onPress={() => goto('auth')} testID="splash-go-auth" />
          <NavBtn label="Onboarding" onPress={() => goto('onb-1')} testID="splash-go-onb" />
          <NavBtn label="App (Antrenor)" onPress={() => goto('antrenor')} testID="splash-go-app" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavBtn({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      className="rounded border border-line bg-paper-2"
      style={{ padding: 14 }}
    >
      <Text className="font-display text-base font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}
