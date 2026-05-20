# Task A001 — Antrenor header date+time "Joi, 7 mai · 18:30"

**Cluster:** A (Surgical Changes)
**Karpathy:** Surgical Changes (single-line addition)
**Effort:** S (~15min)
**Beta blocker:** NO Wave 2 polish
**Source finding(s):**
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-antrenor.md:9-19` (F-antrenor-01)

**File(s) touched:**
- `src/react/routes/screens/antrenor/Antrenor.tsx:100` (above h1, line 101 currently)

**Dependencies:** None

---

## §A Pre-flight

Per D008 anti-halucinare, READ verbatim:

```
Read 04-architecture/mockups/andura-clasic.html:733 (date header reference)
Read src/react/routes/screens/antrenor/Antrenor.tsx:95-110 (mount section)
```

Mockup line 733 specifies: `<div class="text-xs ink-3">Joi, 7 mai · 18:30</div>`

Verify locale formatter available — Romanian no-diacritics per LOCK V1.

GitNexus:
```
gitnexus_impact({target: "Antrenor", direction: "upstream"})
```

Expect LOW risk (additive text, single-file edit).

---

## §B Implementation

### Step 1 — Romanian date formatter (inline, NU new util)

Decision tree:
- Option A — inline `new Date().toLocaleDateString('ro-RO', ...)` cu manual diacritic strip → simplest, Karpathy SF
- Option B — new util `formatRoDateNoAccents(date)` in `src/react/lib/dateFmt.ts` → reusable but adds file
- Option C — use existing util if any (verify via `gitnexus_query({query: "formatDate Romanian"})`)

Per Karpathy SF, choose **Option A** unless GitNexus reveals existing util:

```tsx
const today = new Date();
const weekday = today.toLocaleDateString('ro-RO', { weekday: 'long' });
const monthDay = today.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
const time = today.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false });
const noDiacritics = (s: string) => s.replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i').replace(/ș/g,'s').replace(/ț/g,'t').replace(/Ă/g,'A').replace(/Â/g,'A').replace(/Î/g,'I').replace(/Ș/g,'S').replace(/Ț/g,'T');
const formatted = `${noDiacritics(weekday)}, ${noDiacritics(monthDay)} · ${time}`;
const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
```

### Step 2 — Add div above h1

```tsx
<div className="text-xs text-ink3 mb-1" data-testid="antrenor-date">
  {capitalized}
</div>
<h1 className="text-2xl font-bold tracking-tight">Antrenor</h1>
```

(Note: font-bold instead of font-semibold per task A071 Pass 4 polish dep — execute inline if A071 not yet LANDED, or keep font-semibold and A071 will update. Karpathy SF: defer A071 to its own task.)

### Step 3 — Persona-aware text scaling

`text-ink3` per global.css var (post-D2 Tailwind ↔ CSS vars migration). If D2 not landed, use `text-[var(--ink-3)]` arbitrary value.

### Karpathy anti-overengineering check

- ✅ NU extract formatRoDate util (Option A inline preferred — used once)
- ✅ NU memoize `today` (re-render cheap, no perf concern)
- ✅ NU add prop for static date (real-time = product personality per finding)

---

## §C Tests

`tests/react/screens/antrenor/Antrenor.spec.tsx` extend:

```tsx
it('renders Romanian date+time above h1', () => {
  render(<MemoryRouter><Antrenor /></MemoryRouter>);
  const dateEl = screen.getByTestId('antrenor-date');
  expect(dateEl).toBeInTheDocument();
  expect(dateEl.textContent).toMatch(/^(Luni|Marti|Miercuri|Joi|Vineri|Sambata|Duminica), \d{1,2} \w+ · \d{2}:\d{2}$/);
});
```

Run: `npm run test:run -- Antrenor.spec`

---

## §D Commit

```
fix(A001-antrenor-date-header): add Romanian locale date+time above h1 (MP-antrenor-01)

Closes mockup vs prod parity F-antrenor-01. Adds temporal context per
mockup andura-clasic.html:733 ("Joi, 7 mai · 18:30" pattern). Romanian
locale no-diacritics LOCK V1 preserved via inline transform.

Source-citation: 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-antrenor.md:9-19
```

---

## §E Verify post-edit

```powershell
gitnexus_detect_changes
npm run test:run -- Antrenor.spec
grep -n "antrenor-date" src/react/routes/screens/antrenor/Antrenor.tsx
```

Expected output:
- gitnexus: only `Antrenor` symbol modified
- test: Antrenor.spec PASS + new assertion PASS
- grep: `Antrenor.tsx:<line>:   <div className="text-xs text-ink3 mb-1" data-testid="antrenor-date">`

---

🦫 **Task A001 — Antrenor date header. ~15min Opus. Closes MP-antrenor-01.**
