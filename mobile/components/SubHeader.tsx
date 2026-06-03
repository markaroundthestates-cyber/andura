// ══ SUB HEADER (RN port) — Shared Sticky Back+Title ════════════════════════
// RN twin of src/react/components/SubHeader.tsx. Same props contract (title /
// onBack / testIdBack / danger / rightAction), same back-arrow + h1 pattern.
// `aria-label="Inapoi"` → accessibilityLabel via t('common.back'); RO
// no-diacritics preserved by the i18n bundle. Sticky positioning is handled by
// the screen layout on native (header sits at the top of the screen view).

import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { t } from '../../src/i18n/index.js';

interface SubHeaderProps {
  title: string;
  onBack: () => void;
  testIdBack: string;
  danger?: boolean;
  rightAction?: ReactNode;
}

export function SubHeader({
  title,
  onBack,
  testIdBack,
  danger = false,
  rightAction,
}: SubHeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center border-b border-line bg-paper"
      style={{ gap: 12, padding: 16, backgroundColor: colors.paper, borderBottomColor: colors.line }}
    >
      <Pressable
        testID={testIdBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={onBack}
        style={{ padding: 8, marginLeft: -8 }}
      >
        <ArrowLeft size={20} color={colors.ink} />
      </Pressable>
      <Text
        className="text-xl font-bold"
        style={{ color: danger ? colors.brick : colors.ink }}
      >
        {title}
      </Text>
      {rightAction !== undefined && (
        <View style={{ marginLeft: 'auto' }}>{rightAction}</View>
      )}
    </View>
  );
}
