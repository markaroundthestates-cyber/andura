// BOTTOM NAV — Pulse reskin tests. Asserts the new Pulse skin (sliding pill
// indicator, font-mono uppercase labels, app-fixed-column anchor preserved)
// WITHOUT regressing the router-driven contract (role=navigation, aria-label,
// aria-current, 4 tabs, compact mode). The active-tab routing semantics are
// already covered by routing.test.tsx — here we lock the visual contract.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from '../../../components/BottomNav';
import { useSettingsStore } from '../../../stores/settingsStore';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.setState({ bottomNavStyle: 'comfortable' });
});

describe('BottomNav Pulse reskin — preserved contract', () => {
  it('exposes the navigation landmark with the i18n aria-label', () => {
    renderAt('/app/antrenor');
    // EN default → "Main navigation".
    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();
  });

  it('renders exactly 4 tab buttons', () => {
    renderAt('/app/antrenor');
    const nav = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(within(nav).getAllByRole('button')).toHaveLength(4);
  });

  it('marks the active tab with aria-current=page (router-driven)', () => {
    renderAt('/app/progres');
    const nav = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(within(nav).getByRole('button', { name: /Progress/i })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the app-fixed-column anchor class (bezel alignment invariant)', () => {
    renderAt('/app/antrenor');
    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toHaveClass('app-fixed-column');
  });

  it('reflects nav-style via data-nav-style', () => {
    useSettingsStore.setState({ bottomNavStyle: 'compact' });
    renderAt('/app/antrenor');
    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toHaveAttribute('data-nav-style', 'compact');
  });
});

describe('BottomNav Pulse reskin — Pulse skin additions', () => {
  it('labels are font-mono uppercase (Pulse style)', () => {
    renderAt('/app/antrenor');
    const nav = screen.getByRole('navigation', { name: /Main navigation/i });
    const labels = within(nav).getAllByText(/Coach|Progress|History|Account/);
    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((el) => {
      expect(el).toHaveClass('font-mono');
      expect(el).toHaveClass('uppercase');
    });
  });

  it('sliding pill indicator translates to the active tab index', () => {
    const { container } = renderAt('/app/istoric');
    // Istoric is index 2 → translateX(200%).
    const pill = container.querySelector('span.absolute.top-0.left-0');
    expect(pill).not.toBeNull();
    expect(pill?.getAttribute('style') ?? '').toContain('translateX(200%)');
  });

  it('active-tab pill + glow tint via --brick token (no hardcoded hex)', () => {
    const { container } = renderAt('/app/antrenor');
    const html = container.innerHTML;
    expect(html).toContain('var(--brick)');
  });
});
