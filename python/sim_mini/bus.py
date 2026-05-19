"""bus-layer prerelease simulator."""

from .mathx import clamp, lerp
from .types import INVARIANTS, BusState, CombustorState


def create_bus_state() -> BusState:
    return BusState(
        v_bus_V=4.1,
        i_bus_A=0.0,
        v_li_V=3.7,
        i_li_A=0.0,
        soc_li_pct=45.0,
        soc_cap_pct=35.0,
        t_case_C=25.0,
        mppt_locked=False,
        e_in_J=0.0,
        e_out_J=0.0,
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
    net_J = e_in_delta_J - e_out_delta_J
    cap_J = 600.0
    li_J = 8_000.0
    cap_pct_delta = (net_J / cap_J) * 100
    li_pct_delta = ((net_J * 0.25) / li_J if net_J > 0 else (net_J * 0.7) / li_J) * 100
    soc_cap_pct = clamp(bus.soc_cap_pct + cap_pct_delta, 0.0, 100.0)
    soc_li_pct = clamp(bus.soc_li_pct + li_pct_delta, 0.0, 100.0)
    target_bus_V = clamp(4.0 + soc_cap_pct * 0.014, 4.0, invariants.v_bus_max_V)
    v_bus_V = lerp(bus.v_bus_V, target_bus_V, dt_s / 4)
    v_li_V = clamp(3.0 + soc_li_pct * 0.012, invariants.v_li_min_V, invariants.v_li_max_V)
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
            -min(0.45, net_J / max(dt_s, 0.001) / v_li_V) if net_J >= 0 else compute_load_W / v_li_V
        ),
        soc_li_pct=soc_li_pct,
        soc_cap_pct=soc_cap_pct,
        t_case_C=t_case_C,
        mppt_locked=rectified_W >= 0.5 and combustor.running,
        e_in_J=bus.e_in_J + e_in_delta_J,
        e_out_J=bus.e_out_J + e_out_delta_J,
    )
