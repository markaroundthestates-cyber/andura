---
name: HANDOVER_INPUT_2026-05-02_self_correction
description: Sesiune chat strategic 2026-05-02 — audit vault SSOT post halucinație suspicion (verificare clean) + 8 decizii LOCKED noi pe Self-Correction Architecture & Realtime Recalibration. Cumulative pre-launch V1 = 31 LOCKED. PRECONDIȚIE INGEST: Procesul_de_gandire_complet.md must be ingested FIRST (separate prior ingest run) — închide P1 BLOCKER existent SUFLET_ANDURA §4.
type: handover-input
date: 2026-05-02 (sesiune post-SUFLET ANDURA ingest)
status: COMPLETE_READY_FOR_INGEST
precondition: Procesul_de_gandire_complet.md ingested first (closes P1 BLOCKER from prior ingest)
---

# §0 STATUS CHAT NOU — INSTRUCȚIUNE PRIMA

**Context anterior:** Chat anterior procesat handover SUFLET ANDURA ingest 2026-05-02 (consumed `_archive/2026-05/53_*`). 11 LOCKED §36.16-§36.26 integrate. SUFLET_ANDURA SSOT skeleton create cu STUB §4 pending Daniel upload `Procesul_de_gandire_complet.md`. 5 ADR drafts pending review.

**Sesiunea curentă:** Daniel a deschis chat strategic nou cu suspicion că Procesul_de_gandire_complet.md (sursa filozofiei 12k cuvinte) ar fi halucinat. Audit complet vault SSOT + verificare directă document sursă livrat verdict: **NU halucinat — document factually coherent + math fizic corect + Daniel-isms verified + structura 15 patterns + 10 funcții F1-F10 + 8 linguistic L1-L8 confirmată verbatim**.

**Discuție strategic continued post-audit pe self-correction architecture:** cum recalibrează engine realtime per-set + cum se auto-corectează când profile inițial declarat e greșit + edge cases nepatinate.

**Sesiunea a livrat:**
1. Audit vault SSOT clean (zero info leak, zero halucinație critică în vault, chat-ul "halucinat" anterior era de fapt rigid corect — refuz fabricare 12k cuvinte)
2. 8 decizii LOCKED noi (Self-Correction Architecture + Realtime Recalibration + Profile Validation Layer + Goal Shift handler)
3. Cumulative pre-launch V1 = 31 LOCKED (12 Acasă §36.1-§36.15 + 11 SUFLET ANDURA §36.16-§36.26 + 8 Self-Correction §36.28-§36.35)

---

# §1 PRECONDIȚIE INGEST OBLIGATORIE

**STOP DACĂ NU E ÎNDEPLINIT:**

Înainte de a procesa acest handover, CC Opus trebuie să verifice că P1 BLOCKER din ingest-ul precedent SUFLET ANDURA e închis:

```bash
test -f 01-vision/SUFLET_ANDURA.md
grep -q "PENDING.*Daniel uploads" 01-vision/SUFLET_ANDURA.md
# Dacă match găsit → STUB §4 încă deschis → P1 BLOCKER deschis
```

**Dacă STUB §4 încă marcat PENDING:**

1. STOP — NU procesa acest handover
2. Verifică dacă `📥_inbox/Procesul_de_gandire_complet.md` există
3. Dacă DA → procesează acel ingest PRIMUL (append integral 13.2k cuvinte la SUFLET_ANDURA §4 → archive → close P1)
4. ABIA APOI continuă cu acest handover Self-Correction Architecture

**Dacă STUB §4 deja completat (P1 BLOCKER închis):**

Procedează direct cu acest handover normal.

---

# §2 8 DECIZII LOCKED NOI — SESIUNEA 2026-05-02 SELF-CORRECTION

## §2.1 Realtime Per-Set Silent Recalibration LOCKED V1 (extends §36.17)

**Decizie:** Engine recalibrează plan post fiecare set finalizat în timp real. Update UI pe cardul next set 100% silent — ZERO prompt, modal sau animație care să întrerupă flow Executor mode.

**Mecanică tehnică:**
- User tap "Set terminat" cu reps/kg actual
- Engine evaluează signal: matches plan / drop-off / spike
- Engine updateaza valorile pe cartonașul next set INSTANT (`kg` și/sau `reps` schimbă pe ecran)
- ZERO interruption — user vede direct noua recomandare pe ecran
- Recalibrare scope = doar dimensiuni active session curent (next set kg/reps), NU re-rank ipoteze F7 (alea se rank la session start sau outlier major)

**Exemplu concret Bench Press:**
- Plan inițial: 4 seturi × 50kg × 10 reps
- Set 1 + 2: 50×10 (normal) → engine confidence HIGH, baseline neschimbat
- Set 3: drop la 8 reps → engine ajustează silent set 4 la 50kg×8 sau 47.5kg×10
- User vede direct nouă recomandare pe card → execută

**Performance budget:** Layer D invariants checks pe fiecare "Set terminat" tap ≤ 50ms acceptable.

**Cross-refs:** §36.17 mod Executor + §36.24 outlier filter + §36.25 Cascade Defense Layer D + ADR_MODE_DETECTION_UI_v1 (DRAFT).

## §2.2 §36.17 Mid-Session Silent UI Update Clarification LOCKED V1

**Decizie:** Clarificare formal că §36.17 mod Executor implică recalibrare silent. Adăugare ca §AMENDMENT inline în §36.17.

**Wording amendment:**

> **§AMENDMENT 2026-05-02 SELF-CORRECTION:** Mid-session recalibrare valori next set = 100% silent UI update pe card, ZERO prompt/modal/animație. Engine adaptează tactic session curent fără a întrerupe flow Executor. Recalibrarea se aplică doar dimensiunilor active session curent (kg/reps next set). Outlier prompt §36.24 = post-session-end ONLY, NU mid-set.

**Cross-refs:** §36.17 + §36.24 + ADR_MODE_DETECTION_UI_v1 (DRAFT) + ADR_OUTLIER_FILTER_v1 (DRAFT).

## §2.3 §36.26 Streak Counter Same Direction + Reset Clarification LOCKED V1

**Decizie:** Clarificare formal că §36.26 baseline shift trigger = 3 sesiuni consecutive **în aceeași direcție** (only upward sau only downward), NU 3 oricum. Streak counter resetează la prima revenire la baseline normal.

**Mecanică:**
- Sesiunea 1: outlier upward (e.g. 55kg × 11 vs plan 50×10) → counter = 1/3 same direction
- Sesiunea 2: revenire la baseline normal (50×10) → **counter RESET la 0**
- Sesiunea 3: outlier upward din nou → counter = 1/3 (NOT 2/3)
- Pentru baseline shift: 3 sesiuni consecutive same direction NEÎNTRERUPTE

**Exemplu Marius Bench Press validation shift baseline 50→52.5kg:**
- Trebuie: Sesiunea 1 (55×11) + Sesiunea 2 (55×11) + Sesiunea 3 (55×11) la rând
- Orice intermediate normal session = reset counter

**Wording amendment §36.26:**

> **§AMENDMENT 2026-05-02 SELF-CORRECTION:** Streak counter logic clarificat: 3 sesiuni consecutive same exercise = "neîntreruptă în aceeași direcție". Outlier upward la sesiunea 1 + normal la sesiunea 2 = streak reset la 0. Outlier upward la sesiunea 3 = counter restart la 1/3. Baseline shift requires 3 consecutive outlier sessions same exercise same direction.

**Cross-refs:** §36.26 + §36.24 + ADR_OUTLIER_FILTER_v1 (DRAFT — adăugare streak counter spec + Marius example codified).

## §2.4 God Mode / Advanced Overrides RESPINS V1 LOCKED

**Decizie:** Eliminate complet din scope V1 — feature "God Mode" cu user manual override pentru Volume Tolerance / Muscle Fiber Profile / Baseline Learning Speed.

**Rationale:**
- Încalcă SUFLET F6 No-Inference + ADR Pattern 14 (engine NU presupune cauze user-declared fără verificare empirică)
- Self-assessment user notoriu wrong (Daniel zice "fast-twitch dominant" bazat pe ce? Test 1RM real sau perception?)
- Maria 65 NU bifează "fast-twitch profile" — feature pentru power users only = scope creep beachhead
- Gigel test fail — "Volume Tolerance" + "Muscle Fiber Profile" = jargon medical
- Engine adaptă natural prin recalibrare per-set (§2.1) + 3-consecutive baseline shift (§36.26) — feedback loop already exists

**Alternative path V1:** Daniel/Marius pot oricum schimba greutatea manual la execuție → engine adaptează natural via §2.1 silent recalibrare + §36.26 streak counter.

**V2 Reconsider:** post-beta data dacă Power User tier cohort confirmă demand real.

**Cross-refs:** SUFLET F6 No-Inference + ADR Pattern 14 + §36.21 T1+ Completion-Based + §36.22 T1+ Câmpuri Minim Gigel-Validated.

## §2.5 Explainability Module — Lazy Generation On-Demand LOCKED V1

**Decizie:** Adăugare modul Explainability "De ce?" pentru transparență decizională engine. Generare diagnostic string LAZY (on-demand la tap), NU în fundal pentru fiecare recomandare.

**Mecanică:**
- Card exercițiu cu buton secundar `[De ce?]`
- User tap → engine rulează funcția de generare diagnostic ÎN MOMENTUL APĂSĂRII (`onClick`)
- Engine citește: state curent + CDL recent + istoric baseline + applied rules
- Output: text scurt explicativ ce arată matematica din spate

**Exemplu output:**

> **De ce facem 52.5 kg × 8-10 reps astăzi?**
> - Ritmul tău de progresie: faza Intermediate
> - Ultimul tău set sesiunea anterioară: 50 kg × 11 reps (validated success)
> - 3/3 sesiuni consecutive progres upward → declanșat baseline shift
> - Sanity bound +5% săpt aplicat (Intermediate phase)

**Performance budget:**
- ZERO latency la deschidere ecran antrenament (lazy = NU pre-generate)
- Generare on-demand acceptable ≤ 100ms (citire CDL + state + format string)
- Memory minim, battery Android conservator

**Wording strings sensibile:** Phase B mini-sesiune Daniel-validated (NU bulk Sonnet auto-generate).

**Cross-refs:** §36.17 mod Curios+Strategic + ADR_MODE_DETECTION_UI_v1 (DRAFT — extends cu Explainability spec) + ADR Pattern 14 (engine reasoning transparent observable, NU inferred causes).

## §2.6 Time-Constrained Routine Adaptive Per Profile LOCKED V1

**Decizie:** Single time modifier feature, dar UI options adaptive per profile session length. ZERO biological state inference (NU "obosit", "dormit prost", "febră musculară" — pure time constraint factual).

**Mecanică UI:**

**A. Profil Marius / Strategic (Template-uri 60min):**
- Buton `[25 min]` Extreme Crunch
- Buton `[45 min]` Express Session

**B. Profil Maria / Longevitate (Template-uri 30-40min):**
- NU vede butoane 25/45 min (Gigel test fail — confuz pentru Maria 65)
- Folosește fluxul nativ `[Skip exercițiu]` per card mișcare dacă criză timp

**Algoritm Modul 25min Extreme Crunch (Marius):**
1. Filtrare: elimină complet exercițiile marcate `Tier 2` (izolare/accesorii: flexii biceps, extensii triceps, ridicări laterale)
2. Limitare volum Tier 1 compounds: dacă în program 4 seturi → reduce automat la max 2-3 seturi efort real
3. Rezultat: 2-3 mișcări mari executate rapid, conservând stimulul neuromuscular principal în 25 min

**Algoritm Modul 45min Express Session (Marius):**
1. Conservare Tier 1 compounds: rămân intacte volume + intensitate
2. Comprimare Tier 2: convertite automat în Supersets (A/B pairing) sau redus la 1 set efort maxim (RIR 0)
3. Rezultat: tot volume programat bifat, salvare timp prin elimination timpilor morți între accesorii

**Filozofie:**
- ZERO presupuneri despre DE CE user se grăbește (aliniat ADR Pattern 14)
- Pure utility tool — permite să nu sară peste antrenament total
- Exercise library trebuie să aibă parametru `tier` per exercițiu (Tier 1 = compound bază, Tier 2 = accesoriu/izolare)

**Schema impact exercise library:**
- Add field `tier: number` (1 | 2) la fiecare exercițiu
- Migration runner pentru exerciții existente (Daniel review categorization)

**Cross-refs:** §36.20 Catastrofizare SCRAP V1 + ADR Pattern 14 No-Inference + §36.12 Library Extension HARD BLOCKER (necesită field `tier` adăugat la schema).

## §2.7 Profile Validation Layer (Self-Correction Architectural) LOCKED V1

**Decizie:** Engine detectează drift comportamental față de profile declarat după 8 sesiuni completion-based + propune mode shift cu user consent. Mecanism deterministic, ZERO LLM runtime.

**Mecanică:**

### Trigger
- Audit comportamental rulează automat la **8 sesiuni complete finalizate** post T1+ onboarding (aliniat §36.21 spirit completion-based, NU calendar)
- Pentru frequency reală: Maria 3×/săpt → ~3 săpt; Marius 4-5×/săpt → ~2 săpt

### Calcul de Drift (Math-Only, NU LLM)
Engine compară 3 metrici cheie de interacțiune cu așteptările profilului declarat:

| Metrică observată | Așteptare Profil Strategic | Realitate user (exemplu drift) |
|-------------------|----------------------------|--------------------------------|
| Rata apăsare buton "De ce?" | ≥ 30% din exerciții | < 5% (a ignorat explicațiile) |
| Timp pe ecran sumar | ≥ 45 secunde | < 15s consecutiv toate 8 sesiuni |
| Selecție rep ranges | Testează mid/upper bounds | Mereu lower bound |

### Threshold Strict Anti-False-Positive (3/3 Simultaneous)
**Promptul de mode shift se declanșează DOAR DACĂ toate 3 metrici sunt divergente simultan**, NU 1 sau 2 din 3.

```
DECLANȘARE = (rate_de_ce < 5%)
            AND (timp_sumar < 15s în toate 8 sesiuni)
            AND (selecție_lower_bound mereu)
```

**Rationale:** Marius IQ 139 NU tap "De ce?" = înțelege deja, NU înseamnă Executor. Marius rapid pe sumar = grabă, NU înseamnă Executor. 2 din 3 = ambiguous → NU prompt → trust preserved.

### Prompt UI (Phase B Wording Pending)
**Placeholder logic LOCKED V1 în cod** (Phase B mini-sesiune Daniel-validated pentru text final):

```javascript
const PROMPT_PROFILE_VALIDATION_PLACEHOLDER = {
  id: "prompt_profile_validation_mismatch",
  text: "[PHASE_B_WORDING_PENDING — fallback: Tiparele tale arată un stil mai direct. Schimbi la Executor?]",
  buttons: {
    confirm: "Da, schimbă",
    cancel: "Nu, păstrez [current_profile]"
  },
  status: "PHASE_B_LOCK_REQUIRED — DO NOT SHIP TO PRODUCTION"
};
```

### Production Shipping Gate
**Pre-launch check OBLIGATORIU:**

> Este strict interzisă compilarea build-ului de producție dacă în baza de cod există flagul `PHASE_B_LOCK_REQUIRED` sau string-ul `PHASE_B_WORDING_PENDING`. Build script verifică grep, fail dacă match.

### Cooldown
- User confirmă [Da, schimbă] → engine re-config UI (ascunde explicații auto, simplifică ecrane progresie)
- User refuză [Nu, păstrez] → counter reset, NU mai întreabă timp de **alte 24 sesiuni** (anti-friction nag)

**Cross-refs:** §36.17 mod detection (extends cu validation layer post-onboarding) + §36.21 T1+ Completion-Based + §27 Phase B Wording Strategy + ADR_MODE_DETECTION_UI_v1 (DRAFT — adăugare Profile Validation Layer spec).

## §2.8 User-Triggered Reset (Fallback Self-Correction) LOCKED V1

**Decizie:** Buton manual "Resetează profil & recalibrează" în Setări → Profil & Date pentru users care simt că engine NU i-a citit corect din prima săpt.

**Mecanică reset:**

**Se șterg:**
- Date interacțiune (rata "De ce?" tap, timp pe sumar, selecții rep ranges)
- Istoric drift comportamental
- Profile declarat anterior

**Se păstrează intacte (CRITICAL):**
- Istoric forță (greutăți, repetiții, PR records)
- Streak counter §36.26 (3 consecutive same direction)
- CDL session logs

**Re-init:**
- Deschide chestionarul simplificat T1+ (3 câmpuri minim per §36.22)
- Engine BASELINE state pentru următoarele 4 sesiuni (re-calibration phase)

**Rationale:** Reset profile = strict UI/UX & personalization shift. NU afectează starea fizică reală. Marius cu streak 2/3 spre baseline shift NU pierde progres fizic real.

**Cross-refs:** §36.21 T1+ Completion-Based + §36.22 T1+ Câmpuri Minim + §36.26 Streak Counter Preserve.

## §2.9 Goal Shift Event Handler LOCKED V1

**Decizie:** Schimbarea obiectivului (Estetică/Hipertrofie ↔ Forță/Performanță) = Eveniment de Schimbare Explicită declanșat de user din Setări. NU auto-detect silent. Engine aplică Modificatori de Template + interval calibration phase.

**Trigger:** User tap "Schimbă obiectiv" în Setări → Profil & Date

**Modificatori de Template:**

| Parametru | Profil Estetică (Hipertrofie) | Profil Forță (Performanță) |
|-----------|-------------------------------|----------------------------|
| Rep Ranges (Tier 1) | 8-12 repetiții | 4-6 repetiții |
| Intensitate (Load) | RIR 2 | RIR 1-0 |
| Timp odihnă | 90-120 secunde | 180-300 secunde |

**Mecanica de calcul:**

### Conservare date fizice
- Istoric forță = INTACT
- PR records = INTACT
- CDL session logs = INTACT
- **Streak counter §36.26 = RESET la 0** (context fizic schimbat = signal nou independent)

### Conversia baseline (Starting Interval, NU single point)
**Anti-pattern (RESPINS):** single formula 1RM (Epley/Brzycki) → cifră fixă (e.g. 57.5kg × 5 reps).

**Aliniat SUFLET F1 Triangulation:**
- Engine generează **interval larg** de adaptare (e.g. 52.5-57.5kg × 5 reps)
- Mesaj UI Modul Curios: *"Estimat: 52.5 - 57.5 kg × 5 reps. Primele 2 sesiuni după schimbarea obiectivului reprezintă o fază de calibrare."*
- §36.26 streak counter rules apply normal post-shift (3 consecutive same direction validates real baseline)

### Re-generarea blocului curent
La return ecran antrenament → user vede direct noile numere aplicate adaptate noului obiectiv.

**Filozofie aliniată:**
- Goal Shift = user explicit decision (autonomy 100%)
- Conversion = STARTING POINT cu uncertainty interval, NU baseline LOCKED
- Phase de calibrare 2 sesiuni = engine collects empirical data on actual user execution
- Bayesian update post-calibration = baseline real

**Cross-refs:** SUFLET F1 Triangulation + §36.26 Streak Counter + ADR_OUTLIER_FILTER_v1 (DRAFT — extends cu Goal Shift event handler) + Phase B wording pentru mesaj Modul Curios.

---

# §3 ROUTING SSOT IMPACT

## §3.1 Files create/update

- **NU files create new.** Toate decizii ăstea = additive la SSOT existing.

## §3.2 Sections amend in-place HANDOVER_GLOBAL

| Section | Amendment | Type |
|---------|-----------|------|
| `§36.17 4 Moduri UI Detection` | §AMENDMENT 2026-05-02 SELF-CORRECTION — silent mid-session UI update spec | Inline block |
| `§36.24 Outlier Filter` | §AMENDMENT 2026-05-02 SELF-CORRECTION — outlier prompt post-session-end ONLY (NU mid-set) | Inline block |
| `§36.26 Outlier Confirmed ≠ Baseline` | §AMENDMENT 2026-05-02 SELF-CORRECTION — streak counter same direction + reset rule clarification + Marius Bench Press example | Inline block |
| `§36 (NEW subsections)` | §36.28-§36.35 — 8 LOCKED noi (subsections per §2 above) | Append additive |
| `§36 EOF Session-Lock entry` | "Sesiune 2026-05-02 SELF-CORRECTION LOCK" cronological entry summarizing 8 LOCKED + cumulative 31 LOCKED | Append cronological |

## §3.3 ADR drafts updates (extends existing DRAFT files)

| ADR file | Update |
|----------|--------|
| `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) | Adăugare specs: silent mid-session UI update + Explainability Lazy Generation + Profile Validation Layer 3/3 simultaneous + PROMPT_PROFILE_VALIDATION_PLACEHOLDER constant + production shipping gate |
| `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT) | Adăugare specs: streak counter same direction + reset condition + Marius Bench Press example codified + Goal Shift event handler conversion interval |
| `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) | Cross-ref add la realtime per-set silent recalibrare (§2.1) |
| `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT) | NO update — out of scope acest handover |
| `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (DRAFT) | Cross-ref add la realtime Layer D check budget ≤50ms acceptable per "Set terminat" tap |

## §3.4 Schema impact (cod source future Sprint 4.x)

- **Exercise library schema:** add field `tier: number` (1 = compound bază, 2 = accesoriu/izolare). Migration runner pentru exerciții existente.
- **Setări UI:** add buton "Schimbă obiectiv" + buton "Resetează profil & recalibrează" (§2.8 + §2.9).
- **Build script:** add pre-production gate verificând `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING` strings absent (§2.7).

## §3.5 Production shipping gate critical

> **STRICT INTERZIS COMPILAREA BUILD PRODUCȚIE** dacă în code base există:
> - String `PHASE_B_LOCK_REQUIRED`
> - String `PHASE_B_WORDING_PENDING`
>
> Build script (CI/CD pre-deploy) verifică grep, fail build dacă match. Forță Phase B mini-sesiune Daniel-validated pentru toate placeholderii înainte launch.

---

# §4 ALIGNMENT QUESTIONS — CHAT STRATEGIC NOU POST-INGEST

**Pass criteria:** ≥10/14 răspunsuri cu citation **§X file.md** / **ADR Y** verificabile.

**Refuz vag = STOP.** Răspunsuri tip "cred că..." / "din ce-mi amintesc..." = FAIL. Retry `project_knowledge_search` sau regenerare handover.

**Source ingest:** acest file consumed + `06-sessions-log/HANDOVER_GLOBAL §36.28-§36.35` + 5 ADR drafts updated.

---

## §4.1 Realtime Per-Set Recalibration

**Q1.** Când user finalizează set 3 cu drop-off (8 reps în loc de 10), ce face engine? Update e silent sau prompt? Latency budget?

Citation: `§36.28` SAU `ADR_MODE_DETECTION_UI_v1.md`. Răspuns: Engine actualizează valorile pe cartonașul next set (kg/reps) INSTANT, ZERO prompt/modal/animație. Latency budget Layer D check ≤ 50ms acceptable. User vede direct nouă recomandare → execută fără interruption flow.

**Q2.** După set 4 outlier upward (55kg × 11 vs plan 50×10), engine prompt mid-set sau post-session? De ce?

Citation: `§36.17 §AMENDMENT 2026-05-02 SELF-CORRECTION` + `§36.24`. Răspuns: Post-session-end ONLY, NU mid-set. Mid-set prompt = friction major Executor mode. Engine înregistrează silent valorile, prompt confirmation §36.24 wording standard ("Sesiunea de astăzi pare diferită...") la tap "Termină sesiunea".

---

## §4.2 §36.26 Streak Counter Same Direction

**Q3.** Marius face Bench Press 3 sesiuni consecutive: (1) 55kg×11, (2) 50kg×10 normal, (3) 55kg×11. Engine declanșează baseline shift la sesiunea 4? De ce?

Citation: `§36.26 §AMENDMENT 2026-05-02 SELF-CORRECTION`. Răspuns: NU. Sesiunea 2 (revenire normal) resetează counter la 0. Sesiunea 3 outlier upward = counter restart la 1/3. Pentru baseline shift Marius trebuie să livreze 55kg×11 la 3 sesiuni consecutive NEÎNTRERUPTE same direction.

**Q4.** Streak counter este preserve sau reset la User-Triggered Profile Reset (§36.34)? La Goal Shift (§36.35)?

Citation: `§36.34` + `§36.35`. Răspuns: Profile Reset = streak **PRESERVE** (UI/UX schimbare, fizicul intact, Marius NU pierde progres real). Goal Shift = streak **RESET la 0** (context fizic schimbat — Estetică→Forță = rep ranges + intensity diferite, signal nou independent).

---

## §4.3 God Mode RESPINS

**Q5.** De ce God Mode / Advanced Overrides cu Volume Tolerance / Muscle Fiber Profile / Baseline Learning Speed e RESPINS V1?

Citation: `§36.31` + SUFLET F6 No-Inference + ADR Pattern 14. Răspuns: Încalcă SUFLET F6 (engine NU presupune cauze user-declared fără verificare empirică). Self-assessment user notoriu wrong (fast-twitch dominant bazat pe ce?). Maria NU bifează — feature power user only = scope creep beachhead Maria/Gigica/Marius. Gigel test fail (jargon medical). V2 reconsider post-beta dacă Power User cohort confirmă demand.

**Q6.** Cum face Daniel/Marius ajustări agresive fără God Mode?

Citation: `§36.31` + `§36.28`. Răspuns: Schimbă greutatea manual la execuție per set → engine adaptează natural via §2.1 silent recalibrare per-set + §36.26 streak counter (3 consecutive same direction → baseline shift). Feedback loop natural existent.

---

## §4.4 Explainability Lazy Generation

**Q7.** Cum se generează diagnostic string pentru "De ce?"? În fundal sau on-demand? De ce?

Citation: `§36.32` + ADR_MODE_DETECTION_UI_v1. Răspuns: LAZY on-demand la `onClick` butonului `[De ce?]`, NU pre-generate în fundal. Performance budget: zero latency la deschidere ecran antrenament + ≤100ms generare on-demand. Memory minim, battery Android conservator.

**Q8.** Engine output diagnostic include ce 4 elemente?

Citation: `§36.32`. Răspuns: (1) Faza progresie (Newbie/Intermediate/Advanced), (2) Last set sesiunea anterioară (validated success/outlier), (3) Streak counter status (X/3 consecutive same direction), (4) Sanity bound aplicat per fază. Wording strings sensibile = Phase B mini-sesiune.

---

## §4.5 Time-Constrained Adaptive

**Q9.** Maria 65 vede butoanele [25 min] / [45 min] pe ecranul start? De ce sau de ce nu? Cum gestionează ea criză timp?

Citation: `§36.33`. Răspuns: NU vede. Template-uri Maria deja 30-40 min — 25min ar fi confuz Gigel test fail. Folosește fluxul nativ `[Skip exercițiu]` per card mișcare dacă criză timp.

**Q10.** Ce face algoritm Modul 25min Extreme Crunch (Marius)? Ce face Modul 45min Express Session?

Citation: `§36.33`. Răspuns: 25min = (1) elimină complet Tier 2 izolare/accesorii, (2) reduce Tier 1 compounds 4 seturi → 2-3 max. 45min = (1) conservă Tier 1 intacte, (2) Tier 2 convertite Supersets A/B sau redus 1 set RIR 0. ZERO inferență de ce user grăbit.

---

## §4.6 Profile Validation Layer

**Q11.** După câte sesiuni se declanșează auditul drift comportamental? De ce 8 NU 12?

Citation: `§36.34`. Răspuns: 8 sesiuni complete finalizate post T1+ (NU 12). Aliniat §36.21 spirit completion-based NU calendar. Maria 3×/săpt → ~3 săpt; Marius 4-5×/săpt → ~2 săpt. 12 prea mult — Marius 2.5 săpt OK dar frequency 2×/săpt user → 6 săpt friction prea mare.

**Q12.** Care e threshold pentru declanșare prompt mode shift? 1 din 3 metrici? 2 din 3? 3 din 3?

Citation: `§36.34`. Răspuns: **3/3 simultaneous divergence** (NU 1 sau 2). Pragul 60% scor divergență. Marius IQ 139 NU tap "De ce?" + rapid pe sumar = ambiguous (2/3) → NU prompt. Filter strict anti-false-positive — protejează users inteligenți rapizi de mode shift greșit.

---

## §4.7 Goal Shift Event Handler

**Q13.** Marius schimbă goal Estetică → Forță. Baseline 50kg × 10 reps Bench. Ce arată engine?

Citation: `§36.35`. Răspuns: Engine NU dă cifră fixă (e.g. 57.5kg × 5 reps via single 1RM formula = inferență). Generează **interval** (e.g. 52.5-57.5kg × 5 reps) + mesaj Modul Curios: "Estimat: 52.5 - 57.5 kg × 5 reps. Primele 2 sesiuni după schimbarea obiectivului reprezintă o fază de calibrare." Streak counter RESET la 0. §36.26 rules apply normal post-shift.

---

## §4.8 Bonus integration question

**Q14.** Care e cumulative pre-launch V1 LOCKED count post acest ingest? Câte chat-uri strategice rămase?

Citation: `§36 EOF session-lock entry SELF-CORRECTION` + `§36.15`. Răspuns: **31 LOCKED** = 12 (Acasă §36.1-§36.15) + 11 (SUFLET ANDURA §36.16-§36.26) + 8 (Self-Correction §36.28-§36.35). **ZERO sesiuni chat strategic rămase pre-launch V1.** Restul = pure execution Sprint 4.x.

---

## §4.9 Pass / Fail Criteria

| Score | Status | Acțiune |
|-------|--------|---------|
| ≥12/14 | EXCELLENT | Procede direct la Batch C scope decision |
| 10-11/14 | PASS | Confirmă alignment + procede |
| 8-9/14 | PASS minimum | Spot-check 2-3 răspunsuri vagi cu retry citation |
| <8/14 | FAIL | STOP. Retry `project_knowledge_search` pe HANDOVER_GLOBAL §36 + ADR drafts. Dacă <8 din nou → regenerare handover input cu fresh chat strategic. |

---

# §5 ACTION ITEMS

## §5.1 Imediat post-ingest (Daniel)

1. **Sync Project Knowledge GitHub** după CC Opus push origin/main
2. **Open chat Claude nou strategic** + paste alignment questions §4 above
3. **Verify ≥10/14 pass** cu citation explicit — dacă FAIL retry sau regenerează
4. **Daniel review 5 ADR drafts** pre-LOCK (RIR_MATRIX, MODE_DETECTION, BIAS_DETECTION, OUTLIER_FILTER, CASCADE_DEFENSE) — implementation Sprint 4.x cluster blocked pe LOCK status

## §5.2 Carry-over from prior ingests (still pending)

- **Founding Members + Discord references sweep** — `01-vision/PRODUCT_STRATEGY_SPEC_v1.md §1.4` + `06-sessions-log/HANDOVER_GLOBAL §29.6.3` + ADR Q-0533 mark DEPRECATED
- **Daniel manual Firebase Console steps** (Auth dogfood) — per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02
- **Phase B engine wording mini-sesiune ad-hoc** — per §36.11 strategy: ~33 strings remaining + 4 wording-uri SUFLET ANDURA preview deja LOCKED + acum 1 wording NEW PROMPT_PROFILE_VALIDATION_PLACEHOLDER (§36.34) + 1 wording NEW Goal Shift mesaj Modul Curios (§36.35)

## §5.3 Batch C scope decision (NEXT STRATEGIC)

Per §36.15 + §36.34.4 + acest handover:

- **RECOMANDAT:** Suflet Andura + Self-Correction Implementation Cluster — RIR Matrix + 4 Moduri UI + Bias Detection + T1+ + Cascade Defense + Outlier Filter + **Realtime Per-Set + Profile Validation Layer + Goal Shift handler** — self-contained, codificabil direct, ~16-22h Opus comprehensive (~3-4h wall-clock). Single batch acoperă 5 ADR-uri post-LOCK + 8 LOCKED noi.
- **Alternativ:** T&B Faza 1+2 full dedicat (~10-15h Opus)
- **Alternativ:** Library Extension §36.12 + Imagini Pilot
- **Alternativ:** Features V1 cluster (F-NEW + MMI + Storage Full + Onboarding 4)

## §5.4 Beta-launch ASAP timeline

Per §36.13 LOCKED. **~7-10 zile calendar ready** dacă Daniel alergă serios cu reviews + decisions între batches. Caut activ avocat printre prieteni → barter Pro lifetime free pentru review legal.

---

# §6 SESSION-LOCK ENTRY (cronologic appendat la §36 EOF HANDOVER_GLOBAL)

**Sesiune 2026-05-02 SELF-CORRECTION LOCK** (chat strategic post audit vault SSOT clean — verificare halucinație suspicion proces de gândire 12k cuvinte = NU halucinat, document factually coherent + structura 15 patterns + 10 funcții F1-F10 + 8 linguistic L1-L8 verbatim + math fizic corect + Daniel-isms verified). 8 decizii LOCKED noi (Realtime Per-Set Silent Recalibration §36.28 + §36.17 mid-session silent UI clarification §36.29 + §36.26 streak counter same direction + reset clarification §36.30 + God Mode RESPINS V1 §36.31 + Explainability Module Lazy Generation §36.32 + Time-Constrained Adaptive Per Profile §36.33 + Profile Validation Layer 8 sesiuni 3/3 simultaneous threshold 60% §36.34 + Goal Shift Event Handler interval calibration phase §36.35) + 8 push-back-uri productive Claude integrate (mid-set vs post-session prompt timing, streak same direction reset, God Mode SUFLET breach detection, Lazy on-demand generation, Time-Constrained adaptive Maria vs Marius, 8 NU 12 sesiuni audit, 3/3 simultaneous NU 40% threshold, Goal Shift interval NU single 1RM formula). Decizii cumulative pre-launch V1 = **31** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION). 3 §AMENDMENT inline aplicate (§36.17 + §36.24 + §36.26). 5 ADR drafts updated (MODE_DETECTION extends Profile Validation + Explainability + silent UI; OUTLIER_FILTER extends streak counter + Goal Shift; RIR_MATRIX cross-ref realtime per-set; CASCADE_DEFENSE cross-ref Layer D budget ≤50ms; BIAS_DETECTION untouched). Schema impact future Sprint 4.x: exercise library `tier` field + Setări 2 butoane noi (Schimbă obiectiv / Resetează profil) + build script production gate `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING`. ZERO sesiuni chat strategic rămase pre-launch V1 (re-confirmed 3rd time). 1110/1110 unchanged (vault docs only). Bandwidth Daniel ~30% triggered handover preventiv. Status V1: 8/8 templates LOCKED + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers (1 partial fix shipped + 1 partial schema + 1 full) + **31 decizii LOCKED cumulative** + Beta-launch ASAP strategy + Suflet Andura translation map V1 LOCKED + Self-Correction Architecture LOCKED + 5 ADR drafts pending Daniel review pre-LOCK.

---

🦫 **Handover ready for ingest. PRECONDIȚIE: Procesul_de_gandire_complet.md ingested first (close P1 BLOCKER SUFLET_ANDURA §4) → THEN ingest acest handover. CC Opus rulează ambele secvențial. 8 decizii LOCKED noi Self-Correction Architecture + 3 amendments inline + 5 ADR drafts updates + alignment questions integrate §4. Cumulative pre-launch V1 = 31 LOCKED. ZERO sesiuni chat strategic rămase. Next strategic: Batch C scope decision (Suflet Andura + Self-Correction Implementation Cluster RECOMANDAT ~16-22h Opus comprehensive).**
