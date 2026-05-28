// ══ SETTINGS THEMES — Cont sub-screen (mockup #screen-settings-themes) ════
// Per mockup andura-clasic.html L2003-2037. 4-theme palette picker (Clasic /
// Living Body / Luxury / Brain Coach) cu swatch + selected check icon.
//
// LIVE-PALETTE (2026-05-28): paletele se aplica INSTANT la click via
// paletteSync (data-palette override layer in global.css). Clasic + Brain
// Coach NU seteaza data-palette (base :root / [data-theme] light↔dark toggle
// le detine); Luxury + Living Body au token block-uri dark dedicate. Selectia
// persistata in localStorage 'wv2-palette-theme' (citita pre-mount in main.tsx
// applyInitialPalette pentru anti-FOUC).

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { applyPalette, type PaletteTheme } from '../../../lib/paletteSync';

interface ThemeOption {
  id: PaletteTheme;
  name: string;
  meta: string;
  swatchClass: string;
}

// THEME-INVERSION fix (2026-05-27): "implicit" mutat de pe Clasic pe Brain
// Coach — default real al app-ului e tema mov Brain Coach (CEO pick 2026-05-27,
// settingsStore DEFAULTS.theme='dark' + themeSync applyInitialTheme). Eticheta
// veche "Cremos - implicit" pe Clasic era stale (Clasic = optional acum).
const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'clasic',
    name: 'Andura Clasic',
    meta: 'Cremos luminos',
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
    meta: 'Mov AI - implicit',
    swatchClass: 'bg-gradient-to-br from-[#8b6dff] from-50% to-[#5dd6e6] to-50%',
  },
];

const STORAGE_KEY = 'wv2-palette-theme';

// THEME-INVERSION fix (2026-05-27): default 'brain-coach' (tema mov), aliniat
// la settingsStore DEFAULTS.theme='dark'. Inainte 'clasic' contrazicea
// default-ul real => picker arata Clasic selectat desi app-ul porneste mov.
function readPaletteTheme(): PaletteTheme {
  if (typeof localStorage === 'undefined') return 'brain-coach';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'clasic' || v === 'living-body' || v === 'luxury' || v === 'brain-coach') {
    return v;
  }
  return 'brain-coach';
}

function writePaletteTheme(t: PaletteTheme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, t);
}

export function SettingsThemes(): JSX.Element {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaletteTheme>('brain-coach');
  // Wave A4 (Daniel 2026-05-28) — theme-switch sweep confirmation. When the
  // user picks a new palette, a brief diagonal gradient sweep across the
  // screen makes the swap feel deliberate, not just a silent CSS var flip.
  // sweepKey is incremented per pick to re-trigger the keyframe (animation-name
  // is the same; React must remount the element so the run starts fresh).
  const [sweepKey, setSweepKey] = useState<number>(0);

  useEffect(() => {
    setSelected(readPaletteTheme());
  }, []);

  function handlePick(t: PaletteTheme): void {
    setSelected(t);
    writePaletteTheme(t);
    applyPalette(t); // live apply — sets/clears <html data-palette>
    setSweepKey((k) => k + 1); // re-trigger sweep overlay
  }

  return (
    <section
      className="bg-paper min-h-screen flex flex-col relative overflow-hidden"
      data-testid="settings-themes"
    >
      {/* Wave A4 (Daniel 2026-05-28) — theme-switch sweep overlay. One-shot
          diagonal gradient that fades in→out 700ms once per pick. Sits above
          the page content (z-40) but below any modal/sheet. pointer-events
          none so the user can keep tapping mid-sweep. Color uses --brick via
          color-mix so each palette sweeps in its OWN accent (mov on Brain
          Coach, champagne on Luxury, gold on Living Body, brick on Clasic). */}
      {sweepKey > 0 && (
        <span
          key={sweepKey}
          aria-hidden="true"
          data-testid="theme-sweep-overlay"
          className="absolute inset-0 pointer-events-none z-40 animate-theme-sweep"
          style={{
            background:
              'linear-gradient(105deg, transparent 0%, color-mix(in oklab, var(--brick) 22%, transparent) 50%, transparent 100%)',
          }}
        />
      )}
      <SubHeader
        title="Teme"
        onBack={() => navigate(gotoPath('settings-appearance'))}
        testIdBack="settings-themes-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          Alege paleta preferata. Se aplica pe loc.
        </p>

        <div className="grid grid-cols-2 gap-3" data-testid="settings-themes-grid">
          {THEME_OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.id;
            // Static array — Tailwind JIT scans classnames as literals; using
            // a template would silently drop the utility from the build.
            const delayClass = ['delay-0', 'delay-75', 'delay-150', 'delay-225'][idx] ?? 'delay-0';
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`theme-palette-${opt.id}`}
                aria-pressed={isSelected}
                onClick={() => handlePick(opt.id)}
                className={`relative flex flex-col items-stretch p-3 rounded-xl border transition-all duration-200 active:scale-[.97] animate-card-rise ${delayClass} ${
                  isSelected ? 'border-brick bg-paper2' : 'border-line bg-paper2'
                }`}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          '0 0 0 1px color-mix(in oklab, var(--brick) 35%, transparent)',
                      }
                    : undefined
                }
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
          Paletele se schimba instant. Brain Coach e implicit.
        </p>
      </div>
    </section>
  );
}
