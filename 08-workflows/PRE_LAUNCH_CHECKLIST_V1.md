# PRE-LAUNCH CHECKLIST V1 LOCKED

**Status:** ACTIVE_SSOT (operational checklist canonical, pre-Beta active)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §29.7 (lines 2743-2818, archived 2026-05-07 Capacity A) — note: source heading style `## 29.7` legacy convention, content reference §29.7 shorthand
**Date split:** 2026-05-07 (Run 2 vault cleanup Task 1)
**Authority:** AUTHORITATIVE_LOCK (operational pre-Beta launch gate)

**Cross-refs:**
- [[../03-decisions/DECISION_LOG]] (entries 2026-05-02 + 2026-05-07 Capacity A LANDED)
- [[../01-vision/PRODUCT_STRATEGY_SPEC_v1]] §AMENDMENT 2026-05-02 (Founding €39 + Standard €59 + Elite €79 V1.1 + Distribution Strategy V1)
- [[../01-vision/PRIVACY_POLICY_V1_BETA]] + [[../01-vision/TERMS_OF_SERVICE_V1_BETA]] (Legal DIY initial drafts)
- [[../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] (Auth Phase 1+2 implementation pre-Beta gate)
- [[../DIFF_FLAGS]] P1-FLAG-SCENARIOS-COVERAGE (PRE-BETA blocker active)

---

## 29.7 Pre-Launch Checklist V1 LOCKED (2026-05-01 evening RESUBMIT)

### 29.7.1 Legal Guardrails — Draft DIY + Audit Plătit

**Draft inițial Daniel:** ToS + Privacy Policy + disclaimer medical, folosind modele Local-First + industrie fitness.

**Audit final plătit (1 lună înainte 1 ian 2027):** €300-500 avocat tech RO/EU prin platforme legaltech (Lawyrup.ro / Iuris.ro / Avocatoo.ro).

**Scope audit:**
- Verificare disclaimer medical RO (exonerare răspundere civilă accidentare)
- GDPR compliance (Local-First + Firebase sync + drepturi user — Right to be forgotten + Data access)
- Validare ToS (clauze fără interpretări juridice periculoase)

**Disclaimer medical onboarding (LOCKED):**
> "Înțeleg că Andura este o aplicație de wellness și nu înlocuiește sfatul medicului. Mă antrenez pe propria răspundere."

Checkbox obligatoriu pre-generare program.

**GDPR Privacy Policy (LOCKED):**
> "Datele tale nu părăsesc telefonul tău decât pentru backup securizat. Nu vindem, nu procesăm și nu analizăm datele tale în scopuri comerciale."

+ button Settings "Șterge contul și datele mele definitiv" (hard delete real-time toate DB-uri).

**Note vs decizia LOCKED non-vault 2026-05-02 morning §29.4:** anterior estimat €500-2000 consultanță legală. **§29.7.1 OVERRIDE 2026-05-01 evening RESUBMIT:** €300-500 prin platforme legaltech RO/EU (mai ieftin, scope mai bine definit Draft DIY + Audit Plătit pattern). Bootstrap-friendly preserved.

### 29.7.2 ADR 020 Phase 2 Logs Rotation

**Implementat pre-launch Daniel custom JS script (€0):**
- Rulează la fiecare deschidere app
- Măsoară dimensiune DB locală
- Logs >30 zile sau >10MB → șterge automat
- Telefon user rămâne curat, memoria nu se încarcă

**Cross-ref:** §16 ADR 020 Storage Tiering Phase 1 LIVE prod + Phase 2 backlog (~2-3h Opus, blocat de `coachContext.buildContext` async refactor).

### 29.7.3 D1 DEVELOPING Refactor

**Curățenie totală pre-launch (€0):**
- Sistem routing D-N izolat complet
- Curățat + testat
- Production: zero TODO/DEVELOPING tags
- Zero comentarii experimentale

**Cross-ref:** D1 din §5 RESOLVED ADD DEVELOPING tier 6 nivele canonical + Sprint 4 implementation ~8-12h trad.

### 29.7.4 Smoke Test — Gate Global Production

**1 script `gate-launch-prod.bat` (NU 8 separate):**
1. Onboarding logic: simulează Maria 65 + Marius 25 (validare routing template)
2. 1 sesiune completă/template: rulează cap-la-cap toate 8 programe
3. Data Persistence + Offline: simulează deconectare → date rămân localStorage → sync Firebase reconectare
4. PWA Service Worker: load <2 sec din cache offline

### 29.7.5 ADR 022 V2 Workflow Review

**Workflow hibrid Co-CTO:**
1. **Drafting:** Daniel (Product Owner) + Claude (Co-CTO) generează ADR 022 V2 cu §29.2.5 Forță + §29.2.6 Longevitate complet + §29.2.7 + §29.5 + §29.6 + §29.7
2. **Claude Review:** scan draft pentru neconcordanțe ADR 013 + PARAMETRIC schema + edge cases nerezolvate
3. **Daniel Approval:** analizează raport Claude + corecții + approve merge SSOT
4. **Final Manual Pass:** Daniel cap-la-cap review întregul vault pre-codare

### 29.7.6 DoD Final Bugatti Grade

```
[ ] 8/8 Templates implementate cap-la-cap (zero mock data)
[ ] Cod curat: zero TODO/DEVELOPING tags + funcții neterminate
[ ] Smoke gate production rulat cu succes pe toate 8 templates
[ ] ToS + GDPR adaptate manual + audit avocat €300-500 + integrate onboarding
[ ] Beta închis 4 săpt: 0 crash-uri ultimele 7 zile
[ ] Performance: app load <2 sec local
```

**Cross-refs §29.7:** §29.6 Distribution Strategy DoD criteria + §16 ADR 020 + §5 D1 DEVELOPING + §29.4 decizia legală reconsiderată + §30 Rebrand sweep + ADR 022 V2 cross-ref.

---

