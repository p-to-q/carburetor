"""fuel layer simulator."""

from .mathx import clamp, lerp
from .types import FuelKind, FuelState, UserEvent

VAPOR_PRESSURE_KPA: dict[FuelKind, float] = {
    "glow": 13.0,
    "butane": 243.0,
    "gasoline": 55.0,
}


def create_fuel_state(kind: FuelKind = "glow", volume_mL: float = 0.0) -> FuelState:
    return FuelState(
        kind=kind,
        volume_mL=volume_mL,
        temperature_C=25.0,
        vapor_pressure_kPa=VAPOR_PRESSURE_KPA[kind],
        contaminant_water_pct=0.0 if kind == "glow" else None,
    )


def step_fuel(
    fuel: FuelState,
    dt_s: float,
    fuel_burn_mL_per_s: float,
    event: UserEvent | None = None,
    heat_source_C: float = 25.0,
    tank_capacity_mL: float = 15.0,
) -> FuelState:
    refuel_mL = event.volume_mL if event is not None and event.kind == "refuel" else 0.0
    volume_mL = clamp(
        fuel.volume_mL + refuel_mL - fuel_burn_mL_per_s * dt_s,
        0.0,
        tank_capacity_mL,
    )
    temperature_C = lerp(fuel.temperature_C, clamp(heat_source_C, 20.0, 60.0), dt_s / 120)

    return FuelState(
        kind=fuel.kind,
        volume_mL=volume_mL,
        temperature_C=temperature_C,
        vapor_pressure_kPa=VAPOR_PRESSURE_KPA[fuel.kind],
        contaminant_water_pct=fuel.contaminant_water_pct,
    )
