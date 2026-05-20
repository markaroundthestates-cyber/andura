/**
 * S3.C — Session guard double-start
 *
 * Per Daniel verbatim "q1 - a" 2026-05-13b chat ACASA Sub-Q1 LOCKED V1.
 * state.sessActive + state.sessStart check at top of startSession() before
 * draft detection logic → redirect direct la session-ui zero prompt
 * Gigel-smooth. Anti-paternalism: NU confirm() forced friction.
 *
 * Pattern: source-text inspection (consistent with sessionFixes.test.js precedent
 * — session.js has heavy DOM/interval/Sentry side effects, runtime invocation
 * impractical).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sessionSrc = readFileSync(resolve(__dirname, '../session.js'), 'utf8');

// Extract the startSession() function body for granular checks.
const ssStart = sessionSrc.indexOf('export function startSession()');
const ssEnd = sessionSrc.indexOf('\nexport function skipExercise()');
const ssBody = sessionSrc.slice(ssStart, ssEnd);

describe('S3.C — session guard double-start placement', () => {
  it('guard exists at top of startSession() before draft detection', () => {
    const guardIdx = ssBody.indexOf('state.sessActive && state.sessStart');
    const draftIdx = ssBody.indexOf("DB.get('session-draft')");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(draftIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(draftIdx);
  });

  it('guard uses both sessActive AND sessStart (not just one)', () => {
    expect(ssBody).toMatch(/if\s*\(\s*state\.sessActive\s*&&\s*state\.sessStart\s*\)/);
  });

  it('guard redirects via today-screen hide + session-ui show', () => {
    const guardSlice = ssBody.slice(
      ssBody.indexOf('state.sessActive && state.sessStart'),
      ssBody.indexOf("DB.get('session-draft')")
    );
    expect(guardSlice).toContain("'today-screen'");
    expect(guardSlice).toContain("style.display = 'none'");
    expect(guardSlice).toContain("'session-ui'");
    expect(guardSlice).toContain("style.display = 'block'");
  });

  it('guard emits toast "Sesiune deja activa" (UX feedback)', () => {
    const guardSlice = ssBody.slice(
      ssBody.indexOf('state.sessActive && state.sessStart'),
      ssBody.indexOf("DB.get('session-draft')")
    );
    expect(guardSlice).toContain('Sesiune deja activa');
  });

  it('guard exits early via return (does NOT fall through to draft check)', () => {
    const guardSlice = ssBody.slice(
      ssBody.indexOf('state.sessActive && state.sessStart'),
      ssBody.indexOf("DB.get('session-draft')")
    );
    expect(guardSlice).toContain('return');
  });

  it('guard does NOT add confirm() prompt (anti-paternalism preserved)', () => {
    const guardSlice = ssBody.slice(
      ssBody.indexOf('state.sessActive && state.sessStart'),
      ssBody.indexOf("DB.get('session-draft')")
    );
    expect(guardSlice).not.toContain('confirm(');
  });

  it('draft recovery confirm() prompt PRESERVED INTACT (separate concern)', () => {
    // Pre-existing prompt for crashed-session recovery — different scenario.
    expect(ssBody).toContain('seturi nefinalizate din azi. Continui sesiunea anterioara?');
    expect(ssBody).toMatch(/confirm\(`Ai \$\{draft\.sessLog\.length\} seturi nefinalizate/);
  });

  it('guard placement is BEFORE all state mutation in startSession', () => {
    // Anti-recurrence: guard must short-circuit BEFORE any state.sessActive=true assignment.
    const guardIdx = ssBody.indexOf('if (state.sessActive && state.sessStart)');
    const firstMutation = ssBody.indexOf('state.sessActive = true');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(firstMutation).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(firstMutation);
  });
});

describe('S3.C — distinction draft recovery vs double-start guard', () => {
  it('startSession() contains BOTH guard (S3.C) AND draft recovery confirm (pre-existing)', () => {
    // Two distinct scenarios coexist:
    //   1. Sesiune active acum (sessActive=true) → S3.C guard, zero prompt
    //   2. Sesiune crashed previous (sessActive=false + draft localStorage) → draft prompt
    expect(ssBody).toContain('state.sessActive && state.sessStart'); // S3.C
    expect(ssBody).toContain('Continui sesiunea anterioara?'); // draft recovery
  });

  it('guard is ordered FIRST (before draft prompt) so draft prompt never fires mid-session', () => {
    const guardIdx = ssBody.indexOf('state.sessActive && state.sessStart');
    const draftConfirmIdx = ssBody.indexOf('Continui sesiunea anterioara');
    expect(guardIdx).toBeLessThan(draftConfirmIdx);
  });
});
