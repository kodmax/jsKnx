# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Dual package exports: CommonJS (`require`) and native ESM (`import`) via `package.json` `exports`
- `examples/` directory with demo script and home schema (moved out of `src/`)
- GitHub Actions CI (build, format, lint, typecheck, test on Node 26)
- Public export of `enums`, `IDPT`, and `KnxLinkException` codes including `PROTOCOL_ERROR`
- CLI tools `knx-read` and `knx-write` with `KNX_GATEWAY` support
- Automatic reconnect after unexpected session loss
- Connection guards (`CONNECTION_ALREADY_ESTABLISHED`, `CONNECTION_IN_PROGRESS`)
- Test suite expanded to 220+ tests with coverage threshold (60% lines)
- README, CHANGELOG, and CONTRIBUTING documentation

### Changed

- `DataPointAbstract` constructor no longer requires `KnxConnection` (only `KnxLink`)
- `read()` rejects its promise on `DATA_LENGTH_MISMATCH` responses
- `KnxIpMessage.decode` / `KnxCemiFrame.decode` throw `KnxLinkException` instead of generic `Error`
- `FROST_PROTECTION` constant added; `FROST_PROTECION` kept as deprecated alias
- Dev toolchain upgraded (TypeScript 5.8, ESLint 9 flat config, Prettier 3, Jest 29)
- Minimum Node.js version: 20

### Fixed

- Z8 status bit order on write (MSB-first, aligned with decode)
- DateTime hour validation regex (`2[0-3]`) and NaN seconds handling
- CLI required `dist/` build and correct DPT name resolution

## [2.18.0] — previous release

Baseline published on npm before the maintenance roadmap above.

[Unreleased]: https://github.com/kodmax/jsKnx/compare/v2.18.0...HEAD
[2.18.0]: https://github.com/kodmax/jsKnx/releases/tag/v2.18.0
