# Route lazy-load investigation chat 5 — 2026-05-23

**Investigator:** ROUTE-LAZY-LOAD-OPPORTUNITIES subagent
**Mode:** READ-ONLY filesystem analysis. ZERO src/ touched.
**Trigger:** LIGHTHOUSE-RE-RUN chat 5 Perf 97/100, main bundle 419KB transfer / 127KB gzip cu 92.4KB unused JS (72% wasted). Code-split = top opportunity #2.

---

## Current state — code-split deja avansat

Andura folosește deja `React.lazy()` agresiv pe sub-routes. Router config `src/react/routes/router.tsx:1-195` arată:

- **49 lazy chunks** confirmate vs Lighthouse raport — toate sub-screens nested sub `/app/*` tabs
- **Critical path EAGER** (10 components — bundled în main):
  - `Splash` (55 LOC) — landing, primul ecran
  - `Auth` (260 LOC) — magic link entry
  - `AuthCallback` (99 LOC) — magic link verify
  - `Onboarding` (353 LOC) — 7-step Big 6
  - `Antrenor` (171 LOC) — tab home 1
  - `Progres` (121 LOC) — tab home 2
  - `Istoric` (157 LOC) — tab home 3
  - `Cont` (151 LOC) — tab home 4
  - `Layout` (65 LOC) — bottom nav wrap
  - `ProtectedRoute` (72 LOC) — auth guard

**Total eager TSX:** ~1504 LOC route screens + dependențe transitive (stores, components, libs).

**Bundle breakdown post-build (dist/assets/):**
- `main-Cv23KIxB.js` = 441843 raw / 132004 gzip (32% gzip ratio)
- `vendor-react` = 75415 raw / 25444 gzip
- `vendor-icons` = 31405 raw / lucide-react
- `vendor-data` = 94876 raw / dexie (lazy-consumed via db chunk)
- `vendor-state` = 648 raw / zustand
- `index-PS-8IrxQ.js` = 441843 raw — **THIS IS SENTRY LAZY CHUNK** (verified `src/util/sentry.js:26` `await import('@sentry/browser')`, NU eager în main)

**Lazy chunks (top heaviest):**
- `Workout-*.js` = 23693 bytes — heaviest sub-route, 518 LOC
- `SchimbaFazaConfirm-*.js` = 8897 bytes — 117 LOC dar imports state machine?
- `SettingsNotifications-*.js` = 6994 bytes — 353 LOC
- `SettingsPrivacy-*.js` = 6895 bytes — 172 LOC dar text-heavy
- `PostSummary-*.js` = 5426 bytes — 305 LOC

---

## Verdict — Lighthouse top opportunity #2 e MISDIAGNOSIS

**Lighthouse 92.4KB unused JS NU vine din "route chunks not split"** (sunt deja 49 lazy chunks). Vine din:

1. **Eager imports în main bundle** (10 components + transitive deps)
2. **Vendor chunks pre-loaded** (`modulepreload` în index.html pe vendor-react + vendor-state + vendor-icons)
3. **Sentry pre-fetch** dacă SW precache hits (precache include `index-PS-8IrxQ.js` — care e Sentry)
4. **engineWrappers.ts** = 846 LOC / 34875 bytes raw bundled likely în main (consumat eager din `Antrenor.tsx` → `coachDirectorAggregate` → `engineWrappers`)

---

## Top candidates lazy-load

### HIGH ROI (defer aggressively)

#### 1. **Splash + Auth + Onboarding lazy** — pre-auth routes
- **Component paths:**
  - `src/react/routes/screens/Splash.tsx` (55 LOC)
  - `src/react/routes/screens/Auth.tsx` (260 LOC)
  - `src/react/routes/screens/AuthCallback.tsx` (99 LOC)
  - `src/react/routes/screens/Onboarding.tsx` (353 LOC)
- **Bundle save estimate:** ~767 LOC + lucide icons subset (Mail, FlaskConical, ExternalLink, ArrowLeft) ≈ ~15-25 KB raw / ~5-8 KB gzip
- **User flow context:** User logged-in (return visit) vizitează DIRECT `/app/antrenor` (deep-link sau bookmark) — NU mai trece prin Splash/Auth/Onboarding. ProtectedRoute redirect skipează Splash dacă auth=true (verify `ProtectedRoute.tsx:1-72`).
- **Lazy OK:** YES — returning users (majoritatea sesiuni post-onboarding) NU au nevoie eager. First-time vizitator are 50-100ms extra cold-load = acceptable trade pe Splash (already shows app shell paper bg).
- **Risk:** LOW — pattern existent (LazyRoute Suspense wrap), Splash deja minimal (no engines).

#### 2. **Antrenor tab home lazy** (controversial dar HIGH ROI)
- **Component path:** `src/react/routes/screens/antrenor/Antrenor.tsx` (171 LOC) + dependency chain
- **Bundle save estimate:** Antrenor.tsx imports `coachDirectorAggregate` → `engineWrappers.ts` (846 LOC / 34KB raw) + Calendar7Day (145 LOC) + 10+ Antrenor/ subcomponents. Total transitive ~2000+ LOC eager. Lazy = **~40-60 KB raw / ~12-18 KB gzip save** (engine cluster moves la per-tab chunk).
- **User flow context:** Index route `/app` → Antrenor. ESTE primul ecran post-auth. Lazy = first-load shows spinner 50-150ms before render.
- **Lazy DUBIOS:** primary entry = friction risk. Maria 65 cold-load: post-auth navigate spinner = "Andura buggy?". DAR — engines deja async (getCoachToday returns Promise → useEffect setState), so first paint already shows skeleton. Lazy adds extra round-trip BEFORE skeleton paint.
- **Recommendation:** **NU lazy primary tab Antrenor**, dar SPLIT engineWrappers per-tab (see Strategic section below).

#### 3. **Istoric tab home lazy** — secondary tab
- **Component path:** `src/react/routes/screens/istoric/Istoric.tsx` (157 LOC) + CalendarHeatmap (228 LOC) + RatingsStrip90Day (149 LOC)
- **Bundle save estimate:** ~534 LOC ≈ ~10-15 KB raw / ~3-5 KB gzip
- **User flow context:** Istoric e tab secondary (bottom nav slot 3). User accesează POST-Antrenor (already-loaded session). Lazy = first nav la Istoric 50-100ms spinner — acceptable Maria 65 friction.
- **Lazy OK:** YES — secondary tab, deja există spinner fallback pattern.

### MED ROI (lazy cu carefully + preload)

#### 4. **Progres tab home lazy**
- **Component path:** `src/react/routes/screens/progres/Progres.tsx` (121 LOC) + TDEEStrip (139 LOC) + FatigueStrip (76 LOC) + BMRStrip (102 LOC) + HeatMapWeekly (110 LOC) + NutritionInline (212 LOC)
- **Bundle save estimate:** ~760 LOC ≈ ~12-18 KB raw / ~4-6 KB gzip
- **User flow context:** Tab secondary, similar la Istoric.
- **Lazy OK cu preload hint:** YES — adăugăm `<link rel="modulepreload">` pe progres chunk la Antrenor render (probabil-next tab) pentru zero-friction nav.

#### 5. **Cont tab home lazy**
- **Component path:** `src/react/routes/screens/cont/Cont.tsx` (151 LOC) + getUserProfileDisplay
- **Bundle save estimate:** ~150-200 LOC ≈ ~3-5 KB raw / ~1-2 KB gzip
- **User flow context:** Settings tab — utilizator visits rar (post-onboarding, după probleme/curiozitate). Lazy = perfect candidate.
- **Lazy OK:** YES — low-frequency tab, deja există drill-downs lazy.

### LOW ROI (NU lazy — too ubiquitous)

- **Layout** (65 LOC) — wraps all `/app/*` routes, eager mandatory
- **ProtectedRoute** (72 LOC) — auth gate, eager mandatory
- **BottomNav, SessionPill, ErrorBoundary, LoadingSkeleton, ToastViewport** — Layout-level deps, eager mandatory

---

## Recommended action plan

### Quick wins — 4-6 ore implement, ~20-30 KB save (best case)

1. **Lazy Splash + Auth + AuthCallback + Onboarding** (4 components)
   - Pattern: identic cu sub-routes existent. `const Splash = lazy(() => import('./screens/Splash').then(...))`
   - Save: ~767 LOC eager → lazy chunks. ~15-25 KB raw / ~5-8 KB gzip cold-load reduction.
   - Risk: LOW — Splash shows `LazyRoute` fallback spinner ~50-100ms first paint. Acceptable single-occurrence first-load.
   - Verify: existing `routing.test.tsx` covers lazy Suspense fallback render.

2. **Lazy Cont + Istoric + Progres tab homes** (3 components)
   - Pattern: identic. Add to existing lazy block.
   - Save: ~1440 LOC ≈ ~25-35 KB raw / ~8-12 KB gzip
   - Risk: MED — secondary tabs, but bottom nav click → 50-100ms spinner. Maria 65 acceptable.
   - Mitigation: add `<link rel="modulepreload">` hint în Layout.tsx pentru likely-next-tab.

3. **Verify Sentry chunk truly lazy** (NO action needed — already verified)
   - `sentry.js:26` confirms dynamic import. `index-PS-8IrxQ.js` chunk loaded post-init.
   - Action: confirm Lighthouse `unused JS 92.4KB` includes Sentry chunk pre-fetched de SW precache. Daca DA → consider remove Sentry chunk din workbox precache (let SW fetch on-demand vs precache eager).

### Medium-term — 1-2 zile implement, ~30-50 KB total

4. **Engine wrappers split per-tab** — STRATEGIC

   `engineWrappers.ts` (846 LOC / 34KB raw) consumat în:
   - Antrenor home (eager) → readiness + fatigue + plannedWorkout + alerts
   - Progres tab (lazy) → getCoachToday + fatigue
   - Istoric tab (eager curent) → getPRHistoryAll + getStreakStats
   - Workout/PostRpe/WorkoutPreview (lazy) → getTodayWorkout + getPRDelta

   **Recommendation:** split engineWrappers în 3 sub-modules:
   - `engineWrappers/coach.ts` — getCoachToday + readiness + fatigue + alerts (Antrenor + Progres)
   - `engineWrappers/workout.ts` — getTodayWorkout + getPRDelta (Workout lazy chunks)
   - `engineWrappers/history.ts` — getPRHistoryAll + getStreakStats (Istoric)

   Save: ~10-15 KB raw / ~3-5 KB gzip main bundle (workout + history move la lazy chunks).
   Risk: MED — refactor touches engine wire. Recomandat post Wave A/B/C land, NOT acum.

5. **Manual preload hints în router**
   - Add `<link rel="modulepreload">` în Layout.tsx pentru bottom nav tabs (`/app/progres`, `/app/istoric`, `/app/cont`) DUPĂ Antrenor render complete.
   - Pattern: `useEffect` în Layout, append link tags pe document.head pentru next-likely chunks.
   - Save: 0 KB (same total transfer) DAR zero spinner pe tab switch — Maria 65 perceived perf wins.
   - Risk: LOW — additive only, no breaking.

### Strategic — 2-3 zile, ~30-40 KB save (after Wave A/B/C land)

6. **Vendor chunks optimize**
   - `vendor-icons` = 31KB raw (lucide-react) — currently bundled all imported icons. Could tree-shake further dacă unele Cont/* icons unused.
   - `vendor-data` = 94KB raw (dexie) — already split, dar e lazy? Check if used in main path.
   - Save estimate: ~10-20 KB raw / ~3-6 KB gzip if dexie truly off-critical.

7. **Sentry chunk strategy**
   - Currently lazy-imported AFTER consent check, dar SW precache include în `globPatterns: '**/*.{js,...}'`.
   - Action: exclude Sentry chunk din precache, runtime cache pe demand only.
   - Save: ~145 KB gzip out of precache → faster SW install pe first visit. NO main bundle change (already lazy).
   - Risk: LOW — opt-in chunk, only loaded if telemetryOptIn=true.

---

## Risks + tradeoffs

### First-load lazy chunk fetch latency
- Each lazy chunk = +HTTP/2 round-trip (~30-100ms median 3G mobile)
- Splash lazy = +1 round-trip BEFORE first paint = visible delay
- **Mitigation:** Splash fallback uses paper background match (Karpathy LCP friendly). Suspense placeholder = same color, NU layout shift.

### Service Worker precache adjustments
- Workbox `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` (vite.config.js:62) precaches TOATE assets
- New lazy chunks AUTO-included în precache → first visit downloads ALL (no first-load save)
- **Mitigation:** Daca scopul = reduce first-visit transfer, exclude lazy route chunks din precache (rely on runtime cache).
- DAR — current behavior = offline-first PWA (Maria 65 gym basement zero signal scenario). Excluding chunks de precache = lazy route NU funcționează offline.
- **Tradeoff Daniel CEO:** first-visit cold transfer SAU offline reliability. Quality > Speed → PRESERVE precache, accept higher first-visit.

### Preload hints required pentru likely-next-routes
- Lazy primary tabs (Antrenor) = spinner pe nav = friction
- Modulepreload din Layout post-mount mitigate complet zero-cost
- Required pattern: `useEffect(() => { const link = document.createElement('link'); link.rel='modulepreload'; link.href='/assets/Progres-*.js'; document.head.appendChild(link); }, [])`
- BUT — chunk hashes change per build = need build-time inject sau Vite manualChunks aliasing.

### React.lazy + Suspense boundary placement
- Existing pattern în `router.tsx:89-106` LazyRoute wrap = sound
- Top-level lazy (Splash/Auth) = need ROOT Suspense în main.tsx wrap `<RouterProvider>`
- Risk: LOW — additive pattern, well-trodden.

---

## Estimated total impact

### Conservative (Quick wins 1+2 only)
- Cold-load main bundle: **127 KB → ~110-115 KB gzip** (-12-17 KB, ~10-13% reduction)
- LCP estimated impact: -100-200ms Maria 65 3G mobile
- Lighthouse Perf score est: 97 → 98

### Optimistic (Quick wins + Medium-term 4+5)
- Cold-load main bundle: **127 KB → ~85-95 KB gzip** (-32-42 KB, ~25-33% reduction)
- LCP estimated impact: -200-400ms
- Lighthouse Perf score est: 97 → 99

### Maximum (Quick + Medium + Strategic 6+7)
- Cold-load main bundle: **127 KB → ~75-85 KB gzip** (-42-52 KB, ~33-41% reduction)
- LCP estimated impact: -300-500ms
- Lighthouse Perf score est: 97 → 99-100 (within margin of error 97-100 score)

---

## Blockers

- **NONE strict blockers.** All recommendations additive, reversible.
- Wave A/B/C land precedence — strategic refactor (engine wrappers split) recomandat post-Wave land, NOT acum.
- Preload hints require Vite build-time chunk-hash inject sau import meta resolve — needs prototype verify.

---

## Top 3 recommendations Daniel CEO

1. **Lazy Splash + Auth + AuthCallback + Onboarding** (Quick win #1) — `src/react/routes/router.tsx` 4-line change. ~15-25 KB raw save cold-load. Risk LOW. Effort ~30 min.

2. **Lazy Cont tab home** (Quick win #2 subset) — `src/react/routes/router.tsx` 1-line change. ~3-5 KB raw save. Low-frequency tab, zero Maria 65 friction. Risk LOW. Effort ~10 min.

3. **Verify Sentry SW precache strategy** — `vite.config.js:62` globPatterns exclude Sentry chunk. Save = first-visit SW install time, NU main bundle. ~145 KB gzip OUT of precache. Risk LOW (opt-in only). Effort ~15 min + test.

**SKIP recommendation:** Antrenor primary tab lazy (#2 in HIGH ROI) — primary entry friction NOT worth ~12-18 KB gzip save. Engine wrappers split better path for that goal.

---

## File path references

- Router config: `C:\Users\Daniel\Documents\salafull\src\react\routes\router.tsx`
- Main entry: `C:\Users\Daniel\Documents\salafull\src\main.tsx`
- Vite config: `C:\Users\Daniel\Documents\salafull\vite.config.js`
- Sentry lazy verified: `C:\Users\Daniel\Documents\salafull\src\util\sentry.js:26`
- Engine wrappers: `C:\Users\Daniel\Documents\salafull\src\react\lib\engineWrappers.ts` (846 LOC)
- Eager route screens (10): `C:\Users\Daniel\Documents\salafull\src\react\routes\screens\Splash.tsx`, `Auth.tsx`, `AuthCallback.tsx`, `Onboarding.tsx`, `antrenor/Antrenor.tsx`, `progres/Progres.tsx`, `istoric/Istoric.tsx`, `cont/Cont.tsx`, `Layout.tsx`, `ProtectedRoute.tsx`

Manager raport: out.
