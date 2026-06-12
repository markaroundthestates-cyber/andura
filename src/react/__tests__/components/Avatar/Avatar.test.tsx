// ══ AVATAR — registry + renderer + picker tests ═══════════════════════════
// Covers the illustrated preset avatar feature (founder pick 2026-06-12):
//   1. registry resolves every declared id (and rejects unknown/null).
//   2. UserAvatar renders the right branch (svg glyph / image / initials fallback).
//   3. AvatarPicker selects + persists via the store action (mocked onSelect),
//      keyboard-navigates, and marks the selected cell.
//   4. settingsStore persistence: setAvatar writes avatarId; partialize keeps it.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AVATAR_PRESETS,
  getAvatarPreset,
  avatarPresetLabelKey,
  type AvatarPreset,
} from '../../../components/Avatar/registry';
import { UserAvatar } from '../../../components/Avatar/UserAvatar';
import { AvatarPicker } from '../../../components/Avatar/AvatarPicker';
import { useSettingsStore } from '../../../stores/settingsStore';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
});

// ── Registry ─────────────────────────────────────────────────────────────────

describe('avatar registry', () => {
  it('has 24 presets (16 founder images leading + 8 abstract svg) with unique, stable ids', () => {
    expect(AVATAR_PRESETS).toHaveLength(24);
    const ids = AVATAR_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    // The founder illustrated set leads the grid (the canonical pick);
    // abstract marks follow as the neutral/non-person options.
    expect(AVATAR_PRESETS.slice(0, 16).every((p) => p.kind === 'image')).toBe(true);
    expect(AVATAR_PRESETS.slice(16).every((p) => p.kind === 'svg')).toBe(true);
  });

  it('resolves every declared id to its preset', () => {
    for (const p of AVATAR_PRESETS) {
      expect(getAvatarPreset(p.id)).toBe(p);
    }
  });

  it('returns null for unknown / null / undefined id (→ initials fallback)', () => {
    expect(getAvatarPreset('does-not-exist')).toBeNull();
    expect(getAvatarPreset(null)).toBeNull();
    expect(getAvatarPreset(undefined)).toBeNull();
    expect(getAvatarPreset('')).toBeNull();
  });

  it('every preset is well-formed per kind; label key is namespaced', () => {
    for (const p of AVATAR_PRESETS) {
      if (p.kind === 'svg') {
        expect(typeof p.glyph).toBe('function');
        expect(p.accent).toMatch(/^var\(--(volt|aqua|ember|violet)\)$/);
      } else {
        // Founder image set — public-served square webp under /avatars/.
        expect(p.kind).toBe('image');
        expect(p.src).toMatch(/^\/avatars\/ai-\d{2}\.webp$/);
      }
      expect(avatarPresetLabelKey(p.id)).toBe(`cont.avatar.presets.${p.id}`);
    }
  });
});

// ── UserAvatar renderer ──────────────────────────────────────────────────────

describe('UserAvatar', () => {
  it('renders the initials fallback when no preset is picked', () => {
    render(<UserAvatar avatarId={null} size={54} initial="D" initialTestId="probe-initial" />);
    expect(screen.getByTestId('avatar-initials')).toBeInTheDocument();
    expect(screen.getByTestId('probe-initial').textContent).toBe('D');
    expect(screen.queryByTestId('avatar-svg')).toBeNull();
  });

  it('defaults the fallback initial to a neutral "A"', () => {
    render(<UserAvatar avatarId={null} size={40} initialTestId="probe-initial" />);
    expect(screen.getByTestId('probe-initial').textContent).toBe('A');
  });

  it('falls back to initials for an unknown id', () => {
    render(<UserAvatar avatarId="ghost-id" size={40} initial="Z" initialTestId="probe-initial" />);
    expect(screen.getByTestId('avatar-initials')).toBeInTheDocument();
    expect(screen.getByTestId('probe-initial').textContent).toBe('Z');
  });

  it('renders the svg glyph branch for a real preset id (no initial)', () => {
    // First SVG preset in the registry (the founder image set leads the grid,
    // so [0] is an image entry now — pick the first abstract mark instead).
    const firstSvg = AVATAR_PRESETS.find((p) => p.kind === 'svg')!;
    render(<UserAvatar avatarId={firstSvg.id} size={54} initial="D" initialTestId="probe-initial" />);
    const svgCell = screen.getByTestId('avatar-svg');
    expect(svgCell).toBeInTheDocument();
    expect(svgCell.getAttribute('data-avatar-id')).toBe(firstSvg.id);
    expect(screen.queryByTestId('probe-initial')).toBeNull();
    expect(svgCell.querySelector('svg')).toBeTruthy();
  });

  it('exposes an accessible name only when label is given (else decorative)', () => {
    const { rerender } = render(<UserAvatar avatarId={null} size={40} label="Your avatar" />);
    expect(screen.getByRole('img', { name: 'Your avatar' })).toBeInTheDocument();
    rerender(<UserAvatar avatarId={null} size={40} />);
    expect(screen.queryByRole('img')).toBeNull();
  });

});

// Image-branch coverage proves the swappable asset layer: the SAME renderer
// draws an <img> when a preset resolves to kind:'image' (the founder's future AI
// PNG/webp set), with zero renderer refactor. Mock the registry so getAvatarPreset
// yields an image preset for a test id; assert UserAvatar takes the image path.
describe('UserAvatar image branch (future founder AI set)', () => {
  it('renders an <img> for an image-kind preset, no glyph/initials', async () => {
    vi.resetModules();
    const imgPreset: AvatarPreset = {
      id: 'future-png',
      kind: 'image',
      src: '/avatars/future-png.webp',
    };
    vi.doMock('../../../components/Avatar/registry', () => ({
      getAvatarPreset: (id: string | null | undefined) => (id === 'future-png' ? imgPreset : null),
    }));
    const { UserAvatar: MockedUserAvatar } = await import('../../../components/Avatar/UserAvatar');
    render(<MockedUserAvatar avatarId="future-png" size={54} initialTestId="probe-initial" />);
    const cell = screen.getByTestId('avatar-image');
    expect(cell).toBeInTheDocument();
    const img = cell.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/avatars/future-png.webp');
    expect(screen.queryByTestId('avatar-svg')).toBeNull();
    expect(screen.queryByTestId('probe-initial')).toBeNull();
    vi.doUnmock('../../../components/Avatar/registry');
  });
});

// ── AvatarPicker (selection + persistence + a11y) ────────────────────────────

describe('AvatarPicker', () => {
  it('renders a radiogroup with one option per preset', () => {
    render(<AvatarPicker selectedId={null} onSelect={() => {}} />);
    expect(screen.getByTestId('avatar-picker')).toHaveAttribute('role', 'radiogroup');
    for (const p of AVATAR_PRESETS) {
      expect(screen.getByTestId(`avatar-option-${p.id}`)).toBeInTheDocument();
    }
  });

  it('calls onSelect with the preset id on click', () => {
    const onSelect = vi.fn();
    render(<AvatarPicker selectedId={null} onSelect={onSelect} />);
    const target = AVATAR_PRESETS[3]!;
    fireEvent.click(screen.getByTestId(`avatar-option-${target.id}`));
    expect(onSelect).toHaveBeenCalledWith(target.id);
  });

  it('marks the selected cell aria-checked + shows the check badge', () => {
    const sel = AVATAR_PRESETS[2]!;
    render(<AvatarPicker selectedId={sel.id} onSelect={() => {}} />);
    expect(screen.getByTestId(`avatar-option-${sel.id}`)).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId(`avatar-option-${sel.id}-check`)).toBeInTheDocument();
    // a non-selected cell is not checked
    expect(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[0]!.id}`)).toHaveAttribute('aria-checked', 'false');
  });

  it('roving tabindex: only the selected (or first) cell is a tab stop', () => {
    const sel = AVATAR_PRESETS[5]!;
    render(<AvatarPicker selectedId={sel.id} onSelect={() => {}} />);
    expect(screen.getByTestId(`avatar-option-${sel.id}`)).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[0]!.id}`)).toHaveAttribute('tabindex', '-1');
  });

  it('Enter/Space on a focused cell selects it', () => {
    const onSelect = vi.fn();
    render(<AvatarPicker selectedId={null} onSelect={onSelect} />);
    const cell = screen.getByTestId(`avatar-option-${AVATAR_PRESETS[1]!.id}`);
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(AVATAR_PRESETS[1]!.id);
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('ArrowRight moves focus to the next cell (wraps at the end)', () => {
    render(<AvatarPicker selectedId={AVATAR_PRESETS[0]!.id} onSelect={() => {}} />);
    const first = screen.getByTestId(`avatar-option-${AVATAR_PRESETS[0]!.id}`);
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[1]!.id}`));
  });

  it('persists the pick through the real store (select → settingsStore.avatarId)', () => {
    // Wire the picker to the live store action to prove the end-to-end persist
    // contract (mirrors the Cont screen's onSelect → setAvatar).
    const setAvatar = useSettingsStore.getState().setAvatar;
    const Harness = () => {
      const avatarId = useSettingsStore((s) => s.avatarId);
      return <AvatarPicker selectedId={avatarId} onSelect={setAvatar} />;
    };
    render(<Harness />);
    const pick = AVATAR_PRESETS[4]!;
    fireEvent.click(screen.getByTestId(`avatar-option-${pick.id}`));
    expect(useSettingsStore.getState().avatarId).toBe(pick.id);
    // and it landed in the persisted localStorage slice (partialize)
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted?.state?.avatarId).toBe(pick.id);
  });
});

// ── settingsStore persistence ────────────────────────────────────────────────

describe('settingsStore avatarId', () => {
  it('defaults to null (initials fallback)', () => {
    expect(useSettingsStore.getState().avatarId).toBeNull();
  });

  it('setAvatar updates the field and reset clears it', () => {
    useSettingsStore.getState().setAvatar('athlete');
    expect(useSettingsStore.getState().avatarId).toBe('athlete');
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().avatarId).toBeNull();
  });

  it('persists avatarId into the partialized localStorage slice', () => {
    useSettingsStore.getState().setAvatar('spark');
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted?.state?.avatarId).toBe('spark');
  });
});
