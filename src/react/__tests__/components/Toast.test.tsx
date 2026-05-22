// §32-H1 — ToastViewport component tests.
// Validates: render-on-show, normal auto-dismiss timer, manual dismiss click,
// aria-live polarity (status/alert), no-diacritics UI text rule.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ToastViewport } from '../../components/Toast';
import { toast } from '../../lib/toast';

beforeEach(() => {
  toast.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  toast.clear();
});

describe('ToastViewport - §32-H1', () => {
  it('renders nothing when no toasts active', () => {
    render(<ToastViewport />);
    expect(screen.queryByTestId('toast-viewport')).not.toBeInTheDocument();
  });

  it('renders toast when toast.show() called', () => {
    render(<ToastViewport />);
    act(() => {
      toast.show({ message: 'Salvat' });
    });
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
    expect(screen.getByText('Salvat')).toBeInTheDocument();
  });

  it('info auto-dismisses after 3000ms', () => {
    render(<ToastViewport />);
    act(() => {
      toast.show({ message: 'Salvat', variant: 'info' });
    });
    expect(screen.getByText('Salvat')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText('Salvat')).not.toBeInTheDocument();
  });

  it('manual dismiss button removes a dismissible toast', () => {
    render(<ToastViewport />);
    let id = '';
    act(() => {
      id = toast.show({ message: 'Eroare retea', variant: 'error' });
    });
    expect(screen.getByText('Eroare retea')).toBeInTheDocument();
    const btn = screen.getByTestId(`toast-${id}-dismiss`);
    act(() => {
      btn.click();
    });
    expect(screen.queryByText('Eroare retea')).not.toBeInTheDocument();
  });

  it('aria-live=polite + role=status for info/success/warning', () => {
    render(<ToastViewport />);
    let id = '';
    act(() => {
      id = toast.show({ message: 'Info msg', variant: 'info' });
    });
    const card = screen.getByTestId(`toast-${id}`);
    expect(card).toHaveAttribute('aria-live', 'polite');
    expect(card).toHaveAttribute('role', 'status');
  });

  it('aria-live=assertive + role=alert for error', () => {
    render(<ToastViewport />);
    let id = '';
    act(() => {
      id = toast.show({ message: 'Eroare', variant: 'error' });
    });
    const card = screen.getByTestId(`toast-${id}`);
    expect(card).toHaveAttribute('aria-live', 'assertive');
    expect(card).toHaveAttribute('role', 'alert');
  });

  it('max 2 simultaneous toasts visible', () => {
    render(<ToastViewport />);
    act(() => {
      toast.show({ message: 'a' });
      toast.show({ message: 'b' });
      toast.show({ message: 'c' });
    });
    const viewport = screen.getByTestId('toast-viewport');
    const cards = viewport.querySelectorAll('[data-variant]');
    expect(cards.length).toBe(2);
  });

  it('no diacritics in dismiss button aria-label', () => {
    render(<ToastViewport />);
    act(() => {
      toast.show({ message: 'msg', variant: 'info' });
    });
    const btn = screen.getByRole('button', { name: /inchide notificare/i });
    expect(btn.getAttribute('aria-label') ?? '').not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });
});
