// ══ WEIGHT LOG LIST — Loguri greutate full list ═══════════════════════════
// Per mockup andura-clasic.html#screen-loguri-greutate. Lists all weight
// entries from progresStore reverse-chrono. Read-only history view.
// Edit/delete deferred post-Beta.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t, getCurrentLocale } from '../../../../i18n/index.js';

// Month abbreviations per locale. RO no-diacritics matches Istoric.tsx +
// IstoricDetail.tsx ('noi' nu 'nov') pentru cross-screen consistency —
// D-LEGACY-064 + mockup parity convention. EN uses standard fitness short
// month names (parity with months.short in en.json).
const MONTH_RO_SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
const MONTH_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  // iso: "2026-05-21" → "21 mai" (RO) / "21 May" (EN)
  const parts = iso.split('-');
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return iso;
  const monthIdx = Number(m) - 1;
  if (monthIdx < 0 || monthIdx > 11) return iso;
  const months = getCurrentLocale() === 'en' ? MONTH_EN_SHORT : MONTH_RO_SHORT;
  const monthLabel = months[monthIdx];
  return `${Number(d)} ${monthLabel}`;
}

export function WeightLogList(): JSX.Element {
  const navigate = useNavigate();
  const weightLog = useProgresStore((s) => s.weightLog);
  // Reverse-chrono — newest first BY DATE (YYYY-MM-DD) with `ts` tiebreaker.
  // ts-ordering surfaced a back-dated weigh-in (newest `ts`, older `date`) as the
  // highlighted latest row; date-ordering matches getCurrentWeightKg + Progres +
  // WeightTimeline. `ts` has mixed semantics (live=Date.now() vs imported=Date.UTC).
  const sorted = [...weightLog].sort((a, b) => {
    const dateCmp = (b.date ?? '').localeCompare(a.date ?? '');
    if (dateCmp !== 0) return dateCmp;
    return (b.ts ?? 0) - (a.ts ?? 0);
  });

  return (
    <section className="min-h-screen flex flex-col" data-testid="weight-log-list">
      <SubHeader
        title={t('progres.weightLogList.title')}
        onBack={() => navigate(gotoPath('progres'))}
        testIdBack="weight-log-list-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-xs text-ink2 mb-4 leading-relaxed">
          {t('progres.weightLogList.intro')}
        </p>

        {sorted.length === 0 ? (
          /* UX polish 2026-05-28 — accent-tinted icon halo + heading + softer
             body copy, parity Istoric empty state. Two-line voice instead of
             flat single sentence. */
          <div
            className="flex flex-col items-center justify-center py-12 text-center animate-card-rise"
            data-testid="weight-log-empty"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklab, var(--brick) 18%, transparent), transparent 70%)',
              }}
            >
              <Scale className="w-7 h-7 text-brick" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-ink mb-1">
              {t('progres.weightLogList.emptyTitle')}
            </p>
            <p className="text-sm text-ink2 max-w-[280px]">
              {t('progres.weightLogList.emptyBody')}
            </p>
          </div>
        ) : (
          <>
            <ul className="pulse-card pulse-card-tight overflow-hidden">
              {sorted.map((entry, idx) => (
                <li
                  key={`${entry.date}-${entry.ts}`}
                  data-testid={`weight-log-row-${idx}`}
                  className={`flex justify-between items-center px-4 py-3.5 ${
                    idx < sorted.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-ink">{formatDate(entry.date)}</span>
                  {/* Latest weigh-in reads in aqua (mockup L808); older rows mute. */}
                  <span
                    className={`text-sm font-mono tabular-nums ${idx === 0 ? 'text-[var(--aqua-ink)]' : 'text-ink2'}`}
                  >
                    {entry.kg.toFixed(1)} kg
                  </span>
                </li>
              ))}
            </ul>
            {/* Distinct-from-trend footnote (mockup L814) — this is the raw list,
                WeightTimeline is the chart. */}
            <p className="text-[11px] text-ink3 mt-3.5 text-center">
              {t('progres.weightLogList.distinctNote')}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
