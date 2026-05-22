---
forensics-date: 2026-05-22
bundle-count: 9
session: 14-agent parallel work 13:40-14:07 UTC+3
root-cause: D049 violation pattern — commit subject describes ONE concern, diff contains MANY unrelated concerns from interleaved concurrent agents
parent-bug: 21f0d204 (ghost-metadata, shipped pre-D049)
authority: read-only forensics — ZERO writes to src/, ZERO `git notes add` execution (Daniel approves verbatim copy-paste below)
---

# Mega-Bundle Forensics — 14-Agent Parallel Session Recovery

## Methodology

For each suspect SHA: `git show --stat` (files touched) + `git show` (full diff) →
classify changes into atomic concerns by feature/file boundary. Generate
verbatim `git notes add -m "..."` proposal Daniel can copy-paste so future
`git blame` / `git bisect` surfaces hidden fixes.

D049 LOCKED V1 PROC introduced **after** this session (b6869516 commit itself
contains the bundle it warns against — meta-irony preserved verbatim).
Cannot rewrite shipped history (D031 invariant). Notes = archaeology
breadcrumbs.

---

## Bundle 1 — b918e76c — T1 deriveSessionRating

**Claimed subject:** `feat(parity-F-istoric-01/T1): add deriveSessionRating pure util [GD]`

**Files modified:** 4 (+142 / -55)

**Actual atomic concerns:**

1. **T1 F-istoric-01 (claimed):** `src/react/lib/sessionRating.ts` — NEW pure util file (correctly matches subject).
2. **MED-4 BottomNav gap fix (hidden):** `src/react/components/BottomNav.tsx` — `gap-0.5` → `gap-2` for icon row spacing.
3. **F-progres-07 Alerte azi banner (hidden):** `src/react/routes/screens/progres/Progres.tsx` — full integration of `AlertsBanner` + `getCoachToday` aggregate, useEffect coach loader, "Alerte azi" h2 label.
4. **F-progres-07 test coverage (hidden):** `src/react/__tests__/screens/progres/Progres.test.tsx` — 3 new test cases (banner conditional render, content match, position above CTA) + vi.mock setup for `coachDirectorAggregate`.

**Proposed git notes annotation (verbatim copy-paste):**

```bash
git notes add b918e76c -m "MEGA-BUNDLE recovery (D049 retro):
- T1 F-istoric-01 (subject match): src/react/lib/sessionRating.ts NEW
- MED-4 BottomNav gap-0.5->gap-2: src/react/components/BottomNav.tsx
- F-progres-07 Alerte azi banner integration: src/react/routes/screens/progres/Progres.tsx
- F-progres-07 test coverage: src/react/__tests__/screens/progres/Progres.test.tsx
Root cause: 14-agent parallel session interleave 2026-05-22.
Pre-D049 commit subject discipline."
```

---

## Bundle 2 — f6dc24b7 — T5 CalendarHeatmap scaffold

**Claimed subject:** `feat(parity-F-istoric-01/T5): CalendarHeatmap scaffold + month nav [GD]`

**Files modified:** 8 (+367 / -12)

**Actual atomic concerns:**

1. **T5 F-istoric-01 (claimed):** `src/react/components/Istoric/CalendarHeatmap.tsx` NEW — scaffold + month state + chevron nav + day labels (correctly matches subject).
2. **F-antrenor-03 ObiectivSelector (hidden, ~210 LOC):** `src/react/components/Antrenor/ObiectivSelector.tsx` NEW + test file NEW (102 cases) + integration into `Antrenor.tsx` (6-row Programe goal picker).
3. **EnergyCheck emoji refactor (hidden):** `src/react/routes/screens/antrenor/EnergyCheck.tsx` — 💪/⚡/😊/🌱/😴 → GREEN/YELLOW/RED Unicode constants (traffic-light parity).
4. **MED-1 Sentry PII strip JSON-quoted uid (hidden):** `src/util/sentry.js` regex extension `["':=\s/]+` (was `[=:\s/]+`) for breadcrumb data leak fix + 2 test files: `sentryBeforeSend.test.js` +1 case, `sentryPiiStrip.test.js` +5 cases including regression guards.

**Proposed git notes annotation (verbatim copy-paste):**

```bash
git notes add f6dc24b7 -m "MEGA-BUNDLE recovery (D049 retro):
- T5 CalendarHeatmap scaffold (subject match): src/react/components/Istoric/CalendarHeatmap.tsx NEW
- F-antrenor-03 ObiectivSelector component: src/react/components/Antrenor/ObiectivSelector.tsx NEW + test NEW + Antrenor.tsx wire
- EnergyCheck emoji refactor traffic-light: src/react/routes/screens/antrenor/EnergyCheck.tsx
- MED-1 Sentry JSON-quoted uid PII strip regex fix: src/util/sentry.js + 2 test files
Root cause: 14-agent parallel session interleave 2026-05-22."
```

---

## Bundle 3 — 2aff155b — T6 grid + Monday offset

**Claimed subject:** `feat(parity-F-istoric-01/T6): render grid + Monday offset + tier paint [GD]`

**Files modified:** 3 (+100 / -3)

**Actual atomic concerns:**

1. **T6 F-istoric-01 (claimed):** `src/react/components/Istoric/CalendarHeatmap.tsx` — grid render + Monday offset + tier paint (correctly matches subject).
2. **MED-2 webview X-rebrand detection (hidden):** `src/react/lib/webviewDetect.ts` + test file — adds `com.twitter.android` package marker + `XApp/` token + anchor `twitterandroid` (vs broad `twitter && android` false-positive).

**Proposed git notes annotation:**

```bash
git notes add 2aff155b -m "MEGA-BUNDLE recovery (D049 retro):
- T6 CalendarHeatmap grid render (subject match): src/react/components/Istoric/CalendarHeatmap.tsx
- MED-2 webview X-rebrand detection: src/react/lib/webviewDetect.ts + __tests__/lib/webviewDetect.test.ts
Root cause: 14-agent parallel session interleave 2026-05-22."
```

---

## Bundle 4 — 52638b9b — T7 5-tier legend row

**Claimed subject:** `feat(parity-F-istoric-01/T7): CalendarHeatmap 5-tier legend row [GD]`

**Files modified:** 5 (+119 / -49)

**Actual atomic concerns:**

1. **T7 F-istoric-01 (claimed):** `src/react/components/Istoric/CalendarHeatmap.tsx` — 5-tier legend row Greu/Normal/Usor/Recuperare/Zi libera (correctly matches subject).
2. **MED-3 AaFrictionModal focus trap (hidden):** `src/react/components/AaFrictionModal.tsx` — Tab/Shift+Tab cycle between Pauza (first) and Continui (last), preserve LOCK 9 no-Escape + test file expanded with 3 new focus-trap cases + comment cleanup.
3. **MED-2 webview revert (hidden, REGRESSION):** `src/react/lib/webviewDetect.ts` + test file — REVERTS X-rebrand detection from Bundle 3 above back to `twitter && android` broad pattern (removes `com.twitter.android` + `XApp/` + 3 test cases). This is a **silent revert** of work done 1 minute earlier in 2aff155b.

**Proposed git notes annotation:**

```bash
git notes add 52638b9b -m "MEGA-BUNDLE recovery (D049 retro):
- T7 CalendarHeatmap legend (subject match): src/react/components/Istoric/CalendarHeatmap.tsx
- MED-3 AaFrictionModal Tab focus trap: src/react/components/AaFrictionModal.tsx + test +3 cases
- WARNING — silent revert of MED-2 webview X-rebrand (Bundle 3 2aff155b):
  src/react/lib/webviewDetect.ts loses com.twitter.android + XApp/ patterns
  + __tests__/lib/webviewDetect.test.ts loses 3 X-rebrand cases.
  Root cause: 14-agent parallel session race condition 2026-05-22.
  Investigate if X-rebrand detection should be restored pre-Beta."
```

---

## Bundle 5 — d8ff7b01 — T9 today highlight + future-date muted

**Claimed subject:** `feat(parity-F-istoric-01/T9): today highlight + future-date muted [GD]`

**Files modified:** 6 (+249 / -30)

**Actual atomic concerns:**

1. **T9 F-istoric-01 (claimed):** `src/react/components/Istoric/CalendarHeatmap.tsx` — isToday ring-2 + isFuture opacity-50 + aria-label suffixes (correctly matches subject, ~13 LOC).
2. **F-pass2-restoverlay-01 SVGCountdownRing (hidden, ~200 LOC):** `src/react/components/Workout/SVGCountdownRing.tsx` NEW + test NEW (17 cases — SVG ring + dashoffset math + CSS vars + reduced-motion guard) + `RestOverlay.tsx` migration from text-6xl to SVG ring + `Workout.tsx` adds `restInitialSec` state + 2 setters.
3. **SubHeader migration SettingsAbout (hidden):** `src/react/routes/screens/cont/SettingsAbout.tsx` — replaces inline `<header>` JSX with `<SubHeader>` import (part of the smeared SubHeader rollout that ALSO sits in bundle 9 b6869516).

**Proposed git notes annotation:**

```bash
git notes add d8ff7b01 -m "MEGA-BUNDLE recovery (D049 retro):
- T9 today/future cell state (subject match): src/react/components/Istoric/CalendarHeatmap.tsx ~13 LOC
- F-pass2-restoverlay-01 SVG countdown ring: src/react/components/Workout/SVGCountdownRing.tsx NEW + test NEW (17 cases) + RestOverlay.tsx + Workout.tsx (~200 LOC)
- SubHeader migration SettingsAbout: src/react/routes/screens/cont/SettingsAbout.tsx
Root cause: 14-agent parallel session interleave 2026-05-22."
```

---

## Bundle 6 — bdc7a28d — Parity-emoji PostRpe

**Claimed subject:** `feat(parity-emoji): PostRpe RPE traffic-light indicators [GD]`

**Files modified:** 2 (+31 / -29)

**Actual atomic concerns:**

1. **PostRpe parity-emoji (claimed):** `src/react/routes/screens/antrenor/PostRpe.tsx` — RPE traffic-light indicators (correctly matches subject).
2. **SubHeader migration SettingsFaq (hidden):** `src/react/routes/screens/cont/SettingsFaq.tsx` — replaces inline `<header>` JSX with `<SubHeader>` import (smeared SubHeader rollout).

**Proposed git notes annotation:**

```bash
git notes add bdc7a28d -m "MEGA-BUNDLE recovery (D049 retro):
- PostRpe RPE traffic-light (subject match): src/react/routes/screens/antrenor/PostRpe.tsx
- SubHeader migration SettingsFaq: src/react/routes/screens/cont/SettingsFaq.tsx
Root cause: 14-agent parallel session interleave 2026-05-22."
```

---

## Bundle 7 — 22e2cf91 — T12 wire CalendarHeatmap + RatingsStrip

**Claimed subject:** `feat(parity-F-istoric-01+03/T12): wire CalendarHeatmap + RatingsStrip into Istoric [GD]`

**Files modified:** 7 (+50 / -78)

**Actual atomic concerns:**

1. **T12 F-istoric-01+03 (claimed):** `src/react/routes/screens/istoric/Istoric.tsx` — 8 LOC additive insert: `CalendarHeatmap` + `RatingsStrip90Day` import + render between Stats and PR Wall (correctly matches subject — and only 1 of 7 files actually relates to subject).
2. **SubHeader migration sweep 6 sub-screens (hidden, dominates diff):** SettingsPrefs / SettingsPrivacy / SettingsProfile / SettingsSubscription / SettingsSupport / SettingsTerms — all replace inline `<header>` JSX with `<SubHeader>` import. This is the bulk of the diff (~120 LOC delta) yet is invisible from the commit subject.

**Proposed git notes annotation:**

```bash
git notes add 22e2cf91 -m "MEGA-BUNDLE recovery (D049 retro):
- T12 Istoric wire CalendarHeatmap + RatingsStrip (subject match): src/react/routes/screens/istoric/Istoric.tsx 8 LOC
- SubHeader migration 6 screens (hidden, dominates diff ~120 LOC):
  - src/react/routes/screens/cont/SettingsPrefs.tsx
  - src/react/routes/screens/cont/SettingsPrivacy.tsx
  - src/react/routes/screens/cont/SettingsProfile.tsx
  - src/react/routes/screens/cont/SettingsSubscription.tsx
  - src/react/routes/screens/cont/SettingsSupport.tsx
  - src/react/routes/screens/cont/SettingsTerms.tsx
Root cause: 14-agent parallel session interleave 2026-05-22.
NOTE: Subject claims F-istoric scope but 6/7 files are SubHeader Pass 3 P1."
```

---

## Bundle 8 — b6869516 — D049 SSOT (META-BUNDLE)

**Claimed subject:** `doc(SSOT-D049): commit subject diff alignment verify mandatory anti-21f0d204 ghost-metadata [DOC]`

**Files modified:** 15 (+248 / -157)

**Actual atomic concerns:**

1. **D049 SSOT doc (claimed, ABSENT from diff):** The commit subject claims a DECISIONS.md append for D049 but **`DECISIONS.md` is NOT in the file list at all** — only `.size-limit.json` was touched. Meta-irony: a commit warning against ghost-metadata IS ghost-metadata.
2. **size-limit vendor-icons ratchet (hidden):** `.size-limit.json` — `vendor (icons)` limit 5.5 KB → 6 KB (silent bundle-size budget bump).
3. **SubHeader extraction (hidden, was the actual main work):** `src/react/components/SubHeader.tsx` NEW + `src/react/__tests__/components/SubHeader.test.tsx` NEW (95 LOC, 9 test cases).
4. **SubHeader migration 12 sub-screens (hidden, dominates diff):** FinishEarlyConfirm / DeleteAccountConfirm / LogoutConfirm / RedoOnboardingConfirm / ResetCoachConfirm / ResetDataConfirm / SchimbaFazaConfirm / SettingsAppearance / SettingsDanger / SettingsExport / SettingsNotifications / WeightLogList — each loses inline `<header>` JSX in favor of `<SubHeader>` import.

**Proposed git notes annotation:**

```bash
git notes add b6869516 -m "MEGA-BUNDLE recovery (D049 retro) — META-IRONY commit:
- D049 SSOT doc (subject CLAIMS but ABSENT from diff): DECISIONS.md NOT touched.
  Real D049 append landed elsewhere or never committed — investigate.
- size-limit vendor-icons ratchet 5.5KB->6KB: .size-limit.json
- SubHeader component extraction (real main work): src/react/components/SubHeader.tsx NEW + test NEW (9 cases)
- SubHeader migration 12 sub-screens (hidden, dominates diff):
  - src/react/routes/screens/antrenor/FinishEarlyConfirm.tsx
  - src/react/routes/screens/cont/DeleteAccountConfirm.tsx (danger flag)
  - src/react/routes/screens/cont/LogoutConfirm.tsx
  - src/react/routes/screens/cont/RedoOnboardingConfirm.tsx
  - src/react/routes/screens/cont/ResetCoachConfirm.tsx
  - src/react/routes/screens/cont/ResetDataConfirm.tsx
  - src/react/routes/screens/cont/SchimbaFazaConfirm.tsx
  - src/react/routes/screens/cont/SettingsAppearance.tsx
  - src/react/routes/screens/cont/SettingsDanger.tsx
  - src/react/routes/screens/cont/SettingsExport.tsx
  - src/react/routes/screens/cont/SettingsNotifications.tsx
  - src/react/routes/screens/progres/WeightLogList.tsx
Root cause: 14-agent parallel session interleave 2026-05-22.
PRIORITY: verify if D049 LOCKED V1 entry actually appended to DECISIONS.md
or if subject is fabricated (would be ghost-metadata recursion)."
```

---

## Bundle 9 (additional finding) — Cross-cutting SubHeader smear summary

The SubHeader Pass 3 P1 refactor (1 NEW component + ~20 sub-screen migrations) is
**fragmented across 3 unrelated parity commits** (d8ff7b01 + bdc7a28d + 22e2cf91)
**plus** the SubHeader-titled commit (b6869516) that doesn't actually advertise itself.

This means future `git log --oneline -- src/react/routes/screens/cont/SettingsFaq.tsx`
will surface `feat(parity-emoji): PostRpe RPE traffic-light indicators` as the
SubHeader migration provenance — a maximally misleading blame result.

**Sub-screens hit + the commit that smuggled their SubHeader migration:**

| Sub-screen | Migration commit | Commit subject (misleading) |
|---|---|---|
| SettingsAbout | d8ff7b01 | T9 today highlight + future-date muted |
| SettingsFaq | bdc7a28d | PostRpe RPE traffic-light indicators |
| SettingsPrefs / Privacy / Profile / Subscription / Support / Terms | 22e2cf91 | T12 wire CalendarHeatmap + RatingsStrip |
| FinishEarlyConfirm + 11 cont/* screens | b6869516 | doc(SSOT-D049) ghost-metadata anti |

---

## Summary

- **Bundle count:** 8 mega-bundles + 1 cross-cutting smear pattern (SubHeader Pass 3 P1)
- **Hidden atomic concerns inside bundles:** ~17 distinct features/fixes invisible from commit subjects, spanning:
  - 4 audit fixes (MED-1 Sentry / MED-2 webview / MED-3 focus trap / MED-4 BottomNav gap)
  - 4 parity features (F-progres-07 banner / F-antrenor-03 ObiectivSelector / F-pass2-restoverlay-01 SVG ring / EnergyCheck emoji)
  - 1 SubHeader Pass 3 P1 refactor smeared across 4 unrelated commits
  - 1 size-budget ratchet
  - 1 SILENT REGRESSION REVERT (MED-2 webview X-rebrand)
  - 1 missing claimed work (D049 DECISIONS.md append not in b6869516 diff)
- **Test files smuggled:** 5 (Progres + ObiectivSelector + sentryPiiStrip + sentryBeforeSend + webviewDetect + AaFrictionModal + SVGCountdownRing + SubHeader)
- **Top 3 most-impactful bundles for archaeology:**
  1. **b6869516** — META-IRONY: D049 subject without D049 in diff + 13 hidden files including SubHeader.tsx scaffold (1 NEW component + 12 sub-screen migrations buried). Worst archaeology trap.
  2. **f6dc24b7** — Largest LOC bundle (+367) with 4 distinct concerns smuggled (T5 + ObiectivSelector ~210 LOC + EnergyCheck emoji + MED-1 Sentry).
  3. **52638b9b** — Contains a SILENT REGRESSION REVERT of MED-2 webview detection done 84 seconds earlier (2aff155b) — production behavior regressed but commit subject hides it.

---

## D050 proposal — Mega-Bundle Recovery via git notes

**Status:** PROPOSAL (Daniel approve to LOCK V1)

**Trigger:** D049 LOCKED V1 (b6869516) introduces pre-commit subject/diff alignment but cannot retroactively rewrite shipped history (D031 invariant — branch is 33+ commits ahead origin).

**Rule:** When forensic audit identifies a shipped mega-bundle commit (subject describes ONE concern, diff contains MANY unrelated atomic concerns), append a `git notes` annotation **per affected SHA** listing:
- Subject claim verification (match / mismatch / absent-from-diff)
- Atomic concerns enumeration (file paths grouped by concern)
- Root cause (parallel agent interleave / time-pressure squash / silent revert)
- Investigation priorities (regressions / missing claimed work)

**Authority:** Annotations are append-only metadata — they survive `git push` and `git fetch` when explicitly synced via `git push origin refs/notes/*` (which Daniel triggers manually per D031 invariant).

**Surfacing:** `git log --show-notes` + `git blame` (via `--show-name`) make notes visible during archaeology without disrupting commit hashes.

**File location for D050 proposal:** This document. Daniel approve → append to `DECISIONS.md` as D050 LOCKED V1 PROC entry.

---

End of forensics report. ZERO writes to `src/`. ZERO `git notes` execution.
Verbatim copy-paste snippets above are inert until Daniel runs them.
