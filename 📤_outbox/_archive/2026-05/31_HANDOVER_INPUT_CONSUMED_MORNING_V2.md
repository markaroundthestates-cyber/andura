# HANDOVER INPUT — Sesiune 2026-05-01 morning v2 (post wording chat strategic)

**Owner:** Daniel (CEO + Product). Claude = Co-CTO + Reviewer.
**Status:** Input pentru ingest CC Opus per VAULT_RULES §HANDOVER_PROTOCOL + PROMPT_CC_HYGIENE §7 DIFF + §8 Destructive Ops.
**Data:** 2026-05-01 morning v2 (post chat strategic wording lock 15 strings + Phase A/B/C remaining strategy).
**Target SSOT:** `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (overwrite cu §7 DIFF Protocol mandatory — rename target la `_2026-05-01_morning.md` dacă convenția cere date refresh).

---

## 0. WHAT CHANGED ÎN ACEASTĂ SESIUNE

Sesiune chat strategic 2026-05-01 morning v2. Continuare directă post Sprint 4 A+B + i18n audit + handover ingest morning v1. Focus = **wording rewrite session Phase A start + Engine variations lock + Recovery score decision #6**.

**Concrete deliverables:**

1. **Engine wording 12 variații LOCKED** — 4 verdicte × 3 variants complete pentru anti-wallpaper + anti-RE absolut. UP/DOWN/HOLD + RECOVERY refactorat (banner global + per-exercise wording). Vezi §19 detaliat în SSOT update.
2. **Decizia #6 Recovery score numeric exposure RESOLVED** — eliminăm complet numărul. Doar verdicte text: "Recuperat / În refacere / Epuizat". Anti score-chasing + anti overthinking. Antrenor olimpic NU spune "ești recuperat 72%".
3. **Implementation pattern hash deterministic LOCKED** — `hash(today_sv + exercise_id) % 3` pentru variant selector. `toLocaleDateString('sv')` pentru date stability (anti-midnight-flicker, same pattern ca D6 fix din `adherence.test.js`).
4. **Phase B Recovery refactor arhitectural** — verdict global = banner top-of-page ("Zi de refacere") + per-exercise wording cu interpolare `{exercise}`. Anterior un singur mesaj per-exercise = repetiție logică detectabilă pe 5 exerciții/sesiune Recovery. Now factored corect.
5. **Filter Bugatti aplicat strict** prin 6 runde pushback iterative — eliminat: "ridicăm miza" (poker), "resetăm calitatea mișcării" (mecanic), "calitatea mișcării" abstract, "sistem suprasolicitat" (server alert jargon), "vârf de formă mâine" (promise temporal nesigur), "coach-ul observă" (voice inconsistent persoana 3 vs plural inclusiv).

**Tests:** 888/888 PASS (unchanged — sesiune docs/strategie only, zero code touched).

**Bandwidth Daniel:** ~30% chat strategic ended, handover triggered preventiv ÎNAINTE saturation halucinație.

---

## 1. STATE CHANGES vs SSOT vechi

### 1.1 §6.7 Status update 2026-05-01 morning v2

Wording rewrite session **STARTED** chat strategic morning v2. **Phase A toasts/confirms ~36 strings — COMPLET în tabel Bugatti aprobat tacit (vezi §20 below).** **Phase B engine messaging Engine variations 12 strings LOCKED** (vezi §19). **Phase B restul ~58 strings (readiness verdicts, dp/sys/proactiveEngine/plateau/fatigue/calibration tier names, skip reasons) + Phase C page labels ~78 = REMAINING next sesiune.**

ADR 020 Phase 1 ✅ LIVE. ADR 021 Faza 1 ✅ LIVE. i18n infrastructure ✅ LIVE. WhyEngine.js rewritten cu 4 categorii + selectVerdict priority ladder ✅ LIVE. Variant selector hash deterministic = pending implementation Sprint 4.x parte din wording rewrite implementation.

### 1.2 §15 Tests & Git State UPDATE

- **Tests:** **888/888 PASS** (unchanged — sesiune chat strategic, zero code touched)
- **Vault docs:** 52 (unchanged)
- **Outbox archive:** rotate next NN post-ingest morning v2
- **HEAD origin/main:** unchanged (chat strategic only, no code commits this session)
- **Backup tags origin:** unchanged 5 tags + add `pre-handover-ingest-2026-05-01-morning-v2` la ingest

### 1.3 §13 Workflow Daniel ↔ Claude ↔ Opus UPDATE

Velocity rule reinforced: chat strategic wording session ~6 runde iterative pushback = ~45 min Daniel-time real. NU CC velocity (chat strategic = Daniel + Claude human collaboration, NU Opus autonomous run). Bandwidth budgeting Daniel-time = real × 3 confirmed.

§7 DIFF + §8 Destructive Ops mandatory pentru ingest.

### 1.4 §8.2 Memory consolidation NU schimba

Memory consolidat 30→17 reguli preserved 1:1 evening v2.

---

## 2. SECȚIUNI NOI

### 2.1 §19 Engine Wording 12 Variații LOCKED + Decizia #6 Recovery Score

**Status:** LOCKED 2026-05-01 morning v2. Implementation = i18n bundle update + `whyEngine.js` variant selector cu hash deterministic.

#### 12 variații complete (4 verdicte × 3 variants)

**🟢 UP (Progresie):**

```
V1: "Te-ai adaptat excelent. Azi creștem greutatea la {exercise}, fără să sacrificăm tehnica."
V2: "Progresul tău e vizibil. Urcăm greutatea la {exercise} pentru a continua evoluția, cu aceeași execuție curată."
V3: "Ești gata pentru următorul nivel la {exercise}. Ridicăm sarcina astăzi, păstrând forma perfectă."
```

**🔴 DOWN (Reglaj tehnic):**

```
V1: "Prioritizăm tehnica azi la {exercise}. Un pas în spate e scurtătura către progresul viitor."
V2: "Refinăm execuția la {exercise}. Un reglaj fin acum deblochează următorul nivel de forță."
V3: "Facem un reglaj tehnic la {exercise}. Ajustăm greutatea pentru a consolida execuția și a reporni creșterea."
```

**🟡 HOLD (Consolidare):**

```
V1: "Păstrăm greutatea la {exercise} astăzi. Ești într-o zonă excelentă de consolidare, iar asta ne asigură că baza e solidă."
V2: "Consolidăm progresul la {exercise}. Încă o sesiune-două la acest nivel și suntem gata să urcăm."
V3: "Rămânem pe poziții la {exercise}. Stăpânește total acest prag înainte de a adăuga rezistență suplimentară."
```

**🔵 RECOVERY (Refacere) — REFACTOR arhitectural:**

```
GLOBAL BANNER (top of page): "Zi de refacere: Programul de azi e mai blând pentru a permite corpului să se reconstruiască."

V1 (per-exercise): "Reducem ritmul la {exercise} azi. Recuperarea acum înseamnă forță proaspătă la antrenamentul următor."
V2 (per-exercise): "Ajustăm volumul la {exercise} azi. Corpul are nevoie de refacere ca să revii puternic în sesiune."
V3 (per-exercise): "Prioritizăm refacerea la {exercise}. O sesiune mai ușoară acum pregătește terenul pentru un vârf de formă la următorul antrenament."
```

#### Decizia #6 Recovery score numeric exposure — RESOLVED

| Status | Wording locked |
|---|---|
| High | "Recuperat" |
| Medium | "În refacere" |
| Low | "Epuizat" |

**Decizie:** ELIMINĂ numărul complet pentru toate categoriile de useri. Antrenor olimpic NU spune "ești recuperat 72%" — dă verdict clar. Anti score-chasing + anti overthinking. Pro tier NU primește expunere numerică (decizie globală, NU tier-gated).

#### Implementation pattern locked

```javascript
// Pattern hash deterministic — anti-flicker + zero Math.random
const todayStr = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD' local stable
const variantIndex = hash(todayStr + exercise_id) % 3;
return variants[variantIndex];
```

**Garanție:** user vede același mesaj pe tot parcursul zilei pentru același exercițiu (refresh / re-deschidere app = consistent). Pe 5 exerciții într-o zi → probabil vede toate 3 variații = app pare că "scrie" în timp real, NU câmp dintr-un tabel.

**Cross-refs:** `src/engine/whyEngine.js` `selectVerdict()` priority ladder + `src/i18n/ro.json` `why.categorical.*` namespace + ADR 013 §Anti-RE absolute.

### 2.2 §20 Phase A Toasts/Confirms — Aprobate Tacit (~36 strings)

**Status:** Aprobate tacit prin progres iterativ wording session morning v2 (Daniel a confirmat batch progresând la engine logic). Implementation = bulk batch CC Sonnet în `ro.json`.

#### Toasts (~25)

| Curent | Locked |
|---|---|
| "✓ Notificări active" | "Notificări activate." |
| "❌ Antrenament anulat" | "Antrenament încheiat." |
| "⚠ Selectează exercițiu" | "Alege un exercițiu." |
| "Set salvat" | "Set înregistrat." |
| "Greutate actualizată" | "Greutate înregistrată." |
| "Antrenament finalizat" | "Antrenament încheiat. Bună treabă!" |
| "Eroare la salvare" | "N-am putut salva. Mai încercăm o dată?" |
| "Conexiune pierdută" | "Lucrăm offline acum." |

**Restul ~17 toasts (modificare aplicată, date sincronizate, conexiune restabilită, plus 14 alte):** REMAINING next sesiune review individual cu context.

#### Confirm dialogs (~5 din 8)

| Curent | Locked |
|---|---|
| "Anulezi antrenamentul? Nicio dată nu va fi salvată." | "Închizi sesiunea? Datele de azi se pierd." |
| "Ești sigur?" generic | EVITĂ — fă specific contextului fiecare caz |
| Full reset confirm | "Resetare completă: ștergem tot permanent. Continui?" |

**Restul ~3 confirms (Ai N seturi nefinalizate, Ștergi acest antrenament, +1):** REMAINING next sesiune review individual.

#### Alert dialogs `dataCleanup.js` (3 strings)

REMAINING — review next sesiune. Recomandare convertire la in-app modal/toast (anti-`alert()` browser native = parte din anti-Bugatti UX cleanup global).

### 2.3 §21 Wording REMAINING Next Sesiune (~187 strings)

**Status:** Lista clară pentru next chat strategic wording session. Daniel review cu Claude pe filtru Bugatti.

#### Phase B engine messaging — REMAINING (~58 strings)

Prioritate ordonată (importance × visibility):

1. **`readiness.js` — Verdicte readiness (6 strings)** ⭐ HIGH PRIORITY (vizibile constant header coach):
   - "Zi de PR" / "Sesiune solidă" / "Sesiune normală" / "Sesiune moderată" / "Sesiune ușoară" + 1
   - Recomandări audit: "Zi de vârf" / PĂSTREAZĂ / "Zi obișnuită" / "Mergi mai blând azi" / "Zi de recuperare"
   - **Status:** RECOMANDĂRI audit Opus, NEAPROBATE individual de Daniel — review next sesiune.

2. **`calibration.js` tier names (6 strings)** ⭐ HIGH VISIBILITY:
   - 6 nivele canonical post-D1: COLD_START / INITIAL / DEVELOPING / PERSONALIZING / PERSONALIZED / OPTIMIZED
   - Filozofie recomandată audit: progresie relațională ("învăț → cunosc → te înțeleg → adaptez → sincronizat → te citesc")
   - Recomandări audit: "Învăț cum lucrezi" PĂSTREAZĂ / "Cunosc ritmul tău" / "Te înțeleg din ce în ce mai bine" / "Adaptez programul la tine" / "Lucrăm sincronizat acum" / "Te citesc ca pe o carte deschisă"
   - **PUSHBACK Claude pending (din chat morning v2):** Tier 4 PERSONALIZED "Te cunosc bine acum" risc trust hit dublu dacă engine greșește post-promisiune. Tier 5 OPTIMIZED "Pe aceeași lungime de undă" (variație Daniel proposed) — nu e clar mapping per tier. Decizie next sesiune.

3. **F-NEW-4 Plan ajustat banner + skip reasons** ⭐ ANTI-RE BREACH PROD-VISIBLE:
   - Plan banner percentage leak ("Plan redus 30%") + paternalist override ("Override (înțeleg riscurile)") + numerice raw ("Adherence scăzută: 0%", "Deviation crescut: 100%")
   - Recomandări locked din §20 above: "Plan ajustat azi pentru recuperare. Volumul e mai blând." + "Vreau planul inițial." (anti-paternalism real)
   - **NEAPROBATE final** — review next sesiune cu specific context.
   - Skip reasons (4): "Sunt prea obosit azi" / "N-am timp astăzi" / "Mă doare ceva / sunt accidentat" / "Alt motiv" — voce user persoana 1.

4. **Onboarding (9 strings)** ⭐ FIRST IMPRESSION RETENTION:
   - Step text + button labels + baseline weight prompt
   - Pattern recomandat: warm conversational, NU tutorial robotic. Action-oriented buttons ("Mergem mai departe" vs "Next"). Anti-paternalism (NU "te rog completează").
   - REMAINING — fiecare string review individual next sesiune.

5. **`sys.js` — BMI/BF bands + phase logic (12 strings)** ⭐ ANTI-PATERNALISM CRITIC:
   - **PUSHBACK locked Daniel:** ELIMINĂ etichete medicale stigmatizante ("Obez", "Supraponderal").
   - Decizie locked: BMI/BF bands → "Sub țintă / În țintă / Peste țintă pentru obiectivul tău" (relativizat la goal user, NU absolut medical).
   - Phase logic: "Faza CUT" → "Faza de definire" / "Faza BULK" → "Faza de creștere" / "Faza MAINTAIN" → "Faza de menținere" — RECOMANDĂRI, neaprobate final.
   - Decizie pending: EN technical labels (CUT/BULK) păstrate Pro tier? Sau RO universal default?

6. **`dp.js` — Rest day, taper, deload (13 strings):**
   - Pattern recomandat: rationale, NU command. User înțelege DE CE pauza/deload.
   - REMAINING — review next sesiune.

7. **`proactiveEngine.js` — Lagging muscle alerts (9 strings):**
   - Pattern recomandat: observație + acțiune luată, NU verdict gol.
   - REMAINING — review next sesiune.

8. **`plateauInterventions.js` (8 strings):**
   - Folosește reframing "deblocare" din wording-ul Engine Down lock.
   - REMAINING — review next sesiune.

9. **`fatigue.js` (8 strings):** Anti-RE absolut. Zero numerice + zero category exposure. REMAINING.

10. **`reality.js` (7 strings):** Reality Engine backend mostly. User-facing minimal — review next sesiune ce-i exact.

#### Phase C page labels — REMAINING (~78 strings)

| File | Count | Status |
|---|---|---|
| `dashboard.js` | 45 | ⭐ MOST VISIBLE — review next sesiune (tabs, buttons, notifications, recovery widget) |
| `weight.js` | 23 | Empty states + modal labels + chart labels — review next sesiune |
| `plan.js` | 10 | Phase override (vezi `sys.js`) + counts — review next sesiune |

#### Decisions pending (gândește între timp Daniel)

1. **Exercise alternatives strategy:** A (EN tech names + RO reasons) / B (RO complete) / **C hibrid** (compound mari EN + izolări RO) — Daniel decide listă specifică next sesiune.
2. **Day names:** Intl API (`Intl.DateTimeFormat('ro', { weekday: 'long' })`) sau hardcoded array? **Recomandare Claude: Intl** (no-brainer multilingv automat).
3. **EN translations strategy:** A manual / B Sonnet-assisted / **C Hybrid A+B** (brand-critical ~30 manual + restul ~210 Sonnet-assisted batch review). Recomandare Claude: Hybrid.
4. **BMI/BF bands wording:** LOCKED — "Sub/În/Peste țintă pentru obiectivul tău" (decisie Daniel chat morning v2).
5. **Phase names CUT/BULK EN-only Pro tier sau RO universal default?** REMAINING.
6. **Recovery score numeric exposure:** LOCKED — eliminat complet, decizia #6 (vezi §19).

#### Pattern recomandat next sesiune

Daniel + Claude review per priority ordonat (#1-9 above), filter Bugatti aplicat, lock wording final → handover-uri batch după fiecare priority majoră (anti-saturation, anti-halucinație).

**Cross-refs:** `📤_outbox/_archive/2026-04/<NN>_WORDING_INVENTORY_2026-05-01.md` (full audit Opus, ~238 strings inventoried) + ADR 013 §Anti-RE + §19 Engine variations LOCKED + filozofie chat morning v2 (anti-paternalism + Bugatti voice + reframing pozitiv + voice unitar persoana I plural + promise temporal safe).

---

## 3. SECȚIUNI EXISTENTE PRESERVED 1:1 (NU schimba)

Următoarele secțiuni din SSOT vechi NU sunt afectate de această sesiune. Preserve integral:

- §1 Vision Final Locked
- §2 Strategic Positioning ("SensAI for Android" + 7 features distinctive)
- §3 Pricing locked (€60 lifetime / €65/an Pro / Founding Members 100-500)
- §4 Sprint 1+2+3 deliverables
- §5 D1-D15 routing decisions LOCKED (15/15)
- §6.1-6.7 Sprint 4 / Wave 6 backlog (cu §6.7 Status update update minor per §1.1 above)
- §7.1-7.2 Vault state cleanup + sistem inbox/outbox
- §8.1 Memory persistent state; §8.2 Memory consolidation NU schimba
- §9 Principle CC Opus 4.7 autonomous comprehensive
- §10 Differentiation Reality 2026 (5 axe + AI = comoditate)
- §11 Chalkboard educational layer
- §12 Feedback System v1
- §13 Workflow Daniel ↔ Claude ↔ Opus (cu update minor §1.3)
- §14 Next Steps post-handover (DAR rewrite — see §4 below)
- §16 ADR 020 Storage Tiering Phase 1
- §17 Governance Hardening §HANDOVER_PROTOCOL + §7 DIFF + §8 Destructive Ops
- §18 Inbox Strict Daniel — Bug Fix
- §19 Sprint 4 A+B Implementation Notes (preserved + cross-ref nou §19 morning v2)
- §20 i18n Decision B Locked + Audit Completed
- §21 Wording Categorical "De ce?" Locked + Anti-RE Reaffirmed (preserved 1:1, e Engine 4 categorii baseline pre-variations)
- §22 Findings Noi 2026-05-01 (F-NEW-1..4)

**Pentru CC Opus la ingest:** §7 DIFF Protocol mandatory. Verifică toate secțiunile preserved sunt 1:1 în output.

**Numbering note:** §19 + §20 deja existente în SSOT vechi (Sprint 4 A+B + i18n). Adaugă **§19 morning v2** ca sub-section nou cu titlu specific "Engine Wording 12 Variații LOCKED + Decizia #6" SAU renumerotează la §23 + §24 + §25. CC Opus decide tactic în ingest, păstrează semantic clear.

---

## 4. NEXT ACTION post-ingest

### Imediat (chat nou după ingest)

1. **Verify alignment questions** — REMAINING wording-uri vizibile clar pentru chat nou strategic:
   - Phase B prioritate #1 readiness verdicts (6) → priority #2 calibration tier names (6) → priority #3 plan banner + skip reasons → priority #4 onboarding (9) → priority #5 sys.js BMI/BF + phase logic restul (12) → priority #6 dp/proactive/plateau/fatigue/reality (~45) → priority #7 Phase C page labels (~78)
   - Phase A REMAINING ~17 toasts + ~3 confirms + 3 alerts dataCleanup
2. **Daniel atașează raport CC ingest morning v2** (din `📤_outbox/LATEST.md` post-ingest)
3. **Wording rewrite session continuă** pe priority ordonat above. Per priority: Daniel + Claude review wording per string, filter Bugatti, lock final.

### Medium term (Sprint 4.x)

4. **Implementation wording rewrite** — CC Sonnet mecanic în `ro.json` (toate strings locked) + `whyEngine.js` variant selector cu hash deterministic per §19 implementation pattern. Estimate: ~2-3h Sonnet post locks complete.
5. **F-NEW-3 hyperreactive coach cooldown** (Daniel decide threshold A/B/C)
6. **F-NEW-2 progression scaling tier-aware** verify + fix
7. **F-NEW-1 i18n exerciții RO** (mapping EN→RO per Daniel hibrid C decision)
8. **Faza 2 ADR 021** (post coachContext.buildContext async refactor)
9. **Phase 2 logs rotation** (Sprint 4.x)
10. **D1 DEVELOPING tier code refactor** (~8-12h Sprint 4)

### Long term (v1.5+)

11. **Sprint 4 / Wave 6 execution** (12-22h Opus realist)
12. **Beta tester recruitment** (Reddit/Discord/balene)
13. **iPhone test device acquisition** (€100-200)

### Pre-launch v1 readiness state

ADR 020 Phase 1 LIVE prod. ADR 021 Faza 1 LIVE algorithm core. i18n infrastructure LIVE. Engine 4 categorical verdicts LIVE (whyEngine rewrite anti-RE). **Engine 12 variații + Decizia #6 + Phase A start LOCKED morning v2 — implementation pending Sprint 4.x.** Anti-RE breach descoperit prin smoke test = wording rewrite priority maxim ÎNAINTE D1 DEVELOPING + Phase 2 logs.

---

## 5. TESTS & GIT STATE FINAL

- **Tests:** **888/888 PASS** (unchanged sesiune chat strategic)
- **Backup tags:** `pre-adr-020-impl`, `pre-handover-ingest-2026-04-30-evening-v2`, `pre-sprint4-a-b-2026-04-30`, `pre-i18n-audit-2026-05-01`, `pre-handover-ingest-2026-05-01-morning` + add `pre-handover-ingest-2026-05-01-morning-v2` la ingest
- **HEAD origin/main:** unchanged (no code commits this session)
- **Outbox archive:** rotate next NN post-ingest morning v2
- **Inbox state pre-ingest:** acest fișier (`HANDOVER_INPUT_2026-05-01_morning_v2.md`)

---

🦫 **Sesiune 2026-05-01 morning v2 LOCK. Chat strategic wording session Phase A start + Engine 12 variații + Decizia #6 Recovery score LOCKED. ~187 strings REMAINING (Phase B ~58 + Phase C ~78 + Phase A restul ~20 + decisions pending #1/#3/#5). Implementation pending Sprint 4.x post locks complete. Bandwidth Daniel ~30% — handover triggered preventiv anti-saturation halucinație.**
