"""64-byte telemetry frame codec.

Mirrors ``packages/sim/src/telemetry.ts`` byte-for-byte.
"""

from dataclasses import dataclass
from hashlib import sha256

FRAME_BYTES = 64
PAYLOAD_BYTES = 32
HEADER_BYTES = 48
SHA_PREFIX_BYTES = 8


@dataclass(frozen=True)
class TelemetryFrame:
    sync: int
    version: int
    seq: int
    t_us: int
    layer: int
    kind: int
    flags: int
    payload: bytes
    sha256_prefix: bytes


def _sha256_prefix(buf: bytes) -> bytes:
    return sha256(buf).digest()[:SHA_PREFIX_BYTES]


def _assert_frame_buffer(buf: bytes) -> None:
    if len(buf) != FRAME_BYTES:
        raise ValueError("frame must be 64 bytes")


def _payload_to_bytes(payload: bytes) -> bytes:
    if len(payload) != PAYLOAD_BYTES:
        raise ValueError("payload must be 32 bytes")
    return payload


def create_telemetry_frame(
    *,
    seq: int,
    t_us: int,
    layer: int,
    kind: int,
    flags: int,
    payload: bytes,
    sha256_prefix: bytes | None = None,
) -> TelemetryFrame:
    provisional = bytearray(FRAME_BYTES)
    provisional[0] = 0xCB
    provisional[1] = 0x01
    provisional[2:4] = seq.to_bytes(2, "little", signed=False)
    provisional[4:12] = t_us.to_bytes(8, "little", signed=False)
    provisional[12] = layer
    provisional[13] = kind
    provisional[14:16] = flags.to_bytes(2, "little", signed=False)
    provisional[16:48] = _payload_to_bytes(payload)
    prefix = (
        sha256_prefix
        if sha256_prefix is not None
        else _sha256_prefix(bytes(provisional[:HEADER_BYTES]))
    )

    return TelemetryFrame(
        sync=0xCB,
        version=1,
        seq=seq,
        t_us=t_us,
        layer=layer,
        kind=kind,
        flags=flags,
        payload=payload,
        sha256_prefix=prefix,
    )


def encode_telemetry_frame(frame: TelemetryFrame) -> bytes:
    payload = _payload_to_bytes(frame.payload)

    encoded = bytearray(FRAME_BYTES)
    encoded[0] = frame.sync
    encoded[1] = frame.version
    encoded[2:4] = frame.seq.to_bytes(2, "little", signed=False)
    encoded[4:12] = frame.t_us.to_bytes(8, "little", signed=False)
    encoded[12] = frame.layer
    encoded[13] = frame.kind
    encoded[14:16] = frame.flags.to_bytes(2, "little", signed=False)
    encoded[16:48] = payload
    if len(frame.sha256_prefix) != SHA_PREFIX_BYTES:
        raise ValueError("sha256_prefix does not match bytes 0..47")
    encoded[48:56] = frame.sha256_prefix
    encoded[56:64] = b"\x00" * 8

    if _sha256_prefix(bytes(encoded[:HEADER_BYTES])) != frame.sha256_prefix:
        raise ValueError("sha256_prefix does not match bytes 0..47")

    return bytes(encoded)


def decode_telemetry_frame(buf: bytes) -> TelemetryFrame:
    _assert_frame_buffer(buf)
    if buf[0] != 0xCB:
        raise ValueError("bad sync byte")
    if buf[1] != 0x01:
        raise ValueError("unsupported protocol version")
    if any(buf[56:64]):
        raise ValueError("reserved bytes must be zero")

    expected_prefix = _sha256_prefix(buf[:HEADER_BYTES])
    actual_prefix = buf[48:56]
    if expected_prefix != actual_prefix:
        raise ValueError("sha256_prefix mismatch")

    return TelemetryFrame(
        sync=buf[0],
        version=buf[1],
        seq=int.from_bytes(buf[2:4], "little", signed=False),
        t_us=int.from_bytes(buf[4:12], "little", signed=False),
        layer=buf[12],
        kind=buf[13],
        flags=int.from_bytes(buf[14:16], "little", signed=False),
        payload=buf[16:48],
        sha256_prefix=actual_prefix,
    )
