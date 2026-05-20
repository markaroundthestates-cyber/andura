import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  showMuscleMemoryPrompt,
  _MMI_PROMPT_COPY,
} from '../muscleMemoryPrompt.js';

beforeEach(() => { document.body.innerHTML = ''; });
afterEach(() => { document.body.innerHTML = ''; });

describe('_MMI_PROMPT_COPY — Romanian no-diacritics LOCK V1 PERMANENT', () => {
  it('all wording strings contain ZERO diacritics ș/ț/ă/â/î', () => {
    const re = /[șțăâîȘȚĂÂÎ]/;
    expect(_MMI_PROMPT_COPY.title).not.toMatch(re);
    expect(_MMI_PROMPT_COPY.body).not.toMatch(re);
    expect(_MMI_PROMPT_COPY.question).not.toMatch(re);
    expect(_MMI_PROMPT_COPY.buttonAccept).not.toMatch(re);
    expect(_MMI_PROMPT_COPY.buttonRefuse).not.toMatch(re);
    expect(_MMI_PROMPT_COPY.refuseBannerText).not.toMatch(re);
  });

  it('title verbatim from spec §32.3 (no-diacritics variant)', () => {
    expect(_MMI_PROMPT_COPY.title).toBe('Bine ai revenit');
  });

  it('body conveys "corpul tau isi aminteste" message', () => {
    expect(_MMI_PROMPT_COPY.body.toLowerCase()).toContain('corpul tau');
    expect(_MMI_PROMPT_COPY.body.toLowerCase()).toContain('aminteste');
  });
});

describe('showMuscleMemoryPrompt() — DOM contract', () => {
  it('renders overlay with title + body + 2 buttons', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 8 });
    const overlay = document.getElementById('mmi-prompt-modal');
    expect(overlay).toBeTruthy();
    expect(overlay.textContent).toContain('Bine ai revenit');
    expect(overlay.querySelector('.btn-mmi-accept')).toBeTruthy();
    expect(overlay.querySelector('.btn-mmi-refuse')).toBeTruthy();
    document.querySelector('.btn-mmi-accept').click();
    await p;
  });

  it('NO forced typing — zero input/textarea (ADR 013 §AMENDMENT 2026-04-30)', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 8 });
    const overlay = document.getElementById('mmi-prompt-modal');
    expect(overlay.querySelector('input')).toBeNull();
    expect(overlay.querySelector('textarea')).toBeNull();
    document.querySelector('.btn-mmi-accept').click();
    await p;
  });

  it('accept button resolves {action: "accepted"}', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 12 });
    document.querySelector('.btn-mmi-accept').click();
    const r = await p;
    expect(r.action).toBe('accepted');
    expect(r.source).toBe('accept-button');
  });

  it('refuse button resolves {action: "refused"} + shows non-blocking banner', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 12 });
    document.querySelector('.btn-mmi-refuse').click();
    const r = await p;
    expect(r.action).toBe('refused');
    expect(r.source).toBe('refuse-button');
    expect(document.getElementById('mmi-refuse-banner')).toBeTruthy();
    expect(document.getElementById('mmi-refuse-banner').textContent).toContain('greutatile maxime');
  });

  it('modal removed from DOM after resolution', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 8 });
    document.querySelector('.btn-mmi-accept').click();
    await p;
    expect(document.getElementById('mmi-prompt-modal')).toBeNull();
  });

  it('renders peak summary when provided', async () => {
    const p = showMuscleMemoryPrompt({
      pauseMonths: 8,
      peakSummary: [
        { ex: 'Flat Barbell Bench', kg: 100 },
        { ex: 'Squat', kg: 140 },
      ],
    });
    const overlay = document.getElementById('mmi-prompt-modal');
    expect(overlay.textContent).toContain('Flat Barbell Bench');
    expect(overlay.textContent).toContain('100 kg');
    expect(overlay.textContent).toContain('Squat');
    document.querySelector('.btn-mmi-accept').click();
    await p;
  });

  it('XSS-safe — escapes exercise names + values', async () => {
    const p = showMuscleMemoryPrompt({
      pauseMonths: 8,
      peakSummary: [{ ex: '<script>alert(1)</script>', kg: 100 }],
    });
    const overlay = document.getElementById('mmi-prompt-modal');
    expect(overlay.innerHTML).not.toContain('<script>alert(1)</script>');
    expect(overlay.querySelector('script')).toBeNull();
    document.querySelector('.btn-mmi-refuse').click();
    await p;
  });

  it('subtitle shows pauseMonths approx', async () => {
    const p = showMuscleMemoryPrompt({ pauseMonths: 8.4 });
    const overlay = document.getElementById('mmi-prompt-modal');
    expect(overlay.textContent).toContain('aproximativ 8 luni');
    document.querySelector('.btn-mmi-accept').click();
    await p;
  });

  it('second invocation removes prior modal (no stacking)', async () => {
    const p1 = showMuscleMemoryPrompt({ pauseMonths: 8 });
    expect(document.querySelectorAll('#mmi-prompt-modal').length).toBe(1);

    const p2 = showMuscleMemoryPrompt({ pauseMonths: 14 });
    expect(document.querySelectorAll('#mmi-prompt-modal').length).toBe(1);

    document.querySelector('.btn-mmi-accept').click();
    await p2;
  });
});
