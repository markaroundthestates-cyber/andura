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

// ══ SCANNER-EVADING RO LEAK HARNESS (audit 09.044/09.200/09.205/09.904/15.042)
//
// The AST gate above only sees DIRECT JSX text + prose-attribute STRING
// LITERALS. Three real leak classes evade it:
//   1. RO string literals inside a JSX EXPRESSION (a ternary branch like
//      `{error ? 'Eroare...' : 'Te conectam...'}`) — a JsxExpression, not
//      JsxText (audit 09.044 AuthCallback).
//   2. RO copy emitted from a NON-.tsx source (an engine `.js` or a `.ts`
//      composer) that surfaces through a banner at render — never touched by
//      the .tsx-only scan (audit 09.200 proactiveEngine, 09.205 engineWrappers).
//   3. an RO string accidentally committed into the EN bundle VALUES, leaking
//      Romanian under EN on whatever screen reads that key.
//
// These three scans close each class. They key off a high-confidence RO signal
// (diacritic OR an RO-only word) on STRING/TEMPLATE literals — so an EN literal
// (`'Save'`) never trips them; only Romanian copy does.

const RO_DIACRITICS = /[ăâîșțĂÂÎȘȚşţŞŢ]/;

// RO-only words — high-frequency in our copy, never produced by a native EN
// writer, never a cognate/unit/proper-noun. A single whole-word hit on a source
// or bundle literal = a real Romanian leak. (Compact on purpose; mirrors the
// signal philosophy of i18nNoRoLeak.test.tsx.)
const RO_LEAK_TOKENS = [
  'zile', 'ziua', 'saptamana', 'saptamani', 'luni', 'luna',
  'antrenament', 'antrenamentul', 'antrenamente', 'antrenat', 'antreneaza', 'antrenor',
  'sesiune', 'sesiunea', 'sesiuni', 'exercitiu', 'exercitii', 'seturi', 'repetari',
  'greutate', 'greutatea', 'oboseala', 'recuperare', 'recupereaza', 'odihna',
  'proteina', 'proteine', 'hidratare', 'calorii', 'somnul', 'somn',
  'asteapta', 'reincepe', 'incepe', 'continua', 'verificare', 'conectam',
  'redirectionam', 'creste', 'mentine', 'consecutive', 'musculare', 'neantronate',
  'stagnare', 'aderenta', 'adherenta', 'usoara', 'usor', 'scurta', 'intensitatea',
  'ritmul', 'prioritizeaza', 'verifica', 'caloriile', 'inainte',
  // onboardingStore validation leaks (audit 09 store-evading): the .ts store
  // emitted RO validation prose ('Varsta invalida.', 'Inaltime intre ...').
  'varsta', 'invalida', 'inaltime', 'tinta', 'ani',
];
const RO_LEAK_REGEX = new RegExp(
  `\\b(${RO_LEAK_TOKENS.join('|')})\\b`,
  'i',
);

/** True when a literal carries a Romanian signal (diacritic or RO-only word). */
function hasRoSignal(s: string): boolean {
  return RO_DIACRITICS.test(s) || RO_LEAK_REGEX.test(s);
}

interface LeakHit {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

/**
 * A literal carries USER-FACING Romanian prose (vs. a code identifier that
 * merely contains an RO substring — a route path `/app/antrenor`, an import
 * specifier `./screens/antrenor/X`, a rating-enum value `'usor'`, a testid
 * `count-usor`). Discriminator: an RO signal AND a whitespace (multi-word
 * phrase) AND no path-like slash. The four AuthCallback ternary leaks + every
 * proactiveEngine template + the patterns/lagging lines all qualify; the code
 * identifiers above never do.
 */
function isRoProse(text: string): boolean {
  if (!hasRoSignal(text)) return false;
  if (!/\s/.test(text)) return false;       // single word → enum/slug, not a phrase
  if (text.includes('/')) return false;     // path / import specifier
  return true;
}

function collectLiteral(node: ts.Node, text: string, sf: ts.SourceFile, rel: string, out: LeakHit[]): void {
  if (!isRoProse(text)) return;
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  out.push({ file: rel, line: line + 1, text: text.replace(/\s+/g, ' ').trim().slice(0, 80) });
}

/**
 * Walk a source file's STRING + TEMPLATE literals (ordinary strings,
 * no-substitution templates, and the static head/spans of substitution
 * templates `\`Stagnare ${n} saptamani\``) and flag RO prose. .tsx/.ts/.js all
 * parse as TSX. `jsxOnly` restricts hits to literals lexically inside a JSX
 * element/fragment subtree — used by the broad .tsx scan so a Romanian SENTINEL
 * comparison (`x === 'Antrenament azi'`) or a navigate() arg in plain code is
 * not flagged, only copy that actually renders (e.g. a `{cond ? 'RO' : 'RO'}`
 * JSX-expression ternary).
 */
function scanSourceRoLiterals(absPath: string, relPath: string, jsxOnly: boolean): LeakHit[] {
  const code = readFileSync(absPath, 'utf8');
  const sf = ts.createSourceFile(absPath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits: LeakHit[] = [];

  function flag(node: ts.Node, text: string): void {
    collectLiteral(node, text, sf, relPath, hits);
  }

  function walk(node: ts.Node, inJsx: boolean): void {
    const nowInJsx = inJsx
      || ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node);
    if (!jsxOnly || nowInJsx) {
      if (ts.isStringLiteral(node)) {
        flag(node, node.text);
      } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
        flag(node, node.text);
      } else if (ts.isTemplateExpression(node)) {
        flag(node.head, node.head.text);
        for (const span of node.templateSpans) flag(span.literal, span.literal.text);
      }
    }
    ts.forEachChild(node, (c) => walk(c, nowInJsx));
  }
  walk(sf, false);
  return hits;
}

function gitFiles(glob: string): string[] {
  return execSync(`git ls-files "${glob}"`, { cwd: REPO_ROOT, encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
}

// ── (A) RO literals inside .tsx (incl. JSX expression ternaries) ─────────────
//
// Catches audit 09.044: the AuthCallback ternary RO branches the AST text-scan
// can't see. Scope = the whole .tsx tree, but it ONLY trips on Romanian copy —
// EN literals in expressions are ignored, so it is false-positive-safe.
describe('i18n leak harness — no RO string literals in src/react/**/*.tsx (incl. JSX expressions)', () => {
  it('no Romanian copy hides in a .tsx string/template literal', () => {
    const files = gitFiles('src/react/**/*.tsx')
      .filter((f) => !f.split('/').includes('__tests__'));
    expect(files.length).toBeGreaterThan(50);

    const hits: LeakHit[] = [];
    for (const rel of files) {
      hits.push(...scanSourceRoLiterals(resolve(REPO_ROOT, rel.split('/').join(sep)), rel, true));
    }
    if (hits.length > 0) {
      const report = hits.map((h) => `  ${h.file}:${h.line} "${h.text}"`).join('\n');
      throw new Error(
        `Found ${hits.length} Romanian string literal(s) in .tsx source (scanner-evading, ` +
          `e.g. a JSX ternary branch). Replace with t('key') + add EN/RO bundle entries:\n${report}`,
      );
    }
    expect(hits).toEqual([]);
  });
});

// ── (B) RO literals in the banner-feeding engine + composer sources ──────────
//
// Catches audit 09.200 (proactiveEngine.js `message` templates) + 09.205
// (engineWrappers.ts banner text). These files compose user-facing banner copy
// outside the .tsx tree, so the AST gate never reads them. They must emit a
// semantic key resolved by t() at the render boundary — ZERO RO copy in source.
const BANNER_SOURCE_FILES = [
  'src/engine/proactiveEngine.js',
  'src/react/lib/engineWrappers.ts',
];
describe('i18n leak harness — banner-feeding sources carry no RO copy', () => {
  it('proactiveEngine + engineWrappers emit keys, not Romanian strings', () => {
    const hits: LeakHit[] = [];
    for (const rel of BANNER_SOURCE_FILES) {
      hits.push(...scanSourceRoLiterals(resolve(REPO_ROOT, rel.split('/').join(sep)), rel, false));
    }
    if (hits.length > 0) {
      const report = hits.map((h) => `  ${h.file}:${h.line} "${h.text}"`).join('\n');
      throw new Error(
        `Found ${hits.length} Romanian string literal(s) in a banner-feeding source. ` +
          `Engines/composers must emit a semantic i18n key (resolve via t() at the React ` +
          `render boundary), never localized copy:\n${report}`,
      );
    }
    expect(hits).toEqual([]);
  });
});

// ── (C) en.json VALUES carry no RO leak (every screen, not enumerated) ───────
//
// The EN bundle is the single source of EN copy. A Romanian string committed
// into ANY value leaks RO under EN on whatever screen reads that key — and the
// rendered-screen leak test only covers screens someone REMEMBERED to add. This
// walks the WHOLE bundle so no screen can slip through.
function flattenBundle(obj: unknown, prefix: string, out: Array<{ key: string; value: string }>): void {
  if (obj == null || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === '_meta') continue; // bundle metadata, not user-facing copy
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.push({ key, value: v });
    else if (Array.isArray(v)) v.forEach((e, i) => { if (typeof e === 'string') out.push({ key: `${key}[${i}]`, value: e }); else flattenBundle(e, `${key}[${i}]`, out); });
    else if (v && typeof v === 'object') flattenBundle(v, key, out);
  }
}
describe('i18n leak harness — en.json values are RO-leak-free on every screen', () => {
  it('no EN bundle value contains a diacritic or RO-only word', () => {
    const enPath = resolve(REPO_ROOT, 'src', 'i18n', 'en.json');
    const en = JSON.parse(readFileSync(enPath, 'utf8'));
    const entries: Array<{ key: string; value: string }> = [];
    flattenBundle(en, '', entries);
    expect(entries.length).toBeGreaterThan(500); // sanity: the bundle was read

    const leaks = entries.filter((e) => hasRoSignal(e.value));
    if (leaks.length > 0) {
      const report = leaks.map((l) => `  ${l.key} = "${l.value.slice(0, 80)}"`).join('\n');
      throw new Error(
        `Found ${leaks.length} Romanian value(s) in the EN bundle (en.json). The EN bundle ` +
          `must hold clean English — move the Romanian copy to ro.json:\n${report}`,
      );
    }
    expect(leaks).toEqual([]);
  });
});

// ── (D) RO literals in any src/react/**/*.ts store/lib source ────────────────
//
// Closes the same gap as (B) but for the WHOLE non-.tsx React tree, not just two
// enumerated banner files. The .tsx-only AST gate (top of file) globs only
// `src/react/**/*.tsx`, so a store/lib `.ts` file (onboardingStore.ts, a lib
// composer, …) could emit RO copy that reaches the DOM via a caller — exactly
// the onboardingStore.ts validation leak (audit 09 store-evading): RO
// validation prose ('Varsta invalida.', `Inaltime intre ${min}...`) handed to
// `toast.show({message})` at the Onboarding/SettingsProfile render boundary.
// Stores/libs MUST emit a semantic i18n key resolved via t() at the React
// boundary — ZERO Romanian copy in .ts source. jsxOnly:false so plain code
// literals are scanned; isRoProse gates to multi-word RO/non-path literals, so
// keys ('onboarding.validation.ageRange'), enum slugs ('usor') and import/route
// paths never trip it.
//
// CARRIED-FORWARD DEBT (TS_LEAK_KNOWN): this scan surfaced pre-existing RO copy
// in OTHER .ts sources beyond the onboardingStore fix that introduced it. Those
// are real leaks of the SAME class but owned by separate FIX work — quarantined
// here (file + literal substring) so this gate goes green now AND permanently
// guards the onboardingStore validation class (+ any NEW .ts leak). Each entry
// is a known-RO literal; shrink this list as those files are keyed. Adding a
// row is a conscious admission of debt, NOT a way to silence a fresh leak —
// new RO copy in a store/lib must become a t() key, never a new row.
const TS_LEAK_KNOWN: ReadonlyArray<{ file: string; includes: string; why: string }> = [
  // coachVoice COACH_VOICE = canonical RO fallback pool (per-locale bundle
  // preferred via coachPick; const stays RO for engine-test compat).
  { file: 'src/react/lib/coachVoice.ts', includes: '', why: 'COACH_VOICE canonical RO fallback pool — keyed via coachEngine.voice.* bundle' },
  // historyImportParser skipped-row `reason` copy (CSV import results UI).
  { file: 'src/react/lib/historyImportParser.ts', includes: '', why: 'CSV import skip-reason copy — pending key migration' },
  // scheduleAdapterAggregate workout-title fallback rendered in WorkoutPreview.
  { file: 'src/react/lib/scheduleAdapterAggregate.ts', includes: 'Antrenament azi', why: 'workout-title fallback — pending key migration' },
  // workoutStore paused-session title marker rendered in Workout.
  { file: 'src/react/stores/workoutStore.ts', includes: '(sesiune nedefinita)', why: 'paused-session title marker — pending key migration' },
];
function isKnownTsLeak(file: string, text: string): boolean {
  return TS_LEAK_KNOWN.some((k) => k.file === file && (k.includes === '' || text.includes(k.includes)));
}
describe('i18n leak harness — src/react store/lib (.ts) sources carry no RO copy', () => {
  it('no Romanian copy hides in a src/react/**/*.ts (non-.tsx) source literal', () => {
    const files = gitFiles('src/react/**/*.ts')
      .filter((f) => !f.split('/').includes('__tests__') && !f.endsWith('.d.ts'));
    expect(files.length).toBeGreaterThan(5); // sanity: the .ts tree was found

    const hits: LeakHit[] = [];
    for (const rel of files) {
      hits.push(...scanSourceRoLiterals(resolve(REPO_ROOT, rel.split('/').join(sep)), rel, false)
        .filter((h) => !isKnownTsLeak(h.file, h.text)));
    }
    if (hits.length > 0) {
      const report = hits.map((h) => `  ${h.file}:${h.line} "${h.text}"`).join('\n');
      throw new Error(
        `Found ${hits.length} Romanian string literal(s) in a src/react .ts store/lib source ` +
          `(scanner-evading — the .tsx-only AST gate never reads .ts). Emit a semantic i18n ` +
          `key (resolve via t() at the React render boundary), never localized copy:\n${report}`,
      );
    }
    expect(hits).toEqual([]);
  });
});
