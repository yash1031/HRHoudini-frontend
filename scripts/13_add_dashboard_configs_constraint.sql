-- Add unique constraint to prevent duplicate configs per user/scenario/company
ALTER TABLE dashboard_configs 
ADD CONSTRAINT unique_dashboard_config 
UNIQUE (scenario_type, user_id, company);
