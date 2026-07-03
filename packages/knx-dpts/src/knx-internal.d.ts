declare module '@js-knx-internal/types' {
    export type { KnxReading, KnxLinkExceptionDetails, KnxLinkExceptionCode } from '../../js-knx/src/lib/types'
    export { KnxLinkException } from '../../js-knx/src/lib/types'
}

declare module '@js-knx-internal/connection' {
    export type {
        KnxLinkOptions,
        RequiredKnxLinkOptions,
        LinkInfo,
        KnxGroupSchema,
        DatapointConstructor,
        KnxConnectingEvent,
        KnxNetworkConnectionEstablishedEvent,
        KnxStartingSessionEvent,
        KnxReconnectingEvent,
        KnxDisconnectedEvent,
        KnxDisconnectedReason
    } from '../../js-knx/src/lib/connection/KnxLink/types'
    export { KnxLink, KnxEventEmitter } from '../../js-knx/src/lib/connection/KnxLink'
    export type { KnxEventMap, KnxEventName, KnxEventListener } from '../../js-knx/src/lib/connection/KnxLink/KnxEventEmitter'
}

declare module '@js-knx-internal/message' {
    export { KnxCemiFrame } from '../../js-knx/src/lib/message'
}
