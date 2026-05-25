// §32-H1 — Toast store unit tests.
// Validates module-level pub/sub state machine: defaults per variant,
// dismiss behaviour, max-2 cap, subscribe immediate snapshot.

import { afterEach, describe, expect, it } from 'vitest';
import { toast } from '../../lib/toast';

afterEach(() => {
  toast.clear();
});

describe('toast store - §32-H1 global pattern', () => {
  it('show() returns unique ids', () => {
    const a = toast.show({ message: 'a' });
    const b = toast.show({ message: 'b' });
    expect(a).not.toBe(b);
  });

  it('info variant defaults: dismissible=true, durationMs=3000', () => {
    toast.show({ message: 'm', variant: 'info' });
    const snap = toast.getSnapshot();
    expect(snap).toHaveLength(1);
    const first = snap[0]!;
    expect(first.variant).toBe('info');
    expect(first.dismissible).toBe(true);
    expect(first.durationMs).toBe(3000);
  });

  it('success variant defaults: dismissible=true, durationMs=3000', () => {
    toast.show({ message: 'm', variant: 'success' });
    const first = toast.getSnapshot()[0]!;
    expect(first.durationMs).toBe(3000);
    expect(first.dismissible).toBe(true);
  });

  it('error variant defaults: dismissible=true, durationMs=0 (manual)', () => {
    toast.show({ message: 'm', variant: 'error' });
    const first = toast.getSnapshot()[0]!;
    expect(first.durationMs).toBe(0);
    expect(first.dismissible).toBe(true);
  });

  it('warning variant: auto-dismiss after 5000ms (E2E-02 — not pinned forever)', () => {
    toast.show({ message: 'm', variant: 'warning' });
    expect(toast.getSnapshot()[0]!.durationMs).toBe(5000);
  });

  it('dismiss() removes item by id', () => {
    const id = toast.show({ message: 'm' });
    expect(toast.getSnapshot()).toHaveLength(1);
    toast.dismiss(id);
    expect(toast.getSnapshot()).toHaveLength(0);
  });

  it('caps visible at 2 - evicts oldest on overflow', () => {
    toast.show({ message: 'a', variant: 'info' });
    toast.show({ message: 'b', variant: 'info' });
    toast.show({ message: 'c', variant: 'info' });
    const snap = toast.getSnapshot();
    expect(snap).toHaveLength(2);
    expect(snap.map((t) => t.message)).toEqual(['b', 'c']);
  });

  it('subscribe() fires immediately with current snapshot', () => {
    toast.show({ message: 'pre' });
    let received: readonly { id: string }[] = [];
    const unsub = toast.subscribe((items) => {
      received = items;
    });
    expect(received).toHaveLength(1);
    unsub();
  });

  it('subscribe() fires on subsequent show + dismiss', () => {
    const seen: number[] = [];
    const unsub = toast.subscribe((items) => seen.push(items.length));
    toast.show({ message: 'a' });
    const id = toast.show({ message: 'b' });
    toast.dismiss(id);
    unsub();
    // initial(0) + show(1) + show(2) + dismiss(1)
    expect(seen).toEqual([0, 1, 2, 1]);
  });

  it('explicit dismissible=false override allowed', () => {
    toast.show({ message: 'stuck', variant: 'info', dismissible: false });
    expect(toast.getSnapshot()[0]!.dismissible).toBe(false);
  });

  it('explicit durationMs override allowed', () => {
    toast.show({ message: 'long', variant: 'info', durationMs: 10_000 });
    expect(toast.getSnapshot()[0]!.durationMs).toBe(10_000);
  });

  it('§32-M5 dedup: identical rapid-fire message+variant returns same id, no stack', () => {
    const a = toast.show({ message: 'salvat', variant: 'success' });
    const b = toast.show({ message: 'salvat', variant: 'success' });
    expect(b).toBe(a);
    expect(toast.getSnapshot()).toHaveLength(1);
  });

  it('§32-M5 dedup: same message different variant NOT deduped', () => {
    toast.show({ message: 'salvat', variant: 'info' });
    toast.show({ message: 'salvat', variant: 'error' });
    expect(toast.getSnapshot()).toHaveLength(2);
  });
});

describe('toast store - §32-H3 critical safety notifications', () => {
  it('critical variant defaults: dismissible=false + durationMs=0', () => {
    toast.show({ message: 'safety', variant: 'critical' });
    const first = toast.getSnapshot()[0]!;
    expect(first.variant).toBe('critical');
    expect(first.dismissible).toBe(false);
    expect(first.durationMs).toBe(0);
  });

  it('critical preserved when overflow evicts non-critical', () => {
    toast.show({ message: 'safety', variant: 'critical' });
    toast.show({ message: 'info1', variant: 'info' });
    toast.show({ message: 'info2', variant: 'info' });
    const snap = toast.getSnapshot();
    expect(snap).toHaveLength(2);
    expect(snap.some((t) => t.variant === 'critical')).toBe(true);
  });

  it('critical eviction order: oldest info evicted before critical', () => {
    toast.show({ message: 'info-old', variant: 'info' });
    toast.show({ message: 'safety', variant: 'critical' });
    toast.show({ message: 'info-new', variant: 'info' });
    const snap = toast.getSnapshot();
    expect(snap).toHaveLength(2);
    expect(snap.map((t) => t.message)).toContain('safety');
    expect(snap.map((t) => t.message)).not.toContain('info-old');
  });

  it('explicit dismissible=true override allowed for critical', () => {
    toast.show({ message: 'opt-in', variant: 'critical', dismissible: true });
    expect(toast.getSnapshot()[0]!.dismissible).toBe(true);
  });

  it('explicit durationMs override allowed for critical', () => {
    toast.show({ message: 'timed', variant: 'critical', durationMs: 5000 });
    expect(toast.getSnapshot()[0]!.durationMs).toBe(5000);
  });
});
