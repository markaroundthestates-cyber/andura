// ══ EXERCISE MEDIA (RN port) — visual guidance tile ═══════════════════════
// RN twin of src/react/components/ExerciseMedia.tsx. Renders a movement image
// or — when no asset is sourced (the V1 state: the shared exerciseMedia lib
// ships an EMPTY map, Daniel-gated V2) — a tasteful muscle-group placeholder.
// Reuses the SHARED, pure lib src/react/lib/exerciseMedia.ts (getExerciseMedia
// / getExerciseMediaAlt) so the lookup stays single-source. Same props
// (engineName / variant / className→ignored / testId), same testIDs
// (exercise-media / exercise-media-placeholder), same variants + sizes, same
// role="img" + alt → accessibilityLabel.
//
// NOTE: `video` media → expo-av is not installed (no video assets in V1); the
// component renders the still <Image> path for any non-placeholder media. When
// V2 sources GIF/video, wire expo-av/expo-image here (the lib API is stable).

import { View, Text, Image } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { getExerciseMedia, getExerciseMediaAlt } from '../../src/react/lib/exerciseMedia';
import { dark, withAlpha } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

export type ExerciseMediaVariant = 'thumbnail' | 'compact' | 'card';

interface ExerciseMediaProps {
  engineName: string;
  variant?: ExerciseMediaVariant;
  className?: string;
  testId?: string;
}

const VARIANT_STYLE: Readonly<Record<ExerciseMediaVariant, object>> = {
  thumbnail: { width: 48, height: 48, borderRadius: 999 },
  compact: { width: 64, height: 64, borderRadius: 12 },
  card: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16 },
};

const ICON_SIZE: Readonly<Record<ExerciseMediaVariant, number>> = {
  thumbnail: 20,
  compact: 24,
  card: 48,
};

export function ExerciseMedia({
  engineName,
  variant = 'thumbnail',
  testId = 'exercise-media',
}: ExerciseMediaProps) {
  const media = getExerciseMedia(engineName);
  const alt = getExerciseMediaAlt(engineName);
  const sizeStyle = VARIANT_STYLE[variant];
  const isCard = variant === 'card';

  if (!media) {
    return (
      <View
        testID={`${testId}-placeholder`}
        accessibilityRole="image"
        accessibilityLabel={alt}
        className="bg-paper-2 border border-line"
        style={[
          { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
          sizeStyle,
        ]}
      >
        <Dumbbell size={ICON_SIZE[variant]} color={dark.ink3} />
        {isCard && (
          <Text
            className="font-mono uppercase"
            style={{
              marginTop: 10,
              fontSize: 9,
              letterSpacing: 0.9,
              fontWeight: '500',
              color: dark.brick,
              backgroundColor: withAlpha(dark.brick, 0.12),
              borderWidth: 1,
              borderColor: withAlpha(dark.brick, 0.32),
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            {t('common.imageSoon')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      testID={testId}
      accessibilityLabel={alt}
      source={{ uri: media.url }}
      resizeMode="cover"
      style={sizeStyle}
    />
  );
}
