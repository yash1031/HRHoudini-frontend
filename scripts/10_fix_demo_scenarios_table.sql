-- Fix demo_scenarios table schema to match API expectations
-- This script ensures all required columns exist with proper data types

-- First, let's check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS demo_scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INTEGER,
    target_personas JSONB DEFAULT '[]'::jsonb,
    estimated_duration INTEGER,
    difficulty_level VARCHAR(50),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    steps JSONB DEFAULT '[]'::jsonb,
    core_needs JSONB DEFAULT '[]'::jsonb,
    user_journey JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add steps column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'steps') THEN
        ALTER TABLE demo_scenarios ADD COLUMN steps JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add core_needs column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'core_needs') THEN
        ALTER TABLE demo_scenarios ADD COLUMN core_needs JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add user_journey column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'user_journey') THEN
        ALTER TABLE demo_scenarios ADD COLUMN user_journey JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add target_personas column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'target_personas') THEN
        ALTER TABLE demo_scenarios ADD COLUMN target_personas JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add estimated_duration column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'estimated_duration') THEN
        ALTER TABLE demo_scenarios ADD COLUMN estimated_duration INTEGER;
    END IF;

    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'difficulty_level') THEN
        ALTER TABLE demo_scenarios ADD COLUMN difficulty_level VARCHAR(50);
    END IF;

    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'category') THEN
        ALTER TABLE demo_scenarios ADD COLUMN category VARCHAR(100);
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'is_active') THEN
        ALTER TABLE demo_scenarios ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'company_id') THEN
        ALTER TABLE demo_scenarios ADD COLUMN company_id INTEGER;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'created_at') THEN
        ALTER TABLE demo_scenarios ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demo_scenarios' AND column_name = 'updated_at') THEN
        ALTER TABLE demo_scenarios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Update any existing NULL values to proper defaults
UPDATE demo_scenarios 
SET 
    steps = COALESCE(steps, '[]'::jsonb),
    core_needs = COALESCE(core_needs, '[]'::jsonb),
    user_journey = COALESCE(user_journey, '[]'::jsonb),
    target_personas = COALESCE(target_personas, '[]'::jsonb),
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_company_id ON demo_scenarios(company_id);
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_is_active ON demo_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_created_at ON demo_scenarios(created_at);

-- Add foreign key constraint if demo_companies table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demo_companies') THEN
        -- Drop existing constraint if it exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_demo_scenarios_company_id') THEN
            ALTER TABLE demo_scenarios DROP CONSTRAINT fk_demo_scenarios_company_id;
        END IF;
        
        -- Add the foreign key constraint
        ALTER TABLE demo_scenarios 
        ADD CONSTRAINT fk_demo_scenarios_company_id 
        FOREIGN KEY (company_id) REFERENCES demo_companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_demo_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_demo_scenarios_updated_at ON demo_scenarios;
CREATE TRIGGER trigger_update_demo_scenarios_updated_at
    BEFORE UPDATE ON demo_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_demo_scenarios_updated_at();

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'demo_scenarios' 
ORDER BY ordinal_position;
