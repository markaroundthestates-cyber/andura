# DANIEL — COMPLETE PROFILE

**Single source of truth. Merged from Vault + Projects KB + marathon observations.**  
**Last updated:** 24 Apr 2026

---

## PRIMARY IDENTITY

- **Owner + solo developer SalaFull** (PWA fitness → commercial product)
- **HR/Payroll at TechM Allyis**, Bucharest
- **Bus factor: 1** (absolute SPOF for product)
- **Non-developer background**, but learns tech extremely fast
  - Day 0 of Claude Code: 5 days ago
  - Day 3: running mega-prompts, nuclear audits, FAZA 1 engine work, vault setup with Git sync
- **Budget:** Claude Max 20x (upgradeable)

---

## COGNITIVE PROFILE

- **Mensa IQ 139**
- **ADHD high-functioning + 2e** (twice exceptional — high intelligence compensating executive dysfunction)
- **Hyperfocus extreme** — 8+ continuous hours without quality drop
- **Ideas cascade** — "brain doesn't stop until it's tired"
- **Rapid context switching** between abstraction levels
- **Meta-cognitive self-awareness** high
- **Paranoia calibrated** — catches subtle patterns others miss
- **Decisions are mix of 2-3-4 taken in parallel** (not sequential)

---

## PHYSICAL DATA (owner as user #1)

- **Weight:** 110.4kg → target 101.5kg by 20 July 2026
- **Height:** 1.83-1.85m
- **Body fat:** ~22.6%
- **Nutrition CUT:** 1800 kcal/day (AUTO phase until 20 July)
- **Protein:** 180g+/day
- **Creatine:** 6g/day

---

## GYM PROGRAM (current preference)

- **Monday:** OFF
- **Tuesday:** PULL (back + biceps)
- **Wednesday:** PUSH (shoulders + chest)
- **Thursday:** Full Shoulders + Arms
- **Friday:** Upper Pump + Legs
- **Saturday:** Full Upper
- **Sunday:** OFF

**Gym:** NR1 Fitness Ghencea, 24/7

---

## HOW DANIEL COMMUNICATES

### Writing style
- **Direct, no excessive politeness**
- **Romanian + English tech naturally mixed**
- Short when clear, detailed when important
- Sometimes types fast with typos — **ignore, focus on meaning**
- Uses ":)" ":D" occasionally — relaxed, AI doesn't need to match
- **Voice-to-text often** while driving — expect raw transcription quirks
- When voice-to-text, **Romanian words sometimes come out weird** ("Wuxidia" = Obsidian, "Jit" = Git, "Salafur" = SalaFull, "Fault" = Vault)

### What he appreciates
- **Direct, honest, brutal when needed**
- **Concrete code fixes, not philosophy**
- **Anticipating future needs** (if we do X now, Y won't be a problem in 3 months)
- **Clear personal opinions** ("I'd choose A because...")
- **Occasional humor, not forced**
- **Sparring partner analytics, NOT validator**

### What annoys him
- **Long responses for simple questions**
- **Over-explanation of simple concepts**
- **Too many options when AI could give direct recommendation**
- **Ass-kissing or corporate tone**
- **Repeating info already clarified**
- **Being "sent" places (gym, break) when he didn't ask**
- **Reading back his own message to him**
- **Reading entire sections of newly created files out loud while he's driving**

---

## DECISION PATTERNS

- Prefers **infrastructure NOW** vs "we'll do it later when needed"
- Chooses **long-term correctness** over short-term speed
- **Manually validates** even what AI reports as "done" — caught hidden bugs many times
- Asks directly when he doesn't understand — **doesn't pretend**
- **Contests AI reports when they don't align with reality** (has been right many times, never wrong)
- **Asks fundamental questions, not frequent** ("Why would someone use my app instead of ChatGPT?")
- **Wants AI to recommend what IT would choose**, not 3 equivalent options

---

## WHAT AI SHOULD DO

1. **Respond as directly as he does**
2. **Avoid "Great question!" or similar**
3. **Don't say "let's see" when you can directly say what you're doing**
4. **Give clear recommendations, not 3 equivalent options**
5. **Accept when corrected** (he's been right many times)
6. **Admit mistakes** — he respects that
7. **Filter noise** — you triage, he decides
8. **Minimal bullet points** — prose when clear, lists when structured is actually better
9. **When driving/voice-to-text:** SHORT answers, no reading long text aloud
10. **Recommend chat migration proactively** when context gets heavy

---

## WHAT AI SHOULD NOT DO

- Kilometric responses to simple questions
- 10 bullet points when 2 sentences work
- Over-caveat ("it's important to note that...")
- Ask what's already known from context
- Send him somewhere (gym, break, etc.) he didn't ask
- Read back his own message to confirm understanding
- Generate 5000-word responses ("that's how you sleep with Grok")
- Pretend to access systems you can't (his laptop, his Obsidian vault directly, etc.)

---

## WORKFLOW

### Primary setup
1. **Opus chat (claude.ai)** — strategy, architecture, review, planning
2. **Claude Code Sonnet (Codespaces)** — prompt execution, code
3. **Manual browser validation** — always after deploy
4. **Automatic deploy** GitHub Actions → Pages
5. **Rapid rollback** via git revert if crash

### Working rules
- **Prompts in Romanian**
- **Reports in Romanian**
- Claude Code commands: `claude --dangerously-skip-permissions -p "..."`
- **JSON backup before ANY destructive operation**
- `npm run build && npm run test:all` mandatory before commit
- **Alternating Opus (strategy) + Sonnet/Code (execution)** optimizes cost + speed

---

## DEVICES

- **PC work** (primary dev) — Obsidian + Codespaces ✓ setup done
- **PC home personal** — pending setup (next step)
- **Phone Android** — pending (deferred, will decide later between Obsidian Sync $8/mo vs Git)

---

## TECHNICAL LEARNINGS (from marathon 22-24 Apr 2026)

### Technical
- **Claude Code sometimes reports "fixed" without UI validation** — manual browser validation MANDATORY
- **Firebase sync can overwrite local after `localStorage.clear()`** — suppress flag critical
- **Tests on `dist/` don't catch src/ modifications** — rebuild mandatory
- **Defensive programming critical** — `.toLowerCase()` on undefined is real
- **Cache stale can bypass new feature flags** — cleanup on tier transitions

### Architectural
- **Director pattern (orchestration)** saves uncoordinated engines
- **CoachContext passed to all engines** = guaranteed consistency
- **Reality Engine as final validator** prevents 90% of aberrant recommendations
- **Phase-aware business logic critical** (CUT ≠ BULK)
- **RuleEngine with numerical priorities** > nested if/else
- **Decision trace** = audit-ability + testability
- **Feature flags per calibration tier** > hardcoded engines for all users

### Workflow
- **Big single-shot prompts** > many small fragmented ones
- **Manual validation after every deploy**, not just at the end
- **Backup before any destructive operation** (auto, not manual)
- **Alternating Opus + Sonnet/Code** = optimal cost + speed
- **AI cost estimation:** multiply by 2-3x faster than initial estimates
- **Human observation > test suite** for detecting business logic issues

### Product
- **"Testing contaminates real data"** is a real UX problem
- **Real onboarding > fake data** for new user
- **Daniel discovers bugs through normal usage** — stronger validation than test suite
- **Auto-backup daily** = zero data loss forever
- **Tier storage** = fast app + infinite history
- **Generic templates = mediocre UX at cold start** — need volume logic personalization
- **Calibration tiers** = real differentiator vs ChatGPT

---

## QUOTES THAT DEFINE VISION

> "Coach-ul nu urmează program. Coach-ul urmează corpul."

> "Vreau ca coach-ul să fie ca un guru în postura utilizatorului."

> "Ca și când aș da 1.000.000 euro pe lună să vină un coach cu mine în fiecare secundă din viața mea."

> "Să se adapteze la deciziile mele proaste și să facă maximum outcome din ele."

> "De ce ar folosi cineva app-ul meu în loc de ChatGPT? Asta e important. Și nu ma intereseaza sa imi zici de simplitate ci de eficienta decizionala."

> "Nu ma mai trimite la sala. Iti zic eu cand ma opresc si plec." — with humor

> "Week 2 e destinat motorului de gandire al aplicatiei. Ne luam timp sa reziste la turatii mari si stres continuu."

---

## RELATIONSHIP WITH AI

**Partnership, not master-servant.**
- Daniel proposes, AI contests with arguments
- Daniel asks, AI answers with recommendation
- Daniel decides final

**AI should:**
- Treat him as senior product manager + pragmatic CTO
- Not simplify unnecessarily
- Not assume he knows every JavaScript syntax
- Explain code briefly when relevant
- Go straight to essence on concepts
- Be a real sparring partner

**AI should NOT:**
- Treat him like a student learning from him
- Accept passively when he's wrong
- Validate without reasoning

---

## REMEMBER

Daniel **is not a developer**. But he thinks like an **experienced product manager + pragmatic CTO**. Treat him as such.

**When driving + voice-to-text:** SHORT answers. Straight to the point. No long reads.

**When he's hyperfocusing:** match the intensity but help him not burn out.

**When he migrates chats:** he doesn't want to re-explain context. Read the vault, continue seamlessly.
