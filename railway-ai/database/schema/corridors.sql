CREATE TABLE IF NOT EXISTS corridors (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stations (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    full_label VARCHAR(200) NOT NULL,
    division VARCHAR(100),
    zone VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS corridor_stations (
    id SERIAL PRIMARY KEY,
    corridor_id VARCHAR(30) REFERENCES corridors(id) ON DELETE CASCADE,
    station_code VARCHAR(10) REFERENCES stations(code) ON DELETE CASCADE,
    station_label VARCHAR(200) NOT NULL,
    sequence_order INT NOT NULL,
    UNIQUE (corridor_id, sequence_order)
);
