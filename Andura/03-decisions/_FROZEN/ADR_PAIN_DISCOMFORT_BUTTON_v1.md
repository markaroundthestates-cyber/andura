# ADR_PAIN_DISCOMFORT_BUTTON_v1

**Status:** LOCKED V1 (with EXT-1)
**Locked:** 2026-05-02 per ALIGNMENT_QUESTIONS Q2 Daniel response
**Data:** 2026-05-02 (creat în BATCH_05 final Sprint 4.x cluster)
**Origine:** §36.38 Chat C SELF-CORRECTION EXTENSION

---

## Context

User raportează durere/disconfort în timpul sesiunii. App NU este unealtă medicală — F2 SUFLET stipulează "AI-ul informează, nu impune", și Gigel test (paranoia rezonabilă post-MVP audit legal) cere ZERO medical claims în UI/wording. Existing solutions (Fitbod / Strong / Hevy) ori ignoră complet input pain (paternalism mascat reverse — user trebuie să decidă singur), ori medicalizează (paternalism direct — questionnaire diagnostic).

Soluție: **3-tier pain input** observabil + **override CDL flag** pentru hard-block bypass + audit log.

## Decision

### 3 PAIN_OPTIONS (anti-paternalism, anti-medical-claim)

| Cheie | Label V1 | Level |
|-------|----------|-------|
| `discomfort_general` | "Mișcarea mă deranjează" | general (observable subjective) |
| `discomfort_specific` | "Simt o tensiune ciudată" | specific (localized observable) |
| `doms_severe` | "DOMS sever" | technical (gym-savvy users; optional) |

**Engine output:**
- `discomfort_general` → `suggest_alternative` (smart-routing alternatives)
- `discomfort_specific` → `reduce_volume` (skip last set sau reduce kg ~10%)
- `doms_severe` → `skip` (rest exercise, propose alternative muscle group)

**ZERO medical claim wording** în UI — NU "consult doctor", NU "recovery time estimate", NU "diagnostic suggestion".

### Override CDL (F2 SUFLET respect)

User poate override hard-block engine dacă engine flag-ează red zone (e.g., Composite Signal triggered pe acest exercițiu). Buton `[Continuă pe propria răspundere]` — logged ca:

```javascript
{
  user_override_pain_redflag: true,
  exerciseName: '...',
  painKey: '...',
  ts: Date.now(),
}
```

Audit log NU blocking — engine respectă alegerea user-ului. Future analysis (V2): trend on overrides post-injury cohort.

## Consequences

### Positive
- **F2 SUFLET respected** — AI informează (oferă opțiuni), user decide
- **Anti-paternalism** real (Fitbod/Strong/Hevy approach inferior pe Maria 65 demographic — ea NU face self-diagnostic, dar simte "mă deranjează")
- **Gigel test pass** — ZERO medical claims = audit legal Stage 1+2 pass on this surface
- **Observable signals** (NU inference) — engineable, testable, demoabile

### Negative
- **No injury detection automatic** — user trebuie să apese butonul; missed signal dacă user "tace"
- **Override audit trail** poate fi misused legal (companii medical mai conservative cer hard-block) — mitigation: doc explicit în T&C că app = wellness tool, NU medical device
- **Translation language** — "DOMS" technical, English-origin term naturalizat în gym RO. Maria 65 NU înțelege; soft hide DOMS option behind "Mai multe opțiuni" dacă user_tier == COLD_START

### Neutral
- 3 options sufficient pentru V1; V2 poate adăuga `pain_chronic` (pentru post-injury return cohort)

## Alternatives considered

1. **Hard-block fără override** — REJECTED: paternalism mascat (engine știe mai bine decât user-ul cu durere), F2 SUFLET violation
2. **Medical questionnaire (Wong-Baker pain scale, 0-10 numeric)** — REJECTED: Gigel test fail (numeric medical scale = potential medical device classification, EU AI Act risc)
3. **Single button "I'm in pain"** — REJECTED: zero granularity pentru engine action (skip vs alternative vs reduce)
4. **Auto-detect via patterns (early end + low RPE + user notes)** — DEFERRED V2 (signal validity uncertain pre-Beta data)

## Cross-refs

- §36.38 Pain/Discomfort Button (HANDOVER_GLOBAL)
- ADR_BIAS_DETECTION_OBSERVABLE (Pain override CDL EXT-1)
- SUFLET_ANDURA F2 ("AI-ul informează, nu impune")
- §29.3.1 ZERO medical screening principle
- Implementation: `src/engine/pain-button/` (BATCH_04)
- Tests: `src/engine/pain-button/__tests__/painButton.test.js`

## Reconsideration triggers

1. **Beta cohort feedback** — dacă users raportează că opțiunile sunt prea limitate (e.g., "ascuțit" vs "surd" pain distinction), extend la 4-5 options
2. **Override pattern misuse** — dacă >20% users overrides red flags consistently → add soft 2-second wait + confirmation re-prompt
3. **Legal Stage 2 audit findings** — dacă avocat barter recomandă wording change (e.g., "consult medic" disclaimer minim), apply post-launch
4. **Injury return cohort growth** post-V1.1 → adaugă `pain_chronic_recovery` flag cu engine adjustment dedicated

---

## EXT-1 — DOMS Visibility Tier-Aware (LOCKED 2026-05-02)

**Rationale:** Gigel test failed pentru `doms_severe` option visibility default. User cohort cold_start (e.g., Maria 65, non-tech RO) NU înțelege termen tehnic "DOMS" (Delayed Onset Muscle Soreness). Trust breach + cultural friction RO + scope creep medical perceput.

**Decision:**
- 2 options PRIMARY visible default: "Mișcarea mă deranjează" + "Simt o tensiune ciudată"
- 1 option SECONDARY behind expand "Mai multe opțiuni": "DOMS sever" (renamed în UI: "Durere musculară severă post-antrenament (DOMS)")
- Expand pattern: chevron down icon, default collapsed, state preserved per session
- Telemetry: track expand_rate per cohort tier (T0/T1/T2+) pentru future analysis

**Implementation guidance pentru Sprint UI Integration:**
- Component `<PainDiscomfortCard>` exposes prop `showAdvancedOptions: boolean` default `false`
- Daniel UX final review pre-Beta launch

---

## EXT-2 PENDING — Injury Body Region Map Opțiune A Propusă (§36.85)

**Status:** PENDING Daniel decision next chat strategic (A vs drop). NU LOCKED. NU implementat. Doc-only flag.

**Origine:** Chat strategic 2026-05-03 night late (handover §36.85). NEW gap proposed în §36.84 Jeff Nippard Backlog #8.

**Context:** §36.38 Pain Button core (3 PAIN_OPTIONS + override CDL + EXT-1 DOMS visibility) este generic skip/reduce per session current. NU este injury-specific protocol per zonă anatomică concretă.

**Opțiune A propusă (~1-2 săpt CC) — extensie naturală §36.38 + §36.36:**
- User apasă "Mă doare" → "Unde?" → body map (umăr stâng / genunchi drept / lombară / etc)
- Engine vede ce exerciții stresează zona (`muscle_target_primary` + `muscle_target_secondary` în schema §36.36) → automat skip toate în sesiunea curentă + propune alternative ZERO load pe zona afectată
- Exemplu: user zice "umăr stâng" → engine skip OHP + bench + lateral raises + face pulls automat. Propune: leg day exclusiv + core
- **NU recomandă rehab specific** ("fă band external rotations") — doar evită stres → zero medical device classification risc

**Schema validation:** §36.36 — `muscle_target_primary` + `muscle_target_secondary` deja câmpuri obligatorii, deci wiring posibil zero refactor schema (validat pre-flight).

**Opțiune B (~3-4 săpt CC, post-Beta cu data reală):** Extension A + tracking durată recovery + re-introduction graduală cu test sets.

**Opțiune C (~2-3 luni, RISC LEGAL, REJECTED prebeta indiferent §36.83):** Library protocoale rehab specific per zonă (knee valgus → terminal knee ext + glute med activation). **TRECE LIMITA medical device** → EU AI Act risc + audit legal Stage 2 fail probabil.

**Recomandare Claude (chat strategic):** Opțiunea A prebeta (per §36.83 LOCKED), B post-Beta cu data reală, C NEVER.

**Action next chat:** Daniel decizie A vs drop complet. Dacă A LOCKED → create dedicated `ADR_INJURY_BODY_REGION_MAP_v1.md` SAU consolidate în EXT-2 detail aici.

**Cross-refs:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.85 Injury Body Region Map PENDING + §36.84 Jeff Nippard Backlog gap #8 + §36.38 Pain Button core (extension target) + §36.36 Schema Extension (`muscle_target_primary` + `muscle_target_secondary` existent) + §36.83 META-RULE Prebeta Scope Expansion (Opt A prebeta default per meta-rule) + EU AI Act compliance (Opt C REJECTED zero rehab claims).
