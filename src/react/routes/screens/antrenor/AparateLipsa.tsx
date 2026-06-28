// ══ APARATE LIPSA — Phase 3 task_07 §B Rewrite Stub → Real ═══════════════
// Per spec §2 B missing equipment Set toggle pentru exercitii ce necesita
// echipament absent permanent (home gym, sala mica). Different de
// EquipmentSwap (ocupat temporar) — aici permanent setting per user.
//
// A2 H-4 fix (2026-05-26): persist selectia missing-equipment in localStorage
// via scheduleAdapter.setMissingEquipment (key wv2-missing-equipment) — durable
// across sessions. getDailyWorkout o consuma (translateToEngineEquipment →
// available equipment minus missing → sessionBuilder filtreaza/substituie
// exercitiile ce cer echipament absent). Pana acum selectia se arunca in
// location.state si NU se persista nicaieri (no-op). Nav origin-aware: din Cont
// (settings) → inapoi la Cont; din workout flow (CevaNuMerge `from: 'workout'`)
// → workout-preview pentru adaptare imediata sesiune.
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
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Plus, X } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';
import {
  getMissingEquipment,
  setMissingEquipment,
  getMissingEquipmentExercises,
  addMissingEquipmentExercise,
  removeMissingEquipmentExercise,
} from '../../../../engine/schedule/scheduleAdapter.js';
import { EXERCISE_METADATA } from '../../../../engine/exerciseLibrary.js';
import { translateMissingToCoarse } from '../../../../engine/equipmentMap.js';
import { toExerciseDisplay } from '../../../lib/exerciseDisplay';

interface EquipmentItem {
  /** Stable persistence/engine id (wv2-missing-equipment); label localized
   *  at render via equipmentList.items.{id}. */
  id: string;
}

// Slice 1.7 LOCKED naming order verbatim per mockup L1056-1097. Labels flow
// through i18n (equipmentList.items.*) so the locale flip surfaces EN/RO.
const EQUIPMENT_ITEMS: readonly EquipmentItem[] = [
  { id: 'banca-inclinata' },
  { id: 'banca-plana' },
  { id: 'bara-halterelor' },
  { id: 'gantere' },
  { id: 'aparat-cablu' },
  { id: 'power-rack' },
  { id: 'smith' },
  { id: 'leg-press' },
  { id: 'aparat-extensii' },
  { id: 'aparat-tractiuni' },
  { id: 'banda-elastica' },
];

// Account-regroup 2026-06-12 — `embedded` hosts this inside the "Exercitii &
// echipament" hub (Echipament lipsa segment): the hub owns the header, so the
// inner SubHeader is hidden. Save still persists + leaves to Cont (the settings
// path, since the hub passes no workout `from` state). The in-session workout
// route (/app/antrenor/aparate-lipsa) keeps the full standalone screen.
export function AparateLipsa({ embedded = false }: { embedded?: boolean } = {}): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  // Origin discriminator: workout flow (CevaNuMerge) pasaza `from: 'workout'`
  // → save returneaza la workout-preview pentru adaptare sesiune imediata.
  // Cont/settings entry NU pasaza state → save returneaza la Cont (NU dump
  // workout-preview — user a venit din setari, nu dintr-un antrenament).
  const from = (location.state as { from?: string } | null)?.from;
  // Hydrate din persistenta — selectia anterioara survives reload.
  const [missing, setMissing] = useState<Set<string>>(
    () => new Set(getMissingEquipment())
  );

  // Founder Busy/Missing redesign 2026-06-12 — the PER-EXERCISE equipment-missing
  // memory (the in-session "Aparat lipsa" confirm writes EN canonical names here).
  // This is the ONLY place the user manages it: a remembered exercise is excluded
  // from future composition until removed here (= "I got the equipment back").
  const [missingExercises, setMissingExercises] = useState<readonly string[]>(
    () => getMissingEquipmentExercises()
  );

  function removeExercise(engineName: string): void {
    setMissingExercises(removeMissingEquipmentExercise(engineName));
  }

  // Founder Pendulum-Squat 2026-06-28 (a) — proactive per-exercise add control.
  // Daniel's gym lacks the machine for a recommended exercise; instead of waiting
  // for the in-session "Aparat lipsa" confirm, he can pre-exclude it here. Search
  // is a typeahead over the SAME library source the Biblioteca uses (CORE_AUTO),
  // by RO display name; selecting one writes the EN canonical engineName to the
  // SAME store (addMissingEquipmentExercise) so the existing list + next-compose
  // exclusion pick it up. Built once (the library is static).
  const [addQuery, setAddQuery] = useState('');
  const addOptions = useMemo<readonly { engineName: string; display: string }[]>(() => {
    const out: { engineName: string; display: string }[] = [];
    for (const [engineName, meta] of Object.entries(EXERCISE_METADATA)) {
      if ((meta as { status?: string }).status !== 'CORE_AUTO') continue;
      out.push({ engineName, display: toExerciseDisplay(engineName).name });
    }
    out.sort((a, b) => a.display.localeCompare(b.display));
    return out;
  }, []);

  // Filtered matches: exclude already-remembered exercises, match the query against
  // the RO display name (case-insensitive substring). Capped so the list stays
  // scannable on the gym floor. Empty query → no dropdown (avoid a wall of 600 rows).
  const addMatches = useMemo<readonly { engineName: string; display: string }[]>(() => {
    const q = addQuery.trim().toLowerCase();
    if (q.length === 0) return [];
    const already = new Set(missingExercises);
    return addOptions
      .filter((o) => !already.has(o.engineName) && o.display.toLowerCase().includes(q))
      .slice(0, 8);
  }, [addQuery, addOptions, missingExercises]);

  function addExercise(engineName: string): void {
    setMissingExercises(addMissingEquipmentExercise(engineName));
    setAddQuery('');
  }

  function toggle(itemId: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleSave(): void {
    // Persist durable — getDailyWorkout consuma wv2-missing-equipment la
    // urmatoarea compunere a antrenamentului (exclude/substituie exercitiile).
    setMissingEquipment(Array.from(missing));
    if (from === 'workout') {
      // 06.AD.025 — immediate hand-off. WorkoutPreview consumes
      // `equipmentContext.busyCoarseTypes` (NOT a raw `missingEquipment` list,
      // which it never read → dead state). Map the just-selected picker IDs to
      // their coarse equipment_type(s) so the previewed session re-skins the
      // affected rows NOW (recomposeWithBusyTypes), matching the EquipmentSwap
      // hand-off shape. The persisted setMissingEquipment above still feeds
      // getDailyWorkout for subsequent sessions.
      navigate(gotoPath('workout-preview'), {
        state: {
          equipmentContext: {
            busyCoarseTypes: translateMissingToCoarse(Array.from(missing)),
          },
        },
      });
    } else {
      navigate(gotoPath('cont'));
    }
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className={embedded ? '' : 'min-h-screen flex flex-col'} data-testid="aparate-lipsa">
      {!embedded && (
        <SubHeader
          title={t('aparatLipsa.subHeaderTitle')}
          onBack={handleBack}
          testIdBack="aparate-lipsa-back"
        />
      )}
      {/* Pulse reskin (ADDENDUM 7 2026-06-01) — aurora-transparent root (no
          bg-paper fill); the body scroll area pads its bottom by
          --app-bottom-chrome (64px nav + breathing + safe-area) so the last
          equipment row + the serif "the coach learns…" note clear the floating
          BottomNav instead of hiding under it (mockup 21 cut-off bug). */}
      <div className="p-6 flex-1 pb-[var(--app-bottom-chrome)]">
      <p className="text-base text-ink2 mb-3 font-display">
        {t('aparatLipsa.introPre')}
        <strong>{t('aparatLipsa.introBold')}</strong>
        {t('aparatLipsa.introPost')}
      </p>
      <p className="text-sm text-ink3 mb-6">
        {t('aparatLipsa.intro2')}
      </p>
      <div className="flex flex-col gap-2 mb-6">
        {EQUIPMENT_ITEMS.map((item) => {
          const selected = missing.has(item.id);
          const label = t(`equipmentList.items.${item.id}`);
          return (
            <label
              key={item.id}
              className={
                selected
                  ? 'pulse-card pulse-card-tight flex items-center gap-3 p-3.5 cursor-pointer transition-colors'
                  : 'pulse-card pulse-card-tight flex items-center gap-3 p-3.5 text-ink cursor-pointer transition-colors'
              }
              style={
                selected
                  ? {
                      background: 'color-mix(in oklab, var(--brick) 16%, var(--surface))',
                      borderColor: 'color-mix(in oklab, var(--brick) 55%, var(--line-strong))',
                    }
                  : undefined
              }
            >
              {/* Pulse checkbox (PULSE-RULES §6) — the real <input> stays the
                  a11y/test target but is visually hidden; the styled 22px
                  rounded-square box renders the state. Unchecked = --line-strong
                  border; checked = --brick (volt by default) fill + dark check. */}
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(item.id)}
                data-item={item.id}
                aria-label={label}
                className="sr-only peer"
              />
              <span
                aria-hidden="true"
                className="w-[22px] h-[22px] rounded-[7px] grid place-items-center flex-shrink-0 border transition-colors"
                style={{
                  borderColor: selected ? 'transparent' : 'var(--line-strong)',
                  background: selected ? 'var(--brick)' : 'transparent',
                }}
              >
                {selected && (
                  <Check
                    className="w-[15px] h-[15px]"
                    strokeWidth={3}
                    style={{ color: 'var(--on-accent)' }}
                  />
                )}
              </span>
              <span className={`text-sm font-semibold ${selected ? 'text-ink' : 'text-ink2'}`}>{label}</span>
            </label>
          );
        })}
      </div>
      <p className="text-sm text-ink3 italic font-serif mb-6 leading-relaxed">
        {t('aparatLipsa.learnNote')}
      </p>

      {/* Founder Pendulum-Squat 2026-06-28 (a) — proactive "+ Adauga exercitiu"
          control. A typeahead over the library (RO display names); selecting one
          remembers it as equipment-missing (same store the in-session confirm
          writes), so it joins the list below + is excluded next compose. Placed
          ABOVE the list so add + remove live in one place. */}
      <div className="mb-6" data-testid="equip-missing-add">
        <h2 className="text-sm font-bold text-ink mb-1">
          {t('aparatLipsa.addTitle')}
        </h2>
        <p className="text-sm text-ink3 mb-3">{t('aparatLipsa.addIntro')}</p>
        <div className="relative">
          <Plus
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            data-testid="equip-missing-add-input"
            placeholder={t('aparatLipsa.addPlaceholder')}
            aria-label={t('aparatLipsa.addTitle')}
            className="pulse-card pulse-card-tight w-full pl-9 pr-3 py-3 text-sm text-ink bg-transparent placeholder:text-ink3"
          />
        </div>
        {addMatches.length > 0 && (
          <ul
            className="mt-2 flex flex-col gap-1"
            data-testid="equip-missing-add-results"
          >
            {addMatches.map((o) => (
              <li key={o.engineName}>
                <button
                  type="button"
                  onClick={() => addExercise(o.engineName)}
                  data-testid={`equip-missing-add-option-${o.engineName}`}
                  className="pulse-card pulse-card-tight w-full flex items-center gap-2 p-3 text-left text-sm font-semibold text-ink2 transition-colors"
                >
                  <Plus className="w-4 h-4 shrink-0 text-brick" aria-hidden="true" />
                  <span className="truncate">{o.display}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Founder Busy/Missing redesign 2026-06-12 — per-EXERCISE equipment-missing
          list. Each entry was remembered from an in-session "Aparat lipsa" confirm
          (a specific exercise whose machine the user lacks). The coach excludes it
          from future sessions; removing it here makes it available again. Shown
          only when there is at least one entry (no empty section). */}
      {missingExercises.length > 0 && (
        <div className="mb-6" data-testid="equip-missing-exercises">
          <h2 className="text-sm font-bold text-ink mb-1">
            {t('aparatLipsa.exercisesTitle')}
          </h2>
          <p className="text-sm text-ink3 mb-3">{t('aparatLipsa.exercisesIntro')}</p>
          <div className="flex flex-col gap-2">
            {missingExercises.map((engineName) => (
              <div
                key={engineName}
                data-testid={`equip-missing-row-${engineName}`}
                className="pulse-card pulse-card-tight flex items-center gap-3 p-3.5"
              >
                <span className="flex-1 text-sm font-semibold text-ink2 truncate">
                  {toExerciseDisplay(engineName).name}
                </span>
                <button
                  type="button"
                  onClick={() => removeExercise(engineName)}
                  data-testid={`equip-missing-remove-${engineName}`}
                  aria-label={t('aparatLipsa.exerciseRemoveAria', {
                    name: toExerciseDisplay(engineName).name,
                  })}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brick min-h-[36px]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  {t('aparatLipsa.exerciseRemoveCta')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        data-testid="aparate-save"
        className="btn-grad pulse-shine w-full py-4 text-base font-bold"
      >
        {t('aparatLipsa.saveCta')}
      </button>
      </div>
    </section>
  );
}
