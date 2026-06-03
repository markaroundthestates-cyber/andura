// ══ PAIN BUTTON (RN port, route '/app/antrenor/pain-button') ══════════════
// RN twin of src/react/routes/screens/antrenor/PainButton.tsx. Pain region
// selector + intensity (1/2/3) with the CDL append-only persistence the
// Recovery Engine reads next session (DB('pain-cdl'), §43-H2) AND the live
// session context hand-off. ALL store/engine logic kept 1:1: persistPainCdl
// (soft-fail I/O, newest-first, rolling cap), the in-session vs pre-session
// branch (mid-session pain → setSessionContext('minus' + painContext) → back to
// /workout; pre-session → workout-preview), the reassurance toast. haptic/
// edgeFlash come from the shared web motion module — both are guarded no-ops on
// native today (W-Final swaps in expo-haptics). Web read location.state.from →
// RN reads the `from` param. painContext / intensityMod forwarded to
// workout-preview as params (painContext JSON-encoded — WorkoutPreview parses
// it). testIDs kept (pain-button / -back / pain-continue / pain-exit /
// pain-medical-cue + data-region/-intensity → per-option testID).

import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PressScale } from '../../../components/Press';
import { toast } from '../../../../src/react/lib/toast';
import { DB } from '../../../../src/db.js';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { edgeFlash } from '../../../../src/react/lib/motion';
import { haptic } from '../../../lib/motion';
import { accent, dark, radius, surface } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type BodyRegion =
  | 'gat'
  | 'umar-stang'
  | 'umar-drept'
  | 'spate'
  | 'lombar'
  | 'piept'
  | 'cot-stang'
  | 'cot-drept'
  | 'incheietura-stanga'
  | 'incheietura-dreapta'
  | 'sold'
  | 'genunchi-stang'
  | 'genunchi-drept'
  | 'glezna-stanga'
  | 'glezna-dreapta';

export type PainIntensity = 1 | 2 | 3;

const REGION_IDS: readonly BodyRegion[] = [
  'gat',
  'umar-stang',
  'umar-drept',
  'piept',
  'spate',
  'lombar',
  'cot-stang',
  'cot-drept',
  'incheietura-stanga',
  'incheietura-dreapta',
  'sold',
  'genunchi-stang',
  'genunchi-drept',
  'glezna-stanga',
  'glezna-dreapta',
];

function intensityLabel(level: PainIntensity): string {
  return t(`painButton.intensityLabels.${level}`);
}

// ── Pain CDL append-only persistence (ADR §9 §43-H2) ───────────────────────
export const PAIN_CDL_KEY = 'pain-cdl';
export const PAIN_CDL_MAX = 90;

export interface PainCdlEntry {
  type: 'pain';
  region: BodyRegion;
  intensity: PainIntensity;
  ts: number;
}

/** Append a pain report to the append-only CDL store (newest-first). Soft-fails
 *  at the I/O boundary preserving the zero-throw render contract. */
export function persistPainCdl(region: BodyRegion, intensity: PainIntensity): void {
  try {
    const entry: PainCdlEntry = { type: 'pain', region, intensity, ts: Date.now() };
    const existing = DB.get<PainCdlEntry[]>(PAIN_CDL_KEY) ?? [];
    DB.set(PAIN_CDL_KEY, [entry, ...existing].slice(0, PAIN_CDL_MAX));
  } catch {
    // Soft-fail — recovery path tolerates missing pain CDL. Never block the
    // safety-toast + navigation render path.
  }
}

export default function PainButton(): React.JSX.Element {
  const params = useLocalSearchParams<{ from?: string }>();
  const setSessionContext = useWorkoutStore((s) => s.setSessionContext);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [intensity, setIntensity] = useState<PainIntensity>(1);

  // A live session has sessionStart populated; `from:'workout'` is a defensive
  // secondary signal. Pain reported MID-session goes straight back to the active
  // Workout (skipping preview re-confirmation); pre-session entry keeps the
  // historical preview route so the user sees the adapted session.
  const inSession = sessionStart !== null || params.from === 'workout';

  function handleContinue(): void {
    if (!region) return;
    // §43-H2: persist pain to append-only CDL so the Recovery Engine adapts
    // future sessions (not just this one via the in-session context).
    persistPainCdl(region, intensity);
    // Tactile + visual confirmation. Both helpers are guarded no-ops on native
    // today (W-Final: expo-haptics).
    haptic(10);
    edgeFlash('var(--brick)');
    toast.show({
      message: t('painButton.reassureToast'),
      variant: 'success',
    });
    if (inSession) {
      // In-session adapt: persist pain context on the store + return to workout
      // (no preview round-trip). Workout applies the 'minus' intensity to the
      // remaining sets via the engineIntensityMod override.
      setSessionContext({
        intensityMod: 'minus',
        painContext: { region, intensity },
      });
      router.push(gotoPath('workout') as never);
      return;
    }
    router.push({
      pathname: gotoPath('workout-preview'),
      params: {
        painContext: JSON.stringify({ region, intensity }),
        intensityMod: 'minus',
      },
    } as never);
  }

  function handleExit(): void {
    router.push(gotoPath('antrenor') as never);
  }

  function handleBack(): void {
    router.back();
  }

  const continueDisabled = region === null;

  return (
    <View testID="pain-button" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('painButton.subHeaderTitle')} onBack={handleBack} testIdBack="pain-button-back" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
          {t('painButton.heading')}
        </Text>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('painButton.subtitle')}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {REGION_IDS.map((id) => {
            const selected = region === id;
            return (
              <PressScale
                key={id}
                testID={`pain-region-${id}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setRegion(id)}
                style={{
                  width: '47%',
                  padding: 12,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  backgroundColor: selected ? accent.ember : surface.base,
                  borderColor: selected ? accent.ember : dark.line,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: selected ? dark.onAccent : dark.ink }}>
                  {t(`painButton.regions.${id}`)}
                </Text>
              </PressScale>
            );
          })}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, color: dark.ink, marginBottom: 12 }}>{t('painButton.intensityPrompt')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {([1, 2, 3] as const).map((lvl) => {
              const selected = intensity === lvl;
              return (
                <PressScale
                  key={lvl}
                  testID={`pain-intensity-${lvl}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setIntensity(lvl)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    alignItems: 'center',
                    backgroundColor: selected ? accent.ember : surface.base,
                    borderColor: selected ? accent.ember : dark.line,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: selected ? dark.onAccent : dark.ink }}>
                    {intensityLabel(lvl)}
                  </Text>
                </PressScale>
              );
            })}
          </View>
        </View>

        <PressScale
          testID="pain-continue"
          accessibilityRole="button"
          accessibilityState={{ disabled: continueDisabled }}
          disabled={continueDisabled}
          onPress={handleContinue}
          style={{
            paddingVertical: 16,
            backgroundColor: accent.volt,
            borderRadius: 14,
            opacity: continueDisabled ? 0.5 : 1,
          }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
            {t('painButton.continueCta')}
          </Text>
        </PressScale>
        <PressScale testID="pain-exit" accessibilityRole="button" onPress={handleExit} style={{ paddingVertical: 12, marginTop: 12 }}>
          <Text style={{ textAlign: 'center', fontSize: 14, color: dark.ink2 }}>{t('painButton.exitCta')}</Text>
        </PressScale>

        {/* Closing safety cue — informative, NU paternalistic (D-LEGACY-061). */}
        <Text
          testID="pain-medical-cue"
          className="font-serif"
          style={{ marginTop: 24, fontSize: 14, fontStyle: 'italic', lineHeight: 22, color: dark.ink3 }}
        >
          {t('painButton.medicalCue')}
        </Text>
      </ScrollView>
    </View>
  );
}
