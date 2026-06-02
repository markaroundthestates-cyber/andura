// ══ SETTINGS IMPORT (RN port, W6b) ═══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsImport.tsx. Bootstrap weight
// + nutrition history from a generic CSV export (MyFitnessPal-style, never named).
// The PARSE + APPLY logic is ported VERBATIM: parseHistoryImportFiles(texts) →
// preview → applyHistoryImport(weightEntries, dailyEntries). i18n keys + testIDs
// + the idle/preview/done/error phase machine preserved.
//
// FILE I/O — Daniel-gated follow-up (W-Final). The web used <input type=file>
// multi-select + File.text(); RN has no DOM file input. The picker is stubbed
// with a clear marker (expo-document-picker getDocumentAsync + expo-file-system
// readAsStringAsync is the native path). `processFiles(texts)` is the seam the
// real picker feeds once wired — the parse/preview/apply chain is fully real.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload } from 'lucide-react-native';
import { logger } from '../../../../src/util/logger.js';
import {
  parseHistoryImportFiles,
  type ParseResult,
} from '../../../../src/react/lib/historyImportParser';
import { applyHistoryImport } from '../../../../src/react/lib/historyImportStore';
import { t, tArray } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Kicker } from '../../../components/pulse/Kicker';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';

type Phase = 'idle' | 'preview' | 'done' | 'error';

export default function SettingsImport() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<ParseResult | null>(null);

  // PARSE seam — the real picker feeds CSV file texts here (web read them via
  // File.text(); native will via expo-file-system readAsStringAsync). Verbatim
  // parse + preview-vs-error branching from web handleFiles.
  function processFiles(texts: string[]): void {
    if (texts.length === 0) return;
    try {
      const result = parseHistoryImportFiles(texts);
      if (result.weightEntries.length === 0 && result.dailyEntries.length === 0) {
        setPreview(result);
        setPhase('error');
        return;
      }
      setPreview(result);
      setPhase('preview');
    } catch {
      setPreview(null);
      setPhase('error');
    }
  }

  // FILE-PICK STUB — Daniel-gated (W-Final). expo-document-picker
  // getDocumentAsync({ multiple: true, type: 'text/csv' }) →
  // expo-file-system readAsStringAsync per uri → processFiles(texts).
  function handlePick(): void {
    logger.warn('[SettingsImport] native file picker not yet wired (expo-document-picker) — W-Final');
  }

  function handleConfirm(): void {
    if (preview == null) return;
    applyHistoryImport(preview.weightEntries, preview.dailyEntries);
    setPhase('done');
  }

  const whatItems = tArray('settings.import.whatItems');

  return (
    <View testID="settings-import" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.import.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-import-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 14, color: dark.ink, lineHeight: 21, marginBottom: 16 }}>{t('settings.import.intro')}</Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Kicker color={dark.ink3}>{t('settings.import.whatHeading')}</Kicker>
          <View style={{ gap: 6, marginTop: 8 }}>
            {whatItems.map((it, i) => (
              <Text key={i} style={{ fontSize: 14, color: dark.ink }}>{`•  ${it}`}</Text>
            ))}
          </View>
        </Card>

        {(phase === 'idle' || phase === 'error') && (
          <>
            <Pressable
              testID="settings-import-trigger"
              accessibilityRole="button"
              onPress={handlePick}
              style={{ borderRadius: 999, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={[accent.volt, accent.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
              >
                <Upload size={16} color={dark.onAccent} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('settings.import.importCta')}</Text>
              </LinearGradient>
            </Pressable>
            {phase === 'error' && (
              <Text testID="settings-import-error" accessibilityRole="alert" style={{ fontSize: 14, color: dark.brickDark, textAlign: 'center', marginTop: 12 }}>
                {t('settings.import.noDataError')}
              </Text>
            )}
          </>
        )}

        {phase === 'preview' && preview != null && (
          <View testID="settings-import-preview">
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <Text testID="settings-import-summary-weight" style={{ fontSize: 14, color: dark.ink, marginBottom: 4 }}>
                {t('settings.import.preview.weightDays', { n: preview.weightEntries.length })}
              </Text>
              <Text testID="settings-import-summary-nutrition" style={{ fontSize: 14, color: dark.ink, marginBottom: 4 }}>
                {t('settings.import.preview.nutritionDays', { n: preview.dailyEntries.length })}
              </Text>
              <Text testID="settings-import-summary-skipped" style={{ fontSize: 14, color: dark.ink2 }}>
                {t('settings.import.preview.skippedRows', { n: preview.skipped.length })}
              </Text>
            </Card>
            <Pressable
              testID="settings-import-confirm"
              accessibilityRole="button"
              onPress={handleConfirm}
              style={{ borderRadius: 999, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={[accent.volt, accent.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('settings.import.preview.confirmCta')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              testID="settings-import-cancel"
              accessibilityRole="button"
              onPress={() => { setPreview(null); setPhase('idle'); }}
              style={{ paddingVertical: 12, marginTop: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('settings.import.preview.cancelCta')}</Text>
            </Pressable>
          </View>
        )}

        {phase === 'done' && preview != null && (
          <View testID="settings-import-done" style={{ alignItems: 'center' }}>
            <Text accessibilityRole="text" style={{ fontSize: 14, color: dark.ink, textAlign: 'center' }}>
              {t('settings.import.doneMessage', {
                weightN: preview.weightEntries.length,
                nutritionN: preview.dailyEntries.length,
              })}
            </Text>
            <Pressable
              testID="settings-import-done-back"
              accessibilityRole="button"
              onPress={() => goto('cont')}
              style={{ borderRadius: 999, overflow: 'hidden', marginTop: 16, width: '100%' }}
            >
              <LinearGradient
                colors={[accent.volt, accent.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('settings.import.doneBackCta')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
