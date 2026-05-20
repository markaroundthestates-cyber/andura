// ══ APARATE LIPSA — Phase 3 task_07 §B Rewrite Stub → Real ═══════════════
// Per spec §2 B missing equipment Set toggle pentru exercitii ce necesita
// echipament absent permanent (home gym, sala mica). Different de
// EquipmentSwap (ocupat temporar) — aici permanent setting per user.
//
// Phase 3 propagates `missingEquipment` array via location.state. Phase 4+
// wires la userSettings store persist (durable across sessions, coach NU mai
// recomanda exercitii pe aceste items).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-038 Smart Routing Equipment v2 cascade
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';

interface EquipmentCategory {
  id: string;
  label: string;
  items: readonly string[];
}

const EQUIPMENT_CATEGORIES: readonly EquipmentCategory[] = [
  {
    id: 'free-weights',
    label: 'Greutati libere',
    items: ['Haltere mici', 'Haltere mari', 'Bara olimpica', 'Discuri'],
  },
  {
    id: 'machines',
    label: 'Aparate',
    items: ['Smith', 'Lat pulldown', 'Cable row', 'Leg press', 'Hack squat'],
  },
  {
    id: 'cardio',
    label: 'Cardio',
    items: ['Banda alergat', 'Bicicleta', 'Eliptic'],
  },
];

export function AparateLipsa(): JSX.Element {
  const navigate = useNavigate();
  const [missing, setMissing] = useState<Set<string>>(() => new Set());

  function toggle(item: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  function handleSave(): void {
    // Phase 4+ wires la userSettings store persist.
    navigate(gotoPath('workout-preview'), {
      state: { missingEquipment: Array.from(missing) },
    });
  }

  return (
    <section className="p-6 bg-paper" data-testid="aparate-lipsa">
      <h1 className="text-2xl font-semibold text-ink mb-2">Ce aparate lipsesc?</h1>
      <p className="text-base text-ink2 mb-6">
        Salvez setarea. Coach NU mai recomanda exercitii pe acestea.
      </p>
      {EQUIPMENT_CATEGORIES.map((cat) => (
        <div key={cat.id} className="mb-4" data-category={cat.id}>
          <p className="text-sm font-semibold text-ink2 mb-2">{cat.label}</p>
          <div className="grid grid-cols-2 gap-2" role="list" aria-label={cat.label}>
            {cat.items.map((item) => {
              const selected = missing.has(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  data-item={item}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'p-3 rounded-xl border bg-brick/10 border-brick text-ink'
                      : 'p-3 rounded-xl border bg-paper2 border-lineStrong text-ink'
                  }
                >
                  <span className="text-sm">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleSave}
        data-testid="aparate-save"
        className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold mt-6"
      >
        Salveaza setarea
      </button>
    </section>
  );
}
