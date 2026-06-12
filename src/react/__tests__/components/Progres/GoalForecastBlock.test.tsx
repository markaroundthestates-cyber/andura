// ══ GOAL FORECAST BLOCK — render tests ════════════════════════════════════════
//
// Surfaces the date-anchored weight ETA + strength trajectory. Renders the ETA
// date line for a correct-direction pace, an honest "not on track" line for a
// flat/wrong-direction pace, the strength lines when the engine returns them,
// and NOTHING when there is nothing honest to show. The forecast math is mocked
// here (covered by the pure goalForecast.test); this verifies the wiring + copy.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GoalForecastBlock } from '../../../components/Progres/GoalForecastBlock';
import * as goalForecast from '../../../lib/goalForecast';
import type { GoalForecastResult } from '../../../lib/goalForecast';

const ETA_MS = Date.UTC(2026, 7, 14); // 2026-08-14

function mockForecast(result: GoalForecastResult): void {
  vi.spyOn(goalForecast, 'readGoalForecast').mockResolvedValue(result);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GoalForecastBlock — weight ETA', () => {
  it('renders the date-anchored ETA line for a correct-direction pace', async () => {
    mockForecast({
      weightEta: { kind: 'eta', etaMs: ETA_MS, days: 73, goalKg: 70, direction: 'loss' },
      strength: [],
    });
    render(<GoalForecastBlock />);
    const line = await screen.findByTestId('goal-forecast-eta-line');
    // EN default — "At this pace: 70 kg by ~Aug 14."
    expect(line.textContent).toMatch(/At this pace/i);
    expect(line.textContent).toMatch(/70 kg/);
    expect(line.textContent).toMatch(/Aug/);
  });

  it('renders an honest "not on track" line for a flat/wrong-direction pace', async () => {
    mockForecast({ weightEta: { kind: 'off-track' }, strength: [] });
    render(<GoalForecastBlock />);
    const line = await screen.findByTestId('goal-forecast-offtrack');
    expect(line.textContent).toMatch(/Not on track/i);
    // Never surfaces a fabricated date.
    expect(screen.queryByTestId('goal-forecast-eta-line')).not.toBeInTheDocument();
  });

  it('renders a "reached" line when already at goal', async () => {
    mockForecast({ weightEta: { kind: 'reached' }, strength: [] });
    render(<GoalForecastBlock />);
    expect(await screen.findByTestId('goal-forecast-reached')).toBeInTheDocument();
  });
});

describe('GoalForecastBlock — strength trajectory', () => {
  it('renders a strength line per lift with enough history', async () => {
    mockForecast({
      weightEta: null,
      strength: [
        { name: 'Bench Press', currentOneRm: 100, projectedOneRm: 104, weeks: 4 },
        { name: 'Squat', currentOneRm: 140, projectedOneRm: 146, weeks: 4 },
      ],
    });
    render(<GoalForecastBlock />);
    await waitFor(() => {
      const lines = screen.getAllByTestId('goal-forecast-strength-line');
      expect(lines).toHaveLength(2);
    });
    const lines = screen.getAllByTestId('goal-forecast-strength-line');
    // EN default — "Bench Press: ~104 kg in ~4 wks."
    expect(lines[0]!.textContent).toMatch(/Bench Press/);
    expect(lines[0]!.textContent).toMatch(/104 kg/);
    expect(lines[0]!.textContent).toMatch(/4 wks/);
  });

  // BUG (Daniel live 2026-06-12): fmtKg forced ro-RO then replaced the decimal
  // comma with a SPACE, so "105.3" rendered as "105 3" ("cine nu stie o sa creada
  // ca face lat pulldowns cu 876 kg"). The decimal separator must survive — EN dot.
  it('keeps the decimal separator on fractional kg (105.3, not "105 3")', async () => {
    mockForecast({
      weightEta: null,
      strength: [
        { name: 'Cable Row', currentOneRm: 102, projectedOneRm: 105.3, weeks: 4 },
        { name: 'Lat Pulldown', currentOneRm: 84, projectedOneRm: 87.6, weeks: 4 },
      ],
    });
    render(<GoalForecastBlock />);
    await waitFor(() => {
      expect(screen.getAllByTestId('goal-forecast-strength-line')).toHaveLength(2);
    });
    const lines = screen.getAllByTestId('goal-forecast-strength-line');
    expect(lines[0]!.textContent).toMatch(/105\.3 kg/);
    expect(lines[0]!.textContent).not.toMatch(/105 3/);
    expect(lines[1]!.textContent).toMatch(/87\.6 kg/);
    expect(lines[1]!.textContent).not.toMatch(/87 6/);
  });

  // CUT-AWARENESS (Daniel live 2026-06-12): in a deficit the projection must NOT
  // promise +kg — it frames "hold ~X kg". The engine returns framing 'cut-hold'
  // with projected == current; the component swaps to the maintenance copy.
  it('renders a maintenance "hold" line (no +gain) when framing is cut-hold', async () => {
    mockForecast({
      weightEta: null,
      strength: [
        { name: 'Cable Row', currentOneRm: 105.3, projectedOneRm: 105.3, weeks: 4, framing: 'cut-hold' },
      ],
    });
    render(<GoalForecastBlock />);
    const line = await screen.findByTestId('goal-forecast-strength-line');
    // EN copy — "Cable Row: realistic in a cut, hold ~105.3 kg."
    expect(line.textContent).toMatch(/realistic in a cut/i);
    expect(line.textContent).toMatch(/hold/i);
    expect(line.textContent).toMatch(/105\.3 kg/);
    expect(line.getAttribute('data-framing')).toBe('cut-hold');
    // Never the "in ~N wks" growth phrasing for a cut.
    expect(line.textContent).not.toMatch(/wks/);
  });
});

describe('GoalForecastBlock — graceful empty', () => {
  it('renders NOTHING when there is no ETA and no strength forecast', async () => {
    mockForecast({ weightEta: null, strength: [] });
    const { container } = render(<GoalForecastBlock />);
    // Wait a tick for the async effect to resolve, then assert nothing rendered.
    await waitFor(() => {
      expect(screen.queryByTestId('goal-forecast')).not.toBeInTheDocument();
    });
    expect(container.querySelector('[data-testid="goal-forecast"]')).toBeNull();
  });

  it('renders NOTHING when the forecast read rejects (graceful)', async () => {
    vi.spyOn(goalForecast, 'readGoalForecast').mockRejectedValue(new Error('boom'));
    render(<GoalForecastBlock />);
    await waitFor(() => {
      expect(screen.queryByTestId('goal-forecast')).not.toBeInTheDocument();
    });
  });
});
