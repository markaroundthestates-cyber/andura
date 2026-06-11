// ══ PR ENGINE — Forta Foundation 1 (§29.2.5 LOCKED) ═════════════════════
// Detect personal records at set-logging time. Three PR types:
//   - 'weight'  new max weight at any reps for this exercise
//   - 'reps'    matched-or-heavier weight, more reps than any prior set
//   - 'volume'  new max single-set volume (weight × reps)
//
// UX contract:
//   - Discrete badge in-set (NOT a modal, NOT a push notification)
//   - Bugatti factual wording — no hype, no emoji-spam
//   - Share Card opt-in trigger only (no auto-share) — wiring deferred to
//     §29.5.2 dynamic share cards consumer
//
// Cross-refs:
//   - HANDOVER §29.2.5 Forta & Dezvoltare V1 LOCKED
//   - src/pages/coach/pr.js (existing aggregate snapshot — different concern)
//   - F-NEW-2 progression matrix (does NOT block PR detection — both axes
//     coexist per ADR 009)

/**
 * Detect whether `set` represents a new PR for `exercise` against
 * `history`. Returns `null` when no PR.
 *
 * @param {string} exercise - exercise name (matched case-sensitively against history.ex)
 * @param {{ w: number, reps: number }} set - set being logged
 * @param {Array<{ ex?: string, w?: number, reps?: number, baseline?: boolean, calibration?: boolean }>} history
 *        Prior log entries for this user. Baseline-injected entries are
 *        ignored (per existing extractAndSavePRs convention); CALIBRATION sets
 *        (gym-log arc 2026-06-11 — a manual benchmark over a cold-start rec,
 *        not a beaten record) are excluded the same way, so a false anchor
 *        (Daniel's real Face Pull 9→27→36 climb) never becomes the prevBest.
 * @returns {{ type: 'weight'|'reps'|'volume', kg: number, reps: number, prevBest: object|null }|null}
 */
export function detectPR(exercise, set, history) {
  if (!exercise || !set || !Array.isArray(history)) return null;
  const w = Number(set.w);
  const reps = Number(set.reps);
  if (!Number.isFinite(w) || w <= 0) return null;
  if (!Number.isFinite(reps) || reps <= 0) return null;

  const prior = history.filter(e =>
    e && e.ex === exercise && !e.baseline && !e.calibration &&
    Number(e.w) > 0 && Number(e.reps) > 0,
  );

  // Empty history → first ever set isn't a PR (we want a non-trivial bar).
  if (prior.length === 0) return null;

  const maxWeight = prior.reduce((m, e) => Math.max(m, Number(e.w)), 0);
  const maxVolume = prior.reduce((m, e) => Math.max(m, Number(e.w) * Number(e.reps)), 0);
  const setVolume = w * reps;

  /** @typedef {{ ex?: string, w?: number, reps?: number, baseline?: boolean }} HistoryEntry */

  // 1. weight PR — strict greater than max weight ever logged.
  if (w > maxWeight) {
    const prevBest = prior.reduce(
      /** @param {HistoryEntry | null} best @param {HistoryEntry} e */
      (best, e) => (!best || Number(e.w) > Number(best.w)) ? e : best,
      /** @type {HistoryEntry | null} */ (null),
    );
    return { type: 'weight', kg: w, reps, prevBest };
  }

  // 2. reps PR — same-or-heavier weight, strictly more reps than any prior
  //    at >= this weight (including this weight tier exactly).
  const sameOrHeavier = prior.filter((e) => Number(e.w) >= w);
  if (sameOrHeavier.length) {
    const maxRepsAtWeight = sameOrHeavier.reduce(
      (m, e) => Math.max(m, Number(e.reps)),
      0,
    );
    if (reps > maxRepsAtWeight) {
      const prevBest = sameOrHeavier.reduce(
        /** @param {HistoryEntry | null} best @param {HistoryEntry} e */
        (best, e) => (!best || Number(e.reps) > Number(best.reps)) ? e : best,
        /** @type {HistoryEntry | null} */ (null),
      );
      return { type: 'reps', kg: w, reps, prevBest };
    }
  }

  // 3. volume PR — strict greater than max single-set volume.
  if (setVolume > maxVolume) {
    const prevBest = prior.reduce(
      /** @param {HistoryEntry | null} best @param {HistoryEntry} e */
      (best, e) => {
        const v = Number(e.w) * Number(e.reps);
        return (!best || v > (Number(best.w) * Number(best.reps))) ? e : best;
      },
      /** @type {HistoryEntry | null} */ (null),
    );
    return { type: 'volume', kg: w, reps, prevBest };
  }

  return null;
}

/**
 * Bugatti-tone message text for a PR detection. Used by the badge UI.
 * Wording is factual, no emoji, no exclamation marks.
 *
 * @param {{ type: 'weight'|'reps'|'volume', kg: number, reps: number }} detection
 * @param {string} exercise
 * @returns {string}
 */
export function formatPRMessage(detection, exercise) {
  if (!detection || !exercise) return '';
  const { type, kg, reps } = detection;
  switch (type) {
    case 'weight':
      return `Record nou la ${exercise}: ${kg} kg × ${reps} reps.`;
    case 'reps':
      return `Reps record la ${exercise}: ${kg} kg × ${reps} reps.`;
    case 'volume':
      return `Volum record la ${exercise}: ${kg} kg × ${reps} reps.`;
    default:
      return `Record nou la ${exercise}: ${kg} kg × ${reps} reps.`;
  }
}

/**
 * Convenience helper used by consumers — returns the badge payload (DOM-
 * agnostic) given an exercise + set + the prior log array.
 *
 * @param {string} exercise
 * @param {{ w: number, reps: number }} set
 * @param {Array<{ ex?: string, w?: number, reps?: number, baseline?: boolean }>} history
 * @returns {{ isPR: boolean, type?: string, message?: string, detection?: object }}
 */
export function evaluateSetForPR(exercise, set, history) {
  const detection = detectPR(exercise, set, history);
  if (!detection) return { isPR: false };
  return {
    isPR: true,
    type: detection.type,
    message: formatPRMessage(detection, exercise),
    detection,
  };
}
