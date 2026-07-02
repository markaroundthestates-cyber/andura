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

/** @typedef {{ id:string, name:string, stacks: Record<string, number[]> }} Gym */
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
