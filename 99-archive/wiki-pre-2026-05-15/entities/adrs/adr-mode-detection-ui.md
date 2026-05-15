---
title: ADR Mode Detection UI v1 (5 Modes Pure Event Listeners)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_MODE_DETECTION_UI_v1.md LOCKED V1 Chat D ADR Review Process §36.56 + 3 amendments aplicate §36.57
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../concepts/andura-suflet]]"
  - "[[adr-bias-detection-observable]]"
  - "[[adr-pain-discomfort-button]]"
amendments: []
---

# ADR Mode Detection UI v1

## Synthesis

ADR_MODE_DETECTION_UI = detection 5 moduri user (Executor / Curios+Strategic / Frustrat Tehnic / Frustrat Viață / Validation-Seeking) purely din event listeners + flags state local pe acțiuni UI deterministe. Andura V1 = app cu UI, NU chat — ZERO language input. SUFLET ANDURA 12k cuvinte filozofie sursă descrie pattern-uri conversaționali "modes" detected prin language analysis NLP în chat → engine V1 trebuie detect din event listeners deterministe.

**5 moduri detected:**
| Mod | Trigger UI | Engine Output |
|-----|-----------|---------------|
| **Executor** | Tap rapid "Set terminat" + skip mai departe (median delay <3s între tap-uri) | UI minimalist, cifre mari, ZERO explicații text |
| **Curios+Strategic** (comasat) | Tap "De ce?" / denumire exercițiu / grafic progresie | Expand detalii tehnice + raționament |
| **Frustrat Tehnic** | 3 retry consecutiv same set + Skip exercițiu | Sticky Swap Engine activate (înlocuire mișcare) |
| **Frustrat Viață** | 2+ skip-uri în aceeași săpt | Banner Anti-RE §22 F-NEW-4 *"Drumul continuă. Reluăm [ziua]."* + buton "Folosesc varianta mea" |
| **Validation-Seeking** | Scroll repetat trend grafic + stagnation 7+ zile detected | Toast *"Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."* |

**Mecanică implementare V1:** Pure event listeners + flags state local. ZERO ML/NLP runtime. Reguli logice deterministe — fiecare mod are trigger condition observable (count + window). Mode flags persisted local pe sesiune curentă (NU cross-session — reset la sesiune nouă). **Mode hierarchy:** Frustrat Viață > Frustrat Tehnic > Validation-Seeking > Curios+Strategic > Executor (fallback default). Multiple triggers active simultan → highest hierarchy wins.

## Verbatim quotes Daniel

Daniel verbatim Validation-Seeking toast LOCKED 2026-05-02 SUFLET ingest:
> *"Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."*

Daniel verbatim Frustrat Viață banner Anti-RE §22 F-NEW-4 LOCKED:
> *"Drumul continuă. Reluăm [ziua]."*

Daniel verbatim mecanică V1 pure deterministic anti-NLP rationale:
> *"ZERO ML/NLP runtime. Pure event listeners + flags state local. Reguli logice deterministe. Andura V1 = app cu UI, NU chat."*

## Bugatti framing notes

**Gigel test relevance:** Executor mode UI minimalist cifre mari ZERO explicații = anti-cognitive-load pentru user rapid-flow. Curios+Strategic expand on-demand (NU forced).

**Quality > Speed via observable behavior triggers:** Median delay <3s tap-uri (Executor) / 3 retry consecutiv (Frustrat Tehnic) / 2+ skip-uri săpt (Frustrat Viață) = NU NLP runtime. Deterministic event count + time window.

**Anti-RE considerations:** Mode flags reset la sesiune nouă (NU cross-session persistence) = anti-recurrence pattern (sesiune Executor anterior NU contamină sesiune curentă). Pattern: fresh state per session.

**Anti-paternalism notes:** Wording locked toast Validation-Seeking *"Performanța și forța cresc, asta contează"* = redirect peste cântar obsession, NU "stop weighing yourself". SUFLET F2 informează nu impune.

**Voice tone notes:** Daniel-isms preserved verbatim *"Drumul continuă. Reluăm [ziua]."* (compassionate non-blaming) + *"Folosesc varianta mea"* (user agency button label).

## Cross-refs raw layer

- [[../../../03-decisions/ADR_MODE_DETECTION_UI_v1]] §Decision 5 moduri verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §3 modes conversaționali NLP source pattern
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.17 (origin) + §22 F-NEW-4 Anti-RE banner + §29.5 UX Colateral Sticky Swap Engine
- [[../../../03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1]] cross-ref pattern observable triggers
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 Chat D LOCK V1 + 3 amendments §36.57

🦫 **ADR Mode Detection UI LOCKED V1 2026-05-02. 5 moduri (Executor / Curios+Strategic / Frustrat Tehnic / Frustrat Viață / Validation-Seeking). Pure event listeners + flags state local. ZERO ML/NLP runtime. Mode hierarchy + reset per session.**
