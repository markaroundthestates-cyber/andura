# CLAUDE CHAT INFRASTRUCTURE

**Last updated:** 25 Apr 2026 (v2 — corrected after live testing)
**Owner:** Daniel
**Purpose:** Single source of truth for how Claude chat connects to Andura repo + vault. Read this when migrating chats or onboarding new context.

---

## TL;DR

Claude chat reads Andura repo + Obsidian vault through Anthropic Project Knowledge (GitHub Integration connector). Vault syncs to GitHub every 15 min via Obsidian Git plugin. Indexing happens within minutes after files are added/synced — much faster than initial assumptions. Daniel works mostly local on home desktop PC, with office laptop on browser only as fallback.

---

## ARCHITECTURE

```
DANIEL'S WORK SETUP

Desktop PC HOME (PRIMARY — 90%+ of work)
  Specs: i7-8700K, 64GB RAM, RTX 3080 10GB, 1TB NVMe
  Solar + battery backup (no UPS needed)
  - Claude Code (local install)
  - Obsidian + Git plugin (auto-sync 15 min)
  - VS Code / Cursor for code edits
  - Vitest watch + Playwright headed locally
  - Vault: C:\Users\Daniel\Documents\salafull

Laptop OFFICE (Allyis, browser-only fallback)
  - Claude.ai (browser)
  - GitHub Codespaces (browser) — Sonnet runs here

         |
         | git push (auto from Sonnet local/Codespaces)
         | git push (15 min auto from Obsidian Git)
         v

GITHUB REPO (private)
  markaroundthestates-cyber/salafull
  - src/, tests/
  - 00-index, 01-vision, 02-audit, 03-decisions, 04-architecture
  - 05-findings-tracker, 06-sessions-log, 07-meta
  - 08-workflows (this file lives here), 📥_inbox, 📤_outbox

         |
         | GitHub Integration connector
         | (indexes repo into Project Knowledge)
         v

CLAUDE CHAT (Anthropic Project: Andura)
  Connector: salafull repo (NOT salafull-vault, deprecated)
  Selected: 13 folders + ENGINE_ARCHITECTURE.md
  Excluded: .obsidian, .github, .husky, .claude, configs
  Capacity used: ~20% (162 files indexed)
  - project_knowledge_search reads code + vault
  - Indexing: minutes after sync (NOT 24h as feared)
```

---

## CONNECTORS STATUS

| Connector          | Status          | Use case                          |
|--------------------|-----------------|-----------------------------------|
| GitHub Integration | Active          | Reads salafull repo into Project  |
| Google Drive       | Auth expired    | Not needed, not reconnected       |
| Microsoft 365      | Not used        | Considered, not needed            |

**History note:** Originally connected to `salafull-vault` (separate vault repo). Discovered 25 Apr that vault and code had been consolidated into single `salafull` repo, leaving `salafull-vault` deprecated. Migrated by copying unique folders (01-vision, 02-audit, 05-prompts) from old vault to main repo, then disconnected old connector and added `salafull` as new connector.

---

## VAULT SYNC SETUP (Obsidian Git plugin)

**Plugin:** Obsidian Git by Vinzent03, version 2.38.2

**Settings:**
- Auto commit-and-sync interval: **15 min**
- Auto pull interval: **10 min**
- Pull on startup: ON
- Push on commit-and-sync: ON
- Pull on commit-and-sync: ON
- Commit message: `vault: auto-sync {{date}} ({{numFiles}} files)`
- Author name: Daniel Mazilu
- Author email: (Daniel's GitHub email)

**Manual force sync:** `Ctrl+P` → "Source Control: Commit-and-sync changes"

---

## .GITIGNORE EXCLUSIONS (Obsidian-specific)

```
.obsidian/plugins/      # plugin binaries pollute search results (5MB+ each)
.obsidian/workspace.json # local UI state, not portable
.obsidian/cache/        # Obsidian internal cache
```

**Trade-off:** if Daniel sets up Obsidian on a new device, plugins must be reinstalled manually (3 clicks each). Worth it for clean indexing.

**Kept in git** (intentionally synced):
- `.obsidian/graph.json` — graph view layout with color groups
- `.obsidian/app.json`, `appearance.json` — themes, basic config
- `.obsidian/themes/` — installed themes

---

## PROJECT KNOWLEDGE INDEXING — HOW IT ACTUALLY WORKS

(Corrected understanding after 25 Apr live testing)

**The mechanism:**
1. Daniel selects files/folders in Anthropic UI when setting up GitHub connector
2. Anthropic copies the files and processes them (chunking + embedding generation)
3. `Capacity used %` displays current storage in Project (1-10MB range presumably for x20 plan)
4. `project_knowledge_search` returns top-matching chunks based on semantic similarity

**Indexing speed:** Minutes after sync, NOT hours/days as initially assumed. Tested 25 Apr — full repo (162 files) indexed within 5-10 min.

**Auto-sync after push:** Currently NOT automatic. To get latest content into Project Knowledge, one of:
- Wait for Anthropic's periodic refresh (interval unknown, observed working)
- Re-add connector files (forces re-index)

**Capacity behavior:**
- Adding files = capacity increases, you pay tokens for indexing
- Removing files = capacity decreases (slot freed)
- Tokens NOT refunded when removing — one-way cost
- Removing then re-adding same files = pay tokens twice

**RAG mode:** automatically enabled when capacity nears limit. Switches from "all chunks in context" to "retrieval-based top matches". Until 80%+ capacity, all selected chunks are available.

---

## WHAT CLAUDE CHAT CAN READ

**Real-time-ish (minutes after push):**
- All `.md` files in vault folders (00-index, 01-vision, 02-audit, 03-decisions, 04-architecture, 05-findings-tracker, 06-sessions-log, 07-meta, 08-workflows)
- All source code in `src/`
- All tests in `tests/`
- ENGINE_ARCHITECTURE.md

**On request (user pastes URL or content):**
- GitHub raw URLs with session token (~24h validity)
- Any pasted code/output

**Cannot read:**
- Files in `.gitignore` (local-only)
- Files modified in last few minutes but not yet indexed
- Private repos NOT added to Project files
- Real-time terminal output (Daniel must paste)
- Local PC files outside repo
- `.obsidian/plugins/`, `.github/`, `.husky/`, `.claude/`, `node_modules/`, `dist/`, `test-results/` (intentionally excluded)

---

## CHAT MIGRATION PROTOCOL

When a chat hits context limit:

1. **Daniel:** start new chat in Andura project (NOT in random project)
2. **Daniel:** include 1 short status message with current focus + last 1-2 decisions
3. **Claude:** automatically has access to Project Knowledge → reads vault + repo
4. **No zip uploads needed for content already in repo.** Direct context from Project Knowledge.

**Exception cases:**
- Uncommitted local changes (rare) → paste them or commit first via Obsidian Git
- Recent decisions not yet pushed (last 15 min) → paste briefly
- Visual content (screenshots) → upload directly to chat

**Optional optimization:** mention specific files to read by name (e.g., "check EXEC_QUEUE and FINDINGS_MASTER first") to prime Claude's search.

---

## DESKTOP-FIRST WORKFLOW

**Decision (25 Apr):** Default work environment = home desktop PC. Office laptop is browser-only fallback.

**Rationale:**
- Desktop has full hardware (vs Codespaces lag)
- Vitest paralel on 12 threads = fast tests
- Playwright headed mode for visual debugging
- Claude Code local = no Codespaces hours consumed
- Solar + battery = no power downtime concerns

**Migration steps (not blocking, do when convenient):**
1. Verify Claude Code installed locally (`claude --version`)
2. Login Claude Code with Anthropic account (first run)
3. Repo already cloned at `C:\Users\Daniel\Documents\salafull`
4. Verify `npm install` succeeded locally
5. Test `npm run test:all -- --watch`
6. Test `npx playwright test --headed`
7. Document any office-laptop-specific workflows for fallback

**At office (Allyis):**
- Use claude.ai browser for chat
- Use Codespaces browser for Sonnet code execution
- Same repo, same project, same flow — just different env
- Avoid configuring office laptop with dev tools (separation work/personal)

---

## KNOWN LIMITATIONS (HONEST)

1. **Indexing not instant.** Project Knowledge re-indexes after Anthropic decides to refresh, not on every push. If something just committed, may take minutes to hours to appear. For absolute fresh state, paste content directly.

2. **Sync was MANUAL initially.** When connector first set up, files don't auto-update from later pushes without explicit refresh action.

3. **No real-time git access.** Claude cannot run `git log`, `git status`, `git diff`. Daniel runs locally, pastes output if needed.

4. **No direct Claude chat ↔ Claude Code communication.** They're separate instances. Daniel is the bridge. Async pattern via EXEC_QUEUE.md is the structured workaround.

5. **No PowerShell / terminal access on Daniel's PC.** Claude works in own sandbox. Daniel runs commands locally and pastes output.

6. **Search returns chunks, not full files.** If Claude needs entire file, may need multiple targeted searches or Daniel pastes raw content.

---

## TROUBLESHOOTING

### "Claude doesn't see my latest changes"
- Check: did you commit + push? Open Obsidian, `Ctrl+P` → "Source Control: Commit-and-sync changes"
- If pushed but Claude still doesn't see: indexing lag. Wait 10-30 min, retry.
- If urgent: paste content directly in chat.

### "Obsidian Git push rejected"
- Someone else pushed first (probably Sonnet auto-push hook)
- Fix: `Ctrl+P` → "Source Control: Pull" → wait → "Commit-and-sync" again
- Or PowerShell: `git pull --rebase && git push`

### "Plugin Obsidian Git disappeared from list"
- Was probably never installed or was uninstalled accidentally
- Re-install: Settings → Community plugins → Browse → search "Obsidian Git" → Install + Enable
- Re-configure with settings from this document

### "I see old content in Claude responses"
- Project Knowledge indexed an older version
- Force fresh: ask Claude to use specific search terms matching recent commits
- Or paste relevant file content in chat directly
- Or re-add connector files to force re-index (last resort)

### "Capacity used too high"
- Check what's bifate: probably accidentally bifate `.obsidian` (25%+ alone)
- Deselect what's not needed — capacity recovers
- Tokens spent on initial indexing are NOT refunded (one-way cost)

---

## WHAT'S NOT NEEDED (TRIED AND ABANDONED)

These were considered and rejected during 25 Apr 2026 setup session:

- **GitHub Personal Access Token (PAT) for Claude chat.** Claude's `web_fetch` doesn't support custom HTTP headers. Token in URL doesn't work for private repos. PAT was created and immediately revoked.

- **Google Drive sync as proxy for repo.** GitHub Integration connector already provides repo access. Drive auth expired, not worth reconnecting.

- **Microsoft 365 / OneDrive backup.** GitHub Integration sufficient.

- **Manual zip uploads at chat migration.** Project Knowledge indexes content automatically via GitHub Integration.

- **Local backup external drive (UPS-related).** Daniel has solar + battery infrastructure (5kWh backup), photos on phone (1TB), GitHub for code. Not needed.

---

## RELATED DOCS

- [[OBSIDIAN_SETUP_GUIDE]] — how vault is structured + graph view colors
- [[VAULT_SYNC_DIAGNOSTIC]] — earlier diagnostic from initial setup
- [[VAULT_CONSOLIDATION_GUIDE]] — how vault was consolidated with code repo
- [[ASYNC_EXECUTION_PROTOCOL]] — queue-based workflow between Daniel + Claude Code

---

## CHANGELOG

- **25 Apr 2026 (v2):** Corrected indexing speed assumption (minutes, not 24h). Documented connector migration salafull-vault → salafull. Added desktop-first workflow plan. Added capacity behavior explanation. Added connector status table.
- **25 Apr 2026 (v1):** Initial document. Full audit of stack connectivity. Confirmed GitHub Integration as canonical channel. Excluded `.obsidian/plugins/` from git. Set Obsidian Git auto-sync 15 min.
