import { describe, it, expect } from 'vitest';
import {
  PRICING_TIERS, FOUNDING_CAP, SUBSCRIPTION_TIER_KEYS,
  buildSubscription, atomicIncrementFoundingCounter,
} from '../pricing.js';

describe('Pricing Schema §36.50-§36.52', () => {
  it('exposes 4 tier keys', () => {
    expect(SUBSCRIPTION_TIER_KEYS).toEqual(['free_trial', 'founding', 'standard', 'elite']);
  });

  it('Founding tier has 3-year lock + 34% perpetual discount', () => {
    expect(PRICING_TIERS.founding.eur).toBe(39);
    expect(PRICING_TIERS.founding.lockYears).toBe(3);
    expect(PRICING_TIERS.founding.perpetualDiscount).toBe(0.34);
  });

  it('Standard €59, Elite €79', () => {
    expect(PRICING_TIERS.standard.eur).toBe(59);
    expect(PRICING_TIERS.elite.eur).toBe(79);
  });

  it('FOUNDING_CAP = 50', () => {
    expect(FOUNDING_CAP).toBe(50);
  });

  it('buildSubscription Founding (cap not reached) → tier founding, lock active', () => {
    const sub = buildSubscription({ user_id: 'u1', requestedTier: 'founding', currentFoundingCounter: 10 });
    expect(sub.tier).toBe('founding');
    expect(sub.price_eur).toBe(39);
    expect(sub.founding_lock_3_years).toBe(true);
    expect(sub.founding_perpetual_discount).toBe(0.34);
    expect(sub.founding_cap_counter).toBe(11);
  });

  it('buildSubscription Founding requested but cap reached → auto-downgrade to standard', () => {
    const sub = buildSubscription({ user_id: 'u51', requestedTier: 'founding', currentFoundingCounter: 50 });
    expect(sub.tier).toBe('standard');
    expect(sub.price_eur).toBe(59);
    expect(sub.founding_lock_3_years).toBe(false);
  });

  it('atomicIncrementFoundingCounter accepts when below cap', () => {
    const r = atomicIncrementFoundingCounter(49);
    expect(r.accepted).toBe(true);
    expect(r.newCounter).toBe(50);
    expect(r.autoClosed).toBe(true);
  });

  it('atomicIncrementFoundingCounter rejects at cap', () => {
    const r = atomicIncrementFoundingCounter(50);
    expect(r.accepted).toBe(false);
    expect(r.autoClosed).toBe(true);
  });

  it('subscription_end null = active', () => {
    const sub = buildSubscription({ user_id: 'u1', requestedTier: 'standard', currentFoundingCounter: 25 });
    expect(sub.subscription_end).toBeNull();
    expect(sub.payment_status).toBe('active');
  });
});
