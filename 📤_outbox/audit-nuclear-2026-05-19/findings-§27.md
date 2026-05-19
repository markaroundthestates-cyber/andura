# §27 — Pricing / Monetization Future-Proofing

**Scope:** Free Beta scope + Premium gate stubs + Subscription Settings UI + Payment integration + Tax handling + Receipt + Pricing tier + Upgrade/downgrade + Cancellation + Trial period + Refund policy + Invoicing RO ANAF

## Severity matrix §27

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 |
| MED | 5 |
| LOW | 3 (positive) |
| NIT | 1 |
| **Total** | **10** |

---

## HIGH findings

### §27-H1 — Pricing tier definition pre-Beta = "Free Beta" only — long-term tier strategy NOT DOCUMENTED (§27.7)
**Severity:** HIGH
**Evidence:** Per D026 + SettingsSubscription LANDED Phase 6 task_11 "Beta gratuit info". Future pricing tiers (free vs premium vs enterprise) NOT documented.
**Fix log:** Add `08-workflows/pricing-strategy.md` outlining post-Beta tier intent.

---

## MED findings

### §27-M1 — Free Beta scope clear ✓ (§27.1) — SettingsSubscription informative
**Severity:** MED — POSITIVE
**Evidence:** SettingsSubscription.tsx shows "Beta gratuit" + limitations docs presumed.

### §27-M2 — Payment integration stub (§27.4) — Stripe NOT integrated
**Severity:** MED
**Evidence:** No Stripe SDK in deps. Pre-Beta = N/A.

### §27-M3 — Tax handling VAT RO/EU stub (§27.5)
**Severity:** MED
**Evidence:** Pre-Beta N/A.

### §27-M4 — Cancellation flow EU consumer law (§27.9)
**Severity:** MED
**Evidence:** Pre-Beta N/A.

### §27-M5 — Invoicing RO ANAF compliance (§27.12)
**Severity:** MED
**Evidence:** Pre-Beta N/A. Post-launch ROC required.

---

## LOW (POSITIVE)

### §27-L1 — SettingsSubscription UI scaffold LANDED Phase 6 task_11 ✓ (§27.3)
### §27-L2 — Refund policy stub deferred — appropriate pre-Beta
### §27-L3 — Trial period deferred — appropriate

---

## NIT findings

### §27-N1 — Premium gate stubs (§27.2) — placeholder OK
**Resolution:** Defer post-Beta.

## Karpathy distribution §27
- Goal-Driven: 1 (H1)
