---
title: BATCH_A1 — Text Swaps Wave A (parallel-safe surgical)
status: DESIGN_LANDED_PENDING_EXECUTION
wave: 2 parallel-safe
cluster: A — Surgical Changes
tasks: A001-A025 (25 atomic tasks)
eta: ~3-4h Opus continuous
trigger: Daniel paste this file in fresh CC session post Wave 1 LANDED
parallel_safe: YES — different file scopes across BATCHes A1-A8
---

# BATCH_A1 — Text Swaps Wave A (Antrenor + Splash + Auth + 5 sub-screens)

**Daniel paste prompt:** *"Execute BATCH_A1 per spec `📥_inbox/iter-1-mass-fix/BATCH_A1_text_swaps_wave_a.md`. Read pre-flight + execute tasks A001-A025 sequential within session. Atomic commits per task. Push origin manual final post-BATCH."*

**Model:** Opus 4.7 EXCLUSIVELY.
**Cluster:** A — Surgical Changes (1-3 LOC per task, anti-overengineering).
**Parallel-safe:** Yes — Daniel can spawn this BATCH în Session α concurrent cu Session β running other Cluster B/C/D BATCHes (different file scopes minimal collision risk).

---

## §0 Pre-flight BATCH

```powershell
git status                                  # expect: clean OR known modified
git log -3 --oneline                        # confirm latest Wave 1 commits
git tag pre-batch-a1-text-swaps-wave-a
npm run test:run                            # baseline 4522 PASS verify
```

GitNexus:
```
gitnexus_query({query: "Antrenor"})
gitnexus_query({query: "Splash"})
gitnexus_query({query: "Auth"})
```

Mockup primary-source read (D008 mandatory):
- `04-architecture/mockups/andura-clasic.html:731-875` (Antrenor mockup)
- `04-architecture/mockups/andura-clasic.html:<splash-section>` (search "screen-splash")
- `04-architecture/mockups/andura-clasic.html:<auth-section>` (search "screen-auth")

Audit primary-source read:
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-antrenor.md` (full)
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-splash.md` (full)
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-auth.md` (full)

---

## §1 Atomic task spec (25 tasks compact)

Per task = single atomic commit. Format: `fix(A<NNN>-<short-slug>): <description> (<source-citation>)`

### Antrenor (A001-A004) — 4 tasks

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A001 | Antrenor.tsx:100 (above h1) | andura-clasic.html:733 | Add `<div className="text-xs text-ink3">{formatRoDate(new Date())}</div>` (Joi, 7 mai · 18:30 pattern) | `fix(A001-antrenor-date-header): add Romanian locale date+time (MP-antrenor-01)` |
| A002 | Antrenor.tsx:101 (below h1) | andura-clasic.html:735 | Add `<p className="italic text-sm text-ink2 font-serif">Cine te ghideaza in sala.</p>` | `fix(A002-antrenor-subtitle): add coach tagline italic Lora (MP-antrenor-02)` |
| A003 | Antrenor.tsx:138-141 | andura-clasic.html:752 | CTA text "Incepe antrenament" → "Incepe sesiunea →" | `fix(A003-antrenor-cta-text): update CTA label to "Incepe sesiunea →" (MP-antrenor-08)` |
| A004 | Antrenor.tsx | andura-clasic.html:754 | Verify override link "Vrei altceva azi?" exists OR add (Pass 2 verify dep) | `fix(A004-antrenor-override-link): wire/verify "Vrei altceva azi?" override (MP-antrenor-09)` |

### Splash (A005) — 1 aggregated task

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A005 | Splash.tsx (full screen) | andura-clasic.html:splash section (search "screen-splash") | Logo wordmark + tagline coach quote + version footer + Incepe CTA — all text mockup-verbatim | `fix(A005-splash-text-fidelity): mockup-verbatim text pass Splash (MP-splash-01..06)` |

### Auth (A006) — 1 aggregated task

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A006 | Auth.tsx + AuthCallback.tsx | andura-clasic.html:auth section | Email input label + button text + helper text + error states — Romanian no-diacritics | `fix(A006-auth-text-fidelity): mockup-verbatim text pass Auth + AuthCallback (MP-auth-01..05)` |

### Progres (A007) — 1 aggregated task

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A007 | Progres.tsx | andura-clasic.html:progres section | Screen title + subtitle + section group headers (OBOSEALA AZI / NUTRITIE · AZI / etc.) + footer | `fix(A007-progres-text-fidelity): mockup-verbatim text pass Progres (MP-progres-01..06)` |

### Istoric (A008) — 1 task

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A008 | Istoric.tsx | andura-clasic.html:istoric section | Subtitle + section labels + empty state UX | `fix(A008-istoric-text-fidelity): mockup-verbatim text pass Istoric (MP-istoric-02)` |

### Cont (A009) — 1 aggregated task

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A009 | Cont.tsx | andura-clasic.html:cont section | Tab title + subtitle + group section headers | `fix(A009-cont-text-fidelity): mockup-verbatim text pass Cont (MP-cont-01..03)` |

### Sub-screens 5 (A010-A015) — 5 aggregated tasks

| Task | File:line | Mockup ref | Edit | Commit |
|------|-----------|------------|------|--------|
| A010 | EnergyCheck.tsx | andura-clasic.html:energy-check | Title + 3-state labels + footer | `fix(A010-energy-check-text): mockup-verbatim text (MP-energy-check-01..04)` |
| A011 | EnergyCause.tsx | andura-clasic.html:energy-cause | Title + cause options + CTA | `fix(A011-energy-cause-text): mockup-verbatim text (MP-energy-cause-01..03)` |
| A012 | WorkoutPreview.tsx | andura-clasic.html:workout-preview | Duration/exercise chip labels + CTA | `fix(A012-workout-preview-text): mockup-verbatim text (MP-workout-preview-04..08)` |
| A013 | Workout.tsx | andura-clasic.html:workout | Set/rep/load labels + button text | `fix(A013-workout-text): mockup-verbatim text (MP-workout-01..06)` |
| A014 | PostRpe.tsx | andura-clasic.html:post-rpe | 3-rating labels + helper text | `fix(A014-post-rpe-text): mockup-verbatim text (MP-post-rpe-01..05)` |

### Misc sub-screens (A015-A025) — 11 tasks

| Task | File:line | Edit | Commit |
|------|-----------|------|--------|
| A015 | PostSummary.tsx | Felicitare + stats + reflectie quote | `fix(A015-post-summary-text): mockup-verbatim (MP-post-summary-01..06)` |
| A016-A025 | 10 misc screens (Cluster A.1 batch) | 10 sub-screens text fidelity (Antrenor secondary 5 + Cont 5) — per finding ref | `fix(A016-A025-...): per task` |

---

## §2 Execution loop

For each task A001 → A025:

```
1. Read source-finding file line cited (D008)
2. Read mockup andura-clasic.html line cited (D008)
3. Read prod file line cited
4. Edit cu Edit tool exact (NO multi-task batch edits)
5. Run gitnexus_detect_changes — verify only expected symbol modified
6. Run npm run test:run -- <relevant-test-name> if test file exists
7. git add <file> && git commit -m "<commit-message>"
8. Mark task A<NNN> LANDED in _progress.md
```

Anti-overengineering reminder: each task = 1-3 LOC. Refuse temptation to "improve while at it" (Karpathy Surgical Changes strict).

---

## §3 Post-BATCH

```powershell
npm run test:run                          # expect: 4522 PASS preserved
git tag post-batch-a1-text-swaps-wave-a
git push origin main
git push origin pre-batch-a1-text-swaps-wave-a post-batch-a1-text-swaps-wave-a
```

Update `_progress.md`:
- BATCH_A1 LANDED 2026-XX-XX
- 25 tasks closed
- Findings closed: ~70 individual text findings (one task per screen aggregates 3-6 findings)
- Next BATCH per dependency: A2 (Wave B text swaps) — parallel-safe; OR Cluster B / C / D BATCH per Daniel orchestration

---

## §4 Fail-stop

Per task fail:
- `git stash`
- Mark task FAILED in `## Failures` below
- Skip to next — DO NOT abort BATCH
- Continue A002 → A003 → ... → A025

### Failures

(none yet — execution-time append)

---

🦫 **BATCH_A1 — Text Swaps Wave A. 25 tasks. ~3-4h Opus continuous. Parallel-safe Session α. Closes ~70 individual text findings via per-screen aggregation.**
