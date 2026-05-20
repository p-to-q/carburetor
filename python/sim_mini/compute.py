"""compute-layer power model."""

from dataclasses import dataclass

from .sim_types import BusState, ComputeMode, ComputeState, UserEvent


@dataclass(frozen=True)
class ComputeDraw:
    current_A: float
    power_W: float


# Power profile: ESP32-S3 MCU + LoRa SX1262 radio + Sharp Memory LCD.
# (mcu_mA, modem_mA, lcd_uA)
MODE_CURRENTS: dict[ComputeMode, tuple[float, float, float]] = {
    "sleep": (0.008, 0.00016, 10.0),
    "idle": (25.0, 4.6, 50.0),
    "rx": (25.0, 4.6, 175.0),
    "tx": (25.0, 118.0, 175.0),
    "compose": (35.0, 4.6, 250.0),
    "engine_attn": (25.0, 0.00016, 250.0),
}

MODE_SIGNAL_DBM: dict[ComputeMode, float] = {
    "sleep": -105.0,
    "idle": -89.0,
    "rx": -78.0,
    "tx": -70.0,
    "compose": -82.0,
    "engine_attn": -92.0,
}


def rssi_bars_from_signal(signal_dbm: float) -> int:
    if signal_dbm >= -70:
        return 4
    if signal_dbm >= -80:
        return 3
    if signal_dbm >= -90:
        return 2
    if signal_dbm >= -100:
        return 1
    return 0


def create_compute_state(mode: ComputeMode = "sleep") -> ComputeState:
    mcu_mA, modem_mA, lcd_uA = MODE_CURRENTS[mode]
    return ComputeState(
        mode=mode,
        mcu_mA=mcu_mA,
        modem_mA=modem_mA,
        lcd_uA=lcd_uA,
        signal_dbm=MODE_SIGNAL_DBM[mode],
        rssi_bars=rssi_bars_from_signal(MODE_SIGNAL_DBM[mode]),
        queued_messages=0,
        uptime_s=0,
    )


def choose_compute_mode(
    prev: ComputeState,
    bus: BusState,
    event: UserEvent | None,
) -> ComputeMode:
    if bus.v_bus_V < 4.4 or bus.v_li_V < 3.2:
        return "sleep"
    if event is not None and event.kind == "compose_send":
        return "tx"
    if event is not None and event.kind == "keypress":
        return "compose"
    if prev.mode == "tx":
        return "rx"
    if prev.mode == "compose":
        return "compose"
    return "idle" if bus.mppt_locked else "engine_attn"


def step_compute(
    prev: ComputeState,
    bus: BusState,
    dt_s: float,
    event: UserEvent | None = None,
) -> ComputeState:
    mode = choose_compute_mode(prev, bus, event)
    mcu_mA, modem_mA, lcd_uA = MODE_CURRENTS[mode]
    queued_delta = 0
    if event is not None and event.kind == "keypress":
        queued_delta = 1
    elif event is not None and event.kind == "compose_send":
        queued_delta = -prev.queued_messages

    return ComputeState(
        mode=mode,
        mcu_mA=mcu_mA,
        modem_mA=modem_mA,
        lcd_uA=lcd_uA,
        signal_dbm=MODE_SIGNAL_DBM[mode],
        rssi_bars=rssi_bars_from_signal(MODE_SIGNAL_DBM[mode]),
        queued_messages=max(0, prev.queued_messages + queued_delta),
        uptime_s=prev.uptime_s + round(dt_s),
    )


def compute_draw(compute: ComputeState, bus: BusState) -> ComputeDraw:
    rail_V = max(3.0, bus.v_li_V)
    mcu_A = compute.mcu_mA / 1000
    modem_A = compute.modem_mA / 1000
    lcd_A = compute.lcd_uA / 1_000_000
    power_W = (mcu_A + modem_A) * rail_V + lcd_A * bus.v_bus_V
    return ComputeDraw(current_A=power_W / max(0.1, bus.v_bus_V), power_W=power_W)
