# Coach Replay — journey debugger (#66, DEV instrument)

Feed a **real user's log export** and replay their journey through the engine
**offline**, emitting a per-session decision trace that answers *"why did the
coach recommend X for this user on this day?"*

This is a **dev/support tool**. It is NOT in the production bundle, has **no prod
route**, and **no feature flag on the app path**. Its safety is structural: the
prod app never imports `scripts/`.

## What it reuses (zero new engine wiring)

It drives the **real prod compose path** via the full-path-sim `world`:

```
composePlannedWorkoutToday  (scheduleAdapterAggregate.compose.ts)
  → getDailyWorkout → runPipeline (8-engine pipeline) → sessionBuilder
  → toPlannedExercise per ex → DP.getSmartRecommendation
```

It is the sim's seed-and-compose loop (`acwrRealClockFullPath`,
`tests/engine/full-path-sim/fp-run.js`) **generalized** to walk a real
multi-session log set instead of one hand-built spike. The clock is injected
(`composePlannedWorkoutToday(new Date(sessionTs))`) — no `Date.now` in the
driven path, so it is deterministic.

## The trace it emits

Per session, per exercise:

- the **prescription**: `targetKg × targetReps × sets`, `restSec`, `sessionType`,
  `intensityMod`
- the **recReason** `{status, note}` — the engine's real decision branch
  (`INCREASE / EASE BACK / CONSOLIDATE / INIT / ON TARGET / …`), carried onto
  `PlannedExercise` by **F5-W0** (`compose.ts:326-345`). This is the "why."
- the **confidence** `{sigma, n}` — the Kalman posterior uncertainty +
  observation count (`DP._posteriorConfidence`, also carried by F5-W0). `sigma`
  is `null` at cold start.
- **voices** — which engine signals fired (read from `plan.__signalTrace` when
  the signal-bus dev flag is on; empty otherwise — `recReason.status` is always
  the primary "why").
- the **actual** logged outcome for that day (`loggedKg / loggedReps / rpe`), so
  the trace reads "going into session 5 it recommended 60kg EASE BACK *because*
  …, and the user actually logged 57.5kg."

### A/B mode (support superpower)

Replay the SAME real logs with one flag OFF vs ON and diff the per-session
traces — *"what would flag X have changed for THIS user."*

## How to run

The engine world is TS imported into a jsdom localStorage env, so the runner
executes under vitest (the same env the full-path-sim uses):

```bash
# 1. drop a real export at the gitignored local path:
#    scripts/coach-replay/_local/export.json
#    shape A: { "logs": [...], "data": {...onboarding} }   (account/GDPR export)
#    shape B: { "logs": "<json string>", "onb": "<json string>" }  (localStorage dump)

# 2. run the CLI (writes reports/coach-replay/<stamp>.{json,txt}, gitignored):
COACH_REPLAY_INPUT=scripts/coach-replay/_local/export.json \
  npx vitest run scripts/coach-replay/cli.test.mjs

# optional A/B — what one flag would have changed:
COACH_REPLAY_INPUT=scripts/coach-replay/_local/export.json \
COACH_REPLAY_FLAG=dp_acwr_readiness_v1 \
  npx vitest run scripts/coach-replay/cli.test.mjs
```

The acceptance test (`tests/engine/coach-replay/replay.test.js`) runs in the
normal suite with a tiny synthetic real-shaped export and proves the trace
surfaces the engine's real `recReason.status` (not a re-guess).

## Real data stays local

- Input → `scripts/coach-replay/_local/` (**gitignored**).
- Output → `reports/coach-replay/` (**gitignored**).
- The export is seeded into the harness's **in-memory jsdom localStorage**
  (reset each run) — read-only on the real account, never written back, never
  committed, never synced.

## The load-bearing rule: EN engine key

The engine reads a log row's `ex` as the **EN canonical engineName**
(`project_dp_namekey_fix`). The ingest **never rewrites** `ex` to the RO display
name, and **counts** any row missing an `ex` as an orphan (engine-dead) — that
missing-key case is exactly what made the coach "not adapt."
