import assert from 'node:assert/strict';
import test from 'node:test';
import { createTelemetryFrame, decodeTelemetryFrame, encodeTelemetryFrame } from '../dist/index.js';

test('telemetry frames round trip and verify sha prefix', () => {
  const payload = new Uint8Array(32);
  payload[0] = 1;
  payload[31] = 255;

  const frame = createTelemetryFrame({
    seq: 42,
    t_us: 123_456,
    layer: 3,
    kind: 0x20,
    flags: 0b101,
    payload,
  });

  const encoded = encodeTelemetryFrame(frame);
  const decoded = decodeTelemetryFrame(encoded);

  assert.equal(decoded.seq, 42);
  assert.equal(decoded.t_us, 123_456);
  assert.equal(decoded.layer, 3);
  assert.equal(decoded.kind, 0x20);
  assert.equal(decoded.flags, 0b101);
  assert.equal(decoded.payload[0], 1);
  assert.equal(decoded.payload[31], 255);
});

test('telemetry frames reject bad sync', () => {
  const frame = createTelemetryFrame({
    seq: 1,
    t_us: 1,
    layer: 1,
    kind: 1,
    flags: 0,
    payload: new Uint8Array(32),
  });
  const encoded = encodeTelemetryFrame(frame);
  encoded[0] = 0;

  assert.throws(() => decodeTelemetryFrame(encoded), /bad sync byte/);
});

test('telemetry frames reject bad version', () => {
  const frame = createTelemetryFrame({
    seq: 1,
    t_us: 1,
    layer: 1,
    kind: 1,
    flags: 0,
    payload: new Uint8Array(32),
  });
  const encoded = encodeTelemetryFrame(frame);
  encoded[1] = 2;

  assert.throws(() => decodeTelemetryFrame(encoded), /unsupported protocol version/);
});

test('telemetry frames reject nonzero reserved bytes', () => {
  const frame = createTelemetryFrame({
    seq: 1,
    t_us: 1,
    layer: 1,
    kind: 1,
    flags: 0,
    payload: new Uint8Array(32),
  });
  const encoded = encodeTelemetryFrame(frame);
  encoded[56] = 1;

  assert.throws(() => decodeTelemetryFrame(encoded), /reserved bytes must be zero/);
});

test('telemetry frames reject sha mismatch', () => {
  const frame = createTelemetryFrame({
    seq: 1,
    t_us: 1,
    layer: 1,
    kind: 1,
    flags: 0,
    payload: new Uint8Array(32),
  });
  const encoded = encodeTelemetryFrame(frame);
  encoded[20] = 1;

  assert.throws(() => decodeTelemetryFrame(encoded), /sha256_prefix mismatch/);
});
