// 404 catch-all (web router.tsx L243 '*'). expo-router renders this for any
// unmatched route. A link home avoids a dead-end (mirrors the web NotFound).
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { dark } from '../lib/tokens';

export default function NotFound() {
  return (
    <View testID="screen-not-found" className="flex-1 items-center justify-center bg-paper" style={{ padding: 24, gap: 12 }}>
      <Text className="font-display text-2xl font-bold text-ink">Pagina negasita</Text>
      <Link href="/" style={{ color: dark.brick }}>
        <Text className="font-display text-brick">Inapoi acasa</Text>
      </Link>
    </View>
  );
}
