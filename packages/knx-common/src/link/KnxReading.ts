/**
 * Result of a group read or an incoming group telegram delivered to a value listener.
 *
 * @typeParam T Decoded value type for the bound DPT.
 */
export type KnxReading<T> = {
    /** Group address that was read or updated. */
    target: string
    /** Individual address of the responding or writing device (e.g. `1.2.3`). */
    source: string
    /** Human-readable value from the DPT `toString()` formatter. */
    text: string
    /** Unit string from the DPT (e.g. `°C`, `%`); empty when not applicable. */
    unit: string
    /** Decoded payload value. */
    value: T
}
