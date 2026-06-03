// In-memory @op-engineering/op-sqlite mock for jest (CR-02).
//
// @op-engineering/op-sqlite is a JSI-backed native binding (C++/SQLite) — absent
// under jest-expo, so the real `open()` throws / the native module is missing.
// db.native.js (the RN Tier-1 sibling, resolved by jest's native platform) does
// `import { open } from '@op-engineering/op-sqlite'` at REQUIRE time, so any test
// that dynamically imports `src/storage/db` (settings-export, delete-account,
// restore-account) would crash without this mock now that the importers are
// extension-less (Metro/jest resolve db.native.js).
//
// Wired via `moduleNameMapper` in mobile/package.json (mirroring the
// react-native-mmkv mock) so it resolves from BOTH the mobile root AND the shared
// `../src` tree, where db.native.js lives outside mobile/rootDir.
//
// This is a SMALL in-memory SQLite emulator covering ONLY the statement shapes
// db.native.js issues: CREATE TABLE IF NOT EXISTS, PRAGMA user_version (get/set),
// PRAGMA table_info, ALTER TABLE ADD COLUMN, INSERT [OR REPLACE], SELECT (doc /
// id / COUNT), DELETE, UPDATE ... SET status, BEGIN/COMMIT/ROLLBACK, DROP TABLE,
// VACUUM. Each `open({ name })` returns a handle over a shared per-file store so a
// re-open (wipe → re-open) sees prior state, matching the real one-file-per-uid
// model. Rows are JSON `doc` strings keyed by `id`, exactly as db.native.js writes.

const _files = new Map(); // fileName -> { tables: Map<name, {rows: Map<id,row>, auto:int}>, userVersion:int }

function _file(name) {
  if (!_files.has(name)) {
    _files.set(name, { tables: new Map(), userVersion: 0 });
  }
  return _files.get(name);
}

function _table(file, name) {
  if (!file.tables.has(name)) {
    file.tables.set(name, { rows: new Map(), auto: 0, columns: new Set(['id', 'doc']) });
  }
  return file.tables.get(name);
}

function makeDb(fileName) {
  const file = _file(fileName);

  function execute(sql, params = []) {
    const s = String(sql).trim();
    const upper = s.toUpperCase();

    // ── transaction control (no-op for the in-memory store) ──
    if (upper === 'BEGIN TRANSACTION' || upper === 'COMMIT' || upper === 'ROLLBACK' || upper === 'VACUUM') {
      return { rows: [], insertId: undefined };
    }

    // ── PRAGMA user_version (get / set) ──
    if (/^PRAGMA\s+USER_VERSION\s*=/.test(upper)) {
      const m = s.match(/=\s*(\d+)/);
      file.userVersion = m ? Number(m[1]) : file.userVersion;
      return { rows: [], insertId: undefined };
    }
    if (/^PRAGMA\s+USER_VERSION/.test(upper)) {
      return { rows: [{ user_version: file.userVersion }], insertId: undefined };
    }

    // ── PRAGMA table_info(name) ──
    let m = s.match(/^PRAGMA\s+table_info\(([^)]+)\)/i);
    if (m) {
      const t = _table(file, m[1].trim());
      const rows = Array.from(t.columns).map((name, i) => ({ cid: i, name, type: 'TEXT' }));
      return { rows, insertId: undefined };
    }

    // ── CREATE TABLE IF NOT EXISTS name (...) ──
    m = s.match(/^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)\s*\(([\s\S]*)\)/i);
    if (m) {
      const t = _table(file, m[1]);
      // crude column extraction (first identifier of each comma group)
      for (const part of m[2].split(',')) {
        const col = part.trim().split(/\s+/)[0];
        if (col && /^\w+$/.test(col)) t.columns.add(col);
      }
      return { rows: [], insertId: undefined };
    }

    // ── ALTER TABLE name ADD COLUMN col ──
    m = s.match(/^ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i);
    if (m) {
      _table(file, m[1]).columns.add(m[2]);
      return { rows: [], insertId: undefined };
    }

    // ── DROP TABLE IF EXISTS name ──
    m = s.match(/^DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
    if (m) {
      file.tables.delete(m[1]);
      return { rows: [], insertId: undefined };
    }

    // ── INSERT [OR REPLACE] INTO name (cols) VALUES (...) ──
    m = s.match(/^INSERT(?:\s+OR\s+REPLACE)?\s+INTO\s+(\w+)\s*\(([^)]*)\)/i);
    if (m) {
      const t = _table(file, m[1]);
      const cols = m[2].split(',').map((c) => c.trim());
      const row = {};
      cols.forEach((c, i) => { row[c] = params[i]; });
      let id;
      if (Object.prototype.hasOwnProperty.call(row, 'id')) {
        id = row.id;
      } else {
        id = ++t.auto;
        row.id = id;
      }
      t.rows.set(String(id), row);
      return { rows: [], insertId: Number(id) };
    }

    // ── SELECT COUNT(*) AS n FROM name ──
    m = s.match(/^SELECT\s+COUNT\(\*\)\s+AS\s+(\w+)\s+FROM\s+(\w+)/i);
    if (m) {
      const t = _table(file, m[2]);
      return { rows: [{ [m[1]]: t.rows.size }], insertId: undefined };
    }

    // ── SELECT cols FROM name [WHERE id = ?] ──
    m = s.match(/^SELECT\s+([\w,\s*]+)\s+FROM\s+(\w+)(?:\s+WHERE\s+id\s*=\s*\?)?/i);
    if (m) {
      const t = _table(file, m[2]);
      const wantWhere = /WHERE\s+id\s*=\s*\?/i.test(s);
      let entries = Array.from(t.rows.values());
      if (wantWhere) {
        const id = String(params[0]);
        entries = entries.filter((r) => String(r.id) === id);
      }
      const colsRaw = m[1].trim();
      if (colsRaw === '*') return { rows: entries, insertId: undefined };
      const cols = colsRaw.split(',').map((c) => c.trim());
      const rows = entries.map((r) => {
        const out = {};
        for (const c of cols) out[c] = r[c];
        return out;
      });
      return { rows, insertId: undefined };
    }

    // ── UPDATE name SET status = 'success' WHERE status IS NULL ──
    m = s.match(/^UPDATE\s+(\w+)\s+SET\s+status\s*=\s*'([^']*)'/i);
    if (m) {
      const t = _table(file, m[1]);
      for (const r of t.rows.values()) {
        if (r.status === undefined || r.status === null) r.status = m[2];
      }
      return { rows: [], insertId: undefined };
    }

    // ── DELETE FROM name WHERE id = ? ──
    m = s.match(/^DELETE\s+FROM\s+(\w+)\s+WHERE\s+id\s*=\s*\?/i);
    if (m) {
      _table(file, m[1]).rows.delete(String(params[0]));
      return { rows: [], insertId: undefined };
    }

    // Unknown statement — safe empty result.
    return { rows: [], insertId: undefined };
  }

  return {
    execute,
    close() { /* keep the file store so a re-open sees prior state */ },
  };
}

function open(opts) {
  const name = opts && opts.name ? String(opts.name) : ':memory:';
  return makeDb(name);
}

// Test helper — reset all in-memory files (not part of the real API; safe extra).
function __reset() {
  _files.clear();
}

module.exports = { open, __reset };
