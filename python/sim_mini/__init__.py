"""carburetor — python prototype.

see ../README.md and ../../docs/architecture.md.

this package is the python counterpart to packages/sim/. both surfaces
implement the same five-layer architecture, the same type contracts, and
emit byte-identical telemetry frames.
"""

__version__ = "0.1.0"

from .types import (
    FuelState,
    FuelKind,
    CombustorState,
    CombustorKind,
    CombustorPhase,
    BusState,
    ComputeState,
    ComputeMode,
    RitualState,
    RitualStage,
    Scent,
    DeviceState,
    UserEvent,
    RefuelEvent,
    PrimeEvent,
    CrankEvent,
    KillEvent,
    KeypressEvent,
    ComposeSendEvent,
    INVARIANTS,
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
