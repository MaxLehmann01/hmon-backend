import axios, { AxiosRequestConfig } from "axios";
import { ShellyPlug } from "./Types";
import Config from "src/components/Config";

const TERMINAL_URL = Config.getEnvVarAsString("TERMINAL_URL", false);

export default class TerminalService {
    public static async sendPlugsToTerminal(shellyPlugs: ShellyPlug[]) {
        const requestConfig: AxiosRequestConfig = {
            method: "POST",
            url: `${TERMINAL_URL}/plugs`,
            data: shellyPlugs.map((plug) => ({
                id: plug.id,
                name: plug.name,
                is_on: plug.is_on,
                power_usage: 1.05,
            })),
            timeout: 3000,
        };

        try {
            await axios(requestConfig);
        } catch (error) {
            console.error("Error sending plugs to terminal:", error);
        }
    }
}
