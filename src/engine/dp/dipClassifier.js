// ══ BUILD F6a #32 — detraining vs deload vs life-dip classifier (spec §5) ════
// Distinguishes the CAUSE of a performance dip so the engine gives the right
// response: a training GAP (vacation) → the EXISTING detraining ramp; systemic
// FATIGUE → the EXISTING deload; a bad PATCH (poor sleep / missed sessions /
// under-eating for a week) → the LIGHTEST response (hold, no panic) instead of an
// over-reactive full deload.
//
// PURE FUSION — it computes NOTHING new. It consumes the already-computed outputs
// of _returnDeload (#gap), computeACWR (#5), detectSubRecoveryDrift (#26), and
// fatigue.js (sleep/notes), and only RE-ROUTES among responses that already exist
// (ramp / deload / hold). Its only NEW behavior is the LIFE_DIP branch SUPPRESSING
// a deload that would otherwise fire when the cause is lifestyle, not training.
//
// The ACWR-HIGH-forces-FATIGUE guard is the SAFETY: a genuinely fatigued user
// (high acute volume) is NEVER classified LIFE_DIP, so the suppression can only
// swap a deload for a HOLD when volume is actually low/normal. Degrades to a
// coarser gap-vs-fatigue classifier (no LIFE_DIP) when #5/#26 are OFF (null inputs)
// → today's behavior. Flag dp_dip_classifier_v1 (default OFF) → never called →
// _returnDeload + the deload hierarchy + the <60 hold all run independently as
// today → byte-identical.

export const DIP_CLASS = Object.freeze({
  DETRAINING: 'DETRAINING',
  FATIGUE: 'FATIGUE',
  LIFE_DIP: 'LIFE_DIP',
  NONE: 'NONE',
});

// ── Daniel-tunable (spec §7 — LIFE_DIP separation depends on wellbeing being
//    populated; degrades to gap-vs-fatigue when absent = the SAFE fallback) ────
export const ACWR_FATIGUE_MIN = 1.5;   // ACWR at/above → true accumulated fatigue
export const ACWR_LIFEDIP_MAX = 1.2;   // ACWR at/below → volume NOT high (life-dip eligible)
export const LIFE_DIP_SLEEP_MIN = 2;   // >=2 bad-sleep markers in the window → lifestyle-sourced

/**
 * Classify the cause of a performance dip. PURE — every input is pre-computed and
 * injected (the classifier reads them, computes nothing). Returns the class plus a
 * `suppressDeload` flag (true ONLY for LIFE_DIP) and a semantic narration key.
 *
 * @param {object} ctx
 * @param {{multiplier:number}|null} [ctx.returnDeload] _returnDeload(ex,now) result
 *   (non-null = a training GAP was detected) — the DETRAINING owner.
 * @param {{acwr:number}|null} [ctx.acwr] computeACWR(logs,now) result (#5); null when
 *   dp_acwr_readiness_v1 is OFF → degrade (no LIFE_DIP, FATIGUE/DETRAINING only).
 * @param {{systemic:boolean}|null} [ctx.drift] detectSubRecoveryDrift result (#26);
 *   null when dp_subrecovery_drift_v1 is OFF.
 * @param {{recommend?:string, sleepBad?:number}|null} [ctx.fatigue] calculateFatigueScore
 *   result — recommend 'deload'/'reduce' + the sleepBad count (lifestyle source).
 * @param {{closedDaysRecent?:number, kcalShortfall?:boolean}} [ctx.lifestyle] extra
 *   lifestyle signals (missed-session count + a yesterday-kcal-shortfall flag).
 * @returns {{class:string, suppressDeload:boolean, narrationKey:string}}
 */
export function classifyPerformanceDip(ctx) {
  const c = ctx || {};
  const gap = c.returnDeload != null;
  const acwr = c.acwr && Number.isFinite(c.acwr.acwr) ? c.acwr.acwr : null;
  const driftSystemic = !!(c.drift && c.drift.systemic);
  const fatigueRec = c.fatigue && typeof c.fatigue.recommend === 'string' ? c.fatigue.recommend : 'none';
  const sleepBad = c.fatigue && Number.isFinite(c.fatigue.sleepBad) ? Number(c.fatigue.sleepBad) : 0;
  const lifestyle = c.lifestyle || {};
  const closedDays = Number.isFinite(lifestyle.closedDaysRecent) ? Number(lifestyle.closedDaysRecent) : 0;
  const kcalShort = !!lifestyle.kcalShortfall;

  // 1) GAP wins — the EXISTING _returnDeload ramp owns it. This branch only LABELS
  //    what already happens (narration: "you took time off, ramping back").
  if (gap) {
    return { class: DIP_CLASS.DETRAINING, suppressDeload: false, narrationKey: 'DIP_DETRAINING' };
  }

  // Is there a dip signal at all to classify? (no deload recommendation + no drift
  // → nothing to re-route → NONE, today's behavior.)
  const dipPresent = fatigueRec === 'deload' || fatigueRec === 'reduce' || driftSystemic;
  if (!dipPresent) {
    return { class: DIP_CLASS.NONE, suppressDeload: false, narrationKey: 'DIP_NONE' };
  }

  // 2) SAFETY GUARD — ACWR HIGH forces FATIGUE (accumulated training volume IS the
  //    cause). A genuinely fatigued user can NEVER be classified LIFE_DIP, so the
  //    suppression below can only fire when volume is actually low/normal.
  if (acwr != null && acwr >= ACWR_FATIGUE_MIN) {
    return { class: DIP_CLASS.FATIGUE, suppressDeload: false, narrationKey: 'DIP_FATIGUE' };
  }

  // 3) LIFE_DIP — only when volume is NOT high (ACWR known + <= LIFEDIP_MAX) AND the
  //    dip is LIFESTYLE-sourced (bad sleep / missed sessions / under-eating), NOT
  //    training load. The NEW behavior: SUPPRESS the over-reactive deload, hold
  //    steady. Requires the ACWR signal to be present (else we cannot prove volume
  //    is low → degrade to FATIGUE, the safe response).
  const volumeNotHigh = acwr != null && acwr <= ACWR_LIFEDIP_MAX;
  const lifestyleSourced = sleepBad >= LIFE_DIP_SLEEP_MIN || closedDays >= 2 || kcalShort;
  if (volumeNotHigh && lifestyleSourced && !driftSystemic) {
    return { class: DIP_CLASS.LIFE_DIP, suppressDeload: true, narrationKey: 'DIP_LIFE' };
  }

  // 4) Otherwise FATIGUE — systemic drift, or a dip we cannot attribute to lifestyle
  //    with low volume → let the EXISTING deload fire (no suppression). This is also
  //    the degrade target when #5/#26 are OFF (acwr null → not LIFE_DIP-eligible).
  return { class: DIP_CLASS.FATIGUE, suppressDeload: false, narrationKey: 'DIP_FATIGUE' };
}
