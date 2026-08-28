// ══ GYM PROFILE — per-gym curated equipment stacks (founder changed gyms 2026-07-02) ══
// The coach was anchored to the founder's OLD gym in THREE places (realMachineStacks
// STACK_BY_NAME, the *_daniel equipmentTemplates seeds, and the learned-from-logs
// ladder), so at a NEW gym it snapped recs onto trepte the machine does not have →
// "presupune ca pot mai putin decat pot" (under-prescribe). This is the per-GYM
// AUTHORITATIVE source the whole ladder stack was designed to eventually have —
// snapToLadder's `curatedSteps` "photo, future seam" that WINS over matched templates:
// a named gym whose per-equipment-type stacks the user MEASURED. The ACTIVE gym's stack
// wins OUTRIGHT over the learned ladder + founder seed + generic (ground truth, not
// inference), so a rec snaps to a REAL rung from session ONE at the new gym — zero
// learning lag, no old-gym pollution.
//
// Stored per EQUIPMENT TYPE (not per exercise) so ONE "dumbbell" / "matrix_cable"
// stack covers every lift on that station (keys mirror config/weights.js
// EQUIPMENT_WEIGHTS). config/weights.js resolves engineName → equipType and consults
// activeGymStepsForType at the TOP of roundToEquipmentWeight (behind
// dp_active_gym_ladder_v1). No gym / no active gym / no stack for the type / flag off /
// bad input → null → byte-identical (existing user-ladder → founder-seed → generic chain).
//
// Synced per-UID (dp-gyms in SYNC_KEYS — a structured object, NOT name-keyed). PURE
// reads (single DB.get) + quota-guarded writes (DB.set) mirroring saveLearnedStep.

import { DB } from '../../db.js';

export const GYMS_KEY = 'dp-gyms';

/** @typedef {{ id:string, name:string, stacks: Record<string, number[]>, equivalents?: Record<string,string> }} Gym */
/** @typedef {{ activeId: string|null, gyms: Record<string, Gym> }} GymsState */

/** Defensive-parsed whole state (never throws; bad shape → empty). @returns {GymsState} */
export function getGymsState() {
  const raw = /** @type {any} */ (DB.get(GYMS_KEY));
  const s = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  const gyms = (s.gyms && typeof s.gyms === 'object' && !Array.isArray(s.gyms)) ? s.gyms : {};
  const activeId = (typeof s.activeId === 'string' && gyms[s.activeId]) ? s.activeId : null;
  return { activeId, gyms };
}

/** The active gym, or null. @returns {Gym|null} */
export function activeGym() {
  const { activeId, gyms } = getGymsState();
  return activeId ? (gyms[activeId] || null) : null;
}

// ── Per-gym exercise EQUIVALENCE (founder live 2026-08-28) ───────────────────
// The library carries several near-identical machine entries (Converging Chest
// Press / Flat Chest Press Machine; Cable Fly / Pec Deck / Cable Fly / Cable Pec
// Deck). A gym has ONE such station, so whichever entry the plan prescribes, the
// user walks to the same machine — but the engine keys history per ENTRY, so the
// history SPLITS and each identity cold-starts on its own. Founder's real logs:
// his chest press split 15 sets / 6 sets across two names, his pec fly split
// 15 / 21 / 3 across three, with the fly identities disagreeing 23 kg vs 60 kg
// on the SAME machine (that is the "rec 12 kg when I proved 55" report).
//
// The merge MUST be per-gym: globally a cable fly really is a different exercise
// from a pec deck. Here it means "at MY gym these prescriptions land on one
// station", so reads collapse onto one identity. Writes are untouched (logs stay
// append-only under whatever name was prescribed) → fully reversible.
/**
 * The canonical engine name this gym folds `engineName` into, or null when the
 * active gym declares no equivalence for it. One hop only (a map pointing at
 * another key is NOT followed) so a malformed cycle can never spin. PURE.
 * @param {string} engineName @returns {string|null}
 */
export function gymEquivalentFor(engineName) {
  if (typeof engineName !== 'string' || !engineName) return null;
  const g = activeGym();
  const map = g && g.equivalents;
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const to = map[engineName];
  if (typeof to !== 'string' || !to || to === engineName) return null;
  return to;
}

/**
 * The ACTIVE gym's sorted clean rungs for one equipment type, or null when none.
 * PURE (single DB read). Bad/empty/no-active-gym → null so the caller keeps its
 * existing ladder (byte-identical). @param {string} equipType @returns {number[]|null}
 */
export function activeGymStepsForType(equipType) {
  if (typeof equipType !== 'string' || !equipType) return null;
  const g = activeGym();
  if (!g || !g.stacks || typeof g.stacks !== 'object') return null;
  const raw = g.stacks[equipType];
  if (!Array.isArray(raw)) return null;
  const clean = [...new Set(
    raw.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0),
  )].sort((a, b) => a - b);
  return clean.length >= 1 ? clean : null;
}

// ── Mutations (UI: Setari "Sala mea") — additive + quota-guarded ──────────────
/** Persist the whole state. @param {GymsState} state @returns {{ok:boolean,error?:string}} */
function _save(state) {
  const res = DB.set(GYMS_KEY, state);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * Add or replace a gym (by id); first gym added becomes active automatically.
 * @param {Gym} gym @returns {{ok:boolean,error?:string}}
 */
export function upsertGym(gym) {
  if (!gym || typeof gym.id !== 'string' || !gym.id) return { ok: false, error: 'bad_id' };
  const state = getGymsState();
  state.gyms[gym.id] = {
    id: gym.id,
    name: typeof gym.name === 'string' && gym.name ? gym.name : gym.id,
    stacks: (gym.stacks && typeof gym.stacks === 'object' && !Array.isArray(gym.stacks)) ? gym.stacks : {},
  };
  if (!state.activeId) state.activeId = gym.id;
  return _save(state);
}

/** Set the active gym. @param {string} id @returns {{ok:boolean,error?:string}} */
export function setActiveGym(id) {
  const state = getGymsState();
  if (typeof id !== 'string' || !state.gyms[id]) return { ok: false, error: 'unknown_gym' };
  state.activeId = id;
  return _save(state);
}

/**
 * Set (or clear, with an empty list) the stack for one equipment type on a gym.
 * @param {string} id @param {string} equipType @param {ReadonlyArray<number>} steps
 * @returns {{ok:boolean,error?:string}}
 */
export function setGymStack(id, equipType, steps) {
  const state = getGymsState();
  if (typeof id !== 'string' || !state.gyms[id]) return { ok: false, error: 'unknown_gym' };
  if (typeof equipType !== 'string' || !equipType) return { ok: false, error: 'bad_type' };
  const clean = [...new Set(
    (Array.isArray(steps) ? steps : []).map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0),
  )].sort((a, b) => a - b);
  if (clean.length) state.gyms[id].stacks[equipType] = clean;
  else delete state.gyms[id].stacks[equipType];
  return _save(state);
}

/**
 * Declare (or clear, with an empty `toName`) that two library entries are the SAME
 * physical station at this gym, so their split histories read as one identity.
 * Rejects a self-map and any target that is itself mapped, keeping the map a flat
 * one-hop relation (gymEquivalentFor never follows chains).
 * @param {string} id @param {string} fromName @param {string} [toName]
 * @returns {{ok:boolean,error?:string}}
 */
export function setGymEquivalent(id, fromName, toName) {
  const state = getGymsState();
  if (typeof id !== 'string' || !state.gyms[id]) return { ok: false, error: 'unknown_gym' };
  if (typeof fromName !== 'string' || !fromName) return { ok: false, error: 'bad_name' };
  const gym = state.gyms[id];
  const map = (gym.equivalents && typeof gym.equivalents === 'object' && !Array.isArray(gym.equivalents))
    ? gym.equivalents
    : {};
  if (typeof toName === 'string' && toName && toName !== fromName) {
    if (map[toName]) return { ok: false, error: 'target_is_mapped' }; // no chains
    map[fromName] = toName;
  } else {
    delete map[fromName];
  }
  if (Object.keys(map).length) gym.equivalents = map;
  else delete gym.equivalents;
  return _save(state);
}

/** Remove a gym (re-points active to any remaining gym). @param {string} id */
export function removeGym(id) {
  const state = getGymsState();
  if (typeof id !== 'string' || !state.gyms[id]) return { ok: false, error: 'unknown_gym' };
  delete state.gyms[id];
  if (state.activeId === id) {
    const rest = Object.keys(state.gyms);
    state.activeId = rest.length ? rest[0] : null;
  }
  return _save(state);
}
