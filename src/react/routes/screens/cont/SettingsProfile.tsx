// ══ SETTINGS PROFILE — Phase 6 task_09 Big 6 Edit Cont Sub-Screen ════════
// Mockup verbatim source: 04-architecture/mockups/andura-clasic.html
// #screen-settings-profile (L2016-2057). Big 6 edit reads/writes
// useOnboardingStore.data. Avatar initial + body composition section
// (§F-pass2-settings-profile-03) + targets section (§F-pass2-settings-
// profile-04) mockup parity. Composition + targets = local form state V1 —
// onboardingStore NU are talie/gat/inaltime/greutate-tinta; persistence
// Phase 7+ cand store extinde.
//
// Sub-screen pattern Phase 6: sub-header back btn + heading + scroll body.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useOnboardingStore, validateOnboardingField } from '../../../stores/onboardingStore';
import type { Sex, Goal, Frequency, Experience, OnboardingData } from '../../../stores/onboardingStore';
import { gotoPath } from '../../../lib/navigation';
import { toast } from '../../../lib/toast';
import { SubHeader } from '../../../components/SubHeader';
import { getUserProfileDisplay } from './userProfile';
import { estimateBF_USNavy } from '../../../../engine/usNavyBF.js';

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
  // §F-cont-01 user-wire (HIGH-BETA chat 4) — read avatar initial din id_token
  // JWT claims. Cumulative cu Cont.tsx wire pentru parity across screens.
  const profile = getUserProfileDisplay();

  // Draft state pentru edit apoi save commit (avoid live store thrash)
  const [draft, setDraft] = useState<OnboardingData>(data);
  const [saved, setSaved] = useState(false);

  // §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
  // Talie + Gat + Inaltime → BF% auto US Navy. Local form state V1 (NU persistat
  // — onboardingStore NU are aceste campuri; persistence Phase 7+ cand store
  // extinde, per header note). Inaltime ceruta de engine (altfel BF null).
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [bfManual, setBfManual] = useState(false);
  const [bfOverride, setBfOverride] = useState('');

  // Build engine arg omitting empty fields (exactOptionalPropertyTypes — NU
  // pasa undefined explicit). Engine returns null daca lipseste vreun camp.
  const bfArgs: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number } = {};
  if (draft.sex) bfArgs.sex = draft.sex;
  if (height) bfArgs.height_cm = Number(height);
  if (neck) bfArgs.neck_cm = Number(neck);
  if (waist) bfArgs.waist_cm = Number(waist);
  const bfAuto = estimateBF_USNavy(bfArgs);

  // §F-pass2-settings-profile-04 — Tinte personale (mockup L2049-2052).
  // Greutate tinta + luna tinta ("Pana in") → ETA luni ramase. Local form
  // state V1 (NU persistat — onboardingStore NU are aceste campuri).
  const [targetWeight, setTargetWeight] = useState('');
  const [targetMonth, setTargetMonth] = useState(''); // YYYY-MM din <input month>
  const etaLabel = monthsUntil(targetMonth);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]): void {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleSave(): void {
    // U-12 audit fix (AUDIT-2 §U-12 HIGH) — apply same range gate as Onboarding
    // before committing edited Big 6. SettingsProfile bypassed §30-C1 bounds:
    // setField only rejects NaN/Infinity/<=0 (isSafeOnboardingValue), NOT range,
    // so paste age=8 / weight=999 reached engines via the edit path. Validate
    // age + weight here (numeric Big 6 fields with bounds) and surface a
    // Gigel-friendly toast on out-of-range, aborting the save.
    const ageCheck = validateOnboardingField('age', draft.age);
    if (!ageCheck.ok) {
      toast.show({ message: ageCheck.reason, variant: 'warning' });
      return;
    }
    const weightCheck = validateOnboardingField('weight', draft.weight);
    if (!weightCheck.ok) {
      toast.show({ message: weightCheck.reason, variant: 'warning' });
      return;
    }
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
      <SubHeader
        title="Profil si tinte"
        onBack={handleBack}
        testIdBack="settings-profile-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col items-center gap-2.5 pt-2 pb-5">
          <div
            className="w-20 h-20 rounded-full bg-brick text-paper flex items-center justify-center text-3xl font-semibold"
            data-testid="settings-profile-initial"
          >
            {profile.initial}
          </div>
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Date personale
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          <LabelRow label="Varsta">
            <input
              type="number"
              min={16}
              max={100}
              inputMode="numeric"
              autoComplete="off"
              value={draft.age ?? ''}
              onChange={(e) => update('age', e.target.value ? Number(e.target.value) : null)}
              data-testid="profile-age-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <LabelRow label="Greutate (kg)">
            <input
              type="number"
              min={30}
              max={250}
              step={0.1}
              inputMode="decimal"
              autoComplete="off"
              value={draft.weight ?? ''}
              onChange={(e) => update('weight', e.target.value ? Number(e.target.value) : null)}
              data-testid="profile-weight-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <SelectRow label="Gen" htmlFor="profile-sex-select" isLast>
            <select
              id="profile-sex-select"
              value={draft.sex ?? ''}
              onChange={(e) => update('sex', (e.target.value || null) as Sex | null)}
              data-testid="profile-sex-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-xl bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              <option value="m">Masculin</option>
              <option value="f">Feminin</option>
            </select>
          </SelectRow>
        </div>

        {/* §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
            Talie + Gat + Inaltime → BF% auto US Navy (engine usNavyBF.js) cu
            override manual. Inaltime ceruta de engine (altfel BF null). Local
            form state V1 — persistence Phase 7+ cand store extinde. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Compozitie corporala
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-1">
          <LabelRow label="Talie (cm)">
            <input
              type="number"
              min={50}
              max={200}
              step={0.5}
              inputMode="decimal"
              autoComplete="off"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              data-testid="profile-waist-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <LabelRow label="Gat (cm)">
            <input
              type="number"
              min={25}
              max={60}
              step={0.5}
              inputMode="decimal"
              autoComplete="off"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              data-testid="profile-neck-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <LabelRow label="Inaltime (cm)">
            <input
              type="number"
              min={120}
              max={230}
              step={0.5}
              inputMode="decimal"
              autoComplete="off"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              data-testid="profile-height-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <span className="text-sm text-ink">BF % auto</span>
            <span className="flex items-center gap-2">
              <span
                className="font-mono text-sm font-semibold text-ink"
                data-testid="profile-bf-auto"
              >
                {bfAuto != null ? `${bfAuto}%` : '—'}
              </span>
              <span className="text-[11px] text-ink3">US Navy</span>
            </span>
          </div>
          <SelectRow label="Editez manual" htmlFor="profile-bf-manual" isLast>
            <span className="flex items-center gap-2">
              <input
                id="profile-bf-manual"
                type="checkbox"
                checked={bfManual}
                onChange={(e) => setBfManual(e.target.checked)}
                data-testid="profile-bf-manual"
                className="w-[18px] h-[18px] accent-brick"
              />
              <input
                type="number"
                min={3}
                max={60}
                step={0.1}
                inputMode="decimal"
                autoComplete="off"
                disabled={!bfManual}
                placeholder="—"
                value={bfOverride}
                onChange={(e) => setBfOverride(e.target.value)}
                data-testid="profile-bf-override"
                className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper2 text-ink3 font-mono text-sm disabled:opacity-60"
              />
            </span>
          </SelectRow>
        </div>
        <p className="text-xs text-ink3 mb-4 px-1 leading-snug">
          Calculat automat (US Navy: talie + gat + inaltime + sex) sau editat manual. Fallback Demographic Prior daca lipsesc masuratori.
        </p>

        {/* §F-pass2-settings-profile-04 — Tinte personale (mockup L2049-2052).
            Greutate tinta + "Pana in" month picker → ETA luni ramase. Local
            form state V1 — persistence Phase 7+ cand store extinde. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Tinte personale
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-1">
          <LabelRow label="Greutate tinta (kg)">
            <input
              type="number"
              min={30}
              max={250}
              step={0.1}
              inputMode="decimal"
              autoComplete="off"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              data-testid="profile-target-weight-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
          <LabelRow label="Pana in" isLast>
            <input
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              data-testid="profile-target-month-input"
              className="w-36 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-[13px]"
            />
          </LabelRow>
        </div>
        {etaLabel && (
          <p
            className="text-xs text-ink3 mb-4 px-1 leading-snug"
            data-testid="profile-target-eta"
          >
            {etaLabel}
          </p>
        )}

        {/* §F-pass2-settings-profile-05 HIGH-BETA chat 4 Co-CTO decision: KEEP
            Antrenament section (Obiectiv + Frecventa + Experienta) onboarding
            fields surface in profile edit — value > strict mockup parity. User
            can change goal/frequency/experience post-onboarding without redoing
            full onboarding flow. Mockup omission is mockup drift, NU prod bug. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Antrenament
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          <SelectRow label="Obiectiv" htmlFor="profile-goal-select">
            <select
              id="profile-goal-select"
              value={draft.goal ?? ''}
              onChange={(e) => update('goal', (e.target.value || null) as Goal | null)}
              data-testid="profile-goal-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-xl bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {/* §3-M1 audit fix — Array<keyof typeof X_LABELS> more accurate than X[] */}
              {(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>).map((g) => (
                <option key={g} value={g}>{GOAL_LABELS[g]}</option>
              ))}
            </select>
          </SelectRow>
          <SelectRow label="Frecventa" htmlFor="profile-frequency-select">
            <select
              id="profile-frequency-select"
              value={draft.frequency ?? ''}
              onChange={(e) => update('frequency', (e.target.value || null) as Frequency | null)}
              data-testid="profile-frequency-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-xl bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {(Object.keys(FREQUENCY_LABELS) as Array<keyof typeof FREQUENCY_LABELS>).map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
              ))}
            </select>
          </SelectRow>
          <SelectRow label="Experienta" htmlFor="profile-experience-select" isLast>
            <select
              id="profile-experience-select"
              value={draft.experience ?? ''}
              onChange={(e) => update('experience', (e.target.value || null) as Experience | null)}
              data-testid="profile-experience-select"
              className="px-2.5 py-1.5 border border-lineStrong rounded-xl bg-paper text-ink text-sm"
            >
              <option value="">—</option>
              {(Object.keys(EXPERIENCE_LABELS) as Array<keyof typeof EXPERIENCE_LABELS>).map((x) => (
                <option key={x} value={x}>{EXPERIENCE_LABELS[x]}</option>
              ))}
            </select>
          </SelectRow>
        </div>

        <button
          type="button"
          onClick={handleSave}
          data-testid="settings-profile-save"
          className="w-full mt-3 py-3 bg-brick text-paper rounded-[14px] text-base font-semibold flex items-center justify-center gap-2"
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

/**
 * §F-pass2-settings-profile-04 — ETA label din luna tinta ("Pana in").
 * Input month = 'YYYY-MM'. Returneaza un text Gigel-friendly cu lunile ramase
 * pana la luna tinta, sau null cand gol / data trecuta / invalid.
 */
function monthsUntil(targetMonth: string): string | null {
  if (!targetMonth) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(targetMonth);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12
  if (month < 1 || month > 12) return null;
  const now = new Date();
  const diff = (year - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
  if (diff < 0) return null;
  if (diff === 0) return 'Tinta luna aceasta';
  return `Estimat in ~${diff} ${diff === 1 ? 'luna' : 'luni'}`;
}

interface LabelRowProps {
  label: string;
  isLast?: boolean;
  children: JSX.Element;
}

function LabelRow({ label, isLast, children }: LabelRowProps): JSX.Element {
  // §6-M3 audit fix — implicit <label> wrap for INPUT children (WCAG 1.3.1 +
  // 4.1.2). Wrapping <label> binds the row text to the input without needing
  // htmlFor/id pair. Safe for <input> because label click focuses the input
  // (no double-dispatch concerns on Android Chrome).
  return (
    <label
      className={`flex items-center justify-between px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <span className="text-sm text-ink">{label}</span>
      {children}
    </label>
  );
}

interface SelectRowProps {
  label: string;
  htmlFor: string;
  isLast?: boolean;
  children: JSX.Element;
}

function SelectRow({ label, htmlFor, isLast, children }: SelectRowProps): JSX.Element {
  // §HIGH-1 audit fix (REVIEW-chat3-fresh-eyes) — explicit htmlFor/id binding
  // pentru SELECT children. NU folosim <label> wrap pentru selects deoarece pe
  // Android Chrome label click se poate re-dispatch la primul labelable
  // descendant — pe rand <select> poate cauza native dropdown sa pulseze
  // open/close (double-toggle). Sibling pattern <label htmlFor> + <select id>
  // pastreaza accessible name (WCAG 1.3.1 + 4.1.2) fara nesting risc.
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <label htmlFor={htmlFor} className="text-sm text-ink">{label}</label>
      {children}
    </div>
  );
}
