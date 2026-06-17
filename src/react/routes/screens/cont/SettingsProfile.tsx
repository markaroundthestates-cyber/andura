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
import type { OnboardingData } from '../../../stores/onboardingStore';
import { useProgresStore, latestBodyMeasurements } from '../../../stores/progresStore';
import { DB } from '../../../../db.js';
import { gotoPath } from '../../../lib/navigation';
import { toast } from '../../../lib/toast';
import { SubHeader } from '../../../components/SubHeader';
import { UserAvatar } from '../../../components/Avatar/UserAvatar';
import { useSettingsStore } from '../../../stores/settingsStore';
import { getUserProfileDisplay } from './userProfile';
import { getCurrentWeightKg } from '../../../lib/userTdee';
import { estimateBF_USNavy } from '../../../../engine/usNavyBF.js';
import { estimateBF_skinfold3 } from '../../../../engine/skinfoldBF.js';
import { estimateBfDeurenbergCapped } from '../../../../engine/bodyComposition.js';
import { t } from '../../../../i18n/index.js';
import { PersonalSection } from './settingsProfile/PersonalSection';
import { BodyCompSection } from './settingsProfile/BodyCompSection';
import { SkinfoldSection } from './settingsProfile/SkinfoldSection';
import { TrainingSection } from './settingsProfile/TrainingSection';
import { PreferencesSection } from './settingsProfile/PreferencesSection';

// §obiectiv-relocate 2026-05-28 — Goal selector relocated to Progres tab
// (ObiectivGoalCard). GOAL_LABELS dropped din SettingsProfile (Frecventa +
// Experienta raman aici — setup-once params, NU progress-tracking goal).
// frequencyLabel + EXPERIENCE_LABEL_KEYS moved to settingsProfile/TrainingSection.

// §body-measure-bounds — sane per-field circumference ranges (cm) shared by the
// save gate (hard block) AND the live inline error (BodyCompSection). Single
// source so the two never drift. Generous-but-human; neck<waist is enforced
// separately (the swapped-fields signature). Hip applies to women only (US-Navy
// female formula). These match the pre-existing save-gate values 1:1.
const BODY_MEASURE_BOUNDS = {
  neck: { min: 25, max: 60 },
  waist: { min: 50, max: 200 },
  hip: { min: 50, max: 200 },
} as const;

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
  // §avatar-profile-view fix (founder 2026-06-12 "avatarul nu e vizibil cand
  // user apasa pe butonul de profile din cont") — header arata acelasi avatar
  // ales ca pe ecranul Cont (settingsStore.avatarId). Inainte randa un pebble
  // gradient hardcodat doar cu initiala, ignorand preset-ul ales.
  const avatarId = useSettingsStore((s) => s.avatarId);

  // Draft state pentru edit apoi save commit (avoid live store thrash).
  // §weight-canonical-seed (C17-CROSSSTORE-01) — greutatea are DOUA copii:
  // onboarding.data.weight (NU se actualizeaza cand userul logheaza in Progres) si
  // progresStore.weightLog (log-ul curent). getCurrentWeightKg = sursa canonica
  // (ultima logata > onboarding) pe care o citeste TOATA app-ul. Seeduind draft
  // din `data` brut, campul arata vechea valoare onboarding (ex 110) desi Progres
  // arata 95 reala — si handleSave (priorWeight = getCurrentWeightKg() = 95) vedea
  // draft.weight 110 != 95 la ORICE save → scria un weigh-in fantoma 110 care
  // revertea greutatea canonica 95→110. Seed campul din canonica ca afiseze
  // greutatea curenta reala si guard-ul de continuitate sa nu mai declanseze fals.
  const [draft, setDraft] = useState<OnboardingData>(() => ({
    ...data,
    weight: getCurrentWeightKg() ?? data.weight,
  }));
  const [saved, setSaved] = useState(false);

  // §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
  // Talie + Gat = local form state V1 (NU persistat — onboardingStore NU are
  // aceste campuri; persistence Phase 7+ cand store extinde). Inaltime = NU mai
  // e stare locala separata (RE-U-01): citeste/scrie draft.height (P-02 store)
  // — aceeasi sursa care alimenteaza BMR. BF% US Navy ia inaltimea din draft.
  const [waist, setWaist] = useState(lastBody?.waistCm != null ? String(lastBody.waistCm) : '');
  const [neck, setNeck] = useState(lastBody?.neckCm != null ? String(lastBody.neckCm) : '');
  // §progress-v2 — sold (cm) intra in US Navy DOAR pentru femei (formula necesita
  // talie + sold − gat). Input afisat doar cand sex='f'. Persistat in bodyData.
  const [hip, setHip] = useState(lastBody?.hipsCm != null ? String(lastBody.hipsCm) : '');
  // §progress-v2 skinfold (avansat, optional) — caliper sites (mm), J-P 3 puncte.
  // Men: piept/abdomen/coapsa; Women: triceps/suprailiac/coapsa. Cand toate cele
  // 3 site-uri valide → BF foloseste J-P (mai acurat) peste US Navy (vezi BF wire).
  const [skinfoldOn, setSkinfoldOn] = useState<boolean>(() =>
    lastBody?.chestSkinfoldMm != null ||
    lastBody?.abdomenSkinfoldMm != null ||
    lastBody?.thighSkinfoldMm != null ||
    lastBody?.tricepsSkinfoldMm != null ||
    lastBody?.suprailiacSkinfoldMm != null
  );
  const [sfChest, setSfChest] = useState(lastBody?.chestSkinfoldMm != null ? String(lastBody.chestSkinfoldMm) : '');
  const [sfAbdomen, setSfAbdomen] = useState(lastBody?.abdomenSkinfoldMm != null ? String(lastBody.abdomenSkinfoldMm) : '');
  const [sfThigh, setSfThigh] = useState(lastBody?.thighSkinfoldMm != null ? String(lastBody.thighSkinfoldMm) : '');
  const [sfTriceps, setSfTriceps] = useState(lastBody?.tricepsSkinfoldMm != null ? String(lastBody.tricepsSkinfoldMm) : '');
  const [sfSuprailiac, setSfSuprailiac] = useState(lastBody?.suprailiacSkinfoldMm != null ? String(lastBody.suprailiacSkinfoldMm) : '');
  // §08.038 — manual BF% override. Pre-fix bfManual/bfOverride era useState pur
  // ARUNCAT la Save (override-ul nu avea NICIUN efect — Gigel bifa, scria 18%,
  // salva, si app tot folosea estimarea). Acum seedeaza din `bf-override`
  // (Tier-0 SYNC_KEY existent, citit de sys.getBF() care "wins everything") ca
  // sa fie round-trip editabil, si se consuma pe save (vezi handleSave) +
  // downstream (BodyFatStrip respecta acelasi override). seed o singura data la
  // mount (lazy initializer) — NU re-seed la fiecare render.
  const [bfManual, setBfManual] = useState<boolean>(() => DB.get('bf-override') != null);
  const [bfOverride, setBfOverride] = useState<string>(() => {
    const v = DB.get('bf-override');
    return v != null ? String(v) : '';
  });

  // Build engine arg omitting empty fields (exactOptionalPropertyTypes — NU
  // pasa undefined explicit). Engine returns null daca lipseste vreun camp.
  // Inaltimea vine din draft.height (single source, P-02) — nu din stare locala.
  const bfArgs: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number; hip_cm?: number } = {};
  if (draft.sex) bfArgs.sex = draft.sex;
  if (draft.height) bfArgs.height_cm = draft.height;
  if (neck) bfArgs.neck_cm = Number(neck);
  if (waist) bfArgs.waist_cm = Number(waist);
  // §progress-v2 — sold doar pentru femei (US Navy female necesita sold).
  if (hip) bfArgs.hip_cm = Number(hip);
  const bfNavy = estimateBF_USNavy(bfArgs);
  // §progress-v2 — skinfold J-P (mai acurat) cand toate cele 3 site-uri prezente.
  // Site-urile depind de sex; engine alege singur. Necesita varsta (intra in formula).
  const sfArgs: {
    sex?: string;
    age?: number;
    chest_mm?: number;
    abdomen_mm?: number;
    thigh_mm?: number;
    triceps_mm?: number;
    suprailiac_mm?: number;
  } = {};
  if (draft.sex) sfArgs.sex = draft.sex;
  if (draft.age) sfArgs.age = draft.age;
  if (sfChest) sfArgs.chest_mm = Number(sfChest);
  if (sfAbdomen) sfArgs.abdomen_mm = Number(sfAbdomen);
  if (sfThigh) sfArgs.thigh_mm = Number(sfThigh);
  if (sfTriceps) sfArgs.triceps_mm = Number(sfTriceps);
  if (sfSuprailiac) sfArgs.suprailiac_mm = Number(sfSuprailiac);
  const bfSkinfold = skinfoldOn ? estimateBF_skinfold3(sfArgs) : null;
  // Tier — Deurenberg cu cap high-BMI (estimat populational din BMI/varsta/sex,
  // mereu disponibil post-onboarding). Smoke 2026-05-28 #1: cap-ul `min(Deurenberg,
  // BMI×0.85)` la BMI>=27 reduce bias-ul cunoscut al formulei la BMI mare.
  const { bfPct: bfDeurenberg } = estimateBfDeurenbergCapped({
    weightKg: draft.weight ?? NaN,
    heightCm: draft.height ?? NaN,
    ageYears: draft.age ?? NaN,
    ...(draft.sex ? { sex: draft.sex } : {}),
  });
  // Priority auto: skinfold (most accurate) > US Navy > Deurenberg.
  const bfAuto = bfSkinfold ?? bfNavy ?? bfDeurenberg;
  const bfSource =
    bfSkinfold != null
      ? t('settings.profile.bfSourceSkinfold')
      : bfNavy != null
        ? t('settings.profile.bfSourceUsNavy')
        : bfDeurenberg != null
          ? t('settings.profile.bfSourceEstimated')
          : '';
  // §bf-hint smoke #1 — US Navy cere gat + talie + inaltime (+ sex) ca sa
  // calculeze; daca user-ul completeaza doar unul, bfNavy ramane null si BF%
  // nu se schimba vizibil (Gigel crede ca e bug). Arata un hint inline cat
  // timp masuratorile US-Navy sunt incomplete (NU pe override manual).
  const bfNavyIncomplete =
    !bfManual && bfSkinfold == null && bfNavy == null && (!neck || !waist || !draft.height);

  // §body-measure-inline (founder 2026-06-12 "am pus waist 1000 cm si neck 430
  // cm si andura ma lasa") — the save gate below already BLOCKS out-of-range
  // body measurements, but it only surfaced a toast on the save attempt. Mirror
  // the same bounds (BODY_MEASURE_BOUNDS) into a LIVE inline check so an absurd
  // value (waist 1000 / neck 430) flags the field + shows a friendly message as
  // the user types — same pattern as the BF override error. Save stays the hard
  // block; this is the visible feedback. Only fields the user typed are checked.
  const measureOutOfRange = (raw: string, lo: number, hi: number): boolean => {
    if (!raw.trim()) return false;
    const n = Number(raw);
    return Number.isFinite(n) && (n < lo || n > hi);
  };
  const waistInvalid = measureOutOfRange(waist, BODY_MEASURE_BOUNDS.waist.min, BODY_MEASURE_BOUNDS.waist.max);
  const neckInvalid = measureOutOfRange(neck, BODY_MEASURE_BOUNDS.neck.min, BODY_MEASURE_BOUNDS.neck.max);
  const hipInvalid =
    draft.sex === 'f' && measureOutOfRange(hip, BODY_MEASURE_BOUNDS.hip.min, BODY_MEASURE_BOUNDS.hip.max);
  // Neck >= waist (swapped-fields signature) — only when both are present + in
  // their bands (an out-of-range value is flagged by the range error first).
  const neckN = Number(neck);
  const waistN = Number(waist);
  const neckWaistSwapped =
    !waistInvalid &&
    !neckInvalid &&
    neck.trim() !== '' &&
    waist.trim() !== '' &&
    Number.isFinite(neckN) &&
    Number.isFinite(waistN) &&
    neckN >= waistN;
  const bodyMeasureError = neckWaistSwapped
    ? t('settings.profile.bodyMeasureNeckWaist')
    : waistInvalid || neckInvalid || hipInvalid
      ? t('settings.profile.bodyMeasureRange')
      : '';

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
    // Store emits a semantic key (+ {min,max} params); resolve to localized copy
    // via t() here at the React boundary (i18n leak fix audit 09 store-evading).
    const ageCheck = validateOnboardingField('age', draft.age);
    if (!ageCheck.ok) {
      toast.show({ message: t(ageCheck.messageKey, ageCheck.params), variant: 'warning' });
      return;
    }
    const weightCheck = validateOnboardingField('weight', draft.weight);
    if (!weightCheck.ok) {
      toast.show({ message: t(weightCheck.messageKey, weightCheck.params), variant: 'warning' });
      return;
    }
    // RE-U-01 — inaltimea e acum editabila (draft.height, P-02 store). Aplica
    // acelasi range gate ca age/weight inainte de commit (altfel BMR ar primi
    // o inaltime out-of-range din edit-path, ca §U-12 pentru Big 6).
    const heightCheck = validateOnboardingField('height', draft.height);
    if (!heightCheck.ok) {
      toast.show({ message: t(heightCheck.messageKey, heightCheck.params), variant: 'warning' });
      return;
    }
    // Body-composition input gate (Daniel audit — neck 103 / waist 42 swapped
    // got stored, feeding an unreliable BF%). The US-Navy formula self-guards
    // (waist-neck<=0 → null), but a swapped/out-of-range entry still landed in
    // bodyData unfiltered. Block the bad save with a clear message rather than
    // silently storing garbage: enforce sane per-field ranges + neck < waist.
    // Only fields the user actually entered are checked (empty = untouched).
    const numOrNull = (raw: string): number | null => {
      if (!raw.trim()) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    };
    const neckNum = numOrNull(neck);
    const waistNum = numOrNull(waist);
    const hipNum = numOrNull(hip);
    const outOfRange =
      (neckNum !== null && (neckNum < BODY_MEASURE_BOUNDS.neck.min || neckNum > BODY_MEASURE_BOUNDS.neck.max)) ||
      (waistNum !== null && (waistNum < BODY_MEASURE_BOUNDS.waist.min || waistNum > BODY_MEASURE_BOUNDS.waist.max)) ||
      (draft.sex === 'f' && hipNum !== null && (hipNum < BODY_MEASURE_BOUNDS.hip.min || hipNum > BODY_MEASURE_BOUNDS.hip.max));
    if (outOfRange) {
      toast.show({ message: t('settings.profile.bodyMeasureRange'), variant: 'warning' });
      return;
    }
    // Neck must be smaller than waist — the US-Navy waist-neck circumference
    // proxy is meaningless otherwise (and neck>=waist is the swapped-fields
    // signature). Checked only when both are present.
    if (neckNum !== null && waistNum !== null && neckNum >= waistNum) {
      toast.show({ message: t('settings.profile.bodyMeasureNeckWaist'), variant: 'warning' });
      return;
    }
    // §weight-continuity — captureaza greutatea canonica curenta INAINTE de
    // commit ca sa detectam o schimbare reala (NU scriem un weigh-in fantoma in
    // timeline cand user-ul a editat doar goal/sex/etc).
    const priorWeight = getCurrentWeightKg();
    // §freq-edit-reseed — captureaza frecventa INAINTE de commit ca sa stim daca
    // s-a schimbat (data e valoarea live din store la render, draft = editarea).
    const priorFrequency = data.frequency;
    (Object.keys(draft) as Array<keyof OnboardingData>).forEach((key) => {
      setField(key, draft[key]);
    });
    // §focus-revert fix (BUG split 2026-06-03) — advance the onboarding edit clock so
    // the cloud-hydrate LWW (storeSync onboarding apply, keyed on completedAt) treats
    // THIS device's profile as the newest and never reverts edited fields (focusPreset/
    // frequency/...) to a stale cloud copy on next boot. completedAt was frozen at
    // onboarding finalize and never advanced on a profile edit, so a profile change
    // (e.g. balanced→v-taper) was silently overwritten back on every app open.
    useOnboardingStore.setState({ completedAt: Date.now() });
    // §freq-edit-reseed — onboarding seedeaza calendarul saptamanal din frequency
    // (scheduleStore.resetWeekly → defaultWeekForFrequency). Engine-ul rezolva
    // saptamana activa cu precedenta override ?? scheduleStore ?? frequency, deci
    // `days` persistat din scheduleStore CASTIGA peste user.frequency. Cand
    // frecventa se editeaza aici fara re-seed, engine-ul construia in continuare
    // programul cu vechea frecventa (zile + split gresit) pana la urmatoarea Luni.
    // Re-derivam calendarul din noua frecventa — DAR doar cand userul NU si-a
    // personalizat manual calendarul (un override de saptamana curenta), ca sa nu
    // ii suprascriem alegerea explicita. Lazy import rupe ciclul scheduleStore→
    // onboardingStore (oglindeste onboardingStore.finalize). Best-effort.
    if (draft.frequency !== priorFrequency) {
      void import('../../../../engine/schedule/scheduleAdapter.js')
        .then((m) => {
          if (m.getCalendarOverride()) return; // calendar personalizat — pastreaza-l
          return import('../../../stores/scheduleStore')
            .then((s) => s.useScheduleStore.getState().resetWeekly());
        })
        .catch(() => { /* schedule re-seed best-effort */ });
    }
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
    const entry: {
      date: string;
      waistCm?: number;
      neckCm?: number;
      hipsCm?: number;
      chestSkinfoldMm?: number;
      abdomenSkinfoldMm?: number;
      thighSkinfoldMm?: number;
      tricepsSkinfoldMm?: number;
      suprailiacSkinfoldMm?: number;
    } = { date: todayIso() };
    const putNum = (raw: string, set: (n: number) => void): void => {
      if (!raw) return;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) set(n);
    };
    putNum(waist, (n) => { entry.waistCm = n; });
    putNum(neck, (n) => { entry.neckCm = n; });
    // §progress-v2 — sold persistat doar pentru femei (singura formula care-l cere).
    if (draft.sex === 'f') putNum(hip, (n) => { entry.hipsCm = n; });
    // §progress-v2 skinfold — persist doar cand toggle ON. Site-uri per sex
    // (men piept/abdomen, women triceps/suprailiac); coapsa comuna ambelor.
    if (skinfoldOn) {
      if (draft.sex === 'f') {
        putNum(sfTriceps, (n) => { entry.tricepsSkinfoldMm = n; });
        putNum(sfSuprailiac, (n) => { entry.suprailiacSkinfoldMm = n; });
      } else {
        putNum(sfChest, (n) => { entry.chestSkinfoldMm = n; });
        putNum(sfAbdomen, (n) => { entry.abdomenSkinfoldMm = n; });
      }
      putNum(sfThigh, (n) => { entry.thighSkinfoldMm = n; });
    }
    if (Object.keys(entry).length > 1) {
      addBodyDataEntry(entry);
    }
    // §08.038 — manual BF% override consum pe save (era discarded). Cand bifa e
    // ON + valoare valida (3-60%, banda input), scrie `bf-override` (Tier-0
    // SYNC_KEY → sincronizat cloud + citit de sys.getBF() care il prioritizeaza
    // peste orice calcul + de BodyFatStrip). Cand bifa e OFF, sterge override-ul
    // (revine la auto US-Navy/Deurenberg). Valoare invalida cu bifa ON →
    // pastreaza auto (NU scrie un override stricat). NU blocheaza save-ul.
    if (bfManual) {
      const ov = Number(bfOverride);
      if (Number.isFinite(ov) && ov >= 3 && ov <= 60) {
        DB.set('bf-override', ov);
      } else {
        DB.set('bf-override', null);
      }
    } else {
      DB.set('bf-override', null);
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
      className="min-h-screen flex flex-col"
      data-testid="settings-profile"
    >
      <SubHeader
        title={t('settings.profile.title')}
        onBack={handleBack}
        testIdBack="settings-profile-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col items-center gap-2.5 pt-2 pb-5">
          {/* Avatar — chosen preset (Avatar/UserAvatar, settingsStore.avatarId)
              or the gradient-initial fallback when none picked. Matches the Cont
              hero so the profile view shows the SAME avatar the user picked
              (§avatar-profile-view fix). 80px + aqua glow halo keeps the prior
              pebble rhythm. The initial-fallback branch preserves the
              `settings-profile-initial` testid contract. */}
          <UserAvatar
            avatarId={avatarId}
            size={80}
            initial={profile.initial}
            initialTestId="settings-profile-initial"
            label={t('cont.avatar.heroLabel')}
            className="shadow-[0_0_28px_-6px_var(--aqua)]"
          />
        </div>

        <PersonalSection draft={draft} update={update} />

        <BodyCompSection
          draft={draft}
          update={update}
          waist={waist}
          setWaist={setWaist}
          neck={neck}
          setNeck={setNeck}
          hip={hip}
          setHip={setHip}
          bfAuto={bfAuto}
          bfSource={bfSource}
          bfManual={bfManual}
          setBfManual={setBfManual}
          bfOverride={bfOverride}
          setBfOverride={setBfOverride}
          bfNavyIncomplete={bfNavyIncomplete}
          waistInvalid={waistInvalid}
          neckInvalid={neckInvalid}
          hipInvalid={hipInvalid}
          bodyMeasureError={bodyMeasureError}
        />

        <SkinfoldSection
          draft={draft}
          skinfoldOn={skinfoldOn}
          setSkinfoldOn={setSkinfoldOn}
          sfChest={sfChest}
          setSfChest={setSfChest}
          sfAbdomen={sfAbdomen}
          setSfAbdomen={setSfAbdomen}
          sfThigh={sfThigh}
          setSfThigh={setSfThigh}
          sfTriceps={sfTriceps}
          setSfTriceps={setSfTriceps}
          sfSuprailiac={sfSuprailiac}
          setSfSuprailiac={setSfSuprailiac}
        />

        {/* §obiectiv-tinta 2026-05-28 (Daniel smoke #8) — "Tinte personale"
            (greutate tinta + pana in + ETA + safety verdict ritm 1.5kg/sapt)
            RELOCATED to Progres tab as ObiectivCard. Era ephemeral local form
            state aici; acum persistat (Smoke #16) ca sa influenteze tinta de
            kcal a coach-ului via engineWrappers.getTargetKcalToday. */}

        <TrainingSection draft={draft} update={update} />

        {/* #81/#82 — refused movements + equipment profile, editable later
            (set optionally at onboarding). Same draft/update path → committed
            by handleSave's setField loop. */}
        <PreferencesSection draft={draft} update={update} />

        <button
          type="button"
          onClick={handleSave}
          data-testid="settings-profile-save"
          className="btn-grad btn-primary-lift press-feedback w-full mt-3 py-3 rounded-full text-base font-semibold flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          {t('settings.profile.confirmEditCta')}
        </button>

        {saved && (
          <p
            className="text-sm text-ink2 text-center mt-3"
            role="status"
            data-testid="settings-profile-saved"
          >
            {t('settings.profile.profileSavedStatus')}
          </p>
        )}
      </div>
    </section>
  );
}

/** Data locala YYYY-MM-DD pentru intrarea bodyData (progresStore). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// §obiectiv-tinta 2026-05-28 — SAFE_*/computeTargetEta/etaHorizonLabel/fmtKg
// MOVED to src/react/lib/targetEta.ts (shared with Progres > ObiectivCard).
// LabelRow + SelectRow MOVED to settingsProfile/rows.tsx (shared with the
// extracted field sections — hygiene split, zero behavior change).
