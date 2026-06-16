// Phase 6 task_09 — SettingsProfile sub-screen tests.
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { AVATAR_PRESETS } from '../../../components/Avatar/registry';
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
  useSettingsStore.getState().reset(); // §avatar-profile-view — no avatarId bleed across tests
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

// §avatar-profile-view (founder 2026-06-12 "avatarul nu e vizibil cand user
// apasa pe butonul de profile din cont") — the profile header must show the
// SAME chosen avatar as the Cont hero (settingsStore.avatarId), not just an
// initial. Pre-fix it rendered a hardcoded gradient pebble that ignored the
// picked preset.
describe('SettingsProfile — chosen avatar renders in the header', () => {
  it('falls back to the gradient initial when no preset is picked', () => {
    useSettingsStore.getState().reset();
    renderScreen();
    // Initials branch keeps the settings-profile-initial testid contract.
    expect(screen.getByTestId('settings-profile-initial')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-initials')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-svg')).toBeNull();
    expect(screen.queryByTestId('avatar-image')).toBeNull();
  });

  it('renders the chosen svg-preset avatar (not the initial) when one is picked', () => {
    const svgPreset = AVATAR_PRESETS.find((p) => p.kind === 'svg')!;
    useSettingsStore.getState().setAvatar(svgPreset.id);
    renderScreen();
    const cell = screen.getByTestId('avatar-svg');
    expect(cell).toBeInTheDocument();
    expect(cell.getAttribute('data-avatar-id')).toBe(svgPreset.id);
    // No initial rendered when a preset is active.
    expect(screen.queryByTestId('settings-profile-initial')).toBeNull();
  });

  it('renders the chosen image-preset avatar when one is picked', () => {
    const imgPreset = AVATAR_PRESETS.find((p) => p.kind === 'image')!;
    useSettingsStore.getState().setAvatar(imgPreset.id);
    renderScreen();
    const cell = screen.getByTestId('avatar-image');
    expect(cell).toBeInTheDocument();
    expect(cell.querySelector('img')?.getAttribute('src')).toBe(imgPreset.src);
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

  // Body-composition input gate (Daniel audit — neck 103 / waist 42 swapped got
  // stored, feeding an unreliable BF%). The save must block swapped/impossible
  // measurements rather than persist garbage.
  // Real audit record neck 103 / waist 42: neck is above the 25-60 band, so the
  // range gate blocks it (waist 42 is also below 50). Either way the swapped
  // garbage never reaches bodyData.
  it('respinge masuratoare out-of-range (gat 103 > 60) pe save — bodyData neatins + toast', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '103' } });
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '42' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useProgresStore.getState().bodyData.length).toBe(0);
    expect(screen.queryByTestId('settings-profile-saved')).not.toBeInTheDocument();
    const items = toast.getSnapshot();
    expect(
      items.some((t) => t.variant === 'warning' && /Verifica masuratorile/.test(String(t.message))),
    ).toBe(true);
  });

  // Neck >= waist with both values IN their valid bands — the swapped-fields
  // signature the US-Navy proxy can't survive (waist-neck<=0). Must block.
  it('respinge neck>=waist (ambele in banda) pe save — bodyData neatins + toast', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    // neck 55 >= waist 52, both inside the valid ranges (neck 25-60, waist 50-200).
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '52' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '55' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useProgresStore.getState().bodyData.length).toBe(0);
    expect(screen.queryByTestId('settings-profile-saved')).not.toBeInTheDocument();
    const items = toast.getSnapshot();
    expect(
      items.some((t) => t.variant === 'warning' && /Gatul trebuie sa fie mai mic/.test(String(t.message))),
    ).toBe(true);
  });

  it('accepta neck<waist valid in banda pe save — bodyData scris', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '101' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '43' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    const last = useProgresStore.getState().bodyData.at(-1);
    expect(last?.waistCm).toBe(101);
    expect(last?.neckCm).toBe(43);
  });

  // §body-measure-inline (founder live 2026-06-12 "am pus waist 1000 cm si neck
  // 430 cm si andura ma lasa... deci sunt hulk") — the absurd values must (1)
  // flag the inputs + show a friendly inline message LIVE as typed, and (2)
  // block the save (bodyData untouched, no saved status). No silent clamp.
  it('waist 1000 + neck 430 → inline error shown LIVE + inputs aria-invalid (no clamp)', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '430' } });
    // Inline error visible BEFORE any save click.
    const err = screen.getByTestId('profile-body-measure-error');
    expect(err).toBeInTheDocument();
    expect(err.textContent).toMatch(/Verifica masuratorile/);
    // No diacritics (D-LEGACY-064).
    expect(/[ăâîșțĂÂÎȘȚ]/.test(err.textContent ?? '')).toBe(false);
    // Offending inputs flagged + values NOT clamped (still the raw entry).
    expect((screen.getByTestId('profile-waist-input') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
    expect((screen.getByTestId('profile-neck-input') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
    expect((screen.getByTestId('profile-waist-input') as HTMLInputElement).value).toBe('1000');
  });

  it('waist 1000 + neck 430 → save blocked (bodyData untouched + no saved status)', async () => {
    const { useProgresStore } = await import('../../../stores/progresStore');
    useProgresStore.getState().reset();
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '430' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useProgresStore.getState().bodyData.length).toBe(0);
    expect(screen.queryByTestId('settings-profile-saved')).not.toBeInTheDocument();
  });

  it('valid in-range measurements → no inline error + inputs not flagged', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '38' } });
    expect(screen.queryByTestId('profile-body-measure-error')).not.toBeInTheDocument();
    expect((screen.getByTestId('profile-waist-input') as HTMLInputElement).getAttribute('aria-invalid')).toBeNull();
  });

  it('neck>=waist (both in band) → inline swapped-fields message LIVE', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '52' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '55' } });
    const err = screen.getByTestId('profile-body-measure-error');
    expect(err.textContent).toMatch(/Gatul trebuie sa fie mai mic/);
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

// §freq-edit-reseed — editing frequency post-onboarding must re-seed the weekly
// calendar so the engine builds the NEW-frequency program immediately. Onboarding
// seeds scheduleStore.days from frequency; the engine resolves the active week as
// override ?? scheduleStore ?? frequency, so the persisted scheduleStore `days`
// WIN over the edited user.frequency. Pre-fix handleSave wrote the new frequency
// WITHOUT re-seeding → activeWeekFromScheduleStore() returned the STALE
// onboarding-frequency days, so the engine kept building the OLD-frequency program
// until the next Monday rollover. The fix re-seeds resetWeekly() on a frequency
// change UNLESS a manual calendar override (current-week wv2-calendar-override)
// exists — then the user's explicit calendar is preserved.
describe('SettingsProfile — frequency edit re-seeds the calendar (freq-edit-reseed)', () => {
  const SCHEDULE_STORE_KEY = 'wv2-schedule-store';
  const CALENDAR_OVERRIDE_KEY = 'wv2-calendar-override';

  /** Active-day tuple the engine reads from scheduleStore (`days` → training bool). */
  async function engineActiveWeek(): Promise<boolean[] | null> {
    const mod = await import('../../../../engine/schedule/scheduleAdapter/frequencySplit.js');
    return mod.activeWeekFromScheduleStore();
  }

  function persistedDays(): string[] {
    const raw = localStorage.getItem(SCHEDULE_STORE_KEY);
    if (!raw) return [];
    return ((JSON.parse(raw).state?.days) ?? []) as string[];
  }

  /** Let the handleSave async (dynamic import + resetWeekly) settle. */
  async function flush(): Promise<void> {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  }

  it('edit 3 -> 5 with NO override re-seeds days to a 5-day week (engine builds 5)', async () => {
    // Onboarding-shaped starting point: frequency 3 seeded into scheduleStore.
    useOnboardingStore.getState().setField('frequency', '3');
    const sched = await import('../../../stores/scheduleStore');
    sched.useScheduleStore.getState().resetWeekly();
    expect(persistedDays().filter((d) => d === 'training')).toHaveLength(3);

    renderScreen();
    fireEvent.change(screen.getByTestId('profile-frequency-select'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    await flush();

    // Calendar re-derived from the new frequency: 5 training days.
    expect(persistedDays().filter((d) => d === 'training')).toHaveLength(5);
    const active = await engineActiveWeek();
    expect(active?.filter(Boolean)).toHaveLength(5);
    expect(useOnboardingStore.getState().data.frequency).toBe('5');
  });

  it('edit frequency WITH a manual override present preserves the user calendar (no clobber)', async () => {
    useOnboardingStore.getState().setField('frequency', '3');
    const sched = await import('../../../stores/scheduleStore');
    sched.useScheduleStore.getState().resetWeekly();
    const daysBefore = persistedDays();

    // User has manually customized the calendar for THIS week (current-week override).
    const adapter = await import('../../../../engine/schedule/scheduleAdapter.js');
    const weekIso = adapter.getWeekStartIso(new Date());
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, JSON.stringify({
      selectedDays: [
        { day: 'L', active: true }, { day: 'M', active: true }, { day: 'M2', active: false },
        { day: 'J', active: false }, { day: 'V', active: false }, { day: 'S', active: false },
        { day: 'D', active: false },
      ],
      weekStartIso: weekIso,
      committedAt: new Date().toISOString(),
    }));
    expect(adapter.getCalendarOverride()).not.toBeNull();

    renderScreen();
    fireEvent.change(screen.getByTestId('profile-frequency-select'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    await flush();

    // resetWeekly was NOT called → scheduleStore.days unchanged (override preserved).
    expect(persistedDays()).toEqual(daysBefore);
    // The override itself is intact.
    expect(adapter.getCalendarOverride()).not.toBeNull();
  });

  it('edit a NON-frequency field does NOT re-seed the calendar', async () => {
    useOnboardingStore.getState().setField('frequency', '3');
    const sched = await import('../../../stores/scheduleStore');
    sched.useScheduleStore.getState().resetWeekly();
    const daysBefore = persistedDays();

    renderScreen();
    fireEvent.change(screen.getByTestId('profile-experience-select'), { target: { value: 'avansat' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    await flush();

    expect(persistedDays()).toEqual(daysBefore);
  });
});

describe('SettingsProfile — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
