// ══ TDEE STRIP (RN W3a STUB — replaced by W4 Progres) ═════════════════════
// AerobicCoach (W3a, this wave) imports the shared TDEEStrip nutrition panel,
// but the real TDEEStrip lives in the Progres tab and is ported by W4 (it pulls
// the full bayesian-nutrition aggregate + inline kcal editor). To keep the
// aerobic Coach dashboard renderable on W3a WITHOUT cross-wave coupling, this is
// a minimal placeholder that preserves the `tdee-strip` testID contract.
//
// W4 OWNER: replace this file with the full RN port of
// src/react/components/Progres/TDEEStrip.tsx. The import path
// (mobile/components/Progres/TDEEStrip) is the single consumer edge.

import { View, Text } from 'react-native';
import { PulseCard } from '../pulse/PulseCard';
import { dark } from '../../lib/tokens';

export function TDEEStrip(): React.JSX.Element {
  return (
    <PulseCard testID="tdee-strip" style={{ padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: dark.ink3 }}>TDEEStrip</Text>
    </PulseCard>
  );
}
