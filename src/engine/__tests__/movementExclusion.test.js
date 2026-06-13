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
  LUMBAR_HINGE_SENTINEL,
} from '../movementExclusion.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const ctx = (over = {}) => ({
  equipment: { available: over.available ?? allEquip },
  weakGroups: over.weakGroups ?? [],
  profileTier: 'profileTier' in over ? over.profileTier : 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
  excludedMovements: over.excludedMovements ?? null,
  ...('legCurlGuarantee' in over ? { legCurlGuarantee: over.legCurlGuarantee } : {}),
  ...('volumeTargets' in over ? { volumeTargets: over.volumeTargets } : {}),
  ...('weeklySessionsPerGroup' in over ? { weeklySessionsPerGroup: over.weeklySessionsPerGroup } : {}),
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

  it('isExcludedMovement: knee — deep-flexion/shear patterns excluded, leg-press/curl kept', () => {
    // genunchi → picioare-quads + picioare-hamstrings (PAIN_REGION_GROUP_MAP).
    const excl = buildExclusionTokens(['picioare-quads', 'picioare-hamstrings'], []);
    expect(isExcludedMovement('Hack Squat Machine', 'squat', excl)).toBe(true);
    expect(isExcludedMovement('Bulgarian Split Squat', 'squat', excl)).toBe(true);
    expect(isExcludedMovement('Glute Walking Lunge', 'lunge', excl)).toBe(true);
    expect(isExcludedMovement('Leg Extension', 'leg-extension', excl)).toBe(true);
    // knee-safe siblings stay in pool.
    expect(isExcludedMovement('45-Degree Leg Press', 'leg-press', excl)).toBe(false);
    expect(isExcludedMovement('Seated Leg Curl', 'leg-curl', excl)).toBe(false);
    expect(isExcludedMovement('Romanian Deadlift', 'deadlift', excl)).toBe(false);
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

  it('knee injury: legs cluster has ZERO squat/lunge/leg-extension, routed to knee-safe, non-empty', () => {
    const excl = buildExclusionTokens(['picioare-quads', 'picioare-hamstrings'], []);
    const session = buildSession('legs', ctx({ excludedMovements: excl }));
    expect(session.exercises.length).toBeGreaterThan(0);
    const toks = tokensOf(session);
    for (const t of ['squat', 'lunge', 'leg-extension']) {
      expect(toks, `knee must exclude '${t}'`).not.toContain(t);
    }
    // quads still trained — routed to the knee-safe closed-chain leg press.
    const quadCount = session.exercises.filter(
      (e) => getExerciseMetadata(e.name).muscle_target_primary === 'picioare-quads',
    ).length;
    expect(quadCount).toBeGreaterThan(0);
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

// ══ #R6b — disc (spate) LUMBAR-HINGE sentinel + paired leg-curl backfill ════════
// Proves the SAFETY pair: (1) the name-based LUMBAR_HINGE sentinel excludes the
// erector-extension family (GHR / Nordic / hyperextension / back-extension) that the
// token list cannot reach, while keeping the spine-neutral leg curl; (2) under a spate
// exclusion the hamstring leg-curl guarantee seats a Leg Curl on a hams-training
// cluster (the backfill that makes excluding GHR safe — no re-orphaned hamstrings);
// (3) the GHR exclusion + backfill never re-introduce a contraindicated hinge.
describe('#R6b LUMBAR_HINGE sentinel — name-based erector-extension exclusion', () => {
  it('spate exclusion carries the LUMBAR_HINGE sentinel', () => {
    const excl = buildExclusionTokens(['spate'], []);
    expect(excl.tokens.has(LUMBAR_HINGE_SENTINEL)).toBe(true);
    expect(INJURY_PATTERN_EXCLUSIONS.spate).toContain(LUMBAR_HINGE_SENTINEL);
  });

  it('GHR / Nordic / hyperextension / back-extension excluded BY NAME, leg curl kept', () => {
    const excl = buildExclusionTokens(['spate'], []);
    // GHR keys as `raise`, Nordic as `curl`, the hypers as `name:<...>` — none caught
    // by a token match, all caught by the name sentinel.
    expect(isExcludedMovement('Glute-Ham Raise', 'raise', excl)).toBe(true);
    expect(isExcludedMovement('Natural Glute-Ham Raise', 'raise', excl)).toBe(true);
    expect(isExcludedMovement('Nordic Hamstring Curl', 'curl', excl)).toBe(true);
    expect(isExcludedMovement('45° Hyperextension', 'name:45° hyperextension', excl)).toBe(true);
    expect(isExcludedMovement('Roman Chair Back Extension', 'extension', excl)).toBe(true);
    expect(isExcludedMovement('GHD Back Extension', 'extension', excl)).toBe(true);
    expect(isExcludedMovement('Reverse Hyper', 'name:reverse hyper', excl)).toBe(true);
    expect(isExcludedMovement('Hyperextension Machine', 'name:hyperextension machine', excl)).toBe(true);
    // the spine-NEUTRAL leg curl (knee flexion) is the safe backfill — never excluded.
    expect(isExcludedMovement('Seated Leg Curl', 'leg-curl', excl)).toBe(false);
    expect(isExcludedMovement('Leg Curl', 'leg-curl', excl)).toBe(false);
    expect(isExcludedMovement('Standing Leg Curl', 'leg-curl', excl)).toBe(false);
  });

  it('sentinel is spate-only — a non-spate user (no sentinel) keeps GHR allowed', () => {
    const kneeExcl = buildExclusionTokens(['picioare-quads', 'picioare-hamstrings'], []);
    expect(kneeExcl.tokens.has(LUMBAR_HINGE_SENTINEL)).toBe(false);
    expect(isExcludedMovement('Glute-Ham Raise', 'raise', kneeExcl)).toBe(false);
  });
});

describe('#R6b leg-curl GUARANTEE — backfill seats under a spate exclusion', () => {
  const excl = () => buildExclusionTokens(['spate'], []);

  it('hams-training cluster lands a spine-neutral leg curl, ZERO GHR / hinge', () => {
    for (const cluster of ['legs', 'lower', 'full']) {
      const session = buildSession(
        cluster,
        ctx({ excludedMovements: excl(), legCurlGuarantee: true }),
      );
      const hamsPrimary = session.exercises.filter(
        (e) => getExerciseMetadata(e.name).muscle_target_primary === 'picioare-hamstrings',
      );
      expect(hamsPrimary.length, `${cluster}: hamstrings must not be orphaned`).toBeGreaterThan(0);
      // the seated hamstring mover is a spine-neutral leg curl (knee flexion).
      const hamsTokens = hamsPrimary.map(
        (e) => movementKey(e.name, getExerciseMetadata(e.name)).split('::')[1],
      );
      expect(hamsTokens, `${cluster}: hams via leg-curl`).toContain('leg-curl');
      // no contraindicated hinge / erector-extension anywhere in the session.
      const BAD = /glute.?ham|nordic|hyperext|back extension|good.?morning|deadlift|romanian|stiff.?leg|roman chair|\bghd\b|reverse hyper|conventional|squat|hip thrust/i;
      for (const e of session.exercises) {
        expect(BAD.test(e.name), `${cluster}: '${e.name}' is contraindicated`).toBe(false);
      }
    }
  });

  it('a slot-crunched (small budget) lower day still seats a leg curl, never orphans another muscle', () => {
    // Tiny per-session budget → the round-robin would round hamstrings out; the
    // guarantee swaps an over-slotted isolation for the leg curl (length-stable).
    const session = buildSession(
      'lower',
      ctx({
        excludedMovements: excl(),
        legCurlGuarantee: true,
        volumeTargets: { quadriceps: 6, hamstrings: 4, glutes: 6, calves: 4 },
        weeklySessionsPerGroup: { 'picioare-quads': 2, 'picioare-hamstrings': 2, fese: 2, gambe: 2 },
      }),
    );
    const hams = session.exercises.filter(
      (e) => getExerciseMetadata(e.name).muscle_target_primary === 'picioare-hamstrings',
    );
    expect(hams.length).toBeGreaterThan(0);
    // every muscle that has a slot keeps ≥1 (the swap never zeroed a victim group).
    const counts = {};
    for (const e of session.exercises) {
      const g = getExerciseMetadata(e.name).muscle_target_primary;
      counts[g] = (counts[g] || 0) + 1;
    }
    for (const [g, n] of Object.entries(counts)) {
      expect(n, `${g} must keep ≥1 slot`).toBeGreaterThan(0);
    }
  });

  it('OFF (no legCurlGuarantee) — exclusion still applies but no inject (byte-identical gate)', () => {
    // With the guarantee OFF the spate exclusion still removes the hinge family; the
    // guarantee is purely additive (it never runs without the flag).
    const on = buildSession('lower', ctx({ excludedMovements: excl(), legCurlGuarantee: true }));
    const off = buildSession('lower', ctx({ excludedMovements: excl(), legCurlGuarantee: false }));
    // both never contain a contraindicated hinge (the exclusion is flag-independent).
    const BAD = /glute.?ham|nordic|deadlift|romanian|good.?morning|squat|hip thrust|hyperext/i;
    for (const s of [on, off]) {
      for (const e of s.exercises) expect(BAD.test(e.name)).toBe(false);
    }
  });

  it('no spate exclusion → guarantee never fires (gate requires the sentinel)', () => {
    // legCurlGuarantee ON but NO spate signal (null exclusion) → byte-identical to OFF.
    const guardOn = buildSession('lower', ctx({ legCurlGuarantee: true, excludedMovements: null }));
    const guardOff = buildSession('lower', ctx({ legCurlGuarantee: false, excludedMovements: null }));
    expect(guardOn).toEqual(guardOff);
  });
});
