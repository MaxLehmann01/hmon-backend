import Postgres from "src/core/Postgres/Postgres";
import { ShellyPlug } from "./Types";
import axios, { AxiosRequestConfig } from "axios";

export default class PlugService {
    public static async getPlugs(): Promise<ShellyPlug[]> {
        const db = Postgres.getInstance();

        // const plugs = await db.select<ShellyPlug>(
        //     "shelly_plugs",
        //     ["id", "created_at", "name", "url", "protected", "is_on"],
        //     "1=1",
        //     []
        // );

        const rows = await db.query<ShellyPlug>(
            `SELECT id, created_at, name, url, protected, is_on FROM shelly_plugs ORDER BY id ASC`
        );

        return rows.rows;
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
            ) m ON true
            ORDER BY p.id ASC;
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

    public static async togglePlug(
        plugId: ShellyPlug["id"]
    ): Promise<-1 | 0 | 1> {
        try {
            const db = Postgres.getInstance();

            const plug = await db.selectOne<ShellyPlug>(
                "shelly_plugs",
                ["url", "protected"],
                "id = $1",
                [plugId]
            );

            if (!plug) {
                return 0;
            }

            if (plug.protected) {
                return -1;
            }

            const requestConfig: AxiosRequestConfig = {
                method: "GET",
                url: `${plug.url}/rpc/Switch.Toggle?id=0`,
            };

            await axios(requestConfig);
            return 1;
        } catch (_) {
            return 0;
        }
    }
}
