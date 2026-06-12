// ══ NOUTATI — Announcements / What's new (founder→users channel) ════════════
// Founder feature 2026-06-12 ("Adauga la Account un buton... Aici o sa punem
// patch notes si anunturile oficiale."). An IN-APP, READ-ONLY announcements
// screen reachable from the Account tab: the founder publishes official
// announcements + patch notes to a Firebase RTDB node; users READ them here.
// (Distinct from the existing Support row, which is user→founder contact.)
//
// Data: REST GET of the public `/announcements` node (NO SDK, per ADR 002) via
// src/react/lib/announcements.ts — newest-first, pinned cards on top. The last
// good list is cached locally so the screen paints instantly + works offline; a
// failed/offline fetch falls back to that cache with a friendly retry.
//
// States: loading skeleton → list / empty ("Nicio noutate inca") / error (retry,
// still shows any cached cards). Opening the screen marks the newest entry as
// seen (clears the Account unseen-dot). Body is rendered as PLAIN TEXT split on
// newlines — never as raw HTML (no injection from founder-published content).
//
// i18n: every visible string via t() (announcements.* keys, en + ro). Dates are
// formatted at runtime from the ISO `date` per locale (no RO month literals in
// source — see formatDate, mirrors WeightLogList).

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Pin, RefreshCw, WifiOff } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import {
  fetchAnnouncements,
  markAnnouncementsSeen,
  readCachedAnnouncements,
  type Announcement,
} from '../../../lib/announcements';
import { t, getCurrentLocale } from '../../../../i18n/index.js';

// Month abbreviations per locale — mirrors WeightLogList (RO no-diacritics,
// 'noi' not 'nov'; EN standard fitness short months). Kept as token arrays so a
// runtime date never hardcodes a localized month sentence in source.
const MONTH_RO_SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
const MONTH_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO date → "12 Jun 2026" (EN) / "12 iun 2026" (RO). Empty/invalid → ''. */
function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = getCurrentLocale() === 'en' ? MONTH_EN_SHORT : MONTH_RO_SHORT;
  const month = months[d.getMonth()] ?? '';
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

type LoadState = 'loading' | 'loaded' | 'error';

function AnnouncementCard({ item }: { item: Announcement }): JSX.Element {
  const date = formatDate(item.date);
  // Body as plain text: split on newlines into paragraphs (safe — React escapes
  // text). Blank lines are dropped; a single-line body renders as one paragraph.
  const paragraphs = item.body.split('\n').map((s) => s.trim()).filter(Boolean);
  return (
    <article
      className="pulse-card p-4 animate-card-rise"
      data-testid={`announcement-card-${item.id}`}
    >
      <div className="flex items-start gap-2 mb-1.5">
        {item.pinned && (
          <span
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--aqua-ink)] flex-shrink-0 mt-1"
            data-testid={`announcement-pinned-${item.id}`}
          >
            <Pin className="w-3 h-3" aria-hidden="true" />
            {t('announcements.pinned')}
          </span>
        )}
        {date && (
          <span className="text-[11px] text-ink3 font-mono ml-auto flex-shrink-0 mt-1">
            {date}
          </span>
        )}
      </div>
      {item.title && (
        <h2 className="font-display font-bold text-ink leading-snug mb-1.5">{item.title}</h2>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-ink2 leading-relaxed whitespace-pre-line mb-1.5 last:mb-0">
          {p}
        </p>
      ))}
    </article>
  );
}

export function Noutati(): JSX.Element {
  const navigate = useNavigate();
  // Seed from the local cache so the screen paints instantly (offline-first),
  // then refresh from the network.
  const [list, setList] = useState<Announcement[]>(() => readCachedAnnouncements());
  const [state, setState] = useState<LoadState>('loading');
  const [offline, setOffline] = useState(false);

  async function load(): Promise<void> {
    setState('loading');
    const res = await fetchAnnouncements();
    setList(res.list);
    setOffline(res.fromCache);
    setState(res.status === 'ok' ? 'loaded' : 'error');
    // Acknowledge the newest entry as seen (clears the Account unseen-dot).
    markAnnouncementsSeen(res.list);
  }

  useEffect(() => {
    void load();
    // Mount-once: the screen fetches on open. Re-fetch is via the retry button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = state === 'loaded' && list.length === 0;
  const showError = state === 'error';

  return (
    <section className="min-h-screen flex flex-col" data-testid="cont-noutati">
      <SubHeader
        title={t('announcements.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="cont-noutati-back"
      />

      <div className="flex-1 overflow-y-auto p-5 pb-[var(--app-bottom-chrome)]">
        <p className="text-xs text-ink2 mb-4 leading-relaxed">{t('announcements.intro')}</p>

        {/* LOADING — skeleton cards (only when nothing cached to show yet). */}
        {state === 'loading' && list.length === 0 && (
          <div className="space-y-3" data-testid="announcements-loading" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pulse-card p-4">
                <div className="h-3 w-20 rounded bg-line mb-3" />
                <div className="h-4 w-3/4 rounded bg-line mb-2" />
                <div className="h-3 w-full rounded bg-line mb-1.5" />
                <div className="h-3 w-5/6 rounded bg-line" />
              </div>
            ))}
            <span className="sr-only">{t('announcements.loading')}</span>
          </div>
        )}

        {/* ERROR / OFFLINE — friendly banner + retry. Any cached cards still
            render below so the user is never left with a blank screen. */}
        {showError && (
          <div
            className="pulse-card p-4 mb-3 flex items-start gap-3"
            data-testid="announcements-error"
            role="status"
          >
            <WifiOff className="w-5 h-5 text-ink3 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink mb-0.5">
                {offline && list.length > 0
                  ? t('announcements.error.staleTitle')
                  : t('announcements.error.title')}
              </p>
              <p className="text-xs text-ink2 leading-relaxed mb-2.5">
                {t('announcements.error.body')}
              </p>
              <button
                type="button"
                onClick={() => void load()}
                data-testid="announcements-retry"
                className="press-feedback inline-flex items-center gap-1.5 text-sm font-semibold text-brick"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                {t('announcements.error.retry')}
              </button>
            </div>
          </div>
        )}

        {/* EMPTY — no announcements published yet (and no error). */}
        {isEmpty && !showError && (
          <div
            className="flex flex-col items-center justify-center py-12 text-center animate-card-rise"
            data-testid="announcements-empty"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklab, var(--brick) 18%, transparent), transparent 70%)',
              }}
            >
              <Megaphone className="w-7 h-7 text-brick" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-ink mb-1">{t('announcements.emptyTitle')}</p>
            <p className="text-sm text-ink2 max-w-[280px]">{t('announcements.emptyBody')}</p>
          </div>
        )}

        {/* LIST — pinned-first, newest-first cards. */}
        {list.length > 0 && (
          <div className="space-y-3" data-testid="announcements-list">
            {list.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
