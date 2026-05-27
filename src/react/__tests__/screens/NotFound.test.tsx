// Audit MED — catch-all 404 (inainte: URL gresit → white screen). Render
// test + link spre acasa + no-diacritics.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotFound } from '../../routes/screens/NotFound';

function renderAt(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div data-testid="home-route" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('NotFound page (catch-all 404)', () => {
  it('renders on an unknown path', () => {
    renderAt('/path-care-nu-exista');
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Pagina nu a fost gasita/i);
  });

  it('navigates home via the link', async () => {
    const user = userEvent.setup();
    renderAt('/path-care-nu-exista');
    await user.click(screen.getByTestId('not-found-home'));
    expect(screen.getByTestId('home-route')).toBeInTheDocument();
  });

  it('no diacritics in page copy', () => {
    const { container } = renderAt('/path-care-nu-exista');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
