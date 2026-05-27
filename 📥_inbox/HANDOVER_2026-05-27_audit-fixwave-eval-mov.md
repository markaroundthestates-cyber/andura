---
title: HANDOVER 2026-05-27 — Audit nuclear + fix-wave + Coach Brain Eval + tema mov (PUSHED)
type: handover-narrative
date: 2026-05-27
for: sesiunea noua de Claude Code (Chrome) + continuitate
authority: Daniel directive "handover calumea + cleanup + lista + prompt Chrome"
---

# HANDOVER 2026-05-27 — Audit + fix-wave + eval + mov

## TL;DR — unde suntem
main **`5336a92d` PUSHED** origin, **5033 teste verzi** + tsc + build + size (8/8 bugete). **Tot ce-a gasit auditul nuclear = reparat + LIVE.** Tema = **mov dark default** (Brain Coach). Engine-ul confirmat **REAL empiric** (Coach Brain Eval: 0 violari/5009 + 75.1% acord oracle Claude). **Next milestone = gate-urile Daniel** (Firebase console → smoke a-z → Beta GO) + bucla de smoke real in sesiunea noua de Chrome.

## Ce s-a facut azi (arc lung, agenti Opus paraleli, manager-integrat: ff/cherry-pick pe main, agentii = executori in worktree izolat)
1. **Bundle size-limit** — main chunk 156→129KB (librarie 657 in chunk `data-library` static, WP-7 lazy ramane amanat). `fedae558`.
2. **Smoke 1 Daniel (13 findings)** → fixate: CSP FCM (firebaseinstallations/fcmregistrations), auth labels (Splash "Incepe"→**Log In** + "am deja cont"→**Creaza Cont**), stay-logged-in (reactBoot punte sesiunea la boot — se sincroniza doar in ProtectedRoute, Splash era in afara gate), Antrenor layout (streak/oboseala/readiness mutate SUS), i18n TODO_EN (browser EN cadea pe bundle-ul gol `en` → auto-detect doar `ro`), RestOverlay dark mockup-parity, nutritie safety-floor, AUTO faza din body-comp, bf% guard (gat imposibil→Deurenberg) + in Progres, **18+** (D083), eslint ignore `.claude/`.
3. **Tema mov default** (D084) — paleta Brain Coach v2 (paper #0a0c14, accent mov #a584ff) ca tema dark, flip default light→dark, Clasic crem pe toggle Aspect.
4. **Smoke 2 (findings)** → fixate: **#4 subponderal→surplus** (nu mentenanta — 50kg/1.84m trebuie sa CREASCA), **#1 Creaza Cont** buton proper (nu link firav), **#5 weightLog seed** din onboarding (fresh user), **#8 target+ETA guard** (ETA era calendar-countdown FALS — nu se uita la greutate; acum guard sub-BMI-sanatos + rata reala 0.5kg/sapt).
5. **Audit nuclear (5 agenti Opus read-only)** pe `258b7b49` → verdict: **moat REAL** (engines cablate E2E, anti-fatada dovedit), **0 CRIT securitate/safety** (cele 3 HIGH D081 confirmate reparate). 2 CRIT gasite+reparate: **weight source-of-truth split** (numerele nutritie/body citeau greutatea INGHETATA din onboarding, nu cea logata → `getCurrentWeightKg()` canonic logged>onboarding rewired peste tot; acum loghezi greutate → se misca BMR/kcal/proteine/bf%+pipeline) + **RestOverlay rupt pe mov** (var(--ink) inversat alb-pe-alb). + ~5 HIGH (readiness target flat→per-user, mesaj subponderal din BMI, volumeKg "0kg"→real, leak-uri tema) + MED/LOW. Fix-wave **F1 (backend) + F2 (tema)** → `5336a92d`.
6. **Coach Brain Eval** (Claude Opus 4.7 oracle, cheia API Daniel): **0 violari mecanice/5009 + 75.1% acord** (baseline 76.5%, **zero regresie**). Disagreements = oracol-aritmetica-gresita (phase) + alegeri defendabile (goalPhase RECOMP body-aware, tdeeDirection conservatism D082) + 2 candidati ne-confirmati.
7. **Decizii safety Daniel:** **18+** (D083), **sex-floor 1000F/1200M** (D086), **boot-clobber = privacy-first** (D086 — onboarding sters la schimbare de cont = fix H1 PII intentionat).

## Ce mai e de facut (backlog prioritizat)

### P0 — Gate-urile Daniel (next milestone REAL, Daniel-side)
- **Firebase console** (~2-5 min) — provider **Email link (passwordless) ON** + **andura.app** la authorized domains. **FARA ASTA LOGIN-UL NU MERGE** (labels-urile-s fixate, dar `sendMagicLink` da eroare). Pasi: `📥_inbox/auth-fixes-2026-05-26/DANIEL_AUTH_SETUP.md`. Optional: Google OAuth + `VITE_GOOGLE_OAUTH_CLIENT_ID` (`📥_inbox/audit-fresh-2026-05-25/cycle3/OAUTH-ENABLEMENT-CHECKLIST.md`).
- **Smoke a-z live** pe app-ul deployat (5336a92d).
- **Beta GO** — decizia Daniel.

### P1 — Bucla de smoke real (sesiunea noua de Chrome)
Vezi `📥_inbox/PROMPT_CC_chrome-smoke-loop.md` — Opus max, Claude in Chrome conectat → smoke REAL pe andura.app (ochi Claude live) + verifica GitHub → flag → fix → re-smoke → iterate.

### P2 — Small-tail (audit LOWs, ne-blocante)
- **FCM SW config placeholder** — `public/firebase-messaging-sw.js` are `PLACEHOLDER_*` (fisier static nu citeste env → push background nu se initializeaza pana nu substitui config-ul Firebase web la build; nevoie build-step de substitutie).
- **Magic-link oobCode** ramane in URL post-success (cleanup `replaceState`, paritate cu hash-ul Google care e curatat).
- **CSP `unsafe-inline`** pe script-src (accepted-risk GH Pages; de strans la Play Store / header-capable host).
- **Workbox stale-cache** — returning users prind shell-ul vechi din SW (prompt-update) → de pus skipWaiting/cache-bust pre-Beta. (Asta-i exact ce-a patit Daniel cu "loadscreen vechi".)

### P3 — Candidati eval (NU confirmati bug-uri, de verificat focusat)
- `deloadState` 68% — engine IDLE vs Claude REACTIVE pe red-energy persistent (sub-declansare deload reactiv SAU conservatism corect?).
- `adjustmentDirection` 64% — NONE vs up pe green (nudge-ul urca pe alt drum/DP-green-streak SAU artefact de vizibilitate al oracolului?).

### Deferred constient
WP-7 lazy-load bundle · coliziune nume curat Flat Bench/DB Press (UX) · fonturi Instrument Serif/Geist Mono (mov) · sync cross-device onboarding (privacy tradeoff) · threshold cold-start CUT pt atleti slabi-dar-grei (BMI≥25 din muschi).

### Curatenie (rm BLOCAT de sandbox — Daniel manual)
`.tmp_*` scratch · PNG-uri stray in root (istoric-*.png, antrenor-fixed.png, splash*.png etc.) · gramada `.claude/worktrees/` (worktree-uri stale agenti). **+ ROTEAZA CHEIA API** (e in transcript plaintext, Daniel a dat o cheie noua azi).

## Pointeri
- `DECISIONS.md` §D081-D086 (moat real, nutritie forward, 18+, mov default, audit/fix/eval, safety cluster)
- `CHAT_STATE.md` — continuitate live (stare wrap + handoff)
- `reports/coach-brain-eval/2026-05-27T18-29-27-396Z.md` — eval verdict + disagreements complete
- `04-architecture/mockups/Andura-brain-coach v2.html` — paleta mov sursa (design master nou)
- `ANDURA_PRIMER.md` §5 — milestone

🦫 Tot ce-a gasit auditul = reparat + live + verificat empiric cu Claude. Ramane gate-urile Daniel (Firebase console → smoke a-z → Beta) + bucla de smoke real in Chrome.
