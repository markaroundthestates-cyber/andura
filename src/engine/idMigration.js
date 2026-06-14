// ══ ID-MIGRATION Phase 3 — write-canonical migrator (ACTIVE — wired at boot) ═══
// Design: 04-architecture/ID-MIGRATION-DESIGN_2026-06-10.md §3 (Faza 3) + §4.
//
// Phase 1 (inert): id + aliases in the library + resolveExerciseName/exerciseIdOf.
// Phase 2/2b (LIVE): every name-keyed READ resolves to the canonical identity, so
//   legacy data persisted under a historical name is already read correctly. The
//   stores are NOT yet rewritten — a rename still strands the WRITTEN key until a
//   one-time migrator restamps it.
// Phase 3 (THIS module): a backup-first, idempotent, per-store migrator that
//   rewrites persisted name-keyed stores onto the canonical name and stamps the
//   stable `exerciseId`, bumping a per-store `_schemaVersion` 1→2.
//
// ✅ ACTIVE — wired. `runIdMigrationOnce` runs once per authed boot from
// reactBoot.ts (behind dp_id_migration_apply_v1, ON): backup-first, idempotent,
// fail-silent. A second run is all no-ops. `dryRunAllStores` is still safe to call
// ANYTIME (read-only, no writes) to inspect what a migration WOULD do.
//
// Why read-shim FIRST then this: Phase 2b means the app already behaves correctly
// pre-migration; this only collapses the stored representation so Phase 4 can drop
// the legacy fallbacks after clean telemetry. Phase 2b stays REQUIRED until that
// telemetry is clean — Phase 3 is additive, never a prerequisite for correctness.

import { DB } from '../db.js';
import { resolveExerciseName, exerciseIdOf } from './exerciseLibrary.js';

// ── Store shape descriptors ──────────────────────────────────────────────────
// Each persisted name-keyed store declares HOW an exercise name is located, so one
// planner handles all shapes. The inventory is the design §4 list MINUS the ones
// that are NOT actually exercise-name-keyed (verified against the writers):
//   • `weights` — keyed by DATE (bodyweight log {YYYY-MM-DD: kg}), not exercise.
//   • `dp-recovery-constants` / `dp-learned-volume` — keyed by EN MUSCLE token
//     (Firebase-safe), not a renamable exercise name.
//   • `dp-pivot-prompts` / `dp-behavior-tuning` / `dp-nof1-experiment` — fixed-key
//     or name-in-value-field objects (the name is data, not a key) → no re-key.
// Activation must confirm each descriptor against the live store before flipping
// (SPEC: per-store verification gate).
//
// kind:
//   'objectKey'  — { [exerciseName]: value }     → re-key onto canonical name
//   'rowField'   — Array<{ [field]: name, ... }>  → rewrite the name field per row
//   'dynamicKey' — localStorage key `${prefix}${exerciseName}` → re-key the lsKey
/** @typedef {{ key: string, kind: 'objectKey'|'rowField', field?: string, sync?: boolean }} StoreDescriptor */

/** @type {ReadonlyArray<StoreDescriptor>} */
export const NAME_KEYED_STORES = Object.freeze([
  // Object-keyed by engineName (the NAME_KEYED_SYNC_KEYS family; cloud round-trips
  // via encodeNameKeyed so re-keying locally is enough — the encode re-derives).
  { key: 'dp-cal-factors',       kind: 'objectKey', sync: true },
  { key: 'dp-strength-posterior', kind: 'objectKey', sync: true },
  { key: 'dp-exercise-pain',     kind: 'objectKey', sync: true },
  { key: 'dp-pain-memory',       kind: 'objectKey', sync: true },
  { key: 'dp-log-quarantine',    kind: 'objectKey', sync: true },
  { key: 'dp-equipment-ladder',  kind: 'objectKey', sync: true },
  { key: 'dp-fatigue-curve',     kind: 'objectKey', sync: true },
  { key: 'dp-nof1-preference',   kind: 'objectKey', sync: true },
  // dp-temperament is object-keyed by engineName BUT reserves a 'global' key that
  // must NOT be treated as an exercise — handled by the unknown-name pass-through
  // (resolveExerciseName('global') → null → kept verbatim).
  { key: 'dp-temperament',       kind: 'objectKey', sync: true },
  // Row-field arrays (the name lives in a row property).
  { key: 'logs',       kind: 'rowField', field: 'ex', sync: true },
  { key: 'pr-records', kind: 'rowField', field: 'ex', sync: true },
]);

// Dynamic-prefix keys whose exercise name is the suffix of the localStorage key
// itself (e.g. `ex-extra-sets-Chest Fly`). Enumerated at plan time from the live
// keyspace. SPEC: the rewrite must read+delete the old lsKey and write the new one
// (a key rename, not an in-place value edit) — built but guarded like the rest.
export const NAME_KEYED_DYNAMIC_PREFIXES = Object.freeze(['ex-extra-sets-']);

export const SCHEMA_VERSION_KEY = '_schemaVersion';
export const TARGET_SCHEMA_VERSION = 2;

/**
 * @typedef {Object} StorePlan
 * @property {string} key                 store key
 * @property {'objectKey'|'rowField'|'absent'|'empty'|'migrated'|'unsupported'} status
 * @property {Array<{from: string, to: string, id: string|null}>} rekeys  name remaps
 * @property {Array<{canonical: string, aliases: string[]}>} merges  alias↔canonical collisions
 * @property {number} rows                total rows/keys inspected
 * @property {number} changed             rows/keys that would change
 */

/**
 * Plan the migration for ONE object-keyed store WITHOUT writing. Pure given the
 * value. Detects: (a) keys whose canonical name differs (a rename/alias → re-key);
 * (b) collisions where an alias key AND its canonical both exist (a MERGE the apply
 * step must fold — flagged here, never silently dropped); (c) already-migrated
 * (every present exercise key is already canonical → idempotent no-op).
 * @param {string} key
 * @param {unknown} value
 * @returns {StorePlan}
 */
export function planObjectKeyStore(key, value) {
  /** @type {StorePlan} */
  const plan = { key, status: 'objectKey', rekeys: [], merges: [], rows: 0, changed: 0 };
  if (value == null) { plan.status = 'absent'; return plan; }
  if (typeof value !== 'object' || Array.isArray(value)) { plan.status = 'unsupported'; return plan; }
  const obj = /** @type {Record<string, unknown>} */ (value);
  const keys = Object.keys(obj).filter((k) => k !== SCHEMA_VERSION_KEY);
  plan.rows = keys.length;
  if (keys.length === 0) { plan.status = 'empty'; return plan; }
  /** @type {Map<string, string[]>} canonical → source keys mapping onto it */
  const byCanonical = new Map();
  for (const k of keys) {
    const canon = resolveExerciseName(k) ?? k; // unknown (e.g. 'global') stays itself
    if (canon !== k) plan.rekeys.push({ from: k, to: canon, id: exerciseIdOf(k) });
    const arr = byCanonical.get(canon) ?? [];
    arr.push(k);
    byCanonical.set(canon, arr);
  }
  for (const [canon, sources] of byCanonical) {
    if (sources.length > 1) plan.merges.push({ canonical: canon, aliases: sources });
  }
  plan.changed = plan.rekeys.length;
  if (plan.changed === 0 && (obj[SCHEMA_VERSION_KEY] === TARGET_SCHEMA_VERSION)) plan.status = 'migrated';
  return plan;
}

/**
 * Plan the migration for ONE row-field array store (logs, pr-records) WITHOUT
 * writing. Pure. A row whose `field` resolves to a different canonical name would
 * be rewritten + stamped with `exerciseIdRef` (display name preserved per design
 * §4 — logs keep the historical `ex` value too? NO: logs key the engine on `ex`,
 * so `ex` is rewritten to canonical and `exerciseId` is added). Unknown names kept.
 * @param {string} key
 * @param {unknown} value
 * @param {string} field
 * @returns {StorePlan}
 */
export function planRowFieldStore(key, value, field) {
  /** @type {StorePlan} */
  const plan = { key, status: 'rowField', rekeys: [], merges: [], rows: 0, changed: 0 };
  if (value == null) { plan.status = 'absent'; return plan; }
  if (!Array.isArray(value)) { plan.status = 'unsupported'; return plan; }
  plan.rows = value.length;
  /** @type {Set<string>} */
  const seen = new Set();
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const name = /** @type {Record<string, unknown>} */ (row)[field];
    if (typeof name !== 'string' || !name) continue;
    const canon = resolveExerciseName(name) ?? name;
    if (canon !== name && !seen.has(`${name}→${canon}`)) {
      seen.add(`${name}→${canon}`);
      plan.rekeys.push({ from: name, to: canon, id: exerciseIdOf(name) });
    }
    if (canon !== name) plan.changed++;
  }
  return plan;
}

/**
 * Enumerate dynamic-prefix localStorage keys whose suffix is a renamable exercise
 * name and would be re-keyed. Read-only (lists keys; never writes). SSR/Node-safe
 * (no localStorage → []).
 * @returns {Array<{ lsKey: string, from: string, to: string, id: string|null }>}
 */
export function planDynamicPrefixKeys() {
  /** @type {Array<{ lsKey: string, from: string, to: string, id: string|null }>} */
  const out = [];
  let ls;
  try { ls = localStorage; } catch { return out; }
  if (!ls) return out;
  for (let i = 0; i < ls.length; i++) {
    const lsKey = ls.key(i);
    if (!lsKey) continue;
    const prefix = NAME_KEYED_DYNAMIC_PREFIXES.find((p) => lsKey.startsWith(p));
    if (!prefix) continue;
    const name = lsKey.slice(prefix.length);
    const canon = resolveExerciseName(name);
    if (canon && canon !== name) out.push({ lsKey, from: name, to: canon, id: exerciseIdOf(name) });
  }
  return out;
}

/**
 * Produce the FULL migration plan across every inventoried store WITHOUT writing
 * anything. THE safe, callable-anytime inspection entry point — read-only.
 * @returns {{ stores: StorePlan[], dynamic: ReturnType<typeof planDynamicPrefixKeys>, totalChanged: number }}
 */
export function dryRunAllStores() {
  /** @type {StorePlan[]} */
  const stores = [];
  for (const d of NAME_KEYED_STORES) {
    const value = DB.get(d.key);
    stores.push(d.kind === 'objectKey'
      ? planObjectKeyStore(d.key, value)
      : planRowFieldStore(d.key, value, /** @type {string} */ (d.field)));
  }
  const dynamic = planDynamicPrefixKeys();
  const totalChanged =
    stores.reduce((s, p) => s + p.changed, 0) + dynamic.length;
  return { stores, dynamic, totalChanged };
}

// ── Apply (DORMANT — backup-first, idempotent, quota-guarded) ─────────────────
// NOT wired to any call site. Kept minimal + tested so activation is a one-line
// call from a deliberate, manager-owned migration session, never an automatic load.

/**
 * Migrate ONE object-keyed store: fold every key onto its canonical name (merging
 * alias↔canonical collisions via `mergeColliding`), stamp `_schemaVersion`. Backup
 * FIRST (a `<key>-backup-pre-id-migration-<ts>` snapshot) so the original is
 * recoverable. IDEMPOTENT: a store already at TARGET_SCHEMA_VERSION with no pending
 * re-keys is a no-op (no second backup, no write). Quota-guarded — a failed write
 * leaves the original intact (the backup also survives).
 *
 * @param {string} key
 * @param {(canonical: string, entries: unknown[]) => unknown} mergeColliding
 *   fold N entries that collapse onto the same canonical key into ONE value. Caller
 *   owns the per-store semantic (e.g. latest-ts wins for pins, sum for counters).
 * @param {{ now?: number, dryRun?: boolean }} [opts]
 * @returns {{ ok: boolean, status: string, changed: number, backupKey: string|null, error?: string }}
 */
export function migrateObjectKeyStore(key, mergeColliding, opts = {}) {
  const value = DB.get(key);
  const plan = planObjectKeyStore(key, value);
  if (plan.status === 'absent' || plan.status === 'empty' || plan.status === 'unsupported') {
    return { ok: true, status: plan.status, changed: 0, backupKey: null };
  }
  if (plan.changed === 0 && plan.status === 'migrated') {
    return { ok: true, status: 'migrated', changed: 0, backupKey: null };
  }
  const obj = /** @type {Record<string, unknown>} */ (value);
  // Group source keys by canonical (excluding the schema-version marker).
  /** @type {Map<string, unknown[]>} */
  const grouped = new Map();
  for (const k of Object.keys(obj)) {
    if (k === SCHEMA_VERSION_KEY) continue;
    const canon = resolveExerciseName(k) ?? k;
    const arr = grouped.get(canon) ?? [];
    arr.push(obj[k]);
    grouped.set(canon, arr);
  }
  /** @type {Record<string, unknown>} */
  const next = {};
  for (const [canon, entries] of grouped) {
    next[canon] = entries.length === 1 ? entries[0] : mergeColliding(canon, entries);
  }
  next[SCHEMA_VERSION_KEY] = TARGET_SCHEMA_VERSION;
  if (opts.dryRun) return { ok: true, status: 'planned', changed: plan.changed, backupKey: null };
  // Backup FIRST (design §3 "backup-first obligatoriu").
  const backupKey = `${key}-backup-pre-id-migration-${opts.now ?? Date.now()}`;
  const bk = DB.set(backupKey, value);
  if (bk && bk.ok === false) return { ok: false, status: 'backup_failed', changed: 0, backupKey: null, error: bk.error };
  const wr = DB.set(key, next);
  if (wr && wr.ok === false) return { ok: false, status: 'write_failed', changed: 0, backupKey, error: wr.error };
  return { ok: true, status: 'migrated', changed: plan.changed, backupKey };
}

/**
 * Migrate ONE row-field store (Array<{[field]: name}> — `logs`, `pr-records`):
 * rewrite every renamable name field onto its canonical engine name. Backup FIRST
 * (same `<key>-backup-pre-id-migration-<ts>` convention), IDEMPOTENT (a store with
 * zero pending rewrites is a no-op — arrays carry no schema stamp; the plan IS the
 * stamp), quota-guarded (failed write leaves the original + backup intact). Rows
 * never merge — a rename only changes the `field` value, row count is invariant.
 * F3 write-side (design §3) — the piece the dormant apply layer was missing: the
 * 06-10 server-side remap got clobbered by device sync (old local copy pushed
 * back), so the durable fix is each DEVICE migrating its own store then syncing
 * canonical names up (manager decision 2026-06-12, Daniel "fa tot").
 *
 * @param {string} key
 * @param {string} field
 * @param {{ now?: number, dryRun?: boolean }} [opts]
 * @returns {{ ok: boolean, status: string, changed: number, backupKey: string|null, error?: string }}
 */
export function migrateRowFieldStore(key, field, opts = {}) {
  const value = DB.get(key);
  const plan = planRowFieldStore(key, value, field);
  if (plan.status === 'absent' || plan.status === 'unsupported') {
    return { ok: true, status: plan.status, changed: 0, backupKey: null };
  }
  if (plan.changed === 0) {
    return { ok: true, status: 'migrated', changed: 0, backupKey: null };
  }
  if (opts.dryRun) return { ok: true, status: 'planned', changed: plan.changed, backupKey: null };
  const rows = /** @type {Array<Record<string, unknown>>} */ (value);
  const next = rows.map((row) => {
    if (!row || typeof row !== 'object') return row;
    const name = row[field];
    if (typeof name !== 'string' || !name) return row;
    const canon = resolveExerciseName(name) ?? name;
    return canon === name ? row : { ...row, [field]: canon };
  });
  const backupKey = `${key}-backup-pre-id-migration-${opts.now ?? Date.now()}`;
  const bk = DB.set(backupKey, value);
  if (bk && bk.ok === false) return { ok: false, status: 'backup_failed', changed: 0, backupKey: null, error: bk.error };
  const wr = DB.set(key, next);
  if (wr && wr.ok === false) return { ok: false, status: 'write_failed', changed: 0, backupKey, error: wr.error };
  return { ok: true, status: 'migrated', changed: plan.changed, backupKey };
}

/**
 * Rename dynamic-prefix localStorage keys onto canonical names. Collision-AVERSE:
 * when the canonical key already exists, the OLD key is left in place untouched
 * and reported (never clobbers newer data with stale). Otherwise value moves to
 * the canonical key and the old key is removed (the move itself is the backup —
 * nothing is destroyed, only re-keyed). SSR/Node-safe.
 * @returns {{ moved: number, skipped: Array<{ lsKey: string, to: string }> }}
 */
export function migrateDynamicPrefixKeys() {
  const planned = planDynamicPrefixKeys();
  let moved = 0;
  /** @type {Array<{ lsKey: string, to: string }>} */
  const skipped = [];
  let ls;
  try { ls = localStorage; } catch { return { moved, skipped }; }
  for (const p of planned) {
    const prefix = NAME_KEYED_DYNAMIC_PREFIXES.find((x) => p.lsKey.startsWith(x));
    if (!prefix) continue;
    const targetKey = prefix + p.to;
    try {
      if (ls.getItem(targetKey) != null) { skipped.push({ lsKey: p.lsKey, to: targetKey }); continue; }
      const v = ls.getItem(p.lsKey);
      if (v == null) continue;
      ls.setItem(targetKey, v);
      ls.removeItem(p.lsKey);
      moved++;
    } catch { /* quota/SSR — leave the old key, read-shim still resolves it */ }
  }
  return { moved, skipped };
}

/**
 * ONE-SHOT full apply across the inventory — the deliberate F3 entry point the
 * boot wiring calls behind `dp_id_migration_apply_v1`. Collision-AVERSE: an
 * objectKey store with pending MERGES (two source keys folding onto one
 * canonical) is SKIPPED + reported, never silently merged — merge semantics are
 * per-store judgment (design §3) and no real account has shown one (Daniel
 * dry-run 2026-06-11: zero collisions). Idempotent end-to-end: second run is
 * all no-ops. Pure orchestration over the tested primitives.
 * @param {{ now?: number }} [opts]
 * @returns {{ changed: number, migrated: string[], skippedMerges: string[], dynamicMoved: number, errors: Array<{ key: string, error?: string }> }}
 */
export function runIdMigrationOnce(opts = {}) {
  /** @type {string[]} */
  const migrated = [];
  /** @type {string[]} */
  const skippedMerges = [];
  /** @type {Array<{ key: string, error?: string }>} */
  const errors = [];
  let changed = 0;
  for (const d of NAME_KEYED_STORES) {
    if (d.kind === 'objectKey') {
      const plan = planObjectKeyStore(d.key, DB.get(d.key));
      if (plan.merges.length > 0) { skippedMerges.push(d.key); continue; }
      const r = migrateObjectKeyStore(d.key, (_c, entries) => entries[0], opts);
      if (!r.ok) errors.push({ key: d.key, error: r.error });
      else if (r.changed > 0) { migrated.push(d.key); changed += r.changed; }
    } else {
      const r = migrateRowFieldStore(d.key, /** @type {string} */ (d.field), opts);
      if (!r.ok) errors.push({ key: d.key, error: r.error });
      else if (r.changed > 0) { migrated.push(d.key); changed += r.changed; }
    }
  }
  const dyn = migrateDynamicPrefixKeys();
  return { changed, migrated, skippedMerges, dynamicMoved: dyn.moved, errors };
}
