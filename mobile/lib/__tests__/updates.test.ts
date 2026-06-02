// ══ EXPO-UPDATES (OTA) POLICY TEST (WF-2) ═════════════════════════════════
// Verifies the §D102 mirror in mobile/lib/updates.ts:
//   - disabled (Updates.isEnabled=false, the dev/Expo-Go/not-configured state) →
//     no OTA calls; manual button still gives "up to date" feedback.
//   - enabled + no update available → no fetch/reload; manual → "up to date".
//   - enabled + update available + NO active session → fetch + reloadAsync.
//   - enabled + update available + ACTIVE session → fetch but NO reload (defer);
//     reload fires once the session ends.
//
// expo-updates is mocked (mobile/__mocks__/expo-updates.js, moduleNameMapper).
// The workout store is the real shared store — we flip sessionStart directly.

import * as Updates from 'expo-updates';
import { checkAndMaybeApply, __resetUpdatesForTests } from '../updates';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { toast } from '../../../src/react/lib/toast';

const mockUpdates = Updates as unknown as {
  isEnabled: boolean;
  __setEnabled: (value: boolean) => void;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

function lastToastMessages(): string[] {
  return toast.getSnapshot().map((it) => String(it.message));
}

describe('checkAndMaybeApply (OTA §D102 policy)', () => {
  beforeEach(() => {
    __resetUpdatesForTests();
    mockUpdates.__setEnabled(false);
    mockUpdates.checkForUpdateAsync.mockReset().mockResolvedValue({ isAvailable: false });
    mockUpdates.fetchUpdateAsync.mockReset().mockResolvedValue({ isNew: true });
    mockUpdates.reloadAsync.mockReset().mockResolvedValue(undefined);
    useWorkoutStore.setState({ sessionStart: null });
    for (const it of toast.getSnapshot()) toast.dismiss(it.id);
  });

  it('no-ops when OTA is disabled (dev / Expo Go / not configured)', async () => {
    await checkAndMaybeApply();
    expect(mockUpdates.checkForUpdateAsync).not.toHaveBeenCalled();
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();
  });

  it('manual check while disabled still gives "up to date" feedback', async () => {
    await checkAndMaybeApply({ notify: true });
    expect(lastToastMessages()).toContain('You have the latest version.');
  });

  it('enabled + no update available → no fetch, no reload', async () => {
    mockUpdates.__setEnabled(true);
    await checkAndMaybeApply({ notify: true });
    expect(mockUpdates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.fetchUpdateAsync).not.toHaveBeenCalled();
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();
    expect(lastToastMessages()).toContain('You have the latest version.');
  });

  it('enabled + update available + no active session → fetch + reload', async () => {
    mockUpdates.__setEnabled(true);
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    await checkAndMaybeApply();
    expect(mockUpdates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('enabled + update available + ACTIVE session → fetch but defer reload', async () => {
    mockUpdates.__setEnabled(true);
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    useWorkoutStore.setState({ sessionStart: Date.now() });

    await checkAndMaybeApply();
    expect(mockUpdates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();

    // Session ends → deferred update applies.
    useWorkoutStore.setState({ sessionStart: null });
    // The store subscription is synchronous; reloadAsync is fired (async no-op).
    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1);
  });
});
