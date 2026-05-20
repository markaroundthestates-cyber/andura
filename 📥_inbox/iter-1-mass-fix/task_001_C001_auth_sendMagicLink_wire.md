# Task C001 — Auth.tsx wire sendMagicLink

**Cluster:** C (Think Before Coding)
**Karpathy:** Think Before Coding (engine integration entry-point)
**Effort:** M (~30min)
**Beta blocker:** YES Wave 1 critical
**Source finding(s):**
- `📤_outbox/audit-nuclear-2026-05-19/findings-§07.md:46-67` (§7-C2 verbatim)
- `📤_outbox/audit-nuclear-2026-05-19/findings-§31.md:20-23` (§31-C1 reaffirmed)

**File(s) touched:**
- `src/react/routes/screens/Auth.tsx:23-28` (handleSend function)
- New import statement top of file

**Dependencies:** None (BATCH_C1 first task)

---

## §A Pre-flight

Per D008 anti-halucinare, READ verbatim:

```
Read src/react/routes/screens/Auth.tsx complete file
Read src/auth.js lines 49-86 (sendMagicLink reference vanilla implementation)
Read 📤_outbox/audit-nuclear-2026-05-19/findings-§07.md:46-67
```

Verify:
- `Auth.tsx` handleSend currently `setSent(true)` without calling sendMagicLink (confirmed §7-C2 evidence line 23-28)
- `src/auth.js:49` exports `async function sendMagicLink(email, opts) → { ok, error?, code? }` with retry-aware error handling
- `src/auth.js:62-86` retries 3x w/ 300/600ms backoff on network/5xx

GitNexus impact:
```
gitnexus_impact({target: "Auth", direction: "upstream"})
gitnexus_impact({target: "sendMagicLink", direction: "upstream"})
```

Expect HIGH risk (auth = entry-point all users). Daniel acknowledged per BATCH_C1 directive.

---

## §B Implementation

### Step 1 — Add import

`Auth.tsx` top of file:
```ts
import { sendMagicLink } from '../../../auth.js';
import { captureException } from '../../../util/sentry.js';
```

(If BATCH_B1 vanilla archive landed first, path becomes `'../../auth/sendMagicLink'` — verify at execution time.)

### Step 2 — Add state hooks

```ts
const [sending, setSending] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Step 3 — Refactor handleSend

```ts
async function handleSend(): Promise<void> {
  setError(null);
  if (!isValidEmail(email)) {
    setError('Email invalid. Verifica formatul si reincearca.');
    return;
  }
  try {
    setSending(true);
    const result = await sendMagicLink(email);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error || 'Eroare la trimiterea link-ului. Verifica conexiunea si incearca din nou.');
    }
  } catch (e) {
    captureException(e instanceof Error ? e : new Error(String(e)));
    setError('Eroare neasteptata. Reincearca.');
  } finally {
    setSending(false);
  }
}
```

### Step 4 — UI feedback

Disable submit button during `sending`:
```tsx
<button
  type="submit"
  disabled={sending}
  data-testid="auth-send"
  className="..."
>
  {sending ? 'Trimit...' : 'Trimite link'}
</button>
```

Error banner above email input:
```tsx
{error && (
  <div role="alert" data-testid="auth-error-banner" className="text-sm text-danger mt-2">
    {error}
  </div>
)}
```

### Karpathy anti-overengineering check

- ✅ NU add loading skeleton (Phase 6 polish)
- ✅ NU add toast library (already setSent message renders)
- ✅ NU add retry button (sendMagicLink retries 3x internally)
- ✅ NU expand error taxonomy (single error string sufficient pre-Beta)

---

## §C Tests

`tests/react/auth/Auth.spec.tsx` (extend if exists, create if not):

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../auth.js', () => ({
  sendMagicLink: vi.fn(),
}));

describe('Auth.tsx handleSend', () => {
  it('calls sendMagicLink with email + sets sent on success', async () => {
    const { sendMagicLink } = await import('../../../auth.js');
    (sendMagicLink as any).mockResolvedValue({ ok: true });
    render(<MemoryRouter><Auth /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('auth-email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('auth-send'));
    await waitFor(() => expect(screen.getByText(/Link trimis/)).toBeInTheDocument());
    expect(sendMagicLink).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error banner on sendMagicLink failure', async () => {
    const { sendMagicLink } = await import('../../../auth.js');
    (sendMagicLink as any).mockResolvedValue({ ok: false, error: 'Eroare retea' });
    render(<MemoryRouter><Auth /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('auth-email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('auth-send'));
    await waitFor(() => expect(screen.getByTestId('auth-error-banner')).toBeInTheDocument());
  });

  it('disables submit during sending', async () => {
    const { sendMagicLink } = await import('../../../auth.js');
    (sendMagicLink as any).mockImplementation(() => new Promise(r => setTimeout(() => r({ ok: true }), 100)));
    render(<MemoryRouter><Auth /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('auth-email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('auth-send'));
    expect(screen.getByTestId('auth-send')).toBeDisabled();
  });
});
```

Run: `npm run test:run -- Auth.spec`

---

## §D Commit

```
fix(C001-auth-magic-link): wire real sendMagicLink in Auth.tsx (NC§7-C2)

Closes audit nuclear §7-C2 + §31-C1. handleSend now calls sendMagicLink
from src/auth.js cu retry-aware error handling (3x retries 300/600ms backoff).
UI shows error banner if send fails; submit button disabled during sending.

Source-citation: 📤_outbox/audit-nuclear-2026-05-19/findings-§07.md:46-67
```

Atomic single-concern. NO bundled changes to other files.

---

## §E Verify post-edit

```powershell
gitnexus_detect_changes
npm run test:run -- Auth.spec
grep -n "await sendMagicLink" src/react/routes/screens/Auth.tsx
grep -n "import { sendMagicLink }" src/react/routes/screens/Auth.tsx
```

Expected output:
- gitnexus: only `Auth` symbol modified (no unintended ripples)
- test: Auth.spec tests PASS (3 new tests)
- grep 1: `Auth.tsx:<line>: const result = await sendMagicLink(email);`
- grep 2: `Auth.tsx:<line>: import { sendMagicLink } from '../../../auth.js';`

If any check fails → fail-stop per BATCH_C1 §10 protocol.

---

🦫 **Task C001 — Auth.tsx wire sendMagicLink. Closes NC§7-C2 + §31-C1 CRIT Beta blocker. Atomic ~30min Opus.**
