"""deterministic headless runner for scripted scenarios."""

import argparse
import json
from dataclasses import asdict

from .bus import create_bus_state, step_bus
from .combustor import create_combustor_state, fuel_burn_mL_per_s, step_combustor
from .compute import compute_draw, create_compute_state, step_compute
from .fuel import create_fuel_state, step_fuel
from .mathx import round_ties_to_even, seconds_between
from .ritual import create_ritual_state, step_ritual
from .sim_types import INVARIANTS, CrankEvent, DeviceState, PrimeEvent, RefuelEvent, UserEvent


def create_initial_device_state() -> DeviceState:
    return DeviceState(
        t_us=0,
        fuel=create_fuel_state("glow", 0.0),
        combustor=create_combustor_state(),
        bus=create_bus_state(),
        compute=create_compute_state("sleep"),
        ritual=create_ritual_state(),
    )


def step_device(prev: DeviceState, next_t_us: int, event: UserEvent | None = None) -> DeviceState:
    dt_s = seconds_between(prev.t_us, next_t_us)
    warmup_hold_s = (
        prev.combustor.phase_elapsed_s
        if prev.combustor.phase == "warmup"
        and prev.bus.v_bus_V >= INVARIANTS.warmup_v_bus_threshold_V
        else 0.0
    )
    fuel_after_burn = step_fuel(
        fuel=prev.fuel,
        dt_s=dt_s,
        fuel_burn_mL_per_s=fuel_burn_mL_per_s(prev.combustor.phase),
        event=event,
        heat_source_C=prev.bus.t_case_C,
    )
    combustor = step_combustor(
        combustor=prev.combustor,
        fuel=fuel_after_burn,
        dt_s=dt_s,
        event=event,
        bus_v_bus_V=prev.bus.v_bus_V,
        warmup_hold_s=warmup_hold_s,
    )
    pre_compute = step_compute(prev.compute, prev.bus, dt_s, event)
    draw = compute_draw(pre_compute, prev.bus)
    bus = step_bus(
        bus=prev.bus,
        combustor=combustor,
        compute_load_W=draw.power_W,
        dt_s=dt_s,
    )
    compute = (
        pre_compute
        if event is not None or pre_compute.mode != prev.compute.mode
        else step_compute(pre_compute, bus, 0.0)
    )
    ritual = step_ritual(fuel_after_burn, combustor, bus.t_case_C)

    return DeviceState(
        t_us=next_t_us,
        fuel=fuel_after_burn,
        combustor=combustor,
        bus=bus,
        compute=compute,
        ritual=ritual,
    )


def run_headless(events: list[UserEvent], duration_s: int, step_s: int = 1) -> list[DeviceState]:
    state = create_initial_device_state()
    frames = [state]
    sorted_events = sorted(events, key=lambda event: event.t_us)
    event_index = 0

    for t_s in range(step_s, duration_s + 1, step_s):
        t_us = round_ties_to_even(t_s * 1_000_000)
        while event_index < len(sorted_events):
            event = sorted_events[event_index]
            if event.t_us > t_us:
                break
            state = step_device(state, event.t_us, event)
            event_index += 1
        state = step_device(state, t_us)
        frames.append(state)

    return frames


def cold_start_events(fill_mL: float = 5.0) -> list[UserEvent]:
    return [
        RefuelEvent(volume_mL=fill_mL, t_us=0),
        PrimeEvent(pumps=3, t_us=1_000_000),
        CrankEvent(t_us=2_000_000),
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="run deterministic sim_mini headless scenario")
    parser.add_argument("--fill", type=float, default=5.0, help="initial refuel volume in mL")
    parser.add_argument(
        "--steps",
        type=int,
        default=80,
        help="duration in whole simulation seconds",
    )
    parser.add_argument(
        "--step-s",
        type=int,
        default=1,
        help="frame interval in simulation seconds",
    )
    args = parser.parse_args()

    frames = run_headless(cold_start_events(args.fill), args.steps, args.step_s)
    print(
        json.dumps(
            {
                "scenario": "cold-start",
                "fill_mL": args.fill,
                "duration_s": args.steps,
                "step_s": args.step_s,
                "frames": [asdict(frame) for frame in frames],
            },
            separators=(",", ":"),
        )
    )


if __name__ == "__main__":
    main()
