"""carburetor — python prototype.

see ../README.md and ../../docs/architecture.md.

this package is the python counterpart to packages/sim/. both surfaces
implement the same five-layer architecture, the same type contracts, and
emit byte-identical telemetry frames.
"""

__version__ = "0.1.0"

from .sim_types import (
    INVARIANTS,
    BusState,
    CombustorKind,
    CombustorPhase,
    CombustorState,
    ComposeSendEvent,
    ComputeMode,
    ComputeState,
    CrankEvent,
    DeviceState,
    FuelKind,
    FuelState,
    KeypressEvent,
    KillEvent,
    PrimeEvent,
    RefuelEvent,
    RitualStage,
    RitualState,
    Scent,
    UserEvent,
)

__all__ = [
    "FuelState",
    "FuelKind",
    "CombustorState",
    "CombustorKind",
    "CombustorPhase",
    "BusState",
    "ComputeState",
    "ComputeMode",
    "RitualState",
    "RitualStage",
    "Scent",
    "DeviceState",
    "UserEvent",
    "RefuelEvent",
    "PrimeEvent",
    "CrankEvent",
    "KillEvent",
    "KeypressEvent",
    "ComposeSendEvent",
    "INVARIANTS",
]
