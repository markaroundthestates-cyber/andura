// ══ COACH DIRECTOR — Orchestrare sesiune cu context unificat ══════════════
import { buildCoachContext } from './coachContext.js';
import { realityEngine } from './reality.js';

export class CoachDirector {
  async buildSession(sessionType) {
    const ctx = buildCoachContext();

    if (!ctx.readiness.isSet) {
      return { requiresReadinessInput: true, message: 'Cum te simți azi?', exercises: [] };
    }

    if (ctx.readiness.score < 40) {
      return {
        restDay: true,
        message: 'Odihnește-te azi. Recovery activ recomandat.',
        exercises: [],
        readinessScore: ctx.readiness.score
      };
    }

    let session;
    try {
      const sessionBuilderModule = await import('./sessionBuilder.js');
      if (sessionBuilderModule.sessionBuilder && sessionBuilderModule.sessionBuilder.build) {
        session = sessionBuilderModule.sessionBuilder.build(sessionType, ctx);
      } else if (sessionBuilderModule.buildSession) {
        session = sessionBuilderModule.buildSession(sessionType, ctx);
      } else {
        session = this.fallbackSessionBuilder(sessionType, ctx);
      }
    } catch (e) {
      session = this.fallbackSessionBuilder(sessionType, ctx);
    }

    try {
      const dpModule = await import('./dp.js');
      for (const exercise of session.exercises) {
        if (dpModule.DP && dpModule.DP.getSmartRecommendation) {
          const dpRec = dpModule.DP.getSmartRecommendation(exercise.name, ctx.readiness.score, null);
          if (dpRec.status === 'INIT' && dpModule.getInitialRecommendation) {
            // No DP history — estimate from similar exercises
            exercise.recommendation = dpModule.getInitialRecommendation(exercise.name, ctx);
          } else {
            exercise.recommendation = dpRec;
          }
        } else if (dpModule.getSmartRecommendation) {
          exercise.recommendation = dpModule.getSmartRecommendation(exercise, ctx);
        } else if (dpModule.getInitialRecommendation) {
          exercise.recommendation = dpModule.getInitialRecommendation(exercise.name, ctx);
        } else {
          const lastLog = getLastLogFromContext(exercise.name, ctx.recentLogs);
          const baseWeight = lastLog ? (lastLog.weight ?? lastLog.w ?? 20) : 20;
          exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: exercise.sets || 3 };
        }

        // Normalizează câmpul weight (DP folosește kg, getInitialRecommendation expune ambele)
        if (!exercise.recommendation.weight && exercise.recommendation.kg) {
          exercise.recommendation.weight = exercise.recommendation.kg;
        }
        // Propagă technique la nivelul exercițiului (accesat în teste și UI)
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
          const baseWeight = lastLog ? (lastLog.weight ?? lastLog.w ?? 20) : 20;
          exercise.recommendation = { kg: baseWeight, weight: baseWeight, reps: 8, sets: exercise.sets || 3 };
        }
      }
    }

    session = this.applyAAAdjustments(session, ctx);
    session = realityEngine.validate(session, ctx);
    session = this.applyPatterns(session, ctx);

    session.context = {
      readinessScore: ctx.readiness.score,
      readinessEmoji: ctx.readiness.emoji,
      isDeficit: ctx.isDeficit,
      phase: ctx.user.phase
    };

    return session;
  }

  fallbackSessionBuilder(sessionType, ctx) {
    const exercisesByType = {
      'PUSH': ['Incline DB Press', 'Pec Deck', 'DB Shoulder Press', 'Lateral Raises', 'Overhead Triceps', 'Pushdown'],
      'PULL': ['Lat Pulldown', 'Cable Row', 'Face Pulls', 'Bayesian Curl', 'Incline DB Curl'],
      'UMERI_BRATE': ['DB Shoulder Press', 'Lateral Raises', 'Rear Delt Fly', 'Bayesian Curl', 'Pushdown'],
      'UPPER_PICIOARE': ['Lat Pulldown', 'Incline DB Press', 'Leg Press', 'Leg Extension', 'Leg Curl'],
      'FULL_UPPER': ['Lat Pulldown', 'Incline DB Press', 'Cable Row', 'DB Shoulder Press', 'Bayesian Curl', 'Pushdown']
    };
    const names = exercisesByType[sessionType] || exercisesByType['FULL_UPPER'];
    const available = ctx.equipment.available;
    const equipMap = {
      'Incline DB Press': 'dumbbell', 'DB Shoulder Press': 'dumbbell',
      'Lateral Raises': 'dumbbell', 'Incline DB Curl': 'dumbbell',
      'Pec Deck': 'pec_deck', 'Rear Delt Fly': 'pec_deck',
      'Lat Pulldown': 'bailib_stack', 'Cable Row': 'bailib_stack',
      'Face Pulls': 'matrix_cable', 'Bayesian Curl': 'matrix_cable',
      'Overhead Triceps': 'matrix_cable', 'Pushdown': 'matrix_cable', 'Cable Fly': 'matrix_cable',
      'Leg Extension': 'leg_machine', 'Leg Curl': 'leg_machine',
      'Leg Press': 'leg_press_plates'
    };
    const filtered = names.filter(n => available.includes(equipMap[n]));
    return { type: sessionType, exercises: filtered.map(name => ({ name, sets: 3 })) };
  }

  // TODO Week 2: conectează AA engine
  applyAAAdjustments(session, ctx) {
    return session;
  }

  applyPatterns(session, ctx) {
    if (!ctx.patterns || ctx.patterns.length === 0) return session;
    for (const pattern of ctx.patterns) {
      if (pattern.type === 'early_end' && pattern.confidence > 0.6) {
        const originalCount = session.exercises.length;
        const newCount = Math.max(3, Math.ceil(originalCount * 0.8));
        session.exercises = session.exercises.slice(0, newCount);
        session.patternApplied = {
          type: 'early_end',
          reason: 'Pattern detectat: termini ' + Math.round(pattern.confidence * 100) + '% din sesiuni devreme. Redus la ' + newCount + ' exerciții.',
          originalCount,
          newCount
        };
      }
    }
    return session;
  }
}

export const coachDirector = new CoachDirector();

// Caută ultima intrare logată pentru un exercițiu în sesiunile recente
// Suportă format test (exercise/weight) și format real app (ex/w)
function getLastLogFromContext(exerciseName, recentLogs) {
  if (!recentLogs || !recentLogs.length) return null;
  for (const session of recentLogs) {
    const log = (session.logs || []).find(l => (l.exercise || l.ex) === exerciseName);
    if (log) return log;
  }
  return null;
}

function _hasRecentLog(exerciseName, recentLogs) {
  if (!recentLogs || !recentLogs.length) return false;
  for (const session of recentLogs) {
    if ((session.logs || []).some(l => (l.exercise || l.ex) === exerciseName)) return true;
  }
  return false;
}
