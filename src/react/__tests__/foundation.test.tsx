// ══ FOUNDATION SMOKE — React Andura Clasic Phase 1 verify ═════════════════
// Validates App renders, Tailwind clases applied, Zustand store wires.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../../App';
import { useAppStore } from '../stores/appStore';

describe('Foundation smoke — App render', () => {
  it('renders Andura Clasic heading', () => {
    render(<App />);
    expect(screen.getByText(/Andura Clasic/i)).toBeInTheDocument();
  });

  it('renders Phase 1 Foundation marker', () => {
    render(<App />);
    expect(screen.getByText(/Phase 1 Foundation LANDED/i)).toBeInTheDocument();
  });

  it('applies Tailwind clase bg-paper la main', () => {
    const { container } = render(<App />);
    const mainEl = container.querySelector('main');
    expect(mainEl).not.toBeNull();
    expect(mainEl?.className).toMatch(/bg-paper/);
  });
});

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
