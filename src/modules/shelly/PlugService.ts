import Postgres from "src/core/Postgres/Postgres";
import { ShellyPlug } from "./Types";

export default class PlugService {
    public static async getPlugs(): Promise<ShellyPlug[]> {
        const db = Postgres.getInstance();

        const plugs = await db.select<ShellyPlug>("shelly_plugs", [
            "id",
            "created_at",
            "name",
            "url",
            "protected",
            "is_on",
        ]);

        return plugs;
    }

    public static async updatePlug(
        plugId: ShellyPlug["id"],
        plug: Partial<Omit<ShellyPlug, "id" | "created_at">>
    ): Promise<boolean> {
        const db = Postgres.getInstance();

        const affectedRows = await db.update("shelly_plugs", plug, "id = $1", [
            plugId,
        ]);

        return affectedRows > 0;
    }
}
