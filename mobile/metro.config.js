// Metro config — extends the Expo default so the framework-agnostic engine
// living ABOVE this dir (repo-root `src/engine/**`, plain JS) resolves cleanly
// inside the RN bundle. Metro refuses to bundle files outside the project root
// unless they sit in a declared watchFolder, hence the repo-root entry.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;            // .../salafull/mobile
const repoRoot = path.resolve(projectRoot, '..'); // .../salafull

const config = getDefaultConfig(projectRoot);

// Let Metro read source files above mobile/ (the engine).
config.watchFolders = [repoRoot];

// Resolve deps from the mobile package first, then fall back to the repo root
// (Wave 0 keeps deps in mobile/; root fallback is harmless + future-proof).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(repoRoot, 'node_modules'),
];

module.exports = config;
