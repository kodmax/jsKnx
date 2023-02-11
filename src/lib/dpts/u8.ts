import { U8 } from './formats'
import { DPT } from '../enums'

export class DPT_Generic_U8 extends U8 {
    public readonly type: DPT = DPT.Generic_U8
    public readonly unit: string = ''
}

export class DPT_Scaling extends U8 {
    public readonly type: DPT = DPT.Scaling
    public readonly unit: string = ''

    public static fromBuffer (buf: Buffer): number {
        return Math.round(buf.readUint8(1) / 255 * 100)
    }

    public static toBuffer (value: number, buf: Buffer): Buffer {
        buf.writeUint8(Math.round(value / 100 * 255), 1)
        return buf
    }

    protected decode (data: Buffer): number {
        return DPT_Scaling.fromBuffer(data)
    }

    public async write (value: number): Promise<void> {
        return this.send(DPT_Scaling.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }
}

export class DPT_Angle extends U8 {
    public readonly type: DPT = DPT.Angle
    public readonly unit: string = '°'

    public static fromBuffer (buf: Buffer): number {
        return Math.round(buf.readUint8(1) / 255 * 360)
    }

    public static toBuffer (value: number, buf: Buffer): Buffer {
        buf.writeUint8(Math.round(value / 360 * 255), 1)
        return buf
    }

    protected decode (data: Buffer): number {
        return DPT_Angle.fromBuffer(data)
    }

    public async write (value: number): Promise<void> {
        return this.send(DPT_Angle.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }
}

export class DPT_Percent_U8 extends U8 {
    public readonly type: DPT = DPT.Percent_U8
    public readonly unit: string = '%'
}

export class DPT_Value_1_Ucount extends U8 {
    public readonly type: DPT = DPT.Value_1_Ucount
    public readonly unit: string = ''
}

export class DPT_Tariff extends U8 {
    public readonly type: DPT = DPT.Tariff
    public readonly unit: string = ''
}

enum HVACMode {
    FrostProtection = 4,
    Comfort = 1,
    Standby = 2,
    Economy = 3,
    Auto = 0
}

export class DPT_HVACMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACMode
    public readonly unit: string = ''

    public static readonly FROST_PROTECION = 4
    public static readonly ECONOMY = 3
    public static readonly STANDBY = 2
    public static readonly COMFORT = 1
    public static readonly AUTO = 0

    public toString (value?: number): string {
        if (value === undefined) {
            return super.toString()

        } else {
            return HVACMode[value]
        }
    }
}

enum HVACContrMode {
    Auto = 0,
    Heat = 1,
    MorningWarmup = 2,
    Cool = 3,
    NightPurge = 4,
    Precool = 5,
    Off = 6,
    Test = 7,
    EmergencyHeat = 8,
    FanOnly = 9,
    FreeCool = 10,
    Ice = 11,
    MaximumHeatingMode = 12,
    EconomicMode = 13,
    Dehumidification = 14,
    CalibrationMode = 15,
    EmergencyCoolMode = 16,
    EmergencySteamMode = 17,
    NoDem = 20
}

export class DPT_HVACContrMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACContrMode
    public readonly unit: string = ''

    public static readonly MODE: typeof HVACContrMode = HVACContrMode

    public async setMode (mode: HVACContrMode): Promise<void> {
        return this.write(mode)
    }

    public async readMode (): Promise<HVACContrMode> {
        return (await this.read()).value as HVACContrMode
    }
}
