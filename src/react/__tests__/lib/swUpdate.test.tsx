// PWA auto-update redesign (2026-06-02) — swUpdate module tests.
// Replaces the removed UpdatePrompt.test.tsx. Behavior under test:
//   - new SW + NO active session  → auto-apply (updateSW(true)) + "Updating" toast
//   - new SW + active session      → NOT applied (deferred), no toast, no reload
//   - Account button               → registration.update() + apply + toast
//   - jsdom (no virtual:pwa-register override → no-op) → no crash, no toast
//
// virtual:pwa-register is aliased to a no-op stub in vitest.config.js. Each
// update-path test vi.doMock's it to capture onNeedRefresh + return a spy
// updateSW, then re-imports the module fresh (resetModules) so the new mock +
// fresh module singletons are picked up.
//
// CRITICAL: resetModules gives swUpdate a FRESH module graph — including fresh
// `workoutStore` + `toast` singletons. We therefore import the store + toast
// FROM THE SAME fresh graph inside each test (a helper does the import bundle)
// so assertions target the exact instances swUpdate reads/writes.
//
// REAL timers throughout: the dynamic import('virtual:pwa-register') resolves
// on the microtask queue, so waitFor needs the real event loop. The ~1.2s
// safety-net reload is asserted via a setTimeout spy (no real wait).

import type { JSX } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';

// Import swUpdate + its dependency singletons from ONE fresh module graph.
async function loadFresh() {
  const swUpdate = await import('../../lib/swUpdate');
  const { useWorkoutStore } = await import('../../stores/workoutStore');
  const { toast } = await import('../../lib/toast');
  swUpdate.__resetSwUpdateForTests();
  useWorkoutStore.setState({ sessionStart: null, phase: 'idle' });
  toast.clear();
  return { ...swUpdate, useWorkoutStore, toast };
}

function makeHost(useHook: () => void): () => JSX.Element {
  return function Host(): JSX.Element {
    useHook();
    return <div data-testid="host" />;
  };
}

afterEach(() => {
  cleanup();
  vi.doUnmock('virtual:pwa-register');
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('swUpdate — graceful in jsdom (no real virtual module)', () => {
  it('mounting the hook does not throw + shows no toast', async () => {
    const { useSwUpdate, toast } = await loadFresh();
    const Host = makeHost(useSwUpdate);
    expect(() => render(<Host />)).not.toThrow();
    // The no-op stub never fires onNeedRefresh → no "Updating" toast.
    await Promise.resolve();
    expect(toast.getSnapshot()).toHaveLength(0);
  });
});

describe('swUpdate — auto-apply when SAFE (no active session)', () => {
  it('new SW + idle → updateSW(true) called + "Updating" toast + reload scheduled', async () => {
    const updateSW = vi.fn(async () => {});
    let triggerNeedRefresh: (() => void) | undefined;
    vi.doMock('virtual:pwa-register', () => ({
      registerSW: (opts: { onNeedRefresh?: () => void }) => {
        triggerNeedRefresh = opts.onNeedRefresh;
        return updateSW;
      },
    }));
    const { useSwUpdate, toast } = await loadFresh();

    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    const Host = makeHost(useSwUpdate);
    render(<Host />);
    await waitFor(() => expect(triggerNeedRefresh).toBeTypeOf('function'));

    // No active session → safe → auto-apply.
    triggerNeedRefresh?.();
    expect(updateSW).toHaveBeenCalledTimes(1);
    expect(updateSW).toHaveBeenCalledWith(true);
    // "Updating" toast surfaced before reload.
    expect(toast.getSnapshot().length).toBeGreaterThan(0);
    // Safety-net reload scheduled ~1.2s later (installed-PWA controllerchange flake).
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1200);
  });
});

describe('swUpdate — DEFER when a workout session is ACTIVE', () => {
  it('new SW mid-session → NOT applied (no updateSW, no toast, no reload schedule)', async () => {
    const updateSW = vi.fn(async () => {});
    let triggerNeedRefresh: (() => void) | undefined;
    vi.doMock('virtual:pwa-register', () => ({
      registerSW: (opts: { onNeedRefresh?: () => void }) => {
        triggerNeedRefresh = opts.onNeedRefresh;
        return updateSW;
      },
    }));
    const { useSwUpdate, useWorkoutStore, toast } = await loadFresh();

    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    // Live session in progress (mid-set): sessionStart set, phase logging.
    useWorkoutStore.setState({ sessionStart: Date.now(), phase: 'logging' });

    const Host = makeHost(useSwUpdate);
    render(<Host />);
    await waitFor(() => expect(triggerNeedRefresh).toBeTypeOf('function'));

    triggerNeedRefresh?.();
    // Mandatory invariant: never reload / apply mid-active-session.
    expect(updateSW).not.toHaveBeenCalled();
    expect(toast.getSnapshot()).toHaveLength(0);
    // No 1.2s reload scheduled by the apply path while deferred.
    expect(timeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 1200);
  });
});

describe('swUpdate — Account "Check for updates & apply" button', () => {
  it('checkForUpdatesAndApply → registration.update() + updateSW(true) + toast', async () => {
    const updateSW = vi.fn(async () => {});
    const regUpdate = vi.fn(async () => {});
    vi.doMock('virtual:pwa-register', () => ({
      registerSW: (opts: { onRegisteredSW?: (u: string, r: unknown) => void }) => {
        // Provide a fake registration so the module captures it.
        opts.onRegisteredSW?.('/sw.js', { update: regUpdate });
        return updateSW;
      },
    }));
    const { useSwUpdate, checkForUpdatesAndApply, toast } = await loadFresh();

    const Host = makeHost(useSwUpdate);
    render(<Host />);
    // Wait until the registration was captured (onRegisteredSW → initial nudge).
    await waitFor(() => expect(regUpdate).toHaveBeenCalled());

    regUpdate.mockClear();
    checkForUpdatesAndApply();
    expect(regUpdate).toHaveBeenCalledTimes(1); // explicit check
    expect(updateSW).toHaveBeenCalledWith(true); // apply
    expect(toast.getSnapshot().length).toBeGreaterThan(0); // toast
  });

  it('checkForUpdatesAndApply is a safe no-op with no registration (jsdom)', async () => {
    const { checkForUpdatesAndApply, toast } = await loadFresh();
    expect(() => checkForUpdatesAndApply()).not.toThrow();
    expect(toast.getSnapshot()).toHaveLength(0);
  });
});
