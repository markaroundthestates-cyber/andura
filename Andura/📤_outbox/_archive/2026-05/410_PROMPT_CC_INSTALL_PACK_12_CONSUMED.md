# PROMPT_CC_INSTALL_PACK_12 — Strategic Eval Ecosystem Install

**Owner:** Claude Co-CTO autonomous via MCP claude_code subprocess
**Target:** claude_code agent **Opus EXCLUSIVELY** (Sonnet permanently dismissed per Daniel pref LOCK V1)
**Date:** 2026-05-12
**Scope:** Install plugins ecosystem strategic eval pack 12 items LOCKED V1 per `00-index/CURRENT_STATE.md` §JUST_DECIDED + §NEXT P1.

---

## §0 Model + Working Directory

- **Model:** Opus
- **Working directory:** `C:\Users\Daniel\Documents\salafull` (vault root — context anchor only; install target outside vault)
- **Plugins target:** `C:\Users\Daniel\.claude\` (per-user-machine local NU sync cloud; profile ACASĂ Daniel ≠ BIROU DanielMazilu instalare separat per mașină)
- **Claude Desktop config path:** `C:\Users\Daniel\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json`

## §1 Scope + HARD CONSTRAINTS

**Scope:** Install 12 items into Claude Code skills/plugins ecosystem ACASĂ Daniel profile + config MCP servers in claude_desktop_config.json.

**HARD CONSTRAINTS (NU touch):**
- ZERO `src/` + ZERO `tests/` + ZERO main branch
- ZERO `.obsidian/` config
- ZERO vault SSOT files (CURRENT_STATE + DECISION_LOG + INDEX_MASTER + DIFF_FLAGS + HANDOVER + VAULT_RULES + CLAUDE.md) — out of scope; only `📤_outbox/LATEST.md` cycle + this PROMPT archive post-LANDED.
- ZERO restart Claude Desktop — Daniel restart manual end-of-pack post raport.

## §2 Pre-flight (mandatory before any install)

1. Verify Claude Code CLI installed: `claude --version`. Log version.
2. Verify `C:\Users\Daniel\.claude\` exists; if not, create: `mkdir C:\Users\Daniel\.claude\skills` (PowerShell) sau `New-Item -ItemType Directory -Path C:\Users\Daniel\.claude\skills -Force`.
3. **Backup snapshot pre-execute:** `xcopy /E /I /Y C:\Users\Daniel\.claude C:\Users\Daniel\.claude.backup-2026-05-12-pre-pack-12` (rollback safety).
4. **Backup current claude_desktop_config.json:** `copy C:\Users\Daniel\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json C:\Users\Daniel\Documents\salafull\📥_inbox\claude_desktop_config.json.backup-2026-05-12` (rollback safety).
5. **Git backup tag pre-execute:** `cd C:\Users\Daniel\Documents\salafull && git tag pre-install-pack-12-2026-05-12 && git push origin pre-install-pack-12-2026-05-12`.

## §3 Items pack 12 — install order + commands

### Group A — Methodology stack (3 items)

**1. gstack** (Garry Tan YC President, 92k stars, 23 tools role-based virtual team CEO+Designer+Eng Mgr+QA+Release+Security+Doc):
- **Source verify:** WebSearch `"gstack garrytan claude code"` confirm canonical URL (memorat: github.com/garrytan/gstack — VERIFY).
- **Install:** `git clone --depth 1 https://github.com/garrytan/gstack.git C:\Users\Daniel\.claude\skills\gstack`. Apoi `cd C:\Users\Daniel\.claude\skills\gstack` + run setup script (PowerShell `.\setup.ps1` SAU `.\setup.bat` SAU `bash setup.sh` — check repo).
- **Verify:** `dir C:\Users\Daniel\.claude\skills\gstack` listing > 5 files; identifică commands prezente (CEO + Designer + etc).

**2. GSD (Get-Shit-Done)** (TÂCHES, 61.5k stars, 6 commands /gsd-new-project + /gsd-discuss-phase + /gsd-plan-phase + /gsd-execute-phase + /gsd-verify-work + /gsd-ship; convergent cu Karpathy wiki layer):
- **Source verify:** WebSearch `"get-shit-done-cc npm" OR "GSD claude code subagent"` confirm npm package name canonical.
- **Install:** `npx get-shit-done-cc@latest` (auto-bootstrap into ~/.claude/).
- **Verify:** commands `/gsd-*` registered (check `.claude/commands/` directory).

**3. Impeccable** (Paul Bakaus, 19k stars, 18 commands /audit /critique /polish /distill /animate /bolder /quieter /delight /typeset /layout /overdrive /normalize etc, anti-patterns no-Inter+no-purple-gradients+no-bounce):
- **Source verify:** WebSearch `"impeccable paul bakaus claude code"` confirm repo URL.
- **Install:** `git clone --depth 1 <repo_URL> C:\Users\Daniel\.claude\skills\impeccable-source` apoi `xcopy /E /I /Y C:\Users\Daniel\.claude\skills\impeccable-source\dist\claude-code\.claude\* C:\Users\Daniel\.claude\` (Windows equivalent al `cp -r dist/claude-code/.claude/* ~/.claude/`).
- **Verify:** commands `/audit /critique /polish` etc. registered.

### Group B — Frontend design + UI inspiration (4 items, sources TBD)

For each: **WebSearch first** identify canonical source, then install per author instructions. If source ambiguous/multiple, pick most-starred GitHub + skill/plugin format Claude Code compatible.

**4. Emil Kowalski** (UI stil Vercel/Linear, autor vaul/sonner/cmdk):
- **Source verify:** WebSearch `"Emil Kowalski claude code skill plugin"`. Author known pentru `vaul` + `sonner` + `cmdk` libraries (Vercel ecosystem).
- **Install + verify:** per source.

**5. Taste skill** (design curator):
- **Source verify:** WebSearch `"taste skill claude code design curator"`.
- **Install + verify:** per source.

**6. UI/UX Pro Max:**
- **Source verify:** WebSearch `"ui ux pro max claude code skill plugin"`.
- **Install + verify:** per source.

**7. 21st.dev** (component library inspiration + snippets):
- **Source verify:** WebSearch `"21st.dev claude code skill plugin MCP"`. Possibly MCP server format.
- **Install + verify:** per source.

### Group C — MCP servers (3 items, edit claude_desktop_config.json)

For each MCP server: add entry to `mcpServers` block. **NU restart** — accumulate config edits, Daniel restart final post-LANDED raport.

**8. Context 7** (Upstash MCP, real-time docs lookup libs anti-stale-knowledge):
- **Source verify:** WebSearch `"context7 upstash MCP claude desktop"` confirm package name canonical (likely `@upstash/context7-mcp`).
- **Add entry to claude_desktop_config.json:**
  ```json
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  }
  ```

**9. Obsidian skills** (vault automation, distinct de obsidian-mcp-tools already installed):
- **Source verify:** WebSearch `"obsidian skills claude code"` — separate de existing `obsidian-mcp-tools` plugin Jack Steam v0.2.31. Could be skill pack pentru vault operations OR MCP server.
- **Install + verify:** per source format (skill OR MCP entry).

**10. Tavily** (web search MCP > default research quality):
- **Source verify:** WebSearch `"tavily MCP server claude desktop"` (likely `@tavily/mcp` OR `tavily-mcp`).
- **Add entry to claude_desktop_config.json:**
  ```json
  "tavily": {
    "command": "npx",
    "args": ["-y", "@tavily/mcp@latest"],
    "env": {"TAVILY_API_KEY": "<TBD_DANIEL_API_KEY>"}
  }
  ```
- **API key:** Tavily requires API key (free tier ~1000 searches/month). Use placeholder `<TBD_DANIEL_API_KEY>` în config; flag în raport recommend Daniel obtain key tavily.com/dashboard + edit config manual post-LANDED.

### Group D — Eval-only (1 item NU install yet) + Anthropic oficial (1 item)

**11. Firebase MCP eval** (NU install certain — research only):
- **Action:** WebSearch `"firebase MCP server claude code"` identify community OR official Firebase MCP server.
- **Eval criteria raport:**
  - Source canonical (official Google? Community?)
  - Capabilities (Firestore direct ops? Auth? Storage?)
  - Auth/security model (service account? API key? OAuth?)
  - Comparison cu existing Andura Firebase REST API approach per `03-decisions/002-firebase-rest-not-sdk.md` ADR LOCK V1
  - Recommendation **INSTALL / NO-INSTALL / DEFER** cu rationale ~30-50 LOC
- **NU adăuga entry to config** — raport-only.

**12. Sequential Thinking** (Anthropic oficial MCP structured complex reasoning):
- **Source:** `@modelcontextprotocol/server-sequential-thinking` (Anthropic official servers repo).
- **Add entry to claude_desktop_config.json:**
  ```json
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
  ```

## §4 Output format — `📤_outbox/LATEST.md` NEW

Structure mandatory:

```markdown
# Raport: Install Pack 12 Strategic Eval Ecosystem — 2026-05-12

## §0 Pre-flight status
- Claude Code CLI version: <version>
- `.claude/` directory exists: ✅ OR ❌ <created NEW>
- Backup `.claude.backup-2026-05-12-pre-pack-12`: ✅ OR ❌ <reason>
- Backup `claude_desktop_config.json.backup-2026-05-12`: ✅ OR ❌
- Git backup tag `pre-install-pack-12-2026-05-12` pushed origin: ✅ OR ❌

## §1 Group A — Methodology stack
1. **gstack:** Source <URL verified> | Status ✅ installed @ `<path>` commands `<count>` OR ❌ failed `<reason>`
2. **GSD:** Source <URL verified> | Status ✅ OR ❌
3. **Impeccable:** Source <URL verified> | Status ✅ OR ❌

## §2 Group B — Frontend design + UI inspiration (WebSearch sources)
4. **Emil Kowalski:** Source <URL identified> | Status ✅ installed OR ❌ <reason> OR 🟡 source-ambiguous-defer
5. **Taste skill:** Source | Status
6. **UI/UX Pro Max:** Source | Status
7. **21st.dev:** Source | Status

## §3 Group C — MCP servers (claude_desktop_config.json entries)
8. **Context 7:** Entry added ✅ OR ❌ <reason>
9. **Obsidian skills:** Entry added ✅ OR installed via skill format ✅ OR ❌
10. **Tavily:** Entry added ✅ (API key placeholder TBD Daniel obtain tavily.com/dashboard)

## §4 Group D — Eval + Anthropic oficial
11. **Firebase MCP eval verdict:** INSTALL YES / NO / DEFER + rationale ~30-50 LOC
12. **Sequential Thinking:** Entry added ✅

## §5 Final claude_desktop_config.json
Full config content post-edit (verify JSON valid + mcpServers entries count: filesystem + claude-code + obsidian-mcp-tools + context7 + tavily + sequential-thinking + obsidian-skills-if-MCP = 6-7 entries total).

## §6 Total summary
- Installed certain: X/12
- WebSearch source-identified + installed: Y/12
- Eval pending: Z/12 (Firebase MCP only)
- Errors/blockers: list specific cu reason
- API keys pending Daniel: list (Tavily minimum)

## §7 Next steps Daniel manual post-restart
1. Quit Claude Desktop din tray complete + redeschide (Daniel manual).
2. Verify MCP servers loaded post-restart (open Claude Desktop, check MCP tools available).
3. Obtain Tavily API key (tavily.com/dashboard) + edit config replace `<TBD_DANIEL_API_KEY>`.
4. Optional follow-up Daniel decide Firebase MCP install based pe verdict §4.
5. Next P2 BATCH 2 Antrenor port reluare unblocked post pack 12 stable.

## §8 Commit + archive
- Commit message: `feat: install pack 12 strategic eval ecosystem LANDED + claude_desktop_config.json MCP entries (context7 + tavily + sequential-thinking + obsidian-skills) + raport LATEST cycle`
- Archive moves: `📥_inbox/PROMPT_CC_INSTALL_PACK_12.md` → `📤_outbox/_archive/2026-05/NN_PROMPT_CC_INSTALL_PACK_12_CONSUMED.md` (NN = next chronologic) + precedent `📤_outbox/LATEST.md` cycle → `NN+1_PACK_12_INSTALL_LATEST_PRECEDENT_CONSUMED.md`.
- Backup tag verify pushed origin: `git tag --list pre-install-pack-12-2026-05-12`.
```

## §5 Acceptance criteria

- ✅ Pre-flight 3 backups created (`.claude/` xcopy + config.json copy + git tag pushed origin)
- ✅ Group A 3 items installed + verified (gstack + GSD + Impeccable)
- ✅ Group B 4 items WebSearch source-identified + installed where possible (flag uncertain în raport)
- ✅ Group C 3 MCP server entries added to claude_desktop_config.json (Context 7 + Obsidian skills if MCP + Tavily)
- ✅ Group D Sequential Thinking entry added (Firebase MCP eval raport-only NU install)
- ✅ Final `📤_outbox/LATEST.md` raport NEW §0-§8 + precedent cycled to archive
- ✅ ZERO touch src/ + tests/ + main + .obsidian/ + vault SSOT files outside LATEST cycle + this PROMPT archive
- ✅ Atomic commit single-concern (NU bulk) + push origin
- ✅ Archive move post-LANDED (PROMPT_CC_INSTALL_PACK_12 → _CONSUMED + LATEST cycle precedent → _CONSUMED)
- ✅ Backup tag verify pushed origin

## §6 Rollback procedure (if catastrophic failure)

1. `git reset --hard pre-install-pack-12-2026-05-12`
2. `xcopy /E /I /Y C:\Users\Daniel\.claude.backup-2026-05-12-pre-pack-12\* C:\Users\Daniel\.claude\` (restore `.claude/`)
3. `copy C:\Users\Daniel\Documents\salafull\📥_inbox\claude_desktop_config.json.backup-2026-05-12 C:\Users\Daniel\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` (restore config)
4. Daniel restart Claude Desktop.
5. Report rollback reason + lessons learned în raport `LATEST.md`.

## §7 Constraints execution

- Single subprocess Opus.
- TodoWrite multi-step internal — gestionează 12 items individual + pre-flight + raport + commit + archive as discrete tasks.
- Per item: install command → verify → mark item ✅/❌ → continue next (NU stop on single failure unless catastrophic; raport include all failures).
- WebSearch use Tavily fallback if available, else default WebSearch tool.
- For source TBD items (Emil Kowalski + Taste + UI/UX Pro Max + 21st.dev), if WebSearch returns ambiguous results, pick most-starred GitHub repo + Claude Code skill format compatible; if zero canonical found, mark 🟡 source-ambiguous-defer + skip install (raport detail).

🦫 **Bugatti craft. Single-concern install pack 12 strategic eval ecosystem LOCKED V1 2026-05-12. ZERO touch core vault SSOT. ZERO restart Claude Desktop (Daniel manual post-raport). Rollback procedure documented.**
