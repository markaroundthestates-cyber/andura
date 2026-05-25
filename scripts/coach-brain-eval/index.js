// Coach Brain Eval — CLI entry. Orchestrates the two validation levels.
//
// Per COACH_BRAIN_EVAL_DESIGN.md §4.1 + §6: offline batch (NOT a PR gate).
//   Level 1 (invariants): run on N scenarios, free + deterministic.
//   Level 2 (oracle): run on a small stratified sample, cost-controlled,
//     measure agreement%. Skips gracefully if no ANTHROPIC_API_KEY.
//
// Usage:
//   node scripts/coach-brain-eval/index.js [--n 5000] [--oracle 30] [--seed 1]
//   node scripts/coach-brain-eval/index.js --invariants-only
//
// Output: reports/coach-brain-eval/<timestamp>.{json,md}

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateScenarios, edgeScenarios } from './generator.js';
import { runScenario, runAll } from './runner.js';
import { runInvariants } from './invariants.js';
import { compareDimensions } from './comparators.js';
import { callOracle, oracleAvailable, loadCache, saveCache } from './oracle.js';

const REPORT_DIR = fileURLToPath(new URL('../../reports/coach-brain-eval/', import.meta.url));
const CACHE_PATH = fileURLToPath(new URL('../../reports/coach-brain-eval/.oracle-cache.json', import.meta.url));

function parseArgs(argv) {
  const args = { n: 5000, oracle: 30, seed: 1, invariantsOnly: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--n') args.n = parseInt(argv[++i], 10);
    else if (a === '--oracle') args.oracle = parseInt(argv[++i], 10);
    else if (a === '--seed') args.seed = parseInt(argv[++i], 10);
    else if (a === '--invariants-only') args.invariantsOnly = true;
  }
  return args;
}

/**
 * Pick a stratified oracle sample: edge scenarios first (guaranteed coverage),
 * then evenly across archetypes from the main batch, capped at `count`.
 */
function pickOracleSample(mainRuns, edges, count) {
  const sample = [...edges];
  if (sample.length >= count) return sample.slice(0, count);
  const remaining = count - sample.length;
  const byArch = { gigel: [], marius: [], maria: [] };
  for (const r of mainRuns) (byArch[r.scenario.archetype] || (byArch[r.scenario.archetype] = [])).push(r);
  const archKeys = Object.keys(byArch);
  let i = 0;
  while (sample.length < count && i < remaining * 2) {
    const arch = archKeys[i % archKeys.length];
    const pool = byArch[arch];
    const idx = Math.floor(i / archKeys.length);
    if (pool && pool[idx]) sample.push(pool[idx]);
    i++;
  }
  return sample.slice(0, count);
}

export async function runEval(opts) {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  // ── Level 1: invariants on N scenarios + edge set ──────────────────────────
  const scenarios = generateScenarios(opts.n, { baseSeed: opts.seed });
  const edges = edgeScenarios();
  const allScenarios = [...scenarios, ...edges];

  const runs = await runAll(allScenarios);
  const invariantMs = Date.now() - t0;
  const invariantResult = runInvariants(runs);

  // ── Level 2: oracle on a small stratified sample ───────────────────────────
  let oracle = { available: oracleAvailable(), requested: opts.oracle, scored: 0, skipped: !oracleAvailable() };
  const oracleDetails = [];
  if (!opts.invariantsOnly && oracleAvailable() && opts.oracle > 0) {
    const edgeRuns = runs.filter((r) => r.scenario.id.startsWith('edge-'));
    const mainRuns = runs.filter((r) => !r.scenario.id.startsWith('edge-'));
    const sample = pickOracleSample(mainRuns, edgeRuns, opts.oracle);
    const cache = loadCache(CACHE_PATH);

    let agreeTotal = 0;
    let dimTotal = 0;
    const byDimension = {};
    const disagreements = [];

    for (const r of sample) {
      // Re-run to get the live frozen ctx (runAll dropped it for memory).
      const { ctx, decision } = await runScenario(r.scenario);
      const oRes = await callOracle(ctx, { cache, cachePath: CACHE_PATH, delayMs: 350 });
      if (!oRes.ok) {
        oracleDetails.push({ id: r.scenario.id, error: oRes.error });
        continue;
      }
      const cmp = compareDimensions(decision.dimensions, oRes.output);
      agreeTotal += cmp.agreeCount;
      dimTotal += cmp.totalCount;
      for (const [dim, res] of Object.entries(cmp.perDimension)) {
        const slot = (byDimension[dim] = byDimension[dim] || { agree: 0, total: 0 });
        slot.total += 1;
        if (res.agree) slot.agree += 1;
        else {
          disagreements.push({
            id: r.scenario.id,
            archetype: r.scenario.archetype,
            dimension: dim,
            andura: res.anduraValue,
            claude: res.claudeValue,
            rationale: (oRes.output.rationale && oRes.output.rationale[dim]) || null,
          });
        }
      }
      oracleDetails.push({ id: r.scenario.id, cached: oRes.cached, agree: cmp.agreeCount, total: cmp.totalCount });
    }
    saveCache(CACHE_PATH, cache);

    oracle = {
      available: true,
      requested: opts.oracle,
      scored: oracleDetails.filter((d) => !d.error).length,
      errors: oracleDetails.filter((d) => d.error),
      agreementPct: dimTotal > 0 ? +((agreeTotal / dimTotal) * 100).toFixed(1) : null,
      agreeTotal,
      dimTotal,
      byDimension,
      disagreements,
    };
  }

  const totalMs = Date.now() - t0;
  const report = {
    startedAt,
    finishedAt: new Date().toISOString(),
    config: opts,
    timing: { invariantMs, totalMs, scenariosPerSec: +((runs.length / (invariantMs / 1000)) || 0).toFixed(0) },
    invariants: invariantResult,
    oracle,
  };
  return report;
}

function formatMarkdown(report) {
  const inv = report.invariants;
  const o = report.oracle;
  const lines = [];
  lines.push(`# Coach Brain Eval — run ${report.startedAt}`);
  lines.push('');
  lines.push(`Scenarios: **${inv.totalScenarios}** | Invariant violations: **${inv.totalViolations}** | ` +
    `Invariant time: **${report.timing.invariantMs}ms** (~${report.timing.scenariosPerSec} scen/s)`);
  lines.push('');
  lines.push('## Level 1 — Invariants (deterministic, all scenarios)');
  if (inv.totalViolations === 0) {
    lines.push('All invariants PASS. Zero violations across the batch.');
  } else {
    lines.push('| Invariant | Violations |');
    lines.push('|---|---|');
    for (const [k, n] of Object.entries(inv.byInvariant)) lines.push(`| ${k} | ${n} |`);
    lines.push('');
    lines.push('### Sample violations');
    const sample = inv.violatingScenarios.slice(0, 20);
    for (const s of sample) {
      for (const v of s.violations.slice(0, 3)) {
        lines.push(`- \`${s.scenarioId}\` (${s.archetype}) **${v.invariant}**: ${v.detail}`);
      }
    }
    if (inv.monotonicViolations && inv.monotonicViolations.length) {
      lines.push('');
      lines.push('### Monotonicity (batch-level)');
      for (const m of inv.monotonicViolations) lines.push(`- ${m.detail}`);
    }
  }
  lines.push('');
  lines.push('## Level 2 — Claude oracle (agreement%)');
  if (!o.available) {
    lines.push('Oracle SKIPPED — `ANTHROPIC_API_KEY` not set in this environment. Invariants only.');
  } else if (o.scored === 0) {
    lines.push(`Oracle requested ${o.requested} but scored 0 (errors: ${(o.errors || []).length}).`);
    for (const e of (o.errors || []).slice(0, 5)) lines.push(`- ${e.id}: ${e.error}`);
  } else {
    lines.push(`Sample scored: **${o.scored}** | Dimensions compared: **${o.dimTotal}** | ` +
      `**Agreement: ${o.agreementPct}%** (${o.agreeTotal}/${o.dimTotal})`);
    lines.push('');
    lines.push('| Dimension | Agree | Total | % |');
    lines.push('|---|---|---|---|');
    for (const [dim, s] of Object.entries(o.byDimension)) {
      lines.push(`| ${dim} | ${s.agree} | ${s.total} | ${((s.agree / s.total) * 100).toFixed(0)}% |`);
    }
    if (o.disagreements && o.disagreements.length) {
      lines.push('');
      lines.push('### Disagreements (bug backlog candidates)');
      for (const d of o.disagreements.slice(0, 30)) {
        lines.push(`- \`${d.id}\` **${d.dimension}**: Andura=\`${d.andura}\` vs Claude=\`${d.claude}\`` +
          (d.rationale ? ` — _${d.rationale}_` : ''));
      }
    }
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const opts = parseArgs(process.argv);
  console.error(`[coach-brain-eval] n=${opts.n} oracle=${opts.oracle} seed=${opts.seed} invariantsOnly=${opts.invariantsOnly}`);
  const report = await runEval(opts);

  mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = report.startedAt.replace(/[:.]/g, '-');
  const jsonPath = `${REPORT_DIR}${stamp}.json`;
  const mdPath = `${REPORT_DIR}${stamp}.md`;
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(mdPath, formatMarkdown(report));

  console.error(`[coach-brain-eval] invariants: ${report.invariants.totalViolations} violations / ${report.invariants.totalScenarios} scenarios`);
  if (report.oracle.available && report.oracle.scored) {
    console.error(`[coach-brain-eval] oracle agreement: ${report.oracle.agreementPct}% (${report.oracle.scored} scenarios)`);
  } else {
    console.error('[coach-brain-eval] oracle skipped (no API key)');
  }
  console.error(`[coach-brain-eval] report: ${mdPath}`);
}

// Run only when invoked directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { formatMarkdown, parseArgs, pickOracleSample };
