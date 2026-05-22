// ══ SETTINGS THEMES — Cont sub-screen (mockup #screen-settings-themes) ════
// Per mockup andura-clasic.html L2003-2037. 4-theme palette picker (Clasic /
// Living Body / Luxury / Brain Coach) cu swatch + selected check icon.
//
// V1 scope (Karpathy SF) — visual palette selection persisted in localStorage
// pentru SSR-friendly read. Actual CSS theme runtime swap = deferred post-Beta
// (mockup themes are 4 paleta variants — Andura Clasic = default Beta).
// Per PAR-002 recon spec line 132: Daniel CEO decision pending if themes
// LANDED pre-Beta. V1 ships preference-only (no DOM mutation), matching
// SettingsAppearance V1 paradigm. Phase 7+ wires actual theme runtime swap.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

type PaletteTheme = 'clasic' | 'living-body' | 'luxury' | 'brain-coach';

interface ThemeOption {
  id: PaletteTheme;
  name: string;
  meta: string;
  swatchClass: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'clasic',
    name: 'Andura Clasic',
    meta: 'Cremos - implicit',
    swatchClass: 'bg-gradient-to-br from-paper from-50% to-brick to-50%',
  },
  {
    id: 'living-body',
    name: 'Andura Living Body',
    meta: 'Navy si auriu cald',
    swatchClass: 'bg-gradient-to-br from-[#07090f] from-50% to-[#d4a574] to-50%',
  },
  {
    id: 'luxury',
    name: 'Andura Luxury',
    meta: 'Bleu si champagne',
    swatchClass: 'bg-gradient-to-br from-[#0a1a3f] from-50% to-[#c9a55c] to-50%',
  },
  {
    id: 'brain-coach',
    name: 'Andura Brain Coach',
    meta: 'Purple AI gradient',
    swatchClass: 'bg-gradient-to-br from-[#8b6dff] from-50% to-[#5dd6e6] to-50%',
  },
];

const STORAGE_KEY = 'wv2-palette-theme';

function readPaletteTheme(): PaletteTheme {
  if (typeof localStorage === 'undefined') return 'clasic';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'clasic' || v === 'living-body' || v === 'luxury' || v === 'brain-coach') {
    return v;
  }
  return 'clasic';
}

function writePaletteTheme(t: PaletteTheme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, t);
}

export function SettingsThemes(): JSX.Element {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaletteTheme>('clasic');

  useEffect(() => {
    setSelected(readPaletteTheme());
  }, []);

  function handlePick(t: PaletteTheme): void {
    setSelected(t);
    writePaletteTheme(t);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-themes">
      <SubHeader
        title="Teme"
        onBack={() => navigate(gotoPath('settings-appearance'))}
        testIdBack="settings-themes-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          Alege paleta. Se aplica instant.
        </p>

        <div className="grid grid-cols-2 gap-3" data-testid="settings-themes-grid">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`theme-palette-${opt.id}`}
                aria-pressed={isSelected}
                onClick={() => handlePick(opt.id)}
                className={`relative flex flex-col items-stretch p-3 rounded-xl border ${
                  isSelected ? 'border-brick bg-paper2' : 'border-line bg-paper2'
                }`}
              >
                <div
                  className={`w-full h-16 rounded-lg mb-2 ${opt.swatchClass}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-ink text-left">{opt.name}</span>
                <span className="text-xs text-ink2 text-left mt-0.5">{opt.meta}</span>
                {isSelected && (
                  <span
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brick text-paper flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-ink2 text-center mt-5 leading-relaxed">
          4 teme disponibile.
        </p>
      </div>
    </section>
  );
}
