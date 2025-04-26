import MetricService from "../MetricService";
import PlugService from "../PlugService";
import TerminalService from "../TerminalService";
import { ShellyPlug } from "../Types";

export default class FetchTask {
    public static async run(): Promise<void> {
        const shellyPlugs = await PlugService.getPlugs();
        TerminalService.sendPlugsToTerminal(shellyPlugs);

        await Promise.all(
            shellyPlugs.map(async (shellyPlug) =>
                FetchTask.getMeasurementAndUpdatePlug(shellyPlug)
            )
        );
    }

    private static async getMeasurementAndUpdatePlug(shellyPlug: ShellyPlug) {
        const result = await MetricService.getMeasurement(shellyPlug);
        await PlugService.updatePlug(shellyPlug.id, {
            is_on: result?.is_on,
        });
    }
}
