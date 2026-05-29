// ══ PRIVACY — Pagina publica /privacy (Daniel-directed redesign 2026-05-26) ═
// Ruta publica top-level (NU sub ProtectedRoute) — accesibila pe direct-URL
// load. Pereche cu /terms: bifa de consimtamant la creare cont pointeaza catre
// ambele. Continut = puncte-cheie privacy din LegalModal extinse + drepturi
// GDPR. Deep-link prin SPA fallback public/404.html → /?/privacy → router.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { t } from '../../../i18n/index.js';

export function Privacy(): JSX.Element {
  const navigate = useNavigate();

  function handleBack(): void {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/auth');
    }
  }

  return (
    <section
      className="bg-paper min-h-screen text-ink"
      data-testid="privacy-page"
    >
      <div className="max-w-md mx-auto p-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('legalPage.back')}
          data-testid="privacy-back"
          className="flex items-center gap-2 text-sm text-ink2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          {t('legalPage.back')}
        </button>

        <h1 className="text-2xl font-bold text-ink mb-2">
          {t('legalPage.privacyTitle')}
        </h1>
        <p className="text-xs text-ink2 mb-6">
          {t('legalPage.versionLine')}
        </p>

        <article className="text-sm text-ink leading-relaxed space-y-4">
          <p>
            {t('legalPage.privacyIntro')}
          </p>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.privacyCollectHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.privacyCollectBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.privacyNotDoHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.privacyNotDoBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.privacyRightsHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.privacyRightsBody')}
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">{t('legalPage.privacyContactHeading')}</h2>
            <p className="text-ink2">
              {t('legalPage.privacyContactBody')}{' '}
              <a
                href="mailto:privacy@andura.app"
                className="underline text-brick"
              >
                privacy@andura.app
              </a>
              .
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
