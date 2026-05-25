// Phase 6 task_21 — UpdatePrompt PWA new-version banner tests.
// §S-12 audit fix — banner now driven by vite-plugin-pwa registerSW({
// onNeedRefresh }) (registerType:'prompt'), not a dead custom 'sw-updated'
// event. jsdom: virtual:pwa-register absent → dynamic import rejects →
// fallback no-op (banner hidden, no throw). A mocked virtual module exercises
// the update-available path.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { UpdatePrompt } from '../../components/UpdatePrompt';

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.restoreAllMocks();
});

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

describe('§S-12 UpdatePrompt — prompt model (registerSW onNeedRefresh)', () => {
  it('shows the banner when a new SW needs refresh + CTA triggers update (consent)', async () => {
    const updateSW = vi.fn(async () => {});
    let triggerNeedRefresh: (() => void) | undefined;
    // Mock the Vite virtual module to capture onNeedRefresh + return updateSW.
    vi.doMock('virtual:pwa-register', () => ({
      registerSW: (opts: { onNeedRefresh?: () => void }) => {
        triggerNeedRefresh = opts.onNeedRefresh;
        return updateSW;
      },
    }));
    // Re-import after the mock is registered so the component picks it up.
    const { UpdatePrompt: Prompt } = await import('../../components/UpdatePrompt');

    render(<Prompt />);
    // registerSW resolves async — wait for the captured callback, then fire it.
    await waitFor(() => expect(triggerNeedRefresh).toBeTypeOf('function'));
    triggerNeedRefresh?.();

    const banner = await screen.findByTestId('update-prompt');
    expect(banner).toBeInTheDocument();
    // ZERO auto-reload: updateSW only runs on explicit CTA tap (consent).
    expect(updateSW).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('update-prompt-cta'));
    expect(updateSW).toHaveBeenCalledTimes(1);

    vi.doUnmock('virtual:pwa-register');
  });

  it('stays hidden until onNeedRefresh fires (no premature banner)', async () => {
    vi.doMock('virtual:pwa-register', () => ({
      registerSW: () => vi.fn(async () => {}),
    }));
    const { UpdatePrompt: Prompt } = await import('../../components/UpdatePrompt');

    render(<Prompt />);
    // Give the dynamic import a tick to settle — banner must remain hidden.
    await Promise.resolve();
    expect(screen.queryByTestId('update-prompt')).not.toBeInTheDocument();

    vi.doUnmock('virtual:pwa-register');
  });
});
