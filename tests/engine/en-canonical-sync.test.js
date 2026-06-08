// ══ EN-CANONICAL-KEY + SYNC ROUND-TRIP GUARDS (#41) ══════════════════════════
//
// TWO recurring bug classes get a STRUCTURAL guard here:
//
// (a) EN-CANONICAL PERSISTENCE-KEY — every engine-persisted/synced name-keyed map
//     keys on the EN-canonical engineName the ENGINE reads, NEVER the RO display
//     name. Bug history: `dp namekey fix` (b32abac3) — logs persisted on the RO
//     display name ("Impins din piept") while DP.getLogs reads the EN canonical
//     ("Flat DB Press") → getLogs empty → cold-start INIT every session → the
//     recommendation never moved; and `coach logs never written` (981c48e4). The
//     guard asserts each NAME_KEYED_SYNC_KEY's WRITE key namespace == its READ key
//     namespace == the literal engineName string (a value round-trips under the
//     SAME EN key it was written under, and is ABSENT under a RO display name).
//
// (b) SYNC ROUND-TRIP — for each name-keyed sync key, write → Firebase-encode →
//     JSON wire → decode/read is BYTE-IDENTICAL, AND the encoded cloud shape has
//     ZERO RTDB-forbidden key chars. Anti-recurrence of the PATCH-400 reversible-
//     encode bug (#37 / the `dp-cal-factors` "Pec Deck / Cable Fly" `/` that 400'd
//     the WHOLE atomic PATCH → all sync silently stopped). Reuses the EXISTING
//     reversible-encode util (encodeNameKeyed/decodeNameKeyed from firebase.js) —
//     no new encoder. Covers the recently-added keys (dp-fatigue-curve,
//     dp-strength-posterior, dp-temperament, dp-nof1-preference, …) so a new
//     name-keyed key that forgets the reversible path is caught.
//
// Files into tests/engine/** → husky pre-commit + CI Unit Tests. Deterministic +
// offline (no Firebase, no network — encode/decode are pure; the persistence
// round-trip drives DB.get/DB.set in jsdom localStorage). No src behavior change.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NAME_KEYED_SYNC_KEYS,
  SYNC_KEYS,
  encodeNameKeyed,
  decodeNameKeyed,
  fbKey,
} from '../../src/firebase.js';
import { DB } from '../../src/db.js';

import { savePosterior, loadPosterior, STRENGTH_POSTERIOR_KEY } from '../../src/engine/dp/strengthKalman.js';
import { recordExerciseSkip, exercisePenalty, EXERCISE_PAIN_KEY } from '../../src/engine/dp/exercisePain.js';
import { saveLearnedStep, learnedStep, EQUIPMENT_LADDER_KEY } from '../../src/engine/dp/equipmentLadder.js';
import { saveTemperament, temperamentBias, TEMPERAMENT_KEY } from '../../src/engine/dp/temperament.js';
import { saveFatigueCurve, FATIGUE_CURVE_KEY } from '../../src/engine/dp/fatigueCurve.js';
import { savePreference, loadPreference, NOF1_PREFERENCE_KEY } from '../../src/engine/dp/nof1.js';

const FORBIDDEN = /[.$#[\]/]/;

// Two real EN-canonical engineNames whose RO DISPLAY differs (the b32abac3 trap):
//   EN "Flat DB Press"  ≠  RO display "Impins din piept cu gantere"
//   EN "Lat Pulldown"   ≠  RO display "Tractiuni la helcometru"
// Plus one with an RTDB-forbidden char (the #37 / 400-PATCH trap):
//   EN "Pec Deck / Cable Fly"  (the founder's real, slash-carrying name)
const EN_NAME = 'Flat DB Press';
const RO_DISPLAY = 'Impins din piept cu gantere';
const EN_SLASHED = 'Pec Deck / Cable Fly';

beforeEach(() => {
  localStorage.clear();
});

// ── (a) EN-CANONICAL PERSISTENCE-KEY GUARD ────────────────────────────────────
// Each module's (save, read, KEY) triple drives the SAME store the engine reads.
// The assertion that codifies b32abac3: the WRITE lands under the literal EN
// engineName string in DB.get(KEY); the READ finds the value under that SAME EN
// string; and a read under the RO display name finds NOTHING (proving the key is
// the engine-canonical one, not the screen's display name).
//
// `read` returns a sentinel-distinct value for "present under this key" so the
// positive (EN) and negative (RO) assertions are unambiguous per module.
const EN_KEY_CASES = [
  {
    label: 'dp-strength-posterior (strengthKalman)',
    storeKey: STRENGTH_POSTERIOR_KEY,
    write: (name) => savePosterior(name, { mu: 92.5, sigma: 4, lastObsTs: 1_000, n: 6 }),
    // loadPosterior returns the stored object (or null) → presence by mu.
    presentMu: (name) => loadPosterior(name)?.mu ?? null,
  },
  {
    label: 'dp-equipment-ladder (equipmentLadder)',
    storeKey: EQUIPMENT_LADDER_KEY,
    write: (name) => saveLearnedStep(name, 2.5, 9),
    // learnedStep returns the step NUMBER (0 = absent for this engineName).
    presentMu: (name) => {
      const step = learnedStep(name);
      return step > 0 ? step : null;
    },
  },
  {
    label: 'dp-temperament (temperament)',
    storeKey: TEMPERAMENT_KEY,
    // n=12 ≥ MIN_SETS so temperamentBias returns the per-exercise bias (non-zero).
    write: (name) => saveTemperament(name, { bias: 0.5, n: 12 }),
    presentMu: (name) => {
      const b = temperamentBias(name);
      return b !== 0 ? b : null; // 0 = neutral/absent for this exercise
    },
  },
  {
    label: 'dp-nof1-preference (nof1)',
    storeKey: NOF1_PREFERENCE_KEY,
    write: (name) => savePreference(name, { arm: 'volume', decidedTs: 1_000, slopeA: 0.1, slopeB: 0.05 }),
    presentMu: (name) => loadPreference(name)?.arm ?? null,
  },
  {
    label: 'dp-exercise-pain (exercisePain)',
    storeKey: EXERCISE_PAIN_KEY,
    write: (name) => recordExerciseSkip(name, 5_000),
    // exercisePenalty reads the per-exercise skip record → >0 when a skip exists
    // for that engineName, 0 otherwise. SKIP_THRESHOLD makes one skip a small >0.
    presentMu: (name) => {
      const p = exercisePenalty(name, 'chest', null, {}, 6_000);
      return p > 0 ? p : null;
    },
  },
  {
    label: 'dp-fatigue-curve (fatigueCurve)',
    storeKey: FATIGUE_CURVE_KEY,
    // saveFatigueCurve takes a {engineName -> rec} map; assert the literal EN key
    // lands as a top-level key in the stored map (read-back is via raw store).
    write: (name) => saveFatigueCurve({ [name]: { dropIndex: 0.9, n: 5 } }),
    presentMu: (name) => {
      const all = DB.get(FATIGUE_CURVE_KEY);
      return all && typeof all === 'object' && all[name] ? all[name].dropIndex : null;
    },
  },
];

describe('(a) EN-canonical persistence-key guard (#41) — never the RO display name', () => {
  it('all NAME_KEYED_SYNC_KEYS are real members of SYNC_KEYS (no orphan name-key)', () => {
    for (const k of NAME_KEYED_SYNC_KEYS) {
      expect(SYNC_KEYS.includes(k), `${k} not in SYNC_KEYS`).toBe(true);
    }
  });

  for (const c of EN_KEY_CASES) {
    it(`${c.label}: write+read agree on the EN engineName; RO display finds nothing`, () => {
      const res = c.write(EN_NAME);
      // The save fn either returns {ok:true} or undefined (DB.set side-effect only).
      if (res && typeof res === 'object' && 'ok' in res) expect(res.ok).not.toBe(false);

      // The value is keyed under the LITERAL EN engineName in the raw store.
      const raw = DB.get(c.storeKey);
      expect(raw && typeof raw === 'object', `${c.storeKey} store missing`).toBe(true);
      expect(
        Object.prototype.hasOwnProperty.call(raw, EN_NAME),
        `"${EN_NAME}" not a top-level key in ${c.storeKey} — key derivation is NOT EN-canonical`
      ).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(raw, RO_DISPLAY)).toBe(false);

      // The engine READ finds it under the EN canonical name.
      expect(c.presentMu(EN_NAME), `read under EN "${EN_NAME}" should find the value`).not.toBe(null);
      // …and finds NOTHING under the RO display name (the b32abac3 stranded-log class).
      expect(
        c.presentMu(RO_DISPLAY),
        `read under RO display "${RO_DISPLAY}" must be empty — else logs strand off the engine key`
      ).toBe(null);
    });
  }

  // The save fns must reject a non-string key (defensive: the bad_key guard that
  // prevents an undefined/RO-object key silently corrupting the map).
  it('name-keyed save fns reject a non-string key (bad_key guard intact)', () => {
    // @ts-expect-no — runtime guard test
    expect(savePosterior(undefined, { mu: 1, sigma: 1, lastObsTs: 0, n: 1 }).error).toBe('bad_key');
    expect(saveLearnedStep('', 2.5, 1).error).toBe('bad_key');
    expect(savePreference(undefined, { arm: 'volume', decidedTs: 0, slopeA: 0, slopeB: 0 }).error).toBe('bad_key');
  });
});

// ── (b) SYNC ROUND-TRIP GUARD ─────────────────────────────────────────────────
// For each NAME_KEYED_SYNC_KEY: a realistic free-text-name-keyed value →
// encodeNameKeyed → JSON wire → decodeNameKeyed must be BYTE-IDENTICAL, and the
// encoded cloud shape must carry ZERO RTDB-forbidden key chars (the 400 trap).
// Fixtures include the slash-carrying EN name + an EN/RO-distinct pair so a naive
// `replace(/[.$#[\]/]/g,'_')` (which would collide / lose data) is rejected.
function fixtureFor(key) {
  // Each name-keyed map value is an OBJECT (audited): the per-exercise record.
  const objVal = (i) => ({ a: i, b: i / 2, n: i + 1, ts: 1_700_000_000_000 + i });
  return {
    [EN_NAME]: objVal(1),
    [EN_SLASHED]: objVal(2), // the / that 400'd the whole PATCH
    'B.B. Row': objVal(3), // dotted forbidden chars
    'E[F]#G$H': objVal(4), // bracket/hash/dollar forbidden chars
    // GLOBAL sentinel key used by dp-temperament — harmless for the others.
    global: objVal(5),
  };
}

function assertNoForbiddenKeys(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(assertNoForbiddenKeys);
    return;
  }
  for (const k of Object.keys(node)) {
    expect(FORBIDDEN.test(k), `forbidden RTDB char in cloud key "${k}"`).toBe(false);
    assertNoForbiddenKeys(node[k]);
  }
}

describe('(b) sync round-trip guard (#41) — reversible encode, byte-identical', () => {
  it('NAME_KEYED_SYNC_KEYS covers the recently-added name-keyed engine keys', () => {
    // Regression anchor: if a future name-keyed engine map is added to SYNC_KEYS
    // but forgotten here, this list-membership keeps the intent visible.
    const expected = [
      'dp-cal-factors',
      'dp-strength-posterior',
      'dp-exercise-pain',
      'dp-equipment-ladder',
      'dp-temperament',
      'dp-fatigue-curve',
      'dp-nof1-preference',
    ];
    for (const k of expected) {
      expect(NAME_KEYED_SYNC_KEYS.includes(k), `${k} missing from NAME_KEYED_SYNC_KEYS`).toBe(true);
    }
  });

  for (const key of NAME_KEYED_SYNC_KEYS) {
    it(`${key}: write → encode → JSON wire → decode is BYTE-IDENTICAL`, () => {
      const original = fixtureFor(key);

      // Full cloud path: encode → serialize over the wire → parse → decode.
      const encoded = encodeNameKeyed(original);
      expect(Array.isArray(encoded), `${key} did not encode to the reversible array shape`).toBe(true);
      const wire = JSON.parse(JSON.stringify(encoded));
      const decoded = decodeNameKeyed(wire);

      // Byte-identical round-trip — every EN name (incl. the slashed one) restored.
      expect(decoded).toEqual(original);
      // Specifically: the two would-collide-under-naive-replace names stay distinct.
      expect(decoded[EN_SLASHED]).toEqual(original[EN_SLASHED]);
    });

    it(`${key}: the encoded cloud shape has ZERO RTDB-forbidden key chars (no PATCH-400)`, () => {
      const encoded = encodeNameKeyed(fixtureFor(key));
      assertNoForbiddenKeys(encoded);
      // The top-level remote NODE name must also be RTDB-safe (fbKey sanitizes).
      expect(FORBIDDEN.test(fbKey(key))).toBe(false);
    });
  }

  // The encoder/decoder are lossless on the edge shapes the prod data can take.
  it('round-trips a scalar/array value via the reserved sentinel (no object collapse)', () => {
    const map = { A: 5, B: 'txt', C: [1, 2, 3], D: { value: 9 } };
    expect(decodeNameKeyed(JSON.parse(JSON.stringify(encodeNameKeyed(map))))).toEqual(map);
  });

  it('a would-collide pair survives distinct (rejects naive replace())', () => {
    const map = {
      'Pec Deck / Cable Fly': { kgFactor: 1.25, n: 4 },
      'Pec Deck _ Cable Fly': { kgFactor: 0.8, n: 9 },
    };
    const restored = decodeNameKeyed(JSON.parse(JSON.stringify(encodeNameKeyed(map))));
    expect(Object.keys(restored)).toEqual(Object.keys(map));
    expect(restored['Pec Deck / Cable Fly'].kgFactor).toBe(1.25);
    expect(restored['Pec Deck _ Cable Fly'].kgFactor).toBe(0.8);
  });
});
