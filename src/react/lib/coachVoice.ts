// ══ COACH VOICE — Lookup Library + coachPick() Selector ═══════════════════
// Per DECISIONS.md §D-LEGACY-052 Andura Suflet brand soul.
// Port verbatim from mockup andura-clasic.html lines 3796-3842.
// Pure-function selector — seed-able pentru reproducibility tests; Math.random
// default = side-effect la I/O boundary acceptable (ADR 026 §9).
//
// Romanian no-diacritics RULE D-LEGACY-064 — UI strings strip diacritice.
// Mockup unicode escapes (â = â, — = em-dash, „/” = quotes)
// normalized: diacritics stripped la ASCII; em-dash converted la standard
// hyphen `-` pentru consistency.
//
// Cross-refs:
//   - mockup andura-clasic.html#L3796-3848 COACH_VOICE + coachPick
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet
//   - DECISIONS.md §D-LEGACY-064 NO_DIACRITICS_RULE

export const COACH_VOICE = {
  // before user logs set
  preset: [
    'Hai pe el, ai prins ritmul.',
    'Acelasi tempo ca data trecuta - esti bun.',
    'Concentreaza-te pe controlul coborarii.',
    'Setul asta merge bine - respira adanc inainte.',
    'Pastreaza forma, restul vine.',
  ],
  // user rated 🟢 Usor
  postUsor: [
    'Era prea usor - adaugam putin la urmatorul.',
    'Daca ai inca in rezerva, urca-te 1-2 reps in plus la urmator.',
    'Bun - coach-ul urca pragul putin.',
  ],
  // 🟡 Potrivit
  postPotrivit: [
    'Asta vrem - esti exact pe traiectorie.',
    'Bun, mergi bine. Continuam la fel.',
    'Potrivit = predictie buna. Pastreaza.',
  ],
  // 🔴 Greu
  postGreu: [
    'OK, retragem putin la urmator.',
    'Greu - pastram aceeasi greutate, nu fortam.',
    'Notat. Coach-ul ajusteaza singur.',
  ],
  // during pauza
  rest: [
    'Recuperare buna acum, respira adanc.',
    'Bea o gura de apa, relaxeaza umerii.',
    'Setul asta a fost solid - same effort la urmator.',
    'Pauza scurta, e suficient.',
    'Nu te grabi, recuperarea conteaza.',
  ],
  // transition phase între exerciții — exercise complete, urmatorul incoming.
  // Phase 4 task_10 §C: rename endExercise → transition (LOCKED Opțiune 1)
  // pentru semantic clarity. Mockup comment line 52 confirma intent verbatim
  // "exercise complete, transition". Smallest blast radius (2 consumers
  // updated: Workout.tsx + coachVoice.test.ts).
  transition: [
    'Piept gata, hai pe umeri!',
    'Bun - primul check.',
    'Curat. Trecem mai departe.',
    'Asta a fost. Inca un exercitiu si esti la jumate.',
  ],
  // post-session by rating (keys match mockup wv2 per-set rating taxonomy)
  endSession: {
    usor: [
      'Mergi bine, te astept joi mai vioi.',
      'Sesiune curata. Maine urcam putin.',
    ],
    potrivit: [
      'Mergi bine, te astept joi!',
      'Bun. Continuam pe traiectorie.',
    ],
    greu: [
      'Mergi bine - azi a fost greu, maine recuperam.',
      'Notat. Ai dat tot, asta conteaza.',
    ],
  },
  // shown on Antrenor idle post-session
  reflectie: [
    'Sesiunea de azi te-a apropiat de tinta lunii - mergi bine.',
    '12 zile consecutive. Constanta bate intensitatea.',
    'Bun ritm. Maine pauza, joi revenim.',
  ],
  // shown on workout-preview pre-session (task_05 §C)
  preview: [
    'Stim ce avem azi - hai sa o facem curat.',
    'Asculta-ti corpul; ajustam pe parcurs daca apare ceva.',
    'Forma intai, greutatea dupa.',
  ],
} as const;

export type CoachVoiceFlatCategory =
  | 'preset' | 'postUsor' | 'postPotrivit' | 'postGreu'
  | 'rest' | 'transition' | 'reflectie' | 'preview';

export type CoachVoiceEndSessionRating = 'usor' | 'potrivit' | 'greu';

/**
 * Pure-function selector — deterministic cu seed (Phase 3 task_05+ pot pasa
 * seed pentru reproducibility tests). Default Math.random() = side-effect la
 * I/O boundary (caller responsibility per ADR 026 §9).
 *
 * Signature overloads (informal — TS uses union):
 *   coachPick('endSession', 'usor', seed?) → COACH_VOICE.endSession.usor[idx]
 *   coachPick('preset' | 'rest' | ..., undefined, seed?) → flat pool [idx]
 *
 * Returns empty string '' daca category necunoscut sau pool gol (mockup
 * fidelity — NU throw, just empty defaultable UI).
 */
export function coachPick(
  category: CoachVoiceFlatCategory | 'endSession',
  rating?: CoachVoiceEndSessionRating,
  seed?: number
): string {
  let pool: readonly string[] = [];

  if (category === 'endSession') {
    if (!rating) return '';
    pool = COACH_VOICE.endSession[rating] ?? [];
  } else if (
    category === 'preset' || category === 'postUsor' ||
    category === 'postPotrivit' || category === 'postGreu' ||
    category === 'rest' || category === 'transition' ||
    category === 'reflectie' || category === 'preview'
  ) {
    pool = COACH_VOICE[category];
  }

  if (pool.length === 0) return '';
  const idx =
    seed !== undefined
      ? Math.abs(seed) % pool.length
      : Math.floor(Math.random() * pool.length);
  return pool[idx] ?? '';
}
