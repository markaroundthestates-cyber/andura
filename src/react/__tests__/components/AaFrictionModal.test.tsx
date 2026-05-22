// AA FRICTION MODAL TESTS - task_14 sectionB blocking 2-button safety modal

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AaFrictionModal } from '../../components/AaFrictionModal';

describe('AaFrictionModal - conditional render', () => {
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

describe('AaFrictionModal - button actions', () => {
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

// sectionMED-3 audit fix (REVIEW-chat3 fresh-eyes): focus trap Tab/Shift+Tab
// cycle between Pauza (first) and Continui (last). Preserves LOCK 9 NO
// Escape close intent (regression guard included).
describe('AaFrictionModal - focus trap (sectionMED-3)', () => {
  it('Tab from last button (Continui) cycles to first (Pauza)', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="fast_sets"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    const pauseBtn = screen.getByTestId('aa-friction-pause');
    const continueBtn = screen.getByTestId('aa-friction-continue');
    continueBtn.focus();
    expect(document.activeElement).toBe(continueBtn);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(pauseBtn);
  });

  it('Shift+Tab from first button (Pauza) cycles to last (Continui)', () => {
    render(
      <AaFrictionModal
        open={true}
        reason="kg_jump"
        onAcknowledge={vi.fn()}
        onForceContinue={vi.fn()}
      />
    );
    const pauseBtn = screen.getByTestId('aa-friction-pause');
    const continueBtn = screen.getByTestId('aa-friction-continue');
    expect(document.activeElement).toBe(pauseBtn);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(continueBtn);
  });

  it('Escape NU dismiss (LOCK 9 blocking safety gate preserved)', () => {
    const onAck = vi.fn();
    const onForce = vi.fn();
    render(
      <AaFrictionModal
        open={true}
        reason="rep_spike"
        onAcknowledge={onAck}
        onForceContinue={onForce}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onAck).not.toHaveBeenCalled();
    expect(onForce).not.toHaveBeenCalled();
    expect(screen.getByTestId('aa-friction-modal')).toBeInTheDocument();
  });
});
