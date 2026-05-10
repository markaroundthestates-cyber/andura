═══ START PROMPT CC TASK R ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `src/pages/dashboard.js` updateNotifBtn + requestNotifications + closeDayFromDash + dismissMFPPrompt + showRecoveryModal
- Read mockup cross-skin × 4: notificări panel/center butoane handlers + Refă onboarding entry (Task J Lux + cross-skin)
- Daniel verbatim: *"Butoanele din notificari iar nu merg. Refa onboarding nu te duce iar la onboarding."*
- Pattern recurent: bug "iar nu merg" suggests previous attempt LANDED dar smoke FAIL

§1 SCOPE (atomic)
Bug critic recurent:
A. Notificări panel/center butoane (probably accept/dismiss/action notif individuale) NU au handlers wired
B. "Refă onboarding" entry (Task J Lux LANDED + cross-skin) NU redirect la screen-onboarding-step-1

Fix:
A. Wire handlers per buton notificare per type (cu actions specifice: dismiss, accept, navigate, etc.)
B. "Refă onboarding" click → goto('onboard') sau redirect screen-onboarding-step-1 cross-skin × 4

Source-of-truth `src/pages/dashboard.js` notif handlers + `src/pages/coach.js` `goto('onboard')` redirect pattern.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click pe orice buton notificare → action specific (dismiss/accept/navigate/toast)
- Click "Refă onboarding" → screen-onboarding-step-1 visible cross-skin × 4
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS

§4 BACKUP TAG
git tag pre-task-R-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): notificări handlers + Refă onboarding redirect cross-skin × 4

§6 RAPORT format invariant.
═══ END PROMPT CC TASK R ═══
