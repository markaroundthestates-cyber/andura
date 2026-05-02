# ADR — Mode Detection UI v1 (4 Moduri Pure Event Listeners)

**Status:** **DRAFT — pending Daniel review**
**Date:** 2026-05-02 (SUFLET ANDURA ingest)
**See also:** [[SUFLET_ANDURA]] §3 + HANDOVER_GLOBAL §36.17 + §22 F-NEW-4 Anti-RE banner + §29.5 UX Colateral + Sticky Swap Engine

---

## Context

Sufletul Andura (12k cuvinte filozofie sursă) descrie pattern-uri conversaționali de "modes" în care user-ul se angajează cu coach-ul (Executor / Curios / Strategic / Frustrat / Validation-Seeking). În chat conversational acestea se detectează prin language analysis (NLP). Andura V1 = app cu UI, NU chat — ZERO language input.

Engine V1 trebuie să detecteze moduri purely din **event listeners + flags state local** pe acțiuni UI deterministe.

## Decision

5 moduri detectate (4 + Validation-Seeking ca extension):

| Mod | Trigger UI | Engine Output |
|-----|-----------|---------------|
| **Executor** | Tap rapid "Set terminat" + skip mai departe (median delay <3s între tap-uri) | UI minimalist, cifre mari, ZERO explicații text |
| **Curios+Strategic** (comasat) | Tap "De ce?" / denumire exercițiu / grafic progresie | Expand detalii tehnice + raționament |
| **Frustrat Tehnic** | 3 retry consecutiv same set + Skip exercițiu | Sticky Swap Engine activate (înlocuire mișcare) |
| **Frustrat Viață** | 2+ skip-uri în aceeași săpt | Banner Anti-RE §22 F-NEW-4 (DEJA LOCKED): "Drumul continuă. Reluăm [ziua]." + buton "Folosesc varianta mea" |
| **Validation-Seeking** | Scroll repetat trend grafic + stagnation 7+ zile detected | Toast: "Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează." |

### Mecanică implementare V1

- **Pure event listeners + flags state local.** ZERO ML/NLP runtime.
- Reguli logice deterministe — fiecare mod are trigger condition observable (count + window).
- Mode flags persisted local pe sesiune curentă (NU cross-session — mode flags reset la sesiune nouă).
- **Mode hierarchy:** Frustrat Viață > Frustrat Tehnic > Validation-Seeking > Curios+Strategic > Executor (fallback default). Dacă multiple triggers active simultan → highest hierarchy wins.

### Wording locked

- Frustrat Tehnic: Sticky Swap Engine §29.5 wording (existing).
- Frustrat Viață: §22 F-NEW-4 banner LOCKED (existing).
- Validation-Seeking toast: NEW LOCKED 2026-05-02 SUFLET — "Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."
- Curios+Strategic: existing "De ce?" expand pattern (§29.5).
- Executor: NU wording (UI minimalist, cifre mari only).

## Consequences

### Positive

- Zero NLP/ML overhead. ADR 002 REST not SDK preserved (no runtime LLM).
- Deterministic = predictible + verifiable + reproducible. ZERO halucinație mode detection.
- Local-first: mode flags state local, NU cloud round-trip.

### Negative

- Mode hierarchy edge cases: user simultaneously Frustrat Tehnic (3 retry) + Frustrat Viață (2+ skip) → highest wins (Frustrat Viață). User pierde Sticky Swap activation pe sesiunea aceasta. Mitigation: persistent hint UI "Înlocuiește" rămâne visible, user poate trigger manual.
- "Curios" hard to differentiate de "Strategic" purely din taps. V1 comasate; V2 reconsider granularity.

### Risks

- Validation-Seeking toast trigger fragil: scroll repetat trend grafic = how many scrolls? Window? V1 conservative threshold (5+ scrolls în <30s + stagnation 7+ zile) — calibrare empirică post-launch.
- Frustrat Tehnic "3 retry" definition: same exact set (set N retry) sau trei seturi consecutive? V1: trei seturi same exercise consecutive cu skip exercițiu trigger.

## Test plan (deferred Daniel review)

- Unit per mode trigger (timing + count + window)
- Hierarchy tests (multiple modes simultaneously → highest wins)
- Edge: validation-seeking trigger fals positive când user verifică progres legitim (NU stagnation real)
- Cross-mode transitions (Executor → Frustrat Tehnic → Sticky Swap activate → continue Executor)

## Reconsideration triggers

1. User feedback: validation-seeking toast intruzziv (false positive frecvent).
2. Mode hierarchy tweaks based on real beta data.
3. V2 add: "Recovery Mode" (post-deload week) cu UI distinct.

---

## §EXTENSIONS 2026-05-02 SELF-CORRECTION (post Self-Correction handover ingest)

### EXT-1: Realtime Per-Set Silent UI Update (§36.28 + §36.29)

Mid-session recalibrare valori next set = **100% silent UI update pe card**, ZERO prompt/modal/animație. Engine adaptează tactic session curent fără a întrerupe flow Executor.

**Mecanică:**
- User tap "Set terminat" cu reps/kg actual
- Engine evaluează signal (matches plan / drop-off / spike)
- Engine updateaza `kg`/`reps` pe cartonașul next set INSTANT
- Recalibrare scope = doar dimensiuni active session curent (next set), NU re-rank ipoteze

**Performance budget:** Layer D invariants checks ≤ 50ms per "Set terminat" tap (cross-ref `ADR_CASCADE_DEFENSE_v1.md`).

**Outlier prompt §36.24 = post-session-end ONLY**, NU mid-set.

### EXT-2: Explainability Module — Lazy Generation On-Demand (§36.32)

Card exercițiu cu buton secundar `[De ce?]`. User tap → engine generează diagnostic string ÎN MOMENTUL APĂSĂRII (`onClick`), NU pre-generate în fundal.

**Engine output 4 elemente:**
1. Faza progresie (Newbie/Intermediate/Advanced)
2. Last set sesiunea anterioară (validated success/outlier)
3. Streak counter status (X/3 consecutive same direction)
4. Sanity bound aplicat per fază

**Performance budget:**
- ZERO latency la deschidere ecran antrenament (lazy = NU pre-generate)
- Generare on-demand acceptable ≤ 100ms

**Wording strings sensibile:** Phase B mini-sesiune Daniel-validated.

### EXT-3: Profile Validation Layer (§36.34) — 3/3 Simultaneous Threshold

**Trigger:** audit comportamental rulează automat la **8 sesiuni complete finalizate** post T1+ onboarding.

**Calcul de Drift (Math-Only, NU LLM)** — 3 metrici comparate cu așteptările profilului declarat (rata "De ce?" tap, timp sumar, selecție rep ranges).

**Threshold strict anti-false-positive 3/3 simultaneous:**

```
DECLANȘARE = (rate_de_ce < 5%)
            AND (timp_sumar < 15s în toate 8 sesiuni)
            AND (selecție_lower_bound mereu)
```

**Rationale:** Marius IQ 139 NU tap "De ce?" + rapid pe sumar = ambiguous (2/3) → NU prompt. Filter strict protejează users inteligenți rapizi de mode shift greșit.

### EXT-4: PROMPT_PROFILE_VALIDATION_PLACEHOLDER + Production Shipping Gate

Placeholder logic LOCKED V1 în cod (Phase B mini-sesiune Daniel-validated pentru text final):

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

**Production Shipping Gate (CI/CD pre-deploy):**

> Strict interzisă compilarea build-ului de producție dacă în baza de cod există flagul `PHASE_B_LOCK_REQUIRED` sau string-ul `PHASE_B_WORDING_PENDING`. Build script verifică grep, fail dacă match.

### EXT-5: Cooldown post Profile Validation prompt (§36.34)

- User confirmă [Da, schimbă] → engine re-config UI (ascunde explicații auto, simplifică ecrane progresie)
- User refuză [Nu, păstrez] → counter reset, NU mai întreabă timp de **alte 24 sesiuni** (anti-friction nag)

### EXT-6: User-Triggered Reset Fallback (§36.34)

Buton manual "Resetează profil & recalibrează" în Setări → Profil & Date.

**Se șterg:** date interacțiune (rata "De ce?" tap, timp sumar, selecții rep ranges) + istoric drift comportamental + profile declarat anterior.

**Se păstrează intacte (CRITICAL):** istoric forță + PR records + **streak counter §36.26 (PRESERVE)** + CDL session logs.

**Re-init:** chestionarul T1+ simplificat (§36.22) + engine BASELINE state pentru următoarele 4 sesiuni (re-calibration phase).

---

*Authored 2026-05-02 SUFLET ANDURA ingest. EXT-1 to EXT-6 added 2026-05-02 SELF-CORRECTION ingest. Status DRAFT — pending Daniel review pre-LOCK.*
