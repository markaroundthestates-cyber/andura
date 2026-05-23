# Mockup parity fresh sweep final chat 5 — 2026-05-23

**Audit:** READ-ONLY mockup-vs-React fresh sweep post Wave 1-22 saturation
**Mockup ref:** `04-architecture/mockups/andura-clasic.html` (4753 LOC, ~50 screens, D015 LOCKED V1 DESIGN MASTER)
**React surface:** `src/react/` (8 routes parinti + 50+ sub-screens + 30+ shared components)
**Procedure:** Karpathy 4 principii read-only — verbatim mockup ref + diff vs prod commit log
**Prior baseline:** 2026-05-20 Pass 1+2+3+4+5 audit ~36% mockup parity weighted

---

## §S0 BOTTOM LINE

**Chat 5 closed ~80+ parity findings across 12+ Waves (W3-C, W10-W22).** Major surface gaps converged: ObiectivSelector + CalendarHeatmap + RatingsStrip90Day + Alerte azi banner + SVG ring + FatigueStrip + 7 Confirm modals + Cont Ajutor 4-row wiring + Magic Link UI + h1 font-bold sweep + 30+ subheader font-weight ~all LANDED.

**Estimated mockup parity post chat 5: ~78-82%** (UP from ~36% baseline 2026-05-20). Remaining residual = 3 paradigm decisions Daniel CEO + ~7-9 component-level genuine gaps + ~12-18 polish nits.

---

## §S1 Baseline + chat 5 closure recap

### Chat 5 LANDED waves (from git log)

- **W A-G (overnight ~46 commits)** — engine wire CoachToday + CoachRest, 7 Confirm modals build, SchimbaFaza wire, ResetCoach wire, BLOCKER A007 logout
- **W3-C** — Antrenor sub-screen SubHeaders (PAR-009)
- **W10** — calendar edit hint copy, reactivate card icon
- **W11** — FatigueStrip sublabel, ResumeCard bg cream, ReactivateCard border, TDEEStrip italic, RestOverlay context cue
- **W12** — Auth email label mockup verbatim, Cont avatar size
- **W13** — Splash font-serif removal, splash asimetric padding
- **W14** — Magic Link "Verifica emailul" UI, splash layout justify-between
- **W15** — Cont title font-bold, SettingsDanger grace text, SettingsNotifications quiet hours
- **W16** — Auth skip-auth risk note, Magic Link sent UI L467-476
- **W17** — Workout preview closing italic, Energy cause intro/header/layout, IstoricDetail RO weekday cross-screen
- **W19** — splash layout 3-section, fatiguestrip
- **W20** — Auth font-bold, Onboarding 7 h1 font-bold batch, Progres font-bold, Istoric font-bold
- **W21** — Energy check intro, schimba-faza body verbatim
- **W22** — Antrenor font-bold + cross-screen subheader fontweight ~30 sub-screens
- **D047 Stage 3** — SettingsPrefs Avansat section (3 drill-downs)
- **F-cont-04** — 4 Ajutor rows wired (settings-support/about/faq + ceva-nu-merge)

### Tier 1-3 prior CRIT closures verified

- **CoachTodayCard engine wire** — `src/react/components/Antrenor/CoachTodayCard.tsx:33-34` imports engineWrappers + getLaggingSignal L68 (3 CRIT closed)
- **CoachRestCard engine wire** — coachDirectorAggregate.restReason wired (2 CRIT closed)
- **ConfirmModal × 7 sites** — DeleteAccount + Logout + ResetData + ResetCoach + SchimbaFaza + ProgramChange + FinishEarly + RedoOnboarding all in `src/react/routes/screens/{cont,antrenor}/` (7+ CRIT closed)
- **Auth Google OAuth** — `Auth.tsx:13` `buildGoogleSignInUrl` import + showGoogle gate L77 (F-auth-03 closed)
- **Auth skip-auth** — handleSkipAuth + risk-note L255-261 (F-auth-04 closed)
- **ObiectivSelector** — `Antrenor.tsx:46` import + L155 render (F-antrenor-03 closed)
- **Alerte azi banner 3-row** — `Progres.tsx:2` F-progres-07 marker + L63 (F-progres-07 closed)
- **Calendar heatmap month-nav** — `Istoric.tsx:18+110` CalendarHeatmap component (F-istoric-01 closed)
- **Ratings 90-day strip** — `Istoric.tsx:19+113` RatingsStrip90Day component (F-istoric-03 closed)
- **SVG ring RestOverlay** — `RestOverlay.tsx:23+57` SVGCountdownRing wrapper (F-pass2-restoverlay-01 closed)
- **SessionTimer kebab menu** — `SessionTimer.tsx:134` workout-menu-trigger + menuOpen state (F-pass2-sessiontimer-01 closed)
- **WorkoutPreview hero card + warmup + exercise list** — `WorkoutPreview.tsx:156` bg-ink hero + L186 warmup + L208 exercise ul (3 CRIT closed)
- **SettingsPrefs hybrid** — Avansat section L99 wires destructive actions inline (paradigm divergence resolved D047 Stage 3)
- **Cont Ajutor 4 rows** — Support + Ceva nu merge + About + FAQ wired (F-cont-04 closed)

**Effective closure: 25+ CRIT findings from baseline 42, plus ~70 MED/LOW polish fixes.**

---

## §S2 Fresh sweep residual gaps

### Splash + Auth + Onboarding

- **F-auth-order-01 (Daniel CEO pending)** — Auth order divergence
  - Mockup L432-465: Google primary (brick CTA top) → divider "sau" → Email secondary (ghost CTA) → divider "sau" → skip-auth (outline) — Google first paradigm
  - React `Auth.tsx:171-247`: Email primary (brick top) → Google secondary outline → Skip-auth outline — Email first paradigm
  - **No `<div>--sau--</div>` dividers in React** (mockup L439-456 has 2 divider rows)
  - **Severity:** MED — Daniel CEO paradigm decision (Google brick primary per mockup vs Email primary per Romanian Magic Link UX preference). Already flagged.
- **§F-onboarding-02 paradigm flag** — already documented in commit `3f6016de` doc-only (Daniel CEO pending)
- Splash + Onboarding fontweight + layout — CLOSED

### Antrenor + sub-screens

- **F-postsummary-marius-detail (NEW genuine gap)** — `PostSummary.tsx` missing "Detaliu Marius" granular section
  - Mockup L1683-1691: persona-aware section showing Tonaj sesiune / 1RM Impins est / RPE mediu / Densitate (Marius advanced metrics)
  - Prod: ZERO Marius granular section present (only basic stats grid)
  - **Severity:** MED — Marius persona conditional display gap. Phase 6 task_18 wire not yet landed.
- **PAR-005 Sesiuni Recente fold (Daniel CEO pending)** — already flagged
  - Mockup L2156-2185 `screen-sesiuni-recente` (Istoric drill-down)
  - React: NO route for sesiuni-recente — folded into Istoric main view OR pending Daniel decision
  - **Severity:** MED — Daniel CEO add vs fold decision (~3-5h dev if add)
- **DRIFT-02 FatigueStrip paradigm (Daniel CEO pending)** — already flagged
  - **Severity:** MED — Daniel CEO preserve vs drift decision
- Antrenor h1 fontweight + subheaders + EnergyCheck + EnergyCause + WorkoutPreview + Workout + PostRpe + PostSummary basic + CevaNuMerge + PainButton + EquipmentSwap + AparateLipsa + ScheduleOverride — ALL CLOSED

### Progres + Istoric + Cont

- **F-pass2-settings-profile-03 (CRIT still open)** — `SettingsProfile.tsx` Compozitie corporala section ENTIRELY MISSING
  - Mockup L1916-1929: Talie/Gat numeric inputs + BF % auto US Navy display + manual override toggle + US Navy method footnote L1929
  - Prod `SettingsProfile.tsx:91-136`: only Date personale (Varsta/Greutate/Gen) + Antrenament (Obiectiv/Frecventa/Experienta) sections — NO body composition section
  - **Severity:** HIGH — explicit user-facing data CRIT, dev scope ~2-3h
- **F-pass2-settings-profile-04 (CRIT still open)** — `SettingsProfile.tsx` Tinte personale section ENTIRELY MISSING
  - Mockup L1931-1935: Greutate tinta numeric + Pana in month picker
  - Prod: ZERO targets section present
  - **Severity:** HIGH — user-facing data CRIT, dev scope ~1-2h
- **F-pass2-settings-profile-05 paradigm KEEP** — Antrenament section kept in prod (KEEP per L138-142 comment, mockup omission flagged as mockup drift NOT prod bug)
- Progres h1 fontweight + subtitle + TDEEStrip + BMRStrip + HeatMapWeekly + WeightLogList + StatsGrid — CLOSED
- Istoric h1 fontweight + Calendar heatmap + Ratings strip + PrWall + IstoricDetail + month abbrev — CLOSED
- Cont h1 + avatar size + Ajutor rows + 7 Confirm modals + SettingsExport + SettingsFaq + SettingsTerms + SettingsPrivacy + SettingsAbout + SettingsSupport + SettingsAppearance + SettingsThemes + SettingsNotifications + SettingsDanger + SettingsSubscription + SettingsPrefs hybrid — CLOSED

### Other surface gaps

- **PARITY-DEFERRED 3 (Daniel CEO pending)** — already flagged separately
- Magic Link sent UI + Email label + risk note — CLOSED
- 7 confirms (Reset coach + Schimba faza + Logout + Delete + Redo onboarding + Program change + Finish early) — ALL CLOSED post W A-G overnight

---

## §S3 Severity matrix

| Severity | Count | Notes |
|----------|-------|-------|
| HIGH (workflow visible) | **2** | Compozitie corporala + Tinte personale sections in SettingsProfile (genuine code gap) |
| MED (polish + cosmetic + paradigm) | **4** | Auth order/dividers, PostSummary Marius detail, PAR-005 Sesiuni Recente, DRIFT-02 FatigueStrip, §F-onboarding-02 |
| LOW (nit) | **~12-18** | F-pass4 polish backlog residual (spacing micro-divergences L11-20, border-radius drift L41-58, body text font-weight L73-80, ink hierarchy L92-98, icon size L124-132, calendar week alignment L145-154, lucide name consistency L184-192) |

**Total fresh residual: ~18-24 findings** (down from ~263 cumulative baseline).

---

## §S4 Top 5 priority chat 6 recommendations

1. **F-pass2-settings-profile-03/04 — Compozitie corporala + Tinte personale sections** (HIGH, ~3-5h dev, ATOMIC SUB-tasks closing 2 CRIT, surgical add 2 sections to SettingsProfile.tsx between L136-138 mockup verbatim L1916-1935)

2. **F-postsummary-marius-detail — Detaliu Marius granular section** (MED, ~2h dev, conditional persona-gated render below stats grid in PostSummary.tsx L257+, mockup verbatim L1683-1691)

3. **F-auth-order-dividers — Daniel CEO decision** (MED paradigm pending) — preserve current Email-first prod OR swap to Google-first mockup. Recommend SURFACE TRADEOFF: keep Email-first (RO Magic Link UX) + ADD `<div>--sau--</div>` 2 dividers between sections cosmetic improvement (mockup L439-456 polish, ~30min dev)

4. **Pass 4 polish backlog cleanup** (LOW × ~12-18, ~2-4h dev) — spacing micro-divergences, border-radius unification (12 vs 14 vs 16 vs 18 vs 22 token consolidation), body text font-weight 500 sweep, ink hierarchy 3-tier audit. Already documented in `mockup-vs-prod-parity-2026-05-20/findings-pass4-polish-backlog.md`.

5. **Daniel CEO paradigm batch session** — PAR-005 Sesiuni Recente fold + DRIFT-02 FatigueStrip preserve/drift + §F-onboarding-02 + Auth order = 4 decisions ~30min Daniel review (1-batch resolution preferred over per-decision interrupts)

---

## §S5 Daniel CEO paradigm pending (separately tracked, NOT chat 6 code gaps)

These already flagged in `📤_outbox/DECISIONS_CHAT5_DRAFT.md` §P1, §P8, §P9 + commit `3f6016de` doc:

- **§P1 §F-onboarding-02** — onboarding paradigm divergence
- **§P8 PAR-005 Sesiuni Recente** — add screen (~3-5h dev) vs fold into Istoric main
- **§P9 DRIFT-02 FatigueStrip** — preserve mockup paradigm vs accept current prod drift
- **§F-cont-05** — Cont related paradigm
- **PARITY-DEFERRED 3** — already flagged 3 items
- **F-auth-order** — Google-primary vs Email-primary paradigm (NEW from this sweep)

Total: ~5-6 Daniel CEO decisions pending paradigm batch session pre-Beta.

---

## §S6 Saturation verdict

**Code-only quick wins remaining:**
- 2 HIGH (Compozitie + Tinte sections — surgical SettingsProfile.tsx add)
- 1 MED genuine code gap (PostSummary Marius detail)
- ~12-18 LOW polish nits (Pass 4 backlog)

**Total code-only effort:** ~5-9h dev across 3 atomic Bugatti single-concern commits + Pass 4 polish batch.

**Daniel CEO strategic remaining:** ~5-6 paradigm decisions (batch ~30min review session)

**Mockup parity post chat 6 closure estimate:** ~90-95% (post HIGH + MED genuine gaps + Pass 4 polish) — pre-Beta nuclear audit ready.

---

## §S7 Reconciliation

- **2026-05-20 baseline:** ~36% mockup parity (Pass 1+2+3+4+5 audit)
- **Chat 5 LANDED:** ~80+ findings closed across 12+ Waves
- **Estimated current:** ~78-82% mockup parity weighted
- **Post chat 6 quick wins:** ~90-95% achievable
- **Daniel CEO paradigm batch:** pre-Beta launch gate

**Anti-inflation D041 honored:** measured per-finding NU compound percentage.

---

## §S8 Files cross-checked (audit trail)

- `04-architecture/mockups/andura-clasic.html` (mockup SoT 4753 LOC)
- `src/react/routes/screens/{Auth,Splash,Onboarding,AuthCallback}.tsx`
- `src/react/routes/screens/antrenor/{Antrenor,WorkoutPreview,Workout,PostRpe,PostSummary,EnergyCheck,EnergyCause,CevaNuMerge,PainButton,EquipmentSwap,AparateLipsa,ScheduleOverride,FinishEarlyConfirm,ProgramChangeConfirm}.tsx`
- `src/react/routes/screens/progres/{Progres,WeightTimeline,LogWeight,WeightLogList,BodyData}.tsx`
- `src/react/routes/screens/istoric/{Istoric,IstoricDetail,PrWall}.tsx`
- `src/react/routes/screens/cont/{Cont,Settings*,*Confirm}.tsx` (~20 files)
- `src/react/components/{Antrenor,Istoric,Progres,Workout}/*.tsx` (~25 files)
- `src/react/components/{AaFrictionModal,SubHeader,Calendar7Day,NutritionInline,Toast,SessionPill}.tsx`
- Git log -500 chat 5 (~523 commits)
- Prior audit `📤_outbox/mockup-vs-prod-parity-2026-05-20/SUMMARY.md` (Pass 1+2+3+4+5)

---

## §S9 Output verdict

**Fresh sweep COMPLETE.** Audit ground-truth per D041 anti-inflation discipline.

**Genuine code-only residual: 2 HIGH (SettingsProfile Compozitie + Tinte) + 1 MED (PostSummary Marius detail) + ~12-18 LOW polish (Pass 4 backlog).**

**Daniel CEO paradigm pending: 5-6 decisions (batch review pre-Beta).**

**Recommended chat 6 priority:** F-pass2-settings-profile-03/04 (2 CRIT closure single atomic surgical commit) + Pass 4 polish backlog batch + Daniel CEO paradigm batch session.

Bugatti read-only audit log-only. ZERO src/ modifications. ZERO commits.
