// ══ PARTNER INBOX — friend requests + "Daniel a logat Picioare. L-ai facut si tu?" ══
// Mounted lazily from Layout (outside a live session). Checks on open, on return to
// the app and every minute while visible (only with a friend or a request of mine
// out — otherwise one read per open), then asks one thing at a time (partner.ts):
// a friend request first ("<name> vrea sa va antrenati impreuna" → Accepta / Refuza),
// then each waiting session. One tap adds a session to history (what this user can't
// do is left out and named); "Nu" drops it.

import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, UserPlus, Users } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { toast } from '../lib/toast';
import {
  acceptFriendRequest, acceptPartnerSession, checkPartnerInbox, declineFriendRequest, dismissPartnerSession,
  myPartnerName, partnerPollWorthy, planPartnerImport, setMyPartnerName,
  type FriendRequest, type PartnerSessionMessage,
} from '../lib/partner';
import { sessionDisplayTitle, sessionGroupType } from '../lib/sessionTitle';
import { findLiveInvites, markInviteAnswered, type LiveInvite } from '../lib/liveSession';
import { gotoPath } from '../lib/navigation';
import { useWorkoutStore } from '../stores/workoutStore';
import { toExerciseDisplay } from '../lib/exerciseDisplay';
import { formatDateDMY } from '../lib/format';
import { todTs } from '../../db.js';

// A live invite is time-sensitive (the host is starting now) → a short poll, but only
// with a friend or a request out (partnerPollWorthy).
const POLL_MS = 20_000;

export default function PartnerInbox(): JSX.Element | null {
  const [queue, setQueue] = useState<PartnerSessionMessage[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [invites, setInvites] = useState<LiveInvite[]>([]);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(() => myPartnerName());
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  const refresh = useCallback(async () => {
    const { sessions, requests: incoming } = await checkPartnerInbox();
    setQueue((cur) => (cur.length > 0 ? cur : sessions));
    setRequests((cur) => (cur.length > 0 ? cur : incoming));
    // Not while a session of my own is open (a paused one included).
    const busy = useWorkoutStore.getState().sessionStart !== null || useWorkoutStore.getState().pausedSnapshot !== null;
    const live = busy ? [] : await findLiveInvites();
    setInvites((cur) => (cur.length > 0 ? cur : live));
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

  const invite = invites[0];
  const req = invite ? undefined : requests[0];
  const msg = invite || req ? undefined : queue[0];
  useEffect(() => { if (invite || req || msg) primaryRef.current?.focus(); }, [invite, req, msg]);

  if (invite) {
    const type = sessionGroupType({ exercises: invite.plan.exercises.map((e) => ({ engineName: e.engineName, sets: Array.from({ length: e.sets }) })) });
    const what = type ? t(`workout.sessionTitle.${type}`) : t('postRpe.fallbackTitle');
    const answerInvite = (join: boolean): void => {
      markInviteAnswered(invite);
      setInvites((cur) => cur.slice(1));
      if (join) navigate(gotoPath('workout-preview'), { state: { livePlan: invite.plan } });
    };
    return (
      <Sheet testId="live-invite" titleId="live-invite-title">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="w-5 h-5 text-brick" aria-hidden="true" />
          <h2 id="live-invite-title" className="text-base font-bold text-ink">
            {t('live.invite.title', { name: invite.plan.hostName, what })}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4">{t('live.invite.body', { count: invite.plan.exercises.length })}</p>
        <button
          ref={primaryRef}
          type="button"
          onClick={() => answerInvite(true)}
          data-testid="live-invite-join"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2 transition-transform active:scale-[.97]"
        >
          {t('live.invite.joinCta', { name: invite.plan.hostName })}
        </button>
        <button
          type="button"
          onClick={() => answerInvite(false)}
          data-testid="live-invite-skip"
          className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold"
        >
          {t('live.invite.skipCta')}
        </button>
      </Sheet>
    );
  }

  if (req) {
    // The first answer also sets the name the friend will see (asked once).
    const needsName = myPartnerName() === '';
    const answerRequest = async (accept: boolean): Promise<void> => {
      if (busy) return;
      setBusy(true);
      if (accept) {
        if (needsName) setMyPartnerName(name);
        const ok = await acceptFriendRequest(req);
        toast.show({ message: t(ok ? 'partner.request.acceptedToast' : 'partner.request.failedToast', { name: req.name }), variant: ok ? 'success' : 'error' });
      } else {
        await declineFriendRequest(req);
      }
      setBusy(false);
      setRequests((cur) => cur.slice(1));
    };
    return (
      <Sheet testId="partner-request" titleId="partner-request-title">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="w-5 h-5 text-brick" aria-hidden="true" />
          <h2 id="partner-request-title" className="text-base font-bold text-ink">
            {t('partner.request.title', { name: req.name })}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4">{t('partner.request.body', { name: req.name })}</p>
        {needsName && (
          <div className="mb-4">
            <label htmlFor="partner-request-name" className="block text-sm font-semibold text-ink mb-1">{t('partner.nameLabel')}</label>
            <input
              id="partner-request-name"
              type="text"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('partner.namePlaceholder')}
              className="pulse-field w-full px-3 py-2 rounded-xl text-sm"
              data-testid="partner-request-name"
            />
          </div>
        )}
        <button
          ref={primaryRef}
          type="button"
          disabled={busy || (needsName && name.trim() === '')}
          onClick={() => void answerRequest(true)}
          data-testid="partner-request-accept"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold mb-2 transition-transform active:scale-[.97] disabled:opacity-60"
        >
          {t('partner.request.acceptCta')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void answerRequest(false)}
          data-testid="partner-request-decline"
          className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold disabled:opacity-60"
        >
          {t('partner.request.declineCta')}
        </button>
      </Sheet>
    );
  }

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
    <Sheet testId="partner-inbox" titleId="partner-inbox-title">
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
          ref={primaryRef}
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
    </Sheet>
  );
}

function Sheet({ testId, titleId, children }: { testId: string; titleId: string; children: ReactNode }): JSX.Element {
  return (
    <div className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50" data-testid={`${testId}-backdrop`}>
      <div
        className="animate-slide-up bg-paper rounded-t-2xl pt-4 px-6 pb-6 w-full max-w-md"
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {children}
      </div>
    </div>
  );
}
