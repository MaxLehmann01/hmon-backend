export default class RouteError extends Error {
    private httpStatus: number;
    private logMessage: string | null;

    constructor(
        httpStatus: number,
        message: string,
        logMessage: string | null = null
    ) {
        super(message);

        this.httpStatus = httpStatus;
        this.logMessage = logMessage;
    }

    public getHttpStatus(): number {
        return this.httpStatus;
    }

    public getLogMessage(): string | null {
        return this.logMessage;
    }
}
