// ══ SETTINGS IMPORT — Piesa 3 nutrition-brain (bootstrap istoric) ══════════
// Import istoric greutate + nutritie dintr-un export CSV (stil MyFitnessPal,
// dar NUME GENERIC — userul nu vede niciodata "MFP"). Userul cu ani de istoric
// alimenteaza creierul de nutritie (Piesa 2 observations builder) deodata →
// Kalman/Bayesian converge in zile, nu luni.
//
// Flux: file picker (.csv, multi-select) → parse PUR (historyImportParser) →
// rezumat (X zile greutate, Y zile nutritie, Z randuri sarite) → confirma →
// scrie store (historyImportStore.applyHistoryImport) → Piesa 2 vede live.
// ZERO server upload — local-first invariant (mirror SettingsExport).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import {
  parseHistoryImportFiles,
  type ParseResult,
} from '../../../lib/historyImportParser';
import { applyHistoryImport } from '../../../lib/historyImportStore';
import { t, tArray } from '../../../../i18n/index.js';

type Phase = 'idle' | 'preview' | 'done' | 'error';

export function SettingsImport(): JSX.Element {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<ParseResult | null>(null);

  async function handleFiles(fileList: FileList | null): Promise<void> {
    if (fileList == null || fileList.length === 0) return;
    try {
      const texts = await Promise.all(Array.from(fileList).map((f) => f.text()));
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

  function handleConfirm(): void {
    if (preview == null) return;
    applyHistoryImport(preview.weightEntries, preview.dailyEntries);
    setPhase('done');
  }

  const whatItems = tArray('settings.import.whatItems');

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-import">
      <SubHeader
        title={t('settings.import.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-import-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink leading-relaxed mb-4">
          {t('settings.import.intro')}
        </p>

        <div className="pulse-card pulse-card-tight p-4 mb-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
            {t('settings.import.whatHeading')}
          </p>
          <ul className="text-sm text-ink space-y-1.5">
            {whatItems.map((it, i) => (
              <li key={i}>{`• ${it}`}</li>
            ))}
          </ul>
        </div>

        {(phase === 'idle' || phase === 'error') && (
          <>
            <label
              className="btn-primary-lift press-feedback w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold flex items-center justify-center gap-2 cursor-pointer"
              data-testid="settings-import-trigger"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {t('settings.import.importCta')}
              <input
                type="file"
                accept=".csv,text/csv"
                multiple
                className="hidden"
                data-testid="settings-import-input"
                onChange={(e) => { void handleFiles(e.target.files); }}
              />
            </label>
            {phase === 'error' && (
              <p
                className="text-sm text-brickdark text-center mt-3"
                role="alert"
                data-testid="settings-import-error"
              >
                {t('settings.import.noDataError')}
              </p>
            )}
          </>
        )}

        {phase === 'preview' && preview != null && (
          <div data-testid="settings-import-preview">
            <div className="pulse-card pulse-card-tight p-4 mb-4">
              <p className="text-sm text-ink space-y-1">
                <span className="block" data-testid="settings-import-summary-weight">
                  {t('settings.import.preview.weightDays', { n: preview.weightEntries.length })}
                </span>
                <span className="block" data-testid="settings-import-summary-nutrition">
                  {t('settings.import.preview.nutritionDays', { n: preview.dailyEntries.length })}
                </span>
                <span className="block text-ink2" data-testid="settings-import-summary-skipped">
                  {t('settings.import.preview.skippedRows', { n: preview.skipped.length })}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              data-testid="settings-import-confirm"
              className="btn-primary-lift press-feedback w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              {t('settings.import.preview.confirmCta')}
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); setPhase('idle'); }}
              data-testid="settings-import-cancel"
              className="w-full py-3 mt-2 text-ink2 rounded-[14px] text-sm"
            >
              {t('settings.import.preview.cancelCta')}
            </button>
          </div>
        )}

        {phase === 'done' && preview != null && (
          <div className="text-center" data-testid="settings-import-done">
            <p className="text-sm text-ink" role="status">
              {t('settings.import.doneMessage', {
                weightN: preview.weightEntries.length,
                nutritionN: preview.dailyEntries.length,
              })}
            </p>
            <button
              type="button"
              onClick={() => navigate(gotoPath('cont'))}
              data-testid="settings-import-done-back"
              className="w-full py-3 mt-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              {t('settings.import.doneBackCta')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
