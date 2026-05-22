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
    expect(snap[0].variant).toBe('info');
    expect(snap[0].dismissible).toBe(true);
    expect(snap[0].durationMs).toBe(3000);
  });

  it('success variant defaults: dismissible=true, durationMs=3000', () => {
    toast.show({ message: 'm', variant: 'success' });
    const snap = toast.getSnapshot();
    expect(snap[0].durationMs).toBe(3000);
    expect(snap[0].dismissible).toBe(true);
  });

  it('error variant defaults: dismissible=true, durationMs=0 (manual)', () => {
    toast.show({ message: 'm', variant: 'error' });
    const snap = toast.getSnapshot();
    expect(snap[0].durationMs).toBe(0);
    expect(snap[0].dismissible).toBe(true);
  });

  it('warning variant: manual-dismiss (durationMs=0)', () => {
    toast.show({ message: 'm', variant: 'warning' });
    expect(toast.getSnapshot()[0].durationMs).toBe(0);
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
    expect(toast.getSnapshot()[0].dismissible).toBe(false);
  });

  it('explicit durationMs override allowed', () => {
    toast.show({ message: 'long', variant: 'info', durationMs: 10_000 });
    expect(toast.getSnapshot()[0].durationMs).toBe(10_000);
  });
});
