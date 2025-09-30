-- Reseed demo scenarios with correct schema
-- This script ensures all 6 scenarios are properly inserted with the correct column names

-- First, clear existing scenarios to avoid duplicates
DELETE FROM demo_scenarios;

-- Reset the sequence
ALTER SEQUENCE demo_scenarios_id_seq RESTART WITH 1;

-- Insert all 6 demo scenarios with proper schema
INSERT INTO demo_scenarios (
    name, 
    description, 
    company_id, 
    target_personas, 
    estimated_duration, 
    difficulty_level, 
    category, 
    is_active,
    steps,
    core_needs,
    user_journey
) VALUES
(
    'Maya''s Leadership Prep Workflow',
    'Maya uploads HRIS data and prepares insights for next week''s leadership meeting',
    1, -- HealthServ Solutions
    '["HR Generalist", "CHRO"]'::jsonb,
    18,
    'beginner',
    'leadership_prep',
    true,
    '[
        {"step": 1, "title": "Data Upload & Validation", "description": "Upload HRIS-exported spreadsheet and validate fields", "duration": 3},
        {"step": 2, "title": "Instant Dashboard Feedback", "description": "Review automatically generated panels and insights", "duration": 4},
        {"step": 3, "title": "AI-Powered Risk Analysis", "description": "Ask Who is most at risk of leaving in Q3?", "duration": 5},
        {"step": 4, "title": "DEI & Turnover Analysis", "description": "Generate DEI breakdown and first-year turnover analysis", "duration": 4},
        {"step": 5, "title": "Export for Leadership", "description": "Export insights as PDF for leadership deck", "duration": 2}
    ]'::jsonb,
    '["Strategic HR insights", "Leadership preparation", "Data-driven decisions"]'::jsonb,
    '["Upload data", "Review insights", "Generate reports", "Present to leadership"]'::jsonb
),
(
    'Sasha''s Daily Recruiting Dashboard',
    'Morning routine for strategic talent partner reviewing requisitions and pipeline health',
    2, -- TechFlow Inc
    '["Senior Recruiter", "VP of Talent"]'::jsonb,
    18,
    'beginner',
    'daily_recruiting',
    true,
    '[
        {"step": 1, "title": "Daily Overview Alert", "description": "Review overnight alerts and requisition status", "duration": 2},
        {"step": 2, "title": "Pipeline Health Check", "description": "Review avg days open, interview-to-offer ratio, top sources", "duration": 4},
        {"step": 3, "title": "Requisition Deep Dive", "description": "Investigate specific aging requisitions", "duration": 5},
        {"step": 4, "title": "Performance Analysis", "description": "Compare recruiter performance and identify bottlenecks", "duration": 4},
        {"step": 5, "title": "Stakeholder Communication", "description": "Export chart for Monday''s talent ops sync", "duration": 3}
    ]'::jsonb,
    '["Pipeline visibility", "Performance tracking", "Stakeholder communication"]'::jsonb,
    '["Check alerts", "Review pipeline", "Analyze performance", "Export reports"]'::jsonb
),
(
    'James'' Team Risk Alert Response',
    'Frontline manager responds to attrition risk alert for team members',
    3, -- CustomerFirst Corp
    '["Team Lead", "HR Manager", "CHRO"]'::jsonb,
    14,
    'intermediate',
    'team_management',
    true,
    '[
        {"step": 1, "title": "Risk Alert Recognition", "description": "Receive and review attrition risk alert", "duration": 1},
        {"step": 2, "title": "Individual Risk Analysis", "description": "Investigate why specific team member is flagged", "duration": 4},
        {"step": 3, "title": "Team Pulse Review", "description": "Review overall team health metrics", "duration": 4},
        {"step": 4, "title": "Action Planning", "description": "Determine next steps and interventions", "duration": 3},
        {"step": 5, "title": "Follow-up Tracking", "description": "Set reminders and track intervention progress", "duration": 2}
    ]'::jsonb,
    '["Early warning systems", "Team health monitoring", "Proactive management"]'::jsonb,
    '["Receive alert", "Investigate risks", "Plan actions", "Track progress"]'::jsonb
),
(
    'Quarterly Business Review - Executive Prep',
    'Comprehensive preparation for C-level HR presentation using AI insights',
    1, -- HealthServ Solutions
    '["CHRO", "VP of Talent"]'::jsonb,
    23,
    'advanced',
    'executive_reporting',
    true,
    '[
        {"step": 1, "title": "Strategic Metric Selection", "description": "Choose executive-level KPIs and trends", "duration": 4},
        {"step": 2, "title": "Cross-Department Analysis", "description": "Analyze patterns across all departments", "duration": 6},
        {"step": 3, "title": "Predictive Insights", "description": "Use AI to forecast upcoming challenges", "duration": 5},
        {"step": 4, "title": "Narrative Building", "description": "Create compelling story from data insights", "duration": 5},
        {"step": 5, "title": "Executive Presentation Export", "description": "Generate executive-ready charts and summaries", "duration": 3}
    ]'::jsonb,
    '["Executive reporting", "Strategic insights", "Business impact"]'::jsonb,
    '["Select metrics", "Analyze trends", "Build narrative", "Export presentation"]'::jsonb
),
(
    'Crisis Response - Sudden Turnover Spike',
    'Investigate and respond to unexpected increase in departures',
    2, -- TechFlow Inc
    '["CHRO", "HR Generalist", "Team Lead"]'::jsonb,
    22,
    'advanced',
    'crisis_management',
    true,
    '[
        {"step": 1, "title": "Crisis Detection", "description": "Identify unusual turnover patterns in dashboard", "duration": 2},
        {"step": 2, "title": "Root Cause Investigation", "description": "Use AI to analyze potential causes", "duration": 6},
        {"step": 3, "title": "Department Impact Analysis", "description": "Assess which teams are most affected", "duration": 4},
        {"step": 4, "title": "Stakeholder Communication", "description": "Prepare urgent briefing for leadership", "duration": 4},
        {"step": 5, "title": "Retention Strategy Development", "description": "Develop immediate and long-term action plan", "duration": 6}
    ]'::jsonb,
    '["Crisis management", "Root cause analysis", "Retention strategy"]'::jsonb,
    '["Detect crisis", "Investigate causes", "Assess impact", "Develop strategy"]'::jsonb
),
(
    'New User Onboarding - First Time Setup',
    'Guide new users through initial platform setup and first insights',
    4, -- StartupXYZ
    '["HR Generalist", "Senior Recruiter", "Team Lead", "CHRO", "Founding CHRO"]'::jsonb,
    17,
    'beginner',
    'onboarding',
    true,
    '[
        {"step": 1, "title": "Role & Company Setup", "description": "Select role and configure company profile", "duration": 3},
        {"step": 2, "title": "Data Upload Guidance", "description": "Upload first HR dataset with template guidance", "duration": 4},
        {"step": 3, "title": "Dashboard Personalization", "description": "Configure dashboard based on role and priorities", "duration": 3},
        {"step": 4, "title": "First AI Interaction", "description": "Try first natural language query", "duration": 4},
        {"step": 5, "title": "Next Steps Planning", "description": "Set up regular workflows and alerts", "duration": 3}
    ]'::jsonb,
    '["Platform setup", "Role customization", "First insights"]'::jsonb,
    '["Setup profile", "Upload data", "Customize dashboard", "Try AI features"]'::jsonb
);

-- Verify the scenarios were inserted
SELECT 
    id,
    name,
    target_personas,
    estimated_duration,
    difficulty_level,
    category,
    is_active
FROM demo_scenarios 
ORDER BY id;
