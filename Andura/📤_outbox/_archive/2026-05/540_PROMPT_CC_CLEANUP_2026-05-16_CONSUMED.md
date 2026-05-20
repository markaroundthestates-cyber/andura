# PROMPT_CC — Cleanup post-batch Pre-Beta Cap-Coadă 2026-05-16

**Model:** Opus.
**Branch:** `feature/v2-vanilla-port`.

## Tasks atomic sequential

### TASK A — Archive 8 batch files din inbox

Move (NU copy) cele 8 fișiere flat din `📥_inbox/` la `📤_outbox/_archive/2026-05/` cu NN sequential next post 529:

```
ORCHESTRATOR.md                              → 530_ORCHESTRATOR_pre_beta_cap_coada_CONSUMED.md
TASK_1_button_wire_import_nutritie.md        → 531_TASK_1_button_wire_import_nutritie_CONSUMED.md
TASK_2_dashboard_banner_periodic_verify.md   → 532_TASK_2_dashboard_banner_periodic_verify_CONSUMED.md
TASK_3_lock8_kcal_floor_toast.md             → 533_TASK_3_lock8_kcal_floor_toast_CONSUMED.md
TASK_4_test_coverage_extension.md            → 534_TASK_4_test_coverage_extension_CONSUMED.md
TASK_5_mockup_prod_parity_audit.md           → 535_TASK_5_mockup_prod_parity_audit_CONSUMED.md
TASK_6_diacritics_strip_audit.md             → 536_TASK_6_diacritics_strip_audit_CONSUMED.md
TASK_7_wording_inventory_extract.md          → 537_TASK_7_wording_inventory_extract_CONSUMED.md
```

Use `git mv` (NU shell mv) pentru rename tracking history preservation.

Verify final state: `ls 📥_inbox/` → doar `.gitkeep` rămâne.

### TASK B — Fix PRIMER §6 drift line 3034 → 1234

În `ANDURA_PRIMER.md` §6 Track 2 fix 1, replace:

```
1. Button wire mockup line 3034 (tab ISTORIC): `onclick="showToast('Import Nutritie (JSON)')"` PLACEHOLDER → `onclick="triggerMFPImport()"` existing function `src/pages/weight.js`
```

cu:

```
1. ✓ LANDED 2026-05-16 (commit n/a — already-LANDED-no-op verify per batch 2026-05-16) — button "Import Nutritie (JSON)" mockup line 1234 (NU 3034 — drift fix) wired prod `index.html:509` + `dashboard.js:149` la `triggerMFPImport()`.
```

Engineering normalization vault doc (drift fix factual + status update LANDED), NU wording change user-facing → autonomous OK per `DECISIONS.md §D009` boundary.

### TASK C — Append cleanup note la LATEST.md

Append section la `📤_outbox/LATEST.md` post raport existing:

```markdown
## Cleanup post-batch (2026-05-16)
- Inbox archive: 8 files → `📤_outbox/_archive/2026-05/530-537_*_CONSUMED.md` ✓
- PRIMER §6 drift fix: line 3034 → 1234 + status LANDED stamp ✓
- Commit: `chore(vault): cleanup post pre-beta cap-coada batch 2026-05-16 + PRIMER drift fix`
```

## Atomic commit (1 single-concern)

```
chore(vault): cleanup post pre-beta cap-coada batch 2026-05-16 + PRIMER drift fix
```

Tot cleanup într-un commit umbrella — meta-tooling vault, ZERO src/, pre-commit hook verde mandatory.

## Acceptance

- [x] `📥_inbox/` clean (doar `.gitkeep`).
- [x] `📤_outbox/_archive/2026-05/` are 530-537 CONSUMED files.
- [x] PRIMER §6 Track 2 fix 1 entry updated (drift fix + LANDED stamp).
- [x] LATEST.md append cleanup note.
- [x] 1 atomic commit pushed origin.
- [x] Tests 3743 PASS preserved (vault meta-tooling NU touch src/).

---

🦫 **Cleanup post-batch atomic. Inbox empty. Vault doc drift fixed. Co-CTO autonomy maintained tactical engineering normalization scope (D009 boundary respected).**
