# vapore — audio design spec

the engine is the only sound. when it stops, the silence is the point.

---

## Web Audio API architecture

```
[PeriodicWave oscillator] ─┐
  frequency = RPM / 60      │
  harmonics: 8               ├─► [GainNode: AM depth] ─► [BiquadFilter: lowpass] ─► [GainNode: master] ─► output
                             │       modulated by          cutoff tracks RPM
[Noise source] ─────────────┘       firing frequency
  bandpass filtered
  tracks RPM × 3
```

three sound layers mixed:

1. **engine tone** — custom PeriodicWave oscillator
2. **mechanical noise** — filtered white noise for exhaust rasp
3. **amplitude modulation** — firing pulse at RPM/60 Hz

---

## 1. engine tone

a single `OscillatorNode` with a custom `PeriodicWave` that encodes
the harmonic spectrum of a Cox .049 two-stroke:

```javascript
const harmonics = {
  real: [0, 1.0, 0.8, 0.6, 0.45, 0.3, 0.2, 0.15, 0.1],
  imag: [0, 0,   0,   0,   0,    0,   0,   0,    0  ],
};
const wave = audioCtx.createPeriodicWave(
  new Float32Array(harmonics.real),
  new Float32Array(harmonics.imag),
);
engineOsc.setPeriodicWave(wave);
```

frequency derived from RPM:

```
f = RPM / 60   (2-stroke fires once per revolution)

at 12,000 RPM → 200 Hz
at 15,000 RPM → 250 Hz
at 18,000 RPM → 300 Hz
```

use `linearRampToValueAtTime()` for smooth frequency transitions as
RPM changes. never set frequency instantaneously — the pitch glide
is part of the experience.

---

## 2. mechanical noise

white noise `AudioBufferSourceNode` through a bandpass `BiquadFilterNode`:

```javascript
const noiseFilter = audioCtx.createBiquadFilter();
noiseFilter.type = 'bandpass';
noiseFilter.Q.value = 2;
// center frequency tracks RPM — higher RPM = higher exhaust noise
noiseFilter.frequency.value = RPM / 60 * 3;  // 3rd harmonic region

const noiseGain = audioCtx.createGain();
noiseGain.gain.value = 0.12;  // subtle — adds texture, not volume
```

this gives the raspy, gritty exhaust character. at low RPM it's a
rough chug; at high RPM it's a smooth hiss behind the tone.

---

## 3. amplitude modulation (firing pulse)

the "putt-putt" character at low RPM comes from amplitude modulation
at the firing frequency:

```javascript
const amOsc = audioCtx.createOscillator();
amOsc.type = 'sine';
amOsc.frequency.value = RPM / 60;  // same as engine fundamental

const amGain = audioCtx.createGain();
amGain.gain.value = 0.3;  // modulation depth
// at low RPM: distinct pulses (putt-putt)
// at high RPM: smooths into steady buzz
```

connect `amOsc` → `amGain` → engine gain node's gain AudioParam.

---

## 4. output filtering

```javascript
// lowpass — tame digital harshness, simulate muffled engine
const lpf = audioCtx.createBiquadFilter();
lpf.type = 'lowpass';
lpf.frequency.value = 2500 + (RPM / 18000) * 1500;  // 2500–4000 Hz
lpf.Q.value = 0.7;

// highpass — remove sub-bass that small engines don't produce
const hpf = audioCtx.createBiquadFilter();
hpf.type = 'highpass';
hpf.frequency.value = 80;
hpf.Q.value = 0.5;
```

---

## event sounds

### primer pump (3 clicks)

short noise burst through a lowpass filter. each of the three
pumps is slightly different (vary the filter frequency ±20 Hz).

```javascript
function playPrimerPump(variation = 0) {
  const noise = createNoiseBuffer(0.06);  // 60ms
  const source = audioCtx.createBufferSource();
  source.buffer = noise;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 180 + variation * 20;  // 160–200 Hz

  const env = audioCtx.createGain();
  env.gain.setValueAtTime(0.4, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

  source.connect(filter).connect(env).connect(masterGain);
  source.start();
}
```

sound character: soft "thunk." like pressing a rubber bulb.

### crank pull

mechanical ratchet — a rapid series of short filtered noise bursts:

```javascript
function playCrank() {
  // 3 rapid clicks over 200ms, rising in pitch
  for (let i = 0; i < 3; i++) {
    const t = audioCtx.currentTime + i * 0.06;
    const noise = createNoiseBuffer(0.025);  // 25ms each
    const source = audioCtx.createBufferSource();
    source.buffer = noise;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + i * 150;  // rising pitch: 400, 550, 700
    filter.Q.value = 3;

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    source.connect(filter).connect(env).connect(masterGain);
    source.start(t);
  }
}
```

sound character: mechanical "click-click-catch." the third click
has a slightly longer tail (the engine catches).

---

## state transitions

### cold → warmup (engine start)

```
0ms     crank sound plays (3 ratchet clicks)
200ms   engine oscillator starts at RPM=0, gain=0
250ms   RPM ramps exponentially from 0 to 12,000 over 400ms
        gain ramps from 0 to 0.7 over 300ms
650ms   engine is at idle. warmup begins.
        RPM climbs linearly from 12,000 to 18,000 over warmup duration
```

### run → flameout (fuel exhaustion)

```
0ms     fuel hits 0
0ms     RPM begins exponential decay: 18,000 → 50 over 1.5 seconds
0ms     gain begins exponential decay: 0.7 → 0 over 1.2 seconds
200ms   noise ratio increases (engine sounds rough)
1200ms  gain reaches 0. silence.
```

the decay is NOT a gentle fade. the RPM drops first (pitch falls),
then the volume drops. the engine dies, it doesn't turn off.

### run → kill (user kills engine)

same as flameout but faster (800ms total). the user made a choice;
the engine obeys immediately.

### low fuel

during low fuel, before flameout:
- RPM drops ~10%: 18,000 → 16,200
- noise ratio increases by 50%
- amplitude modulation depth increases to 0.5 (more "chug")
- the engine sounds like it's struggling

---

## implementation notes

- **AudioContext must be created on user gesture** (browser autoplay
  policy). create it on the first "pour fuel" click.
- **all frequency changes use ramps**, never instantaneous `setValueAtTime`.
  this prevents clicks/pops and gives the organic engine feel.
- **white noise buffer**: create a 2-second `AudioBuffer` filled with
  `Math.random() * 2 - 1`. reuse it for all noise sources.
- **master gain** defaults to 0.3 (30% volume). mute button sets to 0.
- **performance**: total node count is ~8 nodes. negligible CPU impact.

---

## reference

- [engine-sound-generator](https://github.com/Antonio-R1/engine-sound-generator) —
  Web Audio API engine synthesizer with AudioWorklet
- Cox .049 audio: search "Cox .049 engine run" on YouTube for reference
- PeriodicWave API: MDN Web Docs

`Q.E.D.`
