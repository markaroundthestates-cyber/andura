# Track 7 Final Smoke Checklist — Pre-Beta Gate (§7.10)

**Use when:** All §7.1-§7.9 LANDED + Daniel secrets uploaded + first CI run baseline measured + Daniel mobile ready pentru manual smoke.

**Purpose:** Single comprehensive cap-coadă review per Daniel CEO directive verbatim: *"facem totul automat ca smokeul meu final sa fie clean"*. Audit-vs-UX gap close 75%→≥90% real.

**Procedure:** Mark each item ✅ / ⚠️ / ❌. Section completion gates next section. ZERO surprise tolerance.

---

## §0 Pre-conditions verify (CC autonomous, NU Daniel manual)

- [ ] Toate §7.1-§7.9 commits LANDED (15+ commits since `17b0bba` baseline)
- [ ] `git status --short` working tree clean (no uncommitted changes except whitelisted `.obsidian/app.json` UI state)
- [ ] `npm run typecheck` GREEN — TypeScript strict zero errors
- [ ] `npm run lint` GREEN — ESLint zero errors (warnings OK ≤9999 per max-warnings)
- [ ] `npm run test:run` GREEN — Vitest 4547+ PASS (4519 baseline + 27 §7.1 + 1 §7.5 sanity = 4547)
- [ ] `npm run test:engine` GREEN — invariants + golden master + coach scenarios skeleton
- [ ] `npm run build` GREEN — Vite build dist/ generated
- [ ] `npm run size` GREEN — bundle budgets PASS (main ≤100 KB / vendor ≤150 KB / CSS ≤30 KB gzip)
- [ ] `npm run depcheck` GREEN — no unused deps surfaced (whitelist tuned)
- [ ] `npm run madge:circular` GREEN — zero circular imports detected
- [ ] `npm run jscpd` GREEN — duplication threshold ≤5% (configurable .jscpd.json)
- [ ] `npm run licenses` GREEN — license summary clean
- [ ] `npm audit --production --audit-level=moderate` GREEN — production deps zero moderate+

---

## §1 Tier 1 CI status (gated on Daniel secrets §A+§C uploaded)

After Daniel push, CI auto-runs. Verify în GitHub Actions tab:

- [ ] `CI / Validate` job GREEN: typecheck + lint + test:run + build + size + depcheck + madge + jscpd + licenses + audit + Snyk
- [ ] `CI / E2E Smoke` job GREEN: smoke-react.spec.ts + magic-link.spec.ts + visual-regression.spec.ts + v2-4-taburi survivor
- [ ] `CI / Lighthouse` job: perf ≥85 / a11y ≥95 / best-practices ≥90 / SEO ≥90 / FCP <1800 / LCP <2500 / CLS <0.1 / TBT <200
- [ ] `Deploy to GitHub Pages` job GREEN — andura.app reflects latest commit
- [ ] `Lighthouse Live` post-deploy job GREEN — live URL gates pass
- [ ] `Checkly Deploy` post-deploy job GREEN (if activated) — synthetic monitors refreshed
- [ ] `QA Report` workflow GREEN — Playwright vs live, commit status success

---

## §2 Tier 2 Checkly synthetic prod 24h baseline

After first Checkly deploy + 24h elapsed:

- [ ] Checkly UI dashboard: 100% green pe `Andura PWA` project ultima 24h
- [ ] Zero failures pe Magic Link UI smoke (24h × 12 runs/hour × 2 locations = 576 checks)
- [ ] Zero failures pe Antrenor tab navigation
- [ ] Zero failures pe PWA Service Worker registration
- [ ] Slack `#andura-alerts` channel: zero P0/P1 incidents
- [ ] Median page load latency ≤2.5s (Core Web Vitals LCP)

---

## §3 Tier 3 Stagehand exploration overnight queue

After first nightly cron 03:00 UTC + Daniel morning review (1+ overnight run):

- [ ] GitHub Issues `exploration-anomaly` label: zero P0 anomalies
- [ ] GitHub Issues `severity-p1` label: zero new P1 anomalies (or all triaged + closed)
- [ ] Gigel T0 persona: completed workout flow without anomaly
- [ ] Marius T2 persona: completed progres + PR check without anomaly
- [ ] Maria 65 T3 persona: completed log weight + nutrition without anomaly

---

## §4 Daniel mobile manual smoke (single comprehensive cap-coadă)

**Setup:** iPhone/Android cu PWA installed din andura.app. Hard reload pre-smoke (clear SW cache). Romanian locale.

### §4.A Auth flow
- [ ] Open andura.app în mobile browser → install PWA prompt visible
- [ ] PWA installed → opens fullscreen, no browser chrome
- [ ] Magic Link: type email → tap "Trimite link" → check email arrives (Firebase real)
- [ ] Tap email link → opens app authenticated → lands pe Antrenor home

### §4.B Antrenor tab (14 sub-screens per master spec §1.2)
- [ ] ManageWeek render — săptămâna curentă vizibilă cu zile
- [ ] DailyView — workout zilei renderizat cu exerciții complete
- [ ] StartWorkout — buton Start prezent + tap inițiază sesiune
- [ ] Workout active screen — set+rep+weight inputs functional, no lag
- [ ] EndWorkout — buton final + Post-RPE collection screen
- [ ] AaFriction LOCK 9 PerSetSafetyModal — RIR 0 trigger correct → modal apare + dismiss functional
- [ ] LockExercises LOCK 4 — disclaimer modal vizibil prima dată + accept persisted
- [ ] PainButton — apăsare → pain logging UI prezent
- [ ] Bulk/cut energy section — toggle indicator vizibil în Antrenor
- [ ] ManageWeek edit — modify săptămâna logic intact

### §4.C Progres tab
- [ ] LogWeight — input greutate + save funcțional, persistă local
- [ ] BodyData — measurements salvabile
- [ ] Nutrition LOCK 11 — UI nutrition logging prezent (Daniel CEO review pending status — sub-screens specific)
- [ ] Chart render — istoric greutate + workout graf cumulative

### §4.D Istoric tab
- [ ] List view — sesiuni anterioare ordonate descendent
- [ ] Detail navigation — tap sesiune → drill-down volum + intensitate
- [ ] PR wall — Personal Records evidențiate

### §4.E Cont tab
- [ ] SettingsProfile — date personale editabile
- [ ] SettingsExport — buton export JSON functional
- [ ] SettingsTerms — link T&C deschide modal
- [ ] SettingsDanger — danger zone delete account prezent + confirmare
- [ ] Aparate filter — greyed-out logic correct (echipament lipsă marcat)

### §4.F PWA edge cases
- [ ] Offline mode: airplane mode → reload app → cached shell loads + offline indicator
- [ ] Background sync: log workout offline → reconnect → sync to Firestore
- [ ] Notifications: rest timer notif trigger (dacă activat)
- [ ] Safe area: notch/island/bottom-bar safe-area-inset paddings correct

### §4.G Cross-feature integrity
- [ ] Hard reload mid-session: not lose workout state (resume from where left off)
- [ ] Switch tab during workout: workout state preserved
- [ ] Slow network simulation: graceful degradation, no white screen

---

## §5 Final sign-off — Daniel CEO directive

- [ ] Toate §4.A-§4.G checkboxes ✅ (sau ⚠️ documented as known-defer)
- [ ] Zero `❌` blockers
- [ ] Daniel verbal confirmation: "Smoke clean. Beta gate PASS."

---

## §6 Final commit + tag + push (CC autonomous post-Daniel sign-off)

```bash
# 1. Final §7.10 LANDED commit
git add 📤_outbox/LATEST.md
git commit -m "$(cat <<'EOF'
chore(latest): Track 7 §7.10 LANDED — 10/10 phases complete + Daniel smoke PASS

- Status 9/10 → 10/10 (100% milestone)
- Daniel manual smoke PASS pe iPhone/Android (4 taburi cap-coadă)
- Tier 1 CI + Tier 2 Checkly 24h + Tier 3 Stagehand overnight = ZERO blockers
- Production readiness 56.5% → ≥85% achieved (Track 7 3-tier defense complete)
- Beta launch gate: PASS

Per DECISIONS.md §D032 + 08-workflows/TRACK_7_AUTOMATED_TESTING_MASTER_SPEC.md §7.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

# 2. Tag milestone (use scripts/track-7-finalize.sh helper)
bash scripts/track-7-finalize.sh

# 3. Push origin manual final (single conscious act — preserve D030 anti-recurrence)
git push origin main
git push origin track-7-automated-testing-landed-$(date +%Y-%m-%d)

# 4. Update DECISIONS.md D032 status
#   - Edit DECISIONS.md §D032 entry: LOCKED V1 → LANDED 2026-MM-DD
#   - Commit + push: docs(decisions-§D032): Track 7 LANDED status update
```

---

## §7 Post-§7.10 cleanup

- [ ] Consume `📥_inbox/PROMPT_CC_track_7_implementation_v1.md` → archive `📥_inbox/_CONSUMED/`
- [ ] Archive `📥_inbox/SETUP_DANIEL_TRACK_7.md` → keep at root for future maintenance OR archive
- [ ] Update `ANDURA_PRIMER.md §6 Backlog`: Track 7 status `IN PROGRESS § 10/10` → `LANDED 2026-MM-DD`
- [ ] Update `ANDURA_PRIMER.md §5 Current State`: append Track 7 LANDED paragraph cu metrics summary
- [ ] Archive `📤_outbox/LATEST.md` → `📤_outbox/_archive/LATEST-track-7-automated-testing-2026-MM-DD.md`
- [ ] Backlog next milestone: Pre-Beta launch decision

---

🦫 **Track 7 Automated Testing PASS = Andura ready pentru Beta launch a-z review.**
