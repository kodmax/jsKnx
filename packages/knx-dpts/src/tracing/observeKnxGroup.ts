import { context, Span, SpanStatusCode, trace } from '@opentelemetry/api'

export type KnxGroupOperation = 'read' | 'request_value' | 'write'

type KnxDataPoint = {
    getAddress(): string
    type: unknown
}

const knxTracer = trace.getTracer('js-knx')

const spanAttributes = (operation: KnxGroupOperation, dataPoint: KnxDataPoint, extraAttributes?: Record<string, string>): Record<string, string> => ({
    'knx.group_address': dataPoint.getAddress(),
    'knx.operation': operation,
    'knx.dpt': String(dataPoint.type),
    ...extraAttributes
})

export const observeKnxGroup = async <T>(
    operation: KnxGroupOperation,
    dataPoint: KnxDataPoint,
    fn: (span: Span | undefined) => Promise<T>,
    extraAttributes?: Record<string, string>
): Promise<T> => {
    const parentSpan = trace.getSpan(context.active())

    if (parentSpan === undefined) {
        return fn(undefined)
    }

    return knxTracer.startActiveSpan(
        'knx.group',
        {
            attributes: spanAttributes(operation, dataPoint, extraAttributes)
        },
        async span => {
            try {
                return await fn(span)
            } catch (error) {
                span.recordException(error instanceof Error ? error : new Error(String(error)))
                span.setStatus({ code: SpanStatusCode.ERROR })
                throw error
            } finally {
                span.end()
            }
        }
    )
}
