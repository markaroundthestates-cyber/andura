// ══ CONFIRM MODAL TESTS — §A003 audit fix shared destructive confirm ════
// Per src/react/components/ConfirmModal.tsx.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../../components/ConfirmModal';

describe('ConfirmModal — shared destructive confirm', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(
      <ConfirmModal
        open={false}
        title="X"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog cu title + body cand open=true', () => {
    render(
      <ConfirmModal
        open={true}
        title="Sterge cont"
        body="Datele vor fi sterse permanent."
        confirmCta="Sterge"
        destructive
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('dialog', { name: /Sterge cont/i })).toBeInTheDocument();
    expect(screen.getByText(/Datele vor fi sterse permanent/i)).toBeInTheDocument();
  });

  it('default cancelCta="Anuleaza" when not provided', () => {
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Anuleaza' })).toBeInTheDocument();
  });

  it('custom cancelCta overrides default', () => {
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="Continua"
        cancelCta="Mai tarziu"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Mai tarziu' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anuleaza' })).not.toBeInTheDocument();
  });

  it('clicks confirm → onConfirm fires', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="Da"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Da' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('clicks cancel → onCancel fires', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Anuleaza' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('destructive=true → brick CTA + AlertTriangle icon svg present', () => {
    const { container } = render(
      <ConfirmModal
        open={true}
        title="Sterge"
        body="Y"
        confirmCta="Confirma"
        destructive
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const acceptBtn = screen.getByTestId('confirm-accept');
    expect(acceptBtn.className).toContain('bg-brick');
    // Destructive mode renders an svg icon (AlertTriangle from lucide-react)
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('destructive=false (default) → ink CTA + no AlertTriangle svg', () => {
    const { container } = render(
      <ConfirmModal
        open={true}
        title="Confirm"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const acceptBtn = screen.getByTestId('confirm-accept');
    expect(acceptBtn.className).toContain('bg-ink');
    // Non-destructive: no icon → no svg in container
    expect(container.querySelector('svg')).toBeNull();
  });

  it('custom testIdPrefix scopes data-testid', () => {
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        testIdPrefix="reset-coach"
      />
    );
    expect(screen.getByTestId('reset-coach-modal')).toBeInTheDocument();
    expect(screen.getByTestId('reset-coach-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('reset-coach-accept')).toBeInTheDocument();
  });

  it('aria-modal=true + role=dialog (WCAG 2.1)', () => {
    render(
      <ConfirmModal
        open={true}
        title="X"
        body="Y"
        confirmCta="OK"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'X');
  });

  it('no diacritics rule D-LEGACY-064', () => {
    const { container } = render(
      <ConfirmModal
        open={true}
        title="Reseteaza coach"
        body="Toate datele coach vor fi sterse. Aceasta actiune nu poate fi anulata."
        confirmCta="Reseteaza"
        cancelCta="Anuleaza"
        destructive
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
