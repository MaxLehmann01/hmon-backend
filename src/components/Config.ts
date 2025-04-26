export default class Config {
    public static getEnvVarAsString(
        key: string,
        emptyAllowed: boolean = false
    ): string {
        const value = Config.loadEnvironmentVariable(key, emptyAllowed);

        return value;
    }

    public static getEnvVarAsNumber(
        key: string,
        emptyAllowed: boolean = false
    ): number {
        const value = Config.loadEnvironmentVariable(key, emptyAllowed);

        const numberValue = Number(value);

        if (isNaN(numberValue)) {
            throw new Error(
                `Environment variable ${key} is not a valid number`
            );
        }

        return numberValue;
    }

    public static getEnvVarAsBoolean(
        key: string,
        emptyAllowed: boolean = false
    ): boolean {
        const value = Config.loadEnvironmentVariable(key, emptyAllowed);

        if (value === "true") {
            return true;
        }

        if (value === "false") {
            return false;
        }

        throw new Error(`Environment variable ${key} is not a valid boolean`);
    }

    private static loadEnvironmentVariable(
        key: string,
        emptyAllowed: boolean
    ): string {
        const value = process.env[key];

        if (value === undefined) {
            throw new Error(`Environment variable ${key} is not defined`);
        }

        if (!emptyAllowed && value === "") {
            throw new Error(`Environment variable ${key} is empty`);
        }

        return value;
    }
}
