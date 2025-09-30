-- Migration: Add value_delivered column to demo_scenarios table
-- Purpose: Support the Value Delivered section in the scenario builder
-- Date: 2025-01-12

-- Add the value_delivered column as JSONB with default empty array
ALTER TABLE demo_scenarios 
ADD COLUMN value_delivered JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN demo_scenarios.value_delivered IS 'Array of value delivered objects with category and description fields';

-- Verify the column was added successfully
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'demo_scenarios' AND column_name = 'value_delivered';
