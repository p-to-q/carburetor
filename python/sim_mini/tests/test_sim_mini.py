from sim_mini.bus import create_bus_state, step_bus
from sim_mini.combustor import TRANSITIONS, create_combustor_state
from sim_mini.compute import compute_draw, create_compute_state, rssi_bars_from_signal
from sim_mini.headless import (
    cold_start_events,
    create_initial_device_state,
    run_headless,
    step_device,
)
from sim_mini.mathx import round_ties_to_even
from sim_mini.sim_types import (
    INVARIANTS,
    ComposeSendEvent,
    CrankEvent,
    DeviceState,
    KeypressEvent,
    KillEvent,
    PrimeEvent,
    RefuelEvent,
)


def test_combustor_state_machine_has_exit_per_phase() -> None:
    assert INVARIANTS.state_machine_totality_required is True
    for phase, exits in TRANSITIONS.items():
        assert exits, f"{phase} has no exit"


def test_cold_start_reaches_warmup_without_skipping_live() -> None:
    frames = run_headless(cold_start_events(5.0), 8)
    phases = [frame.combustor.phase for frame in frames]

    assert "prime" in phases
    assert "ignite" in phases
    assert "warmup" in phases
    assert "run" not in phases


def test_long_cold_start_eventually_gates_live_on_bus_voltage() -> None:
    frames = run_headless(cold_start_events(5.0), 80)
    first_run = next(frame for frame in frames if frame.combustor.phase == "run")

    assert first_run.bus.v_bus_V >= INVARIANTS.warmup_v_bus_threshold_V
    assert first_run.ritual.stage == "live"


def stored_bus_energy_J(frame: DeviceState) -> float:
    return frame.bus.soc_cap_pct * 6.0 + frame.bus.soc_li_pct * 80.0


def test_bus_energy_accounting_includes_buffer_delta_and_thermal_losses() -> None:
    frames = run_headless(cold_start_events(5.0), 80)
    initial = frames[0]
    final = frames[-1]

    lhs = stored_bus_energy_J(initial) + final.bus.e_in_J
    rhs = stored_bus_energy_J(final) + final.bus.e_out_J
    tolerance_J = (INVARIANTS.energy_conservation_pct_tolerance / 100) * max(1.0, lhs)

    assert abs(lhs - rhs) <= tolerance_J
    assert final.bus.thermal_losses_J > final.bus.e_in_J
    assert final.bus.v_bus_V <= INVARIANTS.v_bus_max_V
    assert final.bus.v_li_V <= INVARIANTS.v_li_max_V
    assert final.bus.v_li_V >= INVARIANTS.v_li_min_V


def test_compute_modes_have_increasing_draw_for_active_states() -> None:
    bus = create_bus_state()
    sleep = compute_draw(create_compute_state("sleep"), bus).power_W
    idle = compute_draw(create_compute_state("idle"), bus).power_W
    tx = compute_draw(create_compute_state("tx"), bus).power_W

    assert sleep < idle < tx


def test_compute_signal_strength_derives_rssi_bars_from_mode() -> None:
    idle = create_compute_state("idle")
    tx = create_compute_state("tx")
    sleep = create_compute_state("sleep")

    assert idle.signal_dbm == -89
    assert idle.rssi_bars == rssi_bars_from_signal(idle.signal_dbm)
    assert tx.signal_dbm > idle.signal_dbm
    assert sleep.rssi_bars == 0


def test_fuel_temperature_responds_slowly_to_case_heat() -> None:
    final = run_headless(cold_start_events(5.0), 80)[-1]

    assert final.fuel.temperature_C > 25
    assert final.fuel.temperature_C < final.bus.t_case_C


def test_ritual_runtime_is_zero_when_engine_is_off() -> None:
    state = create_initial_device_state()
    refueled = step_device(state, 0, event=RefuelEvent(volume_mL=5.0, t_us=0))

    assert refueled.combustor.running is False
    assert refueled.ritual.minutes_runtime_remaining == 0
    assert refueled.ritual.minutes_until_refuel == 0


def test_run_shaft_power_is_derived_from_coupled_fuel_burn_model() -> None:
    run_frame = next(
        frame
        for frame in run_headless(cold_start_events(5.0), 80)
        if frame.combustor.phase == "run"
    )

    assert run_frame.combustor.shaft_W is not None
    assert run_frame.combustor.shaft_W > 20
    assert run_frame.combustor.thermal_W > run_frame.combustor.shaft_W * 6.9
    assert run_frame.combustor.electric_W_raw <= 7.2


def test_fuel_exhaustion_during_run_enters_fuel_low_and_decays_bus() -> None:
    frames = run_headless(cold_start_events(5.0), 80)
    running_frame = next(frame for frame in frames if frame.combustor.phase == "run")
    running_frame.fuel.volume_mL = 0.05

    assert running_frame.fuel.volume_mL > 0
    assert running_frame.bus.mppt_locked is True
    exhausted = step_device(running_frame, running_frame.t_us + 5_000_000)
    buffer_only = step_device(exhausted, exhausted.t_us + 5_000_000)

    assert exhausted.combustor.phase == "fuel_low"
    assert exhausted.combustor.running is False
    assert exhausted.bus.mppt_locked is False
    assert exhausted.fuel.volume_mL == 0
    assert buffer_only.bus.v_bus_V < exhausted.bus.v_bus_V
    assert buffer_only.bus.soc_li_pct < exhausted.bus.soc_li_pct


def test_kill_during_warmup_enters_cooldown_and_never_run() -> None:
    warmup_frames = run_headless(cold_start_events(5.0), 8)
    warmup = warmup_frames[-1]
    assert warmup.combustor.phase == "warmup"
    assert not any(frame.combustor.phase == "run" for frame in warmup_frames)

    killed = step_device(
        warmup,
        warmup.t_us + 1_000_000,
        event=KillEvent(t_us=warmup.t_us + 1_000_000),
    )
    after_kill = [killed]
    after_kill.append(step_device(after_kill[-1], after_kill[-1].t_us + 10_000_000))
    after_kill.append(step_device(after_kill[-1], after_kill[-1].t_us + 10_000_000))

    assert killed.combustor.phase == "cooldown"
    assert killed.combustor.running is False
    assert not any(frame.combustor.phase == "run" for frame in after_kill)


def test_refuel_during_cooldown_increases_fuel_but_does_not_restart_combustor() -> None:
    warmup = run_headless(cold_start_events(1.0), 8)[-1]
    cooldown = step_device(
        warmup,
        warmup.t_us + 1_000_000,
        event=KillEvent(t_us=warmup.t_us + 1_000_000),
    )
    refueled = step_device(
        cooldown,
        cooldown.t_us + 1_000_000,
        event=RefuelEvent(volume_mL=5.0, t_us=cooldown.t_us + 1_000_000),
    )

    assert refueled.fuel.volume_mL > cooldown.fuel.volume_mL
    assert refueled.combustor.phase == "cooldown"
    assert refueled.combustor.running is False
    assert refueled.bus.mppt_locked is False


def test_flameout_triggers_from_failed_ignition_and_falls_back_to_buffer() -> None:
    state = create_initial_device_state()
    state.fuel.volume_mL = 5.0
    state.combustor.phase = "ignite"
    state.combustor.hot_C = 120.0
    state.combustor.fuel_consumed_mL = 0.5

    flameout = step_device(state, 3_000_000)
    no_prime = step_device(flameout, 4_000_000, event=CrankEvent(t_us=4_000_000))
    primed = step_device(
        flameout,
        4_000_000,
        event=PrimeEvent(pumps=3, t_us=4_000_000),
    )
    cranked = step_device(primed, 5_000_000, event=CrankEvent(t_us=5_000_000))

    assert flameout.combustor.phase == "flameout"
    assert flameout.combustor.running is False
    assert flameout.bus.mppt_locked is False
    assert flameout.bus.soc_li_pct < state.bus.soc_li_pct
    assert no_prime.combustor.phase == "flameout"
    assert primed.combustor.phase == "prime"
    assert cranked.combustor.phase == "ignite"


def test_flameout_detection_accumulates_across_subsecond_steps() -> None:
    state = create_initial_device_state()
    state.fuel.volume_mL = 5.0
    state.combustor.phase = "ignite"
    state.combustor.hot_C = 120.0
    state.combustor.fuel_consumed_mL = 0.5
    state.combustor.phase_elapsed_s = 2.9

    flameout = step_device(state, 100_000)
    assert flameout.combustor.phase == "flameout"
    assert flameout.combustor.phase_elapsed_s == 0


def test_bus_recovers_from_warmup_draw_once_raw_electric_output_is_available() -> None:
    frames = run_headless(cold_start_events(5.0), 30)
    warmup = next(frame for frame in frames if frame.combustor.phase == "warmup")
    charged = frames[-1]

    assert charged.bus.e_in_J > warmup.bus.e_in_J
    assert charged.bus.soc_cap_pct > warmup.bus.soc_cap_pct
    assert charged.bus.mppt_locked is True


def test_li_ion_current_reflects_net_bus_power() -> None:
    bus = create_bus_state()
    combustor = create_combustor_state()
    combustor.running = True
    combustor.electric_W_raw = 1.0 / 0.88

    nearly_balanced = step_bus(
        bus=bus,
        combustor=combustor,
        compute_load_W=1.5,
        dt_s=1.0,
    )
    combustor.electric_W_raw = 8.0 / 0.88
    charging = step_bus(
        bus=bus,
        combustor=combustor,
        compute_load_W=0.5,
        dt_s=1.0,
    )

    assert nearly_balanced.i_li_A > 0
    assert nearly_balanced.i_li_A < 0.2
    assert charging.i_li_A == -0.45


def test_compute_transitions_through_compose_tx_and_rx_on_user_messaging_events() -> None:
    live = next(
        frame for frame in run_headless(cold_start_events(5.0), 80) if frame.ritual.stage == "live"
    )

    composing = step_device(
        live,
        live.t_us + 1_000_000,
        event=KeypressEvent(key="q", t_us=live.t_us + 1_000_000),
    )
    sending = step_device(
        composing,
        composing.t_us + 1_000_000,
        event=ComposeSendEvent(t_us=composing.t_us + 1_000_000),
    )
    receiving = step_device(sending, sending.t_us + 1_000_000)

    assert composing.compute.mode == "compose"
    assert composing.compute.queued_messages == 1
    assert sending.compute.mode == "tx"
    assert sending.compute.queued_messages == 0
    assert receiving.compute.mode == "rx"


def test_low_fuel_warning_appears_before_full_exhaustion() -> None:
    live = next(
        frame
        for frame in run_headless(cold_start_events(5.0), 80)
        if frame.combustor.phase == "run"
    )
    live.fuel.volume_mL = 0.002

    low = step_device(live, live.t_us + 1_000_000)

    assert low.combustor.phase == "fuel_low"
    assert low.ritual.stage == "refuel_needed"
    assert low.compute.mode == "engine_attn"


def test_restart_after_flameout_requires_refuel_prime_then_crank() -> None:
    live = next(
        frame
        for frame in run_headless(cold_start_events(5.0), 80)
        if frame.combustor.phase == "run"
    )
    live.fuel.volume_mL = 0.0
    fuel_low = step_device(live, live.t_us + 1_000_000)
    refueled = step_device(
        fuel_low,
        fuel_low.t_us + 1_000_000,
        event=RefuelEvent(volume_mL=5.0, t_us=fuel_low.t_us + 1_000_000),
    )
    crank_without_prime = step_device(
        refueled,
        refueled.t_us + 1_000_000,
        event=CrankEvent(t_us=refueled.t_us + 1_000_000),
    )
    primed = step_device(
        refueled,
        refueled.t_us + 1_000_000,
        event=PrimeEvent(pumps=3, t_us=refueled.t_us + 1_000_000),
    )
    cranked = step_device(
        primed,
        primed.t_us + 1_000_000,
        event=CrankEvent(t_us=primed.t_us + 1_000_000),
    )

    assert fuel_low.combustor.phase == "fuel_low"
    assert refueled.combustor.phase == "fuel_low"
    assert crank_without_prime.combustor.phase == "fuel_low"
    assert primed.combustor.phase == "prime"
    assert cranked.combustor.phase == "ignite"


def test_integer_counters_use_ties_to_even_rounding() -> None:
    assert round_ties_to_even(0.5) == 0
    assert round_ties_to_even(1.5) == 2
    assert round_ties_to_even(2.5) == 2

    live = next(
        frame
        for frame in run_headless(cold_start_events(5.0), 80)
        if frame.combustor.phase == "run"
    )
    half_second = step_device(live, live.t_us + 500_000)

    assert half_second.compute.uptime_s == live.compute.uptime_s
    assert half_second.combustor.runtime_s == live.combustor.runtime_s


def test_subsecond_device_steps_can_complete_warmup_hold() -> None:
    state = create_initial_device_state()
    state = step_device(state, 0, RefuelEvent(volume_mL=15.0, t_us=0))
    state = step_device(state, 1_000_000, PrimeEvent(pumps=3, t_us=1_000_000))
    state = step_device(state, 2_000_000, CrankEvent(t_us=2_000_000))

    for t_us in range(2_100_000, 60_100_000, 100_000):
        state = step_device(state, t_us)
        if state.combustor.phase == "run":
            break

    assert state.combustor.phase == "run"
    assert state.ritual.stage == "live"
