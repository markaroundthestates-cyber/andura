// ══ VALIDATION RUNNER — corpus + ground_truth + andura_output → match metric ══
// Per `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` §6.1 auto-eval pipeline
// + §7 Pre-Beta Gates LOCKED V1.
//
// Usage (post Daniel + Claude chat strategic ground truth phase):
//   node simulations/run_validation.js
//
// Output: simulations/validation_runs/<YYYY-MM-DD>/corpus_run_<id>.json
//       + simulations/validation_runs/<YYYY-MM-DD>/match_aggregate_<id>.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeMatchScore, aggregateCorpusResults, GATES } from '../src/validation/matchMetric.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SIMULATIONS_DIR = __dirname;

const CORPUS_PATH = path.join(SIMULATIONS_DIR, 'validation_corpus_v1.json');
const GROUND_TRUTH_PATH = path.join(SIMULATIONS_DIR, 'ground_truth_v1.json');

function isoDate(d = new Date()) {
  return d.toISOString().split('T')[0];
}

function runId(d = new Date()) {
  return `${isoDate(d)}-${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Andura output stub — replace cu real simulator pipeline integration when
 * Engine #2 ADR 024 + Engines #4-#8 ADR stubs (027/028/029) ready and
 * pure-function adapter exists. Currently returns Claude reasoning back as
 * Andura output (perfect match) — sentinel useful only pentru plumbing test.
 *
 * @param {{ query_id: string, persona: object, query_type: string }} _query
 * @param {object} claudeReasoning
 */
function stubAnduraOutput(_query, claudeReasoning) {
  // Plumbing-only stub — flags this is NOT real simulator output.
  return {
    exercises: claudeReasoning.session_blueprint?.exercises ?? [],
    prescription: claudeReasoning.session_blueprint?.sets_reps_rir ?? [],
    safety_flags: claudeReasoning.safety_considerations ?? [],
    key_principles: claudeReasoning.key_principles_invoked ?? [],
    _stub: true,
  };
}

export async function runValidation() {
  if (!fs.existsSync(CORPUS_PATH) || !fs.existsSync(GROUND_TRUTH_PATH)) {
    console.error('[validation] corpus or ground_truth missing — populate simulations/*.json first');
    process.exit(1);
  }

  const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf-8'));
  const groundTruth = JSON.parse(fs.readFileSync(GROUND_TRUTH_PATH, 'utf-8'));

  if (!Array.isArray(corpus.queries) || corpus.queries.length === 0) {
    console.error('[validation] empty corpus — populate ~500 queries via Claude chat strategic ground truth phase');
    process.exit(1);
  }

  const perQueryResults = [];
  for (const q of corpus.queries) {
    const truthEntry = groundTruth.ground_truth_by_query_id?.[q.query_id];
    if (!truthEntry) {
      console.warn(`[validation] missing ground_truth for query_id=${q.query_id} — skipping`);
      continue;
    }
    const claudeReasoning = {
      exercises: truthEntry.claude_reasoning?.session_blueprint?.exercises ?? [],
      prescription: truthEntry.claude_reasoning?.session_blueprint?.sets_reps_rir ?? [],
      safety_flags: truthEntry.claude_reasoning?.safety_considerations ?? [],
      key_principles: truthEntry.claude_reasoning?.key_principles_invoked ?? [],
    };
    const anduraOutput = stubAnduraOutput(q, truthEntry.claude_reasoning);
    const result = computeMatchScore(claudeReasoning, anduraOutput);
    perQueryResults.push({ query_id: q.query_id, ...result });
  }

  const aggregate = aggregateCorpusResults(perQueryResults);

  const id = runId();
  const dateDir = path.join(SIMULATIONS_DIR, 'validation_runs', isoDate());
  fs.mkdirSync(dateDir, { recursive: true });
  fs.writeFileSync(
    path.join(dateDir, `corpus_run_${id}.json`),
    JSON.stringify({ run_id: id, produced_at: new Date().toISOString(), aggregate, per_query: perQueryResults }, null, 2),
  );

  const md = renderAggregateMd(id, aggregate, perQueryResults);
  fs.writeFileSync(path.join(dateDir, `match_aggregate_${id}.md`), md);

  console.log(`[validation] run ${id} complete — overall_match_rate=${(aggregate.overall_match_rate * 100).toFixed(1)}% gate_1_pass=${aggregate.gate_1_pass}`);
  console.log(`[validation] flagged_for_daniel_review=${aggregate.flagged_for_daniel_review}/${perQueryResults.length} (${(aggregate.flagged_rate * 100).toFixed(1)}%)`);
  if (!aggregate.gate_1_pass) {
    console.error(`[validation] GATE 1 FAIL — required ≥${(GATES.GATE_1_MIN * 100)}% MATCH`);
    process.exit(2);
  }
}

function renderAggregateMd(id, aggregate, perQuery) {
  const lines = [
    `# Validation Run ${id} — Match Aggregate`,
    '',
    `**Run id:** \`${id}\`  `,
    `**Produced at:** ${new Date().toISOString()}  `,
    `**Validation Framework:** LOCKED V1 (≥95% strict + Safety 0.35 universal + Gate 2 DROPPED + Gate 3 selective)`,
    '',
    '## Aggregate',
    '',
    `- Overall match rate: **${(aggregate.overall_match_rate * 100).toFixed(2)}%**`,
    `- Gate 1 (≥95% MATCH): **${aggregate.gate_1_pass ? 'PASS' : 'FAIL'}**`,
    `- Gate 3 selective Daniel review needed: **${aggregate.flagged_for_daniel_review} queries** (${(aggregate.flagged_rate * 100).toFixed(2)}%)`,
    `- Verdict counts: MATCH=${aggregate.verdict_counts.MATCH}, PARTIAL=${aggregate.verdict_counts.PARTIAL}, MISS=${aggregate.verdict_counts.MISS}`,
    '',
    '## Dimension breakdown (avg)',
    '',
    `- Safety considerations: ${(aggregate.dimension_breakdown.safety * 100).toFixed(1)}%`,
    `- Exercise selection: ${(aggregate.dimension_breakdown.exercise * 100).toFixed(1)}%`,
    `- Sets/reps/RIR band: ${(aggregate.dimension_breakdown.setsRepsRir * 100).toFixed(1)}%`,
    `- Key principles: ${(aggregate.dimension_breakdown.keyPrinciples * 100).toFixed(1)}%`,
    '',
    '## Flagged queries (Gate 3 Daniel selective review)',
    '',
  ];
  for (const r of perQuery.filter((q) => q.flagged_uncertain)) {
    lines.push(`- \`${r.query_id}\` — verdict=${r.verdict}, score=${r.score.toFixed(3)}`);
  }
  return lines.join('\n');
}

// Auto-run if invoked directly.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('run_validation.js')) {
  runValidation().catch((e) => {
    console.error('[validation] runner failed:', e);
    process.exit(1);
  });
}
