// ══ AJUTOR & DESPRE — Account hub (regroup 2026-06-12) ════════════════════
// Merges three short former Account rows — FAQ (SettingsFaq accordion), Suport
// (SettingsSupport contact), Despre (SettingsAbout version/about) — into ONE
// STACKED screen (no segments; the sections are short, so stacking reads better
// than tabs per founder spec). Each section renders the EXISTING screen body
// via `embedded` (internals + testids intact), top-to-bottom: FAQ → Suport →
// Despre.
//
// Route-compat: new /app/cont/ajutor-despre AND legacy /app/cont/settings-faq,
// /app/cont/settings-support, /app/cont/settings-about all render this hub.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../../lib/navigation';
import { SubHeader } from '../../../../components/SubHeader';
import { SettingsFaq } from '../SettingsFaq';
import { SettingsSupport } from '../SettingsSupport';
import { SettingsAbout } from '../SettingsAbout';
import { t } from '../../../../../i18n/index.js';

export function AjutorDespre(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col" data-testid="cont-hub-ajutor-despre">
      <SubHeader
        title={t('cont.hubs.ajutorDespre.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="cont-hub-ajutor-despre-back"
      />
      <div className="flex-1 overflow-y-auto pb-[var(--app-bottom-chrome)]">
        <SettingsFaq embedded />
        <SettingsSupport embedded />
        <SettingsAbout embedded />
      </div>
    </section>
  );
}
