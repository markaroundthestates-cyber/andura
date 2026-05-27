// ══ TERMS — Pagina publica /terms (Daniel-directed redesign 2026-05-26) ════
// Ruta publica top-level (NU sub ProtectedRoute) — accesibila pe direct-URL
// load. Inainte /terms dadea 404: LegalModal + footer-ul Auth pointau catre
// andura.app/terms fara ruta reala. Continut = puncte-cheie din LegalModal
// extinse. Deep-link prin SPA fallback public/404.html → /?/terms → router.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

  return (
    <section
      className="bg-paper min-h-screen text-ink"
      data-testid="terms-page"
    >
      <div className="max-w-md mx-auto p-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Inapoi"
          data-testid="terms-back"
          className="flex items-center gap-2 text-sm text-ink2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Inapoi
        </button>

        <h1 className="text-2xl font-bold text-ink mb-2">
          Termeni si conditii
        </h1>
        <p className="text-xs text-ink2 mb-6">
          Versiune Beta &middot; Actualizat 2026-05-26
        </p>

        <article className="text-sm text-ink leading-relaxed space-y-4">
          <p>
            Andura este un coach de antrenament personal local-first. Toate
            datele se stocheaza pe telefonul tau si pot fi exportate sau sterse
            oricand din ecranul Cont. Folosind Andura accepti urmatoarele puncte
            cheie:
          </p>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Recomandari, nu prescriptii</h2>
            <p className="text-ink2">
              Andura ofera recomandari de antrenament, NU prescriptii medicale.
              Nu este un dispozitiv medical sau un substitut pentru sfatul unui
              medic, kinetoterapeut sau antrenor profesionist.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Responsabilitatea ta</h2>
            <p className="text-ink2">
              Esti responsabil de propria siguranta in sala. Consulta un medic
              inainte de a incepe orice program nou de antrenament. Daca simti
              durere ascutita, ameteala sau dificultati de respiratie, opreste
              sesiunea.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Backup si securitate</h2>
            <p className="text-ink2">
              Backup-ul Firebase este optional (autentificare prin magic link,
              fara parola) si cripteaza datele in transit prin HTTPS.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Raportare erori</h2>
            <p className="text-ink2">
              Raportarea de erori (crash-uri) este opt-in (implicit oprita) si
              foloseste Sentry, cu datele personale sterse inainte de trimitere.
              Nu colectam metrici de utilizare. O poti porni sau opri oricand.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-1.5">Beta gratuita</h2>
            <p className="text-ink2">
              Andura este in Beta gratuita. Functionalitati pot fi schimbate sau
              adaugate fara aviz prealabil pana la lansarea V1.
            </p>
          </div>

          <p className="text-xs text-ink2 pt-2">
            Intrebari:{' '}
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
