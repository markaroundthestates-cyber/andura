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
// 5-zone structure is re-skinned to the Pulse card language (display header +
// mono zone eyebrows + surface-elevated cards), the TREND zone gains the shared
// Sparkline primitive, and a NET-NEW Big-11 MUSCLE RECOVERY ring grid is added
// (the recovery engine existed but the tab never surfaced it). Engine wires,
// i18n keys, and ALL prior testids unchanged — visual reskin + one new zone.
//
// Zone order top → bottom (read like a story: "what do I do today" first):
//   1. AZI        — TDEEStrip kcal+protein HERO (count-up + depth) + Fatigue|BMR
//                   2-col + BodyFat  ← daily actionable number, leads the screen
//   2. TENDINTA   — Sparkline trend card + ProjectionStrip + HeatMapWeekly
//   3. ACTIUNI    — AlertsBanner + log-weight CTA + last-weight card + weight-trend
//                   CTA + body-data CTA + last-body card
//   4. RECUPERARE — MuscleRecoveryGrid (Big-11 ring grid)  ← Pulse net-new zone
//   5. OBIECTIV   — ObiectivGoalCard (5 goal pills) + ObiectivCard (target + ETA)
//                   ← set-once config, demoted below the daily reads
//   6. LOG MANUAL — NutritionInline (kcal/protein editable chips — rarely tapped)
//
// Test contract preserved: heading + tagline + all testids (cta-log-weight,
// cta-body-data, last-weight-card, last-body-card, alerts-banner, alerte-azi-label,
// fatigue-bmr-grid) + ORDER (alerts-banner above cta-log-weight, intra-zone).
// Wrapping containers keep data-testid="progres-zone-*" for smoke selectors.

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Ruler, History, LineChart } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { NutritionInline } from '../../../components/NutritionInline';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { ProjectionStrip } from '../../../components/Progres/ProjectionStrip';
import { FatigueStrip } from '../../../components/Progres/FatigueStrip';
import { BMRStrip } from '../../../components/Progres/BMRStrip';
import { BodyFatStrip } from '../../../components/Progres/BodyFatStrip';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { MuscleRecoveryGrid } from '../../../components/Progres/MuscleRecoveryGrid';
import { ObiectivCard } from '../../../components/Progres/ObiectivCard';
import { ObiectivGoalCard } from '../../../components/Progres/ObiectivGoalCard';
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
  const bodyData = useProgresStore((s) => s.bodyData);

  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCoachToday().then((c) => {
      if (!cancelled) setCoach(c);
    });
    return () => { cancelled = true; };
  }, []);

  const lastWeight = weightLog[weightLog.length - 1];
  const lastBody = bodyData[bodyData.length - 1];
  const alerts = coach?.alerts ?? [];

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
    <section className="p-6 bg-paper min-h-screen" data-testid="progres-home">
      {/* Pulse header (interfata-noua/screens-tabs.jsx:13-16): display wordmark +
          italic serif tagline. Keeps the existing i18n keys + testid contract. */}
      <h1 className="font-display text-3xl font-bold text-ink mb-0.5">{t('tabs.progres.title')}</h1>
      <p className="font-serif italic text-sm text-ink2 mb-2">{t('tabs.progres.subtitle')}</p>

      {/* ── ZONE 1: AZI — today's calibrated targets, kcal HERO leads. ───────
          Daniel 2026-05-28 "kcal recomandate sus": the recommended kcal+protein
          is the single most actionable number on this screen, so it leads. The
          TDEEStrip itself owns the hero treatment (big count-up number + depth);
          then the 2-col Fatigue|BMR grid (mockup L1717 parity), then BodyFat. */}
      <div data-testid="progres-zone-azi" className="animate-card-rise delay-0">
        <ZoneHeading testId="progres-zone-azi-heading">{t('progres.zone.azi')}</ZoneHeading>
        <TDEEStrip />
        {/* §F-pass2-fatiguestrip-02 (HIGH-EPSILON 2026-05-22) — 2-col grid
            Oboseala + Calorii baza BMR per mockup L1717. Daniel LOCKED V1
            "single number NU visual bar" preserved per-strip layout. */}
        <div className="grid grid-cols-2 gap-2" data-testid="fatigue-bmr-grid">
          <FatigueStrip />
          <BMRStrip />
        </div>
        {/* BUG #12b — bf% estimat surfat pe Progres (pana acum doar in
            SettingsProfile). Two-tier US-Navy/Deurenberg cu caveat "estimat". */}
        <BodyFatStrip />
      </div>

      {/* ── ZONE 2: TENDINTA — direction over time. ─────────────────────────
          Projection ("if you continue at this rate, in 3 weeks you'll be X")
          + 7-day weight snapshot chart. Together they answer "where am I
          going?" — the natural next question after "what's my target today?". */}
      <div data-testid="progres-zone-tendinta" className="animate-card-rise delay-75">
        <ZoneHeading testId="progres-zone-tendinta-heading">{t('progres.zone.tendinta')}</ZoneHeading>
        {/* Pulse TREND card (interfata-noua/screens-tabs.jsx:52-68) — the shared
            Sparkline primitive draws the smooth weight line over the full log.
            Renders only when there are >=2 points (Sparkline self-guards to null),
            so a fresh user sees the precise HeatMapWeekly snapshot below instead
            of an empty chart. The delta pill mirrors HeatMapWeekly's number. */}
        {sparkData.length >= 2 && (
          <div
            data-testid="progres-trend-sparkline"
            className="pulse-card pulse-card-glow p-4 mb-4"
            style={{ ['--wash' as string]: 'var(--aqua)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <Kicker color="var(--aqua)">{t('progres.weight.snapshotTitle')}</Kicker>
              {trendDelta !== null && (
                <Pill color={trendDelta <= 0 ? 'var(--volt)' : 'var(--ember)'}>
                  {trendDelta > 0 ? '+' : ''}{trendDelta} kg
                </Pill>
              )}
            </div>
            <Sparkline data={sparkData} color="var(--aqua)" />
          </div>
        )}
        {/* Piesa 4 — Preconizare forward projection (traiectorie curenta). */}
        <ProjectionStrip />
        <HeatMapWeekly />
      </div>

      {/* ── ZONE 3: ACTIUNI — alerts + log/measure CTAs + last-entry recap. ─
          Alerts banner heads the zone (urgent items first). Then CTAs to log
          weight + view trend + open body measurements, each followed by its
          "last entry" recap card so the user gets context before deciding to
          re-log. Test contract preserved: alerts-banner is BEFORE cta-log-weight
          (document order assertion in Progres.test.tsx L161). */}
      <div data-testid="progres-zone-actiuni" className="animate-card-rise delay-150">
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
        {lastWeight && (
          <button
            type="button"
            onClick={() => navigate(gotoPath('weight-log-list'))}
            data-testid="last-weight-card"
            className="pulse-card pulse-card-tight w-full text-left p-4 mb-4 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">{t('progres.lastWeighIn')}</p>
              <p className="text-2xl font-bold text-ink mt-1 font-mono">{lastWeight.kg} kg</p>
              <p className="text-sm text-ink2">{lastWeight.date}</p>
            </div>
            <History className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
          </button>
        )}
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
        <button
          type="button"
          onClick={() => navigate(gotoPath('body-data'))}
          data-testid="cta-body-data"
          className="btn-secondary-lift w-full flex items-center gap-3 p-4 mb-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-base font-semibold"
        >
          <Ruler className="w-5 h-5" aria-hidden="true" />
          {t('progres.bodyMeasurements')}
        </button>
        {lastBody && (
          <div className="pulse-card pulse-card-tight p-4 mb-4" data-testid="last-body-card">
            <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">{t('progres.lastMeasurement')}</p>
            <p className="text-sm text-ink2 mt-1">{lastBody.date}</p>
            <div className="text-sm text-ink mt-1 flex flex-wrap gap-3">
              {lastBody.waistCm !== undefined && <span>{t('progres.measurements.waist')} {lastBody.waistCm} cm</span>}
              {lastBody.chestCm !== undefined && <span>{t('progres.measurements.chest')} {lastBody.chestCm} cm</span>}
              {lastBody.hipsCm !== undefined && <span>{t('progres.measurements.hips')} {lastBody.hipsCm} cm</span>}
              {lastBody.bicepsCm !== undefined && <span>{t('progres.measurements.biceps')} {lastBody.bicepsCm} cm</span>}
              {lastBody.thighCm !== undefined && <span>{t('progres.measurements.thigh')} {lastBody.thighCm} cm</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── ZONE 4: RECUPERARE — Big-11 muscle recovery ring grid. ───────────
          Pulse net-new zone (interfata-noua/screens-tabs.jsx:86-100): the
          recovery engine (getRecoveryByGroup) finally gets surfaced as a grid
          of small rings, one per muscle group, colored by recovery state. The
          grid self-hides when the engine returns nothing (T0 fresh user). */}
      <div data-testid="progres-zone-recovery" className="animate-card-rise delay-225">
        <ZoneHeading testId="progres-zone-recovery-heading">{t('progres.zone.recuperare')}</ZoneHeading>
        <MuscleRecoveryGrid />
      </div>

      {/* ── ZONE 5: OBIECTIV — goal selector + target weight + ETA. ──────────
          Demoted below the daily reads (Daniel 2026-05-28): the goal type
          (Auto/Strength/…) and target weight are a set-once choice, not a daily
          glance — so they sit under the actionable kcal/trend/actions. Goal
          selector + ObiectivCard stay co-located ("both are your objective"). */}
      <div data-testid="progres-zone-obiectiv" className="animate-card-rise delay-300">
        <ZoneHeading testId="progres-zone-obiectiv-heading">{t('progres.zone.obiectiv')}</ZoneHeading>
        {/* §obiectiv-relocate 2026-05-28 Daniel verbatim "muta aia cu Obiectiv de
            la Coach la progres ... alea de faze auto, forta slabire mentenanta
            longevitate". Goal selector lives here aproape de ObiectivCard (target-
            weight + ETA) — ambele sunt "obiectivul tau", logical co-location. */}
        <ObiectivGoalCard />
        {/* §obiectiv-tinta 2026-05-28 Daniel verbatim — Obiectiv tinta moved here
            from Cont > Profil si tinte. Co-located with the goal selector. */}
        <ObiectivCard />
      </div>

      {/* ── ZONE 6: LOG MANUAL — rarely tapped, defer to bottom. ────────────
          Manual kcal/protein log chips. The engine auto-targets above (AZI
          zone) are the primary surface; manual log is an optional calibration
          tap. Bottom placement = lowest priority in F-pattern scan. */}
      <div data-testid="progres-zone-log" className="animate-card-rise delay-375">
        <ZoneHeading testId="progres-zone-log-heading">{t('progres.zone.logManual')}</ZoneHeading>
        <NutritionInline />
      </div>
    </section>
  );
}
