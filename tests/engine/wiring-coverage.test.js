// ══ WIRING-COVERAGE GUARD (#40) — "% of the motor that drives the car" ════════
//
// THE BUG CLASS this guards (HOW_ANDURA_WORKS.md §3, §9): a smart engine computes
// real math but its output is DISCARDED before it reaches the session the user
// sees — 8 engines compute, only ~4 drive. The full-path-sim (#38) revealed two
// "built" engine outputs with NO live caller in the compose/dp path (DARK
// primitives: they compute but nothing consumes them): dp_dip_classifier_v1
// (classifyPerformanceDip) + dp_auto_pivot_v1 (proposeGoalPivot).
//
// WHAT THIS ASSERTS — for every per-exercise/-session engine flag in the FLAGS
// registry, there is a REACHABLE CONSUMER in live src (a real `isEnabled('<flag>')`
// gate outside the registry + outside tests). A flag with a registry entry + a
// module + a unit test but NO live gate is the exact "computed-but-discarded" bug
// — it ships dark.
//
// TRUE-POSITIVE-ONLY (the hard requirement): the signal is a literal source scan
// of `src/**` for an `isEnabled('<flag>')` call site, EXCLUDING the registry file
// itself and ALL test files (`*.test.*`, `*.spec.*`, `**/__tests__/**`). A flag is
// "wired" iff such a gate exists in shipped code. No heuristics, no fuzzy matching
// → it cannot raise a false CI failure.
//
// THE ALLOW-LIST is the KNOWN-DARK set (documented, deliberately deferred). The
// suite is GREEN today, but FAILS the moment:
//   • a NEW engine flag goes dark (no live gate, not allow-listed) → regression, OR
//   • a known-dark flag gets WIRED but is still allow-listed → the list must shrink
//     (stale-allow-list guard — keeps the allow-list honest as wiring lands).
//
// Files into tests/engine/** → runs under `npm run test:run` (husky pre-commit +
// CI Unit Tests). Deterministic + offline (a filesystem read, no engine run, no
// API). Reuses the full-path-sim's finding (fp-config.js header + fp-darkprimitives)
// rather than re-deriving it.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { FLAGS } from '../../src/util/featureFlags.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = resolve(__dirname, '../../src');
const REGISTRY_REL = 'util/featureFlags.js'; // the definition site — excluded as a caller

// ── KNOWN-DARK allow-list (deliberately-deferred engine outputs) ──────────────
// Each entry MUST cite WHY it is dark + the deferral boundary, so the list stays
// auditable. These are PURE primitives whose live-session WIRING is deferred (the
// math is unit-tested; the consumer is not yet built). When one gets a live
// `isEnabled` gate, the stale-allow-list test below forces its removal here.
//
// SHRUNK 2026-06-08 (F6a wiring): dp_fatigue_curve_v1 (#20), dp_subrecovery_drift_v1
// (#26) + dp_dip_classifier_v1 (#32) were allow-listed dark; each is now WIRED to a
// live consumer behind its own isEnabled gate — so per the stale-allow-list guard
// they MUST leave this list.
//   #20 → fatigueSetsAdjust into distributeGroupSets (getDailyWorkout.js gate)
//   #26 → drift candidate → deload AA trigger (scheduleAdapterAggregate.builder.ts)
//   #32 → LIFE_DIP suppresses the reactive deload (builder → deload/index.js)
//
// EMPTIED 2026-06-08 (#15 wiring): dp_auto_pivot_v1 was the LAST entry — its live
// render-surface now ships. getGoalPivotProposal (engineWrappers.ts) gates on
// isEnabled('dp_auto_pivot_v1') and feeds the GoalPivotBanner in the Progres
// OBIECTIV zone (banner + Tier-3 confirm + on-accept setGoal). Per the stale-
// allow-list guard it leaves the list → the allow-list is now EMPTY (every scoped
// dp_*_v1 engine flag has a live consumer; nothing is deliberately dark).
//
// ADDED 2026-06-09 (Wave 1.3 focus-policy FOUNDATION step): dp_focus_policy_v1 gates
// the per-focus pattern-policy resolver that will READ src/engine/focusPolicy.js
// FOCUS_RULES (session caps / per-session requirements / cross-day weekly minimums /
// frequency caps). THIS step ships ONLY the frozen DATA table + the OFF flag — the
// constraint RESOLVER (the live consumer) is a LATER Wave 1.3 step, deliberately
// deferred so the data contract + tag-availability are landed + reviewed first.
// When the resolver adds its isEnabled('dp_focus_policy_v1') gate, the stale-allow-
// list guard below forces this entry's removal.
const KNOWN_DARK_ALLOWLIST = Object.freeze({
  dp_focus_policy_v1: 'Wave 1.3 — FOCUS_RULES data table shipped; resolver (live consumer) is a deferred later step.',
});

// Only the per-exercise / per-session ENGINE flags are in scope — the dimension-
// rollout / orchestrator-strangler flags (aa_via_cluster, *_via_orchestrator,
// bayesian_kalman_v1) have their own parity gates + are not "dp.js compose-path
// engine outputs". Scope = the `dp_*_v1` family (the #38 full-path-sim cohort
// surface), matching fp-config.PATH_A_FLAGS' universe.
const IN_SCOPE = (flagId) => /^dp_.*_v1$/.test(flagId);

// ── Recursive source walk (deterministic order; test files excluded) ──────────
function isTestFile(path) {
  return (
    /[.](test|spec)[.][a-z]+$/.test(path) ||
    path.includes('__tests__') ||
    path.includes('__snapshots__')
  );
}

function collectSourceFiles(dir, acc = []) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === '__tests__' || name === '__snapshots__' || name === 'node_modules') continue;
      collectSourceFiles(full, acc);
    } else if (/[.](js|ts|tsx)$/.test(name) && !isTestFile(full)) {
      acc.push(full);
    }
  }
  return acc;
}

const SOURCE_FILES = collectSourceFiles(SRC_ROOT).filter(
  (f) => !f.endsWith(join('src', REGISTRY_REL)) // the definition site is not a caller
);

// A flag is WIRED iff some shipped (non-registry, non-test) source file gates on it
// via a literal `isEnabled('<flag>')` / `isEnabled("<flag>")` call. Returns the
// list of files that gate it (empty ⇒ DARK).
function liveGateSites(flagId) {
  const needleSingle = `isEnabled('${flagId}')`;
  const needleDouble = `isEnabled("${flagId}")`;
  const sites = [];
  for (const file of SOURCE_FILES) {
    const text = readFileSync(file, 'utf8');
    if (text.includes(needleSingle) || text.includes(needleDouble)) sites.push(file);
  }
  return sites;
}

const SCOPED_FLAGS = Object.keys(FLAGS).filter(IN_SCOPE).sort();

describe('wiring-coverage guard (#40) — engine output must reach the live session', () => {
  it('the scoped engine-flag universe is non-empty (the scan actually ran)', () => {
    expect(SCOPED_FLAGS.length).toBeGreaterThan(0);
  });

  // ── CORE: every scoped flag is EITHER wired OR a documented known-dark ───────
  for (const flagId of SCOPED_FLAGS) {
    it(`${flagId} has a live consumer (or is a documented known-dark primitive)`, () => {
      const sites = liveGateSites(flagId);
      const wired = sites.length > 0;
      const allowed = Object.prototype.hasOwnProperty.call(KNOWN_DARK_ALLOWLIST, flagId);

      if (wired) {
        // Seam-wired engine output — reaches the session. Good.
        expect(wired).toBe(true);
        return;
      }
      // DARK (no live gate): only OK if explicitly, documentedly allow-listed.
      // A NEW dark flag (computed-but-discarded regression) fails here LOUDLY.
      expect(
        allowed,
        `\n\nWIRING REGRESSION: engine flag "${flagId}" has NO live isEnabled() ` +
          `gate in shipped src/ — its output is computed but never consumed by the ` +
          `live session (the "${'8 engines compute, ~4 drive'}" bug class).\n` +
          `Either WIRE it (add an isEnabled('${flagId}') gate at the consumer) or, ` +
          `if its consumer is deliberately deferred, add it to KNOWN_DARK_ALLOWLIST ` +
          `with a citation of the deferral boundary.\n`
      ).toBe(true);
    });
  }

  // ── STALE-ALLOW-LIST guard: a known-dark flag that GOT WIRED must leave the list ─
  for (const flagId of Object.keys(KNOWN_DARK_ALLOWLIST)) {
    it(`allow-listed dark "${flagId}" is still genuinely dark (else shrink the list)`, () => {
      const sites = liveGateSites(flagId);
      expect(
        sites.length,
        `\n\nSTALE ALLOW-LIST: "${flagId}" is on KNOWN_DARK_ALLOWLIST but now HAS a ` +
          `live isEnabled() gate (${sites.map((f) => f.replace(SRC_ROOT, 'src')).join(', ')}). ` +
          `It is no longer dark — REMOVE it from KNOWN_DARK_ALLOWLIST so the allow-list ` +
          `shrinks as wiring lands.\n`
      ).toBe(0);
    });
  }

  // ── allow-list entries must reference a real registry flag (no rot) ──────────
  it('every KNOWN_DARK_ALLOWLIST entry names a real, in-scope FLAGS flag', () => {
    for (const flagId of Object.keys(KNOWN_DARK_ALLOWLIST)) {
      expect(Object.prototype.hasOwnProperty.call(FLAGS, flagId), `${flagId} not in FLAGS`).toBe(true);
      expect(IN_SCOPE(flagId), `${flagId} out of scope`).toBe(true);
    }
  });

  // ── coverage headline: the live-driven share of the motor (informational gate) ─
  it('reports the wired-share of the engine-flag motor (and the known-dark count)', () => {
    const wired = SCOPED_FLAGS.filter((f) => liveGateSites(f).length > 0);
    const dark = SCOPED_FLAGS.filter((f) => liveGateSites(f).length === 0);
    // Every dark flag must be accounted for by the allow-list (redundant with the
    // per-flag test, but makes the headline self-consistent).
    for (const d of dark) {
      expect(Object.prototype.hasOwnProperty.call(KNOWN_DARK_ALLOWLIST, d), `unaccounted dark ${d}`).toBe(true);
    }
    // The allow-list may not be LARGER than the actually-dark set (no phantom entries).
    expect(Object.keys(KNOWN_DARK_ALLOWLIST).length).toBe(dark.length);
    expect(wired.length + dark.length).toBe(SCOPED_FLAGS.length);
  });
});
