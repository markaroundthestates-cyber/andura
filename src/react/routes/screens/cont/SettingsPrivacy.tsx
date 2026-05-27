// ══ SETTINGS PRIVACY — Phase 6 task_14 Cont Sub-Screen ═══════════════════
// Data export consent + telemetry opt-in toggles. Anti-paternalism:
// telemetry opt-in default FALSE (Daniel Bugatti craft — user explicit
// consent required). Data export consent default TRUE (user can revoke).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { Toggle } from '../../../components/Toggle';

// Pass 9 polish — ToggleRow shell wraps shared <Toggle> per mockup parity
// (.sw canonical L2973-2976). Toggle button extracted la components/Toggle.
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
      <Toggle
        checked={checked}
        onToggle={onToggle}
        ariaLabel={title}
        testId={testId}
      />
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
      <SubHeader
        title="Confidentialitate"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-privacy-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck className="w-5 h-5 text-brick" aria-hidden="true" />
          <p className="text-sm text-ink2 leading-snug">
            Datele tale raman pe telefon. Tu controlezi ce iese de aici.
          </p>
        </div>

        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          <ToggleRow
            testId="privacy-data-export-toggle"
            title="Export date permis"
            desc="Pot descarca datele mele oricand din ecranul Descarca date."
            checked={dataExport}
            onToggle={() => setDataExportConsent(!dataExport)}
          />
          <ToggleRow
            testId="privacy-telemetry-toggle"
            title="Raportare erori"
            desc="Trimite automat rapoarte de eroare (crash-uri) ca sa reparam problemele. Implicit oprit."
            checked={telemetry}
            onToggle={() => setTelemetryOptIn(!telemetry)}
          />
        </div>

        <p className="text-xs text-ink2 leading-snug">
          Folosim Sentry doar pentru rapoarte de eroare, daca pornesti optiunea
          de sus. Datele personale (email, identificatori) sunt sterse inainte
          de trimitere. Nu colectam metrici de utilizare. Poti revoca oricand.
        </p>

        {/* §A025 audit fix (NC§28-C1) — Privacy Policy live content GDPR. */}
        <article
          data-testid="privacy-policy-content"
          className="mt-6 pt-5 border-t border-line text-sm text-ink leading-relaxed"
        >
          <h2 className="text-base font-semibold mb-3">Politica de confidentialitate</h2>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Ce date colectam</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            <li>Profil onboarding: varsta, gen, obiectiv, frecventa, experienta, greutate (Big 6)</li>
            <li>Sesiuni antrenament: exercitii, seturi, kg, reps, durata, RPE</li>
            <li>Indicatori biometrici opt-in: greutate corp, masuratori (talie, brate, picioare)</li>
            <li>Email pentru Magic Link (autentificare optionala fara parola)</li>
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Cum sunt folosite</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            <li>Personalizare antrenamente (volum, intensitate, frecventa pe baza Big 6)</li>
            <li>Engine recomandari (readiness, fatigue, PR detection — local pe telefon)</li>
            <li>Backup optional Firebase RTDB (criptat in transit HTTPS) doar daca esti autentificat</li>
            <li>ZERO publicitate · ZERO vanzare date · ZERO third-party trackers</li>
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Drepturile tale GDPR</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            <li><strong>Acces + portabilitate:</strong> exporta toate datele JSON din Cont &gt; Descarca date</li>
            <li><strong>Stergere:</strong> sterge tot din Cont &gt; Deconectare si stergere &gt; Sterge contul</li>
            <li><strong>Rectificare:</strong> editeaza profilul direct in Cont &gt; Profil</li>
            <li><strong>Opozitie:</strong> toggle raportare erori sus (default OFF)</li>
            <li><strong>Limitare procesare:</strong> dezactiveaza backup Firebase (deconectare cont)</li>
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Stocare + retentie</h3>
          <p className="text-sm text-ink2 mb-3">
            Datele se stocheaza local-first pe telefonul tau (localStorage + IndexedDB).
            Backup-ul Firebase RTDB (optional) pastreaza copie pana stergi contul.
            ZERO copie pe servere terte. <strong>Stergerea de pe device =
            imediata.</strong> Datele Firebase RTDB (daca esti autentificat)
            se sterg automat la &quot;Sterge contul&quot; (best-effort GDPR Art. 17,
            propagare server &lt;5 min). Probleme la stergere remote? Scrie la
            <a href="mailto:privacy@andura.app" className="text-brick underline">{' '}privacy@andura.app</a>{' '}
            (raspuns &lt;72h).
          </p>

          {/* §28-H6 audit fix — Medical data Art. 9 special category boundary. */}
          <h3 className="text-sm font-semibold mt-3 mb-1.5">Date sensibile (GDPR Art. 9)</h3>
          <p className="text-sm text-ink2 mb-3">
            Andura este o aplicatie de <strong>fitness</strong>, NU un
            dispozitiv medical. Datele de greutate corporala, masuratori sau
            durere raportate prin Pain Button au caracter strict
            <strong> sportiv</strong>, NU medical. Nu colectam diagnostice,
            tratamente, retete sau alte categorii speciale GDPR Art. 9. Daca
            ai conditii medicale, consulta intai medicul (vezi
            <strong>{' '}Disclaimer medical</strong> in Termeni si conditii).
          </p>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Sub-procesatori</h3>
          <p className="text-sm text-ink2 mb-3">
            Pentru a oferi serviciul, folosim doi sub-procesatori:{' '}
            <strong>Google Firebase</strong> (autentificare + backup RTDB,
            regiune europe-west1 EU) si <strong>Sentry</strong> (raportare
            erori app, opt-in, cu datele personale sterse). ZERO terti
            analytics, ZERO advertising, ZERO data brokers.
          </p>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">Contact + reclamatii</h3>
          <p className="text-sm text-ink2 mb-3">
            Pentru intrebari sau reclamatii GDPR: <a href="mailto:privacy@andura.app" className="text-brick underline">privacy@andura.app</a>.
            Drept de reclamatie la Autoritatea Nationala de Supraveghere a
            Prelucrarii Datelor cu Caracter Personal (ANSPDCP).
          </p>

          <p className="text-xs text-ink2 mt-4">
            Versiune Beta · Actualizat 2026-05-22. Operator date: Andura PWA solo
            developer Daniel. Date stocate UE (Firebase europe-west1).
          </p>
        </article>
      </div>
    </section>
  );
}
