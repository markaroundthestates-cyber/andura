// ══ ACCOUNT HUBS — regroup 2026-06-12 ═════════════════════════════════════
// Coverage for the four grouped Account hubs that each merge 2-3 former rows
// behind one screen + segmented/stacked control. Asserts: both segment bodies
// reachable (reused screen testids intact), segment toggle swaps the body, and
// the legacy-route `defaultSeg` preselects the matching tab.
//
// RO locale pinned (mirrors ExerciseLibrary/SettingsAppearance scaffolds) +
// MemoryRouter with a LocationProbe for the hub's back-to-Cont navigation.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ExercitiiEchipament } from '../../../routes/screens/cont/hubs/ExercitiiEchipament';
import { DateleMele } from '../../../routes/screens/cont/hubs/DateleMele';
import { ConfidentialitateTermeni } from '../../../routes/screens/cont/hubs/ConfidentialitateTermeni';
import { AjutorDespre } from '../../../routes/screens/cont/hubs/AjutorDespre';
import { useSettingsStore } from '../../../stores/settingsStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* jsdom */ }
  _resetI18nCache();
  setLocale('ro');
  useSettingsStore.getState().reset();
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderHub(path: string, element: JSX.Element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ── HUB 1 — Exercitii & echipament (Biblioteca | Echipament lipsa) ──────────
describe('Hub: Exercitii & echipament', () => {
  it('renders one SubHeader + the segmented control, Biblioteca default', () => {
    renderHub('/app/cont/exercitii-echipament', <ExercitiiEchipament />);
    expect(screen.getByTestId('cont-hub-exercitii-echipament')).toBeInTheDocument();
    expect(screen.getByTestId('cont-hub-exercitii-echipament-seg')).toBeInTheDocument();
    // Default segment = Biblioteca → ExerciseLibrary body present, AparateLipsa not.
    expect(screen.getByTestId('exercise-library')).toBeInTheDocument();
    expect(screen.queryByTestId('aparate-lipsa')).toBeNull();
    expect(screen.getByTestId('cont-hub-exercitii-echipament-seg-biblioteca')).toHaveAttribute('aria-selected', 'true');
  });

  it('switching to Echipament lipsa swaps the body to AparateLipsa', () => {
    renderHub('/app/cont/exercitii-echipament', <ExercitiiEchipament />);
    fireEvent.click(screen.getByTestId('cont-hub-exercitii-echipament-seg-echipament'));
    expect(screen.getByTestId('aparate-lipsa')).toBeInTheDocument();
    expect(screen.queryByTestId('exercise-library')).toBeNull();
    // The reused AparateLipsa Save CTA is intact.
    expect(screen.getByTestId('aparate-save')).toBeInTheDocument();
  });

  it('legacy route defaultSeg="biblioteca" preselects the Library segment', () => {
    renderHub('/app/cont/exercise-library', <ExercitiiEchipament defaultSeg="biblioteca" />);
    expect(screen.getByTestId('exercise-library')).toBeInTheDocument();
  });
});

// ── HUB 2 — Datele mele (Export | Import) ───────────────────────────────────
describe('Hub: Datele mele', () => {
  it('renders Export segment by default', () => {
    renderHub('/app/cont/datele-mele', <DateleMele />);
    expect(screen.getByTestId('cont-hub-datele-mele')).toBeInTheDocument();
    expect(screen.getByTestId('settings-export')).toBeInTheDocument();
    expect(screen.getByTestId('settings-export-trigger')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-import')).toBeNull();
  });

  it('switching to Import swaps to the import body', () => {
    renderHub('/app/cont/datele-mele', <DateleMele />);
    fireEvent.click(screen.getByTestId('cont-hub-datele-mele-seg-import'));
    expect(screen.getByTestId('settings-import')).toBeInTheDocument();
    expect(screen.getByTestId('settings-import-input')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-export')).toBeNull();
  });

  it('legacy route defaultSeg="import" preselects Import', () => {
    renderHub('/app/cont/settings-import', <DateleMele defaultSeg="import" />);
    expect(screen.getByTestId('settings-import')).toBeInTheDocument();
  });
});

// ── HUB 3 — Confidentialitate & termeni (Confidentialitate | Termeni) ───────
describe('Hub: Confidentialitate & termeni', () => {
  it('renders Confidentialitate (privacy) body by default', () => {
    renderHub('/app/cont/confidentialitate-termeni', <ConfidentialitateTermeni />);
    expect(screen.getByTestId('cont-hub-confidentialitate-termeni')).toBeInTheDocument();
    expect(screen.getByTestId('settings-privacy')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-policy-content')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-terms')).toBeNull();
  });

  it('switching to Termeni swaps to the terms body', () => {
    renderHub('/app/cont/confidentialitate-termeni', <ConfidentialitateTermeni />);
    fireEvent.click(screen.getByTestId('cont-hub-confidentialitate-termeni-seg-termeni'));
    expect(screen.getByTestId('settings-terms')).toBeInTheDocument();
    // SettingsTerms own inner T&C/Medical tabs survive embedding.
    expect(screen.getByTestId('terms-tab-tc')).toBeInTheDocument();
    expect(screen.getByTestId('terms-tab-medical')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-privacy')).toBeNull();
  });

  it('legacy route defaultSeg="termeni" preselects Termeni', () => {
    renderHub('/app/cont/settings-terms', <ConfidentialitateTermeni defaultSeg="termeni" />);
    expect(screen.getByTestId('settings-terms')).toBeInTheDocument();
  });
});

// ── HUB 4 — Ajutor & despre (stacked: FAQ + Suport + Despre) ────────────────
describe('Hub: Ajutor & despre (stacked)', () => {
  it('renders FAQ + Support + About bodies all at once (no segments)', () => {
    renderHub('/app/cont/ajutor-despre', <AjutorDespre />);
    expect(screen.getByTestId('cont-hub-ajutor-despre')).toBeInTheDocument();
    // All three reused bodies present simultaneously (stacked).
    expect(screen.getByTestId('settings-faq')).toBeInTheDocument();
    expect(screen.getByTestId('settings-support')).toBeInTheDocument();
    expect(screen.getByTestId('settings-about')).toBeInTheDocument();
    // Representative reused testids from each section.
    expect(screen.getByTestId('support-email')).toBeInTheDocument();
    expect(screen.getByTestId('about-version')).toBeInTheDocument();
  });

  it('has exactly one h1 (the hub header) — embedded bodies drop their own', () => {
    renderHub('/app/cont/ajutor-despre', <AjutorDespre />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
