import axios, { AxiosRequestConfig } from "axios";
import {
    ShellyPlug,
    ShellyMeasurementNormalized,
    ShellyMeasurementRaw,
    ShellySummary,
} from "./Types";
import Postgres from "src/core/Postgres/Postgres";

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

    public static async saveMeasurement(
        measurement: Omit<ShellyMeasurementNormalized, "id" | "is_on">
    ): Promise<boolean> {
        const db = Postgres.getInstance();

        const returning = await db.insert("shelly_measurements", {
            plug_id: measurement.plug_id,
            power: measurement.power,
            voltage: measurement.voltage,
            current: measurement.current,
            temp_c: measurement.temp_c,
            temp_f: measurement.temp_f,
            created_at: new Date(),
        });

        if (!returning) {
            return false;
        }

        return true;
    }

    public static async getMeasurementsInTimeRange(
        plugId: ShellyPlug["id"],
        start: Date,
        end: Date
    ): Promise<
        Omit<ShellyMeasurementNormalized, "id" | "plug_id" | "is_on">[]
    > {
        const db = Postgres.getInstance();

        const measurements = await db.select(
            "shelly_measurements",
            ["power", "voltage", "current", "temp_c", "temp_f"],
            "plug_id = $1 AND created_at >= $2 AND created_at <= $3",
            [plugId, start, end]
        );

        return measurements.map((measurements) => ({
            power: measurements.power,
            voltage: measurements.voltage,
            current: measurements.current,
            temp_c: measurements.temp_c,
            temp_f: measurements.temp_f,
        }));
    }

    public static async saveSummary(
        summary: Omit<ShellySummary, "id">
    ): Promise<boolean> {
        const db = Postgres.getInstance();

        const returning = await db.insert("shelly_summaries", summary);

        if (!returning) {
            return false;
        }

        return true;
    }

    public static async getSummariesForDate(
        plugId: ShellyPlug["id"],
        date: string
    ): Promise<ShellySummary["id"][]> {
        const db = Postgres.getInstance();

        const summaries = await db.select(
            "shelly_summaries",
            ["id"],
            "plug_id = $1 AND start_at::date = $2",
            [plugId, date]
        );

        return summaries.map((summary) => summary.id);
    }

    public static async saveReport(
        plug: ShellyPlug,
        reportDate: string,
        summaryIds: ShellySummary["id"][]
    ): Promise<boolean> {
        const db = Postgres.getInstance();

        const returning = await db.insert(
            "shelly_reports",
            {
                plug_id: plug.id,
                report_date: reportDate,
                created_at: new Date(),
            },
            "id"
        );

        if (!returning) {
            return false;
        }

        for (const summaryId of summaryIds) {
            await db.insert("shelly_report_summaries", {
                report_id: Number(returning),
                summary_id: summaryId,
            });
        }

        return false;
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
