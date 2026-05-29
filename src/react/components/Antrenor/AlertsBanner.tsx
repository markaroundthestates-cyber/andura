// ══ ALERTS BANNER — Phase 6 task_06 Option B UI ══════════════════════════
// Renders ProactiveAlert[] din coachDirectorAggregate.alerts. Severity 3-tier
// (urgent/warn/info) wraps runProactiveChecks output via task_05
// getProactiveAlerts. NO_DIACRITICS_RULE preserved (engine emits RO copy).

import type { JSX } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { ProactiveAlert } from '../../lib/engineWrappers';

interface AlertsBannerProps {
  alerts: readonly ProactiveAlert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps): JSX.Element | null {
  if (alerts.length === 0) return null;
  return (
    <div data-testid="alerts-banner" className="flex flex-col gap-2 mb-4">
      {alerts.map((a) => (
        <div
          key={a.id}
          data-alert-id={a.id}
          data-severity={a.severity}
          role={a.severity === 'urgent' ? 'alert' : 'status'}
          aria-live={a.severity === 'urgent' ? 'assertive' : 'polite'}
          className="flex items-start gap-2.5 p-3 rounded-xl border"
          style={
            a.severity === 'urgent'
              ? { background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-border)' }
              : a.severity === 'warn'
              ? { background: 'var(--status-neutral-bg)', borderColor: 'var(--status-neutral-border)' }
              : { background: 'var(--surface-2)', borderColor: 'var(--line)' }
          }
        >
          {a.severity === 'urgent' || a.severity === 'warn' ? (
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink2" aria-hidden="true" />
          )}
          <p className="text-sm text-ink leading-snug">{a.text}</p>
        </div>
      ))}
    </div>
  );
}
