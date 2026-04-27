# ADR 014: Onboarding UI + Profile Typing (Anti-Bias Framework)

**Status:** Accepted
**Date:** 2026-04-26
**See also:** [[011-coach-decision-log-architecture]] | [[013-auto-aggression-detection]] | [[016-vitality-layer]] | [[018-engine-extensibility-architecture]] | [[001-local-first-storage]] | [[DECISION_LOG]] | [[PROJECT_VISION]]

---

## Context

ADR 013 a stabilit că SalaFull folosește profile typing (Sprinter / Marathon / Yo-yo / Strategic) ca calibrator pentru thresholds detection auto-aggression + intervention style. ADR 013 §Profile typing a definit conceptual cele 4 profile + nevoia de hybrid (self-report + behavioral inference) + reconciliation, DAR a lăsat deschis:

- Wording exact al chestionarului onboarding (4 core + 1 post-sesiunea 3)
- Scoring rules pentru self-report (cum traduci răspunsuri → profile)
- Edge cases (skip Q4, tie 2-2, inconsistent 1-1-1-1)
- Reconciliation prompt UX (5 cazuri + decline behavior + frequency cap)
- Friction modal HIGH tier wording + flow
- Storage decision pentru profile-history (CDL extension vs separate key)

Fără un model formal pentru aceste decizii, SalaFull riscă:

1. **Self-perception bias collapse** — toți users zic "Strategic" la onboarding (problema cunoscută de psihometrie). Profile typing devine theatre, NU calibrator funcțional.

2. **Friction prematură sau insuficientă** — un wrong button order la mismatch HIGH = user click "Update" reflexiv fără să citească data → profile typing învață greșit. Un text "continui pe propria răspundere" la HIGH tier override = legal-flavored, hostile UX, blochează Sprinter aggressive legitime.

3. **Storage drift** — fără decizie clară, dezvoltatorii vor extinde CDL pentru profile events sau crea ad-hoc keys. Inconsistent storage = debug nightmare + harder migration ulterior.

4. **Reconciliation alarm fatigue** — fără frequency cap clar, user cu mismatch HIGH primește prompt-uri repetate care eroded trust → reconciliation devine wallpaper, dismiss rate >50%.

**Problema:** ADR 013 e principle pentru AA detection. ADR 014 trebuie să fie principle pentru tot ce ține de onboarding profile + reconciliation flow, NU spec implementabil. Spec UI implementation (mockups, components, copy strings) urmează în EXEC_QUEUE separate post-ADR 014.

---

## Decision

Adoptăm un sistem hybrid de profile typing cu **5 framework decisions principale + storage strategy explicită + reconsideration triggers**.

### 1. Anti-bias framework — A pură + Q4 forced-choice

**Rejected approaches:**

- **Direct profile self-pick** ("Care profil te descrie cel mai bine?") — collapse pe Strategic bias
- **Mixed C** (Q1-Q3 indirect + Q4 direct profile pick) — Q4 direct introduces bias as anchor
- **Long questionnaire** (10+ întrebări) — drop-off în onboarding fără data SalaFull-specific (handwave fără calibrare empirică)

**Adopted: A pură + Q4 forced-choice trade-off**

- **Q1-Q3 — scenarii indirecte comportamentale** (cum ai reacționa, NU ce profil ești)
- **Q4 — forced-choice trade-off între 4 valori positive** (anti "all of the above")
- **Q5 — post-sesiunea 3 active calibration** (behavioral data labeled de user)

Discrimination prin comportament hipotetic + valori + reflection cu data fresh. Strategic claim fals nu mai poate scăpa cu "depinde" sau bias self-image.

### 2. Q1-Q5 wording (v1 strategic — iteration post user test)

**Q1 — Reacția la momentum bun:**

> "Ai făcut 3 antrenamente bune săptămâna asta. Sâmbătă ai energie. Ce faci?"
> 
> a) Adaug al 4-lea — momentum-ul e prețios, profit acum
> b) Mențin programul — sâmbăta e rest day, mâine luni reîncep
> c) Schimb planul — încerc ceva nou cât am energie
> d) Recitesc cum mă simt cu adevărat — energie reală sau adrenalină?

**Mapare:** a→Sprinter, b→Marathon, c→Yo-yo, d→Strategic

**Q2 — Reacția la sesiune slabă:**

> "Sesiune azi a fost slabă. Reps mai puține, te-ai simțit obosit. Cum reacționezi?"
> 
> a) Săptămâna viitoare push mai tare — recuperez
> b) Mențin planul — o sesiune slabă nu e pattern
> c) Schimb total — programul ăsta nu funcționează
> d) Notez ce s-a întâmplat — somn? mâncare? stress? Ajustez selectiv

**Mapare:** a→Sprinter, b→Marathon, c→Yo-yo, d→Strategic

**Q3 — Reacția la plateau:**

> "3 săptămâni fără progres vizibil. Aceleași kg, aceleași reps. Ce faci?"
> 
> a) Cresc volumul — clearly nu fac suficient
> b) Răbdare — progres nu e linear, continui
> c) Schimb complet — programul e blocat, încerc altceva
> d) Analizez ce s-a schimbat — somn, recovery, stres

**Mapare:** a→Sprinter, b→Marathon, c→Yo-yo, d→Strategic

**Q4 — Forced-choice trade-off (anchor):**

> "Care te frustrează mai tare?"
> 
> a) Plan care nu mă provoacă suficient — vreau să simt că împing
> b) Plan pe care nu-l pot ține constant — vreau predictibilitate
> c) Plan repetitiv — vreau varietate, lucruri noi
> d) Plan fără logică clară — vreau să înțeleg de ce fac ce fac

**Mapare:** a→Sprinter (intensity craving), b→Marathon (consistency need), c→Yo-yo (novelty seeking), d→Strategic (rationale need)

**Q5 — Post-sesiunea 3 (active calibration, 5 opțiuni asimetric):**

> "3 sesiuni făcute. Ce ai simțit cel mai mult?"
> 
> a) Voiam mai mult — m-am limitat conștient
> a') Voiam mai mult — am adăugat seturi/exerciții peste plan
> b) Programul a fost just right
> c) Am push prin oboseală — am terminat dar a fost greu
> d) Am skipuit un set/sesiune când nu am putut

**Mapare:**
- a → Strategic (intensity tolerance + self-regulation)
- a' → Sprinter (volume creep direct — match cu signal #1)
- b → Marathon (steady)
- c → Sprinter sau Strategic în spirală — discriminate via behavioral data
- d → Yo-yo sau Strategic legitim — discriminate via pattern

**Asimetric intentional:** discrimination "Strategic self-regulation" vs "Sprinter volume creep" critical pentru AA detection downstream. Collapse într-un label distruge signal.

**WORDING NOTE (mandatory implementation):** Q1-Q5 + reconciliation prompts + friction modal copy strings exported as consts în `src/onboarding/copy.js` pentru hot-swap post user-test feedback. NO inline strings în JSX/HTML/components. Anti-pattern: wording inline → 5 fișiere edit + bug risk pentru wording iteration.

### 3. Scoring rules (count direct + edge cases)

**Default:** count direct. 4 răspunsuri (Q1-Q4) → primary profile = profil cu count maxim.

**Edge cases:**

| Caz | Primary | Confidence | Flag |
|---|---|---|---|
| 4× same | profil dominant | HIGH | none |
| 3-1 | profil 3 | MEDIUM-HIGH | secondary = profil 1 |
| 2-2 + Q4 answered | Q4 forced-choice | MEDIUM | secondary = celălalt |
| 2-2 + Q4 skipped | `null` | LOW | `unclear_self_report` |
| 1-1-1-1 + Q4 answered | Q4 | LOW | `inconsistent_self_report` |
| 1-1-1-1 + Q4 skipped | `null` | LOW | `unclear_self_report` |
| Q1-Q3 toate skipped | `null` | LOW | `no_self_report` |

**Q4 skip semantics:** UI display Q4 fără skip button (rationale: Q4 e hard anchor pentru tie cases). Dar app close mid-onboarding = effective skip. Tratat ca null with flag `unclear_self_report`.

**Special-case explicit > magic number weighting.** Rejected: weight Q4 × 1.5 ca arbitrary (fără justificare empirică pentru 1.5 vs 1.3 vs 2.0). Special-case "2-2 default Q4 anchor" e debugging-friendly + explainable.

### 4. Reconciliation flow (5 cases + decline behavior)

**Trigger:**
- Săpt 4 elapsed AND ≥12 sesiuni → reconciliation HIGH/MEDIUM
- Săpt 6 elapsed AND <12 sesiuni → reconciliation LOW + insufficient_data flag
- Săpt 6 elapsed AND 0 sesiuni → reconciliation skipped, flag `stale_self_report`

**Cases:**

| Case | Self-report | Behavioral | Action |
|---|---|---|---|
| 1 | Match (same primary) | HIGH | **Prima reconciliation: prompt closing loop** ("Profile confirmat, pattern aliniat. Continui." [OK / Detalii]). Subsequent: silent confirm + log în profileHistory ca `silent_confirm` event. |
| 2 | Match | MED/LOW | Confirm tăcut + log event (no prompt) |
| 3 | Mismatch primary | HIGH | Prompt cu data points, button order **[Detalii / Defer 2 săpt / Update]** |
| 4 | Mismatch | MED/LOW | Prompt cu rationale "data limitată", **[Detalii / Defer / Update]** |
| 5 | Insufficient (<12 sessions, week 6) | n/a | "Date insuficiente — continui current" prompt, single button [OK] |
| 6 | Stale (0 sessions, week 6) | n/a | "Reluăm când ești gata" prompt, single button [OK] |

**Wording principles (case 3 example):**

> **"Pattern observat: Sprinter, NU Strategic"**
> 
> În primele 4 săptămâni:
> - Adherence: 92%
> - Volume adăugat peste plan: 6 sesiuni din 12
> - Sesiuni grele: 7 din 12  ← *plain language, NU "RPE Hard/Very Hard 58%"*
> - Zero rest days marcate legitim
> 
> La onboarding ai indicat **Strategic**. Pattern-ul tău arată **Sprinter** — adăugare volum frecventă, intensity craving.
> 
> Update profile?
> 
> [Detalii]   [Defer 2 săpt]   [Update la Sprinter]

**Button order rationale: `[Detalii / Defer / Update]`**
- Update LAST (anti-rushed-decision — irreversible în profileHistory)
- Detalii FIRST (forțează drill-down înainte de irreversible action)
- Defer middle (low-friction option pentru user undecided)

**Wording NOT used:**
- "Update la Sprinter" primary button — risc click reflexiv
- "Pattern incorect detectat" — judgmental, hostile
- "Confirmă schimbarea" — generic, no anchor

**Defer behavior:** wait 2 săpt, accumulate behavioral data, re-prompt cu data updatată.

**Decline behavior** (close fără update):
- Păstrează profile actual (Strategic în exemplu)
- Re-prompt la săpt 12 (next reconciliation window) DOAR DACĂ:
  - Behavioral signature continuă să difere cu confidence HIGH AND
  - Mismatch sustained ≥4 săpt fără ameliorare
- **Frequency cap: max 1 re-prompt la 8 săpt de la ultimul re-prompt** (NU absolute weeks — relative la ultimul prompt)

**Counter-markers în prompt:** drill-down opțional ("Detalii"), NU prompt principal. Default = decizie rapidă cu evidence pozitiv. Counter-markers logic per profile = în profileTyping.js module (vezi spec EXEC_QUEUE).

### 5. Friction Modal HIGH tier (typing confirmation)

**Trigger:** AA detection tier=HIGH + user încearcă să continue plan respins de coach (override flow).

**Wording:**

> **"Pattern auto-distructiv detectat"**
> 
> În ultimele 3 săptămâni:
> - Volume adăugat peste plan: 8/9 sesiuni
> - Composite fatigue: 4 săpt consecutive
> - Recovery debt: 1 rest day/săpt (vs 2+ recomandat)
> - Hyperfocus pattern: 9h+ /zi în app, 5 zile/săpt
> 
> Pattern-ul tău arată **spirală overreaching** — răspunsul greșit la frustrare.
> Continuarea acestui plan riscă: stagnare reală, accidentare, burnout.
> 
> ---
> 
> Pentru a continua, scrie textul de mai jos:
> 
> *Am văzut pattern-ul. Aleg să continui.*
> 
> [text input]   [Anulează]

**Friction mechanism:**
- Read warning complet (no scroll-skip — full warning vizibil înainte de input)
- Type confirmation (NU click checkbox — tactile commitment)
- Submit doar dacă text match exact (case-insensitive, whitespace-trimmed)

**Data injection (TASK #7 implementation):**

Fraza generată dinamic: `"continui peste {N} signals în {windowDays} zile"` unde `N = ctx.autoAggression.signals.length`, `windowDays = 14`. NU template static — anti-reflex paste-buffer (fiecare sesiune generează frază diferită per signal count).

Escalation: a 2-a override în 7 zile → fraza mai lungă: `"continui peste {N} signals — a {count+1}-a override în 7 zile"`.

State persistence: `aa-friction-pending` localStorage key — aceeași `sessionDate` → restore phrase (anti-stale la refresh); altă dată → clear și regenerează.

**Reconsideration triggers:**
- Typing completion rate <50% → friction prea mare, redesign mecanism
- Typing completion rate >95% → friction prea mică, escalează

**Wording rigid intentional (TASK #7 adoption):**
- Type-in match exact previne paste-uire reflexă — user trebuie să citească ce tipărește
- Fraza data-injected (N signals, window days) — NU poate fi pre-memorizată sau paste-uită reflex
- Escalation phrase mai lungă — cost cognitiv crescut la al doilea override

**Rejected wordings:**
- "Continui pe propria răspundere" → legal-flavored, hostile
- "Înțeleg pattern-ul observat și aleg să continui" → corporate, scripted
- Static phrase fără data injection → paste-buffer bypass trivial

**Tap countdown alternative respinsă:** 3-tap sequence cu pause 3s între → gimmicky, taps pot fi reflex. Typing forțează engagement cognitive.

### 6. Storage strategy — `profile-history` separate localStorage key

**Rejected: Extension ADR 011 (`outcome.profileEvent`)** — profile events sunt session-orthogonal (onboarding NU se leagă de session, reconciliation triggered între sesiuni). Forțarea în CDL = schema misuse. ADR 011 principle = "CDL = session-level decisions".

**Rejected: Hibrid (snapshot CDL + profile-history separate)** — premature optimization. Read pattern "profile la momentul sesiunii X" nu există încă. ADR 011 reconsideration trigger #8 ne lasă să adăugăm later DACĂ surface real need.

**Adopted: Separate localStorage key `profile-history`**

**Rationale:**
- Semantic alignment — profile events sunt lifecycle events, NU session decisions
- Pattern existing — ADR 011 deja folosește multiple kebab-case keys (`coach-decisions`, `coach-decisions-aggregate`, `coach-decisions-archive`, `cdl-patterns`). Adding `profile-history` continuă pattern.
- Volum mic — 5-15 events/user/an. Backup overhead minimal.
- Decoupled — profileTyping.js NU depinde de CDL infrastructure pentru profile events

**Schema:**

```typescript
profile-history: Array<{
  timestamp: number,                  // Date.now()
  type: 'onboarding' 
      | 'reconciliation_prompt' 
      | 'profile_change' 
      | 'silent_confirm' 
      | 'reprompt' 
      | 'insufficient_data'
      | 'stale_self_report',
  selfReport: {                       // null pentru events care NU sunt self-report-derived
    primary: string,
    secondary: string | null,
    confidence: 'high' | 'medium' | 'low',
    scores: { Sprinter: n, Marathon: n, Yoyo: n, Strategic: n },
    flags: string[]
  } | null,
  behavioral: {                       // null pentru events fără behavioral data
    primary: string,
    confidence: 'high' | 'medium' | 'low',
    sessionCount: number,
    dataPoints: string[]              // human-readable, e.g., 'Volume creep: 4/12 sesiuni'
  } | null,
  userChoice: 'update' | 'defer' | 'decline' | 'continue' | null,
  fromProfile: string | null,         // profile actual înainte de event (pentru change events)
  toProfile: string | null            // profile nou (pentru change events)
}>
```

**Registry placement (per dataRegistry.js conventions):**
- `USER_DATA_KEYS` (NU TEST_RESIDUE_KEYS — NU e transient state)
- `SYNC_KEYS` în firebase.js (Firebase backup standard)
- **NU în PRESERVE_ON_RESET_KEYS** — wipe la fullReset (rerun onboarding = fresh history)

**Read/write helpers:** definite în onboarding UI module (separate spec EXEC_QUEUE post-ADR 014). profileTyping.js consume only (caller passes profileHistory ca opts parameter).

---

## Alternatives Considered

### A. Direct profile self-pick (5-question profile picker)

Avantaj: simplu de implementat, predictibil.
Dezavantaj: known broken — toți users zic "Strategic" (self-perception bias). Profile typing devine theatre.

**Respins:** rationale principal pentru ADR 014 e anti-bias.

### B. Long psychometric questionnaire (10-15 întrebări)

Avantaj: discrimination power maxim, validated în psychology research.
Dezavantaj: drop-off în onboarding (handwave fără data SalaFull-specific, dar standard fitness apps onboarding ≤5 întrebări). Plus: NU avem psychology PhD pentru validation.

**Respins pentru v1.** Reconsiderare la 1000+ users dacă A pură + Q4 forced-choice produce <60% discrimination accuracy.

### C. Behavioral inference only (no self-report)

Avantaj: zero bias possible. Pure data-driven.
Dezavantaj: cold start problem — profile inactivat 4-6 săpt până când suficient data. AA detection thresholds calibration imposibilă de la sesiunea 1.

**Respins:** hybrid e singura cale viabilă pre-cold-start.

### D. ML classifier on onboarding answers

Avantaj: adaptive, calibrare automată.
Dezavantaj: zero training data la lansare. Requires scale (1000+ users + labeled outcomes). Black-box hard de debugat.

**Respins pentru v1.** Reconsiderare la 1000+ users + 6+ months behavioral data.

### E. Reconciliation prompt cu Update primary button

Avantaj: rapid pentru users care vor să accepte mismatch.
Dezavantaj: click reflexiv fără citire data → profile typing învață greșit. Irreversible action prea ușoară.

**Respins:** Detalii primary forțează drill-down. Update LAST anti-rushed-decision.

### F. Friction modal cu tap countdown (3 taps cu 3s pause)

Avantaj: no typing required (mobile UX friendly).
Dezavantaj: gimmicky, taps pot fi reflex. NU forțează engagement cognitive.

**Respins:** typing 8 sec > tap reflex.

### G. CDL extension pentru profile events (`outcome.profileEvent`)

Avantaj: single source of truth pentru toate decision events.
Dezavantaj: profile events sunt session-orthogonal. Forțarea în CDL = schema misuse. ADR 011 principle violation.

**Respins:** separate localStorage key cleaner.

---

## Trade-offs Accepted

### 1. Q1-Q5 wording v1 NU testat empiric pre-launch

Discrimination power assumed adequate based on design rationale (anti-bias mechanisms). Real validation = user test pe 3-5 useri non-developers (post-spec, separate timeline 2-4 săpt).

### 2. Q4 hard anchor poate frustra users care vor "no opinion"

Forced-choice fără "n/a" option. Acceptable pentru v1 — Q4 skip = LOW confidence + flag, NU break flow.

### 3. Reconciliation prompt poate friction-ate users la săpt 4-6

1-click accept/decline reduce friction, dar momentul reconciliation e UX-critical. Dismiss rate >30% = redesign trigger (per Reconsideration #2).

### 4. profile-history în USER_DATA_KEYS = wipe la fullReset

User care rulează fullReset pierde profile evolution history. Acceptable: fullReset = "start over" semantic, fresh history coerent.

### 5. Friction modal type-in pe mobile cu romanian diacritics

Voice-to-text + tasta C stricată (Daniel-specific) = potential UX issue chiar pentru tine. Worth testing înainte de spec UI implementation. Exact text "Am văzut pattern-ul. Aleg să continui." NU folosește diacritics → mitigated.

### 6. profileHistory volum estimat 5-15 events/an = assumption

Dacă reconciliation declined frequent → re-prompts → mai multe events. >50 events/an = reconsider compaction strategy (per Reconsideration #5).

### 7. Decline frequency cap relativ (8 săpt de la ultimul re-prompt) NU absolute

User cu mismatch HIGH sustained ≥4 săpt + decline → next prompt minim 8 săpt later. Acceptabil — anti alarm fatigue. Dar user care își schimbă comportamentul rapid (mismatch resolves) NU primește confirmation prompt → silent confirm only.

---

## Empirical Calibration Parameters

| Parameter | Starting value | Source | Reconsider trigger |
|---|---|---|---|
| Q1-Q3 număr scenarii indirecte | 3 | Heuristic (balance discrimination vs friction) | Trigger #1 |
| Q4 forced-choice options | 4 | 4 profiles → 4 options | NU reconsider |
| Q5 trigger sesiune | post-3 | Heuristic | Trigger #4 |
| Reconciliation window | 4-6 săpt | ADR 013 alignment | Trigger #2 |
| Min sessions for HIGH confidence | 12 | Heuristic | Trigger after 50+ users |
| Decline frequency cap | 8 săpt | Heuristic | Trigger #3 |
| profileHistory volum estimate | 5-15 events/an | Assumption | Trigger #5 |

**Principle:** orice parameter aici NU e invariant. Toate sunt subject to empirical revision după production data.

---

## Reconsideration Triggers

1. **Q1-Q5 discrimination accuracy < 60%** după test pe 3-5 useri → redesign wording. Specific: dacă >40% users mismatch self-report vs behavioral la săpt 6, wording NU discrimină eficient.

2. **Reconciliation prompt dismiss rate > 30%** → redesign UX. Currently Detalii/Defer/Update + plain language data. Dacă >30% close fără action, frequency cap prea slack sau wording prea formal.

3. **Decline frequency cap insufficient** — dacă users care declined la săpt 6 raportează "prea multe re-prompts" sau "nu mi-a dat pace", crește cap la 12 săpt. Dacă raportează "n-am revenit niciodată la profile" → scade.

4. **Q5 trigger timing** — post-sesiunea 3 e arbitrary. Dacă <50% users ajung la sesiunea 3 (drop-off pre-Q5), mută la post-sesiunea 1 sau onboarding. Dacă >80% completează ușor 3 sesiuni, OK.

5. **profileHistory volum > 50 events/an** → compaction strategy needed. Posibilități: archive events vechi (> 1 year) într-o sumare, sau migrate la TierStorage similar CDL.

6. **User test feedback wording** — Q1-Q5 v1 strategic e workable. Test pe 3-5 useri post-launch alpha + iteration constants în `src/onboarding/copy.js` = hot-swap fără code changes.

7. **Friction modal type-in completion rate** — dacă < 50% users care încearcă HIGH tier override completează typing → friction prea mare, redesign mecanism. >90% completion → friction prea mică, escalează (longer text? captcha-style?).

8. **Counter-markers logic** — dacă "Detalii" drill-down rate >50% (users vor evidence pre-decizie), counter-markers prezentați în prompt principal, NU drill-down. Reconsider information hierarchy.

---

## Implementation Notes

**Scope ADR:** principle + framework decisions. **NU spec implementabil.**

Implementation va fi spec-uit separat în EXEC_QUEUE după push ADR 014. Estimat 4-6 subtasks (Sonnet) split:

1. **Onboarding component** — Q1-Q5 layout + scoring logic + flag persistence + `src/onboarding/copy.js` consts
2. **Reconciliation prompt component** — 5 cazuri layouts mobile-first + data points display + button order
3. **Friction modal component** — typing input + warning vizibil + button states + match validation
4. **profileHistory storage layer** — read/write helpers + SYNC_KEYS extension + dataRegistry.js entry
5. **Integration coachContext.js + onboarding flow** — connect Q1-Q5 result → profileTyping → ctx.userProfile

Each component task has Daniel gate before next. Anti-mega-prompt enforcement.

**Dependencies critical:**

- **profileTyping.js module** (TASK PROFILE-TYPING) — DONE prerequisite — module pure consume Q1-Q5 result
- **ADR 011 schema additions** — DONE prerequisite — `outcome.rest_marked` referenced în reconciliation flow
- **ADR 013** — DONE prerequisite — AA detection signals referenced în friction modal

**Ordine recomandată implementation post-ADR 014:**

1. Q1-Q5 user test (3-5 useri non-developers, 2-4 săpt timeline) — paralel cu spec writing
2. Spec EXEC_QUEUE Onboarding component
3. Spec EXEC_QUEUE Reconciliation prompt component
4. Spec EXEC_QUEUE Friction modal component
5. Spec EXEC_QUEUE profileHistory storage layer
6. Spec EXEC_QUEUE Integration coachContext + onboarding flow
7. Q1-Q5 wording iteration post user-test feedback (hot-swap consts în copy.js)

---

## Notes on Production Readiness

ADR ăsta NU e production-ready specification. Items requiring data sau decision înainte de spec EXEC_QUEUE:

- **Q1-Q5 user test** — 3-5 useri non-developers, structured interview, output în vault `02-audit/ONBOARDING_USER_TEST_2026-XX.md`
- **UI mockups** — Q1-Q5 layout mobile-first, reconciliation prompt cu data points, friction modal cu input text + warning vizibil — toate require design iteration
- **Romanian copy refinement** — current = casual romanian. Test pentru clarity pe non-developers
- **Counter-markers data points wording** — plain language ("Sesiuni grele: 7 din 12") — needs validation pe diversi useri

Acestea NU intră în ADR (principle), intră în spec implementabil + UX iteration.

---

## Resolved Questions (decision log)

Întrebările rezolvate în review 2026-04-26 (chat triangulation cu push-back-uri):

### 1. Q5 5 opțiuni asimetric vs 4 collapsed?

**Decision:** 5 opțiuni asimetric (a, a', b, c, d).

**Rationale:** Collapse a/a' într-un singur label distruge signal "Strategic self-regulation vs Sprinter volume creep" — exact distincția pentru AA detection downstream. UI symmetry < discrimination power.

### 2. Q3 răspuns d trim wording?

**Decision:** "Analizez ce s-a schimbat — somn, recovery, stres" (păstrează "recovery", scoate "alimentație").

**Rationale:** "recovery" e diagnostic primary pentru AA signals #4+#5. "alimentație" ortogonal pentru profile typing (mai relevant pentru AA #2 calorie acceleration, dar acolo signal direct din data).

### 3. Q4 weight 1.5 magic number vs special-case explicit?

**Decision:** Special-case explicit "2-2 default Q4 anchor". NO weighting.

**Rationale:** Non-integer weight = arbitrary (de ce 1.5 vs 1.3 vs 2.0?). Special-case explicit > magic number — debugging-friendly + explainable.

### 4. Q4 skip case handling?

**Decision:** Q4 hard anchor pentru tie cases, skip → null + LOW confidence + flag `unclear_self_report`.

**Rationale:** UI display Q4 fără skip button. App close = effective skip. Explicit handling > silent default to first option.

### 5. Friction modal typing vs tap countdown?

**Decision:** Typing confirmation. NU tap countdown.

**Rationale:** Typing 8 sec forțează engagement cognitive. Tap reflex chiar cu pause. Mobile UX trade-off acceptable pentru HIGH tier (rare event).

### 6. Reconciliation button order Detalii/Defer/Update vs Update/Defer/Detalii?

**Decision:** Detalii / Defer / Update (Update LAST).

**Rationale:** Update last = anti-rushed-decision (irreversible în profileHistory). Detalii first = forțează drill-down înainte de irreversible. Defer middle = low-friction undecided option.

### 7. Counter-markers prompt principal vs drill-down?

**Decision:** Drill-down opțional ("Detalii"), NOT prompt principal.

**Rationale:** Default = decizie rapidă cu evidence pozitiv. Counter-markers pentru users care vor verify pre-decision. Reconsider la Trigger #8 dacă drill-down rate >50%.

### 8. Storage decision — CDL extension vs separate key?

**Decision:** Separate `profile-history` localStorage key.

**Rationale:** Profile events session-orthogonal (NU session decisions). ADR 011 principle = "CDL = session-level". Pattern existing (multiple kebab-case keys per concern). Volum mic justifiat.

### 9. profileSnapshot CDL outcome (Opțiunea C lite)?

**Decision:** NU. Premature optimization.

**Rationale:** Read pattern "profile la momentul sesiunii X" nu există. ADR 011 reconsideration trigger #8 ne lasă să adăugăm later DACĂ surface real need. Acum = scope creep.

### 10. fullReset comportament pentru profile-history?

**Decision:** Wipe la fullReset.

**Rationale:** fullReset semantic = "start over fresh". Rerun onboarding = fresh history coerent. Standard pattern (alte USER_DATA_KEYS: weights, kcals, logs — toate wipe-uite).

---

## Tier-Based Personalization Pattern

### Context

ADR 014 acceptat 2026-04-26 specifică Q1-Q5 onboarding fără diferențiere explicită pe calibration tier (ADR 009). Decizia 2026-04-27 (Memory rule #25 + DECISION_LOG entry sesiune END 27 apr): **engine-ul aplică Profile Typing tier-aware**, NU "always-on dacă onboarding completed".

Două motivații strategice:

1. **Self-selection = feature, NU bug.** User care completează onboarding la day 1 = high-engagement signal. User care skip = engine acceptabil din demographic prior, NU degraded mode. Engine se calibrează la efort user, NU forțează personalizare premature.

2. **Profile Typing primary self-report only la T0/T1.** Behavioral inference (data care corectează self-perception bias — cf. ADR 014 §1) necesită ≥ 12 sesiuni real (per §scoring + reconciliation triggers). Activarea Profile Typing recommendations înainte de behavioral data = self-report bias la putere maximă, fără counter-balance. T1+ activare respectă natural acest gate.

### Decision

**Tier-aware Profile Typing activation:**

| Tier | Days/Sessions | Profile Typing primary collected? | Profile Typing recommendations active? | Behavior |
|---|---|---|---|---|
| T0 COLD_START | < 7 zile, < 3 sesiuni | YES (la onboarding) | NO | Engine = demographic prior + cold-start session (ADR 009). Profile Typing data stocată dar NU consumată. |
| T1 INITIAL | 7-28 zile, 3-12 sesiuni | YES | YES (self-report only) | Profile Typing dimension activă; recommendations aplicate. Behavioral inference NU disponibil încă. |
| T2 PERSONALIZING | 28-90 zile, 12-40 sesiuni | YES | YES (self-report + behavioral) | Behavioral inference activ post-Q5 (sesiunea 3+). Reconciliation triggered la săpt 4 + ≥12 sesiuni. |
| T3+ PERSONALIZED / OPTIMIZED | 90+ zile, 40+ sesiuni | YES | YES (full) | Profile Typing full functionality + reconciliation cycle. |

**Skip semantics:**
- User T0 skip onboarding → engine = demographic prior din age/sex/kg/height/BMI. Profile Typing dimension skipped în cluster (no data). NU degraded mode.
- User T1+ skip onboarding (atypical edge case) → tratat ca T0 indefinitely până când onboarding completed manual din settings.
- User T0 partial onboarding (Q1-Q3 da, Q4 skip) → tratat per ADR 014 §3 edge cases (LOW confidence + flag), Profile Typing dimension active la T1 cu confidence flag propagated.

### Self-selection feature rationale

Engine NU forțează personalizare premature. Daniel articulation (DECISION_LOG sesiune END 27 apr):

> "T0 skip = engine generic + demographic prior din synthetic. T1+ Profile Typing activate. T2+ Vitality activate. T3+ behavioral real. Self-selection = feature, NU bug."

Implications:
- **Onboarding NU mandatory** pentru engine functional. Cold-start session (ADR 009) e baseline acceptable.
- **Friction-zero opt-in** preserved la fiecare tier transition. User care complete onboarding la day 14 (post-T1) primește Profile Typing recommendations imediat post-completion.
- **Demographic prior** (planned ADR 017) acoperă golul T0. Profile Typing = upgrade signal, NU foundation.

### Implementation notes

- Tier check: dimension `profileTyping.js` `analyze(input)` early-return cu `tier: 'none'` dacă `ctx.calibrationLevel === 'COLD_START'` (T0). Per ADR 018 §1 registry, `requiresCalibration: 'INITIAL'` filtered de helper `getActiveDimensions(ctx)` — alternative path, equivalent semantic.
- Profile Typing data collected la onboarding stocate în `profile-history` localStorage key (per ADR 014 §6 existing) indiferent de tier. Data persistence ≠ data consumption.
- DimensionResult.meta.confidence reflectă tier: T1 self-report-only → `confidence: 'medium'` (lipsește behavioral); T2+ post-reconciliation → `'high'` dacă self-report match behavioral, `'medium'` dacă mismatch deferred, `'low'` dacă mismatch sustained ≥ 4 săpt fără update.

### DP-1: Profile Typing tier gating — T1 INITIAL vs T0 immediate vs T2 PERSONALIZING

Vezi secțiunea finală update.

---

## Plugin Architecture Integration (ADR 018)

### Context

ADR 018 acceptat 2026-04-27 cu 5 componente structurale (Dimension Registry + Standardized Contract + Decision Cluster + Schema Versioning + Feature Flags). ADR 018 §migration Phase 2 specifică explicit Profile Typing **implement direct as dimension, skip legacy path entirely** — Profile Typing NU e legacy code de migrat (spec ADR 014 nu implementat încă), e greenfield la momentul ADR 018.

ADR 014 §implementation notes (existing) listează 5 subtasks (Onboarding component + Reconciliation prompt + Friction modal + profileHistory storage + Integration coachContext). Aceste subtasks rămân valide dar reorganizate pe ADR 018 contract — NU manual integration în `coachDirector.buildSession()`, ci dimension plugin în registry.

### Decision

**Profile Typing implementată end-to-end ca dimension plugin per ADR 018 contract.**

**Registry entry (`src/engine/dimensionRegistry.js`):**

```js
import * as profileTyping from './dimensions/profileTyping.js';

export const DIMENSIONS = [
  // ... existing entries
  {
    id: 'PROFILE_TYPING',
    module: profileTyping,
    stage: 'ADJUSTMENT',           // primary impact: session content per profile
    priority: 65,                  // mid-priority within ADJUSTMENT (above weakGroups, below AA MED)
    enabledFlag: 'profile_typing_v1',
    requiresCalibration: 'INITIAL',
    schemaVersion: 1
  }
];
```

**Module signature (`src/engine/dimensions/profileTyping.js`):**

```js
export function analyze(input) {
  const { ctx, cdl, userProfile, flags } = input;
  const profileData = userProfile?.profileTyping;  // populated from profile-history latest non-deferred entry

  if (!profileData || profileData.primary === null) {
    return {
      id: 'PROFILE_TYPING',
      tier: 'none',
      confidence: 'low',
      signals: [],
      recommendations: [],
      trace: { reason: 'no_self_report' },
      meta: { primary: null, secondary: null, confidence: 'low', scores: null, flags: [] }
    };
  }

  // Behavioral inference path (T2+ post-reconciliation) — see §4 reconciliation flow
  const behavioralPrimary = ctx.behavioralProfile?.primary || null;
  const reconciliationStatus = computeReconciliation(profileData, behavioralPrimary, ctx);

  const recommendations = buildRecommendationsForProfile(profileData.primary, ctx);

  return {
    id: 'PROFILE_TYPING',
    tier: profileData.confidence === 'high' ? 'HIGH' : profileData.confidence === 'medium' ? 'MED' : 'LOW',
    confidence: profileData.confidence,
    signals: profileData.flags,                // existing shape per ADR 014 §6
    recommendations,
    trace: { reconciliationStatus, behavioralPrimary, scores: profileData.scores },
    meta: {
      primary: profileData.primary,
      secondary: profileData.secondary,
      confidence: profileData.confidence,
      scores: profileData.scores,
      flags: profileData.flags
    }
  };
}
```

**Stage rationale (ADR 018 §3):**
- `stage: 'ADJUSTMENT'` — Profile Typing recommendations modify session content (volume, exercise selection, deload tolerance per profile). NU short-circuit (NU GATE), NU presentation-only (NU ENHANCEMENT primary).
- ENHANCEMENT use-case secundar: per-profile banner copy + tone (Sprinter "menținem intensitatea" vs Marathon "consistență peste viteză"). Implementation: aceeași dimension emite recommendations cu mix de actions — `action: 'reduce_volume_cap'` (ADJUSTMENT) + `action: 'inject_banner'` (ENHANCEMENT). Decision Cluster routes per stage automat.

**Priority 65 rationale (within ADJUSTMENT stage):**
- AA HIGH GATE = 95 (separate stage)
- AA MED ADJUSTMENT = 75
- Weak group priority = 70
- **Profile Typing = 65** (mid-tier ADJUSTMENT)
- Vitality LOW = 65 (parity — see ADR 016 §6)
- Cut conservative = 55

Profile Typing + Vitality at parity 65 reflectă status equal: ambele state-derived dimensions, NU short-circuit gates. Conflict resolution între ele = priority numeric tie-break + cluster cross-reference helper (§reconciliation Vitality below).

**Feature flag `profile_typing_v1`:**
- Rollout 1.0 default (always-on). Profile Typing acceptat pre-ADR 018 (26 apr 2026) — flag există pentru emergency rollback, NU gradual rollout.
- Decision inline (NU DP): pattern parity cu AA detection (ADR 018 §migration AA = `aa_detection_v1` rollout 1.0 already-live).
- Local override `_devFlags` per ADR 018 §5 disponibil pentru dev disable.

**Schema versioning v1:**
- DimensionResult.meta shape pinned per ADR 014 §6 existing: `{primary, secondary, confidence, scores, flags}`.
- Schema migration runner (ADR 018 §4) preg pentru v1 → v2 dacă shape evolves. Initial migration v0 → v1 trivial: existing profile-history entries pre-dimension-port = compatibility shim (read shim normalizes shape).

### DP-2: Stage assignment — ADJUSTMENT primary vs ENHANCEMENT only vs hybrid

Vezi secțiunea finală update.

### Implementation notes

- Per ADR 018 contract, `analyze()` must be pure + deterministic + total. `computeReconciliation()` + `buildRecommendationsForProfile()` helpers sunt pure functions în profileTyping.js, NU side-effects.
- Reconciliation flow (ADR 014 §4) UI prompts NU triggered din `analyze()` — separate concern (banner injection via Stage 3 ENHANCEMENT recommendations sau separate UI hook). `analyze()` întoarce reconciliation status în trace; UI layer consume.
- Existing 5 subtasks ADR 014 §implementation notes valide cu re-mapping:
  1. Onboarding component → emite în `profile-history` storage (unchanged)
  2. Reconciliation prompt component → consume DimensionResult.trace.reconciliationStatus
  3. Friction modal → unchanged (AA-driven, NU profile-driven)
  4. profile-history storage layer → unchanged
  5. Integration coachContext → înlocuit cu dimension registration (ADR 018 plugin)

---

## Reconciliation cu Vitality Layer (ADR 016)

### Context

ADR 016 acceptat 2026-04-27 cu Vitality Layer ca dimension nouă (T2+ activate, per §4 ADR 016). ADR 016 DP-3 a decis: **Profile Typing și Vitality = independent dimensions**, cross-reference DOAR în Decision Cluster Stage 2 logic, NU în `analyze()` direct (ar viola ADR 018 §2 contract guarantee "pure function, deterministic, total").

Două surse de overlap concrete între Profile Typing și Vitality:

1. **Signal flag overlap.** Profile Typing existing flags pot include `'high_stress'`, `'low_motivation'`, `'recovery_lent'` — derivate din self-report Q1-Q5 + behavioral inference. Vitality emite același flag set (per ADR 016 §2 scoring) — derivate din Q1-Q6 vitality responses fresh state.
2. **Recommendation overlap.** Profile Typing Sprinter primary → recommend volume cap (anti-overreach). Vitality LOW → recommend volume reduction (recovery prioritar). Ambele recommend reduce_volume action către cluster.

### Decision

**Cluster cross-reference helper `resolveProfileVitalitySignals(profileResult, vitalityResult, ctx)` — explicit pure function, separate de ambele dimensions.**

**Helper signature (`src/engine/decisionCluster.js`):**

```js
function resolveProfileVitalitySignals(profileResult, vitalityResult, ctx) {
  // Returns: { mergedSignals, rationale } pentru trace logging
  
  const profileSignals = (profileResult.signals || []).map(s => ({ src: 'PROFILE_TYPING', signal: s }));
  const vitalitySignals = (vitalityResult.signals || []).map(s => ({ src: 'VITALITY', signal: s }));
  
  // Overlap signal IDs prefixed cu dimension id în trace
  // Conflict resolution: numeric priority within ADJUSTMENT stage decides winner per recommendation action
  
  return {
    mergedSignals: [...profileSignals, ...vitalitySignals],
    overlap: detectOverlap(profileSignals, vitalitySignals),
    rationale: 'profile + vitality signals merged with source attribution'
  };
}
```

**Conflict resolution rules:**

1. **Signal flags overlap (string identical):** Both retained în trace cu `src: 'PROFILE_TYPING'` / `src: 'VITALITY'` prefix. NO deduplication. Engine treats as independent observations — Profile Typing self-report + Vitality fresh state = correlated but NU identical (Profile = identitate, Vitality = stare curentă).

2. **Recommendation overlap (same action, different priority):** Numeric priority within ADJUSTMENT stage decide winner per ADR 018 §3 stage compose semantics. Volume multipliers compose multiplicativ:
   - Profile Typing Sprinter recommendation: volumeMultiplier 0.95 (subtle anti-overreach)
   - Vitality LOW recommendation: volumeMultiplier 0.85 (recovery)
   - Final: 0.95 × 0.85 = 0.8075 (compose multiplicativ per ADR 018 §3)

3. **Recommendation overlap (same action, identical priority):** Tie-break = registry order (PROFILE_TYPING listed before VITALITY in DIMENSIONS array). Effectively non-deterministic from user perspective; documented behavior.

4. **Conflict (contradictory recommendations):** Currently impossible by design — both dimensions emit `reduce_volume` direction, NU `increase_volume`. Future cross-recommendation contradictions = reconsideration trigger (per ADR 018 §reconsideration trigger #5 cross-dimension dependencies).

**Independence preserved:**
- Profile Typing `analyze()` NU citește vitalityResult. Vitality `analyze()` NU citește profileResult. Both independent per ADR 018 §2 contract.
- Cluster helper `resolveProfileVitalitySignals` invoked DOAR la Stage 2 ADJUSTMENT compose phase. Pure function, testabil isolate.

**Vitality null handling (T0/T1 user, sau T2+ skipped):**
- Cluster helper detects `vitalityResult.tier === 'none'` → fallback: Profile Typing flags consumed as-is, no merge needed.
- Profile Typing dimension recommendations active independent. NO degraded mode.
- Trace logs explicit `vitality: 'no_data'` pentru transparency.

### DP-3: Overlap signal handling — keep existing flags vs drop overlapping vs prefix-only

Vezi secțiunea finală update.

### Implementation notes

- Helper `resolveProfileVitalitySignals` + `detectOverlap` în `src/engine/decisionCluster.js`. Tested cu mock combinations: (Profile=Sprinter, Vitality=LOW), (Profile=Marathon, Vitality=HIGH), (Profile=Strategic, Vitality=null), (Profile=null, Vitality=LOW), etc.
- Trace structure consumed de CDL `proposed.rationale.overridden` (ADR 011 + ADR 018 §3) — overlap entries logged cu source attribution. Audit-friendly.
- Reconciliation prompt UX (ADR 014 §4) NU affected by Vitality. Profile = identitate, Vitality = stare. Cross-feed în UI prompt = reserved pentru v2 dacă signal warrants (currently NO planned trigger).

---

## Update 2026-04-27 — Tier-Aware + ADR 018 Integration

### Changelog

3 secțiuni noi adăugate post-ADR 014 sign-off (26 apr 2026):

1. **Tier-Based Personalization Pattern** — Profile Typing activation gated pe ADR 009 calibration tier. T0 skip = engine demographic prior. T1+ activate cu confidence reflectând data quality.
2. **Plugin Architecture Integration (ADR 018)** — Profile Typing implementată ca dimension în registry per ADR 018 §1-§3 contract. Stage ADJUSTMENT, priority 65, feature flag `profile_typing_v1` rollout 1.0.
3. **Reconciliation cu Vitality Layer (ADR 016)** — Independent dimensions per ADR 016 DP-3. Cluster cross-reference helper `resolveProfileVitalitySignals`. Source-attributed signal merging. Volume multiplier compose multiplicativ.

### NU modificat

Existing spec preserved verbatim:
- Q1-Q5 wording v1 strategic (§2)
- Scoring rules + edge cases (§3)
- Reconciliation flow 5+1 cases + decline behavior + frequency cap (§4)
- Friction modal HIGH tier wording + typing confirmation (§5) — actualizat indirect prin TASK #7 implementation 27 apr (data-injection wording, vezi DECISION_LOG)
- Storage strategy `profile-history` separate localStorage key (§6)
- Alternatives + trade-offs + reconsideration triggers + resolved questions
- Empirical calibration parameters

### Cross-refs nous

- [[016-vitality-layer]] — DP-3 ADR 016 (independent dimensions decision)
- [[018-engine-extensibility-architecture]] — DP-1 până DP-7 ADR 018 (plugin contract foundation)

---

## Decision Points — Daniel Sign-Off Required (Update 2026-04-27)

3 decision points marcate pentru update. Decisions cosmetic (priority numeric exact 65, helper naming `resolveProfileVitalitySignals`, registry order Profile înainte Vitality) decise în-line cu rationale scurtă.

### DP-1: Profile Typing tier gating — T0 immediate vs T1 INITIAL vs T2 PERSONALIZING

**Options:**
- **A:** T0 immediate — Profile Typing recommendations active de la prima sesiune dacă onboarding completed
  - Pros: maximum personalization speed; user care complete onboarding day 1 simte imediat efectul
  - Cons: self-report bias la putere maximă; behavioral inference NU disponibil până sesiunea 12+, deci primul 1-3 săpt = pure self-report fără counter-balance. Risk: user "Strategic" claim fals → engine learns greșit pre-correction
- **B:** T1 INITIAL (7+ zile + 3+ sesiuni) — Profile Typing recommendations active după minimum tier threshold
  - Pros: respectă ADR 009 calibration tier semantic; demographic prior gives way la user signal după minimum data; aliniat cu Memory rule #25
  - Cons: 7-day delay între onboarding completion și Profile Typing impact (acceptabil — cold-start session disponibil)
- **C:** T2 PERSONALIZING (28+ zile + 12+ sesiuni) — Profile Typing recommendations active DOAR post-reconciliation eligibility
  - Pros: behavioral inference disponibil de la start; self-report bias counter-balanced
  - Cons: 28-day delay = personalization lag mare; engine = generic 4 săpt chiar dacă user complete onboarding day 1

**Recommendation:** B — T1 INITIAL activate. Match ADR 009 + Memory rule #25 + Daniel articulation 27 apr. T0 immediate = bias risk. T2 only = lag prea mare. T1 = balanced — minimum data threshold + self-report-only acceptabil cu confidence flag medium.

**Need Daniel sign-off:** YES

---

### DP-2: Profile Typing stage assignment — ADJUSTMENT primary vs ENHANCEMENT only vs hybrid

**Options:**
- **A:** ADJUSTMENT primary — Profile Typing emits recommendations care modifică session content (volume cap per Sprinter, progression rate per Marathon, deload tolerance per Yo-yo)
  - Pros: Profile Typing has real coaching impact; leverages discrimination power la maximum; per-profile session adjustments = key differentiator vs generic apps
  - Cons: per-profile adjustment logic adds spec complexity; risk de bugs în volume compose dacă Profile Typing + Vitality + AA stack
- **B:** ENHANCEMENT only — Profile Typing affects banner/wording/tone DOAR
  - Pros: simplest implementation; zero risk pe session content; existing engine logic unchanged
  - Cons: Profile Typing reduced la UI theatre; effort onboarding (Q1-Q5) doesn't translate to coaching impact; user reaction "completed survey for nothing"
- **C:** Hybrid — ADJUSTMENT pentru AA threshold calibration only (cross-reference în cluster), ENHANCEMENT pentru everything else
  - Pros: focused integration via AA cross-reference (already specified ADR 016 + 013); minimal session content changes
  - Cons: secondary Profile Typing impact (volume cap, progression rate) unused — wastes self-report bandwidth

**Recommendation:** A — ADJUSTMENT primary cu ENHANCEMENT secundar (mixed actions în same dimension, routed per stage de cluster). Profile Typing has real coaching value, NU UI theatre. Existing ADR 014 design intent (4 profile differentiation) requires ADJUSTMENT-level impact. Implementation complexity acceptable post-ADR 018 plugin foundation.

**Need Daniel sign-off:** YES

---

### DP-3: Overlap signal handling Profile Typing ↔ Vitality — keep all flags vs drop overlapping vs prefix-only

**Options:**
- **A:** Keep all existing flags. Cluster helper attributes source (`src: 'PROFILE_TYPING'` / `src: 'VITALITY'`). NO deduplication. Both dimensions independent.
  - Pros: Profile Typing works fully independent (Vitality null at T0/T1 sau skipped → Profile flags fallback); signal redundancy = robustness; explicit trace per source
  - Cons: double-counting risk dacă cluster aggregation naive; test surface complex (multiple overlap combinations)
- **B:** Drop overlapping flags from Profile Typing — Profile Typing emits doar pure profile-derived flags (`'sprinter_intensity_craving'`, `'marathon_consistency_need'`, etc.). Overlapping flags (`'high_stress'`, `'low_motivation'`) DOAR în Vitality
  - Pros: clean separation, no double-counting, easy mental model
  - Cons: Profile Typing scope reduced; if Vitality null (T0/T1, sau T2+ skipped), Profile typing loses fallback signal; effective regression vs ADR 014 existing scope
- **C:** Prefix-only — Profile Typing keeps existing flags but renames cu `pt_` prefix (`pt_high_stress`, `pt_low_motivation`). Vitality keeps `vit_` prefix
  - Pros: explicit trace, debugging-friendly, no logic change
  - Cons: doesn't solve double-counting (just makes it visible în logs); cluster aggregation logic still needs explicit handling

**Recommendation:** A — Keep all flags + source attribution. Vitality is opt-in (T2+ AND user complete) — Profile Typing must work independent fallback. Cluster helper handles overlap explicit cu source trace; double-counting prevented prin recommendation priority compose (ADR 018 §3), NU prin signal dedup.

**Need Daniel sign-off:** YES

---

## Sign-Off Update — 2026-04-27

Daniel approved 3/3 decision points update.

- DP-1 Tier gating: B — T1 INITIAL (7+ zile + 3+ sesiuni) APPROVED
- DP-2 Stage assignment: A — ADJUSTMENT primary cu ENHANCEMENT secundar APPROVED
- DP-3 Overlap signal handling: A — Keep all flags + source attribution APPROVED

---

*ADR 014 — Accepted 2026-04-26. Update 2026-04-27 ACCEPTED cu tier-aware + ADR 018 plugin integration + ADR 016 reconciliation. Status: ready pentru spec EXEC_QUEUE follow-up.*
