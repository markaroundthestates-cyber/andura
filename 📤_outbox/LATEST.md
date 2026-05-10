# TASK 08 — BF Auto US Navy + Override Manual Cross-Skin × 4

- **Status:** ✅ Complete
- **Commit:** `c9b3114` pushed origin/main
- **Backup tag:** `pre-task08-bf-auto-2026-05-10-1009`

## Modificări per skin

Profile section UI added cross-skin × 4 (Setări / Cont / Profil context):
- **Talie input cm** (range 50-200 step=0.5)
- **Gât input cm** (range 25-60 step=0.5)
- **BF % auto display** read-only cu badge "US Navy"
- **Toggle "Editez manual"** unlock manual BF % input override
- **Help text** GENERIC: "Calculat automat (US Navy: talie + gât + înălțime + sex) sau editat manual. Fallback Demographic Prior dacă lipsesc măsurători."

Per skin styling:
- Clasic: info-row pattern, JetBrains Mono, --line-strong borders
- Living Body: same pattern, Geist Mono, dark navy rgba(255,255,255,0.025)
- Luxury: profile-row pattern, champagne accent
- Brain Coach: list-row pattern în screen-settings-profile section "COMPOZIȚIE CORPORALĂ"

**Theme Parity Invariant V1** logic identical 4/4 (label text + range valid + override pattern).

**Engine code untouched** — UI wiring V1 only, engine BF compute follow-up post-mockup.

## Tests

✅ 2731 PASS preserved EXACT.

## Next action

**TASK 09** Loghează kcal+proteine auto-fill rule + UI cross-skin × 4 (Cluster #2 Atom 4/4 closure).
