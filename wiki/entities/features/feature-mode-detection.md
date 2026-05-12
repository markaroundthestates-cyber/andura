---
title: Mode Detection UI — 5 Moduri Pure Event Listeners Hierarchy + Reset Per Session
type: entity-feature
status: locked-v1
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../adrs/adr-mode-detection-ui]]"
  - "[[../concepts/andura-suflet]]"
  - "[[../adrs/adr-bias-detection-observable]]"
---

# Mode Detection UI Feature

## Synthesis

**Mode Detection UI feature** = 5 moduri detection user-interaction pattern purely din event listeners + flags state local pe acțiuni UI deterministe (ZERO ML/NLP runtime). LOCK V1 per ADR_MODE_DETECTION_UI 2026-05-02 Chat D ADR Review Process §36.56 + 3 amendments aplicate §36.57. 5 moduri: **Executor** (tap rapid <3s median delay) / **Curios+Strategic** (tap "De ce?" / nume exercițiu / grafic progresie) / **Frustrat Tehnic** (3 retry consecutiv + Skip exercițiu) / **Frustrat Viață** (2+ skip-uri săpt) / **Validation-Seeking** (scroll repetat trend grafic + stagnation 7+ zile).

**Mode hierarchy fallback default:** Frustrat Viață > Frustrat Tehnic > Validation-Seeking > Curios+Strategic > Executor. Multiple triggers active simultan → highest hierarchy wins. **Mode flags persisted local pe sesiune curentă NU cross-session** — reset la sesiune nouă invariant preserve.

**UX surface per mode:** Executor UI minimalist cifre mari ZERO explicații + Curios+Strategic expand detalii tehnice + Frustrat Tehnic Sticky Swap Engine activate (înlocuire mișcare) + Frustrat Viață Banner Anti-RE §22 F-NEW-4 *"Drumul continuă. Reluăm [ziua]."* + buton "Folosesc varianta mea" + Validation-Seeking Toast *"Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."*

## Verbatim quotes Daniel

Daniel verbatim ADR Mode Detection UI mecanica V1 pure deterministic anti-NLP rationale:
> *"ZERO ML/NLP runtime. Pure event listeners + flags state local. Reguli logice deterministe. Andura V1 = app cu UI, NU chat."*

Daniel verbatim wording locked Validation-Seeking toast 2026-05-02 SUFLET ingest:
> *"Stagnarea pe cântar nu înseamnă stagnare reală. Performanța și forța cresc, asta contează."*

Daniel verbatim Frustrat Viață banner Anti-RE §22 F-NEW-4:
> *"Drumul continuă. Reluăm [ziua]."*

## Bugatti framing notes

**Gigel test relevance:** Executor mode UI minimalist cifre mari ZERO explicații = anti-cognitive-load Gigel rapid-flow user. Pattern: tailor UI per mode detected NU one-size-fits-all.

**Quality > Speed via observable behavior triggers:** Median delay <3s + 3 retry consecutiv + 2+ skip-uri săpt = NU NLP runtime. Deterministic event count + time window pure functions.

**Anti-RE considerations:** Mode flags reset la sesiune nouă (NU cross-session persistence) = anti-recurrence pattern (sesiune Executor anterior NU contamină sesiune curentă). Pattern: fresh state per session.

**Anti-paternalism notes:** Wording locked toast Validation-Seeking *"Performanța și forța cresc, asta contează"* = redirect peste cântar obsession NU "stop weighing yourself" forced. SUFLET F2 informează nu impune alignment.

**Voice tone notes:** Daniel-isms preserved verbatim *"Drumul continuă. Reluăm [ziua]."* (compassionate non-blaming) + *"Folosesc varianta mea"* (user agency button label). Vernacular RO cultural alignment.

## Cross-refs raw layer

- [[../../../03-decisions/ADR_MODE_DETECTION_UI_v1]] 5 moduri verbatim + Mode hierarchy + 3 amendments §36.57
- [[../../../01-vision/SUFLET_ANDURA]] §3 modes conversaționali NLP source pattern adapted observable UI events
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.17 origin + §22 F-NEW-4 Anti-RE banner + §29.5 UX Colateral Sticky Swap Engine
- [[../../../03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1]] cross-ref pattern observable triggers
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 Chat D LOCK V1 + 3 amendments §36.57
- [[../adrs/adr-mode-detection-ui]] (wiki entity SUB-BATCH 3 cross-ref)
- [[../concepts/andura-suflet]] (brand soul Gigel-friendly anti-surveillance Romanian-first source)

🦫 **Mode Detection UI 5 moduri pure event listeners ZERO ML/NLP runtime. Mode hierarchy fallback default + reset per session invariant. Wording locked Validation-Seeking + Frustrat Viață compassionate non-blaming RO vernacular. Anti-cognitive-load tailor UI per mode Gigel test PASS.**
