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

*Authored 2026-05-02 SUFLET ANDURA ingest. Status DRAFT — pending Daniel review pre-LOCK.*
