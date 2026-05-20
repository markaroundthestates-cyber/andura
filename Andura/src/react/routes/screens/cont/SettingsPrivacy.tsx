// ══ SETTINGS PRIVACY — Phase 6 task_14 Cont Sub-Screen ═══════════════════
// Data export consent + telemetry opt-in toggles. Anti-paternalism:
// telemetry opt-in default FALSE (Daniel Bugatti craft — user explicit
// consent required). Data export consent default TRUE (user can revoke).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';

interface ToggleRowProps {
  testId: string;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ testId, title, desc, checked, onToggle }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink mb-0.5">{title}</p>
        <p className="text-xs text-ink2 leading-snug">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        data-testid={testId}
        onClick={onToggle}
        className={`flex-shrink-0 w-12 h-6 rounded-full transition relative ${checked ? 'bg-brick' : 'bg-line'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper transition ${checked ? 'left-6' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

export function SettingsPrivacy(): JSX.Element {
  const navigate = useNavigate();
  const dataExport = useSettingsStore((s) => s.dataExportConsent);
  const telemetry = useSettingsStore((s) => s.telemetryOptIn);
  const setDataExportConsent = useSettingsStore((s) => s.setDataExportConsent);
  const setTelemetryOptIn = useSettingsStore((s) => s.setTelemetryOptIn);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-privacy">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-privacy-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Confidentialitate</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck className="w-5 h-5 text-brick" aria-hidden="true" />
          <p className="text-sm text-ink2 leading-snug">
            Datele tale raman pe telefon. Tu controlezi ce iese de aici.
          </p>
        </div>

        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          <ToggleRow
            testId="privacy-data-export-toggle"
            title="Export date permis"
            desc="Pot descarca datele mele oricand din ecranul Descarca date."
            checked={dataExport}
            onToggle={() => setDataExportConsent(!dataExport)}
          />
          <ToggleRow
            testId="privacy-telemetry-toggle"
            title="Telemetrie anonima"
            desc="Trimite metrici anonime de utilizare ca sa imbunatateasca app. Implicit oprit."
            checked={telemetry}
            onToggle={() => setTelemetryOptIn(!telemetry)}
          />
        </div>

        <p className="text-xs text-ink2 leading-snug">
          GDPR · K-anonimat 5+. Nici un identificator personal in metrici
          (varsta in grup, NU exact). Poti revoca oricand.
        </p>
      </div>
    </section>
  );
}
