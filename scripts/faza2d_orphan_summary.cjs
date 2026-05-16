#!/usr/bin/env node
// Summarize Faza 2D scan: list orphans + LEAF files with low inbound (1-2) + count distributions
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp_faza2d_scan.json', 'utf8'));

console.log('=== ORPHANS (zero inbound) ===');
for (const r of data.results.filter(r => r.classification === 'ORPHAN')) {
  console.log(`  ${r.file} (inbound: ${r.totalInbound})`);
}

console.log('\n=== LEAF with very LOW inbound (1) ===');
for (const r of data.results.filter(r => r.classification === 'LEAF' && r.totalInbound === 1)) {
  const src = r.sources[0];
  console.log(`  ${r.file} → from ${src.src} (wiki=${src.wiki} md=${src.md})`);
}

console.log('\n=== LEAF with LOW inbound (2-3) ===');
for (const r of data.results.filter(r => r.classification === 'LEAF' && r.totalInbound >= 2 && r.totalInbound <= 3)) {
  console.log(`  ${r.file} (inbound: ${r.totalInbound}) from: ${r.sources.map(s => s.src).join(', ')}`);
}

console.log('\n=== PROTECTED ===');
for (const r of data.results.filter(r => r.classification === 'PROTECTED')) {
  console.log(`  ${r.file} (inbound: ${r.totalInbound})`);
}

console.log('\n=== HUB ===');
for (const r of data.results.filter(r => r.classification === 'HUB')) {
  console.log(`  ${r.file} (inbound: ${r.totalInbound})`);
}
