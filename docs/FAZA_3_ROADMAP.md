# FAZA 3 — Infrastructure + Observability + Tooling

**Status:** READY TO START ([[FAZA_2_FINAL_REPORT|FAZA 2 COMPLETE]] — 24 apr 2026)
**Prerequisite:** ✅ [[FAZA_2_ROADMAP|FAZA 2]] complete (271 teste, zero regresii)
**Context anterior:** [[FAZA_1_FINAL_REPORT]] | [[DECISION_LOG]]

---

## Priority 1 — MCP Integrations (tooling ecosystem)

Ordinea de setup decisă cu Opus co-CTO 24 apr 2026.

### P1.1 — Playwright MCP (HIGH)

**Motivație:** QA Report workflow pică actual (permissions issue). Claude Code trebuie să ruleze E2E on-demand, nu doar tu manual.
**Effort:** ~1h setup
**Value:** rezolvă QA pain point, validation post-deploy automatizată

### P1.2 — Sentry MCP (HIGH)

**Motivație:** deploy FAZA 1+2 = fereastră de vulnerabilitate pentru errors noi. Vrei vizibilitate instant când folosești app-ul în sală.
**Effort:** ~30 min setup
**Value:** production error monitoring live in-context

### P1.3 — GitHub MCP (MEDIUM)

**Motivație:** issue management, CI status in-context, rezolvă workflow permissions.
**Effort:** ~30 min
**Value:** reduce switching între github.com și Claude

### P1.4 — Context7 MCP (MEDIUM)

**Motivație:** docs up-to-date pentru Firebase rules v2, Vite upgrades, React migration.
**Effort:** ~20 min
**Value:** anti-halucinații pe biblioteci când faci refactor major

---

## Priority 2 — Observability (deferred from FAZA 1)

- Sentry coverage boost (H30g)
- Metrics collection (M15g)
- Logging consistency (L6g)

---

## Priority 3 — CI/CD hardening

- ✅ Fix EBADPLATFORM esbuild netbsd-arm64 — DONE (TASK #24)
- ✅ Fix QA Report workflow permissions (403 on commit comments) — DONE (TASK #24)
- ✅ Fix data-integrity e2e test — DONE (TASK #24)

Executat în [[EXEC_QUEUE]] TASK #24.

---

## Priority 4 — Health integrations (emergent)

- Apple HealthKit MCP (experimental)
- Google Fit MCP (experimental)

Monitoring status — when mature, integrate for real-time biometric context.

---

## Deferred / Exploration

- Firecrawl / Fetch (research + competitive analysis) — activate when doing FAZA 4 features research
- Supabase MCP — FAZA 4 only (multi-user auth)
