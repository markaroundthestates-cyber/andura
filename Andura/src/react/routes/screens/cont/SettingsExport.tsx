// ══ SETTINGS EXPORT — Phase 6 task_16 Cont Sub-Screen ════════════════════
// Local JSON export user data complete. Compose aggregate din toate
// Zustand stores + localStorage Tier 0 keys (wv2-*). Browser download via
// Blob + anchor href trigger. ZERO server upload — local-first invariant.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { gotoPath } from '../../../lib/navigation';

interface ExportPayload {
  exportedAt: string;
  schemaVersion: 1;
  stores: {
    onboarding: ReturnType<typeof useOnboardingStore.getState>;
    workout: ReturnType<typeof useWorkoutStore.getState>;
    nutrition: ReturnType<typeof useNutritionStore.getState>;
    settings: ReturnType<typeof useSettingsStore.getState>;
    schedule: ReturnType<typeof useScheduleStore.getState>;
  };
  tier0Keys: Record<string, string | null>;
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
  } catch {
    // localStorage unavailable — return empty
  }
  return keys;
}

function buildExportPayload(): ExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    stores: {
      onboarding: useOnboardingStore.getState(),
      workout: useWorkoutStore.getState(),
      nutrition: useNutritionStore.getState(),
      settings: useSettingsStore.getState(),
      schedule: useScheduleStore.getState(),
    },
    tier0Keys: collectTier0Keys(),
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

  function handleExport(): void {
    try {
      const payload = buildExportPayload();
      const json = JSON.stringify(payload, null, 2);
      const filename = `andura-export-${new Date().toISOString().slice(0, 10)}.json`;
      triggerDownload(filename, json);
      setSize(json.length);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-export">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-export-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Descarca datele tale</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink leading-relaxed mb-4">
          Iei toate datele tale Andura intr-un fisier JSON pe care il poti
          stoca local sau muta pe alt dispozitiv. Include profil + antrenamente
          + nutritie + setari + calendar.
        </p>

        <div className="bg-paper2 border border-line rounded-xl p-4 mb-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
            Continut export
          </p>
          <ul className="text-sm text-ink space-y-1.5">
            <li>• Profil & Big 6 (varsta, gen, obiectiv, frecventa, experienta, greutate)</li>
            <li>• Istoric sesiuni (toate antrenamentele logate)</li>
            <li>• Nutritie zilnica (kcal + proteine)</li>
            <li>• Preferinte (tema, unitati, notificari)</li>
            <li>• Calendar saptamanal (zile training/odihna)</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleExport}
          data-testid="settings-export-trigger"
          className="w-full py-3 bg-brick text-paper rounded-xl text-base font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Descarca JSON
        </button>

        {status === 'success' && (
          <p
            className="text-sm text-ink2 text-center mt-3"
            role="status"
            data-testid="settings-export-success"
          >
            Fisier descarcat ({Math.ceil(size / 1024)} KB)
          </p>
        )}
        {status === 'error' && (
          <p
            className="text-sm text-brick text-center mt-3"
            role="alert"
            data-testid="settings-export-error"
          >
            Eroare la export. Incearca din nou.
          </p>
        )}
      </div>
    </section>
  );
}
