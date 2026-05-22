// ══ TOAST STORE — §32-H1 Global notification pattern ═════════════════════
// Minimal module-level pub/sub store for app-wide toasts. Avoids new
// dependency (no Zustand for this surface — single file, ~80 LOC).
//
// Public API:
//   toast.show({ message, variant?, dismissible?, durationMs? }) -> id
//   toast.dismiss(id)
//   toast.subscribe(listener) -> unsubscribe   (used by <ToastViewport />)
//
// Variants:
//   - 'info'    auto-dismiss 3000ms (§32-H1 spec)
//   - 'success' auto-dismiss 3000ms
//   - 'warning' manual-dismiss (auto disabled per spec)
//   - 'error'   manual-dismiss (auto disabled per spec)
//   - 'critical' §32-H3 — manual-dismiss + dismissible=false default.
//                 Used for safety notifications: medical disclaimer hit,
//                 account deletion confirmation, etc. User MUST act on
//                 paired CTA (modal/banner) — toast itself can't be closed.
//
// Max 2 simultaneous toasts visible — oldest non-critical evicted first.

import type { ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface ToastInput {
  message: ReactNode;
  variant?: ToastVariant;
  /** When false, no dismiss button + no auto-dismiss. Default true. */
  dismissible?: boolean;
  /** Override auto-dismiss duration ms. 0 = never. */
  durationMs?: number;
}

export interface ToastItem {
  id: string;
  message: ReactNode;
  variant: ToastVariant;
  dismissible: boolean;
  durationMs: number;
  createdAt: number;
}

type Listener = (items: readonly ToastItem[]) => void;

const MAX_VISIBLE = 2;
const DEFAULT_DURATION_MS = 3000;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 0;

function emit(): void {
  for (const l of listeners) l(items);
}

function defaultDuration(variant: ToastVariant): number {
  // §32-H1 spec: info/success auto 3s; errors/warnings manual.
  // §32-H3: critical also manual (never auto-dismiss).
  if (variant === 'warning' || variant === 'error' || variant === 'critical') return 0;
  return DEFAULT_DURATION_MS;
}

function defaultDismissible(variant: ToastVariant): boolean {
  // §32-H3: critical safety notifications NU dismissable by default.
  return variant !== 'critical';
}

function show(input: ToastInput): string {
  const variant: ToastVariant = input.variant ?? 'info';
  const dismissible = input.dismissible ?? defaultDismissible(variant);
  const durationMs = input.durationMs ?? defaultDuration(variant);
  const id = `t${++nextId}`;
  const item: ToastItem = {
    id,
    message: input.message,
    variant,
    dismissible,
    durationMs,
    createdAt: Date.now(),
  };
  // Cap visible — §32-H3: evict oldest NON-critical first; only if all
  // remaining are critical, evict the oldest overall.
  const next = [...items, item];
  if (next.length > MAX_VISIBLE) {
    const evictIdx = next.findIndex((t) => t.variant !== 'critical');
    if (evictIdx >= 0 && evictIdx < next.length - 1) {
      next.splice(evictIdx, 1);
    } else {
      next.shift();
    }
  }
  items = next;
  emit();
  return id;
}

function dismiss(id: string): void {
  const len = items.length;
  items = items.filter((t) => t.id !== id);
  if (items.length !== len) emit();
}

function clear(): void {
  if (items.length === 0) return;
  items = [];
  emit();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): readonly ToastItem[] {
  return items;
}

export const toast = {
  show,
  dismiss,
  clear,
  subscribe,
  getSnapshot,
} as const;
