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
  // Reverse-chrono — newest first
  const sorted = [...weightLog].sort((a, b) => b.ts - a.ts);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="weight-log-list">
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
          <ul className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
            {sorted.map((entry, idx) => (
              <li
                key={`${entry.date}-${entry.ts}`}
                data-testid={`weight-log-row-${idx}`}
                className={`flex justify-between items-center px-4 py-3 ${
                  idx < sorted.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <span className="text-sm font-medium text-ink">{formatDate(entry.date)}</span>
                <span className="text-sm text-ink2 font-mono">
                  {entry.kg.toFixed(1)} kg
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
