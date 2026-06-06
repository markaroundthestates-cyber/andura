// ══ AEROBIC COACH — class-only Coach dashboard (Daniel spec 2026-05-30) ════
//
// Rendered on the Antrenor tab when onboarding.trainingType === 'aerobic'.
// Replaces the gym experience (readiness orb from sets, today's workout,
// schedule, body-recovery model) with a class-focused dashboard:
//   1. "Logheaza clasa" CTA → the class logger (type + duration, kcal computed)
//   2. "Clase saptamana asta" — count this week vs the onboarding frequency target
//   3. SIMPLIFIED SUBJECTIVE readiness — "Cum te simti azi?" pure self-report
//      (rested/normal/tired), NO engine computation, no sets-based orb
//   4. Nutrition summary — the shared TDEEStrip (the aerobic kcal already feeds
//      its Target-Today as an explicit add-on)
//
// The tired self-report lightly informs nutrition: it persists per-day so the
// TDEEStrip note can reflect it later (minimal, reuses the fatigue-ease spirit
// — kept simple here). The gym prescriptions / DP / muscle-recovery model are
// intentionally hidden in this mode.

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { HeartPulse, Plus, Check, Activity, Trash2 } from 'lucide-react';
import { Kicker } from '../pulse/Kicker';
import { Pill } from '../pulse/Pill';
import { PulseMark } from '../pulse/PulseMark';
import { TDEEStrip } from '../Progres/TDEEStrip';
import {
  useAerobicStore,
  countClassesThisWeek,
  computeAerobicKcal,
  aerobicSessionsForDate,
  aerobicTodayIso,
  aerobicMinDateIso,
  clampAerobicDateIso,
  AEROBIC_CLASS_TYPES,
  AEROBIC_MINUTES_MIN,
  AEROBIC_MINUTES_MAX,
  type AerobicClassType,
  type SubjectiveReadiness,
} from '../../stores/aerobicStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { t } from '../../../i18n/index.js';

function todayIso(): string {
  return aerobicTodayIso();
}

/**
 * Class DATE picker — backward / retroactive logging (Daniel decision #45). A
 * native date input bounded to the loggable window: max = today (the FUTURE is
 * blocked, you cannot log a class that has not happened), min = today − backlog.
 * Defaults to today, so the common case is one tap fewer. When a past day is
 * picked it surfaces a small "logging for a past day" hint so the backdate is
 * never silent. Exported so 'both' mode reuses the exact same control.
 */
export function ClassDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (dateISO: string) => void;
}): JSX.Element {
  const today = aerobicTodayIso();
  const min = aerobicMinDateIso();
  const isBackdated = value < today;
  return (
    <div data-testid="aerobic-date-field">
      <label className="block text-xs text-ink2 mt-4 mb-1" htmlFor="aerobic-date">
        {t('antrenor.aerobic.dateLabel')}
      </label>
      <input
        id="aerobic-date"
        type="date"
        value={value}
        min={min}
        max={today}
        onChange={(e) => onChange(clampAerobicDateIso(e.target.value))}
        data-testid="aerobic-date-input"
        aria-label={t('antrenor.aerobic.dateAriaLabel')}
        className="w-44 px-3 py-2 border border-lineStrong rounded-xl bg-paper text-ink font-mono text-base"
      />
      <p
        className={`text-xs mt-1 ${isBackdated ? 'font-semibold' : 'text-ink3'}`}
        style={isBackdated ? { color: 'var(--aqua-ink)' } : undefined}
        data-testid="aerobic-date-hint"
      >
        {isBackdated ? t('antrenor.aerobic.dateBackdatedHint') : t('antrenor.aerobic.dateTodayHint')}
      </p>
    </div>
  );
}

const SUBJECTIVE_OPTIONS: ReadonlyArray<{ value: SubjectiveReadiness; labelKey: string }> = [
  { value: 'rested', labelKey: 'antrenor.aerobic.readiness.rested' },
  { value: 'normal', labelKey: 'antrenor.aerobic.readiness.normal' },
  { value: 'tired', labelKey: 'antrenor.aerobic.readiness.tired' },
];

export function AerobicCoach(): JSX.Element {
  // The subjective readiness is always TODAY's self-report (how you feel now),
  // independent of which day a class is being logged for.
  const todayISO = todayIso();
  const sessions = useAerobicStore((s) => s.sessions);
  const subjectiveByDate = useAerobicStore((s) => s.subjectiveByDate);
  const setSubjectiveReadiness = useAerobicStore((s) => s.setSubjectiveReadiness);
  const frequency = useOnboardingStore((s) => s.data.frequency);

  // The day a class is being logged for — defaults to today, the picker can move
  // it back into the backlog window (backward logging, Daniel decision #45). The
  // "classes for this day" list mirrors it so the user sees the right day.
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  const [loggerOpen, setLoggerOpen] = useState(false);
  // SC 2.4.3 — when the inline logger closes, return focus to the CTA that
  // opened it (the CTA unmounts while the logger is open, so we re-focus it
  // after it remounts). prevOpen guards against firing on the initial render.
  const logCtaRef = useRef<HTMLButtonElement | null>(null);
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (prevOpenRef.current && !loggerOpen) logCtaRef.current?.focus();
    prevOpenRef.current = loggerOpen;
  }, [loggerOpen]);

  const classesThisWeek = countClassesThisWeek(sessions, new Date());
  // Weekly target = the onboarding training frequency (sessions/week). Null when
  // not set (fresh user) → show the count without a "/ target".
  const weeklyTarget = frequency != null ? Number(frequency) : null;
  const subjective = subjectiveByDate[todayISO] ?? null;

  return (
    <section
      className="pt-4 px-5 pb-6 bg-paper"
      data-testid="aerobic-coach"
      aria-label={t('antrenor.aerobic.ariaLabel')}
    >
      {/* Pulse header — mono eyebrow + display title + animated mark. */}
      <div className="mb-4 animate-card-rise">
        <Kicker color="var(--aqua-ink)">{t('antrenor.aerobic.kicker')}</Kicker>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t('tabs.antrenor.title')}
          </h1>
          <PulseMark size={34} />
        </div>
        <p className="font-serif italic text-ink2 text-sm mt-0.5">
          {t('antrenor.aerobic.subtitle')}
        </p>
      </div>

      {/* Classes this week — count vs weekly target. */}
      <div
        className="pulse-card pulse-card-glow overflow-hidden p-4 mb-4 flex items-center gap-4 animate-card-rise delay-75"
        data-testid="aerobic-week-count"
        style={{ ['--wash' as string]: 'var(--aqua)' }}
      >
        <span
          className="w-14 h-14 flex-shrink-0 rounded-2xl bg-paper flex items-center justify-center"
          aria-hidden="true"
        >
          <Activity className="w-7 h-7" style={{ color: 'var(--aqua-deep)' }} />
        </span>
        <div className="flex-1 min-w-0">
          <Kicker color="var(--aqua-ink)">{t('antrenor.aerobic.weekKicker')}</Kicker>
          <p className="num-display text-3xl font-bold text-ink mt-1" data-testid="aerobic-week-val">
            {weeklyTarget != null
              ? t('antrenor.aerobic.weekCountTarget', { count: classesThisWeek, target: weeklyTarget })
              : t('antrenor.aerobic.weekCount', { count: classesThisWeek })}
          </p>
        </div>
      </div>

      {/* Log a class CTA + inline logger (with backward-date picker). */}
      {loggerOpen ? (
        <ClassLogger
          dateISO={selectedDate}
          onDateChange={setSelectedDate}
          onDone={() => setLoggerOpen(false)}
        />
      ) : (
        <button
          ref={logCtaRef}
          type="button"
          onClick={() => {
            // Re-default to today each open — a stale backdate from a prior log
            // must not silently carry over to the next class.
            setSelectedDate(todayISO);
            setLoggerOpen(true);
          }}
          data-testid="aerobic-log-cta"
          className="btn-primary-lift btn-grad press-feedback w-full mb-4 px-5 py-4 text-base font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          {t('antrenor.aerobic.logCta')}
        </button>
      )}

      {/* Logged classes for the selected day — per-entry delete (mislogged-class
          removal). Mirrors the picker so a backdated log appears in its day. */}
      <TodayClassList dateISO={selectedDate} />

      {/* Simplified SUBJECTIVE readiness — pure self-report, NO engine. */}
      <div
        className="pulse-card pulse-card-tight overflow-hidden p-4 mb-4 animate-card-rise delay-150"
        data-testid="aerobic-readiness"
      >
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse className="w-4 h-4" style={{ color: 'var(--aqua-deep)' }} aria-hidden="true" />
          <Kicker color="var(--aqua-ink)">{t('antrenor.aerobic.readinessKicker')}</Kicker>
        </div>
        <p className="text-sm text-ink2 mb-3">{t('antrenor.aerobic.readinessQuestion')}</p>
        <div className="grid grid-cols-3 gap-2">
          {SUBJECTIVE_OPTIONS.map(({ value, labelKey }) => {
            const selected = subjective === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSubjectiveReadiness(todayISO, value)}
                data-testid={`aerobic-readiness-${value}`}
                aria-pressed={selected}
                className={`press-feedback py-3 px-2 rounded-xl border text-sm font-semibold text-ink transition-colors ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
        {subjective === 'tired' && (
          <p className="text-xs text-ink3 mt-3 leading-snug" data-testid="aerobic-readiness-tired-note">
            {t('antrenor.aerobic.readinessTiredNote')}
          </p>
        )}
      </div>

      {/* Nutrition summary — the shared Target-Today panel (aerobic kcal already
          feeds it as an explicit add-on). */}
      <TDEEStrip />
    </section>
  );
}

/**
 * Today's logged classes with per-entry delete (mislogged-class removal —
 * Daniel's wife logged 2 aerobic classes by accident with no way to remove
 * them). Each row carries a two-tap delete (tap trash → "Sigur?" confirm/cancel)
 * so an accidental tap can't silently wipe a logged class. Renders nothing when
 * no class is logged today. Exported so 'both' mode reuses the same list.
 */
export function TodayClassList({ dateISO }: { dateISO: string }): JSX.Element | null {
  const sessions = useAerobicStore((s) => s.sessions);
  const removeSession = useAerobicStore((s) => s.removeSession);
  const [confirmTs, setConfirmTs] = useState<number | null>(null);

  const today = aerobicSessionsForDate(sessions, dateISO);
  if (today.length === 0) return null;

  return (
    <div
      className="pulse-card pulse-card-tight overflow-hidden p-4 mb-4 animate-card-rise"
      data-testid="aerobic-today-list"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4" style={{ color: 'var(--aqua-deep)' }} aria-hidden="true" />
        <Kicker color="var(--aqua-ink)">{t('antrenor.aerobic.todayKicker')}</Kicker>
      </div>
      <ul className="flex flex-col gap-2">
        {today.map((s) => (
          <li
            key={s.ts}
            data-testid={`aerobic-today-item-${s.ts}`}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-paper2 border border-lineStrong"
          >
            <span className="text-sm text-ink min-w-0">
              {t('antrenor.aerobic.todayItem', {
                type: t(`antrenor.aerobic.types.${s.type}`),
                minutes: s.minutes,
              })}
            </span>
            {confirmTs === s.ts ? (
              <span className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmTs(null)}
                  data-testid={`aerobic-delete-cancel-${s.ts}`}
                  className="press-feedback px-3 py-1.5 rounded-lg bg-paper border border-lineStrong text-ink text-xs font-semibold"
                >
                  {t('antrenor.aerobic.deleteConfirmNo')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeSession(s.ts);
                    setConfirmTs(null);
                  }}
                  data-testid={`aerobic-delete-accept-${s.ts}`}
                  className="press-feedback px-3 py-1.5 rounded-lg bg-brick text-paper text-xs font-semibold"
                >
                  {t('antrenor.aerobic.deleteConfirmYes')}
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmTs(s.ts)}
                data-testid={`aerobic-delete-${s.ts}`}
                aria-label={t('antrenor.aerobic.deleteAria')}
                className="press-feedback p-2 rounded-lg text-ink2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Inline class logger — pick a TYPE (baked-in MET) + DURATION (editable WITH
 * MEMORY: pre-filled from the last-used duration, persisted on save). kcal is
 * computed live (MET × weight × hrs) and shown before commit. Exported for
 * reuse by BothModeAerobicCard ('both' mode shares the same logger).
 *
 * Double-log-per-day guard (Daniel's wife mislogged): when a class is already
 * logged today, Save first asks "You already logged a class today — log
 * another?" (explicit confirm, not a hard block) so an accidental second log is
 * caught while a genuine second class is still one tap away.
 */
export function ClassLogger({
  dateISO,
  onDateChange,
  onDone,
}: {
  dateISO: string;
  /** Backward-logging date picker hook — omit to hide the picker (fixed date). */
  onDateChange?: (dateISO: string) => void;
  onDone: () => void;
}): JSX.Element {
  const lastDuration = useAerobicStore((s) => s.lastDuration);
  const logClass = useAerobicStore((s) => s.logClass);
  const sessions = useAerobicStore((s) => s.sessions);
  const [confirmAnother, setConfirmAnother] = useState(false);

  // SC 2.4.3 — move focus into the revealed logger on open (lands on the
  // heading, not deep in the form, so it is not disruptive). The parent
  // restores focus to the trigger CTA on close.
  const headingRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const [type, setType] = useState<AerobicClassType>('aerobic');
  // Duration memory — seed from the last-used duration (the store remembers it).
  const [minutesDraft, setMinutesDraft] = useState<string>(String(lastDuration));

  const minutes = Number(minutesDraft);
  const minutesValid =
    Number.isFinite(minutes) && minutes >= AEROBIC_MINUTES_MIN && minutes <= AEROBIC_MINUTES_MAX;
  const weightKg = getCurrentWeightKg();
  const kcalPreview = minutesValid ? computeAerobicKcal(type, weightKg, minutes) : null;

  // A class already logged on the SELECTED day → Save first asks to confirm a
  // second log (the day can be backdated, so this tracks the chosen day, not
  // literally today).
  const alreadyLoggedThisDay = aerobicSessionsForDate(sessions, dateISO).length > 0;

  function handleDateChange(next: string): void {
    // Switching the day invalidates a pending double-log confirm (it was raised
    // for the previous day).
    setConfirmAnother(false);
    onDateChange?.(next);
  }

  function commit(): void {
    // logClass persists the session (under the chosen date) + remembers duration.
    logClass({ date: dateISO, type, minutes, weightKg });
    onDone();
  }

  function handleSave(): void {
    if (!minutesValid) return;
    // Explicit double-log confirm (not a hard block): an accidental second log
    // is caught, a genuine second class is one more tap.
    if (alreadyLoggedThisDay && !confirmAnother) {
      setConfirmAnother(true);
      return;
    }
    commit();
  }

  return (
    <div
      className="pulse-card pulse-card-tight overflow-hidden p-4 mb-4 animate-card-rise"
      data-testid="aerobic-logger"
    >
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        <Kicker color="var(--aqua-ink)">{t('antrenor.aerobic.loggerKicker')}</Kicker>
      </div>

      {/* Class DATE — backward / retroactive logging (decision #45). Defaults to
          today; can move back into the backlog window. Hidden when the host does
          not wire onDateChange (fixed-date callers). */}
      {onDateChange && <ClassDatePicker value={dateISO} onChange={handleDateChange} />}

      {/* Class type picker. */}
      <p className="text-xs text-ink2 mt-3 mb-2">{t('antrenor.aerobic.typeLabel')}</p>
      <div className="flex flex-col gap-2">
        {AEROBIC_CLASS_TYPES.map((ct) => {
          const selected = type === ct;
          return (
            <button
              key={ct}
              type="button"
              onClick={() => setType(ct)}
              data-testid={`aerobic-type-${ct}`}
              aria-pressed={selected}
              className={`press-feedback flex items-center justify-between p-3 rounded-xl border text-sm text-ink text-left transition-colors ${selected ? 'ob-row-selected option-selected-ring' : 'bg-paper2 border-lineStrong'}`}
            >
              <span className="font-medium">{t(`antrenor.aerobic.types.${ct}`)}</span>
              <span className="ob-check" aria-hidden="true">
                {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.6} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Duration (min) — editable, pre-filled from memory. */}
      <label className="block text-xs text-ink2 mt-4 mb-1" htmlFor="aerobic-minutes">
        {t('antrenor.aerobic.durationLabel')}
      </label>
      <input
        id="aerobic-minutes"
        type="number"
        min={AEROBIC_MINUTES_MIN}
        max={AEROBIC_MINUTES_MAX}
        inputMode="numeric"
        value={minutesDraft}
        onChange={(e) => setMinutesDraft(e.target.value)}
        data-testid="aerobic-minutes-input"
        aria-label={t('antrenor.aerobic.durationAriaLabel')}
        className="w-28 px-3 py-2 border border-lineStrong rounded-xl bg-paper text-ink font-mono text-base"
      />

      {/* Live kcal preview. */}
      <div className="mt-3" data-testid="aerobic-kcal-preview">
        {kcalPreview != null ? (
          <Pill color="var(--aqua-ink)">
            {t('antrenor.aerobic.kcalPreview', { kcal: kcalPreview })}
          </Pill>
        ) : (
          <span className="text-xs text-ink3">{t('antrenor.aerobic.kcalUnknown')}</span>
        )}
      </div>

      {/* Double-log-per-day confirm — explicit "log another?" (not a hard block). */}
      {confirmAnother && (
        <div
          className="mt-4 p-3 rounded-xl bg-paper2 border border-lineStrong"
          data-testid="aerobic-already-logged"
        >
          <p className="text-sm font-semibold text-ink">{t('antrenor.aerobic.alreadyLoggedTitle')}</p>
          <p className="text-xs text-ink2 mt-1">{t('antrenor.aerobic.alreadyLoggedBody')}</p>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => setConfirmAnother(false)}
              data-testid="aerobic-already-logged-no"
              className="btn-secondary-lift flex-1 px-4 py-2.5 bg-paper border border-lineStrong text-ink rounded-xl text-sm font-semibold"
            >
              {t('antrenor.aerobic.alreadyLoggedNo')}
            </button>
            <button
              type="button"
              onClick={commit}
              data-testid="aerobic-already-logged-yes"
              className="btn-primary-lift btn-grad press-feedback flex-1 px-4 py-2.5 text-sm font-semibold"
            >
              {t('antrenor.aerobic.alreadyLoggedYes')}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onDone}
          data-testid="aerobic-logger-cancel"
          className="btn-secondary-lift px-5 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
        >
          {t('antrenor.aerobic.cancelCta')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!minutesValid}
          data-testid="aerobic-logger-save"
          className="btn-primary-lift btn-grad press-feedback flex-1 px-5 py-3 text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          {t('antrenor.aerobic.saveCta')}
        </button>
      </div>
    </div>
  );
}
