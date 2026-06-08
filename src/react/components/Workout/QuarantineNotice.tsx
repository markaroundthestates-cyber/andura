// ══ #65 OUTLIER QUARANTINE SURFACE — gentle indicator + one-tap revert ══════
// The outlier detector (#65, dp_log_outlier_v1) quarantines an implausible set:
// it STAYS in the log verbatim, only its LEARNING contribution is suppressed
// (logQuarantine.js ledger). The revert path (unquarantineSet) was engine-done
// but UNPLACED — the user had no way to say "that was real". This is that
// surface: for the CURRENT exercise, any quarantined set shows ONE calm, no-
// guilt note + a one-tap "that was real" that un-quarantines it (the next
// posterior fold re-includes it via dp.js's isQuarantined gate). Reuses the
// existing anomalyGuard.quarantine* i18n keys. Empty ledger → renders nothing
// (the common case: nothing is ever quarantined unless the flag fired).

import type { JSX } from 'react';
import { useState } from 'react';
import { ShieldQuestion } from 'lucide-react';
import { getQuarantine, unquarantineSet } from '../../../engine/dp/logQuarantine.js';
import { toast } from '../../lib/toast';
import { t } from '../../../i18n/index.js';

interface QuarantineNoticeProps {
  // EN canonical engine name — the SAME key the ledger + posterior use.
  engineName: string;
}

export function QuarantineNotice({ engineName }: QuarantineNoticeProps): JSX.Element | null {
  // Local re-read trigger: a revert mutates the ledger (DB), not React state, so
  // bump a tick to drop the reverted entry from the list without a full remount.
  const [tick, setTick] = useState(0);
  const entries = engineName ? getQuarantine(engineName) : [];
  void tick; // entries are re-derived each render; tick forces that re-derive.

  if (entries.length === 0) return null;

  function handleRevert(ts: number): void {
    unquarantineSet(engineName, ts);
    toast.show({ message: t('anomalyGuard.quarantineRevertToast'), variant: 'success' });
    setTick((n) => n + 1);
  }

  return (
    <div className="mb-4 flex flex-col gap-2" data-testid="quarantine-notice">
      {entries.map((e) => (
        <div
          key={e.ts}
          className="pulse-card pulse-card-tight p-3 flex items-start gap-2.5"
          data-testid={`quarantine-entry-${e.ts}`}
        >
          <ShieldQuestion className="w-4 h-4 text-ink2 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-xs text-ink2 leading-snug">
              {t('anomalyGuard.quarantineNote', { value: e.w })}
            </p>
            <button
              type="button"
              onClick={() => handleRevert(e.ts)}
              data-testid={`quarantine-revert-${e.ts}`}
              className="press-feedback mt-2 text-xs font-semibold text-brick"
            >
              {t('anomalyGuard.quarantineRevertCta')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
