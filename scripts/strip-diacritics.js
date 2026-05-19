#!/usr/bin/env node

/*
 * strip-diacritics.js
 *
 * One-shot refactor tool. Walks INCLUDE roots, replaces Romanian diacritics
 * with their ASCII equivalents (composed forms only — combining-mark forms
 * are NFC-normalized first), writes back only when content changes.
 *
 * Usage:
 *   node scripts/strip-diacritics.js --dry-run   # report only
 *   node scripts/strip-diacritics.js             # apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Roots that are walked recursively.
const INCLUDE_ROOTS = [
  { abs: path.join(ROOT, 'src'), exts: new Set(['.js', '.jsx', '.html', '.css', '.json']) },
  { abs: path.join(ROOT, 'tests'), exts: new Set(['.js', '.jsx', '.spec.js', '.test.js']) },
  { abs: path.join(ROOT, '04-architecture', 'mockups'), exts: new Set(['.html']) },
  { abs: path.join(ROOT, 'public'), exts: new Set(['.html', '.js', '.css', '.json']) },
];

const ROOT_FILES = [
  { abs: path.join(ROOT, 'index.html'), exts: new Set(['.html']) },
];

// Directory names that must never be entered, regardless of where they appear.
const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'test-results',
  'simulations',
  'reports',
  '.git',
  '.github',
  '.husky',
  '.claude',
  '.obsidian',
  '_archive',
  '_CONSUMED',
]);

// Direct codepoint map. We rely on NFC composition before applying.
const DIACRITIC_MAP = {
  'ă': 'a', 'Ă': 'A', // ă Ă
  'â': 'a', 'Â': 'A', // â Â
  'î': 'i', 'Î': 'I', // î Î
  'ș': 's', 'Ș': 'S', // ș Ș (RO standard, comma-below)
  'ț': 't', 'Ț': 'T', // ț Ț (RO standard, comma-below)
  'ş': 's', 'Ş': 'S', // ş Ş (legacy cedilla)
  'ţ': 't', 'Ţ': 'T', // ţ Ţ (legacy cedilla)
};

const DIACRITIC_REGEX = new RegExp(
  '[' + Object.keys(DIACRITIC_MAP).join('') + ']',
  'g'
);

function stripDiacritics(input) {
  // Normalize to NFC so combining-mark sequences become composed codepoints
  // that the map covers. Then map.
  const normalized = input.normalize('NFC');
  let count = 0;
  const out = normalized.replace(DIACRITIC_REGEX, (ch) => {
    count += 1;
    return DIACRITIC_MAP[ch];
  });
  return { out, count, changed: count > 0 };
}

function shouldVisitDir(dirName) {
  return !EXCLUDED_DIR_NAMES.has(dirName);
}

function fileExtMatches(filePath, exts) {
  // Support multi-suffix extensions like .spec.js / .test.js by checking
  // both the full multi-suffix and the simple ext.
  const base = path.basename(filePath);
  for (const e of exts) {
    if (base.endsWith(e)) return true;
  }
  return false;
}

function walkDir(absDir, exts, files) {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (shouldVisitDir(entry.name)) walkDir(full, exts, files);
    } else if (entry.isFile()) {
      if (fileExtMatches(full, exts)) files.push(full);
    }
  }
}

function processFile(absPath) {
  let raw;
  try {
    raw = fs.readFileSync(absPath, 'utf8');
  } catch (err) {
    return { skipped: true, error: err.message };
  }
  const { out, count, changed } = stripDiacritics(raw);
  if (!changed) return { changed: false, count: 0 };
  if (!DRY_RUN) {
    fs.writeFileSync(absPath, out, 'utf8');
  }
  return { changed: true, count };
}

function main() {
  const collected = [];
  for (const root of INCLUDE_ROOTS) {
    if (fs.existsSync(root.abs)) walkDir(root.abs, root.exts, collected);
  }
  for (const single of ROOT_FILES) {
    if (fs.existsSync(single.abs) && fileExtMatches(single.abs, single.exts)) {
      collected.push(single.abs);
    }
  }

  let totalFilesChanged = 0;
  let totalReplacements = 0;
  const perFileChanges = [];

  for (const f of collected) {
    const res = processFile(f);
    if (res.changed) {
      totalFilesChanged += 1;
      totalReplacements += res.count;
      perFileChanges.push({ file: path.relative(ROOT, f), count: res.count });
    }
  }

  perFileChanges.sort((a, b) => b.count - a.count);

  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== APPLY ===');
  console.log('Files scanned:      ' + collected.length);
  console.log('Files with changes: ' + totalFilesChanged);
  console.log('Total replacements: ' + totalReplacements);
  console.log('');
  for (const row of perFileChanges) {
    console.log(String(row.count).padStart(6) + '  ' + row.file);
  }
}

main();
