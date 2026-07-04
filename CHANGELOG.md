# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.20.0]

### Breaking

- **KnxLink event API rework.** `events` was removed from `KnxLinkOptions`; you can no longer inject a custom `EventEmitter` or subscribe via `knx.events`.
- **`KnxLink.connect()` removed.** Use `new KnxLink(ip, options)` then `await knx.connect()`. Lifecycle listeners (`connecting`, `connected`, …) can be registered before `connect()`.
- **`onError` and `onCemiFrame` removed from constructor options.** Subscribe via `knx.on('error', …)` and `knx.on('cemi-frame', …)` before `connect()`.
- **`LinkInfo.gatewayAddress` renamed to `individualAddress`.**
- **`KnxDisconnectedReason`:** `explicit` → `graceful` (disconnect response received), disconnect timeout → `disconnect-timeout`; removed `gateway-response`.

**Migration from 2.19.x and earlier:**

```typescript
// Before
const events = new EventEmitter()
events.on('error', err => { ... })
events.on('cemi-frame', frame => { ... })

const knx = await KnxLink.connect('192.168.0.8', { events, readTimeout: 5000 })
knx.events.on('cemi-frame', frame => { ... })

// After
const knx = new KnxLink('192.168.0.8', { readTimeout: 5000 })
knx.on('error', err => { ... })
knx.on('cemi-frame', frame => { ... })
knx.on('connecting', e => { ... })
await knx.connect()
```

- Replace `knx.events.on(...)` / `knx.events.emit(...)` with `knx.on(...)` / `knx.emit(...)`.
- `emit('error', …)` still follows Node.js semantics: register `knx.on('error', …)` before errors can occur, or an unhandled exception will be thrown.

### Added

- Typed `KnxEventEmitter` with `on` / `off` / `once` / `emit`
- `KnxLink.on()` / `off()` / `once()` / `emit()` — same event API exposed directly on the link
- Lifecycle events on `KnxLink`: `connecting`, `connected`, `reconnecting`, and `disconnected`
- Session lifecycle events: `network-connection-established` (UDP transport ready), `starting-session` (KNX/IP handshake starting, emitted before each `startSession` attempt including retries); session ready is `connected` after `KnxSession.startSession()` succeeds
- `KnxDisconnectedReason` and related event payload types
- `autoReconnect` option in `KnxLinkOptions` (default `true`) to disable automatic reconnect after gateway or network disconnects
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

- `connect()` logs a **console warning** when no `error` listener is registered. Without one, Node.js throws on unhandled `error` events.
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
