// BUG #12b — BodyFatStrip surface bf% estimat pe Progres.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BodyFatStrip } from '../../../components/Progres/BodyFatStrip';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';

beforeEach(() => {
  useProgresStore.getState().reset();
  useOnboardingStore.setState({
    data: {
      age: 31,
      sex: 'm',
      goal: 'masa',
      frequency: '4',
      experience: 'intermediar',
      weight: 80,
      height: 180,
    },
    completed: true,
    completedAt: Date.now(),
  });
});

describe('BodyFatStrip', () => {
  it('renders heading "Grasime corporala"', () => {
    render(<BodyFatStrip />);
    expect(screen.getByText(/Grasime corporala/i)).toBeInTheDocument();
  });

  it('arata bf% Deurenberg (estimat) cand DOAR onboarding stats (fara talie/gat)', () => {
    render(<BodyFatStrip />);
    // 80kg/180cm/31yo M → Deurenberg ~20.3%.
    const val = screen.getByTestId('bodyfat-value');
    expect(val.textContent).toMatch(/%/);
    expect(screen.getByTestId('bodyfat-source').textContent).toMatch(/estimat/);
  });

  it('arata sursa "US Navy" cand talie+gat masurate (plauzibile)', () => {
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-27', waistCm: 85, neckCm: 38 });
    render(<BodyFatStrip />);
    expect(screen.getByTestId('bodyfat-source').textContent).toMatch(/US Navy/);
  });

  it('BUG #12a: gat imposibil (22cm) NU umfla — cade pe Deurenberg estimat', () => {
    // talie 75 / gat 22 ar fi dat 20.2% US-Navy (umflat); acum US-Navy → null,
    // deci sursa = estimat (Deurenberg) iar valoarea reflecta profilul slab.
    useOnboardingStore.setState({
      data: { age: 16, sex: 'm', goal: 'auto', frequency: '3', experience: 'incepator', weight: 55, height: 182 },
      completed: true,
      completedAt: Date.now(),
    });
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-27', waistCm: 75, neckCm: 22 });
    render(<BodyFatStrip />);
    expect(screen.getByTestId('bodyfat-source').textContent).toMatch(/estimat/);
    // Deurenberg pentru BMI 16.6 / 16yo → ~7-8% (slab), departe de 20.2% umflat.
    const val = Number(screen.getByTestId('bodyfat-value').textContent?.replace(/[^\d.]/g, ''));
    expect(val).toBeLessThan(12);
  });

  it('placeholder cand stats incomplete (T0 fresh)', () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
      completed: false,
      completedAt: null,
    });
    render(<BodyFatStrip />);
    expect(screen.getByTestId('bodyfat-empty')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<BodyFatStrip />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  // Smoke 2026-05-28 #1 — CTA "adauga talie + gat" cand DOAR Deurenberg.
  it('CTA "Adauga talie + gat" prezent cand fallback Deurenberg (fara masuratori)', () => {
    render(<BodyFatStrip />);
    const cta = screen.getByTestId('bodyfat-cta');
    expect(cta.textContent).toMatch(/Adauga talie/);
    expect(cta.textContent).toMatch(/US Navy/);
  });

  it('CTA absent cand US Navy (talie+gat masurate)', () => {
    useProgresStore.getState().addBodyDataEntry({ date: '2026-05-27', waistCm: 85, neckCm: 38 });
    render(<BodyFatStrip />);
    expect(screen.queryByTestId('bodyfat-cta')).not.toBeInTheDocument();
  });

  it('caveat "Estimat aproximativ" cand cap-ul high-BMI a actionat (Daniel 109/182/36)', () => {
    useOnboardingStore.setState({
      data: { age: 36, sex: 'm', goal: 'slabire', frequency: '4', experience: 'intermediar', weight: 109, height: 182 },
      completed: true,
      completedAt: Date.now(),
    });
    render(<BodyFatStrip />);
    const cta = screen.getByTestId('bodyfat-cta');
    expect(cta.textContent).toMatch(/aproximativ/);
    // Valoarea afisata e cap-ul (28%) NU raw-ul Deurenberg (31.6%)
    const val = Number(screen.getByTestId('bodyfat-value').textContent?.replace(/[^\d.]/g, ''));
    expect(val).toBeLessThan(31);
    expect(val).toBeCloseTo(28, 0);
  });

  it('caveat "Estimat din BMI" cand cap-ul NU a actionat (BMI sub 27)', () => {
    // 80kg/180cm: BMI 24.7, cap nu se aplica.
    render(<BodyFatStrip />);
    const cta = screen.getByTestId('bodyfat-cta');
    expect(cta.textContent).toMatch(/Estimat din BMI/);
    expect(cta.textContent).not.toMatch(/aproximativ/);
  });
});
