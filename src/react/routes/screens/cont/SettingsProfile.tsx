// ══ SETTINGS PROFILE — Phase 6 task_09 Big 6 Edit Cont Sub-Screen ════════
// Mockup verbatim source: 04-architecture/mockups/andura-clasic.html
// #screen-settings-profile (L1898-1939). Big 6 edit reads/writes
// useOnboardingStore.data. Avatar initial + body composition + targets
// sections preserve mockup parity (composition+targets local form state V1;
// persistence Phase 7+ când stores extend).
//
// Sub-screen pattern Phase 6: sub-header back btn + heading + scroll body.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import type { Sex, Goal, Frequency, Experience, OnboardingData } from '../../../stores/onboardingStore';
import { gotoPath } from '../../../lib/navigation';

// §B003/D-1b audit fix — Goal labels 6 mockup parity (mockup L863-869).
const GOAL_LABELS: Record<Goal, string> = {
  auto: 'Auto',
  forta: 'Forta',
  masa: 'Masa',
  slabire: 'Slabire',
  mentenanta: 'Mentenanta',
  longevitate: 'Longevitate',
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  '2': '2x/sapt',
  '3': '3x/sapt',
  '4': '4x/sapt',
  '5': '5x/sapt',
};

const EXPERIENCE_LABELS: Record<Experience, string> = {
  incepator: 'Incepator',
  intermediar: 'Intermediar',
  avansat: 'Avansat',
};

export function SettingsProfile(): JSX.Element {
  const navigate = useNavigate();
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);

  // Draft state pentru edit apoi save commit (avoid live store thrash)
  const [draft, setDraft] = useState<OnboardingData>(data);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]): void {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleSave(): void {
    (Object.keys(draft) as Array<keyof OnboardingData>).forEach((key) => {
      setField(key, draft[key]);
    });
    setSaved(true);
  }

  function handleBack(): void {
    navigate(gotoPath('cont'));
  }

  return (
    <section
      className="bg-paper min-h-screen flex flex-col"
      data-testid="settings-profile"
    >
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Inapoi"
          data-testid="settings-profile-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Profil & tinte</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col items-center gap-2.5 pt-2 pb-5">
          <div className="w-20 h-20 rounded-full bg-brick text-paper flex items-center justify-center text-3xl font-semibold">
            A
          </div>
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Date personale
        </p>
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          <FieldRow label="Varsta">
            <input
              type="number"
              min={16}
              max={100}
              value={draft.age ?? ''}
              onChange={(e) => update('age', e.target.value ? Number(e.target.value) : null)}
              data-testid="profile-age-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-lg bg-paper text-ink font-mono text-sm"
            />
          </FieldRow>
          <FieldRow label="Greutate (kg)">
            <input
              type="number"
              min={30}
              max={250}
              step={0.1}
              value={draft.weight ?? ''}
              onChange={(e) => update('weight', e.target.value ? Number(e.target.value) : null)}
              data-testid="profile-weight-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-lg bg-paper text-ink font-mono text-sm"
            />
          </FieldRow>
          <FieldRow label="Gen" isLast>
            <select
              value={draft.sex ?? ''}
              onChange={(e) => update('sex', (e.target.value || null) as Sex | null)}
              data-testid="profile-sex-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-lg bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              <option value="m">Masculin</option>
              <option value="f">Feminin</option>
            </select>
          </FieldRow>
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Antrenament
        </p>
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
          <FieldRow label="Obiectiv">
            <select
              value={draft.goal ?? ''}
              onChange={(e) => update('goal', (e.target.value || null) as Goal | null)}
              data-testid="profile-goal-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-lg bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {/* §3-M1 audit fix — Array<keyof typeof X_LABELS> more accurate than X[] */}
              {(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>).map((g) => (
                <option key={g} value={g}>{GOAL_LABELS[g]}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Frecventa">
            <select
              value={draft.frequency ?? ''}
              onChange={(e) => update('frequency', (e.target.value || null) as Frequency | null)}
              data-testid="profile-frequency-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-lg bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {(Object.keys(FREQUENCY_LABELS) as Array<keyof typeof FREQUENCY_LABELS>).map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Experienta" isLast>
            <select
              value={draft.experience ?? ''}
              onChange={(e) => update('experience', (e.target.value || null) as Experience | null)}
              data-testid="profile-experience-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-lg bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {(Object.keys(EXPERIENCE_LABELS) as Array<keyof typeof EXPERIENCE_LABELS>).map((x) => (
                <option key={x} value={x}>{EXPERIENCE_LABELS[x]}</option>
              ))}
            </select>
          </FieldRow>
        </div>

        <button
          type="button"
          onClick={handleSave}
          data-testid="settings-profile-save"
          className="w-full mt-3 py-3 bg-brick text-paper rounded-xl text-base font-semibold flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirma editare
        </button>

        {saved && (
          <p
            className="text-sm text-ink2 text-center mt-3"
            role="status"
            data-testid="settings-profile-saved"
          >
            Profil salvat
          </p>
        )}
      </div>
    </section>
  );
}

interface FieldRowProps {
  label: string;
  isLast?: boolean;
  children: JSX.Element;
}

function FieldRow({ label, isLast, children }: FieldRowProps): JSX.Element {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <span className="text-sm text-ink">{label}</span>
      {children}
    </div>
  );
}
