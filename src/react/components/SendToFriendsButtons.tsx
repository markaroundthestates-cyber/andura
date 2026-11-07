// ══ SEND TO FRIENDS — one "Trimite si lui <nume>" per training friend ═════════
// PostSummary (right after a session) and IstoricDetail (forgot, or trained with
// someone you did not pick). A friend picked on "Cu cine te antrenezi azi?" already
// got the session on its own, so their row reads sent. Nothing renders without
// friends; a session that came FROM a friend is never offered back.

import type { JSX } from 'react';
import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { cachedFriends, partnerEnabled, sendSessionToFriend, wasSentToFriend } from '../lib/partner';
import type { LastSessionSummary } from '../stores/workoutStore';

export function SendToFriendsButtons({ session, className = '' }: { session: LastSessionSummary; className?: string }): JSX.Element | null {
  const friends = partnerEnabled() && !session.fromPartner ? cachedFriends() : [];
  const [sent, setSent] = useState<ReadonlySet<string>>(() => new Set(friends.filter((f) => wasSentToFriend(session.ts, f.uid)).map((f) => f.uid)));
  if (friends.length === 0) return null;
  return (
    <div className={`${className} flex flex-col gap-2`} data-testid="send-to-friends">
      {friends.map((f) => {
        const done = sent.has(f.uid);
        const name = f.name || t('partner.fallbackName');
        return (
          <button
            key={f.uid}
            type="button"
            disabled={done}
            onClick={() => { setSent((s) => new Set([...s, f.uid])); void sendSessionToFriend(session, f.uid); }}
            data-testid={`send-to-friend-${f.uid}`}
            className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {done ? <Check className="w-4 h-4" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
            {done ? t('partner.send.sent', { name }) : t('partner.send.cta', { name })}
          </button>
        );
      })}
    </div>
  );
}
