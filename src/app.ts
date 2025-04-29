import Config from "./components/Config";
import Logger from "./components/Logger";
import Postgres from "./core/Postgres/Postgres";
import Scheduler from "./core/Scheduler/Scheduler";
import Server from "./core/Server/Server";
import CreateReportTask from "./modules/shelly/tasks/CreateReport";
import CreateSummaryTask from "./modules/shelly/tasks/CreateSummary";
import FetchMeasurementTask from "./modules/shelly/tasks/FetchMeasurement";
import UpdateTerminalTask from "./modules/shelly/tasks/UpdateTerminal";

const LOG_DIR = "/app/logs";
const SERVER_PORT = 80;
const DB_HOST = Config.getEnvVarAsString("DB_HOST", false);
const DB_PORT = Config.getEnvVarAsNumber("DB_PORT", false);
const DB_USER = Config.getEnvVarAsString("DB_USER", false);
const DB_PASSWORD = Config.getEnvVarAsString("DB_PASSWORD", false);
const DB_NAME = Config.getEnvVarAsString("DB_NAME", false);

Logger.init(LOG_DIR);

const pg = Postgres.getInstance();
pg.init(DB_HOST, DB_PORT, DB_NAME, "public", DB_USER, DB_PASSWORD, false);

const server = Server.getInstance();
server.start(SERVER_PORT);

const scheduler = Scheduler.getInstance();
scheduler.init();

scheduler.addJob("fetch-shelly-plugs", "* * * * * *", FetchMeasurementTask.run);
scheduler.addJob("create-shelly-summary", "*/5 * * * *", CreateSummaryTask.run);
scheduler.addJob("create-shelly-report", "0 0 * * *", CreateReportTask.run);
scheduler.addJob(
    "update-shelly-terminal",
    "* * * * * *",
    UpdateTerminalTask.run
);
