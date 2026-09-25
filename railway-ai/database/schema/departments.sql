CREATE TABLE IF NOT EXISTS departments (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    system_code VARCHAR(20) NOT NULL,
    system_name VARCHAR(100) NOT NULL,
    description TEXT,
    route VARCHAR(100) NOT NULL
);
