import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InstallPrompt } from '../../components/InstallPrompt';

beforeEach(() => {
  localStorage.clear();
});

function dispatchBeforeInstall(): Event {
  const event = new Event('beforeinstallprompt');
  Object.assign(event, {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  });
  window.dispatchEvent(event);
  return event;
}

describe('InstallPrompt — PWA installable banner', () => {
  it('renders nothing when no beforeinstallprompt event fired', () => {
    render(<InstallPrompt />);
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('renders banner when beforeinstallprompt fired', () => {
    render(<InstallPrompt />);
    act(() => {
      dispatchBeforeInstall();
    });
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    expect(screen.getByText(/Instaleaza Andura/i)).toBeInTheDocument();
  });

  it('dismiss button hides banner + persists localStorage flag', () => {
    render(<InstallPrompt />);
    act(() => {
      dispatchBeforeInstall();
    });
    fireEvent.click(screen.getByTestId('install-prompt-dismiss'));
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    expect(localStorage.getItem('wv2-install-prompt-dismissed')).toBe('1');
  });

  it('post-dismiss persisted: subsequent mount does NOT render banner', () => {
    localStorage.setItem('wv2-install-prompt-dismissed', '1');
    render(<InstallPrompt />);
    act(() => {
      dispatchBeforeInstall();
    });
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('install button calls deferred prompt method', async () => {
    render(<InstallPrompt />);
    let promptFn: ReturnType<typeof vi.fn> | null = null;
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      promptFn = vi.fn(() => Promise.resolve());
      Object.assign(event, {
        prompt: promptFn,
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      });
      window.dispatchEvent(event);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('install-prompt-accept'));
    });
    expect(promptFn).toHaveBeenCalled();
  });

  it('no diacritics in UI text', () => {
    render(<InstallPrompt />);
    act(() => {
      dispatchBeforeInstall();
    });
    const text = screen.getByTestId('install-prompt').textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
