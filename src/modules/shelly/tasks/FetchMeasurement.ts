import MetricService from "../MetricService";
import PlugService from "../PlugService";
import { ShellyPlug } from "../Types";

export default class FetchMeasurementTask {
    public static async run(): Promise<void> {
        const plugs = await PlugService.getPlugs();

        await Promise.all(
            plugs.map(async (plug) =>
                FetchMeasurementTask.getMeasurementAndUpdatePlug(plug)
            )
        );
    }

    private static async getMeasurementAndUpdatePlug(plug: ShellyPlug) {
        const measurement = await MetricService.getMeasurement(plug);

        if (!measurement) {
            return;
        }

        const { metrics, is_on } = measurement;

        await MetricService.saveMeasurement(metrics);
        await PlugService.updatePlug(plug.id, { is_on });
    }
}
