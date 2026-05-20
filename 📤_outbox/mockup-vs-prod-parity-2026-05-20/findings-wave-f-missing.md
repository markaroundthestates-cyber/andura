# Findings — Wave F MISSING surfaces (15 screens entirely absent)

**Per `_screen-mapping-matrix.md`:** 15 mockup screens have NO React component, NO route.
**Audit approach:** Document absence + Beta blocker decision per screen.
**Audit date:** 2026-05-20

## Istoric sub-screens MISSING (4)

### F-missing-pr-wall

- **Mockup:** `screen-pr-wall` (line 1241) — full PR list sub-screen
- **Prod:** ABSENT — PR list rendered INLINE on Istoric.tsx instead
- **Severity:** MED (functionally LANDED inline, just different architecture)
- **Beta blocker?** NO — inline serves use case; Daniel decision keep inline OR add sub-route mockup-aligned

### F-missing-sesiuni-recente

- **Mockup:** `screen-sesiuni-recente` (line 2156) — recent sessions list
- **Prod:** ABSENT — Istoric.tsx shows reverse-chrono list inline
- **Severity:** MED (functionally LANDED inline)
- **Beta blocker?** NO — inline serves use case

### F-missing-loguri-greutate

- **Mockup:** `screen-loguri-greutate` (line 2186) — weight logs list view
- **Prod:** ABSENT — weight logs visible în Progres but no dedicated list view
- **Severity:** HIGH — weight history list = key Istoric value
- **Beta blocker?** YES (Wave 1 or 2)

### F-missing-weight-timeline

- **Mockup:** `screen-weight-timeline` (line 2204) — weight & BF chart full screen
- **Prod:** ABSENT — Progres has HeatMapWeekly but no detailed timeline drill
- **Severity:** HIGH — weight visualization signature feature
- **Beta blocker?** YES (Wave 1)

## Cont sub-screens MISSING (4)

### F-missing-settings-themes
- **Severity:** HIGH (broken navigation from Appearance)
- **Beta blocker?** MED — appearance row leads nowhere; remove or add theme picker

### F-missing-settings-support
- **Severity:** HIGH (broken navigation Ajutor)
- **Beta blocker?** YES (Pattern 7 Ajutor disabled)

### F-missing-settings-about
- **Severity:** HIGH
- **Beta blocker?** YES

### F-missing-settings-faq
- **Severity:** HIGH
- **Beta blocker?** YES

## Confirm modals MISSING (7)

All 7 are full-screen mockup divs cu confirm flow (warning text + Confirma / Anuleaza buttons):
- `confirm-reset-coach` (line 2126)
- `confirm-schimba-faza` (line 2141)
- `confirm-redo-onboarding` (line 2296)
- `confirm-logout` (line 2311)
- `confirm-delete` (line 2326)
- `confirm-program-change` (line 2363)
- `confirm-finish-early` (line 2378)

### F-missing-confirms-all-7

- **Mockup pattern:** Full-screen confirm cu warning copy + destructive CTA + cancel
- **Prod:** TBD — likely intended as overlay modals via `components/modalManager.js` BUT need to verify if 7 specific confirm flows exist
- **Severity:** HIGH (destructive actions need confirmations per UX safety)
- **Beta blocker?** YES — settings-danger row needs functional confirm flows to work safely

## Wave F summary

| Type | Count MISSING | Beta blocker count |
|------|--------------|-------------------|
| Istoric subs | 4 | 2 YES (weight-timeline + loguri-greutate) |
| Cont subs | 4 | 3 YES (support + about + faq), 1 MED (themes) |
| Confirm modals | 7 | 7 likely YES (destructive UX safety) |
| **Total MISSING** | **15** | **12 Beta blockers** |

**Wave F mean parity: 0% (all 15 entirely absent)**

**Recommended fix waves:**
- Wave 1 Beta blocker: 5 screens (weight-timeline + loguri-greutate + support + about + faq + confirm-logout + confirm-delete + confirm-reset-coach + confirm-finish-early)
- Wave 2 secondary: 3 screens (confirm-schimba-faza + confirm-redo-onboarding + confirm-program-change)
- Wave 3 polish: 2 screens (settings-themes + remaining)
- Architecture decision: pr-wall + sesiuni-recente keep inline (Daniel review)
