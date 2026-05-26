// ══ PRIVACY — Pagina publica /privacy (Daniel-directed redesign 2026-05-26) ═
// Ruta publica top-level (NU sub ProtectedRoute) — accesibila pe direct-URL
// load. Pereche cu /terms: bifa de consimtamant la creare cont pointeaza catre
// ambele. Continut = puncte-cheie privacy din LegalModal extinse + drepturi
// GDPR. Deep-link prin SPA fallback public/404.html → /?/privacy → router.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
          aria-label="Inapoi"
          data-testid="privacy-back"
          className="flex items-center gap-2 text-sm text-ink2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Inapoi
        </button>

        <h1 className="text-2xl font-bold text-ink mb-2">
          Politica de confidentialitate
        </h1>
        <p className="text-xs text-ink2 mb-6">
          Versiune Beta &middot; Actualizat 2026-05-26
        </p>

        <article className="text-sm text-ink leading-relaxed space-y-4">
          <p>
            Datele tale raman pe telefon. Tu controlezi ce iese de aici. Andura
            este local-first: profilul si sesiunile se salveaza pe dispozitivul
            tau.
          </p>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Ce colectam</h2>
            <p className="text-ink2">
              Colectam doar profilul tau, sesiunile de antrenament, biometricii
              opt-in si emailul folosit la magic link. Aceste date sunt folosite
              pentru personalizarea antrenamentelor, local pe telefon.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Ce NU facem</h2>
            <p className="text-ink2">
              ZERO publicitate. ZERO vanzare de date. ZERO trackere third-party.
              Nu folosim datele tale pentru reclame.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Drepturile tale (GDPR)</h2>
            <p className="text-ink2">
              Ai dreptul de acces, export, stergere si rectificare a datelor
              oricand din ecranul Cont. Backup-ul Firebase este optional si
              cripteaza datele in transit prin HTTPS.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Contact</h2>
            <p className="text-ink2">
              Pentru intrebari legate de confidentialitate scrie la{' '}
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
