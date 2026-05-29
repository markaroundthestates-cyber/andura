// ══ PROJECTION STRIP — Piesa 4 nutrition-brain fix ("Preconizare") ═══════
//
// Surface forward projection din traiectoria curenta (Daniel verbatim: "daca
// continui asa, in 3-4 saptamani o sa ai X greutate, Y bf"). Framing onest —
// proiectie la ritmul curent, NU promisiune. RO no-diacritics.
//
// Data via readNutritionProjection (I/O boundary) → projectTrajectory pura.
// Ascunde stripul cand nu putem proiecta (lipsa intake/TDEE/greutate) si arata
// in schimb un hint sa logheze cateva zile.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { readNutritionProjection, DEFAULT_HORIZON_DAYS } from '../../lib/nutritionProjection';
import type { ProjectionResult } from '../../lib/nutritionProjection';
import { useNutritionStore } from '../../stores/nutritionStore';
import { t } from '../../../i18n/index.js';

function fmtKg(n: number): string {
  return n.toLocaleString('ro-RO', { maximumFractionDigits: 1 }).replace(/,/g, ' ');
}

function horizonWeeksLabel(days: number): string {
  const weeks = Math.round(days / 7);
  return t('bodyComp.projectionStrip.weeksLabel', { n: weeks });
}

export function ProjectionStrip(): JSX.Element | null {
  const [proj, setProj] = useState<ProjectionResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Recompute cand intake logat se schimba (traiectoria depinde de el).
  const dailyLog = useNutritionStore((s) => s.dailyLog);

  useEffect(() => {
    let cancelled = false;
    readNutritionProjection(Date.now(), DEFAULT_HORIZON_DAYS).then((p) => {
      if (!cancelled) {
        setProj(p);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dailyLog]);

  // Inca incarcam — nu randa nimic (evita flash).
  if (!loaded) return null;

  // Nu putem proiecta (fara intake logat / TDEE / greutate) → hint logare.
  if (proj === null) {
    return (
      <section
        data-testid="projection-strip-empty"
        className="pulse-card pulse-card-tight p-4 mb-4 flex items-center gap-4"
        aria-label={t('bodyComp.projectionStrip.ariaLabel')}
      >
        <TrendingUp className="w-6 h-6 text-ink2 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
            {t('bodyComp.projectionStrip.label')}
          </p>
          <p className="text-sm text-ink2">
            {t('bodyComp.projectionStrip.emptyHint')}
          </p>
        </div>
      </section>
    );
  }

  const weeks = horizonWeeksLabel(proj.horizonDays);

  // Mentenanta — traiectorie plata.
  if (proj.direction === 'maintain') {
    return (
      <section
        data-testid="projection-strip"
        className="pulse-card pulse-card-tight p-4 mb-4 flex items-center gap-4"
        aria-label={t('bodyComp.projectionStrip.ariaLabel')}
      >
        <TrendingUp className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
            {t('bodyComp.projectionStrip.label')}
          </p>
          <p className="text-base font-semibold text-ink" data-testid="projection-maintain">
            {t('bodyComp.projectionStrip.maintain', { kg: fmtKg(proj.projectedWeightKg) })}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="projection-strip"
      className="pulse-card pulse-card-tight p-4 mb-4 flex items-center gap-4"
      aria-label={t('bodyComp.projectionStrip.ariaLabel')}
    >
      <TrendingUp className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          {t('bodyComp.projectionStrip.label')}
        </p>
        <p className="text-base font-semibold text-ink" data-testid="projection-line">
          {t('bodyComp.projectionStrip.projectedLine', { weeks })}{' '}
          <span className="font-mono">~{t('bodyComp.projectionStrip.weightSuffix', { kg: fmtKg(proj.projectedWeightKg) })}</span>
          {proj.projectedBfPct !== null && (
            <>
              {' '}
              <span className="font-mono">{t('bodyComp.projectionStrip.projectedBfSuffix', { pct: fmtKg(proj.projectedBfPct) })}</span>
            </>
          )}
          .
        </p>
        <p className="text-xs text-ink3 mt-0.5 italic" data-testid="projection-disclaimer">
          {t('bodyComp.projectionStrip.disclaimer')}
        </p>
      </div>
    </section>
  );
}
