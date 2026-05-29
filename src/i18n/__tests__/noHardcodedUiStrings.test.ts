// ══ I18N — NO HARDCODED USER-FACING STRINGS (full-tree AST scan) ══════════
//
// THE KEYSTONE i18n GATE. Replaces the patience-dependent weakness of the
// manual coverage table in i18nNoRoLeak.test.tsx (which only renders the
// screens someone REMEMBERED to add). This test parses EVERY
// `src/react/**/*.tsx` source file with the TypeScript compiler and FAILS the
// build the moment a user-facing string literal is committed un-wrapped by
// `t()`. No sampling, no eyeballing — a machine reads the whole tree.
//
// WHY AST (not regex): regex over JSX produces false positives on `{...}`
// expressions, comments and CSS class strings. The TS AST gives us exact JSX
// text nodes (`JsxText`) and attribute initializers (`JsxAttribute`), so we
// only flag genuine literal copy — `{t('key')}` expressions are
// `JsxExpression` nodes and are never seen as text.
//
// ── What it flags ─────────────────────────────────────────────────────────
//   (a) JSX TEXT NODES between `>` and `<` that contain >=1 alphabetic word.
//       Whitespace, HTML entities (&bdquo; &middot; …), numbers and isolated
//       symbols (·, —) are stripped first. Pure unit text (kg / kcal / min /
//       cm …) is ignored — those are technical labels next to a number.
//   (b) STRING-LITERAL values of prose attributes: title / aria-label /
//       placeholder / alt. A value counts as prose when it contains a space
//       OR has >=4 letters. `title={t(...)}` is a JsxExpression, not a string
//       literal, so it is never flagged.
//
// ── Allowlist ───────────────────────────────────────────────────────────────
//   A TINY explicit (file, string) allowlist for legitimate non-i18n literals
//   (brand URL, contact email, the static "/ Language" mirror in the language
//   picker). Every entry is justified inline. Keep it small — if it grows, the
//   right answer is almost always a `t()` key, not an allowlist row.

import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, sep } from 'node:path';

// Repo root = three levels up from this file (src/i18n/__tests__).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// Prose-attribute names whose string-literal values are user-facing.
const PROSE_ATTRS = new Set(['title', 'aria-label', 'placeholder', 'alt']);

// Unit tokens that are NOT prose even though they are alphabetic — they sit
// next to a number ("100 kg", "45 min"). A text node made up ONLY of these is
// skipped.
const UNIT_TOKENS = new Set([
  'kg', 'kcal', 'min', 'sec', 'cm', 'mm', 'km', 'g', 'mg', 's', 'h',
  'rep', 'reps', 'set', 'sets', 'bpm', 'rpe', 'rir', 'rm', 'bmi', 'bmr', 'tdee',
]);

// ── Allowlist (file path relative to repo root + exact literal) ──────────────
// Keep TINY + justified. Each row is a non-i18n literal: identical across all
// locales (brand / URL / email) or an intentional bilingual static mirror.
interface AllowEntry {
  readonly file: string;
  readonly value: string;
  readonly why: string;
}
const ALLOWLIST: readonly AllowEntry[] = [
  // Contact email — identical in every locale, not translatable copy.
  { file: 'src/react/routes/screens/Privacy.tsx', value: 'privacy@andura.app', why: 'contact email (locale-invariant)' },
  { file: 'src/react/routes/screens/Terms.tsx', value: 'privacy@andura.app', why: 'contact email (locale-invariant)' },
  { file: 'src/react/routes/screens/cont/SettingsPrivacy.tsx', value: 'privacy@andura.app', why: 'contact email (locale-invariant)' },
  // Brand URL shown as link text — brand name, not translatable copy.
  { file: 'src/react/routes/screens/cont/SettingsAbout.tsx', value: 'andura.app', why: 'brand URL link text' },
  // Language picker header renders "<localized> / Language" — the localized
  // half comes from t(), the "/ Language" mirror is an intentional constant so
  // a non-RO speaker can always recognize the language row.
  { file: 'src/react/routes/screens/cont/SettingsPrefs.tsx', value: '/ Language', why: 'intentional bilingual static mirror in language picker' },
];

function isAllowed(file: string, value: string): boolean {
  const v = value.trim();
  return ALLOWLIST.some((a) => a.file === file && a.value === v);
}

function stripEntities(s: string): string {
  return s.replace(/&[a-z]+;|&#\d+;/gi, '');
}

/** A JSX text node is user-facing prose when, after stripping entities and
 *  whitespace, it still contains an alphabetic word (>=2 letters) that is NOT
 *  purely a unit token. */
function isProseText(raw: string): boolean {
  const s = stripEntities(raw).replace(/\s+/g, ' ').trim();
  if (!s) return false;
  const words = s.match(/[A-Za-z]{2,}/g);
  if (!words) return false;
  if (words.every((w) => UNIT_TOKENS.has(w.toLowerCase()))) return false;
  return true;
}

/** A prose-attribute string literal is user-facing when it has a space or
 *  >=4 letters. */
function isProseAttrValue(raw: string): boolean {
  const v = stripEntities(raw).trim();
  if (!v) return false;
  if (v.includes(' ')) return /[A-Za-z]/.test(v);
  const letters = (v.match(/[A-Za-z]/g) ?? []).length;
  return letters >= 4;
}

interface Offender {
  readonly file: string;
  readonly line: number;
  readonly kind: string;
  readonly value: string;
}

function scanFile(absPath: string, relPath: string): Offender[] {
  const code = readFileSync(absPath, 'utf8');
  const sf = ts.createSourceFile(absPath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const offenders: Offender[] = [];

  function record(node: ts.Node, kind: string, value: string): void {
    if (isAllowed(relPath, value)) return;
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    offenders.push({ file: relPath, line: line + 1, kind, value: value.replace(/\s+/g, ' ').trim() });
  }

  function walk(node: ts.Node): void {
    if (node.kind === ts.SyntaxKind.JsxText) {
      const text = (node as ts.JsxText).text;
      if (isProseText(text)) record(node, 'jsx-text', text);
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sf);
      if (PROSE_ATTRS.has(name) && isProseAttrValue(node.initializer.text)) {
        record(node, name, node.initializer.text);
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);
  return offenders;
}

describe('i18n — no hardcoded user-facing strings in src/react/**/*.tsx', () => {
  it('every JSX text node + prose attribute is wrapped in t() (full-tree AST scan)', () => {
    const list = execSync('git ls-files "src/react/**/*.tsx"', { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f && !f.split('/').includes('__tests__'));

    expect(list.length).toBeGreaterThan(50); // sanity: the tree was actually found

    const offenders: Offender[] = [];
    for (const rel of list) {
      const abs = resolve(REPO_ROOT, rel.split('/').join(sep));
      offenders.push(...scanFile(abs, rel));
    }

    if (offenders.length > 0) {
      const report = offenders
        .map((o) => `  ${o.file}:${o.line} [${o.kind}] "${o.value.slice(0, 80)}"`)
        .join('\n');
      throw new Error(
        `Found ${offenders.length} hardcoded user-facing string(s). ` +
          `Wrap each in t('key') (add the key to en.json + ro.json, RO no-diacritics), ` +
          `or — only for a genuine non-i18n literal (brand/URL/email/canonical token) — ` +
          `add a justified row to the ALLOWLIST in this test:\n${report}`,
      );
    }
    expect(offenders).toEqual([]);
  });
});
