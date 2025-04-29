import { CorsOptions } from "cors";
import Config from "src/components/Config";

const CORS_WHITELIST = Config.getEnvVarAsString("CORS_WHITELIST");

export default class ServerService {
    public static getCorsWhitelist(): string[] {
        const corsWhitelist = CORS_WHITELIST.split(",");
        return corsWhitelist;
    }

    public static getCorsOptions(): CorsOptions {
        const corsWhitelist = ServerService.getCorsWhitelist();

        const corsOptions: CorsOptions = {
            credentials: true,
            origin: (origin, callback) => {
                if (!origin || corsWhitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"), false);
                }
            },
        };

        return corsOptions;
    }
}
