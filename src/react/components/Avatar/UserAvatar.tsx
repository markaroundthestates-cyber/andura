// ══ USER AVATAR — preset renderer + initials fallback ═════════════════════
// Renders the user's chosen account avatar at any size. Three branches, by the
// resolved preset's `kind`:
//   - no preset picked (avatarId null / unknown) → INITIALS fallback: the Pulse
//     gradient pebble + a derived initial (mirrors the prior Cont gradient chip,
//     so the account surface looks the same until the user picks a preset).
//   - kind 'svg'   → glass pebble + the Pulse line-art glyph in its accent.
//   - kind 'image' → the founder's future square raster (object-cover circle).
//
// Source of truth for the picked id is settingsStore.avatarId (synced per-UID).
// This component is presentational: callers pass `avatarId` + the fallback
// `initial` so the same renderer works in the header (live store) and in tests
// (explicit props), with no store coupling here.
//
// A11y: decorative by default (role img + aria-label when `label` given, else
// aria-hidden — the surrounding text usually names the account). The selection
// ring is a caller concern (AvatarPicker); this just draws the avatar.

import type { JSX } from 'react';
import { getAvatarPreset } from './registry';

interface UserAvatarProps {
  /** Persisted preset id (settingsStore.avatarId). null/unknown → initials. */
  avatarId: string | null | undefined;
  /** Square diameter in px. */
  size: number;
  /** Fallback initial(s) when no preset is picked. Defaults to 'A' (neutral). */
  initial?: string;
  /** Accessible name. When omitted the avatar is aria-hidden (decorative). */
  label?: string;
  /** Optional extra classes on the root (e.g. selection ring utilities). */
  className?: string;
  /**
   * Optional data-testid placed on the rendered INITIAL text (fallback branch
   * only). Lets a host preserve a pre-existing testid contract that asserts the
   * initial char (e.g. Cont's `cont-account-initial`).
   */
  initialTestId?: string;
}

// The glyph occupies ~58% of the pebble (matches the mockup's 62% inner disc
// minus padding) so the line-art never crowds the rim at small sizes.
const GLYPH_RATIO = 0.58;

/**
 * Glass pebble background shared by svg + initials branches — the dark radial
 * "stone" from the mockup. Token-driven so it reads on every theme.
 */
const PEBBLE_BG = 'radial-gradient(circle at 35% 30%, var(--surface-2), var(--paper-2))';

export function UserAvatar({
  avatarId,
  size,
  initial = 'A',
  label,
  className = '',
  initialTestId,
}: UserAvatarProps): JSX.Element {
  const preset = getAvatarPreset(avatarId);
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const };

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  };

  // ── Initials fallback (no preset picked) — Pulse gradient pebble + initial. ──
  if (!preset) {
    return (
      <div
        className={className}
        style={{
          ...base,
          background: 'var(--grad-pulse)',
          color: 'var(--on-accent)',
        }}
        data-testid="avatar-initials"
        {...a11y}
      >
        <span
          className="font-display font-bold"
          style={{ fontSize: Math.round(size * 0.42), lineHeight: 1 }}
          data-testid={initialTestId}
        >
          {initial}
        </span>
      </div>
    );
  }

  // ── Image branch (future founder AI set) — square raster in a circle. ───────
  if (preset.kind === 'image' && preset.src) {
    return (
      <div className={className} style={base} data-testid="avatar-image" {...a11y}>
        <img
          src={preset.src}
          alt=""
          aria-hidden="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // ── SVG glyph branch (current illustrated set) — glass pebble + line-art. ───
  const accent = preset.accent ?? 'var(--volt)';
  const glyphSize = Math.round(size * GLYPH_RATIO);
  return (
    <div
      className={className}
      style={{ ...base, background: PEBBLE_BG }}
      data-testid="avatar-svg"
      data-avatar-id={preset.id}
      {...a11y}
    >
      <div style={{ width: glyphSize, height: glyphSize, display: 'grid', placeItems: 'center' }}>
        {preset.glyph?.(accent)}
      </div>
    </div>
  );
}
