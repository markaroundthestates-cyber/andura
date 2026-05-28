// ══ SETTINGS PROFILE — Phase 6 task_09 Big 6 Edit Cont Sub-Screen ════════
// Mockup verbatim source: 04-architecture/mockups/andura-clasic.html
// #screen-settings-profile (L2016-2057). Big 6+1 edit reads/writes
// useOnboardingStore.data. Avatar initial + body composition section
// (§F-pass2-settings-profile-03) + targets section (§F-pass2-settings-
// profile-04) mockup parity. Inaltime = persistat in onboardingStore.data
// .height (P-02) — SettingsProfile editeaza aceeasi sursa care alimenteaza
// BMR (RE-U-01 reconciliere). Talie/gat + greutate-tinta = local form state
// V1 (onboardingStore NU le are inca); persistence Phase 7+ cand store extinde.
//
// Sub-screen pattern Phase 6: sub-header back btn + heading + scroll body.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useOnboardingStore, validateOnboardingField } from '../../../stores/onboardingStore';
import type { Sex, Goal, Frequency, Experience, OnboardingData } from '../../../stores/onboardingStore';
import { useProgresStore, latestBodyMeasurements } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { toast } from '../../../lib/toast';
import { SubHeader } from '../../../components/SubHeader';
import { getUserProfileDisplay } from './userProfile';
import { getCurrentWeightKg } from '../../../lib/userTdee';
import { estimateBF_USNavy } from '../../../../engine/usNavyBF.js';
import { estimateBfDeurenbergCapped, healthyFloorWeightKg } from '../../../../engine/bodyComposition.js';

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
  // §two-tier-bf — neck + waist persist in progresStore.bodyData (mirror waist/
  // hips). Seed local form din ultima intrare salvata (round-trip edit). Save
  // scrie o intrare noua doar cand exista valori (NU mai e discarded — A2 MED).
  const bodyData = useProgresStore((s) => s.bodyData);
  const addBodyDataEntry = useProgresStore((s) => s.addBodyDataEntry);
  // §weight-continuity — editarea greutatii in profil trebuie sa fie autoritara
  // peste un seed/log vechi. getCurrentWeightKg = ultima intrare weightLog >
  // onboarding (sursa canonica TDEE/BMR/BF%/proteine). Daca scriem DOAR in
  // onboarding (ca inainte), seed-ul de onboarding din weightLog (Onboarding.tsx
  // seedFromProfileIfEmpty) umbreste valoarea editata → 110 onboard apoi 50 in
  // profil = app foloseste tot 110. Fix: upsert intrarea de azi in weightLog pe
  // save cand greutatea s-a schimbat, ca sursa canonica sa reflecte editarea.
  const addWeightEntry = useProgresStore((s) => s.addWeightEntry);
  // Smoke 2026-05-28 #15 — agregam ultimele valori per camp peste TOT istoricul
  // (NU doar ultima intrare): cand gat-ul a fost introdus aici si piept-ul in
  // Progres → Masuratori, formularul Cont trebuie sa seedeze talie+gat din
  // istoric, nu sa cada gol pentru ca ultima intrare (Progres) n-are gat.
  const lastBody = latestBodyMeasurements(bodyData);
  // §F-cont-01 user-wire (HIGH-BETA chat 4) — read avatar initial din id_token
  // JWT claims. Cumulative cu Cont.tsx wire pentru parity across screens.
  const profile = getUserProfileDisplay();

  // Draft state pentru edit apoi save commit (avoid live store thrash)
  const [draft, setDraft] = useState<OnboardingData>(data);
  const [saved, setSaved] = useState(false);

  // §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
  // Talie + Gat = local form state V1 (NU persistat — onboardingStore NU are
  // aceste campuri; persistence Phase 7+ cand store extinde). Inaltime = NU mai
  // e stare locala separata (RE-U-01): citeste/scrie draft.height (P-02 store)
  // — aceeasi sursa care alimenteaza BMR. BF% US Navy ia inaltimea din draft.
  const [waist, setWaist] = useState(lastBody?.waistCm != null ? String(lastBody.waistCm) : '');
  const [neck, setNeck] = useState(lastBody?.neckCm != null ? String(lastBody.neckCm) : '');
  const [bfManual, setBfManual] = useState(false);
  const [bfOverride, setBfOverride] = useState('');

  // Build engine arg omitting empty fields (exactOptionalPropertyTypes — NU
  // pasa undefined explicit). Engine returns null daca lipseste vreun camp.
  // Inaltimea vine din draft.height (single source, P-02) — nu din stare locala.
  const bfArgs: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number } = {};
  if (draft.sex) bfArgs.sex = draft.sex;
  if (draft.height) bfArgs.height_cm = draft.height;
  if (neck) bfArgs.neck_cm = Number(neck);
  if (waist) bfArgs.waist_cm = Number(waist);
  const bfNavy = estimateBF_USNavy(bfArgs);
  // Two-tier — US-Navy cand talie+gat masurate (acurat), altfel Deurenberg cu
  // cap high-BMI (estimat populational din BMI/varsta/sex, mereu disponibil
  // post-onboarding). Smoke 2026-05-28 #1: cap-ul `min(Deurenberg, BMI×0.85)`
  // la BMI>=27 reduce bias-ul cunoscut al formulei la BMI mare.
  const { bfPct: bfDeurenberg } = estimateBfDeurenbergCapped({
    weightKg: draft.weight ?? NaN,
    heightCm: draft.height ?? NaN,
    ageYears: draft.age ?? NaN,
    ...(draft.sex ? { sex: draft.sex } : {}),
  });
  const bfAuto = bfNavy ?? bfDeurenberg;
  const bfSource = bfNavy != null ? 'US Navy' : bfDeurenberg != null ? 'Estimat' : '';

  // §obiectiv-tinta 2026-05-28 — Daniel smoke #8 ("tot ce e la Obiectiv trebuie
  // mutat la progres undeva"): "Tinte personale" (greutate tinta + pana in +
  // ETA + safety verdict) RELOCATED to Progres tab as ObiectivCard. Persistence
  // pe onboardingStore.targetWeight/targetDate (Smoke #16 — era doar form-state
  // V1; acum influenteaza kcal-ul coach-ului via engineWrappers.getTargetKcalToday,
  // NU doar notita profil). evaluateTargetRate + computeTargetEta utilizate in
  // ObiectivCard pentru safety verdict (cap fiziologic 1.5kg/sapt).

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
    // RE-U-01 — inaltimea e acum editabila (draft.height, P-02 store). Aplica
    // acelasi range gate ca age/weight inainte de commit (altfel BMR ar primi
    // o inaltime out-of-range din edit-path, ca §U-12 pentru Big 6).
    const heightCheck = validateOnboardingField('height', draft.height);
    if (!heightCheck.ok) {
      toast.show({ message: heightCheck.reason, variant: 'warning' });
      return;
    }
    // §weight-continuity — captureaza greutatea canonica curenta INAINTE de
    // commit ca sa detectam o schimbare reala (NU scriem un weigh-in fantoma in
    // timeline cand user-ul a editat doar goal/sex/etc).
    const priorWeight = getCurrentWeightKg();
    (Object.keys(draft) as Array<keyof OnboardingData>).forEach((key) => {
      setField(key, draft[key]);
    });
    // §weight-continuity — greutatea editata in profil devine autoritara: upsert
    // intrarea de AZI in weightLog (sursa canonica getCurrentWeightKg) cand
    // greutatea s-a schimbat. addWeightEntry face upsert-by-date (progresStore
    // U-10), deci suprascrie seed-ul/log-ul de azi → 110 onboard apoi 50 profil
    // = TDEE/BMR/BF%/proteine/Antrenor/Progres folosesc 50 imediat. Onboarding
    // ramane doar seed la cold-start. draft.weight deja validat range mai sus.
    if (draft.weight !== null && draft.weight !== priorWeight) {
      addWeightEntry({ kg: draft.weight, date: todayIso() });
    }
    // §two-tier-bf A2 MED fix — talie/gat NU mai sunt discarded: persist in
    // progresStore.bodyData (sursa US-Navy din nutritionProjection). Scriem o
    // intrare doar cand exista cel putin o masuratoare numerica valida.
    const waistNum = waist ? Number(waist) : NaN;
    const neckNum = neck ? Number(neck) : NaN;
    const entry: { date: string; waistCm?: number; neckCm?: number } = { date: todayIso() };
    if (Number.isFinite(waistNum) && waistNum > 0) entry.waistCm = waistNum;
    if (Number.isFinite(neckNum) && neckNum > 0) entry.neckCm = neckNum;
    if (entry.waistCm !== undefined || entry.neckCm !== undefined) {
      addBodyDataEntry(entry);
    }
    // §obiectiv-tinta 2026-05-28 — targetWeight + targetDate sunt persistate
    // direct in ObiectivCard (Progres tab) prin progresStore.setTargetObiectiv.
    // Aici nu mai persistam nimic legat de tinta. engineWrappers.getTargetKcal-
    // Today consuma progresStore.targetObiectiv (vezi integration commit).
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
              min={18}
              max={99}
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
            override manual. Inaltime = draft.height (P-02 store, RE-U-01) —
            aceeasi sursa care alimenteaza BMR; talie/gat = local V1. */}
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
              value={draft.height ?? ''}
              onChange={(e) => update('height', e.target.value ? Number(e.target.value) : null)}
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
              <span className="text-[11px] text-ink3" data-testid="profile-bf-source">{bfSource}</span>
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

        {/* §obiectiv-tinta 2026-05-28 (Daniel smoke #8) — "Tinte personale"
            (greutate tinta + pana in + ETA + safety verdict ritm 1.5kg/sapt)
            RELOCATED to Progres tab as ObiectivCard. Era ephemeral local form
            state aici; acum persistat (Smoke #16) ca sa influenteze tinta de
            kcal a coach-ului via engineWrappers.getTargetKcalToday. */}

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

/** Data locala YYYY-MM-DD pentru intrarea bodyData (aliniat cu BodyData.tsx). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// §obiectiv-tinta 2026-05-28 — SAFE_*/computeTargetEta/etaHorizonLabel/fmtKg
// MOVED to src/react/lib/targetEta.ts (shared with Progres > ObiectivCard).

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
