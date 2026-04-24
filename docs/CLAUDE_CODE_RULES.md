# Claude Code — Project Rules

## Auto-push

**Activ.** La finalul oricărui task, Claude Code execută automat:

```bash
git add -A
git commit -m "chore(auto): <fișiere modificate>"
git push origin <branch-curent>
```

Configurat în `.claude/settings.json` via hook `Stop`. Se declanșează doar dacă există modificări nestaged/staged (nu face commit-uri goale).

Mesajul de commit listează primele 5 fișiere modificate. Exemplu:
```
chore(auto): src/pages/coach.js src/styles/main.css
```

## Commit message convention

| Prefix | Când se folosește |
|--------|------------------|
| `feat:` | Feature nou |
| `fix:` | Bug fix |
| `refactor:` | Restructurare fără schimbare de comportament |
| `docs:` | Doar documentație |
| `test:` | Adăugare/modificare teste |
| `chore:` | Build, config, auto-save |
| `chore(auto):` | Commit automat generat de hook |

Format complet: `type(scope): descriere scurtă`

Exemple:
```
feat(coach): add rest timer inactivity guard
fix(dp): CUT phase caps isolation reps at 10
refactor(coach): extract session lifecycle to coach/session.js
chore(auto): src/pages/coach/session.js src/state.js
```

## Branch strategy

| Branch | Scop |
|--------|------|
| `main` | Producție — deployat automat pe GitHub Pages |
| `feature/*` | Feature-uri noi (`feature/rest-timer-v2`) |
| `fix/*` | Bug fixes izolate (`fix/cancel-workout-cleanup`) |
| `refactor/*` | Refactorizări mari (`refactor/coach-split`) |

Reguli:
- `main` primește doar merge-uri din branch-uri testate
- Fiecare branch nou pornește din `main` actualizat
- PR sau merge direct pe `main` după `build ✓` + `test:all ✓`
- Auto-push-ul din hook funcționează pe orice branch activ

## Fișiere Claude Code relevante

| Fișier | Rol |
|--------|-----|
| `.claude/settings.json` | Hooks de proiect (auto-push, reguli) — comis în repo |
| `.claude/settings.local.json` | Permisiuni locale (tool allow-list) — nu se comite |
