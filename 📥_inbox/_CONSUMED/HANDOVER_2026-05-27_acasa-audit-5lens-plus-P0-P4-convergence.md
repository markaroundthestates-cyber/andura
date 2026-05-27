# HANDOVER 2026-05-27 — ACASA → claude rc (birou): Audit 5-lentile + Convergenta P0-P4 + poarta P3

**Pentru:** claude rc (birou) startup §CC.2. **De la:** Co-CTO acasa, sesiune lunga 2026-05-26→27.
**Stare cod la handover:** main pushed pe origin (~29 commits), **4751 PASS / tsc / build verzi**. Vezi `CHAT_STATE.md` + `DECISIONS.md §D081` + verdictul complet `📥_inbox/wiring-audit-2026-05-26/VERDICT-CONSOLIDATED.md`.

---

## Ce s-a intamplat (narativ)

Daniel a fortat un **audit real** dupa ce a observat empiric scapari ("trageri la fata" = facial pt Maria; "un core engine nu merge?"; "audit = TOT, fiecare buton + fiecare decizie din x factori; ar fi mandru un CTO?"). Am rulat **5 lentile fresh-eyes Opus**: fatada/cablare, factori-decizie, corectitudine-engine/arhitectura, exercitii/substitutie, teste/E2E/securitate.

**Verdict (decision-grade):** fundatia e **inginerie reala** (math 0 CRIT, nutritie/recuperare/PR/plumbing/Coach-Brain-Eval genuine) DAR:
- **Creierul de prescriptie-antrenament era fatada** — readiness/RPE/periodizare/deload necablate la prescriptie ("pare destept dar nu e", randa numere plauzibile din DP istoric).
- **Moat fatada** — app-ul programeaza din **~22 exercitii hardcodate, NU 657**; substitutia pe echipament lipsa = moarta (exercitiile DISPAR, nu se inlocuiesc); `alternativeEngine` + biblioteca 657 = arhivate; "657 LANDED" din PRIMER reflecta vanilla arhivat, nu React-ul livrat.
- **3 bug-uri HIGH** — PII leak device-partajat, pierdere date la miezul noptii, FCM-sync clobber.
- **Cauza-radacina:** "engine testat izolat" != "merge pentru user". Testele hraneau manual `meta` pe care productia nu-l asambla. 5 audituri verzi anterioare ratasera exact asta.

**Decizie Daniel A LOCKED (D081):** "Beta = launch = moatul meu" → **zero pernă post-Beta, tot REAL inainte de Beta.**

## Ce am LANDED autonom (tot verde, 4751 PASS)
- **P0 siguranta:** `f372245b` PII wipe (logout + account-switch) · `fd607e5d` salvare sesiune din memorie (nu re-derivare → gata pierderea la miezul noptii) · `3109b9e2` sync FCM via PATCH (nu PUT → nodurile FCM supravietuiesc).
- **P1 cablare creier (5 commits):** `58e126e6` readiness→greutate (getSmartRecommendation + comentariu mincinos reparat) · `f69c9708` periodizare weeksElapsed (nu mai inghetata pe veci) · `26a19e70` rest din engine · `7c8244d8` RPE→corectie in-sesiune · `07b52df2` deload reactiv partial. **DEFERRED la P3:** set-count + selectie-puncte-slabe = mismatch vocabular Big-11↔head (= munca de selectie din P3).
- **P2 onestitate:** `c75b119d` SettingsThemes (gata "se aplica instant" mincinos) · `166f974f` kg/lb dezactivat onest.
- **P3-foundation:** `c9f395a1` biblioteca 657 + `e8abae47` alternativeFinder portate aditiv in `src/engine` (276 teste, ZERO wiring inca).
- **P4 calibrare:** `00bd0134` primele teste E2E reale (nutritie + periodizare, gata "teste verzi pe feature gol") · `9c8cf7a6` framing onest "Kalman"→Bayesian conjugat in PRIMER + `NUTRITION-MATH-FLAGS.md` (math NEATINS, 4 itemuri MED pt review supravegheat Daniel).
- SSOT: D081 lockat + CHAT_STATE sincronizat + artefactele audit committate.

## NEXT P1 pentru rc — P3-WIRING (moat-ul, decizii Daniel LUATE)
Spec complet: `📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md`. **Decizii Daniel deja luate (executa direct):**
- **WP-3 vocabular echipament = COARSE `equipment_type`** (barbell/dumbbell/machine/cable/bodyweight/band). Renunta la ID-urile fine (matrix_cable/bailib_stack). Repara gratis cele 5 itemuri moarte AparateLipsa.
- **WP-6 naming 627 = DELEGARE COMPLETA la agent + QA-gate** (EN-standard pt lift-uri / RO-bun pt accesorii + gate blacklist literal-disasters + filtru persona Maria/Gigel). FARA review pe loturi de la Daniel.

Work-packages (per design, ~o zi efectiva cu agenti + integrare):
- WP-3 unifica vocabular echipament (coarse) → repara AparateLipsa 5/10.
- WP-4 rewire selectie din 657 (muscle×equip×tier×goal) + **mapa muscle-group Big-11↔head** (deblocheaza si P1-deferred set-count + weakness-selection). Ancoreaza pe cele 18/19 nume verbatim (PR identity aproape gratis).
- WP-5 substitutie pe UI (AparateLipsa/CevaNuMerge/in-workout) → alternativa CU NUME, in-place swap workoutStore.
- WP-6 naming 627 (delegat+gate).
- WP-7 lazy-load biblioteca (~31KB gzip off critical path).
- WP-8 E2E real "alternativa ajunge la user" (anti-recurenta hollow).
Apoi: **re-audit aceleasi 5 lentile** pe HEAD nou → convergenta 0 findings.

## DISCIPLINA OBLIGATORIE pentru rc (lectie scumpa azi)
- **NU mixa agent non-izolat pe main + agenti worktree simultan** → revert-race (worktree-urile impart arborele de lucru; un agent non-izolat care face stash/restore revertase editarile altuia). Branch-urile committate raman curate, dar e haos.
- Regula: **un singur agent pe main (non-izolat)** SAU **agenti worktree care fac `git merge --ff-only main` la start** + commit DOAR pe path-uri explicite + EU integrez prin cherry-pick din branch (autoritativ), arunc gunoiul necommitat din main la reconcile.
- Worktree-urile vechi raman locked de pid-ul CLI — se curata la inchidere.

## Daniel-side ramas (consola, in coada)
- **Firebase auth self-signup:** consola DEJA OK (extensia a confirmat: email-link ON + andura.app authorized). Self-signup ar trebui sa mearga — de TESTAT live (email real, same-device, check spam). Daniel a observat ca **nu exista buton vizibil de signup** → redesign Auth LANDED (Login + "Creeaza cont" + bifa Termeni + pagini /terms+/privacy reale). Vezi `auth-fixes-2026-05-26/DANIEL_AUTH_SETUP.md`.
- **FCM backend:** `firebase deploy --only functions,database` (Blaze deja activ; VAPID + 4 secrets deja in GitHub Secrets).
- **ROTEAZA CHEIA API Anthropic** (leaked in transcript).
- **Smoke a-z live** + gate-urile finale (per D080/D043): dupa convergenta 0-findings.

## Stare git
Pushed pe origin la handover. Deploy declansat (starea curenta = mai sigura + onesta decat live, fara regresii; moat-ul inca ~22 exercitii pana P3-wiring, dar fara claim fals user-vizibil). qa E2E ar trebui verde (PWA-offline reparat).
