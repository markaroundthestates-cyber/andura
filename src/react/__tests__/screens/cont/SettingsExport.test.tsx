// Phase 6 task_16 — SettingsExport sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsExport } from '../../../routes/screens/cont/SettingsExport';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-export']}>
      <Routes>
        <Route path="/app/cont/settings-export" element={<SettingsExport />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
  vi.restoreAllMocks();
});

describe('SettingsExport — render + download flow', () => {
  it('renders heading "Descarca datele tale"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Descarca datele tale/i, level: 1 })).toBeInTheDocument();
  });

  it('renders content list cu 6 categorii export', () => {
    renderScreen();
    expect(screen.getByText(/Profil si Big 6/)).toBeInTheDocument();
    expect(screen.getByText(/Istoric sesiuni/)).toBeInTheDocument();
    expect(screen.getByText(/Clase aerobice/)).toBeInTheDocument();
    expect(screen.getByText(/Nutritie zilnica/)).toBeInTheDocument();
    expect(screen.getByText(/Preferinte/)).toBeInTheDocument();
    expect(screen.getByText(/Calendar saptamanal/)).toBeInTheDocument();
  });

  it('renders Descarca JSON CTA', () => {
    renderScreen();
    expect(screen.getByTestId('settings-export-trigger')).toBeInTheDocument();
  });

  it('export click triggers download + shows success status', async () => {
    // Mock URL.createObjectURL + anchor click. jsdom does NOT implement
    // <a download> navigation, so a real anchor.click() logs "Not implemented:
    // navigation" and can flake under --coverage. Stub the click to keep this
    // deterministic — we only assert the download was wired, not navigation.
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderScreen();
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
    expect(clickSpy).toHaveBeenCalled();
    expect(screen.getByTestId('settings-export-success')).toBeInTheDocument();
    expect(screen.getByTestId('settings-export-success').textContent).toMatch(/Fisier descarcat/);
  });

  it('export error path renders error status', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: () => { throw new Error('blob fail'); },
      configurable: true,
    });
    renderScreen();
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(screen.getByTestId('settings-export-error')).toBeInTheDocument());
  });

  it('S-02 — export includes unprefixed legacy keys (logs/coach-decisions/pr-records/pain-cdl)', async () => {
    // GDPR Art. 20: prior wv2-only collection omitted these canonical keys.
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Bench', ts: 1 }]));
    localStorage.setItem('coach-decisions', JSON.stringify([{ id: 'd1' }]));
    localStorage.setItem('pr-records', JSON.stringify({ Bench: 100 }));
    localStorage.setItem('pain-cdl', JSON.stringify([{ region: 'shoulder' }]));
    localStorage.setItem('cdl-patterns', JSON.stringify([{ p: 1 }]));
    localStorage.setItem('applied-patterns', JSON.stringify([{ a: 1 }]));

    // Capture the serialized payload passed to the Blob.
    let captured = '';
    const RealBlob = globalThis.Blob;
    const blobSpy = vi
      .spyOn(globalThis, 'Blob')
      .mockImplementation((parts) => {
        captured = Array.isArray(parts) ? parts.join('') : String(parts);
        return new RealBlob(parts as BlobPart[]);
      });
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {}); // jsdom no-nav

    renderScreen();
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(screen.getByTestId('settings-export-success')).toBeInTheDocument());

    const payload = JSON.parse(captured);
    expect(payload.tier0Keys.logs).toBeDefined();
    expect(payload.tier0Keys['coach-decisions']).toBeDefined();
    expect(payload.tier0Keys['pr-records']).toBeDefined();
    expect(payload.tier0Keys['pain-cdl']).toBeDefined();
    expect(payload.tier0Keys['cdl-patterns']).toBeDefined();
    expect(payload.tier0Keys['applied-patterns']).toBeDefined();
    blobSpy.mockRestore();
  });

  it('XCUT-3 — export includes typed aerobic slot (logged classes)', async () => {
    // aerobicStore was added after the typed export shape; a future persist-key /
    // sweep change must not silently drop a logged-aerobic-class user's classes.
    localStorage.setItem(
      'wv2-aerobic-store',
      JSON.stringify({ state: { sessions: [{ date: '2026-05-30', type: 'spinning', minutes: 45, kcal: 350, ts: 42 }], lastDuration: 45, subjectiveByDate: {} }, version: 1 }),
    );

    let captured = '';
    const RealBlob = globalThis.Blob;
    const blobSpy = vi
      .spyOn(globalThis, 'Blob')
      .mockImplementation((parts) => {
        captured = Array.isArray(parts) ? parts.join('') : String(parts);
        return new RealBlob(parts as BlobPart[]);
      });
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {}); // jsdom no-nav

    renderScreen();
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(screen.getByTestId('settings-export-success')).toBeInTheDocument());

    const payload = JSON.parse(captured);
    // Typed slot present...
    expect(payload.stores.aerobic).toBeDefined();
    expect(Array.isArray(payload.stores.aerobic.sessions)).toBe(true);
    // ...and the raw wv2 key still carried in the tier0 sweep (defence-in-depth).
    expect(payload.tier0Keys['wv2-aerobic-store']).toBeDefined();
    blobSpy.mockRestore();
  });

  it('GDPR Art. 20 — export includes archived sessions store (overflow sessions)', async () => {
    // workoutStore archiveaza overflow sessions in dexieMigration sessions store
    // inainte de slice. Exportul trebuie sa le includa, altfel datele retinute
    // local sunt incomplete in export.
    vi.doMock('../../../lib/dexieMigration', () => ({
      getArchivedSessions: vi.fn(async () => [
        { ts: 100, archivedAt: 200, kg: 1234 },
      ]),
    }));
    const { SettingsExport: FreshExport } = await import('../../../routes/screens/cont/SettingsExport');

    let captured = '';
    const RealBlob = globalThis.Blob;
    const blobSpy = vi
      .spyOn(globalThis, 'Blob')
      .mockImplementation((parts) => {
        captured = Array.isArray(parts) ? parts.join('') : String(parts);
        return new RealBlob(parts as BlobPart[]);
      });
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {}); // jsdom no-nav

    render(
      <MemoryRouter initialEntries={['/app/cont/settings-export']}>
        <Routes>
          <Route path="/app/cont/settings-export" element={<FreshExport />} />
          <Route path="/app/cont" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(screen.getByTestId('settings-export-success')).toBeInTheDocument());

    const payload = JSON.parse(captured);
    expect(payload.tier1.archivedSessions).toBeDefined();
    expect(payload.tier1.archivedSessions).toHaveLength(1);
    expect(payload.tier1.archivedSessions[0].kg).toBe(1234);
    blobSpy.mockRestore();
    vi.doUnmock('../../../lib/dexieMigration');
    vi.resetModules();
  });

  it('S-02 — export does NOT include firebase auth tokens', async () => {
    localStorage.setItem('firebase-id-token', 'secret-jwt');
    localStorage.setItem('firebase-refresh-token', 'secret-refresh');
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Row', ts: 2 }]));

    let captured = '';
    const RealBlob = globalThis.Blob;
    const blobSpy = vi
      .spyOn(globalThis, 'Blob')
      .mockImplementation((parts) => {
        captured = Array.isArray(parts) ? parts.join('') : String(parts);
        return new RealBlob(parts as BlobPart[]);
      });
    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {}); // jsdom no-nav

    renderScreen();
    fireEvent.click(screen.getByTestId('settings-export-trigger'));
    await waitFor(() => expect(screen.getByTestId('settings-export-success')).toBeInTheDocument());

    expect(captured).not.toContain('secret-jwt');
    expect(captured).not.toContain('secret-refresh');
    expect(captured).not.toContain('firebase-id-token');
    blobSpy.mockRestore();
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
