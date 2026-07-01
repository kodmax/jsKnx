import EventEmitter from 'events'
import { APCI, DPT, KnxCemiCode } from '../../enums'
import { KnxCemiFrame } from '../../message'
import { KnxReading } from '../../types'
import { KnxLink, KnxLinkOptions } from '../../connection'
import { DataPointAbstract } from './data-point-abstract'

class TestU8 extends DataPointAbstract<number> {
    protected valueByteLength = 2
    public readonly type = DPT.Generic_U8
    public readonly unit = ''

    protected decode(data: Buffer): number {
        return data.readUint8(1)
    }

    protected async write(): Promise<void> {}

    public addValueListener(): void {}

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

describe('DataPointAbstract', () => {
    const flushAsync = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

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
})
