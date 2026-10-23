// ══ SEND TO PARTNER — "Trimite si lui <nume>" on a finished session ══════════
// PostSummary (right after a session) and IstoricDetail (forgot to tap). Renders
// nothing until the account is linked to a training partner (partner.ts). A
// session sent once shows as sent; a session that came FROM the partner is never
// offered back.

import type { JSX } from 'react';
import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { cachedPartner, partnerEnabled, sendSessionToPartner, wasSentToPartner } from '../lib/partner';
import type { LastSessionSummary } from '../stores/workoutStore';

export function SendToPartnerButton({ session, className = '' }: { session: LastSessionSummary; className?: string }): JSX.Element | null {
  const partner = partnerEnabled() ? cachedPartner() : null;
  const [sent, setSent] = useState(() => wasSentToPartner(session.ts));
  if (!partner || session.fromPartner) return null;
  const name = partner.name || t('partner.fallbackName');
  return (
    <button
      type="button"
      disabled={sent}
      onClick={() => { setSent(true); void sendSessionToPartner(session); }}
      data-testid="send-to-partner"
      className={`${className} w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70`}
    >
      {sent ? <Check className="w-4 h-4" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
      {sent ? t('partner.send.sent', { name }) : t('partner.send.cta', { name })}
    </button>
  );
}
