# Agent notes (js-knx)

Guidance for automated refactors, reviews, and “leak” fixes. Read before changing connection-layer timing code.

## `KnxTunnel.ts` — timers are not leaks

File: [`src/lib/connection/KnxLink/KnxConnection/connect/KnxTunnel/KnxTunnel.ts`](src/lib/connection/KnxLink/KnxConnection/connect/KnxTunnel/KnxTunnel.ts)

Jest may print _“A worker process has failed to exit gracefully… Active timers”_ after the full suite. That warning is **not** evidence of a production timer leak in `KnxTunnel`. The timers below are **session-scoped** and **bounded**.

### 1. `sendInterval` (`setInterval`)

- **Purpose:** rate-limits dequeuing from `pendingMessages` (`maxTelegramsPerSecond`).
- **Lifetime:** created once when `new KnxTunnel(...)` is called (one active tunnel session).
- **Cleanup:** `clearInterval(sendInterval)` in `socket.on('close')` (line ~69–72).
- **Why it looks suspicious:** the interval runs for the whole connection (minutes/hours in production). That is intentional back-pressure, not a forgotten handle.
- **In tests:** specs use `jest.useFakeTimers()`; other suites (e.g. `connection/index.spec.ts`) may leave real timers until process exit → Jest worker warning, not a library bug.

### 2. ACK retry timeouts (`setTimeout`, nested 1s + 1s)

- **Purpose:** KNX/IP tunneling expects a `TUNNEL_RESPONSE` ACK per sent telegram. If ACK is missing, resend once after 1s; after another 1s, reject the pending send, clear the queue, and `socket.close()`.
- **Lifetime:** per in-flight telegram, **maximum ~2 seconds** unless ACK arrives earlier.
- **Cleanup on success:** `TUNNEL_RESPONSE` handler calls `clearTimeout(pendingMessage.timeoutId)` and removes the entry from `acknowledge` (line ~50–55).
- **Cleanup on failure:** inner timeout closes the tunnel socket → `close` handler sets `isClosed = true` and clears `sendInterval`. No unbounded growth of timers or map entries.
- **Why it looks suspicious:** nested `setTimeout` without a shared `AbortController`; agents often flag this. Here the state machine is small: outer timeout → optional retry → inner timeout → close + reject. Replacing with “cleanup on close” that clears every pending ACK timer is optional hardening, **not** fixing an actual leak.

### 3. No bulk clear of `acknowledge` on `close`

- On tunnel socket `close`, pending ACK timers are **not** explicitly cleared.
- **Why that is OK:** at most one outer and one inner timer per concurrent in-flight message (`maxConcurrentMessages`, default 16). After close, no new sends are accepted (`isClosed`). Remaining timers fire within ≤2s and operate on an already-closed session.
- **Not a leak:** timer count does not grow with connection uptime or telegram volume after shutdown.

### 4. `pendingMessages` queue

- Held in closure for the session. Cleared on ACK failure (`pendingMessages.splice(0, pendingMessages.length)`). Drained normally when ACKs succeed.
- Not retained after `KnxConnection.teardown()` closes the tunnel.

---

## What _would_ be a real issue (do not confuse with the above)

| Symptom                                                                | Concern                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| New `setInterval` / `setTimeout` on **every** `send()` without removal | Real leak                                                     |
| `acknowledge` entries never deleted when ACKs arrive                   | Map growth (bug) — current code deletes on ACK                |
| `new KnxTunnel(...)` called repeatedly without closing previous socket | Duplicate handlers — guarded by one instance per `KnxSession` |

---

## Related: `tunnel-request.ts`

Separate from `KnxTunnel`. Handshake uses one `setTimeout(connectionTimeout)` cleared on `gateway.once('message')`. Known improvement backlog (not shipped): if timeout wins the race, the `once('message')` listener remains until the next connection attempt on the same socket. Documented here so agents do not attribute that to `KnxTunnel`.

---

## Tests

- **`KnxTunnel.spec.ts`:** always uses fake timers; does not emit `tunnel.close()` in every case — fine for unit scope.
- **Full suite worker warning:** treat as test harness / cross-suite timer noise unless `--detectOpenHandles` points at a specific test file that creates `KnxTunnel` without `close` **and** leaves real timers running.

**Do not** “fix” production `KnxTunnel` timing logic solely to silence Jest’s worker exit message without confirming an actual unbounded handle growth.
