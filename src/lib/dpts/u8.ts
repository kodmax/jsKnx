import { U8 } from './formats'
import { DPT } from '../enums'

export class DPT_Generic_U8 extends U8 {
    public readonly type: DPT = DPT.Generic_U8
    public readonly unit: string = ''
}

export class DPT_Scaling extends U8 {
    public readonly type: DPT = DPT.Scaling
    public readonly unit: string = ''

    public async setPercent (percent: number): Promise<void> {
        return this.write(Math.floor(percent / 100 * 255))
    }

    public getPercent (value: number): number {
        return Math.floor(value / 255)
    }

    public toString (value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `${Number(this.getPercent(value)).toString(10)} %`
        }
    }
}

export class DPT_Angle extends U8 {
    public readonly type: DPT = DPT.Angle
    public readonly unit: string = ''

    public async setAngle (angle: number): Promise<void> {
        return this.write(Math.floor(angle / 360 * 255))
    }

    public getAngle (value: number): number {
        return Math.floor(value / 255 * 360)
    }

    public toString (value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `${Number(this.getAngle(value)).toString(10)} °`
        }
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
    Auto = 0,
    Comfort = 1,
    Standby = 2,
    Economy = 3,
    FrostProtection = 4
}

export class DPT_HVACMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACMode
    public readonly unit: string = ''

    public static readonly MODE: typeof HVACMode = HVACMode

    public async setMode (mode: HVACMode): Promise<void> {
        return this.write(mode)
    }

    public async readMode (): Promise<HVACMode> {
        return (await this.read()).value as HVACMode
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
