// ══ CANONICAL ALIAS MAP — alias → canonical engineName (#6, Wave-2 library) ════
//
// THE ROOT FIX for the name-key bug class (b32abac3 + 981c48e4). The library has
// THREE un-unified naming layers for the SAME physical movement:
//   1. EN-canonical engineName — the key the ENGINE reads (DP.getLogs / getState /
//      PR records / every name-keyed sync store). This is the SoT. NEVER renamed.
//   2. RO display name (`nameRo`) — what the screen shows ("Impins din piept").
//   3. Legacy / pre-F-1 synonyms ("Pushdown", "Lateral Raises", "Low Bar", …).
//
// When a value is persisted under a NON-canonical name it strands off the engine
// key → cold-start INIT forever (the "weight didn't move" bug). This module gives
// any inbound name a deterministic resolution to ONE canonical engineName.
//
// ADDITIVE — STRICT INVARIANT: existing canonical engineNames stay EXACTLY as they
// are. resolveCanonical is the IDENTITY for any name that is already a real library
// key (the common case, byte-identical). We add resolution only for the OTHER
// names. We NEVER rename a canonical here.
//
// Two alias layers, checked in order (first hit wins):
//   (A) RO-display → EN-canonical — generated ONCE at module load FROM the library
//       (`nameRo` → key for every CORE_AUTO whose RO display differs from its EN
//       key). Generated, not hand-typed, so it can never desync from the data.
//   (B) Explicit synonym/legacy → canonical — the doc-enumerated alias relations
//       that are NOT a simple RO-display mapping (legacy SIMILAR_EXERCISES display
//       keys, "Low Bar" → "(High Bar)", etc.). Hand-curated, never-delete.
//
// Cross-ref: ANDURA-CORE-LIBRARY-v2-2026-06-03.md (#6 chains-as-data + alias map),
// tests/engine/en-canonical-sync.test.js (#41 EN-canonical guard).

import { EXERCISE_METADATA } from './exerciseLibrary.js';

// ── (B) EXPLICIT synonym / legacy → canonical engineName ────────────────────────
// Only relations the RO-display generator does NOT already cover. Every VALUE here
// must be a real library key (asserted by the alias-map test). Never-delete: an old
// persisted name must keep resolving for the life of the app.
export const EXPLICIT_ALIASES = Object.freeze({
  // ── Legacy pre-F-1 display names still present as long-tail library keys ──────
  // These are the SAME movement as a CORE_AUTO canonical; the engine should treat
  // them as one. (SIMILAR_EXERCISES kept several of these as KEYS pre-#6.)
  'Pushdown': 'Cable Triceps Pushdown Straight Bar',
  'Overhead Triceps': 'Cable Overhead Triceps Extension Rope',
  'Lateral Raises': 'DB Lateral Raise',
  'Lateral Raises (cable)': 'Cable Lateral Raise',
  'Face Pulls': 'Face Pull',
  'Rear Delt Fly': 'DB Rear Delt Fly',
  'Hammer Curl': 'DB Hammer Curl Standing',
  'Preacher Curl': 'EZ-bar Preacher Curl',
  'Pec Deck': 'Pec Deck / Cable Fly',

  // ── Doc-enumerated aliases (ANDURA-CORE-LIBRARY-v2 §CORE_AUTO per grupa) ───────
  // "Low Bar -> alias" (Quads §), the canonical being the High Bar variant.
  'Barbell Back Squat (Low Bar)': 'Barbell Back Squat (High Bar)',
  // "DB Shoulder Press" is the doc's umeri canonical; "Seated DB Press" co-listed
  // — keep both as live canonicals (both real CORE_AUTO keys), so NO alias here.
});

// ── (A) RO-display → EN-canonical (generated from the library at load) ──────────
// Built once. Skips any RO name that (defensively) collides with a real EN key or
// is already mapped explicitly, so layer (B) and real canonicals always win.
/** @type {Record<string,string>} */
const RO_DISPLAY_ALIASES = {};
{
  for (const [engineName, meta] of Object.entries(EXERCISE_METADATA)) {
    const ro = meta && meta.nameRo;
    if (typeof ro !== 'string' || ro.length === 0) continue;
    if (ro === engineName) continue;                 // identity — not an alias
    if (Object.prototype.hasOwnProperty.call(EXERCISE_METADATA, ro)) continue; // RO shadows a real key — never alias it
    // If this entry's engineName is itself folded (an untagged long-tail synonym
    // in EXPLICIT_ALIASES), point the RO name at the FINAL canonical so every RO
    // alias is single-hop (resolves to a name that resolves to itself).
    const target = EXPLICIT_ALIASES[engineName] || engineName;
    if (RO_DISPLAY_ALIASES[ro] && RO_DISPLAY_ALIASES[ro] !== target) continue; // first wins, no ambiguous remap
    RO_DISPLAY_ALIASES[ro] = target;
  }
}
Object.freeze(RO_DISPLAY_ALIASES);
export { RO_DISPLAY_ALIASES };

/**
 * Resolve any inbound exercise name to its ONE canonical engineName.
 *
 * Resolution order (first hit wins):
 *   0. Non-string / empty → returned unchanged (defensive; never throws).
 *   1. Explicit synonym/legacy alias (EXPLICIT_ALIASES) — the AUDITED fold list.
 *      Checked FIRST because some legacy synonyms ("Pushdown", "Pec Deck",
 *      "Lateral Raises") are still present as untagged long-tail library KEYS, yet
 *      are the SAME movement as a CORE_AUTO canonical and must fold to it. This
 *      fold affects ONLY name-keyed resolution (logs / engine read), NOT the
 *      equipment_alternatives graph (its consumers read getExerciseMetadata
 *      directly). Every CORE_AUTO canonical is ABSENT from this list, so its
 *      identity is never overridden.
 *   2. Already a real library key (canonical) → IDENTITY (the common, hot path,
 *      byte-identical — every CORE_AUTO + every non-folded long-tail key).
 *   3. RO display-name alias (generated from the library).
 *   4. Unknown name → PASSTHROUGH unchanged (we never strand an unknown name; the
 *      engine cold-starts it as a new exercise exactly as before).
 *
 * PURE. Single hop (an alias VALUE is always a canonical key, never another alias),
 * so no transitive loop is possible. Byte-identical for every canonical engineName
 * the live data uses (no CORE_AUTO is an EXPLICIT_ALIASES key).
 *
 * @param {string} name inbound name (engineName | RO display | legacy synonym)
 * @returns {string} the canonical engineName (or `name` unchanged if unresolvable)
 */
export function resolveCanonical(name) {
  if (typeof name !== 'string' || name.length === 0) return name;
  // 1. Audited explicit fold — wins even over an existing long-tail key.
  const explicit = EXPLICIT_ALIASES[name];
  if (explicit) return explicit;
  // 2. Already canonical — identity (hot path, byte-identical).
  if (Object.prototype.hasOwnProperty.call(EXERCISE_METADATA, name)) return name;
  // 3. RO display-name alias.
  const ro = RO_DISPLAY_ALIASES[name];
  if (ro) return ro;
  // 4. Unknown — passthrough (treated as a brand-new exercise by the engine).
  return name;
}

/**
 * Does `name` resolve to a DIFFERENT canonical than itself? (i.e. is it a known
 * alias). Convenience for tests / diagnostics — NOT on any hot path.
 * @param {string} name
 * @returns {boolean}
 */
export function isAlias(name) {
  return resolveCanonical(name) !== name;
}
