// ══ COACH-REPLAY — CLI runner (DEV INSTRUMENT) ═════════════════════════════
// task #66. The replay world (composePlannedWorkoutToday → 8-engine pipeline →
// DP) is TS imported into a jsdom localStorage env, so it runs under vitest —
// the SAME env the full-path-sim already uses. This file is that CLI: it reads a
// real export from the path in COACH_REPLAY_INPUT, replays the journey, and
// writes the decision trace (JSON + readable text) to reports/coach-replay/
// (gitignored). It is a `.test.mjs` so vitest picks it up, but it SKIPS unless
// COACH_REPLAY_INPUT is set → it never runs in the normal suite / husky / CI.
//
// RUN:
//   COACH_REPLAY_INPUT=scripts/coach-replay/_local/export.json \
//     npx vitest run scripts/coach-replay/cli.test.mjs
//   (optional A/B)  COACH_REPLAY_FLAG=dp_acwr_readiness_v1  added to the env.
//
// REAL-DATA-STAYS-LOCAL: the input lives under the gitignored _local/, the output
// under the gitignored reports/coach-replay/. Nothing real is ever committed.

import { describe, it, expect } from 'vitest';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { replayJourney, replayAB, formatTrace } from './replay.mjs';

const INPUT = process.env.COACH_REPLAY_INPUT;
const FLAG = process.env.COACH_REPLAY_FLAG || null;
const OUT_DIR = fileURLToPath(new URL('../../reports/coach-replay/', import.meta.url));

const maybe = INPUT ? describe : describe.skip;

maybe('coach-replay CLI', () => {
  it('replays the export at COACH_REPLAY_INPUT and dumps the trace', async () => {
    const raw = JSON.parse(readFileSync(INPUT, 'utf8'));
    const result = FLAG ? await replayAB(raw, FLAG) : await replayJourney(raw);
    mkdirSync(OUT_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    writeFileSync(`${OUT_DIR}${stamp}.json`, JSON.stringify(result, null, 2));
    const text = FLAG
      ? `A/B flag=${result.flag} — ${result.totalDiffs} session-exercise diffs\n\n` +
        result.diffs.map((d) => `#${d.sessionNo} ${d.date} ${d.engineName}: ` +
          `${d.off.targetKg}kg/${d.off.sets}set/${d.off.status} → ${d.on.targetKg}kg/${d.on.sets}set/${d.on.status}`).join('\n') +
        `\n\n=== OFF ===\n${formatTrace(result.off)}\n=== ON ===\n${formatTrace(result.on)}`
      : formatTrace(result);
    writeFileSync(`${OUT_DIR}${stamp}.txt`, text);
    console.log(`\n[coach-replay] trace written: reports/coach-replay/${stamp}.{json,txt}\n${text}`);
    expect(text.length).toBeGreaterThan(0);
  });
});
