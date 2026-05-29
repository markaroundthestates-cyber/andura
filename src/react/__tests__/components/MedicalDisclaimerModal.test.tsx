import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MedicalDisclaimerModal } from '../../components/MedicalDisclaimerModal';

describe('MedicalDisclaimerModal — LOCK 4', () => {
  it('NU renders cand open=false', () => {
    const { container } = render(
      <MedicalDisclaimerModal open={false} onAcknowledge={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal + title + body + acknowledge button cand open', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />);
    expect(screen.getByTestId('disclaimer-modal')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer-title')).toHaveTextContent('Before we begin');
    expect(screen.getByTestId('disclaimer-acknowledge')).toBeInTheDocument();
  });

  it('Acknowledge button dispatches callback', () => {
    const onAck = vi.fn();
    render(<MedicalDisclaimerModal open={true} onAcknowledge={onAck} />);
    fireEvent.click(screen.getByTestId('disclaimer-acknowledge'));
    expect(onAck).toHaveBeenCalledTimes(1);
  });

  it('Cancel button conditional render', () => {
    const { rerender } = render(
      <MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />,
    );
    expect(screen.queryByTestId('disclaimer-cancel')).not.toBeInTheDocument();
    rerender(
      <MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByTestId('disclaimer-cancel')).toBeInTheDocument();
  });

  it('role="dialog" + aria-modal="true" pentru a11y', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />);
    const modal = screen.getByTestId('disclaimer-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('no diacritics in body copy', () => {
    const { container } = render(
      <MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />,
    );
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  // RE-U-02 — focus-trap (gate obligatoriu mereu-montat via U-01).
  it('focus auto pe acknowledge button la open', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByTestId('disclaimer-acknowledge'));
  });

  it('gate obligatoriu (fara onCancel) — Tab nu scapa, ramane pe acknowledge', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} />);
    const ack = screen.getByTestId('disclaimer-acknowledge');
    expect(document.activeElement).toBe(ack);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(ack);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(ack);
  });

  it('cu onCancel — Tab pe last (cancel) cicleaza la first (acknowledge)', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} onCancel={vi.fn()} />);
    const ack = screen.getByTestId('disclaimer-acknowledge');
    const cancel = screen.getByTestId('disclaimer-cancel');
    act(() => {
      cancel.focus();
    });
    expect(document.activeElement).toBe(cancel);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(ack);
  });

  it('cu onCancel — Shift+Tab pe first (acknowledge) cicleaza la last (cancel)', () => {
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} onCancel={vi.fn()} />);
    const ack = screen.getByTestId('disclaimer-acknowledge');
    const cancel = screen.getByTestId('disclaimer-cancel');
    // Auto-focus pe acknowledge (first). Shift+Tab → last (cancel).
    expect(document.activeElement).toBe(ack);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(cancel);
  });

  it('Escape inert cand gate obligatoriu (fara onCancel) — niciun callback', () => {
    const onAck = vi.fn();
    render(<MedicalDisclaimerModal open={true} onAcknowledge={onAck} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onAck).not.toHaveBeenCalled();
  });

  it('Escape declanseaza onCancel cand prezent', () => {
    const onCancel = vi.fn();
    render(<MedicalDisclaimerModal open={true} onAcknowledge={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
