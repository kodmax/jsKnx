# js-knx

TypeScript/JavaScript client for KNX/IP gateways (tunneling connection, link layer).

Zero runtime dependencies. Works on Node.js 20+.

## Monorepo

This repository is a [Turborepo](https://turbo.build/) monorepo:

| Path                                         | Package            | Description                                                                                         |
| -------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| [`packages/js-knx`](packages/js-knx)         | `js-knx`           | Published library + CLI (`knx-read`, `knx-write`)                                                   |
| [`packages/knx-common`](packages/knx-common) | `@repo/knx-common` | Private workspace package; shared KNX types, protocol helpers, and cEMI vendored into `js-knx` dist |
| [`packages/knx-dpts`](packages/knx-dpts)     | `@repo/knx-dpts`   | Private workspace package; DPT classes vendored into `js-knx` dist at build time                    |
| [`packages/knx-enums`](packages/knx-enums)   | `@repo/knx-enums`  | Private workspace package; enum code vendored into `js-knx` dist at build time                      |
| [`apps/examples`](apps/examples)             | `@jsknx/examples`  | Local demo                                                                                          |

Root scripts orchestrate all workspaces via Turbo (`yarn build`, `yarn test`, `yarn lint`, `yarn typecheck`, `yarn dev`).

## Installation

```bash
npm install js-knx
# or
yarn add js-knx
```

The package ships as a **dual package**: use `require('js-knx')` in CommonJS or `import { KnxLink } from 'js-knx'` in ESM. Entry points are defined in `package.json` `exports`.

## Quick start

```typescript
import { DPT_HVACMode, KnxLink } from 'js-knx'

const knx = await KnxLink.connect('192.168.0.8', {
    readTimeout: 5000
})

knx.events.on('error', err => {
    console.error(err.message, err.code)
})

const livingRoom = knx.getDatapoint({
    address: '2/0/4',
    DataType: DPT_HVACMode
})

const reading = await livingRoom.read()
console.log(reading.text, reading.value)

await knx.disconnect()
```

Group addresses use KNX notation (`main/middle/sub`, e.g. `2/0/4`).

### Listen for bus traffic

```typescript
knx.events.on('cemi-frame', frame => {
    console.log(frame.source, '->', frame.target, frame.value)
})
```

### Write and subscribe

```typescript
import { DPT_Switch, KnxLink } from 'js-knx'

const knx = await KnxLink.connect('192.168.0.8')

const light = knx.getDatapoint({ address: '14/0/0', DataType: DPT_Switch })

await light.on()

light.addValueListener(reading => {
    console.log('state:', reading.text)
})

await knx.disconnect()
```

## CLI

After installation, two commands are available globally:

| Command     | Description                      |
| ----------- | -------------------------------- |
| `knx-read`  | Read a group address once        |
| `knx-write` | Write a value to a group address |

Gateway IP can be passed as the first argument or via the `KNX_GATEWAY` environment variable.

```bash
# read
knx-read 192.168.0.8 2/0/4 HVACMode
KNX_GATEWAY=192.168.0.8 knx-read 2/0/4 Switch

# write
knx-write 2/0/4 Switch 1
knx-write 192.168.0.8 2/0/4 Scaling 50
```

DPT names accept short form (`Switch`, `HVACMode`) or full export name (`DPT_Switch`).

Numeric string values are coerced to numbers automatically (`"1"` → `1`). Time/date strings are passed through as-is.

## Supported DPT types

Each DPT is a class exported from `js-knx`. Instantiate via `knx.getDatapoint({ address, DataType })`.

### 1.x — Boolean / binary

| Class             | KNX DPT |
| ----------------- | ------- |
| `DPT_Switch`      | 1.001   |
| `DPT_Bool`        | 1.002   |
| `DPT_Enable`      | 1.003   |
| `DPT_Alarm`       | 1.005   |
| `DPT_UpDown`      | 1.008   |
| `DPT_OpenClose`   | 1.009   |
| `DPT_Start`       | 1.010   |
| `DPT_State`       | 1.011   |
| `DPT_Reset`       | 1.015   |
| `DPT_Ack`         | 1.016   |
| `DPT_Trigger`     | 1.017   |
| `DPT_Occupancy`   | 1.018   |
| `DPT_Window_Door` | 1.019   |
| `DPT_DayNight`    | 1.024   |
| `DPT_Generic_B1`  | —       |

### 5.x — Unsigned 8-bit

| Class                | KNX DPT |
| -------------------- | ------- |
| `DPT_Scaling`        | 5.001   |
| `DPT_Angle`          | 5.003   |
| `DPT_Percent_U8`     | 5.004   |
| `DPT_Tariff`         | 5.006   |
| `DPT_Value_1_Ucount` | 5.010   |
| `DPT_Generic_U8`     | —       |

### 9.x — Float 16-bit

| Class                  | KNX DPT |
| ---------------------- | ------- |
| `DPT_Value_Temp`       | 9.001   |
| `DPT_Value_Humidity`   | 9.007   |
| `DPT_Value_AirQuality` | 9.008   |
| `DPT_Generic_F16`      | —       |

### 10.x / 11.x / 19.x — Time and date

| Class          | KNX DPT |
| -------------- | ------- |
| `DPT_Time`     | 10.001  |
| `DPT_Date`     | 11.001  |
| `DPT_DateTime` | 19.001  |

### 13.x / 14.x — Energy and power

| Class                                 | KNX DPT |
| ------------------------------------- | ------- |
| `DPT_ActiveEnergy`                    | 13.010  |
| `DPT_Value_Electric_Current`          | 14.019  |
| `DPT_Value_Electric_Potential`        | 14.027  |
| `DPT_Value_Frequency`                 | 14.031  |
| `DPT_Value_Power_Factor`              | 14.057  |
| `DPT_Value_Power`                     | 14.056  |
| `DPT_Value_ApparentPower`             | 14.080  |
| `DPT_Generic_V32` / `DPT_Generic_F32` | —       |

### 20.x / 21.x — HVAC and status

| Class               | KNX DPT |
| ------------------- | ------- |
| `DPT_HVACMode`      | 20.102  |
| `DPT_HVACContrMode` | 20.105  |
| `DPT_StatusGen`     | 21.001  |

Several DPT classes expose convenience methods (e.g. `DPT_Switch.on()` / `.off()`, `DPT_HVACMode` mode constants).

## `KnxLinkConstructorOptions`

All options are optional when calling `new KnxLink(ip, options)`.

| Option                  | Default    | Description                                                                                 |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `readTimeout`           | `10000`    | Timeout (ms) for `read()` waiting for a group response                                      |
| `connectionTimeout`     | `10000`    | Timeout (ms) for the initial KNX/IP tunnel handshake                                        |
| `maxRetry`              | `Infinity` | Retries when the gateway rejects connection (e.g. both tunnel slots busy)                   |
| `retryPause`            | `3000`     | Pause (ms) between connection retries; also used for automatic reconnect after network loss |
| `maxConcurrentMessages` | `16`       | Max telegrams awaiting gateway ACK before back-pressure                                     |
| `maxTelegramsPerSecond` | `24`       | Send rate limit; lower if you see read timeouts on busy buses                               |
| `port`                  | `3671`     | KNX/IP UDP port of the gateway                                                              |

Subscribe to link events with `knx.on('error', …)` and `knx.on('cemi-frame', …)`.

### Connection behaviour

- **Initial connect** retries with `maxRetry` / `retryPause` until the gateway accepts a tunnel (useful when both tunnel channels are occupied).
- **Automatic reconnect** runs after unexpected session loss (socket close, gateway disconnect). It does not run after an explicit `disconnect()`.
- **Second `connect()`** on the same `KnxConnection` throws `CONNECTION_ALREADY_ESTABLISHED` or `CONNECTION_IN_PROGRESS`.

## Datapoint API

Every DPT class extends `DataPointAbstract`:

| Method                 | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `read()`               | Send group read, wait for response (`KnxReading<T>`)       |
| `write(value)`         | Send group write (DPT-specific value type)                 |
| `requestValue()`       | Send group read without waiting                            |
| `addValueListener(cb)` | Subscribe to incoming group writes/responses               |
| `getAddress()`         | Group address string                                       |
| `getLink()`            | Parent link (`KnxDatapointLink`; implemented by `KnxLink`) |
| `toString(value?)`     | Human-readable label                                       |

`KnxReading` shape:

```typescript
{
    target: string // group address
    source: string // individual address (e.g. "1.2.3")
    text: string // formatted value
    unit: string
    value: T
}
```

## Error handling

Errors are thrown as `KnxLinkException` with a `code` field:

| Code                             | Typical cause                                       |
| -------------------------------- | --------------------------------------------------- |
| `CONNECTION_TIMEOUT`             | Gateway did not respond during handshake            |
| `CONNECTION_ERROR`               | Gateway rejected connection (busy, wrong layer, …)  |
| `CONNECTION_ALREADY_ESTABLISHED` | `connect()` called twice                            |
| `READ_TIMEOUT`                   | No bus response within `readTimeout`                |
| `DATA_LENGTH_MISMATCH`           | Received payload size does not match DPT            |
| `PROTOCOL_ERROR`                 | Invalid KNX/IP or cEMI frame                        |
| `NO_CONNECTION`                  | Send attempted after disconnect                     |
| `ACK_TIMEOUT`                    | Gateway did not ACK a tunnel telegram (after retry) |
| `NETWORK_ERROR`                  | UDP socket connect or send failure                  |

Listen on `knx.events.on('error', …)` for non-fatal bus/protocol errors during operation.

## Protocol references

KNX/IP tunneling implementation notes and further reading:

- [KNX/IP documentation (eb-systeme.de)](http://www.eb-systeme.de/?page_id=479) — referenced in the connection layer source

## Development

```bash
git clone https://github.com/kodmax/jsKnx.git
cd jsKnx
yarn install
yarn build
yarn test
yarn lint:ci
```

Local demo (edit gateway IP in `examples/demo.ts`):

```bash
yarn build   # required once so `js-knx` resolves for the example imports
yarn dev
```

## License

[GPL-3.0](LICENSE.md)
