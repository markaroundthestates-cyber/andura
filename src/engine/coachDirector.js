// ══ COACH DIRECTOR — Orchestrare sesiune cu context unificat ══════════════
// V2 post-C4.5 wire Big 11 RO canonical V1 — engines C4.1-4.4 LANDED return
// Big 11 RO output direct (NU Big 6 EN mapping intermediate). Orchestrator
// dispatch consume rules differential per engine per ADR_ENGINE_REFACTOR §3.5
// LOCK V1: muscleRecovery + periodization + weaknessDetector = primary-only;
// specialization = primary + weighted secondary 0.3 (via
// computeWeightedGroupScore C4.4 LANDED `657b7175`). Pipeline §42.10 dispatch
// order Periodization → Goal Adaptation → Energy → Bayesian Nutrition → Tempo
// → Specialization → Warm-up → Deload preserved invariant ADR-026 §9.
import { buildCoachContext } from './coachContext.js';
import { realityEngine } from './reality.js';
import { evaluate } from './ruleEngine.js';
import { detectWeakGroups } from './weaknessDetector.js';
import { detectGlobalStagnation } from './stagnationDetector.js';
import { predictToday } from './predictionEngine.js';
import { recompileWeek } from './recompileEngine.js';
import { resolveExercise } from './alternativeEngine.js';
import { runProactiveChecks } from './proactiveEngine.js';
import { initAutoBackup } from '../util/autoBackup.js';
import { detectCalibrationLevel, applyRollingWindow } from './calibration.js';
import { buildSession } from './sessionBuilder.js';
import * as coachDecisionLog from '../util/coachDecisionLog.js';
import { RESERVED_RATIONALE_IDS } from '../util/coachDecisionLog.js';
import { inferSessionType } from '../util/cdlBackfill.js';
import { tod } from '../db.js';
import { READINESS_MED } from './readiness.js';
import { MS_PER_DAY } from '../constants.js';
import { isEnabled } from '../util/featureFlags.js';
import { DecisionCluster, clusterTraceToRationale } from './decisionCluster.js';
import { getActiveDimensions } from './dimensionRegistry.js';
import { aaClusterOutputToLegacyShape } from './dimensions/autoAggressionAdapter.js';
import { DIMENSION_ID as AA_DIMENSION_ID } from './dimensions/autoAggressionDimension.js';
import { computeWeightedGroupScore } from './specialization/weaknessConsumer.js';
import * as dpModule from './dp.js';

// Engine consume policy per ADR_ENGINE_REFACTOR §3.5 LOCK V1 — differential
// primary-only vs primary + weighted secondary 0.3 per engine.
const ENGINE_CONSUME_PRIMARY_ONLY = Object.freeze([
  'muscleRecovery',
  'periodization',
  'weaknessDetector',
]);
const ENGINE_CONSUME_WEIGHTED_SECONDARY = Object.freeze(['specialization']);

/**
 * Aggregate Big 11 RO group score per session — primary 1.0 + secondary 0.3
 * consume policy per ADR_ENGINE_REFACTOR §3.5 LOCK V1 differential per engine.
 *
 * Consume rules:
 *   - muscleRecovery: primary-only (anatomical fiber stress drives MPS)
 *   - periodization: primary-only (cluster phase cycle per primary)
 *   - weaknessDetector: primary-only (Brzycki 1RM per primary)
 *   - specialization: primary + weighted secondary 0.3 (Bundle 6.0.4.2 RDL/
 *     Good Morning posterior chain dual-cluster compatible via
 *     computeWeightedGroupScore helper C4.4 LANDED `657b7175`)
 *
 * Pure function — ADR-026 §9 invariant (no Date.now / Math.random / side
 * effects). Unknown engineId returns frozen empty map (NU throw — defensive
 * fallback per ADR_ENGINE_REFACTOR Co-CTO discipline).
 *
 * @param {Array<Object>} exercises - Session exercises (each with
 *   muscle_target_primary string + optional muscle_target_secondary string[])
 * @param {string} engineId - 'muscleRecovery' | 'periodization' |
 *   'weaknessDetector' | 'specialization'
 * @returns {Object<string, number>} Big 11 group → weighted score map (frozen)
 */
export function aggregateGroupScoresPerEngine(exercises, engineId) {
  if (!Array.isArray(exercises)) return Object.freeze({});
  if (typeof engineId !== 'string' || engineId.length === 0) return Object.freeze({});

  const scores = {};

  if (ENGINE_CONSUME_PRIMARY_ONLY.includes(engineId)) {
    for (const ex of exercises) {
      if (!ex || typeof ex !== 'object') continue;
      const primary = ex.muscle_target_primary;
      if (typeof primary !== 'string' || primary.length === 0) continue;
      scores[primary] = (scores[primary] || 0) + 1.0;
    }
  } else if (ENGINE_CONSUME_WEIGHTED_SECONDARY.includes(engineId)) {
    const targetGroups = new Set();
    for (const ex of exercises) {
      if (!ex || typeof ex !== 'object') continue;
      if (typeof ex.muscle_target_primary === 'string' && ex.muscle_target_primary.length > 0) {
        targetGroups.add(ex.muscle_target_primary);
      }
      if (Array.isArray(ex.muscle_target_secondary)) {
        for (const g of ex.muscle_target_secondary) {
          if (typeof g === 'string' && g.length > 0) targetGroups.add(g);
        }
      }
    }
    for (const group of targetGroups) {
      let total = 0;
      for (const ex of exercises) {
        if (!ex || typeof ex !== 'object') continue;
        total += computeWeightedGroupScore(ex, group);
      }
      if (total > 0) scores[group] = total;
    }
  }

  return Object.freeze(scores);
}

export class CoachDirector {
  /**
   * V2 post-C4.5: orchestrator wire Big 11 RO canonical V1 — engines
   * C4.1-4.4 LANDED return Big 11 RO output direct via `detectWeakGroups`,
   * `detectGlobalStagnation`, `recompileWeek`, etc. (NU Big 6 EN intermediate).
   * Aggregate primary + weighted secondary per Decision §3.5 (Specialization
   * weighted via `aggregateGroupScoresPerEngine(exercises, 'specialization')`).
   * Pipeline §42.10 dispatch order preserved invariant ADR-026 §9.
   */
  async buildSession(sessionType) {
    const ctx = buildCoachContext();

    if (!ctx.readiness.isSet) {
      return {
        requiresReadinessInput: true,
        message: 'Cum te simti azi?',
        exercises: [],
        context: { patterns: ctx.patterns ?? [], patternsSuppressed: ctx.patternsSuppressed ?? true },
      };
    }

    // ── Calibration level detection ────────────────────────────────────────
    const allLogs = ctx.allLogs ?? [];
    const calibration = detectCalibrationLevel(ctx);
    ctx.calibrationLevel = calibration;
    console.log('[CoachDirector] Calibration:', calibration.name);

    // Gate ctx.patterns — wipe before any engine sees them for under-threshold tiers.
    // CDL suppression (ctx.patternsSuppressed) is authoritative for CDL-derived patterns:
    // if CDL already cleared them (realCDLCount >= threshold), don't wipe on calibration alone.
    if (!calibration.patternsEnabled && ctx.patternsSuppressed !== false) {
      ctx.patterns = [];
    } else if (calibration.patternMinConfidence != null) {
      ctx.patterns = (ctx.patterns || []).filter(
        p => (p.confidence ?? 0.5) >= calibration.patternMinConfidence
      );
    }

    // Apply rolling window for mature users (OPTIMIZED only)
    if (calibration.rollingWindowMonths) {
      ctx.allLogs = applyRollingWindow(allLogs, calibration);
    }

    // ── Augment context with new engine data ──────────────────────────────
    try {
      const logsForEngines = ctx.allLogs;
      const workoutSkips = (() => {
        try { return JSON.parse(localStorage.getItem('workout-skips') ?? '{}') ?? {}; } catch { return {}; }
      })();

      ctx.weakGroups = calibration.weakGroupEnabled
        ? detectWeakGroups(logsForEngines).weakGroups
        : [];

      ctx.stagnationWeeks = calibration.stagnationEnabled
        ? detectGlobalStagnation(logsForEngines).maxStagnationWeeks
        : 0;

      ctx.predictionToday = calibration.predictionEnabled
        ? predictToday(logsForEngines, workoutSkips)
        : { isHighRisk: false, probability: 0, recommendation: null };

      const recompile = recompileWeek({ logs: logsForEngines, readinessScore: ctx.readiness.score });
      ctx.recompile = recompile;
      ctx.missedSessions = recompile.deficit > 0 ? 1 : 0;
      ctx.fatigueIndex = ctx.readiness.score < READINESS_MED ? 0.9 : 0;
    } catch { /* augmentation is best-effort */ }

    // ── Rule Engine decision ───────────────────────────────────────────────
    const ruleResult = evaluate(ctx);
    if (ruleResult.action === 'rest') {
      return {
        restDay: true,
        message: 'Odihneste-te azi. Recovery activ recomandat.',
        exercises: [],
        readinessScore: ctx.readiness.score,
        ruleTrace: ruleResult.trace,
      };
    }
    if (ruleResult.action === 'deload') {
      ctx._deload = true;
    }

    // ── Proactive alerts ──────────────────────────────────────────────────
    let proactiveAlerts = [];
    try {
      proactiveAlerts = runProactiveChecks({
        ...ctx,
        prots: (() => { try { return JSON.parse(localStorage.getItem('prots') ?? '{}'); } catch { return {}; } })(),
        weights: (() => { try { return JSON.parse(localStorage.getItem('weights') ?? '{}'); } catch { return {}; } })(),
        kcals: (() => { try { return JSON.parse(localStorage.getItem('kcals') ?? '{}'); } catch { return {}; } })(),
        waters: (() => { try { return JSON.parse(localStorage.getItem('waters') ?? '{}'); } catch { return {}; } })(),
        logs: ctx.recentLogs?.flatMap(s => s.logs ?? []) ?? [],
      });
    } catch { /* proactive checks are non-blocking */ }

    let session = buildSession(sessionType, ctx);

    // ── Resolve equipment alternatives ────────────────────────────────────
    const unavailableEquipment = ctx.equipment?.unavailable ?? [];
    if (unavailableEquipment.length > 0) {
      session.exercises = session.exercises.map(ex => {
        const resolved = resolveExercise(ex.name, unavailableEquipment);
        if (resolved.isAlternative) {
          return { ...ex, name: resolved.exercise, isAlternative: true, original: resolved.original };
        }
        return ex;
      });
    }

    try {
      for (const exercise of session.exercises) {
        if (dpModule.DP && dpModule.DP.getSmartRecommendation) {
          const dpRec = dpModule.DP.getSmartRecommendation(exercise.name, ctx.readiness.score, null);
          if (dpRec.status === 'INIT') {
            exercise.recommendation = dpModule.getInitialRecommendation(exercise.name, ctx);
          } else {
            exercise.recommendation = dpRec;
          }
        } else {
          const lastLog = getLastLogFromContext(exercise.name, ctx.recentLogs);
          const baseWeight = lastLog ? (lastLog.w ?? 20) : 20;
          exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: exercise.sets || 3 };
        }

        // Apply deload weight reduction
        if (ctx._deload && exercise.recommendation?.kg) {
          const deloadKg = Math.round(exercise.recommendation.kg * 0.7 * 2) / 2;
          exercise.recommendation = { ...exercise.recommendation, kg: deloadKg, weight: deloadKg };
        }

        if (!exercise.recommendation.weight && exercise.recommendation.kg) {
          exercise.recommendation.weight = exercise.recommendation.kg;
        }
        if (exercise.recommendation?.technique) {
          exercise.technique = exercise.recommendation.technique.toLowerCase().startsWith('drop')
            ? 'drop'
            : exercise.recommendation.technique;
        }
      }
    } catch (e) {
      for (const exercise of session.exercises) {
        if (!exercise.recommendation) {
          const lastLog = getLastLogFromContext(exercise.name, ctx.recentLogs);
          const baseWeight = lastLog ? (lastLog.w ?? 20) : 20;
          exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: exercise.sets || 3 };
        }
      }
    }

    // ── AA detection: Strangler branch (ADR 018 §6 Phase 1) ──────────────
    // Default 0% rollout — production keeps running legacy applyAAAdjustments.
    // Cluster + adapter route is byte-equivalent (golden-master parity tests).
    let _aaClusterTrace = null;
    const _useClusterForAA = isEnabled('aa_via_cluster');
    if (_useClusterForAA) {
      try {
        const baseSessionForAA = session;
        const activeDims = getActiveDimensions(ctx, { flags: { aa_via_cluster: true } });
        const aaEntries = activeDims.filter(d => d.id === AA_DIMENSION_ID);
        if (aaEntries.length > 0) {
          const dimInput = { ctx, cdl: [], userProfile: ctx.user ?? {}, flags: { aa_via_cluster: true } };
          const results = await Promise.all(
            aaEntries.map(d => Promise.resolve(d.module.analyze(dimInput)))
          );
          const cluster = new DecisionCluster();
          const { session: clusterSession, trace } = await cluster.execute(
            results, baseSessionForAA, { entries: aaEntries }
          );
          session = aaClusterOutputToLegacyShape(clusterSession, baseSessionForAA);
          _aaClusterTrace = trace;
        }
      } catch (err) {
        console.error('[CoachDirector] AA cluster route failed — falling back to legacy:', err);
        try {
          if (typeof window !== 'undefined' && window.Sentry?.captureException) {
            window.Sentry.captureException(err, { tags: { component: 'coachDirector', op: 'aa_cluster_route' } });
          }
        } catch (_) { /* swallow */ }
        session = this.applyAAAdjustments(session, ctx);
      }
    } else {
      session = this.applyAAAdjustments(session, ctx);
    }
    session = realityEngine.validate(session, ctx);
    session = this.applyPatterns(session, ctx);

    session.calibrationLevel  = ctx.calibrationLevel;
    session.calibrationBanner = ctx.calibrationLevel.bannerText;

    session.context = {
      readinessScore: ctx.readiness.score,
      readinessEmoji: ctx.readiness.emoji,
      isDeficit: ctx.isDeficit,
      phase: ctx.user.phase,
      ruleAction: ruleResult.action,
      weakGroups: ctx.weakGroups,
      stagnationWeeks: ctx.stagnationWeeks,
      proactiveAlerts,
      recompile: ctx.recompile,
      calibrationLevel: ctx.calibrationLevel,
      patterns: ctx.patterns ?? [],
      patternsSuppressed: ctx.patternsSuppressed ?? true,
    };

    // ── CDL write (ADR 011) ───────────────────────────────────────────────
    let cdlEntryId = null;
    let cdlWriteError = null;
    try {
      const today = tod();

      const cdlContext = {
        calibrationLevel: ctx.calibrationLevel?.name || ctx.calibrationLevel || null,
        readinessScore: ctx.readiness?.score ?? null,
        fatigueIndex: ctx.fatigueIndex ?? null,
        daysSinceLastSession: _computeDaysSinceLastSession(ctx.allLogs),
        lastSessionType: _computeLastSessionType(ctx.allLogs),
        isInCut: ctx.isInCut ?? null,
        weakGroups: Array.isArray(ctx.weakGroups) ? ctx.weakGroups : [],
        stagnationWeeks: ctx.stagnationWeeks ?? 0,
        predictionToday: ctx.predictionToday ? {
          isHighRisk: ctx.predictionToday.isHighRisk ?? false,
          probability: ctx.predictionToday.probability ?? 0
        } : null,
        partial: false
      };

      const _legacyRationale = {
        winnerId: ruleResult?.winner?.id ?? RESERVED_RATIONALE_IDS.NO_RULE_FIRED,
        winnerPriority: ruleResult?.winner?.priority ?? null,
        overridden: Array.isArray(ruleResult?.overridden)
          ? ruleResult.overridden.map(r => r?.id).filter(Boolean)
          : []
      };
      let _rationale = _legacyRationale;
      if (_useClusterForAA && _aaClusterTrace) {
        const _clusterRationale = clusterTraceToRationale(_aaClusterTrace);
        if (_clusterRationale.winnerId !== RESERVED_RATIONALE_IDS.NO_RULE_FIRED) {
          _rationale = _clusterRationale;
        }
      }

      const cdlProposed = {
        sessionType,
        rationale: _rationale,
        exercises: Array.isArray(session?.exercises)
          ? session.exercises.map(e => e?.name).filter(Boolean)
          : [],
        proposedSets: Array.isArray(session?.exercises)
          ? session.exercises.reduce((sum, e) => sum + (e?.sets || 0), 0)
          : 0,
        volumeMultiplier: ctx.readiness?.volumeMultiplier ?? 1.0,
        notes: ''
      };

      const written = coachDecisionLog.writeProposed({
        date: today,
        context: cdlContext,
        proposed: cdlProposed
      });
      cdlEntryId = written.id;
    } catch (err) {
      cdlWriteError = err.message || String(err);
      console.error('[CoachDirector] CDL write failed (degraded mode):', err);
      try {
        if (typeof window !== 'undefined' && window.Sentry?.captureException) {
          window.Sentry.captureException(err, { tags: { component: 'coachDirector', op: 'cdl_write' } });
        }
      } catch (_) { /* swallow Sentry errors */ }
    }

    // Daily backup — fire and forget
    try { initAutoBackup(); } catch { /* non-blocking */ }

    session.cdlEntryId = cdlEntryId;
    session.cdlWriteError = cdlWriteError;
    return session;
  }

  applyAAAdjustments(session, ctx) {
    const aa = ctx.autoAggression;
    if (!aa || aa.tier === 'none' || aa.tier === 'LOW') return session;

    // MED tier — soft warning banner (UI consumes session.aaWarning)
    if (aa.tier === 'MED') {
      session.aaWarning = {
        level: 'soft',
        signals: aa.signals,
        escalating: aa.escalating,
      };
      return session;
    }

    // HIGH tier — friction modal blocker (ADR 013 §6 — coach refuses initial aggressive plan)
    session.aaBlocked = {
      level: 'hard',
      signals: aa.signals,
      escalating: aa.escalating,
      requiresFrictionConfirmation: true,
    };

    // Anti-overreach default — volume reduction 30%
    session.exercises = session.exercises.map(e => ({
      ...e,
      aaOriginalSets: e.sets,  // preserve pentru override restore (ADR 014 §5, TASK #7)
      sets: Math.max(2, Math.floor((e.sets || 3) * 0.7)),
      aaReduced: true,
    }));

    return session;
  }

  applyPatterns(session, ctx) {
    if (!ctx.patterns || ctx.patterns.length === 0) return session;
    for (const pattern of ctx.patterns) {
      if (pattern.type === 'EARLY_END' && (pattern.earlyEndRate >= 60 || (pattern.confidence ?? 0) > 0.6)) {
        const originalCount = session.exercises.length;
        const newCount = Math.max(3, Math.ceil(originalCount * 0.8));
        session.exercises = session.exercises.slice(0, newCount);
        session.patternApplied = {
          type: 'EARLY_END',
          reason: `Pattern detectat: ${pattern.earlyEndRate || Math.round((pattern.confidence ?? 0) * 100)}% sesiuni terminate devreme. Redus la ${newCount} exercitii.`,
          originalCount,
          newCount,
        };
      }
    }
    return session;
  }

  // ══ Schedule override generators — mockup `chooseScheduleOverride` wire ════
  // Three lean session shapes the coach can return when user picks override
  // path ("sesiune-usoara" / "sar-ziua" / "vreau-antrenez") from mockup card.

  /**
   * Light mobility ~15 min session — NO lifts. Used when user picks
   * `chooseScheduleOverride('sesiune-usoara')`.
   *
   * @param {object} profile - user profile (unused today, reserved for future)
   * @param {object} ctx - coach context (unused today, reserved for future)
   * @returns {{ type, durationMin, exercises, isMobility, intent }}
   */
  buildLightMobility(_profile, _ctx) {
    return {
      type: 'MOBILITY_LIGHT',
      durationMin: 15,
      isMobility: true,
      intent: 'Recuperare activa fara lifts — pregatim sesiunea grea de maine.',
      exercises: [
        { name: 'Band Pull-Aparts', sets: 2, reps: 15, isMobility: true },
        { name: 'Scapular Activation (Wall Slides)', sets: 2, reps: 12, isMobility: true },
        { name: 'Cat-Cow Mobility', sets: 1, reps: 10, isMobility: true },
        { name: 'Foam Roll Upper Back', sets: 1, reps: 60, repsUnit: 'sec', isMobility: true },
        { name: 'Hip Flexor Stretch', sets: 1, reps: 45, repsUnit: 'sec', isMobility: true },
      ],
    };
  }

  /**
   * Re-balance upcoming sessions after a skipped day. Distributes the missed
   * volume across the remaining sessions this week (up to 2). Returns the
   * adjustment plan — caller applies on next buildSession() calls.
   *
   * @param {object} profile
   * @param {object} ctx
   * @param {string} skippedDay - day label ('luni','marti', etc.)
   * @returns {{ skippedDay, adjustments: Array<{day, volumeBoostPct}>, note }}
   */
  rebalanceWeekAfterSkip(_profile, _ctx, skippedDay) {
    const week = ['luni','marti','miercuri','joi','vineri','sambata','duminica'];
    const idx = week.indexOf((skippedDay || '').toLowerCase());
    if (idx === -1) {
      return {
        skippedDay,
        adjustments: [],
        note: 'Ziua sarita nu a fost recunoscuta — fara redistribuire.',
      };
    }
    const remaining = week.slice(idx + 1).slice(0, 2);
    const boostPerDay = remaining.length > 0 ? Math.round(20 / remaining.length) : 0;
    const adjustments = remaining.map(day => ({ day, volumeBoostPct: boostPerDay }));
    return {
      skippedDay,
      adjustments,
      note: adjustments.length
        ? `Adaugam ${boostPerDay}% volum pe ${remaining.join(' + ')} ca sa compensam.`
        : 'Saptamana s-a terminat — reluam normal de luni.',
    };
  }

  /**
   * Generate a safe session when user wants to train on a planned rest day.
   * Low intensity (70% kg target), reduced sets (max 2 per ex), recovery-aware.
   * Used when user picks `chooseScheduleOverride('vreau-antrenez')`.
   *
   * @param {object} profile
   * @param {object} ctx
   * @param {string} alternativeType - 'PUSH' | 'PULL' | 'UMERI_BRATE' | etc.
   * @returns {{ type, exercises, isSafeRestDay, intensityFactor, intent }}
   */
  generateSafeSessionForRestDay(_profile, ctx, alternativeType) {
    const baseType = (alternativeType || 'UMERI_BRATE').toUpperCase();
    const base = buildSession(baseType, ctx || {});
    const exercises = (base.exercises || []).slice(0, 4).map(e => ({
      ...e,
      sets: Math.min(2, e.sets || 2),
      isSafeRestDay: true,
    }));
    return {
      type: baseType,
      isSafeRestDay: true,
      intensityFactor: 0.7,
      intent: 'Sesiune usoara pe zi de odihna — kg target 70%, max 2 seturi/exercitiu.',
      exercises,
    };
  }
}

export const coachDirector = new CoachDirector();

function getLastLogFromContext(exerciseName, recentLogs) {
  if (!recentLogs || !recentLogs.length) return null;
  for (const session of recentLogs) {
    const log = (session.logs || []).find(l => l.ex === exerciseName);
    if (log) return log;
  }
  return null;
}

function _hasRecentLog(exerciseName, recentLogs) {
  if (!recentLogs || !recentLogs.length) return false;
  for (const session of recentLogs) {
    if ((session.logs || []).some(l => l.ex === exerciseName)) return true;
  }
  return false;
}

function _computeDaysSinceLastSession(allLogs) {
  if (!Array.isArray(allLogs) || allLogs.length === 0) return null;
  const sessionTimestamps = [...new Set(allLogs.map(l => l.session).filter(Boolean))];
  if (sessionTimestamps.length === 0) return null;
  const lastTs = Math.max(...sessionTimestamps);
  return Math.floor((Date.now() - lastTs) / MS_PER_DAY);
}

function _computeLastSessionType(allLogs) {
  if (!Array.isArray(allLogs) || allLogs.length === 0) return null;
  const bySession = {};
  for (const l of allLogs) {
    if (!l.session || !l.ex) continue;
    bySession[l.session] = bySession[l.session] || new Set();
    bySession[l.session].add(l.ex);
  }
  const sortedTs = Object.keys(bySession).sort((a, b) => Number(b) - Number(a));
  if (sortedTs.length === 0) return null;
  return inferSessionType([...bySession[sortedTs[0]]]);
}
