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
