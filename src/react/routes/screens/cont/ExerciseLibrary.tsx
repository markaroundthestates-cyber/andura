// ══ EXERCISE LIBRARY — Cont › General drill-down (CORE_AUTO by muscle group) ═
// Two-level drill-down reachable from the Account tab (Cont › General ›
// Biblioteca de exercitii). Level 1 = the muscle groups that have >=1 curated
// CORE_AUTO exercise; level 2 = the exercises for the picked group, each with
// its demo image (ExerciseMedia) + an inline expand showing the full two-frame
// demo + secondary muscles / equipment / tier.
//
// Scope (Daniel spec): ONLY status === 'CORE_AUTO' (~143) — the curated set the
// app actually programs, exactly the ones that have demo images. NOT the full
// ~657 library.
//
// Drill-down lives in component state (selectedGroup), NOT a second route — the
// in-screen back button returns to the group list when a group is open, and
// navigates back to Cont at the top level (mirrors SettingsAppearance back).
//
// i18n (HARD GATE): every visible string via t(). Muscle-group + equipment +
// tier labels are looked up by their engine key under exerciseLibrary.* (the RO
// strings live in ro.json, NOT hardcoded here). RO display name per exercise
// via toExerciseDisplay (Romanian-first). Pulse design tokens (paper/ink/line/
// volt/aqua), no inline hex.

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { EXERCISE_METADATA } from '../../../../engine/exerciseLibrary.js';
import type { ExerciseMetadata } from '../../../../engine/exerciseSchema';
import { toExerciseDisplay } from '../../../lib/exerciseDisplay';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { t } from '../../../../i18n/index.js';

interface LibEntry {
  /** English canonical engine key (identity — drives display + media lookup). */
  engineName: string;
  primary: string;
}

// EXERCISE_METADATA is exported from a .js loader (untyped at the entries
// boundary); re-view it through the canonical ExerciseMetadata schema type.
const LIBRARY = EXERCISE_METADATA as Record<string, ExerciseMetadata>;

// Fixed, sensible group order (Daniel spec): push → arms → legs → core, with
// any present-but-unlisted group appended. Keys match muscle_target_primary.
const GROUP_ORDER: readonly string[] = [
  'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate',
  'picioare-quads', 'picioare-hamstrings', 'picioare-fesieri', 'fese', 'fesieri',
  'picioare-gambe', 'gambe', 'core', 'abdomen', 'oblici', 'trapezi',
  'corp-intreg', 'cardio',
];

/** Group the CORE_AUTO exercises by primary muscle, ordered by GROUP_ORDER. */
function buildGroups(): Array<{ key: string; items: LibEntry[] }> {
  const byGroup = new Map<string, LibEntry[]>();
  for (const [engineName, meta] of Object.entries(LIBRARY)) {
    if (meta.status !== 'CORE_AUTO') continue;
    const primary = meta.muscle_target_primary;
    const list = byGroup.get(primary) ?? [];
    list.push({ engineName, primary });
    byGroup.set(primary, list);
  }
  // Sort each group's exercises by RO display name for a stable, scannable list.
  for (const list of byGroup.values()) {
    list.sort((a, b) => toExerciseDisplay(a.engineName).name.localeCompare(toExerciseDisplay(b.engineName).name));
  }
  const ordered: Array<{ key: string; items: LibEntry[] }> = [];
  const seen = new Set<string>();
  for (const key of GROUP_ORDER) {
    const items = byGroup.get(key);
    if (items && items.length > 0) {
      ordered.push({ key, items });
      seen.add(key);
    }
  }
  // Any present group not in the fixed order (defensive) → appended.
  for (const [key, items] of byGroup) {
    if (!seen.has(key)) ordered.push({ key, items });
  }
  return ordered;
}

function muscleLabel(key: string): string {
  return t(`exerciseLibrary.muscle.${key}`);
}

function equipmentLabel(key: string | undefined): string {
  if (!key) return t('exerciseLibrary.detail.none');
  return t(`exerciseLibrary.equipment.${key}`);
}

export function ExerciseLibrary(): JSX.Element {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = useMemo(() => buildGroups(), []);
  const current = selectedGroup ? groups.find((g) => g.key === selectedGroup) ?? null : null;

  // Back: in-screen drill-up when a group is open; otherwise leave to Cont.
  const handleBack = (): void => {
    if (selectedGroup) {
      setSelectedGroup(null);
      setExpanded(null);
    } else {
      navigate(gotoPath('cont'));
    }
  };

  const openGroup = (key: string): void => {
    setSelectedGroup(key);
    setExpanded(null);
  };

  const title = current ? muscleLabel(current.key) : t('exerciseLibrary.title');

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="exercise-library">
      <SubHeader title={title} onBack={handleBack} testIdBack="exercise-library-back" />

      <div className="flex-1 overflow-y-auto p-5">
        {current === null ? (
          // ── LEVEL 1 — muscle-group list ──────────────────────────────────
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3 mb-4">
              {t('exerciseLibrary.groupsIntro')}
            </p>
            {groups.length === 0 ? (
              <p className="text-sm text-ink2" data-testid="exercise-library-empty">{t('exerciseLibrary.empty')}</p>
            ) : (
              <div className="pulse-card p-1 overflow-hidden animate-card-rise">
                {groups.map((g, idx) => {
                  const count = g.items.length;
                  const isLast = idx === groups.length - 1;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      data-testid={`exercise-library-group-${g.key}`}
                      onClick={() => openGroup(g.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink ${!isLast ? 'border-b border-line' : ''}`}
                    >
                      <span className="flex-1 text-sm font-semibold">{muscleLabel(g.key)}</span>
                      <span className="text-xs text-ink3 font-mono">
                        {count === 1
                          ? t('exerciseLibrary.exerciseCount_one', { count })
                          : t('exerciseLibrary.exerciseCount_other', { count })}
                      </span>
                      <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink3" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // ── LEVEL 2 — exercises for the selected group ───────────────────
          <div className="pulse-card p-1 overflow-hidden animate-card-rise" data-testid={`exercise-library-list-${current.key}`}>
            {current.items.map((entry, idx) => {
              const display = toExerciseDisplay(entry.engineName);
              const meta = LIBRARY[entry.engineName];
              const isOpen = expanded === entry.engineName;
              const isLast = idx === current.items.length - 1;
              const secondary = (meta?.muscle_target_secondary ?? [])
                .map((m) => muscleLabel(m))
                .join(', ');
              return (
                <div key={entry.engineName} className={!isLast ? 'border-b border-line' : ''}>
                  <button
                    type="button"
                    data-testid={`exercise-library-item-${entry.engineName}`}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : entry.engineName)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink"
                  >
                    <ExerciseMedia engineName={entry.engineName} variant="thumbnail" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">{display.name}</span>
                      <span className="block text-xs text-ink3 truncate">
                        {display.sub ?? equipmentLabel(meta?.equipment_type)}
                      </span>
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 flex-shrink-0 text-ink3" strokeWidth={1.6} aria-hidden="true" />
                    ) : (
                      <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink3" strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-4" data-testid={`exercise-library-detail-${entry.engineName}`}>
                      <ExerciseMedia engineName={entry.engineName} variant="card" className="mb-3" />
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                        <dt className="font-mono uppercase tracking-wide text-ink3">{t('exerciseLibrary.detail.secondary')}</dt>
                        <dd className="text-ink2">{secondary || t('exerciseLibrary.detail.none')}</dd>
                        <dt className="font-mono uppercase tracking-wide text-ink3">{t('exerciseLibrary.detail.equipment')}</dt>
                        <dd className="text-ink2">{equipmentLabel(meta?.equipment_type)}</dd>
                        <dt className="font-mono uppercase tracking-wide text-ink3">{t('exerciseLibrary.detail.tier')}</dt>
                        <dd className="text-ink2">{t(`exerciseLibrary.tier.${meta?.tier ?? 2}`)}</dd>
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
