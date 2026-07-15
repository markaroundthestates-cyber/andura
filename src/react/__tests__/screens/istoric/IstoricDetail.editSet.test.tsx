// ══ ISTORIC DETAIL — EDIT-LOG inline set correction (founder 2026-07-15) ═════════
// A mis-logged set can be corrected from History: tapping a row's "fix" affordance
// swaps its kg/reps cells for inputs; saving routes through editHistorySet (summary
// + durable DB('logs') row). Metric (seconds) sets expose no edit affordance.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { IstoricDetail } from '../../../routes/screens/istoric/IstoricDetail';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LastSessionSummary } from '../../../stores/workoutStore';
import { DB } from '../../../../db.js';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

const SESSION_TS = 1784000000000;
const SET1_TS = SESSION_TS + 1000;

function sessionFixture(): LastSessionSummary {
  return {
    title: 'Push',
    meta: '2 seturi · 20 min',
    ts: SESSION_TS,
    exercises: [
      {
        exerciseId: 'msp',
        exerciseName: 'Machine Shoulder Press',
        engineName: 'Machine Shoulder Press',
        sets: [
          { kg: 60, reps: 10, rating: 'potrivit', timestamp: SET1_TS },
          { kg: 40, reps: 0, rating: 'potrivit', timestamp: SET1_TS + 500, durationSec: 45 },
        ],
        totalVolume: 600,
        peakOneRM: 80,
      },
    ],
  } as LastSessionSummary;
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/app/istoric/${SESSION_TS}`]}>
      <Routes>
        <Route path="/app/istoric/:sessionId" element={<IstoricDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null,
    lastSession: null, streak: 0, sessionsHistory: [sessionFixture()], deletedSessionTs: [],
  });
  DB.set('logs', [
    { date: '2026-07-14', ex: 'Machine Shoulder Press', w: 60, kg: 60, set: 1, sets: 1, reps: '10', ts: SET1_TS, session: SESSION_TS },
  ]);
});

describe('IstoricDetail — edit a logged set', () => {
  it('fix → change kg/reps → save updates the summary + the durable logs row', () => {
    renderDetail();
    fireEvent.click(screen.getByTestId('detail-set-editbtn-msp-0'));
    fireEvent.change(screen.getByTestId('detail-set-edit-kg'), { target: { value: '50' } });
    fireEvent.change(screen.getByTestId('detail-set-edit-reps'), { target: { value: '12' } });
    fireEvent.click(screen.getByTestId('detail-set-edit-save'));

    const st = useWorkoutStore.getState();
    expect(st.sessionsHistory[0]!.exercises![0]!.sets[0]).toMatchObject({ kg: 50, reps: 12 });
    const logs = DB.get('logs') as Array<{ w: number; reps: string; ts: number }>;
    expect(logs[0]).toMatchObject({ w: 50, reps: '12', ts: SET1_TS });
    // The editor closed; the corrected row renders the new values.
    expect(screen.queryByTestId('detail-set-edit-kg')).toBeNull();
    expect(screen.getByTestId('detail-set-msp-0').textContent).toContain('50');
  });

  it('cancel leaves everything untouched', () => {
    renderDetail();
    fireEvent.click(screen.getByTestId('detail-set-editbtn-msp-0'));
    fireEvent.change(screen.getByTestId('detail-set-edit-kg'), { target: { value: '99' } });
    fireEvent.click(screen.getByTestId('detail-set-edit-cancel'));
    expect(useWorkoutStore.getState().sessionsHistory[0]!.exercises![0]!.sets[0]).toMatchObject({ kg: 60, reps: 10 });
  });

  it('a metric (seconds) set has no edit affordance', () => {
    renderDetail();
    expect(screen.queryByTestId('detail-set-editbtn-msp-1')).toBeNull();
  });
});
