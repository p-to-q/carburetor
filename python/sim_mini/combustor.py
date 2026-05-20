"""Cox 049 prerelease combustor state machine."""

from .mathx import clamp, lerp
from .sim_types import INVARIANTS, CombustorPhase, CombustorState, FuelState, UserEvent

COX_049_WASTE_HEAT_TO_SHAFT_RATIO = 7.0
SHAFT_TO_RAW_ELECTRIC_EFFICIENCY = 0.65
RAW_ELECTRIC_OUTPUT_CAP_W = 7.2
# Glow fuel: ~75% methanol + ~25% nitromethane, ~15-20% oil displacement.
# Net volumetric energy density: ~12.5 MJ/L.
# Previous value (18,720) was ~45% too high.
GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S = 12_500.0
COX_049_SHAFT_THERMAL_EFFICIENCY = 0.125
COX_049_RUN_FUEL_BURN_ML_PER_S = 45.0 / (
    GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S * COX_049_SHAFT_THERMAL_EFFICIENCY
)

TRANSITIONS: dict[CombustorPhase, list[CombustorPhase]] = {
    "off": ["prime"],
    "prime": ["ignite", "off"],
    "ignite": ["warmup", "flameout"],
    "warmup": ["run", "fuel_low", "thermal_high", "flameout", "cooldown"],
    "run": ["fuel_low", "thermal_high", "flameout", "cooldown"],
    "cooldown": ["off"],
    "flameout": ["prime", "cooldown"],
    "fuel_low": ["prime", "cooldown"],
    "thermal_high": ["cooldown"],
}


def create_combustor_state() -> CombustorState:
    return CombustorState(
        kind="cox-049",
        running=False,
        rpm=None,
        hot_C=25.0,
        cold_C=None,
        exhaust_dB_1m=0.0,
        shaft_W=None,
        thermal_W=0.0,
        electric_W_raw=0.0,
        runtime_s=0,
        fuel_consumed_mL=0.0,
        phase="off",
    )


def fuel_burn_mL_per_s(phase: CombustorPhase) -> float:
    if phase in {"ignite", "warmup"}:
        return COX_049_RUN_FUEL_BURN_ML_PER_S * (20.0 / 45.0)
    if phase == "run":
        return COX_049_RUN_FUEL_BURN_ML_PER_S
    return 0.0


def shaft_power_from_fuel_burn_W(burn_mL_per_s: float) -> float:
    return burn_mL_per_s * GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S * COX_049_SHAFT_THERMAL_EFFICIENCY


def step_combustor(
    combustor: CombustorState,
    fuel: FuelState,
    dt_s: float,
    bus_v_bus_V: float,
    warmup_hold_s: float,
    event: UserEvent | None = None,
    invariants: type[INVARIANTS] = INVARIANTS,
) -> CombustorState:
    phase = combustor.phase

    if event is not None and event.kind == "kill":
        phase = "cooldown" if combustor.running else "off"
    elif fuel.volume_mL <= 0 and combustor.running:
        phase = "fuel_low"
    elif phase == "ignite" and dt_s >= 3 and combustor.rpm is None:
        phase = "flameout"
    elif combustor.hot_C >= 300:
        phase = "thermal_high"
    elif (
        phase == "off"
        and event is not None
        and event.kind == "prime"
        and event.pumps > 0
        and fuel.volume_mL > 0
    ):
        phase = "prime"
    elif phase == "prime" and event is not None and event.kind == "crank" and fuel.volume_mL > 0:
        phase = "ignite"
    elif (
        phase in {"flameout", "fuel_low"}
        and event is not None
        and event.kind == "prime"
        and event.pumps > 0
        and fuel.volume_mL > 0
    ):
        phase = "prime"
    elif phase == "ignite" and dt_s > 0:
        phase = "warmup"
    elif (
        phase == "warmup"
        and bus_v_bus_V >= invariants.warmup_v_bus_threshold_V
        and warmup_hold_s >= invariants.warmup_v_bus_hold_s
    ):
        phase = "run"
    elif phase == "cooldown" and combustor.hot_C <= 45:
        phase = "off"

    running = phase in {"ignite", "warmup", "run"}
    target_hot_C = 245.0 if phase == "run" else 210.0 if running else 25.0
    hot_C = lerp(combustor.hot_C, target_hot_C, dt_s / 12 if running else dt_s / 90)
    rpm = (
        round(lerp(float(combustor.rpm or 0), 18_000.0 if phase == "run" else 12_000.0, dt_s / 5))
        if running
        else None
    )
    target_shaft_W = shaft_power_from_fuel_burn_W(fuel_burn_mL_per_s(phase))
    shaft_W = lerp(float(combustor.shaft_W or 0), target_shaft_W, dt_s / 8) if running else None
    thermal_W = max(0.0, (shaft_W or 0.0) * COX_049_WASTE_HEAT_TO_SHAFT_RATIO) if running else 0.0
    electric_W_raw = (
        clamp(
            (shaft_W or 0.0) * SHAFT_TO_RAW_ELECTRIC_EFFICIENCY,
            0.0,
            RAW_ELECTRIC_OUTPUT_CAP_W,
        )
        if running
        else 0.0
    )
    burn_mL = fuel_burn_mL_per_s(phase) * dt_s

    return CombustorState(
        kind=combustor.kind,
        running=running,
        rpm=rpm,
        hot_C=hot_C,
        cold_C=combustor.cold_C,
        exhaust_dB_1m=86.0 if running else 20.0 if phase == "cooldown" else 0.0,
        shaft_W=shaft_W,
        thermal_W=thermal_W,
        electric_W_raw=electric_W_raw,
        runtime_s=combustor.runtime_s + (round(dt_s) if running else 0),
        fuel_consumed_mL=combustor.fuel_consumed_mL + burn_mL,
        phase=phase,
    )
