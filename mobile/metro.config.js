// Metro config — extends the Expo default so the framework-agnostic engine
// living ABOVE this dir (repo-root `src/**`, plain JS) resolves cleanly inside
// the RN bundle. Metro refuses to bundle files outside the project root unless
// they sit in a declared watchFolder.
//
// IMPORTANT: watch ONLY `../src` (source files), NOT the whole repo root. The
// repo root carries the web app's node_modules (thousands of packages), `.git`,
// and the Obsidian vault — crawling all of it timed out Metro's file watcher
// ("Failed to start watch mode") and left the dependency graph empty. `src/`
// is bounded source only, so the watcher starts instantly.
//
// NativeWind v4 (Wave 2): `withNativeWind` wires the Tailwind CSS pipeline into
// Metro (compiles `global.css` → RN style objects). Applied last so it wraps the
// engine-scoped resolver config above.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;                           // .../salafull/mobile
const srcRoot = path.resolve(projectRoot, '..', 'src');  // .../salafull/src

const config = getDefaultConfig(projectRoot);

// Let Metro read the engine source above mobile/ — scoped to src/ only.
config.watchFolders = [srcRoot];

// Resolve deps from the mobile package ONLY (never the web app's node_modules,
// which would pull conflicting react/react-native versions).
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = withNativeWind(config, { input: './global.css' });
