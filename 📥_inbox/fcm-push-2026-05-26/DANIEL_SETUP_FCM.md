# Setup FCM Push Notifications — checklist Daniel (2026-05-26)

Backend-ul de notificari push e gata (Agent B): scheduler Cloud Functions care
ruleaza la fiecare 15 minute, citeste preferintele fiecarui user din RTDB si
trimite reminder-ul de antrenament + sumarul saptamanal duminica seara.

**Codul nu poate fi deployat de mine** — cativa pasi din consola Firebase pe care
doar tu ii poti face. Mai jos, pasii in ordine.

---

## (a) Plan Blaze — DEJA ACTIV ✅ (Daniel confirmat 2026-05-26)

Cloud Functions + Cloud Scheduler cer Blaze (pay-as-you-go). Proiectul
`fittracker-c34e8` e deja pe Blaze de mult timp → **nimic de facut aici**.

Cost real la scala beta = ~0 EUR (FCM gratuit; Functions ~2.880 invocari/luna in
tier-ul gratuit de 2M; Cloud Scheduler 1 job, primele 3 gratuite). Optional:
budget alert ~1 EUR/luna in Google Cloud Billing, pur ca plasa.

---

## (b) Genereaza cheia Web Push (VAPID)

Firebase Console → **Project settings** (rotita sus stanga) → tab **Cloud
Messaging** → sectiunea **Web configuration** / **Web Push certificates** →
**Generate key pair**.

- Copiaza cheia generata (sir lung care incepe cu litere/cifre). Asta e
  `VITE_FIREBASE_VAPID_KEY` de la pasul (c).

---

## (c) Adauga GitHub Secrets

Clientul (Agent A) are nevoie de aceste valori la build (`VITE_` = injectate de
Vite in bundle). Adauga-le in repo → **Settings → Secrets and variables →
Actions → New repository secret**:

| Secret | De unde |
|---|---|
| `VITE_FIREBASE_VAPID_KEY` | cheia de la pasul (b) |
| `VITE_FIREBASE_PROJECT_ID` | Project settings → General → `fittracker-c34e8` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Project settings → General → Web app config → `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Project settings → General → Web app config → `appId` |

Web app config se vede la: Project settings → General → scroll la **Your apps**
→ app-ul Web → **SDK setup and configuration** → optiunea **Config**.

---

## (d) Deploy

Din radacina proiectului (Blaze deja activ):

```
firebase deploy --only functions,database
```

- `functions` = scheduler-ul push (instaleaza automat dependintele din
  `functions/package.json` si creeaza job-ul Cloud Scheduler la 15 min).
- `database` = regulile RTDB actualizate (fiecare user citeste/scrie doar
  `fcmTokens` si `notificationPrefs` proprii).

Prima oara, Firebase iti poate cere sa activezi API-urile Cloud Functions /
Cloud Build / Cloud Scheduler — accepta (sunt incluse in Blaze).

---

## (e) Cost Cloud Scheduler

Cloud Scheduler factureaza per **job** (nu per executie): primele **3 job-uri
gratuite**, apoi ~0,10 USD/job/luna. Noi avem **1 job** → **gratuit**.
Executiile in sine (~2.880/luna) intra in tier-ul gratuit Functions. Net: ~0 EUR
la scala beta.

---

## Verificare rapida dupa deploy

- Firebase Console → **Functions** → ar trebui sa apara `scheduledPushNotifications`.
- Google Cloud Console → **Cloud Scheduler** → un job la `every 15 minutes`,
  timezone Europe/Bucharest.
- Pe telefon: activeaza notificarile in app (Agent A), seteaza ora la urmatorul
  sfert de ora, asteapta tick-ul.

Daca ceva nu merge, log-urile sunt la Functions → `scheduledPushNotifications`
→ Logs (caut dupa `fcm-scheduler tick done` / `fcm-send`).
