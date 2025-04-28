CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.shelly_plugs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    protected BOOLEAN NOT NULL DEFAULT FALSE,
    is_on BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.shelly_measurements (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    power NUMERIC NOT NULL,
    current NUMERIC NOT NULL,
    voltage NUMERIC NOT NULL,
    temp_c NUMERIC NOT NULL,
    temp_f NUMERIC NOT NULL,
    CONSTRAINT fk_measurements_plug FOREIGN KEY (plug_id) REFERENCES public.shelly_plugs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.shelly_summaries (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    count_measurements INT NOT NULL,
    power_sum NUMERIC NOT NULL,
    power_avg NUMERIC NOT NULL,
    current_avg NUMERIC NOT NULL,
    voltage_avg NUMERIC NOT NULL,
    temp_c_avg NUMERIC NOT NULL,
    temp_f_avg NUMERIC NOT NULL,
    CONSTRAINT fk_summaries_plug FOREIGN KEY (plug_id) REFERENCES public.shelly_plugs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.shelly_reports (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    report_date DATE NOT NULL,
    CONSTRAINT fk_reports_plug FOREIGN KEY (plug_id) REFERENCES public.shelly_plugs(id) ON DELETE CASCADE,
    UNIQUE (plug_id, report_date)
);

CREATE TABLE IF NOT EXISTS public.shelly_report_summaries (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES public.shelly_reports(id) ON DELETE CASCADE,
    summary_id INTEGER NOT NULL REFERENCES public.shelly_summaries(id) ON DELETE CASCADE,
    UNIQUE (report_id, summary_id)
);

CREATE INDEX IF NOT EXISTS idx_measurements_plug_created_at ON public.shelly_measurements (plug_id, created_at);
CREATE INDEX IF NOT EXISTS idx_summaries_plug_start_at ON public.shelly_summaries (plug_id, start_at);
CREATE INDEX IF NOT EXISTS idx_reports_plug ON public.shelly_reports (plug_id);