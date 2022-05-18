import { B1 } from "../formats"
import { IDPT } from "./types"

export class DPT_Switch extends B1 implements IDPT {
    public async on(): Promise<void> {
        return this.write(1)
    }

    public async off(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.001'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Bool extends B1 implements IDPT {
    public async setTrue(): Promise<void> {
        return this.write(1)
    }

    public async setFalse(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.002'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Enable extends B1 implements IDPT {
    public async enable(): Promise<void> {
        return this.write(1)
    }

    public async disable(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.003'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_UpDown extends B1 implements IDPT {
    public async down(): Promise<void> {
        return this.write(1)
    }

    public async up(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.008'
    }

    public getUnit(): string {
        return ''
    }
}
export class DPT_OpenClose extends B1 implements IDPT {
    public async close(): Promise<void> {
        return this.write(1)
    }

    public async open(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.009'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Reset extends B1 implements IDPT {
    public async reset(): Promise<void> {
        return this.write(1)
    }

    public getTypeId(): string {
        return '1.015'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Ack extends B1 implements IDPT {
    public async acknowledge(): Promise<void> {
        return this.write(1)
    }

    public getTypeId(): string {
        return '1.016'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Trigger extends B1 implements IDPT {
    public async trigger(): Promise<void> {
        return this.write(1)
    }

    public getTypeId(): string {
        return '1.017'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Occupancy extends B1 implements IDPT {
    public async occupied(): Promise<void> {
        return this.write(1)
    }

    public async free(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.018'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_Window_Door extends B1 implements IDPT {
    public async open(): Promise<void> {
        return this.write(1)
    }

    public async closed(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.019'
    }

    public getUnit(): string {
        return ''
    }
}

export class DPT_DayNight extends B1 implements IDPT {
    public async night(): Promise<void> {
        return this.write(1)
    }

    public async day(): Promise<void> {
        return this.write(0)
    }

    public getTypeId(): string {
        return '1.024'
    }

    public getUnit(): string {
        return ''
    }
}