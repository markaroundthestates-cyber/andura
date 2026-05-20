# PROMPT_CC iter 9.6 — Magic Link AuthCallback Route Critical Fix

**Model:** Opus 4.7 EXCLUSIVELY
**CC startup:** `claude --dangerously-skip-permissions`
**Procedure:** atomic Bugatti commit + push origin main
**Stop trigger UNIC:** Daniel STOP explicit
**Order:** EXECUTĂ DUPĂ PROMPT_CC_handover_ingest_2026-05-20_birou.md LANDED (NU paralel)

---

## Root cause (Daniel ground truth post iter 9.5 Firebase secrets upload)

Magic Link send funcționează acum (env injection LANDED iter 9.5). DAR click pe link email = `andura.app/auth-callback?oobCode=XXX&apiKey=YYY&continueUrl=...&mode=signIn` → React Router ERROR "Unexpected Application Error! 404 Not Found".

Cauza: `src/react/routes/router.tsx` NU are route definit pentru `/auth-callback`. `src/auth.js:60` `sendMagicLink` setează `continueUrl: ${_origin()}/auth-callback` dar React Router habar n-are de path-ul ăsta.

---

## Fix atomic — 3 changes

### Change 1 — Create `src/react/routes/screens/AuthCallback.tsx`

Componenta call `verifyMagicLink(email, oobCode)` din `src/auth.js` + navigate per outcome:
- Success → navigate la `/app/antrenor` (sau `/onboarding/0` dacă user nou per detectAnonymousLocalData logic)
- Error → navigate la `/auth` cu error param

Pattern code: studiază existing `Auth.tsx` + `Splash.tsx` pentru style consistency (Tailwind tokens, error handling, loading state). Use `parseMagicLinkUrl()` helper din `src/auth.js` pentru extract `oobCode` + `email` din URL.

Test integration manual: post-LANDED Daniel click email link → AuthCallback mount → verifyMagicLink call → navigate → see Antrenor tab (sau Onboarding step 0 user nou).

### Change 2 — Add route în `src/react/routes/router.tsx`

Top-level (NU sub `/app`, NU protected — guest can access for Magic Link verification):

```typescript
{ path: '/auth-callback', element: <AuthCallback /> },
```

Position: după `{ path: '/auth/reactivate', element: <Auth /> },` linia, înainte de `{ path: '/onboarding/:step', element: <Onboarding /> },`.

Add import: `import { AuthCallback } from './screens/AuthCallback';`

### Change 3 — Verify build + tests local pre-push

```bash
npm run typecheck   # expect 0 TS errors
npm run lint        # expect 0 new warnings
npm run build       # expect clean Vite output cu AuthCallback chunk
npm test            # expect 4547 PASS preserved (no new tests required, integration manual)
```

---

## SPA insurance — 404.html + index.html (deja LANDED via Claude chat MCP write)

Fișiere create în chat ACASĂ→birou:
- `public/404.html` — Rafael Pedicini pattern encode URL → query string
- `index.html` — pereche decode script înainte React Router mount

Astea sunt **safety net pentru orice deep-link path nematch** (insurance, NU primary fix). Primary fix = Change 1-3 above. Lasă fișierele așa cum sunt — nu reverte.

Verify post-build că `dist/404.html` există (Vite copy din public/). Dacă lipsește → check `vite.config.js` `publicDir` config.

---

## Commit atomic

```bash
git add src/react/routes/screens/AuthCallback.tsx src/react/routes/router.tsx public/404.html index.html
git commit -m "fix(routing-iter-9.6): Magic Link AuthCallback route + SPA 404 fallback (live andura.app blocker)"
git push origin main
```

Push triggerează deploy.yml redeploy ~6-10 min → andura.app Magic Link funcțional end-to-end.

---

## Verify post-push (CC autonomous)

1. `git log --oneline -3` — confirm commit landed pe origin
2. Report în chat: "Iter 9.6 LANDED commit `<SHA>` — Magic Link AuthCallback route + 404 SPA fallback. CI redeploy in progress. Daniel verify post-redeploy click email link → Antrenor."
3. ZERO raport append în LATEST.md (fix scurt, scrie doar dacă Daniel cere explicit)

---

## Stop conditions

- Continue autonom toate 3 changes + commit + push
- STOP dacă AuthCallback logic require backend integration call NU exist în current API → escalate Daniel
- STOP dacă build fail post Change 1-2 → diagnostic + decide rollback sau iter 9.7

---

## Anti-recurrence enforce

- D023 + D038 vault writes filesystem only, ZERO create_file
- D039 chore-auto hook disabled preserved
- ZERO false "LANDED" rapoarte fără verify reflog real
- Commit message match exact `git show --stat <SHA>` output

🦫 Bugatti craft. Iter 9.6 critical Magic Link blocker final fix. Opus 4.7 exclusively.
