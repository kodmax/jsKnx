import { DPT_ActiveEnergy, DPT_Date, DPT_Start, DPT_Switch, DPT_Time, DPT_Value_AirQuality, DPT_Value_Power, DPT_Value_Temp } from "./lib"

export const home = {
    "CO2": {
        dataType: DPT_Value_AirQuality,
        address: "15/0/3",
    },

    "EnergyMeter.Total": {
        dataType: DPT_ActiveEnergy,
        address: "5/2/3",
    },
    "EnergyMeter.Start": {
        address: "5/2/1",
        dataType: DPT_Start
    },
    "EnergyMeter.InstanPowerUsage": {
        address: "5/0/1", 
        dataType: DPT_Value_Power
    },

    "Bathroom.FloorTemp": {
        address: "13/0/2", 
        dataType: DPT_Value_Temp
    },
    "Bathroom.AirTemp": {
        address: "15/0/8",
        dataType: DPT_Value_Temp
    },

    "Livingroom.TVLeds.Command": {
        address: "14/6/9",
        dataType: DPT_Switch
    },
    "Livingroom.TVLeds.State": {
        address: "14/6/10",
        dataType: DPT_Switch
    },

    "Now.Date.Set": {
        address: "1/0/2", 
        dataType: DPT_Date
    },
    "Now.Time.Set": {
        address: "1/0/3",
        dataType: DPT_Time
    }
}