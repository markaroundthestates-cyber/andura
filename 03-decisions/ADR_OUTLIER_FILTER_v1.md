# ADR — Outlier Filter v1 (Profile-Aware + ASK Don't IGNORE)

**Status:** ✅ **LOCKED V1** (2026-05-02 Chat D ADR Review Process EXECUTED per §36.56 + 1 amendment aplicat per §36.57)
**Date:** 2026-05-02 (SUFLET ANDURA ingest → LOCKED V1 Chat D)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.24 + §36.26 + ADR Pattern 14 No-Inference + §29.2.5 Engine Forță

---

## Context

Sufletul Andura: AI-ul observă deviații semnificative față de istoric → engine NU adaptează silent (NU "ignore"), NU presupune cauză. **ASK don't IGNORE.**

V1 trigger: outlier detection per (Profile × Exercise Category). Pragurile diferă — Maria 65 ±3 reps acceptabil pe Sit-to-Stand, Marius 25 ±4 reps pe Deadlift identical magnitude diferentă semnificație.

## Decision

### Pragurile detection (per §36.24)

| Profil | Categorie | Prag Deviație |
|--------|-----------|---------------|
| Maria 65 | Greutate corporală/Izolare | ±3 reps SAU ±5 kg |
| Marius 25 | Mișcări compuse grele | ±4 reps SAU ±20% greutate |

Profil intermediate (Gigica 35, Maria 70) → fallback la Maria 65 thresholds (conservative-by-default).

### Mecanica UI LOCKED

Outlier detected → prompt confirmation:
> "Sesiunea de astăzi pare diferită față de istoricul tău. Confirmă dacă greutatea și repetările introduse sunt corecte sau corectează-le."
> [Confirm valorile] [Corectez valorile]

### Outlier confirmed treatment (per §36.26)

- **1 sesiune izolată:** noted CDL "low day flag", baseline UNCHANGED. Presupunem zi proastă (somn slab, stres, glicemie). Bayesian rigidity prevention — single data point NU recalibrează priors.
- **3 sesiuni consecutive same exercise low day:** ABIA acum baseline shift downward (regresie reală, anti-supraantrenament).

### Filozofie

- ZERO inference cauză (somn? stres? boală? — engine NU știe).
- ASK user explicit (autonomy preserved + accurate signal).
- Engine adaptează pe efect observat (3 consecutive = signal real), NU presupunere.

## Consequences

### Positive

- Anti-RE: ZERO procentaje user-facing în prompt ("ASK" wording neutral).
- Bayesian rigidity prevention: 1 izolat ≠ baseline shift.
- ADR Pattern 14 No-Inference alignment.
- Profile-aware: Maria + Marius have different signal-to-noise ratios.

### Negative

- 3-consecutive trigger latency: real regression detected after 3 sessions = potential 3 weeks for Marius 1×/săpt frequency on a specific lift. V1 acceptable; V2 reconsider velocity.
- False positive: user attempting NEW PR (legitimate ±20% jump) flagged ca outlier → friction prompt. Mitigation: prompt confirms intent, [Confirm valorile] = explicit user-asserted.

### Risks

- Threshold tuning per (Profil × Categorie) requires real beta data. V1 conservative; V2 calibrate.
- Hybrid exercises (Maria using Cable Pull-throughs which is technically "izolare" but loaded compound-style) — categoria assignment matters. V1 default fallback to dominant category per exercise metadata.

## Test plan (deferred Daniel review)

- Unit per (Profil × Categorie × deviation type): Maria izolare +4 reps = trigger / Maria izolare +2 reps = NO trigger / Marius compus +25% greutate = trigger / Marius compus +15% greutate = NO trigger
- Edge: 1 outlier confirmed → CDL note (DA), baseline next session unchanged (DA)
- Edge: 3 outlier confirmed consecutive same exercise → baseline shift downward (DA), shift magnitude calibrated (per ADR Pattern 14)
- False positive: NEW PR attempt (+25% legitim Marius) → prompt friction, user confirm → CDL note, baseline updated upward (DA)

## Reconsideration triggers

1. Threshold tuning post-beta data (false positive rate).
2. Profile transition edge (Marius → Marius+ Advanced+ category).
3. New exercise category added (e.g., Olympic lifts dacă unlocked V2).
4. V2: outlier velocity > 3-consecutive (acceleration baseline shift dacă degradation rapid).

---

## §EXTENSIONS 2026-05-02 SELF-CORRECTION (post Self-Correction handover ingest)

### EXT-1: Streak Counter Same Direction + Reset Clarification (§36.30)

Baseline shift trigger = 3 sesiuni consecutive **în aceeași direcție** (only upward sau only downward), NU 3 oricum. Streak counter resetează la prima revenire la baseline normal.

**Mecanică:**
- Sesiunea 1: outlier upward (e.g. 55kg × 11 vs plan 50×10) → counter = 1/3 same direction
- Sesiunea 2: revenire la baseline normal (50×10) → **counter RESET la 0**
- Sesiunea 3: outlier upward din nou → counter = 1/3 (NOT 2/3)

**Marius Bench Press validation shift baseline 50→52.5kg:**
- Trebuie: Sesiunea 1 (55×11) + Sesiunea 2 (55×11) + Sesiunea 3 (55×11) la rând
- Orice intermediate normal session = reset counter

**Outlier prompt timing (§36.24 §AMENDMENT):** confirmation prompt apare **post-session-end ONLY** (la tap "Termină sesiunea"), NU mid-set. Mid-set prompt = friction major Executor mode.

### EXT-2: Goal Shift Event Handler — Streak Reset + Conversion Interval (§36.35)

Schimbarea obiectivului (Estetică/Hipertrofie ↔ Forță/Performanță) = Eveniment de Schimbare Explicită declanșat de user din Setări → Profil & Date. NU auto-detect silent.

**Modificatori de Template:**

| Parametru | Profil Estetică (Hipertrofie) | Profil Forță (Performanță) |
|-----------|-------------------------------|----------------------------|
| Rep Ranges (Tier 1) | 8-12 repetiții | 4-6 repetiții |
| Intensitate (Load) | RIR 2 | RIR 1-0 |
| Timp odihnă | 90-120 secunde | 180-300 secunde |

**Conservare date fizice:**
- Istoric forță = INTACT
- PR records = INTACT
- CDL session logs = INTACT
- **Streak counter (per §36.26 + EXT-1) = RESET la 0** (context fizic schimbat = signal nou independent)

**Conversia baseline — Starting Interval, NU single point:**

**Anti-pattern (RESPINS):** single formula 1RM (Epley/Brzycki) → cifră fixă (e.g. 57.5kg × 5 reps).

**Aliniat SUFLET F1 Triangulation:**
- Engine generează **interval larg** de adaptare (e.g. 52.5-57.5kg × 5 reps)
- Mesaj UI Modul Curios: *"Estimat: 52.5 - 57.5 kg × 5 reps. Primele 2 sesiuni după schimbarea obiectivului reprezintă o fază de calibrare."* (Phase B wording placeholder pending)
- Streak counter rules apply normal post-shift (3 consecutive same direction validates real baseline)

**§AMENDMENT 2026-05-02 Chat E — Wording LOCKED V1 (per §36.58 Phase B 51 strings):**

Placeholder wording final LOCKED V1, post-Chat E review strategic Daniel + Claude (sentence case + voice plural + zero numerice algoritmice + Bugatti tone). Note: minKg/maxKg/reps sunt parametri legitimi user-data (NU scoruri algoritmice raw), permise per §6 evening anti-RE rule.

```javascript
const GOAL_SHIFT_CALIBRATION_PLACEHOLDER = {
  id: "goal_shift_calibration_notice",
  title: "Recalibrăm pe noul obiectiv",
  body: "Primele 2 sesiuni sunt de calibrare · Estimăm ${minKg}-${maxKg} kg × ${reps} reps, ajustăm după ce avem date",
  subText: "Sesiunea ${current}/2",
  status: "LOCKED V1 — production ready"
};
```

**Production Shipping Gate (CI/CD pre-deploy):**

> Strict interzisă compilarea build-ului de producție dacă în baza de cod există flagul `PHASE_B_LOCK_REQUIRED` sau string-ul `PHASE_B_WORDING_PENDING`. Build script verifică grep, fail dacă match. Consistency cu pattern existent ADR_MODE_DETECTION EXT-4. Post-Chat E §36.58: wording LOCKED, integration Sprint 4.x cluster va remove flagurile la implementation.

**Cross-ref:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.58 Phase B Wording 51 Strings LOCKED V1.

### EXT-3: User-Triggered Profile Reset — Streak Counter PRESERVE (§36.34)

Distincție critical vs Goal Shift:
- **Profile Reset** (§36.34): UI/UX shift only, fizicul intact → streak counter **PRESERVE** (Marius cu 2/3 spre baseline shift NU pierde progres real)
- **Goal Shift** (§36.35): context fizic schimbat → streak counter **RESET la 0**

### EXT-4: Abandonment Engine + §36.30 Override — Streak Counter PRESERVE pe Abandoned (§36.81.4)

**Decizie:** Sesiunile abandonate (`session_status: 'abandoned'`) NU contează ca "sesiune normală intermediară", ci sunt tratate ca un **gap neutru (skip)**. Streak counter-ul §36.30 de validare a baseline-ului pe aceeași direcție NU se resetează la o sesiune abandonată, ci doar la o sesiune validă normală.

**Trigger detection (rest_timer based, NU timpi statici arbitrari):**
- Rest timer activ: NU întreabă nimic (Marius poate face 6-8 min pauză legitimă la squat heavy)
- Rest timer expirat ȘI 10 min idle fără interacțiune: countdown abandonment
- La redeschidere app: modal interstitial "Continuăm sesiunea sau încheiem aici?"
- >4h inactivitate totală: auto-close `session_status: 'abandoned'`, ecran curat next open
- Drop "midnight rule": sesiune unică indiferent schimbare zi calendaristică

**Mecanică Marius example:**
```
[Sesiunea 1: Outlier ✅] → counter 1/3
[Sesiunea 2: Outlier ✅] → counter 2/3
[Sesiunea 3: Abandoned ⚪ (Neutral)] → counter PRESERVED 2/3
[Sesiunea 4: Outlier ✅] → counter 3/3 → baseline shift triggered
```

**Tratarea datelor incomplete (Outlier Protection):**
- Frecvența de antrenament: counted (engine știe că user a mers la sală)
- Progresoare 1RM și Deload triggers: complet excluse
- Pattern learning: ignored (anti-pollution istoric)

**Distincție matrix vs EXT-1/EXT-2/EXT-3:**

| Eveniment | Streak Counter |
|-----------|----------------|
| Sesiune normală same direction (EXT-1) | INCREMENT 1/3, 2/3, 3/3 |
| Sesiune normală opposite direction (EXT-1) | RESET 0 |
| Profile Reset §36.34 (EXT-3) | PRESERVE |
| Goal Shift §36.35 (EXT-2) | RESET 0 |
| **Abandoned §36.81.4 (EXT-4)** | **PRESERVE (gap neutru, skip)** |

**Cross-refs:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.81.4 + §36.30 Streak Counter Same Direction (extended) + §36.34 Profile Reset PRESERVE (similar mechanic) + §36.35 Goal Shift RESET 0 (opposite mechanic) + ADR 012 Calibration Tier Decay (60-day inactivity, separate concern, NU overlap).

---

*Authored 2026-05-02 SUFLET ANDURA ingest. EXT-1 to EXT-3 added 2026-05-02 SELF-CORRECTION ingest. EXT-4 added 2026-05-03 night late PREBETA SCOPE EXPANSION ingest. Status DRAFT — pending Daniel review pre-LOCK.*
