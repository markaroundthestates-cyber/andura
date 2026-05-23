// ══ LOGOUT CONFIRM — D047 RIP-OUT drill-down screen (mockup #screen-confirm-logout) ══
// Per mockup andura-clasic.html L2310-2323. Drill-down paradigm Bugatti
// consistency per D047 LOCKED V1 (REVERSE D046 §3.1 mis-interpretation).
//
// §A007 security pattern preserved — authSignOut() clears firebase-* tokens
// pe success path (anti ProtectedRoute revert).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { signOut as authSignOut } from '../../../../auth.js';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

export function LogoutConfirm(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  function handleConfirm(): void {
    // §A007 audit fix preserved — clear firebase-* tokens before navigate.
    authSignOut();
    setAuthenticated(false);
    navigate('/auth');
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-danger'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="logout-confirm">
      <SubHeader
        title="Iesi din cont"
        onBack={handleCancel}
        testIdBack="logout-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <LogOut className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Iesi din cont?</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Datele tale raman salvate pe email. La urmatoarea intrare cu acelasi
          email le vei regasi exact unde le-ai lasat.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="logout-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            Confirma actiunea
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="logout-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
