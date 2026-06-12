// ══ APARATE LIPSA TESTS — task_07 §B missing equipment Set + persist stub ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AparateLipsa } from '../../../routes/screens/antrenor/AparateLipsa';
import {
  getMissingEquipment,
  setMissingEquipment,
  getMissingEquipmentExercises,
  addMissingEquipmentExercise,
} from '../../../../engine/schedule/scheduleAdapter.js';
// i18n locale pin — these specs assert RO equipment labels (Banca inclinata /
// Gantere / etc) + RO chrome. Force RO so the i18n indirection resolves to the
// RO assertion targets. EN coverage is locked separately by
// i18nNoRoLeak.test.tsx. setLocale AFTER clear (it persists to localStorage).
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

beforeEach(() => {
  localStorage.clear();
  _resetI18nCache();
  setLocale('ro');
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

// initState: location.state passed at entry. `from: 'workout'` = workout flow
// origin (CevaNuMerge); undefined = Cont/settings entry.
function renderLipsa(initState?: Record<string, unknown>) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/app/antrenor/aparate-lipsa', state: initState },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/aparate-lipsa" element={<AparateLipsa />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AparateLipsa — render', () => {
  it('renders heading "Aparate lipsa" verbatim mockup', () => {
    renderLipsa();
    expect(
      screen.getByRole('heading', { name: /^Aparate lipsa$/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderLipsa();
    expect(screen.getByTestId('aparate-lipsa-back')).toBeInTheDocument();
  });

  it('renders flat 10 checkbox list per Slice 1.7 mockup naming', () => {
    renderLipsa();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(10);
  });

  it('renders Save button', () => {
    renderLipsa();
    expect(screen.getByTestId('aparate-save')).toBeInTheDocument();
  });

  // L-1 security — intro bold fragment is a real JSX <strong>, NOT
  // dangerouslySetInnerHTML (removes the latent stored-XSS sink).
  it('renders intro with bold "nu le ai" fragment via real <strong> (no innerHTML)', () => {
    const { container } = renderLipsa();
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('nu le ai');
    const intro = container.querySelector('p.text-base.text-ink2');
    expect(intro?.textContent).toBe(
      'Bifeaza aparatele pe care nu le ai. Coach-ul va alege exercitii alternative si nu le va propune in viitor.'
    );
  });

  it('default toate items NU sunt checked', () => {
    renderLipsa();
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it('renders verbatim mockup item labels (Slice 1.7)', () => {
    renderLipsa();
    expect(screen.getByLabelText('Banca inclinata')).toBeInTheDocument();
    expect(screen.getByLabelText('Banca plana')).toBeInTheDocument();
    expect(screen.getByLabelText('Bara halterelor')).toBeInTheDocument();
    expect(screen.getByLabelText('Gantere')).toBeInTheDocument();
    expect(screen.getByLabelText('Power rack / Smith machine')).toBeInTheDocument();
    expect(screen.getByLabelText('Banda elastica')).toBeInTheDocument();
  });
});

describe('AparateLipsa — toggle Set behavior', () => {
  it('check adauga item la missing set', () => {
    renderLipsa();
    const gantere = screen.getByLabelText('Gantere');
    fireEvent.click(gantere);
    expect(gantere).toBeChecked();
  });

  it('check second time scoate din set (round-trip)', () => {
    renderLipsa();
    const banda = screen.getByLabelText('Banda elastica');
    fireEvent.click(banda);
    expect(banda).toBeChecked();
    fireEvent.click(banda);
    expect(banda).not.toBeChecked();
  });

  it('toggling multiple items independent', () => {
    renderLipsa();
    const banca = screen.getByLabelText('Banca inclinata');
    const legPress = screen.getByLabelText('Leg press');
    fireEvent.click(banca);
    fireEvent.click(legPress);
    expect(banca).toBeChecked();
    expect(legPress).toBeChecked();
  });
});

describe('AparateLipsa — navigation flow (A2 H-4 origin-aware)', () => {
  it('Cont entry (no state): Save returns la Cont, NU workout-preview', () => {
    renderLipsa();
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/cont');
  });

  // 06.AD.025 — the workout hand-off now forwards equipmentContext.busyCoarseTypes
  // (the channel WorkoutPreview actually reads), NOT a dead raw-ids list. The
  // selected picker IDs are mapped to coarse equipment_type(s).
  it('workout flow entry (from: workout): Save goes la workout-preview cu busyCoarseTypes', () => {
    renderLipsa({ from: 'workout' });
    fireEvent.click(screen.getByLabelText('Bara halterelor')); // → barbell
    fireEvent.click(screen.getByLabelText('Leg press')); // → machine
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('busyCoarseTypes');
    expect(probe.textContent).toContain('barbell');
    expect(probe.textContent).toContain('machine');
  });

  it('workout flow Save cu zero selections propagates empty busyCoarseTypes array', () => {
    renderLipsa({ from: 'workout' });
    fireEvent.click(screen.getByTestId('aparate-save'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"busyCoarseTypes":[]');
  });
});

describe('AparateLipsa — persistence (A2 H-4 wv2-missing-equipment)', () => {
  it('Save persists selectia in localStorage (round-trip)', () => {
    renderLipsa();
    fireEvent.click(screen.getByLabelText('Gantere'));
    fireEvent.click(screen.getByLabelText('Leg press'));
    fireEvent.click(screen.getByTestId('aparate-save'));
    expect(getMissingEquipment().sort()).toEqual(['gantere', 'leg-press']);
  });

  it('hydrates checkbox state din persistenta la mount (survives reload)', () => {
    setMissingEquipment(['gantere', 'banda-elastica']);
    renderLipsa();
    expect(screen.getByLabelText('Gantere')).toBeChecked();
    expect(screen.getByLabelText('Banda elastica')).toBeChecked();
    expect(screen.getByLabelText('Leg press')).not.toBeChecked();
  });

  it('Save cu zero selections clears persistenta (deselect round-trip)', () => {
    setMissingEquipment(['gantere']);
    renderLipsa();
    // deselect ganterele hydrate
    fireEvent.click(screen.getByLabelText('Gantere'));
    fireEvent.click(screen.getByTestId('aparate-save'));
    expect(getMissingEquipment()).toEqual([]);
  });
});

describe('AparateLipsa — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderLipsa();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});

// Founder Busy/Missing redesign 2026-06-12 — per-EXERCISE equipment-missing list.
describe('AparateLipsa — per-exercise equipment-missing list', () => {
  it('hides the section when nothing is remembered', () => {
    renderLipsa();
    expect(screen.queryByTestId('equip-missing-exercises')).not.toBeInTheDocument();
  });

  it('lists remembered-missing exercises (engineName-keyed rows)', () => {
    addMissingEquipmentExercise('Leg Extension');
    renderLipsa();
    expect(screen.getByTestId('equip-missing-exercises')).toBeInTheDocument();
    expect(screen.getByTestId('equip-missing-row-Leg Extension')).toBeInTheDocument();
  });

  it('remove drops the entry from the list + from storage (available again)', () => {
    addMissingEquipmentExercise('Leg Extension');
    addMissingEquipmentExercise('Pec Deck / Cable Fly');
    renderLipsa();
    fireEvent.click(screen.getByTestId('equip-missing-remove-Leg Extension'));
    // Removed from the rendered list...
    expect(screen.queryByTestId('equip-missing-row-Leg Extension')).not.toBeInTheDocument();
    // ...the other entry stays...
    expect(screen.getByTestId('equip-missing-row-Pec Deck / Cable Fly')).toBeInTheDocument();
    // ...and persistence reflects it.
    expect(getMissingEquipmentExercises()).not.toContain('Leg Extension');
    expect(getMissingEquipmentExercises()).toContain('Pec Deck / Cable Fly');
  });
});
