import Config from "./components/Config";
import Logger from "./components/Logger";
import Postgres from "./core/Postgres/Postgres";
import Scheduler from "./core/Scheduler/Scheduler";
import FetchTask from "./modules/shelly/tasks/Fetch";

const LOG_DIR = "/app/logs";
const DB_HOST = Config.getEnvVarAsString("DB_HOST", false);
const DB_PORT = Config.getEnvVarAsNumber("DB_PORT", false);
const DB_USER = Config.getEnvVarAsString("DB_USER", false);
const DB_PASSWORD = Config.getEnvVarAsString("DB_PASSWORD", false);
const DB_NAME = Config.getEnvVarAsString("DB_NAME", false);

Logger.init(LOG_DIR);

const pg = Postgres.getInstance();
pg.init(DB_HOST, DB_PORT, DB_NAME, "public", DB_USER, DB_PASSWORD, false);

const scheduler = Scheduler.getInstance();
scheduler.init();

scheduler.addJob("fetch-shelly-plugs", "* * * * * *", FetchTask.run);
