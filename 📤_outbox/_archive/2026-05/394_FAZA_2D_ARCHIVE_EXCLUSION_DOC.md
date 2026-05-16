# FAZA 2D — Archive Exclusion Documentation (Daniel UI Configure Manual)

**Generated:** 2026-05-11 chat ACASĂ Co-CTO autonomous Faza 2D
**Branch:** `feature/v2-vanilla-port`
**Authority:** Daniel CEO + `📥_inbox/PROMPT_CC_FAZA_2D_EXTENSIVE_ORPHAN_RESOLUTION.md` Batch (c) + HARD CONSTRAINTS NU touch `.obsidian/`
**Cross-ref:** `📤_outbox/_archive/2026-05/393_FAZA_2D_ORPHAN_INVENTORY_RAPORT.md` §6 Batch (c) + §7 graph view expected impact

---

## §1 — Context

Post Faza 2D extensive orphan scan (raport 393 §2), wiki layer has only 7 ORPHAN candidates (mostly `📥_inbox/` raw layer preserved + `📤_outbox/` BATCH artefacts resolved Batch (b) cross-ref). But Obsidian graph view Daniel-observed shows **"sute orfani"** (hundreds of orphan nodes).

**Root cause:** 406 `.md` files under `📤_outbox/_archive/` (229 `_CONSUMED.md` + 177 historical raports) appear as graph nodes by default. These are **immutable historical archive** (per CLAUDE.md §1 Karpathy 3-layer architecture):
- `_CONSUMED.md` = Daniel-input artefacts (handover narratives + prompts CC + LATEST.md cycles) post-ingest preserved historical
- Non-CONSUMED archive = historical raports / audits / output deliverables preserved audit-trail

These files have **near-zero inbound** by design (NOT cross-referenced from wiki layer post-consumption). Their orphan-state în graph view = **expected/legitimate**, NOT vault hygiene issue.

**Decision Faza 2D:** Exclude `📤_outbox/_archive/**` from Obsidian graph view via Obsidian Settings UI manual configure (Daniel-only, NU CC autonomous per HARD CONSTRAINTS `.obsidian/` privacy + risk corrupt config).

---

## §2 — Daniel Manual Configure Procedure

### Option A — Excluded Files (Permanent Configure, Recommended)

**Obsidian Settings → Files & Links → Excluded files:**

1. Open Obsidian app (vault Andura loaded)
2. Settings (gear icon bottom-left) → **Files & Links** tab
3. Find section **Excluded files** (alternative naming în older Obsidian versions: "Filters" / "Ignore patterns")
4. Click **Add** sau **+** button
5. Enter glob pattern: `📤_outbox/_archive/**`
6. Confirm save (Obsidian applies immediately, no restart needed)

**Expected impact:**
- Archive `.md` files removed from graph view nodes
- Archive `.md` files removed from file explorer sidebar
- Archive `.md` files removed from quick-switcher (`Ctrl+P`) search
- Archive `.md` files PRESERVED filesystem + git tracked (NU delete, only Obsidian display filter)

### Option B — Graph View Filter (Per-View Temporary Toggle, Alternative)

**Obsidian Graph View → Filters panel:**

1. Open graph view (Cmd/Ctrl+G or click graph icon)
2. Left panel **Filters** section
3. **Files** field add filter: `-path:_archive`
4. Filter applies în-graph view only (NU file explorer)

**Pros vs Option A:** Quick toggle on/off (NU permanent). Reasonable for Daniel post-Beta cleanup audit workflows când he wants quick visual scan including archive.

**Cons vs Option A:** Per-graph-view (NU global). Have to re-apply each session.

**Recommendation:** Option A primary (permanent quality-of-life). Option B în-graph filter fallback dacă Daniel wants temporary include-archive view.

### Option C — `.gitignore` style Obsidian config file (Advanced, NU recommended for Daniel)

Some Obsidian setups use `.obsidian/app.json` config field `attachmentFolderPath` sau custom excluded folders în `.obsidian/community-plugins.json`. **NU recommended pentru Andura:**
- Daniel privacy: `.obsidian/` config files contain machine-specific paths + plugin state
- Risk corrupt config (CC autonomous edit `.obsidian/` not authorized per HARD CONSTRAINTS Faza 2D)
- UI configure în Option A handles same outcome without file edit

---

## §3 — Expected Graph View Impact Post-Exclusion

**Pre-exclusion state (current 2026-05-11 chat ACASĂ pre Daniel manual configure):**
- Wiki layer 102 files visible în graph
- Archive layer 406 files visible în graph (~370+ apparent orphans because low inbound)
- Total nodes graph: ~508
- Apparent orphan count: ~377+ (wiki 7 + archive 370+)

**Post-Option A exclusion state (projected post Daniel manual configure):**
- Wiki layer 102 files visible în graph
- Archive layer 0 files visible în graph (filtered)
- Total nodes graph: ~102 (102 wiki + 0 archive — `📥_inbox/` raw layer Daniel decides include/exclude similar)
- Apparent orphan count: ~4-7 (only `📥_inbox/` raw layer preserved if NOT also excluded, expected per Karpathy §1 raw separate)

**Reduction:** ~377 → ~4 orphan nodes = **~99% reduction visible orphan count**.

### Optional — Additional Exclusion `📥_inbox/**`

If Daniel wants further visual hygiene, also add `📥_inbox/**` la Excluded files (per Option A procedure step 5):
- Raw layer Daniel inputs Karpathy §1 (handover narratives + prompts CC + plans) NU yet cross-linked to wiki — expected orphan în graph view (raw layer separate from wiki layer by design)
- Post-ingest these files archive to `📤_outbox/_archive/<NN>_*_CONSUMED.md` per §CC.5 workflow
- Excluding `📥_inbox/**` removes 5 currently-active files (`PLAN_ANTI_HALUCINATIE_VAULT.md` + 4 PROMPT_CC_*.md) — Daniel decides

---

## §4 — Verify Procedure Post-Configure

Post Daniel manual configure (Option A applied):
1. Reload Obsidian app (sau F5 graph view refresh)
2. Open graph view
3. Verify total node count dropped from ~508 → ~102 (or ~97 if `📥_inbox/` also excluded)
4. Visual scan orphan-isolated nodes — should be 0-5 max (PROTECTED + raw layer expected)
5. Confirm wiki layer connectivity preserved (CURRENT_STATE / INDEX_MASTER / DECISION_LOG hubs visible cu inbound web intact)

---

## §5 — Cross-refs Faza 2D Chain

- **Pre-flight raport:** `📤_outbox/_archive/2026-05/393_FAZA_2D_ORPHAN_INVENTORY_RAPORT.md` §6 Batch (c) recommendation
- **Batch (b) cross-refs added:** `00-index/INDEX_MASTER.md` §NAVIGARE RAPIDĂ table — commit `c3b41d4` 10 entries (3 outbox + 7 V2 strategic SPEC)
- **HARD CONSTRAINTS:** `.obsidian/` config NU touched by CC autonomous (Daniel manual configure mandatory per Option A procedure §2)

---

🦫 **Bugatti craft. FAZA 2D Batch (c) archive exclusion documentation LANDED autonomous Co-CTO scope. Daniel manual UI configure pending Daniel-only step (privacy + risk corrupt config). Expected ~99% orphan node reduction graph view post Daniel configure Option A applied.**
