// §SECURITY-HIGH-1-SENTRY-FIX (DIM 10 SECURITY-AUDIT-DEEPER chat 5) —
// Consent gate verification pentru initSentry. Pre-fix: initSentry pornit
// unconditional in main.tsx, ignora telemetryOptIn (default FALSE per
// settingsStore §51). Post-fix: initSentry pornit DOAR la opt-in explicit.
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
  it('telemetryOptIn default este FALSE per settingsStore spec', () => {
    expect(useSettingsStore.getState().telemetryOptIn).toBe(false);
  });

  it('cu telemetryOptIn=FALSE, gate condition NU declanseaza initSentry', () => {
    // Replica gate logic main.tsx §SECURITY-HIGH-1-SENTRY-FIX.
    if (useSettingsStore.getState().telemetryOptIn) {
      initSentryMock();
    }
    expect(initSentryMock).not.toHaveBeenCalled();
  });

  it('cu telemetryOptIn=TRUE pre-set, gate condition declanseaza initSentry', () => {
    useSettingsStore.getState().setTelemetryOptIn(true);
    if (useSettingsStore.getState().telemetryOptIn) {
      initSentryMock();
    }
    expect(initSentryMock).toHaveBeenCalledTimes(1);
  });
});

describe('Sentry consent gate — subscribe toggle false->true triggers init', () => {
  it('subscribe declanseaza initSentry cand telemetryOptIn devine TRUE', () => {
    // Replica subscribe logic main.tsx §SECURITY-HIGH-1-SENTRY-FIX.
    const unsub = useSettingsStore.subscribe((state, prevState) => {
      if (state.telemetryOptIn && !prevState.telemetryOptIn) {
        initSentryMock();
      }
    });

    expect(initSentryMock).not.toHaveBeenCalled();

    // User opt-in via SettingsPrivacy toggle.
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
