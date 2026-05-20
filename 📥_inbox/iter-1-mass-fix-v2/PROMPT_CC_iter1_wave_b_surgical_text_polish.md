# PROMPT_CC iter 1 V2 — Wave B — Surgical text + tokens + Pass 4 polish

**Model:** Opus 4.7 EXCLUSIVELY. Verify `claude --version`.
**Stop trigger UNIQUE:** Daniel manual STOP.
**Authority:** Daniel CEO directive 2026-05-20 evening — V2 design LANDED. This is Wave B.
**Vault:** `C:\Users\Daniel\Documents\salafull\` (Windows ACASĂ).
**Branch:** main.
**Pre-req:** Wave A LANDED (or hybrid parallel-safe per `_DAG.md §2` — collision risk LOW).

---

## §0 Context summary

You are executing **Wave B** of Iter 1 Mass Fix V2 — Surgical text swaps mockup-verbatim per-screen + Pass 4 polish per-file (font-weight + padding + radius + gap + margin + icon) + emoji traffic-light + a11y surgical + JSDoc + misc.

**Source-of-truth backlog:** `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md §B` (150 tasks B001-B150).

**Strategic plan:** `📥_inbox/iter-1-mass-fix-v2/ORCHESTRATOR.md`.

**Tasks count:** ~150 atomic (mostly S surgical). ETA Opus continuous: ~25-30h.

---

## §1 Pre-flight Wave B (execute ONCE at start)

```bash
# Verify Opus model
claude --version

cd C:/Users/Daniel/Documents/salafull
git status                          # expect clean (post-Wave-A LANDED IF sequential)
git log --oneline -10               # confirm Wave A commits if sequential
git branch --show-current           # expect main
npm run test:run 2>&1 | tail -10    # expect 4290+ PASS

git tag pre-wave-b-iter1-v2-2026-05-XX
git push origin pre-wave-b-iter1-v2-2026-05-XX

cat 📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md | grep -A 250 "## §B WAVE B"
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-b-pre.json
```

---

## §2 Per-task execution loop (150 iterations B001 → B150)

Per task in `_MASTER_BACKLOG.md §B`:

```
STEP 1 — Read source-finding D008 verbatim
  Most B-Wave sources from 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-*.md
  Pass 4 polish from findings-pass4-polish-backlog.md
  Pass 2 sub-component from findings-pass2-*.md
  Read finding section 30-line context

STEP 2 — Read prod file head 50 lines (File column)

STEP 3 — Grep audit-fix pattern → IF MATCH NO-OP SKIP
  Less critical for Wave B (most B tasks NOT in Phase 7 LANDED scope — text/token surface)
  Still mandatory per D029 stale-baseline lesson

STEP 4 — Skip gitnexus impact for trivial S tasks (1-3 LOC text/token changes)
  Only invoke gitnexus_impact for B076-B085 (security/hygiene) + B116-B130 (JSDoc multi-file)

STEP 5 — Edit prod file surgical (1-5 LOC typical)
  Romanian no-diacritics MANDATORY per D-LEGACY-064
  Tailwind utility class swap (font-semibold → font-bold etc.)
  Arbitrary value fix (rounded-2xl → rounded-[22px] etc.)
  NU refactor adjacent code

STEP 6 — gitnexus_detect_changes IF M effort tasks (B021 + B026+ + B116+)

STEP 7 — Run relevant tests IF tests touched (rare in Wave B — most are pure UI surface)
  Snapshot tests may need update — RTL test:update if visual snapshot

STEP 8 — Atomic commit per task
  git add <file>
  git commit -m "fix(wave-b-<id>): <short desc> (<source>) [SC]"
  # All Wave B = SC Surgical Changes Karpathy primary

STEP 9 — Update _progress.md row PENDING → LANDED <sha>

STEP 10 — Continue
```

---

## §3 Detailed task groups (150 tasks B001-B150)

See `_MASTER_BACKLOG.md §B` for full table.

**§B.1 Text swaps mockup-verbatim per-screen (B001-B025, 25 tasks):**
Per-screen aggregated text fidelity. Each screen Antrenor/Splash/Auth/Progres/Istoric/Cont/EnergyCheck/EnergyCause/WorkoutPreview/Workout/PostRpe/PostSummary/etc. = 1 task closing 3-5 individual findings per screen. ~70 individual findings closed total.

**§B.2 Token alignment Pass 4 polish per-file (B026-B075, 50 tasks):**
- B026-B040 (15 tasks): font-weight font-semibold → font-bold sweep
- B041-B052 (12 tasks): padding-asymmetric mockup-aligned sweep
- B053-B062 (10 tasks): rounded radius alignment arbitrary values
- B063-B075 (13 tasks): margin + gap + icon size NIT batch

**§B.3 Surgical security/hygiene (B076-B085, 10 tasks):**
PWA icon optimize + remove console.log debug + delete dead App.tsx + persona class hoist + manifest verify + AuthCallback verify + telemetry counter dead-flag + brand token consolidation + misc dead code + @layer base wrap.

**§B.4 Emoji + a11y + visual regression + math NIT (B086-B095, 10 tasks):**
Emoji traffic-light 🟢🟡🔴 prefix 3 locations + aria-label icon-only buttons + form autocomplete attrs + tap target audit + T&C timestamp persist verify + Medical Disclaimer timestamp verify + visual regression spot-check 5 screens + engine math NIT fixes batch.

**§B.5 Pass 2 sub-component text (B096-B115, 20 tasks):**
20 sub-component text swaps aggregated (Calendar7Day + PRWallRecent + AlertsBanner + PatternsBanner + StatsGrid + ReadinessVerdict + NutritionInline + TDEEStrip + FatigueStrip + InactivityPrompt + ExitConfirmSheet + ReactivateCard + ResumeSessionCard + MedicalDisclaimerModal + PRNotificationBanner + 5 misc).

**§B.6 JSDoc + comment hygiene (B116-B130, 15 tasks):**
15 file comment cleanup batch (Zustand JSDoc + adapter file headers + dead-comment removes + ASCII divider standardize + ADR refs current).

**§B.7 Misc surgical (B131-B150, 20 tasks):**
20 catch-all LOW/NIT surgical batch (icon size variants + animation timing + alignment + format consistency).

---

## §4 Wave B-specific guidance

### §4.1 Romanian no-diacritics MANDATORY (D-LEGACY-064)

All UI strings + tests + commits = NO Romanian diacritics (ă/â/î/ș/ț). Use plain ASCII Romanian (`a/i/s/t`).

Examples:
- "săptămână" → "saptamana"
- "antrenament" → "antrenament" (no diacritics anyway)
- "ușor / potrivit / greu" → "usor / potrivit / greu"
- "comenzi periculoase" → "comenzi periculoase"

Verify per commit `grep -E "[ăâîșțÂÎȘȚÔ]" <file>` returns empty.

### §4.2 Tailwind utility-only — NO custom CSS additions unless mockup explicit

Wave B = Surgical Changes. Use existing Tailwind classes + arbitrary values `[]`. NU add new global.css rules.

### §4.3 Snapshot tests may need batch update

After 25+ text changes, run `npm run test:update` to refresh snapshot baselines. Single commit `chore(wave-b): snapshot baseline post-text-swap batch` separate from atomic feature commits.

### §4.4 Pass 4 polish reference

`📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass4-polish-backlog.md` enumerates ~60 LOW/NIT polish findings — Wave B aggregates per-file (NU per-finding).

Pattern: 1 file = 1 commit batching all LOW/NIT findings for that file. Cite multiple finding IDs in commit body.

---

## §5 Fail-stop per task

Same as Wave A §4. Stash + mark FAILED in _progress.md + continue.

---

## §6 Post-Wave B completion

```bash
npm run test:run 2>&1 | tail -20
npm run typecheck 2>&1 | tail -10
npm run build 2>&1 | tail -10
npx gitnexus@latest analyze --quiet --output 📤_outbox/gitnexus-wave-b-post.json

git tag post-wave-b-iter1-v2-2026-05-XX
git push origin post-wave-b-iter1-v2-2026-05-XX
git push origin main

# Write Wave B LANDED report
cat > 📤_outbox/LATEST.md << 'EOF'
# Wave B LANDED — Iter 1 Mass Fix V2 — Surgical text + Pass 4 polish

## Status
COMPLETE (or PARTIAL)

## Tasks executed
- B001-B150: <N LANDED> / <M NO-OP> / <K FAILED>
- Individual findings closed: ~205 (per-screen text + per-file polish aggregation)

## Build + Tests
- Tests: <X> PASS, <Y> snapshot updates
- Typecheck: 0 errors
- Build: OK

## Commits + Push
- Commits Wave B: ~150 atomic + 1 snapshot batch
- Tag pre/post: pre-wave-b-iter1-v2 / post-wave-b-iter1-v2
- Push: origin main + tags ✓

## Issues
- <enumerate failed tasks>

## Next action
- Trigger Wave C (paste PROMPT_CC_iter1_wave_c_components_simplicity.md) OR Wave D if Wave C already LANDED parallel
EOF
```

---

## §7 Karpathy Wave B axis

**Primary:** SC (Surgical Changes) ~95% of Wave B.
**Secondary:** SF (Simplicity First) for B076 dead-code-removes + B078 delete App.tsx + B084 misc dead code.

NO TBC, NO GD în Wave B. If a task feels TBC/GD scope, mark FAILED + escalate to Wave C/D backlog.

---

## §8 Anti-recurrence (mandatory per task)

- D008 source verify
- D029 stale-baseline grep audit-fix → NO-OP IF LANDED
- D-LEGACY-064 Romanian no-diacritics
- D031 push manual final at end-of-Wave
- D041 anti-inflation reporting
- Karpathy SC explicit per commit

---

🦫 **Wave B — START.** Read `_MASTER_BACKLOG.md §B`. Execute 150 tasks B001-B150 per §2 loop. Fail-stop per task only. Push manual final. Write LATEST.md report. Daniel reviews → trigger Wave C or D.
