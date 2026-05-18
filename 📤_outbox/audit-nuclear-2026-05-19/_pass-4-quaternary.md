# Pass 4 — QUATERNARY NIT Polish + Deferred MED Items

**Procedure:** §52 quaternary pass per D029 — NIT findings + remaining MED secondary items.

---

## §7-C4 / §30-C1 QUATERNARY → BOUNDS PARTIALLY ENFORCED: drift from spec §30.6

**Previous severity (primary + secondary):** CRITICAL "verify needed"
**Quaternary verdict:** **HIGH — bounds enforced but spec drift**

**Evidence:** `src/react/routes/screens/Onboarding.tsx` Step components:
- **Step1 age:** `<input type="number" min={14} max={99}>` line 112-113.
  - Spec §30.6: "age 13-95"
  - Code: age 14-99 — DRIFT: lower bound +1 (14 vs 13), upper +4 (99 vs 95).
  - Reason: Daniel decided 14 lower (anti-CGV minor inclusion) + 99 upper (graceful elderly tolerance).
- **Step2 sex:** binary 'm'/'f' ← spec didn't quantify; acceptable.
- **Step3 goal:** 4 options enumerated (`masa`, `forta`, `definire`, `sanatate`) — bounded by union type.
- **Step4 frequency:** `2/3/4/5` only (line 178) ← Spec §30.6 says "0-14 sesiuni/săpt". Daniel restricted to 2-5 → effective bounds, but documented decision needed.
- **Step5 experience:** 3 levels `incepator`/`intermediar`/`avansat`.
- **Step6 weight:** NOT SAMPLED THIS PASS — defer.
- **Step7 summary:** display-only.

**Severity adjustment:** §7-C4 CRITICAL → HIGH (bounds enforced HTML5 + JS but spec needs alignment).

**Fix log:**
1. Reconcile spec §30.6 vs code: either update code (14→13, 99→95, allow 0/1/6-14 sesiuni) OR update spec to match code (current Daniel choice).
2. Add Step6 weight bounds verify quinary.
3. Document choice in DECISIONS.md (e.g., D-NEW age range chosen 14-99).
4. **§28-H5 age <16 parental consent INTERACTS:** if min age = 14, range 14-15 = minor requiring parental consent under GDPR Art. 8 (RO threshold 16). Either:
   - Bump min to 16 (compliant)
   - Implement parental consent flow for ages 14-15
   - Document acceptance of risk for V1 (not recommended)

---

## §43-H1 QUATERNARY → PainButton implementation observed sound; intensity naming drift

**Evidence:** `src/react/routes/screens/antrenor/PainButton.tsx`:
- **BodyRegion union type:** 15 regions enumerated (gat/umar/spate/lombar/piept/cot/incheietura/sold/genunchi/glezna with left-right + symmetric) ✓
- **PainIntensity:** `1 | 2 | 3` literal union.
  - Spec §43.3: "ACUT / USOARA / NICIO"
  - Code: 1/2/3 (usor/mediu/sever per comment line 2)
  - Naming drift: code uses "usor/mediu/sever" (mild/medium/severe) vs spec "ACUT/USOARA/NICIO" (acute/light/none).
- **Anti-force-typing:** region mandatory for Continue, but "Salveaza si iesi" escape hatch ✓ per D-LEGACY-010 §AMENDED.
- **Cross-refs:** ✓ documented per DECISIONS.md
- **NO_DIACRITICS:** ✓ (umar, lombar, glezna no diacritics)

**Severity:** §43-H1 HIGH → MED (implementation sound; nomenclature reconcile MED with §47 wording backlog).

**Fix log:** Reconcile pain intensity naming between code (1/2/3 usor/mediu/sever) and spec (ACUT/USOARA/NICIO). Daniel D024 post-Beta a-z wording review window covers.

---

## §1-N1 thru §32-N1 NIT-tier polish — confirmed cosmetic

All NIT findings (46 across audit) are cosmetic/opinion. Notable:
- §1-N1: Comment header divider style `══` vs `──` inconsistent — Unicode preference
- §1-N3: Mixed quote styles single vs double — Prettier dependent (§1-C4)
- §6-N1: aria-label diacritics-free per NO_DIACRITICS rule ✓
- §22-N1: Premature abstractions OK
- §29-N1: Shadow tokens default Tailwind ✓
- §39-N1: Eviction Tier 2 archive — GDPR alignment §28-C3 critical

**Resolution:** All NIT findings deferred post-Beta polish window.

---

## Other deferred MED items investigated quaternary

### §8-M2 MMI decay function — NOT verified this pass (deferred quinary if time)
### §8-M3 Aggressive Loading 4-module voting threshold — NOT verified this pass
### §32-H2 SettingsNotifications permission ladder — NOT verified this pass
### §35-H1 Tier nomenclature reconcile dexieMigration.ts ↔ spec — covered §12-H1

---

## Quaternary pass conclusion

**New findings:** 1 (Big 6 age bounds drift 14-99 vs spec 13-95 + interaction with §28-H5 parental consent).

**Severity reclassifications:**
- §7-C4 CRITICAL → HIGH (bounds enforced w/ spec drift)
- §43-H1 HIGH → MED (PainButton sound w/ nomenclature drift)

**Beta gate:** Wave 1-3 fix priority unchanged. Quaternary polish items defer post-Beta.

**Continuing QUINARY pass: Karpathy self-critique recursive.**
