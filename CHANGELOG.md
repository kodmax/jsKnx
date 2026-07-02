# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- `KnxDisconnectedReason`: `explicit` → `graceful` (disconnect response received), disconnect timeout → `disconnect-timeout`; removed `gateway-response`

### Added

- Lifecycle events on `KnxLink`: `connecting`, `connected`, `reconnecting`, and `disconnected` (optional via `knx.on(...)`)
- `KnxDisconnectedReason` and related event payload types

## [2.20.0]

### Breaking

- **KnxLink event API rework.** `events` was removed from `KnxLinkOptions`; you can no longer inject a custom `EventEmitter` or subscribe via `knx.events`.
- **`KnxLink.connect()` now requires `onError` and `onCemiFrame`.** Both callbacks are registered on the link before the tunnel session starts.

**Migration from 2.19.x and earlier:**

```typescript
// Before
const events = new EventEmitter()
events.on('error', err => { ... })
events.on('cemi-frame', frame => { ... })

const knx = await KnxLink.connect('192.168.0.8', { events, readTimeout: 5000 })
knx.events.on('cemi-frame', frame => { ... })

// After
const knx = await KnxLink.connect('192.168.0.8', {
  readTimeout: 5000,
  onError: err => { ... },
  onCemiFrame: frame => { ... },
})

// Optional: add more listeners on the link itself
knx.on('cemi-frame', anotherListener)
```

- Replace every `KnxLink.connect(ip)` call with `KnxLink.connect(ip, { onError, onCemiFrame })`. CLI/scripts that only need errors can use a no-op for `onCemiFrame` (and vice versa), but both properties must be present.
- Replace `knx.events.on(...)` / `knx.events.emit(...)` with `knx.on(...)` / `knx.emit(...)`.
- `emit('error', …)` still follows Node.js semantics: register `onError` (or `knx.on('error', …)`) before errors can occur, or an unhandled exception will be thrown.

### Added

- Typed `KnxEventEmitter` with `on` / `off` / `once` / `emit` for `error` and `cemi-frame` only
- `KnxLink.on()` / `off()` / `once()` / `emit()` — same event API exposed directly on the link
- Export of `KnxEventEmitter`, `KnxLinkConnectOptions`, and `OnError`
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

## [2.19.0]

Release on npm before the KnxLink event API rework below.

## [2.18.0] — previous release

Baseline published on npm before the maintenance roadmap above.

[Unreleased]: https://github.com/kodmax/jsKnx/compare/v2.20.0...HEAD
[2.20.0]: https://github.com/kodmax/jsKnx/compare/v2.19.0...v2.20.0
[2.19.0]: https://github.com/kodmax/jsKnx/compare/v2.18.0...v2.19.0
[2.18.0]: https://github.com/kodmax/jsKnx/releases/tag/v2.18.0
