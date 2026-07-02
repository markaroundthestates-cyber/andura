// ══ SALA MEA — per-gym curated equipment stacks (founder changed gyms 2026-07-02) ══
// The user's ACTIVE gym's MEASURED rungs drive the coach's weight snapping (engine:
// gymProfile.js → config/weights.js roundToEquipmentWeight, behind dp_active_gym_ladder_v1),
// so a NEW gym's real trepte apply from session ONE — no learning lag, no old-gym
// pollution ("presupune ca pot mai putin"). This screen manages the gyms: list, switch
// the active one, add/delete, and edit each station's stack. Persistence is the engine
// gymProfile module (DB-backed, synced per-UID) — NOT a Zustand store — mirroring how
// ExerciseLibrary drives scheduleAdapter directly. All strings i18n, no diacritics.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Trash2, Building2, X } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';
import {
  getGymsState, setActiveGym, upsertGym, setGymStack, removeGym,
} from '../../../../engine/dp/gymProfile.js';

// Equipment-type stations exposed in the editor (friendly RO label via i18n). Keys
// mirror config/weights.js EQUIPMENT_WEIGHTS — one stack per station covers every lift
// on it. A gym with no stack for a station falls back to Andura's learned/generic ladder.
const STATIONS = [
  'dumbbell', 'bailib_stack', 'matrix_cable', 'machine_plates', 'pec_deck', 'leg_machine',
] as const;

/** Parse a comma/space-separated rung list into sorted-clean positive numbers. */
function parseSteps(text: string): number[] {
  return String(text)
    .split(/[\s,;]+/)
    .map((s) => Number(s.replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function SalaMea(): JSX.Element {
  const navigate = useNavigate();
  const [gymsState, setGymsState] = useState(() => getGymsState());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const refresh = (): void => setGymsState(getGymsState());
  const gyms = Object.values(gymsState.gyms);
  const activeId = gymsState.activeId;
  const active = activeId ? gymsState.gyms[activeId] : null;

  const handleBack = (): void => navigate(gotoPath('cont'));

  const handleAdd = (): void => {
    const name = newName.trim();
    if (!name) { setAdding(false); setNewName(''); return; }
    const id = `gym_${Date.now()}`;
    upsertGym({ id, name, stacks: {} });
    setActiveGym(id);
    setAdding(false);
    setNewName('');
    setDrafts({});
    refresh();
  };

  const handleSetActive = (id: string): void => {
    setActiveGym(id);
    setDrafts({});
    refresh();
  };

  const handleDelete = (id: string): void => {
    removeGym(id);
    setConfirmDeleteId(null);
    setDrafts({});
    refresh();
  };

  const stackText = (key: string): string => {
    if (key in drafts) return drafts[key]!;
    const s = active?.stacks?.[key];
    return Array.isArray(s) ? s.join(', ') : '';
  };
  const commitStack = (key: string): void => {
    if (!activeId || !(key in drafts)) return;
    setGymStack(activeId, key, parseSteps(drafts[key]!));
    setDrafts((d) => { const n = { ...d }; delete n[key]; return n; });
    refresh();
  };

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="sala-mea">
      <SubHeader title={t('gymProfile.title')} onBack={handleBack} testIdBack="sala-mea-back" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <p className="text-sm text-ink2 leading-relaxed">{t('gymProfile.intro')}</p>

        {/* ── Gym list ─────────────────────────────────────────────── */}
        {gyms.length === 0 && !adding && (
          <div className="pulse-card p-5 text-sm text-ink3 text-center" data-testid="sala-mea-empty">
            {t('gymProfile.empty')}
          </div>
        )}

        {gyms.length > 0 && (
          <div className="pulse-card p-1 overflow-hidden">
            {gyms.map((g) => {
              const isActive = g.id === activeId;
              return (
                <div
                  key={g.id}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-b-0 ${isActive ? 'bg-volt/5' : ''}`}
                  data-testid={`sala-mea-gym-${g.id}`}
                >
                  <span className={`grid place-items-center w-9 h-9 rounded-xl border ${isActive ? 'border-volt/50 text-volt' : 'border-line text-ink3'}`}>
                    <Building2 className="w-5 h-5" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetActive(g.id)}
                    className="flex-1 text-left min-w-0"
                    data-testid={`sala-mea-gym-${g.id}-select`}
                  >
                    <span className="block text-sm font-semibold text-ink truncate">{g.name}</span>
                    {isActive
                      ? <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-volt">{t('gymProfile.activeBadge')}</span>
                      : <span className="block text-xs text-ink3">{t('gymProfile.setActive')}</span>}
                  </button>
                  {confirmDeleteId === g.id ? (
                    <span className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        className="rounded-lg border border-danger/40 text-danger px-2.5 py-1 text-xs font-semibold"
                        data-testid={`sala-mea-gym-${g.id}-delete-yes`}
                      >
                        {t('gymProfile.delete')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-line text-ink3 px-2.5 py-1 text-xs"
                        data-testid={`sala-mea-gym-${g.id}-delete-no`}
                      >
                        <X className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(g.id)}
                      className="shrink-0 grid place-items-center w-8 h-8 rounded-lg border border-line text-ink3"
                      aria-label={t('gymProfile.delete')}
                      data-testid={`sala-mea-gym-${g.id}-delete`}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add gym ──────────────────────────────────────────────── */}
        {adding ? (
          <div className="pulse-card p-4 space-y-3" data-testid="sala-mea-add-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              placeholder={t('gymProfile.namePlaceholder')}
              className="pulse-field w-full px-3 py-2 rounded-xl text-sm"
              data-testid="sala-mea-name-input"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="btn-grad btn-primary-lift press-feedback flex-1 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
                data-testid="sala-mea-add-confirm"
              >
                <Check className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />{t('gymProfile.save')}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewName(''); }}
                className="rounded-full border border-line text-ink2 px-4 py-2 text-sm"
                data-testid="sala-mea-add-cancel"
              >
                {t('gymProfile.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full rounded-xl border border-line text-ink2 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2"
            data-testid="sala-mea-add"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />{t('gymProfile.addGym')}
          </button>
        )}

        {/* ── Stacks editor (active gym) ───────────────────────────── */}
        {active && (
          <div className="space-y-2" data-testid="sala-mea-stacks">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3 px-1">
              {t('gymProfile.stacksTitle')} · {active.name}
            </div>
            <p className="text-xs text-ink3 px-1 leading-relaxed">{t('gymProfile.stacksHint')}</p>
            <div className="pulse-card p-1 overflow-hidden">
              {STATIONS.map((key) => {
                const s = active.stacks?.[key];
                const count = Array.isArray(s) ? s.length : 0;
                return (
                  <div key={key} className="px-4 py-3 border-b border-line last:border-b-0" data-testid={`sala-mea-stack-${key}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-ink">{t(`gymProfile.stations.${key}`)}</span>
                      <span className="text-[11px] text-ink3 shrink-0">
                        {count > 0 ? t('gymProfile.rungsCount', { n: count }) : t('gymProfile.usingDefault')}
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={stackText(key)}
                      onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                      onBlur={() => commitStack(key)}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      placeholder="4.5, 11, 18, 25, ..."
                      className="pulse-field w-full px-3 py-2 rounded-xl text-sm font-mono"
                      data-testid={`sala-mea-stack-${key}-input`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
