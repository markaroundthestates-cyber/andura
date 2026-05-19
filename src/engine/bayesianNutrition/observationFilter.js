// ══ KCAL FLOOR OBSERVATION FILTER ════════════════════════════════════════════
//
// LOCK 8 Kcal Floor 1200 Engine #3 Bayesian Nutrition filter pure-function
// per wiki/concepts/kcal-floor-1200-engine-filter LOCK V1 2026-05-14 +
// wiki/concepts/pre-beta-full-scope-lock-v2 LOCK 8 cumulative.
//
// Forward-going infrastructure pre-emptive — engine-side filter ready, UI
// nutrition logging consumer pending Daniel review explicit chat NEW pre-Beta
// launch finalize (V1 vanilla port currently NU expune UI nutrition logging
// page; mockup 04-architecture/mockups/andura-clasic.html design SoT linii
// 1668-1832 nutri-chip kcal pattern viitor port v2).
//
// Pure-function ADR 026 §9 invariant: NO Date.now / Math.random / mutation
// input. Deterministic output: same input → same output. ZERO mutation
// Gaussian Conjugate Prior Normal-Normal closed-form algorithm semantics
// (ADR 026 §9.4.1 A1 LOCKED V1 preserved invariant).
//
// Anti-paternalism preserved ABSOLUTE: NU blocăm log user (autonomy preserved
// per F2 Sufletul Andura "AI-ul informeaza NU impune"). CDL log original
// append-only persists transparency (ADR 011). Engine exclude doar din sample
// mean/variance Cluster A1 invatare.

import {
  KCAL_FLOOR_DAILY_MIN,
  KCAL_FLOOR_CITATION_SOURCE,
} from './constants.js';

/**
 * Filter observations array — exclude entries with kcalDaily sub floor minim.
 *
 * Forward-compatible: observations fara `kcalDaily` field pass-through
 * unchanged (current weightDelta-only schema preserved invariant — V1
 * production BN pipeline).
 *
 * Pure function: ZERO mutation input array. Returns NEW array.
 *
 * @param {Array<Object>|null|undefined} observations
 *   Observations array — each obs poate avea: weightDelta, kcalDaily, etc.
 * @returns {{
 *   filtered: Array<Object>,
 *   excludedCount: number,
 *   citationSource: string,
 *   floorMin: number,
 * }}
 *   filtered — observations after applying kcal floor filter
 *   excludedCount — count observations dropped (kcalDaily sub floor)
 *   citationSource — WHO scientific anchored reference for UI consumer
 *   floorMin — KCAL_FLOOR_DAILY_MIN value (caller transparency)
 */
export function filterKcalFloorObservations(observations) {
  if (!Array.isArray(observations)) {
    return {
      filtered: [],
      excludedCount: 0,
      citationSource: KCAL_FLOOR_CITATION_SOURCE,
      floorMin: KCAL_FLOOR_DAILY_MIN,
    };
  }

  let excludedCount = 0;
  const filtered = observations.filter((obs) => {
    if (obs == null) return false;
    const kcalDaily = obs.kcalDaily;
    if (kcalDaily == null) return true; // pass-through obs fara kcalDaily field
    if (!Number.isFinite(kcalDaily)) return true; // defensive: non-numeric pass-through
    if (kcalDaily < KCAL_FLOOR_DAILY_MIN) {
      excludedCount += 1;
      return false;
    }
    return true;
  });

  return {
    filtered,
    excludedCount,
    citationSource: KCAL_FLOOR_CITATION_SOURCE,
    floorMin: KCAL_FLOOR_DAILY_MIN,
  };
}

/**
 * Forward-going UI trigger consumer wording — Romanian-first no-diacritics
 * scientific anchored citation source citable.
 *
 * Daniel CEO directive verbatim chat birou 2026-05-14:
 *   "mesaj ca minimul recomandat de institutil bla bla bla este de 1200
 *    si ca andura nu o sa includa loguri mai mici pentru calculul
 *    obiectivelor si preconizari viitoare"
 *
 * Pure function: same input → same output deterministic ADR 018 §2 contract.
 *
 * @returns {string} Wording strict Romanian-first no-diacritics scientific
 *   anchored — consumer UI nutrition logging trigger threshold detect <1200.
 */
export function getKcalFloorInformativeMessage() {
  return (
    'Minimul recomandat de ' +
    KCAL_FLOOR_CITATION_SOURCE +
    ' este ' +
    KCAL_FLOOR_DAILY_MIN +
    ' kcal/zi. Andura NU include loguri sub acest prag pentru calcul ' +
    'obiective + preconizari viitoare.'
  );
}

// §1-M2 audit fix — TODO converted to D024 reference. Wording draft batch
// 2026-05-16 TASK 7 falls under D024 LOCKED V1 (Pre-Beta wording RO Co-CTO
// autonomous compose OK, Daniel review post-Beta a-z gate). See also §47.5
// engine SoT voice wording backlog. NOT a deferred task in code — review-time
// queue tracked in vault.
/**
 * Count-aware UI trigger wording for CSV/JSON IMPORT context — detecting N
 * zile sub kcal floor in batch import operation.
 *
 * Anti-paternalism preserved invariant ABSOLUTE per F2 Sufletul Andura
 * "AI-ul informeaza NU impune": data sub floor RAMAS saved (CDL append-only
 * persists transparency invariant); engine exclude doar din invatare Cluster
 * A1 Conjugate Normal-Normal sample mean/variance. User decide.
 *
 * Pure function: same input → same output deterministic ADR 018 §2 contract.
 *
 * @param {number} count Days count with kcalDaily sub KCAL_FLOOR_DAILY_MIN.
 * @returns {string} Romanian-first no-diacritics scientific anchored wording.
 */
export function getKcalFloorImportInformativeMessage(count) {
  return (
    'Am detectat ' + count + ' zile cu sub ' +
    KCAL_FLOOR_DAILY_MIN + ' kcal. ' +
    'Coach exclude acele zile din calibrare (posibil underreport). ' +
    'Datele raman salvate.'
  );
}
