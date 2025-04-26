import axios, { AxiosRequestConfig } from "axios";
import { ShellyPlug } from "./Types";

export default class TerminalService {
    public static async sendPlugsToTerminal(shellyPlugs: ShellyPlug[]) {
        const requestConfig: AxiosRequestConfig = {
            method: "POST",
            url: "http://192.168.178.33:8080/plugs",
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
            console.log(
                "Plugs sent to terminal successfully:",
                requestConfig.data
            );
        } catch (error) {
            console.error("Error sending plugs to terminal:", error);
        }
    }
}
