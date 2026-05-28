import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';
import { toExerciseDisplay } from '../../react/lib/exerciseDisplay';
import { setLocale, _resetI18nCache } from '../../i18n/index.js';

// ══ WP-6 NAMING QA-GATE (D081) — anti-facade ════════════════════════════════
// Asserts the 657-entry RO display layer is REAL, not a green-on-empty facade:
// every entry has a non-empty `nameRo`, zero diacritics (D-LEGACY-064), no
// forbidden untranslated English tokens (except standard-RO gym terms), and a
// UI-safe length. Mirrors §6.4 of the P3 MOAT design.

const ALL = Object.entries(EXERCISE_METADATA);

// Standard-RO gym terms: the EN phrase IS the Romanian gym term. These are kept
// verbatim and are exempt from the residual-EN-token blacklist (§6.3 rule 1).
const STD_RO_WHITELIST = [
  'Bench Press', 'Deadlift', 'Romanian Deadlift', 'Face Pull', 'Hip Thrust',
  'Lat Pulldown', 'Pec Deck', 'Hammer Curl', 'Push Press', 'Good Morning',
];

// Diacritics are banned project-wide (D-LEGACY-064).
const DIACRITICS = /[ăâîșțĂÂÎȘȚşţŞŢ]/;

// Untranslated English movement tokens that must NEVER survive in a RO display
// name unless they are part of a standard-RO whitelist phrase.
const FORBIDDEN_EN_TOKENS = ['Press', 'Curl', 'Fly', 'DB', 'Pull', 'Row'];

// UI-safe length ceiling (~40 chars per §6.4; small tolerance so natural RO
// phrasing is not forced into cramped abbreviations).
const MAX_LEN = 42;

describe('WP-6 nameRo QA-gate (657 entries)', () => {
  it('every entry has a non-empty nameRo and matching nameEn identity', () => {
    for (const [key, meta] of ALL) {
      expect(meta.nameRo, `${key} missing nameRo`).toBeTruthy();
      expect(meta.nameRo.trim().length, `${key} blank nameRo`).toBeGreaterThan(0);
      expect(meta.nameEn, `${key} nameEn must echo the canonical key`).toBe(key);
    }
  });

  it('no nameRo contains diacritics (D-LEGACY-064)', () => {
    const offenders = ALL
      .filter(([, m]) => DIACRITICS.test(m.nameRo))
      .map(([k, m]) => `${k} => ${m.nameRo}`);
    expect(offenders, `diacritics found: ${offenders.join(', ')}`).toEqual([]);
  });

  it('no nameRo carries forbidden untranslated EN tokens (except standard-RO terms)', () => {
    const offenders = [];
    for (const [key, meta] of ALL) {
      // Strip whitelist phrases first so their internal EN words are exempt.
      let stripped = ` ${meta.nameRo} `;
      for (const phrase of STD_RO_WHITELIST) stripped = stripped.split(phrase).join(' ');
      for (const tok of FORBIDDEN_EN_TOKENS) {
        const re = new RegExp(`(^|\\s)${tok}(?=\\s|$)`);
        if (re.test(stripped)) offenders.push(`${key} => ${meta.nameRo} [${tok}]`);
      }
    }
    expect(offenders, `residual EN tokens: ${offenders.join(', ')}`).toEqual([]);
  });

  it('every nameRo is UI-safe length (< ~40 chars)', () => {
    const offenders = ALL
      .filter(([, m]) => m.nameRo.length > MAX_LEN)
      .map(([k, m]) => `${k} => ${m.nameRo} (${m.nameRo.length})`);
    expect(offenders, `over-length: ${offenders.join(', ')}`).toEqual([]);
  });

  // ── Word-order sanity (anti-garble) ──────────────────────────────────────
  // WP-6 reorder pass stranded the movement verb AFTER the equipment/setup phrase
  // for a handful of entries ("plat cu bara Impins din piept" instead of the
  // natural "Impins din piept plat cu bara"), and bare-concatenated two movements
  // ("Face Pull Impins din piept"). The original gate (diacritics/EN-token/length)
  // is blind to word order, so the garble shipped green. This guard fails when a
  // known RO movement verb is stranded AFTER an equipment phrase (the structural
  // signature of the mis-order). Filter: would Maria/Gigel read this as a real
  // exercise? "cu bara ... Impins" reads as broken Romanian.
  const MOVEMENT_VERBS = [
    'Impins', 'Ramat', 'Flexii', 'Genuflexiuni', 'Fluturari', 'Ridicari',
    'Extensii', 'Presa', 'Tractiuni', 'Indreptari', 'Punte', 'Aplecari', 'Trageri',
  ];
  // Equipment / setup phrases that must NOT precede the movement verb. When one of
  // these opens the name and a movement verb follows, the verb was stranded.
  const EQUIP_PHRASES = [
    'cu bara', 'cu gantere', 'cu gantera', 'la cablu', 'la aparat', 'la scripete',
    'cu kettlebell', 'cu banda', 'cu greutate', 'la Smith',
  ];

  it('no nameRo strands a movement verb AFTER an equipment phrase (word-order garble)', () => {
    const offenders = [];
    for (const [key, meta] of ALL) {
      const ro = meta.nameRo;
      const verbIdx = MOVEMENT_VERBS
        .map((v) => ro.indexOf(v))
        .filter((i) => i >= 0)
        .reduce((min, i) => (min < 0 || i < min ? i : min), -1);
      if (verbIdx <= 0) continue; // verb absent or already leading — fine
      for (const ep of EQUIP_PHRASES) {
        const ei = ro.indexOf(ep);
        if (ei >= 0 && ei < verbIdx) {
          offenders.push(`${key} => ${ro} [equip "${ep}" precedes verb]`);
          break;
        }
      }
    }
    expect(offenders, `word-order garble: ${offenders.join(', ')}`).toEqual([]);
  });

  it('no nameRo bare-concatenates two distinct movement verbs (e.g. "Face Pull Impins ...")', () => {
    // A name should describe ONE movement. Two movement verbs (or a whitelist
    // movement phrase + a second verb) signals a concatenation glitch like
    // "Face Pull Impins din piept". Hammer Curl is whitelisted (Curl is its own
    // verb token) so it is exempted via the standard-RO whitelist.
    const offenders = [];
    for (const [key, meta] of ALL) {
      let ro = ` ${meta.nameRo} `;
      for (const phrase of STD_RO_WHITELIST) ro = ro.split(phrase).join(' ');
      const hits = MOVEMENT_VERBS.filter((v) => {
        const re = new RegExp(`(^|\\s)${v}(?=\\s|$)`, 'g');
        return (` ${ro} `.match(re) || []).length > 0;
      });
      // Also flag a surviving whitelist movement noun fused with a RO verb.
      const fusedFacePull = /Face Pull\s+(Impins|Ramat|Extensii|Flexii|Presa)/.test(meta.nameRo);
      if (hits.length >= 2 || fusedFacePull) {
        offenders.push(`${key} => ${meta.nameRo} [${hits.join('+')}${fusedFacePull ? ' +fused' : ''}]`);
      }
    }
    expect(offenders, `multi-verb concatenation: ${offenders.join(', ')}`).toEqual([]);
  });

  it('the tricky non-compositional names resolved to descriptive RO (not literal)', () => {
    // Spot-anchors so a future regen cannot silently re-introduce literal disasters.
    expect(EXERCISE_METADATA['Scaption'].nameRo).toBe('Ridicari frontale-laterale 45 grade');
    expect(EXERCISE_METADATA['Frog Pump'].nameRo).toBe('Punte fese cu picioarele departate');
    expect(EXERCISE_METADATA['Face Pull'].nameRo).toBe('Face Pull'); // standard-RO, kept EN
    expect(EXERCISE_METADATA['DB Cross-Body Hammer'].nameRo).not.toMatch(/\bDB\b/);
  });
});

describe('toExerciseDisplay RO precedence (mockup > library nameRo > EN) — locale=ro opt-in', () => {
  // Wave C2 i18n: toExerciseDisplay is now locale-aware. Default locale is EN
  // post 2026-05-28 paradigm flip; these tests force RO opt-in to verify the
  // RO precedence chain still works for users who switch from Cont > Setari.
  beforeEach(() => {
    setLocale('ro');
  });
  afterEach(() => {
    try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
    _resetI18nCache();
  });

  it('mockup-tuned curated name wins over library nameRo', () => {
    // "Incline DB Press" is curated in EXERCISE_DISPLAY ("Impins inclinat" + sub).
    const d = toExerciseDisplay('Incline DB Press');
    expect(d.name).toBe('Impins inclinat');
    expect(d.sub).toBe('Cu gantere · banc 30°');
  });

  it('library nameRo is used for names absent from the mockup map', () => {
    // "Scaption" is NOT in EXERCISE_DISPLAY, so the library nameRo surfaces.
    const d = toExerciseDisplay('Scaption');
    expect(d.name).toBe('Ridicari frontale-laterale 45 grade');
    expect(d.sub).toBeUndefined();
  });

  it('unknown engine name falls back to the raw string with no subtitle', () => {
    const d = toExerciseDisplay('Totally Unknown Move 9000');
    expect(d.name).toBe('Totally Unknown Move 9000');
    expect(d.sub).toBeUndefined();
  });
});

describe('toExerciseDisplay EN precedence (curated EN > nameEn > engine name) — locale=en default', () => {
  // Wave C2 i18n — EN locale is the default. The canonical engine key IS the
  // EN name (English by design — PR records key on it), so most exercises
  // simply echo the engine name. ~30 curated entries carry an EN subtitle.
  beforeEach(() => {
    setLocale('en');
  });
  afterEach(() => {
    try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
    _resetI18nCache();
  });

  it('curated EN entry returns industry-standard EN name + subtitle', () => {
    const d = toExerciseDisplay('Flat Barbell Bench');
    expect(d.name).toBe('Bench Press');
    expect(d.sub).toBe('Barbell');
  });

  it('uncurated engine name echoes raw (already English canonical)', () => {
    const d = toExerciseDisplay('Scaption');
    expect(d.name).toBe('Scaption');
  });

  it('zero RO diacritics or RO-specific tokens leak under EN locale', () => {
    // Spot-check a few that have RO `nameRo` overrides — under EN they must
    // never surface "Impins" / "Genuflexiuni" / "Ridicari".
    for (const key of ['Incline DB Press', 'Flat DB Press', 'Lateral Raises', 'Scaption']) {
      const d = toExerciseDisplay(key);
      expect(d.name).not.toMatch(/Impins|Genuflexiuni|Ridicari|Flexii|Indreptari/i);
    }
  });
});
