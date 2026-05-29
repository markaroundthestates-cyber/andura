// ══ SETTINGS EXPORT — Phase 6 task_16 Cont Sub-Screen ════════════════════
// Local JSON export user data complete. Compose aggregate din toate
// Zustand stores + localStorage Tier 0 keys (wv2-*). Browser download via
// Blob + anchor href trigger. ZERO server upload — local-first invariant.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { USER_DATA_KEYS, CDL_KEYS } from '../../../../util/dataRegistry.js';
import { t, tArray } from '../../../../i18n/index.js';

// S-02 audit fix (AUDIT-3 §S-02 HIGH, GDPR Art. 20) — unprefixed legacy keys
// written via src/db.js + engine wrappers are NOT wv2-* prefixed, so the
// wv2-only Tier 0 collection silently omitted them. Canonical user-data set
// (training/nutrition + CDL coach-decisions) from dataRegistry SSOT + pain-cdl
// (written by engineWrappers, absent from the registry lists). Auth keys are
// intentionally excluded — never export firebase-* tokens (S-04 concern).
const LEGACY_DATA_KEYS: readonly string[] = [
  ...USER_DATA_KEYS,
  ...CDL_KEYS,
  'pain-cdl',
];

interface ExportPayload {
  exportedAt: string;
  schemaVersion: 2;
  stores: {
    onboarding: ReturnType<typeof useOnboardingStore.getState>;
    workout: ReturnType<typeof useWorkoutStore.getState>;
    nutrition: ReturnType<typeof useNutritionStore.getState>;
    settings: ReturnType<typeof useSettingsStore.getState>;
    schedule: ReturnType<typeof useScheduleStore.getState>;
  };
  tier0Keys: Record<string, string | null>;
  // §28-M4 GDPR Art. 20 — Tier 1 IDB stores (cdl/logs/applied_patterns
  // archived sessions >90 days). Optional: empty arrays if IDB unavailable.
  tier1: {
    cdl: unknown[];
    logs: unknown[];
    appliedPatterns: unknown[];
  };
}

function collectTier0Keys(): Record<string, string | null> {
  const keys: Record<string, string | null> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wv2-')) {
        keys[key] = localStorage.getItem(key);
      }
    }
    // S-02 — also pull canonical unprefixed legacy data keys (coach-decisions,
    // flat logs, pr-records, pain-cdl, cdl-patterns, ...) so "toate datele tale"
    // is true. Only present keys are included (null skipped).
    for (const key of LEGACY_DATA_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) keys[key] = val;
    }
  } catch {
    // localStorage unavailable — return empty
  }
  return keys;
}

async function collectTier1(): Promise<ExportPayload['tier1']> {
  const empty = { cdl: [], logs: [], appliedPatterns: [] };
  try {
    const dbModule = await import('../../../../storage/db.js');
    const [cdl, logs, appliedPatterns] = await Promise.all([
      dbModule.tier1All(dbModule.STORES.CDL_TIER1).catch(() => []),
      dbModule.tier1All(dbModule.STORES.LOGS_TIER1).catch(() => []),
      dbModule.tier1All(dbModule.STORES.APPLIED_PATTERNS_TIER1).catch(() => []),
    ]);
    return { cdl, logs, appliedPatterns };
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
    },
    tier0Keys: collectTier0Keys(),
    tier1,
  };
}

function triggerDownload(filename: string, content: string): void {
  try {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('[SettingsExport] download failed:', e);
    throw e;
  }
}

export function SettingsExport(): JSX.Element {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [size, setSize] = useState<number>(0);

  async function handleExport(): Promise<void> {
    try {
      const payload = await buildExportPayload();
      const json = JSON.stringify(payload, null, 2);
      const filename = `andura-export-${new Date().toISOString().slice(0, 10)}.json`;
      triggerDownload(filename, json);
      setSize(json.length);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const contentItems = tArray('settings.export.contentItems');

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-export">
      <SubHeader
        title={t('settings.export.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-export-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink leading-relaxed mb-4">
          {t('settings.export.intro')}
        </p>

        <div className="pulse-card pulse-card-tight p-4 mb-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
            {t('settings.export.contentHeading')}
          </p>
          <ul className="text-sm text-ink space-y-1.5">
            {contentItems.map((it, i) => (
              <li key={i}>{`• ${it}`}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => { void handleExport(); }}
          data-testid="settings-export-trigger"
          className="btn-primary-lift press-feedback w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {t('settings.export.exportCta')}
        </button>

        {status === 'success' && (
          <p
            className="text-sm text-ink2 text-center mt-3"
            role="status"
            data-testid="settings-export-success"
          >
            {t('settings.export.successHint', { kb: Math.ceil(size / 1024) })}
          </p>
        )}
        {status === 'error' && (
          <p
            className="text-sm text-brickdark text-center mt-3"
            role="alert"
            data-testid="settings-export-error"
          >
            {t('settings.export.errorHint')}
          </p>
        )}
      </div>
    </section>
  );
}
