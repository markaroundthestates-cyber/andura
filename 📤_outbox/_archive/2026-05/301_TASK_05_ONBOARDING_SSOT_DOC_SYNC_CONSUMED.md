# TASK 05 — ONBOARDING_SSOT_V1.md §1 ECRANE Doc Sync (Big 6 Hard T0 Reflect)

**Model:** Opus
**Velocity:** ~5-10 min CC autonomous (vault hygiene meta-tooling)
**Cluster:** #1 Auth wiring · Atom 5/5 (closure Cluster #1 doc sync)
**Authority:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard T0 (posterior OVERRIDE) vs ONBOARDING_SSOT_V1 §1 §AMENDMENT 2026-05-04 evening (anterior STALE drift documentar)
**Type:** Vault hygiene doc sync (NU code change, NU additive cumulative)

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify current STALE state ONBOARDING_SSOT §1
grep -niE "Greutate.*post-onboarding|Înălțime.*post-onboarding|move post-onboarding|Profile section" 01-vision/ONBOARDING_SSOT_V1.md | head -20

# Verify §AMENDMENT 2026-05-05.7 Big 6 spec authoritative
grep -niE "Big 5 → Big 6|Big 6 LOCKED|hard required T0|Mifflin" 03-decisions/ADR_MULTI_TENANT_AUTH_v1.md | head -20

# Verify §2 GOAL TAXONOMY V2 deja LANDED commit `12f1b76`
grep -niE "AMENDMENT 2026-05-10 V2|Mentenanță SUPERSEDE|Auto al 6-lea" 01-vision/ONBOARDING_SSOT_V1.md | head -20
```

---

## §1 Scope

Sync `01-vision/ONBOARDING_SSOT_V1.md` §1 ECRANE doc cu authoritative state Big 6 hard T0 per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 (posterior OVERRIDE).

**Drift documentar identified:**
- ONBOARDING_SSOT_V1 §1 §AMENDMENT 2026-05-04 evening currently states: *"Greutate & Înălțime move post-onboarding (Profile section)"* — **STALE** post §AMENDMENT 2026-05-05.7 OVERRIDE
- Real state per ADR_MULTI_TENANT_AUTH_v1: **Big 6 = Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență ALL hard required T0**
- ONBOARDING_SSOT NU rewritten when ADR amendment landed → drift propagated

**Acțiuni concrete:**
1. **Append `## §AMENDMENT 2026-05-10 — Big 6 Hard T0 Sync (post-§AMENDMENT 2026-05-05.7)`** secțiune NEW în §1 ECRANE
2. Wording amendment:
   - Mark §AMENDMENT 2026-05-04 evening "Greutate & Înălțime move post-onboarding" = **SUPERSEDED** (preserved istoric, NU rewritten)
   - Document Big 6 hard T0 per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7
   - 7 ecrane V2 logic structure: Obiectiv / Vârstă / Sex / Înălțime / Greutate / Istoric medical / Frecvență (Istoric medical = ecran 6 skippable preserved per §50.3 D2; restul Big 6 hard required)
3. Cross-refs update:
   - `[[../03-decisions/ADR_MULTI_TENANT_AUTH_v1]]` §AMENDMENT 2026-05-05.7
   - `[[../00-index/CURRENT_STATE]]` §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte

**NU touch:**
- §2 GOAL TAXONOMY V2 (deja LANDED commit `12f1b76`)
- §3 PROFILE TYPING / §4 EQUIPMENT FILTER (out-of-scope)
- ADR_MULTI_TENANT_AUTH_v1 (authoritative source unchanged)

---

## §2 Files modify

- `01-vision/ONBOARDING_SSOT_V1.md` §1 ECRANE — append §AMENDMENT 2026-05-10 NEW + cross-refs

---

## §3 Acceptance criteria

1. ✅ §AMENDMENT 2026-05-10 NEW section appended §1 ECRANE
2. ✅ §AMENDMENT 2026-05-04 evening preserved istoric + flag SUPERSEDED clear
3. ✅ Big 6 hard T0 documented authoritative
4. ✅ Cross-refs added bidirectional
5. ✅ Tests 2731 PASS preserved EXACT (pure docs)
6. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task05-onboardingssot-bigsync-$(date +%Y-%m-%d-%H%M)
git push origin pre-task05-onboardingssot-bigsync-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
docs(onboarding-ssot): §AMENDMENT 2026-05-10 Big 6 hard T0 sync vault hygiene

Drift documentar resolved: ONBOARDING_SSOT_V1 §1 §AMENDMENT 2026-05-04 evening
"Greutate+Înălțime move post-onboarding" SUPERSEDED post ADR_MULTI_TENANT_AUTH
§AMENDMENT 2026-05-05.7 Big 6 hard required T0.

§AMENDMENT 2026-05-10 NEW append §1 ECRANE:
- Big 6 = Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență hard T0
- 7 ecrane V2 (Big 6 + Istoric medical skippable §50.3 D2)
- §AMENDMENT 2026-05-04 evening preserved istoric flag SUPERSEDED

Cluster #1 Auth wiring · Task 05/16 (closure Cluster #1).
Tests 2731 PASS preserved EXACT (vault meta-tooling, ZERO src changes).

Cross-refs:
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 (authoritative)
- CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 05 — ONBOARDING_SSOT_V1 §1 ECRANE Doc Sync

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings drift documentar verified>
- **Modificări:** §AMENDMENT 2026-05-10 NEW appended §1 ECRANE + cross-refs
- **Tests:** 2731 PASS preserved (pure docs)
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | description>
- **Next action:** TASK 06 (6 templates Mentenanță+Auto cross-skin × 4 atomic) — Cluster #2 Onboarding inputs UI start
```
