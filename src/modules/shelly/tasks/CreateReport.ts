import MetricService from "../MetricService";
import PlugService from "../PlugService";
import { ShellyPlug } from "../Types";

export default class CreateReportTask {
    public static async run(): Promise<void> {
        const plugs = await PlugService.getPlugs();

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const reportDateString = new Date().toISOString().split("T")[0];

        await Promise.all(
            plugs.map(async (plug) =>
                CreateReportTask.createDailyReport(plug, reportDateString)
            )
        );
    }
    private static async createDailyReport(
        plug: ShellyPlug,
        reportDate: string
    ): Promise<void> {
        const summaryIds = await MetricService.getSummariesForDate(
            plug.id,
            reportDate
        );

        await MetricService.saveReport(plug, reportDate, summaryIds);
    }
}
