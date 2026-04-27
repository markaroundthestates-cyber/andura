# ADR 014: Onboarding UI + Profile Typing (Anti-Bias Framework)

**Status:** Accepted
**Date:** 2026-04-26
**See also:** [[011-coach-decision-log-architecture]] | [[013-auto-aggression-detection]] | [[001-local-first-storage]] | [[DECISION_LOG]] | [[PROJECT_VISION]]

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

*ADR 014 — Accepted 2026-04-26 după strategic discussion + storage decision triangulated. Status: ready pentru spec EXEC_QUEUE follow-up (Onboarding component + Reconciliation prompt + Friction modal + profileHistory storage layer + Integration).*
