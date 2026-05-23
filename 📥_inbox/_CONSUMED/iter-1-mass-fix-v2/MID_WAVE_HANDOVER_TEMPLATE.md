# CC Mid-Wave HANDOVER Template — Wave Saturation Recovery

**Purpose:** CC autonomous handover template **dacă bw context saturat MID-Wave** (cea mai mare risc: Wave D ~20-25h Opus = potential context exhaustion single session). Permite resume seamless într-o nouă CC session fără pierde state.

**Author:** Co-CTO chat 4 ACASĂ 2026-05-20 night.

**Authority sources:** D031 push-discipline + D041 anti-inflation + D008 primary-source verify + Karpathy 4 principii + `_MASTER_BACKLOG.md` atomic task list canonical.

---

## §0 When to trigger mid-Wave HANDOVER

CC autonomous self-monitor signal:
- **Hard signal:** context window utilization ≥70% (proximate to saturation, ~30% buffer for handover scribe + resume read)
- **Soft signal:** thinking quality degradation (loops, repetition, lost track of declared scope per `PROMPT_CC_iter1_wave_<X>_*.md` §<id>)
- **Wave-specific signal Wave D:** ≥10 tasks LANDED in current session + remaining ≥15 tasks = high probability saturation pre-Wave-LANDED

**Anti-bw-burn lesson chat 2 §2:** NU trigger handover prematur la 40-50% (over-cautious). NU defer la 90%+ (under-cautious — riscă incomplete scribe). Sweet spot: 65-75%.

**Stop trigger UNIC global:** Daniel STOP explicit anywhere overrides handover protocol (e.g. *"stai"* / *"caveman"*) → freeze immediately, scribe partial state, NO new CC session.

---

## §1 Mid-Wave HANDOVER artifact format

Scribe `📥_inbox/HANDOVER_<YYYY-MM-DD>_wave-<X>-bw-saturated_session-<N>-resume.md`:

```markdown
# Wave <X> Mid-Wave HANDOVER — Session <N> Bw Saturated → Session <N+1> Resume

**De la:** Co-CTO CC autonomous Wave <X> session <N> ACASĂ/birou <YYYY-MM-DD HH:MM>
**Pentru:** Wave <X> session <N+1> resume next CC trigger
**Status:** Wave <X> partial LANDED — <N>/<TOTAL> tasks complete. Session <N+1> resume from task <T+1>.
**Procedure:** D031 push-discipline + D043 convergence loop + anti-bw-burn protocol
**Model:** Opus 4.7 EXCLUSIVELY
**Stop trigger UNIC:** Daniel STOP explicit

---

## §1 Tasks LANDED current session <N>

### Cluster <axis name> LANDED
- `T<###>` <task title> — `<file path>:§<id>` (Karpathy <SC/SF/TBC/GD>) → commit `<sha7>`
- `T<###>` <task title> — `<file path>:§<id>` (Karpathy <SC/SF/TBC/GD>) → commit `<sha7>`
...

**Cumulative session <N>:** <N tasks LANDED> + <M commits> + <tests delta +K>

## §2 Remaining tasks Wave <X> NU yet executed

### Cluster <axis name> REMAINING
- `T<###>` <task title> — `<file path>:§<id>` (per `_MASTER_BACKLOG.md` row <line N>)
- `T<###>` <task title> — `<file path>:§<id>`
...

**Total remaining:** <TOTAL-N tasks> + estimated ~<X>h Opus session <N+1>

## §3 NO-OP skips detected current session (D029 anti-stale-baseline)

- `T<###>` — per-task HEAD grep `§<id> audit fix` în prod detected verbatim → SKIPPED no execute
- ...

## §4 Issues encountered current session (defer SI iter EXIT OR carry-forward)

- `<issue title>` — `<file path>:§<id>` — <severity HIGH/MED/LOW> — <fix proposed / deferred>
- ...

## §5 Tests delta current session <N>

- **Vitest local:** <baseline pre-session N> → <post-session N> = +<delta>
- **Property invariants fast-check:** all green
- **Visual regression:** <unchanged / NEW snapshots: <count>>

## §6 Git state current session <N>

- Branch: `main` / `feature/<branch>`
- Ahead origin: <N commits> NU pushed (D031 invariant — push manual final post-Wave LANDED, NU mid-Wave)
- Last commit: `<sha7>` <subject line>

## §7 Session <N+1> resume protocol

1. **Daniel action:** open NEW CC session ACASĂ post `git pull origin main`
2. **Paste prompt:** `📥_inbox/HANDOVER_<date>_wave-<X>-bw-saturated_session-<N>-resume.md` (this file) + reference `📥_inbox/iter-1-mass-fix-v2/PROMPT_CC_iter1_wave_<X>_*.md` original Wave prompt
3. **CC autonomous resume:** read this HANDOVER §1 LANDED + §2 REMAINING → continue from task <T+1> per `_MASTER_BACKLOG.md` ordered list
4. **Per-task pre-flight reaffirm:** D008 + D029 + Karpathy attribution per task atomic commit
5. **Push manual final:** post Wave <X> LANDED ALL tasks (session <N+1> closure OR continue session <N+2> if STILL saturated)

## §8 Anti-recurrence enforced

- D008 primary-source verify mandatory per task remaining
- D029 stale-baseline grep mandatory per task
- D031 push-discipline preserved (NU per-task push intermediate, NU per-session push)
- D041 anti-inflation — concrete signals în resume report (NU compound estimate)
- Karpathy 4 principii attribution per task commit

## §9 Files reference

- `📥_inbox/iter-1-mass-fix-v2/PROMPT_CC_iter1_wave_<X>_*.md` — Wave <X> original mega-prompt
- `📥_inbox/iter-1-mass-fix-v2/_MASTER_BACKLOG.md` — atomic task SoT
- `📥_inbox/iter-1-mass-fix-v2/_progress.md` — checkpoint Wave <X> updated post-session <N>
- `📥_inbox/iter-1-mass-fix-v2/WAVE_VERIFY_CHECKLIST.md` — post Wave <X> LANDED verify gate
```

---

## §2 Wave-D specific handover preparation

**Wave D = highest saturation risk** (~20-25h Opus = ~3-4 Opus context windows back-to-back). Anticipated split D1 + D2 likely.

**Wave D pre-split planning (CC autonomous decision mid-Wave):**
- D1 first ~18-20 tasks: Zod boundaries + Branded types + FSM core + GDPR full schema (Karpathy GD primary)
- D2 remaining ~15-17 tasks: Backup/DR + Tailwind CSS vars migration + Inter font load + Engine math precision + DST handling + Beta entry checklist + Prod ops + Trust&Safety + Supply chain

**Boundary criterion D1 → D2:** atomic commit T<###> closure cu test impact ≤5 file touched. NU split mid-multi-file refactor.

---

## §3 Resume protocol step-by-step Daniel-side

1. Daniel detect CC saturation signal (CC scribe `📥_inbox/HANDOVER_<date>_wave-<X>-bw-saturated_session-<N>-resume.md`)
2. Daniel `git pull origin main` (sync local cu push manual NU done yet — branch ahead origin)
3. Daniel open NEW CC session ACASĂ: `claude --dangerously-skip-permissions` (Opus exclusively per D029 invariant + D045 V2 design)
4. Daniel paste HANDOVER file content + reference Wave prompt original
5. CC autonomous resume → process §2 REMAINING tasks from <T+1> sequential
6. CC scribe LATEST.md post Wave LANDED via `HANDOVER_POST_WAVE_TEMPLATE.md` format

**Daniel time cost mid-Wave handover:** ~5min total (pull + open + paste). NU bottleneck CC autonomous throughput.

---

## §4 Anti-bw-burn lessons absorbed

**Chat 2 §2 slip catalog:**
- Scope misunderstanding → resolved via HANDOVER §1 LANDED + §2 REMAINING explicit
- BW inflation → resolved via §0 hard 70% signal NU 40-50% over-cautious
- Cluster E over-prep → N/A here (Cluster E paradigm Daniel-led NU CC saturation)
- Tool slip D023 → enforced via §8 anti-recurrence checklist
- BW burn zero output → resolved via Bugatti single-concern atomic per session

**Chat 1 §5 lesson:** NU touch DECISIONS.md / LATEST.md mid-Wave (anti-revisionism). Mid-Wave HANDOVER = `📥_inbox/` only.

---

## §5 Files reference

- `_MASTER_BACKLOG.md` — atomic task SoT per Wave session split tracking
- `PROMPT_CC_iter1_wave_<X>_*.md` — Wave original prompt re-referenced session <N+1>
- `HANDOVER_POST_WAVE_TEMPLATE.md` — post Wave LANDED final scribe template (this template differs — mid-Wave, NU post-Wave)
- `WAVE_VERIFY_CHECKLIST.md` — post Wave LANDED ALL sessions verify gate

---

🦫 **MID_WAVE_HANDOVER_TEMPLATE.md = CC autonomous saturation recovery template. §0 trigger criteria 70% sweet spot + §1 artifact format §1-§9 + §2 Wave D specific split D1+D2 anticipated + §3 Daniel resume ~5min + §4 anti-bw-burn lessons + §5 files reference. Preserves Wave continuity zero state loss cross-session.**
