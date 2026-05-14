# safety

this is a device that burns fuel in your hand. the safety considerations are real, not decorative.

we are not building a safe device. we are building an *honest* device — one whose hazards are visible, named, and metered. a smartphone is safe in the sense that you cannot directly hurt yourself with it; it is also a device whose harms are slow, invisible, and unmetered. carburetor's hazards are real but small, immediate, and accountable.

## carbon monoxide

mk i produces CO. small engines run rich; the cox .049 at typical glow-fuel mixtures produces approximately 30 g/hr of CO₂ at full throttle plus trace HC, formaldehyde, and acrolein. CO is the immediate health concern: colorless, odorless, fatal at 800 ppm exposure for one hour.

**operating rules.**

1. **never operate mk i in a fully enclosed indoor space.** a garage with the door open is acceptable. a closed bedroom is not.
2. **the firmware refuses to ignite the engine if the onboard CO sensor reads non-zero.** this is enforced in firmware, not in user behavior. it is not a soft check.
3. **the device ships with a 30 s lockout** between flameout and re-ignite, to prevent unburnt fuel pooling in the case.

mk ii produces no CO under correct catalyst operation (full oxidation to CO₂ + H₂O at 400 °C+). a cold or fouled catalyst can produce CO; the firmware reports `cat_temp_low` and refuses live mode until the hot face exceeds 380 °C.

## thermal

mk i cylinder head: 200–300 °C during run. case outer: ≤ 50 °C at the user's hand, enforced by the aerogel blanket (`SH-04` in the BOM) and the firmware's thermal throttle (`t_case_max_C = 60`).

mk ii catalyst pad: 400–600 °C. catalyst is shielded by ceramic plus aerogel; the user-facing case sees ≤ 40 °C at the hand.

**operating rules.**

1. **never grip the device by the engine bay during run.** the canvas strap is for transport between sessions, not for holding during operation.
2. **fuel refill only when the case is at hand-temperature** (`< 35 °C`, ~3 min after engine cooldown). the firmware blocks the fuel-prime menu otherwise.
3. **the device must not be stored with fuel in the tank for more than 24 hours.** glow fuel attacks rubber gaskets; butane cartridges should be removed.

## fuel

**glow fuel** (mk i, methanol + nitromethane + castor oil):

- methanol is toxic (oral LD50 ~143 mg/kg). do not siphon by mouth. wash hands after handling.
- nitromethane is a controlled explosive precursor in some jurisdictions. check local law before purchasing or transporting.
- castor oil is benign but stains permanently. assume any cloth that contacts it is committed.
- shipping by air is hazmat-restricted in all jurisdictions we know of. ground transport only.
- typical retail packaging: 1 quart / ~1 L cans of pre-mixed hobby fuel from a hobby store.

**butane** (mk ii):

- consumer-grade refill cartridges only (standard cigarette-lighter refill grade, ≥ 99 % n-butane).
- the carburetor mk ii fitting is keyed to a standard refill nozzle.
- do not refill a cartridge from a bulk tank without a metered regulator.
- butane is flammable and forms heavier-than-air vapor pools at temperatures below ~-1 °C. observe the printed clearances on the device case.

## regulatory

**FCC / CE / equivalents.**

- the BG95-M3 modem (classica edition) ships pre-certified for cat-M1 / nb-IoT / 2G in supported regions. carburetor's enclosure does not modify the modem's RF characteristics.
- the ESP32-S3 (processta edition) uses BLE only; pre-certified for FCC, CE, and MIC.
- the engine is not a regulated component in any consumer jurisdiction we know of, but check local hobby-fuel and small-engine emissions law before commercial distribution.
- **the device is not certified for aviation use.** do not bring it on aircraft, in checked baggage or carry-on. glow fuel is air-hazmat; lithium cells are restricted; the engine itself, while small, is a combustion device.

## age & accessibility

- mk i and mk ii are not toys. do not allow operation by children under 14 without direct supervision.
- the device is not suitable for users with poor fine-motor control (the prime + crank sequence requires sustained grip and pull strength).
- mk i operation produces 85–95 dBA at 1 m. hearing protection is recommended for sustained sessions.

## first aid

- **glow fuel on skin:** wash with soap and water for 5 minutes.
- **glow fuel in eye:** flush with water for 15 minutes; seek medical attention.
- **minor burn from cylinder head:** cool running water for 10 minutes; ibuprofen. blistering = seek medical attention.
- **suspected CO exposure** (headache, confusion, nausea): fresh air immediately. if symptoms persist, call emergency services.
- **engine fire** (unlikely but possible if fuel leaks onto hot engine): use a Class B fire extinguisher (CO₂ or dry chemical). NEVER use water on a fuel fire. carry a small extinguisher with the field kit.

## the safety philosophy

every hazard listed above is metered and surfaced to the user:

- CO ppm is on the screen.
- case temperature is on the screen.
- fuel level is in the sight glass and on the screen.
- engine RPM is on the screen.
- runtime remaining is on the screen.

if the device is in a state you can be hurt by, it is telling you so. compare this with smartphones, whose hazards (sleep deprivation, attention fragmentation, surveillance) are not surfaced at all.

we trade slow invisible harm for fast visible hazard. we are willing to make that trade. you should know that we made it.

`Q.E.D.`
