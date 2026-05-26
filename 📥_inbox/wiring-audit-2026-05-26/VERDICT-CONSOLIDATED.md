# Audit Due-Diligence Consolidat — Andura @ 30 zile (2026-05-26)

**Lentile:** 5 audituri fresh-eyes Opus, read-only, paralel. Sub-rapoarte in acest folder:
`STUB-WIRING-AUDIT.md` (fatada/cablare feature) · `DECISION-FACTOR-AUDIT.md` (factori decizie engine) · `ENGINE-CORRECTNESS-ARCH-AUDIT.md` (matematica + arhitectura + integritate date) · `SWEEP-TESTS-E2E-SECURITY-AUDIT.md` (onestitate teste + E2E + bug-uri/securitate) · acoperire denumiri exercitii (in commit `570ae6be`).

**main @ verdict:** HEAD `570ae6be`, 12 commits ahead origin NEPUSHED. Zero fix-uri aplicate inca (audit pur, per cererea Daniel — consolidam, apoi executam dupa sanctiune).

---

## Verdict (senior dev / "mi-as baga banii?")

**Fundatia e inginerie reala, nu banda adeziva. Dar jumatate din creier nu e cablat la prescriptie, plus 3 bug-uri de siguranta reale.**

Andura are doua jumatati de creier:
- **Adaptarea la CORPUL tau in timp = REALA.** Nutritie (TDEE Bayesian pe cantar real, goal-kcal, proteine, bf%), recuperare pe muschi, pain->recovery, PR, streak, progresie DP pe istoric. Matematica corecta (0 bug-uri critice, rulata pe persoane reale). Plumbing solid (auth, GDPR, migrari idempotente, sync). Coach Brain Eval = harness genuin.
- **Adaptarea ANTRENAMENTULUI la starea ta de AZI = in mare fatada.** Randeaza numere plauzibile din istoric DP, deci PARE adaptiv, dar firul nu ajunge la prescriptie: readiness nu misca greutatea, RPE nu corecteaza, periodizarea e inghetata, deload reactiv mort, selectie pe puncte slabe moarta, pauza/seturi hardcodate.

**Cauza-radacina (de ce 5 audituri anterioare au ratat):** "engine exista + testat unit in izolare cu inputuri hranite manual" a fost confundat cu "feature merge pentru user". Testele + auditurile au validat motoarele izolat, in timp ce productia (`buildUserStateForPipeline`) nu le-a hranit niciodata factorii. Vizor fara usa, la scara. Fiecare item rupt se randeaza, are teste verzi, arata ca-n mockup — fix de-aia n-a sunat alarma.

**Numeric:** Cablare 34 WIRED / 3 PARTIAL / 4 STUB / 2 DEAD · Factori-decizie 9 CORECT / 8 PARTIAL / 6 RUPT · Corectitudine 0 CRIT / 1 HIGH / 4 MED · Sweep 0 CRIT / 3 HIGH. Teste ~85% reale ca unit, dar gaurile de ~15% stau EXACT pe feature-urile rupte; un singur test conduce pipeline-ul real de productie.

---

## CE E REAL (nu subevaluam)
- Matematica tuturor celor 9 motoare: corecta, garzi NaN/div-zero/clamp OK, numere sane pe persoane reale.
- Creierul de nutritie (cel mai puternic): TDEE adaptiv + goal-kcal + proteine + bf% + proiectie — chiar se adapteaza E2E.
- Recuperare/pain, PR, streak, readiness SCORE, progresie DP pe istoric real, MMI cap.
- Auth `restoreSession` matur (offline-safe, token rotation). GDPR export/import. Migrari fail-loud idempotente. Flux date user->store->logs->engine->Firebase corect legat.
- Coach Brain Eval = harness real (prinde violari injectate), NU gol.

## CE E FATADA / RUPT (gap-ul) — grupat + ranked

### Cluster 0 — BUG-URI SIGURANTA (P0, blocheaza orice lansare)
| ID | Bug | Impact | Sursa |
|----|-----|--------|-------|
| H1 | localStorage Tier-0 fara prefix per-UID (`db.js:17`); LogoutConfirm sterge doar token-uri | User B vede datele user A pe acelasi device + merge local-wins poate urca datele A in cloud-ul B | SWEEP H1 |
| H2 | PostRpe re-deriva planul la final via `getTodayWorkout()` (`PostRpe.tsx:91`); daca ziua a trecut in zi de odihna -> null -> antrenamentul facut NU se salveaza | Pierdere date sesiune | SWEEP H2 |
| FCM-sync | `syncToFirebase` PUT pe tot arborele cu doar SYNC_KEYS sterge `notificationPrefs` + `fcmTokens` la urmatorul log | Push-ul NU e safe de lansat pana sync-ul nu devine PATCH | ENGINE-CORRECTNESS H |

### Cluster 1 — Creierul de prescriptie (P1, "pare destept dar nu e cablat")
| Decizie | Ar trebui sa foloseasca | Realitate | Sursa |
|---------|------------------------|-----------|-------|
| Greutate planificata | readiness (getSmartRecommendation) | apeleaza bare `DP.recommend` (`scheduleAdapterAggregate.ts:503`); comentariu in `Workout.tsx:110-118` MINTE ca o face | DECISION #1 + E2E-b + H3 |
| Corectie RPE in sesiune | 2x RPE10 -> scade kg (`checkInSessionAdjust`) | exista, testat, necablat | DECISION #2 |
| Periodizare | `meta.weeksElapsed` | niciodata setat -> NaN -> toti userii blocati pe saptamana 0 pe veci | DECISION #3 |
| Deload reactiv | performanceDrop/restMult/rirMismatch/aa/energy | niciodata asamblate -> nu se poate declansa | DECISION #4 |
| Selectie pe puncte slabe | lifetimeLogs/recentLogs + contextSelection | necablate + `contextSelectionEnabled=false` hardcodat + mismatch vocabular | DECISION #5 |
| Pauza intre seturi | per-exercitiu | hardcodat 90s (`:522`) | DECISION #6 |
| Numar seturi | volume_target_pct periodizare | hardcodat 3 | DECISION PARTIAL |

### Cluster 2 — Varietate exercitii / substitutie (P3, moat = fatada)
- App-ul programeaza din **~15-22 exercitii hardcodate**, NU 657. Biblioteca de 657 (`exerciseMetadata.js` 5040 linii cu `fallback_cascade` facut PENTRU substitutie) e integral in `99-archive/`.
- Substitutie pe echipament lipsa = NON-FUNCTIONALA: exercitiile DISPAR (filter), nu se inlocuiesc. "Coach gaseste alternative" = text aspirational.
- `alternativeEngine` + `coachDirector` = moarte (doar arhiva).
- AparateLipsa partial (5/10 itemuri picker -> set engine gol), ScheduleOverride partial (Alta grupa/Mobilitate/Cardio colapseaza la antrenament normal).
- PRIMER "657/657 LANDED" = adevarat pentru codul vanilla arhivat, NU pentru app-ul React.

### Cluster 3 — Stub-uri care MINT userul (P2)
- SettingsThemes: "Se aplica instant / 4 teme disponibile" — scrie o cheie pe care n-o citeste nimic. (light/dark din SettingsAppearance E cablat; doar paleta de 4 e moarta.)
- Toggle kg/lb: persist-only, nimic nu converteste.
- Empty-session dead-end: daca marchezi tot echipamentul lipsa -> sesiune goala + mesaj fals "Astazi e zi de odihna".

### Cluster 4 — Calibrare / framing (P4, MED)
- Kalman calculat dar ARUNCAT — TDEE-ul afisat e posteriorul conjugat (sound), nu `kalmanState.mu`. Eticheta "Kalman adaptive TDEE" din PRIMER e usor peste realitate.
- Constante zgomot Kalman in domeniu kg aplicate la semnal kcal (inofensiv cat output-ul e aruncat; mina pt cine il cableaza).
- Doua cai BN diverg — valoarea de nutritie livrata ocoleste pipeline-ul validat de Coach Brain Eval (plasa nu acopera valoarea livrata).
- Teste: ~15% goale stau pe feature-urile rupte; doar `scheduleAdapterAggregate.realwire.test.ts` conduce pipeline real (si doar shape + DP weight).

---

## PLAN DE FIX PRIORIZAT (estimari reale, "termina firul" nu "rescrie creier")

**P0 — Siguranta (blocheaza tot, ~o zi cu agenti):** H1 izolare localStorage per-UID + wipe la logout · H2 salvare la finalul sesiunii inainte de re-derivare plan · FCM-sync PATCH (sau nu lansam push). Pana la P0 rezolvat: ZERO push live, ZERO multi-user pe acelasi device.

**P1 — Cablare creier prescriptie (~1-2 zile cu agenti, chirurgical):** Pattern cycle-4 TERMINAT — in `buildUserStateForPipeline` + `scheduleAdapterAggregate`: readiness->greutate (getSmartRecommendation) · RPE->corectie · weeksElapsed->periodizare · trigger-e deload · weakness->selectie · pauza/seturi din engine. + STERGE comentariul care minte. Motoarele EXISTA + sunt testate — e doar hranirea lor.

**P2 — Onestitate fatade ACUM (~ore):** SettingsThemes (copy onest "in curand" pana mapezi temele) · kg/lb (wire sau ascunde) · AparateLipsa itemuri moarte · ScheduleOverride · mesaj empty-session. Regula: NU mintim userul nici macar temporar.

**P3 — Moat varietate/substitutie (multi-zi, DECIZIE STRATEGICA Daniel):** revive `fallback_cascade` + cablare biblioteca 657 in selectie + substitutie reala pe echipament. Asta-i moat-ul real ("se adapteaza la sala ta" + "657 exercitii"). NU e patch — e arc de cateva zile. Decizi tu cand.

**P4 — Calibrare (~zi):** unifica caile BN (valoarea livrata sa treaca prin pipeline-ul Coach-Brain-Eval-validat) · clarifica framing Kalman in PRIMER · adauga teste E2E reale de pipeline (anti-recurenta "teste verzi pe feature gol").

---

## Recomandare secventa (per D042/D043 — 0 findings inainte de Beta)
1. P0 (siguranta) — imediat, blocant.
2. P2 (onestitate) — rapid, scoate minciunile.
3. P1 (cablare creier) — face coach-ul sa fie chiar destept cum sustine.
4. P4 (calibrare + teste reale).
5. P3 (moat 657/substitutie) — decizie strategica Daniel: il facem pre-Beta (Beta intarzie dar moat-ul e real) SAU lansam Beta cu ~22 exercitii onest declarate + 657 ca milestone post-Beta.
6. Re-audit aceleasi 5 lentile pe HEAD nou -> 0 findings -> Daniel smoke a-z -> Beta.

**Adevar pe care un CTO l-ar valida:** fundatia e reala si buna pt 30 de zile solo non-dev. Gap-ul e specific (cablare prescriptie + moat substitutie) si reparabil — nu rescriere. Dupa P0-P1-P2, Andura chiar face ce spune pe jumatatea de antrenament; dupa P3, moat-ul devine real.
