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

const MONTH_RO_SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function formatDateRO(iso: string): string {
  // iso: "2026-05-21" → "21 mai"
  const parts = iso.split('-');
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return iso;
  const monthIdx = Number(m) - 1;
  if (monthIdx < 0 || monthIdx > 11) return iso;
  const monthLabel = MONTH_RO_SHORT[monthIdx];
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
        title="Loguri greutate"
        onBack={() => navigate(gotoPath('progres'))}
        testIdBack="weight-log-list-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-xs text-ink2 mb-4 leading-relaxed">
          Toate inregistrarile de greutate din istoricul tau.
        </p>

        {sorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-testid="weight-log-empty"
          >
            <Scale className="w-12 h-12 text-ink2 mb-3" aria-hidden="true" />
            <p className="text-sm text-ink2 max-w-xs">
              Nu ai inregistrari de greutate inca. Logheaza prima ta cantarire din ecranul Progres.
            </p>
          </div>
        ) : (
          <ul className="bg-paper2 border border-line rounded-xl overflow-hidden">
            {sorted.map((entry, idx) => (
              <li
                key={`${entry.date}-${entry.ts}`}
                data-testid={`weight-log-row-${idx}`}
                className={`flex justify-between items-center px-4 py-3 ${
                  idx < sorted.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <span className="text-sm font-medium text-ink">{formatDateRO(entry.date)}</span>
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
