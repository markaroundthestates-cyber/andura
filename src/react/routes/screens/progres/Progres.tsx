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

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Ruler, History, LineChart } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { NutritionInline } from '../../../components/NutritionInline';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { ProjectionStrip } from '../../../components/Progres/ProjectionStrip';
import { FatigueStrip } from '../../../components/Progres/FatigueStrip';
import { BMRStrip } from '../../../components/Progres/BMRStrip';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../lib/coachDirectorAggregate';

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

  return (
    <section className="p-6 bg-paper min-h-screen" data-testid="progres-home">
      {/* §F-pass4-fontweight-01 (LOW chat5 W17) — title font-weight 600 -> 700
          mockup andura-clasic.html#L1700 (font-weight:700). */}
      <h1 className="text-2xl font-bold text-ink mb-1">Progres</h1>
      <p className="text-sm text-ink2 mb-6">Body composition &middot; estimari calibrate.</p>
      <TDEEStrip />
      {/* Piesa 4 — Preconizare forward projection (traiectorie curenta). */}
      <ProjectionStrip />
      {/* §F-pass2-fatiguestrip-02 (HIGH-EPSILON 2026-05-22) — 2-col grid
          Oboseala + Calorii baza BMR per mockup L1717. Daniel LOCKED V1
          "single number NU visual bar" preserved per-strip layout. */}
      <div className="grid grid-cols-2 gap-2" data-testid="fatigue-bmr-grid">
        <FatigueStrip />
        <BMRStrip />
      </div>
      <HeatMapWeekly />
      {alerts.length > 0 && (
        <h2 data-testid="alerte-azi-label" className="text-xs text-ink2 uppercase tracking-wide font-semibold mt-4 mb-2">
          Alerte azi
        </h2>
      )}
      <AlertsBanner alerts={alerts} />
      <button
        type="button"
        onClick={() => navigate(gotoPath('log-weight'))}
        data-testid="cta-log-weight"
        className="w-full flex items-center gap-3 p-4 mb-3 bg-brick text-paper rounded-[14px] text-base font-semibold"
      >
        <Scale className="w-5 h-5" aria-hidden="true" />
        Logheaza greutate azi
      </button>
      {lastWeight && (
        <button
          type="button"
          onClick={() => navigate(gotoPath('weight-log-list'))}
          data-testid="last-weight-card"
          className="w-full text-left p-4 mb-4 bg-paper2 border border-line rounded-xl flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">Ultima cantarire</p>
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
          className="w-full flex items-center gap-3 p-4 mb-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-base font-semibold"
        >
          <LineChart className="w-5 h-5" aria-hidden="true" />
          Vezi trend greutate
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate(gotoPath('body-data'))}
        data-testid="cta-body-data"
        className="w-full flex items-center gap-3 p-4 mb-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-base font-semibold"
      >
        <Ruler className="w-5 h-5" aria-hidden="true" />
        Masuratori corp
      </button>
      {lastBody && (
        <div className="p-4 mb-4 bg-paper2 border border-line rounded-xl" data-testid="last-body-card">
          <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">Ultima masurare</p>
          <p className="text-sm text-ink2 mt-1">{lastBody.date}</p>
          <div className="text-sm text-ink mt-1 flex flex-wrap gap-3">
            {lastBody.waistCm !== undefined && <span>Talie {lastBody.waistCm} cm</span>}
            {lastBody.chestCm !== undefined && <span>Piept {lastBody.chestCm} cm</span>}
            {lastBody.hipsCm !== undefined && <span>Sold {lastBody.hipsCm} cm</span>}
            {lastBody.bicepsCm !== undefined && <span>Biceps {lastBody.bicepsCm} cm</span>}
            {lastBody.thighCm !== undefined && <span>Coapsa {lastBody.thighCm} cm</span>}
          </div>
        </div>
      )}
      <NutritionInline />
    </section>
  );
}
