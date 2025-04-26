import nodeSchedule, {
    Job,
    RecurrenceRule,
    RecurrenceSpecDateRange,
    RecurrenceSpecObjLit,
} from "node-schedule";
import Logger from "src/components/Logger";

export default class Scheduler {
    private static instance: Scheduler;
    private jobs: Map<string, Job> = new Map<string, Job>();

    constructor() {}

    public static getInstance(): Scheduler {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }

        return Scheduler.instance;
    }

    public init(): void {
        try {
            this.jobs = new Map<string, Job>();

            Logger.info(`Scheduler initialized`);
        } catch (err) {
            Logger.error(`Error initializing Scheduler: ${err}`);
        }
    }

    public addJob(
        name: string,
        rule:
            | RecurrenceRule
            | RecurrenceSpecDateRange
            | RecurrenceSpecObjLit
            | string
            | Date,
        callback: () => void
    ): Job | null {
        if (this.jobs.has(name)) {
            Logger.error(`Job with name ${name} already exists`);
            return null;
        }

        const job = nodeSchedule.scheduleJob(rule, callback);
        this.jobs.set(name, job);
        return job;
    }

    public getJob(name: string): Job | undefined {
        return this.jobs.get(name);
    }

    public deleteJob(name: string): boolean {
        const job = this.jobs.get(name);

        if (!job) {
            Logger.error(`Job with name ${name} does not exist`);
            return false;
        }

        job.cancel();
        this.jobs.delete(name);
        return true;
    }

    public listJobs(): string[] {
        return Array.from(this.jobs.keys());
    }

    public rescheduleJob(
        name: string,
        rule:
            | RecurrenceRule
            | RecurrenceSpecDateRange
            | RecurrenceSpecObjLit
            | string
            | Date
    ): Job | null {
        const job = this.jobs.get(name);

        if (!job) {
            Logger.error(`Job with name ${name} does not exist`);
            return null;
        }

        const newJob = nodeSchedule.rescheduleJob(job, rule);
        this.jobs.set(name, newJob);
        return newJob;
    }
}
