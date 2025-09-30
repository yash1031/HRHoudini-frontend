-- Insert default demo settings
INSERT INTO demo_settings (setting_key, setting_value, description, setting_type) VALUES
('default_company', 'HealthServ Solutions', 'Default company to select when starting demo mode', 'string'),
('default_persona', 'Maya Jackson', 'Default persona to select when starting demo mode', 'string'),
('session_id_prefix', 'demo_', 'Prefix for demo session IDs', 'string'),
('max_session_duration', '3600', 'Maximum demo session duration in seconds', 'number'),
('enable_audience_mode', 'true', 'Whether audience mode toggle is available', 'boolean'),
('demo_branding', '{"logo_url": "/demo-logo.png", "primary_color": "#3496D8"}', 'Demo mode branding configuration', 'json');

-- Insert demo companies
INSERT INTO demo_companies (name, industry, size, color, description, sort_order) VALUES
('HealthServ Solutions', 'Healthcare Services', 120, '#2FCA75', 'Mid-size healthcare services organization focused on patient care and operational efficiency', 1),
('TechFlow Inc', 'Technology', 300, '#3496D8', 'Growing technology company with focus on software development and innovation', 2),
('CustomerFirst Corp', 'Customer Success', 85, '#E64D3C', 'Customer-centric organization specializing in customer success and support', 3),
('StartupXYZ', 'Technology', 50, '#F2C213', 'Early-stage startup building innovative technology solutions', 4);

-- Insert demo personas
INSERT INTO demo_personas (company_id, name, role, avatar_url, description, login_hint, sort_order) VALUES
-- HealthServ Solutions personas
(1, 'Maya Jackson', 'HR Generalist', '/avatars/maya-jackson.jpg', 'Time-strapped People Pro managing recruiting, onboarding, payroll, and compliance', 'Maya manages multiple HR functions and needs quick insights for leadership meetings', 1),
(1, 'Dr. Patricia Williams', 'CHRO', '/avatars/patricia-williams.jpg', 'Chief HR Officer focused on healthcare compliance and retention', 'Strategic HR leader focused on organizational health and compliance', 2),

-- TechFlow Inc personas  
(2, 'Sasha Kim', 'Senior Recruiter', '/avatars/sasha-kim.jpg', 'Strategic Talent Partner focused on open requisition volume, candidate quality, and hiring manager bottlenecks', 'Sasha manages high-volume recruiting and needs pipeline visibility', 1),
(2, 'Marcus Chen', 'VP of Talent', '/avatars/marcus-chen.jpg', 'VP of Talent overseeing recruiting operations', 'Strategic talent leader focused on scaling the organization', 2),
(2, 'Sarah Rodriguez', 'Engineering Manager', '/avatars/sarah-rodriguez.jpg', 'Hiring Manager for Engineering roles', 'Engineering leader involved in technical hiring decisions', 3),

-- CustomerFirst Corp personas
(3, 'James Patel', 'Team Lead', '/avatars/james-patel.jpg', 'People-First Team Lead balancing client escalations, KPIs, and people issues', 'James manages a team of 9 and needs early warning systems for retention risks', 1),
(3, 'Lisa Thompson', 'CHRO', '/avatars/lisa-thompson.jpg', 'CHRO focused on employee experience and retention', 'Strategic HR leader focused on creating exceptional employee experiences', 2),
(3, 'David Kim', 'HR Manager', '/avatars/david-kim.jpg', 'HR Manager supporting team leads with people analytics', 'Operational HR leader providing data-driven insights to managers', 3),

-- StartupXYZ personas
(4, 'Alex Rivera', 'Founding CHRO', '/avatars/alex-rivera.jpg', 'Founding CHRO building HR from scratch in early-stage startup', 'Alex is building HR processes and culture from the ground up', 1),
(4, 'Jordan Martinez', 'CEO', '/avatars/jordan-martinez.jpg', 'CEO focused on scaling team and culture', 'Startup CEO balancing growth with culture and team development', 2);

-- Update existing demo_scenarios to reference the new structure
UPDATE demo_scenarios SET 
    description = 'Maya uploads HRIS data and prepares insights for next week''s leadership meeting. Demonstrates data upload, instant insights, AI-powered analysis, and executive reporting.',
    category = 'leadership_prep',
    estimated_duration = 18
WHERE name = 'Maya''s Leadership Prep Workflow';

UPDATE demo_scenarios SET 
    description = 'Morning routine for strategic talent partner reviewing requisitions and pipeline health. Shows recruiting dashboard, pipeline analysis, and performance tracking.',
    category = 'daily_recruiting', 
    estimated_duration = 18
WHERE name = 'Sasha''s Daily Recruiting Dashboard';

UPDATE demo_scenarios SET 
    description = 'Frontline manager responds to attrition risk alert for team members. Demonstrates early warning systems and people analytics.',
    category = 'team_management',
    estimated_duration = 14  
WHERE name = 'James'' Team Risk Alert Response';

-- Insert demo scenario steps for Maya's workflow
INSERT INTO demo_scenario_steps (scenario_id, step_number, title, description, duration_minutes, screen_component, talking_points) VALUES
(1, 0, 'Data Upload & Validation', 'Upload HRIS-exported spreadsheet and validate fields', 3, 'data_upload', '["Maya is guided through uploading her most recent headcount and recruiting data", "System detects relevant fields and shows which panels are now available"]'),
(1, 1, 'Instant Dashboard Feedback', 'Review automatically generated panels and insights', 4, 'dashboard_feedback', '["Attrition Snapshot, Census Overview, Recruiting Pipeline Stats unlock immediately", "Receives prompt: Want to compare with your Q1 data?"]'),
(1, 2, 'AI-Powered Risk Analysis', 'Ask Who is most at risk of leaving in Q3?', 5, 'ai_risk_analysis', '["Assistant analyzes tenure, job level, department trends", "Flags 3 employees with specific risk factors"]'),
(1, 3, 'DEI & Turnover Analysis', 'Generate DEI breakdown and first-year turnover analysis', 4, 'dei_analysis', '["Suggested prompts: Generate a DEI breakdown by department", "Summarize first-year turnover by recruiter"]'),
(1, 4, 'Export for Leadership', 'Export insights as PDF for leadership deck', 2, 'export_insights', '["Maya clicks Export Insights to generate simple PDF", "Pastes into leadership deck feeling prepared instead of overwhelmed"]');

-- Insert demo scenario steps for Sasha's workflow  
INSERT INTO demo_scenario_steps (scenario_id, step_number, title, description, duration_minutes, screen_component, talking_points) VALUES
(2, 0, 'Daily Overview Alert', 'Review overnight alerts and requisition status', 2, 'recruiting_overview', '["Sees: You have 12 open requisitions. 3 have been open for over 30 days", "Clicks into Recruiting Dashboard"]'),
(2, 1, 'Pipeline Health Check', 'Review avg days open, interview-to-offer ratio, top sources', 4, 'pipeline_health', '["Dashboard shows: Avg. days open, interview-to-offer ratio, top sources", "Identifies concerning trends in pipeline"]'),
(2, 2, 'Requisition Deep Dive', 'Investigate specific aging requisitions', 5, 'requisition_detail', '["Types: What''s the status of my Engineering Manager req?", "Assistant: Open 34 days. Last candidate interview: 6 days ago. Hiring manager last responded: 8 days ago"]'),
(2, 3, 'Performance Analysis', 'Compare recruiter performance and identify bottlenecks', 4, 'recruiter_performance', '["Prompt suggestion: What roles have the longest fill times?", "Compare recruiter performance over Q1 and Q2"]'),
(2, 4, 'Stakeholder Communication', 'Export chart for Monday''s talent ops sync', 3, 'export_recruiting', '["Exports metrics she didn''t have to manually build", "Reinforces Sasha''s value as strategic business partner"]');

-- Insert demo scenario steps for James' workflow
INSERT INTO demo_scenario_steps (scenario_id, step_number, title, description, duration_minutes, screen_component, talking_points) VALUES  
(3, 0, 'Risk Alert Recognition', 'Receive and review attrition risk alert', 1, 'risk_alert', '["James gets email and in-app alert: 2 employees in your team show elevated attrition risk", "Clicks to view panel with risk drivers"]'),
(3, 1, 'Individual Risk Analysis', 'Investigate why specific team member is flagged', 4, 'individual_risk', '["Types: Why is Marcus flagged as high risk?", "Assistant replies: Tenure: 2.5 years. Change in manager 3 months ago. 6 missed 1:1s. Recent engagement score: 3/10"]'),
(3, 2, 'Team Pulse Review', 'Review overall team health metrics', 4, 'team_pulse', '["Clicks into Team Pulse Panel", "Reviews: tenure, last raise, utilization, feedback trends, notes from prior alerts"]'),
(3, 3, 'Action Planning', 'Determine next steps and interventions', 3, 'action_planning', '["Assistant suggests actions: Send engagement pulse survey?", "James plans 1:1s and check-ins based on data"]'),
(3, 4, 'Follow-up Tracking', 'Set reminders and track intervention progress', 2, 'follow_up', '["System helps James coach better without becoming data expert", "Empowers thoughtful leadership, not reactive behavior"]');

-- Insert demo screen components
INSERT INTO demo_screen_components (component_key, component_name, description, props_schema) VALUES
('data_upload', 'Data Upload Screen', 'File upload interface with validation and guidance', '{"company": "string", "persona": "string", "supportedFormats": "array"}'),
('dashboard_feedback', 'Dashboard Feedback Screen', 'Shows generated dashboard with key metrics', '{"company": "string", "persona": "string", "metrics": "array"}'),
('ai_risk_analysis', 'AI Risk Analysis Screen', 'Interactive AI chat for risk analysis', '{"company": "string", "persona": "string", "riskFactors": "array"}'),
('dei_analysis', 'DEI Analysis Screen', 'Diversity, equity, and inclusion breakdown', '{"company": "string", "persona": "string", "deiMetrics": "object"}'),
('export_insights', 'Export Insights Screen', 'PDF generation and export interface', '{"company": "string", "persona": "string", "insights": "array"}'),
('recruiting_overview', 'Recruiting Overview Screen', 'Daily recruiting dashboard overview', '{"company": "string", "persona": "string", "requisitions": "array"}'),
('pipeline_health', 'Pipeline Health Screen', 'Recruiting pipeline health metrics', '{"company": "string", "persona": "string", "pipelineData": "object"}'),
('requisition_detail', 'Requisition Detail Screen', 'Detailed view of specific requisitions', '{"company": "string", "persona": "string", "requisitionId": "string"}'),
('recruiter_performance', 'Recruiter Performance Screen', 'Performance comparison and analytics', '{"company": "string", "persona": "string", "performanceData": "object"}'),
('export_recruiting', 'Export Recruiting Screen', 'Export recruiting metrics and reports', '{"company": "string", "persona": "string", "reportType": "string"}'),
('risk_alert', 'Risk Alert Screen', 'Attrition risk alert interface', '{"company": "string", "persona": "string", "alerts": "array"}'),
('individual_risk', 'Individual Risk Screen', 'Individual employee risk analysis', '{"company": "string", "persona": "string", "employeeId": "string"}'),
('team_pulse', 'Team Pulse Screen', 'Team health and engagement metrics', '{"company": "string", "persona": "string", "teamData": "object"}'),
('action_planning', 'Action Planning Screen', 'Intervention planning interface', '{"company": "string", "persona": "string", "recommendations": "array"}'),
('follow_up', 'Follow-up Tracking Screen', 'Progress tracking and reminders', '{"company": "string", "persona": "string", "actions": "array"}'),
('default', 'Default Screen', 'Fallback screen for undefined components', '{"scenarioId": "number", "step": "number", "company": "string", "persona": "string"}');
