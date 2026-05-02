# ADR_PAIN_DISCOMFORT_BUTTON_v1

**Status:** DRAFT V1 — pending Daniel review pre-LOCK
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
