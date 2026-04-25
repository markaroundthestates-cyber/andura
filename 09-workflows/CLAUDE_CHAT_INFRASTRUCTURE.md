# CLAUDE CHAT INFRASTRUCTURE

**Last updated:** 25 Apr 2026
**Owner:** Daniel
**Purpose:** Single source of truth for how Claude chat connects to SalaFull repo + vault. Read this when migrating chats or onboarding new context.

---

## TL;DR

Claude chat reads SalaFull repo + Obsidian vault through Anthropic Project Knowledge (GitHub Integration connector). Vault syncs to GitHub every 15 min via Obsidian Git plugin. Indexing has lag (hours, not real-time). Daniel works locally at home, in Codespaces browser at office.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│  DANIEL'S WORK SETUP                                        │
├─────────────────────────────────────────────────────────────┤
│  Home PC (Windows, i7-8700K, 64GB RAM, RTX 3080)            │
│    ├─ Claude Code (local install)                           │
│    ├─ Obsidian + Git plugin (auto-sync 15 min)              │
│    └─ Vault location: C:\Users\Daniel\Documents\salafull    │
│                                                             │
│  Office PC (Allyis, browser only)                           │
│    └─ GitHub Codespaces (Sonnet runs here when at office)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │  git push (auto from Sonnet)
                            │  git push (15 min from Obsidian Git)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB REPO (private)                                      │
│  markaroundthestates-cyber/salafull                         │
│    ├─ src/         — app code                               │
│    ├─ tests/       — vitest + playwright                    │
│    ├─ docs/        — vault docs                             │
│    ├─ 00-index/    — vault index                            │
│    ├─ 03-decisions/— ADRs                                   │
│    ├─ 09-workflows/— this file lives here                   │
│    └─ 10-exec-queue/— task queue                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │  GitHub Integration connector
                            │  (indexes repo into Project Knowledge)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE CHAT (Anthropic Project: SalaFull)                  │
│    └─ project_knowledge_search reads code + vault           │
│    └─ Lag: indexing happens hours after push (not minutes)  │
└─────────────────────────────────────────────────────────────┘
```

---

## CONNECTORS STATUS (as of 25 Apr 2026)

| Connector          | Status       | Use case                               |
|--------------------|--------------|----------------------------------------|
| GitHub Integration | ✅ Connected | Reads salafull repo into Project Knowledge |
| Google Drive       | ⚠️ Auth issue| Not used. Drive auth expired, not reconnected (intentional, not needed). |
| Microsoft 365      | ❌ Not used  | Considered as backup, not needed       |

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

**Why these intervals:** vault-side commits (Daniel editing in Obsidian) need to push frequently so Claude chat sees fresh decisions. Pull every 10 min catches Sonnet's pushes from Codespaces / local Claude Code.

---

## .GITIGNORE EXCLUSIONS (Obsidian-specific)

The following are excluded from git to keep Project Knowledge index clean:

```
.obsidian/plugins/      # plugin binaries pollute search results
.obsidian/workspace.json # local UI state, not portable
.obsidian/cache/        # Obsidian internal cache
```

**Trade-off:** if Daniel sets up Obsidian on a new device, plugins must be reinstalled manually (3 clicks each). Worth it for clean indexing.

**Kept in git** (intentionally synced):
- `.obsidian/graph.json` — graph view layout with 14 color groups
- `.obsidian/app.json`, `appearance.json` — themes, basic config
- `.obsidian/themes/` — installed themes

---

## WHAT CLAUDE CHAT CAN READ

✅ **Real-time-ish (hours of lag from indexing):**
- All `.md` files in vault folders (00-index, 03-decisions, 09-workflows, 10-exec-queue, docs)
- All source code in `src/`
- All tests in `tests/`
- Config files (package.json, vite.config.js, etc.)

✅ **On request (user pastes URL or content):**
- GitHub raw URLs with session token (~24h validity, generated when clicking "Raw" in GitHub UI)
- Any pasted code/output

❌ **Cannot read:**
- Files in `.gitignore` (local-only)
- Files modified in last few hours but not yet indexed (lag)
- Private repos NOT added to Project files
- Real-time terminal output (Daniel must paste)
- Local PC files outside repo

---

## CHAT MIGRATION PROTOCOL

When a chat hits context limit:

1. **Daniel:** start new chat in SalaFull project (NOT in random project)
2. **Daniel:** include 1 short message with current focus + last 1-2 decisions
3. **Claude:** automatically has access to Project Knowledge → reads vault + repo
4. **No more zip uploads needed.**

**Exception:** if Daniel has uncommitted changes (rare), paste them or commit first via Obsidian Git.

**Optional but useful:** mention specific files to read by name (e.g., "check EXEC_QUEUE and FINDINGS_MASTER first") to prime Claude's search.

---

## KNOWN LIMITATIONS (HONEST)

1. **Indexing lag.** Project Knowledge re-indexes after push, but it takes hours not seconds. If Daniel needs Claude to see something committed 5 min ago, paste it directly in chat.

2. **No real-time git access.** Claude cannot run `git log`, `git status`, `git diff`. Daniel runs locally, pastes output if needed.

3. **No direct Claude chat ↔ Claude Code communication.** They're separate instances. Daniel is the bridge. Async pattern via EXEC_QUEUE.md is the structured workaround.

4. **No PowerShell / terminal access on Daniel's PC.** Claude works in own sandbox. Daniel runs commands locally and pastes output.

5. **Search tool returns chunks, not full files.** If Claude needs entire file, may need multiple targeted searches or Daniel pastes raw content.

---

## TROUBLESHOOTING

### "Claude doesn't see my latest changes"
- Check: did you commit + push? Open Obsidian, `Ctrl+P` → "Source Control: Commit-and-sync changes"
- If pushed but Claude still doesn't see: indexing lag. Paste content directly, or wait ~1-3 hours.

### "Obsidian Git push rejected"
- Someone else pushed first (probably Sonnet auto-push hook)
- Fix: `Ctrl+P` → "Source Control: Pull" → wait → "Commit-and-sync" again
- Or PowerShell: `git pull --rebase && git push`

### "Plugin Obsidian Git disappeared from list"
- Was probably never installed or was uninstalled
- Re-install: Settings → Community plugins → Browse → search "Obsidian Git" → Install + Enable
- Re-configure with settings from this document

### "I see old content in Claude responses"
- Project Knowledge indexed 24h ago version
- Force fresh: ask Claude to use specific search terms matching recent commits
- Or paste relevant file content in chat directly

---

## WHAT'S NOT NEEDED (TRIED AND ABANDONED)

These were considered and rejected during 25 Apr 2026 setup session:

❌ **GitHub Personal Access Token (PAT) for Claude chat.** Reason: Claude's `web_fetch` doesn't support custom HTTP headers. Token in URL doesn't work for private repos. PAT was created and immediately revoked. (Note: separate `Salafull` token exists but is orphan — see TODO in EXEC_QUEUE.)

❌ **Google Drive sync as proxy for repo.** Reason: GitHub Integration connector already provides repo access. Drive auth expired, not worth reconnecting.

❌ **Microsoft 365 / OneDrive backup.** Reason: same as above.

❌ **Manual zip uploads at chat migration.** Reason: Project Knowledge indexes everything automatically. Zip upload was needed only when GitHub Integration was not yet configured.

---

## RELATED DOCS

- [[OBSIDIAN_SETUP_GUIDE]] — how vault is structured + graph view colors
- [[VAULT_SYNC_DIAGNOSTIC]] — earlier diagnostic from initial setup
- [[VAULT_CONSOLIDATION_GUIDE]] — how vault was consolidated with code repo
- [[ASYNC_EXECUTION_PROTOCOL]] — queue-based workflow between Daniel + Claude Code

---

## CHANGELOG

- **25 Apr 2026:** Initial document. Full audit of stack connectivity. Confirmed GitHub Integration as canonical channel. Excluded `.obsidian/plugins/` from git. Set Obsidian Git auto-sync 15 min.
