import MetricService from "../MetricService";
import PlugService from "../PlugService";
import { ShellyPlug, ShellySummary } from "../Types";

export default class CreateSummaryTask {
    public static async run(): Promise<void> {
        const plugs = await PlugService.getPlugs();

        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        await Promise.all(
            plugs.map(async (plug) =>
                CreateSummaryTask.summarizePlugMeasurements(
                    plug,
                    fiveMinutesAgo,
                    now
                )
            )
        );
    }

    private static async summarizePlugMeasurements(
        plug: ShellyPlug,
        fiveMinutesAgo: Date,
        now: Date
    ) {
        const measurements = await MetricService.getMeasurementsInTimeRange(
            plug.id,
            fiveMinutesAgo,
            now
        );

        const count = measurements.length;
        const powerSum = measurements.reduce(
            (sum, m) => sum + Number(m.power),
            0
        );
        const powerAvg = count > 0 ? powerSum / count : 0;
        const currentAvg =
            count > 0
                ? measurements.reduce((sum, m) => sum + Number(m.current), 0) /
                  count
                : 0;
        const voltageAvg =
            count > 0
                ? measurements.reduce((sum, m) => sum + Number(m.voltage), 0) /
                  count
                : 0;
        const tempCAvg =
            count > 0
                ? measurements.reduce((sum, m) => sum + Number(m.temp_c), 0) /
                  count
                : 0;
        const tempFAvg =
            count > 0
                ? measurements.reduce((sum, m) => sum + Number(m.temp_f), 0) /
                  count
                : 0;

        const summary: Omit<ShellySummary, "id"> = {
            plug_id: plug.id,
            created_at: new Date(),
            start_at: fiveMinutesAgo,
            end_at: now,
            power_sum: powerSum,
            power_avg: powerAvg,
            current_avg: currentAvg,
            voltage_avg: voltageAvg,
            temp_c_avg: tempCAvg,
            temp_f_avg: tempFAvg,
            count_measurements: count,
        };

        await MetricService.saveSummary(summary);
    }
}
