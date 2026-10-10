// ══ USED VARIANT — the plan names the variant he actually trains (2026-10-10) ══
// Founder: "vezi cu chest fly alea ca eu le am M torture fly la aparat mereu", then on
// the pulldowns "sunt una si aceeasi". The selector rotates through library twins —
// Cable Fly / Pec Deck / Cable Fly, Lat Pulldown / its grip variants, Leg Curl /
// Seated Leg Curl — so a plan could name a variant he never does and cold-start it
// (Wide-Grip Lat Pulldown 52x6 next to his 12 sessions of Lat Pulldown).
//
// A planned lift becomes its TWIN when: one name literally spells the other, both are
// the same movement (sessionBuilder's deep movement key), same tier, same kind of
// equipment (or both stations: cable / machine), and he trained the twin in >= 2
// sessions in the last 60 days of his log while the planned name has fewer. Pure
// rename: history is never folded (his real cable flies stay cable flies).

import { DB } from '../../db.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';
import { movementKey } from '../sessionBuilder.js';

const WINDOW_DAYS = 60;
const MIN_SESSIONS = 2;

const norm = (s) => String(s).toLowerCase().replace(/[/()]/g, ' ').replace(/\s+/g, ' ').trim();
const isStation = (t) => t === 'cable' || t === 'machine';

/** One name is a literal multi-word phrase of the other. @param {string} a @param {string} b */
function literalTwin(a, b) {
  const [s, l] = norm(a).split(' ').length <= norm(b).split(' ').length ? [norm(a), norm(b)] : [norm(b), norm(a)];
  return s !== l && s.split(' ').length >= 2 && (l.includes(`${s} `) || l.includes(` ${s}`));
}

/** @type {Map<string, string[]>|null} */
let _twins = null;

/** Active twins of a lift (computed once over the library). @param {string} name @returns {string[]} */
export function usedVariantTwins(name) {
  if (!_twins) {
    _twins = new Map();
    const act = Object.entries(EXERCISE_METADATA).filter(([, m]) => m && m.status === 'CORE_AUTO');
    for (const [a, ma] of act) {
      for (const [b, mb] of act) {
        if (a === b || !literalTwin(a, b)) continue;
        if (ma.tier !== mb.tier || movementKey(a, ma, true) !== movementKey(b, mb, true)) continue;
        if (ma.equipment_type !== mb.equipment_type && !(isStation(ma.equipment_type) && isStation(mb.equipment_type))) continue;
        (_twins.get(a) ?? _twins.set(a, []).get(a))?.push(b);
      }
    }
  }
  return _twins.get(name) ?? [];
}

/** Distinct session days per logged name in the window. @returns {Map<string, number>} */
function recentSessionsByName() {
  const logs = /** @type {Array<{ex?: string, ts?: number, date?: string}>|null} */ (DB.get('logs'));
  /** @type {Map<string, Set<string>>} */
  const days = new Map();
  if (!Array.isArray(logs) || !logs.length) return new Map();
  let newest = 0;
  for (const l of logs) if (Number(l && l.ts) > newest) newest = Number(l.ts);
  const since = newest - WINDOW_DAYS * 86400000;
  for (const l of logs) {
    if (!l || typeof l.ex !== 'string' || !(Number(l.ts) >= since)) continue;
    const day = typeof l.date === 'string' ? l.date : String(Math.floor(Number(l.ts) / 86400000));
    (days.get(l.ex) ?? days.set(l.ex, new Set()).get(l.ex))?.add(day);
  }
  return new Map([...days].map(([k, v]) => [k, v.size]));
}

/**
 * Rename each planned lift to the twin he actually trains (rules above). A rename that
 * would repeat a name already in the session is skipped. No twin used → same entry.
 * @template {{name: string}} T @param {ReadonlyArray<T>} exercises @returns {ReadonlyArray<T>}
 */
export function onUsedVariants(exercises) {
  if (!Array.isArray(exercises) || !exercises.length) return exercises;
  const used = recentSessionsByName();
  if (!used.size) return exercises;
  const names = new Set(exercises.map((e) => e && e.name));
  return exercises.map((e) => {
    if (!e || typeof e.name !== 'string') return e;
    const own = used.get(e.name) ?? 0;
    let best = null;
    let bestN = Math.max(own, MIN_SESSIONS - 1);
    for (const t of usedVariantTwins(e.name)) {
      const n = used.get(t) ?? 0;
      if (n > bestN && !names.has(t)) { best = t; bestN = n; }
    }
    if (!best) return e;
    names.add(best);
    return { ...e, name: best };
  });
}
