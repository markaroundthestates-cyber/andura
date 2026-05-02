---
name: HANDOVER_INPUT_2026-05-02_chat_C_self_correction_extension
description: Handover input chat strategic 2026-05-02 (3rd session) post Self-Correction ingest. 14 LOCKED noi §36.36-§36.49 — Aparat Ocupat/Lipsă Smart-Routing + Pain/Discomfort Button (3 funcțional + override CDL) + Hormonal Estimation RESPINS + Composite Signal Layer (Recovery State Adjustment) + ADR review process + Cycle Tracking RESPINS + Onboarding T0-T3 LOCKED + Pricing deferred + Beta cohorts LOCKED + Schema Extension exercise library. Cumulative pre-launch V1 = 31 + 14 = 45 LOCKED.
type: handover-input
date: 2026-05-02 (chat C)
model_recommended: claude-opus-4-7
working_dir_acasa: C:\Users\Daniel\Documents\salafull
working_dir_birou: /workspaces/salafull
---

# HANDOVER INPUT — Chat Strategic 2026-05-02 (Chat C — Self-Correction Extension)

# §1 PRE-CONDITION CHECK

Pre-condition Self-Correction ingest precedent (`59_HANDOVER_INPUT_CONSUMED_2026-05-02_self_correction.md`) deja applied. Acest handover = **additive only** la cumulative 31 LOCKED.

```bash
# Verify pre-condition
grep -c "§36.35" 06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md
# Expected: ≥ 1 (Self-Correction ingest applied)
```

Dacă **§36.35 NOT FOUND** → STOP, ingest precedent ne-aplicat. Dacă **§36.35 FOUND** → procedează normal.

---

# §2 14 DECIZII LOCKED NOI — Sesiunea 2026-05-02 Chat C

## §2.1 §36.36 Schema Extension Exercise Library LOCKED V1

**Decizie:** Extindere schema `src/exercises/` cu metadate noi pentru Smart-Routing (§36.37) + Pain Button (§36.38) + Composite Signal (§36.41).

**Câmpuri obligatorii adăugate fiecărui exercițiu:**

| Field | Type | Values |
|-------|------|--------|
| `equipment_type` | enum | `barbell` / `dumbbell` / `machine` / `cable` / `bodyweight` / `band` |
| `equipment_alternatives` | string[] | Array IDs exerciții cu același target muscular, equipment diferit |
| `force_demand` | enum | `high` / `medium` / `low` (stres sistemic + neuromuscular) |
| `muscle_target_primary` | string[] | Pentru continuitate stimul la swap |
| `muscle_target_secondary` | string[] | Pentru continuitate stimul la swap |
| `tier` | number | 1 (compound bază) / 2 (accesoriu izolare) — DEJA în §36.33 |

**Migration runner:** Daniel review categorization la library extension batch (post Sprint 4.x cluster).

**Cross-refs:** §36.33 Time-Constrained tier + §36.37 Smart-Routing + §36.38 Pain Button + §36.41 Composite Signal.

## §2.2 §36.37 Smart-Routing Aparat Ocupat / Aparat Lipsă LOCKED V1

**Decizie:** 2 butoane noi pe cardul exercițiului — `[Aparat ocupat]` + `[Aparat lipsă]` — cu logică determinist diferită bazată pe `force_demand`.

### Buton [Aparat ocupat]

```
if (force_demand === 'high')
  ──► Sticky Swap acum (propune echipament alternativ same muscle target)
else
  ──► Mută exercițiul curent la finalul listei sesiunii curente
```

**Rationale Cazul 1 (`high`):** Bench/Squat/Deadlift ocupat NU se mută la final pentru că force-dependent → user obosit la final → execuție compromisă. Recomandare alternativă acum (DB Bench / Trap Bar Deadlift).

**Rationale Cazul 2 (`else`):** DB Bench, izolare → mutare la final = friction zero, performance neaffected.

### Buton [Aparat lipsă]

Engine caută în library exerciții cu același `muscle_target_primary` dar `equipment_type` diferit (ex: Benzi elastice / Gantere fallback la barbell lipsă).

**Cross-refs:** §36.36 Schema + §36.38 Pain Button (same UX pattern Sticky Swap) + §29.5 Sticky Swap Engine.

## §2.3 §36.38 Pain/Discomfort Button — 3 Funcțional + Override CDL LOCKED V1

**Decizie:** Buton `[Am o durere / disconfort]` pe cardul exercițiului → meniu cu 3 opțiuni FUNCȚIONALE (NU diagnostic medical) + buton override pe Cazul 🔴 cu CDL log.

### Meniu 3 Opțiuni Funcționale

| Opțiune (UI) | Wording user | Engine action |
|--------------|--------------|---------------|
| 🔴 Red Flag | "Mă doare să continui" | Recomandă strong skip + 3 butoane (incl. override) |
| 🟡 Yellow Flag | "E inconfortabil, dar pot încerca" | 3 opțiuni: Test load -20% / Swap / Continuă normal |
| 🟢 Green Flag | "Sunt doar obosit / cu febră musculară" | Tag CDL `[Soreness Day Tag]`, plan neschimbat |

### Cazul 🔴 — 3 Butoane (Anti-Paternalism)

UI prompt:
> "Continuarea poate duce la accidentare. Recomandăm să sărim peste acest exercițiu."

Butoane:
1. `[Înlocuiește exercițiul (Sticky Swap)]` — **CTA Principal** (mare, colorat)
2. `[Treci peste astăzi]` — Secundar (simplu)
3. `[Continui pe răspunderea mea]` — **Tertiar** (text gri, NON-CTA)

### Override CDL Log + Bias Detection V2 (deferred)

- Apăsare buton 3 → log imediat în CDL: `[user_override_pain_redflag]`
- ToS Coverage: "User-acknowledged risk override"
- **V1:** doar logging silent
- **V2 (deferred post-beta):** escalation prompt dacă apăsat 3+ ori în 30 zile

### Cazul 🟡 — Yellow Flag

3 opțiuni egale:
1. `[Scade greutatea cu 20% (Set test)]`
2. `[Înlocuiește exercițiul (Sticky Swap)]`
3. `[Continuă normal (Sunt OK)]`

### Cazul 🟢 — Green Flag

Engine NU modifică plan. Tag CDL `[Soreness Day Tag]` → dacă perf scade în sesiune, NU tratează ca regresie reală (NU scade baseline next session).

**Filozofie aliniată:**
- SUFLET F2 "AI-ul informează, nu impune" (Cazul 🔴 NU forced skip)
- SUFLET F6 No-Inference (wording funcțional, NU diagnostic medical)
- ADR Pattern 14 (engine reacționează la observable, NU inferează cauză)
- Gigel test PASS (Maria 65 distinge funcțional, NU anatomic)

**Cross-refs:** §36.19 Auto-pedeapsă 20% (consistency) + §36.39 Yellow Flag 20% lock + §29.5 Sticky Swap + ADR Pattern 14 + SUFLET F2 + F6.

## §2.4 §36.39 Yellow Flag -20% Test Load Consistency LOCKED V1

**Decizie:** Cazul 🟡 "Scade greutatea cu 20%" = consistency cu §36.19 (auto-pedeapsă) + §36.49 (Recovery Volume).

**Reducere fixă -20% în tot motorul Andura V1:**
- §36.19 Auto-pedeapsă reduction trigger (set N+1 redus manual ≥20% post-success)
- §36.39 Yellow Flag test load (-20% kg per set)
- §36.49 Recovery State Adjustment volume reduction (fix -20%)

**ZERO interval-uri (15-20% scrap).** Determinism maxim.

**Cross-refs:** §36.19 + §36.38 + §36.49.

## §2.5 §36.40 Hormonal Estimation RESPINS V1 + Performance State Inference LOCKED V1

**Decizie:** Eliminat complet din scope V1 — feature "estimări cortizol/estrogen/testosteron din patterns" pentru ajustări tacite.

### Rationale RESPINS

- Încalcă SUFLET F6 No-Inference (engine inventează biologie internă fără verificare empirică)
- Validity științifică zero — cortizol salivar variază 200-400% în 24h, NU estimabil din patterns app fitness fără HRV/temp/sleep
- Black box engine pentru user → trust breach când user observă pattern fără explicație factuală în Modul Curios (§36.32)
- Liability risk reputațional masiv (jurnalist: "SalaFull pretinde estimează cortizol fără bloodwork")

### Soluție Înlocuire — Performance State Inference (LOCKED V1)

| Ce pare semnal hormonal | Ce e de fapt în Andura V1 (observable) |
|-------------------------|----------------------------------------|
| "Cortizol ridicat" (suprasolicitare) | Performance Drop 2+ sesiuni + RIR raportat 0 la greutăți mici |
| "Testosteron scăzut" (oboseală cronică) | Stagnare forță 3+ săpt + timp refacere prelungit |
| "Estrogen luteal/menopauză" | OUT OF SCOPE V1 (NO cycle tracking, RESPINS §36.43) |

### Reguli Execuție

1. **Eliminare totală jargon hormonal** — în cod, baza de date, interfață: ZERO referire la hormoni sau markeri biologici
2. **Performance Proxies Only** — engine ajustează pe RIR + perf delta + adherence rate + pause patterns
3. **Modul Curios factual** — text strict observabil ("Am redus greutatea pentru că ultimele 2 sesiuni perf -15% baseline")

**Cross-refs:** SUFLET F6 No-Inference + ADR Pattern 14 + §36.31 God Mode RESPINS (same family) + §36.41 Composite Signal Layer + §36.32 Modul Curios factual.

## §2.6 §36.41 Composite Signal Layer (Recovery State Adjustment) LOCKED V1

**Decizie:** Layer determinist tăcut care detectează multi-signal degradation simultaneous → aplică Recovery State Adjustment 2 sesiuni. ZERO inferență cauză biologică.

### Composite Signal Trigger — 3/3 Independent Thresholds Simultaneous

```
TRIGGER = (Performance Drop AND Rest Time Delta AND RIR Mismatch)
```

Per metric per exercițiu:

1. **Performance Drop** (LOCKED §36.49 dual-threshold):
   ```
   (avg(kg×reps) per set last 4 sessions − avg current) / avg last 4 ≥ 10%
   AND
   (Δ Kg ≥ 2.5 kg OR Δ Reps ≥ 2)
   ```

2. **Rest Time Delta:** Timp odihnă seturi ≥ +30% vs baseline personal exercițiu

3. **RIR Mismatch:** User raportează RIR ≤ 1 la load ≤ 90% baseline curent

### Per-Set Normalization (Anti-False-Positive)

Calcul Performance Drop pe **avg(kg × reps) PER SET COMPLETAT** (NU volum total).

**Excluse din calcul:**
- Seturi marcate `skipped`
- Seturi marcate `forced-exit` (Aparat ocupat finalul)
- Seturi marcate `time-compressed` (Modul 25min)

**Exemplu Marius Bench Press (validation):**
- Last 4: 4 seturi × 50kg × 10 = avg 500 kg-reps/set
- Curent (Aparat ocupat la setul 4, exclus): 3 seturi × 50kg × 10 = avg 500 kg-reps/set
- Drop = 0% → NU triggerează false positive

### Lifecycle Recovery State Adjustment

| Phase | Action |
|-------|--------|
| **Kick-in** | 1 sesiune după trigger detectat |
| **Active** | 2 sesiuni consecutive — volum redus -20% (consistency §36.39) |
| **Auto-resume** | Sesiunea 4 — baseline normal |
| **Extension** | Dacă signals încă active la finalul sesiunii 3 → extend +1 sesiune (max 4 total) |

### Modul Curios Factual (post-hoc)

User tap "De ce?" → engine output strict observable:
> "Am ajustat conservativ pe baza a 3 semnale de performanță din ultimele 2 sesiuni:
> - Scădere progres: -12%
> - Timp de odihnă crescut: +35%
> - Efort maxim raportat la greutate redusă."

**ZERO jargon hormonal.** Aliniat §36.32 Explainability Lazy.

### Excluse din Composite Signal

- Pain/Discomfort button (§36.38) — propriul flow, NU input Composite
- Self-reported fatigue text — NU există V1
- Cycle phase (§36.43 RESPINS V1)

### Performance Budget

Layer D Cascade Defense ≤ 50ms per "Set terminat" tap (cross-ref ADR_CASCADE_DEFENSE EXT).

**Cross-refs:** §36.34 Profile Validation 3/3 simultaneous (same anti-false-positive pattern) + §36.40 Performance State Inference + §36.32 Modul Curios + §36.49 Dual-Threshold + §36.39 -20% reduction + ADR_CASCADE_DEFENSE Layer D.

## §2.7 §36.42 ADR Review Process LOCKED V1

**Decizie:** Daniel review 5 ADR drafts NU se face în chat sumar 3 propoziții/ADR — file-by-file integral.

### Mecanică

1. **Pre-citire Claude:** Claude citește integral 5 ADR drafts (`03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` + `ADR_MODE_DETECTION_UI_v1.md` + `ADR_BIAS_DETECTION_OBSERVABLE_v1.md` + `ADR_OUTLIER_FILTER_v1.md` + `ADR_CASCADE_DEFENSE_v1.md`)
2. **Raport structurat per ADR:** Pattern review checks (consistency cu §36.16-§36.49 + cross-refs validate + edge cases flagged + spec gaps identified)
3. **Verdict per ADR:** LOCK / amend (cu propunere wording) / reject (cu motiv)
4. **Daniel intervine:** doar pe ADR-uri flagged amend/reject sau Daniel-judgment-required

### Timeline

Chat strategic dedicat ~1-1.5h. Pre-citire Claude ~20 min. Daniel decizii flagged ~30-45 min.

### Output

5 ADR-uri statusul Draft → LOCKED V1 (sau amend cu commit dedicat). Sprint 4.x cluster UNBLOCKED.

**Cross-refs:** Toate 5 ADR drafts + §36.15 Sprint 4.x cluster scope.

## §2.8 §36.43 Cycle Tracking Femei RESPINS V1 LOCKED

**Decizie:** Eliminat complet din scope V1 — feature opt-in cycle tracking pentru femei.

### Rationale RESPINS

- Încalcă SUFLET F6 No-Inference (engine deduce phase din declared input)
- Gigel test fail — Maria 65 menopauză vs Gigica 50 perimenopauză vs femeie 25 ciclu regulat = 3 use cases biologice complet diferite, NU pot share single UI
- Scope creep beachhead — tracking cycle = UI dedicat + edge cases multiple + privacy concerns + cultural friction RO
- Composite Signal Layer (§36.41) acoperă deja drop performanță cauzat de cycle/menopauză via observable pure

### Coverage Compensatorie

V1 prinde "stare biologică schimbată" tacit prin Composite Signal — independent de cauză (cycle, menopauză, stres, oboseală). User primește Recovery State Adjustment fără declarare anatomy.

### V2 Reconsider

Post-beta data dacă cohort feminine confirmă demand explicit pentru cycle awareness vs Composite Signal coverage.

**Cross-refs:** SUFLET F6 + §36.31 God Mode RESPINS (same family) + §36.40 Hormonal Estimation RESPINS + §36.41 Composite Signal coverage.

## §2.9 §36.44 Onboarding T0 Hard Minimum LOCKED V1

**Decizie:** T0 NU 100% obligatoriu (friction barrier) NICI 100% skippable (engine fără data minimum). Hibrid: 2 câmpuri Hard Minimum + 2 Skippable cu fallback synthetic.

### Câmpuri T0

| Field | Status | Rationale |
|-------|--------|-----------|
| Sex biologic | **Obligatoriu** | Engine NU poate alege șablonul de pornire + profile forță |
| Vârstă | **Obligatoriu** | Esential capacitate refacere + volum inițial |
| Înălțime | Skippable | Fallback synthetic prior database |
| Greutate | Skippable | Fallback synthetic prior database |

### Fallback Mechanic

Skip H+G → engine folosește median synthetic prior database per (sex × vârstă):
- Ex: Femeie, 65 ani → fallback 1.63m / 68kg
- Ex: Bărbat, 25 ani → fallback 1.78m / 78kg

Synthetic 50+ profile demographic database = production infra (existing memory `Demographic Prior Database`).

### Privacy Policy Note (Phase Avocat)

Vârsta = personal data sensitive în EU contexte medical-adjacent. Privacy policy needs explicit clause:
> "Vârsta folosită pentru calibrare profil refacere, NU stocată pe server, NU partajată terți."

Action item Avocat barter review pre-launch.

**Cross-refs:** §36.21 T1+ Completion-Based + §36.22 T1+ 3 Câmpuri Gigel-Validated + Demographic Prior Database memory.

## §2.10 §36.45 T2 Wording Funcțional Mode Detection LOCKED V1

**Decizie:** Întrebarea T2 (cold-start mode detection) reformulată funcțional — NU jargon profile names.

### Wording UI Final T2

> **"Cum preferi să îți afișăm instrucțiunile?"**
>
> [ ] Vreau doar să văd greutatea și repetările → Mode Map: **Executor**
> [ ] Vreau să înțeleg și de ce s-au schimbat numerele → Mode Map: **Strategic**

### Plasă de Siguranță

- Cold-start binar Executor vs Strategic acoperă orice user (Maria/Marius/Gigica)
- Behavioral triggers §36.17 (Frustrat Tehnic / Frustrat Viață / Validation-Seeking) detectate independent de declared T2
- Auto-correction §36.34 la 8 sesiuni dacă cold-start greșit (drift behavioral 3/3 simultaneous → prompt mode shift)

### Gigel Test Pass

Maria 65 înțelege "vreau doar să văd greutatea și repetările" (acțiune concretă). Marius IQ 139 înțelege "vreau să înțeleg de ce" (signal Strategic clear). Gigica 50 → fie/fie, mode-ul real validate behavior post-T2.

**Cross-refs:** §36.17 4 Moduri UI Detection + §36.34 Profile Validation Layer + ADR_MODE_DETECTION_UI_v1.

## §2.11 §36.46 Pricing Strategy Deferred Pre-Launch LOCKED V1

**Decizie:** Pricing & Paywall flow NU în mandatory pre-launch questions. Skip pre-launch, decide la launch în funcție de piață.

### Rationale Defer

- Bootstrap solo Daniel — NU trebuie market data înainte beta
- Beta cohort 50 users (§36.47) = primary feedback channel
- Pricing optimal post-beta când cohort comportament real validat
- Founding Members lifetime free DEJA decis vault — trade-off conscious pentru first 50

### Action Items Open

- Founding Members positioning (lifetime free vs first year free, cine intră) → BLOCKER pre-launch separat
- Standard pricing strategy → defer launch
- Trial mechanics (no card / card upfront / X days free) → defer launch

**Cross-refs:** §36.13 Beta-launch ASAP + §36.47 Beta Cohorts + Carry-over Founding Members positioning.

## §2.12 §36.47 Beta Recruitment 50 Users 3 Cohorts LOCKED V1

**Decizie:** Primii 50 beta users selectați manual — NU marketing deschis. 3 cohort-uri target pentru feedback dogfooding multi-spectrum.

### Cohort Structure

| Cohort | Size | Profil | Scop Feedback |
|--------|------|--------|---------------|
| Daniel's Inner Circle | 20 | Prieteni/cunoscuți pasionați fitness | Bug reports + jargon-aware feedback |
| The "Gigel" Test Cohort | 15 | 50-60 ani (Maria/Gigica typology) | Simplitate UI + Gigel test live |
| Power-User Cohort | 15 | Marius typology (25 ani trag tare) | Limite engine progresie + edge cases |

### Channel Decision (BLOCKER pre-launch)

Discord vs WhatsApp vs Telegram → action item separat decizie. Carry-over §29.6.3 Discord references sweep pending.

### Realistic Check Open Items

- 20 inner circle realistic count? (Daniel solo verify)
- 15 Gigel cohort recruitment plan concret? (părinți, vecini, prieteni părinți)
- Channel decide single (NU "Discord/WhatsApp" ambiguous)

**Cross-refs:** §36.13 Beta-launch ASAP + Carry-over Founding Members + Carry-over Discord references sweep §29.6.3.

## §2.13 §36.48 Per-Set Normalization Performance Drop LOCKED V1

**Decizie:** Calcul Performance Drop în Composite Signal Layer (§36.41) pe **avg(kg × reps) PER SET COMPLETAT**, NU volum total sesiune.

### Formula

```
Performance Drop = (avg V last 4 sessions − avg V current) / avg V last 4 ≥ 10%

avg V = avg(kg × reps) per set VALIDATED
```

### Excluse din Calcul

- Seturi marcate `skipped`
- Seturi marcate `forced-exit` (ex: Aparat ocupat la finalul listei §36.37)
- Seturi marcate `time-compressed` (ex: Modul 25min §36.33)

### Rationale

False positive risk: volum total sesiune < baseline pentru că user a folosit `[Aparat ocupat]` sau `[Modul 25min]` (constrângeri context legitime, NU oboseală cronică).

Per-set normalization → Composite Signal NU triggerează când set count redus din motive context, doar când performance per set validat scade real.

**Aliniat §36.21 spirit completion-based, NU calendar/total-based.**

**Cross-refs:** §36.21 Completion-Based + §36.33 Time-Constrained + §36.37 Smart-Routing + §36.41 Composite Signal Layer.

## §2.14 §36.49 Composite Signal Dual-Threshold + Recovery Volume -20% Fixed LOCKED V1

**Decizie:** Performance Drop trigger = dual-threshold (procentual + absolut). Recovery State Adjustment volume reduction = fix -20% (NU interval).

### Dual-Threshold Performance Drop

```
Performance Drop validated = 
  (Procent Drop ≥ 10% per §36.48 formula)
  AND
  (Δ Kg ≥ 2.5 kg OR Δ Reps ≥ 2)
```

### Validation Test Cases — Maria 65 DB Bench Press (15kg × 10 reps baseline)

**Scenariu A — Fluctuație normală:**
- Curent: 15kg × 9 reps
- Volum mediu trecut: 150 kg-reps/set
- Volum mediu curent: 135 kg-reps/set
- Procent drop: 10% ✓
- Δ Kg: 0 kg ✗
- Δ Reps: 1 rep ✗
- **Result: FALSE — NU triggerează (false positive evitat)**

**Scenariu B — Oboseală reală:**
- Curent: 15kg × 8 reps
- Volum mediu trecut: 150 kg-reps/set
- Volum mediu curent: 120 kg-reps/set
- Procent drop: 20% ✓
- Δ Reps: 2 reps ✓
- **Result: TRUE — Composite Signal validated**

### Recovery Volume Reduction — Fix -20%

Eliminat interval 15-20%. Determinism maxim. Consistency cu:
- §36.19 Auto-pedeapsă (-20% manual reduction trigger)
- §36.39 Yellow Flag test load (-20%)
- §36.49 Recovery State Adjustment (-20%)

### Implementation Code Mechanic

Recovery State Active 2 sesiuni → engine aplică reducere -20% volum total exercițiu:
- Reduce 1 set complet din structură, SAU
- Reduce proporțional repetările, păstrând intensitatea kg/bară intactă

Engine alege opțiunea care preserve cel mai bine pragul stimulare neuro-musculară per profil.

**Cross-refs:** §36.19 + §36.39 + §36.41 + §36.48.

---

# §3 ROUTING SSOT IMPACT

## §3.1 Files create/update

- **NU files create new.** Toate decizii ăstea = additive la SSOT existing.

## §3.2 Sections amend in-place HANDOVER_GLOBAL

| Section | Amendment | Type |
|---------|-----------|------|
| `§36 (NEW subsections)` | §36.36-§36.49 — 14 LOCKED noi (subsections per §2 above) | Append additive |
| `§36 EOF Session-Lock entry` | "Sesiune 2026-05-02 Chat C SELF-CORRECTION EXTENSION LOCK" cronological entry | Append cronological |

## §3.3 ADR drafts updates (extends existing DRAFT files)

| ADR file | Update |
|----------|--------|
| `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) | §EXT-7 added — T2 wording funcțional cold-start (§36.45) |
| `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT) | NO update — out of scope acest handover |
| `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) | NO update — out of scope acest handover |
| `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT) | §EXT-1 added — Pain Button override CDL log `[user_override_pain_redflag]` (§36.38) |
| `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (DRAFT) | §EXT-2 added — Composite Signal Layer Layer D ≤50ms budget per "Set terminat" tap (§36.41) |

## §3.4 ADR drafts NEW needed (defer Sprint 4.x cluster)

- `ADR_COMPOSITE_SIGNAL_LAYER_v1.md` (NEW DRAFT) — §36.41 + §36.48 + §36.49 standalone ADR
- `ADR_PAIN_DISCOMFORT_BUTTON_v1.md` (NEW DRAFT) — §36.38 standalone ADR
- `ADR_SMART_ROUTING_EQUIPMENT_v1.md` (NEW DRAFT) — §36.36 + §36.37 standalone ADR

Decision: **AMÂNĂ creation NEW ADR drafts** — integration în Sprint 4.x cluster batch (Daniel review timing optimum post-LOCK celelalte 5 ADR drafts existing).

## §3.5 Schema impact (cod source future Sprint 4.x)

- **Exercise library schema:** add fields `equipment_type` + `equipment_alternatives[]` + `force_demand` + `muscle_target_primary` + `muscle_target_secondary` (per §36.36). Migration runner pentru exerciții existente — Daniel review categorization.
- **Setări UI:** existing 2 butoane (Schimbă obiectiv §36.35 + Resetează profil §36.34) — NO ADD acest handover.
- **Card exercițiu UI:** add 3 butoane noi — `[Aparat ocupat]` + `[Aparat lipsă]` + `[Am o durere / disconfort]` (§36.37 + §36.38).
- **Onboarding flow:** add T0 fallback synthetic logic (§36.44) + T2 wording funcțional (§36.45).
- **Composite Signal Layer:** new module `src/engine/compositeSignal.js` (§36.41 + §36.48 + §36.49).

## §3.6 Phase B wording strings impact

Strings noi LOCKED V1 din chat C (NU need Phase B replace — wording-ul deja Daniel-validated în chat):

- §36.38 Pain Button — 3 wordings menu (🔴/🟡/🟢) + Cazul 🔴 prompt + 3 butoane wording + Cazul 🟡 prompt + 3 butoane wording + Cazul 🟢 mesaj
- §36.41 Composite Signal Modul Curios reveal — wording factual exemplu

**Total ~10 strings noi LOCKED chat-validated direct.** ZERO add la Phase B remaining 33 + 2 NEW (still 35 strings Phase B mini-sesiune scope unchanged).

---

# §4 CARRY-OVERS PRE-LAUNCH BLOCKERS (status update post chat C)

| Item | Status | Owner | Tip |
|------|--------|-------|-----|
| ADR review 5 drafts → LOCK | OPEN — proces clarificat §36.42 | Claude pre-citire + Daniel decizii | Strategic chat |
| Phase B wording session ~35 strings | OPEN | Daniel + Claude chat dedicat 30-45min | Strategic chat |
| Discord vs WhatsApp channel | OPEN | Daniel + Claude 5 min | Strategic chat |
| Founding Members positioning | OPEN | Daniel + Claude 15-20 min | Strategic chat |
| Avocat barter status | OPEN | Daniel solo outreach | Action item |
| Firebase Console Auth setup | OPEN | Daniel solo 30-45min hands-on | Action item |
| Database rules publish post-Auth | OPEN | Daniel solo 15min hands-on | Action item |
| Founding Members + Discord vault sweep | OPEN | CC Opus 30min vault cleanup | Vault cleanup |

**Total chat strategic remaining: ~3-4h cumulative across 4 sessions** (1.5h ADR review + 45min Phase B + 5min Discord + 20min Founding Members).

**Total Daniel solo hands-on: ~1.5h** (45min Firebase + 15min rules + outreach Avocat).

**Total CC Opus pre-Sprint 4.x: ~30min vault cleanup.**

DUPĂ toate astea → Sprint 4.x cluster implementation full mecanic (~16-22h Opus comprehensive).

---

# §5 NEXT ACTION ROADMAP (PRIORITATE)

## Priority 1: ADR review 5 drafts (BLOCKER Sprint 4.x cluster)

Per §36.42 process — Claude pre-citește integral, livrează raport per ADR (LOCK / amend / reject + flags), Daniel decide pe flagged.

**Chat strategic dedicat ~1-1.5h.** Output: 5 ADR-uri Draft → LOCKED V1.

## Priority 2: Phase B wording mini-sesiune (BLOCKER pre-launch hard)

Per §36.11 strategy — 35 strings cumulative (33 existing + 2 NEW §36.34 + §36.35).

**Chat strategic dedicat 30-45min Daniel-validated.** Production gate `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING` → DO NOT SHIP.

## Priority 3: Decizii strategice rapide chat dedicat

- Discord vs WhatsApp channel beta (5 min)
- Founding Members positioning (15-20 min)

**Chat strategic mini-sesiune ~25 min.**

## Priority 4: Daniel solo action items

- Avocat barter outreach (open-ended)
- Firebase Console Auth setup (30-45 min hands-on)
- Database rules publish post-Auth (15 min hands-on)

## Priority 5: CC Opus vault cleanup (post Priority 3 LOCKED)

- Founding Members + Discord references sweep (`01-vision/PRODUCT_STRATEGY_SPEC_v1.md §1.4` + `06-sessions-log/HANDOVER_GLOBAL §29.6.3` + ADR Q-0533 mark DEPRECATED)

**~30 min CC Opus task standalone.**

## Priority 6: Sprint 4.x cluster implementation (post 5 ADR LOCKED + Phase B LOCKED)

Per §36.15 + handover precedent §5.3 — Suflet Andura + Self-Correction + Chat C Implementation Cluster:
- RIR Matrix + 4 Moduri UI + Bias Detection + T1+ + Cascade Defense + Outlier Filter
- Realtime Per-Set §36.28 + Profile Validation §36.34 + Goal Shift §36.35
- **Smart-Routing §36.37 + Pain Button §36.38 + Composite Signal Layer §36.41**
- Schema Extension §36.36

**~16-22h Opus comprehensive (~3-4h wall-clock).** Single batch acoperă 5 ADR-uri post-LOCK + 14 LOCKED noi chat C.

---

# §6 SESSION-LOCK ENTRY (cronologic appendat la §36 EOF HANDOVER_GLOBAL)

**Sesiune 2026-05-02 Chat C SELF-CORRECTION EXTENSION LOCK** (chat strategic post Self-Correction ingest precedent — discutat 6 features cluster: Aparat Ocupat/Lipsă smart-routing dependent force_demand + Pain/Discomfort Button 3 funcțional anti-paternalism cu CDL override + Hormonal Estimation RESPINS V1 reframed Performance State Inference observable + Composite Signal Layer Recovery State Adjustment 3/3 simultaneous + Cycle Tracking RESPINS V1 + Onboarding T0/T2 wording functional + Pricing deferred pre-launch + Beta cohorts 3-tier 50 users). 14 decizii LOCKED noi (Schema Extension §36.36 + Smart-Routing §36.37 + Pain Button §36.38 + Yellow Flag -20% lock §36.39 + Hormonal Estimation RESPINS §36.40 + Composite Signal Layer §36.41 + ADR review process §36.42 + Cycle Tracking RESPINS §36.43 + T0 hard minimum §36.44 + T2 wording funcțional §36.45 + Pricing deferred §36.46 + Beta cohorts §36.47 + Per-set normalization §36.48 + Dual-threshold + Recovery -20% §36.49) + ~12 push-back-uri productive Claude integrate (Schema gap force_demand vs tier, Forced Skip paternalism mascat 3-button override, Diagnostic-flavored wording → funcțional, Hormonal estimation F6 violation + validity zero, 50% scor cumulative arbitrary → 3/3 thresholds, Recovery duration vague → 1/2/4/+1 lifecycle, Buton inconfort signal subjectiv → exclude Composite, Volume total false positive → per-set normalization, 10% threshold solo Maria false positive → dual-threshold absolute, ADR LOCK chat sumar teatru → file-by-file review, T2 jargon "Strategic" Gigel fail → wording funcțional, Cycle tracking F6 violation → Composite coverage). Decizii cumulative pre-launch V1 = **45** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C). 5 ADR drafts updated (MODE_DETECTION extends T2 wording funcțional EXT-7; BIAS_DETECTION extends Pain override CDL EXT-1; CASCADE_DEFENSE extends Composite Signal Layer D budget EXT-2; OUTLIER_FILTER + RIR_MATRIX untouched). 3 ADR NEW DRAFT defer creation Sprint 4.x cluster batch (COMPOSITE_SIGNAL_LAYER + PAIN_DISCOMFORT_BUTTON + SMART_ROUTING_EQUIPMENT). Schema impact future Sprint 4.x: exercise library equipment metadata + onboarding T0 fallback synthetic + Card 3 butoane noi (Aparat ocupat/lipsă/Disconfort) + Composite Signal module new src/engine/compositeSignal.js. ZERO sesiuni chat strategic STRATEGIC rămase pre-launch V1 — REMAINING doar tactical (ADR review + Phase B wording + Discord/Founding 25min). 1110/1110 unchanged (vault docs only). Bandwidth Daniel ~18% triggered handover preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **45 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + Self-Correction Architecture LOCKED + Chat C Smart-Routing/Pain/Composite LOCKED + 5 ADR drafts pending Daniel review pre-LOCK + 3 NEW ADR drafts pending Sprint 4.x batch creation.

---

🦫 **Handover ready ingest. CC Opus rulează ingest direct (NU pre-condition multiple ca SUFLET ANDURA dual). 14 decizii LOCKED noi Chat C + 0 amendments inline (toate decizii sunt subsections noi §36.36-§36.49) + 3 ADR drafts updated EXT-7/EXT-1/EXT-2 + 3 NEW ADR drafts defer Sprint 4.x. Cumulative pre-launch V1 = 45 LOCKED. ZERO sesiuni chat strategic STRATEGIC rămase — remaining doar tactical (ADR review 1.5h + Phase B 45min + Discord/Founding 25min cumulative ~3h). Sprint 4.x cluster scope refined: Suflet Andura + Self-Correction + Chat C = ~18-25h Opus comprehensive.**
