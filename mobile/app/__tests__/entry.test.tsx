// ══ We — ENTRY + ONBOARDING screen-wave tests (RNTL) ══════════════════════
// Store-connected proof that the ported top-level screens (Splash, Auth,
// AuthCallback, Onboarding wizard, Terms, Privacy, NotFound) render under
// jest-expo with the MMKV mock + the dual-React moduleNameMapper. expo-router +
// expo-linking are the framework edges → stubbed per-file. We assert the stable
// testIDs + the load-bearing behavior: splash auto-advance routing, the auth
// magic-link send + skip-auth + mode switch, the auth-callback verify routing,
// and the onboarding step gate + finalize.

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';

// ── expo-router stub ─────────────────────────────────────────────────────────
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  useLocalSearchParams: jest.fn(() => ({})),
}));

// ── expo-linking stub ────────────────────────────────────────────────────────
jest.mock('expo-linking', () => ({
  __esModule: true,
  createURL: (path: string) => `andura://${path.replace(/^\//, '')}`,
  openURL: jest.fn(() => Promise.resolve()),
  useURL: jest.fn(() => null),
}));

// ── auth.js stub — keep isAuthenticated controllable, magic-link returns ok ──
jest.mock('../../../src/auth.js', () => ({
  __esModule: true,
  isAuthenticated: jest.fn(() => false),
  sendMagicLink: jest.fn(() => Promise.resolve({ ok: true, email: 'a@b.ro' })),
  verifyMagicLink: jest.fn(() => Promise.resolve({ ok: true, uid: 'u1' })),
  parseMagicLinkUrl: jest.fn(() => ({ oobCode: null, email: null })),
  getPendingEmail: jest.fn(() => null),
  buildGoogleSignInUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/v2/auth'),
  signInWithGoogleIdToken: jest.fn(() => Promise.resolve({ ok: true })),
  AUTH_STORAGE_KEYS: { pendingEmail: 'pe', pendingEmailExpiry: 'pex' },
}));

// runPostAuthSync is async cloud work — no-op under jest.
jest.mock('../../../src/react/lib/reactBoot', () => ({
  __esModule: true,
  runPostAuthSync: jest.fn(() => Promise.resolve()),
}));

import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as authMod from '../../../src/auth.js';

const useURLMock = Linking.useURL as unknown as jest.Mock;

const replaceMock = router.replace as jest.Mock;
const pushMock = router.push as jest.Mock;
const useParamsMock = useLocalSearchParams as unknown as jest.Mock;
const sendMagicLink = authMod.sendMagicLink as jest.Mock;
const isAuthenticated = authMod.isAuthenticated as jest.Mock;

import Splash from '../index';
import Auth from '../auth/index';
import AuthCallback from '../auth-callback';
import Onboarding from '../onboarding/[step]';
import Terms from '../terms';
import Privacy from '../privacy';
import NotFound from '../+not-found';
import { useAppStore } from '../../../src/react/stores/appStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';

beforeEach(() => {
  replaceMock.mockClear();
  pushMock.mockClear();
  useParamsMock.mockReturnValue({});
  isAuthenticated.mockReturnValue(false);
  useURLMock.mockReturnValue(null);
  sendMagicLink.mockClear();
  (authMod.verifyMagicLink as jest.Mock).mockClear();
  (authMod.parseMagicLinkUrl as jest.Mock).mockReturnValue({ oobCode: null, email: null });
  act(() => {
    useAppStore.setState({ isSkipAuth: false, isAuthenticated: false });
  });
});

describe('Splash', () => {
  it('renders the brand + trust footer', () => {
    render(<Splash />);
    expect(screen.getByTestId('splash')).toBeTruthy();
    expect(screen.getByTestId('splash-trust-footer')).toBeTruthy();
  });

  it('a tap on an anon session routes to /auth', () => {
    render(<Splash />);
    fireEvent.press(screen.getByTestId('splash'));
    expect(replaceMock).toHaveBeenCalledWith('/auth');
  });

  it('a tap with a stored session routes to the home tab', () => {
    isAuthenticated.mockReturnValue(true);
    render(<Splash />);
    fireEvent.press(screen.getByTestId('splash'));
    expect(replaceMock).toHaveBeenCalledWith('/app/antrenor');
  });
});

describe('Auth', () => {
  it('renders the login form + blocks send until a valid email', () => {
    render(<Auth />);
    expect(screen.getByTestId('auth')).toBeTruthy();
    expect(screen.getByTestId('auth-email-input')).toBeTruthy();
    fireEvent.press(screen.getByTestId('auth-send'));
    expect(sendMagicLink).not.toHaveBeenCalled();
  });

  it('sends a magic link with the app deep-link continueUrl + shows the sent card', async () => {
    render(<Auth />);
    fireEvent.changeText(screen.getByTestId('auth-email-input'), 'gigel@andura.ro');
    await act(async () => {
      fireEvent.press(screen.getByTestId('auth-send'));
    });
    expect(sendMagicLink).toHaveBeenCalledWith('gigel@andura.ro', 'andura://auth-callback');
    expect(screen.getByTestId('auth-sent')).toBeTruthy();
  });

  it('skip-auth test drive sets the flag + routes to onboarding', () => {
    render(<Auth />);
    fireEvent.press(screen.getByTestId('auth-skip'));
    expect(useAppStore.getState().isSkipAuth).toBe(true);
    expect(replaceMock).toHaveBeenCalledWith('/onboarding/1');
  });

  it('starts in signup mode + gates send on the consent checkbox', () => {
    useParamsMock.mockReturnValue({ mode: 'signup' });
    render(<Auth />);
    expect(screen.getByTestId('auth-consent')).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('auth-email-input'), 'nou@andura.ro');
    // Consent unchecked → send is a no-op.
    fireEvent.press(screen.getByTestId('auth-send'));
    expect(sendMagicLink).not.toHaveBeenCalled();
    // Check consent → send fires.
    fireEvent.press(screen.getByTestId('auth-consent-checkbox'));
    fireEvent.press(screen.getByTestId('auth-send'));
    expect(sendMagicLink).toHaveBeenCalled();
  });
});

describe('AuthCallback', () => {
  it('renders the verifying state', () => {
    render(<AuthCallback />);
    expect(screen.getByTestId('auth-callback')).toBeTruthy();
    expect(screen.getByTestId('auth-callback-spinner')).toBeTruthy();
  });

  it('on a valid magic link deep link verifies + routes into the app', async () => {
    // The deep link that opened the app (expo-linking useURL).
    useURLMock.mockReturnValue('andura://auth-callback?oobCode=oob1&email=a%40b.ro');
    (authMod.parseMagicLinkUrl as jest.Mock).mockReturnValue({ oobCode: 'oob1', email: 'a@b.ro' });
    render(<AuthCallback />);
    await waitFor(() => expect(authMod.verifyMagicLink).toHaveBeenCalledWith('a@b.ro', 'oob1'));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/app/antrenor'));
  });
});

describe('Onboarding wizard', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingStore.setState((s) => ({
        data: { ...s.data, age: null, sex: null, trainingType: 'gym', goal: null, frequency: null, experience: null, weight: null, height: null },
        completed: false,
      }));
    });
  });

  it('renders step 1 (age) with the big-number field', () => {
    useParamsMock.mockReturnValue({ step: '1' });
    render(<Onboarding />);
    expect(screen.getByTestId('onboarding-step-1')).toBeTruthy();
    expect(screen.getByTestId('onb-age-input')).toBeTruthy();
    expect(screen.getByTestId('progress-dot-1')).toBeTruthy();
  });

  it('blocks Continua on an empty step (no navigation)', () => {
    useParamsMock.mockReturnValue({ step: '1' });
    render(<Onboarding />);
    fireEvent.press(screen.getByTestId('onb-next'));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('commits a valid age + advances to the next step', () => {
    useParamsMock.mockReturnValue({ step: '1' });
    render(<Onboarding />);
    fireEvent.changeText(screen.getByTestId('onb-age-input'), '32');
    expect(useOnboardingStore.getState().data.age).toBe(32);
    fireEvent.press(screen.getByTestId('onb-next'));
    expect(pushMock).toHaveBeenCalledWith('/onboarding/2');
  });

  it('renders the summary on the last step + finalizes into the app when complete', () => {
    act(() => {
      useOnboardingStore.setState((s) => ({
        data: { ...s.data, age: 30, sex: 'm', trainingType: 'gym', goal: 'auto', frequency: '3', experience: 'incepator', weight: 80, height: 180 },
      }));
    });
    useParamsMock.mockReturnValue({ step: '9' });
    render(<Onboarding />);
    expect(screen.getByTestId('onb-summary')).toBeTruthy();
    fireEvent.press(screen.getByTestId('onb-next'));
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(replaceMock).toHaveBeenCalledWith('/app/antrenor');
  });
});

describe('Legal + NotFound', () => {
  it('renders the scrollable Terms page', () => {
    render(<Terms />);
    expect(screen.getByTestId('terms-page')).toBeTruthy();
    expect(screen.getByTestId('terms-back')).toBeTruthy();
  });

  it('renders the scrollable Privacy page', () => {
    render(<Privacy />);
    expect(screen.getByTestId('privacy-page')).toBeTruthy();
    expect(screen.getByTestId('privacy-back')).toBeTruthy();
  });

  it('renders NotFound with a home link', () => {
    render(<NotFound />);
    expect(screen.getByTestId('not-found-page')).toBeTruthy();
    fireEvent.press(screen.getByTestId('not-found-home'));
    expect(replaceMock).toHaveBeenCalledWith('/');
  });
});
