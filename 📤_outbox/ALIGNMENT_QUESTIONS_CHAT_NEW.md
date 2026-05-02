# ALIGNMENT QUESTIONS — Chat E PHASE B WORDING LOCK Ingest

**Generat:** 2026-05-02 post Chat E PHASE B WORDING LOCK ingest  
**Sursă:** `📤_outbox/_archive/2026-05/69_HANDOVER_INPUT_CONSUMED_2026-05-02_chat_E_phase_b_wording_lock.md`  
**Per:** PROMPT_CC_HYGIENE.md §9 ALIGNMENT_QUESTIONS_POST_INGEST_MANDATORY  
**Scop:** verificare zero-info-loss + alignment Daniel pre Sprint 4.x cluster integration

---

## §1 INGEST SCOPE — RECAP

**Ingestat (1 decizie NEW + 1 amendment inline + 2 ADR amendments):**

- §36.58 NEW Phase B Wording 51 Strings LOCKED V1 (5 module engine + 2 placeholders)
- §36.57 §AMENDMENT inline (count 35 → 51 actual)
- ADR_MODE_DETECTION_UI_v1 EXT-4 §AMENDMENT 2026-05-02 Chat E (PROFILE_VALIDATION wording final)
- ADR_OUTLIER_FILTER_v1 EXT-2 §AMENDMENT 2026-05-02 Chat E (GOAL_SHIFT wording final)
- EOF session-lock entry "Sesiune 2026-05-02 Chat E PHASE B WORDING LOCK"

**Cumulative LOCKED count post Chat E:** **54** (12 Acasă + 11 SUFLET ANDURA + 8 SELF-CORRECTION + 14 Chat C + 8 Chat D + 1 Chat E)

---

## §2 ÎNTREBĂRI ALINIERE — VERIFICARE WORDING LOCK V1

### Q1 — fatigue.js HIGH_FATIGUE label

**Citation §36.58 — fatigue.js verdicte LOCKED V1:**  
> `HIGH_FATIGUE` → label "**Azi mergem mai blând**" + detail "Au fost câteva sesiuni grele recent. Volumul este calibrat mai conservator pentru o recuperare completă."

**Q1:** Confirmi că wording label HIGH_FATIGUE este FINAL `"Azi mergem mai blând"` (sentence case + voice plural + reframing pozitiv recovery), NU variante anterioare considerate "Reducem volumul azi" / "Recuperare necesară" / "Volumul scăzut"?

→ Dacă DA: Sprint 4.x cluster va replace `src/engine/fatigue.js` HIGH_FATIGUE label literal cu acest string.  
→ Dacă NU: indică wording corect + cross-ref §36.58 amendment necesar.

---

### Q2 — dp.js Intensity 🟠 RIR exception (Q26.bis)

**Citation §36.58 — dp.js Intensity labels RIR gauge LOCKED V1:**
> `INTENSITY_LIMIT` 🔴 La limită (0-1 reps în rezervă)  
> `INTENSITY_HEAVY` 🟠 Greu (1-2 reps în rezervă)  
> `INTENSITY_CHALLENGING` 🟡 Provocator (2-3 reps în rezervă)  
> `INTENSITY_COMFORTABLE` 🟢 Confortabil (3+ reps în rezervă)

**Push-back Claude integrat #5:** "🟠 RIR excepție justificată — RIR gauge 4 niveluri logic distincte (NU tutorial-style noise)"

**Q2:** Confirmi că **excepția 🟠 (orange)** este permisă **DOAR** pentru RIR gauge 4-tier intensity (4 niveluri logic distincte gym universal) — restul aplicației menține constraint emoji 🔴🟡🟢 strict per Q2 + Q26.bis lock?

→ Dacă DA: Filter Bugatti regula 8 modificată să accepte 🟠 doar la RIR gauge.  
→ Dacă NU: indică alt context legitimat (sau RESPINS exception → revert la 🟡 Greu).

---

### Q3 — dp.js TECHNIQUE_DROP_SET notation simetric

**Citation §36.58 — dp.js TECHNIQUE_DROP_SET LOCKED V1:**
> `TECHNIQUE_DROP_SET` → label "🟡 Drop set la final" + note "Stagnare lungă · Drop set pe ultimul: −30% greutate pentru a sparge platoul"

**Push-back Claude integrat #4:** "Q24 −30% greutate notation FORCED — simetric cu format `${lastW} kg → ${newKg} kg` din alte note"

**Q3:** Confirmi că notation `−30% greutate` (procent direct, NU `${lastW} × 0.7`) este intenționat — simetric cu format notation procent în restul appului (e.g. progress notes), aliniat cu vocabular gym RO ("drop set −30%" = limbaj coach uman natural)?

→ Dacă DA: Sprint 4.x replace literal "−30% greutate" în source.  
→ Dacă NU: indică notation preferat (`${dropKg} kg` calcul explicit pop-up?).

---

### Q4 — dp.js verdicte progresie 11 strings (NU 10)

**Citation §36.58 — dp.js verdicte progresie tabel:**  
Tabel listează **11 verdicte** (INITIAL_START / SCALE_BACK / PEAK_LIMIT / CAP_REPS / TOO_HEAVY / CONSOLIDATE / INCREASE / STAGNANT_PLUS_SET / MAINTAIN_CUT / TECHNIQUE_DROP_SET / **ON_TARGET**)

**Total dp.js summary §36.58:** "20 strings (10 verdicte progresie + 4 intensity RIR + 2 in-session adjust + 4 start verdicte)"

**Q4:** Există discrepanță count: 10 (header summary) vs 11 (tabel)? `ON_TARGET` se numără sau NU în categoria "verdicte progresie"?

**Hypothesis:** ON_TARGET = state neutru (continuare normal), NU tranziție progresivă → 10 + ON_TARGET separat = 11 total dp.js verdicte. Dar în counting summary 10 + 4 + 2 + 4 = **20** se confirmă (deci 11 verdicte categorical → 10 verdicte tranziție + 1 stare neutră).

→ Confirmi count actual dp.js = **20 strings totale** (cu ON_TARGET inclus în "10 verdicte" categorical NU expandabil), sau dp.js = 21 (ON_TARGET extra, total cumulative ar deveni **52** NU 51)?

---

### Q5 — reality.js PROGRESS_PLATEAU + PROGRESS_TOO_FAST tone

**Citation §36.58 — reality.js LOCKED V1:**
> `PROGRESS_PLATEAU` → "Greutatea nu a scăzut în ultimele 7 zile. Hai să vedem ce putem ajusta în strategie."  
> `PROGRESS_TOO_FAST` → "Slăbim un pic prea repede și riscăm să pierdem din masa musculară. Hai să creștem temporar aportul la ${suggestedKcal} kcal pentru a ne proteja progresul."

**Note divergence:** PROGRESS_PLATEAU + PROGRESS_TOO_FAST folosesc construcție **"Hai să..."** (invitație colaborativă, ton cald) vs alte note reality.js (`PROGRESS_TOO_SLOW` = "Verificăm aportul..." voice plural + verb dat / `PROGRESS_ON_TRACK` = "Suntem în ritmul... Menținem...").

**Q5:** Confirmi că divergența "Hai să..." (PLATEAU + TOO_FAST) vs "Verificăm/Menținem..." (TOO_SLOW + ON_TRACK) este **intenționată** — moments emotional sensibile (platou + slăbire prea rapidă) primesc invitație colaborativă warm, vs status routine voice plural neutră?

→ Dacă DA: pattern emotional-sensitive vs routine context.  
→ Dacă NU: armonizare → toate "Verificăm/Menținem/..." pluraliste neutru?

---

### Q6 — sys.js phase RO native vs ENG (CUT/BULK)

**Citation §36.58 — sys.js phase timeline LOCKED V1:**
> `PHASE_CUT_TO_SUMMER` → "Definire până la vară"  
> `PHASE_SUMMER_PEAK` → "Vară peak (menținere)"  
> `PHASE_BULK_AUTUMN` → "Creștere (toamnă-iarnă)"  
> `PHASE_CUT_PRE_SUMMER` → "Definire pre-vară"

**Note:** key tehnică păstrează ENG (CUT/BULK) PER §27 evening lock + §36.58 regula 9 phase RO native (CUT→definire / BULK→creștere / MAINTENANCE→menținere).

**Q6:** Confirmi că **separarea key-tehnică-ENG vs label-display-RO** este corect arhitectural — code internal păstrează `PHASE_CUT_TO_SUMMER` / `PHASE_BULK_AUTUMN` (universal jargon dev), DAR display-ul user vede DOAR RO ("Definire" / "Creștere")?

→ Dacă DA: Sprint 4.x păstrează PHASE_* keys ENG + replace DOAR display labels cu RO.  
→ Dacă NU: rename complet PHASE_DEFINIRE_VARA / PHASE_CRESTERE_TOAMNA?

**Sub-Q6.bis:** PHASE_SUMMER_PEAK păstrează cuvântul "**peak**" inline (ENG hibrid în RO display) — confirmi peak = naturalizat în context fitness RO (similar "reps")? Sau înlocuit cu "vârf" / "menținere maxim"?

---

### Q7 — calibration.js maturity tier coverage incomplet

**Citation §36.58 — calibration.js banner texts LOCKED V1:**
> COLD_START (sesiuni 0-2) / INITIAL (3-5) / DEVELOPING (6-11) / PERSONALIZING (12-40)

**Note §36.58:** "PERSONALIZED + OPTIMIZED tiers păstrează `bannerText: null` (transparent UI), corect per maturity assumption."

**Q7:** Confirmi că **5/6 tiers** (post Blocker 3 §34.3 refactor 5→6 tiers din migrare deja shipped) NU primesc banner — DOAR primele 4 tiers active (COLD_START + INITIAL + DEVELOPING + PERSONALIZING) au banner, restul (PERSONALIZED + OPTIMIZED) au `bannerText: null` transparent?

→ Dacă DA: Sprint 4.x va implementa logic `tier.bannerText !== null` check pre-render banner.  
→ Dacă NU: indică banner text necesar pentru PERSONALIZED + OPTIMIZED.

---

### Q8 — PROMPT_PROFILE_VALIDATION_PLACEHOLDER schema change

**Citation §36.58 + ADR_MODE_DETECTION_UI_v1 §AMENDMENT 2026-05-02 Chat E:**
```javascript
{
  id: "profile_validation_drift_prompt",
  title: "Ajustăm modul de afișare a instrucțiunilor?",
  body: "...",
  buttons: { confirm: "Da, schimbă", cancel: "Nu, lasă așa" },
  status: "LOCKED V1 — production ready"
}
```

**Schema evolution detected:**
- **Pre-Chat E** (Chat D EXT-4 placeholder): `{ id, text, buttons, status }`
- **Post-Chat E** (LOCKED V1): `{ id, title, body, buttons, status }` — NEW separate fields **title + body** (NU monolithic `text`)

**Q8:** Confirmi că schema split `text` → `title + body` este **intenționat** — UI render va folosi title ca header bold + body ca paragraf detail (similar pattern modal alert standard mobile)?

→ Dacă DA: Sprint 4.x cluster crează component dedicated `<ProfileValidationPrompt title body buttons />` cu render distinct title/body.  
→ Dacă NU: revert la monolithic text + structurat intern \n separator.

---

### Q9 — GOAL_SHIFT_CALIBRATION_PLACEHOLDER subText

**Citation §36.58 + ADR_OUTLIER_FILTER_v1 §AMENDMENT 2026-05-02 Chat E:**
```javascript
{
  id: "goal_shift_calibration_notice",
  title: "Recalibrăm pe noul obiectiv",
  body: "Primele 2 sesiuni sunt de calibrare · Estimăm ${minKg}-${maxKg} kg × ${reps} reps, ajustăm după ce avem date",
  subText: "Sesiunea ${current}/2",
  status: "LOCKED V1 — production ready"
}
```

**NEW field `subText`:**
- subText = "Sesiunea ${current}/2" (counter live progression 1/2 sau 2/2 după sesiune curentă)

**Q9:** Confirmi că subText = counter live "Sesiunea ${current}/2" e display **secondary** (font mai mic / culoare mai pală) sub body principal — visual hierarchy: title (bold) > body (paragraf) > subText (caption)?

→ Dacă DA: Sprint 4.x cluster implementează 3-tier visual hierarchy.  
→ Dacă NU: subText = inline parte din body (no visual distinction)?

---

### Q10 — Per-set normalization vs in-session adjust pop-up consistency

**Citation §36.58 — dp.js IN_SESSION_DOWN/UP:**
> `IN_SESSION_DOWN` → "Greutatea este prea mare · Trecem la ${newKg} kg pentru următorul set"  
> `IN_SESSION_UP` → "Două seturi prea ușoare · Urcăm la ${newKg} kg pentru următorul set"

**Note divergence:** IN_SESSION_UP folosește "**Două seturi**" (numeric explicit count), vs IN_SESSION_DOWN fără count.

**Q10:** Asymmetria UP-2-seturi vs DOWN-zero-count este intenționată per logic engine: DP coboară kg după **1 set fail** (single-set trigger), DAR urcă DOAR după **2 seturi consecutive ușoare** (anti-aggressive bump 2-set confirmation), per §36.48 per-set normalization Chat C?

→ Dacă DA: wording reflectă logic engine corect.  
→ Dacă NU: armonizare wording (ambele cu count, sau ambele fără)?

---

## §3 ÎNTREBĂRI ALINIERE — INVENTORY + COVERAGE

### Q11 — §36.57 inventory amendment confirmation

**Citation §36.57 §AMENDMENT 2026-05-02 Chat E:**
> "Phase B scope actual count = **51 strings cumulative** (NU 35), discovered în review chat strategic Chat E. Diferența 16 strings: §25 outdated inventory NU acoperă intensity labels (4) + technique descs (2) + start rationales (4) + phase timeline labels (4) + checkpoint sub-labels (1) + tempo notes (1 inflated estimate)."

**Q11:** Confirmi că **§25 wording remaining inventory** (referință în session-lock entries anterioare) trebuie marcat **DEPRECATED** sau **§AMENDMENT-ed** explicit cu cross-ref la §36.58 51-string LOCKED master?

→ Dacă DA: vault sweep CC adaugă §AMENDMENT inline §25 marker.  
→ Dacă NU: §25 rămâne istoric record + §36.58 = current SSOT (audit trail preserved).

---

### Q12 — Wording NU acoperit în §36.58 (gap detection)

**Possibly missing din §36.58:**

- Onboarding T0/T1+ welcome screens (§36.22 + §36.44 + §36.45)
- Setări → Profil & Date buton labels ("Schimbă obiectiv" / "Resetează profil" §36.34 + §36.35)
- Storage Full UX 3 buttons (§33 NEW Exportă / Cloud Pro / Închide)
- F-NEW-1 6 traduceri exerciții (Romanian Deadlift → Îndreptări (RDL) etc.)
- Pricing tier card labels (€39 Founding / €59 Standard / €79 Elite §36.50)
- Telegram channel CTA (§36.53 + §36.54)
- GDPR consent screen (§36.55 vizual tutorial)

**Q12:** Confirmi că wording-uri PESTE Phase B engine-level (T0/T1+ onboarding + Setări + Storage Full + Pricing + Telegram + GDPR + F-NEW-1 traduceri) sunt **OUT OF SCOPE Chat E** — covered de **Phase A** (UI navigation labels) sau **Phase C** (commercial + onboarding + admin flows) — și vor primi separat decizii LOCK V1 ulterior?

→ Dacă DA: Phase B = strict ENGINE module-level wording (5 module: fatigue/dp/reality/sys/calibration + 2 placeholders).  
→ Dacă NU: indică wording-uri care DEVE fi în Phase B + fac parte din 51 strings actual count vs missing.

---

### Q13 — push-back-uri Claude — Q47 "Consolidăm" orfan

**Citation §36.58 push-back #10:**
> "Q47 'Consolidăm' orfan ambiguu RESPINS — 'Continuăm' specific contextului EXACT_MATCH start"

**Wording final §36.58:**
> `START_EXACT_MATCH` → "🟡 **Continuăm** | Pornim de la ultima sesiune: ${weight} kg"

**Discrepancy:** dp.js verdicte progresie include `CONSOLIDATE` → "🟡 **Consolidăm reps** | Ultima dată: ${lastW} kg × ${lastReps} reps. Țintim ${targetReps} astăzi."

**Q13:** Confirmi că **"Consolidăm" rămâne valid** în context CONSOLIDATE verdict (specific = consolidare reps stagnante 3 sesiuni at maintenance kg) — DAR a fost RESPINS doar pentru START_EXACT_MATCH (unde "Continuăm" = continuare straight-line, NU consolidation)?

→ Dacă DA: "Consolidăm" + "Continuăm" coexist semantic distinct.  
→ Dacă NU: revert "Consolidăm reps" → alt verb (ex. "Menținem reps")?

---

## §4 ÎNTREBĂRI ALINIERE — SPRINT 4.x INTEGRATION READINESS

### Q14 — Production gate path post-Chat E

**Citation §36.58 Production Gate Lift Status:**
> "Sprint 4.x cluster: replace placeholder strings cu wording locked V1 + remove `PHASE_B_LOCK_REQUIRED` flags  
> Test verification: `grep -rn 'PHASE_B_LOCK_REQUIRED\|PHASE_B_WORDING_PENDING' src/` returnează ZERO matches"

**Source code current state:** `src/engine/fatigue.js` + `src/engine/dp.js` + `src/engine/reality.js` + `src/engine/sys.js` + `src/engine/calibration.js` au flags `PHASE_B_LOCK_REQUIRED` la string literals existing **DAR NU sunt încă create** ca module separate (existential check: doar `src/engine/prEngine.js` + `src/engine/linearBlock.js` + `src/engine/masteryMilestone.js` shipped Batch B).

**Q14:** Confirmi că Sprint 4.x cluster va include **CREATE engines noi** (fatigue.js / dp.js / reality.js / sys.js / calibration.js) **+ INTEGRATE 51 strings LOCKED** ca prima ITERATIE post-ADR-LOCK — NU strict "replace strings" în engines deja existing?

→ Dacă DA: Sprint 4.x batch C scope ADD 5 new engine modules creation + 51 strings integration + tests Golden Master.  
→ Dacă NU: indică engines existing care primesc DOAR string updates (poate vechi engines în DP_OUTLIER_BATCH legacy?).

---

### Q15 — Integration estimate impact

**Citation §36.58 + Chat D session-lock entry:**
> "Sprint 4.x cluster implementation ~18-25h Opus comprehensive ADD pricing schema (subscription_tier + founding_cap_counter + auto-close)"

**Post Chat E ADD scope:**
- 5 new engine modules creation (fatigue/dp/reality/sys/calibration)
- 51 strings LOCKED V1 integration
- 2 NEW placeholders (PROFILE_VALIDATION + GOAL_SHIFT_CALIBRATION)
- production gate cleanup (remove `PHASE_B_LOCK_REQUIRED` + `PHASE_B_WORDING_PENDING`)
- tests verification 1110/1110 + new tests

**Q15:** Estimate `~18-25h Opus` rămâne valid (Phase B integration absorbed în existing scope) sau **+3-5h** pentru noile engines + tests Golden Master = total `~21-30h Opus` revised?

→ Indică estimate revised pentru planning Daniel + bandwidth saturation prevention.

---

## §5 ÎNTREBĂRI ALINIERE — PROCESS HYGIENE

### Q16 — §9 ALIGNMENT_QUESTIONS_POST_INGEST_MANDATORY consistency

**Citation PROMPT_CC_HYGIENE.md §9 (codified post Daniel directive 2026-05-02 SELF-CORRECTION):**
> "MANDATORY: după FIECARE ingest handover (chat strategic LOCKED decizii) — generate `ALIGNMENT_QUESTIONS_CHAT_NEW.md` în 📤_outbox/ înainte de a marca ingest COMPLET."

**Acest document = compliance §9** post Chat E ingest.

**Q16:** Format întrebări (citation §X / ADR Y verifiable + 3-tier path Da/Nu/Indică) este aliniat expected — sau alt format preferat (e.g. simple yes/no list, or table format)?

→ Dacă DA: pattern current = canonical pentru future ingests.  
→ Dacă NU: indică format preferat → update §9 PROMPT_CC_HYGIENE specification.

---

### Q17 — Push-back-uri Claude integrate format

**§36.58 listează 10 push-back-uri productive Claude integrate.**

**Q17:** Confirmi că **push-back-uri integrate** (cu rationale "X RESPINS — Y motiv") sunt **valuable to track** în session-lock entries — NU "noise" verbose, ci audit trail pentru viitoare decizii (replicabilitate gândire) ?

→ Dacă DA: pattern push-back tracking = canonical pentru future ingests.  
→ Dacă NU: trim push-back-uri din session-lock (păstrează doar în ingest input archive).

---

## §6 RESUMĂ — STATUS POST INGEST

**Decizii cumulative:** 54 LOCKED V1 (12+11+8+14+8+1)  
**ADR drafts:** 5 LOCKED V1 (toate review-ed Chat D §36.56 EXECUTED + Chat E inline amendments aplicate la 2)  
**Phase B wording:** 51 strings LOCKED V1 (5 engine modules + 2 placeholders)  
**Production gate:** **CLEARED conceptually** (wording LOCKED) — physical CI/CD lift pending Sprint 4.x source updates  
**Tests:** 1110/1110 unchanged (vault docs only, NO source code touched Chat E ingest)  
**Sprint 4.x cluster:** ~21-30h Opus revised (Q15 confirmation needed)  
**Next:** Sprint 4.x cluster implementation cuprinzător → Beta-launch ASAP ready

---

**Total întrebări aliniere:** 17 (Q1-Q17)

**Path forward post Daniel review:**
- **Răspuns la toate Q-urile** (sau spot-check 5-7 majore) → align Sprint 4.x cluster scope final.
- **Daniel solo carry-overs paralel:** Avocat barter outreach + Firebase Auth Console + DB rules publish + GDPR screenshot tutorial.
- **CC Opus next session:** Sprint 4.x cluster implementation autonomous run ~21-30h.

---

*Generat 2026-05-02 post Chat E PHASE B WORDING LOCK ingest. Scope §9 PROMPT_CC_HYGIENE MANDATORY. Cross-ref: HANDOVER_GLOBAL §36.58 + ADR_MODE_DETECTION_UI_v1 EXT-4 + ADR_OUTLIER_FILTER_v1 EXT-2.*
