// ══ GLOBAL WINDOW AUGMENTATION — A022a iter 2 prep ════════════════════════
// §A022a audit fix — owner-debug global helpers exposed via `window.*` for
// dev console + admin restore flows. Keep narrow; production builds tree-shake
// unused branches.

export {};

declare global {
  interface Window {
    /** Admin prefill localStorage owner data — dev/validation only. */
    adminPrefillAll?: () => { kcalsDays: number; protsDays: number; weightsDays: number };

    /** Restore Daniel's real workout logs into DB.logs (auto-restored on splash). */
    restoreRealLogs?: (opts?: { merge?: boolean }) => void;

    /** Firebase-side sync suppression flag (set during local-init / migrations). */
    _suppressFirebaseSync?: boolean;

    /** Director engine cache map (window-scoped lifetime per session). */
    _directorCache?: Map<string, unknown>;

    /** Manual sync trigger from dev console. */
    syncToFirebase?: () => Promise<void>;
    syncFromFirebase?: () => Promise<void>;

    /** Tombstones manual GC trigger from dev console. */
    gcTombstones?: () => number;

    /** Build-time Firebase API key injection (vite define). */
    __FIREBASE_API_KEY?: string;
  }
}
