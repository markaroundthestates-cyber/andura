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
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-038 Smart Routing Equipment v2 cascade
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';

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

  return (
    <section className="p-6 bg-paper" data-testid="equipment-swap">
      <h1 className="text-2xl font-semibold text-ink mb-2">Aparate ocupate?</h1>
      <p className="text-base text-ink2 mb-6">
        Marcheaza ce e ocupat. Coach gaseste alternative.
      </p>
      <div className="flex flex-col gap-2 mb-6" role="list" aria-label="Echipamente">
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
                  : 'flex items-center justify-between p-4 rounded-xl border bg-paper2 border-[var(--line-strong)]'
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
        className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        Continui adaptat
      </button>
    </section>
  );
}
