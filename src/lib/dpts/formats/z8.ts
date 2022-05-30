import { DataPointAbstract, KnxReading } from "./data-point-abstract"
import { fromBuffer, toBuffer } from "./b8"

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

    protected decode(data: Buffer): KnxStandardStatus {
        const octet = fromBuffer(data)
        return {
            OutOfService: !!octet [0],
            AlarmUnAck: !!octet [4],
            Overridden: !!octet [2],
            InAlarm: !!octet [3],
            Fault: !!octet [1],
        }
    }

    public async write(status: KnxStandardStatus): Promise<void> {
        return this.send(toBuffer([0, 0, 0, +status.AlarmUnAck, +status.InAlarm, , +status.Overridden, +status.Fault, +status.OutOfService], Buffer.alloc(2)))
    }

    public removeValueListener(cb: (reading: KnxReading<KnxStandardStatus>) => void) {
        this.valueEvent.removeListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public addValueListener(cb: (reading: KnxReading<KnxStandardStatus>) => void) {
        this.valueEvent.addListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public toString(status?: KnxStandardStatus): string {
        if (status === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `[${Object.keys(status).filter(attribute => status [attribute]).join(', ')}]`
        }
    }
}

