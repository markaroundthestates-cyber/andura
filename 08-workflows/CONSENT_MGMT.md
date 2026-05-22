---
title: Consent Management — Medical Disclaimer + T&C + Privacy Timestamps
status: ACTIVE_SSOT
created: 2026-05-22
authority: §28-H4 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/DATA_OWNERSHIP.md §1-§2 (GDPR coverage matrix Art. 7)
  - 08-workflows/DSR_HANDLER.md §1 (withdrawal in-app self-service)
  - 08-workflows/DPA_FIREBASE.md §7 (Andura controller obligations)
  - src/pages/disclaimer/index.js (Medical Disclaimer storage primary)
  - src/react/components/MedicalDisclaimerModal.tsx (React mirror gate)
  - src/react/routes/screens/cont/SettingsPrivacy.tsx (Privacy Policy view)
  - src/react/routes/screens/cont/SettingsTerms.tsx (T&C view)
  - DECISIONS.md LOCK 4 (Medical Disclaimer mandatory pre-Beta)
---

# Consent Management — Andura PWA

> **Decizie LOCKED V1:** Consimtaminte materiale (Medical Disclaimer +
> T&C accept + Privacy Policy acknowledgement) = **stocate cu timestamp +
> versiune** in Tier 0 localStorage. Withdrawal = stergere cont (Cont >
> Sterge cont) = revocare integrala. Versionare consent re-acceptance
> trigger version bump. GDPR Art. 7(1-3) requirements satisfied.

---

## §1 Consimtaminte tracked

| Consent | Trigger | Storage key | Format | Version field |
|---|---|---|---|---|
| **Medical Disclaimer** | Pre-onboarding T0 gate (first-launch) | `wv2-medical-disclaimer-accepted` localStorage | `<ISO8601 timestamp>\|<version>` (e.g. `2026-05-22T14:32:11.123Z\|v1`) | `MEDICAL_DISCLAIMER_VERSION` (currently `v1`) |
| **T&C Terms accept** | Co-gated with Medical Disclaimer (same modal checkbox) | Implicit via Disclaimer flag (same key) | Same as Disclaimer | Same |
| **Privacy Policy** | View in-app (SettingsPrivacy.tsx) — passive consent via use | Implicit (data subject can opt-out anytime via Account > Delete) | View action logged via Sentry telemetry IF user opted-in | Versiune Privacy Policy 2026-Q2 (textual badge in SettingsPrivacy) |
| **Telemetry / Sentry** | Toggle Cont > Confidentialitate (opt-in, default OFF) | `wv2-telemetry-opt-in` localStorage (§17-M1) | Boolean `true/false` | n/a (binary state) |

**Verificare cod primary:**
```
src/pages/disclaimer/index.js:21-22
export const MEDICAL_DISCLAIMER_ACCEPTED_KEY = 'wv2-medical-disclaimer-accepted';
export const MEDICAL_DISCLAIMER_VERSION = 'v1';

src/pages/disclaimer/index.js:50-56
function writeAcceptedFlag() {
  try {
    if (typeof localStorage === 'undefined') return;
    const stamp = new Date().toISOString() + '|' + MEDICAL_DISCLAIMER_VERSION;
    localStorage.setItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY, stamp);
  } catch { /* storage full — soft fail */ }
}
```

---

## §2 GDPR Art. 7 requirements satisfied

### (1) Freely given consent
- Medical Disclaimer + T&C checkbox = **un-checked default**, user must
  explicitly check before "Continui" button enable
- ZERO pre-selected checkboxes (anti-dark-pattern, aliniere D-LEGACY-040)
- Disclaimer NU acoperit cu UI distractie / FOMO countdown / fake scarcity

### (2) Specific + informed
- DISCLAIMER_TEXT_RO (in code): "Andura este o aplicatie informativa, NU
  consultatie medicala. Antrenamentele sunt facute pe riscul tau..."
  (`src/pages/disclaimer/index.js:24-29`)
- T&C link "Vezi termenii si conditiile complete" deschide modal cu
  T_AND_C_TEXT_RO full text (importat din `tcText.js`)
- User vede TOT continutul inainte sa accepte; ZERO consent ascuns

### (3) Unambiguous indication
- Checkbox + button "Continui" = doua actiuni afirmative explicit
- ZERO pre-bifare; ZERO browse-as-consent

### (4) Demonstrable (Art. 7(1))
- Timestamp ISO 8601 stocat in `wv2-medical-disclaimer-accepted` cu
  versiune `|v1` ca proof of consent demonstrable
- Format permite reconstruire moment exact consent
- Pre-Beta: stocare Tier 0 localStorage device user; controller side =
  Sentry log opt-in IF user accepta telemetry (else ZERO controller log
  pentru privacy-by-design)

### (5) Withdrawal as easy as giving (Art. 7(3))
- Withdrawal path: **Cont > Deconectare & stergere > Sterge cont**
- Stergere cont = hard delete tot stack tiers (per DELETE_POLICY.md)
- Include stergere `wv2-medical-disclaimer-accepted` localStorage flag
- Next launch -> re-prompt Disclaimer (back to clean state)
- Aliniat cu DSR_HANDLER.md §1 (in-app self-service Art. 17 + 7(3))

---

## §3 Versioning consent re-acceptance

**Trigger version bump:**
- Modificare materiala text Medical Disclaimer (e.g., schimbare
  responsabilitate-clauza, addaugare specific medical condition warning)
- Modificare materiala T&C (e.g., schimbare pricing tier post-Beta,
  schimbare data residency, schimbare sub-processor major)
- Modificare materiala Privacy Policy (e.g., addaugare nou sub-processor
  per DPA_FIREBASE.md §4, schimbare retention)

**Procedure version bump:**
1. Update `MEDICAL_DISCLAIMER_VERSION` constant in `src/pages/disclaimer/index.js`
2. Update text RO conform modificare materiala
3. Notify users >=30 zile inainte de efect (in-app banner + email per
   DATA_OWNERSHIP.md §8)
4. La next launch post version bump, flag check detecta version mismatch
   -> re-prompt Disclaimer cu noua versiune
5. Old timestamp invalid pentru new version; necesita re-consent

**Verificare logic version mismatch (potential implementation):**
```
function isMedicalDisclaimerAccepted() {
  const stored = readAcceptedFlag();
  if (!stored) return false;
  const [timestamp, version] = stored.split('|');
  return version === MEDICAL_DISCLAIMER_VERSION;  // re-prompt daca version diferita
}
```

**Status actual implementare:** `src/pages/disclaimer/index.js:58-60`
verifica doar prezenta flag-ului, NU compara version. Re-prompt pe
version bump = TODO future iteration (DECISIONS.md candidat append).

---

## §4 Special category data Art. 9 — explicit consent

**Date relevante Art. 9 (health-adjacent fitness):**
- Body weight + body measurements (waist, neck, hip pentru body fat estim)
- Pain Button feedback (potential injury indicator)
- Medical conditions self-reported daca onboarding adauga camp future

**Lawful basis dual:**
- Art. 6(1)(a) — consent (Medical Disclaimer + T&C accept gate)
- Art. 9(2)(a) — **explicit consent** pentru special category data
  (timestamp Disclaimer = explicit consent pentru Art. 9 health-adjacent
  processing per §9-H2 LANDED)

**Privacy Policy declarare:** "Andura nu stocheaza date sensibile (sanatate,
religie, orientare politica) — exceptie: medical disclaimer consent
timestamp Art. 9(2)(a)" (DATA_OWNERSHIP.md §5)

---

## §5 Withdrawal mechanism — practical paths

| Withdrawal scope | Path in-app | Effect |
|---|---|---|
| **Telemetry only** | Cont > Confidentialitate > toggle OFF | Sentry events stop; Tier 0 flag updated |
| **Account fully** | Cont > Deconectare & stergere > Sterge cont | Hard delete all tiers per DELETE_POLICY.md + Disclaimer flag cleared |
| **Logout temporar** | Cont > Deconectare (single button) | Auth revocation; Tier 0/1 local data preserved on device; backup Tier 2 not deleted |
| **Manual outside app** | Email `privacy@andura.app` | DSR_HANDLER.md §2 manual fulfillment max 30 zile |

**Withdrawal NU rezulta in retro-active data deletion automat** — pentru
delete istorical user trebuie sa solicit explicit erasure (Art. 17) via
Cont > Sterge cont SAU email manual handler.

---

## §6 Records of consent for accountability (Art. 7(1))

Andura mentine demonstrability consent prin:

- **Tier 0 localStorage device** — primary proof per user device
  (`wv2-medical-disclaimer-accepted` cu timestamp + version)
- **Sentry audit IF opt-in** — events tagged cu user uid daca user a
  acceptat telemetry; stack traces din `MedicalDisclaimerModal` /
  `disclaimer/index.js` debug context
- **Firebase Auth user creation timestamp** — `createdAt` field Firebase
  Auth = proxy timestamp for initial Disclaimer accept (because Disclaimer
  gate fires pre-auth in onboarding flow LOCK 4)
- **Daniel access logs** — Firebase Console > Auth > Users history
  pentru DSR fulfillment verification

**Retention consent records:** cat timp contul exista + 90 zile tombstone
post-erasure pentru audit GDPR (per DATA_OWNERSHIP.md §7).

---

## §7 Cookies + ePrivacy considerations

**Andura PWA = first-party only.** ZERO third-party tracking cookies.

- localStorage = first-party technical-necessary storage = exempt
  ePrivacy Directive consent requirement
- ZERO analytics cookies (Google Analytics absent ✓ confirmed audit)
- ZERO social media cookies (FB Pixel, etc.)
- ZERO advertising cookies (D-LEGACY-040 anti-engagement)

**NO cookie banner required** per audit §28-M1 (PWA first-party only +
technical-necessary storage exempt).

---

## §8 Future enhancements (post-Beta candidates)

NON-LOCKED V1 — candidate enhancements pentru post-Beta:

- **Granular telemetry consent** — separate toggles pentru error tracking
  vs usage analytics (instead of single Sentry opt-in)
- **Consent log Firebase RTDB** — server-side consent ledger pentru
  multi-device sync + DSR fulfillment automation
- **Re-prompt on version bump** — `isMedicalDisclaimerAccepted` extended
  cu version mismatch detection (per §3 procedure)
- **Consent dashboard** — Cont > Confidentialitate extended cu listing
  toate consent records active + timestamp + version history
- **Email consent records export** — Art. 15 access include consent log
  in JSON export

---

## §9 References

- GDPR Art. 6 (lawful basis processing)
- GDPR Art. 7 (conditions for consent)
- GDPR Art. 8 (child consent — Onboarding age verification §28-H5)
- GDPR Art. 9 (special categories processing)
- GDPR Art. 13-14 (transparency at collection)
- WP29 Guidelines on Consent (WP259 rev.01): https://ec.europa.eu/newsroom/article29/items/623051
- EDPB Guidelines 05/2020 on consent: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en
- DATA_OWNERSHIP.md §1-§5 (rights matrix + transparency)
- DSR_HANDLER.md §1 (in-app self-service withdrawal)
- src/pages/disclaimer/index.js (Medical Disclaimer primary implementation)
- src/react/components/MedicalDisclaimerModal.tsx (React mirror gate)
- DECISIONS.md LOCK 4 Medical Disclaimer + T&C Mandatory Accept

---

**Consent Management SSOT** — declaratie singulara consent storage +
withdrawal + versioning. §28-H4 closure 2026-05-22. GDPR Art. 7 satisfied.
