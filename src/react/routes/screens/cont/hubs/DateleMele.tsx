// ══ DATELE MELE — Account hub (regroup 2026-06-12) ════════════════════════
// Merges "Descarca datele tale" (SettingsExport) + "Importa istoric"
// (SettingsImport) behind ONE 2-way segmented control [Export | Import]. Each
// segment renders the EXISTING screen body via `embedded` (internals + testids
// intact). Default segment: Export.
//
// Route-compat: new /app/cont/datele-mele AND legacy /app/cont/settings-export,
// /app/cont/settings-import render this hub with the matching segment
// preselected (defaultSeg), so deep-links land on the grouped view.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../../lib/navigation';
import { SubHeader } from '../../../../components/SubHeader';
import { SettingsExport } from '../SettingsExport';
import { SettingsImport } from '../SettingsImport';
import { HubSegmented } from './HubSegmented';
import { t } from '../../../../../i18n/index.js';

type Seg = 'export' | 'import';

export function DateleMele({ defaultSeg = 'export' }: { defaultSeg?: Seg } = {}): JSX.Element {
  const navigate = useNavigate();
  const [seg, setSeg] = useState<Seg>(defaultSeg);

  return (
    <section className="min-h-screen flex flex-col" data-testid="cont-hub-datele-mele">
      <SubHeader
        title={t('cont.hubs.dateleMele.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="cont-hub-datele-mele-back"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          <HubSegmented<Seg>
            segments={[
              { key: 'export', label: t('cont.hubs.dateleMele.segExport') },
              { key: 'import', label: t('cont.hubs.dateleMele.segImport') },
            ]}
            active={seg}
            onChange={setSeg}
            ariaLabel={t('cont.hubs.dateleMele.segAria')}
            testIdPrefix="cont-hub-datele-mele-seg"
          />
        </div>
        {seg === 'export' ? <SettingsExport embedded /> : <SettingsImport embedded />}
      </div>
    </section>
  );
}
