/**
 * S3.D — Bottom-nav HIDE in-session via body.in-session class toggle
 *
 * Per Daniel verbatim "q2 a" + "asta o sa aduca multe probleme daca sesiunea
 * nu ramane activa cand gigel da missclick" 2026-05-13b chat ACASA Sub-Q2
 * LOCKED V1. Anti-missclick by design — workout focus full-screen pur,
 * ZERO tab switch mid-session accidental.
 *
 * Pattern: source-text inspection for session.js (sessionFixes.test.js
 * precedent) + CSS file inspection for the new rule.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sessionSrc = readFileSync(resolve(__dirname, '../session.js'), 'utf8');
const cssSrc = readFileSync(resolve(__dirname, '../../../styles/main.css'), 'utf8');

// Extract function bodies for granular checks.
function fnBody(name, endMarker) {
  const start = sessionSrc.indexOf(`export function ${name}()`);
  const end = sessionSrc.indexOf(endMarker, start + 1);
  return sessionSrc.slice(start, end === -1 ? undefined : end);
}

const startSessionBody = fnBody('startSession', '\nexport function skipExercise()');
const cancelWorkoutBody = fnBody('cancelWorkout', '\nexport function endSession()');
const endSessionBody = fnBody('endSession', '\nexport function closeSummary()');
const closeSummaryBody = fnBody('closeSummary', '\nexport function updateSessionProgress()');

describe('S3.D — body.in-session class ADD at session entry paths', () => {
  it('startSession() fresh path adds body.in-session class', () => {
    // Fresh-start path is after the draft-recovery branch's `return`. Easiest
    // proxy: the section right before beepStart() (only on fresh path).
    const beepIdx = startSessionBody.indexOf('beepStart()');
    const segment = startSessionBody.slice(0, beepIdx);
    expect(segment).toContain("document.body.classList.add('in-session')");
  });

  it('startSession() draft recovery path adds body.in-session class', () => {
    // Draft branch ends at the inner `return` after 'Sesiune restaurata' toast.
    const draftBranchStart = startSessionBody.indexOf('Continui sesiunea anterioara');
    const draftBranchEnd = startSessionBody.indexOf("toast('🔄 Sesiune restaurata");
    const draftBranch = startSessionBody.slice(draftBranchStart, draftBranchEnd);
    expect(draftBranch).toContain("document.body.classList.add('in-session')");
  });

  it('startSession() S3.C double-start redirect adds body.in-session (idempotent)', () => {
    const guardStart = startSessionBody.indexOf('state.sessActive && state.sessStart');
    const guardEnd = startSessionBody.indexOf("DB.get('session-draft')");
    const guard = startSessionBody.slice(guardStart, guardEnd);
    expect(guard).toContain("document.body.classList.add('in-session')");
  });

  it('all three entry paths add the class (occurrence count >= 3 in startSession)', () => {
    const occurrences = (
      startSessionBody.match(/document\.body\.classList\.add\(\s*'in-session'\s*\)/g) || []
    ).length;
    expect(occurrences).toBeGreaterThanOrEqual(3);
  });
});

describe('S3.D — body.in-session class REMOVE at session exit paths', () => {
  it('cancelWorkout() removes body.in-session class', () => {
    expect(cancelWorkoutBody).toContain("document.body.classList.remove('in-session')");
  });

  it('closeSummary() removes body.in-session class', () => {
    expect(closeSummaryBody).toContain("document.body.classList.remove('in-session')");
  });

  it('endSession() does NOT remove body.in-session (rating modal still in-session UX)', () => {
    // Removal deferred to closeSummary() — else nav would reappear under the
    // rating modal mid-rating.
    expect(endSessionBody).not.toContain("document.body.classList.remove('in-session')");
  });
});

describe('S3.D — CSS rule presence in src/styles/main.css', () => {
  it('contains body.in-session .nav { display: none } rule', () => {
    expect(cssSrc).toMatch(/body\.in-session\s+\.nav\s*\{\s*display:\s*none\s*\}/);
  });

  it('rule is positioned after the base .nav rule (cascade order intact)', () => {
    const baseNavIdx = cssSrc.search(/\.nav\s*\{\s*position:fixed/);
    const hideRuleIdx = cssSrc.search(/body\.in-session\s+\.nav/);
    expect(baseNavIdx).toBeGreaterThan(-1);
    expect(hideRuleIdx).toBeGreaterThan(baseNavIdx);
  });
});

describe('S3.D — class toggle runtime semantics (JSDOM)', () => {
  it('classList.add idempotent — repeat calls produce single class', () => {
    document.body.classList.remove('in-session');
    document.body.classList.add('in-session');
    document.body.classList.add('in-session');
    expect(document.body.classList.contains('in-session')).toBe(true);
    // Count occurrences in className string — must be exactly 1.
    const count = (document.body.className.match(/\bin-session\b/g) || []).length;
    expect(count).toBe(1);
    document.body.classList.remove('in-session');
  });

  it('classList.remove on absent class is no-op (no error)', () => {
    document.body.classList.remove('in-session');
    expect(() => document.body.classList.remove('in-session')).not.toThrow();
    expect(document.body.classList.contains('in-session')).toBe(false);
  });

  it('full cycle add → remove → add → remove ends absent', () => {
    document.body.classList.remove('in-session');
    document.body.classList.add('in-session');
    document.body.classList.remove('in-session');
    document.body.classList.add('in-session');
    document.body.classList.remove('in-session');
    expect(document.body.classList.contains('in-session')).toBe(false);
  });

  afterEach(() => {
    document.body.classList.remove('in-session');
  });
});
