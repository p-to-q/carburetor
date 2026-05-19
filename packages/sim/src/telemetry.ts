import { createHash } from 'node:crypto';
import type { TelemetryFrame } from './types.js';

const FRAME_BYTES = 64;
const PAYLOAD_BYTES = 32;
const HEADER_BYTES = 48;
const SHA_PREFIX_BYTES = 8;

function assertFrameBuffer(buf: Uint8Array): void {
  if (buf.length !== FRAME_BYTES) {
    throw new Error('frame must be 64 bytes');
  }
}

function readU16LE(buf: Uint8Array, offset: number): number {
  return buf[offset]! | (buf[offset + 1]! << 8);
}

function readU64LE(buf: Uint8Array, offset: number): number {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return Number(view.getBigUint64(offset, true));
}

function sha256Prefix(buf: Uint8Array): Uint8Array {
  return createHash('sha256').update(buf).digest().subarray(0, SHA_PREFIX_BYTES);
}

function payloadToBytes(payload: Uint8Array): Uint8Array {
  if (payload.length !== PAYLOAD_BYTES) {
    throw new Error('payload must be 32 bytes');
  }
  return payload;
}

export function encodeTelemetryFrame(frame: TelemetryFrame): Uint8Array {
  const bytes = new Uint8Array(FRAME_BYTES);
  const view = new DataView(bytes.buffer);

  bytes[0] = frame.sync;
  bytes[1] = frame.version;
  view.setUint16(2, frame.seq, true);
  view.setBigUint64(4, BigInt(frame.t_us), true);
  bytes[12] = frame.layer;
  bytes[13] = frame.kind;
  view.setUint16(14, frame.flags, true);
  bytes.set(payloadToBytes(frame.payload), 16);
  bytes.set(frame.sha256_prefix, 48);
  bytes.fill(0, 56);

  const expectedPrefix = sha256Prefix(bytes.subarray(0, HEADER_BYTES));
  if (
    frame.sha256_prefix.length !== SHA_PREFIX_BYTES ||
    !expectedPrefix.every((byte, index) => byte === frame.sha256_prefix[index])
  ) {
    throw new Error('sha256_prefix does not match bytes 0..47');
  }

  return bytes;
}

export function decodeTelemetryFrame(buf: Uint8Array): TelemetryFrame {
  assertFrameBuffer(buf);
  if (buf[0] !== 0xcb) throw new Error('bad sync byte');
  if (buf[1] !== 0x01) throw new Error('unsupported protocol version');
  if (!buf.subarray(56).every((byte) => byte === 0)) {
    throw new Error('reserved bytes must be zero');
  }

  const expectedPrefix = sha256Prefix(buf.subarray(0, HEADER_BYTES));
  const actualPrefix = buf.subarray(48, 56);
  if (!expectedPrefix.every((byte, index) => byte === actualPrefix[index])) {
    throw new Error('sha256_prefix mismatch');
  }

  return {
    sync: buf[0] as 0xcb,
    version: buf[1] as 1,
    seq: readU16LE(buf, 2),
    t_us: readU64LE(buf, 4),
    layer: buf[12] as 1 | 2 | 3 | 4 | 5,
    kind: buf[13]!,
    flags: readU16LE(buf, 14),
    payload: buf.slice(16, 48),
    sha256_prefix: buf.slice(48, 56),
  };
}

export function createTelemetryFrame(
  frame: Omit<TelemetryFrame, 'sync' | 'version' | 'sha256_prefix'> & {
    sha256_prefix?: Uint8Array;
  },
): TelemetryFrame {
  const provisional = new Uint8Array(FRAME_BYTES);
  provisional[0] = 0xcb;
  provisional[1] = 0x01;
  const view = new DataView(provisional.buffer);
  view.setUint16(2, frame.seq, true);
  view.setBigUint64(4, BigInt(frame.t_us), true);
  provisional[12] = frame.layer;
  provisional[13] = frame.kind;
  view.setUint16(14, frame.flags, true);
  provisional.set(payloadToBytes(frame.payload), 16);
  const prefix = frame.sha256_prefix ?? sha256Prefix(provisional.subarray(0, HEADER_BYTES));

  return {
    sync: 0xcb,
    version: 1,
    seq: frame.seq,
    t_us: frame.t_us,
    layer: frame.layer,
    kind: frame.kind,
    flags: frame.flags,
    payload: frame.payload,
    sha256_prefix: prefix,
  };
}
