// Golden Master test setup — snapshots pentru regression detection silent drift
// Per VAULT_RULES §BATCH_PROTOCOL Sprint 4.x guard-rail standard

import { expect } from 'vitest';

// Helper: deterministic input → string output snapshot
export function captureSnapshot(label, output) {
  expect({ label, output }).toMatchSnapshot();
}
