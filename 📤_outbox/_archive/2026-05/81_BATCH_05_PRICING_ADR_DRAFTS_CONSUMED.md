# PROMPT_CC_SPRINT4X_BATCH_05_PRICING_ADR_DRAFTS

**Model:** Opus
**Order:** 05 (final batch)
**Dependencies:** None (strict disjunct — modifies src/schema/pricing.ts + 03-decisions/ADR_*.md, separat de toate batches anterioare)
**Scope:** Pricing schema §36.50-§36.52 + 3 NEW ADR drafts (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT)

**Note:** Final batch consolidat (Pricing schema + ADR drafts) — ambele sunt governance/foundation work disjunct de implementation batches anterioare.

---

## TASK 1 — Pricing Schema §36.50-§36.52

### Schema fields

```typescript
type SubscriptionTier = 'founding' | 'standard' | 'elite' | 'free_trial';

interface UserSubscription {
  user_id: string;
  tier: SubscriptionTier;
  price_eur: 0 | 39 | 59 | 79;  // Founding €39 / Standard €59 / Elite €79
  
  // Founding-specific
  founding_lock_3_years: boolean;       // perpetual 34% discount lock
  founding_perpetual_discount: 0.34;    // NU 20% trap
  
  // Cap mechanics
  founding_cap_counter: number;          // atomic increment, max 50
  auto_close_triggered: boolean;         // true when counter === 50
  
  // Lifecycle
  subscription_start: timestamp;
  subscription_end: timestamp | null;    // null = active
  payment_status: 'active' | 'expired' | 'cancelled';
}
```

### Atomic counter logic

`founding_cap_counter` = atomic increment via Firebase transaction (NU race condition). When counter === 50:
- `auto_close_triggered = true` global flag
- New signups → tier = 'standard' automat (NU 'founding')
- UI banner update: "Founding spots full · Standard tier €59 active"

### Pricing constraints LOCKED §36.50

- €39 Founding (3-year lock + 34% perpetual)
- €59 Standard (post-Founding cap)
- €79 Elite (V1.1+ premium tier)
- 3 RESPINSE: €99 (gigel test fail), €149 (positioning fail), Lifetime €50 (sustainability fail)

### Tests

- `tests/schema/pricing.test.js` — atomic counter race conditions (10 parallel signups → exact 50 founding, rest standard)
- Auto-close trigger validation
- Subscription tier transitions

---

## TASK 2 — 3 NEW ADR drafts

Create 3 ADR draft files în `03-decisions/`:

### ADR_COMPOSITE_SIGNAL_LAYER_v1.md

**Status:** DRAFT V1
**Context:** §36.41 multi-metric trigger pentru deload detection (Performance Drop + Rest Time + RIR Mismatch simultan)
**Decision:** Composite Signal Layer ca arbitration intermediate între engines individuale și CASCADE_DEFENSE
**Consequences:** False positive reduction prin 3-metric AND logic; lifecycle cooldown 3 sesiuni post-flag
**Alternatives considered:** Single-metric triggers (REJECTED — false positive rate ~30% în synthetic data)
**Cross-refs:** §36.41 + ADR_CASCADE_DEFENSE + ADR_OUTLIER_FILTER

### ADR_PAIN_DISCOMFORT_BUTTON_v1.md

**Status:** DRAFT V1
**Context:** §36.38 pain reporting fără medical claim (anti-paternalism + Gigel test risk)
**Decision:** 3-tier pain input (general/specific/technical) + override CDL flag pentru hard-block bypass
**Consequences:** F2 SUFLET respected (informează NU impune); audit log via `user_override_pain_redflag` flag
**Alternatives considered:** Hard-block fără override (REJECTED — paternalism mascat); medical questionnaire (REJECTED — Gigel test fail)
**Cross-refs:** §36.38 + SUFLET_ANDURA F2 + §29.3.1 ZERO medical screening

### ADR_SMART_ROUTING_EQUIPMENT_v1.md

**Status:** DRAFT V1
**Context:** §36.37 "Aparat ocupat" alternative routing cu tier-aware filtering
**Decision:** Tier 1 forță = alternatives DOAR `force_demand: 'high'` (strict); Tier 2 hipertrofie = flexibility ridicată
**Consequences:** Schema extension §36.36 obligatoriu (equipment_type + equipment_alternatives + force_demand + tier); skip exercise dacă zero valid alternatives
**Alternatives considered:** Generic substitution (REJECTED — Tier 1 forță necesită equipment match strict); user manual selection (REJECTED — friction excesivă mid-session)
**Cross-refs:** §36.37 + §36.36 schema + ADR_RIR_MATRIX

### ADR template structure

Toate 3 ADR-uri urmează format consistent:
- Status (DRAFT/LOCKED/SUPERSEDED)
- Context (problem statement)
- Decision (what + rationale)
- Consequences (positive + negative + neutral)
- Alternatives considered (cu rationale REJECTED)
- Cross-refs (§X handover + alte ADR-uri)
- Pending review: Daniel post-Sprint 4.x

---

## VERIFICATION

```bash
# Pricing schema
ls -la src/schema/pricing.ts
grep -n "founding_cap_counter\|auto_close_triggered\|founding_perpetual_discount" src/schema/pricing.ts

# ADR drafts created
ls -la 03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md
ls -la 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md
ls -la 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md

# Cross-refs valid
grep -rn "ADR_COMPOSITE_SIGNAL_LAYER\|ADR_PAIN_DISCOMFORT_BUTTON\|ADR_SMART_ROUTING_EQUIPMENT" 03-decisions/ 06-sessions-log/

# Tests pass
npm test -- schema/pricing
```

---

## COMMIT + PUSH

```bash
git add src/schema/pricing.ts 03-decisions/ADR_COMPOSITE_SIGNAL_LAYER_v1.md 03-decisions/ADR_PAIN_DISCOMFORT_BUTTON_v1.md 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v1.md tests/
git commit -m "pricing schema §36.50-§36.52 + 3 NEW ADR drafts (COMPOSITE_SIGNAL + PAIN_BUTTON + SMART_ROUTING)"
git push
```

---

## RAPORT FINAL — `📤_outbox/LATEST.md`

Move existing LATEST → archive cu next NN.

**Format raport FINAL Sprint 4.x cluster:**

- Task, Model, Status
- Pre-flight: pricing schema location, 03-decisions dir
- Modificări: pricing.ts + 3 ADR drafts + tests
- ADR drafts status: 3 DRAFT V1 pending Daniel review post-cluster
- Atomic counter test results
- Build + Tests: TOTAL Sprint 4.x cluster (toate 5 batches cumulative) — total tests count, new tests across cluster, pass/fail
- Commits: hash + total commits Sprint 4.x cluster
- Pushed: Yes/No

### Sprint 4.x Cluster Summary (post final batch)

Append summary section în LATEST cu cumulative status:

- BATCH_01 ADR 019 channel-agnostic sweep — Status
- BATCH_02 Phase B integration 51 strings — Status
- BATCH_03 Schema + Suflet Andura — Status
- BATCH_04 Self-Correction + Chat C features — Status
- BATCH_05 Pricing + 3 ADR drafts — Status

**Production gate:** PHASE_B_LOCK_REQUIRED = 0 matches ✅
**Total LoC added:** ~estimate
**Total tests added:** ~estimate
**Beta-launch ready:** Yes/Pending (orice carry-overs flagged)

### Daniel post-cluster review checklist

1. Spot-check 2-3 batches LATEST archive pentru verify integritate
2. Review 3 ADR drafts NEW pentru LOCK V1 (sau amend)
3. Smoke test prod GitHub Pages (Gates B/C/D per persona memory)
4. Decizii pending: Avocat barter, Firebase Auth Console, DB rules publish, GDPR tutorial — Daniel solo paralel

### Next action

Sprint 4.x cluster COMPLETE → beta-launch ASAP ready. Roadmap: V1.1 milestone ~Februarie 2027 (Marketing Channel Mix Decision per §36.60).
