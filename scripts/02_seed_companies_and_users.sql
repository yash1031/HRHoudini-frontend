-- Insert demo companies based on user stories
INSERT INTO companies (name, industry, size, demo_data_set, logo_url, primary_color) VALUES
('HealthServ Solutions', 'Healthcare Services', 120, 'healthcare_services', '/logos/healthserv.png', '#2FCA75'),
('TechFlow Inc', 'Technology', 300, 'tech_company', '/logos/techflow.png', '#3496D8'),
('CustomerFirst Corp', 'Customer Success', 85, 'customer_success', '/logos/customerfirst.png', '#E64D3C'),
('StartupXYZ', 'Technology', 50, 'early_stage', '/logos/startupxyz.png', '#F2C213');

-- Insert demo users/personas based on user stories

-- Maya Jackson - HR Generalist at HealthServ Solutions (120 employees)
INSERT INTO users (company_id, role, persona_name, email, demo_credentials, avatar_url) VALUES
(1, 'HR Generalist', 'Maya Jackson', 'maya.jackson@healthserv.com', 
 '{"password": "demo123", "login_hint": "Time-strapped People Pro managing recruiting, onboarding, payroll, and compliance", "company_size": "120-person healthcare services organization", "top_concerns": ["Burnout", "lack of insight", "difficulty identifying patterns in attrition or DEI trends"]}', 
 '/avatars/maya-jackson.jpg'),

-- Supporting personas for HealthServ Solutions
(1, 'CHRO', 'Dr. Patricia Williams', 'patricia.williams@healthserv.com',
 '{"password": "demo123", "login_hint": "Chief HR Officer focused on healthcare compliance and retention"}',
 '/avatars/patricia-williams.jpg'),

-- Sasha Kim - Senior Recruiter at TechFlow Inc (300 employees)  
INSERT INTO users (company_id, role, persona_name, email, demo_credentials, avatar_url) VALUES
(2, 'Senior Recruiter', 'Sasha Kim', 'sasha.kim@techflow.com',
 '{"password": "demo123", "login_hint": "Strategic Talent Partner focused on open requisition volume, candidate quality, and hiring manager bottlenecks", "company_size": "300-person tech company", "top_concerns": ["Open requisition volume", "candidate quality", "hiring manager bottlenecks", "improving time-to-fill"]}',
 '/avatars/sasha-kim.jpg'),

-- Supporting personas for TechFlow Inc
(2, 'VP of Talent', 'Marcus Chen', 'marcus.chen@techflow.com',
 '{"password": "demo123", "login_hint": "VP of Talent overseeing recruiting operations"}',
 '/avatars/marcus-chen.jpg'),
(2, 'Engineering Manager', 'Sarah Rodriguez', 'sarah.rodriguez@techflow.com',
 '{"password": "demo123", "login_hint": "Hiring Manager for Engineering roles"}',
 '/avatars/sarah-rodriguez.jpg'),

-- James Patel - Customer Success Manager at CustomerFirst Corp (85 employees, 9 direct reports)
INSERT INTO users (company_id, role, persona_name, email, demo_credentials, avatar_url) VALUES
(3, 'Team Lead', 'James Patel', 'james.patel@customerfirst.com',
 '{"password": "demo123", "login_hint": "People-First Team Lead balancing client escalations, KPIs, and people issues", "team_size": "9 direct reports", "company_size": "85 employees", "top_concerns": ["Morale", "performance drops", "sudden resignations", "slow backfill process"]}',
 '/avatars/james-patel.jpg'),

-- Supporting personas for CustomerFirst Corp
(3, 'CHRO', 'Lisa Thompson', 'lisa.thompson@customerfirst.com',
 '{"password": "demo123", "login_hint": "CHRO focused on employee experience and retention"}',
 '/avatars/lisa-thompson.jpg'),
(3, 'HR Manager', 'David Kim', 'david.kim@customerfirst.com',
 '{"password": "demo123", "login_hint": "HR Manager supporting team leads with people analytics"}',
 '/avatars/david-kim.jpg'),

-- StartupXYZ - Early stage startup
INSERT INTO users (company_id, role, persona_name, email, demo_credentials, avatar_url) VALUES
(4, 'Founding CHRO', 'Alex Rivera', 'alex.rivera@startupxyz.com',
 '{"password": "demo123", "login_hint": "Founding CHRO building HR from scratch in early-stage startup"}',
 '/avatars/alex-rivera.jpg'),
(4, 'CEO', 'Jordan Martinez', 'jordan.martinez@startupxyz.com',
 '{"password": "demo123", "login_hint": "CEO focused on scaling team and culture"}',
 '/avatars/jordan-martinez.jpg');
