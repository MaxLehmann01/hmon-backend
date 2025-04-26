import axios, { AxiosRequestConfig } from "axios";
import {
    ShellyPlug,
    ShellyMeasurementNormalized,
    ShellyMeasurementRaw,
} from "./Types";

export default class MetricService {
    public static async getMeasurement(shellyPlug: ShellyPlug): Promise<{
        metrics: Omit<ShellyMeasurementNormalized, "id" | "is_on">;
        is_on: boolean;
    } | null> {
        const rawMetrics = await MetricService.fetchMetrics(shellyPlug.url);

        if (!rawMetrics) {
            return null;
        }

        return {
            metrics: MetricService.normalizeMetrics(shellyPlug.id, rawMetrics),
            is_on: rawMetrics.output,
        };
    }

    private static async fetchMetrics(
        url: ShellyPlug["url"]
    ): Promise<ShellyMeasurementRaw | null> {
        try {
            const requestConfig: AxiosRequestConfig = {
                method: "GET",
                url: `${url}/rpc/Switch.GetStatus?id=0`,
                timeout: 3000,
            };

            const response = await axios(requestConfig);

            return response.data as ShellyMeasurementRaw;
        } catch (_) {
            return null;
        }
    }

    private static normalizeMetrics(
        plugId: ShellyPlug["id"],
        rawMetrics: ShellyMeasurementRaw
    ): Omit<ShellyMeasurementNormalized, "id" | "is_on"> {
        const { apower, voltage, current, temperature } = rawMetrics;

        return {
            plug_id: plugId,
            power: apower,
            voltage,
            current,
            temp_c: temperature.tC,
            temp_f: temperature.tF,
        };
    }
}
