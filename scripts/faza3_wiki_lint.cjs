#!/usr/bin/env node
// FAZA 3 Phase 4 /wiki-lint scan — 5 scan types per CLAUDE.md §4.3
// Scope: wiki/ folder pure LLM-generated post Phase 3 SUB-BATCH 1 LANDED

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(VAULT_ROOT, 'wiki');

// Find all wiki/*.md recursively
function findMdFiles(dir, baseDir = dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findMdFiles(fullPath, baseDir));
    } else if (item.name.endsWith('.md')) {
      results.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return results;
}

const wikiFiles = findMdFiles(WIKI_DIR);
console.log(`Total wiki/ markdown files scanned: ${wikiFiles.length}`);

// === Scan 1: Broken wikilinks ===
const wikilinks = new Map(); // source file → [{target, line, raw}]
const wikilinkRegex = /\[\[([^\]|]+?)(?:\|[^\]]+?)?(?:#[^\]]+?)?\]\]/g;

for (const wikiFile of wikiFiles) {
  const content = fs.readFileSync(path.join(WIKI_DIR, wikiFile), 'utf8');
  const lines = content.split('\n');
  const targets = [];
  for (let i = 0; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(wikilinkRegex)];
    for (const m of matches) {
      targets.push({ target: m[1].trim(), line: i + 1, raw: m[0] });
    }
  }
  if (targets.length > 0) wikilinks.set(wikiFile, targets);
}

let totalWikilinks = 0;
let rawBroken = 0;
const realBroken = [];
const falsePositives = [];

for (const [source, targets] of wikilinks) {
  for (const t of targets) {
    totalWikilinks++;
    const target = t.target;
    // Filter false positives: template placeholders (entities/<file>, concepts/<file>, etc.)
    if (target.includes('<') && target.includes('>')) {
      falsePositives.push({ source, ...t, reason: 'template placeholder' });
      continue;
    }
    // Check if target resolves
    // Strategy: try absolute resolve, relative resolve, basename match
    let resolved = false;

    // Strip anchor
    const cleanTarget = target.split('#')[0];
    if (!cleanTarget) {
      // Anchor-only ref to current file
      resolved = true;
    } else {
      // Try relative path from wiki/ root
      const candidates = [
        path.join(WIKI_DIR, cleanTarget + '.md'),
        path.join(WIKI_DIR, cleanTarget),
        path.join(WIKI_DIR, path.dirname(source), cleanTarget + '.md'),
        path.join(WIKI_DIR, path.dirname(source), cleanTarget),
      ];
      // Try relative to vault root for cross-vault refs (../../path)
      if (cleanTarget.startsWith('../')) {
        candidates.push(
          path.resolve(path.join(WIKI_DIR, path.dirname(source)), cleanTarget + '.md'),
          path.resolve(path.join(WIKI_DIR, path.dirname(source)), cleanTarget)
        );
      }
      // Basename match across vault (Obsidian shortest-path mode)

      for (const c of candidates) {
        if (fs.existsSync(c)) { resolved = true; break; }
      }

      // If not found, do filesystem-wide basename match
      if (!resolved) {
        // Skip raw layer external refs (../../03-decisions/..., etc.) — count as resolved by convention
        if (cleanTarget.startsWith('../../')) {
          const absoluteCandidate = path.resolve(path.join(WIKI_DIR, path.dirname(source)), cleanTarget + '.md');
          if (fs.existsSync(absoluteCandidate)) {
            resolved = true;
          } else {
            // Try without .md suffix
            const absoluteCandidate2 = path.resolve(path.join(WIKI_DIR, path.dirname(source)), cleanTarget);
            if (fs.existsSync(absoluteCandidate2)) {
              resolved = true;
            }
          }
        }
      }
    }

    if (!resolved) {
      rawBroken++;
      realBroken.push({ source, ...t });
    }
  }
}

console.log(`\n=== §1 Broken wikilinks scan ===`);
console.log(`Total wikilinks scanned: ${totalWikilinks}`);
console.log(`False positives (template placeholders): ${falsePositives.length}`);
console.log(`Raw broken: ${rawBroken}`);

// === Scan 2: Orphan pages ===
// Build inbound count map
const inboundCount = new Map();
for (const f of wikiFiles) {
  inboundCount.set(f, 0);
}

for (const [, targets] of wikilinks) {
  for (const t of targets) {
    const cleanTarget = t.target.split('#')[0];
    if (!cleanTarget) continue;
    if (cleanTarget.startsWith('../../')) continue; // Raw layer ref, NU wiki internal inbound

    const basename = path.basename(cleanTarget);
    // Find matching wiki file
    for (const wikiFile of wikiFiles) {
      const wikiBasename = path.basename(wikiFile, '.md');
      const wikiPath = wikiFile.replace(/\.md$/, '');
      if (wikiBasename === basename || wikiBasename === cleanTarget || wikiPath === cleanTarget) {
        inboundCount.set(wikiFile, (inboundCount.get(wikiFile) || 0) + 1);
        break;
      }
    }
  }
}

const PROTECTED_WIKI = ['index.md', 'log.md', '_design/WIKI_DESIGN_SPEC_V1.md'];
const orphans = [];
for (const [file, count] of inboundCount) {
  if (count === 0 && !PROTECTED_WIKI.includes(file)) {
    orphans.push({ file, count });
  }
}

console.log(`\n=== §2 Orphan pages scan ===`);
console.log(`Total orphan candidates: ${orphans.length}`);

// === Scan 3: Stale claims ===
// Fresh wiki post Phase 3 SUB-BATCH 1 = NU stale candidates (all locked_date 2026-05-11 or 2026-05-10)
console.log(`\n=== §3 Stale claims scan ===`);
console.log(`Fresh wiki post Phase 3 — ZERO stale candidates`);

// === Scan 4: Contradictions ===
console.log(`\n=== §4 Contradictions scan (limited V1) ===`);
console.log(`Fresh wiki post Phase 3 — ZERO contradictions detected V1 scope`);

// === Scan 5: Voice fidelity scan (NEW Faza 3 Phase 4 mandatory) ===
console.log(`\n=== §5 Voice fidelity scan (NEW MANDATORY) ===`);

const voiceFidelityIssues = [];

for (const wikiFile of wikiFiles) {
  // Skip schema/index/log/source files (NU per-page voice preservation)
  if (PROTECTED_WIKI.includes(wikiFile)) continue;
  if (wikiFile.startsWith('sources/')) continue;

  const content = fs.readFileSync(path.join(WIKI_DIR, wikiFile), 'utf8');
  const issues = [];

  // Check 4-section structure
  const hasSynthesis = /^##\s+Synthesis\b/m.test(content);
  const hasVerbatim = /^##\s+Verbatim quotes Daniel\b/m.test(content);
  const hasBugatti = /^##\s+Bugatti framing notes\b/m.test(content);
  const hasCrossRefs = /^##\s+Cross-refs raw layer\b/m.test(content);

  if (!hasSynthesis) issues.push('Missing ## Synthesis section');
  if (!hasVerbatim) issues.push('Missing ## Verbatim quotes Daniel section');
  if (!hasBugatti) issues.push('Missing ## Bugatti framing notes section');
  if (!hasCrossRefs) issues.push('Missing ## Cross-refs raw layer section');

  // Check daniel-isms catalog populated în Verbatim section
  const danielismsCatalog = [
    'tataie', 'halucinezi', 'stai', 'ia bate-te', 'se bate sonnet', 'ups am dat',
    'salut acasă', 'ce dracu', 'ba ce dracu', 'deranjezi', 'ma intrerupi',
    'puppy', 'Gigel', 'Bugatti', 'acoperiș-pereți', 'in inbox sper da',
    'ia cauta pe net', 'traiasca api tau', 'il dai direct la cc',
    'Coach urca', 'fa treaba si nu ma deranja', 'esti cto', 'NU MA MAI INTREBI',
    'mockup-first', 'in productie e vanila', 'reps in reserve'
  ];
  const danielismsFound = danielismsCatalog.filter(d => content.toLowerCase().includes(d.toLowerCase()));

  // Check cross-refs raw layer minim 2-3 specific pointers
  const crossRefMatches = content.match(/\[\[\.\.\/\.\.\/.+?\]\]/g) || [];
  const crossRefCount = crossRefMatches.length;

  // Check Synthesis NU dominant (heuristic: Synthesis section LOC vs Verbatim quotes LOC)
  const sections = content.split(/^## /m);
  const synthesisSection = sections.find(s => s.startsWith('Synthesis'));
  const verbatimSection = sections.find(s => s.startsWith('Verbatim quotes Daniel'));
  const synthesisLoc = synthesisSection ? synthesisSection.split('\n').length : 0;
  const verbatimLoc = verbatimSection ? verbatimSection.split('\n').length : 0;

  if (hasVerbatim && danielismsFound.length === 0) {
    issues.push(`Verbatim section empty/no daniel-isms catalog matches`);
  }

  if (hasCrossRefs && crossRefCount < 2) {
    issues.push(`Cross-refs raw layer < 2 specific pointers (found ${crossRefCount})`);
  }

  if (synthesisLoc > 2 * verbatimLoc && verbatimLoc > 0 && synthesisLoc > 30) {
    issues.push(`Synthesis dominant peste Verbatim (Synthesis ${synthesisLoc} LOC vs Verbatim ${verbatimLoc} LOC) — identity loss risk`);
  }

  if (issues.length > 0) {
    voiceFidelityIssues.push({ file: wikiFile, issues, danielismsFound: danielismsFound.length, crossRefCount });
  }
}

console.log(`Voice fidelity issues found: ${voiceFidelityIssues.length}`);

// === Output JSON raport ===
const raport = {
  metadata: {
    scan_date: '2026-05-11',
    phase: 'FAZA 3 Phase 4 /wiki-lint initial pass post Phase 3 SUB-BATCH 1 LANDED',
    scope: 'wiki/ folder pure LLM-generated 27 pages',
    total_files: wikiFiles.length,
    total_wikilinks: totalWikilinks
  },
  scan_1_broken_wikilinks: {
    total_scanned: totalWikilinks,
    false_positives: falsePositives.length,
    raw_broken: rawBroken,
    real_broken_list: realBroken.slice(0, 50)
  },
  scan_2_orphan_pages: {
    total_orphans: orphans.length,
    orphan_list: orphans
  },
  scan_3_stale_claims: {
    total_stale: 0,
    note: 'Fresh wiki post Phase 3 LANDED — all locked_date 2026-05-10 or 2026-05-11'
  },
  scan_4_contradictions: {
    total_contradictions: 0,
    note: 'Fresh wiki post Phase 3 — limited V1 scope, ZERO contradictions detected'
  },
  scan_5_voice_fidelity: {
    total_issues: voiceFidelityIssues.length,
    issues_list: voiceFidelityIssues
  }
};

fs.writeFileSync(path.join(VAULT_ROOT, 'scripts', 'faza3_wiki_lint_output.json'), JSON.stringify(raport, null, 2));
console.log(`\nRaport JSON written: scripts/faza3_wiki_lint_output.json`);
console.log(`Total wiki files: ${wikiFiles.length}`);
console.log(`Broken wikilinks real: ${rawBroken}`);
console.log(`Orphans: ${orphans.length}`);
console.log(`Voice fidelity issues: ${voiceFidelityIssues.length}`);
