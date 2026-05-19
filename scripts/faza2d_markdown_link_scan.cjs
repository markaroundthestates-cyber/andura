#!/usr/bin/env node
// Faza 2D scan for markdown-style links to .md files in WIKI LAYER
// Excludes:
//   - _archive/ (immutable)
//   - 📥_inbox/ (raw layer, preserved per HARD CONSTRAINTS)
//   - .html refs (mockup, per Faza 2C decision)
//   - .yml refs (workflow, per Faza 2C decision)
// Goal: find [text](path.md) → candidates to convert to [[wikilink]]

const fs = require('fs');

const allMdFiles = fs.readFileSync('tmp_faza2d_files.txt', 'utf8')
  .split('\n')
  .filter(l => l.trim())
  .map(l => l.replace(/^\.\//, ''));

// WIKI LAYER scope for source scan: exclude _archive, _inbox, .obsidian
const wikiLayer = allMdFiles.filter(f =>
  !f.includes('_archive/') &&
  !f.startsWith('📥_inbox/')
);

// Pattern: [text](something.md OR something.md#anchor)
// NOT match: html, yml, other extensions, http(s)://, mailto:
const mdLinkPattern = /\[([^\]]*)\]\(([^)]+\.md(?:#[^)]*)?)\)/g;

const findings = [];

for (const file of wikiLayer) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip code blocks - need full content scan, skip simple backtick lines
    // For simplicity: skip if line is inside fenced code block (we'll do precise per-line for now)
    // Skip backtick-quoted in line
    let match;
    mdLinkPattern.lastIndex = 0;
    while ((match = mdLinkPattern.exec(line)) !== null) {
      const fullMatch = match[0];
      const text = match[1];
      const linkPath = match[2];

      // Check if this match is inside backticks on this line
      const matchStart = match.index;
      const before = line.substring(0, matchStart);
      const backticksBefore = (before.match(/`/g) || []).length;
      if (backticksBefore % 2 === 1) continue; // inside backticks

      // Skip http/https/mailto
      if (/^(https?:\/\/|mailto:)/.test(linkPath)) continue;

      findings.push({
        file,
        line: i + 1,
        match: fullMatch,
        text,
        linkPath,
      });
    }
  }
}

console.log(`Total markdown .md link findings: ${findings.length}\n`);

// Group by file
const byFile = {};
for (const f of findings) {
  if (!byFile[f.file]) byFile[f.file] = [];
  byFile[f.file].push(f);
}

for (const [file, items] of Object.entries(byFile).sort()) {
  console.log(`${file} (${items.length}):`);
  for (const it of items) {
    console.log(`  L${it.line}: ${it.match}`);
  }
}
