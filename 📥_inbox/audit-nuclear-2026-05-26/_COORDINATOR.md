# Audit Nuclear pre-Launch — 2026-05-26 (birou RC)

**Trigger:** Daniel CEO — "audit in care se verifica fiecare linie, punct, virgula... interpreteaza-mi-l la final cu procent cat este Andura ce trebuie + daca poate livra ce vreau + daca am ratat info/engine/ceva."

**Baseline:** main HEAD `48c4a7ae` (post CI-hardening). 4271 vitest PASS / tsc / eslint 0.

**Method:** 5 subagenti Opus read-only, EXHAUSTIV linie-cu-linie pe felii disjuncte. Zero editari cod. Fiecare scrie raportul lui aici. Manager (chat Claude) sintetizeaza la final.

## Felii
- **AUDIT-1-engines.md** — `src/engine/**` (creierul: pipeline 8+1, pure-function, Bayesian/Kalman, calibration, MMI, specialization, deload, periodization)
- **AUDIT-2-react-ui.md** — `src/react/routes` + `components` + `styles` (toate screen-urile + componente, a11y, edge/empty states, RO no-diacritics, dead code)
- **AUDIT-3-state-wiring.md** — `src/react/stores` + `hooks` + `lib` + engine->UI wiring (keystone buildUserStateForPipeline, persistenta, race conditions, scheduleStore)
- **AUDIT-4-data-security.md** — `src/util` + `storage` + `migrations` + `auth.js` + `firebase.js` + `config` (securitate, PII/Sentry scrub, GDPR, IndexedDB, Firebase REST, auth flows, migratii)
- **AUDIT-5-spec-parity-coverage.md** — PRIMER §1-§6 + DECISIONS + mockup `andura-clasic.html` vs implementat (gap-uri vs LOCKED, missed engine/feature/info, can-deliver verdict, % readiness)

## Severitati
CRITICAL (blocheaza Beta) / HIGH / MED / LOW / NIT. Fiecare finding cu `path:line`.

## Status
- [ ] AUDIT-1  - [ ] AUDIT-2  - [ ] AUDIT-3  - [ ] AUDIT-4  - [ ] AUDIT-5
- [ ] Sinteza manager (procent + verdict + missed)
