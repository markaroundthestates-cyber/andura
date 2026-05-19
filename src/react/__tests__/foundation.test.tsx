// ══ FOUNDATION SMOKE — React Andura Clasic Zustand store verify ═══════════
// §1-H1 audit fix companion — App.tsx deleted (dead Phase 1 placeholder).
// App render tests removed; useAppStore Zustand smoke preserved (foundation
// store wiring still relevant for §17 telemetry + §35 DB Tier 0/1/2 chain).

import { describe, it, expect } from 'vitest';
import { useAppStore } from '../stores/appStore';

describe('Foundation smoke — Zustand store', () => {
  it('useAppStore initial state correct', () => {
    const state = useAppStore.getState();
    expect(state.persona).toBe('gigica');
    expect(state.initialized).toBe(false);
  });

  it('useAppStore mutator setPersona updates state', () => {
    useAppStore.getState().setPersona('marius');
    expect(useAppStore.getState().persona).toBe('marius');
    // reset pentru izolare tests
    useAppStore.getState().setPersona('gigica');
  });

  it('useAppStore mutator setInitialized updates state', () => {
    useAppStore.getState().setInitialized(true);
    expect(useAppStore.getState().initialized).toBe(true);
    // reset
    useAppStore.getState().setInitialized(false);
  });
});
