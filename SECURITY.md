# security

## trust model

carburetor is a pre-1.0 project that spans software, firmware, telemetry,
hardware, and physical fuel handling. security here means both information
security and operator safety.

## software and simulator boundary

the current simulator surface is local and prerelease.

- no simulator path should execute untrusted code.
- generated artifacts belong under `artifacts/runs/<id>/`.
- manifests should record git sha, lockfile hash, seed, inputs, outputs, and
  host details.
- deterministic outputs should be checked against golden fixtures when those
  fixtures exist.
- errors should surface with context, not silently fall back.

## firmware boundary

firmware is not yet implemented. the intended boundary is:

- physical access for firmware updates.
- no firmware over the air.
- USB-serial data and flashing only.
- no voice radio, microphone, camera, or wireless charging path.

these constraints are tracked in `docs/hard-constraints.md`.

## hardware and bench safety

mk i and mk ii are fuel and heat systems, not ordinary consumer electronics.

- do not run combustion tests indoors without ventilation and CO monitoring.
- treat hot surfaces, fuel lines, exhaust, and rotating shafts as hazards.
- do not publish bench numbers without the measurement setup, manifest, and
  uncertainty.
- if a safety finding changes operating guidance, update `docs/safety.md`.

## reporting a vulnerability

please do not open a public issue for security concerns.

1. open a private security advisory through GitHub's "Report a vulnerability"
   flow on the repo, or contact the maintainer through the organization channel.
2. include reproduction steps, affected component, and impact assessment.
3. expect acknowledgement within 5 business days.

if upstream is unresponsive and the issue is urgent, public disclosure after 30
days is acceptable. err on the side of private disclosure first.

## supported versions

carburetor is pre-1.0. security fixes target:

- `main`.
- the most recent tagged release.

older tags are not patched.

## dependencies and secrets

- `.env` is gitignored.
- never commit API keys, modem credentials, SIM credentials, or vendor account
  secrets.
- manifests must not record secrets.
- dependency pinning will tighten as v0.2 gains runnable code.

`Q.E.D.`
