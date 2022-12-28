import { U8 } from './formats'
import { DPT } from '../enums'

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
    public readonly type: DPT = DPT.DPT_Value_1_Ucount
    public readonly unit: string = ''
}

export class DPT_Tariff extends U8 {
    public readonly type: DPT = DPT.Tariff
    public readonly unit: string = ''
}
