---
name: SUFLET_ANDURA
description: Filozofia permanentă a engine-ului Andura — "sufletul" sub care toate ADR-urile prind formă. NU este ADR. NU este implementation spec. Referință filozofică citită la fiecare engine module nou pentru verificare aliniere ("Bugatti engineer mândru?" + "e în sufletul andura?" — dual gate).
type: vision-philosophy
status: SSOT new file 2026-05-02 (skeleton — filozofia 12k pending Daniel source upload, translation map V1 LOCKED)
---

# SUFLET ANDURA — Filozofia Permanentă a Engine-ului

> **Status:** SSOT new file create 2026-05-02 sesiune chat strategic Suflet Andura.
> Material filozofic permanent — citit la fiecare moment când construim engine module nou (Engine Forță, Onboarding, Bias Detection, etc.) pentru a verifica aliniere.
> NU este ADR. NU este spec implementare. **Mai sus de ADR — *de ce* construim ADR-urile.**

> **Filter peste filtrul Bugatti:** "Bugatti engineer mândru?" + "e în sufletul andura?" — dual gate.

> **Cross-ref obligatoriu:** TOATE engine modules ADR-uri V1+ trebuie să referențieze acest document pentru filozofie de fundament.

---

## §0 Provenance

**Sursă:** transcript intern al unui chat Claude conversațional cu Daniel pe coaching personal fitness, scris ca "introspection artificială" pentru codificare în Andura engine. Document inițial `Procesul_de_gandire_complet.md` (~12k cuvinte, 15 patterns + 10 funcții pseudocode F1-F10 + linguistic patterns L1-L8 + reflecții meta).

**Daniel verdict:** *"asta e o bucată din sufletul andura"* — material filozofic permanent.

**Sesiunea chat strategic 2026-05-02 a livrat:**
1. Adaptarea sufletului pentru V1 PWA (NU chat) cu Maria/Gigica/Marius beachhead
2. 11 decizii LOCKED noi (RIR adaptiv + 4 moduri UI + Bias Detection observabilă + T1+ onboarding + 3 risc mitigation cascade defense) — vezi `06-sessions-log/HANDOVER_GLOBAL §36.16-§36.26`
3. Acest SSOT new file ca referință filozofică permanentă

---

## §1 Translation Map suflet → V1 codificabil

### §1.1 ~75% replicabil V1 engine deterministic

| Pattern / Funcție | Spec / ADR target |
|-------------------|-------------------|
| **F1 — Triangulation multi-source estimation cu interval** | Estimează parametri (greutate, intensitate) din mai multe surse independente cu interval de încredere. Engine output = range + best estimate, NU single point. |
| **F2 — Bias detection observabilă** (adaptat V1: NU nutrition, doar Volume Creep + Auto-pedeapsă) | Vezi `06-sessions-log/HANDOVER_GLOBAL §36.18 Volume Creep` + `§36.19 Auto-pedeapsă` + `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT). |
| **F3+F4 — Mode detection UI patterns** (NU language analysis, doar event listeners) | Vezi `§36.17 4 Moduri UI` + `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT). |
| **F5 — Push-back proporțional cu risc** | Engine intervention severity scales cu impact decision: minor optimization → silent CDL note, major risk → friction prompt, catastrofic → blocked execution. ZERO paternalism guru-style. |
| **F6 — Adaptive output no-inference** (DEJA LOCKED ADR Pattern 14 existing) | Engine adaptează pe efect observat, NU presupunere cauză. ASK don't IGNORE. Vezi ADR Pattern 14 + `§36.24 Outlier Filter ASK pattern`. |
| **F7 — Causal chains 3 ranked** (adaptat V1: doar pe forță stagnation, NOT nutrition) | Stagnation 4+ săpt → engine propune 3 ipoteze ranked (cel mai probabil → cel mai puțin probabil): (1) volume insuficient, (2) recovery insuficient, (3) tehnică drift. User alege intervenție. |
| **F9 — Antifragile missed sessions** | Sesiune ratată ≠ failure. Engine treat ca data point neutral, NU regression baseline. 1 zi off → continuă next session normal. 3+ consecutive → check-in agency-preserving. |
| **Sequence-dependent phasing** (Faza 1 prepares Faza 2) | Faza 1 onboarding stabilește baseline calibrare. Faza 2 (post 4 sesiuni complete T1+) deblochează personalization tier. NU forțează T1+ înainte de baseline ready. |

### §1.2 ~15% MAI BINE decât Claude conversațional

- **Consistență:** zero drift Maria 65 zi 1 vs zi 365. Engine deterministic = predictabil.
- **Latency:** <100ms vs 3-8s LLM call. User executor mode beneficiază direct.
- **Privacy:** local-first, ZERO cloud inference. ADR 002 REST not SDK + ADR 001 local-first storage.
- **Predictabilitate:** engine determinist NU halucinează. Output verificabil + reproducible.
- **Calibrare bayesian-style real:** luni de date observate, NU in-context conversation slot saturation.

### §1.3 ~10% IRREPLICABLE V1 (defer V2+ sau permanent)

- **Improvisation pe edge case nou nepatinat** — engine deterministic = bun pe known cases, slab pe edge unique. V2+ poate adăuga LLM fallback gated.
- **Conversation depth bidirectional** — Andura V1 = app cu UI, NU chat. Conversational depth out-of-scope.
- **Meta-recunoaștere paste alt AI ca challenge** — irelevant pentru Maria/Gigica/Marius use case.

### §1.4 ~30% V2+ defer

- **Onboarding cronologic complet 12 luni** — V1 T1+ are doar 3 câmpuri minim Gigel-validated (per `§36.22`).
- **Photo quality gate** — NO body comp tracking V1.
- **Bias detection nutrition-based** — NO nutrition tracking V1.

---

## §2 Ce NU se traduce în V1

| Element din suflet | De ce NU în V1 |
|--------------------|----------------|
| "Conversație extensivă" | Andura V1 = app cu UI, NU chat. Mode detection = event listeners (per `§36.17`). |
| "Paste output alt AI" | NU use case Maria/Gigica/Marius. Edge case rar pentru power users V2+. |
| "Yevhen Shein calibrare brutală" | Presupune end-goal vizual encoded (body comp target), Maria 65 NU are. Maria = consistency + autonomie + safety. |
| "Logging precis cerere" | **Contradicting viziunea Andura — ELIMINAT EXPLICIT.** Andura nu cere logging precis. User dă feedback verbal simplu (Ușor/Potrivit/Foarte greu) → engine traduce intern (per `§36.16 RIR Matrix Adaptiv`). |

---

## §3 11 LOCKED Decizii Noi (cross-ref §36.16-§36.26)

Sumar — detalii complete în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md §36.16-§36.26`:

| § | Decizie | Sumar |
|---|---------|-------|
| §36.16 | RIR Matrix Adaptiv (Profile + Exercise Category Aware) | Verbal feedback Ușor/Potrivit/Foarte greu → RIR numeric per (Profil × Categorie). Maria reps NU sets. Marius single RIR 0 ≠ deload, 3× consecutive → micro-deload. |
| §36.17 | 4 Moduri UI Detection LOCKED V1 | Executor / Curios+Strategic / Frustrat Tehnic / Frustrat Viață / Validation-Seeking — pure event listeners + flags state local. ZERO ML/NLP runtime. |
| §36.18 | Bias Detection Observabilă — Volume Creep | Trigger: setări RPE≥8 + 2× "Adaugă set" same exercise consecutive → friction prompt in-moment "Mai mult nu înseamnă întotdeauna mai bine. Vrei să continui?" + recap silent CDL. |
| §36.19 | Bias Detection Observabilă — Auto-pedeapsă | Trigger: set N validat RIR optim + set N+1 greutate redusă manual ≥20% → prompt informativ neutru data-driven. ZERO paternalism. |
| §36.20 | Bias Detection — Catastrofizare SCRAP V1 (defer V2) | User matur 2+ skip + Reset/Deload manual = realism + autonomy, NU bias. Banner generic Anti-RE §22 F-NEW-4 acoperă ~80% risc abandon. |
| §36.21 | T1+ Onboarding Completion-Based Unlock | NU calendar-based (anterior 7 zile fixe), ci **4 sesiuni de antrenament finalizate complet** după T0. Self-paces — Marius 7-10 zile, Maria 14-21 zile. |
| §36.22 | T1+ Câmpuri Minim 3 Gigel-Validated | (1) Istoric greutate medie 3-6 luni, (2) Activitate zilnică [Sedentar/Activ/Foarte activ], (3) Istoric nutrițional [Da/Nu/Nu știu sigur]. NO jargon "deficit caloric". |
| §36.23 | Android Eviction & Flight Mode Mitigation | Sync Validation pre-close session → ecran sumar "Datele tale nu au fost încă salvate în cloud..." dacă sync fail. IndexedDB local până next sync reușit. |
| §36.24 | Outlier Filter Profile-Aware + ASK Don't IGNORE | Praguri per (Profil × Categorie). Outlier detected → prompt "Sesiunea pare diferită..." [Confirm valorile] [Corectez valorile]. ZERO inference cauză. |
| §36.25 | Cascade Defense 4 Layers | Layer A schema validation runtime + Layer B confidence INTERNAL signal + Layer C sanity bounds per phase + global cap +20% săpt + Layer D runtime invariant checks. |
| §36.26 | Outlier Confirmed ≠ New Baseline | 1 sesiune izolată = CDL note, baseline UNCHANGED. 3 consecutive same exercise low day → baseline shift downward (real regression). Bayesian rigidity prevention. |

---

## §4 Filozofia Completă (12k cuvinte sursă)

> **PENDING:** Daniel uploads source document `Procesul_de_gandire_complet.md` la `📥_inbox/`; CC Opus va detect file pe next ingest run, apoi va appenda integral conținut aici. **CONTENT NOT FABRICATED** — vezi `📤_outbox/DIFF_FLAGS.md` (P1 BLOCKER).

**Scope when uploaded:**
- 15 patterns conversaționali / cognitivi extracted din chat-uri reale
- 10 funcții pseudocode F1-F10 (F1-F9 listed în §1.1 above; F10 + others pending source)
- Linguistic patterns L1-L8 (parsing user verbal feedback non-expert)
- Reflecții meta pe limita engine deterministic vs LLM conversational

**Notă:** Skeleton actual (§1-§3) extras din handover input `📤_outbox/_archive/2026-05/53_HANDOVER_INPUT_CONSUMED_2026-05-02_suflet_andura.md` (sesiune chat strategic 2026-05-02 SUFLET ANDURA) + 11 LOCKED decizii implementate ca §36.16-§36.26 în HANDOVER_GLOBAL. Conținutul filozofic 12k cuvinte rămâne sursa canonică pentru filter "e în sufletul andura?" — **fără sursă completă, filter-ul rulează pe summary translation map (§1) + 11 LOCKED decizii (§3), care acoperă ~75% V1 codificabil dar NU 100% filozofie permanent.**

---

## §5 Cross-references obligatorii

Engine modules + ADR-uri V1+ care MUST referenția SUFLET_ANDURA pentru filozofie de fundament:

- `03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md` (DRAFT) — §36.16 origin
- `03-decisions/ADR_MODE_DETECTION_UI_v1.md` (DRAFT) — §36.17 origin
- `03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1.md` (DRAFT) — §36.18 + §36.19 + §36.20 origin
- `03-decisions/ADR_OUTLIER_FILTER_v1.md` (DRAFT) — §36.24 + §36.26 origin
- `03-decisions/ADR_CASCADE_DEFENSE_v1.md` (DRAFT) — §36.25 origin
- ADR Pattern 14 No-Inference (existing) — F6 alignment
- ADR 020 Storage Tiering (existing) — Layer A schema validation runtime context
- §22 F-NEW-4 Anti-RE banner (existing LOCKED) — §36.17 Frustrat Viață trigger
- §29.2.5 Engine Forță (existing) — RIR matrix Marius compus integration
- §29.2.6 Longevitate (existing) — RIR matrix Maria izolare integration
- §29.5 UX Colateral (existing) — 4 moduri UI wording integration
- §29.5 Onboarding 4 ecrane (existing) — T1+ completion-based unlock + 3 câmpuri Gigel
- §33.2 Storage Full UX (existing) — §36.23 Android Eviction sync validation cross-ref
- §34 Sprint 4.x Blockers (existing) — Bias Detection + Outlier Filter + Cascade Defense scope V1 cluster

---

🦫 **Sufletul Andura: AI-ul informează, nu impune. Engine adaptează pe efect observat, nu presupunere cauză. ASK don't IGNORE. Bayesian rigidity prevention. Push-back proporțional cu risc. Antifragile missed sessions. Maria/Gigica/Marius beachhead. Bugatti engineer mândru? + e în sufletul andura? — dual gate.**
