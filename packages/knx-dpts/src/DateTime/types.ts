import { DayOfWeek } from '../TimeOfDay'

export type KnxDateTime = {
    year?: number
    month?: number
    dayOfMonth?: number
    dayOfWeek?: DayOfWeek
    hourOfDay?: number
    minutes?: number
    seconds?: number
    status: number
}
