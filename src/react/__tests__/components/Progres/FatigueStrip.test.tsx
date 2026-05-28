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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFatigue).mockReturnValue(null);
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
    expect(subLabel.textContent).toBe('Pas mai conservator');
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
    expect(subLabel.textContent).toBe('Azi mergem mai bland');
    // Value paragraph SHOULD NOT contain label (split assertion).
    const valueText = subLabel.previousElementSibling?.textContent ?? '';
    expect(valueText).toMatch(/\/10$/);
    expect(valueText).not.toContain('Azi mergem mai bland');
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
    expect(screen.getByTestId('fatigue-detail').textContent).toMatch(/Sesiune fluenta/);
  });

  it('container data-testid present', () => {
    render(<FatigueStrip />);
    expect(screen.getByTestId('fatigue-strip')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<FatigueStrip />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('§DRIFT-2 (chat5) mockup literal — NO lucide icons rendered (mockup L1716-1721 zero icons)', () => {
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
    // lucide-react SVGs carry `lucide` class — assert ZERO present in card.
    const lucideSvgs = container.querySelectorAll('svg.lucide');
    expect(lucideSvgs.length).toBe(0);
    // Defense in depth: no <svg> at all în fatigue card per mockup literal.
    const allSvgs = container.querySelectorAll('svg');
    expect(allSvgs.length).toBe(0);
  });

  it('§DRIFT-2 (chat5) mockup literal — bg-white + rounded-[14px] tokens applied', () => {
    render(<FatigueStrip />);
    const strip = screen.getByTestId('fatigue-strip');
    expect(strip.className).toContain('bg-white');
    expect(strip.className).toContain('rounded-[14px]');
    // Audit MED dark-strip fix — light theme stays mockup-literal bg-white, dark
    // gets bg-paper2 variant (was hardcoded bg-white = white card on dark bg).
    expect(strip.className).toContain('dark:bg-paper2');
    // Anti-regression: light-theme surface NOT replaced by bare bg-paper2.
    expect(strip.className).not.toContain(' bg-paper2');
    expect(strip.className).not.toContain('rounded-2xl');
  });
});
