Read C:\Users\Daniel\Documents\salafull\src\pages\settings.js (verify exists, ~landed batch 2 commit 4fef416).

Task: Wire Settings page into app navigation + routing. Currently Settings page exists as code but is NOT accessible via any UI navigation or URL. Smoke testing of §56.5 (account lifecycle) flows is blocked.

Steps:

1. Read src/main.js to understand existing routing pattern (how Coach/Dashboard/Greutate/Program/Plan tabs are wired).

2. Read index.html footer nav structure (5 tabs: Coach | Dashboard | Greutate | Program | Plan with bottom-fixed nav).

3. Add Settings route handler in src/main.js — pattern matching existing tabs:
   - Route trigger: URL path /settings OR hash #settings (whichever pattern existing app uses)
   - On match: import + render src/pages/settings.js renderSettings() (or whatever export name from settings.js)
   - Post-render: highlight "Setări" tab as active in footer nav

4. Add Settings nav slot in footer:
   - Position: 6th tab, OR replace less-used tab (Daniel decision deferred — for now, ADD as 6th tab)
   - Icon: ⚙️ (Unicode gear) or SVG icon matching existing tab style
   - Label: "Setări"
   - Click handler: navigate to /settings (using existing nav pattern)

5. Verify wireup:
   - npm run test:run ALL pass
   - npm run build clean
   - Manual: open http://localhost:5173/settings → Settings page renders all 4 sections (email change + recovery + delete account + logout) per §56.5
   - Manual: click "Setări" footer tab → navigate to Settings

6. Pre-commit gate:
   - test + build PASS = commit + push:
     ```
     git add -A
     git commit -m "feat(auth-phase2-batch2): wire Settings page into nav + routing (slip fix)"
     git push origin main
     ```
   - FAIL = abort, report in 📤_outbox/LATEST.md

7. Append result to 📤_outbox/LATEST.md (existing report extended cu section "WIREUP FIX 2026-05-06"):
   - Status PASS/FAIL
   - Files modified (likely src/main.js + index.html + maybe src/components/footerNav.js if exists)
   - Test count after
   - Commit SHA
