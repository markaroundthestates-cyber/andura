// GATE B — CDL Backfill Validation Script
// Generat de Co-CTO Opus, 26 Apr 2026
// Rulează în DevTools Console pe http://localhost:5173/andura/

console.log('=== GATE B START ===');

const _gbBackup = {
  logs: localStorage.getItem('logs'),
  coachDecisions: localStorage.getItem('coach-decisions')
};
console.log('1. BACKUP SAVED (in case rollback needed):', _gbBackup);

const dryResult = window.runBackfill({ dryRun: true });
console.log('2. DRY RUN RESULT:', dryResult);
console.log('   Entries would be created:', dryResult.entriesCreated);
console.log('   Skipped count:', dryResult.skipped.length);
console.log('   Skipped reasons:', dryResult.skipped.map(s => s.reason));
console.log('   Errors:', dryResult.errors);

if (dryResult.errors.length === 0) {
  const realResult = window.runBackfill();
  console.log('3. REAL RUN RESULT:', realResult);
  const samples = window.getValidationSamples(10);
  console.log('4. RANDOM 10 SAMPLES:');
  samples.forEach((s, i) => {
    console.log(`Sample ${i+1}:`, {
      date: s.date,
      sessionType: s.proposed.sessionType,
      exercises: s.proposed.exercises,
      calibration: s.context.calibrationLevel,
      isInCut: s.context.isInCut,
      proposedSets: s.proposed.proposedSets
    });
  });
  console.log('=== GATE B COMPLETE — copy output and send to Claude ===');
} else {
  console.log('3. SKIP REAL RUN — errors in dry run');
  console.log('=== GATE B FAILED — investigate errors ===');
}
