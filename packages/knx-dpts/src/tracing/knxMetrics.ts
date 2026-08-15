import { metrics } from '@opentelemetry/api'

export type KnxGroupOperation = 'read' | 'request_value' | 'write' | 'receive'

const meter = metrics.getMeter('js-knx')

const knxGroupOperations = meter.createCounter('knx.group.operations', {
    description: 'KNX group address operations'
})

const knxGroupOperationDuration = meter.createHistogram('knx.group.operation.duration', {
    description: 'KNX group operation duration',
    unit: 'ms'
})

type KnxInstrumentedDataPoint = {
    getAddress(): string
    type: unknown
}

export const recordKnxGroupOperation = (operation: KnxGroupOperation, dataPoint: KnxInstrumentedDataPoint, durationMs: number): void => {
    const attributes = {
        'knx.operation': operation,
        'knx.group_address': dataPoint.getAddress(),
        'knx.dpt': String(dataPoint.type)
    }

    knxGroupOperations.add(1, attributes)
    knxGroupOperationDuration.record(durationMs, attributes)
}

export const recordKnxReceive = (dataPoint: KnxInstrumentedDataPoint, durationMs: number): void => {
    recordKnxGroupOperation('receive', dataPoint, durationMs)
}
