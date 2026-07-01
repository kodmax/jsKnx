import EventEmitter from 'events'
import { APCI, DPT, KnxCemiCode } from '../../enums'
import { KnxCemiFrame } from '../../message'
import { KnxReading } from '../../types'
import { KnxLink, KnxLinkOptions } from '../../connection'
import { DataPointAbstract } from './data-point-abstract'
import { U8 } from './u8'

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

function createTestDatapoint(): { dp: TestU8; events: EventEmitter; link: KnxLink } {
    const events = new EventEmitter()
    events.on('error', () => {})
    const link = {
        sendCemiFrame: jest.fn().mockResolvedValue(undefined)
    } as unknown as KnxLink

    const options = {
        events,
        readTimeout: 1000
    } as KnxLinkOptions

    return { dp: new TestU8('1/2/3', link, options), events, link }
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
        const { dp, events } = createTestDatapoint()
        const readPromise = dp.read()
        await flushAsync()

        events.emit('cemi-frame', groupValueRespFrame(Buffer.from([0x00])))

        await expect(readPromise).rejects.toMatchObject({ code: 'DATA_LENGTH_MISMATCH' })
    })

    it('read() resolves when response length matches', async () => {
        const { dp, events } = createTestDatapoint()
        const readPromise = dp.read()
        await flushAsync()

        events.emit('cemi-frame', groupValueRespFrame(Buffer.from([0x00, 0x2a])))

        await expect(readPromise).resolves.toMatchObject({
            value: 42,
            target: '1/2/3'
        } satisfies Partial<KnxReading<number>>)
    })

    it('read() rejects with READ_TIMEOUT when no response arrives', async () => {
        const events = new EventEmitter()
        events.on('error', () => {})
        const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
        const dp = new TestU8('1/2/3', link, { events, readTimeout: 30 } as KnxLinkOptions)

        await expect(dp.read()).rejects.toMatchObject({ code: 'READ_TIMEOUT' })
    })

    it('requestValue() sends group value read cEMI frame', async () => {
        const { dp, link } = createTestDatapoint()

        await dp.requestValue()

        expect(link.sendCemiFrame).toHaveBeenCalledTimes(1)
        expect(link.sendCemiFrame).toHaveBeenCalledWith(expect.any(Buffer))
    })

    it('addValueListener receives group value writes for matching address', async () => {
        const { dp, events } = createTestDatapoint()
        const listener = jest.fn()

        dp.addValueListener(listener)
        events.emit('cemi-frame', groupValueWriteFrame(Buffer.from([0x00, 0x07])))

        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 7,
                target: '1/2/3',
                source: '1.0.0'
            })
        )
    })

    it('ignores cEMI frames for other group addresses', async () => {
        const { dp, events } = createTestDatapoint()
        const listener = jest.fn()

        dp.addValueListener(listener)
        events.emit('cemi-frame', KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '9/9/9', Buffer.from([0x00, 0x01]))))

        expect(listener).not.toHaveBeenCalled()
    })
})
