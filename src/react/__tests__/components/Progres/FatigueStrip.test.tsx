// Phase 6 task_22 — FatigueStrip Progres dashboard tests.
//
// §F-pass2-fatiguestrip-03 (MED chat5 Wave 11) — value standalone mockup
// L1720 + sub-label below mockup L1721 (NU inline span). Tests updated
// to match split structure: testid `fatigue-sub-label` for label paragraph.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../lib/engineWrappers', () => ({
  getFatigue: vi.fn(() => null),
}));

import { FatigueStrip } from '../../../components/Progres/FatigueStrip';
import { getFatigue } from '../../../lib/engineWrappers';

// Wave E4 — FatigueStrip resolves the verdict label/detail through i18n
// using the engine's semantic `key`. EN remains the default; the verdict
// assertions below match the EN copy from coachEngine.fatigue.${key}.label.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFatigue).mockReturnValue(null);
  try { localStorage.removeItem('sf.locale'); } catch {}
  _resetI18nCache();
  setLocale('en');
});

describe('FatigueStrip — Wave C2 i18n EN default', () => {
  it('renders heading "Fatigue today" (EN default)', () => {
    render(<FatigueStrip />);
    expect(screen.getByText(/Fatigue today/i)).toBeInTheDocument();
  });

  it('renders empty state cand getFatigue null — EN default', () => {
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-empty')).toBeInTheDocument();
    // Wave C2 i18n: EN default → "Not enough sessions yet" (was RO "Nu ai destule sesiuni inca").
    expect(screen.getByTestId('fatigue-empty')).toHaveTextContent(/Not enough sessions yet/i);
  });

  it('renders score (/10 scale) + label cand fatigue present', () => {
    // §F-pass2-fatiguestrip-01 — display converted to /10 (engine score 45 → 5/10
    // post Math.round(45 / 10)). Mockup L1720 verbatim "6/10" intuitive Gigel.
    // §F-pass2-fatiguestrip-03 — value standalone (text-xl mono) + sub-label
    // separate paragraph testid `fatigue-sub-label`. Use textContent match
    // because "5" + "/10" sunt în elemente separate (span nested în p).
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 45,
      key: 'MODERATE_FATIGUE',
      label: 'Pas mai conservator',
      icon: '',
      color: '',
      recommend: 'reduce',
      detail: 'Astazi mentinem greutatile.',
    });
    render(<FatigueStrip />);
    const strip = screen.getByTestId('fatigue-strip');
    expect(strip.textContent).toMatch(/5\/10/);
    const subLabel = screen.getByTestId('fatigue-sub-label');
    // Wave E4 — label resolved via i18n from key=MODERATE_FATIGUE (EN bundle).
    expect(subLabel.textContent).toBe('A bit more conservative');
  });

  it('§F-pass2-fatiguestrip-03 sub-label paragraph separate de value (mockup L1721)', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 75,
      key: 'HIGH_FATIGUE',
      label: 'Azi mergem mai bland',
      icon: '',
      color: '',
      recommend: 'deload',
      detail: '',
    });
    render(<FatigueStrip />);
    const subLabel = screen.getByTestId('fatigue-sub-label');
    expect(subLabel.tagName).toBe('P');
    // Wave E4 — label resolved via i18n from key=HIGH_FATIGUE (EN bundle).
    expect(subLabel.textContent).toBe("We'll go lighter today");
    // Value paragraph SHOULD NOT contain label (split assertion).
    const valueText = subLabel.previousElementSibling?.textContent ?? '';
    expect(valueText).toMatch(/\/10$/);
    expect(valueText).not.toContain("We'll go lighter today");
  });

  it('renders detail cand fatigue.detail prezent', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 30,
      key: 'MODERATE_FATIGUE',
      label: 'Bun',
      icon: '',
      color: '',
      recommend: 'normal',
      detail: 'Sesiune fluenta azi.',
    });
    render(<FatigueStrip />);
    // Wave E4 — detail resolved via i18n from key=MODERATE_FATIGUE (EN bundle).
    expect(screen.getByTestId('fatigue-detail').textContent).toMatch(/hold the weights/i);
  });

  it('container data-testid present', () => {
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-strip')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<FatigueStrip />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  // ANDURA PULSE reskin (Wave 2c, 2026-05-29) — the §DRIFT-2 mockup-literal
  // pins (zero icons, bg-white, rounded-[14px]) were tied to the now-retired
  // andura-clasic.html DESIGN MASTER. Pulse is the single design system, so the
  // strip matches its grid siblings BMRStrip/BodyFatStrip: an Activity icon
  // prefix on the Pulse glass tile (pulse-card pulse-card-tight). These two
  // styling-contract tests are superseded to assert the Pulse reality.
  // Pulse 1:1 parity (2026-05-29) — the flat token surface
  // (bg-paper2/border-line/rounded-2xl) is migrated to the glass tile classes.
  it('PULSE — renders an Activity lucide icon prefix (matches BMRStrip/BodyFatStrip)', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 45,
      key: 'MODERATE_FATIGUE',
      label: 'Pas mai conservator',
      icon: '',
      color: '',
      recommend: 'reduce',
      detail: '',
    });
    const { container } = render(<FatigueStrip />);
    // lucide-react SVGs carry the `lucide` class — exactly one icon now present.
    const lucideSvgs = container.querySelectorAll('svg.lucide');
    expect(lucideSvgs.length).toBe(1);
  });

  it('PULSE — glass tile (pulse-card + pulse-card-tight), not retired bg-white', () => {
    render(<FatigueStrip />);
    const strip = screen.getByTestId('fatigue-strip');
    expect(strip.className).toContain('pulse-card');
    expect(strip.className).toContain('pulse-card-tight');
    // Anti-regression: retired DESIGN MASTER literals gone.
    expect(strip.className).not.toContain('bg-white');
    expect(strip.className).not.toContain('rounded-[14px]');
  });
});
