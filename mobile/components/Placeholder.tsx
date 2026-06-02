// ══ SCREEN PLACEHOLDER (Wave 2) ════════════════════════════════════════════
// Wave 2 builds the NAV SKELETON only — real screen bodies are later waves. Each
// route renders this with its screen name + canonical route, so the tree is
// navigable + visually labelled while the actual content is ported. Styled with
// Pulse tokens so the shell already reads on-brand. testID exposes the screen for
// nav-shell assertions.

import { View, Text } from 'react-native';
import { dark } from '../lib/tokens';

export function Placeholder({ name, route }: { name: string; route: string }) {
  return (
    <View
      testID={`screen-${route}`}
      className="flex-1 items-center justify-center bg-paper"
      style={{ padding: 24, gap: 8 }}
    >
      <Text className="font-display text-2xl font-bold text-brick">{name}</Text>
      <Text className="font-mono text-ink2" style={{ fontSize: 12, color: dark.ink2 }}>
        {route}
      </Text>
    </View>
  );
}
