"""ritual-layer stage driver."""

from .types import CombustorState, FuelState, RitualStage, RitualState


def create_ritual_state() -> RitualState:
    return RitualState(
        stage="cold",
        dB_at_ear=0.0,
        case_C=25.0,
        scent="none",
        minutes_runtime_remaining=0.0,
        minutes_until_refuel=0.0,
        next_user_action="pour 5 mL",
    )


def step_ritual(fuel: FuelState, combustor: CombustorState, case_C: float) -> RitualState:
    burn_mL_per_min = 2.5
    minutes_remaining = fuel.volume_mL / burn_mL_per_min if combustor.running else 0.0

    if fuel.volume_mL <= 0.1:
        return RitualState(
            stage="refuel_needed",
            dB_at_ear=0.0,
            case_C=case_C,
            scent="castor",
            minutes_runtime_remaining=0.0,
            minutes_until_refuel=0.0,
            next_user_action="pour 5 mL",
        )

    stage: RitualStage
    if combustor.phase == "off":
        stage = "cold"
    elif combustor.phase == "prime":
        stage = "priming"
    elif combustor.phase == "ignite":
        stage = "cranking"
    elif combustor.phase == "warmup":
        stage = "warmup"
    elif combustor.phase == "run":
        stage = "live"
    else:
        stage = "cooldown"

    if stage == "cold":
        next_user_action = "prime"
    elif stage == "priming":
        next_user_action = "pull crank"
    elif stage == "warmup":
        next_user_action = "wait"
    elif combustor.running and minutes_remaining < 1:
        next_user_action = "prepare fuel"
    else:
        next_user_action = None

    return RitualState(
        stage=stage,
        dB_at_ear=combustor.exhaust_dB_1m,
        case_C=case_C,
        scent="castor" if combustor.running or combustor.fuel_consumed_mL > 0 else "none",
        minutes_runtime_remaining=minutes_remaining,
        minutes_until_refuel=minutes_remaining,
        next_user_action=next_user_action,
    )
