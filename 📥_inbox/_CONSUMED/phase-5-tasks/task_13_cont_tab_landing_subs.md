# task_13 — Cont Tab 4 Landing + 9 Sub-Screens Mockup Parity

**Phase:** 6 (Cont Tab — 4 of 4 mockup nav)
**Type:** Feature — final tab major
**Deps:** task_12 (Dexie storage for settings persist)
**Backup tag:** `pre-phase5-task-13-2026-05-17`
**Est commits:** 4-6 atomic (landing + sub-screens groups)
**Est tests delta:** +30-50

---

## §1 Scope

Cont Tab 4 of 4 (mockup `andura-clasic.html` `#screen-settings` L1839+) = final mandatory tab pentru MVP scope 4 taburi LOCKED V1. Per mockup screens:
- **Cont landing** — drill list cu 9+ sub-screens
- **General** — Aparate lipsa drill + alte opțiuni
- **Aspect** — Theme toggle dark/light (preserves task_18 dependency)
- **Setari** — App preferences misc
- **Suport** — Whatsapp + Trimite-ne un mesaj + FAQ + Contacteaza-ne
- **Profil** — Body data + Big 6 + Goal + Tier display
- **About** — App version + credits + privacy + T&C link
- **Date export** — JSON/CSV download (task_18 dependency)
- **Confirm destructive** — 6+ confirmation modals reset data / delete account

## §2 Changes

### A. `src/react/routes/screens/cont/Cont.tsx` (LANDING refactor)

Replace current placeholder cu drill list mockup parity:
```tsx
const drills = [
  { id: 'profil', label: 'Profilul tau', icon: User, screen: 'cont-profil' },
  { id: 'general', label: 'General', icon: Settings, screen: 'cont-general' },
  { id: 'aspect', label: 'Aspect', icon: Palette, screen: 'cont-aspect' },
  { id: 'setari', label: 'Setari', icon: Sliders, screen: 'cont-setari' },
  { id: 'suport', label: 'Suport', icon: HelpCircle, screen: 'cont-suport' },
  { id: 'export', label: 'Exporta datele', icon: Download, screen: 'cont-export' },
  { id: 'about', label: 'Despre', icon: Info, screen: 'cont-about' },
] as const;

return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Cont</h1>
    {drills.map((d) => (
      <button
        key={d.id}
        onClick={() => navigate(`/cont/${d.screen}`)}
        className="w-full flex items-center gap-3 px-4 py-3 border-b border-line text-left"
      >
        <d.icon className="w-5 h-5 text-ink2" />
        <span className="flex-1 text-sm">{d.label}</span>
        <ChevronRight className="w-4 h-4 text-ink2" />
      </button>
    ))}
  </div>
);
```

### B. Sub-screens (7-9 NEW files)

Each în `src/react/routes/screens/cont/`:

1. **Profil.tsx** — display Big 6 + Goal + Tier + edit button → Onboarding re-run (task_14 dependency)
2. **General.tsx** — Aparate lipsa drill (link to existing AparateLipsa modal logic vanilla port OR new React picker)
3. **Aspect.tsx** — Theme toggle dark/light radio cu live preview (task_18 dep)
4. **Setari.tsx** — App preferences (units kg/lb, language, notifications future)
5. **Suport.tsx** — WhatsApp link + Feedback form mailto + FAQ accordion + Contact email
6. **Export.tsx** — Download JSON full data + CSV sessions only (task_18 dep)
7. **About.tsx** — Version + credits + Privacy link + T&C link (task_17 dep)
8. **AparateLipsa.tsx** — 10 echipamente standard gym toggle picker (mockup screen-aparate-lipsa parity)
9. **ConfirmReset.tsx** — destructive confirm modal reset all data (route + back)

### C. Router extend `src/react/routes/router.tsx`

```tsx
{
  path: 'cont',
  element: <ContLayout />,
  children: [
    { index: true, element: <Cont /> },
    { path: 'profil', element: <Profil /> },
    { path: 'general', element: <General /> },
    { path: 'aparate-lipsa', element: <AparateLipsa /> },
    { path: 'aspect', element: <Aspect /> },
    { path: 'setari', element: <Setari /> },
    { path: 'suport', element: <Suport /> },
    { path: 'export', element: <Export /> },
    { path: 'about', element: <About /> },
    { path: 'confirm-reset', element: <ConfirmReset /> },
  ],
},
```

### D. `navigation.ts` — extend `GotoScreen` union

```tsx
type GotoScreen =
  | ...
  | 'cont-profil'
  | 'cont-general'
  | 'cont-aparate-lipsa'
  | 'cont-aspect'
  | 'cont-setari'
  | 'cont-suport'
  | 'cont-export'
  | 'cont-about'
  | 'cont-confirm-reset';
```

### E. `BottomNav.tsx` (verify Cont tab active state)

Cont tab already wired Phase 2 routing skeleton. Verify active state highlights when sub-screen route (e.g. `/cont/profil`).

## §3 Acceptance criteria

- [ ] Cont landing renders 7+ drill items mockup parity
- [ ] 9 sub-screens implemented routable
- [ ] Sub-screens use `<Link>` or `navigate()` back to Cont landing
- [ ] AparateLipsa toggle picker 10 echipamente persist localStorage `wv2-missing-equipment`
- [ ] Aspect theme toggle changes CSS var class on `<body>` (task_18 dep wiring)
- [ ] Export downloads JSON/CSV (task_18 dep)
- [ ] About surfaces version + Privacy + T&C links
- [ ] All routes typed în GotoScreen union
- [ ] Tests +30-50 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/Cont.landing.test.tsx
- renders 7 drill items
- navigates correctly on tap each drill

src/react/__tests__/cont.AparateLipsa.test.tsx
- toggles equipment chip on/off
- persists to localStorage wv2-missing-equipment

src/react/__tests__/cont.Aspect.test.tsx
- theme radio change updates body class
- preserves selected theme on remount

src/react/__tests__/cont.Suport.test.tsx
- WhatsApp link href correct
- Feedback form submits via mailto
- FAQ accordion expand/collapse

src/react/__tests__/cont.About.test.tsx
- displays version from package.json
- T&C link navigates correctly
```

## §5 Commits (atomic 4-6 grouped)

```
feat(react/screens): Cont landing + drill list 7 sub-screens

Phase 6 task_13 §A — Cont tab 4 of 4 final MVP nav. Landing drill list
mockup parity. Sub-screens stub: Profil + General + Aspect + Setari +
Suport + Export + About.

feat(react/screens): Cont AparateLipsa picker 10 echipamente persist

Mockup #screen-aparate-lipsa parity. 10 standard gym equipment toggle.
wv2-missing-equipment localStorage Tier 0 active rolling pattern.

feat(react/screens): Cont Aspect theme toggle + Setari units

Dark/light radio cu CSS var class toggle on body. Setari units kg/lb +
language preferences UI scaffold.

feat(react/screens): Cont Suport feedback form + FAQ + WhatsApp

Mailto:contact@andura.app pre-completat parity vanilla submitFeedback().
FAQ accordion 5+ common questions. WhatsApp link href.

feat(react/screens): Cont Export + About + ConfirmReset destructive

JSON/CSV download data export. About version + Privacy + T&C links.
ConfirmReset destructive modal reset wv2-* localStorage + Dexie clear.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_13_cont_tab_landing_subs.md`:
- Sub-screens count + path mapping
- Mockup parity verify cumulative (mockup verbatim cited)
- Router children nested config
- GotoScreen union extension
