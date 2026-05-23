// ══ SUB HEADER TESTS — Pass 3 P1 shared component ═════════════════════════
// Verifies SubHeader contract: renders title as h1 level 1, back button has
// aria-label "Inapoi" + data-testid + invokes onBack, supports rightAction
// slot, danger flag applies text-brick title color.

import type { JSX } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubHeader } from '../../components/SubHeader';

describe('SubHeader — shared sub-screen header', () => {
  it('renders title as h1 level 1', () => {
    render(
      <SubHeader title="Profil si tinte" onBack={() => {}} testIdBack="x-back" />
    );
    expect(
      screen.getByRole('heading', { name: /Profil si tinte/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('back button has aria-label "Inapoi" + custom data-testid', () => {
    render(
      <SubHeader title="Test" onBack={() => {}} testIdBack="custom-back-id" />
    );
    const btn = screen.getByRole('button', { name: /Inapoi/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('data-testid', 'custom-back-id');
  });

  it('invokes onBack callback when back button clicked', () => {
    const onBack = vi.fn();
    render(<SubHeader title="Test" onBack={onBack} testIdBack="x-back" />);
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('default title color is text-ink (non-danger)', () => {
    render(<SubHeader title="Despre" onBack={() => {}} testIdBack="x-back" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('text-ink');
    expect(h1.className).not.toContain('text-brick');
  });

  it('danger flag swaps title to text-brick', () => {
    render(
      <SubHeader
        title="Sterge contul"
        onBack={() => {}}
        testIdBack="x-back"
        danger
      />
    );
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('text-brick');
    expect(h1.className).not.toContain('text-ink ');
  });

  it('rightAction renders when provided', () => {
    render(
      <SubHeader
        title="Test"
        onBack={() => {}}
        testIdBack="x-back"
        rightAction={<button data-testid="x-action">Salveaza</button>}
      />
    );
    expect(screen.getByTestId('x-action')).toBeInTheDocument();
  });

  it('rightAction absent by default (no extra slot)', () => {
    render(<SubHeader title="Test" onBack={() => {}} testIdBack="x-back" />);
    // Only one button — the back button. No action slot.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('sticky positioning + border preserved (mockup parity)', () => {
    const { container } = render(
      <SubHeader title="Test" onBack={() => {}} testIdBack="x-back" />
    );
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header?.className).toContain('sticky');
    expect(header?.className).toContain('top-0');
    expect(header?.className).toContain('border-b');
    expect(header?.className).toContain('border-line');
  });

  it('arrow icon aria-hidden (anti screen-reader double-announce)', () => {
    const { container } = render(
      <SubHeader title="Test" onBack={() => {}} testIdBack="x-back" />
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
