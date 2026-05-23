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
    // Note: restoreFromBackup has 2 overlapping signatures (autoBackup keyOrDaysAgo / dataCleanup jsonString).
    // Typed union expresses both call shapes; callers know which signature is live at runtime.
    // - autoBackup.js: (keyOrDaysAgo: string | number) => { restored: boolean, reason?: string, date?: string, keysRestored?: number }
    // - dataCleanup.js: (jsonString: string) => boolean
    restoreFromBackup?:
      | ((keyOrDaysAgo: string | number) => { restored: boolean; reason?: string; date?: string; keysRestored?: number })
      | ((jsonString: string) => boolean);
    createDailyBackup?: () => { key: string, date: string, size: number } | null;

    /** CDL backfill exposed for owner dev console. */
    runBackfill?: (opts?: { dryRun?: boolean, force?: boolean }) => { entriesCreated: number, errors: unknown[], skipped: unknown[] };
    getValidationSamples?: (count?: number) => unknown[];

    /** Data cleanup exposed for dev console. */
    resetTestData?: (opts?: { clearFirebase?: boolean, reload?: boolean }) => Promise<unknown>;
    fullReset?: (opts?: { clearFirebase?: boolean, reload?: boolean }) => Promise<unknown>;
    inspectStorage?: () => unknown;
    resetButKeepRealLogs?: (opts?: { reload?: boolean }) => Promise<unknown>;
    createAutoBackup?: () => unknown;
    restoreLastBackup?: () => unknown;

    /** Admin prefill localStorage owner data — dev/validation only. */
    adminPrefillAll?: () => { kcalsDays: number; protsDays: number; weightsDays: number };

    /** Restore Daniel's real workout logs into DB.logs (auto-restored on splash). */
    restoreRealLogs?: (opts?: { merge?: boolean }) => void;

    /** Firebase-side sync suppression flag (set during local-init / migrations). */
    _suppressFirebaseSync?: boolean;

    /** Director engine cache map (window-scoped lifetime per session). Includes invalidate() method for downstream consumers. */
    _directorCache?: Map<string, unknown> & { invalidate: () => void };

    /** Tombstones manual GC trigger from dev console. */
    gcTombstones?: () => number;

    /** Build-time Firebase API key injection (vite define). */
    __FIREBASE_API_KEY?: string;
  }
}
