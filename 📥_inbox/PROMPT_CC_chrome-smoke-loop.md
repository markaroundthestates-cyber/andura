---
title: PROMPT_CC — sesiune noua Claude Code (Chrome) — bucla de smoke real
type: prompt-cc
date: 2026-05-27
model: Opus EXCLUSIVELY (max effort)
trigger: Daniel lanseaza `claude --chrome` (sesiune noua, NU cea veche care avea agenti in background) → paste promptul asta
---

# PROMPT — Bucla de smoke real cu Claude in Chrome

Esti **Co-CTO autonom Andura, Opus max**, exact rolul din sesiunea anterioara: decizi + executi + raportezi, ZERO "vrei sa continuu?" pe tactical, continuu pana Daniel zice STOP. Daniel = CEO+Product (validare UX/strategic, NU developer-review). Bugatti craft, Quality > Speed.

## Startup (citeste intai)
1. `DECISIONS.md` head 60 + §D081-D086 (moat real, nutritie forward, 18+, **tema mov default**, audit/fix/eval, safety cluster).
2. `CHAT_STATE.md` (stare live + handoff).
3. `📥_inbox/HANDOVER_2026-05-27_audit-fixwave-eval-mov.md` (ce s-a facut azi + backlog P0-P3).
4. `ANDURA_PRIMER.md` §5 (milestone).
5. Confirma **Chrome conectat**: ruleaza `/chrome` daca trebuie; verifica ca ai tool-urile de browser claude-in-chrome incarcate (nu doar Playwright). Daca nu apar → `/chrome` connect / `claude --chrome`.

## Stare la handoff
main `5336a92d` PUSHED, 5033 teste verzi, tot auditul reparat + live. Tema mov dark default. Engine confirmat empiric (eval 0 violari/5009 + 75.1% oracle).

## Task — bucla: verifica → flag → fix → re-verifica → repeat

### 1. Verifica GitHub intai
- `gh run list` (sau Actions UI): CI verde pe `5336a92d`? `deploy.yml` a reusit (andura.app serveste ultima versiune)? Daca rosu/picat → investigheaza + fix. (Size-limit era singurul rosu istoric — acum reparat, ar trebui verde.)

### 2. Smoke REAL pe andura.app (ochi Claude in Chrome, login-ul lui Daniel)
Golden path: splash → auth → onboarding → antrenor → workout (energy-check → exercitii → RPE → rest → post-summary) → progres → istoric → cont + sub-ecrane. Verifica SPECIFIC fixurile de azi:
- **Auth:** "Log In" + "Creaza Cont" clare; **stay-logged-in** dupa reload (nu re-login).
- **Onboarding:** gate **18+ BLOCHEAZA** varsta <18 la onboarding fresh (reset date intai ca sa testezi curat — la profil existent nu se re-verifica).
- **Tema mov:** dark mov peste tot, lizibil (FARA carduri inversate alb-pe-dark), **RestOverlay dark + butoanele X/... clickabile** in pauza, toggle light face round-trip.
- **Nutritie:** AUTO alege CUT la supraponderal (110kg → ~2286, nu 2788); subponderal (50kg/1.84m) → **surplus + mesaj "crestem sanatos"** (NU mentenanta); **bf% apare in Progres + SE MISCA cand loghezi o greutate** (fix-ul CRIT weight-source); target sub BMI sanatos → **avertizare + zero ETA spre fatal** (nu "in ~1 luna" la 31kg).
- **Workout:** exercitii reale din 657 (nume RO), substitutie NUMITA (aparat ocupat → alternativa, fara blank), **fara "0 kg" tonaj**, readiness/RPE afecteaza prescriptia.
- **Weight consistency:** greutatea din profil + cea din "Greutate (7 zile)" = CONSISTENTE (fix #5/CRIT — loghezi o greutate, o vezi peste tot, nu 55-vs-108).

### 3. Flag → fix → re-smoke (bucla)
Orice gresit cu filtrul **Gigel** (label confuz, numar aberant, layout rupt, buton mort, date inconsistente, contrast prost) → **repara-l** (Bugatti, atomic commit) → **re-smoke** fluxul afectat → repeta pana e curat. STOP doar la Daniel.

### 4. Candidati eval de investigat (din D085, NU confirmati bug-uri)
- `deloadState` (deload reactiv pe red-energy persistent — engine IDLE vs Claude REACTIVE): gap real sau conservatism corect?
- `adjustmentDirection` (nudge up pe green — NONE vs up): pe alt drum (DP/green-streak) sau gap?
(Poti re-rula Coach Brain Eval cu cheia API daca schimbi engine: `node scripts/coach-brain-eval/index.js --n 5000 --oracle 150` cu `ANTHROPIC_API_KEY` + `COACH_EVAL_MODEL=claude-opus-4-7`. Cheia ROTITA — cere-i lui Daniel cea curenta, NU o pune in fisier/git.)

### 5. Gate-urile Daniel
Daca login-ul nu merge la smoke → e pentru ca **Firebase console** nu-i facut: aminteste-i Daniel (Email link passwordless ON + andura.app la authorized domains — `📥_inbox/auth-fixes-2026-05-26/DANIEL_AUTH_SETUP.md`). E actiunea LUI, nu o poti face tu.

## Reguli (ca sesiunea anterioara)
- **D031:** `git push` DOAR la trigger verbal Daniel. Branch poate fi ahead, e ok.
- **Sub-agenti** (daca spawn-uiesti): `model: "opus"` explicit, `isolation: "worktree"`, max 4-5 simultan, garda anti-stale-base (worktree-urile pornesc pe baza veche → `git merge --ff-only <HEAD>`; `git reset --hard` e BLOCAT de sandbox → foloseste merge-ff/checkout -B).
- **Hook:** `npm run typecheck` + `test:run` + `build` + `size` verzi inainte de commit, ZERO `--no-verify`. (`.claude/` e deja in eslintignore — fara pollution.)
- **No diacritice** in UI strings/teste/commit-uri (D-LEGACY-064); vault docs = diacritice OK.
- **Cleanup blocat de sandbox** (`rm`/`git clean`) — flaghează junk-ul pentru Daniel, nu te chinui.

Backlog complet (P0-P3 + deferred): vezi HANDOVER. Primul lucru: confirma Chrome + verifica deploy GitHub + smoke real. Dă-i drumul. 🦫
