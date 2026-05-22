// ══ PROGRES — Tab 2 of 4 Phase 4 task_16 Landing ═════════════════════════
// Phase 4 MVP scope (Karpathy §4 simplicity): 2 CTAs → log-weight / body-data
// sub-screens + simple list view recent entries. Phase 5+ adds full mockup
// dashboard (TDEE / fatigue / BMR strip / 7-day weight chart / alerts /
// nutrition plan etc.) per mockup andura-clasic.html#L1698+.
//
// Romanian no-diacritics rule preserved.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Ruler, History } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { NutritionInline } from '../../../components/NutritionInline';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { FatigueStrip } from '../../../components/Progres/FatigueStrip';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';

export function Progres(): JSX.Element {
  const navigate = useNavigate();
  const weightLog = useProgresStore((s) => s.weightLog);
  const bodyData = useProgresStore((s) => s.bodyData);

  const lastWeight = weightLog[weightLog.length - 1];
  const lastBody = bodyData[bodyData.length - 1];

  return (
    <section
      className="p-6 bg-paper min-h-screen"
      data-testid="progres-home"
    >
      <h1 className="text-2xl font-semibold text-ink mb-1">Progres</h1>
      <p className="text-sm text-ink2 mb-6">Logheaza periodic - estimari calibrate.</p>

      {/* Phase 6 task_22 dashboard strips */}
      <TDEEStrip />
      <FatigueStrip />
      <HeatMapWeekly />

      {/* Log weight CTA */}
      <button
        type="button"
        onClick={() => navigate(gotoPath('log-weight'))}
        data-testid="cta-log-weight"
        className="w-full flex items-center gap-3 p-4 mb-3 bg-brick text-paper rounded-xl text-base font-semibold"
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
            <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
              Ultima cantarire
            </p>
            <p className="text-2xl font-bold text-ink mt-1 font-mono">
              {lastWeight.kg} kg
            </p>
            <p className="text-sm text-ink2">{lastWeight.date}</p>
          </div>
          <History className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
        </button>
      )}

      {/* Body data CTA */}
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
        <div
          className="p-4 mb-4 bg-paper2 border border-line rounded-xl"
          data-testid="last-body-card"
        >
          <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
            Ultima masurare
          </p>
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
