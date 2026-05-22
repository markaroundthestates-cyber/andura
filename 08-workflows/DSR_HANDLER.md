# Data Subject Request Handler — GDPR Art. 15-22

> **Authority:** Audit nuclear V3 §28-H3 closure 2026-05-22. Required when
> users email privacy@andura.app requesting access/rectification/erasure/
> portability OUTSIDE the in-app flows.
>
> **Scope:** Manual requests received via privacy@andura.app inbox. In-app
> self-service flows handle most cases automatically (see §1).

---

## §1 In-app self-service (NO manual handler needed)

Most DSR requests are fulfilled by the user themselves in the Andura app — NO
ticket creation needed. Document this when responding to confused users:

| Request type | In-app path | Coverage |
|---|---|---|
| **Right to access** (Art. 15) | Cont > Descarca date | Tier 0 + Tier 1 sessions JSON |
| **Right to rectification** (Art. 16) | Cont > Profil & tinte | Edit Big 6 directly |
| **Right to erasure** (Art. 17) | Cont > Deconectare & stergere > Sterge cont | Tier 0 + Tier 1 IDB + Tier 2 RTDB DELETE (§B039 LANDED) |
| **Right to portability** (Art. 20) | Cont > Descarca date | JSON export §28-M4 |
| **Right to object** telemetry (Art. 21) | Cont > Confidentialitate > toggle | Telemetry opt-in default OFF |
| **Right to restrict processing** (Art. 18) | Cont > Deconectare | Logout opreste autentificarea -> backup-urile noi nu se mai pot scrie (Firebase REST require auth token). Datele existente locale pe device raman intacte. |

Response template (RO):
> Buna! Pentru cererea ta poti folosi direct in aplicatie:
> - Vezi datele: Cont > Descarca date (JSON)
> - Sterge tot: Cont > Deconectare & stergere > Sterge cont
> - Modifica profil: Cont > Profil & tinte
> - Opreste telemetria: Cont > Confidentialitate
>
> Daca preferi sa fac eu manual sau ai o cerere care nu se rezolva astfel,
> raspunde acestui email. Termen GDPR: maxim 30 zile.

---

## §2 Manual handler workflow (when in-app NOT enough)

### Trigger conditions
- User physically cannot access app (lost device + no Magic Link delivery)
- User unsure how to use in-app flows + needs hand-holding
- Request involves data NOT exposed in-app (Sentry events, backup snapshots,
  third-party processor data)
- Legal compliance request from authority (court order, ANSPDCP inquiry)

### Phase 1 — Identify (T+0)

Verify the requester is the data subject:
- Email FROM matches `pendingEmail` localStorage OR Firebase Auth users list
- If mismatch → ask: "Pentru a confirma identitatea, raspunde de pe adresa cu
  care ai creat contul Andura SAU trimite-mi data ultimei sesiuni de antrenament."
- DO NOT proceed without identity verification (Art. 12(6))

### Phase 2 — Acknowledge (T+0 to T+72h)

Reply within 72h confirming receipt:
> Ti-am primit cererea pe [DATA]. O sa raspund pana pe [DATA + 30 zile].
> Daca trebuie sa cer detalii suplimentare, te contactez in maxim 7 zile.

### Phase 3 — Fulfill (T+0 to T+30 days max)

**Access (Art. 15):**
1. Open Firebase Console > RTDB > `/users/<uid>` snapshot to JSON
2. If user authenticated: instruct in-app export instead (preferred)
3. If user lost device + Firebase access intact:
   - Email JSON export attachment (encrypted ZIP password-protected)
   - Send password in SEPARATE channel (phone SMS / secondary email)
4. Document in DSR_LOG: timestamp + scope + delivery method

**Erasure (Art. 17):**
1. Firebase Console > Auth > Users > find uid > Delete
2. Firebase Console > RTDB > `/users/<uid>` > Delete node
3. Sentry: `Sentry CLI > issues delete` for uid-tagged events (if any)
4. Confirm via reply: "Toate datele asociate emailului tau au fost sterse
   din serverele Andura pe [DATA]. Backup-urile retentie 30 zile se curata
   automat pana pe [DATA + 30 zile]."

**Portability (Art. 20):**
- Same as Access; JSON format = portable (Art. 20(1) machine-readable)
- Document data dictionary: include `JSON_SCHEMA.md` link

**Rectification (Art. 16):**
- Instruct in-app fix (Cont > Profil & tinte) — preferred user-controlled
- If user cannot: manual Firebase Console > RTDB > edit specific field

### Phase 4 — Document (T+1 week post-fulfillment)

Append to `08-workflows/DSR_LOG_INDEX.md`:
- Request date + type
- Identity verification method used
- Fulfillment date + scope
- Response time vs 30-day SLA
- Any complications + procedural changes triggered

---

## §3 SLAs + escalation

| Stage | Target | Maximum |
|---|---|---|
| Acknowledge receipt | 24h | 72h |
| Fulfill simple (access/erasure/rectification) | 7 days | 30 days |
| Fulfill complex (multiple data types / forensic) | 30 days | 30 + 60 extension (Art. 12(3)) |
| Notify extension required | within 30 days | — |

Extension trigger conditions (max +60 days):
- Request involves data across multiple processors needing coordination
- Request volume = "manifestly unfounded or excessive" (Art. 12(5))

If user unsatisfied → instruct: "Poti depune plangere la ANSPDCP la
https://www.dataprotection.ro/ daca consideri ca cererea nu a fost tratata corect."

---

## §4 Cost model (Art. 12(5))

DSR fulfillment = **free for first request per year per user** (default).

Subsequent requests within same year:
- May charge reasonable admin fee OR refuse if manifestly unfounded
- Pre-Beta: ZERO charge regardless (50 testers = low volume)
- Post-Beta scale: re-evaluate

---

## §5 References

- GDPR Art. 12 (transparency + procedure)
- GDPR Art. 15-22 (substantive rights)
- ANSPDCP guidance: https://www.dataprotection.ro/
- In-app implementations:
  - `src/react/routes/screens/cont/SettingsExport.tsx` (Access + Portability)
  - `src/react/routes/screens/cont/DeleteAccountConfirm.tsx` (Erasure)
  - `src/react/routes/screens/cont/SettingsPrivacy.tsx` (Object — telemetry toggle Art. 21)
  - `src/react/routes/screens/cont/LogoutConfirm.tsx` (Restrict — Art. 18 via auth revocation)
- `08-workflows/DATA_BREACH_RESPONSE.md` — breach notify path (related)
