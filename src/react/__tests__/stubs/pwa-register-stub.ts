// §S-12 test stub — `virtual:pwa-register` is a Vite-injected virtual module
// that does not exist on disk; vitest does not run the VitePWA plugin, so Vite
// import-analysis cannot resolve `import('virtual:pwa-register')` in
// UpdatePrompt.tsx. vitest.config.js aliases the virtual specifier to this
// stub. Default behavior: registerSW is a no-op that never fires onNeedRefresh
// (mirrors the production fallback — banner stays hidden in tests). Individual
// tests `vi.doMock('virtual:pwa-register', ...)` to exercise the update path.

interface RegisterSWOptions {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  immediate?: boolean;
}

export function registerSW(_options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void> {
  return async () => {};
}
