# ADR 033 — Engine Muscle Memory Index (MMI)

**Status:** 🟡 STUB / SPEC PLACEHOLDER (engine spec future, post-Beta v1.5 candidate)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §32 Muscle Memory Index LOCKED V1 NEW (lines 2890-2932, archived 2026-05-07 Capacity A) — note: source heading `## 32.` legacy convention
**Date created:** 2026-05-07 (Run 2 vault cleanup Task 1, ADR Numbering Additive convention §36.95 — 033 next slot post 032 Deload)
**Numbering convention:** Additive per [[VAULT_RULES]] §3 (NU re-arrange existing 001-032).

**Cross-refs:**
- [[018-engine-extensibility-architecture|ADR 018]] §1 Dimension Registry plug-in additive Open-Closed (MMI = Engine #9 candidate post-Beta)
- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §9 ENGINE-LEVEL SPECS (pattern §9.X reusable for §9.9 MMI when promoted SPEC)
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after — Convergence Guard "T2 Unlock" (MMI plausibly T2+ feature, gating defer)
- [[../01-vision/ONBOARDING_SSOT_V1]] §9 Anti-Reflex Protection (MMI prompt UX integration touchpoint)

---

## STATUS

**SPEC PLACEHOLDER** — content imported verbatim din HANDOVER_MISC §32 below. Promote la SPEC READY V1 când chat strategic dedicat compile §9.9 ADR 026 pattern (post-Beta v1.5 priority window).

## §1 Source content (verbatim from HANDOVER_MISC §32)

## 32. Muscle Memory Index (MMI) LOCKED V1 (NEW 2026-05-02)

### 32.1 Algorithm Hibrid (Lookup + Boost)

**Formula:**
```
Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup
```

**Tabel multiplicatori + boost progresie:**

| Durată Pauză | Multiplicator Pornire | Boost Progresie (primele 3 săpt) |
|--------------|----------------------|-----------------------------------|
| 6-12 luni | 0.80× | 1.25× |
| 12-24 luni | 0.70× | 1.10× |
| 24+ luni | 0.60× | 1.00× (start proaspăt) |

**Rationale:** păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare).

### 32.2 Threshold Trigger — User-Controlled

**6+ luni pauză → prompt user prima deschidere app:**

> "Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?"

**Rationale:** anti-paternalism + agency 100%. NU hardcoded 6 luni rule, NU pre-pause-aware automatic. User decide.

### 32.3 UI Wording Re-engagement

**Wording LOCKED (Bugatti Tone):**
> "Pauza face parte din drum. Începem treptat — corpul tău își amintește."

**Comportament:**
- Opțional refusable
- User refuză → engine încarcă greutățile maxime istorice
- Banner discret avertizare risc accidentare la refuse (NU modal blocant)

**Status:** OBLIGATORIU V1 (~3-4h Sonnet implementare). Justified V1 inclusion: Maria post-operație șold revine după 8 luni = primii useri ajung iulie 2027, gap v1.5 risk reputational.

**Cross-refs §32:** ADR 009 calibration tiers + ADR Q-0231 Profile Typing + §29.5.16 Notificări (re-engagement push) + §28.2 User Pierdut wording (cooldown override) + §22 F-NEW-3 cooldown logic.

---

