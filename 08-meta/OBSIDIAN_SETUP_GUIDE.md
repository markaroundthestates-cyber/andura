# OBSIDIAN SETUP GUIDE — SalaFull Vault

**Context:** [[INDEX_MASTER]] | [[DECISION_LOG]] | [[ASYNC_EXECUTION_PROTOCOL]]

Ghid pentru vizualizarea vault-ului ca graf dens (brain view) în Obsidian.

---

## 1. Deschide Graph View

| Metodă | Shortcut / Acțiune |
|--------|-------------------|
| Keyboard | `Ctrl+G` (Windows/Linux) sau `Cmd+G` (Mac) |
| Sidebar | Click icon graf din sidebar stânga (al 4-lea icon) |
| Command palette | `Ctrl+P` → "Graph view" |

---

## 2. Settings recomandate Graph View

Deschide panoul **Filters** și **Display** din Graph View (iconuri sus-dreapta în panel):

### Filters
```
Search: (lasă gol pentru tot vault-ul)
Tags: ON
Attachments: OFF
Existing files only: ON
Orphans: OFF  ← ascunde fișierele fără nicio conexiune
```

### Display
```
Node size: Links (nodurile mari = fișiere cu multe conexiuni)
Link thickness: ON
Arrows: ON  ← direcția wikilink-ului
Text fade threshold: 1.5–2.0
Node repel force: 100–150
Link force: 30–50
Center force: 0.05
```

### Groups (Colors pe foldere)
Click **+ New group** pentru fiecare folder:

| Grup | Query | Culoare sugerată |
|------|-------|-----------------|
| Index | `path:00-index` | 🔴 Roșu (hub central) |
| Vision | `path:01-vision` | 🟣 Violet |
| Decisions | `path:03-decisions` | 🟠 Portocaliu |
| Architecture | `path:04-architecture` | 🔵 Albastru |
| ADRs | `path:docs/decisions` | 🔵 Albastru deschis |
| Findings | `path:06-findings-tracker` | 🟡 Galben |
| Sessions | `path:07-sessions-log` | 🟢 Verde |
| Workflows | `path:09-workflows` | 🟤 Maro |
| Exec Queue | `path:10-exec-queue` | ⬛ Negru/gri |
| Docs/Reports | `path:docs` | 🩶 Gri |

---

## 3. Rezultat așteptat — Vault ca creier

```
                    [INDEX_MASTER] ← nod central roșu, conexiuni la tot
                   /      |       \
          [DECISION_LOG]  [EXEC_QUEUE]  [FAZA_*_ROADMAP]
               |               |              |
        [FAZA_1_FINAL]   [EXEC_RESULTS]  [FAZA_2_FINAL]
               |                              |
      [LOG_SCHEMA_AUDIT] [SESSIONBUILDER_AUDIT] [FIREBASE_AUDIT]
               |
      [ADR 001..009] ← cluster albastru separat, format din docs/decisions/
```

- **Hub central**: [[INDEX_MASTER]] — cel mai conectat nod
- **Cluster Decisions**: [[DECISION_LOG]] + ADR-uri (001–009) → grup portocaliu/albastru
- **Cluster Docs**: rapoarte FAZA 1/2/3 → grup gri
- **Cluster Workflows**: [[ASYNC_EXECUTION_PROTOCOL]] + [[EXEC_QUEUE]] + [[EXEC_RESULTS]]

---

## 4. Plugin-uri recomandate (Community Plugins)

Activare: `Settings → Community plugins → Browse`

### ExcaliBrain (RECOMANDAT — mind map interactiv)
- **Ce face:** generează mind map din wikilinks, cu ierarhie vizuală
- **Setup:** instalează → `Ctrl+P` → "ExcaliBrain: Open ExcaliBrain" → selectează [[INDEX_MASTER]] ca nod rădăcină
- **Avantaj vs Graph View:** poți naviga hierarhic prin vault, nu spatial

### Dataview (RECOMANDAT — query vault ca bază de date)
- **Ce face:** query Markdown ca SQL — liste dinamice de fișiere, task-uri, metrici
- **Exemplu query** (pune în orice .md):
  ````
  ```dataview
  TABLE status, type FROM "10-exec-queue"
  WHERE status = "DONE"
  SORT file.name ASC
  ```
  ````
- **Usecase:** dashboard dinamic cu toate task-urile DONE/PENDING din [[EXEC_QUEUE]]

### Graph Analysis
- **Ce face:** calculează metrici de conexiune (betweenness centrality, clustering coefficient)
- **Usecase:** identifică ce fișiere sunt "hubs" critici în graf

### Folder Notes (opțional)
- **Ce face:** permite atașarea unui note la fiecare folder ca "overview" al folderului
- **Usecase:** 00-index/INDEX_MASTER.md devine automat folder note pentru rădăcina vault-ului

---

## 5. Sfaturi pentru densificarea grafului

1. **Fiecare doc nou** → adaugă `**See also:** [[DECISION_LOG]] | [[INDEX_MASTER]]` în header
2. **Fiecare entry DECISION_LOG** → linkuiește documentele create/afectate
3. **ADR-uri** → linkuiesc reciproc când sunt înrudite (ex: 001 ↔ 007 pentru Firebase)
4. **Rapoarte de fază** → linkuiesc întotdeauna: roadmap precedent, roadmap următor, DECISION_LOG

---

## 6. Shortcut-uri utile în Obsidian

| Acțiune | Shortcut |
|---------|---------|
| Open file | `Ctrl+O` |
| Search in vault | `Ctrl+Shift+F` |
| Graph View | `Ctrl+G` |
| Command palette | `Ctrl+P` |
| Toggle left sidebar | `Ctrl+\` |
| Open backlinks panel | `Ctrl+Shift+B` |
| Follow link | `Ctrl+click` pe wikilink |
| Open link in new pane | `Ctrl+Alt+click` |

---

## 7. Sync Vault ↔ GitHub

Vault-ul este în același repo cu codul (`markaroundthestates-cyber/salafull`).

**Workflow curent:**
- Obsidian editează fișierele local
- Git auto-commit la 10 min (Obsidian Git plugin)
- Claude Code auto-push după fiecare task (hook Stop)
- Claude Project citește direct din repo (GitHub connector)

**Nu e nevoie de Obsidian Sync ($8/mo)** — Git face sync între devices.
