---
name: ALIGNMENT_QUESTIONS_CHAT_NEW
description: 15 adversarial questions to verify chat new alignment cu SSOT post-Opus run 2026-05-02 PRE-LAUNCH FINAL (handover ingest — F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU + Muscle Memory Index hibrid LOCKED V1 + Storage Full UX 80%/95% LOCKED V1 + 3 Optimizări UX Friction LOCKED + Friction Map V1 final + 3 Blockers Sprint 4.x identificate + GC Tombstones defer 6 luni evaluare 1 iul 2027 + Investiții confirmate ZERO buget nou). Daniel paste in primul mesaj chat nou — chat răspunde cu citation explicită §X / ADR Y / file.md → pass criteria ≥12/15 corecte.
type: alignment-questions
date: 2026-05-02 PRE-LAUNCH FINAL
---

# ALIGNMENT QUESTIONS — Chat Nou Post-Ingest 2026-05-02 PRE-LAUNCH FINAL

**Use:** Daniel paste-uiește integral în primul mesaj chat Claude nou. Verifică alignment ≥12/15 (≥80%) cu citation `§X file.md` / `ADR Y` / `[[FILE_NAME]]`.

**Pass criteria:** chat nou citează corect SSOT pentru fiecare răspuns. Refuz vag = STOP, retry `project_knowledge_search` sau regenerare questions.

---

## §1 F-NEW-1/2/3/4 LOCKED V1 OBLIGATORIU — 5 Q-uri

**Q1.** Care e decizia inversare regulă F-NEW-1 (UI Default RO sau EN?) și care e wording-ul oficial pentru 3 din cele 6 traduceri locked? Ce excepție permite Toggle Settings?
*Expected:* §22 F-NEW-1 — UI Default = RO primary universal. Toggle Settings "Afișează denumiri internaționale (EN)" implicit OFF. Rationale Beachhead RO + Maria/Gigica non-tech zero vocabular EN fitness. Wording-uri locked: Romanian Deadlift → "Îndreptări cu picioarele aproape drepte (RDL)" / Lat Pulldown → "Tracțiuni la helcometru" / Bulgarian Split Squat → "Genuflexiuni pe un picior, cu sprijin pe bancă (Bulgarian Split Squat)" / Cable Row → "Ramat la cablu" / Hip Thrust → "Ridicări de bazin (Hip Thrust)" / Face Pull → "Tracțiuni spre față (Face Pull)". Pattern reusable 3 categorii (tipare mari mișcare RO complet / variații moderne RO descriptiv + EN paranteză / termeni sală RO consacrați RO pur). Toggle Settings EN advanced users → UI switch denumiri internaționale, DB indexează ambele variante search cross-language.

**Q2.** Care e matricea F-NEW-2 cu 3 tiers + frecvența progresie + incrementele compound/izolare? Ce e Sprinter Cap Modifier și de ce?
*Expected:* §22 F-NEW-2 — Beginner 0-10 sesiuni (progresie la fiecare sesiune RPE corect) / Intermediate 11-50 (1 dată la 2-3 sesiuni acumulare volum) / Advanced 51+ (1 dată la 4-6 sesiuni micro-periodizare). Incremente Compound (BBS, BBP, RDL, Trap Bar): +1 kg până +2.5 kg / Izolare (Curls, Lateral Raises): +0.5 kg sau +1 rep înainte urcare greutate. Sprinter Cap Modifier trigger Profile Type == Sprinter (volume creep risk + hyperfocus correlation): Max Compound 1.0 kg (în loc de 2.5 kg) + Max Isolation +1 rep (în loc de +0.5 kg). Rationale: Sprinter Advanced cu pattern volume creep + hyperfocus 8h/zi care primește +2.5kg compound = alimentezi auto-aggression; Marathon/Strategic same tier beneficiază progresie agresivă pentru că NU are pattern risc. Cross-ref ADR Q-0231 Profile Typing.

**Q3.** Ce wording soft warning primește user Advanced care sare Deload Săpt 5? Cum se păstrează agency 100%?
*Expected:* §22 F-NEW-2 Edge Case — banner soft warning Bugatti tone (anti-paternalism, NU medical-flavored): "Săptămâna de deload a trecut neutilizată. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recuperează în mișcare, nu doar în repaus." Behavior: banner soft, user păstrează agency 100%, NU force-deload retroactiv. Wording elimină paternalism + anti-RE preserved (NU "trebuie să faci deload", ci "merge mai bine RPE 6-7").

**Q4.** F-NEW-3 — care e logic-ul rate-limiting echipament + phase change? Ce trigger compus declanșează "User Pierdut" (eliminare false positives)?
*Expected:* §22 F-NEW-3 — Equipment Unavailable: 3+ înlocuiri în fereastră rolling 7 zile → engine învață silent (Sticky Last Swap activ + 4-Swaps Rule background + ZERO banner/notificare). Phase Change: 2 schimbări manuale fază (Cut → Maintain → Cut) în <24h → a 2-a absorbită silent (backend update transparent + confirmare discretă "Obiectiv actualizat" + ZERO modal full-screen). Edge Case "User Pierdut" trigger compus AMBELE condiții: (1) Aderență scade <25% pe fereastră 14 zile rolling AND (2) 7 zile consecutive zero login app → override cooldown 21 zile + ecran User Pierdut cu wording §28.2 "N-ai mai trecut de ceva timp pe aici. Nu-ți face griji pentru pauză: programul de azi e configurat să te repună în mișcare fără grabă." Rationale: elimină alarme false din boală/concediu temporar (60% aderență + boală 7 zile = 22% artificial NU = pierdut real).

**Q5.** F-NEW-4 — care e wording-ul banner-ului LOCKED + care e replacement-ul pentru butonul "Override (înțeleg riscurile)" force-typing? De ce această schimbare e anti-RE breach prod fix?
*Expected:* §22 F-NEW-4 — Banner LOCKED: "Plan ajustat astăzi pentru recovery." NU "Plan redus 30%", NU "Adherence scăzută: 0%", NU "Deviation crescut: 100%". Buton LOCKED replacement: "Folosesc varianta mea" (agency explicit user, sound mature, Bugatti tone, zero force-typing, zero medical disclaimer style). Rationale anti-RE: percentage leak + paternalist override + numerice raw expuneau backend internals user-facing = breach §29.3.3 anti-RE strict thresholds engine internal. Schimbarea = OBLIGATORIU V1 prod fix + protecție legală implicită.

---

## §2 Muscle Memory Index (MMI) + Storage Full UX — 4 Q-uri

**Q6.** Care e formula MMI hibrid + tabelul multiplicatori/boost pentru 3 ranges de pauză? De ce hibrid (lookup + boost)?
*Expected:* §32 — Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup. Tabel: 6-12 luni 0.80× pornire / 1.25× boost progresie primele 3 săpt. 12-24 luni 0.70× / 1.10× boost. 24+ luni 0.60× / 1.00× (start proaspăt). Rationale hibrid: păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare).

**Q7.** Cum trigger-ul MMI threshold respectă agency user-controlled (NU paternalism)? Ce wording UI re-engagement + comportament dacă user refuză?
*Expected:* §32 — 6+ luni pauză → prompt user prima deschidere app: "Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?" Anti-paternalism + agency 100% (NU hardcoded 6 luni rule, NU pre-pause-aware automatic). Wording UI re-engagement Bugatti Tone: "Pauza face parte din drum. Începem treptat — corpul tău își amintește." Comportament: opțional refusable. User refuză → engine încarcă greutățile maxime istorice + banner discret avertizare risc accidentare (NU modal blocant). Justified V1 (Maria post-operație șold 8 luni revine ~iulie 2027).

**Q8.** Care e diferența Storage Full UX 80% vs 95% (banner săptămânal vs modal blocant) și ce 3 alegeri obligatorii oferă modal blocant 95%?
*Expected:* §33 — Threshold 80% (~80MB): banner discret săptămânal NU blocant cu 3 buttons (Exportă datele JSON local download / Află mai multe despre Cloud Pro upgrade info / Închide). Frecvență afișare 1×/săpt până user acționează sau atinge 95%. Threshold 95% (~95MB): modal blocant NU se închide fără acțiune directă, user trebuie să aleagă explicit una din 3: (1) Descarcă istoricul Export JSON local / (2) Activează modul Cloud Upgrade Pro / (3) Șterge automat datele mai vechi de 180 zile (Alegere definitivă). Rationale: ZERO data loss silent, user informat explicit ce se întâmplă, alegerea = consimțământ documentat industry standard Apple/Google Photos/Dropbox.

**Q9.** Edge case Free user 95% refuză toate 3 alegeri — ce face engine? Cum se aplică auto-rotate 180 zile?
*Expected:* §33 — Soluție: Cap Pro upgrade prompt 1×/săpt + auto-rotate >180 zile DOAR DACĂ user a ales explicit "Șterge automat" în modal blocant 95%. Auto-rotate 180 zile NU este automatic by default — necesită consimțământ explicit user (alegere definitivă). Free user refuză toate 3 → engine continuă afișa cap 1×/săpt prompt Pro upgrade + storage rămâne plin până user acționează. Justified V1 (~4-6h Sonnet) — primii power users 80MB ~6-12 luni post-launch, gap v1.5 risk crash silent prod.

---

## §3 3 Optimizări UX Friction + Friction Map — 2 Q-uri

**Q10.** Cum se micșorează onboarding de la 5 la 4 ecrane + ce wording exact are checkbox-ul disclaimer integrat în ecran 4 + ce buton e disabled până checkbox bifat?
*Expected:* §29.5.14 amendment 2026-05-02 — disclaimer medical mutat din ecran dedicat în ecran 4 (Obiectiv). Arhitectură ecran 4 final: heading "Care e obiectivul tău principal?" + 3 opțiuni mari obiective + sub opțiuni checkbox cu wording §29.7.1 LOCKED: "Înțeleg că Andura este o aplicație de wellness și nu înlocuiește sfatul medicului. Mă antrenez pe propria răspundere." Buton "Generează programul" disabled până checkbox bifat. Impact: total <45 sec (vs <60 sec anterior). Economie 1 ecran întreg.

**Q11.** Ce e "The Next-Up Gaze" + cum funcționează Autofocus iOS workaround? Ce nivel friction are Storage Full 95% în Friction Map V1 final și de ce e justified high?
*Expected:* §29.5.5 amendment + §29.5.17 + §29.5.18 — The Next-Up Gaze: la pornire rest timer auto-start §29.5.5 LIVE, ecran scoate în evidență discret cartonașul setului următor cu soft highlight + border glow subtle (folosește `ps-rec-kg`/`ps-rec-reps` existent în `restTimer.js`). Effort ~1-2h Sonnet. Autofocus iOS workaround: `<input type="number" inputmode="numeric">` + focus programatic via `setTimeout 50ms` la mount component (`useEffect`/`onMount`). iOS Safari blochează autofocus standard post-page-load anti-spam, setTimeout 50ms = pattern industry tested. Friction Map V1 final touchpoint Storage Full 95% = 🔴 High justified (zero data loss silent industry standard, justified consimțământ documentat user).

---

## §4 3 Blockers Sprint 4.x + GC Defer + Investiții — 3 Q-uri

**Q12.** Care e Memory Paradox bug-ul Blocker 1 T&B Faza 2 + cum se rezolvă + estimate effort? Cross-ref ADR-uri.
*Expected:* §34.1 — Blocker 1 T&B Pattern Faza 2 HARD BLOCKER V1. Context ADR 011 amendment + ADR 021 Faza 1 LIVE doar algorithm core, Faza 2 persistence integration NEIMPLEMENTAT. Memory paradox observat 2× testing: user delete entry → reload → entry RE-APARE prin Firebase pull. Cum se rezolvă: task CC Opus dedicat Sprint 4.x — implementare integrare persistență Tombstone & Branching. Tombstones marcaj logic ștergeri preserved (NU delete fizic). Branching = când 2 devices scriu simultan același parentId → preservare ambele branch-uri + UI prompt "varianta A sau B?" pentru user resolve. Effort estimate: 50-80h trad / ~3-5h Opus comprehensive. Cross-refs: ADR 011 amendment §Firebase sync + ADR 021 §Implementation phasing Faza 2 + COGNITIVE_ARCHITECTURE_SPEC §Q9 + 04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md.

**Q13.** Care e syntaxa corectă LOCKED `database.rules.json` Blocker 2 RTDB lock (NU Firestore) + workflow Daniel pentru publish?
*Expected:* §34.2 — Blocker 2 Firebase Rules RTDB Lock HARD BLOCKER V1. Context: rules currently OPEN (`allow read, write: if true`) per ADR 007 dev. Production launch cu rules open = data theft + mass corruption. Sintaxa corectă LOCKED: `{"rules": {"users": {"$uid": {".read": "auth !== null && auth.uid === $uid", ".write": "auth !== null && auth.uid === $uid"}}}}`. Workflow: Daniel testează local cu Firebase emulator → publică manual în consolă Firebase. Sub 1h total. Cross-refs: ADR 007 + Q-0352 + Q-0362 (RTDB NU Firestore — stack actual NU folosește Firestore + NU folosește Firebase Storage).

**Q14.** Care e decizia GC Tombstones (LOCKED) + borna evaluare + 3 alegeri la borna 1 iul 2027? De ce defer rationale buget zero?
*Expected:* §35 — Cloud Functions Tombstone GC AMÂNAT primele 6 luni post-launch. Borna evaluare oficială 1 iulie 2027 (exact 6 luni post Soft Launch 1 ian 2027). Rationale Bugatti Grade Buget Zero: zero efort dezvoltare (risc ștergere date valide accidental) + fără costuri suplimentare (Cloud Functions necesită upgrade Firebase Blaze, rămânem Spark gratuit) + spațiu suficient cu margin (RTDB free tier Spark 1GB, Tombstone ~50-100 bytes JSON × 50 deletes/user/lună × 1000 useri × 6 luni = ~30MB total = ~3% din 1GB) + focus retention. La 1 iul 2027 Daniel decide între A automation Cloud Functions GC (upgrade Blaze plan ~€0-25/lună) / B continuare manual cleanup script Daniel 1×/lună (cost zero) / C mai amână GC dacă volume rămâne sub 5% capacitate. Cross-refs: ADR 011 amendment §Firebase sync (90 zile retention) + §31 Investiții (Firebase Blaze condition) + §34.1 T&B Faza 2.

---

## §5 Status V1 + Carry-over — 1 Q

**Q15.** Câte sesiuni chat strategic sunt rămase pre-launch v1 după acest pre-launch final? Ce backup tag origin a fost pushed pre-ingest 2026-05-02 PRE-LAUNCH FINAL? Care e total Investiții 6 luni primele post-launch + total worst-case primul an?
*Expected:* §0 + §13 + §14 + §15 + §31 amendment — **Sesiuni chat strategic rămase pre-launch v1: ZERO (0).** Toate decizii LOCKED. Pre-launch V1 scope CLOSED. 8/8 templates LOCKED design-wise (100%) + F-NEW LOCKED V1 + MMI LOCKED V1 + Storage Full UX LOCKED V1 + 3 Blockers identificate + GC defer 6 luni. Restul = pure execution: rebrand sweep + ADR 022 V2 + Sprint 4.x cluster + wording Phase B/C + Beta sept-dec 2026 + audit legal dec 2026 + Soft Launch 1 ian 2027 + Borna GC 1 iul 2027. Backup tag origin pushed pre-ingest: `pre-handover-ingest-2026-05-02-pre-launch-final` (HEAD pre-ingest `c9929a8`). Investiții (§31 AMENDMENT 2026-05-02): Total realist primele 6 luni ~€310-515 (Firebase free tier suficient cf §35) / Total worst-case primul an (1000 useri) ~€500-700 (consultanță legală €300-500 + andura.app €10-15/an + Firebase Blaze €0-25/lună post-launch >1000 useri). Cheltuieli ZERO sesiunea 2026-05-02 (CC Opus task time + Daniel review free).

---

🦫 **Pass criteria: ≥12/15 (≥80%) cu citation §X / ADR Y / file.md. Refuz vag = STOP, retry `project_knowledge_search` sau regenerare. Pre-launch V1 scope CLOSED — chat nou poate procede direct la rebrand sweep + Sprint 4.x execution.**
