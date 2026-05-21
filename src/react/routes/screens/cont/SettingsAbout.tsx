// ══ SETTINGS ABOUT — Despre Andura ════════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-about. Static branding + info.
// Logo + tagline + intro + andura.app link + Versiune/Build/Echipa info rows.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';

const APP_VERSION = 'v1.0.0';
const APP_BUILD = '2026.05.22';

export function SettingsAbout(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-about">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-about-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Despre Andura</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-ink text-paper flex items-center justify-center text-3xl font-bold mx-auto mb-5 tracking-tight">
          A
        </div>
        <h2 className="font-serif text-2xl font-semibold text-ink mb-4 leading-snug">
          Antrenament cu cap. Facut in Romania.
        </h2>
        <p className="text-sm text-ink2 leading-relaxed mb-6 max-w-xs mx-auto">
          Andura te ajuta sa te antrenezi cu intentie — nu mai mult, ci mai bine.
          Coach-ul invata din feedback-ul tau si adapteaza fiecare sesiune.
        </p>

        <a
          href="https://andura.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brick font-medium mb-6 hover:underline"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          andura.app
        </a>

        <div className="bg-paper2 border border-line rounded-xl overflow-hidden text-left">
          <div className="flex justify-between items-center px-4 py-3 border-b border-line">
            <span className="text-sm text-ink2">Versiune</span>
            <span className="text-sm text-ink font-medium font-mono" data-testid="about-version">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-b border-line">
            <span className="text-sm text-ink2">Build</span>
            <span className="text-sm text-ink font-medium font-mono" data-testid="about-build">
              {APP_BUILD}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-ink2">Echipa</span>
            <span className="text-sm text-ink font-medium">Daniel &amp; co.</span>
          </div>
        </div>

        <p className="text-xs text-ink3 mt-6 leading-relaxed">
          Cu multumiri tuturor utilizatorilor beta care au ajutat la slefuirea aplicatiei.
        </p>
      </div>
    </section>
  );
}
