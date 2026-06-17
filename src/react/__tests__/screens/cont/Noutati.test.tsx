// ══ Noutati screen — announcements list / empty / error + back nav ══════════
// The network lib is mocked so the screen is tested in isolation: list renders
// pinned-first/newest-first, the empty + error states surface, retry re-fetches,
// and the back button returns to Account. RO locale pinned (matches the other
// Settings-screen specs); EN-clean rendering is covered by the i18n no-leak gate.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Noutati } from '../../../routes/screens/cont/Noutati';
import * as announcements from '../../../lib/announcements';
import type { Announcement, AnnouncementsResult } from '../../../lib/announcements';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

// Mock the data lib — the screen must not hit the network. Pure helpers
// (markAnnouncementsSeen / readCachedAnnouncements) are stubbed no-ops; only
// fetchAnnouncements is driven per test.
vi.mock('../../../lib/announcements', () => ({
  fetchAnnouncements: vi.fn(),
  markAnnouncementsSeen: vi.fn(),
  readCachedAnnouncements: vi.fn(() => []),
}));

const mockFetch = vi.mocked(announcements.fetchAnnouncements);
const mockMarkSeen = vi.mocked(announcements.markAnnouncementsSeen);
const mockReadCache = vi.mocked(announcements.readCachedAnnouncements);

function mk(partial: Partial<Announcement> & { id: string }): Announcement {
  return { title: 'T', body: 'B', date: '2026-06-01', pinned: false, ts: 0, ...partial };
}

function result(over: Partial<AnnouncementsResult>): AnnouncementsResult {
  return { status: 'ok', list: [], fromCache: false, ...over };
}

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/noutati']}>
      <Routes>
        <Route path="/app/cont/noutati" element={<Noutati />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  _resetI18nCache();
  setLocale('ro');
  mockFetch.mockReset();
  mockMarkSeen.mockReset();
  mockReadCache.mockReset();
  mockReadCache.mockReturnValue([]);
});

describe('Noutati — list rendering', () => {
  it('renders fetched announcements pinned-first / newest-first', async () => {
    // The screen renders whatever order the lib returns (lib owns sorting).
    // Provide the already-sorted order the lib guarantees.
    mockFetch.mockResolvedValue(
      result({
        list: [
          mk({ id: 'pin', title: 'Pinned one', pinned: true, ts: Date.parse('2026-03-15'), date: '2026-03-15' }),
          mk({ id: 'new', title: 'Newest', ts: Date.parse('2026-06-01'), date: '2026-06-01' }),
          mk({ id: 'old', title: 'Oldest', ts: Date.parse('2026-01-10'), date: '2026-01-10' }),
        ],
      }),
    );
    renderScreen();
    await waitFor(() => {
      expect(screen.getByTestId('announcements-list')).toBeInTheDocument();
    });
    const cards = screen.getByTestId('announcements-list').querySelectorAll('article');
    expect(cards).toHaveLength(3);
    // DOM order == provided order (pinned, newest, oldest).
    expect(cards[0]?.getAttribute('data-testid')).toBe('announcement-card-pin');
    expect(cards[1]?.getAttribute('data-testid')).toBe('announcement-card-new');
    expect(cards[2]?.getAttribute('data-testid')).toBe('announcement-card-old');
    // The pinned card shows its pinned marker.
    expect(screen.getByTestId('announcement-pinned-pin')).toBeInTheDocument();
  });

  it('renders a multi-line body as separate paragraphs (no raw HTML)', async () => {
    mockFetch.mockResolvedValue(
      result({ list: [mk({ id: 'a', title: 'Heading', body: 'line one\n<b>line two</b>' })] }),
    );
    renderScreen();
    const card = await screen.findByTestId('announcement-card-a');
    const paras = card.querySelectorAll('p');
    expect(paras).toHaveLength(2);
    // Angle brackets are rendered as text, not parsed into a <b> element.
    expect(card.querySelector('b')).toBeNull();
    expect(card.textContent).toContain('<b>line two</b>');
  });

  it('marks announcements seen on open', async () => {
    const list = [mk({ id: 'a', ts: Date.parse('2026-06-01') })];
    mockFetch.mockResolvedValue(result({ list }));
    renderScreen();
    await waitFor(() => expect(mockMarkSeen).toHaveBeenCalled());
    expect(mockMarkSeen).toHaveBeenCalledWith(list);
  });
});

describe('Noutati — empty + error states', () => {
  it('shows the empty state when the fetch returns no announcements', async () => {
    mockFetch.mockResolvedValue(result({ list: [], status: 'ok' }));
    renderScreen();
    await waitFor(() => {
      expect(screen.getByTestId('announcements-empty')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('announcements-list')).not.toBeInTheDocument();
  });

  it('shows the error banner + retry when the fetch fails (no cache)', async () => {
    mockFetch.mockResolvedValue(result({ status: 'error', list: [], fromCache: true }));
    renderScreen();
    await waitFor(() => {
      expect(screen.getByTestId('announcements-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('announcements-retry')).toBeInTheDocument();
  });

  it('error with cached cards still renders the cached list under the banner', async () => {
    mockFetch.mockResolvedValue(
      result({ status: 'error', fromCache: true, list: [mk({ id: 'cached', title: 'From cache' })] }),
    );
    renderScreen();
    await waitFor(() => expect(screen.getByTestId('announcements-error')).toBeInTheDocument());
    expect(screen.getByTestId('announcement-card-cached')).toBeInTheDocument();
  });

  it('retry re-invokes the fetch and can recover to a list', async () => {
    mockFetch.mockResolvedValueOnce(result({ status: 'error', list: [], fromCache: true }));
    renderScreen();
    await waitFor(() => expect(screen.getByTestId('announcements-error')).toBeInTheDocument());

    mockFetch.mockResolvedValueOnce(result({ status: 'ok', list: [mk({ id: 'fresh', title: 'Fresh' })] }));
    fireEvent.click(screen.getByTestId('announcements-retry'));
    await waitFor(() => expect(screen.getByTestId('announcement-card-fresh')).toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('Noutati — navigation', () => {
  it('back button returns to the Account tab', async () => {
    mockFetch.mockResolvedValue(result({ list: [] }));
    renderScreen();
    fireEvent.click(screen.getByTestId('cont-noutati-back'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
    });
  });

  it('renders the heading "Noutati" under RO locale', async () => {
    mockFetch.mockResolvedValue(result({ list: [] }));
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Noutati', level: 1 })).toBeInTheDocument();
  });
});

// Off-by-one west of UTC: pre-fix formatDate did `new Date('2026-06-17')` (which
// is UTC-midnight) then read getDate()/getMonth() — so any user west of UTC saw
// the PREVIOUS day. The fix parses the date-only ISO by string split (no
// new Date(iso)), so the label is timezone-independent. This test simulates a
// negative-offset (west-of-UTC) runtime by stubbing the global Date so a
// date-only string lands one local day earlier (exactly what a real west-of-UTC
// engine does) — the rendered card must still show the literal calendar day.
describe('Noutati — date renders timezone-independently (off-by-one west of UTC)', () => {
  const RealDate = Date;

  beforeEach(() => {
    setLocale('en'); // assert against EN month tokens for a stable label
    // Stub: `new Date('YYYY-MM-DD')` (date-only) → an instance whose LOCAL
    // accessors (getDate/getMonth/getFullYear) report the day BEFORE the literal
    // — exactly what a real west-of-UTC engine returns for a UTC-midnight value.
    // Forced explicitly (not via host TZ) so the test is deterministic on any
    // machine, including this east-of-UTC dev box. Any other Date use passes
    // through to RealDate unchanged. The fix avoids new Date(iso) entirely, so
    // the stub never affects its output (passes); pre-fix reads these accessors
    // (fails — shows the prior day).
    vi.stubGlobal('Date', class extends RealDate {
      _west?: { d: number; m: number; y: number };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        if (args.length === 1 && typeof args[0] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(args[0])) {
          super(args[0]);
          // Compute the day-before of the literal parts (1-indexed month input).
          const parts = args[0].split('-');
          const yy = Number(parts[0]);
          const mm = Number(parts[1]);
          const dd = Number(parts[2]);
          const prior = new RealDate(RealDate.UTC(yy, mm - 1, dd));
          prior.setUTCDate(prior.getUTCDate() - 1);
          this._west = { d: prior.getUTCDate(), m: prior.getUTCMonth(), y: prior.getUTCFullYear() };
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(...(args as [any]));
      }
      override getDate(): number { return this._west ? this._west.d : super.getDate(); }
      override getMonth(): number { return this._west ? this._west.m : super.getMonth(); }
      override getFullYear(): number { return this._west ? this._west.y : super.getFullYear(); }
    } as unknown as DateConstructor);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setLocale('ro');
  });

  it("renders '17 Jun 2026' for date '2026-06-17' (not 16) under a west-of-UTC runtime", async () => {
    mockFetch.mockResolvedValue(result({ list: [mk({ id: 'tz', title: 'TZ', date: '2026-06-17' })] }));
    renderScreen();
    const card = await screen.findByTestId('announcement-card-tz');
    expect(card.textContent).toContain('17 Jun 2026');
    expect(card.textContent).not.toContain('16 Jun');
  });

  it('renders a normal date correctly under the same runtime', async () => {
    mockFetch.mockResolvedValue(result({ list: [mk({ id: 'norm', title: 'N', date: '2026-01-10' })] }));
    renderScreen();
    const card = await screen.findByTestId('announcement-card-norm');
    expect(card.textContent).toContain('10 Jan 2026');
  });
});
