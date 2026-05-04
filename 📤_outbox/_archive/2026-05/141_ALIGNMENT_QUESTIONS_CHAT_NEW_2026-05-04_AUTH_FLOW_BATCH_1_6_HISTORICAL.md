# ALIGNMENT QUESTIONS — Anti-Hallucination Search-Driven STRICT v2 (post §62-§73 ingest)

**Owner:** CC Opus per VAULT_RULES §HANDOVER_PROTOCOL step 9 amendment 2026-05-04 night + §47 LOCKED V1.
**Format:** **ANTI-HALLUCINATION STRICT v2** — Daniel directive 2026-05-04 evening late: chat strategic NEW NU spune "știu că..." din memorie. Singurul răspuns valid = paste rezultat brut `project_knowledge_search` + extract literal/numeric exact. Format v1 search-driven a permis hallucination plausible — v2 elimină asta prin trap questions + mandatory paste output + FAIL conditions explicit.
**Pass criteria:** ≥10/12 PASS (≥83%) → PROCEED CC Opus Auth Flow §36.80 implementation Priority 1 ABSOLUT (sau Priority 2 NEW Scenarios Coverage per Daniel decision).
**Source ingest:** `📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md`

---

## INSTRUCȚIUNI GLOBALE CHAT STRATEGIC NEW — METODĂ MANDATORY (citește înainte de Q1)

**REGULĂ #1: NO PROSE WITHOUT SEARCH.**
Pentru FIECARE Q, primul pas obligatoriu = `project_knowledge_search` cu keywords date. **NU începi răspunsul cu "Conform vault..." sau "Da, ..." sau "În §X se spune că..."** — toate astea sunt patterns de hallucination plauzibilă.

**REGULĂ #2: PASTE BRUT SEARCH OUTPUT.**
Per Q, structura răspuns OBLIGATORIE:

```
[Search call 1 keywords folosite]
[Paste rezultat brut chunk + path: ex `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` § X.Y]

[Search call 2 keywords cross-validation, dacă cerut]
[Paste rezultat brut]

EXTRACT LITERAL: [cifră exactă / wording verbatim / listă exhaustivă]
```

**NU:** "Sigur, conform §X..." → AUTO-FAIL Q. Hallucination prevention.

**REGULĂ #3: TRAP DETAILS = EXTRACT EXACT, NU APROXIMAT.**
Multe Q-uri au trap details (cifre exacte, wording specific, count anume). Răspuns "aproximativ" = AUTO-FAIL. Cifră trebuie să match literal bytes-by-bytes vault.

**REGULĂ #4: SEARCH MISS = FLAG, NU COMPLETARE.**
Dacă `project_knowledge_search` returnează ZERO match la keywords date → flag explicit "SEARCH MISS — keywords X NU returnează rezultat". **NU completa cu cunoștințe generale "tipic în asemenea proiecte..."** — asta e hallucination automatic FAIL.

**REGULĂ #5: CONFLICT REZULTATE = PASTE TOATE.**
Dacă search returnează 2-3 chunk-uri parțial relevante NU concordante → paste TOATE + flag "conflict apparent rezultate, paste toate, awaiting Daniel arbitration". NU choose silently.

**REGULĂ #6: NU REZUMA, NU PARAFRAZA.**
Per quotes verbatim, paste 2-4 propoziții EXACT cum apar în vault. Cuvânt-cu-cuvânt. Cratima, ghilimelele, em-dash-urile = preserve. Paraphrase = AUTO-FAIL Q.

**Daniel spot-check post-paste:** Daniel rulează `grep` pe vault cu keywords din răspuns chat. Mismatch verbatim → FAIL Q + chat marked unreliable pentru session.

---

## Q1: TRAP — Cumulative LOCKED count post §62-§73 — exact cifră numerică (NU round)?

**MANDATORY search step 1:** `project_knowledge_search "Cumulative LOCKED count post §70"`
**MANDATORY search step 2:** `project_knowledge_search "243 LOCKED V1 306 LOCKED V1 +63 substantive net"`

**Anti-hallucination trap:** Hallucination plauzibilă = "aproximativ 300" sau "300+" sau "cifră rotundă 305". Răspuns corect = **cifră exactă din §70 + cifră pre-session 243**.

**PASS criteria (toate 3 mandatory):**
1. Paste chunk verbatim §70 cu cifre 243 + 306 vizibile literal
2. Confirm "+63 substantive net post-overlap" verbatim (NU "~60" sau "60+")
3. Confirm citation: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §70

**FAIL conditions:** "Cumulative aproape 300" / "300+" / "~63 net" / "63" fără paste search output / cifră 305/307/310 / fără path complet.

---

## Q2: TRAP — Câte sub-amendments are §AMENDMENT 2026-05-04 evening BATCH 1-6 în ADR_MULTI_TENANT_AUTH_v1?

**MANDATORY search step 1:** `project_knowledge_search "§AMENDMENT 2026-05-04 evening BATCH 1-6"`
**MANDATORY search step 2:** `project_knowledge_search "Magic Link expiration 24h iOS REJECTED LOCKED PERMANENT email change new address"`

**Anti-hallucination trap:** Hallucination "câteva amendments" / "aproximativ 8-10" / "vreo 12". Răspuns corect = **cifră exactă numerotare .1 până la .N**.

**PASS criteria:**
1. Paste chunk verbatim ADR_MULTI_TENANT_AUTH_v1.md cu listă numerotată .1, .2, .3... vizibilă
2. Cifră exactă count (NU "aproximativ"): **N = ?**
3. Listă exhaustivă topice toate N sub-amendments în ordine .1 prima → .N ultima:
   - .1 [topic]
   - .2 [topic]
   - ...
   - .N [topic]
4. Citation path: `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md`

**FAIL conditions:** "Vreo 8-10" / "10+ amendments" / paraphrase fără paste / lipsă a 1-2 din lista exhaustivă / numerotare wrong.

---

## Q3: WORDING VERBATIM — Email body Magic Link inexistent (§64.5) — paste paragraph EXACT?

**MANDATORY search step 1:** `project_knowledge_search "Dacă ai deja un cont Andura acest link"`
**MANDATORY search step 2:** `project_knowledge_search "§64.5 Magic Link inexistent email behavior wording educativ"`

**Anti-hallucination trap:** Hallucination paraphrase generic stil "If you have an account..." sau translate corectat în RO sintetic. Răspuns corect = **wording cu structură EXACT cum apare în vault, inclusiv conjuncții/diacritice/punctuație**.

**PASS criteria:**
1. Paste chunk verbatim §64.5 cu paragraph email body în ghilimele
2. Extract wording email body în format `> "..."` exact bytes-by-bytes
3. Verifica: începe cu "Dacă" (NU "If" sau "Ai"), include "există în profilul tău" sau "se va conecta direct la profilul tău existent" — care variant exact?
4. Verifică al doilea paragraph: începe cu "Dacă ești la prima accesare..." — paste rest verbatim
5. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §64.5 + cross-confirm `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04 evening BATCH 1-6 .2

**FAIL conditions:** Paraphrase / "Something like 'If you have an account...'" / parțial paste fără final / fără ghilimele structură `> "..."` / cuvinte aproximate diferite (ex "atașat" în loc de "salvat automat").

---

## Q4: TRAP CIFRĂ — §63.5 Magic Link 24h OVERRIDE Q5 — care era choice INITIAL reconsidered?

**MANDATORY search step 1:** `project_knowledge_search "§63.5 Magic Link expiration 24h Override Q5 reconsider"`
**MANDATORY search step 2:** `project_knowledge_search "Q5 initial choice 1h reconsider 24h expiration"`

**Anti-hallucination trap:** Hallucination plauzibilă "30 min" sau "12h" sau "1 zi" sau "1 oră" în diferit format. Răspuns corect = **format exact cum apare în vault** (h vs hour vs oră).

**PASS criteria:**
1. Paste chunk verbatim §63.5
2. Extract literal initial choice: `Q5 initial choice [X] → reconsider [Y]` — care X exact?
3. Confirm rationale rationale verbatim Maria 65 cross-context PWA Android: "telefon slow + email întârzie 20-30 min + nu vede notif imediat. [X] = link expirat surpriză + Maria frustrare retry"
4. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §63.5

**FAIL conditions:** "30 min" / "12h" / "1 zi" / "ceva mai scurt" / aproximare / fără paste rezultat search.

---

## Q5: TRAP CIFRĂ — §66.7 Retention KPI hibrid OVERRIDE Q7 — care era choice INITIAL plus 3 cifre exacte hibrid?

**MANDATORY search step 1:** `project_knowledge_search "§66.7 Retention KPI primary pre-Beta Override Q7 reconsider hibrid industry-calibrated"`
**MANDATORY search step 2:** `project_knowledge_search "D7 ≥45% target ≥35% acceptable <30% red flag Strong Hevy 25-40% medie"`

**Anti-hallucination trap:** Hallucination "70%" sau "50%" sau "industry standard 30%" sau confuzie cifre target/acceptable/red flag. Răspuns corect = **3 cifre exacte EXACT cum apar în vault + cifră initial Q7**.

**PASS criteria:**
1. Paste chunk verbatim §66.7
2. Extract literal Q7 initial choice: D7 ≥**[X]%** (care X exact?)
3. Extract literal hibrid 3 cifre exacte:
   - Target: D7 ≥**[?]%** (motivational realistic)
   - Acceptable: D7 ≥**[?]%** (industry-calibrated familie/prieteni bonus)
   - Red flag: D7 <**[?]%** (UX issue major)
4. Extract industry benchmark cifră: "Strong/Hevy publicly disclosed = **[?]-[?]%** D7 medie"
5. Extract familie/prieteni bonus exact: "+**[?]-[?]%** bonus realistic"
6. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §66.7

**FAIL conditions:** Cifre aproximate / wrong range / confuzie target vs acceptable / lipsă cifră Q7 initial / fără source benchmark Strong/Hevy.

---

## Q6: ENUMERARE EXHAUSTIVĂ — §67.10 iOS REJECTED LOCKED PERMANENT — paste 4 stages EXACT cu wording specific per stage?

**MANDATORY search step 1:** `project_knowledge_search "§67.10 App store distribution PWA TWA Android iOS REJECTED LOCKED PERMANENT"`
**MANDATORY search step 2:** `project_knowledge_search "iOS REJECTED Pre-Beta Post-Beta v1.0 v1.5 v2 v3 demand-driven"`

**Anti-hallucination trap:** Hallucination "iOS deferred" / "iOS later" / "iOS post-Beta v1.5" — toate parțial corecte dar NU complete. Răspuns corect = **EXACT 4 stages numerotate cu wording specific per stage**.

**PASS criteria:**
1. Paste chunk verbatim §67.10
2. Listă exhaustivă 4 stages literal cu wording per stage:
   - Stage 1 Pre-Beta: "[paste exact]"
   - Stage 2 Post-Beta v1.0: "[paste exact]"
   - Stage 3 Post-Beta v1.5: "[paste exact]"
   - Stage 4 v2/v3: "[paste exact]"
3. Confirm "**$99/an Apple Developer**" cifră exactă $99 cum apare wording vault
4. Confirm rate fail tolerated cifră % iOS pre-Beta browser default: "**~[?]-[?]%**"
5. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §67.10 + cross-confirm `DIFF_FLAGS.md` P1-FLAG-IOS-PERMANENT

**FAIL conditions:** "iOS later" generic / 3 stages doar / lipsă cifră $99 / lipsă cifră rate fail / paraphrase stages.

---

## Q7: SOURCE AUTHORITY — §50.3 D2.3.1 Medical Database — care 2 organizații EXACT + Daniel role?

**MANDATORY search step 1:** `project_knowledge_search "§50.3.4 D2.3.1 Sursa V1 Public guidelines"`
**MANDATORY search step 2:** `project_knowledge_search "NSCA ACSM Daniel curate subset"`

**Anti-hallucination trap:** Hallucination "WHO" sau "Mayo Clinic" sau "AHA American Heart Association" sau "NASM National Academy" — toate plauzibile dar **NU în vault**. Răspuns corect = **2 organizații exact NSCA + ACSM + Daniel role specific**.

**PASS criteria:**
1. Paste chunk verbatim §50.3.4 (D2.3.1)
2. Extract literal 2 organizații în ordine cum apar: "[?]" + "[?]"
3. Extract Daniel role verbatim: "[?] curate subset relevant Andura V1"
4. Confirm rationale verbatim: "Standardizare publică oficială. Cost **[?]**. Audit-trail public sources = legal defense layer real + rigor max"
5. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §50.3.4

**FAIL conditions:** "WHO" / "Mayo Clinic" / "AHA" / "NASM" / 1 organizație doar / Daniel "approve" în loc de "curate" / cost wrong (NU "0" exact).

---

## Q8: CROSS-FILE — Section number SAFETY ASYMMETRIC PRINCIPLE în PRODUCT_STRATEGY_SPEC_v1?

**MANDATORY search step 1:** `project_knowledge_search "SAFETY ASYMMETRIC PRINCIPLE Push-back resolved"`
**MANDATORY search step 2:** `project_knowledge_search "Health-threatening eating disorder Forțează Passive Mode AI override NU user agency"`

**Anti-hallucination trap:** Hallucination "§5.10" sau "§5.11" sau "§5.12" sau "§6.X" — fără verificare exact. Răspuns corect = **section number EXACT cu cifră Push-back#X resolved**.

**PASS criteria:**
1. Paste chunk verbatim section header
2. Extract literal section number: "**§[?].[?]** SAFETY ASYMMETRIC PRINCIPLE"
3. Extract literal Push-back#X resolved: "(Push-back **#[?]** resolved)"
4. Listă exhaustivă table 2 patterns:
   - Pattern type 1: "[?]" → Approach: "[?]"
   - Pattern type 2: "[?]" → Approach: "[?]"
5. Citation path: `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §[?].[?]

**FAIL conditions:** Section number wrong / "Push-back #2" în loc de wrong cifră / lipsă table 2 patterns / paraphrase approaches.

---

## Q9: TRAP CIFRĂ EXACTĂ — HANDOVER_GLOBAL post-merge §62-§73 — câte LOC EXACT (NU round)?

**MANDATORY search step 1:** `project_knowledge_search "HANDOVER_GLOBAL split FLAG TRIGGERED 7664 LOC"`
**MANDATORY search step 2:** `project_knowledge_search "post-merge §62-§73 ingest 7000 threshold §VAULT_HYGIENE_PASS STEP 13"`

**Anti-hallucination trap:** Hallucination "~7600" sau "~7700" sau "7500" round numbers. Răspuns corect = **cifră exactă 4 digits** + threshold cifră + headroom.

**PASS criteria:**
1. Paste chunk verbatim DIFF_FLAGS.md sau §72 sau §VAULT_HYGIENE_PASS STEP 13 area cu LOC actual
2. Extract literal cifră actual post-merge: **[?]** LOC
3. Extract literal threshold §VAULT_HYGIENE_PASS STEP 13: ">**[?]** LOC FLAG candidate, >**[?]** LOC ESCALATE BLOCKER mandatory"
4. Calculate headroom: actual = ?, threshold ESCALATE = ?, headroom = ? LOC = ? ingest-uri future
5. Citation path: `DIFF_FLAGS.md` (root) sau `VAULT_RULES.md` §VAULT_HYGIENE_PASS STEP 13 sau HANDOVER §72

**FAIL conditions:** "~7600" round / "7500" / "depinde" / lipsă threshold cifră 7000 + 10000 explicit / lipsă headroom calculation.

---

## Q10: TRAP TOPIC — §47 Alignment Questions Generation Rule — care e PRE-FED format status status post 2026-05-04 night?

**MANDATORY search step 1:** `project_knowledge_search "§47 Alignment Questions Generation Rule LOCKED V1 search-driven"`
**MANDATORY search step 2:** `project_knowledge_search "Răspuns verbatim DEPRECATED format pre-fed CC Opus MUST NOT genera"`

**Anti-hallucination trap:** Hallucination "format pre-fed încă acceptabil ca alternativă" sau "ambele formate co-existente". Răspuns corect = **DEPRECATED ABSOLUT, INTERZIS post 2026-05-04 night**.

**PASS criteria:**
1. Paste chunk verbatim §47.3 DEPRECATED format
2. Extract literal status: "[?] format ([?] mai folosi)" — wording exact
3. Extract verbatim: "CC Opus MUST NOT genera acest format under any circumstances post **[data exactă]**"
4. Extract amendments cross-refs §47.5: "VAULT_RULES.md §HANDOVER_PROTOCOL step 9 amendment + PROMPT_CC_HYGIENE.md §9 amendment + memory rule **#[?]** amendment"
5. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §47.3 + §47.5

**FAIL conditions:** "Pre-fed acceptabil ca opțiune" / "ambele co-existente" / data wrong / memory rule # wrong / lipsă wording verbatim "MUST NOT genera under any circumstances".

---

## Q11: ENUMERARE — Câte fișiere active vault Stats post §62-§73 ingest? Plus listă FILES amendamente inline acest ingest?

**MANDATORY search step 1:** `project_knowledge_search "Stats fișiere active vault 68"`
**MANDATORY search step 2:** `project_knowledge_search "PRODUCT_STRATEGY_SPEC_v1 ONBOARDING_SSOT_V1 amendments inline 2026-05-04 evening"`

**Anti-hallucination trap:** Hallucination "70+" sau "65" sau confuzie create vs amendment. Răspuns corect = **cifră exactă INDEX_MASTER + listă fișiere modificate THIS ingest exhaustivă**.

**PASS criteria:**
1. Paste chunk verbatim INDEX_MASTER.md header Stats
2. Extract literal cifră fișiere active vault post §62-§73: "**[?] fișiere active vault**"
3. Listă exhaustivă fișiere modificate (amendments inline) THIS ingest:
   - HANDOVER_GLOBAL_2026-04-30_evening.md (merge §62-§73)
   - DECISION_LOG.md (+1 entry)
   - INDEX_MASTER.md (nav + cumulative)
   - DIFF_FLAGS.md (2 NEW P1 + updates)
   - ADR_MULTI_TENANT_AUTH_v1.md (§AMENDMENT 2026-05-04 evening BATCH 1-6 .1-.10)
   - PRODUCT_STRATEGY_SPEC_v1.md (§5.4/§5.5/§5.8/§6.1/§6.5)
   - ONBOARDING_SSOT_V1.md (§1/§8)
   - 📤_outbox/LATEST.md (replace)
   - 📤_outbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md (replace v1 search-driven cu v2 anti-hallucination)
4. Listă fișiere CREATE NEW THIS ingest: ZERO (toate inline amendments)
5. Citation path: `00-index/INDEX_MASTER.md` header

**FAIL conditions:** "70 fișiere" / lipsă PRODUCT_STRATEGY_SPEC_v1.md din lista modificate / lipsă ONBOARDING_SSOT_V1.md / "1-2 fișiere noi create" wrong (zero new).

---

## Q12: CROSS-VALIDATION — §69 Scenarios Coverage PRE-BETA BLOCKER — câte scenarios decisions remaining + câte chat-uri estimative?

**MANDATORY search step 1:** `project_knowledge_search "§69 Scenarios Decision Coverage PRE-BETA BLOCKER FLAG"`
**MANDATORY search step 2:** `project_knowledge_search "1200-1700 scenarios decisions remaining acoperire actuală 15-25% chat-uri strategice dedicate"`

**Anti-hallucination trap:** Hallucination "câteva mii scenarios" sau "~1000" sau "5-10 chat-uri" — toate aproximate plauzibile. Răspuns corect = **2 cifre range exacte EXACT cum apar în vault**.

**PASS criteria:**
1. Paste chunk verbatim §69.1
2. Extract literal gap pre-Beta range: "~**[?]-[?]** scenarios decisions remaining"
3. Extract literal acoperire actuală range: "~**[?]-[?]%** scope total scenarios"
4. Extract literal chat-uri estimative: "~**[?]-[?]** chat-uri strategice dedicate"
5. Extract literal coverage actual breakdown 5 sources cu cifre exacte:
   - §42.1-§42.10 base **[?]** decisions LOCKED
   - §45.2-§45.5 ADR 026 spec **[?]** decisions LOCKED
   - §50.1-§50.4 D-cluster **[?]** decisions LOCKED
   - §56.1-§56.19 Auth Flow §36.80 **[?]** sub-decisions LOCKED
   - §62-§68 Batch 1-6 + Closure **[?]** sub-decisions LOCKED
   - **Total cumulative: [?] LOCKED V1**
6. Extract verbatim "Beta launch IMPOSIBIL fără..." statement complete
7. Citation path: `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §69.1 + cross-confirm `DIFF_FLAGS.md` P1-FLAG-SCENARIOS-COVERAGE

**FAIL conditions:** "Câteva mii" / range wrong / cifre breakdown 5 sources greșite / Total ≠ 306 / lipsă "Beta launch IMPOSIBIL fără" verbatim.

---

## Pass / Fail Criteria Final

| Score | Status | Action Daniel |
|-------|--------|---------------|
| 12/12 | EXCELLENT | Anti-hallucination strict full PASS — chat poate naviga vault SSOT autonomous + paste search output brut + extract literal/numeric exact + zero hallucination plausible. PROCEED Priority 1 ABSOLUT CC Opus Auth Flow §36.80 implementation phased post Daniel manual prep complete. |
| 10-11/12 | PASS | PROCEED, flag 1-2 specific Q-uri missed pentru re-sync targeted dacă material critical. Spot-check Daniel mandatory pe Q-uri missed. |
| <10/12 | FAIL | RE-SYNC mandatory: chat strategic NEW NU folosește `project_knowledge_search` real + halucinează plausible. Re-paste alignment questions după chat full Project Knowledge sync verificat. Sau regenerare handover dacă SSOT incomplete. **Sau** chat strategic NEW e marked unreliable pentru session — Daniel decision use alt chat instance fresh. |

**Spot-check Daniel post-paste anti-hallucination:**
1. Chat răspunde Q1 cu cifră EXACTĂ "306" (NU "300+" / "~300" / "305")? → Daniel grep `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §70 → match exact?
2. Chat răspunde Q2 cu count exact sub-amendments + listă exhaustivă topice .1-.N? → Daniel grep `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md` §AMENDMENT 2026-05-04 evening BATCH 1-6 → count + topice match?
3. Chat răspunde Q3 cu wording email body verbatim început "Dacă ai deja un cont Andura, acest link..."? → Daniel grep §64.5 → wording bytes-match?
4. Chat răspunde Q5 cu 3 cifre hibrid + cifră Q7 initial 60%? → Daniel grep §66.7 → cifre match?
5. Chat răspunde Q6 cu 4 stages iOS + cifră $99 + rate fail %? → Daniel grep §67.10 → 4 stages + 2 cifre match?
6. Chat răspunde Q7 cu "NSCA + ACSM" exact (NU "WHO" / "AHA")? → Daniel grep §50.3.4 → 2 organizații match?
7. Chat răspunde Q9 cu cifră EXACTĂ "7664" (NU "~7600")? → Daniel `wc -l 06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` → match?
8. Chat răspunde Q11 cu listă exhaustivă 9 fișiere modificate + ZERO files NEW create? → Daniel `git log --name-only -1` → match?
9. Chat răspunde Q12 cu breakdown 5 sources cifre + Total 306? → Daniel grep §69.1 → breakdown match?
10. Chat raportează "SEARCH MISS" pe orice Q dacă search nu returnează? → flag explicit, NU completare hallucinated.
11. Chat începe ORICE răspuns cu "Conform vault..." sau "Da, ..." fără paste search output brut? → AUTO-FAIL Q + chat marked unreliable.

---

🦫 **12 Q-uri anti-hallucination strict v2 (Daniel directive 2026-05-04 evening late post observație v1 search-driven permite hallucination plausible). Format MANDATORY: paste search output brut + extract literal/numeric exact + zero paraphrase. Trap questions cu cifre exacte + wording verbatim + count exhaustiv + cross-validation paths. FAIL conditions explicit pentru hallucination patterns. Pass criteria ≥10/12 (≥83%). Source ingest archived `_archive/2026-05/131_*`. Predecessors archived `_archive/2026-05/132_*` + `_archive/2026-05/133_*`. v1 search-driven SUPERSEDED by v2 anti-hallucination acest fișier (NU archived separat — fresh-just-generated overwrite acceptable per ingest current).**

**Andura needs to be the best. ✊**
