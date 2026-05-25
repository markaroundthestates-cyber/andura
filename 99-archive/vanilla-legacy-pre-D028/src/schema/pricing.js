// ══ PRICING SCHEMA §36.50-§36.52 ══════════════════════════════════════════════
// LOCKED V1 per Chat D PRICING+TELEGRAM+ADR LOCK ingest.
// Tiers: €39 Founding (3-year lock + 34% perpetual) / €59 Standard / €79 Elite (V1.1+).
// Cap mechanic: Founding limited to 50 spots, atomic counter, auto-close at 50.
// Cross-ref: HANDOVER_GLOBAL §36.50 (tiers) + §36.51 (Founding lock) + §36.52 (cap).

/** @type {Record<string, { eur: number, label: string, lockYears?: number, perpetualDiscount?: number }>} */
export const PRICING_TIERS = {
  free_trial: { eur: 0,  label: 'Trial' },
  founding:   { eur: 39, label: 'Founding', lockYears: 3, perpetualDiscount: 0.34 },
  standard:   { eur: 59, label: 'Standard' },
  elite:      { eur: 79, label: 'Elite' },
};

export const FOUNDING_CAP = 50;

/** @type {string[]} valid SubscriptionTier keys */
export const SUBSCRIPTION_TIER_KEYS = ['free_trial', 'founding', 'standard', 'elite'];

/**
 * @typedef {'free_trial'|'founding'|'standard'|'elite'} SubscriptionTier
 */

/**
 * @typedef {Object} UserSubscription
 * @property {string} user_id
 * @property {SubscriptionTier} tier
 * @property {0|39|59|79} price_eur
 * @property {boolean} founding_lock_3_years perpetual 34% discount lock (Founding only)
 * @property {number} founding_perpetual_discount typically 0.34 for Founding, 0 otherwise
 * @property {number} founding_cap_counter atomic increment, max 50 (FOUNDING_CAP)
 * @property {boolean} auto_close_triggered true when counter === 50
 * @property {number} subscription_start ms timestamp
 * @property {number|null} subscription_end ms timestamp; null = active
 * @property {'active'|'expired'|'cancelled'} payment_status
 */

/**
 * Build a new subscription object given a tier choice.
 * If tier === 'founding' but cap reached, automatically downgrades to 'standard'.
 *
 * @param {{ user_id: string, requestedTier: SubscriptionTier, currentFoundingCounter: number, now?: number }} ctx
 * @returns {UserSubscription}
 */
export function buildSubscription(ctx) {
  const now = ctx.now ?? Date.now();
  let tier = ctx.requestedTier;

  // Auto-close founding when cap reached
  if (tier === 'founding' && ctx.currentFoundingCounter >= FOUNDING_CAP) {
    tier = 'standard';
  }

  const tierMeta = PRICING_TIERS[tier];
  const isFounding = tier === 'founding';

  return {
    user_id: ctx.user_id,
    tier,
    price_eur: tierMeta.eur,
    founding_lock_3_years: isFounding,
    founding_perpetual_discount: isFounding ? 0.34 : 0,
    founding_cap_counter: isFounding ? ctx.currentFoundingCounter + 1 : ctx.currentFoundingCounter,
    auto_close_triggered: isFounding ? (ctx.currentFoundingCounter + 1) >= FOUNDING_CAP : ctx.currentFoundingCounter >= FOUNDING_CAP,
    subscription_start: now,
    subscription_end: null,
    payment_status: 'active',
  };
}

/**
 * Atomic increment helper for Founding cap counter.
 * Real implementation uses Firebase transaction; this is the contract.
 * @param {number} currentCounter
 * @returns {{ newCounter: number, autoClosed: boolean, accepted: boolean }}
 */
export function atomicIncrementFoundingCounter(currentCounter) {
  if (currentCounter >= FOUNDING_CAP) {
    return { newCounter: currentCounter, autoClosed: true, accepted: false };
  }
  const newCounter = currentCounter + 1;
  return {
    newCounter,
    autoClosed: newCounter >= FOUNDING_CAP,
    accepted: true,
  };
}
