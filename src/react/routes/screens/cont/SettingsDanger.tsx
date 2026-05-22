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

export function SettingsDanger(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-danger">
      <SubHeader
        title="Deconectare & stergere"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-danger-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* §F-pass2-settings-danger-01 HIGH-BETA chat 4 — cream warning banner cu
            alert-triangle + safety messaging. Mockup andura-clasic.html L2104-2107
            verbatim copy: "Actiunile de mai jos afecteaza contul tau. Citeste cu
            atentie pe pagina de confirmare inainte sa le executi." */}
        <div
          data-testid="danger-warning-banner"
          role="status"
          className="flex items-start gap-3 p-3.5 rounded-2xl border mb-4"
          style={{
            background: 'var(--status-danger-bg, #fdeeea)',
            borderColor: 'var(--status-danger-border, #f0d5cf)',
          }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-brick" aria-hidden="true" />
          <p className="text-sm text-ink2 leading-snug m-0">
            Actiunile de mai jos afecteaza contul tau. Citeste cu atentie pe
            pagina de confirmare inainte sa le executi.
          </p>
        </div>

        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => navigate(gotoPath('logout-confirm'))}
            data-testid="danger-logout"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Iesi din cont</p>
              <p className="text-xs text-ink2">Datele raman pe telefon.</p>
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
              <p className="text-sm font-medium">Reseteaza toate datele</p>
              <p className="text-xs text-ink2">Sterge tot din telefon. Cont pastrat.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(gotoPath('delete-account-confirm'))}
            data-testid="danger-delete"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-brick"
          >
            <Trash2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sterge cont</p>
              <p className="text-xs text-ink2">Datele + cont sterse permanent.</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-ink2 leading-snug">
          §B039/D-6 GDPR Art. 17: la &quot;Sterge cont&quot;, datele locale +
          backup Firebase RTDB se sterg automat (best-effort, propagare
          server &lt;5 min).
        </p>
      </div>
    </section>
  );
}
