// PROGRES PARITY F-progres-07
// F-progres-07 MOCKUP-PARITY (2026-05-22): Alerte azi 3-row banner added
// per mockup L1768-1774. Reuses Antrenor AlertsBanner + getCoachToday aggregate.
//
// §F-pass2-fatiguestrip-02 (HIGH-EPSILON 2026-05-22) — Oboseala + Calorii baza
// BMR 2-col grid mockup L1717. Daniel LOCKED V1 single number NU visual bar.
//
// §F-progres-01 (MED chat5 Wave 13) — subtitle mockup verbatim "Body
// composition · estimari calibrate." mockup andura-clasic.html#L1699.
// Repositioneaza Progres tab ca body composition focus (vs prod logging-
// focused) — alineaza UX intent mockup. Mid-dot Unicode U+00B7 (·).
//
// Wave A4 hierarchy reorg (Daniel 2026-05-28 "reorganizeaza tabul de progres
// sa fie mai estetic" + "fa-o Top Grade"): the prior vertical wall of ~12 cards
// stacked tightly is regrouped into 5 semantic ZONES with a 1-line section
// heading each + animate-card-rise staggered entrance. Information content,
// engine wires, and i18n keys unchanged — pure visual hierarchy + breathing.
//
// Redesign reorder (Daniel 2026-05-28 "Kcal recomandate trebuiau sa apara sus
// ... si overall mutat totul cat sa fie intuitiv"): the daily ACTIONABLE number
// (kcal + protein target) now LEADS the screen as a hero; goal config (a set-
// once choice, not a daily read) is demoted near the bottom. Information content,
// engine wires, i18n keys, and ALL testids unchanged — pure order + hierarchy.
//
// Pulse reskin (arc #5 2026-05-29, interfata-noua/screens-tabs.jsx:5-162): the
// zone structure is re-skinned to the Pulse card language (display header +
// mono zone eyebrows + surface-elevated cards).
//
// PROGRESS REDESIGN (Daniel locked, 2026-05-30 — supersedes the old mockup for
// this tab). New top → bottom story, "what's my target today" first, "where am
// I trending" last:
//   1. AZI        — TDEEStrip is now the ONE merged "Target Today" hero: kcal +
//                   protein EDITABLE for the day (= logging consumed intake, feeds
//                   the same Bayesian context that calibrates TDEE) + honest
//                   "sharpens as you log" microcopy + Fatigue on the right. The
//                   separate NutritionInline + FatigueStrip panels are MERGED INTO
//                   it. Fatigue → kcal: a capped recovery-protective deficit ease,
//                   labeled. (The Base-calories/BMR panel was struck out 2026-05-30.)
//   2. RECUPERARE — Daniel 2026-05-30 arrow UP: the body-model recovery section is
//                   moved HIGH, right under Target Today, prominent before the
//                   objective + composition detail. MuscleBodyMap (anatomical body
//                   figure) REPLACES the old MuscleRecoveryGrid circles (same
//                   useMuscleRecoveryGroups data).
//   3. OBIECTIV   — ObiectivCard (Target Weight + ETA) fast-visible near the top;
//                   ObiectivGoalCard (5 goal pills) sits with it (both "objective").
//   4. COMPOZITIE — body-composition group: BodyFat + Projection + Weight (7 days).
//   5. ACTIUNI    — AlertsBanner + log-weight CTA + timeline CTA. (The
//                   "Last weigh-in" recap card was struck out 2026-05-30.)
//   6. TENDINTA   — "Weight & BF trend" Sparkline card, moved to the BOTTOM.
//
// Engine wires + i18n keys + prior testids preserved (cta-log-weight,
// alerts-banner, alerte-azi-label, tdee-strip, nutri-* edit chips). Wrapping
// containers keep data-testid="progres-zone-*" for smoke.

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, LineChart } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { gotoPath } from '../../../lib/navigation';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { ProjectionStrip } from '../../../components/Progres/ProjectionStrip';
import { GoalForecastBlock } from '../../../components/Progres/GoalForecastBlock';
import { StimulusBlock } from '../../../components/Progres/StimulusBlock';
import { BodyFatStrip } from '../../../components/Progres/BodyFatStrip';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { useMuscleRecoveryGroups } from '../../../components/Progres/MuscleRecoveryGrid';
import { MuscleBodyMap } from '../../../components/Progres/MuscleBodyMap';
import { ObiectivCard } from '../../../components/Progres/ObiectivCard';
import { ObiectivGoalCard } from '../../../components/Progres/ObiectivGoalCard';
import { GoalPivotBanner } from '../../../components/Progres/GoalPivotBanner';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import { Sparkline } from '../../../components/pulse/Sparkline';
import { Kicker } from '../../../components/pulse/Kicker';
import { Pill } from '../../../components/pulse/Pill';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../lib/coachDirectorAggregate';
import { t } from '../../../../i18n/index.js';

// Zone heading utility — keeps the 5 section labels identical without
// repeating the same 4 Tailwind classes inline 5 times. Stable typographic
// rhythm across zones reads as "this screen has a structure" not "random card
// dump". 11px uppercase tracking-wide + ink3 mute = quiet but present.
function ZoneHeading({ children, testId }: { children: string; testId: string }): JSX.Element {
  return (
    <h2
      data-testid={testId}
      className="font-mono text-[11px] font-semibold text-ink3 uppercase tracking-[0.14em] mb-3 mt-6 first:mt-0"
    >
      {children}
    </h2>
  );
}

export function Progres(): JSX.Element {
  const navigate = useNavigate();
  const weightLog = useProgresStore((s) => s.weightLog);

  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCoachToday().then((c) => {
      if (!cancelled) setCoach(c);
    });
    return () => { cancelled = true; };
  }, []);

  const lastWeight = weightLog[weightLog.length - 1];
  const alerts = coach?.alerts ?? [];
  // Gate the RECUPERARE zone (heading + grid) on the recovery engine actually
  // returning groups — a fresh T0 user (no logged sets) otherwise sees a lone
  // eyebrow over empty space, since the grid self-hides but the heading didn't
  // (03.048). Same selector the grid uses → single source of truth.
  const recoveryGroups = useMuscleRecoveryGroups();

  // Aerobic mode-gate (Daniel spec 2026-05-30) — the muscle-recovery body map is
  // a gym-specific progression surface (per-muscle set recovery). A PURE aerobic
  // user has no gym sets, so hide it outright rather than relying on the empty-
  // data coincidence. Generic zones (target/nutrition, objective, composition,
  // weight trend) stay visible for everyone. 'gym' + 'both' keep the zone — gate
  // is strictly === 'aerobic'. Hook read above the return (Rules of Hooks).
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  const showRecoveryZone = trainingType !== 'aerobic' && recoveryGroups.length > 0;

  // Pulse TREND: feed the shared Sparkline primitive the full weight history
  // mapped to its {day,kg} shape (interfata-noua/screens-tabs.jsx:63). Sparkline
  // returns null on <2 points, so the card only renders the line once there's a
  // trend to draw; the precise latest/delta numbers stay in HeatMapWeekly below.
  const sparkData = useMemo(
    () => weightLog.map((w) => ({ day: w.date, kg: w.kg })),
    [weightLog],
  );
  const firstWeight = weightLog[0];
  const trendDelta =
    lastWeight && firstWeight && weightLog.length >= 2
      ? +(lastWeight.kg - firstWeight.kg).toFixed(1)
      : null;

  return (
    <section className="p-6 min-h-screen" data-testid="progres-home">
      {/* Pulse header (interfata-noua/screens-tabs.jsx:13-16): display wordmark +
          italic serif tagline. Keeps the existing i18n keys + testid contract. */}
      <h1 className="font-display text-3xl font-bold text-ink mb-0.5">{t('tabs.progres.title')}</h1>
      <p className="font-serif italic text-sm text-ink2 mb-2">{t('tabs.progres.subtitle')}</p>

      {/* ── ZONE 1: AZI — the ONE merged "Target Today" hero. ───────────────
          TDEEStrip now owns: editable kcal + protein for the day (= logging
          consumed intake, feeds the Bayesian engine), honest "sharpens as you
          log" microcopy, Fatigue today on the right, base calories (BMR) folded
          in small, and the recovery-protective fatigue→kcal ease (labeled). The
          old separate NutritionInline / FatigueStrip / BMRStrip panels are gone. */}
      <div data-testid="progres-zone-azi" className="animate-card-rise delay-0">
        <ZoneHeading testId="progres-zone-azi-heading">{t('progres.zone.azi')}</ZoneHeading>
        <TDEEStrip />
      </div>

      {/* ── ZONE 2: RECUPERARE — anatomical muscle recovery body map. ────────
          Daniel 2026-05-30 arrow UP: the body-model recovery section is moved
          HIGH, right under Target Today, so it reads prominently before the
          objective + composition detail. MuscleBodyMap REPLACES the old
          recovery-ring circles (MuscleRecoveryGrid). Same useMuscleRecoveryGroups
          data; the map self-hides when the engine returns nothing (T0 fresh
          user), so the heading is gated the same way. */}
      {showRecoveryZone && (
        <div data-testid="progres-zone-recovery" className="animate-card-rise delay-75">
          <ZoneHeading testId="progres-zone-recovery-heading">{t('progres.zone.recuperare')}</ZoneHeading>
          <MuscleBodyMap />
        </div>
      )}

      {/* ── ZONE 3: OBIECTIV — Target Weight, fast-visible near the top. ─────
          The goal selector (5 phase pills) + the target-weight + ETA card. Both
          are "your objective", co-located. */}
      <div data-testid="progres-zone-obiectiv" className="animate-card-rise delay-150">
        <ZoneHeading testId="progres-zone-obiectiv-heading">{t('progres.zone.obiectiv')}</ZoneHeading>
        {/* #15 dp_auto_pivot_v1 — near-ceiling goal-pivot suggestion (flag OFF →
            renders null → byte-identical). Sits atop the goal hub since accepting
            it sets the goal the cards below display. */}
        <GoalPivotBanner />
        <ObiectivCard />
        <ObiectivGoalCard />
      </div>

      {/* ── ZONE 4: COMPOZITIE — body-composition group. ────────────────────
          Body fat + forward projection + 7-day weight snapshot grouped together:
          "what's my composition + where is the current pace taking it". */}
      <div data-testid="progres-zone-compozitie" className="animate-card-rise delay-225">
        <ZoneHeading testId="progres-zone-compozitie-heading">{t('progres.zone.compozitie')}</ZoneHeading>
        {/* BUG #12b — bf% estimat surfat pe Progres. Two-tier US-Navy/Deurenberg. */}
        <BodyFatStrip />
        {/* Piesa 4 — Preconizare forward projection (traiectorie curenta). */}
        <ProjectionStrip />
        {/* Goal forecast — date-anchored weight ETA + strength trajectory (honest, hedged). */}
        <GoalForecastBlock />
        {/* V3 #19 — effective-reps "real stimulus this week" (flag-gated, null when OFF). */}
        <StimulusBlock />
        <HeatMapWeekly />
      </div>

      {/* ── ZONE 5: ACTIUNI — alerts + log/measure CTAs + last-entry recap. ─
          Alerts banner heads the zone (urgent items first). Then CTAs to log
          weight + view trend, each followed by its "last entry" recap. Test
          contract preserved: alerts-banner is BEFORE cta-log-weight. */}
      <div data-testid="progres-zone-actiuni" className="animate-card-rise delay-300">
        <ZoneHeading testId="progres-zone-actiuni-heading">{t('progres.zone.actiuni')}</ZoneHeading>
        {alerts.length > 0 && (
          <p data-testid="alerte-azi-label" className="text-xs text-ink2 uppercase tracking-wide font-semibold mb-2">
            {t('progres.alertsToday')}
          </p>
        )}
        <AlertsBanner alerts={alerts} />
        <button
          type="button"
          onClick={() => navigate(gotoPath('log-weight'))}
          data-testid="cta-log-weight"
          className="btn-primary-lift w-full flex items-center gap-3 p-4 mb-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
        >
          <Scale className="w-5 h-5" aria-hidden="true" />
          {t('progres.logWeightToday')}
        </button>
        {/* Progress redesign (Daniel 2026-05-30): the "Last weigh-in" recap card
            was struck out — the log-weight CTA above + the trend zone below
            already cover "what + where". Only the CTAs remain in ACTIUNI. */}
        {/* PAR-004 Wave 2e — Weight Timeline drill-down (chart view). */}
        {lastWeight && (
          <button
            type="button"
            onClick={() => navigate(gotoPath('weight-timeline'))}
            data-testid="cta-weight-timeline"
            className="btn-secondary-lift w-full flex items-center gap-3 p-4 mb-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-base font-semibold"
          >
            <LineChart className="w-5 h-5" aria-hidden="true" />
            {t('progres.viewWeightTrend')}
          </button>
        )}
        {/* §progress-v2 — masuratorile corporale (talie/gat/sold) care alimenteaza
            BF% s-au consolidat in Cont > Profil (alaturi de greutate + BF auto/
            skinfold). Ecranul dedicat "Masuratori corp" (circumferinte
            piept/biceps/coapsa = noise muscular, NU grasime) a fost eliminat. */}
      </div>

      {/* ── ZONE 6: TENDINTA — "Weight & BF trend", moved to the BOTTOM. ─────
          The long-range trend line (weight + BF over time) is the deepest read
          — answers "where am I going overall" — so it closes the screen. Renders
          only with >=2 weight points (Sparkline self-guards to null). */}
      {sparkData.length >= 2 && (
        <div data-testid="progres-zone-tendinta" className="animate-card-rise delay-375">
          <ZoneHeading testId="progres-zone-tendinta-heading">{t('progres.zone.tendinta')}</ZoneHeading>
          <div
            data-testid="progres-trend-sparkline"
            className="pulse-card pulse-card-glow p-4 mb-4"
            style={{ ['--wash' as string]: 'var(--aqua)' }}
            aria-label={t('progres.weight.trendAriaLabel')}
          >
            <div className="flex items-center justify-between mb-2">
              <Kicker color="var(--aqua)">{t('progres.weight.trendTitle')}</Kicker>
              {trendDelta !== null && (
                <Pill color={trendDelta <= 0 ? 'var(--volt)' : 'var(--ember)'}>
                  {trendDelta > 0 ? '+' : ''}{trendDelta} kg
                </Pill>
              )}
            </div>
            <Sparkline data={sparkData} color="var(--aqua)" />
          </div>
        </div>
      )}
    </section>
  );
}
