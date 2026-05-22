// ══ §36-H2 audit fix — bulkSync chunked partial-fail recovery ══════════════
//
// Verifies bulk-sync helper for long-offline reconnect: items processed in
// chunks of SYNC_CHUNK_SIZE, partial failures collected for caller retry.

import { describe, it, expect, vi } from 'vitest';
import { bulkSync, SYNC_CHUNK_SIZE } from '../firebase.js';

describe('firebase — §36-H2 bulkSync chunking', () => {
  it('returns {ok, fail, errors} all-success', async () => {
    const items = [1, 2, 3, 4, 5];
    const push = vi.fn().mockResolvedValue(true);
    const result = await bulkSync(items, push);
    expect(result.ok).toBe(5);
    expect(result.fail).toBe(0);
    expect(result.errors).toEqual([]);
    expect(push).toHaveBeenCalledTimes(5);
  });

  it('records failed items in errors[] for partial fail', async () => {
    const items = [1, 2, 3, 4];
    const push = vi.fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const result = await bulkSync(items, push);
    expect(result.ok).toBe(2);
    expect(result.fail).toBe(2);
    expect(result.errors).toEqual([2, 4]);
  });

  it('treats rejected promise as fail (network throw)', async () => {
    const items = [1, 2];
    const push = vi.fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('network down'));
    const result = await bulkSync(items, push);
    expect(result.ok).toBe(1);
    expect(result.fail).toBe(1);
    expect(result.errors).toEqual([2]);
  });

  it('chunks 60 items into 3 batches of SYNC_CHUNK_SIZE=25', async () => {
    const items = Array.from({ length: 60 }, (_, i) => i);
    const push = vi.fn().mockResolvedValue(true);
    const result = await bulkSync(items, push);
    expect(result.ok).toBe(60);
    expect(push).toHaveBeenCalledTimes(60);
  });

  it('respects custom chunkSize parameter', async () => {
    const items = [1, 2, 3, 4, 5];
    const push = vi.fn().mockResolvedValue(true);
    await bulkSync(items, push, 2);
    expect(push).toHaveBeenCalledTimes(5);
  });

  it('empty items returns zero counts', async () => {
    const push = vi.fn();
    const result = await bulkSync([], push);
    expect(result.ok).toBe(0);
    expect(result.fail).toBe(0);
    expect(push).not.toHaveBeenCalled();
  });

  it('exports SYNC_CHUNK_SIZE = 25 default', () => {
    expect(SYNC_CHUNK_SIZE).toBe(25);
  });
});
