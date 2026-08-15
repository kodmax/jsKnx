import { context, Span, SpanStatusCode } from '@opentelemetry/api'

const mockStartActiveSpan = jest.fn()
const mockGetSpan = jest.fn()

jest.mock('@opentelemetry/api', () => {
    const actual = jest.requireActual<typeof import('@opentelemetry/api')>('@opentelemetry/api')

    return {
        ...actual,
        trace: {
            ...actual.trace,
            getSpan: (...args: Parameters<typeof actual.trace.getSpan>) => mockGetSpan(...args),
            getTracer: jest.fn(() => ({ startActiveSpan: mockStartActiveSpan }))
        }
    }
})

import { observeKnxGroup } from './observeKnxGroup'
import * as knxMetrics from './knxMetrics'

const dataPoint = {
    getAddress: () => '2/0/4',
    type: '1.001'
}

describe('observeKnxGroup', () => {
    afterEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
    })

    it('does not create a span without an active parent', async () => {
        mockGetSpan.mockReturnValue(undefined)
        const recordSpy = jest.spyOn(knxMetrics, 'recordKnxGroupOperation')

        const result = await observeKnxGroup('read', dataPoint, async span => {
            expect(span).toBeUndefined()
            return 'ok'
        })

        expect(result).toBe('ok')
        expect(mockGetSpan).toHaveBeenCalledWith(context.active())
        expect(mockStartActiveSpan).not.toHaveBeenCalled()
        expect(recordSpy).toHaveBeenCalledWith('read', dataPoint, expect.any(Number))
    })

    it('creates a child knx.group span when a parent span is active', async () => {
        mockGetSpan.mockReturnValue({} as Span)

        const childSpan = {
            addEvent: jest.fn(),
            recordException: jest.fn(),
            setStatus: jest.fn(),
            end: jest.fn()
        }

        mockStartActiveSpan.mockImplementation((_name, _options, callback: (span: Span) => Promise<number>) => callback(childSpan as never))

        const result = await observeKnxGroup('write', dataPoint, async span => {
            span?.addEvent('test')
            return 42
        })

        expect(result).toBe(42)
        expect(mockStartActiveSpan).toHaveBeenCalledWith(
            'knx.group',
            {
                attributes: {
                    'knx.group_address': '2/0/4',
                    'knx.operation': 'write',
                    'knx.dpt': '1.001'
                }
            },
            expect.any(Function)
        )
        expect(childSpan.end).toHaveBeenCalled()
    })

    it('marks the span as error when the callback throws', async () => {
        mockGetSpan.mockReturnValue({} as Span)

        const childSpan = {
            addEvent: jest.fn(),
            recordException: jest.fn(),
            setStatus: jest.fn(),
            end: jest.fn()
        }

        mockStartActiveSpan.mockImplementation((_name, _options, callback: (span: Span) => Promise<void>) => callback(childSpan as never))

        const error = new Error('bus failure')

        await expect(
            observeKnxGroup('request_value', dataPoint, async () => {
                throw error
            })
        ).rejects.toThrow('bus failure')

        expect(childSpan.recordException).toHaveBeenCalledWith(error)
        expect(childSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR })
        expect(childSpan.end).toHaveBeenCalled()
    })
})
