// ══ COACH REST CARD (RN port) — Rest Day Mode ═════════════════════════════
// RN twin of src/react/components/Antrenor/CoachRestCard.tsx. Rendered on a
// rest day. composeCoachLine is the SAME pure logic (generic non-claim fallback
// at T0 fresh per MED-FIX chat5). Same testID (coach-rest-duration) + i18n keys
// + accessibilityLabel (coachRest.ariaLabel). The .pulse-card-glow corner wash
// is dropped (FIDELITY FLAG — decorative).

import { View, Text, Pressable } from 'react-native';
import type { CoachRestReason } from '../../../src/react/lib/engineWrappers';
import { PulseCard } from '../pulse/PulseCard';
import { dark, status } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  onLightSession: () => void;
  onOverride: () => void;
  restReason?: CoachRestReason | null;
  durationMinutes?: number;
}

function composeCoachLine(restReason: CoachRestReason | null | undefined): string {
  if (!restReason) {
    return t('coachRest.genericLine');
  }
  const { fatiguedGroups, readinessScore } = restReason;
  const groupsPart =
    fatiguedGroups.length === 0
      ? t('coachRest.musclesRecovering')
      : t('coachRest.groupsRecovering', { groups: fatiguedGroups.join(t('coachRest.andJoiner')) });
  const readinessPart =
    readinessScore === null
      ? ''
      : t('coachRest.readinessSuffix', { score: readinessScore });
  return `${groupsPart}${readinessPart}.`;
}

export function CoachRestCard({
  onLightSession,
  onOverride,
  restReason,
  durationMinutes = 15,
}: Props): React.JSX.Element {
  const coachLine = composeCoachLine(restReason ?? null);
  return (
    <PulseCard
      style={{ padding: 18, marginBottom: 10 }}
      accessibilityLabel={t('coachRest.ariaLabel')}
    >
      <Text
        className="font-mono uppercase"
        style={{ fontSize: 12, fontWeight: '600', letterSpacing: 1, color: status.neutralText }}
      >
        {t('coachRest.kicker')}
      </Text>
      <Text className="font-display" style={{ fontSize: 20, fontWeight: '700', marginTop: 4, color: dark.ink }}>
        {t('coachRest.title')}
      </Text>
      <Text className="font-serif" style={{ fontStyle: 'italic', marginTop: 6, lineHeight: 21, fontSize: 14, color: dark.ink2 }}>
        {`“${coachLine}”`}
      </Text>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
        <Text testID="coach-rest-duration" style={{ fontSize: 14, color: dark.ink2 }}>
          {t('coachRest.durationLabel', { min: durationMinutes })}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('coachRest.optional')}</Text>
      </View>
      <Pressable
        onPress={onLightSession}
        style={{
          marginTop: 14,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: 999,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>
          {t('coachRest.lightSessionCta')}
        </Text>
      </Pressable>
      <Pressable onPress={onOverride} style={{ marginTop: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: dark.ink2, textDecorationLine: 'underline' }}>
          {t('coachRest.overrideCta')}
        </Text>
      </Pressable>
    </PulseCard>
  );
}
