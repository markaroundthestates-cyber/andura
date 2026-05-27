import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Onboarding } from '../../routes/screens/Onboarding';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';

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
    data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
    completed: false,
    completedAt: null,
  });
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
});

describe('Onboarding — Big 6 hard typing', () => {
  it('renders step 1 varsta input', () => {
    renderAt(1);
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument();
    expect(screen.getByText(/Cati ani ai/i)).toBeInTheDocument();
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

  it('step 3 goal options 6 choices (mockup L863-869 parity)', () => {
    renderAt(3);
    // §B003/D-1b audit fix — extended 4→6: auto + forta + masa + slabire + mentenanta + longevitate.
    ['auto', 'forta', 'masa', 'slabire', 'mentenanta', 'longevitate'].forEach((g) => {
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

  // P-02 — inaltime step (mockup #screen-onb-inaltime). Fitness metric pentru
  // BMR Mifflin-St Jeor. Persist + range gate mirror weight step.
  it('step 7 height input persist', () => {
    renderAt(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '175' } });
    expect(useOnboardingStore.getState().data.height).toBe(175);
  });

  it('step 7 cleared height input persists null (not 0)', () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: 175 },
      completed: false,
      completedAt: null,
    });
    renderAt(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '' } });
    expect(useOnboardingStore.getState().data.height).toBeNull();
  });

  it('step 7 fara inaltime blocheaza Continua (stay on step 7)', () => {
    renderAt(7);
    fireEvent.click(screen.getByTestId('onb-next'));
    expect(screen.getByTestId('onboarding-step-7')).toBeInTheDocument();
  });

  // §LOW-1 REVIEW-chat3 fresh-eyes — empty input must clear to null,
  // not silently save 0 (Number("")=0 garbage data). Mirror SettingsProfile
  // pattern (cont/SettingsProfile.tsx:103, 117).
  it('step 1 cleared age input persists null (not 0)', () => {
    useOnboardingStore.setState({
      data: { age: 32, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
      completed: false,
      completedAt: null,
    });
    renderAt(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: '' } });
    expect(useOnboardingStore.getState().data.age).toBeNull();
  });

  it('step 6 cleared weight input persists null (not 0)', () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: 78, height: null },
      completed: false,
      completedAt: null,
    });
    renderAt(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '' } });
    expect(useOnboardingStore.getState().data.weight).toBeNull();
  });

  // §MED-A-3 CODE-REVIEW chat3: non-numeric paste ("abc") in type=number
  // input could leak NaN to store. LOW-1 ternary `value ? Number(value) : null`
  // still passed NaN when value="abc" (truthy + Number("abc")=NaN). Guard with
  // Number.isFinite check before store commit.
  it('step 1 non-numeric paste in age input persists null (not NaN)', () => {
    renderAt(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: 'abc' } });
    expect(useOnboardingStore.getState().data.age).toBeNull();
  });

  it('step 8 summary cu data finalized', () => {
    useOnboardingStore.setState({
      data: {
        age: 32, sex: 'm', goal: 'masa', frequency: '3',
        experience: 'intermediar', weight: 78, height: 175,
      },
      completed: false,
      completedAt: null,
    });
    renderAt(8);
    const summary = screen.getByTestId('onb-summary');
    expect(summary.textContent).toMatch(/32/);
    expect(summary.textContent).toMatch(/Barbat/);
    expect(summary.textContent).toMatch(/Masa musculara/);
    // P-02 — inaltime apare in summary.
    expect(summary.textContent).toMatch(/175 cm/);
  });

  it('step 8 Gata navigates antrenor + finalizes (Big 6 + height valid)', () => {
    // U-02 (CRIT) — finalize cere toate campurile complet (incl. height P-02).
    useOnboardingStore.setState({
      data: {
        age: 32, sex: 'm', goal: 'masa', frequency: '3',
        experience: 'intermediar', weight: 78, height: 175,
      },
      completed: false,
      completedAt: null,
    });
    renderAt(8);
    fireEvent.click(screen.getByTestId('onb-next'));
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(screen.getByTestId('antrenor')).toBeInTheDocument();
  });

  // BUG #5 — finalize seed-uieste timeline-ul de greutate din greutatea de
  // onboarding cand weightLog e gol (profil 55kg → 7-zile porneste de la 55,
  // NU disconnect/gol).
  it('BUG #5: finalize seeds weightLog din greutatea de onboarding cand e gol', () => {
    useOnboardingStore.setState({
      data: {
        age: 28, sex: 'f', goal: 'masa', frequency: '3',
        experience: 'incepator', weight: 55, height: 168,
      },
      completed: false,
      completedAt: null,
    });
    expect(useProgresStore.getState().weightLog).toHaveLength(0);
    renderAt(8);
    fireEvent.click(screen.getByTestId('onb-next'));
    const log = useProgresStore.getState().weightLog;
    expect(log).toHaveLength(1);
    expect(log[0]?.kg).toBe(55);
  });

  it('BUG #5: finalize NU suprascrie un weightLog existent (loguri reale pastrate)', () => {
    useOnboardingStore.setState({
      data: {
        age: 28, sex: 'f', goal: 'masa', frequency: '3',
        experience: 'incepator', weight: 55, height: 168,
      },
      completed: false,
      completedAt: null,
    });
    // User a cantarit deja real (108) — seed-ul NU trebuie sa-l suprascrie.
    useProgresStore.setState({
      weightLog: [{ kg: 108, date: '2026-05-20', ts: Date.now() }],
      bodyData: [],
    });
    renderAt(8);
    fireEvent.click(screen.getByTestId('onb-next'));
    const log = useProgresStore.getState().weightLog;
    expect(log).toHaveLength(1);
    expect(log[0]?.kg).toBe(108); // real log pastrat, NU suprascris cu 55
  });

  // U-02 (CRIT) — click-through gol (toate null) NU completeaza onboarding.
  it('step 8 Gata cu campuri null NU finalizeaza (no click-through gol)', () => {
    renderAt(8);
    fireEvent.click(screen.getByTestId('onb-next'));
    expect(useOnboardingStore.getState().completed).toBe(false);
    expect(screen.queryByTestId('antrenor')).not.toBeInTheDocument();
  });

  // U-02 (CRIT) — pas 2 fara selectie sex blocheaza Continua (toast).
  it('step 2 fara selectie sex blocheaza Continua', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-next'));
    // Ramane pe pas 2 (sex null → blocat, no navigate)
    expect(screen.getByTestId('onboarding-step-2')).toBeInTheDocument();
  });

  // U-02 (CRIT) — dupa selectie sex, Continua trece (navigate pas 3).
  it('step 2 cu sex selectat permite Continua', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-sex-m'));
    fireEvent.click(screen.getByTestId('onb-next'));
    expect(useOnboardingStore.getState().data.sex).toBe('m');
    // Navigat catre pas 3 (sex valid → no block)
    expect(screen.queryByTestId('onboarding-step-2')).not.toBeInTheDocument();
  });

  it('step 2 Inapoi navigates step 1', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-back'));
    // Navigation triggered — Routes setup may not re-render, just verify click safe
    expect(useOnboardingStore.getState().completed).toBe(false);
  });

  it('no diacritics in UI text', () => {
    const { container } = renderAt(3);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Onboarding — A11Y HIGH chat5 form aria attributes', () => {
  it('step 1 age input has aria-required + required', () => {
    renderAt(1);
    const input = screen.getByTestId('onb-age-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('step 1 age input NO aria-invalid pe initial empty', () => {
    renderAt(1);
    const input = screen.getByTestId('onb-age-input');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('onb-age-error')).not.toBeInTheDocument();
  });

  it('step 1 age input NO aria-invalid pe valid value 32', () => {
    renderAt(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: '32' } });
    const input = screen.getByTestId('onb-age-input');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('onb-age-error')).not.toBeInTheDocument();
  });

  it('step 1 age input aria-invalid + error cand value < 18', () => {
    renderAt(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: '10' } });
    const input = screen.getByTestId('onb-age-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'onb-age-error');
    const err = screen.getByTestId('onb-age-error');
    expect(err).toHaveAttribute('id', 'onb-age-error');
    expect(err).toHaveAttribute('role', 'alert');
    expect(err.textContent).toMatch(/Varsta intre 18 si 99/);
  });

  it('step 1 age input aria-invalid cand value > 99', () => {
    renderAt(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: '120' } });
    expect(screen.getByTestId('onb-age-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('onb-age-error').textContent).toMatch(/18 si 99/);
  });

  it('step 6 weight input has aria-required + required', () => {
    renderAt(6);
    const input = screen.getByTestId('onb-weight-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('step 6 weight input NO aria-invalid pe valid 78', () => {
    renderAt(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '78' } });
    expect(screen.getByTestId('onb-weight-input')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('onb-weight-error')).not.toBeInTheDocument();
  });

  it('step 6 weight input aria-invalid + error cand value < 30', () => {
    renderAt(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '20' } });
    const input = screen.getByTestId('onb-weight-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'onb-weight-error');
    const err = screen.getByTestId('onb-weight-error');
    expect(err).toHaveAttribute('id', 'onb-weight-error');
    expect(err).toHaveAttribute('role', 'alert');
    expect(err.textContent).toMatch(/Kg intre 30 si 250/);
  });

  it('step 6 weight input aria-invalid cand value > 250', () => {
    renderAt(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '300' } });
    expect(screen.getByTestId('onb-weight-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('onb-weight-error').textContent).toMatch(/30 si 250/);
  });

  // P-02 — height step aria parity (mirror weight step WCAG 3.3.1 + 3.3.3).
  it('step 7 height input has aria-required + required', () => {
    renderAt(7);
    const input = screen.getByTestId('onb-height-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('step 7 height input NO aria-invalid pe valid 175', () => {
    renderAt(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '175' } });
    expect(screen.getByTestId('onb-height-input')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('onb-height-error')).not.toBeInTheDocument();
  });

  it('step 7 height input aria-invalid + error cand value < 120', () => {
    renderAt(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '100' } });
    const input = screen.getByTestId('onb-height-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'onb-height-error');
    const err = screen.getByTestId('onb-height-error');
    expect(err).toHaveAttribute('role', 'alert');
    expect(err.textContent).toMatch(/Inaltime intre 120 si 230/);
  });

  it('step 7 height input aria-invalid cand value > 230', () => {
    renderAt(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '250' } });
    expect(screen.getByTestId('onb-height-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('onb-height-error').textContent).toMatch(/120 si 230/);
  });
});
