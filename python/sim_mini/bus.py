"""bus-layer prerelease simulator."""

from .mathx import clamp, lerp
from .sim_types import INVARIANTS, BusState, CombustorState

REGULATOR_BUFFER_J = 50.0
LIFEPO4_BUFFER_J = 20_000.0


def lifepo4_voltage_from_soc(soc_pct: float) -> float:
    if soc_pct < 10.0:
        return lerp(2.8, 3.2, soc_pct / 10.0)
    if soc_pct > 90.0:
        return lerp(3.3, 3.5, (soc_pct - 90.0) / 10.0)
    return 3.25


def create_bus_state() -> BusState:
    return BusState(
        v_bus_V=4.1,
        i_bus_A=0.0,
        v_li_V=lifepo4_voltage_from_soc(45.0),
        i_li_A=0.0,
        soc_li_pct=45.0,
        soc_cap_pct=35.0,
        t_case_C=25.0,
        mppt_locked=False,
        e_in_J=0.0,
        e_out_J=0.0,
        thermal_losses_J=0.0,
    )


def step_bus(
    bus: BusState,
    combustor: CombustorState,
    compute_load_W: float,
    dt_s: float,
    invariants: type[INVARIANTS] = INVARIANTS,
) -> BusState:
    rectified_W = combustor.electric_W_raw * 0.88
    e_in_delta_J = rectified_W * dt_s
    e_out_delta_J = compute_load_W * dt_s
    thermal_loss_delta_J = max(0.0, combustor.thermal_W) * dt_s
    net_J = e_in_delta_J - e_out_delta_J
    cap_stored_J = (bus.soc_cap_pct / 100.0) * REGULATOR_BUFFER_J
    li_stored_J = (bus.soc_li_pct / 100.0) * LIFEPO4_BUFFER_J

    if net_J >= 0.0:
        cap_delta_J = min(net_J, REGULATOR_BUFFER_J - cap_stored_J)
        li_delta_J = min(net_J - cap_delta_J, LIFEPO4_BUFFER_J - li_stored_J)
    else:
        demand_J = -net_J
        cap_delta_J = -min(demand_J, cap_stored_J)
        li_delta_J = -min(demand_J + cap_delta_J, li_stored_J)

    soc_cap_pct = clamp(((cap_stored_J + cap_delta_J) / REGULATOR_BUFFER_J) * 100, 0.0, 100.0)
    soc_li_pct = clamp(((li_stored_J + li_delta_J) / LIFEPO4_BUFFER_J) * 100, 0.0, 100.0)
    target_bus_V = clamp(4.0 + soc_cap_pct * 0.014, 4.0, invariants.v_bus_max_V)
    v_bus_V = lerp(bus.v_bus_V, target_bus_V, dt_s / 4)
    v_li_V = clamp(
        lifepo4_voltage_from_soc(soc_li_pct), invariants.v_li_min_V, invariants.v_li_max_V
    )
    t_case_C = clamp(
        lerp(bus.t_case_C, 25.0 + max(0.0, combustor.hot_C - 25.0) * 0.11, dt_s / 120),
        20.0,
        invariants.t_case_max_C,
    )

    return BusState(
        v_bus_V=v_bus_V,
        i_bus_A=compute_load_W / max(0.1, v_bus_V),
        v_li_V=v_li_V,
        i_li_A=(
            -min(0.45, li_delta_J / max(dt_s, 0.001) / v_li_V)
            if li_delta_J >= 0.0
            else -li_delta_J / max(dt_s, 0.001) / v_li_V
        ),
        soc_li_pct=soc_li_pct,
        soc_cap_pct=soc_cap_pct,
        t_case_C=t_case_C,
        mppt_locked=rectified_W >= 0.5 and combustor.running,
        e_in_J=bus.e_in_J + e_in_delta_J,
        e_out_J=bus.e_out_J + e_out_delta_J,
        thermal_losses_J=bus.thermal_losses_J + thermal_loss_delta_J,
    )
