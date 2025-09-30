-- Add any columns that may be missing on existing databases.
-- Each ADD COLUMN IF NOT EXISTS is safe to run multiple times.

ALTER TABLE demo_scenarios
  ADD COLUMN IF NOT EXISTS steps        JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS core_needs   JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS user_journey JSONB DEFAULT '[]'::jsonb;
