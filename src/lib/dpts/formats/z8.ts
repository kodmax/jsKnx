import { DataPointAbstract } from './data-point-abstract'
import { B8 } from './b8'
import { KnxReading } from '../../types'

export type KnxStandardStatus = {
    /**
     * corresponding Datapoint value is out of service
     */
    OutOfService: boolean

    /**
     * corresponding Datapoint Main value is corrupted due to a failure
     */
    Fault: boolean

    /**
     * corresponding Datapoint Main value is overridden
     */
    Overridden: boolean

    /**
     * alarm status of corresponding Datapoint is not acknowledged
     */
    AlarmUnAck: boolean

    /**
     * corresponding Datapoint is in alarm
     */
    InAlarm: boolean
}

export abstract class Z8 extends DataPointAbstract<KnxStandardStatus> {
    protected valueByteLength: number = 2

    protected decode (data: Buffer): KnxStandardStatus {
        const octet = B8.fromBuffer(data)
        return {
            OutOfService: !!octet [0],
            AlarmUnAck: !!octet [4],
            Overridden: !!octet [2],
            InAlarm: !!octet [3],
            Fault: !!octet [1]
        }
    }

    public async write (status: KnxStandardStatus): Promise<void> {
        return this.send(B8.toBuffer([
            0,
            0,
            0,
            +status.AlarmUnAck,
            +status.InAlarm,
            +status.Overridden,
            +status.Fault,
            +status.OutOfService
        ], Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener (cb: (reading: KnxReading<KnxStandardStatus>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener (cb: (reading: KnxReading<KnxStandardStatus>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString (status?: KnxStandardStatus): string {
        if (status === undefined) {
            return `${this.address} (${this.type})`

        } else {
            const attributes = (Object.keys(status) as Array<keyof KnxStandardStatus>)

            // filter the truthful attribures and list their names
            return `[${attributes.filter(attribute => status [attribute]).join(', ')}]`
        }
    }
}
