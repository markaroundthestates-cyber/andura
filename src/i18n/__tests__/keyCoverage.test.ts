// ══ I18N — KEY COVERAGE (every literal t('key') resolves in en.json) ══════════
//
// PREVENTIVE CI GATE. A `t('common.dismiss')` was committed in ObiectivCard.tsx
// while the `common.dismiss` key existed in NEITHER ro.json NOR en.json — so the
// goal-realism dismiss button rendered the RAW key string "common.dismiss" to the
// user (t() returns the key itself as a last-resort when it can't resolve). The
// no-hardcoded-strings gate (noHardcodedUiStrings.test.ts) catches un-wrapped
// copy; it does NOT catch a t() call pointing at a MISSING key. This gate closes
// that gap: it statically scans the source tree for `t('literal.key')` usages and
// asserts each one resolves to a leaf string in the EN bundle (the SSOT fallback
// every locale falls back to — index.js _resolve → FALLBACK_LOCALE 'en').
//
// ── Scope (deliberately conservative — zero false positives) ─────────────────
//   * ONLY pure string-literal first args: t('a.b.c') / t("a.b.c"). A
//     template-literal or dynamic key — t(`x.${y}`), t(someVar), t(cond ? a : b)
//     — is SKIPPED (its resolution can't be proven statically; flagging it would
//     produce noise). Those dynamic keys are the caller's responsibility.
//   * ONLY calls whose callee is the bare identifier `t` (the i18n function).
//     tList() (array resolver), format(), and member calls (obj.t(...)) are not
//     matched — different resolution contract.
//   * Resolution mirrors index.js _resolve EXACTLY: dotted-path walk, value must
//     be a STRING leaf (an object/array namespace key does NOT count — t() only
//     ever returns a string).

import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, sep } from 'node:path';

// Repo root = three levels up from this file (src/i18n/__tests__).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// Mirror index.js#_resolve: dotted-path walk, returns the leaf only when it is a
// string (t() never returns an object/array namespace).
function resolveKey(bundle: unknown, key: string): string | null {
  if (!bundle || typeof bundle !== 'object') return null;
  let cur: unknown = bundle;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : null;
}

interface Usage {
  readonly file: string;
  readonly line: number;
  readonly key: string;
}

/** Collect every `t('literal.key')` usage in one source file (TSX-parsed so the
 *  same machinery handles .ts/.tsx/.js/.jsx). Only a bare `t` callee with a pure
 *  single string-literal first arg is recorded. */
function scanFile(absPath: string, relPath: string): Usage[] {
  const code = readFileSync(absPath, 'utf8');
  const sf = ts.createSourceFile(absPath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const usages: Usage[] = [];

  function walk(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments.length >= 1 &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      const key = (node.arguments[0] as ts.StringLiteral).text;
      // A pure dotted key only — skip anything that doesn't look like a key
      // (defensive; a string-literal first arg is already the narrow case).
      if (key.length > 0) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        usages.push({ file: relPath, line: line + 1, key });
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);
  return usages;
}

describe('i18n — every literal t() key resolves in en.json', () => {
  it('no t(\'literal.key\') points at a missing key (would leak the raw key to the user)', () => {
    const enPath = resolve(REPO_ROOT, 'src', 'i18n', 'en.json');
    const en = JSON.parse(readFileSync(enPath, 'utf8'));

    const files = execSync('git ls-files "src/**/*.ts" "src/**/*.tsx" "src/**/*.js" "src/**/*.jsx"', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    })
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f && !f.split('/').includes('__tests__') && !f.endsWith('.d.ts'));

    expect(files.length).toBeGreaterThan(50); // sanity: the tree was found

    const usages: Usage[] = [];
    for (const rel of files) {
      usages.push(...scanFile(resolve(REPO_ROOT, rel.split('/').join(sep)), rel));
    }
    expect(usages.length).toBeGreaterThan(100); // sanity: t() calls were actually scanned

    const missing = usages.filter((u) => resolveKey(en, u.key) === null);
    if (missing.length > 0) {
      const report = missing
        .map((m) => `  ${m.file}:${m.line} t('${m.key}')`)
        .join('\n');
      throw new Error(
        `Found ${missing.length} t('literal.key') usage(s) that resolve to NO leaf string in ` +
          `en.json (t() would render the raw key to the user). Add the key to en.json + ro.json ` +
          `(RO no-diacritics, D-LEGACY-064):\n${report}`,
      );
    }
    expect(missing).toEqual([]);
  });
});
