// Checkly config load-probe — replicates `checkly deploy`'s load sequence
// (loadChecklyConfig + parseProject) WITHOUT auth, so construct/API misuse
// fails HERE instead of in the checkly-deploy CI job.
//
// Why this exists: checkly.config.ts + check files are NOT covered by
// `tsc --noEmit` (outside tsconfig include) and only execute inside the CLI's
// jiti loader at deploy time. That gap shipped two reds in one day
// (2026-06-12): a @playwright/test dual-instance crash, then a
// AssertionBuilder.body() call that doesn't exist in checkly 7.15.0.
//
// Run: node scripts/ci/checkly-load-probe.cjs   (from repo root)
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const { loadChecklyConfig } = require(path.join(root, 'node_modules/checkly/dist/services/checkly-config-loader.js'));
const { parseProject } = require(path.join(root, 'node_modules/checkly/dist/services/project-parser.js'));

(async () => {
  const { config, constructs } = await loadChecklyConfig(root);
  console.log('CONFIG OK:', config.projectName, '| config-file constructs:', constructs.length);
  const runtimeStub = { name: '2025.04', stage: 'CURRENT', runtimeEndOfLife: null, dependencies: {} };
  const project = await parseProject({
    directory: root,
    projectLogicalId: config.logicalId,
    projectName: config.projectName,
    repoUrl: config.repoUrl,
    checkMatch: config.checks?.checkMatch,
    browserCheckMatch: config.checks?.browserChecks?.testMatch,
    multiStepCheckMatch: config.checks?.multiStepChecks?.testMatch,
    ignoreDirectoriesMatch: config.checks?.ignoreDirectoriesMatch,
    checkDefaults: config.checks,
    browserCheckDefaults: config.checks?.browserChecks,
    availableRuntimes: { '2025.04': runtimeStub },
    defaultRuntimeId: '2025.04',
    verifyRuntimeDependencies: false,
    checklyConfigConstructs: constructs,
    playwrightConfigPath: config.checks?.playwrightConfigPath,
    include: config.checks?.include,
    playwrightChecks: config.checks?.playwrightChecks,
  });
  const checkIds = Object.keys(project.data?.check ?? {});
  if (checkIds.length === 0) {
    console.error('PROBE FAILED: project parsed but contains ZERO checks — checkMatch glob matches nothing?');
    process.exit(1);
  }
  console.log('PARSE OK — checks found:', checkIds.length);
  checkIds.forEach((id) => console.log('  -', id));
  process.exit(0);
})().catch((e) => { console.error('PROBE FAILED:', e.message); process.exit(1); });
