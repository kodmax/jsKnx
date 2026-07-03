enum HVACMode {
    FrostProtection = 4,
    Comfort = 1,
    Standby = 2,
    Economy = 3,
    Auto = 0
}

export function hvacModeLabel(value: number): string {
    return HVACMode[value]
}
