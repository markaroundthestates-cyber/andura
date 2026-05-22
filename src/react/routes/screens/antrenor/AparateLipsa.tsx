// ══ APARATE LIPSA — Phase 3 task_07 §B Rewrite Stub → Real ═══════════════
// Per spec §2 B missing equipment Set toggle pentru exercitii ce necesita
// echipament absent permanent (home gym, sala mica). Different de
// EquipmentSwap (ocupat temporar) — aici permanent setting per user.
//
// Phase 3 propagates `missingEquipment` array via location.state. Phase 4+
// wires la userSettings store persist (durable across sessions, coach NU mai
// recomanda exercitii pe aceste items).
//
// HIGH-GAMMA §F-aparate-lipsa-01: flat 10-item list per mockup
// andura-clasic.html L1056-1097 verbatim naming (Slice 1.7 Daniel LOCKED 2026-
// 05-12) instead of 3-category grouping. Daniel reglaj LOCKED naming convention.
// Mockup items: Banca inclinata / Banca plana / Bara halterelor / Gantere /
// Aparat cablu / Power rack / Leg press / Aparat extensii / Aparat tractiuni /
// Banda elastica.
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L1051 sub-header
// verbatim "Aparate lipsa" sticky top + back-btn. Body h1 'Aparate lipsa'
// eliminat (single h1 SubHeader pattern parity CevaNuMerge/EnergyCause).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-038 Smart Routing Equipment v2 cascade
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L1050-1101 screen-aparate-lipsa Slice 1.7

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

interface EquipmentItem {
  id: string;
  label: string;
}

// Slice 1.7 LOCKED naming order verbatim per mockup L1056-1097.
const EQUIPMENT_ITEMS: readonly EquipmentItem[] = [
  { id: 'banca-inclinata', label: 'Banca inclinata' },
  { id: 'banca-plana', label: 'Banca plana' },
  { id: 'bara-halterelor', label: 'Bara halterelor' },
  { id: 'gantere', label: 'Gantere' },
  { id: 'aparat-cablu', label: 'Aparat cablu / scripete' },
  { id: 'power-rack', label: 'Power rack / Smith machine' },
  { id: 'leg-press', label: 'Leg press' },
  { id: 'aparat-extensii', label: 'Aparat extensii / curls picioare' },
  { id: 'aparat-tractiuni', label: 'Aparat tractiuni / bara fixa' },
  { id: 'banda-elastica', label: 'Banda elastica' },
];

export function AparateLipsa(): JSX.Element {
  const navigate = useNavigate();
  const [missing, setMissing] = useState<Set<string>>(() => new Set());

  function toggle(itemId: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleSave(): void {
    // Phase 4+ wires la userSettings store persist.
    navigate(gotoPath('workout-preview'), {
      state: { missingEquipment: Array.from(missing) },
    });
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="aparate-lipsa">
      <SubHeader
        title="Aparate lipsa"
        onBack={handleBack}
        testIdBack="aparate-lipsa-back"
      />
      <div className="p-6 flex-1">
      <p className="text-base text-ink2 mb-3">
        Bifeaza aparatele pe care <strong>nu le ai</strong>. Coach-ul va
        alege exercitii alternative si nu le va propune in viitor.
      </p>
      <p className="text-sm text-ink3 mb-6">
        Poti reveni oricand sa scoti din lista daca ai acum aparatul.
      </p>
      <div className="flex flex-col gap-2 mb-6">
        {EQUIPMENT_ITEMS.map((item) => {
          const selected = missing.has(item.id);
          return (
            <label
              key={item.id}
              className={
                selected
                  ? 'flex items-center gap-3 p-3 rounded-xl border bg-brick/10 border-brick text-ink cursor-pointer'
                  : 'flex items-center gap-3 p-3 rounded-xl border bg-paper2 border-lineStrong text-ink cursor-pointer'
              }
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(item.id)}
                data-item={item.id}
                aria-label={item.label}
                className="w-5 h-5 accent-brick"
              />
              <span className="text-sm font-medium">{item.label}</span>
            </label>
          );
        })}
      </div>
      <p className="text-sm text-ink3 italic font-serif mb-6 leading-relaxed">
        Coach-ul invata din selectiile tale. Daca lipsesc mai multe aparate,
        propune sesiuni bodyweight sau cu alternative.
      </p>
      <button
        type="button"
        onClick={handleSave}
        data-testid="aparate-save"
        className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        Salveaza setarea
      </button>
      </div>
    </section>
  );
}
