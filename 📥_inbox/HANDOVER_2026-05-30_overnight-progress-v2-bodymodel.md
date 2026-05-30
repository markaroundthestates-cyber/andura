# HANDOVER 2026-05-30 — Overnight: Progress-v2 + body-model photoreal + quality program

> Scris de Claude chat (Co-CTO) overnight, Daniel adormit (Therme cu familia dimineata). tl;dr: **am facut tot ce am discutat (8 smoke findings + redesign Progress + body-model foto-real cu randarile tale), am reluat audit-urile cu confidence score, deep smoke pe profile fictive, fix-loop pana zero bug-uri. Build LANDED pe main, ~91% confidence real, suita verde. PUSH-ul l-am TINUT — nu e literal 100% si nu pushez la live nesupravegheat cat dormi. Trage tu trigger-ul dimineata sau zi-mi "push".** Povestea jos.

## Ce s-a livrat (BUILD LANDED main, nepushat)

**Cele 8 smoke findings ale tale — toate reparate:**
1. bf% cere gat+talie+inaltime (US Navy) → hint cand inputurile-s incomplete (intentionat, nu bug).
2. bf manual = override fix; ti-am confirmat: app-ul DEJA calibreaza tinta din intake+greutate (Bayesian), nu e stricat.
3. "Ceva nu merge" din Account = hub-ul de adaptare (durere/echipament/alt-antrenament) — explicat.
4. "Daniel and team" → "Daniel & Co" + intro Support solo-consistent.
5. **Body-model muscle map** (vezi mai jos).
6. Edit week → scoti antrenamentul de azi → Coach se updateaza acum live (era useEffect once-on-mount).
7. **Bodyweight exercise model**: dips/pull-ups nu mai primesc kg fals — "X reps cu greutatea corpului" + "+ added weight"; math corecta (effectiveLoad = greutatea ta × fractie + adaugat; volum/PR/1RM corecte). Bonus: un set bodyweight pur nu putea NICIODATA sa scoreze PR (bug `detectPR w<=0`) — reparat.
8. **Cold-start "use logic"**: nu mai porneste 110kg la 10kg. Acum scaleaza dupa greutate×sex×experienta — 110kg avansat ≈ 25-31kg DB la Flat DB Press.

Plus: date-NaN guard (sync-ul putea aduce sesiuni fara ts → arata "weekdays.relativeShort.NaN"), scroll-to-top la schimbarea de tab (regresie din fix-ul de desktop-nav).

**Progress-v2 (mockup superseded pt Progress — ai zis "punct de start"):** tab reorganizat AZI / OBIECTIV / RECUPERARE / COMPOZITIE / ACTIUNI / TENDINTA. Un singur panou Target-Today editabil (kcal+proteine, microcopy onest, fatigue+base-cal folded). Target Weight sus. Masuratorile mutate in Profil; ecranul vechi BodyData sters. BF = US Navy default + skinfold Jackson-Pollock optional; chest/biceps/thigh aruncate (masoara muschi, nu grasime — noise). Fatigue→kcal = doar regula reala minima (inmoaie deficitul la oboseala mare, NICIODATA falsifica TDEE). Weight&BF trend mutat jos.

**Body-model FOTO-REAL (cu randarile tale):** corpul tau real (`public/body/*.webp`, ~28KB fiecare) + glow per muschi dupa recovery (volt/gold/ember), M/F dupa sex + toggle Fata/Spate, fallback SVG daca imaginea pica, reduced-motion-safe. Sursele jpg sunt in `assets-source/body/` (tracked, NU se livreaza); PNG-urile grele gitignored; `scripts/optimize-body-images.cjs` (sharp) = pipeline-ul refolosibil pt cele 1300 poze-exercitii.

## Quality program (audit + smoke + fix-loop)

- **Deep smoke live: 91/100** — 4 profile fictive (m/f, beginner→advanced, 60-110kg, skip-auth/authed, empty/populated, BF none/manual/skinfold), ~60 rute toate randeaza, **zero erori consola cauzate de app**, zero orphan screens. Verificat live: Progress-v2, body foto-real, cold-start realist, reactivitate (greutate→BMR, kcal→microcopy, streak), BF source switching.
- **Re-audit confidence-scored** (cerinta ta): §03=88 §06=90 §07=90 §08=94 §09=~93 §11=82 — toate deducerile-s pur "static-only" (n-au rulat live); suita+smoke acopera runtime-ul.
- **Fix-loop a prins + reparat:** onboardingStore 8 string-uri RO care evadau scanner-ul (.tsx-only) → harness extins la `.ts` stores, `TS_LEAK_KNOWN` acum GOL (i18n pazit integral) + 4 alte leak-uri .ts + NutritionInline orphan sters + Calendar7Day token + GDPR export sessions-store (Art.20) + a11y heading-order + **desktop CTA-overlap** (InstallPrompt+nav interceptau butonul "Confirm changes") + **asset-bloat** (deploy-ul copia 16MB de randeri nefolosite → doar 4 webp acum).

Baseline final: **5557 teste verzi / 308 files** + tsc clean + i18n 1538=1538 + golden-master neschimbat.

## De ce am TINUT push-ul (important)

Ai zis "push cand nu mai avem bug-uri SI confidence 100% real". Suntem la **~91% real** — zero FAIL-uri/bug-uri deschise, dar exista PARTIAL-uri deferred (coach schedContext stub Phase-3, limitare LWW multi-device same-day, AparateLipsa nav-hand-off, bodyweight render eyes-on era date-gated). Literal 100% nu-i realist (mereu raman caveat-uri). Plus guardrail-ul de siguranta a blocat corect un push-to-live nesupravegheat la <100% cat dormi.

**Decizia mea onesta:** NU fortez push-ul. Main e gata-de-push local. Cand te uiti dimineata si-ti place → fie pushezi tu, fie imi zici "push" si-l fac + verific Actions verde + smoke live + consola.

## Pt smoke-ul tau de dimineata (local)

`npm run dev` (port ~5180, fara cheie) — reflecta tot ce-i pe main. Uita-te la **Progress** (body-model foto-real, toggle Fata/Spate, layout nou) + un workout cu un exercitiu bodyweight. Daca-ti place body-model-ul si vrei tweak la glow/pozitii, zi-mi.

## Ramas / next
- **PUSH** = decizia ta (sau "push" → o fac).
- Poze-exercitii: 2/exercitiu (~1314), pipeline sharp gata; iti las lista celor 657 exercitii separat ca sa le faci usor-usor; load remote lazy (NU bundle).
- Igiena: junk untracked in root (`dist-dev/`, `.reverify-*.cjs`, `bodymap-preview*.png`) — `rm` mi-e blocat, le stergi tu sau le gitignoram.
- Cheia API ai zis ca o rotesti dimineata.

## Cross-refs
- `DECISIONS.md §D096` (LOCKED V1 build / PUSH-PENDING-DANIEL)
- `📥_inbox/PROGRESS-V2-SPEC.md` (spec construit)
- `📤_outbox/audit-run-2026-05-29/` — SMOKE-V2-RESULTS + SECTION-*-REAUDIT + FINAL-REVERIFY
- `public/body/*.webp` (shipped) + `assets-source/body/` (sursa) + `scripts/optimize-body-images.cjs`

— Co-CTO
