// ══ NUTRITION INLINE TESTS — task_20 LOCK 11 mockup verbatim ═════════════

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NutritionInline } from '../../components/NutritionInline';
import { useNutritionStore } from '../../stores/nutritionStore';

beforeEach(() => {
  useNutritionStore.setState({ dailyLog: [] });
  localStorage.clear();
});

describe('NutritionInline — render mockup verbatim', () => {
  it('renders section heading "Nutritie · azi"', () => {
    render(<NutritionInline />);
    expect(screen.getByText(/Nutritie/i)).toBeInTheDocument();
  });

  it('renders 2 chips Kcal + Proteine (g)', () => {
    render(<NutritionInline />);
    expect(screen.getByTestId('nutri-kcal-chip')).toBeInTheDocument();
    expect(screen.getByTestId('nutri-protein-chip')).toBeInTheDocument();
  });

  it('renders edit pencil buttons cu aria-label verbatim mockup', () => {
    render(<NutritionInline />);
    expect(
      screen.getByRole('button', { name: /Editeaza kcal/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Editeaza proteine/i })
    ).toBeInTheDocument();
  });

  it('renders auto target defaults (2640 kcal / 180g protein mockup verbatim)', () => {
    render(<NutritionInline />);
    expect(screen.getByTestId('nutri-kcal-val').textContent).toBe('2640');
    expect(screen.getByTestId('nutri-protein-val').textContent).toBe('180');
  });

  it('renders "Auto din engine" indicator cand NU manually logged', () => {
    render(<NutritionInline />);
    expect(screen.getByTestId('nutri-kcal-source').textContent).toMatch(/Auto din engine/);
    expect(screen.getByTestId('nutri-protein-source').textContent).toMatch(/Auto din engine/);
  });

  it('renders helper texts mockup verbatim', () => {
    render(<NutritionInline />);
    expect(screen.getByText(/Auto target din engine\. Apasa pencil daca vrei sa loghezi manual/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto target engine \+ manual log optional/i)).toBeInTheDocument();
  });

  it('Save button hidden cand no edit active', () => {
    render(<NutritionInline />);
    expect(screen.queryByTestId('nutri-save')).not.toBeInTheDocument();
  });
});

describe('NutritionInline — edit mode kcal', () => {
  it('pencil tap activates kcal input', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    expect(screen.getByTestId('nutri-kcal-input')).toBeInTheDocument();
    expect(screen.queryByTestId('nutri-kcal-val')).not.toBeInTheDocument();
  });

  it('Save button visible cand kcal edit active', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    expect(screen.getByTestId('nutri-save')).toBeInTheDocument();
    expect(screen.getByTestId('nutri-save').textContent).toMatch(/Salveaza modificarile/);
  });

  it('Save commits kcal value + exits edit mode', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.change(screen.getByTestId('nutri-kcal-input'), { target: { value: '2200' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    expect(screen.getByTestId('nutri-kcal-val').textContent).toBe('2200');
    expect(screen.getByTestId('nutri-kcal-source').textContent).toMatch(/Logat manual/);
  });

  it('Save persist kcal la nutritionStore', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.change(screen.getByTestId('nutri-kcal-input'), { target: { value: '2000' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    const log = useNutritionStore.getState().dailyLog;
    expect(log).toHaveLength(1);
    expect(log[0].kcal).toBe(2000);
    expect(log[0].protein).toBeNull();
  });

  it('Save NU commits cand value out of range (kcal > 9999)', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.change(screen.getByTestId('nutri-kcal-input'), { target: { value: '99999' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    expect(useNutritionStore.getState().dailyLog).toHaveLength(0);
  });
});

describe('NutritionInline — edit mode protein', () => {
  it('pencil tap activates protein input', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-protein-edit'));
    expect(screen.getByTestId('nutri-protein-input')).toBeInTheDocument();
  });

  it('Save persist protein la nutritionStore', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-protein-edit'));
    fireEvent.change(screen.getByTestId('nutri-protein-input'), { target: { value: '150' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    const log = useNutritionStore.getState().dailyLog;
    expect(log).toHaveLength(1);
    expect(log[0].protein).toBe(150);
  });
});

describe('NutritionInline — both edit', () => {
  it('Save commits both edits în single click', () => {
    render(<NutritionInline />);
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.click(screen.getByTestId('nutri-protein-edit'));
    fireEvent.change(screen.getByTestId('nutri-kcal-input'), { target: { value: '2100' } });
    fireEvent.change(screen.getByTestId('nutri-protein-input'), { target: { value: '160' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    const log = useNutritionStore.getState().dailyLog;
    expect(log[0].kcal).toBe(2100);
    expect(log[0].protein).toBe(160);
  });
});

describe('NutritionInline — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in UI', () => {
    const { container } = render(<NutritionInline />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
