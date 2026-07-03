import { APCI, DPT, KnxCemiCode } from '@repo/knx-enums'
import { KnxCemiFrame } from '@js-knx-internal/message'
import { KnxReading } from '@js-knx-internal/types'
import { KnxEventEmitter, KnxLink, RequiredKnxLinkOptions } from '@js-knx-internal/connection'
import { DataPointAbstract } from './DataPointAbstract'
import { U8 } from '../U8'

class TestU8 extends DataPointAbstract<number> {
    protected valueByteLength = 2
    public readonly type = DPT.Generic_U8
    public readonly unit = ''

    protected decode(data: Buffer): number {
        return U8.fromBuffer(data)
    }

    protected async write(value: number): Promise<void> {
        return this.send(U8.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public addValueListener(cb: (reading: KnxReading<number>) => void): void {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(value?: number): string {
        return value === undefined ? this.address : String(value)
    }
}

function createMockLink(): { link: KnxLink; emitCemiFrame: (frame: KnxCemiFrame) => void } {
    const events = new KnxEventEmitter()
    events.on('error', () => {})
    const link = {
        sendCemiFrame: jest.fn().mockResolvedValue(undefined),
        on: (...args: Parameters<KnxEventEmitter['on']>) => events.on(...args),
        off: (...args: Parameters<KnxEventEmitter['off']>) => events.off(...args),
        emit: (...args: Parameters<KnxEventEmitter['emit']>) => events.emit(...args)
    } as unknown as KnxLink

    return {
        link,
        emitCemiFrame: frame => events.emit('cemi-frame', frame)
    }
}

function createTestDatapoint(): { dp: TestU8; emitCemiFrame: (frame: KnxCemiFrame) => void; link: KnxLink } {
    const { link, emitCemiFrame } = createMockLink()
    const options = {
        readTimeout: 1000
    } as RequiredKnxLinkOptions

    return { dp: new TestU8('1/2/3', link, options), emitCemiFrame, link }
}

function groupValueRespFrame(value: Buffer): KnxCemiFrame {
    const frame = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', value)
    const apciField = frame.readUInt16BE(9)
    frame.writeUInt16BE((apciField & 0x3f) | (APCI.APCI_GROUP_VALUE_RESP << 6), 9)

    return KnxCemiFrame.decode(frame)
}

function groupValueWriteFrame(value: Buffer): KnxCemiFrame {
    return KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', value))
}

describe('DataPointAbstract', () => {
    const flushAsync = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

    afterEach(() => {
        jest.useRealTimers()
    })

    it('read() rejects on DATA_LENGTH_MISMATCH', async () => {
        const { dp, emitCemiFrame } = createTestDatapoint()
        const readPromise = dp.read()
        await flushAsync()

        emitCemiFrame(groupValueRespFrame(Buffer.from([0x00])))

        await expect(readPromise).rejects.toMatchObject({ code: 'DATA_LENGTH_MISMATCH' })
    })

    it('read() resolves when response length matches', async () => {
        const { dp, emitCemiFrame } = createTestDatapoint()
        const readPromise = dp.read()
        await flushAsync()

        emitCemiFrame(groupValueRespFrame(Buffer.from([0x00, 0x2a])))

        await expect(readPromise).resolves.toMatchObject({
            value: 42,
            target: '1/2/3'
        } satisfies Partial<KnxReading<number>>)
    })

    it('read() rejects with READ_TIMEOUT when no response arrives', async () => {
        const { link } = createMockLink()
        const dp = new TestU8('1/2/3', link, { readTimeout: 30 } as RequiredKnxLinkOptions)

        await expect(dp.read()).rejects.toMatchObject({ code: 'READ_TIMEOUT' })
    })

    it('requestValue() sends group value read cEMI frame', async () => {
        const { dp, link } = createTestDatapoint()

        await dp.requestValue()

        expect(link.sendCemiFrame).toHaveBeenCalledTimes(1)
        expect(link.sendCemiFrame).toHaveBeenCalledWith(expect.any(Buffer))
    })

    it('addValueListener receives group value writes for matching address', async () => {
        const { dp, emitCemiFrame } = createTestDatapoint()
        const listener = jest.fn()

        dp.addValueListener(listener)
        emitCemiFrame(groupValueWriteFrame(Buffer.from([0x00, 0x07])))

        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 7,
                target: '1/2/3',
                source: '1.0.0'
            })
        )
    })

    it('ignores cEMI frames for other group addresses', async () => {
        const { dp, emitCemiFrame } = createTestDatapoint()
        const listener = jest.fn()

        dp.addValueListener(listener)
        emitCemiFrame(KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '9/9/9', Buffer.from([0x00, 0x01]))))

        expect(listener).not.toHaveBeenCalled()
    })
})
