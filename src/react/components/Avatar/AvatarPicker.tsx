// ══ AVATAR PICKER — preset selection grid ═════════════════════════════════
// The "Schimba avatarul" sheet: a grid of the illustrated presets. Selection
// applies INSTANTLY (writes settingsStore.avatarId → persisted + synced per-UID)
// and the active cell shows a volt ring + check, matching the concept mockup
// (04-avatar.html .pcell.sel). Presentational over the store: `selectedId` +
// `onSelect` are passed in so the same grid is trivially testable with a mocked
// store.
//
// A11y: a radiogroup. Each cell is role="radio" with aria-checked; arrow keys
// move the roving focus (Left/Right/Up/Down + Home/End), Enter/Space selects.
// aria-label per cell carries the preset's localized name. The global WCAG focus
// ring (:focus-visible) is preserved. Maria 65 / Gigel: large tap targets, clear
// selected mark, no hidden gestures.

import type { JSX, KeyboardEvent } from 'react';
import { useRef } from 'react';
import { Check } from 'lucide-react';
import { AVATAR_PRESETS, avatarPresetLabelKey } from './registry';
import { UserAvatar } from './UserAvatar';
import { t } from '../../../i18n/index.js';

interface AvatarPickerProps {
  /** Currently selected preset id (settingsStore.avatarId), or null. */
  selectedId: string | null;
  /** Commit a selection. Pass the preset id. */
  onSelect: (id: string) => void;
}

// 4-per-row grid (mockup inline picker is 4 cols on the phone width). Roving
// tabindex over the cells; arrow keys wrap within the flat list.
const COLS = 4;

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps): JSX.Element {
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusCell = (idx: number): void => {
    const n = AVATAR_PRESETS.length;
    const wrapped = ((idx % n) + n) % n;
    cellRefs.current[wrapped]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number): void => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusCell(idx + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusCell(idx - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusCell(idx + COLS);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusCell(idx - COLS);
        break;
      case 'Home':
        e.preventDefault();
        focusCell(0);
        break;
      case 'End':
        e.preventDefault();
        focusCell(AVATAR_PRESETS.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(AVATAR_PRESETS[idx]!.id);
        break;
      default:
        break;
    }
  };

  // Roving tabindex: the selected cell (or the first when none selected) is the
  // single tab stop; the rest are reachable via arrows.
  const activeIdx = Math.max(
    0,
    AVATAR_PRESETS.findIndex((p) => p.id === selectedId),
  );

  return (
    <div
      role="radiogroup"
      aria-label={t('cont.avatar.pickerLabel')}
      data-testid="avatar-picker"
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {AVATAR_PRESETS.map((preset, idx) => {
        const selected = preset.id === selectedId;
        const label = t(avatarPresetLabelKey(preset.id));
        return (
          <button
            key={preset.id}
            ref={(el) => {
              cellRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            tabIndex={idx === activeIdx ? 0 : -1}
            data-testid={`avatar-option-${preset.id}`}
            onClick={() => onSelect(preset.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={`relative aspect-square rounded-[16px] grid place-items-center press-feedback transition-shadow ${
              selected ? 'border-2' : 'border border-line'
            }`}
            style={
              selected
                ? {
                    borderColor: 'var(--volt)',
                    boxShadow: '0 0 22px -8px var(--volt)',
                  }
                : undefined
            }
          >
            <UserAvatar avatarId={preset.id} size={48} />
            {selected && (
              <span
                className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full grid place-items-center"
                style={{ background: 'var(--volt)' }}
                data-testid={`avatar-option-${preset.id}-check`}
                aria-hidden="true"
              >
                <Check className="w-3 h-3" strokeWidth={3} style={{ color: 'var(--on-accent)' }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
