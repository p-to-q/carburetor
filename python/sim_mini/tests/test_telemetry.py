import hashlib
import json
import shutil
import struct
import subprocess
from pathlib import Path

import pytest
from sim_mini.sim_types import DeviceState
from sim_mini.telemetry import (
    TelemetryFrame,
    create_telemetry_frame,
    decode_telemetry_frame,
    encode_telemetry_frame,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
TS_DIST = REPO_ROOT / "packages" / "sim" / "dist" / "index.js"
PHASES = [
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


def _payload() -> bytes:
    return bytes([1, *([0] * 30), 255])


def _frame() -> TelemetryFrame:
    return create_telemetry_frame(
        seq=42,
        t_us=123_456,
        layer=3,
        kind=0x20,
        flags=0b101,
        payload=_payload(),
    )


def _combustor_payload(frame: DeviceState) -> bytes:
    combustor = frame.combustor
    payload = bytearray(32)
    struct.pack_into("<I", payload, 0, combustor.rpm or 0)
    struct.pack_into("<e", payload, 4, combustor.hot_C)
    struct.pack_into("<e", payload, 8, combustor.exhaust_dB_1m)
    struct.pack_into("<e", payload, 10, combustor.shaft_W or 0.0)
    struct.pack_into("<e", payload, 12, combustor.thermal_W)
    struct.pack_into("<e", payload, 14, combustor.electric_W_raw)
    struct.pack_into("<I", payload, 16, combustor.runtime_s)
    struct.pack_into("<f", payload, 20, combustor.fuel_consumed_mL)
    payload[24] = PHASES.index(combustor.phase)
    return bytes(payload)


def _run_node(script: str, *args: str) -> str:
    if shutil.which("node") is None:
        pytest.skip("node is unavailable")
    if not TS_DIST.exists():
        pytest.skip("packages/sim/dist/index.js is missing; run pnpm build")

    return subprocess.check_output(
        ["node", "-e", script, str(TS_DIST), *args],
        cwd=REPO_ROOT,
        text=True,
    ).strip()


def test_telemetry_frame_round_trips() -> None:
    decoded = decode_telemetry_frame(encode_telemetry_frame(_frame()))

    assert decoded.seq == 42
    assert decoded.t_us == 123_456
    assert decoded.layer == 3
    assert decoded.kind == 0x20
    assert decoded.flags == 0b101
    assert decoded.payload == _payload()


def test_telemetry_frame_matches_protocol_layout() -> None:
    encoded = encode_telemetry_frame(_frame())

    assert len(encoded) == 64
    assert encoded[0] == 0xCB
    assert encoded[1] == 0x01
    assert encoded[2:4] == (42).to_bytes(2, "little")
    assert encoded[4:12] == (123_456).to_bytes(8, "little")
    assert encoded[12] == 3
    assert encoded[13] == 0x20
    assert encoded[14:16] == (0b101).to_bytes(2, "little")
    assert encoded[16:48] == _payload()
    assert encoded[56:64] == bytes(8)


def test_telemetry_frame_matches_typescript_encoding() -> None:
    script = """
const { pathToFileURL } = require('node:url');
import(pathToFileURL(process.argv[1]).href).then((mod) => {
  const { createTelemetryFrame, encodeTelemetryFrame } = mod;
  const payload = new Uint8Array(32);
  payload[0] = 1;
  payload[31] = 255;
  const frame = createTelemetryFrame({
    seq: 42,
    t_us: 123456,
    layer: 3,
    kind: 0x20,
    flags: 0b101,
    payload,
  });
  process.stdout.write(Buffer.from(encodeTelemetryFrame(frame)).toString('hex'));
});
"""

    assert encode_telemetry_frame(_frame()).hex() == _run_node(script)


def test_typescript_decodes_python_frame() -> None:
    encoded = encode_telemetry_frame(_frame())
    script = """
const { pathToFileURL } = require('node:url');
import(pathToFileURL(process.argv[1]).href).then((mod) => {
  const { decodeTelemetryFrame, encodeTelemetryFrame } = mod;
  const bytes = new Uint8Array(Buffer.from(process.argv[2], 'hex'));
  const decoded = decodeTelemetryFrame(bytes);
  process.stdout.write(JSON.stringify({
    seq: decoded.seq,
    t_us: decoded.t_us,
    layer: decoded.layer,
    kind: decoded.kind,
    flags: decoded.flags,
    payload_hex: Buffer.from(decoded.payload).toString('hex'),
    reencoded_hex: Buffer.from(encodeTelemetryFrame(decoded)).toString('hex'),
  }));
});
"""

    decoded = json.loads(_run_node(script, encoded.hex()))

    assert decoded == {
        "seq": 42,
        "t_us": 123_456,
        "layer": 3,
        "kind": 0x20,
        "flags": 0b101,
        "payload_hex": _payload().hex(),
        "reencoded_hex": encoded.hex(),
    }


def test_python_decodes_typescript_frame() -> None:
    script = """
const { pathToFileURL } = require('node:url');
import(pathToFileURL(process.argv[1]).href).then((mod) => {
  const { createTelemetryFrame, encodeTelemetryFrame } = mod;
  const payload = new Uint8Array(32);
  payload[0] = 1;
  payload[31] = 255;
  const frame = createTelemetryFrame({
    seq: 42,
    t_us: 123456,
    layer: 3,
    kind: 0x20,
    flags: 0b101,
    payload,
  });
  process.stdout.write(Buffer.from(encodeTelemetryFrame(frame)).toString('hex'));
});
"""

    decoded = decode_telemetry_frame(bytes.fromhex(_run_node(script)))

    assert decoded.seq == 42
    assert decoded.t_us == 123_456
    assert decoded.layer == 3
    assert decoded.kind == 0x20
    assert decoded.flags == 0b101
    assert decoded.payload == _payload()


def test_python_matches_pinned_cold_start_golden() -> None:
    from sim_mini.headless import cold_start_events, run_headless

    scenario = REPO_ROOT / "fixtures" / "golden" / "cold-start-warmup"
    manifest = json.loads((scenario / "manifest.json").read_text())
    frames = run_headless(cold_start_events(15.0), 60)
    encoded = b"".join(
        encode_telemetry_frame(
            create_telemetry_frame(
                seq=index,
                t_us=frame.t_us,
                layer=2,
                kind=0x10,
                flags=0b11 if frame.combustor.running else 0b1,
                payload=_combustor_payload(frame),
            )
        )
        for index, frame in enumerate(frames)
    )

    assert f"sha256:{hashlib.sha256(encoded).hexdigest()}" == manifest["outputs"]["run.cbf"]


def test_telemetry_rejects_wrong_frame_length() -> None:
    with pytest.raises(ValueError, match="frame must be 64 bytes"):
        decode_telemetry_frame(bytes(63))


def test_telemetry_rejects_wrong_payload_length() -> None:
    with pytest.raises(ValueError, match="payload must be 32 bytes"):
        create_telemetry_frame(seq=1, t_us=1, layer=1, kind=1, flags=0, payload=bytes(31))


def test_telemetry_rejects_bad_prefix_on_encode() -> None:
    frame = create_telemetry_frame(
        seq=1,
        t_us=1,
        layer=1,
        kind=1,
        flags=0,
        payload=bytes(32),
        sha256_prefix=bytes(8),
    )

    with pytest.raises(ValueError, match="sha256_prefix does not match bytes 0..47"):
        encode_telemetry_frame(frame)


def test_telemetry_rejects_bad_sync() -> None:
    encoded = bytearray(encode_telemetry_frame(_frame()))
    encoded[0] = 0

    with pytest.raises(ValueError, match="bad sync byte"):
        decode_telemetry_frame(bytes(encoded))


def test_telemetry_rejects_bad_version() -> None:
    encoded = bytearray(encode_telemetry_frame(_frame()))
    encoded[1] = 2

    with pytest.raises(ValueError, match="unsupported protocol version"):
        decode_telemetry_frame(bytes(encoded))


def test_telemetry_rejects_nonzero_reserved_bytes() -> None:
    encoded = bytearray(encode_telemetry_frame(_frame()))
    encoded[56] = 1

    with pytest.raises(ValueError, match="reserved bytes must be zero"):
        decode_telemetry_frame(bytes(encoded))


def test_telemetry_rejects_sha_mismatch() -> None:
    encoded = bytearray(encode_telemetry_frame(_frame()))
    encoded[20] = 1

    with pytest.raises(ValueError, match="sha256_prefix mismatch"):
        decode_telemetry_frame(bytes(encoded))
