import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Cont } from '../../../routes/screens/cont/Cont';

function renderCont() {
  return render(
    <MemoryRouter initialEntries={['/app/cont']}>
      <Cont />
    </MemoryRouter>,
  );
}

describe('Cont landing — Phase 5 task_13', () => {
  it('renders Cont heading', () => {
    renderCont();
    expect(screen.getByRole('heading', { name: /^Cont$/i, level: 1 })).toBeInTheDocument();
  });

  it('renders account card', () => {
    renderCont();
    expect(screen.getByTestId('cont-account-card')).toBeInTheDocument();
  });

  it('renders 5 sections mockup verbatim', () => {
    renderCont();
    expect(screen.getByTestId('cont-section-cont')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-general')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-date-confidentialitate')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-deconectare-stergere')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-ajutor')).toBeInTheDocument();
  });

  it('renders all 13 rows total per mockup', () => {
    renderCont();
    const rows = [
      'profile', 'notifications', 'subscription',
      'appearance', 'aparate-lipsa', 'prefs',
      'privacy', 'terms', 'export',
      'danger',
      'support', 'ceva-nu-merge', 'about', 'faq',
    ];
    rows.forEach((id) => {
      expect(screen.getByTestId(`cont-row-${id}`)).toBeInTheDocument();
    });
  });

  it('Deconectare/Stergere section + row marked danger', () => {
    renderCont();
    expect(screen.getByTestId('cont-row-danger').className).toMatch(/text-brick/);
  });

  it('no diacritics în UI text', () => {
    const { container } = renderCont();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('version footer "Andura v1.0.0" present', () => {
    renderCont();
    expect(screen.getByText(/Andura v1\.0\.0/i)).toBeInTheDocument();
  });
});
