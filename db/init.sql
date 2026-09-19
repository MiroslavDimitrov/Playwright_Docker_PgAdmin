CREATE TABLE IF NOT EXISTS funkopoptable (
    name TEXT NOT NULL,
    category TEXT,
    fugurenumber INTEGER
);

CREATE TABLE IF NOT EXISTS playwright_tasks (
    id SERIAL PRIMARY KEY,
    task_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);
