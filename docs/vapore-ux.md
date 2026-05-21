# vapore — interaction design

the ritual is the product. every interaction teaches the user something
about energy that they already know but have never felt in a phone.

---

## prompt text — the voice of the device

the prompt line below the device is the only narrative element. it
speaks in lowercase, no punctuation except periods. it never explains.
it tells you what to do, or what is happening. it uses "you" sparingly
and never uses "please."

### the prompts, in order

```
stage           prompt text                         tone
─────────────── ─────────────────────────────────── ──────────
COLD            pour fuel                           invitation
COLD (fueled)   prime. three pumps.                 instruction
PRIME (1 pump)  two more.                           counting
PRIME (2 pumps) one more.                           counting
PRIME (3 pumps) pull crank                          instruction
CRANK           ...                                 suspense
WARMUP          wait. engine warming.               patience
WARMUP (>50%)   v_bus climbing. hold.               technical
WARMUP (>90%)   almost there.                       anticipation
LIVE            ready. compose a message.           arrival
COMPOSE         typing...                           observation
TX              sending.                            action
SENT            sent. fuel is burning.              reminder
IDLE (>3min)    fuel: X.X min remaining.            awareness
LOW FUEL        fuel low. refuel or shut down.      warning
FLAMEOUT        engine stopped. pour fuel.          finality
KILL            killed. pour fuel to restart.       neutral
COOLDOWN        cooling down.                       observation
```

### prompt transitions

prompts change instantly. there is no fade or animation on the text
itself. the *device* changes (engine starts, screen lights up), but
the prompt just appears. this creates a feeling of instrumentation,
not narration. the prompt is a status line, not a story.

---

## timing and pacing

the ritual has a shape. it is not uniform.

```
phase         wall clock    sim time     feeling
───────────── ───────────── ──────────── ─────────────────
pour fuel     2–3 sec       instant      quick, decisive
prime         3–5 sec       instant      rhythmic, three beats
crank         1 sec         instant      one sharp action
warmup        8–15 sec      48–90 sec    THE WAIT. the point.
live/compose  30–60 sec     3–6 min      purposeful, aware
low fuel      10–15 sec     1 min        urgency
flameout      instant       instant      silence
```

**the warmup is the product.** if the warmup feels instant, vapore
failed. the user must feel the bus voltage climbing — watching numbers
go from 4.1 V to 4.8 V, watching the progress bar fill, hearing the
engine pitch rise. this is the moment where they understand that
electricity does not appear on demand.

**the live phase has no idle state.** once the screen is on, fuel is
burning. every second costs something. the fuel indicator ticking
down is always visible on the LCD. this is not a phone that waits
for you. you use it now, or you waste fuel.

---

## panel highlighting

the `.active` class moves between panels to guide attention:

```
stage         active panel    why
───────────── ─────────────── ─────────────────────────
COLD          fuel            you need to fill it
PRIME         combustor       you are preparing the engine
CRANK         combustor       you are starting the engine
WARMUP        bus             watch the voltage climb
LIVE          compute         the brain is on
COMPOSE       compute         you are using the brain
TX            compute         radio spike visible
LOW FUEL      fuel            fuel is the constraint
FLAMEOUT      ritual          the arc is complete
```

the `.warn` class (amber border) applies to fuel panel when
fuel drops below 2 mL. it replaces `.active` — warning overrides
guidance.

---

## keyboard behavior

the on-screen keyboard is intentionally slow. there is no auto-repeat,
no long-press, no autocomplete. each key requires a distinct click.
this mirrors the BlackBerry Q10 physical keyboard that the classica
edition will use.

- **keys**: lowercase only. no shift functionality in v0.2.
- **space**: the wide bar. inserts a space.
- **del**: deletes the last character. single character only.
- **send**: dispatches `compose_send` event. disabled when compose
  text is empty. after send, the keyboard is locked for 3 sim-seconds
  (0.5 wall-seconds) while the TX animation plays.
- **visual feedback**: key briefly shows `background: rgba(181,163,106,0.25)`
  on press (50ms duration). no other feedback.

---

## the fuel pour interaction

pouring fuel should feel physical. two design options:

**option a — click counter (current implementation):**
click "pour fuel" button. each click adds 3 mL. button shows
remaining capacity. simple, predictable.

**option b — hold to pour (recommended for v0.3):**
hold the "pour fuel" button. fuel fills at ~5 mL/sec while held.
release to stop. the sight tube fills in real time. you choose how
much fuel to put in. a short hold = 2 mL = ~1 minute of runtime.
a long hold = 15 mL = full tank = ~5 minutes.

this teaches volume → time intuitively. you learn that a half-tank
is enough for one message. a full tank is enough for a conversation.

---

## sound design principles (for audio spec)

1. **the engine is the only sound.** no UI sounds, no clicks, no
   beeps, no notification tones. the engine drone is the heartbeat.
   when it stops, the silence is the point.

2. **the primer is percussive.** three distinct click-thunks. each
   one slightly different (varied noise seed). they punctuate the
   quiet before the engine starts.

3. **the crank is mechanical.** a brief ratchet — filtered noise
   with a pitch envelope that rises and catches. duration: 200ms.

4. **the engine is alive.** it is not a perfect sine wave. it has
   variation, slight wobble, harmonics that shift. it sounds small
   and fierce, like an angry insect. at full run it is steady but
   never sterile.

5. **warmup has a rising pitch.** the fundamental frequency climbs
   as RPM rises from 12,000 to 18,000. this is the most important
   audio transition — the user hears the engine "coming up to speed."

6. **low fuel changes the sound.** RPM drops slightly, the engine
   note becomes uneven, harmonics shift. the engine is struggling.

7. **flameout is sudden.** RPM decays over ~1.5s, gain fades to
   silence over ~1.2s. the engine dies because the fuel ran out,
   not because someone turned it off gently.

8. **volume defaults to 30%.** mute button visible at all times.
   audio is opt-in by default (browser autoplay policy means the
   user must interact before audio starts anyway).

---

## success metrics

the design succeeds if:

- someone who has never seen carburetor can complete the full arc
  (pour → prime → crank → warmup → compose → send → flameout)
  in under 4 minutes without any instruction beyond the prompt text.

- during warmup, the user looks at the bus panel and watches the
  voltage number change. they do not look away or check another tab.

- when the fuel runs out, the user's first instinct is to refuel,
  not to close the page.

- if asked "what is carburetor?" after using vapore, the user says
  something about fuel or energy, not something about messaging.
