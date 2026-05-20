# PROMPT_CC iter 1 V2 — Wave C — Components + Simplicity + MISSING screens

**Model:** Opus 4.7 EXCLUSIVELY. Verify `claude --version`.
**Stop trigger UNIQUE:** Daniel manual STOP.
**Authority:** Daniel CEO directive 2026-05-20 evening — V2 design LANDED. This is Wave C.
**Vault:** `C:\Users\Daniel\Documents\salafull\` (Windows ACASĂ).
**Branch:** main.
**Pre-req:** Wave A LANDED (mandatory — A003 ConfirmModal blocks C030+C031; C001 vanilla archive needs Wave A bundle code-split context). Wave B may be LANDED OR parallel (per `_DAG.md §2` LOW collision risk).

---

## §0 Context summary

You are executing **Wave C** of Iter 1 Mass Fix V2 — Vanilla legacy archive + SubHeader + 15 use sites + WorkoutPreview rich content + Istoric heatmaps + Antrenor Obiectiv selector + Progres Alerte banner + sub-screen sections + RestOverlay SVG ring + 6 MISSING screens NEW + Simplicity First cleanup + Pass 2 conditional cards verify + misc TBC.

**Source-of-truth backlog:** `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md §C` (80 tasks C001-C080).

**Strategic plan:** `📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md`.

**Tasks count:** ~80 atomic (mix M component builds). ETA Opus continuous: ~25-30h.

---

## §1 Pre-flight Wave C (execute ONCE at start)

```bash
claude --version
cd C:/Users/Daniel/Documents/salafull
git status
git log --oneline -10               # confirm Wave A LANDED (look for wave-a- commits + tags)
git branch --show-current           # expect main
npm run test:run 2>&1 | tail -10    # expect 4290+ PASS

# Confirm Wave A LANDED prerequisite
git tag --list "post-wave-a-iter1-v2-*"  # expect at least 1 tag

git tag pre-wave-c-iter1-v2-2026-05-XX
git push origin pre-wave-c-iter1-v2-2026-05-XX

cat 📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md | grep -A 150 "## §C WAVE C"
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-c-pre.json
```

---

## §2 Per-task execution loop (80 iterations C001 → C080)

Per task `_MASTER_BACKLOG.md §C`:

```
STEP 1 — Read source-finding D008
STEP 2 — Read prod file primary location head 50 lines
STEP 3 — Grep audit-fix pattern → IF MATCH NO-OP SKIP
STEP 4 — gitnexus_impact MANDATORY (Wave C ~80% M-effort component builds non-trivial)
STEP 5 — Edit/create file per Title spec
  Component build: place at src/react/components/ or appropriate /screens/ subfolder
  Mockup-reference verbatim: cite line number cu file:line format
  Tailwind utility classes ONLY (no global.css unless mockup design token explicit need)
  Read frontend-design SKILL: /mnt/skills/public/frontend-design/SKILL.md
STEP 6 — gitnexus_detect_changes (mandatory M effort)
STEP 7 — Run tests IF tests touched OR component changes ripple
  npm run test:run -- <relevant spec> 2>&1 | tail -5
STEP 8 — Atomic commit
  git commit -m "fix(wave-c-<id>): <title> (<source>) [<karpathy>]"
  # Wave C primarily TBC (Think Before Coding) for new components, SF for cleanup
STEP 9 — Update _progress.md
STEP 10 — Continue
```

---

## §3 Detailed task groups (80 tasks C001-C080)

See `_MASTER_BACKLOG.md §C` for full table.

**§C.1 Vanilla legacy archive (C001, 1 task closes ~30 findings):**
Move vanilla files to `src/_legacy-vanilla/`:
- Files to move: `src/pages/*` + `src/onboarding.js` + `src/bootstrap.js` + `src/main.js` + `src/inject.js` + `src/state.js` + `src/router.js` + `src/styles/main.css` + `src/themes/*` + `src/styles/aa-friction.css`
- KEEP in place (React-consumed): `src/auth.js` + `src/firebase.js` + `src/db.js` + `src/constants.js` + `src/util/*` + `src/engine/**` + `src/coach/orchestrator/**` + `src/styles/global.css` + `src/react/**` + `src/main.tsx`
- Update `tailwind.config.js` `content` array to exclude `src/_legacy-vanilla/**`
- Update `index-vanilla-legacy.html` paths to point new location
- Verify build still passes + tests pass
- Closes ~30 individual findings cluster (NC§1-H2 + §1-M3 + §1-M4 + §4-M1 + §22.* vanilla)

**§C.2 SubHeader pattern + 15 use sites (C002-C017, 16 tasks closes 15 findings):**
- C002 build `src/react/components/SubHeader.tsx` shared (back-btn + h2 + sticky default) ~30 LOC
- C003-C017 apply to 15 sub-screens: EnergyCheck + EnergyCause + WorkoutPreview + PostRpe + PostSummary + CevaNuMerge + PainButton + EquipmentSwap + AparateLipsa + ScheduleOverride + 5 more

**§C.3 WorkoutPreview rich content (C018-C020, 3 CRIT MISSING):**
- C018 Session header dark hero card "Push · piept & umeri ~ 45 min · 5 exercitii · 12 800 kg"
- C019 Warmup row "Incepem cu 5 min incalzire piept & umeri — band pull-apart × 2..."
- C020 Exercise list 5 numbered (signature pre-workout UX)

Mockup reference: `04-architecture/mockups/andura-clasic.html` (line cited per finding).

**§C.4 Istoric calendars + Antrenor + Progres (C021-C025, 5 CRIT MISSING):**
- C021 Istoric calendar heatmap month-navigable — Build `IstoricCalendarHeatmap.tsx` color-coded session intensity
- C022 Istoric 90-day ratings heatmap (F14 V1) — Build `IstoricRatingsHeatmap.tsx`
- C023 Antrenor Obiectiv/Programe 6-row selector (Daniel "6 obiective V1 LOCK") — Build `ObiectiveSelector.tsx`
- C024 CoachDeloadCard 3rd variant — extend existing component
- C025 Progres Alerte azi 3-row banner (F1 V1 + FIX 4 LAGGING) — Build `AlerteAziBanner.tsx` OR extend existing AlertsBanner

**§C.5 Sub-screen sections + SessionTimer + RestOverlay (C026-C033, 8 tasks):**
- C026 SettingsProfile Compozitie corporala section
- C027 SettingsProfile Tinte personale section
- C028 SessionTimer Workout menu button (pain + finish-early triggers)
- C029 RestOverlay SVG ring countdown signature UX + color states + pulse animation
- C030 SettingsDanger warning banner top-of-screen
- C031 SettingsDanger grace text per destructive row
- C032 SettingsProfile avatar engine-wired (uid hash → default avatar gradient)
- C033 ResumeSessionCard variant mockup-verify state-aware

**§C.6 MISSING screens NEW (C034-C039, 6 CRIT MISSING):**
- C034 Greutate & BF timeline — `IstoricWeightTimeline.tsx` NEW + router.tsx add `/app/istoric/weight-timeline`
- C035 Loguri greutate list view — `IstoricLoguriGreutate.tsx` NEW + router
- C036 Cont Suport — `SettingsSupport.tsx` NEW + router (E010 Ajutor row target)
- C037 Cont Despre — `SettingsAbout.tsx` NEW + router
- C038 Cont FAQ — `SettingsFaq.tsx` NEW + router
- C039 Cont SettingsThemes picker — `SettingsThemes.tsx` NEW + router (Appearance row target)

**§C.7 Simplicity First cleanup post-vanilla-archive (C040-C049, 10 tasks):**
- C040 Delete `public/sw.js` (keep vite-plugin-pwa generated exclusive)
- C041 Document NO-split decision engineWrappers.ts file header (466 LOC Karpathy SF wins)
- C042-C045 4 dead-code surgical removals batch
- C046-C049 4 TODO/FIXME marker resolutions batch

**§C.8 Pass 2 conditional cards verify (C050-C054, 5 tasks):**
- C050 ReactivateCard mockup-verify post-engine-wire
- C051 ResumeSessionCard state-aware variants
- C052 TDEEStrip + FatigueStrip strips verify
- C053 NutritionInline residual gaps close
- C054 PRWallRecent residual gaps close

**§C.9 Misc TBC new components (C055-C080, 26 tasks):**
26 misc batch — expand inline per source-citation:
- Auth signup error states
- Network offline banner
- Empty state UX per-screen
- Loading skeleton per-route
- 22 other items expand per `_MASTER_BACKLOG.md §C.9` inline elaboration during execution

---

## §4 Component build guidance

### §4.1 Mockup-verbatim fidelity D015 LOCKED V1 master

Mockup authority: `04-architecture/mockups/andura-clasic.html`.

Per component:
1. Read mockup section line-cited verbatim
2. Match Tailwind utilities to mockup CSS (token by token)
3. Use Tailwind arbitrary values `[]` where mockup uses non-standard tokens
4. Add Lora italic for coach voice
5. Romanian no-diacritics MANDATORY

### §4.2 Frontend-design skill

Read `/mnt/skills/public/frontend-design/SKILL.md` for environment-specific constraints, design tokens, layout rules.

### §4.3 Test coverage NEW components

For each NEW component (SubHeader + ConfirmModal already in Wave A + IstoricCalendarHeatmap + IstoricRatingsHeatmap + ObiectiveSelector + AlerteAziBanner + 6 MISSING screens):
- Co-locate test `<Component>.test.tsx`
- Test: rendering + props variations + interaction (back-btn click + select etc.)
- Use Vitest + React Testing Library per D026
- Aim 80% line coverage NEW components

### §4.4 Router additions (MISSING screens)

For C034-C039 + others requiring new routes, edit `src/react/routes/router.tsx`:
- Use `React.lazy()` for new screen (D025 Wave D bundle code-split alignment)
- Add `<Route path="/app/.../..." element={<Suspense fallback={...}><Component/></Suspense>} />`
- Verify ProtectedRoute wraps `/app/*` paths

---

## §5 Cluster E paradigm-affected tasks (handling)

Cluster E paradigm decisions affect some Wave C tasks:
- E001 SettingsPrefs swap → C-cluster impl awaits Daniel decision
- E007 Phase 6 prod-extras → C054 PRWallRecent + others may need keep+amend OR remove
- E008 BodyData drift → Progres screen extras may need cleanup

**Handling:** Execute Wave C text-only safe tasks FIRST. Mark paradigm-affected impl tasks "DEFERRED Cluster E pending Daniel decision" in `_progress.md`. Continue with non-paradigm tasks.

Check `_progress.md §5` at Wave C start to see Daniel decisions LANDED — apply accordingly.

---

## §6 Fail-stop per task

Same as Wave A §4. Stash + mark FAILED + continue.

For NEW components — if build fails OR tests don't pass, stash + mark FAILED. **Don't leave broken NEW components in src/ — strict fail-stop discipline.**

---

## §7 Post-Wave C completion

```bash
npm run test:run 2>&1 | tail -20
npm run typecheck 2>&1 | tail -10
npm run build 2>&1 | tail -10
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-c-post.json

git tag post-wave-c-iter1-v2-2026-05-XX
git push origin post-wave-c-iter1-v2-2026-05-XX
git push origin main

cat > 📤_outbox/LATEST.md << 'EOF'
# Wave C LANDED — Iter 1 Mass Fix V2 — Components + Simplicity + MISSING screens

## Status
COMPLETE (or PARTIAL)

## Tasks executed
- C001-C080: <N LANDED> / <M NO-OP> / <K FAILED> / <X DEFERRED Cluster E>
- Individual findings closed: ~110

## NEW components created
- SubHeader.tsx + 15 use sites
- IstoricCalendarHeatmap.tsx
- IstoricRatingsHeatmap.tsx
- ObiectiveSelector.tsx
- AlerteAziBanner.tsx
- IstoricWeightTimeline.tsx
- IstoricLoguriGreutate.tsx
- SettingsSupport.tsx
- SettingsAbout.tsx
- SettingsFaq.tsx
- SettingsThemes.tsx
- (Total: ~12 NEW components + ~6 NEW routes)

## Vanilla legacy archive
- Moved src/pages/* + onboarding.js + bootstrap.js + main.js + inject.js + state.js + router.js + main.css + themes/* + aa-friction.css → src/_legacy-vanilla/
- ~30 findings cluster closed

## Build + Tests
- Tests: <X> PASS (<Y> new tests for new components)
- Typecheck: 0 errors
- Build: OK, bundle delta documented

## Commits + Push
- Commits Wave C: ~80 atomic
- Tag pre/post: pre-wave-c-iter1-v2 / post-wave-c-iter1-v2
- Push: origin main + tags ✓

## Issues
- <enumerate failed + deferred>

## Next action
- Trigger Wave D (paste PROMPT_CC_iter1_wave_d_goal_driven_refactor.md)
EOF
```

---

## §8 Karpathy Wave C axis

- **TBC (Think Before Coding):** ~70% of Wave C — new components + routes + structured features
- **SF (Simplicity First):** ~25% of Wave C — vanilla archive + dead code + TODO resolutions
- **SC (Surgical Changes):** ~5% of Wave C — minor adjacent edits

NO GD în Wave C. Multi-file refactor scope = Wave D.

---

## §9 Anti-recurrence

- D008 source verify
- D015 mockup verbatim cite (line:char where applicable)
- D023 vault writes via filesystem
- D026 Vitest 4290+ baseline preserve
- D029 stale-baseline grep audit-fix
- D031 push manual final at end-of-Wave
- D041 anti-inflation reporting
- D-LEGACY-064 Romanian no-diacritics

---

🦫 **Wave C — START.** Read `_MASTER_BACKLOG.md §C`. Execute 80 tasks C001-C080 per §2 loop. Build NEW components mockup-verbatim. Vanilla archive 1 task closes ~30 findings. Push manual final. Write LATEST.md. Daniel triggers Wave D.
