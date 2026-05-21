// ══ GLOBAL WINDOW AUGMENTATION — A022a iter 2 prep ════════════════════════
// §A022a audit fix — owner-debug global helpers exposed via `window.*` for
// dev console + admin restore flows. Keep narrow; production builds tree-shake
// unused branches.

export {};

interface ImportMetaEnv {
  readonly MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_RTDB_URL?: string;
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
  readonly [key: string]: string | boolean | undefined;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    /** Sentry instance exposed for DevTools manual testing in production. */
    Sentry?: unknown;
    testSentry?: (msg?: string) => void;

    /** Auto-backup exposed for UI access. */
    listBackups?: () => Array<{ key: string, date: string, timestamp: number }>;
    restoreFromBackup?: (keyOrDaysAgo: string | number) => { restored: boolean, date?: string, keysRestored?: number, reason?: string };
    createDailyBackup?: () => { key: string, date: string, size: number } | null;

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
