import { B1 } from "../formats"
import { DPT } from "../enums"

export class DPT_Switch extends B1 {
    public readonly type: DPT = DPT.Switch
    public readonly unit: string = ""

    public async on(): Promise<void> {
        return this.write(1)
    }

    public async off(): Promise<void> {
        return this.write(0)
    }
}

export class DPT_Bool extends B1 {
    public readonly type: DPT = DPT.Switch
    public readonly unit: string = ""

    public async setTrue(): Promise<void> {
        return this.write(1)
    }

    public async setFalse(): Promise<void> {
        return this.write(0)
    }
}

export class DPT_Enable extends B1 {
    public readonly type: DPT = DPT.Enable
    public readonly unit: string = ""

    public async enable(): Promise<void> {
        return this.write(1)
    }

    public async disable(): Promise<void> {
        return this.write(0)
    }
}

export class DPT_UpDown extends B1 {
    public readonly type: DPT = DPT.UpDown
    public readonly unit: string = ""

    public async down(): Promise<void> {
        return this.write(1)
    }

    public async up(): Promise<void> {
        return this.write(0)
    }
}
export class DPT_OpenClose extends B1 {
    public readonly type: DPT = DPT.OpenClose
    public readonly unit: string = ""

    public async close(): Promise<void> {
        return this.write(1)
    }

    public async open(): Promise<void> {
        return this.write(0)
    }
}

export class DPT_Reset extends B1 {
    public readonly type: DPT = DPT.Reset
    public readonly unit: string = ""

    public async reset(): Promise<void> {
        return this.write(1)
    }
}

export class DPT_Ack extends B1 {
    public readonly type: DPT = DPT.Ack
    public readonly unit: string = ""

    public async acknowledge(): Promise<void> {
        return this.write(1)
    }
}

export class DPT_Trigger extends B1 {
    public readonly type: DPT = DPT.Trigger
    public readonly unit: string = ""

    public async trigger(): Promise<void> {
        return this.write(1)
    }
}

export class DPT_Occupancy extends B1 {
    public readonly type: DPT = DPT.Occupancy
    public readonly unit: string = ""

    public async occupied(): Promise<void> {
        return this.write(1)
    }

    public async free(): Promise<void> {
        return this.write(0)
    }
}

export class DPT_Window_Door extends B1 {
    public readonly type: DPT = DPT.Window_Door
    public readonly unit: string = ""

    public async open(): Promise<void> {
        return this.write(1)
    }

    public async closed(): Promise<void> {
        return this.write(0)
    }

    public getUnit(): string {
        return ""
    }
}

export class DPT_DayNight extends B1 {
    public readonly type: DPT = DPT.DayNight
    public readonly unit: string = ""

    public async night(): Promise<void> {
        return this.write(1)
    }

    public async day(): Promise<void> {
        return this.write(0)
    }
}