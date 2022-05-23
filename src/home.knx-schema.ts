import { DPT_ActiveEnergy, DPT_Date, DPT_DateTime, DPT_Start, DPT_Switch, DPT_Time, DPT_Value_AirQuality, DPT_Value_Power, DPT_Value_Temp } from "./lib"

export const lights = {
    "Oswietlenie.Salon i lazienka.Salon i lazienka Swiatla Off": { address: "14/0/0" },
    "Oswietlenie.Jadalnia.Jadalnia LED A On/Off": { address: "14/2/1" },
    "Oswietlenie.Jadalnia.Jadalnia LED A On/Off Stan": { address: "14/2/2" },
    "Oswietlenie.Jadalnia.Jadalnia LED A Sciemnianie": { address: "14/2/3" },
    "Oswietlenie.Jadalnia.Jadalnia LED A Jasnosc absolutna": { address: "14/2/4" },
    "Oswietlenie.Jadalnia.Jadalnia LED A Jasnosc odczyt": { address: "14/2/5" },
    "Oswietlenie.Jadalnia.Jadalnia LED B On/Off": { address: "14/2/6" },
    "Oswietlenie.Jadalnia.Jadalnia LED B On/Off Stan": { address: "14/2/7" },
    "Oswietlenie.Jadalnia.Jadalnia LED B Sciemnianie": { address: "14/2/8" },
    "Oswietlenie.Jadalnia.Jadalnia LED B Jasnosc absolutna": { address: "14/2/9" },
    "Oswietlenie.Jadalnia.Jadalnia LED B Jasnosc Odczyt": { address: "14/2/10" },
    "Oswietlenie.Kuchnia.Cala Kuchnia LED On/Off": { address: "14/3/1" },
    "Oswietlenie.Kuchnia.Cala Kuchnia LED On/Off Stan": { address: "14/3/2" },
    "Oswietlenie.Kuchnia.Cala Kuchnia LED Sciemnianie": { address: "14/3/3" },
    "Oswietlenie.Kuchnia.Cala Kuchnia LED Jasnosc Absolutna": { address: "14/3/4" },
    "Oswietlenie.Kuchnia.Cala Kuchnia LED Jasnosc Odczyt": { address: "14/3/5" },
    "Oswietlenie.Kuchnia.Kuchnia LED A On/Off": { address: "14/3/6" },
    "Oswietlenie.Kuchnia.Kuchnia LED A On/Off Stan": { address: "14/3/7" },
    "Oswietlenie.Kuchnia.Kuchnia LED B On/Off": { address: "14/3/8" },
    "Oswietlenie.Kuchnia.Kuchnia LED B On/Off Stan": { address: "14/3/9" },
    "Oswietlenie.Lazienka.Lazienka LED Main Sciemniacz": { address: "14/4/1" },
    "Oswietlenie.Lazienka.Lazienka LED Main On/Off": { address: "14/4/2" },
    "Oswietlenie.Lazienka.Lazienka LED Secondary Sciemniacz": { address: "14/4/3" },
    "Oswietlenie.Lazienka.Lazienka LED Secondary On/Off": { address: "14/4/4" },
    "Oswietlenie.Lazienka.Lazienka LED Lustro On/Off": { address: "14/4/5" },
    "Oswietlenie.Lazienka.Lazienka LED Lustro Sciemniacz": { address: "14/4/6" },
    "Oswietlenie.Lazienka.Lazienka LED Cala Sciemnianie": { address: "14/4/7" },
    "Oswietlenie.Lazienka.Lazienka LED Geberit on/off": { address: "14/4/8" },
    "Oswietlenie.Lazienka.Lazienka LED Shower on/off": { address: "14/4/9" },
    "Oswietlenie.Lazienka.Lazienka LED Geberit Stan": { address: "14/4/10" },
    "Oswietlenie.Lazienka.Lazienka LED Shower Stan": { address: "14/4/11" },
    "Oswietlenie.Hol.Salon Hol LED On/Off": { address: "14/5/2", dataType: DPT_Switch },
    "Oswietlenie.Hol.Salon Hol LED On/Off Stan": { address: "14/5/3" },
    "Oswietlenie.Hol.Salon Hol LED Sciemnianie": { address: "14/5/4" },
    "Oswietlenie.Hol.Salon Hol LED Jasnosc absolutna": { address: "14/5/5" },
    "Oswietlenie.Hol.Salon Hol LED Jasnosc odczyt": { address: "14/5/6" },
    "Oswietlenie.Hol.Sypialnia LED hol i schowek On/Off": { address: "14/5/7" },
    "Oswietlenie.Hol.Sypialnia LED hol i schowe stan on/off": { address: "14/5/8" },
    "Oswietlenie.Hol.Sypialnia LED Hol On/Off": { address: "14/5/9" },
    "Oswietlenie.Hol.Sypialnia LED Hol On/Off Stan": { address: "14/5/10" },
    "Oswietlenie.Hol.Sypialnia LED Hol Sciemnianie": { address: "14/5/11" },
    "Oswietlenie.Salon.Salon LED B Jasnosc absolutna ": { address: "14/6/2" },
    "Oswietlenie.Salon.Salon LED B Jasnosc absolutna stan": { address: "14/6/3" },
    "Oswietlenie.Salon.Caly Salon LED On/Off": { address: "14/6/4" },
    "Oswietlenie.Salon.Caly Salon LED On/Off Stan": { address: "14/6/5" },
    "Oswietlenie.Salon.Caly Salon LED Sciemnianie": { address: "14/6/6" },
    "Oswietlenie.Salon.Caly Salon LED Jasnosc absolutna": { address: "14/6/7" },
    "Oswietlenie.Salon.Caly Salon LED Jasnosc Odczyt": { address: "14/6/8" },
    "Oswietlenie.Salon.Salon LED A On/Off": { address: "14/6/9" },
    "Oswietlenie.Salon.Salon LED A On/Off Stan": { address: "14/6/10" },
    "Oswietlenie.Salon.Salon LED B On/Off": { address: "14/6/11" },
    "Oswietlenie.Salon.Salon LED B On/Off Stan": { address: "14/6/12" },
    "Oswietlenie.Sypialnia.Sypialnia LED B On/Off": { address: "14/7/3" },
    "Oswietlenie.Sypialnia.Sypialnia LED B On/Off Stan": { address: "14/7/4" },
    "Oswietlenie.Sypialnia.Sypialnia LED B Sciemnianie": { address: "14/7/5" },
    "Oswietlenie.Sypialnia.Sypialnia LED B Jasnosc Absolutna": { address: "14/7/6" },
    "Oswietlenie.Sypialnia.Sypialnia LED B Jasnosc Odczyt": { address: "14/7/7" },
    "Oswietlenie.Sypialnia.Sypialnia LED A On/Off": { address: "14/7/8" },
    "Oswietlenie.Sypialnia.Sypialnia LED A On/Off Stan": { address: "14/7/9" },
    "Oswietlenie.Sypialnia.Sypialnia LED A Sciemnianie": { address: "14/7/10" },
    "Oswietlenie.Sypialnia.Sypialnia LED A Jasnosc Absolutna": { address: "14/7/11" },
    "Oswietlenie.Sypialnia.Sypialnia LED A Jasnosc Odczyt": { address: "14/7/12" },
    "Oswietlenie.Sypialnia.Sypialnia smiglo on/off": { address: "14/7/15" },
    "Oswietlenie.Sypialnia.Sypialnia smiglo status": { address: "14/7/16" },
    "Oswietlenie 230V.Parkiet.Parkiet Swiatlo on/off": { address: "12/0/0" },
    "Oswietlenie 230V.Parkiet.Parkiet Swiatlo Stan": { address: "12/0/1" },
    "Oswietlenie 230V.Sypialnia.Sypialnia Smigło on/off": { address: "12/1/0" },
    "Oswietlenie 230V.Sypialnia.Sypialnia Swiatlo Stan": { address: "12/1/1" },
}

const electricty = {
    "EnergyMeter.RequestReadings": {
        address: "5/0/0"
    },
    "EnergyMeter.InstanPowerUsage": {
        address: "5/0/1",
        dataType: DPT_Value_Power
    },
    "EnergyMeter.Frequency": {
        address: "5/1/0"
    },
    "Energy Management.Energy.Request Energy Readings": { address: "5/2/0" },
    "Energy Management.Energy.Start": { address: "5/2/1" },
    "Energy Management.Energy.Intermediate Reading": { address: "5/2/2" },
    "Energy Management.Energy.Total Energy Reading": { address: "5/2/3" },
    "Energy Management.Energy.Stop": { address: "5/2/4" },
    "Energy Management.Energy.Status": { address: "5/2/5" },
}

export const sensors = {
    "Sensory.Powietrze.Tempertura Salon": { address: "15/0/0" },
    "Sensory.Powietrze.Temperatura lazienka": { address: "15/0/1" },
    "Sensory.Powietrze.Temperatura sypialnia przy loggi": { address: "15/0/2" },
    "Sensory.Powietrze.Zawartosc CO2 ppm": { address: "15/0/3" },
    "Sensory.Powietrze.Temperatura sypialnia sufit": { address: "15/0/4" },
    "Sensory.Powietrze.Wilgotnosc powietrza": { address: "15/0/5" },
    "Sensory.Powietrze.Temperatura sypialnia lozko lewa": { address: "15/0/6" },
    "Sensory.Powietrze.Temperatura sypialnia sofa": { address: "15/0/7" },
    "Sensory.Powietrze.Temperatura lazienka wlacznik": { address: "15/0/8" },
    "Sensory.Powietrze.Temperatura sypialnia hol": { address: "15/0/9" },
    "Sensory.Alerty.Alert CO2 1 > 600ppm": { address: "15/1/0" },
    "Sensory.Alerty.Alert CO2 2 > 800ppm": { address: "15/1/1" },
    "Sensory.Alerty.Alert CO2 3 > 1000ppm": { address: "15/1/2" },
    "Sensory.Alerty.Alert niska wysoka wilgotnosc > 55%": { address: "15/1/3" },
    "Sensory.Alerty.Alert niska wilgotnosc <45%": { address: "15/1/4" }
}

export const heatings = {
    "Ogrzewanie.Podloga lazienka.Ogrzewanie podloga lazienka on/off": { address: "13/0/0" },
    "Ogrzewanie.Podloga lazienka.Ogrzewanie podloga lazienka stan": { address: "13/0/1" },
    "Ogrzewanie.Podloga lazienka.Podloga lazienka temperatura": { address: "13/0/2" },
    "Ogrzewanie.Podloga lazienka.Ogrzewanie podlogi lazienka ustawienie PWM": { address: "13/0/3" },
    "Ogrzewanie.Podloga lazienka.Ogrzewanie podloga lazienka stan PWM": { address: "13/0/4" },
    "Ogrzewanie.Grzejniki.Grzejnik Salon ustawienie": { address: "13/1/0" },
    "Ogrzewanie.Grzejniki.Grzejnik Salon odczyt": { address: "13/1/1" },
    "Ogrzewanie.Grzejniki.Grzejnik Jadalnia ustawienie": { address: "13/1/2" },
    "Ogrzewanie.Grzejniki.Grzejnik Jadalnia odczyt": { address: "13/1/3" },
    "Ogrzewanie.Grzejniki.Grzejnik Sypialnia ustawienie": { address: "13/1/4" },
    "Ogrzewanie.Grzejniki.Grzejnik Sypialnia odczyt": { address: "13/1/5" },
    "Ogrzewanie.Grzejniki.Grzejnik Lazienka ustawienie": { address: "13/1/6" },
    "Ogrzewanie.Grzejniki.Grzejnik Lazienka odczyt": { address: "13/1/7" },
    "Ogrzewanie.Grzejniki.Grzejniki Oba Salon ustawienie": { address: "13/1/9" },
    "Ogrzewanie.Grzejniki elektryczne.Grzejniki Elektryczne Salon On/Off": { address: "13/2/0" },
    "Ogrzewanie.Grzejniki elektryczne.Grzejnik elektryczny sypialnia on/off": { address: "13/2/1" },
    "Ogrzewanie.New middle group.Obecnosc sypialnia": { address: "13/4/0" },
    "Ogrzewanie.New middle group.Heating/Cooling Status": { address: "13/4/1" },
}

export const venting = {
    "Wentylacja.Lazienka.Wentylacja Lazienka on/off": { address: "11/0/0" },
    "Wentylacja.Lazienka.Wentylacja Lazienka stan": { address: "11/0/1" },
    "Wentylacja.Wentylacja Kuchnia.Wentylacja kuchnia stan": { address: "11/1/0" },
    "Wentylacja.Wentylacja Kuchnia.Wentylacja kuchnia on/off": { address: "11/1/1" },
}

export const sockets = {
    "Gniazdka 230V.Salon.Gniazdko Jadalnia Lewe On/Off": { address: "10/0/0" },
    "Gniazdka 230V.Salon.Gniazdko 230V Salon Lewe On/Off": { address: "10/0/1" },
    "Gniazdka 230V.Salon.Gniazdko 230V Salon Lewe Stan": { address: "10/0/2" },
    "Gniazdka 230V.Salon.Gniazdko 230V Salon Prawe On/Off": { address: "10/0/3" },
    "Gniazdka 230V.Salon.Gniazdko 230V Salon Prawe Stan": { address: "10/0/4" },
    "Gniazdka 230V.Salon.Gniazdko Jadalnia Lewe stan": { address: "10/0/5" },
    "Gniazdka 230V.Salon.Gniazdko Jadalnia Prawe On/Off": { address: "10/0/6" },
    "Gniazdka 230V.Salon.Gniazdko Jadalnia Prawe stan": { address: "10/0/7" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia Lozko Prawe On/Off": { address: "10/1/0" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia Lozko Prawe Stan": { address: "10/1/1" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia Lozko Lewe On/Off": { address: "10/1/2" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia Lewe Lozko Stan": { address: "10/1/3" },
    "Gniazdka 230V.Sypialnia.Sypialnia Gniazko TV Lewe On/Off": { address: "10/1/4" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia TV Lewe Stan": { address: "10/1/5" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia TV Prawe On/Off": { address: "10/1/6" },
    "Gniazdka 230V.Sypialnia.Gniazdko Sypialnia TV Prawe Stan": { address: "10/1/7" },
}

export const time = {
    "Now.DateTime.Set": {
        address: "1/0/1",
        dataType: DPT_DateTime
    },
    "Now.Date.Set": {
        address: "1/0/2",
        dataType: DPT_Date
    },
    "Now.Time.Set": {
        address: "1/0/3",
        dataType: DPT_Time
    },
}
