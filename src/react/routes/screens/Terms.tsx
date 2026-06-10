// ══ TERMS — Pagina publica /terms (Daniel-directed redesign 2026-05-26) ════
// Ruta publica top-level (NU sub ProtectedRoute) — accesibila pe direct-URL
// load. Inainte /terms dadea 404: LegalModal + footer-ul Auth pointau catre
// andura.app/terms fara ruta reala. Continut = puncte-cheie din LegalModal
// extinse. Deep-link prin SPA fallback public/404.html → /?/terms → router.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { t } from '../../../i18n/index.js';

export function Terms(): JSX.Element {
  const navigate = useNavigate();

  // Inapoi: history back daca exista (venit din bifa consimtamant), altfel
  // /auth (direct-URL load fara istoric).
  function handleBack(): void {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/auth');
    }
  }

  // h-full + overflow-y-auto: inside the desktop phone-bezel (#root overflow
  // hidden + #root>* height clamp) the page needs its OWN scroll, otherwise the
  // legal tail clips with no scrollbar (audit APP-MED-01 / LIVE-MED-01).
  return (
    <section
      className="bg-paper min-h-screen h-full overflow-y-auto text-ink"
      data-testid="terms-page"
    >
      <div className="max-w-md mx-auto p-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('legalPage.back')}
          data-testid="terms-back"
          className="flex items-center gap-2 text-sm text-ink2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          {t('legalPage.back')}
        </button>

        <h1 className="text-2xl font-bold text-ink mb-2">
          {t('legalPage.termsTitle')}
        </h1>
        <p className="text-xs text-ink2 mb-6">
          {t('legalPage.versionLine')}
        </p>

        <article className="text-sm text-ink leading-relaxed space-y-4">
          <p>
            {t('legalPage.termsIntro')}
          </p>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsEligibilityHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsEligibilityBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsServiceHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsServiceBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsRecsHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsRecsBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsResponsibilityHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsResponsibilityBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsBackupHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsBackupBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsErrorsHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsErrorsBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsBetaHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsBetaBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsWarrantyHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsWarrantyBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsLiabilityHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsLiabilityBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsIpHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsIpBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsTerminationHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsTerminationBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsLawHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsLawBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.termsChangesHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.termsChangesBody')}
            </p>
          </div>

          <p className="text-xs text-ink2 pt-2">
            {t('legalPage.termsQuestions')}{' '}
            <a
              href="mailto:privacy@andura.app"
              className="underline text-brick"
            >
              privacy@andura.app
            </a>
          </p>
        </article>
      </div>
    </section>
  );
}
