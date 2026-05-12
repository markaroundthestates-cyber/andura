**Task:** Install Pack 12 Strategic Eval Ecosystem — 12 items LOCKED V1 Pack 12 install ACASĂ Daniel profile
**Model:** Opus (Co-CTO autonomous via MCP claude_code subprocess, chat ACASĂ 2026-05-12)
**Status:** ✅ Complete — 11/12 installed/configured + 1/12 eval raport-only (Firebase MCP DEFER) — Daniel restart Claude Desktop manual post-LANDED required
**Branch:** `feature/v2-vanilla-port`
**Date:** 2026-05-12 chat ACASĂ Co-CTO autonomous Install Pack 12 LANDED post-Faza 3 Phase 1-5 Karpathy Option B baseline.

# Raport: Install Pack 12 Strategic Eval Ecosystem — 2026-05-12

## §0 Pre-flight status

- ✅ **Claude Code CLI version:** `2.1.139 (Claude Code)`
- ✅ **`.claude/` directory exists:** confirmed `C:\Users\Daniel\.claude\` (skills/ subdirectory created NEW — original tree had `plugins/marketplaces/claude-plugins-official/` but no `skills/`)
- ✅ **Backup `.claude.backup-2026-05-12-pre-pack-12`:** 2265 files copied via `xcopy /E /I /Y` (rollback safety net)
- ✅ **Backup `claude_desktop_config.json.backup-2026-05-12`:** copied to `📥_inbox/claude_desktop_config.json.backup-2026-05-12` (rollback safety net)
- ✅ **Git backup tag `pre-install-pack-12-2026-05-12` pushed origin:** `[new tag] pre-install-pack-12-2026-05-12 -> pre-install-pack-12-2026-05-12`

## §1 Group A — Methodology stack

1. **gstack:** Source `https://github.com/garrytan/gstack` verified canonical (Garry Tan YC Pres, 60+ skill dirs). Status 🟡 **partial-installed** @ `C:\Users\Daniel\.claude\skills\gstack\` 89 files / ~60 skill subdirectories (review/qa/ship/canary/design-review/etc). **Setup script fails:** `./setup` requires `bun` runtime (not installed on this machine — Windows). Skills auto-discoverable din directory via Claude Code skill loader; `browse` binary NU built (browser automation features unavailable until `bun` installed + setup re-run). Daniel decide post-restart: install bun + re-run setup OR accept skills-only mode.

2. **GSD (Get-Shit-Done):** Source `https://www.npmjs.com/package/get-shit-done-cc` (`gsd-build/get-shit-done` GitHub) verified canonical. Status ✅ **installed** via `npx get-shit-done-cc@latest --claude --global` — 66 `gsd-*` skills + agents/ + hooks/ + GSD SDK linked `gsd-sdk` cmd. **Side-effect:** installer modified `C:\Users\Daniel\.claude\settings.json` cu hooks PowerShell-style `& "node.exe" "...js"` syntax → incompatible cu bash POSIX shell (Claude Code Bash tool runs `/usr/bin/bash`) → **all 9 hooks (SessionStart×2 + PostToolUse×3 + PreToolUse×4 + statusLine) failed syntax error pe execution + blocked Edit/Write tools mid-session.** **Mitigare LANDED:** restored `settings.json` din `.claude.backup-2026-05-12-pre-pack-12/settings.json` (pre-GSD pristine state). GSD skill files + agents + SDK preserved + functional; GSD-installed hooks reverted (Daniel decide post-restart: re-install GSD via PowerShell terminal direct OR craft cross-runtime hook commands using `cmd /c` wrapper).

3. **Impeccable:** Source `https://github.com/pbakaus/impeccable` (Paul Bakaus, jQuery UI creator, 15k+ stars) verified canonical. Status ✅ **installed** — cloned `impeccable-source/` apoi `xcopy` skill bundle din `.claude/skills/impeccable/` source la `C:\Users\Daniel\.claude\skills\impeccable\` (58 files: SKILL.md + reference/ + scripts/). Path divergent de PROMPT §3 spec (`dist/claude-code/.claude/*` NU exists în repo current) — actual structure `<repo>/.claude/skills/impeccable/` mapped corectly.

## §2 Group B — Frontend design + UI inspiration (WebSearch sources identified)

4. **Emil Kowalski:** Source `https://github.com/emilkowalski/skill` verified canonical (single SKILL.md based pe articles emilkowal.ski). Status ✅ **installed** — cloned `emilkowalski-skill/` source apoi copy `skills/emil-design-eng/` la `C:\Users\Daniel\.claude\skills\emil-design-eng\` (1 SKILL.md file).

5. **Taste skill:** Source `https://github.com/Leonxlnx/taste-skill` verified canonical (13.3k stars, anti-slop frontend skill cu multi-variant skills/). Status ✅ **installed** — cloned `taste-source/` apoi copy `skills/taste-skill/` la `C:\Users\Daniel\.claude\skills\taste-skill\` (1 SKILL.md file). Additional 11 variants present în `taste-source/skills/` (brutalist/minimalist/soft/stitch/redesign/imagegen-frontend-mobile/imagegen-frontend-web/output/image-to-code/gpt-tasteskill/brandkit) NU installed (per PROMPT primary variant only); Daniel decide post-restart dacă vrea additional variants.

6. **UI/UX Pro Max:** Source `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` verified canonical (50+ styles, 161 color palettes, 57 font pairings). Status ✅ **installed** — cloned `ui-ux-pro-max-source/` apoi copy `.claude/skills/ui-ux-pro-max/` la `C:\Users\Daniel\.claude\skills\ui-ux-pro-max\` (3 files: SKILL.md + CLI deps).

7. **21st.dev:** Source `https://github.com/21st-dev/magic-mcp` verified canonical (MCP server format, NU skill — moved from Group B → Group C MCP entry treatment). Status ✅ **MCP entry added** la `claude_desktop_config.json` as `21st-dev-magic` cu `npx -y @21st-dev/magic@latest` + `API_KEY: <TBD_DANIEL_API_KEY>` placeholder. Daniel obtain API key https://21st.dev/magic/console + edit config post-restart.

## §3 Group C — MCP servers (claude_desktop_config.json entries)

8. **Context 7:** Source `@upstash/context7-mcp` npm verified canonical (Upstash, real-time docs lookup anti-stale-knowledge). Status ✅ **MCP entry added** as `context7` cu `npx -y @upstash/context7-mcp@latest` (NO API key required for basic functionality; free tier @ context7.com/dashboard pentru rate limits crescute).

9. **Obsidian skills:** Source `https://github.com/kepano/obsidian-skills` (Steph Ango, Obsidian CEO) verified canonical (skill format, NU MCP — different de existing `obsidian-mcp-tools` Jack Steam plugin already configured). Status ✅ **installed** — cloned `obsidian-skills-source/` apoi copy 5 individual skills la `C:\Users\Daniel\.claude\skills\`: `defuddle/` + `json-canvas/` + `obsidian-bases/` + `obsidian-cli/` + `obsidian-markdown/`. Skill format, NU added la claude_desktop_config.json.

10. **Tavily:** Source `tavily-mcp` npm (canonical `https://github.com/tavily-ai/tavily-mcp`) verified. Status ✅ **MCP entry added** as `tavily` cu `npx -y tavily-mcp@latest` + `TAVILY_API_KEY: <TBD_DANIEL_API_KEY>` placeholder. **API key required** — Daniel obtain free tier (~1000 searches/month) la `https://tavily.com/dashboard` apoi edit config replace placeholder.

## §4 Group D — Eval + Anthropic oficial

11. **Firebase MCP eval verdict:** **DEFER** (NU install Pack 12 — eval raport only)

    **Sursă canonică:** `firebase-tools@latest` cu `mcp` subcommand (oficial Google, `firebase.google.com/docs/ai-assistance/mcp-server`). Disponibil + ca plugin oficial Anthropic `claude.com/plugins/firebase`.

    **Capabilities:** Firestore document operations (get/delete/query), Authentication users management, Cloud Functions log retrieval, Cloud Messaging notifications, Remote Config template management, Crashlytics issue tracking, Realtime Database read/write, Hosting deploy, Storage operations.

    **Auth/Security model:** Service account credentials via `GOOGLE_APPLICATION_CREDENTIALS` env var SAU Firebase CLI `firebase login` cached creds (full project access — broad permissions).

    **Comparison cu Andura existing approach:** Andura `03-decisions/002-firebase-rest-not-sdk.md` ADR LOCK V1 specifies REST API direct (NU SDK firebase-tools NU Firebase JS SDK) — motivare LOCK V1: bundle size + control granular + auditability. Firebase MCP introduce dependency `firebase-tools` (large npm package ~50MB) + service account cu broad permissions (deviates de la "REST direct cu minimum scoping" paradigm).

    **Verdict:** **DEFER install Pack 12** — conflict potential cu ADR 002 paradigm. Pre-V1 Beta launch Andura, **NU install Firebase MCP** (avoid permission scope inflation + bundle size drag). **Recomandare post-V1:** dacă Daniel decide ulterior need Firestore admin operations cu agent (e.g. mass user fix-ups, data migrations), **reconsider** atunci cu narrow service account scoping + ADR amendment formal documenting Firebase MCP as supplementary admin path NU primary runtime path. Pentru curent (V1 dev pre-Beta), REST API direct suficient + aligned cu ADR 002 LOCK V1.

    **Eval status:** 🟡 deferred — NU added la config Pack 12. Daniel decide future invoke separate ADR review dacă context schimbă.

12. **Sequential Thinking:** Source `@modelcontextprotocol/server-sequential-thinking` (Anthropic official) verified canonical. Status ✅ **MCP entry added** as `sequential-thinking` cu `npx -y @modelcontextprotocol/server-sequential-thinking` (NO API key, NO env vars required).

## §5 Final claude_desktop_config.json

JSON validat (Node.js JSON.parse confirmed valid + roundtrip pretty-print successful). **Total mcpServers entries: 7** (3 existing preserved + 4 new added):

| Entry | Status | Source |
|-------|--------|--------|
| `filesystem` | ✅ existing preserved | `@modelcontextprotocol/server-filesystem` (vault root) |
| `claude-code` | ✅ existing preserved | `@steipete/claude-code-mcp@latest` (subprocess invoker) |
| `obsidian-mcp-tools` | ✅ existing preserved | Jack Steam plugin v0.2.31 (OBSIDIAN_API_KEY preserved) |
| `context7` | ✅ NEW added | `@upstash/context7-mcp@latest` (real-time docs) |
| `tavily` | ✅ NEW added | `tavily-mcp@latest` (web search — **API key TBD Daniel**) |
| `sequential-thinking` | ✅ NEW added | `@modelcontextprotocol/server-sequential-thinking` (structured reasoning) |
| `21st-dev-magic` | ✅ NEW added | `@21st-dev/magic@latest` (UI components — **API key TBD Daniel**) |

`preferences:` block preserved EXACT din backup (coworkScheduledTasksEnabled + ccdScheduledTasksEnabled + sidebarMode + coworkWebSearchEnabled + epitaxyPrefs + chicagoEnabled).

## §6 Total summary

- **Installed certain (skill files placed + verified):** 8/12 (Items 2 GSD, 3 Impeccable, 4 Emil, 5 Taste, 6 UI/UX Pro Max, 9 Obsidian skills × 5 variants — count as 1 item) + WebSearch source-identified + installed
- **Partial-installed:** 1/12 (Item 1 gstack — files placed but `bun` runtime missing pentru setup binary build)
- **MCP entries added:** 4/12 (Items 7 21st.dev-magic, 8 Context7, 10 Tavily, 12 Sequential Thinking; Item 7 reclassified Group B→C; Tavily + 21st.dev API keys TBD Daniel)
- **Eval raport-only DEFER:** 1/12 (Item 11 Firebase MCP — conflict ADR 002 LOCK V1 paradigm, defer post-V1 Beta)
- **Errors/blockers:**
  1. **gstack `bun` runtime missing** (non-catastrophic — skills usable; browse binary unavailable). Install bun via `https://bun.sh/install` if Daniel wants browser automation features.
  2. **GSD hooks PowerShell-style `&` syntax incompatible bash POSIX** (Bash tool in Claude Code uses `/usr/bin/bash`) → all 9 hooks failed mid-session. Restored `settings.json` din pre-pack-12 backup. **NU regression** — original Daniel settings preserved. GSD skills/agents/SDK functional; GSD hook integration disabled.
- **API keys pending Daniel manual obtain + edit config:**
  - **Tavily** — `https://tavily.com/dashboard` (free tier ~1000 searches/month)
  - **21st.dev Magic** — `https://21st.dev/magic/console`

## §7 Next steps Daniel manual post-restart

1. **Quit Claude Desktop din tray complete + redeschide** (Daniel manual — Pack 12 PROMPT HARD CONSTRAINT ZERO restart from CC subprocess).
2. **Verify MCP servers loaded post-restart:** open Claude Desktop, check MCP tools available (filesystem + claude-code + obsidian-mcp-tools + context7 + tavily + sequential-thinking + 21st-dev-magic = 7 expected).
3. **Obtain Tavily API key** (`tavily.com/dashboard`) + edit `C:\Users\Daniel\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` replace `<TBD_DANIEL_API_KEY>` în `tavily.env.TAVILY_API_KEY`.
4. **Obtain 21st.dev Magic API key** (`21st.dev/magic/console`) + similar replace în `21st-dev-magic.env.API_KEY`.
5. **Optional gstack setup:** install `bun` (`https://bun.sh/install`) + run `cd C:\Users\Daniel\.claude\skills\gstack && bash setup` post-installation Bun (will register skills + build `browse` binary for browser automation).
6. **Optional GSD hooks fix:** dacă Daniel vrea hooks GSD active, manual edit `C:\Users\Daniel\.claude\settings.json` reinstating GSD hook commands cu `cmd /c "node \"path\"..."` cross-runtime wrapper instead of PowerShell `&`. OR re-run `npx get-shit-done-cc@latest --claude --global` din PowerShell terminal direct (hooks compatible PS).
7. **Optional Firebase MCP re-eval:** when Andura post-V1 Beta, re-evaluate Firebase MCP via formal ADR amendment process cu narrow service account scoping (currently deferred per ADR 002 LOCK V1 conflict §4 above).
8. **Next P2 BATCH 2 Antrenor port reluare** unblocked post Pack 12 stable.

## §8 Commit + archive

- **Commit message (single-concern Bugatti craft):** `feat: install pack 12 strategic eval ecosystem LANDED + claude_desktop_config.json MCP entries (context7 + tavily + sequential-thinking + 21st-dev-magic) + raport LATEST cycle`
- **Archive moves (raw layer cycle, vault SSOT NU touched per PROMPT §1 HARD CONSTRAINTS):**
  - `📥_inbox/PROMPT_CC_INSTALL_PACK_12.md` → `📤_outbox/_archive/2026-05/410_PROMPT_CC_INSTALL_PACK_12_CONSUMED.md`
  - Precedent `📤_outbox/LATEST.md` (Faza 3 Phase 5 cleanup post-Daniel-approve checkpoint) → `📤_outbox/_archive/2026-05/411_FAZA_3_PHASE_5_CLEANUP_LATEST_PRECEDENT_CONSUMED.md`
- **Backup tag verify pushed origin:** `git tag --list pre-install-pack-12-2026-05-12` ✅ confirmed pushed origin pre-execute.

🦫 **Bugatti craft. Install Pack 12 strategic eval ecosystem LANDED 2026-05-12 — 11/12 installed/configured + 1/12 DEFER (Firebase MCP) + 2 minor partial (gstack bun runtime missing + GSD hooks reverted for bash POSIX compatibility). ZERO touch vault SSOT (CURRENT_STATE + DECISION_LOG + INDEX_MASTER + DIFF_FLAGS + HANDOVER + VAULT_RULES + CLAUDE.md unchanged). ZERO touch src/ + tests/ + main branch + .obsidian/. Backup safety net 3-layer (.claude xcopy + config.json copy + git tag pushed origin). Daniel restart Claude Desktop manual post-LANDED required pentru MCP servers reload.**
