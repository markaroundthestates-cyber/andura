// ══ RN TOAST SMOKE TEST (Wave 2b) ═════════════════════════════════════════
// ToastViewport consumes the SHARED pure store (src/react/lib/toast.ts) via
// useSyncExternalStore. Verifies: empty store renders nothing; after toast.show
// the viewport + the item card mount with the right testIDs.

import { render, screen, act } from '@testing-library/react-native';
import { ToastViewport } from '../Toast';
import { toast } from '../../../src/react/lib/toast';

describe('ToastViewport', () => {
  afterEach(() => {
    // Clear any leftover toasts between tests.
    for (const item of toast.getSnapshot()) toast.dismiss(item.id);
  });

  it('renders nothing when the store is empty', () => {
    render(<ToastViewport />);
    expect(screen.queryByTestId('toast-viewport')).toBeNull();
  });

  it('renders a toast card after toast.show', () => {
    render(<ToastViewport />);
    let id = '';
    act(() => {
      id = toast.show({ message: 'Saved', variant: 'success' });
    });
    expect(screen.getByTestId('toast-viewport')).toBeTruthy();
    expect(screen.getByTestId(`toast-${id}`)).toBeTruthy();
  });
});
