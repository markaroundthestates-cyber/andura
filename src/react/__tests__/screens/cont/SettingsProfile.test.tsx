// Phase 6 task_09 — SettingsProfile sub-screen tests.
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import {
  getCurrentWeightKg,
  readUserWeightKg,
  readUserMaintenanceTDEE,
  computeProteinTargetG,
  computeMifflinStJeorBMR,
} from '../../../lib/userTdee';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });
import { toast } from '../../../lib/toast';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-profile']}>
      <Routes>
        <Route path="/app/cont/settings-profile" element={<SettingsProfile />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useOnboardingStore.setState({
    data: {
      age: 31,
      sex: 'm',
      goal: 'masa',
      frequency: '4',
      experience: 'intermediar',
      weight: 81,
      height: 175,
    },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
  toast.clear();
});

// Minimal JWT fake helper for tests (display-only, NU signature validation).
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (s: string): string => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const head = b64(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = b64(JSON.stringify(payload));
  return `${head}.${body}.sig`;
}

describe('SettingsProfile — render', () => {
  it('renders heading "Profil si tinte"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Profil si tinte/i, level: 1 })).toBeInTheDocument();
  });

  it('§F-cont-01 avatar initial defaults la "A" daca unauthenticated', () => {
    renderScreen();
    expect(screen.getByTestId('settings-profile-initial').textContent).toBe('A');
  });

  it('§F-cont-01 avatar initial wired din id_token JWT', () => {
    localStorage.setItem('firebase-id-token', fakeJwt({ email: 'daniel@andura.app', name: 'Daniel' }));
    renderScreen();
    expect(screen.getByTestId('settings-profile-initial').textContent).toBe('D');
  });

  it('renders back button cu aria-label "Inapoi" (RO pinned by test)', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Inapoi/i })).toBeInTheDocument();
  });

  it('renders age input cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-age-input')).toHaveValue(31);
  });

  it('renders weight input cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-weight-input')).toHaveValue(81);
  });

  it('renders sex select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-sex-select')).toHaveValue('m');
  });

  // §obiectiv-relocate 2026-05-28 — goal select moved to Progres > ObiectivGoalCard.
  // Frecventa + Experienta raman aici (setup-once params, NU progress-tracking).
  it('does NOT render goal select (relocated to Progres tab)', () => {
    renderScreen();
    expect(screen.queryByTestId('profile-goal-select')).not.toBeInTheDocument();
  });

  it('renders frequency select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-frequency-select')).toHaveValue('4');
  });

  it('renders experience select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-experience-select')).toHaveValue('intermediar');
  });

  it('renders Confirma editare CTA', () => {
    renderScreen();
    expect(screen.getByTestId('settings-profile-save')).toBeInTheDocument();
  });
});

describe('SettingsProfile — interactions', () => {
  it('age input onChange updates draft', () => {
    renderScreen();
    const input = screen.getByTestId('profile-age-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '32' } });
    expect(input.value).toBe('32');
  });

  it('save commits draft to onboardingStore', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '80' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.weight).toBe(80);
  });

  it('save shows confirmation status', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(screen.getByTestId('settings-profile-saved')).toBeInTheDocument();
    expect(screen.getByTestId('settings-profile-saved').textContent).toMatch(/Profil salvat/);
  });

  it('back button navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('changing sex propagates pe save', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-sex-select'), { target: { value: 'f' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.sex).toBe('f');
  });

  // §obiectiv-relocate 2026-05-28 — goal change tested via ObiectivGoalCard
  // (Progres tab) instead of SettingsProfile. Frecventa change propagation
  // covered below.
  it('changing frequency propagates pe save', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-frequency-select'), { target: { value: '3' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.frequency).toBe('3');
  });

  // Training type toggle (Daniel spec 2026-05-30) — change gym/aerobic/both later.
  it('renders training type select cu default gym (legacy store fara trainingType)', () => {
    renderScreen();
    expect(screen.getByTestId('profile-training-type-select')).toHaveValue('gym');
  });

  it('changing training type to aerobic propagates pe save', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-training-type-select'), { target: { value: 'aerobic' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.trainingType).toBe('aerobic');
  });
});

// Focus selector (D-focus 2026-06-02) — pick your look (Balanced default).
describe('SettingsProfile — focus selector', () => {
  it('renders focus select defaulting to Balanced (Echilibrat)', () => {
    renderScreen();
    expect(screen.getByTestId('profile-focus-select')).toHaveValue('balanced');
  });

  it('selecting a preset persists pe save + reflects din store', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-focus-select'), { target: { value: 'v-taper' } });
    expect(screen.getByTestId('profile-focus-select')).toHaveValue('v-taper');
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.focusPreset).toBe('v-taper');
  });

  it('heads-up note ABSENT for the balanced default', () => {
    renderScreen();
    expect(screen.queryByTestId('profile-focus-deemph-note')).toBeNull();
  });

  it('heads-up note SHOWS for a de-emphasizing preset (v-taper), calm + RO no-diacritics', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-focus-select'), { target: { value: 'v-taper' } });
    const note = screen.getByTestId('profile-focus-deemph-note');
    expect(note).toBeInTheDocument();
    // No-guilt maintenance tone + RO no-diacritics (no a-breve/t-comma/etc.).
    expect(note.textContent).toMatch(/mentenanta/);
    expect(note.textContent ?? '').not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  it('heads-up note ABSENT for an emphasis-only preset (arms)', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-focus-select'), { target: { value: 'arms' } });
    expect(screen.queryByTestId('profile-focus-deemph-note')).toBeNull();
  });
});

describe('SettingsProfile — Compozitie corporala (§F-pass2-settings-profile-03)', () => {
  it('renders Compozitie corporala section heading', () => {
    renderScreen();
    expect(screen.getByText('Compozitie corporala')).toBeInTheDocument();
  });

  it('renders Talie + Gat + Inaltime inputs', () => {
    renderScreen();
    expect(screen.getByTestId('profile-waist-input')).toBeInTheDocument();
    expect(screen.getByTestId('profile-neck-input')).toBeInTheDocument();
    expect(screen.getByTestId('profile-height-input')).toBeInTheDocument();
  });

  it('BF% auto shows Deurenberg ESTIMATE cand lipsesc masuratori (two-tier)', () => {
    renderScreen();
    // beforeEach onboarding stats present (81kg/175cm/31yo/m) → Deurenberg fallback.
    expect(screen.getByTestId('profile-bf-auto').textContent).toMatch(/^\d+(\.\d+)?%$/);
    expect(screen.getByTestId('profile-bf-source').textContent).toBe('Estimat');
  });

  it('BF% auto switches to US Navy (sursa "US Navy") cand talie+gat+inaltime filled', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '38' } });
    fireEvent.change(screen.getByTestId('profile-height-input'), { target: { value: '180' } });
    // sex 'm' din store beforeEach — engine returns a finite %.
    expect(screen.getByTestId('profile-bf-auto').textContent).toMatch(/^\d+(\.\d+)?%$/);
    expect(screen.getByTestId('profile-bf-source').textContent).toBe('US Navy');
  });

  it('talie+gat persista in progresStore.bodyData pe save (A2 MED — NU mai discarded)', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '38' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    const last = useProgresStore.getState().bodyData.at(-1);
    expect(last?.waistCm).toBe(85);
    expect(last?.neckCm).toBe(38);
  });

  // §progress-v2 — sold (US Navy female) afisat doar pentru femei.
  it('sold input ascuns pentru barbati (sex m din store)', () => {
    renderScreen();
    expect(screen.queryByTestId('profile-hip-input')).not.toBeInTheDocument();
  });

  it('sold input afisat pentru femei', () => {
    useOnboardingStore.getState().setField('sex', 'f');
    renderScreen();
    expect(screen.getByTestId('profile-hip-input')).toBeInTheDocument();
  });

  it('femeie: talie+gat+sold persista in bodyData pe save', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    useOnboardingStore.getState().setField('sex', 'f');
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '72' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '32' } });
    fireEvent.change(screen.getByTestId('profile-hip-input'), { target: { value: '96' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    const last = useProgresStore.getState().bodyData.at(-1);
    expect(last?.waistCm).toBe(72);
    expect(last?.neckCm).toBe(32);
    expect(last?.hipsCm).toBe(96);
  });

  // §progress-v2 — skinfold avansat optional: collapsed default, toggle reveals.
  it('panoul skinfold e ascuns default + dezvaluit de toggle (men sites)', () => {
    renderScreen();
    expect(screen.queryByTestId('profile-skinfold-panel')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('profile-skinfold-toggle'));
    expect(screen.getByTestId('profile-skinfold-panel')).toBeInTheDocument();
    // sex 'm' din beforeEach → site-uri piept/abdomen/coapsa.
    expect(screen.getByTestId('profile-skinfold-chest')).toBeInTheDocument();
    expect(screen.getByTestId('profile-skinfold-abdomen')).toBeInTheDocument();
    expect(screen.getByTestId('profile-skinfold-thigh')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-skinfold-triceps')).not.toBeInTheDocument();
  });

  it('femeie: panoul skinfold arata site-urile triceps/suprailiac/coapsa', () => {
    useOnboardingStore.getState().setField('sex', 'f');
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-skinfold-toggle'));
    expect(screen.getByTestId('profile-skinfold-triceps')).toBeInTheDocument();
    expect(screen.getByTestId('profile-skinfold-suprailiac')).toBeInTheDocument();
    expect(screen.getByTestId('profile-skinfold-thigh')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-skinfold-chest')).not.toBeInTheDocument();
  });

  it('skinfold prezent -> BF% sursa "Pliuri" (J-P overrides US Navy)', () => {
    renderScreen();
    // US Navy complet (talie+gat+inaltime, sex m din store).
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '38' } });
    fireEvent.change(screen.getByTestId('profile-height-input'), { target: { value: '180' } });
    expect(screen.getByTestId('profile-bf-source').textContent).toBe('US Navy');
    // Adauga skinfold valid → sursa devine Pliuri (mai acurat).
    fireEvent.click(screen.getByTestId('profile-skinfold-toggle'));
    fireEvent.change(screen.getByTestId('profile-skinfold-chest'), { target: { value: '12' } });
    fireEvent.change(screen.getByTestId('profile-skinfold-abdomen'), { target: { value: '20' } });
    fireEvent.change(screen.getByTestId('profile-skinfold-thigh'), { target: { value: '14' } });
    expect(screen.getByTestId('profile-bf-source').textContent).toBe('Pliuri');
  });

  it('skinfold sites persista in bodyData pe save (men)', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-skinfold-toggle'));
    fireEvent.change(screen.getByTestId('profile-skinfold-chest'), { target: { value: '12' } });
    fireEvent.change(screen.getByTestId('profile-skinfold-abdomen'), { target: { value: '20' } });
    fireEvent.change(screen.getByTestId('profile-skinfold-thigh'), { target: { value: '14' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    const last = useProgresStore.getState().bodyData.at(-1);
    expect(last?.chestSkinfoldMm).toBe(12);
    expect(last?.abdomenSkinfoldMm).toBe(20);
    expect(last?.thighSkinfoldMm).toBe(14);
  });

  it('BF% manual override input disabled pana la check', () => {
    renderScreen();
    const override = screen.getByTestId('profile-bf-override') as HTMLInputElement;
    expect(override.disabled).toBe(true);
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    expect(override.disabled).toBe(false);
  });

  // §08.038 — manual BF% override consum pe save (era discarded). Scrie
  // `bf-override` (Tier-0 SYNC_KEY citit de sys.getBF + BodyFatStrip).
  it('BF% override persista in bf-override pe save cand bifa ON + valoare valida', async () => {
    const { DB } = await import('../../../../db.js');
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    fireEvent.change(screen.getByTestId('profile-bf-override'), { target: { value: '18.5' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(DB.get('bf-override')).toBe(18.5);
  });

  it('BF% override sters din bf-override pe save cand bifa OFF (revine la auto)', async () => {
    const { DB } = await import('../../../../db.js');
    DB.set('bf-override', 22); // override pre-existent
    renderScreen();
    // bifa porneste ON (seed din bf-override) — o dezactivam.
    expect((screen.getByTestId('profile-bf-manual') as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(DB.get('bf-override')).toBeNull();
  });

  it('BF% override invalid (peste banda) cu bifa ON NU scrie un override stricat', async () => {
    const { DB } = await import('../../../../db.js');
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    fireEvent.change(screen.getByTestId('profile-bf-override'), { target: { value: '99' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(DB.get('bf-override')).toBeNull(); // revine la auto, NU 99
  });

  // BF range feedback (2026-05-31) — o valoare in afara intervalului 3-60% (ex: 90)
  // era acceptata-apoi-dropata in tacere. Acum apare un mesaj inline VIZIBIL +
  // border rosu pe input, in loc de drop silentios.
  it('BF% override in afara intervalului (90) → mesaj inline vizibil + aria-invalid', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    fireEvent.change(screen.getByTestId('profile-bf-override'), { target: { value: '90' } });
    const err = screen.getByTestId('profile-bf-range-error');
    expect(err).toBeInTheDocument();
    expect(err.textContent).toMatch(/3-60/);
    expect((screen.getByTestId('profile-bf-override') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
    // Fara diacritice (D-LEGACY-064).
    expect(/[ăâîșțĂÂÎȘȚ]/.test(err.textContent ?? '')).toBe(false);
  });

  it('BF% override valid (18.5) → fara mesaj de eroare', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    fireEvent.change(screen.getByTestId('profile-bf-override'), { target: { value: '18.5' } });
    expect(screen.queryByTestId('profile-bf-range-error')).not.toBeInTheDocument();
  });

  // RE-U-01 — inaltimea = single source (onboardingStore.data.height, P-02), NU
  // stare locala separata. Campul porneste din store + persista la save → BMR
  // (BMRStrip) reflecta valoarea editata aici.
  it('inaltime input porneste din onboardingStore.data.height (NU gol)', () => {
    renderScreen();
    // beforeEach store height: 175
    expect(screen.getByTestId('profile-height-input')).toHaveValue(175);
  });

  it('editarea inaltimii persista in onboardingStore pe save (single source BMR)', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-height-input'), { target: { value: '182' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.height).toBe(182);
  });

  it('respinge inaltime out-of-range pe save — store neschimbat + toast', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-height-input'), { target: { value: '300' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.height).toBe(175);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
    const items = toast.getSnapshot();
    expect(items.some((t) => t.variant === 'warning' && /Inaltime intre 120 si 230/.test(String(t.message)))).toBe(true);
  });
});

// §obiectiv-tinta 2026-05-28 — "SettingsProfile > Tinte personale" describe
// block REMOVED: Tinte personale relocated to Progres tab as ObiectivCard
// (Daniel verbatim "tot ce e la Obiectiv pe toate themes trebuie mutat la
// progres undeva"). All BUG #8 safe-rate ETA + subponderal-guard regression
// coverage MIGRATED to src/react/__tests__/components/Progres/ObiectivCard.test.tsx
// + src/react/__tests__/lib/targetEta.test.ts.

describe('SettingsProfile — U-12 Big 6 range gate on save (AUDIT-2 §U-12 HIGH)', () => {
  it('rejects out-of-range age on save — store unchanged + toast + no saved status', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '8' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    // store keeps prior valid value (31 din beforeEach), NU 8
    expect(useOnboardingStore.getState().data.age).toBe(31);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
    const items = toast.getSnapshot();
    expect(items.some((t) => t.variant === 'warning' && /Varsta intre 18 si 99/.test(String(t.message)))).toBe(true);
  });

  it('rejects out-of-range weight on save — store unchanged + toast', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '999' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.weight).toBe(81);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
    const items = toast.getSnapshot();
    expect(items.some((t) => t.variant === 'warning' && /Greutate intre 30 si 250/.test(String(t.message)))).toBe(true);
  });

  it('rejects age above max (100) on save — boundary 99 enforced', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.age).toBe(31);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
  });

  it('accepts in-range edits on save — store updated + saved status + no warning toast', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '40' } });
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '85' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.age).toBe(40);
    expect(useOnboardingStore.getState().data.weight).toBe(85);
    expect(screen.getByTestId('settings-profile-saved')).toBeInTheDocument();
    expect(toast.getSnapshot().length).toBe(0);
  });

  it('does not commit ANY field when one field is out-of-range (atomic abort)', () => {
    renderScreen();
    // valid sex change + invalid age → whole save aborts, sex NOT committed
    fireEvent.change(screen.getByTestId('profile-sex-select'), { target: { value: 'f' } });
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.sex).toBe('m');
    expect(useOnboardingStore.getState().data.age).toBe(31);
  });
});

// ══ i18n leak fix (audit 09 store-evading) — validation toast LOCALIZED ═══════
// The store emits a semantic key (+ {min,max} params), resolved via t() at the
// SettingsProfile save boundary. Pre-fix the store emitted hardcoded Romanian,
// so the toast leaked RO under EN. These specs prove the rendered toast text is
// correct in BOTH locales for each numeric Big-6 field.
describe('SettingsProfile — validation toast is localized (EN + RO) per field', () => {
  const cases: Array<{ testid: string; bad: string; en: RegExp; ro: RegExp }> = [
    { testid: 'profile-age-input', bad: '8', en: /Age must be between 18 and 99 years\./, ro: /Varsta intre 18 si 99 ani\./ },
    { testid: 'profile-weight-input', bad: '999', en: /Weight must be between 30 and 250 kg\./, ro: /Greutate intre 30 si 250 kg\./ },
    { testid: 'profile-height-input', bad: '300', en: /Height must be between 120 and 230 cm\./, ro: /Inaltime intre 120 si 230 cm\./ },
  ];

  function lastWarning(): string {
    const items = toast.getSnapshot().filter((t) => t.variant === 'warning');
    return String(items[items.length - 1]?.message ?? '');
  }

  for (const c of cases) {
    it(`${c.testid} renders EN toast under EN locale`, () => {
      __setLocale('en');
      renderScreen();
      fireEvent.change(screen.getByTestId(c.testid), { target: { value: c.bad } });
      fireEvent.click(screen.getByTestId('settings-profile-save'));
      expect(lastWarning()).toMatch(c.en);
    });

    it(`${c.testid} renders RO toast under RO locale`, () => {
      __setLocale('ro');
      renderScreen();
      fireEvent.change(screen.getByTestId(c.testid), { target: { value: c.bad } });
      fireEvent.click(screen.getByTestId('settings-profile-save'));
      expect(lastWarning()).toMatch(c.ro);
    });
  }
});

describe('SettingsProfile — weight continuity (onboarding -> profil edit autoritar)', () => {
  // BUG (Daniel live): onboarding 110 kg, apoi profil 50 kg → app trebuie sa
  // foloseasca 50 PESTE TOT (TDEE/BMR/BF%/proteine/Antrenor/Progres). Radacina:
  // Onboarding seedeaza weightLog din greutatea de onboarding (110); profil
  // scria DOAR in onboardingStore, deci getCurrentWeightKg (ultima intrare
  // weightLog > onboarding) raportata tot 110 → editarea era umbrita. Fix:
  // profil upsert intrarea de azi in weightLog cand greutatea se schimba.
  beforeEach(() => {
    // Simuleaza onboarding 110: onboardingStore + seed weightLog (ca
    // Onboarding.tsx seedFromProfileIfEmpty la finalize) → starea de plecare
    // EXACTA in care bug-ul aparea (log vechi de 110 umbreste editarea).
    useOnboardingStore.setState({
      data: {
        age: 30,
        sex: 'm',
        goal: 'masa',
        frequency: '4',
        experience: 'intermediar',
        weight: 110,
        height: 180,
      },
      completed: true,
      completedAt: Date.now(),
    });
    useProgresStore.getState().reset();
    useProgresStore.getState().seedFromProfileIfEmpty(110, '2026-05-27');
  });

  it('canonical weight = 50 dupa edit (NU 110 din seed-ul de onboarding)', () => {
    // Pre-conditie: seed-ul de 110 face sursa canonica = 110 (bug-ul vechi).
    expect(getCurrentWeightKg()).toBe(110);
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '50' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    // Editarea e autoritara: sursa canonica raporteaza 50, NU seed-ul de 110.
    expect(getCurrentWeightKg()).toBe(50);
    expect(readUserWeightKg()).toBe(50);
    // weightLog reflecta editarea (upsert intrarea de azi), onboarding tot 50.
    expect(useProgresStore.getState().weightLog.at(-1)?.kg).toBe(50);
    expect(useOnboardingStore.getState().data.weight).toBe(50);
  });

  it('toate numerele derivate (BMR/TDEE/proteine) folosesc 50, NU 110', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '50' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));

    // Proteine = 1.8 g/kg × greutate → 90 g la 50 kg (NU 198 g la 110 kg).
    expect(computeProteinTargetG(readUserWeightKg())).toBe(90);
    expect(computeProteinTargetG(110)).toBe(198); // ancora: ce ar fi fost la 110

    // BMR Mifflin (m, 180cm, 30y) la 50 kg vs 110 kg — TDEE mentenanta (care
    // citeste getCurrentWeightKg la I/O boundary) trebuie sa fie pe banda lui 50.
    const bmrAt50 = computeMifflinStJeorBMR({ sex: 'm', weightKg: 50, ageYears: 30, heightCm: 180 });
    const bmrAt110 = computeMifflinStJeorBMR({ sex: 'm', weightKg: 110, ageYears: 30, heightCm: 180 });
    expect(bmrAt50).not.toBeNull();
    expect(bmrAt110).not.toBeNull();
    const tdee = readUserMaintenanceTDEE();
    expect(tdee).not.toBeNull();
    // TDEE mentenanta = BMR×NEAT + termen sesiuni. Fara sesiuni logate +
    // plan 4×/sapt (blend cold-start = plan). Granita superioara: TDEE la 50 kg
    // < TDEE la 110 kg (greutatea conduce BMR). Demonstreaza ca foloseste 50.
    expect(tdee as number).toBeLessThan(Math.round((bmrAt110 as number) * 1.25) + 200);
    // Si pe banda lui 50: peste BMR-ul de 50 (×NEAT), sub cel de 110.
    expect(tdee as number).toBeGreaterThan(bmrAt50 as number);
  });

  it('edit doar pe non-weight field (NU greutate) NU scrie un weigh-in fantoma in weightLog', () => {
    // §obiectiv-relocate 2026-05-28 — goal moved la Progres; folosim experienta
    // (alt non-weight field din SettingsProfile) pentru aceeasi invariant test.
    renderScreen();
    const before = useProgresStore.getState().weightLog.length;
    fireEvent.change(screen.getByTestId('profile-experience-select'), { target: { value: 'avansat' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    // Greutatea neschimbata (tot 110) → NU adaugam o intrare noua in timeline.
    expect(useProgresStore.getState().weightLog.length).toBe(before);
    expect(useOnboardingStore.getState().data.experience).toBe('avansat');
    expect(getCurrentWeightKg()).toBe(110);
  });

  it('edit out-of-range NU misca greutatea canonica (save abortat)', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '999' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    // Save abortat de range gate → nici onboarding nici weightLog atinse.
    expect(getCurrentWeightKg()).toBe(110);
    expect(useProgresStore.getState().weightLog.at(-1)?.kg).toBe(110);
  });
});

describe('SettingsProfile — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
