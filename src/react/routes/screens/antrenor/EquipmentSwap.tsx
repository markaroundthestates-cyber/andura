// ══ EQUIPMENT SWAP — WP-5 moat: busy machines → NAMED inline alternatives ═══
// Per P3-MOAT-DESIGN.md §5.2 (EquipmentSwap continue) + §5.3 (surfacing NAMED).
// Was a STUB: hardcoded 5 items, aspirational "Coach gaseste alternative" copy,
// and a busy[] payload nobody consumed. Now REAL: each item maps to a coarse
// equipment_type; marking it busy (a) shows inline under that item the NAMED
// alternative the user will do for each affected exercise, and (b) forwards the
// busy COARSE TYPES to WorkoutPreview, which recomposes the session with those
// types temporarily unavailable (→ cascade). The key to the moat: the user SEES
// the real alternative's name BEFORE confirming, not an aspirational promise.
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L1027 sub-header
// verbatim title "Schimba echipament" sticky top + back-btn. Body h1
// 'Aparate ocupate?' regresat h2 (single h1 SubHeader pattern parity).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-038 Smart Routing Equipment v2 cascade
//   - DECISIONS.md §D081 coarse equipment_type SoT
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L1026-1041 screen-equipment-swap

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import type { PlannedExercise } from '../../../lib/engineWrappers';
import { recomposeWithBusyTypes } from '../../../lib/substitution';

export type EquipmentStatus = 'available' | 'busy';

export interface EquipmentItem {
  id: string;
  name: string;
  status: EquipmentStatus;
  // Coarse equipment_type(s) (library SoT) this machine provides. Marking the
  // item busy makes these types temporarily unavailable for the substitution.
  coarseTypes: readonly string[];
}

// The common gym stations a user marks busy → coarse equipment_type they block.
// Names stay the conventional gym terms (mockup parity); the coarse mapping is
// what drives the real cascade (D081 SoT).
const INITIAL_EQUIPMENT: readonly EquipmentItem[] = [
  { id: 'bench', name: 'Bench press', status: 'available', coarseTypes: ['barbell'] },
  { id: 'smith', name: 'Smith machine', status: 'available', coarseTypes: ['machine'] },
  { id: 'lat-pulldown', name: 'Lat pulldown', status: 'available', coarseTypes: ['machine'] },
  { id: 'cable-row', name: 'Cable row', status: 'available', coarseTypes: ['cable'] },
  { id: 'leg-press', name: 'Leg press', status: 'available', coarseTypes: ['machine'] },
];

export function EquipmentSwap(): JSX.Element {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<readonly EquipmentItem[]>(INITIAL_EQUIPMENT);
  // Today's planned exercises — so the inline preview shows REAL named
  // alternatives for the user's actual session (null while loading / no session).
  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) setExercises(planned?.exercises ?? []);
    });
    return () => { cancelled = true; };
  }, []);

  // Deduplicated coarse types currently marked busy.
  const busyCoarseTypes = useMemo(() => {
    const set = new Set<string>();
    for (const e of equipment) {
      if (e.status === 'busy') for (const t of e.coarseTypes) set.add(t);
    }
    return [...set];
  }, [equipment]);

  // Named swaps PER equipment item — recompose the session with each busy item's
  // own coarse type(s) unavailable so the inline preview under that item shows
  // exactly the alternatives caused by IT (not every busy item's swaps lumped).
  const swapsByItem = useMemo(() => {
    const out: Record<string, Array<{ original: string; alternative: string }>> = {};
    if (!exercises || exercises.length === 0) return out;
    for (const e of equipment) {
      if (e.status !== 'busy') continue;
      const next = recomposeWithBusyTypes(exercises, e.coarseTypes);
      const swaps: Array<{ original: string; alternative: string }> = [];
      for (let i = 0; i < exercises.length; i++) {
        const before = exercises[i]!;
        const after = next[i]!;
        if (after.swapReason && after.name !== before.name) {
          swaps.push({ original: before.name, alternative: after.name });
        }
      }
      out[e.id] = swaps;
    }
    return out;
  }, [exercises, equipment]);

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
    // Forward the busy COARSE TYPES — WorkoutPreview recomposes the session with
    // them unavailable (the cascade). Empty when nothing busy (no adaptation).
    navigate(gotoPath('workout-preview'), {
      state: { equipmentContext: { busyCoarseTypes } },
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
        Marcheaza ce e ocupat. Iti arat ce faci in loc.
      </p>
      {/* No role="list": children are <button>s (not valid role="listitem"),
          which makes a screen reader announce an empty list. The "Aparate
          ocupate?" heading already labels the group (parity §6-M3 revert). */}
      <div className="flex flex-col gap-2 mb-6">
        {equipment.map((e) => {
          const isBusy = e.status === 'busy';
          // Named alternatives surfaced for THIS item's coarse type(s) when busy.
          const itemSwaps = isBusy ? swapsByItem[e.id] ?? [] : [];
          return (
            <div key={e.id} className="flex flex-col gap-1">
              <button
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
              {/* WP-5 moat — inline NAMED alternative under the busy item. The
                  user sees "vei face {alternativa} in loc de {original}" BEFORE
                  confirming (the aspirational copy made real). */}
              {itemSwaps.length > 0 && (
                <ul className="pl-2" data-testid={`swap-preview-${e.id}`}>
                  {itemSwaps.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-ink2 py-0.5"
                      data-testid="swap-preview-row"
                    >
                      vei face <span className="font-medium text-ink">{s.alternative}</span>{' '}
                      in loc de {s.original}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
