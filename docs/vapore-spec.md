# vapore — the browser simulator

the $0 entry to carburetor. a single-page web experience that runs the
five-layer simulator in real time. you pour fuel, pump the primer, pull
the crank, wait for warmup, compose a message, and watch the fuel run out.
the whole arc takes 3–5 minutes. nothing is hidden.

---

## what vapore proves

vapore exists to validate two claims:

1. the five-layer architecture is real — you can swap the substrate
   (browser JS instead of Cox .049 hardware) and the layers still work.
2. energy honesty is perceptible — even in a simulation, you feel the
   wait, the burn rate, the finite fuel.

if the browser simulator does not make someone understand what energy
costs, the architecture failed at its most accessible surface.

---

## the interaction arc

the user sees a device — rendered as a flat, exploded-view-style
illustration — surrounded by live instrumentation. the sequence is
linear. you cannot skip steps. the device teaches you its ritual by
refusing to let you rush it.

```
1. COLD         the device is off. fuel tank empty. screen dark.
                prompt: "pour fuel"
                action: click/drag fuel canister → fills tank (0–15 mL)

2. PRIME        fuel is in the tank. engine cold.
                prompt: "prime — three pumps"
                action: click primer bulb 3×. each pump animates.

3. CRANK        primed. ready to start.
                prompt: "pull crank"
                action: click/drag crank handle. engine catches.

4. WARMUP       engine running. noise starts. case warms.
                prompt: "wait"
                the warm-up gate is real: v_bus must reach 4.8 V
                and hold for 5 seconds. user watches the bus voltage
                climb. screen remains dark. no shortcut.
                duration: ~8–15 seconds of simulation time.

5. LIVE         bus voltage stable. screen lights up.
                the sharp memory lcd renders:
                  - signal bars
                  - battery/fuel indicator
                  - "compose" prompt
                action: type a message on the on-screen keyboard.
                        hit send. watch radio TX spike on the bus.
                fuel depletes in real time (accelerated ~60× so
                15 mL lasts ~3 minutes of wall clock).

6. LOW FUEL     fuel below 1 mL. screen shows warning.
                engine note changes (lower RPM in audio).
                prompt: "refuel or shut down"

7. FLAMEOUT     fuel hits 0. engine stops. screen goes dark.
     or KILL    (or user clicks kill switch at any point.)
                prompt: "pour fuel to restart"
                the cycle is complete. restart or close.
```

---

## the visual design

### layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌─── fuel ───┐  ┌─── combustor ───┐              │
│   │  ████░░░░  │  │  phase: warmup  │              │
│   │  8.2 mL    │  │  rpm: 14,200    │              │
│   │  glow      │  │  hot: 187 °C    │              │
│   └────────────┘  │  shaft: 32.1 W  │              │
│                   └─────────────────┘              │
│                                                     │
│              ┌──────────────────┐                   │
│              │                  │                   │
│              │    [ device ]    │                   │
│              │                  │                   │
│              │   ┌──────────┐   │                   │
│              │   │  screen  │   │                   │
│              │   │          │   │                   │
│              │   └──────────┘   │                   │
│              │   ┌──────────┐   │                   │
│              │   │ keyboard │   │                   │
│              │   └──────────┘   │                   │
│              │        ◉ crank   │                   │
│              └──────────────────┘                   │
│                                                     │
│   ┌──── bus ────┐  ┌─── compute ───┐               │
│   │  v_bus 4.6V │  │  mode: idle   │               │
│   │  soc_cap 62%│  │  mcu: 5 mA   │               │
│   │  soc_li  48%│  │  radio: 4 mA │               │
│   │  e_in: 142J │  │  signal: -89  │               │
│   └─────────────┘  └──────────────┘               │
│                                                     │
│   ┌───── ritual ─────────────────────────────────┐ │
│   │  stage: warmup · wait · 86 dB · castor       │ │
│   │  runtime remaining: 5.2 min                  │ │
│   └──────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### the device

the center piece. rendered in CSS/SVG as a flat elevation view of
mk i — brunswick-green rectangle with brass-colored terminals, a
visible fuel tank (glass sight tube on the side), the sharp memory
LCD (128×128 px rendered area), the keyboard grid, and the crank
handle.

the device is not photorealistic. it is a technical illustration:
clean lines, flat color, visible internals. think teenage engineering
product page, not a 3D render.

### the five panels

four corners + bottom strip. each panel shows one layer's live state.
numbers update at 10 Hz (matching the simulation step rate in browser).
every number has its unit. every value matches the types in `types.ts`.

the panels use IBM Plex Mono. dark background, light text. the brass
accent color (#B5A36A, Pantone 871 C digital approximation) highlights
the currently active layer — the one the user should be paying
attention to.

### color

- background: #1A1A1A (near-black)
- device body: #2D4A3E (brunswick green)
- brass accents: #B5A36A
- text: #E8E4DC (warm off-white)
- screen pixels: #C8C8C8 on #1A1A1A (sharp memory LCD feel)
- warning state: #CC6633 (warm amber, not red — no alarm colors)

### responsive

- desktop: device centered, panels in four corners
- tablet: device centered, panels stack below
- mobile: device at top, panels in scrollable column below
- minimum viable width: 360 px

---

## audio

Web Audio API. three sound layers, mixed:

1. **engine idle** — a low buzz, ~180 Hz sawtooth + noise, gain
   proportional to RPM. starts at crank, fades during cooldown.
   during warmup, pitch rises as RPM climbs. at full run (18k RPM),
   the buzz is higher and steadier.

2. **primer pump** — a soft click-thunk on each pump. three clicks.

3. **crank pull** — a mechanical ratchet sound (short burst of
   filtered noise with a pitch envelope).

no music. no ambient. the engine is the only sound. when it stops,
the silence is the point.

volume defaults to 30%. mute button visible.

---

## the screen

the sharp memory LCD simulation: a 128×128 pixel area rendered at
2× or 3× for crispness. black on light gray (memory LCD is
reflective). no backlight glow.

### screen states

- **off** — blank. solid light gray.
- **engine_attn** — during warmup:
  ```
  carburetor
  ──────────
  warming up
  v_bus: 4.32 V
  ████░░░░ 62%
  wait.
  ```
- **idle** — after warmup:

  ```
  carburetor    ▂▄▆
  ──────────
  ◉ ready
  fuel: 5.2 min

  > compose
  ```

- **compose** — user typing:

  ```
  to: +1 555 0100
  ──────────
  hey. the engine
  is running. I can
  hear it from here.
  █

  [send]
  ```

- **tx** — sending:
  ```
  sending...
  ████████░░ 80%
  ```
- **rx** — after send:
  ```
  ✓ sent
  waiting for reply
  ```
- **low fuel**:
  ```
  ◉ fuel low
  < 1 min remaining
  refuel or shut down
  ```

the keyboard area below the screen shows a QWERTY layout (inspired
by the BlackBerry Q10). clicking keys types into the compose screen.
the send button submits.

---

## simulation engine

### time

the browser runs the simulation at 10 steps per second (100 ms per
`stepDevice` call). simulation time is accelerated: 1 second of wall
clock = ~60 seconds of simulation time. this means:

- 15 mL of fuel lasts ~3 minutes of wall clock (6 min sim × 60× ÷ 60)

wait, let me recalculate:

- fuel burn: 2.5 mL/min sim time
- 15 mL / 2.5 = 6 min sim time
- at 60× acceleration: 6 min / 60 = 6 seconds wall clock

that is too fast. adjust to **10× acceleration**:

- 6 min / 10 = 36 seconds wall clock for full burn

or **6× acceleration**:

- 6 min / 6 = 60 seconds wall clock = 1 minute

**decision: 6× acceleration.** one minute of wall clock per full tank.
warmup takes ~10 seconds wall clock (60 seconds sim / 6). the full
experience (pour → prime → crank → warmup → compose → send →
run out) takes about 2–3 minutes. this matches the "3 minutes to
understand energy" success criterion from AGENTS.md.

### acceleration control

a small label in the corner: `6× sim`. no slider. the acceleration
is fixed. this is not a toy; it is a demonstration. the pace is
chosen, not configurable.

### imports

the page imports `@carburetor/sim` as an ES module. the simulator
package must be built to produce a browser-compatible bundle. this
means:

- `packages/sim/` needs a browser build target (esbuild or vite)
- the bundle should be small (<50 KB uncompressed — the sim is
  ~760 LOC of pure math, no dependencies)
- crypto.subtle for SHA-256 in the telemetry codec (available in
  all modern browsers)

### state management

no framework. vanilla JS. one `requestAnimationFrame` loop:

```
let state = createInitialDeviceState();
let simTime_us = 0;

function tick(wallTime_ms) {
  const dt_wall_ms = wallTime_ms - prevWallTime;
  const dt_sim_us = dt_wall_ms * 1000 * ACCEL;  // 6×
  simTime_us += dt_sim_us;

  // inject any pending user events
  while (pendingEvents.length > 0) {
    const e = pendingEvents.shift();
    e.t_us = simTime_us;
    state = stepDevice(state, simTime_us, e);
  }

  // advance simulation
  state = stepDevice(state, simTime_us);

  // render
  renderDevice(state);
  renderPanels(state);
  renderScreen(state);
  renderAudio(state);

  requestAnimationFrame(tick);
}
```

---

## file structure

```
packages/sim/
  src/
    browser/
      index.html       single-page entry
      main.ts          boot, loop, event binding
      render.ts        DOM updates for panels + device
      screen.ts        canvas rendering for the LCD
      audio.ts         Web Audio engine sound
      style.css        layout, colors, typography
      keyboard.ts      on-screen keyboard handler
```

or, if single-file is preferred for the initial v0.2:

```
packages/vapore/
  index.html           self-contained, inline JS + CSS
```

**recommendation: start with the self-contained `index.html` approach.**
split into modules at v0.3 when the experience is proven. the single
file can be opened locally (`file://`) or served from any static host.
it imports the sim bundle from a CDN or local build.

---

## what vapore does NOT do

- no user accounts, no persistence, no analytics
- no server. pure client-side.
- no touch gestures beyond click/tap. no pinch, no swipe.
- no accessibility beyond keyboard navigation and alt text.
  (this is acknowledged as a gap; proper a11y is a v0.3 concern.)
- no mobile-native app wrapper. browser only.
- no multiplayer, no leaderboard, no gamification.
- the simulation is deterministic given the same inputs.
  there is no randomness.

---

## success criterion

hand someone the URL. they have never heard of carburetor. within
3 minutes, they have poured fuel, waited through warmup, and sent a
message. when the fuel runs out, they understand — viscerally, not
intellectually — what it means that energy is finite and perceptible.

if they say "wait, I have to refuel it?" — vapore succeeded.

if they say "cool animation" — vapore failed.

---

## implementation plan (for Codex)

### phase 1: static shell

- create `packages/vapore/index.html` with the layout, CSS, and
  device illustration (CSS + inline SVG)
- no simulation yet. just the visual shell with placeholder numbers.
- verify it renders on desktop and mobile.

### phase 2: simulation loop

- bundle `@carburetor/sim` for browser (esbuild one-liner)
- wire up `requestAnimationFrame` loop with 6× acceleration
- connect user events: pour (click fuel canister), prime (3 clicks),
  crank (click handle)
- panels update live from DeviceState

### phase 3: screen + keyboard

- implement the 128×128 canvas LCD renderer
- implement the on-screen QWERTY keyboard
- wire compose → keypress events → compute layer
- wire send button → compose_send event

### phase 4: audio

- Web Audio engine sound (sawtooth + noise, gain from RPM)
- primer click, crank ratchet
- mute button

### phase 5: polish

- responsive layout (mobile)
- fuel pour animation (liquid fill)
- warmup progress visualization (voltage climbing)
- low-fuel warning state
- page title and meta tags for sharing

`Q.E.D.`
