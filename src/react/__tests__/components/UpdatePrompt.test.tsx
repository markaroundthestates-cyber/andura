// Phase 6 task_21 — UpdatePrompt PWA new-version banner tests.
// jsdom test env: virtual:pwa-register/react NU disponibil — fallback no-op.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdatePrompt } from '../../components/UpdatePrompt';

describe('UpdatePrompt — fallback when virtual:pwa-register unavailable', () => {
  it('renders null cand needRefresh false (default fallback in jsdom)', () => {
    const { container } = render(<UpdatePrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('NU throws on mount in jsdom (virtual module import gated)', () => {
    expect(() => render(<UpdatePrompt />)).not.toThrow();
  });

  it('component exported as named export pentru Layout consume', () => {
    expect(typeof UpdatePrompt).toBe('function');
  });

  it('queryByTestId update-prompt absent in fallback state', () => {
    render(<UpdatePrompt />);
    expect(screen.queryByTestId('update-prompt')).not.toBeInTheDocument();
  });
});
