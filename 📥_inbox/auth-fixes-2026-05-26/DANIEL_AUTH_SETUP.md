# Daniel — Setup auth Firebase Console (2026-05-26)

Scop: utilizatorii sa isi poata crea singuri cont (self-signup) + sa ramana logati.

Codul de auth este corect si complet. Self-signup prin Magic Link este implementat:
oricine introduce un email pe `/auth` -> primeste link -> Firebase creeaza automat
contul la prima conectare. NU exista nicio lista de permisiuni (allowlist) sau cont
hardcodat care sa blocheze emailuri noi. Daca self-signup nu merge in productie,
cauza este **configurarea Firebase Console** (livrare email / domenii autorizate /
provideri activati), NU codul.

Verifica pe rand punctele de mai jos. Cele mai probabile vinovate: (2) domenii
autorizate + (3) sablon email Magic Link.

---

## 1. Secrets GitHub (build-time) — verifica ca sunt setate

Codul citeste cheia Firebase din `VITE_FIREBASE_API_KEY` la build (vezi
`.github/workflows/deploy.yml` L119). Daca lipseste, build-ul de productie
ARUNCA eroare la pornire (`auth.js` L32-37) — app-ul nu se incarca deloc.

GitHub repo -> Settings -> Secrets and variables -> Actions. Confirma ca exista:

- `VITE_FIREBASE_API_KEY`        (obligatoriu — altfel app crash la boot)
- `VITE_FIREBASE_RTDB_URL`       (obligatoriu pentru backup cloud / restore)
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`      (push notifications — optional)
- `VITE_GOOGLE_OAUTH_CLIENT_ID`  (OPTIONAL — daca lipseste, butonul Google e ascuns;
                                  Magic Link merge si fara el)

Cheia o iei din Firebase Console -> Project Settings -> General -> "Web API Key".

## 2. Domenii autorizate (CEL MAI PROBABIL vinovat pentru "link nu vine / link 400")

Firebase trimite Magic Link doar catre `continueUrl` daca domeniul e autorizat.
Codul foloseste `continueUrl = https://andura.app/auth-callback`.

Firebase Console -> Authentication -> Settings -> **Authorized domains**.
Adauga (daca lipsesc):

- `andura.app`
- `<user>.github.io` (daca mai testezi si pe GitHub Pages direct)
- `localhost` (e deja by default, pentru dev)

Daca `andura.app` NU e in lista -> emailul fie nu pleaca, fie linkul din email
duce la o pagina de eroare Firebase.

## 3. Provider Email/Password (passwordless) activat

Magic Link (email link, fara parola) cere providerul Email activat CU optiunea
de email link pornita.

Firebase Console -> Authentication -> Sign-in method -> **Email/Password**:

- Enable = ON
- **Email link (passwordless sign-in)** = ON  <-- critic; daca e off, `sendOobCode`
  cu `requestType: EMAIL_SIGNIN` esueaza.

## 4. Livrare email (SMTP / sablon)

Default Firebase trimite emailurile de la `noreply@<project>.firebaseapp.com`.
Acestea ajung frecvent in SPAM sau sunt blocate.

Firebase Console -> Authentication -> Templates -> **Email address sign-in**:

- Verifica ca sablonul exista si e activ.
- Personalizeaza expeditorul / numele afisat (creste rata de livrare).
- (Optional, recomandat pre-Beta serios) configureaza SMTP propriu / domeniu
  custom pentru sender, ca emailurile sa nu cada in spam.

Test rapid: introdu un email al tau pe `andura.app/auth`, apoi cauta si in folderul
**Spam/Promotions**. Daca acolo e -> livrarea merge, doar reputatia sender-ului e
problema (punctul SMTP de mai sus).

## 5. (Optional) Google OAuth — daca vrei si butonul "Continua cu Google"

Doar daca vrei sign-in cu Google in plus fata de Magic Link:

- Google Cloud Console -> APIs & Services -> Credentials -> creeaza OAuth 2.0
  Client ID (Web), authorized redirect URI = `https://andura.app/auth-callback`.
- Firebase Console -> Authentication -> Sign-in method -> Google = Enable.
- Pune Client ID in GitHub Secret `VITE_GOOGLE_OAUTH_CLIENT_ID` + redeploy.
- Butonul apare automat in UI cand secret-ul e prezent (altfel ramane ascuns).

---

## Cum confirmi ca e reparat

1. Pe telefon/desktop, deschide `andura.app/auth`, introdu un email NOU (care nu
   are cont). Apasa "Trimite link de intrare".
2. Verifica inbox-ul (si Spam). Ar trebui sa primesti emailul in ~1 min.
3. Deschide linkul **pe acelasi dispozitiv/browser** (important — vezi nota PWA).
4. Ar trebui sa te conecteze automat si sa creeze contul (self-signup OK).

### Nota PWA / WebView (nu e bug de cod, e comportament browser)

Daca deschizi `andura.app` dintr-un in-app browser (Facebook/Instagram/Gmail app),
linkul din email se deschide in browserul default (Chrome/Safari) -> alt
"localStorage scope" -> sesiunea nu se sincronizeaza inapoi in WebView. App-ul deja
afiseaza un banner de avertizare in acest caz (`Auth.tsx` §15-H3) care iti spune sa
deschizi in Chrome direct. Recomandare pentru useri: deschide `andura.app` direct in
Chrome/Safari, nu din alt app.
