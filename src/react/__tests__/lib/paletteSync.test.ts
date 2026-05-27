// paletteSync — data-palette override wiring (Luxury + Living Body) tests.
// Mirrors the themeSync pattern: applyInitialPalette anti-FOUC + applyPalette
// live + PaletteSync component. Override palettes set <html data-palette>;
// clasic/brain-coach clear it so the base light/dark theme owns them.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyPalette,
  applyInitialPalette,
  PaletteSync,
} from '../../lib/paletteSync';

const KEY = 'wv2-palette-theme';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.palette;
});

describe('applyPalette — sets/clears documentElement.data-palette', () => {
  it('sets data-palette="luxury" for the luxury override', () => {
    applyPalette('luxury');
    expect(document.documentElement.dataset.palette).toBe('luxury');
  });

  it('sets data-palette="living-body" for the living-body override', () => {
    applyPalette('living-body');
    expect(document.documentElement.dataset.palette).toBe('living-body');
  });

  it('clears data-palette for brain-coach (base theme owns it)', () => {
    document.documentElement.dataset.palette = 'luxury';
    applyPalette('brain-coach');
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('clears data-palette for clasic (base theme owns it)', () => {
    document.documentElement.dataset.palette = 'living-body';
    applyPalette('clasic');
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });
});

describe('applyInitialPalette — synchronous pre-mount read from localStorage', () => {
  it('applies persisted luxury override', () => {
    localStorage.setItem(KEY, 'luxury');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBe('luxury');
  });

  it('applies persisted living-body override', () => {
    localStorage.setItem(KEY, 'living-body');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBe('living-body');
  });

  it('defaults to brain-coach (no data-palette) when storage empty', () => {
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('ignores a junk value and falls back to no override', () => {
    localStorage.setItem(KEY, 'not-a-real-palette');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('clears a stale override when persisted palette is clasic', () => {
    document.documentElement.dataset.palette = 'luxury';
    localStorage.setItem(KEY, 'clasic');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });
});

describe('PaletteSync component', () => {
  it('returns null (renders nothing)', () => {
    expect(PaletteSync()).toBeNull();
  });

  it('applies the persisted palette as a side effect', () => {
    localStorage.setItem(KEY, 'living-body');
    PaletteSync();
    expect(document.documentElement.dataset.palette).toBe('living-body');
  });
});
