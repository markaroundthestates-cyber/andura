// ══ SETTINGS TERMS — Phase 6 task_15 Cont Sub-Screen ═════════════════════
// T&C re-display + Medical Disclaimer re-display. Read-only legal references
// post-onboarding accept. Mockup verbatim source rezumat 04-architecture
// disclaimer texts (LOCK 4 medical V1).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

type ActiveDoc = 'tc' | 'medical';

export function SettingsTerms(): JSX.Element {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveDoc>('tc');

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-terms">
      <SubHeader
        title="Termeni si conditii"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-terms-back"
      />

      <div className="flex border-b border-line bg-paper sticky top-[57px] z-10">
        <button
          type="button"
          data-testid="terms-tab-tc"
          role="tab"
          aria-selected={active === 'tc'}
          onClick={() => setActive('tc')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${active === 'tc' ? 'text-brick border-b-2 border-brick' : 'text-ink2'}`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          Termeni
        </button>
        <button
          type="button"
          data-testid="terms-tab-medical"
          role="tab"
          aria-selected={active === 'medical'}
          onClick={() => setActive('medical')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${active === 'medical' ? 'text-brick border-b-2 border-brick' : 'text-ink2'}`}
        >
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          Medical
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {active === 'tc' ? (
          <article data-testid="terms-tc-content" className="text-sm text-ink leading-relaxed">
            <h2 className="text-base font-semibold mb-2">Termeni si conditii Andura</h2>
            <p className="mb-3">
              Andura este un coach de antrenament personal local-first. Toate
              datele se stocheaza pe telefonul tau si pot fi exportate sau
              sterse oricand din ecranul Cont.
            </p>
            <p className="mb-3">
              Folosind Andura accepti urmatoarele puncte cheie:
            </p>
            <ul className="list-disc pl-5 mb-3 space-y-1.5">
              <li>Andura ofera recomandari, NU prescriptii medicale.</li>
              <li>Esti responsabil de propria siguranta in sala.</li>
              <li>
                Backup-ul Firebase este optional (autentificare magic link) si
                cripteaza datele in transit (HTTPS).
              </li>
              <li>
                Telemetria anonima este opt-in (implicit oprita) si respecta
                k-anonimat 5+ per GDPR.
              </li>
              <li>
                Andura este in Beta gratuita. Functionalitati pot fi schimbate
                sau adaugate fara aviz prealabil pana la lansarea V1.
              </li>
            </ul>
            <p className="text-xs text-ink2 mt-4">
              Versiune Beta &middot; Actualizat 2026-05-18. Tot textul
              complet disponibil online la{' '}
              <a
                href="https://andura.app/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-brick"
                data-testid="terms-tc-live-link"
              >
                andura.app/terms
              </a>
              .
            </p>
          </article>
        ) : (
          <article data-testid="terms-medical-content" className="text-sm text-ink leading-relaxed">
            <h2 className="text-base font-semibold mb-2">Disclaimer medical</h2>
            <p className="mb-3">
              Andura este o aplicatie de fitness, NU un dispozitiv medical sau
              un substitut pentru sfatul unui medic, kinetoterapeut sau
              antrenor profesionist.
            </p>
            <p className="mb-3">
              Consulta un medic inainte de a incepe orice program nou de
              antrenament, mai ales daca:
            </p>
            <ul className="list-disc pl-5 mb-3 space-y-1.5">
              <li>Ai o conditie medicala (cardiaca, respiratorie, musculo-scheletala).</li>
              <li>Esti gravida sau alaptezi.</li>
              <li>Ai durere persistenta sau leziuni recente.</li>
              <li>Iei medicamente care influenteaza efortul fizic.</li>
            </ul>
            <p className="mb-3">
              In sala asculta-ti corpul. Daca simti durere ascutita, ameteala,
              dificultati de respiratie — opreste sesiunea si cere ajutor.
            </p>
            <p className="text-xs text-ink2 mt-4">
              Acceptat la onboarding. Acest text poate fi consultat oricand.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
