import { Application, Router, Request, Response, NextFunction } from "express";
import { createServer, Server as HttpServer } from "http";
import express from "express";
import Logger from "src/components/Logger";
import cors from "cors";
import RouteError from "./RouteError";
import ServerService from "./ServerService";
import ShellyController from "src/modules/shelly/Controller";

export default class Server {
    private static instance: Server;

    private app: Application;
    private server: HttpServer;
    private router: Router;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.router = Router();

        this.useMiddlewares();
        this.useRouters();
        this.useErrorHandlers();
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }

        return Server.instance;
    }

    public start(port: number): void {
        this.server.listen(port, () => {
            Logger.info(`Server is running on port ${port}`);
        });

        this.server.on("error", (error: Error) => {
            Logger.error(`Server error: ${error}`);
        });
    }

    private useMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors(ServerService.getCorsOptions()));
        this.app.use("/api", this.router);
    }

    private useRouters(): void {
        const shellyController = new ShellyController();
        this.router.use("/shelly", shellyController.getRouter());
    }

    private useErrorHandlers(): void {
        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            const routeError = new RouteError(
                404,
                `Route not found: ${req.method}::${req.originalUrl}`
            );
            next(routeError);
        });

        this.app.use(
            (
                err: Error | RouteError,
                req: Request,
                res: Response,
                _next: NextFunction
            ) => {
                let httpStatus = 500;
                let message = "Internal server error";
                let logMessage: string | null = null;

                if (err instanceof RouteError) {
                    httpStatus = err.getHttpStatus();
                    message = err.message;
                    logMessage = err.getLogMessage();
                }

                Logger.error(
                    `[${httpStatus}] ${JSON.stringify({
                        message,
                        logMessage,
                    })}`
                );

                res.status(httpStatus).json({ message });
            }
        );
    }
}
