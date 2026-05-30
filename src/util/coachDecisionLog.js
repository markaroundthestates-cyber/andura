// ══ COACH DECISION LOG (CDL) ════════════════════════════════════════════════
// Persistent, append-only log of session-level coach decisions.
// Contract: docs/decisions/011-coach-decision-log-architecture.md
// Status: Accepted 2026-04-25
//
// Schema: { id, ts, date, synthetic, superseded, supersedes, context, proposed, outcome, ext? }
// ext is an optional open-ended extension bag for compatible writes (no schema break).
//   ext.modalDismisses?: Array<{modalId, ts, dismissed:true}> — written by ModalManager
//     when user dismisses a coaching modal via backdrop or swipe.
// Storage: 3 tiers — see STORAGE_KEYS export.
// Idempotency: 4h window + significant context change rules.

import { DB } from '../db.js';
import { logger } from './logger.js';

/**
 * @typedef {{ readinessScore?: number, weakGroups?: string[], calibrationLevel?: string|null, isInCut?: boolean|null, predictionToday?: { isHighRisk?: boolean } | null, [k: string]: unknown }} CdlContext
 *
 * @typedef {{ sessionType?: string|null, exercises?: string[], proposedSets?: number, rationale?: { winnerId?: string }, [k: string]: unknown }} CdlProposed
 *
 * @typedef {{ executed?: boolean|'partial'|null, deviation?: boolean|null, matchScore?: number|null, actualSessionType?: string, actualExercises?: string[], actualSets?: number, [k: string]: unknown }} CdlOutcome
 *
 * @typedef {{
 *   id: string,
 *   ts: number,
 *   date: string,
 *   synthetic?: boolean,
 *   superseded?: boolean,
 *   supersedes?: string|null,
 *   context: CdlContext,
 *   proposed: CdlProposed,
 *   outcome?: CdlOutcome | null,
 *   ext?: { modalDismisses?: Array<{ modalId: string, ts: number, dismissed: true }> },
 *   [k: string]: unknown
 * }} CdlEntry
 *
 * @typedef {{
 *   id: string,
 *   ts: number,
 *   date: string,
 *   synthetic?: boolean,
 *   superseded?: boolean,
 *   calibrationLevel: string|null,
 *   isInCut: boolean|null,
 *   sessionType: string|null,
 *   winnerId: string|null,
 *   executed: boolean|'partial'|null,
 *   deviation: boolean|null,
 *   matchScore: number|null
 * }} CdlAggregate
 *
 * @typedef {{
 *   count: number,
 *   executedRate: number,
 *   avgMatchScore: number|null,
 *   deviationRate: number
 * }} CdlTier3Bucket
 */

export const STORAGE_KEYS = Object.freeze({
  TIER_1: 'coach-decisions',
  TIER_2: 'coach-decisions-aggregate',
  TIER_3: 'coach-decisions-archive',
});

export const RESERVED_RATIONALE_IDS = Object.freeze({
  SYNTHETIC_BACKFILL: 'SYNTHETIC_BACKFILL',
  NO_PROPOSED: 'NO_PROPOSED',
  NO_RULE_FIRED: 'NO_RULE_FIRED',
});

const IDEMPOTENCY_WINDOW_MS = 4 * 60 * 60 * 1000;
const TIER_1_WINDOW_MS = 180 * 86400000;
const TIER_2_WINDOW_MS = 365 * 86400000;

// ── Private helpers ──────────────────────────────────────────────────────────

/**
 * @param {CdlEntry} entry
 * @returns {boolean}
 */
function isActive(entry) {
  return entry.superseded !== true;
}

/**
 * @param {CdlContext | null | undefined} oldCtx
 * @param {CdlContext | null | undefined} newCtx
 * @returns {boolean}
 */
function isKeyContextChanged(oldCtx, newCtx) {
  // Legacy/migrated entries (e.g., Tier-2 aggregates re-promoted, or older
  // schema versions) may have a missing context object. Treat as "changed"
  // semantics by defaulting to {} so all `?.` reads are safe and any non-null
  // field in newCtx wins.
  const o = oldCtx ?? {};
  const n = newCtx ?? {};
  if (Math.abs((o.readinessScore ?? 0) - (n.readinessScore ?? 0)) > 20) return true;
  const oldWeak = JSON.stringify((o.weakGroups ?? []).slice().sort());
  const newWeak = JSON.stringify((n.weakGroups ?? []).slice().sort());
  if (oldWeak !== newWeak) return true;
  if (o.calibrationLevel !== n.calibrationLevel) return true;
  if (o.isInCut !== n.isInCut) return true;
  const oldHighRisk = (o.predictionToday?.isHighRisk ?? false);
  const newHighRisk = (n.predictionToday?.isHighRisk ?? false);
  if (oldHighRisk !== newHighRisk) return true;
  return false;
}

/**
 * @param {string} date
 * @param {number} ts
 * @returns {string}
 */
function generateEntryId(date, ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `cd_${date}_${hh}${mm}_${rand}`;
}

/**
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number}
 */
function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) { if (setB.has(x)) intersection++; }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Write a new proposed CDL entry with idempotency check.
 * @param {{ date: string, context: CdlContext, proposed: CdlProposed }} entry
 * @returns {CdlEntry} The active entry for that date (new or existing if idempotent)
 */
export function writeProposed(entry) {
  if (
    typeof entry?.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
    typeof entry?.context !== 'object' || entry.context === null ||
    typeof entry?.proposed !== 'object' || entry.proposed === null
  ) {
    throw new Error('writeProposed: invalid entry — date (YYYY-MM-DD), context (object), proposed (object) required');
  }

  /** @type {CdlEntry[]} */
  const all = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  const existing = all.find(e => e.date === entry.date && isActive(e));

  let supersedes = null;

  if (existing) {
    const withinWindow = Date.now() - existing.ts < IDEMPOTENCY_WINDOW_MS;
    const contextUnchanged = !isKeyContextChanged(existing.context, entry.context);
    if (withinWindow && contextUnchanged) {
      return existing;
    }
    existing.superseded = true;
    supersedes = existing.id;
  }

  const ts = Date.now();
  const newEntry = {
    id: generateEntryId(entry.date, ts),
    ts,
    date: entry.date,
    synthetic: false,
    superseded: false,
    supersedes,
    context: { ...entry.context },
    proposed: { ...entry.proposed },
    outcome: null,
  };

  all.push(newEntry);
  DB.set(STORAGE_KEYS.TIER_1, all);
  return newEntry;
}

/**
 * Populate outcome on the most recent non-superseded entry for date.
 * Outcome is immutable after first population — throws if already set.
 * @param {string} date - YYYY-MM-DD
 * @param {object} outcome - per ADR 011 schema
 * @returns {object} The updated entry
 * @throws if no entry exists or outcome already set
 */
/**
 * @param {string} date
 * @param {CdlOutcome} outcome
 * @returns {CdlEntry}
 */
export function populateOutcome(date, outcome) {
  /** @type {CdlEntry[]} */
  const entries = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  const target = entries
    .filter(e => e.date === date && isActive(e))
    .sort((a, b) => b.ts - a.ts)[0];

  if (!target) {
    throw new Error('No active CDL entry for date ' + date);
  }
  if (target.outcome != null) {
    logger.warn('[CDL] populateOutcome: outcome already set for entry', target.id);
    throw new Error('Outcome already populated for entry ' + target.id + ' (immutability)');
  }

  target.outcome = { ...outcome };
  DB.set(STORAGE_KEYS.TIER_1, entries);
  return target;
}

/**
 * Read most recent non-superseded entry for date.
 * @param {string} date - YYYY-MM-DD
 * @returns {CdlEntry | null}
 */
export function readActiveForDate(date) {
  /** @type {CdlEntry[]} */
  const entries = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  const matches = entries
    .filter(e => e.date === date && isActive(e))
    .sort((a, b) => b.ts - a.ts);
  return matches[0] ?? null;
}

/**
 * Read all non-superseded active entries, optionally filtered.
 * @param {(e: CdlEntry) => boolean} [filterFn]
 * @returns {CdlEntry[]}
 */
export function readAllActive(filterFn) {
  /** @type {CdlEntry[]} */
  const entries = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  const active = entries.filter(isActive);
  return filterFn ? active.filter(filterFn) : active;
}

/**
 * Audit-only: return supersede chain for entryId (oldest → newest).
 * @param {string} entryId
 * @returns {CdlEntry[]}
 */
export function readSupersedeChain(entryId) {
  /** @type {CdlEntry[]} */
  const entries = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  /** @type {Record<string, CdlEntry>} */
  const byId = {};
  for (const e of entries) byId[e.id] = e;

  // Find the entry to start from
  const start = byId[entryId];
  if (!start) return [];

  // Walk backward to find the oldest in the chain
  /** @type {CdlEntry[]} */
  const chain = [];
  /** @type {CdlEntry | null | undefined} */
  let cursor = start;
  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.supersedes ? byId[cursor.supersedes] : null;
  }

  // Walk forward from the oldest to include entries that supersede start
  // But we also need entries that are superseded BY or supersede the chain members
  // Re-collect: build set of IDs in chain, then find all entries pointing to each other
  const chainIds = new Set(chain.map(e => e.id));
  // Add forward: entries that supersede any member in the chain
  for (const e of entries) {
    if (e.supersedes && chainIds.has(e.supersedes) && !chainIds.has(e.id)) {
      chain.push(e);
      chainIds.add(e.id);
    }
  }

  chain.sort((a, b) => a.ts - b.ts);
  return chain;
}

/**
 * Compute matchScore between proposed and actual session.
 * GATE: returns null + deviation=true when sessionType differs.
 * Otherwise: 0.6 × volumeRatio + 0.4 × exerciseOverlap (Jaccard).
 * @param {CdlProposed} proposed - { sessionType, exercises, proposedSets }
 * @param {CdlOutcome} actual - { actualSessionType, actualExercises, actualSets }
 * @returns {{ matchScore: number|null, deviation: boolean }}
 */
export function computeMatchScore(proposed, actual) {
  if (proposed.sessionType !== actual.actualSessionType) {
    return { matchScore: null, deviation: true };
  }

  const proposedSets = proposed.proposedSets ?? 0;
  const actualSets = actual.actualSets ?? 0;
  const volumeRatio = proposedSets > 0
    ? Math.min(1.5, Math.max(0, actualSets / proposedSets))
    : 0;

  const exerciseOverlap = jaccard(proposed.exercises ?? [], actual.actualExercises ?? []);
  const score = 0.6 * volumeRatio + 0.4 * exerciseOverlap;

  return { matchScore: score, deviation: false };
}

/**
 * Demote entries older than 180 days from Tier 1 to Tier 2 aggregate.
 * Transactional: failed demotion preserves Tier 1 entry.
 * @returns {{ demoted: number, errors: string[] }}
 */
export function demoteToTier2() {
  /** @type {CdlEntry[]} */
  const entries = DB.get(STORAGE_KEYS.TIER_1) ?? [];
  const cutoff = Date.now() - TIER_1_WINDOW_MS;

  const toDemote = entries.filter(e => e.ts < cutoff);
  const remaining = entries.filter(e => e.ts >= cutoff);

  if (toDemote.length === 0) return { demoted: 0, errors: [] };

  const aggregate = toDemote.map(e => ({
    id: e.id,
    ts: e.ts,
    date: e.date,
    synthetic: e.synthetic,
    superseded: e.superseded,
    calibrationLevel: e.context?.calibrationLevel ?? null,
    isInCut: e.context?.isInCut ?? null,
    sessionType: e.proposed?.sessionType ?? null,
    winnerId: e.proposed?.rationale?.winnerId ?? null,
    executed: e.outcome?.executed ?? null,
    deviation: e.outcome?.deviation ?? null,
    matchScore: e.outcome?.matchScore ?? null,
  }));

  /** @type {CdlAggregate[]} */
  const existingTier2 = DB.get(STORAGE_KEYS.TIER_2) ?? [];

  try {
    DB.set(STORAGE_KEYS.TIER_2, [...existingTier2, ...aggregate]);
    DB.set(STORAGE_KEYS.TIER_1, remaining);
  } catch (err) {
    DB.set(STORAGE_KEYS.TIER_1, entries);
    const msg = err instanceof Error ? err.message : String(err);
    return { demoted: 0, errors: [msg] };
  }

  return { demoted: toDemote.length, errors: [] };
}

/**
 * Demote Tier 2 entries older than 1 year to Tier 3 monthly archive.
 * @returns {{ demoted: number, errors: string[] }}
 */
export function demoteToTier3() {
  /** @type {CdlAggregate[]} */
  const tier2 = DB.get(STORAGE_KEYS.TIER_2) ?? [];
  const cutoff = Date.now() - TIER_2_WINDOW_MS;

  const toDemote = tier2.filter(e => e.ts < cutoff);
  const remaining = tier2.filter(e => e.ts >= cutoff);

  if (toDemote.length === 0) return { demoted: 0, errors: [] };

  // Group by YYYY-MM_sessionType
  /** @type {Record<string, CdlAggregate[]>} */
  const groups = {};
  for (const e of toDemote) {
    const month = new Date(e.ts).toISOString().slice(0, 7);
    const sessionType = e.sessionType ?? 'UNKNOWN';
    const key = `${month}_${sessionType}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }

  /** @type {Record<string, CdlTier3Bucket>} */
  const tier3 = DB.get(STORAGE_KEYS.TIER_3) ?? {};

  for (const [key, groupEntries] of Object.entries(groups)) {
    const count = groupEntries.length;
    const executedCount = groupEntries.filter(e => e.executed === true || e.executed === 'partial').length;
    const deviationCount = groupEntries.filter(e => e.deviation === true).length;
    const withScore = groupEntries.filter(e => typeof e.matchScore === 'number');
    const avgMatchScore = withScore.length > 0
      ? withScore.reduce((sum, e) => sum + (e.matchScore ?? 0), 0) / withScore.length
      : null;

    if (tier3[key]) {
      // Re-aggregate: combine with existing
      const ex = tier3[key];
      const totalCount = ex.count + count;
      const newExecutedRate = (ex.executedRate * ex.count + executedCount) / totalCount;
      const newDeviationRate = (ex.deviationRate * ex.count + deviationCount) / totalCount;
      let newAvgMatchScore = null;
      if (ex.avgMatchScore !== null && avgMatchScore !== null) {
        newAvgMatchScore = (ex.avgMatchScore * ex.count + avgMatchScore * count) / totalCount;
      } else if (avgMatchScore !== null) {
        newAvgMatchScore = avgMatchScore;
      } else {
        newAvgMatchScore = ex.avgMatchScore;
      }
      tier3[key] = {
        count: totalCount,
        executedRate: newExecutedRate,
        avgMatchScore: newAvgMatchScore,
        deviationRate: newDeviationRate,
      };
    } else {
      tier3[key] = {
        count,
        executedRate: count > 0 ? executedCount / count : 0,
        avgMatchScore,
        deviationRate: count > 0 ? deviationCount / count : 0,
      };
    }
  }

  try {
    DB.set(STORAGE_KEYS.TIER_3, tier3);
    DB.set(STORAGE_KEYS.TIER_2, remaining);
  } catch (err) {
    DB.set(STORAGE_KEYS.TIER_2, tier2);
    const msg = err instanceof Error ? err.message : String(err);
    return { demoted: 0, errors: [msg] };
  }

  return { demoted: toDemote.length, errors: [] };
}
