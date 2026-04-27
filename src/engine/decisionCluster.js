// ══ DECISION CLUSTER ENGINE (ADR 018 §3) ══════════════════════════════════
// Stacked-stage pipeline that turns DimensionResult[] + baseSession into
// { session, trace } via 3 stages (per ADR 018 DP-4 APPROVED 2026-04-27):
//
//   Stage 1 GATE         → short-circuit (rest day, blocker, etc.)
//   Stage 2 ADJUSTMENT   → cumulative (volume mult, sets cap, calibration)
//   Stage 3 ENHANCEMENT  → presentational (banners, warnings, shortening)
//
// Replaces hard-coded applyAAAdjustments / applyPatterns / manual session
// mutation in coachDirector. Director becomes a thin orchestrator post-
// strangler migration (ADR 018 Migration Path).
//
// Async-capable per ADR 018 DP-2: input may contain Promise<DimensionResult>;
// rejected promises and null results are caught + logged + skipped.

import {
  STAGES,
  ACTIONS,
  ACTION_STAGE_MAP,
  assertValidDimensionResult,
  isActionStageCompatible,
} from './dimensionContract.js';
import { RESERVED_RATIONALE_IDS } from '../util/coachDecisionLog.js';

/**
 * @typedef {import('./dimensionContract.js').DimensionResult} DimensionResult
 * @typedef {import('./dimensionRegistry.js').DimensionRegistryEntry} DimensionRegistryEntry
 *
 * @typedef {Object} ClusterOptions
 * @property {{warn?: Function, error?: Function}} [logger]
 *   - Logger sink (defaults to no-op). Cluster never throws on logger absence.
 * @property {{captureException?: Function}} [sentry]
 *   - Optional Sentry-like sink for captured errors.
 * @property {boolean} [strict]
 *   - When true, stage/action mismatches throw instead of being logged.
 *     Used in tests + dev mode. Default false (production: log + continue).
 *
 * @typedef {Object} ClusterTrace
 * @property {boolean} shortCircuited
 * @property {Object} stages
 * @property {Array} errors
 * @property {Array} stageMismatches
 */

/** Default no-op logger. */
const NULL_LOGGER = { warn: () => {}, error: () => {} };

export class DecisionCluster {
  /**
   * @param {ClusterOptions} [opts]
   */
  constructor(opts = {}) {
    this.logger = opts.logger ?? NULL_LOGGER;
    this.sentry = opts.sentry ?? null;
    this.strict = opts.strict === true;
  }

  /**
   * Execute the staged pipeline.
   *
   * @param {Array<DimensionResult|Promise<DimensionResult>>} input
   *   - Array of dimension results (sync or async — async-capable per DP-2)
   * @param {Object} [baseSession={}]
   *   - The starting session shape. Cluster CLONES this — input is not mutated.
   * @param {Object} [opts]
   * @param {Array<DimensionRegistryEntry>} [opts.entries]
   *   - Optional registry entries (paired by id) for stage validation.
   * @returns {Promise<{session: Object, trace: ClusterTrace}>}
   */
  async execute(input, baseSession = {}, opts = {}) {
    const items = Array.isArray(input) ? input : [];
    const entries = Array.isArray(opts.entries) ? opts.entries : [];
    const entryById = new Map(entries.map(e => [e.id, e]));

    // ── Resolve any promises; catch rejections; reject malformed shapes ──
    const settled = await Promise.allSettled(items.map(item => Promise.resolve(item)));
    const errors = [];
    const validated = [];

    for (let i = 0; i < settled.length; i++) {
      const s = settled[i];
      if (s.status === 'rejected') {
        errors.push({ index: i, reason: this._stringifyError(s.reason) });
        this._reportError(s.reason, { index: i, op: 'dimension_promise_rejected' });
        continue;
      }
      const result = s.value;
      if (result == null) {
        errors.push({ index: i, reason: 'null or undefined dimension result' });
        this._reportError(new Error('null dimension result'), { index: i, op: 'dimension_null' });
        continue;
      }
      try {
        assertValidDimensionResult(result);
      } catch (err) {
        errors.push({ index: i, reason: this._stringifyError(err) });
        this._reportError(err, { index: i, op: 'dimension_invalid_shape' });
        continue;
      }
      validated.push(result);
    }

    // ── Stage validation (action ↔ declared stage compatibility) ──
    const stageMismatches = this._validateStages(validated, entryById);

    // ── Stage 1 GATE ──
    const gateOutcome = this._runGateStage(validated, baseSession);
    if (gateOutcome.shortCircuit) {
      return {
        session: gateOutcome.session,
        trace: {
          shortCircuited: true,
          stages: {
            GATE: gateOutcome.trace,
            ADJUSTMENT: { fired: [], composedVolumeMultiplier: 1, composedSetsCap: null },
            ENHANCEMENT: { fired: [] },
          },
          errors,
          stageMismatches,
        },
      };
    }

    // ── Stage 2 ADJUSTMENT ──
    let session = this._cloneSession(baseSession);
    const adjustmentTrace = this._runAdjustmentStage(validated, session);
    session = adjustmentTrace.session;

    // ── Stage 3 ENHANCEMENT ──
    const enhancementTrace = this._runEnhancementStage(validated, session);
    session = enhancementTrace.session;

    return {
      session,
      trace: {
        shortCircuited: false,
        stages: {
          GATE: gateOutcome.trace,
          ADJUSTMENT: adjustmentTrace.summary,
          ENHANCEMENT: enhancementTrace.summary,
        },
        errors,
        stageMismatches,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────
  // Stage runners
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Stage 1: scan for `gate_session` recommendations. If any exist, short-
   * circuit with the highest-priority gate winning. Other gates (and all
   * downstream-stage recs) collected into `overridden` for trace.
   *
   * @private
   */
  _runGateStage(validated, baseSession) {
    const gateRecs = [];
    const overriddenByGate = [];

    for (const result of validated) {
      for (const rec of result.recommendations) {
        if (rec.action === ACTIONS.GATE_SESSION) {
          gateRecs.push({ source: result.id, rec });
        }
      }
    }

    if (gateRecs.length === 0) {
      return {
        shortCircuit: false,
        session: null,
        trace: { fired: [], winner: null, overridden: [] },
      };
    }

    // Stable sort: ties broken by input order (registry order at registration time).
    // V8 stable sort guarantee per ECMA-2019. Determinism contract guarantee (ADR 018 §2).
    gateRecs.sort((a, b) => b.rec.priority - a.rec.priority);
    const [winner, ...rest] = gateRecs;

    // Build short-circuit session: preserve baseSession metadata, mark gated.
    const session = {
      ...this._cloneSession(baseSession),
      gated: true,
      gateAction: winner.rec.action,
      gateSource: winner.source,
      gateRecommendation: this._cloneRec(winner.rec),
      // Convention: sessions with gate semantics expose empty exercises.
      exercises: [],
    };

    // Collect ALL other recommendations as overridden (for trace transparency).
    for (const result of validated) {
      for (const rec of result.recommendations) {
        if (rec === winner.rec) continue;
        overriddenByGate.push({ source: result.id, rec: this._cloneRec(rec) });
      }
    }

    return {
      shortCircuit: true,
      session,
      trace: {
        fired: gateRecs.map(g => ({ source: g.source, action: g.rec.action, priority: g.rec.priority })),
        winner: { source: winner.source, action: winner.rec.action, priority: winner.rec.priority, rationale: winner.rec.rationale },
        overridden: overriddenByGate.map(o => ({ source: o.source, action: o.rec.action, priority: o.rec.priority })),
      },
    };
  }

  /**
   * Stage 2: cumulative adjustments. Volume multipliers compose multiplicatively;
   * sets caps take the minimum (most restrictive); other ADJUSTMENT actions
   * attach informational fields on session.
   *
   * @private
   */
  _runAdjustmentStage(validated, baseSession) {
    let session = baseSession;
    const fired = [];
    let composedVolumeMultiplier = 1;
    let composedSetsCap = null;

    // Collect all ADJUSTMENT-stage recs across dimensions
    const adjustments = [];
    for (const result of validated) {
      for (const rec of result.recommendations) {
        const stage = ACTION_STAGE_MAP[rec.action] ?? STAGES.ADJUSTMENT;
        if (stage === STAGES.ADJUSTMENT) {
          adjustments.push({ source: result.id, rec });
        }
      }
    }

    // Stable sort: ties broken by input order (registry order at registration time).
    // V8 stable sort guarantee per ECMA-2019. Determinism contract guarantee (ADR 018 §2).
    adjustments.sort((a, b) => b.rec.priority - a.rec.priority);

    for (const { source, rec } of adjustments) {
      session = this._applyAdjustment(session, rec);
      if (rec.action === ACTIONS.REDUCE_VOLUME && typeof rec.payload?.multiplier === 'number') {
        composedVolumeMultiplier *= rec.payload.multiplier;
      }
      if (rec.action === ACTIONS.REDUCE_SETS && typeof rec.payload?.cap === 'number') {
        // Sets caps compose via MIN (most restrictive wins). Equivalent to sequential
        // application — `min(cap_so_far, new_cap) = new_cap` iff new_cap < cap_so_far.
        // SUM interpretation would be nonsensical (caps don't stack additively).
        // Locked semantic — see test 'composes sets caps via minimum (most restrictive wins)'.
        composedSetsCap = composedSetsCap == null
          ? rec.payload.cap
          : Math.min(composedSetsCap, rec.payload.cap);
      }
      fired.push({ source, action: rec.action, priority: rec.priority, rationale: rec.rationale });
    }

    // Reflect composed values on session for downstream consumers
    session = {
      ...session,
      volumeMultiplier: (session.volumeMultiplier ?? 1) * composedVolumeMultiplier,
    };
    if (composedSetsCap != null) {
      session = { ...session, setsCap: session.setsCap == null ? composedSetsCap : Math.min(session.setsCap, composedSetsCap) };
    }

    return {
      session,
      summary: {
        fired,
        composedVolumeMultiplier,
        composedSetsCap,
      },
    };
  }

  /**
   * Stage 3: presentation enhancements. Sequential application,
   * priority DESC ordering (highest first).
   *
   * @private
   */
  _runEnhancementStage(validated, baseSession) {
    let session = baseSession;
    const fired = [];

    const enhancements = [];
    for (const result of validated) {
      for (const rec of result.recommendations) {
        const stage = ACTION_STAGE_MAP[rec.action];
        if (stage === STAGES.ENHANCEMENT) {
          enhancements.push({ source: result.id, rec });
        }
      }
    }

    // Stable sort: ties broken by input order (registry order at registration time).
    // V8 stable sort guarantee per ECMA-2019. Determinism contract guarantee (ADR 018 §2).
    enhancements.sort((a, b) => b.rec.priority - a.rec.priority);

    for (const { source, rec } of enhancements) {
      session = this._applyEnhancement(session, rec, source);
      fired.push({ source, action: rec.action, priority: rec.priority, rationale: rec.rationale });
    }

    return {
      session,
      summary: { fired },
    };
  }

  // ─────────────────────────────────────────────────────────────────────
  // Action handlers
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Apply a single ADJUSTMENT recommendation to the session.
   *
   * Known action verbs:
   *   - reduce_volume          → multiplicative compose on volumeMultiplier
   *   - reduce_sets            → minimum cap on setsCap
   *   - calibrate_aa_threshold → stash payload under session.aaThresholdCalibration
   *   - set_baseline_volume    → session.baselineVolume = payload.sets
   *   - set_baseline_frequency → session.baselineFrequency = payload.target
   * Unknown action verbs are logged + ignored (extension hatch).
   *
   * @private
   */
  _applyAdjustment(session, rec) {
    switch (rec.action) {
      case ACTIONS.REDUCE_VOLUME:
        // Composition handled in caller (_runAdjustmentStage) for trace clarity.
        return session;
      case ACTIONS.REDUCE_SETS:
        // Composition handled in caller.
        return session;
      case ACTIONS.CALIBRATE_AA_THRESHOLD:
        return { ...session, aaThresholdCalibration: { ...rec.payload } };
      case ACTIONS.SET_BASELINE_VOLUME:
        return { ...session, baselineVolume: rec.payload?.sets ?? null };
      case ACTIONS.SET_BASELINE_FREQUENCY:
        return { ...session, baselineFrequency: rec.payload?.target ?? null };
      default:
        this.logger.warn?.(`[DecisionCluster] Unknown ADJUSTMENT action '${rec.action}' — ignoring`);
        return session;
    }
  }

  /**
   * Apply a single ENHANCEMENT recommendation to the session.
   *
   * Known action verbs:
   *   - inject_warning  → session.warnings.push(payload + source)
   *   - inject_banner   → session.banners.push(payload + source)
   *   - shorten_session → session.exercises = exercises.slice(0, payload.count)
   * Unknown action verbs are logged + ignored.
   *
   * @private
   */
  _applyEnhancement(session, rec, source) {
    switch (rec.action) {
      case ACTIONS.INJECT_WARNING: {
        const warnings = Array.isArray(session.warnings) ? [...session.warnings] : [];
        warnings.push({ source, ...this._clonePayload(rec.payload) });
        return { ...session, warnings };
      }
      case ACTIONS.INJECT_BANNER: {
        const banners = Array.isArray(session.banners) ? [...session.banners] : [];
        banners.push({ source, ...this._clonePayload(rec.payload) });
        return { ...session, banners };
      }
      case ACTIONS.SHORTEN_SESSION: {
        const count = Number.isInteger(rec.payload?.count) ? rec.payload.count : null;
        if (count == null || !Array.isArray(session.exercises)) return session;
        return {
          ...session,
          exercises: session.exercises.slice(0, Math.max(0, count)),
          shortened: { source, originalCount: session.exercises.length, newCount: Math.max(0, count) },
        };
      }
      default:
        this.logger.warn?.(`[DecisionCluster] Unknown ENHANCEMENT action '${rec.action}' — ignoring`);
        return session;
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Stage validation
  // ─────────────────────────────────────────────────────────────────────

  /**
   * For each result, find recommendations whose action verb does not match the
   * dimension's declared stage (per registry entry). In strict mode → throw;
   * otherwise → log warning + record in trace.
   *
   * @private
   */
  _validateStages(validated, entryById) {
    const mismatches = [];
    for (const result of validated) {
      const entry = entryById.get(result.id);
      if (!entry) continue;
      for (const rec of result.recommendations) {
        if (!isActionStageCompatible(rec.action, entry.stage)) {
          const m = {
            dimensionId: result.id,
            declaredStage: entry.stage,
            action: rec.action,
            expectedStage: ACTION_STAGE_MAP[rec.action] ?? null,
          };
          mismatches.push(m);
          const msg = `[DecisionCluster] Stage mismatch: dimension '${result.id}' declared '${entry.stage}' but emitted action '${rec.action}' (expected stage '${m.expectedStage}')`;
          if (this.strict) {
            throw new Error(msg);
          }
          this.logger.warn?.(msg);
        }
      }
    }
    return mismatches;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────

  /** @private */
  _cloneSession(session) {
    if (!session || typeof session !== 'object') return {};
    const cloned = { ...session };
    if (Array.isArray(session.exercises)) {
      cloned.exercises = session.exercises.map(e => (e && typeof e === 'object' ? { ...e } : e));
    }
    if (Array.isArray(session.warnings)) cloned.warnings = [...session.warnings];
    if (Array.isArray(session.banners)) cloned.banners = [...session.banners];
    return cloned;
  }

  /** @private */
  _cloneRec(rec) {
    return {
      action: rec.action,
      priority: rec.priority,
      payload: this._clonePayload(rec.payload),
      rationale: rec.rationale,
    };
  }

  /** @private */
  _clonePayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};
    return { ...payload };
  }

  /** @private */
  _stringifyError(err) {
    if (!err) return 'unknown';
    if (err instanceof Error) return err.message || err.toString();
    return String(err);
  }

  /** @private */
  _reportError(err, ctx) {
    this.logger.error?.('[DecisionCluster] dimension error:', err, ctx);
    if (this.sentry?.captureException) {
      try {
        this.sentry.captureException(err, { tags: { component: 'decisionCluster', ...ctx } });
      } catch { /* swallow Sentry errors */ }
    }
  }
}

/**
 * Default singleton — convenience for production use. Tests should
 * construct their own instance with strict + custom logger.
 */
export const decisionCluster = new DecisionCluster();

/**
 * Project a cluster trace down to the ADR 011 CDL rationale shape used by
 * coachDirector.writeProposed. Strangler adapter — lets the CDL writer accept
 * cluster output the same way it accepts the legacy ruleResult.
 *
 *   - shortCircuited (gate fired)        → GATE winner is the rationale winner
 *   - else, ANY ADJUSTMENT/ENHANCEMENT   → highest-priority fired = winner
 *   - nothing fired                       → NO_RULE_FIRED
 *
 * @param {ClusterTrace|null|undefined} trace
 * @returns {{ winnerId: string, winnerPriority: number|null, overridden: string[] }}
 */
export function clusterTraceToRationale(trace) {
  if (!trace) {
    return { winnerId: RESERVED_RATIONALE_IDS.NO_RULE_FIRED, winnerPriority: null, overridden: [] };
  }

  if (trace.shortCircuited) {
    const winner = trace.stages?.GATE?.winner;
    return {
      winnerId: winner?.source ?? RESERVED_RATIONALE_IDS.NO_RULE_FIRED,
      winnerPriority: winner?.priority ?? null,
      overridden: (trace.stages?.GATE?.overridden ?? [])
        .map(o => o?.source)
        .filter(Boolean),
    };
  }

  const fired = [
    ...(trace.stages?.ADJUSTMENT?.fired ?? []),
    ...(trace.stages?.ENHANCEMENT?.fired ?? []),
  ];

  if (fired.length === 0) {
    return { winnerId: RESERVED_RATIONALE_IDS.NO_RULE_FIRED, winnerPriority: null, overridden: [] };
  }

  const sorted = [...fired].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const winner = sorted[0];
  return {
    winnerId: winner.source,
    winnerPriority: winner.priority ?? null,
    overridden: sorted.slice(1).map(o => o.source).filter(Boolean),
  };
}
