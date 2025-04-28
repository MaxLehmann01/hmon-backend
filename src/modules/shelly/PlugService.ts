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

    public static async getPlugsWithLatestMeasurement(): Promise<any[]> {
        const db = Postgres.getInstance();

        const plugs = await db.query(`
            SELECT
                p.*,
                m.id AS measurement_id,
                m.created_at AS measurement_created_at,
                m.power,
                m.current,
                m.voltage,
                m.temp_c,
                m.temp_f
            FROM
                shelly_plugs p
            LEFT JOIN LATERAL (
                SELECT
                    m.*
                FROM
                    shelly_measurements m
                WHERE
                    m.plug_id = p.id
                ORDER BY
                    m.created_at DESC
                LIMIT 1
            ) m ON true;
        `);

        return plugs.rows.map((plug) => ({
            id: plug.id,
            name: plug.name,
            protected: plug.protected,
            is_on: plug.is_on,
            power: plug.power,
        }));
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
