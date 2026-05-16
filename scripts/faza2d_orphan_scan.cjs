#!/usr/bin/env node
// Faza 2D extensive orphan scan
// Scans all vault md files (excluding src/tests/node_modules/.git/dist/coverage/.obsidian/scripts/.claude/.husky/.github/playwright-report/test-results)
// For each file in WIKI LAYER (excluding _archive _CONSUMED + _karpathy_gist_reference.md raw),
// counts inbound references from all md files in vault (wiki + raw + archive can be source).
// Classifies: PROTECTED / HUB / LEAF / ORPHAN

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Read pre-built file list (UTF-8 to preserve emojis)
const allMdFiles = fs.readFileSync('tmp_faza2d_files.txt', 'utf8')
  .split('\n')
  .filter(l => l.trim())
  .map(l => l.replace(/^\.\//, '')); // normalize ./prefix removed

// WIKI LAYER = vault md files EXCEPT _archive (those are immutable historical)
// + EXCEPT _karpathy_gist_reference.md (raw layer per CLAUDE.md §1)
const wikiLayer = allMdFiles.filter(f =>
  !f.includes('_archive/') &&
  !f.endsWith('_karpathy_gist_reference.md')
);

// Protected files (vault root SSOT infra — always orphan in graph, expected)
const PROTECTED = new Set([
  'CLAUDE.md',
  'VAULT_RULES.md',
  'README.md',
  'DIFF_FLAGS.md',
  'PROMPT_CC_HYGIENE.md',
  'PROMPT_CC_INGEST_HANDOVER.md',
  '04-architecture/mockups/README.md',
  'simulations/README.md'
]);

// HUB files (should have inbound from INDEX_MASTER + each other)
const HUB = new Set([
  '00-index/INDEX_MASTER.md',
  '00-index/CURRENT_STATE.md',
  '03-decisions/DECISION_LOG.md',
  '06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md',
  '06-sessions-log/RECENT_DECIDED_ARCHIVE.md',
  '05-findings-tracker/FINDINGS_MASTER.md',
]);

// Read all md files content cache
const contentCache = {};
for (const f of allMdFiles) {
  try {
    contentCache[f] = fs.readFileSync(f, 'utf8');
  } catch (e) {
    contentCache[f] = '';
  }
}

// For each target file in wiki layer, count inbound refs
function countInboundRefs(targetFile) {
  const basename = path.basename(targetFile, '.md');
  // Escape regex special chars in basename
  const escBase = basename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Wikilink pattern: [[basename]] OR [[basename|display]] OR [[basename#section]] OR [[path/basename]] OR [[path/basename|...]]
  // We match by basename, case-insensitive (Obsidian shortest-path mode default)
  const wikilinkPat = new RegExp(`\\[\\[(?:[^\\]|#]*\\/)?${escBase}(?:#[^\\]|]*)?(?:\\|[^\\]]*)?\\]\\]`, 'gi');

  // Markdown link pattern: [text](some/path/basename.md OR basename.md)
  const mdLinkPat = new RegExp(`\\[[^\\]]*\\]\\([^)]*${escBase}\\.md(?:#[^)]*)?\\)`, 'gi');

  let totalInbound = 0;
  const sources = [];

  for (const [srcFile, content] of Object.entries(contentCache)) {
    if (srcFile === targetFile) continue; // skip self-refs

    const wmatches = content.match(wikilinkPat) || [];
    const mdmatches = content.match(mdLinkPat) || [];
    const count = wmatches.length + mdmatches.length;

    if (count > 0) {
      totalInbound += count;
      sources.push({ src: srcFile, count, wiki: wmatches.length, md: mdmatches.length });
    }
  }

  return { totalInbound, sources };
}

// Classify each wiki layer file
const results = [];
for (const f of wikiLayer) {
  const { totalInbound, sources } = countInboundRefs(f);

  let classification;
  if (PROTECTED.has(f)) {
    classification = 'PROTECTED';
  } else if (HUB.has(f)) {
    classification = 'HUB';
  } else if (totalInbound === 0) {
    classification = 'ORPHAN';
  } else {
    classification = 'LEAF';
  }

  results.push({ file: f, classification, totalInbound, sources });
}

// Group by classification
const byClass = {};
for (const r of results) {
  if (!byClass[r.classification]) byClass[r.classification] = [];
  byClass[r.classification].push(r);
}

// Output JSON for raport processing
console.log(JSON.stringify({
  totalFiles: wikiLayer.length,
  byClass: {
    PROTECTED: byClass.PROTECTED?.length || 0,
    HUB: byClass.HUB?.length || 0,
    LEAF: byClass.LEAF?.length || 0,
    ORPHAN: byClass.ORPHAN?.length || 0,
  },
  results
}, null, 2));
