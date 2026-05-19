# PROMPT_CC — Handover Distribute 2026-05-19

**Trigger:** Daniel paste CC terminal post current cluster cleanup + deploy + D028 swap LANDED. Daniel manual fire (NU auto).

---

Consume `📥_inbox/HANDOVER_2026-05-19_phase-6-landed-deploy-audit-prep.md` + distribute decizii cluster cross-chat continuity.

## §1 Append DECISIONS.md cu D028 + D029

**D028 PROC LOCKED V1 2026-05-19** — React entry swap strategy + vanilla preservation policy:
- Implementation: Option 1 rename pattern `index.html` → `index-vanilla-legacy.html` (preserved backup NU deploy-at) + `react-test.html` → `index.html` + update `vite.config.js` input map (remove react-test entry, main entry = noul index.html cu React)
- Rollback path: `git revert <swap-commit>` restores vanilla entry instantly + redeploy GH Pages
- Vanilla preservation: source preserved în repo + `src/pages/*.js` reusable engine code via React `src/react/lib/*Aggregate.ts` wrappers — NU șterse, doar excluse din build
- Backup tag: `pre-react-entry-swap-2026-05-19`
- Authority: Daniel CEO directive 2026-05-19 deploy production + Co-CTO Bugatti craft Option 4 + 1 combined verdict
- Status: LOCKED V1 PERMANENT
- Supersede: NU (extension D015/D016/D026 cascade React migration strategic decisions)

**D029 PROC LOCKED V1 2026-05-19** — Bugatti Audit Nuclear procedure:
- Mode: continuous neîntrerupt multi-noapte CC autonomous Opus MAX thinking budget
- Stop trigger UNIC: Daniel explicit STOP/caveman/stai/Ctrl+C
- Auto-iterative: post primary §1-§24 pass → secondary deep-dive CRITICAL/HIGH → tertiary MED/LOW → quaternary NIT polish — until STOP
- Output: log-only backlog `📤_outbox/audit-nuclear-2026-05-19/` (findings-§N.md per category + SUMMARY.md aggregate severity matrix + production readiness % weighted final score + _progress.md checkpoint resume capable)
- Scope: ALL on HEAD post deploy-react-production tag — ~100k LOC source + ~250k+ total cu tests + docs + mockups
- Authority: Daniel CEO directive 2026-05-19 verbatim *"FULL AUDIT. Fiecare linie cod citita, fiecare virgula, TOT pe latest commit LANDED. 20000 ore I don't care"* + *"absolut full"* + *"ruleaze neintrerupt pana nu il opresc eu"*
- Status: LOCKED V1 PERMANENT
- Supersede: NU (NEW process LOCK pre-Launch nuclear gate definition)

Update DECISIONS.md frontmatter: `latest_entry: D029` + `total_entries: 29`.

## §2 Update PROJECT_INSTRUCTIONS V6 if needed

Verify `01-vision/PROJECT_INSTRUCTIONS_V6.md` consistency cu D028 + D029. Dacă structural mention swap entry sau audit procedure missing, append minor V6 update section concisă. NU rewrite full — preserve V6 invariant.

## §3 Archive inbox cleanup

Mută la `📥_inbox/_CONSUMED/`:
- `git mv 📥_inbox/HANDOVER_2026-05-19_phase-6-landed-deploy-audit-prep.md 📥_inbox/_CONSUMED/`
- `git mv 📥_inbox/PROMPT_CC_handover_distribute_2026-05-19.md 📥_inbox/_CONSUMED/`

**PĂSTREAZĂ în inbox** (pending Daniel manual paste audit):
- `📥_inbox/PROMPT_CC_audit_nuclear_full_2026-05-19.md` — Daniel paste când e gata să lanseze audit. NU archive automat.

## §4 Atomic single commit

`chore(vault): D028 + D029 LOCKED V1 + handover archive 2026-05-19`

Pre-commit hook verde mandatory ZERO `--no-verify`. Push origin main.

## §5 Raport

Append la `📤_outbox/LATEST.md` §N+1 sau scrie nou §0-§2:
- §0 D028 + D029 LANDED DECISIONS.md
- §1 HANDOVER + PROMPT_CC distribute archived inbox
- §2 PROMPT_CC_audit_nuclear_full_2026-05-19.md PĂSTRAT inbox pending Daniel manual paste

Model Opus EXCLUSIVELY. Workdir `C:\Users\Daniel\Documents\salafull`.
