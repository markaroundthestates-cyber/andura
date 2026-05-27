// ══ TOAST VIEWPORT — §32-H1 / §32-H3 global notification UI ══════════════
// Renders all active toasts from `toast` store (lib/toast.ts). Mount once at
// app root (Layout). Single source of truth — ZERO ad-hoc toast snippets.
//
// Accessibility:
//   - role="status" aria-live="polite" for info/success/warning
//   - role="alert"  aria-live="assertive" for error/critical
//   - dismiss button has aria-label "Inchide notificare"
//
// §32-H3: critical safety toasts (medical disclaimer hit, account-delete
// confirmation, etc.) have dismissible=false default — NO close button
// rendered; user MUST act on paired CTA modal/banner.
//
// Placement: bottom-center fixed, above BottomNav (z-50).
// Auto-dismiss: per item durationMs (0 = manual only).
//
// NO_DIACRITICS rule respected pe text static UI ("Inchide" NU "Închide").
// Tailwind tokens used: bg-paper2, text-ink, border-line, text-brick.

import type { JSX } from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { toast, type ToastItem, type ToastVariant } from '../lib/toast';

function variantIcon(variant: ToastVariant): JSX.Element {
  switch (variant) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-brick" aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-brick" aria-hidden="true" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-brick" aria-hidden="true" />;
    case 'critical':
      return <AlertCircle className="w-4 h-4 text-brick" aria-hidden="true" />;
    case 'info':
    default:
      return <Info className="w-4 h-4 text-brick" aria-hidden="true" />;
  }
}

function variantRole(variant: ToastVariant): { role: 'status' | 'alert'; live: 'polite' | 'assertive' } {
  // §32-H3: critical safety notifications announced assertive (interrupts SR).
  if (variant === 'error' || variant === 'critical') {
    return { role: 'alert', live: 'assertive' };
  }
  return { role: 'status', live: 'polite' };
}

interface ToastCardProps {
  item: ToastItem;
}

function ToastCard({ item }: ToastCardProps): JSX.Element {
  const { role, live } = variantRole(item.variant);

  useEffect(() => {
    if (item.durationMs <= 0) return;
    const handle = window.setTimeout(() => {
      toast.dismiss(item.id);
    }, item.durationMs);
    return () => window.clearTimeout(handle);
  }, [item.id, item.durationMs]);

  return (
    <div
      data-testid={`toast-${item.id}`}
      data-variant={item.variant}
      role={role}
      aria-live={live}
      aria-atomic="true"
      className="animate-fade-in-up pointer-events-auto bg-paper2 text-ink border border-line rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 max-w-sm"
    >
      {variantIcon(item.variant)}
      <div className="flex-1 min-w-0 text-sm">{item.message}</div>
      {item.dismissible && (
        <button
          type="button"
          onClick={() => toast.dismiss(item.id)}
          data-testid={`toast-${item.id}-dismiss`}
          aria-label="Inchide notificare"
          className="p-1 -mr-1 text-ink2 hover:text-ink"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function subscribe(cb: () => void): () => void {
  return toast.subscribe(() => cb());
}
function getSnapshot(): readonly ToastItem[] {
  return toast.getSnapshot();
}
function getServerSnapshot(): readonly ToastItem[] {
  return [];
}

export function ToastViewport(): JSX.Element | null {
  // useSyncExternalStore guards against tearing across concurrent renders.
  const itemsFromStore = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Local mirror keeps stable identity for tests that re-render.
  const [mirrored, setMirrored] = useState<readonly ToastItem[]>(itemsFromStore);
  useEffect(() => {
    setMirrored(itemsFromStore);
  }, [itemsFromStore]);

  if (mirrored.length === 0) return null;

  return (
    <div
      data-testid="toast-viewport"
      className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      {mirrored.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
