// ══ PARTENER DE ANTRENAMENT — link two accounts with a 6-letter code ══════════
// Founder 2026-10-23 (he and his friend train together; the friend's sessions were
// copied by hand). Not linked: your name + "Genereaza cod" (shown to the partner,
// valid 24h; this screen checks every few seconds until they join) or "Am un cod".
// Linked: who you train with + unlink. Sessions travel from the finished-session
// screen / history (SendToPartnerButton); the partner answers in PartnerInbox.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';
import {
  cachedPartner, checkPartnerInbox, createInvite, joinWithCode, myPartnerName, unpair,
  type JoinResult, type PartnerLink,
} from '../../../lib/partner';

const WAIT_POLL_MS = 4000;

export function Partener(): JSX.Element {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerLink | null>(() => cachedPartner());
  const [name, setName] = useState(() => myPartnerName());
  const [code, setCode] = useState<string | null>(null);
  const [entered, setEntered] = useState('');
  const [joinError, setJoinError] = useState<JoinResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmUnpair, setConfirmUnpair] = useState(false);

  // Fresh link on open (the partner may have unlinked), and while a code is shown.
  useEffect(() => {
    let alive = true;
    const tick = (): void => { void checkPartnerInbox().then(() => { if (alive) setPartner(cachedPartner()); }); };
    tick();
    const id = code ? setInterval(tick, WAIT_POLL_MS) : null;
    return () => { alive = false; if (id) clearInterval(id); };
  }, [code]);

  const nameOk = name.trim().length > 0;

  async function handleCreate(): Promise<void> {
    setBusy(true);
    setCode(await createInvite(name.trim()));
    setBusy(false);
  }

  async function handleJoin(): Promise<void> {
    setBusy(true);
    const r = await joinWithCode(entered, name.trim());
    setBusy(false);
    setJoinError(r === 'ok' ? null : r);
    if (r === 'ok') setPartner(cachedPartner());
  }

  async function handleUnpair(): Promise<void> {
    setBusy(true);
    if (await unpair()) { setPartner(null); setCode(null); }
    setBusy(false);
    setConfirmUnpair(false);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="partener">
      <SubHeader title={t('partner.title')} onBack={() => navigate(gotoPath('cont'))} testIdBack="partener-back" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <p className="text-sm text-ink2 leading-relaxed">{t('partner.intro')}</p>

        {partner ? (
          <div className="pulse-card p-5 space-y-4" data-testid="partener-linked">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl border border-volt/50 text-volt">
                <Users className="w-5 h-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-ink">
                {t('partner.linkedWith', { name: partner.name || t('partner.fallbackName') })}
              </span>
            </div>
            <p className="text-sm text-ink2">{t('partner.howItWorks')}</p>
            {confirmUnpair ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmUnpair(false)} className="flex-1 py-2.5 rounded-xl border border-lineStrong text-sm font-semibold text-ink">
                  {t('partner.unpairCancel')}
                </button>
                <button type="button" disabled={busy} onClick={() => void handleUnpair()} data-testid="partener-unpair-accept" className="flex-1 py-2.5 rounded-xl bg-brick text-paper text-sm font-semibold disabled:opacity-60">
                  {t('partner.unpairAccept')}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmUnpair(true)} data-testid="partener-unpair" className="w-full py-2.5 text-brick text-sm">
                {t('partner.unpairCta')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="pulse-card p-5 space-y-2">
              <label htmlFor="partener-name" className="block text-sm font-semibold text-ink">{t('partner.nameLabel')}</label>
              <input
                id="partener-name"
                type="text"
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('partner.namePlaceholder')}
                className="pulse-field w-full px-3 py-2 rounded-xl text-sm"
                data-testid="partener-name"
              />
            </div>

            <div className="pulse-card p-5 space-y-3">
              {code ? (
                <>
                  <p className="text-sm text-ink2">{t('partner.codeShare')}</p>
                  <p className="font-mono text-3xl font-bold tracking-[0.3em] text-ink text-center" data-testid="partener-code">{code}</p>
                  <p className="text-xs text-ink3 text-center">{t('partner.codeWaiting')}</p>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!nameOk || busy}
                  onClick={() => void handleCreate()}
                  data-testid="partener-create"
                  className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold disabled:opacity-50"
                >
                  {t('partner.createCta')}
                </button>
              )}
            </div>

            {!code && (
              <div className="pulse-card p-5 space-y-3">
                <label htmlFor="partener-code-input" className="block text-sm font-semibold text-ink">{t('partner.haveCode')}</label>
                <input
                  id="partener-code-input"
                  type="text"
                  value={entered}
                  maxLength={6}
                  autoCapitalize="characters"
                  onChange={(e) => { setEntered(e.target.value.toUpperCase()); setJoinError(null); }}
                  className="pulse-field w-full px-3 py-2 rounded-xl text-base font-mono tracking-[0.3em] uppercase"
                  data-testid="partener-code-input"
                />
                {joinError && (
                  <p className="text-sm text-brick" role="alert" data-testid="partener-join-error">
                    {t(`partner.joinError.${joinError}`)}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!nameOk || entered.trim().length !== 6 || busy}
                  onClick={() => void handleJoin()}
                  data-testid="partener-join"
                  className="w-full py-3 bg-paper2 border border-lineStrong rounded-xl text-ink text-base font-semibold disabled:opacity-50"
                >
                  {t('partner.joinCta')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
