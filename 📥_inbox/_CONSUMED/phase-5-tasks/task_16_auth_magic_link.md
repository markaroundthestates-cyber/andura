# task_16 — Auth Magic Link React Port

**Phase:** 6 (foundations)
**Type:** Feature — auth flow port reuse Firebase logic
**Deps:** task_14 (profileStore) + task_15 (Splash routing)
**Backup tag:** `pre-phase5-task-16-2026-05-17`
**Est commits:** 2 atomic (auth store + Auth screen)
**Est tests delta:** +12-18

---

## §1 Scope

Auth flow Magic Link (passwordless email link) — reuse Firebase logic existing `src/auth/*` vanilla (Phase 2 SMTP RESOLVED D-LEGACY-096) wrapped în React-side `useAuthState()` hook + `Auth.tsx` screen. NU re-implement Firebase from scratch — wrap existing module via thin adapter.

## §2 Changes

### A. `src/react/stores/authStore.ts` (NEW)

```tsx
export type AuthState = 'unknown' | 'unauthenticated' | 'pending-link' | 'authenticated' | 'error';

export interface AuthStoreState {
  state: AuthState;
  email: string | null;
  uid: string | null;
  error: string | null;
}

export interface AuthActions {
  sendMagicLink: (email: string) => Promise<void>;
  completeSignIn: (url: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState & AuthActions>()((set, get) => ({
  state: 'unknown', email: null, uid: null, error: null,
  sendMagicLink: async (email) => {
    set({ state: 'pending-link', email, error: null });
    try {
      const { sendSignInLinkToEmail } = await import('../../auth/firebaseAuth.js');
      await sendSignInLinkToEmail(email);
    } catch (e) {
      set({ state: 'error', error: e instanceof Error ? e.message : 'Eroare necunoscuta' });
    }
  },
  completeSignIn: async (url) => {
    try {
      const { completeMagicLinkSignIn } = await import('../../auth/firebaseAuth.js');
      const { uid, email } = await completeMagicLinkSignIn(url);
      set({ state: 'authenticated', uid, email });
    } catch (e) {
      set({ state: 'error', error: e instanceof Error ? e.message : 'Link invalid' });
    }
  },
  signOut: async () => {
    const { firebaseSignOut } = await import('../../auth/firebaseAuth.js');
    await firebaseSignOut();
    set({ state: 'unauthenticated', email: null, uid: null });
  },
}));

export function useAuthState() {
  return useAuthStore((s) => s.state);
}
```

### B. `src/react/routes/screens/Auth.tsx` (refactor)

```tsx
export function Auth(): JSX.Element {
  const [email, setEmail] = useState('');
  const sendMagicLink = useAuthStore((s) => s.sendMagicLink);
  const authState = useAuthStore((s) => s.state);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return;
    await sendMagicLink(email);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Intra in cont</h1>
      <p className="text-sm text-ink2 mb-6">
        Iti trimitem un link magic pe email. Apasa pe link ca sa intri direct.
      </p>
      {authState === 'pending-link' ? (
        <div className="bg-paper2 border border-line rounded-xl p-4">
          <p className="text-sm">Verifica emailul. Linkul magic a fost trimis la <strong>{email}</strong>.</p>
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder="email@exemplu.ro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-line rounded-lg mb-3"
            autoComplete="email"
            inputMode="email"
          />
          <button onClick={handleSubmit} className="w-full py-3 bg-brick text-paper rounded-xl font-semibold">
            Trimite linkul
          </button>
          {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
        </>
      )}
    </div>
  );
}
```

### C. App.tsx — completeSignIn on email link

```tsx
useEffect(() => {
  const { isSignInWithEmailLink } = require('../auth/firebaseAuth.js');
  if (isSignInWithEmailLink(window.location.href)) {
    useAuthStore.getState().completeSignIn(window.location.href);
  }
}, []);
```

### D. ProtectedRoute extend cu auth check

Combine task_14 ProtectedRoute onboarding gate cu auth gate:
```tsx
const onboarded = useProfileStore((s) => s.onboardedAt != null);
const authState = useAuthState();
if (authState === 'unauthenticated') return <Navigate to="/auth" replace />;
if (!onboarded) return <Navigate to="/onboarding" replace />;
return <Outlet />;
```

## §3 Acceptance criteria

- [ ] Auth screen renders email input + send button + pending state
- [ ] Magic link sent via Firebase reuse (NU re-implement)
- [ ] completeSignIn detected pe URL → auth state authenticated
- [ ] ProtectedRoute gates unauthenticated → /auth redirect
- [ ] SignOut clears auth state
- [ ] Error states displayed cu RO copy
- [ ] Tests +12-18 PASS (mocked firebase module)
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/authStore.test.ts
- sendMagicLink transitions unknown → pending-link
- completeSignIn transitions pending-link → authenticated
- signOut clears state

src/react/__tests__/Auth.test.tsx
- renders email input
- validates email format basic (@ required)
- shows pending state post-send
- displays error message când auth fails

src/react/__tests__/ProtectedRoute.auth.test.tsx
- redirects unauthenticated → /auth
- allows authenticated + onboarded → outlet
```

## §5 Commits (atomic 2)

```
feat(react/store): authStore Magic Link Firebase reuse adapter

Wraps existing src/auth/firebaseAuth.js (Phase 2 SMTP RESOLVED
D-LEGACY-096) via async dynamic imports. AuthState union 5 states.
Error messages RO copy. NU re-implement Firebase from scratch.

feat(react/screens): Auth screen + ProtectedRoute auth gate combine

Email input + pending state UI. ProtectedRoute combines auth gate +
onboarding gate (task_14 dependency). completeSignIn detected pe
URL via App.tsx useEffect on mount.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_16_auth_magic_link.md`:
- Firebase reuse adapter pattern
- AuthState union 5 states
- ProtectedRoute combined gates order
- Email validation level basic (delegate Firebase server validation)
