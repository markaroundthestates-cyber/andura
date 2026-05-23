// ══ SETTINGS SUPPORT — Suport ═════════════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-support. Static contact info
// + mailto link. Pre-Beta: feedback via email direct. Post-Beta: backend
// POST /api/feedback form integration deferred.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

const SUPPORT_EMAIL = 'support@andura.app';
const SUPPORT_WHATSAPP_HOURS = 'L-V · 09:00-18:00';

export function SettingsSupport(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-support">
      <SubHeader
        title="Suport"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-support-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          Raspundem la mesaje in maxim 24 de ore lucratoare. Suntem o echipa
          mica, dar atenti.
        </p>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Contacteaza-ne
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            data-testid="support-email"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-ink2 truncate">{SUPPORT_EMAIL}</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-ink2" aria-hidden="true" />
          </a>
          <div
            data-testid="support-whatsapp"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink2"
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">WhatsApp</p>
              <p className="text-xs">{SUPPORT_WHATSAPP_HOURS}</p>
            </div>
            <span className="text-xs text-ink3 italic">post-Beta</span>
          </div>
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Trimite-ne un mesaj
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] p-4">
          <p className="text-xs text-ink2 mb-3 leading-relaxed">
            Bug, idee, feedback — scrie liber. Ajunge direct la noi.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Andura%20feedback&body=Descrie%20problema%20sau%20ideea%20ta...`}
            data-testid="support-feedback-mailto"
            className="w-full block py-3 bg-brick text-paper rounded-xl text-base font-semibold text-center"
          >
            Deschide email
          </a>
        </div>
      </div>
    </section>
  );
}
