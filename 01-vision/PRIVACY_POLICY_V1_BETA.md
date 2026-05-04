# Politica de Confidențialitate Andura (v1.0 Beta)

**Status:** Updated draft v2 post review 2026-05-04 evening late (chat strategic Daniel + Claude + Gemini cross-review). Adaugă operator identity + drepturi GDPR + vârsta minimă + lege aplicabilă + ePrivacy storage disclosure + interes legitim detail peste §56.8.2 LOCKED V1 template inițial.
**Daniel action required:** validate sprint final + lock V1 Beta. Audit legal complet + GDPR profundă defer v1.5 (§46 P4 prerequisite).
**Cross-refs:** [[HANDOVER_GLOBAL_2026-04-30_evening]] §56.8.2 + [[ADR_MULTI_TENANT_AUTH_v1]] §AMENDMENT 2026-05-04.8 + `01-vision/TERMS_OF_SERVICE_V1_BETA.md`

**Ultima actualizare:** [DATA LANSARE BETA — completează la lock]
**Versiune:** 1.0 Beta

---

## 1. Cine suntem

Aplicația **Andura** este operată de **Constantin Daniel Mazilu**, persoană fizică, România. Ne poți contacta la **suport@andura.app** pentru orice întrebare legată de date sau aplicație.

## 2. Vârsta minimă

Andura este destinată exclusiv persoanelor cu vârsta de **18 ani împliniți**. Dacă ai sub 18 ani, te rugăm să nu folosești aplicația. Dacă aflăm că un cont aparține unei persoane sub 18 ani, contul va fi șters.

## 3. Ce date colectăm

- **Email** — pentru autentificare prin Magic Link și recuperare cont pe alt dispozitiv.
- **Identificator unic Firebase (UID)** — generat automat la prima autentificare.
- **Profil onboarding** — sex, vârstă, înălțime, greutate, obiectiv fitness, echipament disponibil (date pe care le introduci tu).
- **Date de antrenament** — exerciții, seturi, repetiții, kilograme, evaluări de efort.
- **Date comportamentale derivate** — modul în care folosești aplicația (sesiuni completate, propuneri acceptate sau modificate), folosite pentru personalizarea programului tău.
- **Telemetrie agregată anonimă** — numărători impersonale (ex: "câți utilizatori au completat onboarding"), fără date personale identificabile.
- **Erori tehnice** — colectate prin Sentry pentru debugging (fără date personale, doar stack traces și context tehnic).

**Fotografiile** (dacă încarci poze de progres) sunt salvate **exclusiv local pe telefonul tău**, NU în cloud.

## 4. Unde sunt ținute datele

Datele tale sunt stocate:
- **Local pe telefonul tău** (offline-first, IndexedDB + localStorage).
- **În cloud pe serverele Google Firebase** — operate de Google Ireland Limited (UE) cu transferuri către Google LLC (SUA) sub Standard Contractual Clauses + EU-US Data Privacy Framework.
- **Sentry** (error tracking) — operat de Functional Software, Inc. (SUA) sub Standard Contractual Clauses.

**Tehnologii de stocare locală:** Folosim IndexedDB și LocalStorage strict pentru funcționarea offline și performanța aplicației, nu pentru publicitate sau tracking comportamental cross-site.

## 5. Temei legal procesare

Procesăm datele tale în baza:
- **Consimțământului tău** (acceptare Politică de Confidențialitate la onboarding) — pentru profil și antrenamente.
- **Executării contractului** (Termeni și Condiții) — pentru funcționarea serviciului.
- **Interesului legitim** — pentru telemetrie agregată anonimă, folosită pentru optimizarea algoritmilor de antrenament și securitatea serviciului, precum și pentru debugging tehnic.

## 6. Retenție și ștergere

- Datele tale sunt păstrate cât timp folosești aplicația.
- Dacă ștergi contul, datele intră într-o **perioadă de grație de 30 de zile** (recuperare prin email reactivare).
- După 30 de zile, datele sunt șterse **permanent și ireversibil** din cloud. Datele locale rămân pe telefon până la dezinstalare manuală.

## 7. Drepturile tale GDPR

Conform GDPR (Regulamentul UE 2016/679) ai următoarele drepturi:

- **Acces** — să afli ce date avem despre tine.
- **Rectificare** — să corectezi date inexacte (poți face acest lucru direct din aplicație).
- **Ștergere** ("dreptul de a fi uitat") — să ceri ștergerea contului și a datelor.
- **Portabilitate** — să primești datele tale într-un format structurat (JSON). În V1.0 Beta, această cerere se face manual prin email; automatizare disponibilă în v1.5.
- **Opoziție și restricție** — să te opui sau să restrângi anumite procesări.
- **Retragerea consimțământului** — în orice moment, fără efect retroactiv.

Pentru exercitarea oricărui drept, scrie la **suport@andura.app**. Răspundem în maxim 30 de zile.

Ai dreptul să depui plângere la **Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)** — www.dataprotection.ro.

## 8. Securitate

Datele sunt criptate în tranzit (HTTPS/TLS) și în repaus (Firebase encryption at rest). În cazul unei breșe de securitate care îți poate afecta datele, te vom notifica conform GDPR Article 33-34.

## 9. Partajare cu terți

NU vindem, NU închiriem și NU partajăm datele tale pentru marketing sau publicitate. Folosim doar furnizori de infrastructură menționați la punctul 4 (Google Firebase + Sentry), strict pentru funcționarea serviciului.

## 10. Modificări ale politicii

Te vom notifica prin email despre modificări semnificative cu cel puțin 14 zile înainte de aplicare. Continuarea utilizării aplicației după notificare înseamnă acceptarea modificărilor.

## 11. Contact

Pentru orice întrebare legată de această politică sau de datele tale: **suport@andura.app**.
