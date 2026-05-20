// ══ AA FRICTION MODAL TESTS — task_14 §B blocking 2-button safety modal ══

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AaFrictionModal } from '../../components/AaFrictionModal';

describe('AaFrictionModal — conditional render', () => {
  it('NU render cand open=false', () => {
    const { container } = render(
      <AaFrictionModal
        open={false}
        reason={null}
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders backdrop + modal + 2 buttons cand open=true', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="fast_sets"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    expect(screen.getByTestId('aa-friction-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-pause')).toBeInTheDocument();
    expect(screen.getByTestId('aa-friction-continue')).toBeInTheDocument();
  });

  it('renders title + body placeholders (Phase 4 pending CEO wording)', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="kg_jump"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    // task_02 wording sweep: D024 autonomous compose final RO copy
    expect(screen.getByTestId('aa-friction-title').textContent).toMatch(/Stai un pic/);
    expect(screen.getByTestId('aa-friction-body').textContent).toMatch(/Ai marit ritmul/);
    expect(screen.getByTestId('aa-friction-pause').textContent).toMatch(/Pauza 30 sec/);
    expect(screen.getByTestId('aa-friction-continue').textContent).toMatch(/Continui oricum/);
  });

  it('reason data-reason attribute reflects prop', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="rep_spike"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    expect(screen.getByTestId('aa-friction-reason')).toHaveAttribute('data-reason', 'rep_spike');
  });

  it('reason absent (null) NU render reason testid', () => {
    render(
      <AaFrictionModal
        open={true}
        reason={null}
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    expect(screen.queryByTestId('aa-friction-reason')).not.toBeInTheDocument();
  });

  it('role="dialog" + aria-modal="true" pentru a11y', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="fast_sets"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    const modal = screen.getByTestId('aa-friction-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });
});

describe('AaFrictionModal — button actions', () => {
  it('Pauza click dispatches onAcknowledge', () => {
    const onAck = vi.fn();
    const onForce = vi.fn();
    render(
      <AaFrictionModal
        open={true}
        reason="fast_sets"
        onAcknowledge={onAck}
        onForceContinue={onForce}
      />
    );
    fireEvent.click(screen.getByTestId('aa-friction-pause'));
    expect(onAck).toHaveBeenCalledTimes(1);
    expect(onForce).not.toHaveBeenCalled();
  });

  it('Continui click dispatches onForceContinue', () => {
    const onAck = vi.fn();
    const onForce = vi.fn();
    render(
      <AaFrictionModal
        open={true}
        reason="kg_jump"
        onAcknowledge={onAck}
        onForceContinue={onForce}
      />
    );
    fireEvent.click(screen.getByTestId('aa-friction-continue'));
    expect(onForce).toHaveBeenCalledTimes(1);
    expect(onAck).not.toHaveBeenCalled();
  });

  it('backdrop tap NU dismiss (blocking safety gate)', () => {
    const onAck = vi.fn();
    const onForce = vi.fn();
    render(
      <AaFrictionModal
        open={true}
        reason="fast_sets"
        onAcknowledge={onAck}
        onForceContinue={onForce}
      />
    );
    fireEvent.click(screen.getByTestId('aa-friction-backdrop'));
    expect(onAck).not.toHaveBeenCalled();
    expect(onForce).not.toHaveBeenCalled();
  });
});
