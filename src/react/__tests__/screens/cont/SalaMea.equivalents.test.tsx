// ══ SALA MEA — "acelasi aparat" editor (founder 2026-08-28) ══════════════════
// His pec fly history was split across three library entries for ONE machine, the
// fragments disagreeing 23 kg vs 60 kg. This editor is where he declares the merge.
// Only exercises he has actually LOGGED are offered (no library dump), and a name
// stays visible after being folded so the mapping can be undone.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SalaMea } from '../../../routes/screens/cont/SalaMea';
import { DB } from '../../../../db.js';
import { GYMS_KEY, getGymsState, gymEquivalentFor } from '../../../../engine/dp/gymProfile.js';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

const TS = 1787000000000;

function renderSala() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/sala-mea']}>
      <Routes>
        <Route path="/app/cont/sala-mea" element={<SalaMea />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  // dp-gyms + logs are SYNC_KEYS — each DB.set arms a 3s syncToFirebase timer
  // (firebase.js:603) that would outlive this file and fire at pool teardown.
  window._suppressFirebaseSync = true;
  setLocale('ro');
  _resetI18nCache();
  setLocale('ro');
  DB.set(GYMS_KEY, {
    activeId: 'gym_mygym',
    gyms: { gym_mygym: { id: 'gym_mygym', name: 'MyGym Domnesti', stacks: {} } },
  });
  // His real split: same machine logged under two names, wildly different loads.
  DB.set('logs', [
    { ex: 'Pec Deck / Cable Fly', w: 55, reps: '8', ts: TS, session: TS },
    { ex: 'Cable Fly', w: 18, reps: '14', ts: TS - 1000, session: TS - 1000 },
    { ex: 'Machine Shoulder Press', w: 80, reps: '8', ts: TS - 2000, session: TS - 2000 },
  ]);
});

describe('SalaMea — same-machine equivalences', () => {
  it('offers only the exercises he has logged', () => {
    renderSala();
    expect(screen.getByTestId('sala-mea-equivalents')).toBeInTheDocument();
    expect(screen.getByTestId('sala-mea-eq-Cable Fly')).toBeInTheDocument();
    expect(screen.getByTestId('sala-mea-eq-Machine Shoulder Press')).toBeInTheDocument();
    // A library entry he never logged is NOT dumped into the list.
    expect(screen.queryByTestId('sala-mea-eq-Barbell Back Squat (High Bar)')).toBeNull();
  });

  it('declaring the merge persists it to the ACTIVE gym', () => {
    renderSala();
    fireEvent.change(screen.getByTestId('sala-mea-eq-Cable Fly-select'), {
      target: { value: 'Pec Deck / Cable Fly' },
    });
    expect(getGymsState().gyms.gym_mygym!.equivalents).toEqual({
      'Cable Fly': 'Pec Deck / Cable Fly',
    });
    expect(gymEquivalentFor('Cable Fly')).toBe('Pec Deck / Cable Fly');
  });

  it('the mapping can be undone (row stays visible after folding)', () => {
    renderSala();
    const select = () => screen.getByTestId('sala-mea-eq-Cable Fly-select') as HTMLSelectElement;
    fireEvent.change(select(), { target: { value: 'Pec Deck / Cable Fly' } });
    expect(select().value).toBe('Pec Deck / Cable Fly');
    fireEvent.change(select(), { target: { value: '' } });
    expect(gymEquivalentFor('Cable Fly')).toBeNull();
    expect(getGymsState().gyms.gym_mygym!.equivalents).toBeUndefined();
  });

  it('a name that is a TARGET is not also offered as a source (no chains)', () => {
    renderSala();
    fireEvent.change(screen.getByTestId('sala-mea-eq-Cable Fly-select'), {
      target: { value: 'Pec Deck / Cable Fly' },
    });
    // The target row disappears from the source list — it cannot be re-mapped.
    expect(screen.queryByTestId('sala-mea-eq-Pec Deck / Cable Fly')).toBeNull();
  });

  it('no active gym → the section does not render at all', () => {
    DB.set(GYMS_KEY, { activeId: null, gyms: {} });
    renderSala();
    expect(screen.queryByTestId('sala-mea-equivalents')).toBeNull();
  });
});
