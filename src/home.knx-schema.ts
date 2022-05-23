import { DPT_ActiveEnergy, DPT_Value_AirQuality } from "./lib"

export const home = {
    "CO2": {
        dataType: DPT_Value_AirQuality,
        address: "15/0/3",
    },
    "EnergyTotal": {
        dataType: DPT_ActiveEnergy,
        address: "5/2/3",
    }
}