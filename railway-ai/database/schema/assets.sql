-- ==============================================================================
-- INDIAN RAILWAYS - AUTOMATIC BLOCK PLANNING SYSTEM (ABPS)
-- Railway Infrastructure Assets Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS railway_assets (
    id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(20) NOT NULL, -- ENGINEERING, TRD, SNT
    asset_type VARCHAR(100) NOT NULL,
    corridor_id VARCHAR(30),
    block_section VARCHAR(255),
    line VARCHAR(20),
    chainage_km_start NUMERIC(8,3),
    chainage_km_end NUMERIC(8,3),
    condition VARCHAR(50) DEFAULT 'GOOD', -- GOOD, FAIR, CRITICAL, SEVERE_WEAR
    status VARCHAR(30) DEFAULT 'ACTIVE',
    last_inspected_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_dept ON railway_assets(department);
CREATE INDEX IF NOT EXISTS idx_assets_type ON railway_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON railway_assets(condition);
