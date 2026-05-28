# AUTONOMOUS ARC #2 — 21 SMOKE FINDINGS REMEDIATION (LOCAL, NEpushed)

**Status:** Wave A + Wave B integration LANDED **local**, 5 commits ahead origin/main `fdd1d09`. **NEpushed (D031 — astept smoke iar Daniel + push trigger manual).**
**Branch:** main local HEAD `95e97018`.
**Tests:** **5198 verzi** + typecheck clean + build clean (88 PWA precache, 1393 KiB).
**Model:** Opus 4.7 EXCLUSIVELY (manager + 4 agenti worktree-isolated).
**Mandate:** Daniel ACASA via RC tunnel 2026-05-28 birou: *"tu fa-le pe toate cand sunt la birou, smoke iar cand e gata"*. 21 findings smoke `andura.app` live.

---

## Livrat

### Wave A — 4 agenti Opus worktree paraleli

**A1 WORKOUT-FLOW** (`workout-flow-fixes-wave-a1` / 5 commits)
- **#2/#6/#3.2** "Nu vreau" cycling exhaustive (pool plin per muscle group, NU 2 alt; per-exIdx tried-set runtime; refusalPool ignora equipment + bypass tier-1 strict → unblocheaza Cheat Curl Barbell)
- **#3** set counter `1/17` advance ordinal pe rate + sari-pauza (mockup wv2.setIdx-1 semantic)
- **#3.3** rename "Flexii biceps la pupitru" → "Curl pupitru" + curl-family audit
- **#12** dedup duplicate "Incepe antrenament" CTA (eliminat, "Incepe sesiunea" CoachTodayCard ramane single)
- **#17** "Aparat lipsa" 3rd action button in-session + `AparatLipsaSheet` bottom-sheet 150 LoC + sync Cont aparate-lipsa
- **#18** pain in-session `intensityMod='minus'` adapt continuu, NU reset (CDL persistat pt next-session injury overlay; full pain-aware exercise SWAP deferred V2)

**A2 NUMBERS-SAFETY** (`worktree-agent-acb2e4c93ef946ae9` / 5 commits)
- **#1** `estimateBfDeurenbergCapped` cap `min(D, BMI*0.85)` la BMI≥27 → Daniel **31.6% → 28.0%** (realist ~24%); UI CTA "Adauga talie + gat pentru estimat precis US Navy"
- **#4** `SetLogInput` "Confirma setul" mandatory + editable kg/reps prefilled + `value=0` empty + selectAll onFocus (rezolva "022" bug)
- **#13** BodyData bounds realiste per camp (talie 50-200, gat 25-60, piept 60-150, sold 60-200, biceps 20-60, coapsa 30-90) + camp Gat NEW
- **#15** `progresStore.latestBodyMeasurements` aggregator most-recent-per-field SSOT — `BodyFatStrip` + `SettingsProfile` + `nutritionProjection` consuma
- **#16** `targetSafety.ts`: `evaluateTargetRate` cap fiziologic 1.5kg/sapt + `computeTargetKcalOverride` cap asimetric **-25%/+15% TDEE** (Aragon & Schoenfeld 2020) + 7700 kcal/kg + `safeDeadlineDate` sugerat; `engineWrappers.getTargetKcalToday` wire baseline + targets-today (Daniel example 110→62kg in 4 zile → cap automat -25% TDEE)

**A3 i18n-IA-DELAYS** (`worktree-agent-a7c6a57b26b6ac46a` / 4 commits)
- **#5** BottomNav fixed bottom → root cause `transform: translateZ(0)` pe `#root` containing-block; removed + `.app-fixed-column` utility (BottomNav + SessionPill + Toast + InstallPrompt + OfflineBanner + UpdatePrompt)
- **#7** i18n react-i18next DEFAULT_LOCALE flip **RO → EN**; ~72 keys (nav + tabs + Obiectiv + Cont menu + settings shell); toggle "Limba / Language" Cont > Setari; clean fitness English; **deferred deep screens** (workout flow + NutritionInline/BMRStrip + Calendar/Istoric detail + exercise library 657 `name_en` + coach engine output) — RO gratios pana extragere follow-up
- **#8** `ObiectivCard` NEW top Progres tab (extras din SettingsProfile unde era state efemer pierdut intre vizite); `targetEta.ts` pure lib; persist `progresStore.targetObiectiv`; 28 teste regression
- **#14** SettingsNotifications optimistic OFF + `togglePending` ON await state (browser permission inherently blocking) + re-entrancy guard

**A4 UX-VISUAL** (`worktree-agent-a9f5b9227063a2cf3` / 7 commits)
- **#9/#21** Animatii — diagnosticat `af6560b3` overnight era subtle (200-280ms entrance on-mount only, fara stagger). EXPANDED motion vocabulary: `andura-card-rise` 380ms cubic-bezier + stagger utilities 0/75/150/225/300/375/450 + `andura-shimmer` directional + `andura-glow-pulse` PR celebratory + `andura-theme-sweep` palette confirmation. BottomNav animated active pill + brick hairline indicator slide. Toate `prefers-reduced-motion: no-preference` gated.
- **#10/#20** Stat tiles unified cross Antrenor/Istoric/Progres/PostSummary: radial accent wash per-card (brick/olive/deep/warn semantic) + border-line + tabular-nums + accent icons. CoachTodayCard theme-aware dark accent wash. Verificat pe cele 4 teme (Brain Coach mov / Luxury champagne+noir / Living Body warm gold+earth / Clasic cream+brick).
- **#11** `ExerciseMedia` pipeline V1: thumbnail/compact/card variants + placeholder "Imagine in curand" cu brick radial wash. Wired pe Workout active (card 16:9) + WorkoutPreview row (thumbnail rotund). V2 sourcing decision **DEFERRED Daniel** (WGER vs ExRx vs custom vs Lottie) — pipeline gata, doar URL-uri in `src/react/lib/exerciseMedia.ts` lipsesc.

### Wave B — Manager solo integration

- Merge `--no-ff` A2 → A1 → A3 → A4 cu 2 conflicts rezolvate (Antrenor.test.tsx heading "Coach" EN + "Incepe sesiunea" CTA single; SettingsProfile.tsx — A3 muta Obiectiv UI out, A2 persistence stata pe progresStore)
- **Integration fix critic** `95e97018`: A2 + A3 creasera 2 surse paralele pt target (`onboardingStore.targetWeight/targetDate` vs `progresStore.targetObiectiv`). Decizie SSOT: **`progresStore.targetObiectiv` singular** (Obiectiv apartine progres-tracking NU profil-onboarding). `getTargetKcalToday` reroute la progresStore + `evaluateTargetRate` unsafe verdict surface pe `ObiectivCard` (era absent — rate-cap warning 1.5kg/sapt lipsea pe Progres) + `setTargetObiectiv` regex relax YYYY-MM(-DD) (math layer accepta ambele, teste au nevoie zile precise) + i18n keys `obiectiv.unsafeRateWarning` + direction loss/gain RO+EN bundles.
- Final: **5198 verzi** + typecheck clean + build clean (88 PWA precache, 1393 KiB). gitnexus reindexed (15995 → 32199 symbols).

---

## Rămâne (Daniel-gated)

1. **Smoke iar pe preview** `npm run preview` localhost SAU pe live post push — verifica 21 punctele addresate + orice regresie sub uz normal
2. **Push origin/main** D031 — TU triggerezi manual cand smoke clean
3. **Cleanup #19 date test** post smoke — via Cont > Setari > "Sterge contul" (UI existent DeleteAccountConfirm) sau dev console pe live; manager NU poate accesa localStorage tau din sesiunea RC
4. **Decizii deferred:** V2 ExerciseMedia sourcing (WGER public CC vs ExRx vs custom vs Lottie); deep i18n extraction (workout flow + nutrition + calendar/istoric detail + library 657 `name_en` + coach engine output); pain-aware exercise SWAP V2 (#18 acum doar intensityMod minus pe ramai); override "Inteleg riscurile, accept" UX checkbox pt #16 unsafe target
5. **Beta GO** — decizia ta cand vrei
6. **DMARC email** + **rotit cheia API Anthropic** — gate-uri overnight #1 inca deschise

---

## Detalii complete
- `📥_inbox/HANDOVER_2026-05-28_autonomous-arc-2-wave-a-21-smoke-findings.md` — narativ DE SCRIS in doc-commit SSOT
- `DECISIONS.md` §D089 (LOCKED V1)
- `CHAT_STATE.md` §0-§3 live continuity
- Local commits: 4 merge `--no-ff` + 1 integration `95e97018`

---

🦫 **Autonomous Arc #2 COMPLET local. 5198 verzi + build clean. Astept smoke iar Daniel + push D031.**
