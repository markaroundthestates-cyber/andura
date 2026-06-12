// §SECURITY-HIGH-1-SENTRY-FIX (DIM 10 SECURITY-AUDIT-DEEPER chat 5) +
// founder pick 2026-06-12 (crash reporting DEFAULT-ON, opt-out). The gate is
// still telemetryOptIn-driven; only the DEFAULT changed from FALSE → TRUE. So a
// fresh user reports crashes; a user who opts OUT (telemetryOptIn=false) keeps
// initSentry un-fired. The gate condition + subscribe lazy-init logic are
// unchanged — these tests cover that the gate respects the flag value either way.
//
// Tests exercita pattern logic direct (gate condition + subscribe behavior)
// fara a importa main.tsx (care porneste full React tree). Daca pattern
// drifteaza in main.tsx → asertiile prod-source aici detecteaza regression.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSettingsStore } from '../react/stores/settingsStore';

const initSentryMock = vi.fn();

beforeEach(() => {
  initSentryMock.mockClear();
  useSettingsStore.getState().reset();
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Sentry consent gate — telemetryOptIn default behavior', () => {
  it('telemetryOptIn default este TRUE per settingsStore spec (founder 2026-06-12)', () => {
    expect(useSettingsStore.getState().telemetryOptIn).toBe(true);
  });

  it('cu default ON, gate condition declanseaza initSentry (fresh user)', () => {
    // Replica gate logic main.tsx §SECURITY-HIGH-1-SENTRY-FIX.
    if (useSettingsStore.getState().telemetryOptIn) {
      initSentryMock();
    }
    expect(initSentryMock).toHaveBeenCalledTimes(1);
  });

  it('cu telemetryOptIn=FALSE (opt-out), gate condition NU declanseaza initSentry', () => {
    useSettingsStore.getState().setTelemetryOptIn(false);
    if (useSettingsStore.getState().telemetryOptIn) {
      initSentryMock();
    }
    expect(initSentryMock).not.toHaveBeenCalled();
  });
});

describe('Sentry consent gate — subscribe toggle false->true triggers init', () => {
  it('subscribe declanseaza initSentry cand telemetryOptIn devine TRUE', () => {
    // Default is now ON; opt OUT first so the re-opt-in is a real false->true
    // transition (the mid-session lazy-init path).
    useSettingsStore.getState().setTelemetryOptIn(false);

    // Replica subscribe logic main.tsx §SECURITY-HIGH-1-SENTRY-FIX.
    const unsub = useSettingsStore.subscribe((state, prevState) => {
      if (state.telemetryOptIn && !prevState.telemetryOptIn) {
        initSentryMock();
      }
    });

    expect(initSentryMock).not.toHaveBeenCalled();

    // User re-opts-in via SettingsPrivacy toggle.
    useSettingsStore.getState().setTelemetryOptIn(true);

    expect(initSentryMock).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('subscribe NU re-declanseaza initSentry cand telemetryOptIn stable TRUE', () => {
    useSettingsStore.getState().setTelemetryOptIn(true);

    const unsub = useSettingsStore.subscribe((state, prevState) => {
      if (state.telemetryOptIn && !prevState.telemetryOptIn) {
        initSentryMock();
      }
    });

    // Unrelated state change (theme).
    useSettingsStore.getState().setTheme('dark');

    expect(initSentryMock).not.toHaveBeenCalled();

    unsub();
  });

  it('subscribe NU declanseaza initSentry cand telemetryOptIn devine FALSE', () => {
    useSettingsStore.getState().setTelemetryOptIn(true);

    const unsub = useSettingsStore.subscribe((state, prevState) => {
      if (state.telemetryOptIn && !prevState.telemetryOptIn) {
        initSentryMock();
      }
    });

    useSettingsStore.getState().setTelemetryOptIn(false);

    expect(initSentryMock).not.toHaveBeenCalled();

    unsub();
  });
});

describe('Sentry consent gate — production source integration (anti-drift)', () => {
  it('main.tsx contine gate condition pe useSettingsStore.getState().telemetryOptIn', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/main.tsx'),
      'utf-8',
    );
    expect(src).toContain('useSettingsStore');
    expect(src).toMatch(/if\s*\(\s*useSettingsStore\.getState\(\)\.telemetryOptIn\s*\)/);
    expect(src).toMatch(/initSentry\(\)/);
  });

  it('main.tsx contine subscribe lazy-init pentru toggle false->true', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/main.tsx'),
      'utf-8',
    );
    expect(src).toMatch(/useSettingsStore\.subscribe/);
    expect(src).toMatch(/state\.telemetryOptIn\s*&&\s*!prevState\.telemetryOptIn/);
  });

  it('main.tsx NU contine apel unconditional initSentry pre-gate', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/main.tsx'),
      'utf-8',
    );
    // Anti-regression: NU permitem revert la unconditional initSentry().
    // Gate condition trebuie sa preceada orice apel initSentry.
    const initCalls = src.match(/initSentry\(\)/g) ?? [];
    expect(initCalls.length).toBeGreaterThan(0);

    // Verificam ca primul apel initSentry e inauntru if-block sau subscribe
    // callback (NU top-level direct dupa applyInitialTheme).
    expect(src).not.toMatch(/applyInitialTheme\(\);\s*\n\s*\/\/[^\n]*\n\s*initSentry\(\);/);
  });
});
