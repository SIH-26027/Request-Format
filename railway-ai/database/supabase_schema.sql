-- ==============================================================================
-- INDIAN RAILWAYS - AUTOMATIC BLOCK PLANNING SYSTEM (ABPS)
-- SUPABASE DATABASE SETUP SCRIPT
-- Target Project: https://nbtwgbmqjjhvlryvatdn.supabase.co
--
-- Instructions:
-- 1. Open your Supabase Project: https://supabase.com/dashboard/project/nbtwgbmqjjhvlryvatdn
-- 2. Go to the "SQL Editor" tab on the left sidebar
-- 3. Click "New query"
-- 4. Paste this entire script and click "Run"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLEANUP PREVIOUS TABLES IF NEEDED
DROP TABLE IF EXISTS corridor_stations CASCADE;
DROP TABLE IF EXISTS block_requests CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS corridors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ==============================================================================
-- 3. SCHEMA DEFINITIONS
-- ==============================================================================

-- DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    system_code VARCHAR(20) NOT NULL,
    system_name VARCHAR(100) NOT NULL,
    description TEXT,
    route VARCHAR(100) NOT NULL
);

-- CORRIDORS TABLE
CREATE TABLE IF NOT EXISTS corridors (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    full_label VARCHAR(200) NOT NULL,
    division VARCHAR(100),
    zone VARCHAR(100)
);

-- CORRIDOR STATIONS MAPPING
CREATE TABLE IF NOT EXISTS corridor_stations (
    id SERIAL PRIMARY KEY,
    corridor_id VARCHAR(30) REFERENCES corridors(id) ON DELETE CASCADE,
    station_code VARCHAR(10) REFERENCES stations(code) ON DELETE CASCADE,
    station_label VARCHAR(200) NOT NULL,
    sequence_order INT NOT NULL,
    UNIQUE (corridor_id, sequence_order)
);

-- BLOCK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS block_requests (
    id VARCHAR(50) PRIMARY KEY,
    department VARCHAR(20) REFERENCES departments(code),
    department_name VARCHAR(100),
    system_name VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    urgency VARCHAR(30) NOT NULL,
    corridor VARCHAR(255) NOT NULL,
    block_section VARCHAR(255) NOT NULL,
    from_location VARCHAR(150) NOT NULL,
    to_location VARCHAR(150) NOT NULL,
    line VARCHAR(20) NOT NULL,
    chainage VARCHAR(100),
    asset_type VARCHAR(100),
    asset_id VARCHAR(100),
    asset_condition VARCHAR(50),
    defect_reason TEXT,
    maintenance_type VARCHAR(200),
    description TEXT,
    requested_date DATE NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_start_time TIME NOT NULL,
    preferred_end_time TIME NOT NULL,
    duration_formatted VARCHAR(50),
    duration_minutes_total INT NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    operational_requirements JSONB DEFAULT '[]'::jsonb,
    equipment_required JSONB DEFAULT '[]'::jsonb,
    team_size INT DEFAULT 1,
    safety_requirements JSONB DEFAULT '[]'::jsonb,
    remarks TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_requests_dept ON block_requests(department);
CREATE INDEX IF NOT EXISTS idx_requests_status ON block_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_date ON block_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_requests_created ON block_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON block_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_dept_status ON block_requests(department, status);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Ensures public anon key and authenticated users can read, write, update, delete
-- ==============================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE corridors ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE corridor_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_requests ENABLE ROW LEVEL SECURITY;

-- Block Requests Policies
CREATE POLICY "Public Read Access block_requests"
    ON block_requests FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public Insert Access block_requests"
    ON block_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Public Update Access block_requests"
    ON block_requests FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public Delete Access block_requests"
    ON block_requests FOR DELETE
    TO anon, authenticated
    USING (true);

-- Reference Tables Read Policies
CREATE POLICY "Public Read Access departments"
    ON departments FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Access corridors"
    ON corridors FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Access stations"
    ON stations FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Access corridor_stations"
    ON corridor_stations FOR SELECT TO anon, authenticated USING (true);

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- DEPARTMENTS SEED
INSERT INTO departments (code, name, short_name, system_code, system_name, description, route) VALUES
('ENGINEERING', 'Civil Engineering', 'ENG', 'TMS', 'Track Management System', 'Permanent Way, Bridges, Track machines, Formation and Level Crossings', '/request/engineering'),
('TRD', 'Traction Distribution', 'TRD', 'TDMS', 'Traction Distribution Management System', 'Overhead Equipment (OHE), PSI (Power Supply Installation), SCADA and Transmission lines', '/request/trd'),
('SNT', 'Signal & Telecommunication', 'S&T', 'SMMS', 'Signal Maintenance Management System', 'Electronic Interlocking, Signals, Points, Track Circuits, Axle Counters and Telecom networks', '/request/snt')
ON CONFLICT (code) DO NOTHING;

-- SAMPLE CORRIDOR
INSERT INTO corridors (id, name, division, zone) VALUES
('ED-MS-01', 'Erode Jn - Chennai Egmore (ED-MS) via Salem, Attur & Vriddhachalam', 'Salem', 'Southern Railway')
ON CONFLICT (id) DO NOTHING;

-- SAMPLE STATIONS
INSERT INTO stations (code, name, full_label, division, zone) VALUES
('ED', 'Erode Jn', 'Erode Jn (ED)', 'Salem', 'Southern Railway'),
('CV', 'Cauvery', 'Cauvery (CV)', 'Salem', 'Southern Railway')
ON CONFLICT (code) DO NOTHING;

INSERT INTO corridor_stations (corridor_id, station_code, station_label, sequence_order) VALUES
('ED-MS-01', 'ED', 'Erode Jn (ED)', 1),
('ED-MS-01', 'CV', 'Cauvery (CV)', 2)
ON CONFLICT DO NOTHING;

-- SAMPLE BLOCK REQUEST
INSERT INTO block_requests (
    id, department, department_name, system_name, status, priority, urgency,
    corridor, block_section, from_location, to_location, line, chainage,
    asset_type, asset_id, asset_condition, defect_reason, maintenance_type,
    description, requested_date, preferred_date, preferred_start_time, preferred_end_time,
    duration_formatted, duration_minutes_total, requested_by, designation, contact_number,
    operational_requirements, equipment_required, team_size, safety_requirements, remarks, timeline
) VALUES (
    'REQ-ENG-20260915-1777',
    'ENGINEERING',
    'Engineering',
    'TMS',
    'SUBMITTED',
    'NORMAL',
    'ROUTINE',
    'Erode Jn - Chennai Egmore (ED-MS) via Salem, Attur & Vriddhachalam',
    'Erode Jn (ED) - Cauvery (CV)',
    'Erode Jn (ED)',
    'Cauvery (CV)',
    'UP',
    'Km 1314/12 to 1316/04',
    'Track',
    'PNT-ALJN-104B',
    'GOOD',
    'Ultrasonic Flaw Detection (USFD) periodic track maintenance defect correction',
    'Rail Grinding (RGM)',
    'Routine rail profile restoration and surface defect removal on UP mainline.',
    '2026-09-15',
    '2026-09-16',
    '01:15',
    '02:14',
    '59 mins',
    59,
    'Sarath',
    'Senior Software Engineer',
    '9498445816',
    '[{"label":"Traffic Block Required","value":true},{"label":"S&T Disconnection Required","value":false},{"label":"Adjacent Line Restriction","value":false},{"label":"Post-Block Speed Restriction (TSR)","value":"None"}]'::jsonb,
    '["Ballast Cleaning Machine (BCM)"]'::jsonb,
    1,
    '["Caution Order to be issued to Loco Pilots (TSR/PSR)"]'::jsonb,
    'Regular maintenance slot',
    '[{"status":"DRAFT","label":"Draft Created","timestamp":"2026-09-15 08:30","officer":"Sarath (Senior Software Engineer)","isCompleted":true,"isCurrent":false},{"status":"SUBMITTED","label":"Submitted to Division Block Cell","timestamp":"2026-09-15 09:15","officer":"Sarath (Senior Software Engineer)","note":"Formally queued for corridor slot simulation and conflict detection.","isCompleted":true,"isCurrent":true},{"status":"UNDER_PLANNING","label":"Corridor Slot Scheduling","isCompleted":false,"isCurrent":false},{"status":"APPROVED","label":"Block Sanctioned by Sr.DOM","isCompleted":false,"isCurrent":false},{"status":"COMPLETED","label":"Block Completion & Safety Clearance","isCompleted":false,"isCurrent":false}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
