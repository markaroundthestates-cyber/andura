// ══ PRIETENI — training friends (founder 2026-11-07, replaces the code screen) ══
// "Training partner e cam clumsy... ceva gen friend list": add a friend by the email
// they sign in with (they answer in their own app), see who you train with, take back
// an unanswered request, remove a friend. Picking who you train with TODAY happens on
// the pre-session TimeBudget step; the session then goes to them on its own.

import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Clock } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';
import {
  acceptFriendRequest, askedEmails, cachedFriends, cancelFriendRequest, checkPartnerInbox, declineFriendRequest,
  myPartnerName, removeFriend, sendFriendRequest, setMyPartnerName,
  type Friend, type FriendRequest, type RequestResult,
} from '../../../lib/partner';

const WAIT_POLL_MS = 10_000;

export function Prieteni(): JSX.Element {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>(() => cachedFriends());
  const [asked, setAsked] = useState<string[]>(() => askedEmails());
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [name, setName] = useState(() => myPartnerName());
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<RequestResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    const { requests: incoming } = await checkPartnerInbox();
    setRequests(incoming);
    setFriends(cachedFriends());
    setAsked(askedEmails());
  }, []);

  // Fresh state on open, and while a request of mine waits for an answer.
  useEffect(() => {
    void refresh();
    if (asked.length === 0) return undefined;
    const id = setInterval(() => void refresh(), WAIT_POLL_MS);
    return () => clearInterval(id);
  }, [refresh, asked.length]);

  const nameOk = name.trim().length > 0;

  async function handleSend(): Promise<void> {
    setBusy(true);
    setMyPartnerName(name);
    const r = await sendFriendRequest(email);
    setBusy(false);
    setResult(r);
    if (r === 'ok') { setEmail(''); setAsked(askedEmails()); }
  }

  async function handleAnswer(req: FriendRequest, accept: boolean): Promise<void> {
    setBusy(true);
    if (accept) { setMyPartnerName(name); await acceptFriendRequest(req); } else await declineFriendRequest(req);
    setBusy(false);
    await refresh();
  }

  async function handleRemove(uid: string): Promise<void> {
    setBusy(true);
    await removeFriend(uid);
    setBusy(false);
    setConfirmRemove(null);
    setFriends(cachedFriends());
  }

  async function handleCancel(e: string): Promise<void> {
    setBusy(true);
    await cancelFriendRequest(e);
    setBusy(false);
    setAsked(askedEmails());
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="prieteni">
      <SubHeader title={t('partner.title')} onBack={() => navigate(gotoPath('cont'))} testIdBack="prieteni-back" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <p className="text-sm text-ink2 leading-relaxed">{t('partner.intro')}</p>

        <div className="pulse-card p-5 space-y-2">
          <label htmlFor="prieteni-name" className="block text-sm font-semibold text-ink">{t('partner.nameLabel')}</label>
          <input
            id="prieteni-name"
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { if (nameOk) setMyPartnerName(name); }}
            placeholder={t('partner.namePlaceholder')}
            className="pulse-field w-full px-3 py-2 rounded-xl text-sm"
            data-testid="prieteni-name"
          />
        </div>

        {requests.length > 0 && (
          <div className="pulse-card p-5 space-y-3" data-testid="prieteni-requests">
            <h2 className="text-sm font-semibold text-ink">{t('partner.requestsTitle')}</h2>
            {requests.map((r) => (
              <div key={r.from} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-ink truncate">{r.name}</span>
                <button type="button" disabled={busy || !nameOk} onClick={() => void handleAnswer(r, true)} data-testid={`prieteni-accept-${r.from}`} className="px-3 py-1.5 rounded-xl bg-ink text-paper dark:bg-brick text-sm font-semibold disabled:opacity-50">
                  {t('partner.request.acceptCta')}
                </button>
                <button type="button" disabled={busy} onClick={() => void handleAnswer(r, false)} className="px-3 py-1.5 rounded-xl border border-lineStrong text-sm text-ink">
                  {t('partner.request.declineCta')}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pulse-card p-1 overflow-hidden" data-testid="prieteni-list">
          {friends.length === 0 ? (
            <p className="p-4 text-sm text-ink3 text-center">{t('partner.noFriends')}</p>
          ) : friends.map((f) => (
            <div key={f.uid} className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-b-0" data-testid={`prieteni-friend-${f.uid}`}>
              <span className="grid place-items-center w-9 h-9 rounded-xl border border-volt/50 text-volt">
                <Users className="w-5 h-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm font-semibold text-ink truncate">{f.name || t('partner.fallbackName')}</span>
              {confirmRemove === f.uid ? (
                <>
                  <button type="button" onClick={() => setConfirmRemove(null)} className="text-sm text-ink2 px-2">{t('partner.unpairCancel')}</button>
                  <button type="button" disabled={busy} onClick={() => void handleRemove(f.uid)} data-testid={`prieteni-remove-accept-${f.uid}`} className="text-sm text-brick font-semibold px-2 disabled:opacity-60">{t('partner.unpairAccept')}</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmRemove(f.uid)} data-testid={`prieteni-remove-${f.uid}`} className="text-sm text-brick px-2">{t('partner.unpairCta')}</button>
              )}
            </div>
          ))}
        </div>

        {asked.length > 0 && (
          <div className="pulse-card p-5 space-y-2" data-testid="prieteni-asked">
            <h2 className="text-sm font-semibold text-ink">{t('partner.askedTitle')}</h2>
            {asked.map((e) => (
              <div key={e} className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ink3" aria-hidden="true" />
                <span className="flex-1 text-sm text-ink2 truncate">{e}</span>
                <button type="button" disabled={busy} onClick={() => void handleCancel(e)} className="text-sm text-brick px-2">{t('partner.cancelRequest')}</button>
              </div>
            ))}
          </div>
        )}

        <div className="pulse-card p-5 space-y-3">
          <label htmlFor="prieteni-email" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            {t('partner.addTitle')}
          </label>
          <input
            id="prieteni-email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setResult(null); }}
            placeholder={t('partner.emailPlaceholder')}
            className="pulse-field w-full px-3 py-2 rounded-xl text-sm"
            data-testid="prieteni-email"
          />
          <p className="text-xs text-ink3">{t('partner.emailHint')}</p>
          {result && (
            <p className={`text-sm ${result === 'ok' ? 'text-ink2' : 'text-brick'}`} role="status" data-testid="prieteni-result">
              {t(`partner.requestResult.${result}`)}
            </p>
          )}
          <button
            type="button"
            disabled={!nameOk || email.trim() === '' || busy}
            onClick={() => void handleSend()}
            data-testid="prieteni-send"
            className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold disabled:opacity-50"
          >
            {t('partner.sendRequestCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
