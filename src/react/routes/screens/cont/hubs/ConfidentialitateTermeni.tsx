// ══ CONFIDENTIALITATE & TERMENI — Account hub (regroup 2026-06-12) ════════
// Merges "Politica de confidentialitate" (SettingsPrivacy) + "Termeni si
// conditii" (SettingsTerms) behind ONE 2-way segmented control
// [Confidentialitate | Termeni]. Each segment renders the EXISTING screen body
// via `embedded` — both are long scrollable legal texts and stay scrollable
// inside the hub's overflow-y-auto column. Default segment: Confidentialitate.
//
// Route-compat: new /app/cont/confidentialitate-termeni AND legacy
// /app/cont/settings-privacy, /app/cont/settings-terms render this hub with the
// matching segment preselected (defaultSeg).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../../lib/navigation';
import { SubHeader } from '../../../../components/SubHeader';
import { SettingsPrivacy } from '../SettingsPrivacy';
import { SettingsTerms } from '../SettingsTerms';
import { HubSegmented } from './HubSegmented';
import { t } from '../../../../../i18n/index.js';

type Seg = 'confidentialitate' | 'termeni';

export function ConfidentialitateTermeni({
  defaultSeg = 'confidentialitate',
}: { defaultSeg?: Seg } = {}): JSX.Element {
  const navigate = useNavigate();
  const [seg, setSeg] = useState<Seg>(defaultSeg);

  return (
    <section className="min-h-screen flex flex-col" data-testid="cont-hub-confidentialitate-termeni">
      <SubHeader
        title={t('cont.hubs.confidentialitateTermeni.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="cont-hub-confidentialitate-termeni-back"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          <HubSegmented<Seg>
            segments={[
              { key: 'confidentialitate', label: t('cont.hubs.confidentialitateTermeni.segConfidentialitate') },
              { key: 'termeni', label: t('cont.hubs.confidentialitateTermeni.segTermeni') },
            ]}
            active={seg}
            onChange={setSeg}
            ariaLabel={t('cont.hubs.confidentialitateTermeni.segAria')}
            testIdPrefix="cont-hub-confidentialitate-termeni-seg"
          />
        </div>
        {seg === 'confidentialitate' ? <SettingsPrivacy embedded /> : <SettingsTerms embedded />}
      </div>
    </section>
  );
}
