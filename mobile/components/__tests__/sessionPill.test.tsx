// ══ RN STORE-CONNECTED PROOF (W2c) ════════════════════════════════════════
// Canonical proof that a store-connected component renders under jest with the
// MMKV mock (jest.setupBefore.js). The screen waves rely on this: importing
// kv-backed Zustand stores (src/react/stores/*) — which hydrate persist at
// require time via kv.native.js → react-native-mmkv — must NOT crash, and
// seeding store state must drive the rendered output.
//
// SessionPill is the canonical case: it consumes workoutStore + onboardingStore
// + getTodayWorkout (engine wrappers) with NO required props (web parity). We
// stub expo-router (usePathname / router.push) — the only framework edge — then
// seed an active session and assert the pill renders live with its testID +
// busy state. A second case asserts the idle store yields null (route-agnostic
// honest empty).

import { render, screen, act } from '@testing-library/react-native';

// expo-router is the only framework edge SessionPill touches. Stub usePathname
// to a NON-guarded tab path (so the route guard does not suppress the pill) and
// router.push to a noop — the store/engine logic is what this proves.
jest.mock('expo-router', () => ({
  usePathname: () => '/app/antrenor',
  router: { push: jest.fn() },
}));

import { SessionPill } from '../SessionPill';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { t } from '../../../src/i18n/index.js';

describe('SessionPill (store-connected)', () => {
  beforeEach(() => {
    // Clean slate per test — these setState calls go through the kv-backed
    // (MMKV-mock) persist middleware without crashing, proving the mock works.
    useWorkoutStore.setState({
      phase: 'idle',
      sessionStart: null,
      pausedSnapshot: null,
      lastSession: null,
      exIdx: 0,
    });
    // Merge into the existing (default-EMPTY) data so the full OnboardingData
    // shape stays valid — only the aerobic mode-gate input matters here.
    useOnboardingStore.setState((s) => ({
      data: { ...s.data, trainingType: 'gym' },
    }));
  });

  it('renders the live pill when the store holds an active session', () => {
    const start = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    act(() => {
      useWorkoutStore.setState({
        phase: 'logging',
        sessionStart: start,
        exIdx: 0,
      });
    });

    render(<SessionPill />);

    const pill = screen.getByTestId('session-pill');
    expect(pill).toBeTruthy();
    // data-state=active web parity → accessibilityState.busy on RN.
    expect(pill.props.accessibilityState.busy).toBe(true);
    // aria-label = sessionPill.ariaLabel (locale-agnostic — assert via i18n `t`).
    expect(pill.props.accessibilityLabel).toBe(t('sessionPill.ariaLabel'));
    // Live label = "{exercise} · {min} min" — engine may return the generic
    // "Sesiune" fallback under jest (no seeded plan), but the minutes are live.
    const labelNode = screen.getByText(/min$/);
    expect(labelNode).toBeTruthy();
  });

  it('renders nothing when the session is idle', () => {
    render(<SessionPill />);
    expect(screen.queryByTestId('session-pill')).toBeNull();
  });
});
