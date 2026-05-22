# Wave A Confirm Patterns Recommendation — A005/A006/A009/A010

**Mapped:** 2026-05-20
**Files analyzed:** 4 new confirm dialog patterns (no UI buttons currently exist)
**Analogs found:** 4/4 (all HIGH confidence — concrete mockup + existing React analogs)

## Pattern Decision Framework

Two confirm paradigms exist in codebase:

| Paradigm | Component | When to use | Existing sites |
|---|---|---|---|
| **ConfirmModal** (bottom-sheet) | `src/react/components/ConfirmModal.tsx` | Settings/Cont destructive actions (3 wired: logout, reset, delete) | `SettingsDanger.tsx` |
| **ExitConfirmSheet** (bottom-sheet 3-option) | `src/react/components/Workout/ExitConfirmSheet.tsx` | Active workout exit (continue/pause/discard) | `Workout.tsx` |
| **Drill-down screen** (sub-page) | Custom screen file per task | Mockup explicit Daniel 2026-05-11 §1 review eliminated program-confirm-modal in favor of drill-down for `confirm-program-change` + `confirm-finish-early` + `confirm-schimba-faza` + `confirm-redo-onboarding` | Currently 0 React (mockup-only) |

**Mockup verbatim source:** `04-architecture/mockups/andura-clasic.html` lines 2123-2390 (all 6 confirm pages drill-down).

**Daniel decision tension (must surface):** Mockup explicitly converts modals → drill-down screens for 4/4 missing patterns. But React Andura already wired ConfirmModal for 3 SettingsDanger actions (logout, reset, delete). **Consistency dilemma:** strict mockup parity (4 NEW screen files + routes) vs. ConfirmModal reuse (zero new files, faster ship).

---

## §A005 Schimba faza

**Closest analog:** `src/react/routes/screens/cont/SettingsDanger.tsx` (ConfirmModal pattern, 3 destructive confirms wired). Mockup analog: `screen-confirm-schimba-faza` line 2141.

**Mockup entry point:** `SettingsPrefs.tsx` (Cont › Setari, mockup line 2094). Currently SettingsPrefs hosts ONLY units (kg/lb) + week start (L/D) — no "Schimba faza" / "Refa onboarding" / "Reseteaza coach" rows wired in React.

**Recommended placement:**
- **File:** `src/react/routes/screens/cont/SettingsPrefs.tsx` (existing file, ADD section)
- **Position:** New section "Avansat" at bottom, after "Inceput saptamana" stack, before sticky footer (if any). Use same pattern as SettingsDanger.tsx lines 102-140 (button → `setConfirm('schimba-faza')`).
- **Icon:** `GitBranch` from lucide-react (mockup line 2094 `data-lucide="git-branch"`)
- **Pattern:** Reuse ConfirmModal (NOT drill-down), follow SettingsDanger.tsx lines 149-173.

**Romanian no-diacritics copy (D-LEGACY-064):**
- Row label: `Schimba faza manual` / sub: `Reseteaza unele calibrari`
- Modal title: `Schimbi faza activa?`
- Modal body: `Coach-ul recalibreaza TDEE, volum si progresie pe baza noii faze. Datele istorice raman intacte.`
- ConfirmCta: `Confirma` | cancelCta: `Anuleaza` (default)
- destructive: `true`
- testIdPrefix: `prefs-schimba-faza`

**Confidence:** HIGH (clear mockup line 2141-2153 + existing ConfirmModal pattern + clear mockup placement under SettingsPrefs lines 2086-2097)

**Daniel decision needed:** YES
- Q1: ConfirmModal reuse (Bugatti consistency, fast ship) vs. mockup-strict drill-down screen file (`SettingsConfirmSchimbaFaza.tsx`)? Recommend ConfirmModal — 3 sites already use it + zero new files.
- Q2: "Schimba faza" requires `coachStore.activePhase` field — does engine support phase switching V1 sau is this UI-only stub Phase 7+?

---

## §A006 Reseteaza onboarding

**Closest analog:** `src/react/routes/screens/cont/SettingsDanger.tsx` "Reseteaza toate datele" button (line 116-127, wires `setConfirm('reset')` + handleResetConfirmed line 61-65 calls `useOnboardingStore.getState().reset()` already). Mockup: `screen-confirm-redo-onboarding` line 2296.

**Mockup entry point:** `SettingsPrefs.tsx` (mockup line 2093, next to Schimba faza).

**Recommended placement:**
- **File:** `src/react/routes/screens/cont/SettingsPrefs.tsx` (existing file, same NEW "Avansat" section as §A005)
- **Position:** Row above "Schimba faza" (mockup order: reset-coach → redo-onboarding → schimba-faza).
- **Icon:** `RotateCcw` from lucide-react (mockup line 2093)
- **Pattern:** ConfirmModal — but action navigates to `/onboarding` (NOT wipe). Per mockup line 2304: `goto('onboard'); showToast('Incepem onboarding-ul din nou')`.

**Romanian no-diacritics copy:**
- Row label: `Refa onboarding` / sub: `Reia configurarea initiala`
- Modal title: `Refaci onboarding?`
- Modal body: `Vei relua configurarea initiala — obiective, nivel de experienta, disponibilitate. Profilul actual se pastreaza, dar raspunsurile vechi vor fi suprascrise.`
- ConfirmCta: `Confirma` | destructive: `true`
- testIdPrefix: `prefs-redo-onboarding`

**Handler:**
```tsx
function handleRedoOnboardingConfirmed(): void {
  useOnboardingStore.getState().reset();
  setConfirm(null);
  navigate(gotoPath('onboarding'));
}
```

**Confidence:** HIGH (mockup line 2296-2308 explicit + onboardingStore.reset() already exists from Wave A audit context)

**Daniel decision needed:** NO — handler clear, navigate to `/onboarding` standard pattern.

---

## §A009 Schimba program

**Closest analog:** Mockup `screen-confirm-program-change` line 2362 (drill-down explicit per Daniel review 2026-05-11 §1). React analog: NONE yet — Antrenor.tsx has NO program selector currently (mockup lines 862-870 `program-stack` not ported to React).

**Mockup entry point:** Antrenor home `program-stack` (mockup line 863, 6 programs: Auto/Forta/Masa/Slabire/Mentenanta/Longevitate). JS calls `pickProgram(btn)` → `goto('confirm-program-change')` line 3218.

**TWO-PART task:**

### Part 1: Add program selector to Antrenor home

- **File:** `src/react/routes/screens/antrenor/Antrenor.tsx` (existing file, ADD section)
- **Position:** Between `Calendar7Day` (line 131) and `StatsGrid` (line 133), as new "Obiectiv" section. Mockup parity: render 6 program rows + active marker.
- **State source:** `useOnboardingStore.data.goal` (existing field — masa/forta/definire/sanatate per SettingsProfile.tsx line 18-23). NOTE: mockup uses 6 programs, React store has 4 goals. **Daniel decision needed: extend `Goal` type to 6 (auto/forta/masa/slabire/mentenanta/longevitate) sau keep 4 + map auto→default?**

### Part 2: Confirm pattern

**Recommended paradigm:** ConfirmModal (NOT drill-down screen) — contradicts mockup but maintains React paradigm consistency. Justification: Wave A scope is 4 confirms; adding 4 new sub-page screens + 4 routes + 4 test files = ~16 extra files vs. 4 ConfirmModal callsites = zero new files.

- **Pattern:** Reuse ConfirmModal inside Antrenor.tsx (similar to SettingsDanger.tsx lines 149-173)
- **State:** `const [confirmProgram, setConfirmProgram] = useState<Goal | null>(null)`
- **Trigger:** Program row onClick → `setConfirmProgram(rowGoal)`
- **OnConfirm:** `useOnboardingStore.getState().setField('goal', confirmProgram)` + close modal

**Romanian no-diacritics copy:**
- Modal title: `Schimbi programul?`
- Modal body: `Coach-ul va regenera saptamana pe ${PROGRAM_LABELS[goal]}. Sesiunile deja facute raman in istoric.`
- ConfirmCta: `Confirma schimbarea` | destructive: `true`
- testIdPrefix: `antrenor-program-confirm`

**Confidence:** MEDIUM (mockup explicit drill-down + Daniel 2026-05-11 §1 review — recommendation contradicts mockup, requires Daniel override)

**Daniel decision needed:** YES — multiple:
- Q1: ConfirmModal reuse (recommendation, faster) vs. mockup-strict drill-down (D-2026-05-11-§1 explicit)?
- Q2: Goal type expansion (6 programs) vs. simplification (current 4)?
- Q3: Antrenor.tsx program-stack section placement above sau below Calendar7Day?

---

## §A010 Finish workout early

**Closest analog:** `src/react/components/Workout/ExitConfirmSheet.tsx` (already wired in Workout.tsx lines 463-468 — 3-option bottom sheet: continue/pause/discard). Mockup: `screen-confirm-finish-early` line 2378 (drill-down).

**Mockup entry point:** Workout overflow menu (mockup line 1562 `wv2-menu-row` → `closeWorkoutMenu(); goto('confirm-finish-early')`).

**KEY DISTINCTION pause vs finish-early:**
- **Pause** (existing): `pauseSession()` + navigate antrenor → `pausedSnapshot` keeps state for resume
- **Discard** (existing): `discardSession()` + navigate antrenor → state wiped, ZERO save
- **Finish-early** (NEW §A010): Save partial session to history (NOT discard, NOT pause) — mockup line 2383 *"Sesiunea partiala se salveaza. Coach-ul foloseste datele logate pana acum — NU pierzi progresul"*

**Recommended placement:**
- **File:** `src/react/components/Workout/ExitConfirmSheet.tsx` (existing, EXTEND from 3 to 4 options) — OR — `src/react/routes/screens/antrenor/Workout.tsx` (add separate ConfirmModal after ExitConfirmSheet at line 468).
- **Position recommendation:** EXTEND ExitConfirmSheet.tsx to 4-option (Continui / Salveaza si reia / Termina cu salvare partiala / Renunt). Single overflow menu pattern matches mockup wv2-menu line 1562.

**Romanian no-diacritics copy:**
- New button label: `Termina mai devreme` (between "Salveaza si reia" + "Renunt")
- If separate confirm pattern (ConfirmModal): title `Termini sesiunea acum?` body `Sesiunea partiala se salveaza. Coach-ul foloseste datele logate pana acum — NU pierzi progresul.`
- ConfirmCta: `Termina acum` | destructive: `true`
- testIdPrefix: `workout-finish-early`

**Handler (NEW workoutStore action needed):**
```tsx
function handleFinishEarly(): void {
  useWorkoutStore.getState().finishSessionEarly(); // NEW action: save partial → sessionsHistory
  navigate(gotoPath('antrenor'));
}
```

**Confidence:** HIGH (mockup explicit line 2378-2390 + clear distinction from existing pause/discard + ExitConfirmSheet extension pattern straightforward)

**Daniel decision needed:** YES
- Q1: Extend ExitConfirmSheet to 4-option (recommended — single sheet, mockup wv2 parity) vs. add separate ConfirmModal alongside (more code, redundant overflow)?
- Q2: `finishSessionEarly` action needs new workoutStore method — confirm partial-save logic (mockup line 2384 *"Coach-ul ajusteaza saptamana in functie de ce ai facut"*).

---

## Summary table

| Task | Recommended file | Pattern | Confidence | Daniel decision needed |
|---|---|---|---|---|
| §A005 Schimba faza | `src/react/routes/screens/cont/SettingsPrefs.tsx` (NEW "Avansat" section) | ConfirmModal reuse | HIGH | YES — ConfirmModal vs drill-down + engine phase support |
| §A006 Reseteaza onboarding | `src/react/routes/screens/cont/SettingsPrefs.tsx` (same "Avansat" section) | ConfirmModal reuse | HIGH | NO — handler navigates `/onboarding` |
| §A009 Schimba program | `src/react/routes/screens/antrenor/Antrenor.tsx` (NEW program-stack section between Calendar7Day + StatsGrid) | ConfirmModal reuse (contradicts mockup drill-down) | MEDIUM | YES — paradigm choice + Goal type expansion |
| §A010 Finish early | `src/react/components/Workout/ExitConfirmSheet.tsx` (EXTEND 3→4 options) | Extended bottom-sheet | HIGH | YES — sheet extension + workoutStore.finishSessionEarly() new action |

---

## Cross-cutting recommendation

**Strong Bugatti push-back vs. mockup drill-down paradigm:** React Andura already wired ConfirmModal for 3 SettingsDanger destructive actions (logout/reset/delete). Adding 4 new drill-down screens = 4 new route files + 4 new screen files + 4 new test files + 4 new router entries = ~16 files of duplicated UI shell. **ConfirmModal reuse path** = 0 new screen files, 4 callsites, 4 test cases. Daniel 2026-05-11 §1 review predates Wave A audit + ConfirmModal extraction (§A003 audit fix shown in component header line 4).

**Surface tradeoff (per regula #5):** Strict mockup parity vs. component reuse Bugatti consistency. If Daniel picks drill-down strict → quote 4× new file paths + 4× test files needed. If ConfirmModal → 4× simple add to existing files.

**Anti-hallucination guard:** Recommendations above based ONLY on `SettingsDanger.tsx` + `ConfirmModal.tsx` + `ExitConfirmSheet.tsx` + `Workout.tsx` + `Antrenor.tsx` + `SettingsPrefs.tsx` + `SettingsProfile.tsx` + mockup lines 2086-2097, 2140-2153, 2296-2308, 2362-2390, 1562, 863-869 read verbatim. ZERO speculation about Daniel preference for drill-down vs modal — Daniel 2026-05-11 §1 review IS explicit drill-down preference, recommendation explicitly contradicts to surface tradeoff.
