"""carburetor — the architecture, as types.

see ../../docs/architecture.md. every field name carries its unit.
this module is the python prototype counterpart of
packages/sim/src/types.ts.
"""

from dataclasses import dataclass
from typing import Literal

# ============ layer 1: fuel ============

FuelKind = Literal["glow", "butane", "gasoline"]


@dataclass
class FuelState:
    kind: FuelKind
    volume_mL: float
    temperature_C: float
    vapor_pressure_kPa: float
    contaminant_water_pct: float | None = None  # glow fuel only


# ============ layer 2: combustor ============

CombustorKind = Literal["cox-049", "catalytic-teg", "stirling"]
CombustorPhase = Literal[
    "off",
    "prime",
    "ignite",
    "warmup",
    "run",
    "cooldown",
    "flameout",
    "fuel_low",
    "thermal_high",
]


@dataclass
class CombustorState:
    kind: CombustorKind
    running: bool
    rpm: int | None  # mk i only
    hot_C: float
    cold_C: float | None  # mk ii only
    exhaust_dB_1m: float
    shaft_W: float | None  # mk i only
    thermal_W: float
    electric_W_raw: float  # pre-rectifier
    runtime_s: int
    fuel_consumed_mL: float
    phase: CombustorPhase


# ============ layer 3: bus ============


@dataclass
class BusState:
    v_bus_V: float
    i_bus_A: float
    v_li_V: float
    i_li_A: float
    soc_li_pct: float  # 0–100
    soc_cap_pct: float  # 0–100
    t_case_C: float
    mppt_locked: bool
    e_in_J: float  # cumulative
    e_out_J: float  # cumulative


# ============ layer 4: compute ============

ComputeMode = Literal["sleep", "idle", "rx", "tx", "compose", "engine_attn"]


@dataclass
class ComputeState:
    mode: ComputeMode
    mcu_mA: float
    modem_mA: float
    lcd_uA: float
    signal_dbm: float
    rssi_bars: int  # 0..4
    queued_messages: int
    uptime_s: int


# ============ layer 5: ritual ============

RitualStage = Literal[
    "cold",
    "priming",
    "cranking",
    "warmup",
    "live",
    "cooldown",
    "refuel_needed",
]
Scent = Literal["none", "castor", "butane"]


@dataclass
class RitualState:
    stage: RitualStage
    dB_at_ear: float
    case_C: float
    scent: Scent
    minutes_runtime_remaining: float
    minutes_until_refuel: float
    next_user_action: str | None


# ============ device snapshot ============


@dataclass
class DeviceState:
    t_us: int
    fuel: FuelState
    combustor: CombustorState
    bus: BusState
    compute: ComputeState
    ritual: RitualState


# ============ user events ============


@dataclass
class RefuelEvent:
    volume_mL: float
    t_us: int
    kind: Literal["refuel"] = "refuel"


@dataclass
class PrimeEvent:
    pumps: int
    t_us: int
    kind: Literal["prime"] = "prime"


@dataclass
class CrankEvent:
    t_us: int
    kind: Literal["crank"] = "crank"


@dataclass
class KillEvent:
    t_us: int
    kind: Literal["kill"] = "kill"


@dataclass
class KeypressEvent:
    key: str
    t_us: int
    kind: Literal["keypress"] = "keypress"


@dataclass
class ComposeSendEvent:
    t_us: int
    kind: Literal["compose_send"] = "compose_send"


UserEvent = RefuelEvent | PrimeEvent | CrankEvent | KillEvent | KeypressEvent | ComposeSendEvent


# ============ invariants ============


class INVARIANTS:
    """asserted by `pytest python/sim_mini/`. mirror of the TypeScript invariants.

    see docs/hard-constraints.md for the soft/hard distinction.
    """

    energy_conservation_pct_tolerance: float = 2.0
    state_machine_totality_required: bool = True

    v_bus_max_V: float = 5.5
    v_li_max_V: float = 4.2
    v_li_min_V: float = 3.0
    t_case_max_C: float = 60.0

    warmup_v_bus_threshold_V: float = 4.8
    warmup_v_bus_hold_s: float = 5.0
    warmup_teg_hot_threshold_C: float = 180.0
