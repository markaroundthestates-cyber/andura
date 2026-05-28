// paletteSync — data-palette wiring tests.
// ANDURA PULSE (2026-05-29) — the override palettes (Luxury + Living Body) are
// RETIRED. With one Pulse design system, NO palette sets <html data-palette>:
// applyPalette CLEARS it for every id (the override CSS blocks are gone, so the
// attribute would have no effect). The base :root (Pulse light) + [data-theme]
// light↔dark toggle owns the look. A stored 'luxury'/'living-body' resolves to
// the base theme gracefully (no error), so the picker + persisted values still
// parse.

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

describe('applyPalette — always clears documentElement.data-palette (Pulse, no overrides)', () => {
  it('clears data-palette for luxury (override retired → base theme owns it)', () => {
    document.documentElement.dataset.palette = 'luxury';
    applyPalette('luxury');
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('clears data-palette for living-body (override retired → base theme owns it)', () => {
    document.documentElement.dataset.palette = 'living-body';
    applyPalette('living-body');
    expect(document.documentElement.dataset.palette).toBeUndefined();
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
  it('clears data-palette even for a persisted luxury (retired override)', () => {
    document.documentElement.dataset.palette = 'luxury';
    localStorage.setItem(KEY, 'luxury');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('clears data-palette even for a persisted living-body (retired override)', () => {
    document.documentElement.dataset.palette = 'living-body';
    localStorage.setItem(KEY, 'living-body');
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('leaves data-palette unset when storage empty', () => {
    applyInitialPalette();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });

  it('ignores a junk value (no override attribute set)', () => {
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

  it('clears any stale data-palette as a side effect', () => {
    document.documentElement.dataset.palette = 'living-body';
    localStorage.setItem(KEY, 'living-body');
    PaletteSync();
    expect(document.documentElement.dataset.palette).toBeUndefined();
  });
});
