// ══ GOAL FORECAST BLOCK — date-anchored weight ETA + strength trajectory ══════
//
// Sits next to the nutrition ProjectionStrip on the Progres screen. Two honest,
// hedged forecasts (read-only — never alters kcal targets / safety floors):
//   1. Weight ETA — "At this pace: {goal}kg by ~{date}". When the trend is flat
//      or moving the wrong way, an honest "not on track at the current pace" line
//      replaces the date (no fake promise).
//   2. Strength trajectory — "{lift}: ~{kg} kg in ~{weeks} wks", only for lifts
//      with enough recent history (the engine gates this — no fabrication).
//
// Renders NOTHING when there is nothing honest to show (no goal weight set / no
// liftable history → engine returns null + empty). The math lives in
// lib/goalForecast (pure, clock-injected); this component is display + i18n only.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { CalendarClock, Dumbbell } from 'lucide-react';
import { readGoalForecast } from '../../lib/goalForecast';
import type { GoalForecastResult } from '../../lib/goalForecast';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useProgresStore } from '../../stores/progresStore';
import { t, getCurrentLocale } from '../../../i18n/index.js';

// Locale-aware kg with one decimal. The prior implementation forced 'ro-RO'
// (decimal comma) then `.replace(/,/g,' ')` — which turned the decimal SEPARATOR
// into a SPACE, so "105.3" rendered as "105 3" (Daniel live 2026-06-12: "cine nu
// stie o sa creada ca face lat pulldowns cu 876 kg"). Format in the active locale
// instead — EN keeps the dot ("105.3"), RO keeps its comma ("105,3"), consistent
// with fmtEtaDate + the rest of the app's number style. No grouping to strip at kg
// magnitudes (1-decimal bodyweights/lifts never hit thousands separators).
function fmtKg(n: number): string {
  const locale = getCurrentLocale() === 'ro' ? 'ro-RO' : 'en-US';
  return n.toLocaleString(locale, { maximumFractionDigits: 1, useGrouping: false });
}

// Locale-aware short date (e.g. "Aug 14" / "14 aug.") for the ETA — the engine
// math stays clock-injected + returns a timestamp; the display format lives here.
function fmtEtaDate(ms: number): string {
  const locale = getCurrentLocale() === 'ro' ? 'ro-RO' : 'en-US';
  return new Date(ms).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function GoalForecastBlock(): JSX.Element | null {
  const [forecast, setForecast] = useState<GoalForecastResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Recompute on the signals the forecasts depend on: intake (ETA pace), logged
  // sessions (strength history), and the goal/target weight (ETA target). The
  // goal comes from the canonical progresStore.targetObiectiv (what readGoalForecast
  // now reads), NOT the dead onboarding targetWeight — so changing the goal in
  // ObiectivCard recomputes the ETA.
  const dailyLog = useNutritionStore((s) => s.dailyLog);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const targetWeight = useProgresStore((s) => s.targetObiectiv.weightKg);

  useEffect(() => {
    let cancelled = false;
    readGoalForecast(Date.now())
      .then((f) => {
        if (!cancelled) {
          setForecast(f);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setForecast(null);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dailyLog, sessionsHistory, targetWeight]);

  if (!loaded || forecast === null) return null;

  const { weightEta, strength } = forecast;
  const hasEta = weightEta !== null;
  const hasStrength = strength.length > 0;
  // Nothing honest to show → render nothing (graceful, no empty card).
  if (!hasEta && !hasStrength) return null;

  return (
    <section
      data-testid="goal-forecast"
      className="pulse-card pulse-card-tight p-4 mb-4"
      aria-label={t('bodyComp.goalForecast.strengthHeading')}
    >
      {hasEta && (
        <div className="flex items-center gap-4" data-testid="goal-forecast-eta">
          <CalendarClock className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
              {t('bodyComp.projectionStrip.label')}
            </p>
            {weightEta.kind === 'eta' && (
              <p className="text-base font-semibold text-ink" data-testid="goal-forecast-eta-line">
                {t('bodyComp.goalForecast.etaLine', {
                  kg: fmtKg(weightEta.goalKg),
                  date: fmtEtaDate(weightEta.etaMs),
                })}
              </p>
            )}
            {weightEta.kind === 'off-track' && (
              <p className="text-sm text-ink2" data-testid="goal-forecast-offtrack">
                {t('bodyComp.goalForecast.offTrack')}
              </p>
            )}
            {weightEta.kind === 'reached' && (
              <p className="text-sm text-ink2" data-testid="goal-forecast-reached">
                {t('bodyComp.goalForecast.reached')}
              </p>
            )}
          </div>
        </div>
      )}
      {hasStrength && (
        <div
          className={`flex items-start gap-4${hasEta ? ' mt-3 pt-3 border-t border-dashed border-line' : ''}`}
          data-testid="goal-forecast-strength"
        >
          <Dumbbell className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
              {t('bodyComp.goalForecast.strengthHeading')}
            </p>
            <ul>
              {strength.map((s) => (
                <li
                  key={s.name}
                  className="text-sm font-semibold text-ink"
                  data-testid="goal-forecast-strength-line"
                  data-framing={s.framing ?? 'gain'}
                >
                  {/* Cut-awareness (Daniel 2026-06-12): a cutting user is promised
                      HOLDING strength, never a gain (the engine returns projected ==
                      current + framing 'cut-hold'). Otherwise the standard +gain line. */}
                  {s.framing === 'cut-hold'
                    ? t('bodyComp.goalForecast.strengthLineCut', {
                        lift: s.name,
                        kg: fmtKg(s.projectedOneRm),
                      })
                    : t('bodyComp.goalForecast.strengthLine', {
                        lift: s.name,
                        kg: fmtKg(s.projectedOneRm),
                        weeks: s.weeks,
                      })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <p className="text-xs text-ink3 mt-2 italic" data-testid="goal-forecast-disclaimer">
        {t('bodyComp.projectionStrip.disclaimer')}
      </p>
    </section>
  );
}
