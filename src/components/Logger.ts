import winston, {
    createLogger,
    Logform,
    transports,
    Logger as WinstonLogger,
} from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { DailyRotateFileTransportOptions } from "winston-daily-rotate-file";
import { ConsoleTransportOptions } from "winston/lib/winston/transports";
import Config from "./Config";

const NODE_ENV = Config.getEnvVarAsString("NODE_ENV");

export default class Logger {
    private static logger: WinstonLogger;
    private static logLevel = "silly";
    private static logDir = "logs";

    public static init(logDir: string): void {
        Logger.logDir = logDir;

        Logger.logger = createLogger({
            level: Logger.logLevel,
            transports: [
                new transports.DailyRotateFile(Logger.getAppTransportConfig()),
                new transports.DailyRotateFile(
                    Logger.getErrorTransportConfig()
                ),
            ],
        });

        if (NODE_ENV === "development") {
            Logger.addConsoleTransport();
        }
    }

    public static info(message: string): void {
        if (!Logger.logger) {
            return;
        }

        Logger.logger.info(message);
    }

    public static error(message: string): void {
        if (!Logger.logger) {
            return;
        }

        Logger.logger.error(message);
    }

    public static debug(message: string): void {
        if (!Logger.logger) {
            return;
        }

        Logger.logger.debug(message);
    }

    public static warning(message: string): void {
        if (!Logger.logger) {
            return;
        }

        Logger.logger.warn(message);
    }

    public static silly(message: string): void {
        if (!Logger.logger) {
            return;
        }

        Logger.logger.silly(message);
    }

    private static addConsoleTransport(): void {
        Logger.logger.add(
            new winston.transports.Console(Logger.getConsoleTransportConfig())
        );
    }

    private static getConsoleTransportConfig(): ConsoleTransportOptions {
        return {
            format: Logger.getConsoleFormat(),
        };
    }

    private static getAppTransportConfig(): DailyRotateFileTransportOptions {
        return {
            filename: path.join(Logger.logDir, "application-%DATE%.log"),
            level: "info",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            format: Logger.getFileFormat(),
        };
    }

    private static getErrorTransportConfig(): DailyRotateFileTransportOptions {
        return {
            filename: path.join(Logger.logDir, "error-%DATE%.log"),
            level: "error",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            format: Logger.getFileFormat(),
        };
    }

    private static getConsoleFormat(): Logform.Format {
        return winston.format.combine(
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.printf((log) => `${log.timestamp}: ${log.message}`),
            winston.format.colorize({ all: true }),
            winston.format.errors({ stack: true })
        );
    }

    private static getFileFormat(): Logform.Format {
        return winston.format.combine(
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.printf(
                (log) => `${log.timestamp} [${log.level}]: ${log.message}`
            ),
            winston.format.errors({ stack: true })
        );
    }
}
