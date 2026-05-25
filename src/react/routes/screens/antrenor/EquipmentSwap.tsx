// ══ EQUIPMENT SWAP — Phase 3 task_07 §A Rewrite Stub → Real ═════════════
// Per spec §2 A equipment toggle list pentru busy/available status. Smart
// Routing Equipment v2 cascade per D-LEGACY-038 — Phase 3 stub placeholder
// "Coach gaseste alternative"; Phase 4+ wires engine cascade (ordered
// alternatives + sequence reordering) la workout-preview consumer.
//
// Lista echipamente curente sesiune — Phase 3 hardcoded demo (Phase 5+ wire
// real via engineWrappers.getTodayWorkout când scheduleAdapter aggregate
// disponibil).
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L1027 sub-header
// verbatim title "Schimba echipament" sticky top + back-btn. Body h1
// 'Aparate ocupate?' regresat h2 (single h1 SubHeader pattern parity
// CevaNuMerge/EnergyCause/PainButton/AparateLipsa).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-038 Smart Routing Equipment v2 cascade
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L1026-1041 screen-equipment-swap

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

export type EquipmentStatus = 'available' | 'busy';

export interface EquipmentItem {
  id: string;
  name: string;
  status: EquipmentStatus;
}

const INITIAL_EQUIPMENT: readonly EquipmentItem[] = [
  { id: 'bench', name: 'Bench press', status: 'available' },
  { id: 'smith', name: 'Smith machine', status: 'available' },
  { id: 'lat-pulldown', name: 'Lat pulldown', status: 'available' },
  { id: 'cable-row', name: 'Cable row', status: 'available' },
  { id: 'leg-press', name: 'Leg press', status: 'available' },
];

export function EquipmentSwap(): JSX.Element {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<readonly EquipmentItem[]>(INITIAL_EQUIPMENT);

  function toggleStatus(id: string): void {
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === 'available' ? 'busy' : 'available' }
          : e
      )
    );
  }

  function handleContinue(): void {
    const busy = equipment.filter((e) => e.status === 'busy').map((e) => e.id);
    navigate(gotoPath('workout-preview'), {
      state: { equipmentContext: { busy } },
    });
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="equipment-swap">
      <SubHeader
        title="Schimba echipament"
        onBack={handleBack}
        testIdBack="equipment-swap-back"
      />
      <div className="p-6 flex-1">
      <h2 className="text-2xl font-bold text-ink mb-2">Aparate ocupate?</h2>
      <p className="text-base text-ink2 mb-6">
        Marcheaza ce e ocupat. Coach gaseste alternative.
      </p>
      {/* No role="list": children are <button>s (not valid role="listitem"),
          which makes a screen reader announce an empty list. The "Aparate
          ocupate?" heading already labels the group (parity §6-M3 revert). */}
      <div className="flex flex-col gap-2 mb-6">
        {equipment.map((e) => {
          const isBusy = e.status === 'busy';
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => toggleStatus(e.id)}
              data-equipment-id={e.id}
              data-status={e.status}
              aria-pressed={isBusy}
              className={
                isBusy
                  ? 'flex items-center justify-between p-4 rounded-xl border bg-brick/10 border-brick'
                  : 'flex items-center justify-between p-4 rounded-xl border bg-paper2 border-lineStrong'
              }
            >
              <span className="text-base font-medium text-ink">{e.name}</span>
              <span
                className={
                  isBusy
                    ? 'text-sm font-semibold text-brick'
                    : 'text-sm font-semibold text-ink2'
                }
              >
                {isBusy ? 'Ocupat' : 'Liber'}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleContinue}
        data-testid="equipment-continue"
        className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
      >
        Continui adaptat
      </button>
      </div>
    </section>
  );
}
