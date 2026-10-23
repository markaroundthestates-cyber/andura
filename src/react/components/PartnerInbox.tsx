// ══ PARTNER INBOX — "Daniel a logat Picioare. Adaug si la tine?" ═════════════
// Mounted lazily from Layout (outside a live session). Checks the training-
// partner inbox on open, on return to the app and every minute while visible
// (only once linked or with a code out — an unlinked user costs one read per open),
// and asks about each waiting session, one at a time (partner.ts). One tap adds
// it to history (what this user can't do is left out and named); "Nu" drops it.

import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { toast } from '../lib/toast';
import {
  acceptPartnerSession, checkPartnerInbox, dismissPartnerSession, partnerPollWorthy, planPartnerImport,
  type PartnerSessionMessage,
} from '../lib/partner';
import { sessionDisplayTitle } from '../lib/sessionTitle';
import { toExerciseDisplay } from '../lib/exerciseDisplay';
import { formatDateDMY } from '../lib/format';
import { todTs } from '../../db.js';

const POLL_MS = 60_000;

export default function PartnerInbox(): JSX.Element | null {
  const [queue, setQueue] = useState<PartnerSessionMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const addRef = useRef<HTMLButtonElement | null>(null);

  const refresh = useCallback(async () => {
    const pending = await checkPartnerInbox();
    setQueue((cur) => (cur.length > 0 ? cur : pending));
  }, []);

  useEffect(() => {
    void refresh();
    const onVisible = (): void => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const id = setInterval(() => { if (document.visibilityState === 'visible' && partnerPollWorthy()) void refresh(); }, POLL_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(id);
    };
  }, [refresh]);

  const msg = queue[0];
  useEffect(() => { if (msg) addRef.current?.focus(); }, [msg]);
  if (!msg) return null;

  const plan = planPartnerImport(msg.session);
  const title = sessionDisplayTitle({ title: msg.session.title, exercises: plan.exercises.length > 0 ? plan.exercises : msg.session.exercises });

  async function answer(add: boolean): Promise<void> {
    if (!msg || busy) return;
    setBusy(true);
    if (add) {
      await acceptPartnerSession(msg);
      toast.show({ message: t('partner.inbox.addedToast'), variant: 'success' });
    } else {
      await dismissPartnerSession(msg);
    }
    setBusy(false);
    setQueue((cur) => cur.slice(1));
  }

  return (
    <div className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50" data-testid="partner-inbox-backdrop">
      <div
        className="animate-slide-up bg-paper rounded-t-2xl pt-4 px-6 pb-6 w-full max-w-md"
        data-testid="partner-inbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-inbox-title"
      >
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-brick" aria-hidden="true" />
          <h2 id="partner-inbox-title" className="text-base font-bold text-ink">
            {t('partner.inbox.title', { name: msg.name })}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-3" data-testid="partner-inbox-session">
          {title} · {formatDateDMY(todTs(msg.session.ts))}
        </p>
        {plan.exercises.length > 0 ? (
          <ul className="text-sm text-ink mb-3 space-y-1" data-testid="partner-inbox-exercises">
            {plan.exercises.map((e) => (
              <li key={e.exerciseId + (e.engineName ?? '')}>
                {toExerciseDisplay(e.engineName ?? e.exerciseName).name} · {e.sets.length} x {e.sets[0]?.kg ?? 0} kg
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink2 mb-3">{t('partner.inbox.nothingForYou')}</p>
        )}
        {plan.skipped.length > 0 && (
          <p className="text-xs text-ink2 mb-3" data-testid="partner-inbox-skipped">
            {t('partner.inbox.skipped', { names: plan.skipped.join(', ') })}
          </p>
        )}
        <p className="text-sm text-ink mb-4">{t('partner.inbox.question')}</p>
        {plan.exercises.length > 0 && (
          <button
            ref={addRef}
            type="button"
            disabled={busy}
            onClick={() => void answer(true)}
            data-testid="partner-inbox-add"
            className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2 transition-transform active:scale-[.97] disabled:opacity-60"
          >
            {t('partner.inbox.addCta')}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void answer(false)}
          data-testid="partner-inbox-no"
          className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold disabled:opacity-60"
        >
          {t('partner.inbox.noCta')}
        </button>
      </div>
    </div>
  );
}
