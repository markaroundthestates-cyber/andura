// The plan options of the session under way (Workout / SessionPill / PostRpe).
// A rest day never empties a session: the user is training (a session that ran
// past midnight into a rest day, or one opened without the preview) — the same
// rule the preview applies on a rest-day Start (dp_rest_day_train_anyway_v1).
import { useScheduleStore } from '../stores/scheduleStore';
import { useWorkoutStore } from '../stores/workoutStore';
import type { SessionPlanOptions } from '../stores/workoutStore';

export function currentSessionPlanOptions(): SessionPlanOptions {
  const opts = useWorkoutStore.getState().sessionPlanOptions ?? {};
  if (opts.livePlan || opts.trainOnRestDay) return opts;
  const restToday = useScheduleStore.getState().days[(new Date().getDay() + 6) % 7] === 'rest';
  return restToday ? { ...opts, trainOnRestDay: true } : opts;
}
