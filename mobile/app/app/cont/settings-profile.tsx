// ══ SETTINGS PROFILE (RN port, W6a) ══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsProfile.tsx — the Big 6+1
// edit hub. ALL state/handlers/engine wires kept verbatim: the draft state,
// handleSave (range gates via validateOnboardingField, weight-continuity
// upsert, bodyData entry, bf-override DB write), the BF derivations (US Navy /
// skinfold J-P / Deurenberg priority), getCurrentWeightKg, getUserProfileDisplay,
// the four section composition (PersonalSection / BodyCompSection /
// SkinfoldSection / TrainingSection). Only the screen SHELL markup is rewritten
// (section/div → ScrollView/View; SubHeader is the ported shared one; the Save
// <button> → Pressable). Every testID + i18n key preserved.
//
// Toast: web `toast.show` from src/react/lib/toast (pure module store, RN-safe).
// DB.get/set route through kv (W1b native-safe). Back nav via the RN nav shim.

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import {
  useOnboardingStore,
  validateOnboardingField,
} from '../../../../src/react/stores/onboardingStore';
import type { OnboardingData } from '../../../../src/react/stores/onboardingStore';
import { useProgresStore, latestBodyMeasurements } from '../../../../src/react/stores/progresStore';
import { DB } from '../../../../src/db.js';
import { toast } from '../../../../src/react/lib/toast';
import { getCurrentWeightKg } from '../../../../src/react/lib/userTdee';
import { estimateBF_USNavy } from '../../../../src/engine/usNavyBF.js';
import { estimateBF_skinfold3 } from '../../../../src/engine/skinfoldBF.js';
import { estimateBfDeurenbergCapped } from '../../../../src/engine/bodyComposition.js';
import { getUserProfileDisplay } from '../../../components/cont/userProfile';
import { t } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { PersonalSection } from '../../../components/cont/PersonalSection';
import { BodyCompSection } from '../../../components/cont/BodyCompSection';
import { SkinfoldSection } from '../../../components/cont/SkinfoldSection';
import { TrainingSection } from '../../../components/cont/TrainingSection';
import { goBack } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';

export default function SettingsProfile() {
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);
  const bodyData = useProgresStore((s) => s.bodyData);
  const addBodyDataEntry = useProgresStore((s) => s.addBodyDataEntry);
  const addWeightEntry = useProgresStore((s) => s.addWeightEntry);
  const lastBody = latestBodyMeasurements(bodyData);
  const profile = getUserProfileDisplay();

  const [draft, setDraft] = useState<OnboardingData>(data);
  const [saved, setSaved] = useState(false);

  const [waist, setWaist] = useState(lastBody?.waistCm != null ? String(lastBody.waistCm) : '');
  const [neck, setNeck] = useState(lastBody?.neckCm != null ? String(lastBody.neckCm) : '');
  const [hip, setHip] = useState(lastBody?.hipsCm != null ? String(lastBody.hipsCm) : '');
  const [skinfoldOn, setSkinfoldOn] = useState<boolean>(() =>
    lastBody?.chestSkinfoldMm != null ||
    lastBody?.abdomenSkinfoldMm != null ||
    lastBody?.thighSkinfoldMm != null ||
    lastBody?.tricepsSkinfoldMm != null ||
    lastBody?.suprailiacSkinfoldMm != null,
  );
  const [sfChest, setSfChest] = useState(lastBody?.chestSkinfoldMm != null ? String(lastBody.chestSkinfoldMm) : '');
  const [sfAbdomen, setSfAbdomen] = useState(lastBody?.abdomenSkinfoldMm != null ? String(lastBody.abdomenSkinfoldMm) : '');
  const [sfThigh, setSfThigh] = useState(lastBody?.thighSkinfoldMm != null ? String(lastBody.thighSkinfoldMm) : '');
  const [sfTriceps, setSfTriceps] = useState(lastBody?.tricepsSkinfoldMm != null ? String(lastBody.tricepsSkinfoldMm) : '');
  const [sfSuprailiac, setSfSuprailiac] = useState(lastBody?.suprailiacSkinfoldMm != null ? String(lastBody.suprailiacSkinfoldMm) : '');
  const [bfManual, setBfManual] = useState<boolean>(() => DB.get('bf-override') != null);
  const [bfOverride, setBfOverride] = useState<string>(() => {
    const v = DB.get('bf-override');
    return v != null ? String(v) : '';
  });

  // BF derivations — identical priority chain to web: skinfold J-P > US Navy >
  // Deurenberg (capped). Build engine args omitting empty fields.
  const bfArgs: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number; hip_cm?: number } = {};
  if (draft.sex) bfArgs.sex = draft.sex;
  if (draft.height) bfArgs.height_cm = draft.height;
  if (neck) bfArgs.neck_cm = Number(neck);
  if (waist) bfArgs.waist_cm = Number(waist);
  if (hip) bfArgs.hip_cm = Number(hip);
  const bfNavy = estimateBF_USNavy(bfArgs);
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
  const { bfPct: bfDeurenberg } = estimateBfDeurenbergCapped({
    weightKg: draft.weight ?? NaN,
    heightCm: draft.height ?? NaN,
    ageYears: draft.age ?? NaN,
    ...(draft.sex ? { sex: draft.sex } : {}),
  });
  const bfAuto = bfSkinfold ?? bfNavy ?? bfDeurenberg;
  const bfSource =
    bfSkinfold != null
      ? t('settings.profile.bfSourceSkinfold')
      : bfNavy != null
        ? t('settings.profile.bfSourceUsNavy')
        : bfDeurenberg != null
          ? t('settings.profile.bfSourceEstimated')
          : '';
  const bfNavyIncomplete = !bfManual && bfSkinfold == null && bfNavy == null && (!neck || !waist || !draft.height);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]): void {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function handleSave(): void {
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
    const heightCheck = validateOnboardingField('height', draft.height);
    if (!heightCheck.ok) {
      toast.show({ message: t(heightCheck.messageKey, heightCheck.params), variant: 'warning' });
      return;
    }
    const priorWeight = getCurrentWeightKg();
    (Object.keys(draft) as Array<keyof OnboardingData>).forEach((key) => {
      setField(key, draft[key]);
    });
    if (draft.weight !== null && draft.weight !== priorWeight) {
      addWeightEntry({ kg: draft.weight, date: todayIso() });
    }
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
    if (draft.sex === 'f') putNum(hip, (n) => { entry.hipsCm = n; });
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
    setSaved(true);
  }

  return (
    <View testID="settings-profile" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.profile.title')}
        onBack={goBack}
        testIdBack="settings-profile-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 20 }}>
          <View
            testID="settings-profile-initial"
            style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
          >
            <LinearGradient
              colors={[accent.volt, accent.aqua]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.onAccent }}>
                {profile.initial}
              </Text>
            </LinearGradient>
          </View>
        </View>

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

        <TrainingSection draft={draft} update={update} />

        <Pressable
          testID="settings-profile-save"
          accessibilityRole="button"
          onPress={handleSave}
          style={{ borderRadius: 999, overflow: 'hidden', marginTop: 12 }}
        >
          <LinearGradient
            colors={[accent.volt, accent.aqua]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
          >
            <Check size={16} color={dark.onAccent} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
              {t('settings.profile.confirmEditCta')}
            </Text>
          </LinearGradient>
        </Pressable>

        {saved && (
          <Text
            testID="settings-profile-saved"
            accessibilityRole="text"
            style={{ fontSize: 14, color: dark.ink2, textAlign: 'center', marginTop: 12 }}
          >
            {t('settings.profile.profileSavedStatus')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

/** Local YYYY-MM-DD for the bodyData entry (progresStore). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
