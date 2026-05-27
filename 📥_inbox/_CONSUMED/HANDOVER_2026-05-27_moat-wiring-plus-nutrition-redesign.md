# HANDOVER 2026-05-27 — Moat P3-wiring complet + Nutritie redesign (LANDED & PUSHED)

**De la:** Co-CTO chat acasa (Daniel la birou prin RC toata ziua, a dat examen intre timp — l-a luat).
**Pentru:** chat-ul urmator (Daniel revine acasa, continua de la smoke).
**Una-n doua:** tot ce s-a discutat azi e LANDED, verde (**4963 PASS / 275 files**, tsc, build OK) si **PUSHED pe origin**. Ramane doar smoke-ul tau.

---

## Cum a decurs

Ziua a inceput cu "Salut Acasa" — eu pe masina de acasa, tu remote de la birou. Mandatul a fost limpede de la inceput si s-a intarit pe parcurs: **tu esti interlocutorul, agentii Opus fac munca, eu orchestrez** (manager: ff/cherry-pick autoritativ pe main + verificare full-suite dupa fiecare integrare; agentii = executori in worktree izolat). Spre final: "fa ce trebuie, eu nu pot sta, la final imi zici ce si cum" + "trebuie sa fie totul pushed, handover facut". Asta e.

Am rulat arcul P3-wiring (moatul) cap-coada, apoi calire de calitate, apoi — la initiativa ta — un redesign de nutritie. Toate cu agenti paraleli pe fisiere disjuncte (nu i-am pus sa se calce, ca sa nu repet revert-race-ul vechi).

## Ce-am facut (si de ce conteaza)

**1. Moatul e acum REAL, nu fatada (D081).** Asta era miza: 5 audituri verzi anterioare rataseera ca prescriptia de antrenament "parea desteapta dar nu era". Acum:
- Selectia vine din **biblioteca de 657** filtrata pe muschi×echipament×tier, determinist, ancorata pe numele cu istoric PR (gata cu tabelul hardcodat de ~22).
- Echipamentul are vocabular coarse unificat — toate cele 10 itemuri "aparat lipsa" capata sens (erau 5/10 moarte).
- Substitutia produce o **alternativa NUMITA in romana, in-sesiune** (aparat ocupat / nu vreau → swap in loc, nu te mai arunca pe alt ecran).
- Set-count-ul vine din periodizare (era hardcodat 3) si weakness-selection-ul **chiar ruleaza** (era mort in spatele unui flag pe `false` — l-am gasit si l-am cablat).
- Un **gate E2E anti-fatada** (WP-8) dovedeste toate astea prin pipeline real — si am verificat ca **musca** (am stricat intentionat substitutia → 3 teste rosii).

**2. Calire.** Mutation testing pe creier: `dp.js` (motorul de greutati) avea 181 mutanti vii = teste-fatada (mock-uri fixate, ramurile reale neatinse). +85 teste care conduc ramurile real. Plus fix la nume garblate ("inclinat cu bara Impins din piept" → ordine naturala) si un audit fresh-eyes independent care a confirmat moatul REAL (4/5) + a gasit 1 singur MED (lifturile-vedeta tip Leg Press ziceau "fara alternativa") — **reparat** cu degradare la cautarea in librarie pe grupa de muschi.

**3. Nutritie redesign (D082) — initiativa ta de azi.** Ai prins ca app recomanda kcal cu un **factor de activitate 1.55 FIX** care ignora cate antrenamente faci. Ai respins (corect) ideea "lasa cantarul sa optimizeze" — la fluctuatia ta de ±4-5kg/zi ar da numai false positives. Am verificat si codul chiar avea flaw-ul (`MIN_WINDOW_DAYS=1` + delta punct-la-punct). Solutia aterizata:
- **Model forward determinist:** `BMR×1.25 (NEAT) + (sesiuni×300net)/7`. Activitatea vine din **antrenamentele reale**, deci se adapteaza imediat la 4 vs 6.
- **Blend planned→actual:** la cold-start foloseste cate ai PLANIFICAT (din onboarding/calendar), si pe masura ce loghezi se muta spre real (in ~4 saptamani) — fix logica ta "are 4 planificate, daca face 1/5/7 ajustezi".
- **Cantarul = calibrator LENT** (ferestre ≥7 zile, panta de regresie, plafonat) — nudge pe saptamani, niciodata swing zilnic. Anti-trisare: pe termen lung cantarul te prinde oricum.
- Consecinta onesta vizibila: mentenanta ~2600 (era 3224 flat), masa scade — pentru ca activitatea trebuie sa vina din sesiuni reale, nu dintr-o presupunere.

**4. Polish:** 404 route, text GDPR `europe-west1`, dark strips.

## Unde esti acum — SMOKE

Totul pushed. Intri de pe telefon. Ordinea:
1. **Firebase console (2-5 min, doar tu poti):** mi-ai confirmat ca **NU ai facut inca** partea de auth in consola. Activeaza **Email link (passwordless) ON** + pune **andura.app** la authorized domains (`📥_inbox/auth-fixes-2026-05-26/DANIEL_AUTH_SETUP.md`). Butonul "Creeaza cont" E in cod si va aparea — dar fara pasul asta `sendMagicLink` da eroare. (Optional: Google OAuth + `VITE_GOOGLE_OAUTH_CLIENT_ID`.)
2. **Smoke a-z** — verifica: "Creeaza cont" apare+merge · workout vine din 657 cu nume RO · aparat ocupat → alternativa numita · kcal-ul se misca cu antrenamentele.
3. **Beta GO** — decizia ta.

## In coada (NU blocheaza, decizii UX pentru tine)
- Coliziune nume curat: `Flat Barbell Bench` si `Flat DB Press` afiseaza ambele "Impins din piept" (diferă prin linia echipament). Vrei nume distincte? Sunt nume curate de tine, nu le-am atins.
- **WP-7 lazy-load** amanat constient (build da un warning benign "chunk >600kB"; libul ~35KB gzip; `import()` dinamic ar propaga async prin sessionBuilder tocmai stabilizat). Optimizare post-smoke daca vrei.

## Note tehnice pentru continuitate
- Agentii in worktree reciclat porneau pe baza veche `8fd8e8b2` → fiecare prompt a avut **garda anti-stale-base** (`git merge <main-sha>` inainte de lucru). A functionat de fiecare data. O singura reconciliere manuala (WP-4 stale-base: seam local → `equipmentMap.js` canonic).
- Reziduuri inofensive: `.tmp_*` scratch + `.claude/worktrees/` — gitignored, necommitate. Worktree cleanup cand vrei.
- SSOT sincronizat: D082 in DECISIONS, PRIMER §5, CHAT_STATE. NUTRITION-MATH-FLAGS are nota ca baza s-a schimbat (analiza Bayesian/Kalman §A-§D ramane valida pe stratul de adaptare).

🦫 Arc complet, verde, pushed. Te-ai intors la un produs cu moat real si o nutritie onesta. Smoke cand vrei.
