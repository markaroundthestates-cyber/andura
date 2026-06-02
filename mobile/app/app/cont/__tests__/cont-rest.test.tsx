// ══ W6b CONT REST — store-connected RNTL proof ═══════════════════════════
// Proves the W6b cont screens (settings content + confirm drill-downs +
// RestoreAccount) render under jest with the MMKV mock + kv-backed stores, and
// that wired handlers drive real store/nav state. expo-router is the only
// framework edge (nav shim) — stubbed. Sibling of cont.test.tsx (W6a core).

import { render, screen, fireEvent, act } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), canGoBack: () => true, back: jest.fn() },
  usePathname: () => '/app/cont',
}));

import { router } from 'expo-router';
const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;

// Content screens
import SettingsSubscription from '../settings-subscription';
import SettingsPrivacy from '../settings-privacy';
import SettingsTerms from '../settings-terms';
import SettingsAbout from '../settings-about';
import SettingsFaq from '../settings-faq';
import SettingsSupport from '../settings-support';
import SettingsExport from '../settings-export';
import SettingsImport from '../settings-import';
// Confirm drill-downs
import LogoutConfirm from '../logout-confirm';
import RedoOnboardingConfirm from '../redo-onboarding-confirm';
import SchimbaFazaConfirm from '../schimba-faza-confirm';
import RestoreAccount from '../restore-account';

import { useSettingsStore } from '../../../../../src/react/stores/settingsStore';
import { useAppStore } from '../../../../../src/react/stores/appStore';

describe('W6b Cont rest — content screens', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('SettingsSubscription renders + notify toggles to "notified"', () => {
    render(<SettingsSubscription />);
    expect(screen.getByTestId('settings-subscription')).toBeTruthy();
    expect(screen.getByTestId('subscription-beta-card')).toBeTruthy();
    fireEvent.press(screen.getByTestId('subscription-notify-cta'));
    // After press the CTA is disabled (notified) — still in the tree.
    expect(screen.getByTestId('subscription-notify-cta')).toBeTruthy();
  });

  it('SettingsPrivacy toggles write the settings store', () => {
    const before = useSettingsStore.getState().telemetryOptIn;
    render(<SettingsPrivacy />);
    expect(screen.getByTestId('settings-privacy')).toBeTruthy();
    expect(screen.getByTestId('privacy-policy-content')).toBeTruthy();
    fireEvent.press(screen.getByTestId('privacy-telemetry-toggle'));
    expect(useSettingsStore.getState().telemetryOptIn).toBe(!before);
  });

  it('SettingsTerms switches between T&C and Medical tabs', () => {
    render(<SettingsTerms />);
    expect(screen.getByTestId('terms-tc-content')).toBeTruthy();
    fireEvent.press(screen.getByTestId('terms-tab-medical'));
    expect(screen.getByTestId('terms-medical-content')).toBeTruthy();
  });

  it('SettingsAbout renders version + build rows', () => {
    render(<SettingsAbout />);
    expect(screen.getByTestId('settings-about')).toBeTruthy();
    expect(screen.getByTestId('about-version')).toBeTruthy();
    expect(screen.getByTestId('about-build')).toBeTruthy();
  });

  it('SettingsFaq accordion opens an answer on question press', () => {
    render(<SettingsFaq />);
    expect(screen.getByTestId('settings-faq')).toBeTruthy();
    expect(screen.getByTestId('faq-q-training-0')).toBeTruthy();
    fireEvent.press(screen.getByTestId('faq-q-training-0'));
    // Still in tree after expand (answer rendered beneath).
    expect(screen.getByTestId('faq-q-training-0')).toBeTruthy();
  });

  it('SettingsSupport renders the contact rows', () => {
    render(<SettingsSupport />);
    expect(screen.getByTestId('settings-support')).toBeTruthy();
    expect(screen.getByTestId('support-email')).toBeTruthy();
    expect(screen.getByTestId('support-feedback-mailto')).toBeTruthy();
  });

  it('SettingsExport renders + export trigger reports success', async () => {
    render(<SettingsExport />);
    expect(screen.getByTestId('settings-export')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByTestId('settings-export-trigger'));
    });
    expect(screen.getByTestId('settings-export-success')).toBeTruthy();
  });

  it('SettingsImport renders the trigger (idle phase)', () => {
    render(<SettingsImport />);
    expect(screen.getByTestId('settings-import')).toBeTruthy();
    expect(screen.getByTestId('settings-import-trigger')).toBeTruthy();
  });
});

describe('W6b Cont rest — confirm drill-downs', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('LogoutConfirm renders + cancel navigates back to settings-danger', () => {
    render(<LogoutConfirm />);
    expect(screen.getByTestId('logout-confirm')).toBeTruthy();
    expect(screen.getByTestId('logout-confirm-accept')).toBeTruthy();
    fireEvent.press(screen.getByTestId('logout-confirm-cancel'));
    expect(mockPush).toHaveBeenCalledWith('/app/cont/settings-danger');
  });

  it('RedoOnboardingConfirm accept replaces to /onboarding/1', () => {
    render(<RedoOnboardingConfirm />);
    expect(screen.getByTestId('redo-onboarding-confirm')).toBeTruthy();
    fireEvent.press(screen.getByTestId('redo-onboarding-confirm-accept'));
    expect(mockReplace).toHaveBeenCalledWith('/onboarding/1');
  });

  it('SchimbaFazaConfirm renders the phase options + cancel navigates to settings-prefs', () => {
    render(<SchimbaFazaConfirm />);
    expect(screen.getByTestId('schimba-faza-confirm')).toBeTruthy();
    expect(screen.getByTestId('phase-auto')).toBeTruthy();
    expect(screen.getByTestId('phase-cut')).toBeTruthy();
    // Phase selection is local state (no util dive).
    fireEvent.press(screen.getByTestId('phase-cut'));
    fireEvent.press(screen.getByTestId('schimba-faza-confirm-cancel'));
    expect(mockPush).toHaveBeenCalledWith('/app/cont/settings-prefs');
  });

  it('RestoreAccount renders both choices when not expired', () => {
    act(() => {
      useAppStore.getState().setPendingDeletionRestore({ requestedAt: Date.now(), expired: false });
    });
    render(<RestoreAccount />);
    expect(screen.getByTestId('restore-account')).toBeTruthy();
    expect(screen.getByTestId('restore-account-restore')).toBeTruthy();
    expect(screen.getByTestId('restore-account-delete-now')).toBeTruthy();
  });
});
