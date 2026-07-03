export type KnxReading<T> = {
    target: string
    source: string
    text: string
    unit: string
    value: T
}
