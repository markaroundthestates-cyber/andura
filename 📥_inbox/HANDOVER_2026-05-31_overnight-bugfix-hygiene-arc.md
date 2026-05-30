# Handover — 2026-05-31 noapte: overnight bug-fix + igienă file-split arc

**Pentru:** Daniel (dimineață) · **De la:** chat manager (Co-CTO autonom) · **Stare:** TOT pushed live, andura.app verde + smoke 4 taburi curat.

---

## Ce ai cerut

Ai plecat la somn cu "continua autonom si ai voie sa faci si push live, si smoke, sa nu uiti de audituri, deep smokes, harnests... ai voie pe Claude Chrome + dynamic workflow... si nu uita de subagents". Plus, mai devreme: bug-ul tău raportat (auto 2173 vs lose fat 2227) + arcul de igienă pre-Beta ("nu vreau să devină mlaștină") + prompt-urile de poze-exerciții care nu ieșeau.

Le-am făcut pe toate. Eu am orchestrat, agenții Opus (worktree-izolați) au executat, eu am făcut cherry-pick serial pe main + push + smoke.

## Ce s-a livrat (toate PUSHED LIVE)

**2 bug-uri reale reparate:**
1. **Nutriție AUTO vs explicit kcal** (`ee1d931`) — exact ce ai prins tu. AUTO-CUT dădea 2173, lose-fat/CUT explicit dădea 2227. Root cause: 3 locuri de sizing drift-uiseră la constante diferite pentru ACELAȘI CUT (×0.80 vs ×0.82 = 54 kcal). Le-am unificat pe o singură cale coerentă (`sizeKcalForPhase`). Acum AUTO == explicit, garantat cu test nou.
2. **Cloud-wipe DELETE silent-success** (`aedd6c33`) — prins de un audit fresh-eyes. La reset cont, dacă ștergerea din Firebase eșua parțial (network 500/timeout), apărea fals-succes → copia din cloud "învia" la următorul boot. Acum raportează succeeded/total + toast de eroare la eșec. (Bonus din asta: am descoperit că esbuild `drop:['console']` arunca și `console.error` din build-ul prod → erorile nu ajungeau în Sentry. Logger-ul nou le salvează via `globalThis.console`.)

**Arcul de igienă pre-Beta — COMPLET** (toate split-uri behavior-preserving, barrel/component re-export, ZERO consumer edits, fiecare verde înainte de cherry-pick):
- engineWrappers.ts 1578→883 (+nutrition/mmi/types)
- scheduleAdapterAggregate.ts 911→44 barrel (+session/injury/builder/compose)
- workoutStore.ts 726→305 (+types/logic)
- Onboarding.tsx 790→230 (+5 componente copil)
- SettingsProfile.tsx 725→386 (+5 componente copil)
- **Workout.tsx 1364→1240** — cel mai riscant, lăsat ultimul + conservator: TOATE hook/effect/timer/FSM rămân în părinte, doar 5 secțiuni pur-prezentaționale extrase. N-am extras niciun "useWorkoutMachine" (entanglement de effect-uri → prea riscant).
- + logger env-gated, exerciseLibrary split, dead-code (de mai devreme în sesiune)

**Promptele de poze** (`📥_inbox/EXERCISE-IMAGE-GRIDS.md`, 76 grids) — rescrise. Diagnoza pe poza ta cu împins pe gantere: generatorul desena pe toți **șezând drept** indiferent de bancă, deci flat/incline/decline ieșeau identice. Fix: **SIDE VIEW + postură explicită** ("body lying flat and horizontal" / "reclined ~45°" / "head-down") pe orice exercițiu culcat, FRONT VIEW păstrat pe aparate șezânde (pec-deck etc.), + regulă hard de rack pe orice bară. Regenerează Grid 1 când te trezești, comparăm — restul (2-76) sunt deja aliniate la același pattern.

## Quality gate (autonom, tot verde)

- **Fresh-eyes total audit post-refactor: GO, 0 findings** orice severitate. Toate split-urile verificate clean (hook-counts identice părinte: Workout 53==53, SettingsProfile 15==15), barrels complete, fără cicluri. Logger.error confirmat că supraviețuiește în bundle-ul `dist` real.
- **5730 teste verzi** + typecheck clean + size main <192KB throughout.
- **Deep smoke live andura.app** (Playwright): toate 4 taburi (antrenor/progres/istoric/cont) se încarcă, **0 console errors, 0 warnings** fiecare.

## Ce mai rămâne (pe tine — Daniel-gated, în coadă)

1. **Generează pozele-exerciții** (manual "next" per grid). Apoi eu fac webp + lazy-load (#62).
2. **Rotit cheia API Anthropic** ("îi fac revert mâine" — treaba ta).
3. Gate-uri știute de mult: **Beta GO**, **OAuth Firebase console** (`VITE_GOOGLE_OAUTH_CLIENT_ID`), **DMARC SendGrid** deliverability.
4. Opțional cleanup local: ~worktrees vechi + scratch `_tmp_*.cjs` la root (al meu, încerc să-l curăț).

## Note tehnice

- Nimic blocant. Niciun gate nou introdus.
- `.js→.ts` migration (135 fișiere) din planul de igienă l-am LĂSAT intenționat — churn mare / valoare modestă / mai bine incremental cu ochiul tău, nu orbește overnight. Restul arcului (split-urile pe care le-ai numit explicit) e gata.
- Pulse redesign = deja live de pe 2026-05-29 (confirmat în CHAT_STATE), themes retrase expres — n-am atins zona aia.

Cross-refs: PRIMER §5 (block 2026-05-31) + CHAT_STATE.md + DECISIONS §D096 (ultimul, nimic nou — arcul ăsta e execuție sub D077, nu decizie nouă).

🦦 Noapte productivă. Dimineață: regenerezi Grid 1, confirmăm pozele, restul e live + verde.
