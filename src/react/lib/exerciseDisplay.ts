// ══ EXERCISE DISPLAY — English engine key → user-facing display name + subtitle ═
// Display names follow the Maria/Gigel persona rule: movements whose conventional
// RO gym name IS English stay English (Face Pull, Lat Pulldown, Pec Deck, Romanian
// Deadlift); accessory moves with a natural RO term get good Romanian (Ridicari
// laterale, Ramat la cablu, Presa de picioare). Literal translations that confuse
// a normal user are banned (ex: "Trageri la fata" read as a facial → "Face Pull").
// CRIT parity fix (workout-flow): active Workout + WorkoutPreview rendered raw
// English engine keys ("Incline DB Press", "Pec Deck", "Lateral Raises", ...)
// in a Romanian-first app. The engine uses English names as CANONICAL IDs
// (PR records keyed by name, alternativeEngine maps, weight tables) — they are
// identity, NOT display strings. Translating at the engine source would break
// every keyed lookup, so the RO display name is applied at the React adapter
// boundary (scheduleAdapterAggregate.toPlannedExercise) instead. `id` keeps the
// English-derived slug so engine identity stays intact downstream.
//
// Coverage: the WHOLE engine exercise vocabulary, not just the strictly
// display-reachable subset. Only EXERCISES_BY_TYPE (sessionBuilder.js) names
// actually surface in a planned session today — buildSession FILTERS by
// equipment + prioritizeWeakGroups only REORDERS (no named-alternative swap;
// the old alternativeEngine is archived/dead, 99-archive/). The remaining names
// (MUSCLE_GROUP_EXERCISES, config tables in muscleMap.js/dp.js/config/weights.js,
// legacy constants.js PROG) are dormant config keys — covered defensively so the
// raw-key fallback can never embarrass us if any path ever surfaces them.
// There is NO nameRo field in the 657-exercise library; these are curated
// translations of the bounded engine vocabulary, not 657 fabricated strings.
//
// RO display names + subtitles for the default Push demo verbatim from mockup
// andura-clasic.html#L3970-3974 (Impins inclinat / Impins militar sezand /
// Ridicari laterale / Extensii triceps cablu). Remaining names use standard RO
// gym terminology; subtitles describe equipment/setup per src/engine/
// sessionBuilder.js EQUIP_MAP. NO_DIACRITICS_RULE (D-LEGACY-064).

import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import { getCurrentLocale } from '../../i18n/index.js';

export interface ExerciseDisplay {
  name: string;
  sub?: string;
}

// ── EN display map (Wave C2 i18n) ─────────────────────────────────────────
// Under EN locale, the engine canonical key IS the EN name (Bench Press,
// Lat Pulldown, Romanian Deadlift, etc.) — so for most exercises we just
// echo the engine name. The few entries below carry an EN subtitle so the
// row stays visually consistent with the RO display (which had `sub` for
// equipment/setup hints). Industry-standard fitness vocabulary (Fitbod /
// Strong / Hevy) — NO literal RO translations.
const EXERCISE_DISPLAY_EN: Readonly<Record<string, ExerciseDisplay>> = {
  // ── Push ────────────────────────────────────────────────────────────────
  'Incline DB Press': { name: 'Incline DB Press', sub: 'Dumbbells · 30° bench' },
  'Flat DB Press': { name: 'Flat DB Press', sub: 'Dumbbells · flat bench' },
  'DB Shoulder Press': { name: 'DB Shoulder Press', sub: 'Seated, dumbbells' },
  'Lateral Raises': { name: 'Lateral Raises', sub: 'Dumbbells' },
  'Lateral Raises (cable)': { name: 'Lateral Raises', sub: 'Cable' },
  'Incline DB Press pump': { name: 'Incline DB Press', sub: 'Dumbbells · pump sets' },
  'Flat Barbell Bench': { name: 'Bench Press', sub: 'Barbell' },
  'Pec Deck': { name: 'Pec Deck', sub: 'Machine fly' },
  'Pec Deck / Cable Fly': { name: 'Chest Fly', sub: 'Pec deck / cable' },
  'Cable Fly': { name: 'Cable Fly', sub: 'Cable' },
  'Overhead Triceps': { name: 'Overhead Triceps Extension', sub: 'Cable' },
  'Pushdown': { name: 'Triceps Pushdown', sub: 'Cable, close grip' },

  // ── Pull ────────────────────────────────────────────────────────────────
  'Lat Pulldown': { name: 'Lat Pulldown', sub: 'Cable machine' },
  'Cable Row': { name: 'Cable Row', sub: 'Cable machine' },
  'Chest-Supported Row': { name: 'Chest-Supported Row', sub: 'Machine' },
  'Face Pulls': { name: 'Face Pull', sub: 'Cable' },
  'Bayesian Curl': { name: 'Bayesian Curl', sub: 'Cable · behind body' },
  'Incline DB Curl': { name: 'Incline DB Curl', sub: 'Incline bench' },
  'Cable Curl': { name: 'Cable Curl', sub: 'Cable' },
  'Preacher Curl': { name: 'Preacher Curl', sub: 'Preacher bench' },
  'EZ-bar Preacher Curl': { name: 'EZ-Bar Preacher Curl', sub: 'Preacher bench' },
  'DB Preacher Curl': { name: 'DB Preacher Curl', sub: 'Preacher bench' },
  'Machine Preacher Curl': { name: 'Machine Preacher Curl', sub: 'Preacher machine' },
  'Cable Preacher Curl': { name: 'Cable Preacher Curl', sub: 'Cable · preacher bench' },
  'Cheat Curl Barbell': { name: 'Cheat Curl', sub: 'Barbell · momentum allowed' },
  'Hammer Curl': { name: 'Hammer Curl', sub: 'Dumbbells · neutral grip' },
  'Rear Delt Fly': { name: 'Rear Delt Fly', sub: 'Machine fly' },
  'Rear Delt Cable': { name: 'Rear Delt Fly', sub: 'Cable' },

  // ── Legs ──────────────────────────────────────────────────────────────────
  'Leg Press': { name: 'Leg Press', sub: 'Machine' },
  'Leg Extension': { name: 'Leg Extension', sub: 'Machine' },
  'Leg Curl': { name: 'Leg Curl', sub: 'Machine' },
  'Romanian Deadlift': { name: 'Romanian Deadlift', sub: 'Barbell' },
  'Calf Raise': { name: 'Calf Raise', sub: 'Machine' },
  'Calf Raises': { name: 'Calf Raise', sub: 'Machine' },
};

// English engine key → user-facing display name + optional equipment/setup sub.
const EXERCISE_DISPLAY: Readonly<Record<string, ExerciseDisplay>> = {
  // ── Push ────────────────────────────────────────────────────────────────
  'Incline DB Press': { name: 'Impins inclinat', sub: 'Cu gantere · banc 30°' },
  'Flat DB Press': { name: 'Impins din piept', sub: 'Cu gantere · banc plat' },
  'DB Shoulder Press': { name: 'Impins militar sezand', sub: 'Cu gantere' },
  'Lateral Raises': { name: 'Ridicari laterale', sub: 'Cu gantere' },
  'Lateral Raises (cable)': { name: 'Ridicari laterale', sub: 'La cablu' },
  'Incline DB Press pump': { name: 'Impins inclinat', sub: 'Cu gantere · serii pump' },
  'Flat Barbell Bench': { name: 'Impins din piept', sub: 'Cu bara' },
  'Pec Deck': { name: 'Pec Deck', sub: 'Aparat fluturari' },
  'Pec Deck / Cable Fly': { name: 'Fluturari', sub: 'Pec deck / cablu' },
  'Cable Fly': { name: 'Fluturari la cablu', sub: 'Cablu' },
  'Overhead Triceps': { name: 'Extensii triceps peste cap', sub: 'Cablu' },
  'Pushdown': { name: 'Extensii triceps la cablu', sub: 'Cablu, prindere strans' },

  // ── Pull ────────────────────────────────────────────────────────────────
  'Lat Pulldown': { name: 'Lat Pulldown', sub: 'Aparat helcometru' },
  'Cable Row': { name: 'Ramat la cablu', sub: 'Aparat helcometru' },
  'Chest-Supported Row': { name: 'Ramat cu piept sprijinit', sub: 'Aparat' },
  'Face Pulls': { name: 'Face Pull', sub: 'Cablu' },
  // RO naming reglaj smoke 2026-05-28 — "Flexii biceps la X" cringe (Daniel
  // "buseste rasul" on "la pupitru"). Match how lifters actually call them in
  // sala: "Curl la cablu" / "Curl inclinat cu gantere". Single coherent
  // vocabulary across the curl family.
  'Bayesian Curl': { name: 'Curl la cablu', sub: 'Cablu · spate' },
  'Incline DB Curl': { name: 'Curl inclinat cu gantere', sub: 'Banc inclinat' },
  'Cable Curl': { name: 'Curl la cablu', sub: 'Cablu' },
  // Daniel feedback smoke 2026-05-28 "Flexii biceps la pupitru ma si buseste rasul"
  // → renamed to clean modern RO gym term. Curl la pupitru = how lifters actually
  // say it in sala; "Flexii biceps" was the awkward dictionary calque. Variants
  // ("Preacher Curl" family) follow the same vocabulary so a "Nu vreau" swap
  // surfaces consistent naming (overrides library `nameRo` which still spells
  // them "Flexii la pupitru ..." — not touched here, single SoT here).
  'Preacher Curl': { name: 'Curl la pupitru', sub: 'Banc preacher' },
  'EZ-bar Preacher Curl': { name: 'Curl la pupitru cu bara EZ', sub: 'Banc preacher' },
  'DB Preacher Curl': { name: 'Curl la pupitru cu gantere', sub: 'Banc preacher' },
  'Machine Preacher Curl': { name: 'Curl la pupitru la aparat', sub: 'Aparat preacher' },
  'Cable Preacher Curl': { name: 'Curl la pupitru la cablu', sub: 'Cablu · banc preacher' },
  // Cheat Curl Barbell library nameRo "Flexii cu avant cu bara" - awkward calque.
  // Lifters say "Cheat curl cu bara" (English root + RO equipment). Same family
  // override pattern as Preacher Curl.
  'Cheat Curl Barbell': { name: 'Cheat curl cu bara', sub: 'Cu bara · momentum permis' },
  'Hammer Curl': { name: 'Hammer Curl', sub: 'Cu gantere · priza neutra' },
  'Rear Delt Fly': { name: 'Fluturari deltoid posterior', sub: 'Aparat fluturari' },
  'Rear Delt Cable': { name: 'Fluturari deltoid posterior', sub: 'Cablu' },

  // ── Legs ──────────────────────────────────────────────────────────────────
  'Leg Press': { name: 'Presa de picioare', sub: 'Aparat presa' },
  'Leg Extension': { name: 'Extensii cvadriceps', sub: 'Aparat picioare' },
  'Leg Curl': { name: 'Flexii femurale', sub: 'Aparat picioare' },
  'Romanian Deadlift': { name: 'Romanian Deadlift', sub: 'Cu bara' },
  'Calf Raise': { name: 'Ridicari pe varfuri', sub: 'Aparat gambe' },
  'Calf Raises': { name: 'Ridicari pe varfuri', sub: 'Aparat gambe' },
};

/**
 * Map an engine exercise name (English canonical key) to its locale-appropriate
 * display form. Precedence (WP-6 + Wave C2 i18n):
 *
 * EN locale (default post 2026-05-28 paradigm flip):
 *   1. EXERCISE_DISPLAY_EN — ~30 curated EN names with industry-standard
 *      fitness vocabulary (Fitbod/Strong/Hevy) + equipment subtitles.
 *   2. library `nameEn` field — echoes the canonical engine key.
 *   3. Engine name itself — already English (canonical), safe to render raw.
 *
 * RO locale (opt-in from Cont > Setari > Limba):
 *   1. EXERCISE_DISPLAY — the ~30 mockup-tuned curated RO names (verbatim from
 *      andura-clasic.html DESIGN MASTER; carries equipment/setup `sub`).
 *   2. library `nameRo` — the 657-exercise compositional RO names (WP-6).
 *   3. EN fallback — original string with NO subtitle when truly unknown.
 */
export function toExerciseDisplay(engineName: string): ExerciseDisplay {
  const locale = getCurrentLocale();
  if (locale === 'en') {
    const enCurated = EXERCISE_DISPLAY_EN[engineName];
    if (enCurated) return enCurated;
    const nameEn = getExerciseMetadata(engineName).nameEn;
    if (nameEn) return { name: nameEn };
    return { name: engineName };
  }
  // RO locale (opt-in)
  const mockup = EXERCISE_DISPLAY[engineName];
  if (mockup) return mockup;
  const nameRo = getExerciseMetadata(engineName).nameRo;
  if (nameRo) return { name: nameRo };
  return { name: engineName };
}
