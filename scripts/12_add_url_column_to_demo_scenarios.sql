-- Add URL column to demo_scenarios table
ALTER TABLE demo_scenarios 
ADD COLUMN url TEXT;

-- Update existing scenarios with their URLs
UPDATE demo_scenarios 
SET url = '/onboarding?name=Maya+Jackson&email=maya.jackson@healthserv.com&company=HealthServ+Solutions&role=hr-generalist&onboarding=true'
WHERE name = 'Maya''s Leadership Prep Workflow';

UPDATE demo_scenarios 
SET url = '/onboarding?name=Sasha+Kim&email=sasha.kim@techflow.com&company=TechFlow+Inc&role=talent-acquisition&onboarding=true'
WHERE name = 'Sasha''s Daily Recruiting Dashboard';

UPDATE demo_scenarios 
SET url = '/onboarding?name=James+Patel&email=james.patel@customerfirst.com&company=CustomerFirst+Corp&role=team-lead&onboarding=true'
WHERE name = 'James'' Team Risk Alert Response';
