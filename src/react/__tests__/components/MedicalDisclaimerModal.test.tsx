import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByTestId('disclaimer-title')).toHaveTextContent('Inainte sa incepem');
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
});
