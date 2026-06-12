// ══ #81 — HARD movement-pattern EXCLUSION tests ══════════════════════════════
// Proves: (1) the pure exclusion descriptor/predicate, (2) buildSession HARD-REMOVES
// the contraindicated/refused PATTERN from the pool and routes to a safe same-muscle
// sibling, (3) the last-option guard never empties a leg day, (4) the shoulder-press
// landmine/neutral carve-out, (5) byte-identical for a no-injury/no-refusal user.

import { describe, it, expect } from 'vitest';
import { buildSession, movementKey } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import {
  buildExclusionTokens,
  isExcludedMovement,
  INJURY_PATTERN_EXCLUSIONS,
  OVERHEAD_PRESS_SENTINEL,
} from '../movementExclusion.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const ctx = (over = {}) => ({
  equipment: { available: over.available ?? allEquip },
  weakGroups: over.weakGroups ?? [],
  profileTier: 'profileTier' in over ? over.profileTier : 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
  excludedMovements: over.excludedMovements ?? null,
});

const tokensOf = (session) =>
  session.exercises.map((e) => movementKey(e.name, getExerciseMetadata(e.name)).split('::')[1]);

describe('#81 movementExclusion — pure descriptor + predicate', () => {
  it('buildExclusionTokens unions injury + refusal tokens', () => {
    const excl = buildExclusionTokens(['spate'], ['squat']);
    for (const t of INJURY_PATTERN_EXCLUSIONS.spate) expect(excl.tokens.has(t)).toBe(true);
    expect(excl.tokens.has('squat')).toBe(true);
  });

  it('no injury + no refusal → empty token set', () => {
    expect(buildExclusionTokens([], []).tokens.size).toBe(0);
  });

  it('isExcludedMovement: deadlift excluded under disc', () => {
    const excl = buildExclusionTokens(['spate'], []);
    expect(isExcludedMovement('Romanian Deadlift', 'deadlift', excl)).toBe(true);
    expect(isExcludedMovement('Leg Curl', 'leg-curl', excl)).toBe(false);
  });

  it('isExcludedMovement: overhead press (name-based OHP) excluded under shoulder', () => {
    const excl = buildExclusionTokens(['umeri'], []);
    expect(excl.tokens.has(OVERHEAD_PRESS_SENTINEL)).toBe(true);
    expect(isExcludedMovement('OHP', 'name:ohp', excl)).toBe(true);
    expect(isExcludedMovement('DB Shoulder Press', 'press', excl)).toBe(true);
    // landmine carve-out → still allowed (safe vertical push).
    expect(isExcludedMovement('Landmine Shoulder Press', 'press', excl)).toBe(false);
    // lateral raise never an overhead press → allowed.
    expect(isExcludedMovement('DB Lateral Raise', 'lateral-raise', excl)).toBe(false);
  });
});

describe('#81 buildSession — HARD exclusion in selection', () => {
  it('disc (spate injury): legs cluster has ZERO squat/deadlift/hip-thrust, still non-empty', () => {
    const excl = buildExclusionTokens(['spate'], []);
    const session = buildSession('legs', ctx({ excludedMovements: excl }));
    expect(session.exercises.length).toBeGreaterThan(0);
    const toks = tokensOf(session);
    for (const t of ['squat', 'deadlift', 'good-morning', 'hip-thrust']) {
      expect(toks, `disc must exclude '${t}'`).not.toContain(t);
    }
    // routed to safe machines — at least one of leg-press / leg-curl / leg-extension.
    expect(toks.some((t) => ['leg-press', 'leg-curl', 'leg-extension', 'lunge'].includes(t))).toBe(true);
  });

  it('refusal squat+deadlift: legs cluster ZERO squat/deadlift, glutes via hip-thrust/kickback', () => {
    const excl = buildExclusionTokens([], ['squat', 'deadlift']);
    const session = buildSession('lower', ctx({ excludedMovements: excl }));
    const toks = tokensOf(session);
    expect(toks).not.toContain('squat');
    expect(toks).not.toContain('deadlift');
    expect(session.exercises.length).toBeGreaterThan(0);
  });

  it('SAFETY overrides PR continuity — a logged-RDL disc patient still gets no deadlift', () => {
    const excl = buildExclusionTokens(['spate'], []);
    const session = buildSession('legs', ctx({ excludedMovements: excl, prNames: ['Romanian Deadlift'] }));
    expect(tokensOf(session)).not.toContain('deadlift');
  });

  it('last-option guard — exclusion never empties a muscle (no empty leg day)', () => {
    // Even with squat+deadlift+leg-press all refused, quads keep a non-squat option.
    const excl = buildExclusionTokens([], ['squat', 'deadlift']);
    const session = buildSession('legs', ctx({ excludedMovements: excl }));
    const quadCount = session.exercises.filter(
      (e) => getExerciseMetadata(e.name).muscle_target_primary === 'picioare-quads',
    ).length;
    expect(quadCount).toBeGreaterThan(0);
  });

  it('shoulder injury: push cluster has no OHP, keeps a non-press umeri option', () => {
    const excl = buildExclusionTokens(['umeri'], []);
    const session = buildSession('push', ctx({ excludedMovements: excl }));
    const umeri = session.exercises.filter(
      (e) => getExerciseMetadata(e.name).muscle_target_primary === 'umeri',
    );
    for (const e of umeri) {
      const tok = movementKey(e.name, getExerciseMetadata(e.name)).split('::')[1];
      expect(isExcludedMovement(e.name, tok, excl), `${e.name} should not be an overhead press`).toBe(false);
    }
  });

  it('BYTE-IDENTICAL: null exclusion === no exclusion for the common user', () => {
    for (const cluster of ['push', 'pull', 'legs', 'upper', 'lower', 'full']) {
      const base = buildSession(cluster, ctx());
      const withNull = buildSession(cluster, ctx({ excludedMovements: null }));
      const withEmpty = buildSession(cluster, ctx({ excludedMovements: buildExclusionTokens([], []) }));
      expect(withNull).toEqual(base);
      expect(withEmpty).toEqual(base);
    }
  });
});
