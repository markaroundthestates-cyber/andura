// ══ SETTINGS DANGER — Phase 6 task_17 Cont Sub-Screen ════════════════════
// §D047 RIP-OUT Stage 2 (2026-05-21 morning) — replaced ConfirmModal modal
// paradigm cu uniform drill-down screens per Daniel CEO LOCKED V1 +
// mockup andura-clasic.html parity. ConfirmModal A003 deleted, 3 drill-down
// screens NEW (LogoutConfirm + DeleteAccountConfirm + ResetDataConfirm)
// handle actions. SettingsDanger acum = simple list page navigating drill-down.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

export function SettingsDanger(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col" data-testid="settings-danger">
      <SubHeader
        title={t('settings.danger.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-danger-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* §F-pass2-settings-danger-01 HIGH-BETA chat 4 — cream warning banner cu
            alert-triangle + safety messaging. Mockup andura-clasic.html L2104-2107. */}
        <div
          data-testid="danger-warning-banner"
          role="status"
          className="flex items-start gap-3 p-3.5 rounded-2xl border mb-4"
          style={{
            background: 'var(--status-danger-bg)',
            borderColor: 'var(--status-danger-border)',
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--status-danger-text)' }}
            aria-hidden="true"
          />
          <p className="text-sm leading-snug m-0" style={{ color: 'var(--status-danger-text)' }}>
            {t('settings.danger.warningBanner')}
          </p>
        </div>

        <div className="pulse-card pulse-card-tight overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => navigate(gotoPath('logout-confirm'))}
            data-testid="danger-logout"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.danger.logoutRowTitle')}</p>
              <p className="text-xs text-ink2">{t('settings.danger.logoutRowSub')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(gotoPath('reset-data-confirm'))}
            data-testid="danger-reset"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.danger.resetRowTitle')}</p>
              <p className="text-xs text-ink2">{t('settings.danger.resetRowSub')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(gotoPath('delete-account-confirm'))}
            data-testid="danger-delete"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-brickdark"
          >
            <Trash2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.danger.deleteRowTitle')}</p>
              {/* U-06 audit fix (AUDIT-2 §U-06 HIGH) — removed the "30 zile
                  gratie pentru recuperare" sub-text: it was a false promise.
                  The React delete flow (DeleteAccountConfirm) does an immediate
                  hard wipe. Copy matches reality = immediate irreversible deletion. */}
              <p className="text-xs text-ink2">{t('settings.danger.deleteRowSub')}</p>
            </div>
          </button>
        </div>

        {/* U-07 audit fix (AUDIT-2 §U-07 MED) — removed internal decision ID
            prefix "§B039/D-6 " that leaked into user-facing copy. */}
        <p className="text-xs text-ink2 leading-snug">
          {t('settings.danger.gdprFooter')}
        </p>
      </div>
    </section>
  );
}
