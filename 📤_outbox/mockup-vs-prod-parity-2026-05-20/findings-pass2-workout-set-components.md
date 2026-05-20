# Pass 2 — Workout SetLogInput + SetRatingButtons deep-dive

## SetLogInput (`src/react/components/Workout/SetLogInput.tsx` — 58 LOC)

### F-pass2-setloginput-01 — Paradigm divergence (Tinta state vs always-editable inputs)

- **Severity:** HIGH
- **Mockup:** Pre-log STATE shows ONLY "Tinta 10 repetari 22.5 kg" large display + "Logheaza setul" CTA. NO inputs visible until user taps log button OR pencil edit affordance.
- **Prod:** 2 number inputs (kg + reps) always editable + labels "Kg" + "Reps" — different paradigm assumes always-input-mode
- **Mockup ref:** `andura-clasic.html:1378-1382` (wv2-target-simple state)
- **Prod ref:** `SetLogInput.tsx:27-55`
- **Karpathy fix:** Daniel decision — mockup simplified 2026-05-12 Daniel directive explicit "doar tinta inainte de Logheaza. Toate cele de mai jos ascunse pana dupa log."
- **Beta blocker?** YES — Daniel reglaj 2026-05-12 explicit pattern violated

### F-pass2-setloginput-02 — "Tu ai facut X repetari cu Y kg" post-log readonly display MISSING

- **Severity:** HIGH
- **Mockup:** Post-log STATE shows "Tu ai facut 10 repetari cu 22.5 kg" as READONLY display + pencil edit affordance (wv2-postlog block)
- **Prod:** No post-log state machine — inputs remain editable after log
- **Mockup ref:** `andura-clasic.html:1385-1390`
- **Prod ref:** `SetLogInput.tsx` (single state)
- **Karpathy fix:** Add post-log state cu readonly display + pencil edit button
- **Beta blocker?** YES — UX flow Daniel reglaj 2026-05-12

### F-pass2-setloginput-03 — Label localization divergence ("Kg"/"Reps" vs "repetari"/"kg")

- **Severity:** LOW
- **Mockup:** Order + Romanian "repetari" + "kg" (no labels above, intuitive form: "10 repetari 22.5 kg")
- **Prod:** Labels "Kg" + "Reps" English abbreviation (mockup uses "repetari" full word)
- **Karpathy fix:** Surgical wording Romanian
- **Beta blocker?** NO (Wave 3)

**SetLogInput parity: 35%** (paradigm-level Daniel reglaj violated)

---

## SetRatingButtons (`src/react/components/Workout/SetRatingButtons.tsx` — 52 LOC)

### F-pass2-setrating-01 — Emoji 🟢🟡🔴 MISSING (consistent cross-screen pattern violation)

- **Severity:** HIGH
- **Mockup:** Rating buttons cu emoji dots: 🟢 Usor / 🟡 Potrivit / 🔴 Greu — traffic-light pattern consistent cu EnergyCheck + PostRpe
- **Prod:** Text-only buttons (Usor / Potrivit / Greu), no emojis
- **Mockup ref:** `andura-clasic.html:1394-1397`
- **Prod ref:** `SetRatingButtons.tsx:26-30, 37-47`
- **Karpathy fix:** Surgical (add emoji `<span>` per RATING_OPTIONS)
- **Beta blocker?** YES — cross-screen visual scan pattern (cumulative finding)

### F-pass2-setrating-02 — Heading divergence ("Cum a fost?" vs "Cum a fost setul?")

- **Severity:** LOW
- **Mockup:** "Cum a fost?" (brief)
- **Prod:** "Cum a fost setul?" (verbose)
- **Karpathy fix:** Surgical
- **Beta blocker?** NO

### F-pass2-setrating-03 — Continua CTA below ratings MISSING (state machine)

- **Severity:** HIGH
- **Mockup:** "Continua →" button below rating row, disabled until rating selected
- **Prod:** Auto-advance via onRate callback — no manual Continua button
- **Mockup ref:** `andura-clasic.html:1399`
- **Prod ref:** `SetRatingButtons.tsx:32-50` (no Continua button)
- **Karpathy fix:** Daniel decision — auto-advance (prod) faster UX vs explicit Continua (mockup) lets user review rating before commit
- **Beta blocker?** MED — mockup reglaj 2026-05-12 explicit pattern

**SetRatingButtons parity: 50%** (emoji + Continua missing, paradigm partial divergence)

---

## Pass 2 cumulative (10 sub-components now)

| Component | Parity | CRIT |
|-----------|--------|------|
| SessionTimer | 45% | 1 |
| RestOverlay | 30% | 1 |
| CoachTodayCard | 30% | 3 |
| Calendar7Day | 70% | 0 |
| TDEEStrip | 55% | 0 |
| FatigueStrip | 45% | 0 |
| HeatMapWeekly | 30% | 1 |
| NutritionInline | 80% | 0 |
| SetLogInput | 35% | 0 |
| SetRatingButtons | 50% | 0 |

**Pass 2 sample mean: 47% parity (10 components)** — consistent cu Pass 1 mean 49.6%.

**Pass 2 cumulative findings: ~30 findings, 6 CRIT**

**Pass 2 remaining ~10+ components:**
- Antrenor: CoachRestCard, StatsGrid, ReadinessVerdict, PRNotificationBanner, PRWallRecent, ReactivateCard, ResumeSessionCard
- Workout: ExitConfirmSheet, InactivityPrompt, AaFrictionModal
- Plus Wave G modalManager verify (7 confirms)

**Combined Pass 1 + Pass 2 partial: ~130 findings, 20 CRIT Beta blockers, ~36% overall mockup parity (aligned Daniel 30% observation).**
