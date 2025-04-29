import axios, { AxiosRequestConfig } from "axios";
import PlugService from "../PlugService";
import Config from "src/components/Config";

const TERMINAL_URL = Config.getEnvVarAsString("TERMINAL_URL", false);

export default class UpdateTerminalTask {
    public static async run(): Promise<void> {
        const plugs = await PlugService.getPlugsWithLatestMeasurement();

        const requestConfig: AxiosRequestConfig = {
            method: "POST",
            url: `${TERMINAL_URL}/plugs`,
            headers: {
                "Content-Type": "application/json",
            },
            data: plugs.map((plug) => ({
                id: plug.id,
                name: plug.name,
                power_usage: Number(plug.power),
                is_on: plug.is_on,
                is_protected: plug.protected,
            })),
        };

        try {
            await axios(requestConfig);
        } catch (error) {
            console.error("Error updating terminal:", error);
        }
    }
}
