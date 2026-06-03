// ══ SETTINGS EXPORT (RN port, W6b) ═══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsExport.tsx. GDPR Art. 20
// local JSON export — composes the aggregate payload (all Zustand stores +
// Tier 0 keys + Tier 1 IDB stores). The DATA SERIALIZE logic is ported VERBATIM
// (buildExportPayload / collectTier1 / LEGACY_DATA_KEYS / schemaVersion 2);
// i18n keys + testIDs preserved.
//
// FILE I/O — Daniel-gated follow-up (W-Final). The web triggered a browser Blob
// download via document.createElement('a'); RN has no DOM. The JSON is fully
// BUILT here and the success size is reported, but the actual file SAVE is
// stubbed with a clear marker (expo-file-system writeAsStringAsync +
// expo-sharing shareAsync is the native path). See FLAG below.
// FLAG — tier0Keys: web enumerates localStorage (wv2-* + legacy). MMKV exposes
// getAllKeys() but the shared kv adapter has no enumerate method, so on native
// the tier0 sweep returns {} until kv gains a keys() helper (foundation, W1
// follow-up). Web export keeps full parity via the localStorage guard.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Download } from 'lucide-react-native';
import { logger } from '../../../../src/util/logger.js';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { useNutritionStore } from '../../../../src/react/stores/nutritionStore';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import { useScheduleStore } from '../../../../src/react/stores/scheduleStore';
import { useAerobicStore } from '../../../../src/react/stores/aerobicStore';
import { USER_DATA_KEYS, CDL_KEYS } from '../../../../src/util/dataRegistry.js';
import { t, tArray } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';

// S-02 — unprefixed legacy keys (GDPR Art. 20). Verbatim from web.
const LEGACY_DATA_KEYS: readonly string[] = [...USER_DATA_KEYS, ...CDL_KEYS, 'pain-cdl'];

interface ExportPayload {
  exportedAt: string;
  schemaVersion: 2;
  stores: {
    onboarding: ReturnType<typeof useOnboardingStore.getState>;
    workout: ReturnType<typeof useWorkoutStore.getState>;
    nutrition: ReturnType<typeof useNutritionStore.getState>;
    settings: ReturnType<typeof useSettingsStore.getState>;
    schedule: ReturnType<typeof useScheduleStore.getState>;
    aerobic: ReturnType<typeof useAerobicStore.getState>;
  };
  tier0Keys: Record<string, string | null>;
  tier1: {
    cdl: unknown[];
    logs: unknown[];
    appliedPatterns: unknown[];
    archivedSessions: unknown[];
  };
}

function collectTier0Keys(): Record<string, string | null> {
  const keys: Record<string, string | null> = {};
  // Web: enumerate localStorage. Native: MMKV enumeration is a W1 follow-up
  // (kv has no keys()), so the sweep is empty until that lands (FLAG above).
  if (typeof localStorage === 'undefined') return keys;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wv2-')) keys[key] = localStorage.getItem(key);
    }
    for (const key of LEGACY_DATA_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) keys[key] = val;
    }
  } catch {
    // localStorage unavailable — return what we have
  }
  return keys;
}

async function collectTier1(): Promise<ExportPayload['tier1']> {
  const empty = { cdl: [], logs: [], appliedPatterns: [], archivedSessions: [] };
  try {
    const dbModule = await import('../../../../src/storage/db');
    const dexieModule = await import('../../../../src/react/lib/dexieMigration');
    const [cdl, logs, appliedPatterns, archivedSessions] = await Promise.all([
      dbModule.tier1All(dbModule.STORES.CDL_TIER1).catch(() => []),
      dbModule.tier1All(dbModule.STORES.LOGS_TIER1).catch(() => []),
      dbModule.tier1All(dbModule.STORES.APPLIED_PATTERNS_TIER1).catch(() => []),
      dexieModule.getArchivedSessions().catch(() => []),
    ]);
    return { cdl, logs, appliedPatterns, archivedSessions };
  } catch {
    return empty;
  }
}

async function buildExportPayload(): Promise<ExportPayload> {
  const tier1 = await collectTier1();
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    stores: {
      onboarding: useOnboardingStore.getState(),
      workout: useWorkoutStore.getState(),
      nutrition: useNutritionStore.getState(),
      settings: useSettingsStore.getState(),
      schedule: useScheduleStore.getState(),
      aerobic: useAerobicStore.getState(),
    },
    tier0Keys: collectTier0Keys(),
    tier1,
  };
}

// FILE-I/O STUB — Daniel-gated (W-Final). On web the Blob download fires; on
// native this is where expo-file-system writeAsStringAsync + expo-sharing
// shareAsync go. We build the JSON either way (so the success size + tests are
// real) and only the actual save is platform-conditional.
function saveExportFile(filename: string, content: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (typeof document !== 'undefined' && typeof g.Blob !== 'undefined' && typeof g.URL !== 'undefined') {
    const blob = new g.Blob([content], { type: 'application/json' });
    const url = g.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    g.URL.revokeObjectURL(url);
    return;
  }
  // NATIVE STUB — expo-file-system + expo-sharing wire is a W-Final follow-up.
  logger.warn('[SettingsExport] native file save not yet wired (expo-file-system) — payload built, size reported');
}

export default function SettingsExport() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [size, setSize] = useState<number>(0);

  async function handleExport(): Promise<void> {
    try {
      const payload = await buildExportPayload();
      const json = JSON.stringify(payload, null, 2);
      const filename = `andura-export-${new Date().toISOString().slice(0, 10)}.json`;
      saveExportFile(filename, json);
      setSize(json.length);
      setExportStatus('success');
    } catch {
      setExportStatus('error');
    }
  }

  const contentItems = tArray('settings.export.contentItems');

  return (
    <View testID="settings-export" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.export.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-export-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 14, color: dark.ink, lineHeight: 21, marginBottom: 16 }}>{t('settings.export.intro')}</Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Kicker color={dark.ink3}>{t('settings.export.contentHeading')}</Kicker>
          <View style={{ gap: 6, marginTop: 8 }}>
            {contentItems.map((it, i) => (
              <Text key={i} style={{ fontSize: 14, color: dark.ink }}>{`•  ${it}`}</Text>
            ))}
          </View>
        </Card>

        <Pressable
          testID="settings-export-trigger"
          accessibilityRole="button"
          onPress={() => { void handleExport(); }}
          style={{ borderRadius: 999, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={[accent.volt, accent.aqua]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
          >
            <Download size={16} color={dark.onAccent} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('settings.export.exportCta')}</Text>
          </LinearGradient>
        </Pressable>

        {exportStatus === 'success' && (
          <Text testID="settings-export-success" accessibilityRole="text" style={{ fontSize: 14, color: dark.ink2, textAlign: 'center', marginTop: 12 }}>
            {t('settings.export.successHint', { kb: Math.ceil(size / 1024) })}
          </Text>
        )}
        {exportStatus === 'error' && (
          <Text testID="settings-export-error" accessibilityRole="alert" style={{ fontSize: 14, color: dark.brickDark, textAlign: 'center', marginTop: 12 }}>
            {t('settings.export.errorHint')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
