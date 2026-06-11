// ══ EQUIPMENT TEMPLATE LIBRARY — common commercial ladder "rute prestabilite" ══
// (Rounding-universal arc, CEO design 2026-06-11 — _GYMLOG_FINDINGS_2026-06-11.md
//  §GENERALIZARE.) The learn-from-logs rounding is PER-USER PER-MACHINE, but it does
// NOT learn the gym rung-by-rung: from 2-3 logged loads it MATCHES one of these
// common factory templates and then knows the WHOLE ladder instantly ("omu logheaza
// x → stie ca aparatul are greutatile y"). Daniel's gym is the first seed set.
//
// PURE DATA. Frozen. Zero I/O. Consumed by dp/equipmentLadder.js (matchTemplate /
// snapToLadder). Precedence at the consumer: curated (photo, future) > matched
// template (this file + observations) > generic fallback (config/weights.js, never
// regresses).
//
// ── A template is one of two shapes ──────────────────────────────────────────
//   { id, family, steps: number[],        provenance }   — explicit rung list
//   { id, family, gen: {start,step,max},  provenance }   — arithmetic generator
// `family` ∈ 'cable_stack' | 'dumbbell' | 'plate_set' | 'fixed_bar' | 'machine_stack'.
// `provenance` = where the ladder comes from (manufacturer / standard / Daniel's
// gym), so a future photo-curated source can supersede a learned match with a clear
// audit trail.
//
// ── RESEARCH PROVENANCE NOTE ──────────────────────────────────────────────────
// The manufacturer step values below are the well-established commercial standards
// (selectorized stacks ship in either ~5kg metric plates or 10-15 lb imperial
// plates, with a 2.5kg / 2.5-5 lb "add-on" micro-weight or dual-increment magnet;
// fixed dumbbell sets run 1kg steps low / 2.5kg steps high in metric gyms and
// 5 lb steps in imperial gyms; olympic plate inventories are 1.25/2.5/5/10/15/20/25
// kg metric). Where a WebSearch citation was reachable it is named inline; the
// classifier that gates WebSearch was down during authoring (2026-06-11) so several
// entries cite the standard by name pending a live-source upgrade — the VALUES are
// the load-bearing artifact, the citation string is documentation.

// Helper: expand a generator to an explicit ascending rung list (inclusive of max
// when it lands on a step). PURE. Rounds to 0.01kg to kill float drift (2.27 adds).
function expand(start, step, max) {
  const out = [];
  for (let w = start; w <= max + 1e-9; w += step) out.push(Math.round(w * 100) / 100);
  return out;
}

/**
 * @typedef {Object} EquipmentTemplate
 * @property {string} id              stable unique id
 * @property {'cable_stack'|'dumbbell'|'plate_set'|'fixed_bar'|'machine_stack'} family
 * @property {number[]} steps         the explicit ascending rung list (kg)
 * @property {string} provenance      manufacturer / standard / gym source
 */

/**
 * The template library. Each entry's `steps` is the explicit ascending kg ladder
 * (generators are pre-expanded here so the consumer matches against a plain array).
 * @type {ReadonlyArray<EquipmentTemplate>}
 */
export const EQUIPMENT_TEMPLATES = Object.freeze([
  // ════════════════════════════════════════════════════════════════════════════
  // CABLE / SELECTORIZED STACKS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Daniel's gym — Matrix dual adjustable pulley (helcometru) ────────────────
  // SEED from _GYMLOG_FINDINGS §LADDERS: 10 lb plates → ~4.5kg rungs, confirmed
  // on-ladder by his logged loads (Cable Fly 23, Face Pull 27/32/36, Bayesian
  // 9/14/18, Lat Pulldown 59, Cable Row 73/78). 73 EXISTS — closes the old mystery.
  Object.freeze({
    id: 'cable_10lb_daniel',
    family: 'cable_stack',
    steps: Object.freeze([5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 63, 68, 73, 78]),
    provenance: "Daniel's gym Matrix dual pulley (10lb/4.54kg plates) — _GYMLOG_FINDINGS_2026-06-11.md §LADDERS",
  }),

  // ── Generic 10 lb imperial selectorized stack ────────────────────────────────
  // The dominant US/imperial commercial stack: 10 lb (4.54kg) plates. Generated
  // from the first plate up so it matches ANY 10lb-stack gym, not just Daniel's
  // (his floor happens to be 5kg ≈ the carriage; the rungs are the +4.54 cadence).
  // Provenance: standard imperial selectorized stack (Life Fitness / Hammer
  // Strength / Cybex selectorized lines ship 10 lb plates as the default).
  Object.freeze({
    id: 'cable_10lb_generic',
    family: 'cable_stack',
    steps: Object.freeze(expand(4.54, 4.54, 113.5)), // 10lb..250lb in 10lb steps, kg
    provenance: 'Generic imperial 10lb (4.54kg) selectorized stack — Life Fitness / Hammer Strength / Cybex standard plate',
  }),

  // ── 10 lb stack WITH 5 lb add-on (dual-increment) ────────────────────────────
  // Many imperial stacks add a 5 lb (2.27kg) "add-on" weight or a dual-increment
  // magnet that lets you split a plate → effective 5 lb resolution. Generated at
  // the 2.27kg cadence. Provenance: Life Fitness "Adjustable Start Weight" / add-on
  // weight option; Technogym dual-increment selectorized.
  Object.freeze({
    id: 'cable_5lb_addon',
    family: 'cable_stack',
    steps: Object.freeze(expand(2.27, 2.27, 113.5)), // 5lb..250lb in 5lb steps, kg
    provenance: 'Imperial selectorized stack with 5lb (2.27kg) add-on / dual-increment magnet — Life Fitness add-on weight, Technogym',
  }),

  // ── Generic 5 kg metric selectorized stack ────────────────────────────────────
  // The dominant EU/metric commercial stack: 5kg plates (Technogym, Panatta,
  // Impulse, Matrix metric lines). Provenance: standard metric selectorized stack.
  Object.freeze({
    id: 'cable_5kg_metric',
    family: 'cable_stack',
    steps: Object.freeze(expand(5, 5, 120)), // 5..120kg in 5kg steps
    provenance: 'Generic metric 5kg selectorized stack — Technogym / Panatta / Impulse / Matrix metric standard plate',
  }),

  // ── Metric 5 kg stack WITH 2.5 kg add-on ──────────────────────────────────────
  // Metric stacks commonly ship a 2.5kg add-on weight / split magnet → 2.5kg
  // resolution. Provenance: Technogym / Precor metric add-on weight.
  Object.freeze({
    id: 'cable_2p5kg_addon',
    family: 'cable_stack',
    steps: Object.freeze(expand(2.5, 2.5, 120)), // 2.5..120kg in 2.5kg steps
    provenance: 'Metric 5kg selectorized stack with 2.5kg add-on / split magnet — Technogym / Precor',
  }),

  // ── 7.5 kg-plate metric stack (some leg/heavy stacks) ─────────────────────────
  // Heavier selectorized stations (some leg machines, lat/row towers) ship 7.5kg
  // plates. Provenance: metric heavy selectorized stack standard.
  Object.freeze({
    id: 'cable_7p5kg_metric',
    family: 'cable_stack',
    steps: Object.freeze(expand(7.5, 7.5, 180)), // 7.5..180kg in 7.5kg steps
    provenance: 'Metric 7.5kg selectorized stack (heavy leg/lat stations) — metric commercial standard',
  }),

  // ════════════════════════════════════════════════════════════════════════════
  // MACHINE STACKS (selector machines with their OWN non-cable ladder)
  // ════════════════════════════════════════════════════════════════════════════
  // Plate-loaded / selector machines whose stack is independent of the cable
  // towers — proven OFF the cable ladder in Daniel's logs (Reverse Pec Deck 24,
  // Leg Extension 96, Leg Curl 60/66, Calf 140). Same factory plate families as
  // cable stacks (5kg metric / 4.54kg imperial), declared as `machine_stack` so a
  // match is attributed to the right family for the photo-curated upgrade later.
  Object.freeze({
    id: 'machine_5kg_metric',
    family: 'machine_stack',
    steps: Object.freeze(expand(5, 5, 160)), // 5..160kg
    provenance: 'Generic metric 5kg machine selector stack (leg ext/curl, pec deck) — metric commercial standard',
  }),
  Object.freeze({
    id: 'machine_10lb_imperial',
    family: 'machine_stack',
    steps: Object.freeze(expand(4.54, 4.54, 145)), // 10lb..~320lb in 10lb steps, kg
    provenance: 'Generic imperial 10lb (4.54kg) machine selector stack — Hammer Strength / Cybex selectorized',
  }),

  // ════════════════════════════════════════════════════════════════════════════
  // DUMBBELL SETS (fixed-weight racks)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Daniel's gym — fixed dumbbells ───────────────────────────────────────────
  // SEED from _GYMLOG_FINDINGS §LADDERS: 7,8,9,10 then 2.5 steps to 37.5. Logged
  // loads land exactly on it (Seated DB 20/22.5/25, Incline DB 25/30, Hammer 12.5,
  // DB Lateral 9/12.5). Per-hand loads.
  Object.freeze({
    id: 'dumbbell_daniel',
    family: 'dumbbell',
    steps: Object.freeze([7, 8, 9, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5]),
    provenance: "Daniel's gym fixed DB rack — _GYMLOG_FINDINGS_2026-06-11.md §LADDERS",
  }),

  // ── Metric DB set: 1kg low (1→10 by 1), 2.5kg high (10→ by 2.5) ───────────────
  // The dominant EU commercial fixed-DB rack: 1kg increments through the light end,
  // 2.5kg increments above 10kg. Provenance: standard European fixed-dumbbell set.
  Object.freeze({
    id: 'dumbbell_metric_1_then_2p5',
    family: 'dumbbell',
    steps: Object.freeze([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50,
    ]),
    provenance: 'Generic metric fixed-DB rack — 1kg steps to 10, 2.5kg steps above (European commercial standard)',
  }),

  // ── Metric DB set: pure 2 kg steps ────────────────────────────────────────────
  // Some metric racks (and most adjustable/spinlock sets) run a flat 2kg cadence.
  // Provenance: metric 2kg fixed-DB set / adjustable plate-DB standard.
  Object.freeze({
    id: 'dumbbell_metric_2kg',
    family: 'dumbbell',
    steps: Object.freeze(expand(2, 2, 50)), // 2..50kg by 2
    provenance: 'Generic metric fixed-DB rack — flat 2kg steps (metric commercial / adjustable set)',
  }),

  // ── Imperial DB set: 5→100 lb by 5 lb (2.27kg cadence) ────────────────────────
  // The dominant US commercial fixed-DB rack: 5 lb (2.27kg) increments, 5→100 lb
  // (and beyond). Provenance: standard imperial fixed-dumbbell set (hex / round).
  Object.freeze({
    id: 'dumbbell_imperial_5lb',
    family: 'dumbbell',
    steps: Object.freeze(expand(2.27, 2.27, 45.36)), // 5lb..100lb by 5lb, kg
    provenance: 'Generic imperial fixed-DB rack — 5lb (2.27kg) steps 5→100lb (US commercial hex/round)',
  }),

  // ════════════════════════════════════════════════════════════════════════════
  // PLATE SETS (barbell / Smith — loaded weight, see plateMath for exact combos)
  // ════════════════════════════════════════════════════════════════════════════
  // NOTE: these are the PLATE INVENTORIES (the discrete plate denominations a gym
  // owns), NOT the resulting bar-load ladder — engine/plateMath.js composes the
  // achievable totals from a bar + these plates. matchTemplate treats `steps` here
  // as the achievable-increment proxy (smallest pair = finest jump) for snapping a
  // free-bar load; plateMath remains the exact solver where it is wired.

  // ── Daniel's gym — metric plate inventory ────────────────────────────────────
  // SEED from _GYMLOG_FINDINGS §LADDERS: 1.25, 2.5, 5, 10, 15, 20, 25 kg → smallest
  // PAIR jump = 2×1.25 = 2.5kg. Represented as the 2.5kg total-increment ladder.
  Object.freeze({
    id: 'plate_metric_daniel',
    family: 'plate_set',
    steps: Object.freeze(expand(2.5, 2.5, 300)), // 2.5kg total-load steps (2×1.25 pair)
    provenance: "Daniel's gym olympic plates 1.25-25kg (smallest pair = 2.5kg) — _GYMLOG_FINDINGS_2026-06-11.md §LADDERS",
  }),

  // ── Standard EU metric olympic plate set ──────────────────────────────────────
  // 1.25/2.5/5/10/15/20/25 kg — the universal EU metric inventory. Smallest pair =
  // 2.5kg total. Provenance: ISO/metric olympic plate standard.
  Object.freeze({
    id: 'plate_metric_standard',
    family: 'plate_set',
    steps: Object.freeze(expand(2.5, 2.5, 360)),
    provenance: 'Standard EU metric olympic plate set 1.25-25kg (smallest pair 2.5kg) — metric/ISO standard',
  }),

  // NOTE: a 1kg-cadence micro/fractional-plate ladder is DELIBERATELY NOT an auto-
  // match template — a 1kg step is so dense it would match nearly any integer-ish
  // pair of logged loads (defeating discrimination, see RUNG_TOL in equipmentLadder).
  // Fractional/micro plates are a CURATED-only source (the future photo seam passes
  // explicit steps to snapToLadder, which win over any matched template).

  // ── Imperial olympic plate set: 2.5/5/10/25/35/45 lb ──────────────────────────
  // The US inventory; smallest pair = 2×2.5 lb = 5 lb (2.27kg total). Provenance:
  // standard imperial olympic plate set.
  Object.freeze({
    id: 'plate_imperial_standard',
    family: 'plate_set',
    steps: Object.freeze(expand(2.27, 2.27, 360)), // 5lb total-load steps, kg
    provenance: 'Standard imperial olympic plate set 2.5-45lb (smallest pair 5lb/2.27kg) — US commercial standard',
  }),

  // ════════════════════════════════════════════════════════════════════════════
  // FIXED BARBELLS / EZ (pre-loaded straight + EZ bars)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Metric fixed-barbell set: 10→45 kg by 2.5 ─────────────────────────────────
  // Pre-weighted straight/EZ bars on a rack, 2.5kg apart. Provenance: standard
  // metric fixed-barbell set.
  Object.freeze({
    id: 'fixed_bar_metric_2p5',
    family: 'fixed_bar',
    steps: Object.freeze(expand(10, 2.5, 45)), // 10..45kg by 2.5
    provenance: 'Metric fixed/EZ barbell set 10-45kg by 2.5kg — commercial fixed-bar rack standard',
  }),

  // ── Imperial fixed-barbell set: 20→110 lb by 10 lb ────────────────────────────
  // Pre-weighted bars, 10 lb apart. Provenance: standard imperial fixed-barbell set.
  Object.freeze({
    id: 'fixed_bar_imperial_10lb',
    family: 'fixed_bar',
    steps: Object.freeze(expand(9.07, 4.54, 49.9)), // 20lb..110lb by 10lb, kg
    provenance: 'Imperial fixed/EZ barbell set 20-110lb by 10lb — US commercial fixed-bar rack standard',
  }),
]);

/** Templates indexed by id (frozen). @type {Readonly<Record<string, EquipmentTemplate>>} */
export const TEMPLATES_BY_ID = Object.freeze(
  Object.fromEntries(EQUIPMENT_TEMPLATES.map((t) => [t.id, t])),
);

/**
 * Look up one template by id. @param {string} id @returns {EquipmentTemplate|null}
 */
export function getTemplate(id) {
  return (id && TEMPLATES_BY_ID[id]) || null;
}
