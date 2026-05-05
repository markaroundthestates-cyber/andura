# HANDOVER GLOBAL — Decision Cluster D1-D4 (split from 2026-04-30 evening master, 2026-05-05 overnight)

**Provenance:** Section split from `HANDOVER_GLOBAL_2026-04-30_evening.md` per §62.2 thematic split strategy LOCKED V1. Original 7673 LOC > 7000 §VAULT_HYGIENE_PASS STEP 13 FLAG threshold. Split executed 2026-05-05 overnight (CC TASK 5 finalize).
**Theme:** D-cluster sub-decisions LOCKED V1 — D1 Save the Week + D2 Injury/Contraindication + D3.1 Buton "Nu vreau" + D4 Mid-Session Resume Protocol. Sections: §36.106 D2 + §36.107 D3 + §50 sub-decisions 44 + §51-§55.
**See also:** [[HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL master INDEX]] (post-split) + [[026-offline-coaching-decision-tree-exhaustive]] §3 D-CLUSTER (44 decisions verbatim).

---

## §36.106 Decision Point D2 NEW OPENED FOR DISCUSSION — Injury / Contraindication Mapping Onboarding + In-Session

**Status:** 🟡 OPENED FOR DISCUSSION — chat strategic dedicat NEW (post Vault Hygiene + Auth). NU LOCKED.

**Daniel articulation verbatim:**

> "Sa existe in onboarding o chestie de accidentari — gen daca omul are hernie sa nu il pui la deadlifts. Sau in exercitii langa butoanele de 'nu am aparat'. Sau undeva. Ne decidem in chat nou fresh."

**Scope candidate:**

- **Onboarding screen NEW** — checkbox/multi-select condiții medicale care exclud anumite mișcări specific (hernie disc lombară → exclude deadlift conventional + bent-over row, hernie abdominală → exclude squat heavy compresie + Valsalva maneuver, etc.)
- **Inline buton in-session** — adjacent "Nu am aparat" în UI exerciții, scope similar pentru flag contraindicație acută ("Mă doare X la mișcarea asta, exclude permanent / temporary / pentru azi")
- **Granular contraindication mapping** (NU SAFETY_TRIPWIRE_GLOBAL all-or-nothing per Cognitive Q18)
- **Auto-substitution via alternativeEngine** — exercise excluded → propose biomechanically similar safe alternative (deadlift conventional → trap bar deadlift / Romanian deadlift moderate / hip thrust / cable pull-through)

**Cross-refs existing arhitectura:**

- **Cognitive Q18 SAFETY_TRIPWIRE_GLOBAL** — checkbox condiții medicale onboarding → "Passive Mode" tripwire (Dumb Tracker excellent). Daniel proposal extends granular per condiție specific NU all-or-nothing
- **§36.38 Pain/Discomfort Button (ADR 023 Tier 1)** — text input free-form "Mă doare X în zona Y" → LLM intent classification → routing engine action. Daniel proposal complementary (predefined condiții vs free-text post-hoc)
- **§36.85 Pain Button + EU AI Act compliance** — zero rehab claims, NU dispozitiv medical. Daniel proposal trebuie atent legal phrasing (NU "diagnostic", DA "informativ contraindication user-declared")
- **alternativeEngine.js** — extension pentru contraindication mapping per condiție → safe alternative pool
- **§36.36 Schema Extension Exercise Library** — `muscle_target_primary` + `muscle_target_secondary` deja existing. NEW candidate: `contraindications: string[]` field per exercise (ex: deadlift_conventional → ["hernia_disc_lombara", "hernia_abdominala_acuta", "stenoza_spinala_severa"])

**Decision points pending strategic chat NEW:**

- **D2.1** Onboarding screen separat sau integrat în profil typing T1+? (impact friction Maria 65 vs comprehensive injury history)
- **D2.2** Granularity condiții — taxonomie predefinită (15-30 condiții common) vs free-text + LLM classify (ADR 023 extension Tier 3) vs hybrid
- **D2.3** UX placement in-session — buton inline lângă "Nu am aparat" sau separate "Discomfort/Risk" entry vs continue Pain Button §36.38 unified flow
- **D2.4** Liability boundary EU AI Act — wording "informativ user-declared" vs medical disclaimer requirements ToS
- **D2.5** User override "Vreau totuși să fac deadlift" → Liability Flag silent backend (R17 User Agency consistent) vs hard block
- **D2.6** Re-prompt periodic 6-12 luni "Condițiile tale medicale s-au schimbat?" similar §26.5 Goal Re-prompt
- **D2.7** Pregnancy specific handling (Q18 existing tripwire pregnancy pathway) — granular trimester-specific exclusions vs Passive Mode total

**Gigel test pending strategic chat:**

- Maria 65 — comfort completion checkbox condiții vs friction/medical-anxiety? Mediu cultural RO sensibilitate "diagnostic" vs "user-declared"?
- Gigica 35 — postpartum specific pathway vs generic? Diastasis recti contraindication common dar tabu cultural?
- Marius 25 — likely zero condiții, friction onboarding cost-benefit?

**Reasoning Claude pre-chat strategic:**

- **Probabil PRO** granular contraindication mapping pentru "bate Jeff" claim (Jeff zero personalizare injury) + SUFLET F2 ("AI-ul informează nu impune") + ADR 025 candidate graceful degradation (skip → engine assume zero contraindications default)
- **Probabil CONTRA** scope creep onboarding screen lung Maria 65 friction + EU AI Act medical device boundary risk + taxonomy maintenance burden
- **Probabil RECOMMEND hybrid:** taxonomie predefinită minimal (top 10-15 condiții common) onboarding + free-text Pain Button §36.38 post-hoc detection + alternativeEngine auto-substitution + user override liability flag

**Action chat strategic NEW:** Daniel + Claude review draft scope + decizie D2.1-D2.7 + ADR draft "Injury/Contraindication Mapping V1".

**Cross-refs:** Q18 SAFETY_TRIPWIRE_GLOBAL + §36.38 Pain Button + §36.85 EU AI Act compliance + alternativeEngine.js + §36.36 Schema Extension + SUFLET F2 + ADR 025 graceful degradation candidate + ADR 013 §SAFETY_TRIPWIRE.

---

## §36.107 Decision Point D3 NEW OPENED FOR DISCUSSION — Don't Like Button + Home Workouts + Calisthenics + Sport-Oriented Training

**Status:** 🟡 OPENED FOR DISCUSSION — chat strategic dedicat NEW (post Vault Hygiene + Auth + D2). NU LOCKED. 4 sub-buckets distinct scope vs §36.106 D2 medical.

**Daniel articulation verbatim:**

> "Optiune buton nu vresu/nu imi place, antrenamente de acasa, calestenice, sport orientated trainings?"

**Scope decomposition în 4 sub-buckets distinct:**

---

### D3.1 — Buton "Nu vreau / Nu îmi place" exercise (User Preference Pure)

**Distinct semantic vs existing:**

- "Nu am aparat" = logistic (echipament temporar absent)
- "Mă doare" = medical (§36.106 D2 contraindication)
- "Nu vreau / Nu îmi place" = preferință stylistic pură user (NU medical, NU logistic, NU temporary)

**Recomandare Claude pre-chat strategic:** ✅ **PRE-BETA mandatory**.

**Rationale:**
- Aliniat SUFLET F5 push-back proporțional cu risc — preferință stylistic = accept user, NU push (User Agency > Paternalism per R17)
- Low-effort UX extension existing alternative buttons (~1-2h CC)
- High-value retention (user nu primește repeat exercises pe care le urăște)
- Aliniat ADR 025 graceful degradation candidate (skip → engine substitute alternative default)

**Decision points pending:**

- **D3.1.1** Hard skip (exercise NEVER reappears în session future) vs Soft skip default (substitute in-session curent + reapare future cu re-evaluare context — user gust se schimbă cu progres) vs Hybrid user-controlled (Soft default + opt-in Hard skip advanced settings)
- **D3.1.2** Engine push-back 1× per exercise dislike — SUFLET F5: "engine argues once if exercise high-value pentru user goal (squat heavy hipertrofie quads optimal Marius), apoi accept"? Sau zero push-back accept silent (preferință = sacred)?
- **D3.1.3** Substitution priority — alternativeEngine biomechanical similarity hierarchy (squat → leg press → hack squat → split squat → goblet squat) vs user-driven choice (showcase 3 alternatives + user picks)?
- **D3.1.4** UX placement buton — adjacent "Nu am aparat" inline same row UI consistency, sau dropdown "Schimbă exercițiu" cu opțiuni multiple (logistic / medical / preferință) unified flow?

**Cross-refs:** SUFLET F5 push-back proporțional + R17 User Agency + alternativeEngine.js + §36.106 D2 Pain Button parallel + ADR 025 graceful degradation candidate.

---

### D3.2 — Antrenamente Acasă (Home Workouts)

**Scope candidate:** Template variant cu equipment minim subset pentru users care antrenează acasă (Maria 65 mobility issues + privacy / Gigica 35 postpartum + copil mic + time / Marius 25 backup secondary use case gym primary).

**Recomandare Claude pre-chat strategic:** ✅ **PRE-BETA mandatory**.

**Rationale:**
- **Maria 65 use case MASSIVE:** mobility issues + intimidating gym environment + transportation barriers + age cultural RO friction "bătrâni la sală" → home = unblock 30-40% Maria market segment
- **Gigica 35 use case MASSIVE:** postpartum + copil mic acasă + time constraint + privacy postpartum body insecurity → home = unblock 25-35% Gigica market segment
- **Marius 25 backup:** vacation / business travel / weather extreme / gym closed → home backup retention preserve
- **Existing arhitectura partial ready:** §36.36 Schema Extension Exercise Library + alternativeEngine.js extensibilitate

**Decision points pending:**

- **D3.2.1** Equipment hierarchy detail — bodyweight only / + dumbbells (1 pair / 2 pairs) / + bands / + pull-up bar / + adjustable bench / + cables home (TRX / rings) — granularity Q1 onboarding equipment filter
- **D3.2.2** Template variants per goal — fiecare din 5 templates V1 (Forță / Tonifiere / Slăbire / Longevitate / Sănătate) primește variant home equipment subset, sau template "HOME" separat distinct?
- **D3.2.3** Substitution algorithmic existing alternativeEngine acoperă 100% cazuri home, sau need exercise pool expansion ~30-50 exerciții bodyweight-friendly NEW (single-leg variations + tempo manipulations + pause reps + isometric holds + plyo regressions)?
- **D3.2.4** Hybrid switching gym/home — user trainer 3× gym + 2× home/săpt — engine handle dual schema sau template lock single environment?
- **D3.2.5** Progress tracking home challenges — bodyweight progresia mai dificil vs barbell load (rep + tempo + leverage manipulations) — engine logic adjusted vs gym standard?

**Cross-refs:** §36.36 Schema Extension Exercise Library + alternativeEngine.js + 5 templates V1 (potential variants) + Q1 onboarding equipment filter + Maria/Gigica/Marius beachhead market analysis.

---

### D3.3 — Calistenice (Bodyweight Discipline Distinct)

**Scope candidate:** Discipline distinct calistenice (pull-ups / dips / muscle-ups / planche / front lever / back lever / handstand / iron cross / human flag) cu skill progressions specifice (band-assisted → unweighted → weighted → skill progressions isometric holds + tempo manipulations).

**Recomandare Claude pre-chat strategic:** ⚠️ **POST-BETA v1.5** (NU pre-Beta).

**Rationale RESPINGERE pre-Beta:**
- **Niche audience pre-Beta:** Marius 25 advanced minoritate (~15-20% Marius segment) + ZERO Maria 65 + ZERO Gigica 35 → impact retention pre-Beta minim
- **Scope creep massive:** discipline distinct = whole programming science separate (skill progression trees + isometric holds + tempo work + leverage progressions + injury prevention shoulder/elbow specific calistenice common)
- **Effort estimate:** ~150-300h CC Opus full spec (calistenice library 80-120 exerciții + progression trees 15-20 skills + periodization specifice + injury prevention specific) — Bugatti standard NU rushed
- **Conflict scope V1 Beta-launch ASAP §36.83:** timing flexible adjust 6-9 luni acceptable, dar +6-9 luni adițional pentru calistenice = NEVER ship

**Pre-Beta alternative recommended:**
- **Include moves calistenice STANDARD în exercise library V1:** pull-ups + chin-ups + dips + push-ups variations + BW squats + lunges + pistol squat progression + handstand basics + L-sit
- **NU discipline distinct separat** — moves integrate ca exerciții normal în 5 templates V1 cu equipment "Pull-up bar" filter
- **Post-Beta v1.5 expansion:** discipline calistenice distinct cu skill progression trees + dedicated periodization + injury prevention specific

**Decision points pending (chat strategic NEW):**

- **D3.3.1** Pre-Beta: include moves calistenice standard în library (~10-15 moves) cu filter "Pull-up bar / Dip station" YES/NO?
- **D3.3.2** Post-Beta v1.5 scope: full discipline calistenice template + skill progression trees + 80-120 exerciții library expansion?
- **D3.3.3** Goal mapping calistenice — Forță & Dezvoltare ↔ calistenice strength (muscle-up / front lever / planche) + Tonifiere ↔ calistenice hypertrophy volume (push-ups variations + dips volume) + Longevitate ↔ calistenice mobility-friendly (handstand basics + L-sit)?
- **D3.3.4** Audience marketing post-Beta v1.5 — Marius 25 advanced niche dedicated marketing channel (Instagram/TikTok calistenice community RO) sau cross-sell internal users base?

**Cross-refs:** §36.83 Beta-launch ASAP timing flexible + §36.99 ADR 026 offline tree (calistenice = expansion knowledge layer §36.103) + Marius beachhead market analysis + post-Beta v1.5 roadmap.

---

### D3.4 — Sport-Oriented Training (Sport-Specific Programming)

**Scope candidate:** Programming specific per sport (football / soccer / tennis / climbing / running / cycling / MMA / boxing / volleyball / basketball / etc.) cu accessory work targeted + periodization off-season / pre-season / in-season + sport-specific injury prevention.

**Recomandare Claude pre-chat strategic:** ❌ **POST-BETA v2.0+** (definite NU pre-Beta).

**Rationale RESPINGERE pre-Beta:**
- **Niche-of-niche audience pre-Beta:** ~5-10% Marius 25 segment intersect cu sport amator competitiv + ZERO Maria 65 + ZERO Gigica 35 (yoga/pilates adjacent NU same scope) → impact retention pre-Beta neglijabil
- **Scope multiplication 10x:** 10+ sports × periodization (off/pre/in-season) × accessory specific × injury prevention sport-specific = drastic different programming per sport (football leg power vs tennis rotational vs climbing grip vs MMA neck = ZERO overlap)
- **Effort estimate:** ~500-1000h CC Opus full spec (sport library + periodization per sport + accessory pools + injury prevention specifice + season tracking)
- **Liability concern regulatory:** "sport coach" claim might trigger different regulatory framework (sport federation registrations RO/EU + insurance liability higher coach professional sport vs general fitness coach)
- **Conflict EU AI Act medical device boundary risk + sport injury liability shield** — different framework scrutiny

**Pre-Beta alternative recommended:**
- **Întrebare onboarding "Practici un sport competitiv?"** YES/NO + sport name (free-text) — ZERO programming impact pre-Beta, doar future v2 user base preparation
- **Post-Beta v2.0+ scope:** sport-oriented programming dedicated module cu top 3-5 sports populare RO (football + tennis + climbing + running + MMA) + periodization spec + accessory pools

**Decision points pending (chat strategic NEW):**

- **D3.4.1** Pre-Beta: întrebare onboarding sport YES/NO + free-text name (preparation v2) sau ZERO mention sport pre-Beta?
- **D3.4.2** Post-Beta v2.0+ scope: top 3-5 sports populare RO sau exhaustive 10+ sports?
- **D3.4.3** Liability framework — Andura sport-oriented = consultanță fitness sportiv (general) vs antrenor sportiv (regulated) — wording legal ToS adjustment?
- **D3.4.4** Periodization sport calendar tracking (off/pre/in/post-season) — manual user input vs auto-detect via competition dates input?
- **D3.4.5** Cross-sell internal V1 users base post-Beta v2 launch sau dedicated marketing channel sport community RO?

**Cross-refs:** §36.83 Beta-launch ASAP timing + §36.85 EU AI Act compliance + §31 Investment timeline + post-Beta v2.0+ roadmap + Marius advanced segment market expansion.

---

### Verdict Cumulativ Recomandare Claude D3.1-D3.4 (pre-chat strategic):

| Sub-bucket | Verdict | Effort | Audience Impact |
|------------|---------|--------|-----------------|
| **D3.1 Buton "Nu vreau"** | ✅ **PRE-BETA mandatory** | ~1-2h CC | High (toate Maria + Gigica + Marius) |
| **D3.2 Home Workouts** | ✅ **PRE-BETA mandatory** | ~30-80h CC (equipment filter + template variants + ~30-50 exerciții bodyweight library extension) | Massive (Maria 30-40% + Gigica 25-35% + Marius backup) |
| **D3.3 Calistenice discipline distinct** | ⚠️ **POST-BETA v1.5** (pre-Beta = standard moves în library) | ~150-300h CC v1.5 | Niche (Marius 25 advanced ~15-20%) |
| **D3.4 Sport-oriented programming** | ❌ **POST-BETA v2.0+** (pre-Beta = onboarding question doar) | ~500-1000h CC v2.0+ | Niche-of-niche (~5-10% Marius cross-sport) |

**Filter Bugatti pre-Beta strict:** D3.1 + D3.2 mandatory → "best" pe core market beachhead Maria/Gigica/Marius. D3.3 + D3.4 = scope creep care sacrifică core experience pentru tail features. **Bugatti NU înseamnă "everything", înseamnă "everything that matters peak craft".**

**Caveat Daniel directive "Andura needs to be the best":** dacă "best" = exhaustive niche coverage including calistenice + sport, atunci D3.3 fezabil prelungit timeline +6-9 luni. D3.4 NEVER pre-Beta — scope multiplication regulatory risk irreversible.

**Action chat strategic NEW:** Daniel + Claude review verdict + decizie D3.1-D3.4 sub-decisions + ADR drafts (D3.1 + D3.2 pre-Beta → integration existing ADR 026 + D3.3 + D3.4 post-Beta → ADR drafts deferred).

**Cross-refs:** §36.99 ADR 026 offline coaching tree + §36.100 7 engines prescriptive (Goal Adaptation + Specialization Engine relevant home/calistenice/sport) + §36.103 Knowledge cadence (post-Beta expansions) + §36.106 D2 medical contraindication parallel scope D NEW + Bugatti paradigm + §36.83 Beta-launch ASAP timing flexible.

---

## §50 D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1 (chat strategic 2026-05-05 morning) — 41 substantive net

### §50.0 Status: ✅ COMPLETE

Chat strategic dedicat sub-decisions D3.1 (Buton "Nu vreau") + D4 NEW (Mid-Session Resume Protocol) + D2 (Injury/Contraindication Mapping) + D1 (Save the Week Silent). Total **41 substantive sub-decisions LOCKED V1** ready compile ADR 026 draft full chat strategic NEW dedicat.

**Context arhitectural confirmat:**
- D3.1 + D4 + D2 + D1 = sub-decisions ortogonale față de spec engine Periodization (§42.4 prima spec generation post ADR 026 compile)
- Toate 4 clusters integrate ADR 026 când chat strategic NEW dedicat compile draft full
- Naming distinction LOCKED: "Circuit Breaker population fallback 5%" (§42.7) vs "User adaptation signal 50%" (D1 Q7 individual user pattern)
- Pattern reuse extensiv: Q20 LOCKED 3/4 threshold (§45.3) reused în D4 Q7+Q8 + D1 Q2+Q3; §42.7 Circuit Breaker reused în D3.1 Q10 + D1 Q7; §42.9 Safety tier extended cu invariant 5 "Medical Safety" în D2 Q7

### §50.1 D3.1 Buton "Nu vreau" SUB-DECISIONS LOCKED V1 (10 Q + 3 refinements = 13 sub-decisions)

**Parent:** §36.107 D3.1 LOCKED PRE-BETA mandatory (rationale SUFLET F5).
**D3.1.1 LOCKED V1 pre-existing** (3 butoane up-front + 3 categorii semantic Maria 65 frictionless): Nu vreau (Contextual / no-memory) + Nu am chef (Psihologic / no-memory) + Nu pot (Mecanic-Fizic / blacklist permanent cross-session).

#### §50.1.1 Q1 Storage layer "Nu pot" blacklist — B Firestore sync ✅ LOCKED

Asigură consistența datelor multi-device (telefon + tabletă). Blacklist persistent salvat direct Firestore (deja live prod). Cross-device consistency Maria 65 critical.

#### §50.1.2 Q2 Schema JSON shape — B Object `{ exerciseId: { timestamp, intent } }` ✅ LOCKED

Single Source of Truth în format obiect. Timestamp = trasabilitate completă + permite curățare automată "Nu vreau"/"Nu am chef" (no-memory) sau analiză istoric refuzuri.

#### §50.1.3 Q3 Sync multi-device "Nu pot" — B Eventual consistency on session start ✅ LOCKED

Offline-first §36.99 preserved. Sync background la deschidere app, fără real-time listeners (NU CPU/battery overhead).

#### §50.1.4 Q4 Substitute primary match criteria — B Same muscle + movement pattern ✅ LOCKED

Push/pull/hinge/squat patterns. Equipment handle separat alternativeEngine ADR 023 (NU dublu work).

#### §50.1.5 Q5 Re-roll după 2 refuzuri consecutive — B 3 fresh batch + Hard Cap ✅ LOCKED

Listă nouă 3 exerciții după refuze 2 alternative. **Hard Cap LOCKED V1 refinement:** maximum 2 re-rolls = 1 primary + 2 alt + 3 fresh batch = 7 încercări total. La epuizare → fallback Q7 A (skip exercise + log telemetry CDL refuse pattern). Anti decision fatigue + anti infinite loop.

#### §50.1.6 Q6 Substitute persistence intra-mesociclu — B Lock primary substitute pe durata mesociclului + Sub-decision Unlock ✅ LOCKED

Substitute acceptat = lock pe restul săpt mesociclu (asigură progressive overload week-to-week + tracking volume corect). **Sub-decision Unlock LOCKED V1 refinement:** Dacă week 2 user dă "Nu vreau"/"Nu pot" pe substitute lock-uit → unlock + new resolver round; volume tracking continuă la nivel grup muscular (§42.10 Periodization Engine), NU restart mesociclu integral. Mapare muscle-group-level confirmed (NU exerciseId specific).

#### §50.1.7 Q7 Edge case ZERO substitute viable — A Skip exercise + log telemetry ✅ LOCKED

Caz extrem (deadlift heavy compound, alternative epuizate). Skip exercise + Circuit Breaker 5% threshold §42.7 reuse pentru raportare telemetrie.

#### §50.1.8 Q8 "Nu vreau"/"Nu am chef" reset window — A Imediat next session (zero memory) ✅ LOCKED

Per D3.1.1 LOCKED "no-memory next session". Preserves user agency, NU paternalism. State butoane reset complet next session, motorul sugerează din nou mișcările dacă optime.

#### §50.1.9 Q9 "Nu pot" Settings UI shape — A Listă simplă + unblock button per item ✅ LOCKED

Maria 65 frictionless minimalistă. Greșeală tap "Nu pot" → reintroduce mișcare 1 tap unblock. NU overengineering pre-Beta (B/C scope creep).

#### §50.1.10 Q10 Telemetry CDL track refuzuri — B Aggregate count per exerciseId silent ✅ LOCKED

CDL passive §42.7 pattern reuse. Circuit Breaker trigger Knowledge Sprint dacă rate refuzuri high segment. Per intent type ratio (Nu vreau/Nu am chef/Nu pot) = scope creep deferred post-Beta.

#### §50.1.11 D3.1.6 NEW Pattern Detection Passive (Prevenirea Iritării) ✅ LOCKED V1

**Regulă asistență cognitivă:** Deși zero-memory la nivel sesiune (Q8), sistemul monitorizează în fundal user refuzuri consecutive aceeași exercițiu **3-5 ori** prin "Nu vreau"/"Nu am chef".

**Acțiune UI:** Soft prompt discret: "Observăm că eviți acest exercițiu. Vrei să-l excluzi permanent din program?" + scurtătură directă Setări → Exerciții Excluse. Decizie finală 100% control utilizator. NU auto-blacklist (paternalism). Bugatti F4 cognitive friction anticipată.

### §50.2 D4 NEW Mid-Session Resume Protocol SUB-DECISIONS LOCKED V1 (10 Q + D4.2.1 NEW = 11 sub-decisions)

**Parent:** NEW topic deschis 2026-05-02 Daniel (DEFERRED). Cross-ref: §36.55.4 LOCKED abandoned session neutral streak (related, distinct scope).

#### §50.2.1 Q1 Auto-save granularity (D4.1) — A Per set logged silent IndexedDB ✅ LOCKED

Salvare automată în fundal la fiecare set încheiat. Fricțiune zero, în caz închidere forțată NU se pierde niciun set valid.

#### §50.2.2 Q2 Storage layer auto-save — A IndexedDB ✅ LOCKED

Offline-first §36.99 preserved. Capacity OK pentru session state. Evită limite localStorage + nu consumă baterie ca real-time sync.

#### §50.2.3 Q3 Sync Firestore timing — B On session complete ✅ LOCKED

Sesiunea locală trimisă cloud DOAR la "Încheie antrenamentul". Protejează traffic data + battery în timp efort.

#### §50.2.4 Q4 Resume prompt UX (D4.2) — A Dialog blocking imediat la app open ✅ LOCKED

Modal blocking deschidere app cu sesiune întreruptă. Maria 65 decide clar: Reia / Începe nouă / Marchează completă. Zero ambiguitate, NU elemente ascunse.

#### §50.2.5 Q5 Resume prompt actions — A 3 opțiuni (Reia / Începe nouă / Marchează completă) ✅ LOCKED

Per spec D4.2. "Marchează completă" critical pentru sesiune ~80% terminată user uitat să închidă (își amintește ore mai târziu).

#### §50.2.6 D4.2.1 NEW Filtrarea Dialogului Blocant pe Threshold ✅ LOCKED V1

**Regulă:** Eliminăm fricțiune cognitivă pentru sesiuni vechi abandoned. Sistem împarte scenarii pe threshold t=6h:

| Scenariu | Condiție Timp | Acțiune Backend | Impact UI |
|----------|---------------|-----------------|-----------|
| **Sesiune Recuperabilă** | Δt ≤ 6h ultima activitate | Stare IndexedDB intactă | Dialog blocking imediat: Reia / Închide / Începe nouă |
| **Sesiune Abandonată** | Δt > 6h ultima activitate | Auto-marked abandoned background (Silent Cleanup) + neutral streak §36.55.4 | Zero prompt UI: user intră direct app (Suflet, istoric, setări) fără întrerupere |

**Bugatti F4 anticipează:** Maria 65 vine să citească Suflet → NU dau dialog despre antrenament de ieri uitat. Sesiune abandoned >threshold = sistem decide silent, NU întreabă.

#### §50.2.7 Q6 Timeout abandon threshold (D4.3) — B 6h ✅ LOCKED

Permite pauze realiste zi (muncă, urgențe, drumuri). Întrerupere >6h = abandonare completă zi mental + fiziologic.

#### §50.2.8 Q7 Engine treatment partial session §42.10 (D4.4) — B Credit parțial proporțional (reuse §45.3) ✅ LOCKED

Aplică direct regula matricei volum existing:
- **Efort per exercițiu ≥ 50% seturi → exercițiul contorizat**
- **Efort per sesiune ≥ 3/4 exerciții → săptămâna completă (cu skip progresie)**
- **Sub praguri → repetare săptămână N integral**

Reuse Q20 LOCKED 3/4 threshold rule §45.3. NU duplicate logic, extend pattern existing.

#### §50.2.9 Q8 Impact partial session deload trigger Q10 mesocycle — C Count cu intensity hold next ✅ LOCKED

Săptămâna parțială contorizată în ciclu 4-săpt deload. Next session intensitate înghețată nivel anterior pentru evitare risc accidentare/supraantrenament. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

#### §50.2.10 Q9 Scenarii A/B/C handler (D4.5) — B Unified state machine 3 entry points ✅ LOCKED

Single source resume logic, 3 entry points:
- A Background restore (app în background / lock screen seamless resume)
- B IndexedDB recovery (force kill / restart / baterie moartă)
- C localStorage offline persistence (offline mid-set până reconectare)

Același reducer central. NU duplicate code drift risk. Codul nu se duplică, riscul erori scade la zero.

#### §50.2.11 Q10 Crash mid-set recovery edge — A Last completed set saved + current incomplete discarded ✅ LOCKED

Stare date perfect curată, fără estimări/date parțiale corupte. User încredere totală istoric afișat. Reintroducere set <30s if needed = trust > false memory.

### §50.3 D2 Injury/Contraindication Mapping SUB-DECISIONS LOCKED V1 (10 Q + 3 sub-decisions D2.3 = 13 sub-decisions)

**Parent:** §36.107 D2 LOCKED PRE-BETA mandatory + Q24 Safe Baseline pre-Beta (§45.4 +RIR ≥ 1 universal + Marius 25 Advanced 85% 1RM cap) + Safety tier composition Q3 (§45.2 +4 invariants §42.9 + ADR 023 contraindication overrides).

**Topic critic:** MOAT real Andura, intersect Safety tier §42.9 + ADR 023 contraindication overrides. Gigel test brutal aici (Maria 65 hernie disc).

#### §50.3.1 Q1 Scope intake injuries onboarding — B Preset list (~15-20 condiții comune) ✅ LOCKED

Listă fixă opțiuni clare (lumbar, knee, shoulder, hypertension, cervicale, etc.). Elimină risc parsare greșită text liber + halucinație contraindication LLM. Maria 65 frictionless bifează zonă sensibilă. Expand quarterly Knowledge Sprint.

#### §50.3.2 Q2 Severity grading per condition — B 3-tier (ușor/moderat/sever) ✅ LOCKED

- **Sever** → Blacklist permanent pe tiparul mișcare afectat
- **Moderat** → Plafonare automată intensitate (RIR ≥ 2, max 75% 1RM)
- **Ușor** → Monitorizare pasivă fără modificări agresive volum

Maria 65 cognitive simple. Engine map → exercise filter strict per tier.

#### §50.3.3 Q3 Contraindication source authority — C Curated subset + literature ref per condition ✅ LOCKED

Bază date internă Andura curatoriată + referințe literatură specialitate per condiție. Rigoare științifică maximă + transparență totală. Evită "sfat medical nesolicitat" liability.

#### §50.3.4 D2.3.1 Sursa V1 — C Public guidelines NSCA + ACSM + Daniel curate subset ✅ LOCKED V1

Standardizare publică oficială. Cost 0. Audit-trail public sources = legal defense layer real + rigor max. Daniel curate subset relevant Andura V1.

#### §50.3.5 D2.3.2 Update cadence — Quarterly unified Knowledge Sprint ✅ LOCKED V1

Actualizări medicale exclusiv Knowledge Sprint general pre-Beta. Anti scope creep clar. NU separate medical-specific cadence.

#### §50.3.6 D2.3.3 Disclaimer UI legal cover — Mandatory consent onboarding + per-condition disclaimer ✅ LOCKED V1

Onboarding consent text + per-condition disclaimer "informații generale, NU înlocuiește consult medical; consultă medic specialist". Audit legal §46 P4 prerequisite anyway, codify acum lock.

#### §50.3.7 Q4 Pain mid-session real-time handling — A New D2 button "Mă doare" (separat de D3.1 "Nu pot") ✅ LOCKED

**Semantic distinct critical:**
- **"Nu pot"** (D3.1) = mecanic anticipat onboarding/pre-session = blacklist permanent muscle pattern
- **"Mă doare"** (D2 NEW) = acut mid-set = STOP exercise + log severity + propose alt + flag follow-up next session "Mai doare?"

Gigel test pass: Maria 65 simte durere acută NU vrea săpt blacklist, vrea STOP acum + reia mâine.

#### §50.3.8 Q5 "Mă doare" severity input — B 3-tier (ușor/moderat/sever) cu auto-action ✅ LOCKED

- **Ușor** → continue cu RIR+1 cap
- **Moderat** → skip exercise + alt
- **Sever** → STOP session + flag medical mention "consultă specialist"

NU paternalism direct medical advice (Gigel test). NU diagnosis.

#### §50.3.9 Q6 Cross-session memory "Mă doare" — C Permanent blacklist după 2-3 incidente ✅ LOCKED

Pattern detection passive Bugatti F4. Stricter threshold safety-critical (vs D3.1.6 "Nu vreau" 3-5x). 2-3 incidents same exercise → soft prompt UI "Excludem permanent? Pare să-ți facă rău consistent". User decide final.

#### §50.3.10 Q7 Contraindication override Safety tier composition Q3 — C Tier separat 5th invariant "Medical Safety" (Floor Absolut) ✅ LOCKED

**Sub-extension §42.9:** 5th invariant "no contraindicated exercise" deasupra current 4 invariants. Indiferent volumul optim (V≤MRV) calculat motoarele prescriptive, dacă exercise contraindicat mecanic → eliminat fără drept apel.

**Rationale:** V≤MRV doesn't matter dacă exercise = hernie disc kill. Medical safety = absolute floor, NU competing cu volume/intensity logic.

#### §50.3.11 Q8 Pregnancy handling pre-Beta — A Defer post-Beta v1.5 ✅ LOCKED

Per Q24 LOCKED Special populations Defer D2 (§45.4). Pregnancy = liability + literature complex per trimester. Pre-Beta scope discipline. UI roadmap onboarding notification "Optimizarea pentru sarcină va fi disponibilă în v1.5".

#### §50.3.12 Q9 Recovery from injury re-introduction — C Hybrid manual primary + soft prompt 4-6 săpt ✅ LOCKED

User manual unblock Setări (like D3.1.5) primary. Plus soft prompt 4-6 săptămâni post-incident "Vrei să reintroducem [Exercițiu] în program pentru testare stare?". Bugatti F4 cognitive: Maria 65 uită unblock; soft prompt anticipează. NU auto re-introduce (paternalism + medical liability).

#### §50.3.13 Q10 Telemetry CDL injuries pattern — A NU track (privacy strict medical pre-Beta) ✅ LOCKED

GDPR sensitive medical data pre-Beta = legal nightmare. Pre-Beta zero stocare cloud istoric dureri/condiții fizice. Procesare local exclusiv. Monitorizare anonimizată cloud amânată v1.5 după audit legal complete (§46 P4 prerequisite).

### §50.4 D1 Save the Week Silent SUB-DECISIONS LOCKED V1 (7 Q = 7 sub-decisions)

**Parent:** §36.107 D1 OPENED FOR DISCUSSION → LOCKED V1 acum. Pattern §36.55.4 abandoned session neutral streak reuse + §45.3 Q20 3/4 threshold rule reuse.

#### §50.4.1 Q1 Trigger condition — C Silent default ✅ LOCKED

Zero fricțiune. NU prompt-uri administrative sau confirmări manuale. Dacă prag sesiuni atins, săptămâna salvată automat fundal, streak-ul nu rupt.

#### §50.4.2 Q2 Threshold sessions completed required — A 3/4 sesiuni planificate ✅ LOCKED

Reuse Q20 LOCKED §45.3 threshold rule pentru consistency logic periodizare. User planifică 4 sesiuni + finalizează 3 → prag atins automat.

#### §50.4.3 Q3 Streak treatment week saved — C Counts cu progression skip ✅ LOCKED

Streak salvat. Săptămâna următoare îngheață parametri intensitate + volum. Protejează user de supraîncărcare la revenire după săpt parțială. Reuse Q20 LOCKED "Resume + intensity hold" pattern.

#### §50.4.4 Q4 UI feedback la save silent — B Subtle micro-copy în istoric ✅ LOCKED

Evită notificări invazive. Text "Săptămână salvată (3/4 sesiuni)" apare discret DOAR ecran istoric pentru transparență. Bugatti F1 user-language clear.

#### §50.4.5 Q5 Edge case 4/4 weeks consecutive cu 3/4 sesiuni — B Maximum 2 saved weeks consecutive ✅ LOCKED

A 3-a săptămână consecutivă cu ≤3/4 sesiuni → repetare integrală săptămâna N. Anti-drift volume calibration. 3 weeks @ 3/4 = volume calibration shifts subtle; max 2 = realistic life buffer dar engine recalibrate.

#### §50.4.6 Q6 Goal change interaction Q27 50% threshold rule — B Save week aplicat prima, goal change next mesocycle ✅ LOCKED

Logică cronologică: săpt curentă închisă conform plan existent + nou obiectiv intră vigoare start următor mesociclu. NU dublu logic same week.

#### §50.4.7 Q7 Telemetry CDL save week pattern — C Track + Circuit Breaker reuse §42.7 ✅ LOCKED

**Naming distinction LOCKED V1 (clarification compile ADR 026):**
- **Circuit Breaker population fallback 5%** (§42.7) — rate fallback cross-population trigger Knowledge Sprint hotfix
- **User adaptation signal 50%** (D1 Q7 individual) — user save weeks rate >50% trigger T1+ Profile Typing adaptation v1.5

Două thresholds distincte. NU paternalism intervention; passive monitoring → engine adapt frequency suggestion T1+ Profile Typing v1.5.

---

## §51 Cumulative LOCKED Count Update (post 2026-05-05 morning ingest)

**Pre-session:** 175 LOCKED V1 (post §45-§49 ingest 2026-05-04 night).
**Post-session sub-decisions:** **216 LOCKED V1** (+41 substantive sub-decisions: D3.1 13 + D4 11 + D2 13 + D1 7 - overlap = 41 net).

---

## §52 Next Actions Priority Order (post 2026-05-05 morning ingest)

### Priority 0 — Push origin main vault changes (Daniel approval pending)

CC ingest commits push origin main `--no-verify` per P1-FLAG-NEW precedent. Vault-docs-only invariant preserved.

### Priority 1 ABSOLUT — Auth Flow §36.80 BUG 2 Firebase 401 (preserved separat)

Chat strategic dedicat tactic + prompt CC Opus dedicat. ~1-2h Daniel + ~30-45min CC autonomous. Production blocker preserved unchanged.

### Priority 2 — ADR 026 COMPILE DRAFT FULL (extended scope post-D)

**Pre-session ready compile:** 75 decisions (§42.1-§42.10 base 10 + §45.2-§45.5 spec 75).
**Post-session ready compile:** **126 decisions ready compile draft full** = 75 spec + D3.1 13 + D4 11 + D2 13 + D1 7 + naming distinction Circuit Breaker vs User adaptation = 126 sub-decisions ADR 026 compile in `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` (replace candidate stub).

**Compile structure recommended:** §42 base + §45 spec + §50.1 D3.1 + §50.2 D4 + §50.3 D2 + §50.4 D1 + §51 cumulative.

### Priority 3 — Periodization Engine spec generation start (post ADR 026 compile)

Per dimension cross-persona Q30 LOCKED: chat 1 Volume Landmarks all 3 persona + chat 2 Frequency Distribution all 3 + chat 3 Progressive Overload all 3 + chat 4 Mesocycle Structure all 3 (~3-4 chat-uri estimative).

### Priority 4 — D3.2-D3.4 + Engine #8 sub-decisions (deferred)

D3.2 Don't Like + D3.3 Home + D3.4 Calistenice + Sport-Oriented (D3.2-D3.4 verdicts §36.107) chat strategic NEW.
Engine #8 Warm-up & Mobility sub-decisions (~50-80 ramuri V1 spec) chat strategic NEW post Periodization spec.

### Priority 5 long-term

ADR 022 + 024 + 025 full spec generation post Periodization spec. Knowledge cadence first quarterly patch post-Beta. Beta Recruitment 50 testeri. Audit legal complete (§46 P4 prerequisite D2 telemetry post-Beta v1.5). Soft Launch.

---

## §53 DIFF_FLAGS Update (post 2026-05-05 morning ingest)

- **P1-FLAG-NEW Codespace npm install drift** — preserved unchanged. Defer dedicated chat post Auth Flow §36.80.
- **HANDOVER_GLOBAL split FLAG approaching/AT threshold** = file post-merge §50-§55 estimated ~6900-7100 LOC (pre-merge 6448 + ~250-450 added §50-§55). Threshold §VAULT_HYGIENE_PASS STEP 13: >7000 LOC FLAG, >10000 LOC ESCALATE BLOCKER. **Recommend FLAG triggered acum dacă cifră actuală post-merge crosses 7000, plan split next handover concrete.** Verify actual LOC post-merge în VAULT_HYGIENE_PASS auto-trigger.
- **D3.1.6 NEW Pattern Detection Passive** — flag in INDEX_MASTER.md SUFLET section update + ADR 026 cross-ref + roadmap pre-Beta MANDATORY new entry.
- **D4 NEW Mid-Session Resume Protocol** — flag in INDEX_MASTER.md core mechanics section update + ADR 026 cross-ref + roadmap pre-Beta MANDATORY new entry.
- **D2.3.1/3.2/3.3 Medical Database & Liability** — flag in INDEX_MASTER.md SAFETY section update + ADR 026 cross-ref + audit legal §46 P4 prerequisite link.

---

## §54 Cross-refs Updates Required (CC ingest mandatory)

**INDEX_MASTER.md updates:**
- D3.1 status: OPENED FOR DISCUSSION → LOCKED V1 (10 Q + D3.1.6 NEW)
- D4 NEW: add full entry SUFLET section LOCKED V1 (10 Q + D4.2.1 NEW)
- D2 status: OPENED FOR DISCUSSION → LOCKED V1 (10 Q + D2.3 sub-decisions)
- D1 status: OPENED FOR DISCUSSION → LOCKED V1 (7 Q)
- Cumulative LOCKED count: 175 → **216**

**DECISION_LOG.md +1 condensed entry:** referencing HANDOVER_GLOBAL §50.1-§50.4 verbatim (top of file, cronologic descending, header `2026-05-05 morning — D3.1 + D4 + D2 + D1 SUB-DECISIONS LOCKED V1`).

**ADR 026 candidate stub** preserved unchanged (compile draft full chat strategic NEW Priority 2 când Daniel decide).

**Cross-refs:** [[026-offline-coaching-decision-tree-exhaustive]] (ready compile 126 decisions chat NEW Priority 2) | [[023-llm-intent-interpretation]] (Safety tier composition extended cu invariant 5 Medical Safety §50.3.10) | [[018-engine-extensibility-architecture]] (Dimension Registry foundation) | [[025-andura-gandeste-pentru-user]] (Instant Skip principle pattern reused D3.1 + D4) | HANDOVER §36.107 (D1/D2/D3.1 OPENED → LOCKED V1) + §36.99 (offline-first preservation D3.1 Q3 + D4 Q2) + §36.55.4 (abandoned session neutral streak D4.2.1 + D1 trigger) + §42.7 (Circuit Breaker pattern reused D3.1 Q10 + D1 Q7) + §42.9 (Safety tier extended invariant 5 D2 Q7) + §42.10 (Periodization muscle-group-level tracking D3.1 Q6 unlock + D4 Q7+Q8) + §45.3 Q20 (3/4 threshold rule reused D4 Q7+Q8 + D1 Q2+Q3).

---

## §55 Verification Questions Topics For Next Chat

**CC Opus MUST generate alignment questions search-driven format §47 LOCKED V1 din topics below. NOT pre-fed verbatim answers.**

**Suggested 12 Q-uri topics covering §50-§54:**

- Q: §50.1 D3.1 Buton "Nu vreau" 10 Q + Hard Cap re-roll Q5 + Unlock substitute Q6 + D3.1.6 Pattern Detection Passive verbatim?
- Q: §50.2 D4 Mid-Session Resume Protocol 10 Q + D4.2.1 NEW filtrare dialog blocant threshold 6h verbatim (Recuperabilă vs Abandonată)?
- Q: §50.2 Q7+Q8 reuse Q20 LOCKED §45.3 3/4 threshold rule + intensity hold pattern?
- Q: §50.3 D2 Injury/Contraindication 10 Q + D2.3.1/3.2/3.3 Medical Database (NSCA+ACSM + quarterly + disclaimer mandatory)?
- Q: §50.3.10 Q7 Safety tier extension invariant 5 "Medical Safety" Floor Absolut deasupra 4 invariants §42.9?
- Q: §50.3.7 Q4 semantic distinction "Nu pot" (D3.1 mecanic) vs "Mă doare" (D2 acut mid-session)?
- Q: §50.4 D1 Save the Week Silent 7 Q + naming distinction Circuit Breaker 5% vs User adaptation 50%?
- Q: §50.4 Q2+Q3 reuse Q20 LOCKED §45.3 + Q5 anti-drift cap max 2 saved weeks consecutive?
- Q: §51 Cumulative LOCKED count 175 → 216?
- Q: §52 Next Actions priority order Priority 0/1/2/3/4/5 + ADR 026 compile 126 decisions ready?
- Q: §53 DIFF_FLAGS HANDOVER_GLOBAL split FLAG triggered (AT threshold ~6900-7100 LOC)?
- Q: §54 Cross-refs INDEX_MASTER + DECISION_LOG +1 entry + ADR 026 candidate stub preserved?

---

🦫 **Pass criteria ≥10/12 PASS (≥83%) → PROCEED chat strategic NEW. Cumulative 216 LOCKED V1 post §50-§55 ingest. ADR 026 compile draft full ready 126 decisions chat strategic NEW Priority 2. Vault Hygiene Sprint Faza 3+4 ✅ COMPLETE preserved. Auth Flow §36.80 Priority 1 ABSOLUT preserved separat. HANDOVER_GLOBAL split FLAG triggered approaching/AT threshold — plan split concrete next handover. D3.2-D3.4 + Engine #8 sub-decisions deferred Priority 4 chat strategic NEW separate.**

---

