// ══ EXERCITII & ECHIPAMENT — Account hub (regroup 2026-06-12) ═════════════
// Merges two former Account rows — "Biblioteca de exercitii" (ExerciseLibrary)
// + "Aparate lipsa" (AparateLipsa) — behind ONE 2-way segmented control
// [Biblioteca | Echipament lipsa]. Each segment renders the EXISTING screen
// body via its `embedded` prop (internals untouched, testids intact). Default
// segment: Biblioteca.
//
// Route-compat: reachable at the new /app/cont/exercitii-echipament AND at the
// two legacy paths (/app/cont/exercise-library, /app/cont/aparate-lipsa) which
// render this hub with the matching segment preselected via `defaultSeg`, so
// deep-links + tutorial anchors land on the grouped view with the right tab.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../../lib/navigation';
import { SubHeader } from '../../../../components/SubHeader';
import { ExerciseLibrary } from '../ExerciseLibrary';
import { AparateLipsa } from '../../antrenor/AparateLipsa';
import { HubSegmented } from './HubSegmented';
import { t } from '../../../../../i18n/index.js';

type Seg = 'biblioteca' | 'echipament';

export function ExercitiiEchipament({ defaultSeg = 'biblioteca' }: { defaultSeg?: Seg } = {}): JSX.Element {
  const navigate = useNavigate();
  const [seg, setSeg] = useState<Seg>(defaultSeg);

  return (
    <section className="min-h-screen flex flex-col" data-testid="cont-hub-exercitii-echipament">
      <SubHeader
        title={t('cont.hubs.exercitiiEchipament.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="cont-hub-exercitii-echipament-back"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          <HubSegmented<Seg>
            segments={[
              { key: 'biblioteca', label: t('cont.hubs.exercitiiEchipament.segBiblioteca') },
              { key: 'echipament', label: t('cont.hubs.exercitiiEchipament.segEchipament') },
            ]}
            active={seg}
            onChange={setSeg}
            ariaLabel={t('cont.hubs.exercitiiEchipament.segAria')}
            testIdPrefix="cont-hub-exercitii-echipament-seg"
          />
        </div>
        {seg === 'biblioteca' ? <ExerciseLibrary embedded /> : <AparateLipsa embedded />}
      </div>
    </section>
  );
}
