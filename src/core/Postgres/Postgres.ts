import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import Logger from "src/components/Logger";

export default class Postgres {
    private static instance: Postgres;
    private pool: Pool;
    private schema: string;

    constructor() {}

    public static getInstance(): Postgres {
        if (!Postgres.instance) {
            Postgres.instance = new Postgres();
        }
        return Postgres.instance;
    }

    public async init(
        host: string,
        port: number,
        database: string,
        schema: string,
        user: string,
        password: string,
        ssl: boolean
    ): Promise<void> {
        try {
            this.schema = schema;
            this.pool = new Pool({
                host,
                port,
                database,
                user,
                password,
                ssl,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            this.pool.on("connect", () => {
                Logger.info(
                    `Connected to Postgres Pool at ${user}@${host}:${port}/${database}`
                );
            });

            this.pool.on("error", (err) => {
                Logger.error(`Postgres Pool Error: ${err}`);
            });

            const testConnection = await this.getConnection();
            testConnection.query("SELECT NOW()");
            testConnection.release();
        } catch (e) {
            Logger.error(`Error initializing Postgres Pool: ${e}`);
        }
    }

    public async getConnection(): Promise<PoolClient> {
        if (!this.pool) {
            throw new Error("Postgres Pool not initialized");
        }

        try {
            const connection = await this.pool.connect();
            await connection.query(
                `SET search_path TO ${this.schema}, "$user"`
            );
            return connection;
        } catch (e) {
            Logger.error(`Error getting Postgres connection: ${e}`);
            throw e;
        }
    }

    public async closePool(): Promise<void> {
        if (this.pool) {
            try {
                await this.pool.end();
                Logger.info("Postgres Pool closed");
            } catch (e) {
                Logger.error(`Error closing Postgres Pool: ${e}`);
            }
        }
    }

    public async query<T extends QueryResultRow>(
        query: string,
        params: Array<string | number | boolean | Date | null> = []
    ): Promise<QueryResult<T>> {
        const connection = await this.getConnection();

        try {
            const result = await connection.query<T>(query, params);
            return result;
        } catch (err) {
            Logger.error(`Error executing query: ${err}`);
            throw err;
        } finally {
            connection.release();
        }
    }

    public async select<T extends QueryResultRow>(
        table: string,
        columns: string[],
        where?: string,
        params: Array<string | number | boolean | Date | null> = []
    ): Promise<T[]> {
        const query = `SELECT ${columns
            .map((column) => `"${column}"`)
            .join(", ")} FROM "${table}" ${where ? `WHERE ${where}` : ""}`;

        const result = await this.query<T>(query, params);
        return result.rows;
    }

    public async selectOne<T extends QueryResultRow>(
        table: string,
        columns: string[],
        where: string,
        params: Array<string | number | boolean | Date | null> = []
    ): Promise<T | null> {
        const query = `SELECT ${columns
            .map((column) => `"${column}"`)
            .join(", ")} FROM "${table}" ${
            where ? `WHERE ${where}` : ""
        } LIMIT 1`;

        const result = await this.query<T>(query, params);

        return result.rows[0] || null;
    }

    public async insert(
        table: string,
        data: Record<string, string | number | boolean | Date | null>,
        returning: string | null = null
    ): Promise<unknown | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(",");
        const returningClause = returning ? ` RETURNING ${returning}` : "";

        const query = `INSERT INTO "${table}" (${keys
            .map((key) => `"${key}"`)
            .join(", ")}) VALUES (${placeholders})${returningClause}`;

        const result = await this.query(query, values);

        if (returning) {
            return result.rows[0][returning];
        }

        return null;
    }

    public async update(
        table: string,
        data: Record<string, string | number | boolean | Date | null>,
        where: string,
        params: Array<string | number | boolean | Date | null> = []
    ): Promise<number | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys
            .map((key, idx) => `"${key}" = $${idx + 1}`)
            .join(", ");

        const whereOffset = values.length;
        const whereClause = where.replace(
            /\$(\d+)/g,
            (_, idx) => `$${parseInt(idx) + whereOffset}`
        );

        const query = `UPDATE "${table}" SET ${setClause} WHERE ${whereClause}`;

        const result = await this.query(query, [...values, ...params]);
        return result.rowCount;
    }

    public async delete(
        table: string,
        where: string,
        params: Array<string | number | boolean | Date | null> = []
    ): Promise<number | null> {
        const query = `DELETE FROM ${table} WHERE ${where}`;

        const result = await this.query(query, params);
        return result.rowCount;
    }
}
