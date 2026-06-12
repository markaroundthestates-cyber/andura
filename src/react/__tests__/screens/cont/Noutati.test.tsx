// ══ Noutati screen — announcements list / empty / error + back nav ══════════
// The network lib is mocked so the screen is tested in isolation: list renders
// pinned-first/newest-first, the empty + error states surface, retry re-fetches,
// and the back button returns to Account. RO locale pinned (matches the other
// Settings-screen specs); EN-clean rendering is covered by the i18n no-leak gate.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
