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

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-import">
      <SubHeader
        title="Importa istoric"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-import-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink leading-relaxed mb-4">
          Ai deja un istoric de greutate si calorii dintr-o alta aplicatie? Il
          poti importa dintr-un fisier CSV. Coach foloseste istoricul ca sa
          calibreze tinta ta de calorii mult mai repede.
        </p>

        <div className="bg-paper2 border border-line rounded-[14px] p-4 mb-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
            Ce poti importa
          </p>
          <ul className="text-sm text-ink space-y-1.5">
            <li>• Istoric greutate (data + kg)</li>
            <li>• Istoric nutritie zilnica (data + calorii + proteine)</li>
            <li>• Poti selecta ambele fisiere CSV deodata</li>
          </ul>
        </div>

        {(phase === 'idle' || phase === 'error') && (
          <>
            <label
              className="w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold flex items-center justify-center gap-2 cursor-pointer"
              data-testid="settings-import-trigger"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Alege fisier CSV
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
                Nu am gasit date de importat in fisier. Verifica sa fie un export
                CSV cu coloana Data + calorii sau greutate.
              </p>
            )}
          </>
        )}

        {phase === 'preview' && preview != null && (
          <div data-testid="settings-import-preview">
            <div className="bg-paper2 border border-line rounded-[14px] p-4 mb-4">
              <p className="text-sm text-ink space-y-1">
                <span className="block" data-testid="settings-import-summary-weight">
                  {preview.weightEntries.length} zile greutate
                </span>
                <span className="block" data-testid="settings-import-summary-nutrition">
                  {preview.dailyEntries.length} zile nutritie
                </span>
                <span className="block text-ink2" data-testid="settings-import-summary-skipped">
                  {preview.skipped.length} randuri sarite
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              data-testid="settings-import-confirm"
              className="w-full py-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              Importa datele
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); setPhase('idle'); }}
              data-testid="settings-import-cancel"
              className="w-full py-3 mt-2 text-ink2 rounded-[14px] text-sm"
            >
              Anuleaza
            </button>
          </div>
        )}

        {phase === 'done' && preview != null && (
          <div className="text-center" data-testid="settings-import-done">
            <p className="text-sm text-ink" role="status">
              Gata. Am importat {preview.weightEntries.length} zile greutate si{' '}
              {preview.dailyEntries.length} zile nutritie. Coach foloseste deja
              datele pentru calibrare.
            </p>
            <button
              type="button"
              onClick={() => navigate(gotoPath('cont'))}
              data-testid="settings-import-done-back"
              className="w-full py-3 mt-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
            >
              Inapoi la Cont
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
