CREATE TABLE executions
(
    id SERIAL,
    timestamp TIMESTAMP,
    commands SMALLINT,
    result INTEGER,
    duration NUMERIC,
    CONSTRAINT pkey PRIMARY KEY (id)
);

INSERT INTO executions(timestamp, commands, result, duration) VALUES
 (CURRENT_TIMESTAMP, 2, 2, 0.0042);
