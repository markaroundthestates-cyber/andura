# PROMPT_CC — Mockup vs Prod Parity Pass 5 Screenshots 2026-05-20

**Trigger:** Daniel paste CC (resume same session cu `/compact` OR new session)
**Model:** Opus 4.7 EXCLUSIVELY
**Mode:** Pass 5 only — Playwright screenshots visual proof CRIT findings
**Stop trigger UNIC:** Daniel STOP explicit
**Predecessor:** Audit Pass 1+2+3+4 COMPLETE per `_progress.md` 2026-05-20

---

## §0 Context

Audit Mockup vs Prod Parity 2026-05-20 e COMPLETE except Pass 5. CC a deferred Pass 5 pe rațiune bandwidth pacing din PROMPT_CC_CONTINUE §3.7 = Co-CTO overcaution (Daniel `/compact` rezolvă context). Acum executăm Pass 5 dedicated.

---

## §1 Pre-flight

`Read 📤_outbox/mockup-vs-prod-parity-2026-05-20/SUMMARY.md` §S2 — lista 42 CRIT findings ordered by Bugatti impact + `_progress.md` Pass 5 plan.

Chromium installed: `$env:LOCALAPPDATA\ms-playwright\chromium-1217` ready.

---

## §2 Pass 5 — Visual proof screenshots

Per CRIT finding din §S2 list (42 total), genereaza:

### §2.1 Mockup snapshot

- Render `file:///<vault>/04-architecture/mockups/andura-clasic.html` în Playwright headless Chromium
- Viewport: 380x812 (mobile-first per spec original)
- Navigate la screen via JS `goto(screenId)` invocation per finding screen ref
- Screenshot scoped la section visible relevantă pentru finding (NU full viewport unless finding e global layout)
- File: `_mockup-<screenId>-<finding-ID>.png`

### §2.2 Prod snapshot

- Visit `https://andura.app/app/<route>` în Playwright headless Chromium same viewport
- Auth bypass: localStorage seed `andura-auth=true` + reload (Option A per spec original §1.4)
- Pentru sub-screens accesate via state: trigger interaction (click → transition → screenshot post-transition)
- Screenshot scoped same scope ca mockup
- File: `_prod-<route>-<finding-ID>.png`

### §2.3 Skip rules

- Finding "ENTIRELY MISSING" în prod → mockup screenshot only (NU prod equivalent există)
- Finding "PARADIGM SWAP" → both screenshots (proof of divergence)
- Finding HARDCODED placeholder → both screenshots (proof of identical demo content all users)

---

## §3 Output structure

Same folder `📤_outbox/mockup-vs-prod-parity-2026-05-20/` populated cu screenshots per naming convention §2.

Update final:
- `_progress.md` Pass 5 status → COMPLETE
- `SUMMARY.md` §S9 — Pass 5 visual proof index (link per CRIT finding la screenshots pair OR mockup-only)

---

## §4 Procedure constraints

### §4.1 Log-only

Screenshots only. ZERO `src/` modifications. ZERO commits.

### §4.2 Resume capable

`_progress.md` checkpoint update după fiecare batch ~10 screenshots (per Tier batch din SUMMARY §S2).

### §4.3 MCP filesystem write_file mandatory pentru markdown updates

D023 LOCKED V1.

### §4.4 Anti-halucinare

Per finding screenshot pair, NU compose narrative — doar generate files + index în SUMMARY §S9.

### §4.5 Bandwidth = `/compact` Daniel-side

Dacă context approaches limit, NU defer — log progres + așteaptă Daniel `/compact` în session. CC continuă post-compact din checkpoint.

---

## §5 Start trigger

CC autonomous citește acest prompt + `SUMMARY.md` §S2 + `_progress.md` → execută Pass 5 per §2 pentru toate 42 CRIT findings → update `_progress.md` + `SUMMARY.md` §S9 → STOP audit FINAL COMPLETE.

ETA estimat: ~1.5-2h Opus continuous (mostly Playwright orchestration + file IO, low reasoning load per screenshot).

---

🦫 **Pass 5 closure Bugatti audit. Log-only screenshots. /compact NU defer.**
