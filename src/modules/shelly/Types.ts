export type ShellyPlug = {
    id: number;
    created_at: Date;
    name: string;
    url: string;
    protected: boolean;
    is_on: boolean;
};

export type ShellyMeasurementRaw = {
    output: boolean;
    apower: number;
    voltage: number;
    current: number;
    temperature: {
        tC: number;
        tF: number;
    };
};

export type ShellyMeasurementNormalized = {
    id: number;
    plug_id: ShellyPlug["id"];
    is_on: boolean;
    power: number;
    voltage: number;
    current: number;
    temp_c: number;
    temp_f: number;
};

export type ShellySummary = {
    id: number;
    plug_id: ShellyPlug["id"];
    created_at: Date;
    start_at: Date;
    end_at: Date;
    power_sum: number;
    power_avg: number;
    current_avg: number;
    voltage_avg: number;
    temp_c_avg: number;
    temp_f_avg: number;
    count_measurements: number;
};
