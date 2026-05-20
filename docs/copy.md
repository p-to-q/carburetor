# copy

> first-draft external copy in carburetor's voice. **this is my draft, not the user's.** every block is rewriteable. when you finalize a piece, move it into its destination file and delete the draft here.
>
> voice rules: see `TASTE.md`. registers and the small print: see `docs/glossary.md`.

---

## hero one-liners (pick one as primary)

ranked. top is my recommendation.

1. **a phone you refuel.** — short, plain, immediately surprising. translates everywhere. the one i would put on the site.
2. **neither runs on lithium.** — fits mk i and mk ii in one sentence. mild combat with reader expectation.
3. **power has a smell.** — Smil-paraphrase. evocative but oblique; works as a manifesto opener, less as a hero.
4. **you cannot call on it. you can text on it.** — the project's most-honest sentence. a little long for hero.
5. **the warm-up is the point.** — t-shirt material.
6. **a clock with extras, again.** — Mumford ghost. only readable to readers who already know.
7. **uncouple energy from compute.** — the thesis in five words. too engineer-y for hero.
8. **if you can pour it, you can talk on it.** — slogan-shaped. cute. probably leave on the cutting-room floor.
9. **a phone that admits the trade.** — i like it but it does not stand alone without context.

bilingual companion: **汽油手机.** sits under the english hero in smaller type.

---

## site hero (carburetor.wtf, above the fold)

```
[carburetor]

a phone you refuel.
汽油手机.

mk i runs on glow fuel.
mk ii runs on butane.
neither runs on lithium.

[  try the simulator  ]   [  read the manifesto  ]   [  see the BOMs  ]
```

design notes for the page:

- wordmark in brass, 56pt+ at desktop, ~36pt at mobile.
- the "neither runs on lithium" line is brass; the two above are black.
- buttons are square-bracketed plain text, no rounded corners, no fills. underline on hover.

---

## site sections (long scroll, below the hero)

### premise

power has a smell. we forget this only because we have hidden it.

a lithium battery is a slow truth — it stores power as an abstraction that degrades on a calendar you cannot see, charged from a grid you cannot taste. carburetor is a feature phone whose energy source is fuel, not battery. it is a working artifact, not a metaphor.

we built it to stop hiding the smell.

### arrow

[embed Vapore simulator here]

pour fuel. prime three times. pull the crank. hear the engine catch. watch the supercap bus climb from zero to five volts. read a message. run out of fuel. start over.

### consequence

mk i is loud. mk ii is silent. both wait. both ask you to wait with them.

the warm-up is not a bug. the warm-up is the point. a phone that takes forty-five seconds to wake is a phone you bring out for reasons, not for the absence of reasons.

### receipts (not claims)

[receipts table from README, live-updated from CI]

### three editions

[three cards with the edition copy below]

### footer

`Q.E.D.`
© 2026 wooden computer co., ltd. · carburetor.wtf · github.com/p-to-q/carburetor

---

## edition cards (compact, ~50 words each)

### vapore

**$0 · five minutes · browser only.**

open a tab, pour fuel, watch the chain run. the simulator implements all five layers; its telemetry frames are byte-identical to what real hardware emits.

### processta

**~$120 · one weekend · soldering iron required.**

an esp32-s3, a butane catalytic heater, a LoRa radio, a sharp memory lcd, five buttons, and an injection-molded brunswick-green case. no cellular — it speaks to other carburetors and Meshtastic nodes over sub-GHz mesh, up to 15 km line of sight. processta is more honest with "you cannot call on it" than classica. it does not even have a SIM slot.

### classica

**~$760 · multi-weekend · sewing shop visit.**

cox tee dee .049, sharp memory lcd, blackberry q10 keyboard, brass mil-toggle, sewn brunswick canvas. every part curated for ideal behavior in its layer. closer to a leica purchase than a smartphone purchase.

---

## unit blurbs (paragraph-length, for site and Edizione pages 20-23)

### mk i · field

the loud one. a cox tee dee .049 micro internal-combustion engine, a brushless outrunner run as a permanent-magnet generator, a 300 F supercap bus, an 18350 li-ion buffer, an nRF52840, a sharp memory lcd, a blackberry q10 keyboard, a quectel bg95 modem. in a brunswick-green canvas case with brass terminals and a hand-crank that both starts the engine and bootstraps the mcu before the engine is running.

**650 g loaded · 15 mL glow fuel · 8 hours of text per fill · cat-m1 data only.**

### mk ii · pilot

the quiet one. a platinum-catalyzed butane combustor — no flame, no moving parts — over a bismuth telluride thermoelectric stack. silent. the only sign it is running is warmth on the case back. replaces the Cox engine in either edition; a different answer to the same architecture contract.

**mk ii is a combustor swap, not a separate device.** classica with mk ii: same case, same modem, same keyboard. processta with mk ii: this is the default — the TEG is already in the architecture spec.

---

## back-cover blurb (Edizione)

```
a phone you refuel.
汽油手机.

carburetor mk i runs on a cox tee dee .049 model engine.
carburetor mk ii runs on a butane catalytic combustor.
neither runs on lithium.

we built three editions of mk i against the same five-layer
architecture, the same telemetry codec, and the same set of
hard constraints. the cheapest costs zero dollars; the
definitive costs seven hundred and sixty. they are all the
same project.

power has a smell. we forget this only because we have
hidden it. we built carburetor to stop hiding it.

Q.E.D.

wooden computer co., ltd.
edizione I · 2026 · ___ / 100
carburetor.wtf
```

---

## one-liners for stickers / tees / signage

- **carburetor mk i — 650 g · 15 mL · 8 h**
- **carburetor mk ii — 280 g · 30 mL · 24 h**
- **the warm-up is the point**
- **you cannot call on it**
- **neither runs on lithium**
- **power has a smell**
- **汽油手机**
- **`[carburetor]` · wooden computer co.**
- **a phone you refuel · est. 2026**

---

## press / launch paragraph (250 words, for sending around)

```
p-to-q, a small independent research practice operating under
Wooden Computer Co., Ltd., has released the first public artifacts
of carburetor: a feature phone whose energy source is fuel, not
battery. carburetor ships in two physical forms — mk i, a brunswick-
green canvas-cased handset with a cox tee dee .049 micro internal-
combustion engine, and mk ii, a butane catalytic combustor over a
thermoelectric stack — silent, no moving parts — and three editions
of varying fidelity. the simulator (vapore) runs in a browser at
zero cost. the maker edition (processta, ~$120, one weekend) uses
an esp32-s3, a LoRa mesh radio, and a catalytic TEG, communicating
off-grid with Meshtastic-compatible nodes. the definitive edition
(classica, ~$760, multi-weekend) is curated with the canonical
low-power parts of its era: sharp memory lcd, blackberry q10
keyboard, quectel bg95 cellular modem.

classica speaks cat-m1 cellular data only — no voice. processta
speaks LoRa mesh — no cellular at all. both editions refuse voice
by design: removing the voice radio removes the regulatory burden,
the analog front-end, and the temptation. what remains is text.

v0.1 includes the full five-layer architecture, two BOMs, a printed
edizione, and a browser simulator whose telemetry frames are byte-
identical to what real hardware emits. it is not a phone for
everyone. it is a phone for an honest unit of energy.

carburetor.wtf
github.com/p-to-q/carburetor
hi@ptoq.io
```

---

## email signature

```
[carburetor]
a phone you refuel.
carburetor.wtf
```

---

## the rejected pile (saved for forensics)

these did not survive a second read:

- *"the future of the phone is the past of the lantern."* — too clever.
- *"a phone with a smoke."* — too dark.
- *"we are not going back. we are uncoupling."* — too defensive.
- *"refuel your conversation."* — yuck.
- *"introducing carburetor: the world's first..."* — startup register, banned.
- *"experience the warmth..."* — same.
- 任何带"重新定义"或"颠覆"或"赋能"的中文文案。

`Q.E.D.`
