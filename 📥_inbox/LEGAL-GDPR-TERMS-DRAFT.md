# Andura — Privacy Policy + Terms & Conditions (GDPR draft)

> ⚠️ **CAVEAT:** Acest text este un draft generat de AI, bazat pe practicile de date
> observate direct in cod (auth, storage, Sentry, FCM, export/stergere). NU este
> consultanta juridica si NU inlocuieste revizuirea de catre un avocat calificat
> inainte de lansarea Beta. Verifica + asuma responsabilitatea profesionala inainte
> de a-l face live.

Versiune: Beta · 2026-05-31
Limbi live in app: EN (default) + RO (ambele wired in `legalPage.*` din i18n).
Contact in app: `privacy@andura.app` (deja folosit peste tot in cod).

---

## A. Lucruri pe care Daniel TREBUIE sa le confirme

1. **Email de contact / operator.** Codul foloseste deja `privacy@andura.app`
   (Privacy.tsx, Terms.tsx, SettingsPrivacy.tsx, Auth.tsx, allow-listat in
   `noHardcodedUiStrings.test.ts`). Exista si `suport@andura.app` in `auth.js`
   (`USER_DISABLED_COPY`, reactivare cont 30 zile). Am pastrat `privacy@andura.app`
   ca sa nu sparg testele/consistenta. **Confirma**: ramane `privacy@andura.app`
   pentru GDPR? (briefingul sugera `contact@andura.app` ca placeholder — eu am tinut
   adresa reala deja prezenta in cod).
2. **Identitatea operatorului (data controller).** Politica spune doar "fondatorul,
   persoana fizica in Romania (UE)". GDPR cere **nume legal + adresa** a operatorului.
   Trebuie completat numele tau (PFA / SRL / persoana fizica) + adresa inainte de live.
3. **Furnizor de email.** NU exista SendGrid/SMTP/Mailgun hardcodat in cod — magic
   link-ul e trimis de **Firebase Identity Toolkit (Google)** prin endpointul
   `accounts:sendOobCode`. Am scris "Google Firebase (livrarea emailului)". Confirma
   ca nu exista un alt provider configurat in Firebase Console.
4. **Google OAuth live?** Codul are flow-ul complet (`buildGoogleSignInUrl`,
   `signInWithGoogleIdToken`), dar comentariul zice ca cere un Google OAuth Client ID
   configurat in Firebase Console "pre-launch". Daca NU e activat la Beta, mentiunea
   despre Google OAuth in policy e inofensiva (acopera cazul cand il pornesti).
   Confirma starea.
5. **ANSPDCP** = autoritatea de supraveghere RO (dataprotection.ro). Inclus la
   dreptul de plangere. OK asa.
6. **Clauze Contractuale Standard (SCC)** — mentionate pentru transferuri Google in
   afara UE. Standard pentru Firebase; confirma ca esti OK cu formularea.

---

## B. Ce reflecta documentele (toate verificate in cod)

- Auth: magic link passwordless (Firebase REST) + Google OAuth optional + mod oaspete
  ("Continue without an account") = date doar pe dispozitiv. (`src/auth.js`)
- Storage: IndexedDB per-UID + localStorage pe dispozitiv; backup optional in cloud =
  Firebase Realtime Database, cale privata per-UID. (`src/firebase.js`, `dataReset.js`)
- Date colectate: profil (varsta, sex, greutate, inaltime, obiectiv/frecventa/
  experienta), jurnale antrenament, greutate, nutritie, masuratori corporale, email.
- Telemetrie: Sentry **opt-in, default FALSE**, cu PII strip (uid/email/JWT redactate).
  (`src/util/sentry.js`, `src/__tests__/sentry-consent-gate.test.ts`)
- Push: FCM web push optional, activat de user. (`src/react/lib/pushNotifications.ts`)
- Drepturi GDPR deja implementate in app: export JSON (`SettingsExport.tsx`),
  stergere cont + wipe date (`dataReset.js`, `clearUserCloudData`) cu **30 zile grace**
  inainte de stergerea definitiva (`buildSoftDeleteFlag`).
- 18+ only (D083). Fara reclame, fara vanzare date, fara analytics third-party in afara
  de Sentry opt-in.

---

## C. PRIVACY POLICY (text complet, EN — sursa de adevar e i18n `legalPage.*`)

**Privacy policy** — Beta version · Updated 2026-05-31

Your data stays on your phone. You control what leaves it. Andura is local-first: your
profile and sessions are saved on your device. This policy explains what we collect,
why, and the rights you have under the EU GDPR.

**Who is responsible (data controller).** Andura is operated by its solo founder in
Romania (EU). For any privacy matter, including to exercise your rights, contact the
data controller by email. *(→ completeaza nume legal + adresa, punct A.2)*

**What we collect and why.** We collect only what the app needs to coach you: your
profile (age, sex, weight, height, training goal, frequency and experience), your
workout logs, weight and nutrition logs, body measurements, and the email address used
for the magic link sign-in. We use this data to personalize your training and nutrition,
on your device. We do not collect usage analytics.

**Legal basis (GDPR Art. 6 and Art. 9).** We process your account email to provide the
sign-in you asked for (contract / your request). We process your training, weight,
nutrition and body data to deliver the coaching feature you use, on the basis of your
consent, which you give by entering it and can withdraw anytime by deleting the data.
Optional cloud backup and optional crash reporting each run only on your separate
consent. Health-related data (weight, body measurements) is special-category data under
Art. 9 and is processed solely on your explicit consent.

**Where your data is stored.** By default your data lives only on your device, in the
browser's IndexedDB and local storage. If you sign in and enable cloud backup, a copy
is synced to Google Firebase (Realtime Database) under a private path tied to your
account, so you can restore it on another device. If you use Andura without an account
(guest mode), your data never leaves your device.

**Who else processes data (processors and transfers).** We use Google Firebase
(authentication, email delivery for the magic link, and optional cloud backup) and,
only if you opt in, Sentry for crash reporting (personal data is stripped before
sending). These providers act as our processors. Google may process data on servers
outside the EU; such transfers are covered by Standard Contractual Clauses. We never
sell or share your data with advertisers.

**How long we keep it.** Local data stays until you delete it from your device. Cloud
backup stays until you delete your data or your account. When you ask to delete your
account, it is disabled immediately and permanently erased after a 30-day grace period
in case you change your mind.

**What we DON'T do.** ZERO advertising. ZERO data sales. ZERO third-party trackers. We
don't use your data for ads.

**Cookies and local storage.** Andura does not use advertising or tracking cookies. We
use the browser's local storage and IndexedDB only to keep the app working: your
session, your settings and your data on the device.

**Children.** Andura is for adults only. You must be at least 18 years old to use it. We
do not knowingly collect data from anyone under 18.

**Security.** Sign-in uses a passwordless magic link, not a stored password. Data in
transit is encrypted over HTTPS. Cloud backup is reachable only with your authenticated
account token.

**Your rights (GDPR).** You have the right to access, rectify, export (data
portability), and erase your data, to withdraw consent, and to object to or restrict
processing. You can exercise most of these directly in the app: export your data as JSON
and delete your account and data from the Account screen, anytime. For anything else,
email us. You also have the right to lodge a complaint with the Romanian supervisory
authority, ANSPDCP (dataprotection.ro).

**Changes to this policy.** We may update this policy as Andura evolves. The date at the
top shows the current version. Material changes will be highlighted in the app.

**Contact.** For privacy questions or to exercise your rights, write to
privacy@andura.app.

---

## D. TERMS & CONDITIONS (text complet, EN)

**Terms and conditions** — Beta version · Updated 2026-05-31

Andura is a local-first personal training coach. All data is stored on your phone and
can be exported or deleted anytime from the Account screen. By using Andura you accept
the following key points:

**Eligibility.** You must be at least 18 years old to use Andura. By using the app you
confirm that you are an adult.

**What Andura is.** Andura is an AI fitness coach that suggests workouts and nutrition
guidance. It is informational only and is provided for general fitness purposes.

**Recommendations, not prescriptions.** Andura provides training recommendations, NOT
medical prescriptions. It is not a medical device or a substitute for the advice of a
doctor, physiotherapist or professional trainer.

**Your responsibility.** You are responsible for your own safety at the gym. Consult a
doctor before starting any new training program. If you feel sharp pain, dizziness or
breathing difficulty, stop the session.

**Backup and security.** Firebase backup is optional (magic-link authentication, no
password) and encrypts data in transit over HTTPS.

**Error reporting.** Error reporting (crashes) is opt-in (off by default) and uses
Sentry, with personal data stripped before sending. We don't collect usage metrics. You
can turn it on or off anytime.

**Free Beta.** Andura is in free Beta. Features may be changed or added without prior
notice until the V1 launch.

**Provided "as is".** Andura is provided free, as is and as available, with no warranty
of any kind. We do not guarantee that it is error-free, always available, or fit for a
particular result.

**Limitation of liability.** To the extent permitted by law, we are not liable for any
injury, loss or damage arising from your use of Andura. You train at your own risk.
Nothing here limits liability that cannot be excluded by law.

**Intellectual property.** Andura, its content and software belong to its founder. Your
own training data belongs to you. You may use the app for your personal, non-commercial
fitness only.

**Account and termination.** You can delete your account and data anytime from the
Account screen. We may suspend or end access if the service is misused or to comply with
the law.

**Governing law.** These terms are governed by the law of Romania (EU). Disputes are
subject to the competent courts of Romania, without prejudice to mandatory
consumer-protection rights.

**Changes to these terms.** We may update these terms as Andura evolves. The date at the
top shows the current version. Continued use after a change means you accept the updated
terms.

**Questions:** privacy@andura.app

---

## E. Unde traieste textul in cod

- i18n: `src/i18n/en.json` + `src/i18n/ro.json` → blocul `legalPage.*` (RO = aceleasi
  chei, fara diacritice per D-LEGACY-064, ca tot fisierul).
- Render: `src/react/routes/screens/Privacy.tsx` + `Terms.tsx` (pagini publice
  `/privacy` + `/terms`, testids `privacy-page` / `terms-page` neschimbate).
- Versiunea RO se vede cand app-ul e pe limba romana; EN e default.
