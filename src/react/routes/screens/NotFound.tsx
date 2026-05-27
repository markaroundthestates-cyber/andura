// ══ NOT FOUND — Catch-all 404 (audit MED — no 404/errorElement route) ═════
// Inainte: URL gresit → white screen (router fara catch-all). Acum: ruta `*`
// prinde orice path nepotrivit si arata un ecran RO simplu cu link spre acasa.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFound(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section
      className="bg-paper min-h-screen text-ink flex items-center justify-center"
      data-testid="not-found-page"
    >
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">
          Pagina nu a fost gasita
        </h1>
        <p className="text-sm text-ink2 mb-6">
          Linkul pe care l-ai accesat nu exista sau a fost mutat.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          data-testid="not-found-home"
          className="text-sm text-brick underline"
        >
          Inapoi acasa
        </button>
      </div>
    </section>
  );
}
