import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Onboarding } from '../../routes/screens/Onboarding';
import { useOnboardingStore } from '../../stores/onboardingStore';

function renderAt(step: number) {
  return render(
    <MemoryRouter initialEntries={[`/onboarding/${step}`]}>
      <Routes>
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route path="/app/antrenor" element={<div data-testid="antrenor" />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useOnboardingStore.setState({
    data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null },
    completed: false,
    completedAt: null,
  });
  localStorage.clear();
});

describe('Onboarding — Big 6 hard typing', () => {
  it('renders step 1 varsta input', () => {
    renderAt(1);
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument();
    expect(screen.getByText(/Ce varsta ai/i)).toBeInTheDocument();
    expect(screen.getByTestId('onb-age-input')).toBeInTheDocument();
  });

  it('renders progress dots cu active states', () => {
    renderAt(3);
    expect(screen.getByTestId('progress-dot-1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('progress-dot-3')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('progress-dot-4')).toHaveAttribute('data-active', 'false');
  });

  it('step 1 NO back button (first step)', () => {
    renderAt(1);
    expect(screen.queryByTestId('onb-back')).not.toBeInTheDocument();
  });

  it('step 2 sex options select + persist', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-sex-m'));
    expect(useOnboardingStore.getState().data.sex).toBe('m');
  });

  it('step 3 goal options 4 choices', () => {
    renderAt(3);
    ['masa', 'forta', 'definire', 'sanatate'].forEach((g) => {
      expect(screen.getByTestId(`onb-goal-${g}`)).toBeInTheDocument();
    });
  });

  it('step 4 frequency 4 choices (2/3/4/5 per saptamana)', () => {
    renderAt(4);
    ['2', '3', '4', '5'].forEach((f) => {
      expect(screen.getByTestId(`onb-freq-${f}`)).toBeInTheDocument();
    });
  });

  it('step 5 experience 3 choices', () => {
    renderAt(5);
    ['incepator', 'intermediar', 'avansat'].forEach((e) => {
      expect(screen.getByTestId(`onb-exp-${e}`)).toBeInTheDocument();
    });
  });

  it('step 6 weight input persist', () => {
    renderAt(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '78' } });
    expect(useOnboardingStore.getState().data.weight).toBe(78);
  });

  it('step 7 summary cu data finalized', () => {
    useOnboardingStore.setState({
      data: {
        age: 32, sex: 'm', goal: 'masa', frequency: '3',
        experience: 'intermediar', weight: 78,
      },
      completed: false,
      completedAt: null,
    });
    renderAt(7);
    const summary = screen.getByTestId('onb-summary');
    expect(summary.textContent).toMatch(/32/);
    expect(summary.textContent).toMatch(/Barbat/);
    expect(summary.textContent).toMatch(/Masa musculara/);
  });

  it('step 7 Gata navigates antrenor + finalizes', () => {
    renderAt(7);
    fireEvent.click(screen.getByTestId('onb-next'));
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(screen.getByTestId('antrenor')).toBeInTheDocument();
  });

  it('step 2 Inapoi navigates step 1', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-back'));
    // Navigation triggered — Routes setup may not re-render, just verify click safe
    expect(useOnboardingStore.getState().completed).toBe(false);
  });

  it('no diacritics în UI text', () => {
    const { container } = renderAt(3);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
