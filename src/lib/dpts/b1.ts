import { B1 } from "./formats"
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "on" : "off"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "true" : "false"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "enable" : "disable"
        }
    }
}

export class DPT_Alarm extends B1 {
    public readonly type: DPT = DPT.Alarm
    public readonly unit: string = ""

    public async noAlarm(): Promise<void> {
        return this.write(0)
    }

    public async alarm(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "alarm" : "no alarm"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "down" : "up"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "close" : "open"
        }
    }
}

export class DPT_Reset extends B1 {
    public readonly type: DPT = DPT.Reset
    public readonly unit: string = ""

    public async reset(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "reset" : "<noop>"
        }
    }
}

export class DPT_Start extends B1 {
    public readonly type: DPT = DPT.Start
    public readonly unit: string = ""

    public async start(): Promise<void> {
        return this.write(1)
    }

    public async stop(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "start" : "stop"
        }
    }
}
export class DPT_Ack extends B1 {
    public readonly type: DPT = DPT.Ack
    public readonly unit: string = ""

    public async acknowledge(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "ack" : "<noop>"
        }
    }
}

export class DPT_Trigger extends B1 {
    public readonly type: DPT = DPT.Trigger
    public readonly unit: string = ""

    /**
     * Trigger function.
     * @param value {0|1} value to use. According to KNX specification it should not matter whenever 0 or 1 is used. For some devices, it seems to matter.
     * @returns 
     */
    public async trigger(value: 0 | 1 = 0): Promise<void> {
        return this.write(value)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "trigger" : "trigger"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "occupied" : "free"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "open" : "closed"
        }
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value & 0x01 ? "night" : "day"
        }
    }
}