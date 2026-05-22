# Audit §47-H2 — Engine output → UI consume wiring F2/F4/F6/F7/F8

**Status:** AUDIT-COMPLETE
**Date:** 2026-05-23
**Authority:** §47.10 audit-nuclear-2026-05-19 closure
**Scope:** Verify Engine SoT → adapter → UI passive consume invariant. UI MUST NOT hardcode duplicate engine wording (anti-recurrence per D-LEGACY-097 + §47.1 Engine SoT Wording Authority).
**Cross-ref:** ADR-ENGINE-MATH-LOCKED-VALUES.md + DECISIONS.md §D024 LOCKED V1 PERMANENT (autonomous compose) + 03-decisions/_FROZEN/ADR_OUTPUT_TO_UI_AUTHORITY_V1.md

---

## Audit method

For each feature (F2/F4/F6/F7/F8):
1. Identify engine emit site (`src/engine/*` or aggregate composer in `src/react/lib/*Aggregate.ts`).
2. Identify UI consume site (`src/react/components/Antrenor/*` or `src/react/components/Progres/*`).
3. Confirm UI renders engine output passively (`{output.label}` / `{output.text}` / `{output.score}`) WITHOUT hardcoded duplicate string.
4. Flag any drift: UI literal that duplicates engine wording, OR UI computation that should be engine-side.

---

## §1 — F4 Readiness Verdict

**Engine emit:** `src/engine/readiness.js#getReadinessVerdict` → `{ label, color, volumeMultiplier, canPR }`
**Adapter:** `src/react/lib/engineWrappers.ts#getReadiness` → `ReadinessOutput { score, label, color, volumeMultiplier, canPR }`
**UI consume:** `src/react/components/Antrenor/ReadinessVerdict.tsx:22-31`

```tsx
<span style={{ color: readiness.color }}>{readiness.label}</span>
<span>({readiness.score}/100{readiness.canPR ? ' - poti incerca PR' : ''})</span>
```

**Verdict:** CLEAN. UI passive consume. Color CSS var ref engine-emitted. `canPR` boolean controls a UI suffix string — `' - poti incerca PR'` is UI-side. This is the ONLY UI literal in F4 wiring. Acceptable per audit posture: boolean→suffix is presentational concern, not duplicate engine wording.

**Anti-drift guard:** if engine adds `prHintSuffix: string` field in future, UI MUST switch to engine emit. Document as ADR-097 amendment when triggered.

---

## §2 — F6 PR Wall

**Engine emit:** `src/react/lib/prHistoryAggregate.ts#getPRHistoryAll` → `PRRecord[]` with `{ exerciseId, exerciseName, kg, reps, sessionTs, oneRMEstimate }`
**Adapter:** `src/react/lib/coachDirectorAggregate.ts:68-73` (slice top 3 + sort)
**UI consume:** `src/react/components/Antrenor/PRWallRecent.tsx:29-32`

```tsx
<span>{pr.exerciseName}</span>
<span>{pr.kg} kg x {pr.reps} (~{pr.oneRMEstimate} kg 1RM)</span>
```

**Verdict:** CLEAN. UI passive consume. `oneRMEstimate` engine-emitted via engineWrappers.ts:184 (Epley formula closed-form). UI does not duplicate 1RM compute.

**Note:** `'Recorduri recente'` h2 heading + `'kg x'` formatter are UI-side presentation. Acceptable: heading is section label not engine output; formatter is units/punctuation layout concern.

---

## §3 — F7 Coach Director (CoachToday + CoachRest cards)

**Engine emit:** `src/react/lib/coachDirectorAggregate.ts#getCoachToday` → `CoachTodayOutput` 8-field bundle (readiness + fatigue + plannedWorkout + isRestDay + patternsBanner + prWallRecent + alerts + restReason)
**UI consume:**
- `src/react/components/Antrenor/CoachTodayCard.tsx` — renders coach today bundle
- `src/react/components/Antrenor/CoachRestCard.tsx` — renders rest day variant
- `src/react/components/Antrenor/AlertsBanner.tsx` — renders `alerts[].text`
- `src/react/components/Antrenor/PatternsBanner.tsx:37` — renders `b.text` passive

**Verdict (CoachTodayCard sub-wiring):** CLEAN. CoachTodayCard delegates child components for each engine field. PatternsBanner `<p>{b.text}</p>` exact pattern engine→UI passive (PatternsBanner.tsx:37).

**Lagging signal extension (§F-pass2-coachtoday-04 HIGH-EPSILON LANDED 2026-05-22 commit `321d1a06`):** wire via `getLaggingSignal()` in engineWrappers.ts:647-677 emits RO sentence; UI passive consume. Verified engine-side composition of sentence (e.g., `${label} sub-volum 2 sapt - focus azi pe sesiune.`) → ANTI-DRIFT compliant.

**Override link (§F-pass2-coachtoday-06):** `'Vrei altceva azi?'` UI literal in CoachTodayCard.tsx. ACCEPTABLE — this is a navigation affordance label not engine semantic message. Cross-ref §F-pass2-coachtoday-06 mockup verbatim.

---

## §4 — F2 Last Session Memory

**Engine emit:** `src/react/stores/workoutStore.ts` (last session summary slice) + session history walk
**Adapter:** read-only access via `useWorkoutStore.getState().sessionsHistory`
**UI consume:** Indirect — F2 LastSessionMemory is currently rendered as part of CoachTodayCard context OR PR Wall (cross-feature consume).

**Verdict:** PARTIAL — F2 as standalone surface NOT currently rendered as separate Antrenor card (per PRIMER §2 "KEEP verbatim" but D031 Beta scope shows current Antrenor uses CoachTodayCard as primary surface). Last session memory is implicit via PRWallRecent recent-3 + AlertsBanner.

**Disposition:** F2 deferred surface — UI consume IS via PR Wall + alerts composers. Not a drift; an architecture choice per Phase 6 Option B composer paradigm. Mark as VERIFY-PASS (no UI hardcode duplicate; surface integration deferred to feature-flag/post-Beta surface activation).

---

## §5 — F8 Streak Counter

**Engine emit:** `src/react/stores/workoutStore.ts` (sessionsHistory.length + sequential days computation) — semantic streak compute is store-side, not engine-side.
**Adapter:** `streak` prop passed direct from store to StatsGrid via Antrenor.tsx parent.
**UI consume:** `src/react/components/Antrenor/StatsGrid.tsx:26-29`

```tsx
<div className="text-2xl font-bold">{streak}</div>
<div className="text-xs">{streak === 1 ? 'zi' : 'zile'}</div>
```

**Verdict:** CLEAN with caveat. UI passive consume of numeric `streak`. The string `'zi' / 'zile'` is UI-side Romanian plural — ACCEPTABLE per i18n pattern (engine emits scalar count, UI renders locale-aware plural).

**Anti-drift guard:** if engine evolves to emit `streakDisplayLabel: string`, UI MUST switch. Document if triggered.

---

## §6 — Cross-feature: PatternsBanner + AlertsBanner

**Engine emit (Patterns):** `engineWrappers.ts#getPatternsBanner` lines 482-526 emits `PatternBanner[]` with `{ id, severity, text }`.
**UI consume:** PatternsBanner.tsx:37 `<p>{b.text}</p>` — verbatim render.

**Engine emit (Alerts):** `engineWrappers.ts#getProactiveAlerts` lines 553-572 emits `ProactiveAlert[]` with `{ id, text, severity }`.
**UI consume (AlertsBanner.tsx):** verified passive `<p>{alert.text}</p>` consume.

**Verdict:** CLEAN. Both banners are exemplar Engine SoT → UI passive consume. UI does NO string composition; sentence emitted entirely engine-side.

**Audit literal scan results (engineWrappers.ts current state):**

| Pattern | Engine literal | UI literal | Drift? |
|---------|---------------|------------|--------|
| STAGNATION | ``Stagnare ${weeks} saptamani. Coach ajusteaza intensitatea.`` (line 491) | none — passive consume | NO |
| LOW_ADHERENCE | `'Adherenta scazuta saptamana asta. Reia ritmul cu o sesiune scurta.'` (line 517) | none — passive consume | NO |
| Lagging | ``${label} sub-volum ${weeks} sapt - focus azi pe sesiune.`` (line 672) | none — passive consume | NO |
| ProactiveAlerts | engine-side via `runProactiveChecks` | none — passive consume | NO |

---

## §7 — Findings summary

**Total features audited:** 5 (F2 + F4 + F6 + F7 + F8) + 2 cross-features (PatternsBanner + AlertsBanner) = 7 wiring paths.

**Drift incidents found:** 0.

**Verify-PASS:**
- F4 ReadinessVerdict (engine emits all critical fields incl. color + label).
- F6 PRWallRecent (engine emits all numeric + name fields + oneRMEstimate).
- F7 CoachTodayCard sub-wiring (delegates to child components; child components passive consume).
- F8 StatsGrid (scalar streak + UI-side i18n plural — acceptable).
- PatternsBanner + AlertsBanner (exemplar Engine SoT → UI passive).

**Verify-PARTIAL:**
- F2 LastSessionMemory (no standalone surface; consumed indirect via PRWallRecent + alerts — architecture choice not drift).

**Acceptable UI literals (NOT drift):**
- `' - poti incerca PR'` suffix in ReadinessVerdict.tsx (boolean→suffix presentational).
- `'Recorduri recente'` h2 heading in PRWallRecent.tsx (section label).
- `'kg x'` formatter in PRWallRecent.tsx (units/punctuation layout).
- `'Vrei altceva azi?'` override link in CoachTodayCard.tsx (navigation affordance).
- `'zi'` / `'zile'` plural in StatsGrid.tsx (locale-aware presentation).

---

## §8 — Anti-drift guards (forward-looking)

Future Phase 7+ feature additions MUST follow:

1. **Engine SoT principle (D-LEGACY-097):** engine emits full sentence/label; UI renders verbatim. Color codes, severity tags, action labels = engine domain.
2. **UI presentational concerns ONLY:** units/punctuation/i18n plural/heading labels/navigation affordances. These NOT engine semantic message.
3. **If feature requires UI composition of engine fragments → architect-review (re-design to engine-side compose pre-merge).**
4. **Test guard:** new engine outputs should add corresponding test in `src/react/__tests__/lib/engineWrappers*.test.ts` asserting both engine emit shape + UI consume passive (no hardcoded duplicate).

---

## §9 — Cross-references

- DECISIONS.md §D024 LOCKED V1 PERMANENT — Co-CTO autonomous compose pre-Beta (post-Beta a-z review window).
- DECISIONS.md §D-LEGACY-097 — Engine SoT Wording Authority.
- 03-decisions/_FROZEN/ADR_OUTPUT_TO_UI_AUTHORITY_V1.md — source ADR.
- src/react/lib/engineWrappers.ts (commit `631ff655` §48-H1 Sentry instrumentation LANDED 2026-05-23 — adjacent audit fix preserves engine→UI invariant safety net).
- 02-audit/AUDIT_§47-H2_ENGINE_UI_WIRING.md (THIS doc).

---

## §10 — Audit verdict LOCKED

**Engine output → UI consume wiring F2/F4/F6/F7/F8 = VERIFIED PASSIVE per audit posture.**

No drift incidents found. UI literals catalogued are presentational concerns (units, plural, navigation affordances, section headings) — NOT engine semantic message duplications. Anti-drift forward guards documented §8 for Phase 7+ feature additions.

Authority: §47-H2 audit-nuclear-2026-05-19 closure — Co-CTO autonomous per D024 LOCKED V1 PERMANENT.
