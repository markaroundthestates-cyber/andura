// ══ CONSTANTS TYPE STUBS — A022a iter 2 prep ════════════════════════════
// §A022a audit fix iter 2 prep — type stubs pentru src/constants.js to
// unblock incremental TS strict checkJs migration.
//
// Reflects src/constants.js exports verbatim. Sets + maps NU exported as
// readonly because legacy code may mutate (rare); narrowing at use site.

// ── Weight + dates ──
export const SW_KG: number;
export const TW_KG: number;
export const START_DATE: Date;
export const TARGET_DATE: Date;
export const DTOT: number;

// ── Nutrition baselines ──
export const KCAL_TARGET: number;
export const PROT_TARGET: number;

// ── Workout timing ──
export const PAUSE_COMPOUND: number;
export const PAUSE_ISO: number;

// ── Time helpers ──
export const MS_PER_DAY: number;
export const MS_PER_HOUR: number;

// ── Exercise classification ──
export const COMPOUND_EX: readonly string[];
export const EX_SETS: Readonly<Record<string, number>>;
export const EX_REPS: Readonly<Record<string, string>>;

// ── Program schedule (PROG array) ──
export interface ProgDay {
  day: string;
  t: 'workout' | 'off';
  lb: string;
  tm: number | null;
  ex: ProgExercise[];
}

export interface ProgExercise {
  name: string;
  sets?: number;
  reps?: string;
  pause?: number;
}

export const PROG: ReadonlyArray<ProgDay>;
